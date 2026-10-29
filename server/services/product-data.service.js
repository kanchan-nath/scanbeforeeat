import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

const USER_AGENT = 'ScanBeforeEat/1.0 (https://scanbeforeeat.local; contact@scanbeforeeat.local)';

export const productDataService = {
  /**
   * Validate barcode string
   */
  isValidBarcode(barcode) {
    if (!barcode || typeof barcode !== 'string') return false;
    const clean = barcode.trim();
    // Standard retail barcodes: EAN-8, UPC-A (12), EAN-13, ITF-14
    return /^\d{8,14}$/.test(clean);
  },

  /**
   * Look up product from local MySQL cache or Open Food Facts API
   */
  async lookupByBarcode(barcode) {
    const cleanBarcode = barcode.trim();
    if (!this.isValidBarcode(cleanBarcode)) {
      throw new Error('Invalid barcode format. Expected 8 to 14 numeric digits.');
    }

    // 1. Check local MySQL cache first
    const [cached] = await pool.execute(
      `SELECT id, barcode, name, brand, category, product_image_url,
              ingredients_text, nutrition_data_json, source_provider, source_updated_at
       FROM products WHERE barcode = ?`,
      [cleanBarcode]
    );

    if (cached && cached.length > 0) {
      const prod = cached[0];
      return {
        found: true,
        source: 'local_cache',
        product: {
          id: prod.id,
          barcode: prod.barcode,
          name: prod.name,
          brand: prod.brand,
          category: prod.category,
          imageUrl: prod.product_image_url,
          ingredientsText: prod.ingredients_text,
          nutritionData: prod.nutrition_data_json
            ? (typeof prod.nutrition_data_json === 'string' ? JSON.parse(prod.nutrition_data_json) : prod.nutrition_data_json)
            : null,
          retrievedAt: prod.source_updated_at || prod.created_at
        }
      };
    }

    // 2. Fetch from Open Food Facts API
    try {
      logger.info({ barcode: cleanBarcode }, 'Looking up barcode on Open Food Facts');
      const offUrl = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json?fields=product_name,brands,categories,ingredients_text,image_url,nutriments,serving_size`;

      const response = await fetch(offUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        logger.warn({ status: response.status, barcode: cleanBarcode }, 'Open Food Facts lookup failed');
        return { found: false, barcode: cleanBarcode, message: 'Product not found in catalogue.' };
      }

      const data = await response.json();
      if (!data || data.status !== 1 || !data.product) {
        return { found: false, barcode: cleanBarcode, message: 'Product not found in catalogue.' };
      }

      const raw = data.product;
      const name = raw.product_name || raw.product_name_en || 'Unknown Product';
      const brand = raw.brands || null;
      const category = raw.categories ? raw.categories.split(',')[0].trim() : null;
      const imageUrl = raw.image_url || null;
      const ingredientsText = raw.ingredients_text || raw.ingredients_text_en || null;

      // Extract nutritional fields
      let nutritionData = null;
      if (raw.nutriments) {
        const n = raw.nutriments;
        nutritionData = {
          servingSize: raw.serving_size || '100g',
          energyKcal: n['energy-kcal'] || n['energy-kcal_100g'] || null,
          carbohydratesG: n.carbohydrates || n.carbohydrates_100g || null,
          sugarG: n.sugars || n.sugars_100g || null,
          addedSugarG: n['added-sugars'] || n['added-sugars_100g'] || null,
          proteinG: n.proteins || n.proteins_100g || null,
          totalFatG: n.fat || n.fat_100g || null,
          saturatedFatG: n['saturated-fat'] || n['saturated-fat_100g'] || null,
          sodiumMg: n.sodium ? Math.round(n.sodium * 1000) : (n.sodium_100g ? Math.round(n.sodium_100g * 1000) : null),
          fiberG: n.fiber || n.fiber_100g || null
        };
      }

      // 3. Cache into local MySQL products table
      const [insertResult] = await pool.execute(
        `INSERT INTO products (barcode, name, brand, category, product_image_url, ingredients_text, nutrition_data_json, source_provider, source_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'open_food_facts', NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           brand = VALUES(brand),
           category = VALUES(category),
           product_image_url = VALUES(product_image_url),
           ingredients_text = VALUES(ingredients_text),
           nutrition_data_json = VALUES(nutrition_data_json),
           source_updated_at = NOW()`,
        [cleanBarcode, name, brand, category, imageUrl, ingredientsText, nutritionData ? JSON.stringify(nutritionData) : null]
      );

      const productId = insertResult.insertId || (cached[0]?.id);

      return {
        found: true,
        source: 'open_food_facts',
        product: {
          id: productId,
          barcode: cleanBarcode,
          name,
          brand,
          category,
          imageUrl,
          ingredientsText,
          nutritionData,
          retrievedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      logger.error({ err: err.message, barcode: cleanBarcode }, 'Error fetching product from Open Food Facts');
      return {
        found: false,
        barcode: cleanBarcode,
        message: 'Unable to reach external product catalogue. You can enter or photograph ingredients directly.'
      };
    }
  }
};

export default productDataService;
