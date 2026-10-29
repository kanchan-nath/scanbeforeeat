import session from 'express-session';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Native, resilient MySQL Session Store extending express-session.Store.
 * Zero external vulnerable dependencies, parameterized queries, and automatic expired session cleanup.
 */
export class MySQLSessionStore extends session.Store {
  constructor(options = {}) {
    super();
    this.cleanupIntervalMs = options.cleanupIntervalMs || 15 * 60 * 1000; // 15 mins
    this.startCleanupTimer();
  }

  async get(sid, callback) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const [rows] = await pool.execute(
        'SELECT data, expires FROM sessions WHERE session_id = ?',
        [sid]
      );

      if (!rows || rows.length === 0) {
        return callback(null, null);
      }

      const { data, expires } = rows[0];
      if (expires < now) {
        // Session expired, delete it
        await this.destroy(sid, () => {});
        return callback(null, null);
      }

      const sessionData = JSON.parse(data);
      return callback(null, sessionData);
    } catch (err) {
      logger.error({ err: err.message, sid }, 'Error reading session from MySQL');
      return callback(err);
    }
  }

  async set(sid, sessionData, callback) {
    try {
      let expires;
      if (sessionData && sessionData.cookie && sessionData.cookie.expires) {
        expires = Math.ceil(new Date(sessionData.cookie.expires).getTime() / 1000);
      } else {
        // Default 7 days
        expires = Math.ceil((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
      }

      const userId = sessionData?.userId || null;
      const dataStr = JSON.stringify(sessionData);

      await pool.execute(
        `INSERT INTO sessions (session_id, expires, data, user_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data), user_id = VALUES(user_id)`,
        [sid, expires, dataStr, userId]
      );

      return callback(null);
    } catch (err) {
      logger.error({ err: err.message, sid }, 'Error writing session to MySQL');
      return callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await pool.execute('DELETE FROM sessions WHERE session_id = ?', [sid]);
      if (callback) callback(null);
    } catch (err) {
      logger.error({ err: err.message, sid }, 'Error destroying session in MySQL');
      if (callback) callback(err);
    }
  }

  async touch(sid, sessionData, callback) {
    try {
      let expires;
      if (sessionData && sessionData.cookie && sessionData.cookie.expires) {
        expires = Math.ceil(new Date(sessionData.cookie.expires).getTime() / 1000);
      } else {
        expires = Math.ceil((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
      }

      await pool.execute(
        'UPDATE sessions SET expires = ? WHERE session_id = ?',
        [expires, sid]
      );

      if (callback) callback(null);
    } catch (err) {
      logger.error({ err: err.message, sid }, 'Error touching session in MySQL');
      if (callback) callback(err);
    }
  }

  startCleanupTimer() {
    this.cleanupTimer = setInterval(async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const [result] = await pool.execute(
          'DELETE FROM sessions WHERE expires < ?',
          [now]
        );
        if (result.affectedRows > 0) {
          logger.debug({ cleaned: result.affectedRows }, 'Cleaned up expired sessions');
        }
      } catch (err) {
        logger.error({ err: err.message }, 'Expired session cleanup failed');
      }
    }, this.cleanupIntervalMs);

    // Don't prevent process from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

export default MySQLSessionStore;
