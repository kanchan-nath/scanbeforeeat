import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AlternativesPage from "../src/app/alternatives/page";
import ShoppingListPage from "../src/app/shopping-list/page";
import * as api from "../src/lib/api";

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test_user_sync_123", email: "test@example.com", plan: "free" },
    loading: false,
  }),
}));

vi.mock("@/components/AuthenticatedShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Clean Alternatives & Shopping List Dynamic Sync Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AlternativesPage renders empty state when user has no scan history (no hardcoded items)", async () => {
    vi.spyOn(api, "fetchUserAlternatives").mockResolvedValueOnce([]);
    vi.spyOn(api, "fetchShoppingItems").mockResolvedValueOnce([]);

    render(<AlternativesPage />);

    expect(screen.getByText(/Synthesizing clean-label alternatives/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No Ultra-Processed Food Scans Yet/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Clean alternatives are dynamically personalized based on the packaged foods you scan/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Live Scanner/i)).toBeInTheDocument();
  });

  it("AlternativesPage renders dynamic AI clean alternatives and syncs Add to Shopping List button", async () => {
    const mockAlternatives: api.AlternativePair[] = [
      {
        id: "alt_maggi_0",
        category: "Instant Prepared Meals",
        upfItem: {
          barcode: "8901058017687",
          name: "Maggi 2-Minute Masala Instant Noodles",
          score: 38,
          nova: 4,
          flaws: ["TBHQ (E319)", "Refined Palm Oil"],
        },
        cleanAlternative: {
          name: "Koyo Organic Garlic Pepper Ramen",
          score: 84,
          nova: 1,
          highlights: ["Baked not fried", "Zero synthetic additives"],
          ingredientCount: 5,
        },
      },
    ];

    // Shopping list already contains a different item
    const mockShoppingItems: api.ShoppingItem[] = [
      {
        id: "s1",
        userId: "test_user_sync_123",
        productName: "Organic Rolled Oats",
        category: "Clean Produce",
        checked: 0,
        addedAt: "2026-11-24T10:00:00Z",
      },
    ];

    vi.spyOn(api, "fetchUserAlternatives").mockResolvedValueOnce(mockAlternatives);
    vi.spyOn(api, "fetchShoppingItems").mockResolvedValueOnce(mockShoppingItems);

    const addSpy = vi.spyOn(api, "addShoppingItem").mockResolvedValueOnce({
      id: "s_new_1",
      userId: "test_user_sync_123",
      productName: "Koyo Organic Garlic Pepper Ramen",
      category: "Instant Prepared Meals",
      checked: 0,
      addedAt: "2026-11-24T11:00:00Z",
    });

    render(<AlternativesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Maggi 2-Minute Masala Instant Noodles/i)).toBeInTheDocument();
      expect(screen.getByText(/Koyo Organic Garlic Pepper Ramen/i)).toBeInTheDocument();
    });

    // Check button is "Add to Shopping List"
    const addBtn = screen.getByRole("button", { name: /Add to Shopping List/i });
    expect(addBtn).toBeInTheDocument();

    // Click Add to Shopping List
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith({
        userId: "test_user_sync_123",
        productName: "Koyo Organic Garlic Pepper Ramen",
        category: "Instant Prepared Meals",
      });
      // Now displays persistent Added to List badge
      expect(screen.getByText(/Added to List/i)).toBeInTheDocument();
    });
  });

  it("AlternativesPage shows persistent 'Added to List' on reload if item is already in shopping list DB", async () => {
    const mockAlternatives: api.AlternativePair[] = [
      {
        id: "alt_chips_0",
        category: "Snacks & Chips",
        upfItem: {
          barcode: "028400064088",
          name: "Doritos Nacho Cheese",
          score: 32,
          nova: 4,
          flaws: ["Yellow 6 (E110)", "Red 40 (E129)"],
        },
        cleanAlternative: {
          name: "Siete Sea Salt Grain-Free Tortilla Chips",
          score: 88,
          nova: 1,
          highlights: ["Avocado oil", "Cassava flour"],
          ingredientCount: 4,
        },
      },
    ];

    // Database already has Siete Sea Salt Grain-Free Tortilla Chips
    const mockShoppingItems: api.ShoppingItem[] = [
      {
        id: "s_persisted_1",
        userId: "test_user_sync_123",
        productName: "Siete Sea Salt Grain-Free Tortilla Chips",
        category: "Snacks & Chips",
        checked: 0,
        addedAt: "2026-11-24T09:00:00Z",
      },
    ];

    vi.spyOn(api, "fetchUserAlternatives").mockResolvedValueOnce(mockAlternatives);
    vi.spyOn(api, "fetchShoppingItems").mockResolvedValueOnce(mockShoppingItems);

    render(<AlternativesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Doritos Nacho Cheese/i)).toBeInTheDocument();
      expect(screen.getByText(/Siete Sea Salt Grain-Free Tortilla Chips/i)).toBeInTheDocument();
    });

    // Persistent badge is immediately rendered from database shopping state
    expect(screen.getByText(/Added to List/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add to Shopping List/i })).not.toBeInTheDocument();
  });

  it("ShoppingListPage fetches and displays persisted database items with toggle and delete", async () => {
    const mockItems: api.ShoppingItem[] = [
      {
        id: "s_item_1",
        userId: "test_user_sync_123",
        productName: "MALK Pure Organic Almond Milk",
        category: "Clean Dairy Alternative",
        checked: 0,
        addedAt: "2026-11-24T10:00:00Z",
      },
    ];

    const fetchSpy = vi.spyOn(api, "fetchShoppingItems").mockResolvedValueOnce(mockItems);
    const toggleSpy = vi.spyOn(api, "toggleShoppingItem").mockResolvedValueOnce({
      success: true,
      id: "s_item_1",
      checked: 1,
    });
    const deleteSpy = vi.spyOn(api, "deleteShoppingItem").mockResolvedValueOnce({
      success: true,
      id: "s_item_1",
    });

    render(<ShoppingListPage />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("test_user_sync_123");
      expect(screen.getByText(/MALK Pure Organic Almond Milk/i)).toBeInTheDocument();
    });

    // Toggle item
    const itemRow = screen.getByText(/MALK Pure Organic Almond Milk/i);
    fireEvent.click(itemRow);

    await waitFor(() => {
      expect(toggleSpy).toHaveBeenCalledWith("s_item_1");
    });

    // Delete item
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith("s_item_1");
    });
  });
});
