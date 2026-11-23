import { db } from "../db.js";
import { analyzeIngredientsTextWithAI } from "./ai.js";

export interface CleanProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  healthScore: number;
  novaGroup: number;
  ingredientsText: string;
  additives: Array<{
    name: string;
    functionDesc: string;
    riskLevel: "low" | "moderate" | "high";
    clinicalEvidence: string;
  }>;
  allergens: string[];
  deductions: Array<{
    title: string;
    points: number;
    reason: string;
  }>;
  alternatives: Array<{
    name: string;
    score: number;
    nova: number;
    note: string;
  }>;
}

const USER_AGENT = process.env.OPEN_FOOD_FACTS_USER_AGENT || "ScanBeforeEat - Web - 1.0 - admin@scanbeforeeat.com";

export async function fetchFromOpenFoodFacts(barcode: string): Promise<CleanProduct | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.status !== 1 || !json.product) return null;

    const p = json.product;
    const name = p.product_name || p.product_name_en || p.generic_name || "Audited Food Product";
    const brand = p.brands || p.brand_owner || "Packaged Grocery";
    const category = p.categories?.split(",")?.[0]?.trim() || "General Packaged Food";
    const ingredientsText = p.ingredients_text || p.ingredients_text_en || (name ? `${name} by ${brand}. Category: ${category}` : "Label ingredients unavailable.");

    // Run AI Model Toxicology Analysis (NVIDIA NIM or smart toxicology engine)
    const aiAnalysis = await analyzeIngredientsTextWithAI(ingredientsText, `${name} (${brand})`);

    // Harmonize additives detected by AI with explicit Open Food Facts tags
    const combinedAdditives = [...aiAnalysis.additives];
    const additivesTags: string[] = p.additives_tags || [];
    for (const tag of additivesTags) {
      const code = tag.replace(/^en:/, "").toUpperCase();
      if (!combinedAdditives.some((a) => a.name.toUpperCase().includes(code))) {
        let riskLevel: "low" | "moderate" | "high" = "moderate";
        let clinicalEvidence = "Recognized European Food Safety Authority (EFSA) food additive.";

        if (["E102", "E110", "E129", "E171", "E250", "E319", "E320"].includes(code)) {
          riskLevel = "high";
          clinicalEvidence = "Classified as high-precautionary additive under European regulations.";
        } else if (["E300", "E330", "E410", "E412"].includes(code)) {
          riskLevel = "low";
          clinicalEvidence = "Natural-origin antioxidant or dietary fiber gum.";
        }

        combinedAdditives.push({
          name: `${code} (${tag.replace(/^en:/, "")})`,
          functionDesc: "Food Technology Functional Additive",
          riskLevel,
          clinicalEvidence,
        });
      }
    }

    // Harmonize Allergens
    const allergens = [...aiAnalysis.allergens];
    const allergensTags: string[] = p.allergens_tags || [];
    for (const tag of allergensTags) {
      const cleanAllergen = tag.replace(/^en:/, "").replace(/-/g, " ");
      const capitalized = cleanAllergen.charAt(0).toUpperCase() + cleanAllergen.slice(1);
      if (!allergens.some((a) => a.toLowerCase() === cleanAllergen.toLowerCase()) && cleanAllergen !== "none") {
        if (allergens.length === 1 && allergens[0] === "None declared") {
          allergens.length = 0;
        }
        allergens.push(capitalized);
      }
    }

    const novaGroup = Number(p.nova_group) || aiAnalysis.novaGroup || 3;
    const healthScore = Math.max(0, Math.min(100, aiAnalysis.healthScore));

    const cleanProduct: CleanProduct = {
      barcode,
      name,
      brand,
      category,
      healthScore: Math.round(healthScore),
      novaGroup,
      ingredientsText,
      additives: combinedAdditives,
      allergens: allergens.length > 0 ? allergens : ["None declared"],
      deductions: aiAnalysis.deductions.length > 0 ? aiAnalysis.deductions : [
        { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
      ],
      alternatives: aiAnalysis.alternatives,
    };

    // Cache in SQLite products table for subsequent requests
    try {
      db.prepare(`
        INSERT OR REPLACE INTO products (
          barcode, name, brand, category, healthScore, novaGroup, ingredientsText, additivesJson, allergensJson, deductionsJson, alternativesJson
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        barcode,
        name,
        brand,
        category,
        Math.round(healthScore),
        novaGroup,
        ingredientsText,
        JSON.stringify(combinedAdditives),
        JSON.stringify(cleanProduct.allergens),
        JSON.stringify(cleanProduct.deductions),
        JSON.stringify(cleanProduct.alternatives)
      );
    } catch {}

    return cleanProduct;
  } catch {
    return null;
  }
}
