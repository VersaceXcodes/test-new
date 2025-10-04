import dotenv from "dotenv";
import fs from "fs";
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST || "ep-ancient-dream-abbsot9k-pooler.eu-west-2.aws.neon.tech",
        database: PGDATABASE || "neondb",
        user: PGUSER || "neondb_owner",
        password: PGPASSWORD || "npg_jAS3aITLC5DX",
        port: Number(PGPORT),
        ssl: { require: true },
      }
);


async function initDb() {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if the expected simple schema tables exist
    const expectedTables = ['users', 'tasks', 'auth_tokens', 'search_filters'];
    const existingTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ANY($1);
    `, [expectedTables]);
    
    const existingTableNames = existingTablesResult.rows.map(row => row.table_name);
    console.log('Expected tables found:', existingTableNames);
    
    // If we have the expected tables, check if they have the right structure
    let needsRecreation = false;
    if (existingTableNames.includes('users')) {
      const userColumnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_id';
      `);
      
      if (userColumnsResult.rows.length === 0) {
        console.log('Users table exists but has wrong structure (no user_id column)');
        needsRecreation = true;
      }
    }
    
    // If tables need recreation or don't exist, drop and recreate them
    if (needsRecreation || existingTableNames.length === 0) {
      console.log('Dropping and recreating tables with correct schema...');
      
      // Drop tables in reverse dependency order to avoid foreign key constraints
      const dropTables = ['search_filters', 'auth_tokens', 'tasks', 'users'];
      for (const tableName of dropTables) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
          console.log(`Dropped table: ${tableName}`);
        } catch (error) {
          console.warn(`Could not drop table ${tableName}:`, error.message);
        }
      }
    }
    
    // Read and execute the schema creation
    const dbInitCommands = fs
      .readFileSync(`./db.sql`, "utf-8")
      .toString()
      .split(/(?=CREATE TABLE |INSERT INTO)/)
      .filter(cmd => cmd.trim().length > 0);

    // Execute each command
    for (let cmd of dbInitCommands) {
      cmd = cmd.trim();
      if (!cmd) continue;
      
      console.log('Executing command:', cmd.substring(0, 100) + '...');
      await client.query(cmd);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database initialization completed successfully');
  } catch (e) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', e);
    throw e;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Execute initialization
initDb().catch(console.error);
