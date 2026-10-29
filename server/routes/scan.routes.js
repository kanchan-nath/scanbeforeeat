import { Router } from 'express';
import { scanController } from '../controllers/scan.controller.js';
import { requireAuth, checkOwnership } from '../middleware/auth.middleware.js';
import { csrfMiddleware } from '../middleware/csrf.middleware.js';
import { aiAnalysisLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// All scan routes require authentication
router.use(requireAuth);

// Create new scan record
router.post('/', csrfMiddleware, scanController.createScan);

// List user scan history
router.get('/', scanController.listScans);

// Clear entire scan history
router.delete('/clear-all', csrfMiddleware, scanController.clearHistory);

// Compare selected scans
router.post('/compare', csrfMiddleware, scanController.compareScans);

// Individual scan endpoints
router.get('/:id', checkOwnership('scans', 'id'), scanController.getScan);

router.patch('/:id/ingredients', checkOwnership('scans', 'id'), csrfMiddleware, scanController.updateIngredients);

// Trigger AI analysis on scan
router.post(
  '/:id/analyze',
  checkOwnership('scans', 'id'),
  aiAnalysisLimiter,
  csrfMiddleware,
  scanController.analyzeScan
);

// Get completed analysis report
router.get('/:id/report', checkOwnership('scans', 'id'), scanController.getReport);

// Delete individual scan
router.delete('/:id', checkOwnership('scans', 'id'), csrfMiddleware, scanController.deleteScan);

export default router;
