import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PantryPage from "../src/app/pantry/page";
import * as api from "../src/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/pantry",
}));

// Mock AuthContext
vi.mock("../src/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test_pantry_user", email: "pantry@test.com", plan: "monthly_pro" },
    refreshProfile: vi.fn(),
  }),
}));

// Mock API functions
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchPantryItems: vi.fn(),
    addPantryItem: vi.fn(),
    deletePantryItem: vi.fn(),
  };
});

describe("Digital Pantry Dynamic Database Persistence Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays user pantry items dynamically without hardcoded values", async () => {
    const mockPantryItems: api.PantryItem[] = [
      {
        id: "p_101",
        userId: "test_pantry_user",
        productName: "Organic Extra Virgin Olive Oil",
        category: "Oils & Vinegars",
        novaGroup: 2,
        healthScore: 92,
        expiryDate: "2027-12-31",
        quantity: 2,
        addedAt: "2026-11-24T10:00:00Z",
      },
      {
        id: "p_102",
        userId: "test_pantry_user",
        productName: "Ultra Cocoa Cereal",
        category: "Breakfast Cereals",
        novaGroup: 4,
        healthScore: 40,
        expiryDate: "2027-04-15",
        quantity: 1,
        addedAt: "2026-11-24T11:00:00Z",
      },
    ];

    vi.mocked(api.fetchPantryItems).mockResolvedValueOnce(mockPantryItems);

    render(<PantryPage />);

    await waitFor(() => {
      expect(screen.getByText("Organic Extra Virgin Olive Oil")).toBeDefined();
      expect(screen.getByText("Ultra Cocoa Cereal")).toBeDefined();
      expect(screen.getAllByText(/NOVA 2/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/NOVA 4/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("2 Items")).toBeDefined();
    });
  });

  it("adds new custom pantry item and persists to database", async () => {
    vi.mocked(api.fetchPantryItems).mockResolvedValueOnce([]);
    vi.mocked(api.addPantryItem).mockResolvedValueOnce({
      id: "p_103",
      userId: "test_pantry_user",
      productName: "Raw Wildflower Honey",
      category: "Sweeteners",
      novaGroup: 1,
      healthScore: 88,
      expiryDate: "2028-01-01",
      quantity: 1,
      addedAt: "2026-11-24T12:00:00Z",
    });

    render(<PantryPage />);

    // Open Add Modal
    const addBtn = screen.getByRole("button", { name: /Add Pantry Item/i });
    fireEvent.click(addBtn);

    const inputName = screen.getByPlaceholderText(/e\.g\. Organic Extra Virgin Olive Oil/i);
    fireEvent.change(inputName, { target: { value: "Raw Wildflower Honey" } });

    const submitBtn = screen.getByRole("button", { name: /Save to Pantry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.addPantryItem).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "test_pantry_user",
          productName: "Raw Wildflower Honey",
        })
      );
      expect(screen.getByText("Raw Wildflower Honey")).toBeDefined();
    });
  });
});
