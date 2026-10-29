import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { barcodeLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

// Barcode lookup (public/authenticated with rate limiting)
router.get('/barcode/:barcode', barcodeLimiter, productController.lookupBarcode);

// Product details by ID
router.get('/:id', productController.getProductById);

export default router;
