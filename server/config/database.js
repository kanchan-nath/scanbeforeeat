import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const poolConfig = {
  host: env.DB_SOCKET_PATH ? undefined : env.DB_HOST,
  port: env.DB_SOCKET_PATH ? undefined : env.DB_PORT,
  socketPath: env.DB_SOCKET_PATH || undefined,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
  timezone: '+00:00', // store and retrieve UTC
  ssl: env.DB_SSL ? { rejectUnauthorized: true } : undefined
};

export const pool = mysql.createPool(poolConfig);

/**
 * Execute a parameterized SQL query
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error({ sql, err: error.message }, 'Database query error');
    throw error;
  }
}

/**
 * Run a callback within a managed transaction
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Test the database connectivity
 */
export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    return rows && rows[0]?.connected === 1;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to connect to MySQL database');
    return false;
  }
}

export default pool;
