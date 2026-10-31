import fs from 'fs';
import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Build database connection configuration, supporting individual DB_* variables
 * as well as cloud-native DATABASE_URL (Aiven MySQL Service URI).
 */
export function getDbConfig() {
  let isSsl = env.DB_SSL;
  let config = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    dateStrings: true,
    timezone: '+00:00'
  };

  // If DATABASE_URL is provided (Aiven Service URI format), parse connection details
  if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
    try {
      const parsedUrl = new URL(env.DATABASE_URL.trim());
      if (parsedUrl.hostname) config.host = parsedUrl.hostname;
      if (parsedUrl.port) config.port = Number(parsedUrl.port);
      if (parsedUrl.username) config.user = decodeURIComponent(parsedUrl.username);
      if (parsedUrl.password) config.password = decodeURIComponent(parsedUrl.password);
      if (parsedUrl.pathname && parsedUrl.pathname.length > 1) {
        config.database = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
      }

      // Check SSL indicators in URL or if connecting to cloud provider host
      const sslMode = parsedUrl.searchParams.get('ssl-mode');
      const sslParam = parsedUrl.searchParams.get('ssl');
      if (sslMode || sslParam || parsedUrl.hostname.includes('aivencloud.com')) {
        isSsl = true;
      }
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to parse DATABASE_URL, using default/individual DB credentials');
    }
  }

  // Socket path support (local dev only, if explicitly provided and DATABASE_URL is not used)
  if (!env.DATABASE_URL && env.DB_SOCKET_PATH && env.DB_SOCKET_PATH.trim() !== '') {
    config.socketPath = env.DB_SOCKET_PATH.trim();
    delete config.host;
    delete config.port;
  }

  // Configure TLS / SSL for cloud providers (like Aiven)
  if (isSsl) {
    let ca = undefined;
    if (env.DB_SSL_CA && env.DB_SSL_CA.trim() !== '') {
      if (env.DB_SSL_CA.includes('-----BEGIN CERTIFICATE-----')) {
        ca = env.DB_SSL_CA;
      } else if (fs.existsSync(env.DB_SSL_CA)) {
        try {
          ca = fs.readFileSync(env.DB_SSL_CA, 'utf-8');
        } catch (e) {
          logger.warn({ err: e.message }, 'Failed to read DB_SSL_CA certificate file');
        }
      }
    }

    config.ssl = {
      rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED,
      ...(ca ? { ca } : {})
    };
  }

  return config;
}

export const pool = mysql.createPool(getDbConfig());

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
