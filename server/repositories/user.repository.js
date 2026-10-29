import { pool, withTransaction } from '../config/database.js';

export const userRepository = {
  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, display_name, account_status, email_verified_at, created_at FROM users WHERE email = ?',
      [normalized]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, display_name, account_status, email_verified_at, created_at, updated_at, last_login_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async createUser({ email, passwordHash, displayName }) {
    const normalized = email.trim().toLowerCase();
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, display_name, account_status)
       VALUES (?, ?, ?, 'active')`,
      [normalized, passwordHash, displayName || null]
    );
    return result.insertId;
  },

  async updateLastLogin(id) {
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id]);
  },

  async updatePassword(id, newPasswordHash) {
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
  },

  async updateProfile(id, { displayName }) {
    await pool.execute('UPDATE users SET display_name = ? WHERE id = ?', [displayName, id]);
  },

  /**
   * Complete GDPR/privacy compliant account deletion
   */
  async deleteAccount(id) {
    return withTransaction(async (conn) => {
      // Delete user sessions
      await conn.execute('DELETE FROM sessions WHERE user_id = ?', [id]);
      // Foreign keys on scans, reports, user_preferences have ON DELETE CASCADE
      const [res] = await conn.execute('DELETE FROM users WHERE id = ?', [id]);
      return res.affectedRows > 0;
    });
  },

  /**
   * Full data export for personal privacy download
   */
  async getExportData(id) {
    const [userRows] = await pool.execute(
      'SELECT id, email, display_name, created_at, last_login_at FROM users WHERE id = ?',
      [id]
    );
    if (!userRows[0]) return null;

    const [prefRows] = await pool.execute(
      'SELECT allergens_json, dietary_tags_json FROM user_preferences WHERE user_id = ?',
      [id]
    );

    const [scans] = await pool.execute(
      `SELECT s.id, s.scan_method, s.confirmed_ingredients_text, s.status, s.created_at,
              p.name as product_name, p.brand as product_brand, p.category as product_category,
              r.overall_verdict, r.overall_score, r.report_json
       FROM scans s
       LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN reports r ON r.scan_id = s.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [id]
    );

    return {
      exportedAt: new Date().toISOString(),
      user: userRows[0],
      preferences: prefRows[0] || null,
      scans: scans.map(s => ({
        id: s.id,
        method: s.scan_method,
        productName: s.product_name,
        productBrand: s.product_brand,
        productCategory: s.product_category,
        ingredients: s.confirmed_ingredients_text,
        status: s.status,
        verdict: s.overall_verdict,
        score: s.overall_score,
        report: s.report_json ? (typeof s.report_json === 'string' ? JSON.parse(s.report_json) : s.report_json) : null,
        createdAt: s.created_at
      }))
    };
  }
};

export default userRepository;
