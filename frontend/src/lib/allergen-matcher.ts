import { ProductDetail } from "./api";

export interface AllergenMatchResult {
  hasMatches: boolean;
  matchedAllergens: string[];
  matchDetails: Array<{
    allergen: string;
    detectedIn: string;
  }>;
}

interface AllergenRule {
  ids: string[];
  keywords: string[];
  label: string;
}

const ALLERGEN_RULES: AllergenRule[] = [
  {
    ids: ["gluten", "gluten (wheat)", "wheat"],
    keywords: ["gluten", "wheat", "barley", "rye", "spelt", "semolina", "oats", "malt"],
    label: "Gluten (Wheat)",
  },
  {
    ids: ["dairy", "dairy (lactose)", "lactose", "milk"],
    keywords: ["milk", "dairy", "lactose", "whey", "casein", "caseinate", "butter", "cheese", "cream", "yogurt", "ghee"],
    label: "Dairy (Lactose)",
  },
  {
    ids: ["peanuts", "tree nuts & peanuts", "nuts", "peanuts & tree nuts"],
    keywords: ["peanut", "almond", "walnut", "cashew", "pistachio", "hazelnut", "pecan", "macadamia", "brazil nut", "tree nut"],
    label: "Tree Nuts & Peanuts",
  },
  {
    ids: ["soy", "soy & soy lecithin", "soy & soy lecithin (gmo fractionated)"],
    keywords: ["soy", "soya", "soybean", "soy lecithin", "e322"],
    label: "Soy & Soy Lecithin",
  },
  {
    ids: ["azo_dyes", "synthetic azo dyes (e102/e110/e129)", "synthetic azo dyes (e102, e110, e129)"],
    keywords: [
      "e102", "e110", "e129", "tartrazine", "sunset yellow", "allura red",
      "red 40", "yellow 5", "yellow 6", "azo dye", "synthetic dye", "artificial color",
    ],
    label: "Synthetic Azo Dyes (E102/E110/E129)",
  },
  {
    ids: ["preservatives", "artificial preservatives (tbhq/bha)", "synthetic preservatives (tbhq, bha, bht)"],
    keywords: [
      "tbhq", "bha", "bht", "e319", "e320", "e321", "butylated", "sodium benzoate",
      "potassium sorbate", "e211", "e202", "preservative",
    ],
    label: "Artificial Preservatives (TBHQ/BHA)",
  },
  {
    ids: ["seed_oils", "refined palm oil & seed oils", "refined canola, soy & industrial palm oil"],
    keywords: [
      "palm oil", "palm fat", "palmolein", "canola oil", "soybean oil", "corn oil",
      "sunflower oil", "cottonseed oil", "seed oil", "vegetable oil",
    ],
    label: "Refined Palm Oil & Seed Oils",
  },
  {
    ids: ["shellfish", "crustacean shellfish & mollusks"],
    keywords: ["shellfish", "shrimp", "crab", "lobster", "prawn", "oyster", "clam", "mussel", "squid"],
    label: "Crustacean Shellfish & Mollusks",
  },
  {
    ids: ["eggs", "egg albumin & egg lysozyme"],
    keywords: ["egg", "albumin", "lysozyme", "ovalbumin"],
    label: "Egg Albumin & Egg Lysozyme",
  },
  {
    ids: ["sesame", "sesame seeds & tahini"],
    keywords: ["sesame", "tahini", "sesamum"],
    label: "Sesame Seeds & Tahini",
  },
  {
    ids: ["sulfites", "sulfur dioxide & sulfites (>10ppm)"],
    keywords: ["sulfite", "sulphite", "sulfur dioxide", "e220", "e221", "e222", "e223", "e224", "e228"],
    label: "Sulfur Dioxide & Sulfites",
  },
  {
    ids: ["msg", "monosodium glutamate & hydrolyzed protein"],
    keywords: ["monosodium glutamate", "msg", "e621", "hydrolyzed vegetable protein", "autolyzed yeast", "yeast extract"],
    label: "Monosodium Glutamate & Hydrolyzed Protein",
  },
];

export function matchProductAgainstUserAllergens(
  product: ProductDetail,
  userAllergens: string[] = []
): AllergenMatchResult {
  if (!userAllergens || userAllergens.length === 0) {
    return { hasMatches: false, matchedAllergens: [], matchDetails: [] };
  }

  const matchedSet = new Set<string>();
  const matchDetails: Array<{ allergen: string; detectedIn: string }> = [];

  // Combine product text sources
  const productAllergensText = (product.allergens || []).join(" ").toLowerCase();
  const ingredientsText = (product.ingredientsText || "").toLowerCase();
  const additivesText = (product.additives || [])
    .map((a) => `${a.name} ${a.functionDesc || ""}`)
    .join(" ")
    .toLowerCase();
  const deductionsText = (product.deductions || [])
    .map((d) => `${d.title} ${d.reason || ""}`)
    .join(" ")
    .toLowerCase();

  const fullCorpus = `${productAllergensText} ${ingredientsText} ${additivesText} ${deductionsText}`;

  for (const userItem of userAllergens) {
    const rawClean = userItem.toLowerCase().trim();
    if (!rawClean) continue;

    // Check predefined rules
    const matchedRule = ALLERGEN_RULES.find((rule) =>
      rule.ids.some((id) => rawClean === id || rawClean.includes(id) || id.includes(rawClean))
    );

    if (matchedRule) {
      // Test keywords against full corpus
      for (const kw of matchedRule.keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
        if (regex.test(fullCorpus)) {
          if (!matchedSet.has(matchedRule.label)) {
            matchedSet.add(matchedRule.label);
            matchDetails.push({
              allergen: matchedRule.label,
              detectedIn: `Triggered by keyword "${kw}" detected in product monograph`,
            });
          }
          break;
        }
      }
    } else {
      // Custom user entry: test directly against corpus
      const regex = new RegExp(`\\b${rawClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (regex.test(fullCorpus)) {
        if (!matchedSet.has(userItem)) {
          matchedSet.add(userItem);
          matchDetails.push({
            allergen: userItem,
            detectedIn: `Triggered by custom sensitivity match "${userItem}"`,
          });
        }
      }
    }
  }

  return {
    hasMatches: matchedSet.size > 0,
    matchedAllergens: Array.from(matchedSet),
    matchDetails,
  };
}
