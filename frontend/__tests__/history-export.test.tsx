import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HistoryPage from "../src/app/history/page";
import * as api from "../src/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/history",
}));

// Mock AuthContext
vi.mock("../src/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test_history_user", email: "history@test.com", plan: "monthly_pro" },
    refreshProfile: vi.fn(),
  }),
}));

// Mock API functions
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchScanHistory: vi.fn(),
    downloadUserDataExport: vi.fn(),
  };
});

describe("Audit History Export Feature Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders export options for CSV (Excel) and JSON Dossier in audit history", async () => {
    vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([
      {
        id: "scn_101",
        userId: "test_history_user",
        barcode: "8901058852331",
        productName: "Maggi 2-Minute Masala Noodles",
        brand: "Nestle",
        healthScore: 38,
        novaGroup: 4,
        scannedAt: "2026-11-24 10:00:00",
      },
    ]);

    render(<HistoryPage />);

    expect(screen.getByRole("button", { name: /Export CSV \(Excel\)/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /JSON Dossier/i })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("Maggi 2-Minute Masala Noodles")).toBeDefined();
    });
  });

  it("triggers authenticated CSV download when Export CSV is clicked", async () => {
    vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([]);
    vi.mocked(api.downloadUserDataExport).mockResolvedValueOnce();

    render(<HistoryPage />);

    const csvBtn = screen.getByRole("button", { name: /Export CSV \(Excel\)/i });
    fireEvent.click(csvBtn);

    await waitFor(() => {
      expect(api.downloadUserDataExport).toHaveBeenCalledWith("test_history_user", "csv");
    });
  });

  it("triggers authenticated JSON download when JSON Dossier is clicked", async () => {
    vi.mocked(api.fetchScanHistory).mockResolvedValueOnce([]);
    vi.mocked(api.downloadUserDataExport).mockResolvedValueOnce();

    render(<HistoryPage />);

    const jsonBtn = screen.getByRole("button", { name: /JSON Dossier/i });
    fireEvent.click(jsonBtn);

    await waitFor(() => {
      expect(api.downloadUserDataExport).toHaveBeenCalledWith("test_history_user", "json");
    });
  });
});
