import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  analyzeIngredientsTextWithAI,
  analyzeFoodImageWithAI,
  getAiServiceStatus,
} from "../src/services/ai.js";

describe("AI Scanner & Toxicology Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should report service status and fallback readiness", () => {
    const status = getAiServiceStatus();
    expect(status).toHaveProperty("nvidiaConfigured");
    expect(status).toHaveProperty("model");
    expect(status.fallbackReady).toBe(true);
  });

  it("should extract additives, allergens, and NOVA 4 for ultra-processed noodles text", async () => {
    const ingredientText =
      "Wheat flour, Palm oil, Salt, Flavor enhancer (E621 Monosodium glutamate), Tartrazine (E102), Acidity regulator (E330), TBHQ (E319)";
    const result = await analyzeIngredientsTextWithAI(ingredientText, "Instant Spicy Noodles");

    expect(result).toBeDefined();
    expect(result.name).toBe("Instant Spicy Noodles");
    expect(result.novaGroup).toBe(4);
    expect(result.healthScore).toBeLessThan(60);

    // Additives check
    const additiveNames = result.additives.map((a) => a.name.toLowerCase());
    expect(additiveNames.some((n) => n.includes("e621") || n.includes("glutamate"))).toBe(true);
    expect(additiveNames.some((n) => n.includes("e102") || n.includes("tartrazine"))).toBe(true);
    expect(additiveNames.some((n) => n.includes("e319") || n.includes("tbhq"))).toBe(true);

    // Allergens check
    expect(result.allergens.some((a) => a.toLowerCase().includes("gluten") || a.toLowerCase().includes("wheat"))).toBe(true);

    // Deductions check
    expect(result.deductions.length).toBeGreaterThan(1);
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it("should classify clean single-ingredient foods as NOVA 1 with high health score", async () => {
    const cleanText = "100% Organic Rolled Oats. Ingredients: Organic Whole Grain Rolled Oats.";
    const result = await analyzeIngredientsTextWithAI(cleanText, "Organic Rolled Oats");

    expect(result.novaGroup).toBe(1);
    expect(result.healthScore).toBeGreaterThanOrEqual(85);
    expect(result.additives.length).toBe(0);
  });

  it("should detect allergens accurately for dairy and nuts", async () => {
    const dairyNutText = "Pasteurized Milk, Cream, Sugar, Chopped Almonds, Cashew butter, Whey protein isolate.";
    const result = await analyzeIngredientsTextWithAI(dairyNutText);

    const allergenList = result.allergens.map((a) => a.toLowerCase());
    expect(allergenList.some((a) => a.includes("dairy") || a.includes("milk"))).toBe(true);
    expect(allergenList.some((a) => a.includes("nut") || a.includes("almond"))).toBe(true);
  });

  it("should reject non-food input text with a friendly error indicator", async () => {
    const nonFoodText = "Ergonomic Mechanical Keyboard with RGB Backlight and USB-C Cable.";
    const result = await analyzeIngredientsTextWithAI(nonFoodText);

    expect(result.isFoodProduct).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should process image input using fallback when NVIDIA key is absent", async () => {
    // Valid 1x1 base64 png
    const dummyBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await analyzeFoodImageWithAI(dummyBase64);

    expect(result).toBeDefined();
    expect(result.barcode).toBeDefined();
    expect(result.healthScore).toBeGreaterThan(0);
  });

  it("should use NVIDIA NIM API when NVIDIA_API_KEY is present", async () => {
    const originalKey = process.env.NVIDIA_API_KEY;
    try {
      process.env.NVIDIA_API_KEY = "test_nvapi_mock_key";

      const mockNvidiaResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                isFoodProduct: true,
                name: "AI Verified Superfood Bar",
                brand: "NatureBio",
                category: "Healthy Snacks",
                healthScore: 82,
                novaGroup: 1,
                ingredientsText: "Organic Chia Seeds, Organic Raw Dates, Organic Almonds",
                additives: [],
                allergens: ["Tree Nuts (Almond)"],
                deductions: [{ title: "Clean Whole Food", points: 82, reason: "Zero chemical preservatives" }],
                alternatives: [{ name: "Raw Walnut Bites", score: 85, nova: 1, note: "Unprocessed organic nuts" }],
              }),
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockNvidiaResponse,
      } as any);

      const result = await analyzeIngredientsTextWithAI(
        "Organic Chia Seeds, Organic Raw Dates, Organic Almonds",
        "Superfood Bar"
      );

      expect(result.name).toBe("AI Verified Superfood Bar");
      expect(result.healthScore).toBe(82);
      expect(result.novaGroup).toBe(1);
    } finally {
      process.env.NVIDIA_API_KEY = originalKey;
    }
  });
});
