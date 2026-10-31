import { scanRepository } from '../repositories/scan.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { aiService } from '../services/ai.service.js';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const scanController = {
  async createScan(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        scanMethod,
        confirmedIngredientsText,
        rawOcrText,
        extractionConfidence,
        productId,
        productName,
        brand,
        category,
        barcode,
        productImageUrl,
        nutritionData
      } = req.body;

      if (!confirmedIngredientsText || confirmedIngredientsText.trim().length === 0) {
        return res.status(422).json({
          success: false,
          error: 'Confirmed ingredients text is required.'
        });
      }

      let resolvedProductId = null;
      if (productId && Number(productId) > 0) {
        resolvedProductId = Number(productId);
      }

      // If product details provided but no productId, resolve or upsert product
      if (!resolvedProductId && (productName || barcode)) {
        if (barcode && String(barcode).trim().length > 0) {
          const cleanBarcode = String(barcode).trim();
          const [existingProds] = await pool.execute(
            'SELECT id FROM products WHERE barcode = ?',
            [cleanBarcode]
          );

          if (existingProds && existingProds.length > 0) {
            resolvedProductId = existingProds[0].id;
            // Update cached ingredients or metadata if provided
            await pool.execute(
              `UPDATE products SET
                 name = COALESCE(?, name),
                 brand = COALESCE(?, brand),
                 category = COALESCE(?, category),
                 ingredients_text = COALESCE(?, ingredients_text)
               WHERE id = ?`,
              [
                productName || null,
                brand || null,
                category || null,
                confirmedIngredientsText || null,
                resolvedProductId
              ]
            );
          }
        }

        if (!resolvedProductId) {
          const prodName = productName || (barcode ? `Product ${barcode}` : 'Scanned Product');
          const [insertProd] = await pool.execute(
            `INSERT INTO products (barcode, name, brand, category, product_image_url, ingredients_text, nutrition_data_json, source_provider)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'user_scan')`,
            [
              barcode || null,
              prodName,
              brand || null,
              category || null,
              productImageUrl || null,
              confirmedIngredientsText,
              nutritionData ? JSON.stringify(nutritionData) : null
            ]
          );
          resolvedProductId = insertProd.insertId || null;
        }
      }

      // Ensure 0 or invalid IDs are converted to null
      if (!resolvedProductId || resolvedProductId <= 0) {
        resolvedProductId = null;
      }

      const scanId = await scanRepository.createScan({
        userId,
        productId: resolvedProductId,
        scanMethod: scanMethod || 'manual',
        rawOcrText: rawOcrText || null,
        confirmedIngredientsText: confirmedIngredientsText.trim(),
        extractionConfidence: extractionConfidence || null
      });

      logger.info({ scanId, userId, scanMethod }, 'New scan record created');

      const scanRecord = await scanRepository.findById(scanId, userId);

      return res.status(201).json({
        success: true,
        message: 'Scan created successfully.',
        scan: scanRecord,
        demoScanInfo: req.demoScanInfo || null
      });
    } catch (err) {
      next(err);
    }
  },

  async getScan(req, res, next) {
    try {
      const scan = await scanRepository.findById(req.params.id, req.user.id);
      if (!scan) {
        return res.status(404).json({ success: false, error: 'Scan not found.' });
      }
      return res.json({ success: true, scan });
    } catch (err) {
      next(err);
    }
  },

  async updateIngredients(req, res, next) {
    try {
      const { confirmedIngredientsText } = req.body;
      if (!confirmedIngredientsText || confirmedIngredientsText.trim().length === 0) {
        return res.status(422).json({ success: false, error: 'Ingredient text cannot be empty.' });
      }

      const updated = await scanRepository.updateIngredients(
        req.params.id,
        req.user.id,
        confirmedIngredientsText.trim()
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Scan not found.' });
      }

      const scan = await scanRepository.findById(req.params.id, req.user.id);
      return res.json({ success: true, message: 'Ingredients updated successfully.', scan });
    } catch (err) {
      next(err);
    }
  },

  async analyzeScan(req, res, next) {
    try {
      const scanId = req.params.id;
      const userId = req.user.id;

      const scan = await scanRepository.findById(scanId, userId);
      if (!scan) {
        return res.status(404).json({ success: false, error: 'Scan not found.' });
      }

      await scanRepository.updateScanStatus(scanId, userId, 'processing');

      // Execute AI analysis
      logger.info({ scanId, userId }, 'Triggering AI ingredient intelligence analysis');

      let parsedNutrition = null;
      if (scan.nutrition_data_json) {
        parsedNutrition = typeof scan.nutrition_data_json === 'string'
          ? JSON.parse(scan.nutrition_data_json)
          : scan.nutrition_data_json;
      }

      const analysisReport = await aiService.analyzeIngredients({
        ingredientsText: scan.confirmed_ingredients_text,
        productName: scan.product_name || 'Food Product',
        brand: scan.product_brand,
        category: scan.product_category,
        nutritionData: parsedNutrition
      });

      // Save report in database
      const reportId = await reportRepository.saveReport({
        scanId: Number(scanId),
        userId,
        schemaVersion: '1.0',
        analysisProvider: env.AI_MOCK_MODE ? 'mock_ai_engine' : 'nvidia_nim',
        modelIdentifier: env.AI_MOCK_MODE ? 'deterministic-health-v1' : env.NVIDIA_MODEL,
        promptVersion: '1.0',
        scoringMethodologyVersion: analysisReport.overallAssessment.scoreMethodologyVersion || '1.0',
        overallVerdict: analysisReport.overallAssessment.verdict,
        overallScore: analysisReport.overallAssessment.score,
        reportJson: analysisReport
      });

      const fullReport = await reportRepository.findById(reportId, userId);

      return res.json({
        success: true,
        message: 'Ingredient analysis completed successfully.',
        report: fullReport
      });
    } catch (err) {
      // Mark scan as failed if analysis failed
      await scanRepository.updateScanStatus(req.params.id, req.user.id, 'failed').catch(() => {});
      next(err);
    }
  },

  async getReport(req, res, next) {
    try {
      const report = await reportRepository.findByScanId(req.params.id, req.user.id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found for this scan.' });
      }
      return res.json({ success: true, report });
    } catch (err) {
      next(err);
    }
  },

  async listScans(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        search = '',
        scanMethod = '',
        verdict = '',
        sort = 'newest',
        page = 1,
        limit = 10
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
      const offset = (pageNum - 1) * limitNum;

      const [scans, totalCount] = await Promise.all([
        scanRepository.listScans({
          userId,
          search,
          scanMethod,
          verdict,
          sort,
          limit: limitNum,
          offset
        }),
        scanRepository.countScans({
          userId,
          search,
          scanMethod,
          verdict
        })
      ]);

      return res.json({
        success: true,
        scans,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteScan(req, res, next) {
    try {
      const deleted = await scanRepository.deleteScan(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Scan not found or unauthorized.' });
      }
      return res.json({ success: true, message: 'Scan deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async clearHistory(req, res, next) {
    try {
      const count = await scanRepository.clearUserHistory(req.user.id);
      return res.json({ success: true, message: `Successfully deleted ${count} scan records.` });
    } catch (err) {
      next(err);
    }
  },

  async compareScans(req, res, next) {
    try {
      const { scanIds } = req.body;
      if (!Array.isArray(scanIds) || scanIds.length < 2) {
        return res.status(422).json({
          success: false,
          error: 'Please select at least two products to compare.'
        });
      }

      // Max 3 products comparison on mobile screen
      const targetIds = scanIds.slice(0, 3).map(id => Number(id));
      const reports = await reportRepository.getReportsForComparison(targetIds, req.user.id);

      if (reports.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Not enough valid reports found among selected products to generate comparison.'
        });
      }

      // Compute structured comparison insights
      const comparison = {
        productsCount: reports.length,
        comparedAt: new Date().toISOString(),
        items: reports.map(r => ({
          scanId: r.scan_id,
          name: r.product_name || 'Unnamed Product',
          brand: r.product_brand || 'Unknown Brand',
          imageUrl: r.product_image_url,
          score: r.overall_score,
          verdict: r.overall_verdict,
          ingredientCount: r.report_json?.ingredients?.length || 0,
          allergens: r.report_json?.allergenWarnings || [],
          nutrition: r.nutrition_data_json || null,
          keyBenefits: (r.report_json?.ingredients || [])
            .flatMap(i => i.benefits || [])
            .slice(0, 3)
            .map(b => b.description),
          keyConcerns: (r.report_json?.ingredients || [])
            .flatMap(i => i.concerns || [])
            .slice(0, 3)
            .map(c => c.description)
        }))
      };

      return res.json({
        success: true,
        comparison
      });
    } catch (err) {
      next(err);
    }
  }
};

export default scanController;
