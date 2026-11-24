import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BatchQueuePage, { CDM_SAMPLE_BARCODES } from "../src/app/batch-queue/page";
import * as api from "../src/lib/api";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/batch-queue",
}));

// Mock AuthContext
vi.mock("../src/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test_user_queue", plan: "monthly_pro" },
    refreshProfile: vi.fn(),
  }),
}));

// Mock api.performScan
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    performScan: vi.fn(),
  };
});

describe("Batch Queue CDM & Try Now Workflow Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with empty input box and empty queue by default", () => {
    render(<BatchQueuePage />);
    const textarea = screen.getByPlaceholderText(/Paste barcodes here/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(screen.getByText(/Queue is empty/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /CDM/i })).toBeDefined();
  });

  it("executes zero-click CDM workflow when clicking CDM button", async () => {
    vi.mocked(api.performScan).mockImplementation(async ({ barcode }: any) => {
      return {
        product: {
          barcode,
          name: `Sample Product ${barcode}`,
          brand: "TestBrand",
          category: "Grocery",
          healthScore: 82,
          novaGroup: 1,
          ingredientsText: "Sample ingredients",
          additives: [],
          allergens: [],
          deductions: [],
          alternatives: [],
        },
        quota: { scansLimit: 99, scansUsed: 1, remainingScans: 98 },
      };
    });

    render(<BatchQueuePage />);

    const cdmButton = screen.getByRole("button", { name: /CDM/i });
    fireEvent.click(cdmButton);

    // Verify textarea populated with the 3 sample barcodes
    const textarea = screen.getByPlaceholderText(/Paste barcodes here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain(CDM_SAMPLE_BARCODES[0]);
    expect(textarea.value).toContain(CDM_SAMPLE_BARCODES[1]);
    expect(textarea.value).toContain(CDM_SAMPLE_BARCODES[2]);

    // Verify button switches to "Try Now"
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Try Now/i })).toBeDefined();
    });

    // Verify performScan was automatically called for the 3 barcodes
    await waitFor(() => {
      expect(api.performScan).toHaveBeenCalledTimes(3);
    });

    // Verify results appear in stream
    expect(screen.getByText("3 completed • Avg Score: 82/100")).toBeDefined();
  });

  it("clears input box and resets queue completely when clicking Try Now", async () => {
    vi.mocked(api.performScan).mockResolvedValue({
      product: {
        barcode: "123",
        name: "Test",
        brand: "Brand",
        category: "Cat",
        healthScore: 70,
        novaGroup: 2,
        ingredientsText: "",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      },
      quota: { scansLimit: 99, scansUsed: 1, remainingScans: 98 },
    });

    render(<BatchQueuePage />);

    // 1. Run CDM
    const cdmButton = screen.getByRole("button", { name: /CDM/i });
    fireEvent.click(cdmButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Try Now/i })).toBeDefined();
    });

    // 2. Click Try Now
    const tryNowButton = screen.getByRole("button", { name: /Try Now/i });
    fireEvent.click(tryNowButton);

    // 3. Verify box is completely empty and queue is reset
    const textarea = screen.getByPlaceholderText(/Paste barcodes here/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(screen.getByText(/Queue is empty/i)).toBeDefined();

    // Button should be back to CDM
    expect(screen.getByRole("button", { name: /CDM/i })).toBeDefined();
  });

  it("allows user to manually load into queue and run batch", async () => {
    vi.mocked(api.performScan).mockResolvedValueOnce({
      product: {
        barcode: "1122334455667",
        name: "Custom User Food",
        brand: "UserBrand",
        category: "Snack",
        healthScore: 90,
        novaGroup: 1,
        ingredientsText: "",
        additives: [],
        allergens: [],
        deductions: [],
        alternatives: [],
      },
      quota: { scansLimit: 99, scansUsed: 1, remainingScans: 98 },
    });

    render(<BatchQueuePage />);

    const textarea = screen.getByPlaceholderText(/Paste barcodes here/i);
    fireEvent.change(textarea, { target: { value: "1122334455667" } });

    const loadButton = screen.getByRole("button", { name: /Load into Queue/i });
    fireEvent.click(loadButton);

    expect(screen.getAllByText("1122334455667").length).toBeGreaterThanOrEqual(1);

    const runButton = screen.getByRole("button", { name: /Run Batch/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(api.performScan).toHaveBeenCalledWith(
        expect.objectContaining({ barcode: "1122334455667" })
      );
      expect(screen.getByText("Custom User Food")).toBeDefined();
    });
  });
});
