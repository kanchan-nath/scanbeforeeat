import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "../src/app/dashboard/page";
import { ScanResultCard } from "../src/components/scanner/ScanResultCard";
import { matchProductAgainstUserAllergens } from "../src/lib/allergen-matcher";
import * as api from "../src/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

// Mock AuthContext
let mockUser: any = {
  id: "test_user_1",
  email: "test@example.com",
  displayName: "Tester",
  plan: "free",
  scansLimit: 15,
  scansUsed: 3,
  remainingScans: 12,
  allergens: ["Gluten (Wheat)", "Dairy (Lactose)"],
};

const mockRefreshProfile = vi.fn().mockImplementation(async () => {
  mockUser = { ...mockUser };
});

vi.mock("../src/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    refreshProfile: mockRefreshProfile,
  }),
}));

// Mock API functions
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchScanHistory: vi.fn(),
    fetchUserAllergens: vi.fn(),
    saveUserAllergens: vi.fn(),
    updateUserPlan: vi.fn(),
    addPantryItem: vi.fn(),
  };
});

describe("Dashboard Audits & Allergen Matrix Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      id: "test_user_1",
      email: "test@example.com",
      displayName: "Tester",
      plan: "free",
      scansLimit: 15,
      scansUsed: 3,
      remainingScans: 12,
      allergens: ["Gluten (Wheat)", "Dairy (Lactose)"],
    };
  });

  describe("Allergen Matcher Engine", () => {
    const dummyProduct: api.ProductDetail = {
      barcode: "1234567890123",
      name: "Ultra Wheat Crackers",
      brand: "BioSnack",
      category: "Crackers",
      healthScore: 42,
      novaGroup: 4,
      ingredientsText: "Whole wheat flour, dairy butter, TBHQ preservative, palm oil, salt.",
      additives: [
        {
          name: "TBHQ (E319)",
          functionDesc: "Synthetic preservative preventing rancidity",
          riskLevel: "high",
          clinicalEvidence: "PubMed 12345",
        },
      ],
      allergens: ["Gluten", "Milk"],
      deductions: [{ title: "Synthetic Preservative", points: -25, reason: "TBHQ present" }],
      alternatives: [],
    };

    it("detects matched allergens based on user active profile", () => {
      const result = matchProductAgainstUserAllergens(dummyProduct, [
        "Gluten (Wheat)",
        "Artificial Preservatives (TBHQ/BHA)",
      ]);
      expect(result.hasMatches).toBe(true);
      expect(result.matchedAllergens).toContain("Gluten (Wheat)");
      expect(result.matchedAllergens).toContain("Artificial Preservatives (TBHQ/BHA)");
    });

    it("returns clean when product does not contain user allergens", () => {
      const cleanProduct: api.ProductDetail = {
        barcode: "9999999999999",
        name: "Pure Spring Water",
        brand: "Aqua",
        category: "Beverages",
        healthScore: 100,
        novaGroup: 1,
        ingredientsText: "Pure natural spring water",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      };

      const result = matchProductAgainstUserAllergens(cleanProduct, ["Tree Nuts & Peanuts", "Soy & Soy Lecithin"]);
      expect(result.hasMatches).toBe(false);
      expect(result.matchedAllergens).toHaveLength(0);
    });
  });

  describe("ScanResultCard Sensitivity Alert Cockpit", () => {
    it("renders Personal Allergen Matrix Alert when scanned product triggers guard", () => {
      const productWithGluten: api.ProductDetail = {
        barcode: "1112223334445",
        name: "Artisan Sourdough Loaf",
        brand: "Bakery",
        category: "Bread",
        healthScore: 78,
        novaGroup: 3,
        ingredientsText: "Enriched wheat flour, water, yeast, salt.",
        additives: [],
        allergens: ["Wheat", "Gluten"],
        deductions: [],
        alternatives: [],
      };

      render(<ScanResultCard product={productWithGluten} onScanAnother={vi.fn()} />);

      expect(screen.getByText("Personal Allergen Matrix Alert")).toBeDefined();
      expect(screen.getByText(/Detected ingredients matching your personalized health sensitivity guards/i)).toBeDefined();
    });

    it("renders Clean reassurance badge when no sensitivity guards match", () => {
      mockUser.allergens = ["Tree Nuts & Peanuts"];
      const nutFreeProduct: api.ProductDetail = {
        barcode: "5556667778889",
        name: "Organic Apple Slices",
        brand: "FarmFresh",
        category: "Fruits",
        healthScore: 98,
        novaGroup: 1,
        ingredientsText: "100% Organic Fresh Apples",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      };

      render(<ScanResultCard product={nutFreeProduct} onScanAnother={vi.fn()} />);

      expect(screen.getByText(/Personal Matrix Guard: Clean/i)).toBeDefined();
    });
  });

  describe("DashboardPage Audits & Allergen Matrix Persistence", () => {
    it("displays Recent Food Audits history retrieved from database", async () => {
      const mockHistory = [
        {
          id: "scn_1",
          userId: "test_user_1",
          barcode: "8901030000000",
          productName: "Oreo Original Sandwich Cookies",
          brand: "Mondelez",
          healthScore: 32,
          novaGroup: 4,
          scannedAt: "2026-11-24 10:00:00",
        },
        {
          id: "scn_2",
          userId: "test_user_1",
          barcode: "8902040000000",
          productName: "Whole Rolled Oats",
          brand: "Quaker",
          healthScore: 94,
          novaGroup: 1,
          scannedAt: "2026-11-24 09:30:00",
        },
      ];

      vi.mocked(api.fetchScanHistory).mockResolvedValueOnce(mockHistory);
      vi.mocked(api.fetchUserAllergens).mockResolvedValueOnce(["Gluten (Wheat)"]);

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Oreo Original Sandwich Cookies")).toBeDefined();
        expect(screen.getByText("Whole Rolled Oats")).toBeDefined();
        expect(screen.getByText("NOVA 4")).toBeDefined();
        expect(screen.getByText("NOVA 1")).toBeDefined();
      });
    });

    it("allows toggling and saving allergen matrix to cloud database and updates state", async () => {
      vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([]);
      vi.mocked(api.fetchUserAllergens).mockResolvedValueOnce(["Gluten (Wheat)"]);
      vi.mocked(api.saveUserAllergens).mockResolvedValueOnce({ success: true, allergens: ["Gluten (Wheat)"] });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText("Custom Allergen & Sensitivity Matrix")).toBeDefined();
      });

      const saveBtn = screen.getByRole("button", { name: /Save Preferences/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(api.saveUserAllergens).toHaveBeenCalled();
        expect(mockRefreshProfile).toHaveBeenCalled();
      });
    });
  });
});
