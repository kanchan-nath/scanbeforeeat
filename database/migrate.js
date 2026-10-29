import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../server/config/env.js';
import { logger } from '../server/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  const connConfig = {
    host: env.DB_SOCKET_PATH ? undefined : env.DB_HOST,
    port: env.DB_SOCKET_PATH ? undefined : env.DB_PORT,
    socketPath: env.DB_SOCKET_PATH || undefined,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL ? { rejectUnauthorized: true } : undefined
  };

  // Connect to the database
  const connection = await mysql.createConnection({
    ...connConfig,
    database: env.DB_NAME,
    multipleStatements: true
  });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Split into individual executable statements
    const statements = schemaSql
      .replace(/--.*$/gm, '') // remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      if (stmt.toLowerCase().startsWith('use ') || stmt.toLowerCase().startsWith('create database ')) {
        continue; // already handled
      }
      await connection.query(stmt);
    }

    console.log('✅ All schema migrations executed successfully.');
    logger.info('Database schema migration completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    logger.error({ err: error.message }, 'Migration failed');
    throw error;
  } finally {
    await connection.end();
  }
}

// Allow standalone execution via `node database/migrate.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      console.log('Migration complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
