import { pool, withTransaction } from '../config/database.js';

export const scanRepository = {
  async createScan({ userId, productId = null, scanMethod, rawOcrText = null, confirmedIngredientsText, extractionConfidence = null }) {
    const [result] = await pool.execute(
      `INSERT INTO scans (user_id, product_id, scan_method, raw_ocr_text, confirmed_ingredients_text, extraction_confidence, status)
       VALUES (?, ?, ?, ?, ?, ?, 'created')`,
      [userId, productId, scanMethod, rawOcrText, confirmedIngredientsText, extractionConfidence]
    );
    return result.insertId;
  },

  async findById(scanId, userId) {
    const [rows] = await pool.execute(
      `SELECT s.id, s.user_id, s.product_id, s.scan_method, s.raw_ocr_text, s.confirmed_ingredients_text,
              s.extraction_confidence, s.status, s.created_at, s.updated_at,
              p.name as product_name, p.brand as product_brand, p.category as product_category,
              p.product_image_url, p.barcode as product_barcode, p.nutrition_data_json,
              r.id as report_id, r.overall_verdict, r.overall_score, r.analysis_status, r.created_at as report_created_at
       FROM scans s
       LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN reports r ON r.scan_id = s.id
       WHERE s.id = ? AND s.user_id = ?`,
      [scanId, userId]
    );
    return rows[0] || null;
  },

  async updateScanStatus(scanId, userId, status) {
    await pool.execute(
      'UPDATE scans SET status = ? WHERE id = ? AND user_id = ?',
      [status, scanId, userId]
    );
  },

  async updateIngredients(scanId, userId, confirmedIngredientsText) {
    const [result] = await pool.execute(
      'UPDATE scans SET confirmed_ingredients_text = ?, status = "created" WHERE id = ? AND user_id = ?',
      [confirmedIngredientsText, scanId, userId]
    );
    return result.affectedRows > 0;
  },

  async deleteScan(scanId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM scans WHERE id = ? AND user_id = ?',
      [scanId, userId]
    );
    return result.affectedRows > 0;
  },

  async clearUserHistory(userId) {
    const [result] = await pool.execute(
      'DELETE FROM scans WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  },

  async listScans({ userId, search = '', scanMethod = '', verdict = '', sort = 'newest', limit = 20, offset = 0 }) {
    let sql = `
      SELECT s.id, s.scan_method, s.confirmed_ingredients_text, s.status, s.created_at,
             p.name as product_name, p.brand as product_brand, p.category as product_category,
             p.product_image_url, p.barcode as product_barcode,
             r.id as report_id, r.overall_verdict, r.overall_score, r.analysis_status
      FROM scans s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN reports r ON r.scan_id = s.id
      WHERE s.user_id = ?
    `;

    const params = [userId];

    if (search && search.trim().length > 0) {
      sql += ` AND (p.name LIKE ? OR p.brand LIKE ? OR s.confirmed_ingredients_text LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (scanMethod && scanMethod.trim().length > 0) {
      sql += ` AND s.scan_method = ?`;
      params.push(scanMethod.trim());
    }

    if (verdict && verdict.trim().length > 0) {
      sql += ` AND r.overall_verdict = ?`;
      params.push(verdict.trim());
    }

    if (sort === 'oldest') {
      sql += ` ORDER BY s.created_at ASC`;
    } else {
      sql += ` ORDER BY s.created_at DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async countScans({ userId, search = '', scanMethod = '', verdict = '' }) {
    let sql = `
      SELECT COUNT(*) as total
      FROM scans s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN reports r ON r.scan_id = s.id
      WHERE s.user_id = ?
    `;

    const params = [userId];

    if (search && search.trim().length > 0) {
      sql += ` AND (p.name LIKE ? OR p.brand LIKE ? OR s.confirmed_ingredients_text LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (scanMethod && scanMethod.trim().length > 0) {
      sql += ` AND s.scan_method = ?`;
      params.push(scanMethod.trim());
    }

    if (verdict && verdict.trim().length > 0) {
      sql += ` AND r.overall_verdict = ?`;
      params.push(verdict.trim());
    }

    const [rows] = await pool.query(sql, params);
    return rows[0]?.total || 0;
  }
};

export default scanRepository;
