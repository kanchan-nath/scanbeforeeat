import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Checks if a user is the demo account
 * @param {object|string} user User object or email string
 * @returns {boolean}
 */
export function isDemoUser(user) {
  if (!user) return false;
  const email = (typeof user === 'string' ? user : user.email) || '';
  return email.toLowerCase() === 'demo@scanbeforeeat.local';
}

/**
 * Get the number of scans created by a user today (UTC date)
 * @param {number} userId 
 * @returns {Promise<number>}
 */
export async function getTodayScanCount(userId) {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as scanCount 
       FROM scans 
       WHERE user_id = ? 
         AND created_at >= CONCAT(UTC_DATE(), ' 00:00:00')`,
      [userId]
    );
    return Number(rows[0]?.scanCount || 0);
  } catch (err) {
    logger.error({ err: err.message, userId }, 'Failed to query daily scan count');
    return 0;
  }
}

/**
 * Middleware: Strictly prevents any deletion for demo users (403 Forbidden)
 */
export function preventDemoDeletion(req, res, next) {
  if (req.user && isDemoUser(req.user)) {
    logger.warn({ userId: req.user.id, path: req.originalUrl, method: req.method }, 'Demo user attempted deletion - blocked');
    return res.status(403).json({
      success: false,
      error: 'Demo accounts are not permitted to delete scans, history, or account records.',
      code: 'DEMO_DELETION_FORBIDDEN'
    });
  }
  next();
}

/**
 * Middleware: Enforces maximum 2 scans per calendar day for demo accounts (429 Too Many Requests)
 */
export async function enforceDemoScanLimit(req, res, next) {
  if (req.user && isDemoUser(req.user)) {
    const todayCount = await getTodayScanCount(req.user.id);
    const DAILY_LIMIT = 2;

    if (todayCount >= DAILY_LIMIT) {
      logger.warn({ userId: req.user.id, todayCount, limit: DAILY_LIMIT }, 'Demo user reached daily scan limit');
      return res.status(429).json({
        success: false,
        error: `Demo account daily limit reached (${DAILY_LIMIT} scans per day). Please create a free account to enjoy unlimited scans.`,
        code: 'DEMO_SCAN_LIMIT_REACHED',
        limit: DAILY_LIMIT,
        used: todayCount,
        remaining: 0
      });
    }

    req.demoScanInfo = {
      limit: DAILY_LIMIT,
      used: todayCount,
      remaining: Math.max(0, DAILY_LIMIT - (todayCount + 1))
    };
  }
  next();
}

