import { productDataService } from '../services/product-data.service.js';
import { pool } from '../config/database.js';

export const productController = {
  async lookupBarcode(req, res, next) {
    try {
      const { barcode } = req.params;
      const result = await productDataService.lookupByBarcode(barcode);
      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT id, barcode, name, brand, category, product_image_url, ingredients_text, nutrition_data_json, source_provider, created_at FROM products WHERE id = ?',
        [id]
      );
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      const prod = rows[0];
      return res.json({
        success: true,
        product: {
          ...prod,
          nutritionData: prod.nutrition_data_json
            ? (typeof prod.nutrition_data_json === 'string' ? JSON.parse(prod.nutrition_data_json) : prod.nutrition_data_json)
            : null
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

export default productController;
