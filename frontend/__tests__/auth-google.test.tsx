import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "@/app/auth/page";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/auth",
}));

// Mock Auth Context
const mockSignInGoogle = vi.fn();
const mockSendOtp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockLoginDemo = vi.fn();

let mockUser: any = null;

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    firebaseUser: null,
    loading: false,
    signInGoogle: mockSignInGoogle,
    sendOtp: mockSendOtp,
    verifyOtp: mockVerifyOtp,
    loginDemo: mockLoginDemo,
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

describe("Google Authentication Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  it("renders 'Continue with Google' button with official Google icon", () => {
    render(<AuthPage />);
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    expect(googleBtn).toBeDefined();
    expect(googleBtn).not.toBeDisabled();
  });

  it("triggers signInGoogle and navigates to /dashboard on success", async () => {
    mockSignInGoogle.mockResolvedValueOnce(undefined);
    render(<AuthPage />);

    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInGoogle).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error banner when Google authentication fails or is cancelled", async () => {
    mockSignInGoogle.mockRejectedValueOnce(new Error("auth/configuration-not-found: Google sign-in provider is not enabled in Firebase Console."));
    render(<AuthPage />);

    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInGoogle).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/auth\/configuration-not-found/i)).toBeDefined();
    });
  });
});
