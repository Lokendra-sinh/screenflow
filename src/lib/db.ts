import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as schema from './schema';

// Singleton pattern with promise
let dbPromise: Promise<any> | null = null;
let sqlClient: postgres.Sql<Record<string, unknown>> | null = null;

export function getDb() {
  if (!dbPromise) {
    console.log('Initializing database connection...');
    
    dbPromise = (async () => {
      try {
        // Ensure data directory exists for migrations
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
        }
        
        // Create the database connection
        const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/screenpipe_jobs';
        
        console.log('Connecting to PostgreSQL...');
        sqlClient = postgres(connectionString, {
          max: 10, 
        });
        
        const db = drizzle(sqlClient, { schema });
        
        // // Run migrations if they exist
        const migrationsFolder = join(process.cwd(), 'drizzle');
        if (existsSync(migrationsFolder)) {
          console.log('Running migrations...');
          await migrate(db, { migrationsFolder });
          console.log('Migrations completed');
        }
        
        console.log('Database connection established');
        return db;
      } catch (error) {
        console.error('Database initialization error:', error);
        // Clear the promise so we can retry initialization
        dbPromise = null;
        throw error;
      }
    })();
  }
  
  return dbPromise;
}

// Function to close the database connection
export async function closeDb() {
  if (sqlClient) {
    await sqlClient.end();
    sqlClient = null;
  }
  
  dbPromise = null;
  console.log('Database connection closed');
}

// Handle application shutdown gracefully
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await closeDb();
  process.exit(0);
});