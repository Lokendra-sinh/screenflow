let initialized: boolean = false;


async function executeRawSqlDirectly(query: string, params: any[] = []) {
  try {
    let processedQuery = query;
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let value;
      
      if (param === null) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        // Escape single quotes in strings
        value = `'${param.replace(/'/g, "''")}'`;
      } else if (param instanceof Date) {
        value = `'${param.toISOString()}'`;
      } else {
        value = String(param);
      }
      
      processedQuery = processedQuery.replace(
        new RegExp('\\' + placeholder + '\\b', 'g'), 
        value
      );
    });

    const response = await fetch("http://localhost:3030/raw_sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: processedQuery }),
    });

    if (!response.ok) {
      throw new Error(`SQL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error executing raw SQL directly:", error);
    throw error;
  }
}

async function initializeTables() {
  if (initialized) return;

  console.log("Checking and initializing database tables...");

  try {
    // Create sessions table
    await executeRawSqlDirectly(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Create raw_data table
    await executeRawSqlDirectly(`
      CREATE TABLE IF NOT EXISTS raw_data (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        data TEXT NOT NULL,
        captured_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `);

    // Create processed_data table
    await executeRawSqlDirectly(`
      CREATE TABLE IF NOT EXISTS processed_data (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        data TEXT NOT NULL,
        processed_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `);

    // Create daily_pulse table
    await executeRawSqlDirectly(`
      CREATE TABLE IF NOT EXISTS daily_pulse (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        error TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `);

    // Create some helpful indexes
    await executeRawSqlDirectly(`
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)
    `);

    await executeRawSqlDirectly(`
      CREATE INDEX IF NOT EXISTS idx_raw_data_session_id ON raw_data(session_id)
    `);

    await executeRawSqlDirectly(`
      CREATE INDEX IF NOT EXISTS idx_processed_data_session_id ON processed_data(session_id)
    `);

    initialized = true;
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
}

export async function executeRawSql(query: string, params: any[] = []) {
  if (!initialized) {
    await initializeTables();
  }

  return executeRawSqlDirectly(query, params);
}
