import { executeRawSql } from './raw-sql-client';


export async function getDb() {
  return {

    select: (columns = "*") => ({
      from: (table: string) => ({
        where: (condition: string) => ({
          then: async (callback: (rows: any[]) => any) => {
            const result = await executeRawSql(`SELECT ${columns} FROM ${table} WHERE ${condition}`);
            return callback(result);
          },
          get: async () => {
            const result = await executeRawSql(`SELECT ${columns} FROM ${table} WHERE ${condition}`);
            return result[0];
          }
        }),
        orderBy: (orderClause: string) => ({
          then: async (callback: (rows: any[]) => any) => {
            const result = await executeRawSql(`SELECT ${columns} FROM ${table} ORDER BY ${orderClause}`);
            return callback(result);
          }
        }),
        get: async () => {
          const result = await executeRawSql(`SELECT ${columns} FROM ${table}`);
          return result;
        }
      })
    }),

    // INSERT operations
    insert: (table: string) => ({
      values: async (data: any) => {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(data);
        
        return executeRawSql(
          `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
          values
        );
      },
      returning: (returning: any) => ({
        values: async (data: any) => {
          const columns = Object.keys(data).join(', ');
          const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(data);
          const returningClause = Object.keys(returning).join(', ');
          
          return executeRawSql(
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returningClause}`,
            values
          );
        }
      })
    }),

    // UPDATE operations
    update: (table: string) => ({
      set: (data: any) => ({
        where: async (condition: string) => {
          const setClause = Object.entries(data)
            .map(([key], i) => `${key} = $${i + 1}`)
            .join(', ');
          const values = Object.values(data);
          
          return executeRawSql(
            `UPDATE ${table} SET ${setClause} WHERE ${condition} RETURNING *`,
            values
          );
        }
      })
    }),

    // DELETE operations
    delete: (table: string) => ({
      where: async (condition: string) => {
        return executeRawSql(`DELETE FROM ${table} WHERE ${condition} RETURNING *`);
      }
    }),

    // TRANSACTION operations
    transaction: async (callback: (tx: any) => Promise<any>) => {
      await executeRawSql("BEGIN");
      
      const tx = {
        insert: (table: string) => ({
          values: async (data: any) => {
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
            const values = Object.values(data);
            
            return executeRawSql(
              `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
              values
            );
          },
          returning: (returning: any) => ({
            values: async (data: any) => {
              const columns = Object.keys(data).join(', ');
              const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
              const values = Object.values(data);
              const returningClause = Object.keys(returning).join(', ');
              
              return executeRawSql(
                `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returningClause}`,
                values
              );
            }
          })
        }),
        update: (table: string) => ({
          set: (data: any) => ({
            where: async (condition: string) => {
              const setClause = Object.entries(data)
                .map(([key ], i) => `${key} = $${i + 1}`)
                .join(', ');
              const values = Object.values(data);
              
              return executeRawSql(
                `UPDATE ${table} SET ${setClause} WHERE ${condition} RETURNING *`,
                values
              );
            }
          })
        })
      };
      
      try {
        const result = await callback(tx);
        await executeRawSql("COMMIT");
        return result;
      } catch (error) {
        await executeRawSql("ROLLBACK");
        throw error;
      }
    }
  };
}


export const sessions = {
  id: 'id',
  startTime: 'start_time',
  endTime: 'end_time',
  status: 'status',
  createdAt: 'created_at'
};

export const rawData = {
  id: 'id',
  sessionId: 'session_id',
  data: 'data',
  capturedAt: 'captured_at'
};

export const processedData = {
  id: 'id',
  sessionId: 'session_id',
  data: 'data',
  processedAt: 'processed_at'
};

export const dailyPulse = {
  id: 'id',
  sessionId: 'session_id',
  status: 'status',
  data: 'data',
  startedAt: 'started_at',
  completedAt: 'completed_at',
  error: 'error'
};


export function eq(field: string, value: any): string {
  return `${field} = ${typeof value === 'string' ? `'${value}'` : value}`;
}

export function desc(field: string): string {
  return `${field} DESC`;
}