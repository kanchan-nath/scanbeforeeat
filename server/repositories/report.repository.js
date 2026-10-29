import { pool, withTransaction } from '../config/database.js';

export const reportRepository = {
  async saveReport({
    scanId,
    userId,
    schemaVersion = '1.0',
    analysisProvider,
    modelIdentifier,
    promptVersion = '1.0',
    scoringMethodologyVersion = '1.0',
    overallVerdict,
    overallScore = null,
    reportJson
  }) {
    return withTransaction(async (conn) => {
      // 1. Insert or replace report
      const [insertReport] = await conn.execute(
        `INSERT INTO reports
          (scan_id, user_id, schema_version, analysis_provider, model_identifier,
           prompt_version, scoring_methodology_version, overall_verdict, overall_score, report_json, analysis_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
         ON DUPLICATE KEY UPDATE
           schema_version = VALUES(schema_version),
           analysis_provider = VALUES(analysis_provider),
           model_identifier = VALUES(model_identifier),
           prompt_version = VALUES(prompt_version),
           scoring_methodology_version = VALUES(scoring_methodology_version),
           overall_verdict = VALUES(overall_verdict),
           overall_score = VALUES(overall_score),
           report_json = VALUES(report_json),
           analysis_status = 'completed'`,
        [
          scanId,
          userId,
          schemaVersion,
          analysisProvider,
          modelIdentifier,
          promptVersion,
          scoringMethodologyVersion,
          overallVerdict,
          overallScore,
          JSON.stringify(reportJson)
        ]
      );

      const reportId = insertReport.insertId || (
        await conn.execute('SELECT id FROM reports WHERE scan_id = ?', [scanId])
      )[0][0].id;

      // 2. Clear old junction entries if re-analyzing
      await conn.execute('DELETE FROM report_ingredients WHERE report_id = ?', [reportId]);

      // 3. Populate report_ingredients and canonical ingredients
      if (Array.isArray(reportJson.ingredients)) {
        for (let i = 0; i < reportJson.ingredients.length; i++) {
          const ing = reportJson.ingredients[i];
          const normName = (ing.normalizedName || ing.originalText || '').trim().toLowerCase();

          if (!normName) continue;

          // Upsert canonical ingredient
          await conn.execute(
            `INSERT INTO ingredients (normalized_name, canonical_identifier, ingredient_category, general_description)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               canonical_identifier = COALESCE(VALUES(canonical_identifier), canonical_identifier),
               ingredient_category = COALESCE(VALUES(ingredient_category), ingredient_category)`,
            [normName, ing.insNumber || null, ing.category || null, ing.function || null]
          );

          const [ingRow] = await conn.execute(
            'SELECT id FROM ingredients WHERE normalized_name = ?',
            [normName]
          );
          const ingredientId = ingRow[0]?.id || null;

          await conn.execute(
            `INSERT INTO report_ingredients
              (report_id, ingredient_id, original_label_text, ingredient_order,
               identification_status, category, function_text, evidence_quality)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              reportId,
              ingredientId,
              ing.originalText.slice(0, 255),
              i,
              ing.identificationStatus || 'confirmed',
              ing.category || null,
              ing.function || null,
              ing.benefits?.[0]?.evidenceQuality || 'limited'
            ]
          );
        }
      }

      // 4. Update scan status
      await conn.execute(
        'UPDATE scans SET status = "completed" WHERE id = ?',
        [scanId]
      );

      return reportId;
    });
  },

  async findByScanId(scanId, userId) {
    const [rows] = await pool.execute(
      `SELECT r.id, r.scan_id, r.user_id, r.schema_version, r.analysis_provider, r.model_identifier,
              r.scoring_methodology_version, r.overall_verdict, r.overall_score, r.report_json,
              r.analysis_status, r.created_at, r.updated_at,
              s.scan_method, s.confirmed_ingredients_text,
              p.name as product_name, p.brand as product_brand, p.category as product_category,
              p.product_image_url, p.barcode as product_barcode, p.nutrition_data_json
       FROM reports r
       INNER JOIN scans s ON r.scan_id = s.id
       LEFT JOIN products p ON s.product_id = p.id
       WHERE r.scan_id = ? AND r.user_id = ?`,
      [scanId, userId]
    );

    if (!rows || rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      report_json: typeof item.report_json === 'string' ? JSON.parse(item.report_json) : item.report_json,
      nutrition_data_json: item.nutrition_data_json && typeof item.nutrition_data_json === 'string'
        ? JSON.parse(item.nutrition_data_json)
        : item.nutrition_data_json
    };
  },

  async findById(reportId, userId) {
    const [rows] = await pool.execute(
      `SELECT r.id, r.scan_id, r.user_id, r.schema_version, r.analysis_provider, r.model_identifier,
              r.scoring_methodology_version, r.overall_verdict, r.overall_score, r.report_json,
              r.analysis_status, r.created_at, r.updated_at,
              s.scan_method, s.confirmed_ingredients_text,
              p.name as product_name, p.brand as product_brand, p.category as product_category,
              p.product_image_url, p.barcode as product_barcode, p.nutrition_data_json
       FROM reports r
       INNER JOIN scans s ON r.scan_id = s.id
       LEFT JOIN products p ON s.product_id = p.id
       WHERE r.id = ? AND r.user_id = ?`,
      [reportId, userId]
    );

    if (!rows || rows.length === 0) return null;
    const item = rows[0];
    return {
      ...item,
      report_json: typeof item.report_json === 'string' ? JSON.parse(item.report_json) : item.report_json,
      nutrition_data_json: item.nutrition_data_json && typeof item.nutrition_data_json === 'string'
        ? JSON.parse(item.nutrition_data_json)
        : item.nutrition_data_json
    };
  },

  async getReportsForComparison(scanIds, userId) {
    if (!scanIds || scanIds.length === 0) return [];
    
    // Create parameterized placeholders ?, ?, ?
    const placeholders = scanIds.map(() => '?').join(',');
    const params = [...scanIds, userId];

    const [rows] = await pool.query(
      `SELECT r.id as report_id, r.scan_id, r.overall_verdict, r.overall_score, r.report_json, r.created_at,
              s.scan_method, s.confirmed_ingredients_text,
              p.id as product_id, p.name as product_name, p.brand as product_brand, p.category as product_category,
              p.product_image_url, p.barcode as product_barcode, p.nutrition_data_json
       FROM reports r
       INNER JOIN scans s ON r.scan_id = s.id
       LEFT JOIN products p ON s.product_id = p.id
       WHERE s.id IN (${placeholders}) AND r.user_id = ?
       ORDER BY r.created_at DESC`,
      params
    );

    return rows.map(item => ({
      ...item,
      report_json: typeof item.report_json === 'string' ? JSON.parse(item.report_json) : item.report_json,
      nutrition_data_json: item.nutrition_data_json && typeof item.nutrition_data_json === 'string'
        ? JSON.parse(item.nutrition_data_json)
        : item.nutrition_data_json
    }));
  }
};

export default reportRepository;
