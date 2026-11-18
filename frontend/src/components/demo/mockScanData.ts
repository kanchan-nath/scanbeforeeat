import { ScanResult } from "@/lib/types";

export interface DemoProduct extends ScanResult {
  id: string;
  shortName: string;
  brand: string;
  deductions: {
    category: string;
    points: number;
    reason: string;
  }[];
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "maggi",
    shortName: "Maggi Noodles",
    productName: "Maggi 2-Minute Masala Instant Noodles (70g)",
    brand: "Nestlé",
    manufacturer: "Nestlé India Ltd.",
    category: "Packaged Instant Meals",
    barcode: "8901058852331",
    healthScore: 38,
    novaGroup: 4,
    allergens: ["Gluten (Wheat)", "Soy", "Trace Dairy"],
    deductions: [
      { category: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
      { category: "Ultra-Processing Formulation", points: -30, reason: "Industrial extrusion, artificial hydrolyzates" },
      { category: "Flagged High-Risk Additives", points: -18, reason: "MSG (E621), Tartrazine (E102), TBHQ (E319)" },
      { category: "Excess Sodium Concentration", points: -14, reason: "890mg sodium (44% Daily Recommended Allowance)" },
    ],
    ingredients: [
      {
        name: "MSG (Monosodium Glutamate E621)",
        function: "Flavor Enhancer",
        riskLevel: "moderate",
        evidence: "PubMed: 124 peer-reviewed excitotoxin & headache studies",
      },
      {
        name: "Tartrazine (Synthetic Yellow 5 / E102)",
        function: "Artificial Color",
        riskLevel: "high",
        evidence: "EFSA Mandatory Warning: May impair child activity & attention",
      },
      {
        name: "TBHQ (Tertiary Butylhydroquinone / E319)",
        function: "Synthetic Preservative",
        riskLevel: "high",
        evidence: "Toxicological cellular bounds flagged in animal models",
      },
      {
        name: "Palm Oil (Refined Fractionated)",
        function: "Processed Frying Fat",
        riskLevel: "moderate",
        evidence: "High saturated palmitic fatty acid profile (49%)",
      },
      {
        name: "Sodium Chloride (890mg)",
        function: "Mineral Seasoning",
        riskLevel: "moderate",
        evidence: "44% daily maximum allowance in single 70g serving",
      },
      {
        name: "Wheat Flour (Refined Maida)",
        function: "Refined Starch Matrix",
        riskLevel: "low",
        evidence: "High glycemic refined carbohydrate base",
      },
    ],
  },
  {
    id: "popcorn",
    shortName: "Organic Popcorn",
    productName: "LesserEvil Organic Himalayan Pink Salt Popcorn",
    brand: "LesserEvil",
    manufacturer: "LesserEvil Healthy Brands",
    category: "Whole Grain Snacks",
    barcode: "855422002341",
    healthScore: 86,
    novaGroup: 1,
    allergens: ["None declared"],
    deductions: [
      { category: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
      { category: "Processing Tier", points: -10, reason: "Minimal heat air-popping" },
      { category: "Healthy Fat & Salt", points: -4, reason: "Organic extra virgin coconut oil & pink salt" },
    ],
    ingredients: [
      {
        name: "Organic Non-GMO Popped Corn",
        function: "Whole Grain Fiber Base",
        riskLevel: "low",
        evidence: "100% whole grain with 4g dietary fiber per serving",
      },
      {
        name: "Organic Extra Virgin Coconut Oil",
        function: "Cold-Pressed Healthy Fat",
        riskLevel: "low",
        evidence: "Unrefined medium-chain triglyceride profile",
      },
      {
        name: "Himalayan Pink Rock Salt",
        function: "Natural Mineral Seasoning",
        riskLevel: "low",
        evidence: "Unrefined rock salt without synthetic anti-caking agents",
      },
    ],
  },
  {
    id: "oatmilk",
    shortName: "Oat Milk Barista",
    productName: "Oatly Barista Edition Oat Milk (1L)",
    brand: "Oatly",
    manufacturer: "Oatly AB",
    category: "Plant-Based Dairy",
    barcode: "7394376616037",
    healthScore: 72,
    novaGroup: 2,
    allergens: ["Gluten-Free Oats"],
    deductions: [
      { category: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
      { category: "Enzymatic Liquefaction", points: -18, reason: "Starch converted into maltose sugars" },
      { category: "Acidity Regulator", points: -10, reason: "Dipotassium phosphate added for coffee stability" },
    ],
    ingredients: [
      {
        name: "Oat Base (Water, Oats 10%)",
        function: "Whole Grain Liquid Base",
        riskLevel: "low",
        evidence: "Natural beta-glucan soluble fiber source",
      },
      {
        name: "Rapeseed Oil (Low Erucic Acid)",
        function: "Emulsifying Fat",
        riskLevel: "low",
        evidence: "Omega-3 & Omega-9 balanced vegetable oil",
      },
      {
        name: "Dipotassium Phosphate (E340)",
        function: "Acidity Regulator",
        riskLevel: "moderate",
        evidence: "Inorganic phosphate additive (check in renal conditions)",
      },
      {
        name: "Calcium Carbonate & Vitamins (D2, B12)",
        function: "Nutritional Fortification",
        riskLevel: "low",
        evidence: "Standard micronutrient fortification",
      },
    ],
  },
];
