import argon2 from 'argon2';
import { pool, withTransaction } from '../../server/config/database.js';
import { logger } from '../../server/utils/logger.js';

export async function runSeed() {
  console.log('🌱 Seeding database with realistic demonstration products...');

  await withTransaction(async (conn) => {
    // 1. Create or verify Demo User
    const demoEmail = 'demo@scanbeforeeat.local';
    const demoPasswordHash = await argon2.hash('DemoUser@1234', {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    const [existingUsers] = await conn.execute(
      'SELECT id FROM users WHERE email = ?',
      [demoEmail]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`ℹ️ Demo user already exists with ID: ${userId}`);
    } else {
      const [insertUser] = await conn.execute(
        `INSERT INTO users (email, password_hash, display_name, email_verified_at, account_status)
         VALUES (?, ?, ?, NOW(), 'active')`,
        [demoEmail, demoPasswordHash, 'Demo Explorer']
      );
      userId = insertUser.insertId;
      console.log(`✅ Created demo user (ID: ${userId}) - Email: ${demoEmail} / Password: DemoUser@1234`);
    }

    // 2. Demonstration Products
    const demoProducts = [
      {
        barcode: '8901234567890',
        name: 'ChocoCrunch Whole Wheat Biscuits',
        brand: 'NutriBake',
        category: 'Biscuits & Bakery',
        product_image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=60',
        ingredients_text: 'Whole Wheat Flour (52%), Sugar, Edible Vegetable Oil (Palm Oil), Cocoa Solids (4.5%), Milk Solids, Invert Sugar Syrup, Raising Agents (INS 500(ii), INS 503(ii)), Iodised Salt, Emulsifier (INS 322(i) Soy Lecithin), Natural Caramel Colour (INS 150d).',
        nutrition_data_json: JSON.stringify({
          servingSize: '30g',
          energyKcal: 138,
          proteinG: 2.1,
          carbohydratesG: 20.4,
          sugarG: 7.5,
          addedSugarG: 7.2,
          totalFatG: 5.6,
          saturatedFatG: 2.7,
          transFatG: 0,
          sodiumMg: 110,
          fiberG: 1.8
        })
      },
      {
        barcode: '8902345678901',
        name: 'PureSparkle Lemon Sparkling Water',
        brand: 'AquaVita',
        category: 'Beverages',
        product_image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=60',
        ingredients_text: 'Carbonated Natural Mineral Water, Natural Lemon Extract, Citric Acid (INS 330), Ascorbic Acid (INS 300).',
        nutrition_data_json: JSON.stringify({
          servingSize: '250ml',
          energyKcal: 2,
          proteinG: 0,
          carbohydratesG: 0.5,
          sugarG: 0,
          addedSugarG: 0,
          totalFatG: 0,
          saturatedFatG: 0,
          sodiumMg: 5
        })
      },
      {
        barcode: '8903456789012',
        name: 'QuickSpice Veggie Instant Ramen',
        brand: 'NoodleCraft',
        category: 'Instant Foods',
        product_image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=60',
        ingredients_text: 'Refined Wheat Flour (Maida), Palm Oil, Iodised Salt, Wheat Gluten, Mineral (Calcium Carbonate), Thickeners (INS 508, INS 412), Acidity Regulators (INS 501(i), INS 500(i)). Tastemaker: Mixed Spices (Onion Powder, Red Chilli, Garlic Powder, Coriander), Sugar, Hydrolyzed Groundnut Protein, Flavor Enhancers (INS 627, INS 631).',
        nutrition_data_json: JSON.stringify({
          servingSize: '70g (1 pack)',
          energyKcal: 310,
          proteinG: 6.8,
          carbohydratesG: 44.2,
          sugarG: 2.1,
          addedSugarG: 1.4,
          totalFatG: 12.1,
          saturatedFatG: 5.8,
          sodiumMg: 880,
          fiberG: 2.3
        })
      },
      {
        barcode: '8904567890123',
        name: 'MorningOats Honey Almond Granola',
        brand: 'SunGrown',
        category: 'Breakfast Cereals',
        product_image_url: 'https://images.unsplash.com/photo-1517093708137-77073b648873?w=400&auto=format&fit=crop&q=60',
        ingredients_text: 'Rolled Oats (65%), Raw Honey (12%), Roasted Almonds (10%), Cold Pressed Sunflower Oil, Chia Seeds, Flax Seeds, Cinnamon Powder, Natural Vanilla Extract.',
        nutrition_data_json: JSON.stringify({
          servingSize: '40g',
          energyKcal: 175,
          proteinG: 4.8,
          carbohydratesG: 24.1,
          sugarG: 5.2,
          addedSugarG: 4.8,
          totalFatG: 6.9,
          saturatedFatG: 0.8,
          sodiumMg: 12,
          fiberG: 3.8
        })
      }
    ];

    for (const prod of demoProducts) {
      const [existingProds] = await conn.execute('SELECT id FROM products WHERE barcode = ?', [prod.barcode]);
      let prodId;
      if (existingProds.length > 0) {
        prodId = existingProds[0].id;
      } else {
        const [insertProd] = await conn.execute(
          `INSERT INTO products (barcode, name, brand, category, product_image_url, ingredients_text, nutrition_data_json, source_provider)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'open_food_facts')`,
          [prod.barcode, prod.name, prod.brand, prod.category, prod.product_image_url, prod.ingredients_text, prod.nutrition_data_json]
        );
        prodId = insertProd.insertId;
        console.log(`✅ Seeded product: ${prod.name} (Barcode: ${prod.barcode})`);
      }

      // Check if a demo scan exists for this product
      const [existingScans] = await conn.execute(
        'SELECT id FROM scans WHERE user_id = ? AND product_id = ?',
        [userId, prodId]
      );

      if (existingScans.length === 0) {
        const [insertScan] = await conn.execute(
          `INSERT INTO scans (user_id, product_id, scan_method, confirmed_ingredients_text, extraction_confidence, status)
           VALUES (?, ?, 'barcode', ?, 98.5, 'completed')`,
          [userId, prodId, prod.ingredients_text]
        );
        const scanId = insertScan.insertId;

        // Structured Demonstration Report
        const demoReportJson = {
          schemaVersion: '1.0',
          isDemonstration: true,
          product: {
            name: prod.name,
            brand: prod.brand,
            category: prod.category
          },
          inputQuality: {
            ingredientListConfirmed: true,
            nutritionDataAvailable: true,
            limitations: ['Demonstration educational report based on packaging labels.']
          },
          ingredients: [
            {
              originalText: 'Whole Wheat Flour',
              normalizedName: 'Whole Wheat Flour',
              identificationStatus: 'confirmed',
              category: 'grain_base',
              function: 'Forms the structural carbohydrate and fiber base of the bakery biscuit.',
              benefits: [
                {
                  description: 'Provides dietary fiber, B vitamins, and complex carbohydrates supporting sustained energy release.',
                  evidenceQuality: 'strong'
                }
              ],
              concerns: [
                {
                  description: 'Contains gluten; unsuitable for individuals with celiac disease or wheat allergies.',
                  targetPopulation: 'People with celiac disease or wheat allergies',
                  riskDependency: 'Dose-independent (immunological response)',
                  evidenceQuality: 'strong'
                }
              ],
              rating: 'generally_recognized_as_safe',
              otherUses: [
                {
                  category: 'other_foods',
                  exampleUse: 'Breads, chapati, pastries',
                  notes: 'Standard dietary staple grain'
                }
              ]
            },
            {
              originalText: 'Palm Oil',
              normalizedName: 'Palm Oil',
              identificationStatus: 'confirmed',
              category: 'fat_oil',
              function: 'Provides thermal stability, crumb texture, and shelf-life extension during baking.',
              benefits: [
                {
                  description: 'Contributes dietary fats and fat-soluble vitamins (such as Tocotrienols).',
                  evidenceQuality: 'limited'
                }
              ],
              concerns: [
                {
                  description: 'High in saturated fatty acids (palmitic acid ~50%). High intake of saturated fats is linked to elevated LDL cholesterol.',
                  targetPopulation: 'Individuals monitoring cardiovascular health',
                  riskDependency: 'Dose and frequency dependent',
                  evidenceQuality: 'strong'
                }
              ],
              rating: 'context_dependent',
              otherUses: [
                {
                  category: 'cosmetics',
                  exampleUse: 'Soaps and emollient lotions',
                  notes: 'Rich source of fatty acids for lather and skin conditioning'
                }
              ]
            },
            {
              originalText: 'INS 322(i) Soy Lecithin',
              normalizedName: 'Soy Lecithin (INS 322i)',
              identificationStatus: 'confirmed',
              category: 'emulsifier',
              function: 'Reduces viscosity in chocolate/fat mix, preventing fat bloom and ensuring even ingredient dispersion.',
              benefits: [
                {
                  description: 'Naturally supplies choline, a nutrient supporting cellular membrane integrity.',
                  evidenceQuality: 'limited'
                }
              ],
              concerns: [
                {
                  description: 'Derived from soybean; requires caution for people with severe IgE-mediated soy allergies.',
                  targetPopulation: 'Individuals with soy allergy',
                  riskDependency: 'Exposure-dependent',
                  evidenceQuality: 'strong'
                }
              ],
              rating: 'generally_recognized_as_safe',
              otherUses: [
                {
                  category: 'pharmaceuticals',
                  exampleUse: 'Liposomal drug delivery systems',
                  notes: 'Pharmaceutical grade lecithin used as stabilizer'
                }
              ]
            }
          ],
          allergenWarnings: [
            'Contains Wheat (Gluten)',
            'Contains Milk Solids',
            'Contains Soy (Lecithin)'
          ],
          nutritionSummary: {
            dataAvailable: true,
            observedValues: [
              { nutrient: 'Energy', value: '138 kcal', perServing: '30g' },
              { nutrient: 'Added Sugars', value: '7.2 g', perServing: '30g', context: 'Contributes ~14% of WHO daily recommended added sugar threshold.' },
              { nutrient: 'Saturated Fat', value: '2.7 g', perServing: '30g' },
              { nutrient: 'Sodium', value: '110 mg', perServing: '30g' }
            ],
            limitations: ['Nutrition values taken from packaging declaration; batch variations occur.']
          },
          longTermEvidence: [
            {
              stage: 'single_serving',
              evidenceSummary: 'Moderate glycemic response moderated by whole wheat fiber content.',
              evidenceQuality: 'strong'
            },
            {
              stage: 'repeated_consumption',
              evidenceSummary: 'Regular consumption of baked snacks with added sugars and saturated fats contributes to daily caloric surplus if not balanced within total dietary intake.',
              evidenceQuality: 'strong'
            },
            {
              stage: 'dietary_pattern',
              evidenceSummary: 'Overall cardiovascular and metabolic health is determined by complete dietary patterns, physical activity, and total intake of refined sugars and saturated fats.',
              evidenceQuality: 'strong'
            }
          ],
          diseaseRiskEvidence: [
            {
              condition: 'Type 2 Diabetes',
              summary: 'Diets chronically high in free sugars and ultra-processed baked foods are associated with increased risk of insulin resistance when accompanied by caloric surplus.',
              distinctionNote: 'Observational association with chronic dietary patterns; no single ingredient is proven to independently cause diabetes in isolation.',
              hasNumericProbability: false,
              sources: [
                {
                  title: 'WHO Guideline: Sugars intake for adults and children',
                  organization: 'World Health Organization (WHO)',
                  year: '2015',
                  url: 'https://www.who.int/publications/i/item/9789241549028'
                }
              ]
            }
          ],
          overallAssessment: {
            verdict: 'Consider moderation',
            score: 68,
            scoreMethodologyVersion: '1.0',
            explanation: [
              'Wholesome grain foundation (52% whole wheat) balanced against moderate added sugars (7.2g per 30g serving) and saturated fat from palm oil.',
              'Suitable as an occasional snack within an active balanced diet.',
              'Contains verified wheat, milk, and soy allergens.'
            ]
          },
          sources: [
            {
              title: 'Food Safety and Standards (Food Products Standards and Food Additives) Regulations',
              organization: 'FSSAI',
              year: '2011',
              url: 'https://fssai.gov.in'
            },
            {
              title: 'Guideline: Sugars intake for adults and children',
              organization: 'World Health Organization (WHO)',
              year: '2015',
              url: 'https://www.who.int'
            }
          ],
          disclaimer: 'Educational demonstration report only. ScanBeforeEat does not provide medical diagnosis or replace personalized guidance from registered healthcare professionals.'
        };

        await conn.execute(
          `INSERT INTO reports (scan_id, user_id, schema_version, analysis_provider, model_identifier, prompt_version, scoring_methodology_version, overall_verdict, overall_score, report_json, analysis_status)
           VALUES (?, ?, '1.0', 'demonstration_seed', 'meta/llama-3.3-70b-instruct', '1.0', '1.0', 'Consider moderation', 68, ?, 'completed')`,
          [scanId, userId, JSON.stringify(demoReportJson)]
        );
      }
    }

    console.log('✅ Demonstration seed records inserted successfully.');
  });
}

if (process.argv[1] === import.meta.url || process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(() => {
      console.log('Seed completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
