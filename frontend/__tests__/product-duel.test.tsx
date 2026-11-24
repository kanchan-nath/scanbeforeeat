import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DuelPage from "../src/app/duel/page";
import * as api from "../src/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/duel",
  useSearchParams: () => ({
    get: (param: string) => (param === "p1" ? "111" : param === "p2" ? "222" : null),
  }),
}));

// Mock AuthContext
vi.mock("../src/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test_duel_user", plan: "monthly_pro" },
    refreshProfile: vi.fn(),
  }),
}));

// Mock API functions
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchScanHistory: vi.fn(),
    fetchPantryItems: vi.fn(),
    performDuel: vi.fn(),
  };
});

describe("Side-by-Side Product Duel Dynamic Engine Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads user scan history dynamically and runs duel between two products", async () => {
    vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([
      {
        barcode: "111",
        productName: "Organic Granola",
        brand: "BioFarm",
        healthScore: 88,
        novaGroup: 1,
      },
    ]);
    vi.mocked(api.fetchPantryItems).mockResolvedValueOnce([
      {
        id: "p_222",
        userId: "test_duel_user",
        productName: "Sugar Coated Puffs",
        category: "Cereals",
        novaGroup: 4,
        healthScore: 32,
        expiryDate: "2027-01-01",
        quantity: 1,
        addedAt: "2026-11-24",
      },
    ]);

    vi.mocked(api.performDuel).mockResolvedValueOnce({
      product1: {
        barcode: "111",
        name: "Organic Granola",
        brand: "BioFarm",
        category: "Cereals",
        healthScore: 88,
        novaGroup: 1,
        ingredientsText: "Whole oats",
        additives: [],
        allergens: ["Gluten"],
        deductions: [],
        alternatives: [],
      },
      product2: {
        barcode: "222",
        name: "Sugar Coated Puffs",
        brand: "SweetCo",
        category: "Cereals",
        healthScore: 32,
        novaGroup: 4,
        ingredientsText: "Sugar, refined flour, dye",
        additives: [{ name: "Red 40", functionDesc: "Dye", riskLevel: "high", clinicalEvidence: "" }],
        allergens: ["Wheat"],
        deductions: [],
        alternatives: [],
      },
      scoreDelta: 56,
      winner: "product1",
      verdict: "Organic Granola demonstrates a substantially superior nutritional and clean-label profile.",
    });

    render(<DuelPage />);

    await waitFor(() => {
      expect(api.performDuel).toHaveBeenCalledWith("111", "222");
      expect(screen.getByText("Organic Granola")).toBeDefined();
      expect(screen.getByText("Sugar Coated Puffs")).toBeDefined();
      expect(screen.getByText(/Delta Verdict: \+56 Point Difference/i)).toBeDefined();
      expect(screen.getByText(/WINNER \(Superior Profile\)/i)).toBeDefined();
    });
  });

  it("allows entering custom barcodes and recalculates duel", async () => {
    vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([]);
    vi.mocked(api.fetchPantryItems).mockResolvedValueOnce([]);
    vi.mocked(api.performDuel).mockResolvedValue({
      product1: {
        barcode: "555",
        name: "Food 555",
        brand: "B1",
        category: "C1",
        healthScore: 90,
        novaGroup: 1,
        ingredientsText: "",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      },
      product2: {
        barcode: "666",
        name: "Food 666",
        brand: "B2",
        category: "C2",
        healthScore: 50,
        novaGroup: 3,
        ingredientsText: "",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      },
      scoreDelta: 40,
      winner: "product1",
      verdict: "Food 555 is safer.",
    });

    render(<DuelPage />);

    const input1 = screen.getByPlaceholderText(/Enter barcode for Item 1/i);
    const input2 = screen.getByPlaceholderText(/Enter barcode for Item 2/i);
    fireEvent.change(input1, { target: { value: "555" } });
    fireEvent.change(input2, { target: { value: "666" } });

    await waitFor(() => {
      expect(api.performDuel).toHaveBeenCalledWith("555", "666");
      expect(screen.getByText("Food 555")).toBeDefined();
      expect(screen.getByText("Food 666")).toBeDefined();
    });
  });
});
