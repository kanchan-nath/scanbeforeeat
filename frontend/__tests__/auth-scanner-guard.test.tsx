import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Hero } from "@/components/home/Hero";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ScanDemo } from "@/components/demo/ScanDemo";
import AuthPage from "@/app/auth/page";
import ScannerPage from "@/app/scanner/page";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/scanner",
  useSearchParams: () => mockSearchParams,
}));

// Mock Auth Context
let mockUser: any = null;
let mockLoading = false;
const mockSignInGoogle = vi.fn();
const mockVerifyOtp = vi.fn();
const mockLoginDemo = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    firebaseUser: null,
    loading: mockLoading,
    signInGoogle: mockSignInGoogle,
    sendOtp: vi.fn(),
    verifyOtp: mockVerifyOtp,
    loginDemo: mockLoginDemo,
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

// Mock API
vi.mock("@/lib/api", () => ({
  fetchAiStatus: vi.fn().mockResolvedValue({ status: "healthy", model: "gemini-2.5-flash" }),
  fetchProduct: vi.fn().mockResolvedValue(null),
  performScan: vi.fn().mockResolvedValue({ product: null }),
}));

describe("Authentication Guard for Scanner & Public CTAs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockLoading = false;
    mockSearchParams = new URLSearchParams();
  });

  describe("Scanner Page Access Guard", () => {
    it("redirects unauthenticated visitor to /auth?redirect=/scanner", async () => {
      mockUser = null;
      mockLoading = false;

      render(<ScannerPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/auth?redirect=/scanner");
      });
    });
  });

  describe("Public CTAs Guard", () => {
    it("redirects unauthenticated user to /auth?redirect=/scanner on Hero CTA click", () => {
      mockUser = null;
      render(<Hero />);

      const heroCta = screen.getByRole("link", { name: /start scanning/i });
      fireEvent.click(heroCta);

      expect(mockPush).toHaveBeenCalledWith("/auth?redirect=/scanner");
    });

    it("navigates authenticated user directly to /scanner on Hero CTA click", () => {
      mockUser = { id: "user_pro_123", email: "pro@scanbeforeeat.com" };
      render(<Hero />);

      const heroCta = screen.getByRole("link", { name: /open live scanner/i });
      fireEvent.click(heroCta);

      expect(mockPush).toHaveBeenCalledWith("/scanner");
    });

    it("redirects unauthenticated user to /auth?redirect=/scanner on CtaBanner CTA click", () => {
      mockUser = null;
      render(<CtaBanner />);

      const bannerCta = screen.getByRole("link", { name: /get started/i });
      fireEvent.click(bannerCta);

      expect(mockPush).toHaveBeenCalledWith("/auth?redirect=/scanner");
    });

    it("redirects unauthenticated user to /auth?redirect=/scanner on ScanDemo CTA click", () => {
      mockUser = null;
      render(<ScanDemo />);

      const demoCta = screen.getByRole("link", { name: /scan your own food product now/i });
      fireEvent.click(demoCta);

      expect(mockPush).toHaveBeenCalledWith("/auth?redirect=/scanner");
    });
  });

  describe("Auth Page Redirect Handling", () => {
    it("redirects to target route specified in ?redirect=/scanner on successful demo login", async () => {
      mockSearchParams = new URLSearchParams("redirect=/scanner");
      mockLoginDemo.mockResolvedValueOnce(undefined);

      render(<AuthPage />);

      const demoBtn = screen.getByRole("button", { name: /explore showcase demo/i });
      fireEvent.click(demoBtn);

      await waitFor(() => {
        expect(mockLoginDemo).toHaveBeenCalledWith("monthly_pro");
        expect(mockPush).toHaveBeenCalledWith("/scanner");
      });
    });

    it("auto-redirects already authenticated user directly to ?redirect=/scanner", async () => {
      mockSearchParams = new URLSearchParams("redirect=/scanner");
      mockUser = { id: "user_active", email: "active@scanbeforeeat.com", remainingScans: 15 };

      render(<AuthPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/scanner");
      });
    });
  });
});
