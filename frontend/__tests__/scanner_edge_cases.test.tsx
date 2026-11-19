import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { validateBarcode, isCameraSupported } from "../src/lib/camera";
import ScannerPage from "../src/app/scanner/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/scanner",
}));

// Mock auth context
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "test_user_pro",
      email: "test@example.com",
      plan: "monthly_pro",
      scansLimit: 99,
      scansUsed: 12,
      remainingScans: 87,
    },
    loginDemo: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

// Mock API
vi.mock("@/lib/api", () => ({
  performScan: vi.fn().mockResolvedValue({
    product: {
      barcode: "8901058852331",
      name: "Maggi 2-Min Noodles",
      brand: "Maggi",
      category: "Instant Noodles",
      healthScore: 38,
      novaGroup: 4,
    },
    quota: {
      scansLimit: 99,
      scansUsed: 13,
      remainingScans: 86,
    },
  }),
  fetchAiStatus: vi.fn().mockResolvedValue({
    nvidiaConfigured: false,
    model: "meta/llama-3.2-11b-vision-instruct",
    textModel: "meta/llama-3.1-70b-instruct",
    fallbackReady: true,
    engine: "Scientific Toxicology Engine (Built-in)",
  }),
}));

// Mock camera scanner components to isolate ScannerPage integration
vi.mock("@/components/scanner/BarcodeCamera", () => ({
  default: ({ onDetected }: { onDetected: (code: string) => void }) => (
    <div data-testid="barcode-camera-mock">
      <button onClick={() => onDetected("8901058852331")}>Simulate Detect Barcode</button>
    </div>
  ),
}));

vi.mock("@/components/scanner/IngredientCamera", () => ({
  default: ({ onAnalyzeImage, onAnalyzeText }: { onAnalyzeImage: any; onAnalyzeText: any }) => (
    <div data-testid="ingredient-camera-mock">
      <button onClick={() => onAnalyzeText("Wheat flour, Palm oil, MSG")}>Simulate Analyze Text</button>
      <button onClick={() => onAnalyzeImage("data:image/jpeg;base64,123", "image/jpeg")}>Simulate Analyze Image</button>
    </div>
  ),
}));

describe("ScannerPage Edge Cases & Interactive Modes", () => {
  it("should render scanner page with telemetry and mode tabs", async () => {
    await act(async () => {
      render(<ScannerPage />);
    });
    expect(screen.getByText("Live Food Scanner Console")).toBeDefined();
    expect(screen.getByText(/Scans Available/i)).toBeDefined();
    expect(screen.getByText("Barcode Camera")).toBeDefined();
    expect(screen.getByText("Ingredient Lens")).toBeDefined();
    expect(screen.getByText("Manual Input")).toBeDefined();
  });

  it("should switch between Barcode Camera, Ingredient Lens, and Manual Input tabs", async () => {
    await act(async () => {
      render(<ScannerPage />);
    });

    // Default tab is barcode
    expect(screen.getByTestId("barcode-camera-mock")).toBeDefined();

    // Switch to Ingredient Lens
    const ocrTab = screen.getByText("Ingredient Lens");
    await act(async () => {
      fireEvent.click(ocrTab);
    });
    expect(screen.getByTestId("ingredient-camera-mock")).toBeDefined();

    // Switch to Manual Input
    const manualTab = screen.getByText("Manual Input");
    await act(async () => {
      fireEvent.click(manualTab);
    });
    expect(screen.getByPlaceholderText("8901058852331")).toBeDefined();
  });

  it("should reject invalid manual barcode with clear inline error message", async () => {
    await act(async () => {
      render(<ScannerPage />);
    });

    // Switch to Manual Input
    await act(async () => {
      fireEvent.click(screen.getByText("Manual Input"));
    });

    const input = screen.getByPlaceholderText("8901058852331");
    await act(async () => {
      fireEvent.change(input, { target: { value: "abc" } });
    });

    const lookupBtn = screen.getByText("Lookup");
    await act(async () => {
      fireEvent.click(lookupBtn);
    });

    // Should display validation error
    expect(screen.getByText(/Barcode is too short/i)).toBeDefined();
  });
});
