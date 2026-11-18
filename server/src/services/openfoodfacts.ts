import { db } from "../db.js";

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
    const novaGroup = Number(p.nova_group) || (p.ingredients_text?.includes("oil") ? 3 : 2);
    const ingredientsText = p.ingredients_text || p.ingredients_text_en || "Label ingredients unavailable.";

    // Health score: calculate from Nutri-Score or NOVA baseline
    let healthScore = 75;
    if (p.nutriscore_score !== undefined && typeof p.nutriscore_score === "number") {
      healthScore = Math.max(15, Math.min(95, 100 - p.nutriscore_score * 2.5));
    } else if (novaGroup === 4) {
      healthScore = 38;
    } else if (novaGroup === 3) {
      healthScore = 65;
    } else if (novaGroup === 1) {
      healthScore = 88;
    }

    // Extract additives tags
    const additivesTags: string[] = p.additives_tags || [];
    const additives = additivesTags.map((tag: string) => {
      const code = tag.replace(/^en:/, "").toUpperCase();
      let riskLevel: "low" | "moderate" | "high" = "moderate";
      let clinicalEvidence = "Recognized European Food Safety Authority (EFSA) food additive.";

      if (["E102", "E110", "E129", "E171", "E250", "E319", "E320"].includes(code)) {
        riskLevel = "high";
        clinicalEvidence = "Classified as high-precautionary additive under European regulations.";
      } else if (["E300", "E330", "E410", "E412"].includes(code)) {
        riskLevel = "low";
        clinicalEvidence = "Natural-origin antioxidant or dietary fiber gum.";
      }

      return {
        name: `${code} (${tag.replace(/^en:/, "")})`,
        functionDesc: "Food Technology Functional Additive",
        riskLevel,
        clinicalEvidence,
      };
    });

    // Extract allergens
    const allergensTags: string[] = p.allergens_tags || [];
    const allergens = allergensTags.length > 0
      ? allergensTags.map((a: string) => a.replace(/^en:/, "").replace(/-/g, " "))
      : ["None declared"];

    // Deductions
    const deductions = [
      { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
    ];
    if (novaGroup === 4) {
      deductions.push({ title: "Ultra-Processing Formulation", points: -30, reason: "Industrial formulation with high NOVA group 4 markers" });
    }
    if (additives.some((a) => a.riskLevel === "high")) {
      deductions.push({ title: "Flagged High-Risk Additives", points: -20, reason: "Contains synthetic petroleum azo dyes or artificial preservatives" });
    }

    const alternatives = [
      { name: "LesserEvil Organic Himalayan Popcorn", score: 86, nova: 1, note: "Zero synthetic additives • Whole grain" },
      { name: "Koyo Organic Garlic Pepper Ramen", score: 74, nova: 2, note: "Baked not fried • Zero MSG / TBHQ" },
    ];

    const cleanProduct: CleanProduct = {
      barcode,
      name,
      brand,
      category,
      healthScore: Math.round(healthScore),
      novaGroup,
      ingredientsText,
      additives,
      allergens,
      deductions,
      alternatives,
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
        JSON.stringify(additives),
        JSON.stringify(allergens),
        JSON.stringify(deductions),
        JSON.stringify(alternatives)
      );
    } catch {}

    return cleanProduct;
  } catch {
    return null;
  }
}
