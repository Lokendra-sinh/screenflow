import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync, chmodSync, accessSync, constants } from "fs";
import * as schema from "./schema";

// Singleton for the database connection
let db: ReturnType<typeof setupDb> | null = null;

function setupDb() {
  try {
    // Ensure data directory exists with proper permissions
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true, mode: 0o755 }); // Set explicit permissions
    }

    // Check if the directory is writable
    try {
      accessSync(dataDir, constants.W_OK);
    } catch (error) {
      console.error(
        `Data directory is not writable: ${dataDir} with error: ${error}`
      );
      // Try to fix permissions
      chmodSync(dataDir, 0o755);
    }

    const dbPath = join(dataDir, "screenpipe-jobs.db");

    // Create the database with explicit open options
    const sqlite = new Database(dbPath, {
      verbose: process.env.NODE_ENV !== "production" ? console.log : undefined,
      fileMustExist: false,
    });

    // Set WAL mode for better concurrency
    sqlite.pragma("journal_mode = WAL");

    // Create tables if they don't exist, but don't recreate them if they do
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS raw_data (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        data TEXT NOT NULL,
        captured_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
      
      CREATE TABLE IF NOT EXISTS processed_data (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        data TEXT NOT NULL,
        processed_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
      
      CREATE TABLE IF NOT EXISTS daily_pulse (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        error TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
      
      CREATE TABLE IF NOT EXISTS content_chunks (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        raw_data_id TEXT NOT NULL,
        content TEXT NOT NULL,
        source_url TEXT,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id),
        FOREIGN KEY (raw_data_id) REFERENCES raw_data(id)
      );
      
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        chunk_id TEXT NOT NULL,
        embedding BLOB NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (chunk_id) REFERENCES content_chunks(id)
      );
    `);

    return drizzle(sqlite, { schema });
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    console.log("Initializing database connection...");
    db = setupDb();
    console.log("Database connection established");
  }
  return db;
}
