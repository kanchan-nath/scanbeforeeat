import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { isDemoUser } from './demo-restriction.middleware.js';

/**
 * Ensures user is authenticated via session
 */
export async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.'
    });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, email, display_name, account_status, email_verified_at, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (!users || users.length === 0) {
      // User deleted from DB while session still active
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        error: 'Account no longer exists. Please sign in again.'
      });
    }

    const user = users[0];
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your account is suspended or pending verification.'
      });
    }

    user.isDemo = isDemoUser(user);
    req.user = user;
    next();
  } catch (err) {
    logger.error({ err: err.message, userId: req.session.userId }, 'Auth verification database error');
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during authentication.'
    });
  }
}

/**
 * Factory to verify ownership of a resource in a given table
 * @param {string} table Database table name (scans, reports)
 * @param {string} paramKey Route param key (e.g., 'id')
 */
export function checkOwnership(table, paramKey = 'id') {
  const allowedTables = ['scans', 'reports'];
  if (!allowedTables.includes(table)) {
    throw new Error(`Unauthorized table ownership check: ${table}`);
  }

  return async (req, res, next) => {
    const resourceId = req.params[paramKey];
    if (!resourceId) {
      return res.status(400).json({ success: false, error: 'Resource ID is required.' });
    }

    try {
      const [rows] = await pool.execute(
        `SELECT user_id FROM ${table} WHERE id = ?`,
        [resourceId]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Resource not found.' });
      }

      if (rows[0].user_id !== req.user.id) {
        logger.warn(
          { attemptedUserId: req.user.id, ownerUserId: rows[0].user_id, table, resourceId },
          'Unauthorized resource access attempt blocked'
        );
        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not own this resource.'
        });
      }

      next();
    } catch (err) {
      logger.error({ err: err.message, table, resourceId }, 'Ownership check error');
      return res.status(500).json({ success: false, error: 'Internal ownership verification error.' });
    }
  };
}
