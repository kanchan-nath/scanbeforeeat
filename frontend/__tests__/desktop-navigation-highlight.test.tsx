import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { Navbar } from "@/components/layout/Navbar";
import { isRouteActive } from "@/lib/navigation";

// Dynamic mock variables
let mockPathname = "/dashboard";
let mockUser: any = { id: "user_pro", email: "elena@science.org", remainingScans: 42, plan: "monthly_pro" };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    firebaseUser: null,
    loading: false,
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

describe("Desktop Navigation Active Highlighting Harness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: "user_pro", email: "elena@science.org", remainingScans: 42, plan: "monthly_pro" };
  });

  describe("Route Normalization & isRouteActive Utility", () => {
    it("handles exact match and trailing slashes correctly", () => {
      expect(isRouteActive("/dashboard", "/dashboard")).toBe(true);
      expect(isRouteActive("/dashboard/", "/dashboard")).toBe(true);
      expect(isRouteActive("/scanner", "/scanner")).toBe(true);
      expect(isRouteActive("/scanner/", "/scanner")).toBe(true);
      expect(isRouteActive("/dashboard", "/scanner")).toBe(false);
      expect(isRouteActive("/scanner", "/dashboard")).toBe(false);
    });

    it("handles sub-routes correctly", () => {
      expect(isRouteActive("/blog/why-emulsifiers-are-used", "/blog")).toBe(true);
      expect(isRouteActive("/product/8901058852331", "/product")).toBe(true);
    });
  });

  describe("AuthenticatedShell Desktop Navigation Highlighting", () => {
    it("highlights Dashboard when pathname is /dashboard on desktop", () => {
      mockPathname = "/dashboard";
      render(
        <AuthenticatedShell>
          <div>Dashboard Content</div>
        </AuthenticatedShell>
      );

      // Desktop sidebar Dashboard link
      const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
      const desktopDashboardLink = dashboardLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(desktopDashboardLink).toBeDefined();
      expect(desktopDashboardLink).toHaveAttribute("data-active", "true");
      expect(desktopDashboardLink).toHaveAttribute("aria-current", "page");
      expect(desktopDashboardLink?.className).toContain("border-emerald-600");
      expect(desktopDashboardLink?.className).toContain("text-emerald-900");

      // Live Scanner must NOT be active
      const scannerLinks = screen.getAllByRole("link", { name: /live scanner|scanner/i });
      const activeScannerLink = scannerLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activeScannerLink).toBeUndefined();

      // Top desktop header location badge
      expect(screen.getAllByText("CORE AUDIT").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
    });

    it("highlights Dashboard even with trailing slash /dashboard/", () => {
      mockPathname = "/dashboard/";
      render(
        <AuthenticatedShell>
          <div>Dashboard Content</div>
        </AuthenticatedShell>
      );

      const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
      const desktopDashboardLink = dashboardLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(desktopDashboardLink).toBeDefined();
      expect(desktopDashboardLink).toHaveAttribute("data-active", "true");
      expect(desktopDashboardLink).toHaveAttribute("aria-current", "page");
    });

    it("switches highlight to Live Scanner when pathname changes to /scanner", () => {
      mockPathname = "/scanner";
      render(
        <AuthenticatedShell>
          <div>Scanner Content</div>
        </AuthenticatedShell>
      );

      // Live scanner in desktop sidebar
      const scannerLinks = screen.getAllByRole("link", { name: /live scanner|scanner/i });
      const activeScannerLink = scannerLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activeScannerLink).toBeDefined();
      expect(activeScannerLink).toHaveAttribute("data-active", "true");
      expect(activeScannerLink).toHaveAttribute("aria-current", "page");
      expect(activeScannerLink?.className).toContain("border-emerald-600");
      expect(activeScannerLink?.className).toContain("text-emerald-900");

      // Dashboard must NOT be active
      const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
      const activeDashboardLink = dashboardLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activeDashboardLink).toBeUndefined();

      // Desktop header scanner CTA shows active state
      const headerScannerCta = screen.getByRole("link", { name: /live scanner \(active\)/i });
      expect(headerScannerCta).toBeInTheDocument();
      expect(headerScannerCta).toHaveAttribute("data-active", "true");
      expect(headerScannerCta.className).toContain("ring-2 ring-emerald-500");
    });

    it("highlights other portal sections (e.g. /pantry)", () => {
      mockPathname = "/pantry";
      render(
        <AuthenticatedShell>
          <div>Pantry Content</div>
        </AuthenticatedShell>
      );

      const pantryLinks = screen.getAllByRole("link", { name: /digital pantry|pantry/i });
      const activePantryLink = pantryLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activePantryLink).toBeDefined();
      expect(activePantryLink).toHaveAttribute("data-active", "true");
      expect(activePantryLink).toHaveAttribute("aria-current", "page");

      expect(screen.getAllByText("PANTRY & GROCERY").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Navbar Desktop Navigation Highlighting", () => {
    it("highlights Dashboard when on /dashboard in Navbar", () => {
      mockPathname = "/dashboard";
      render(<Navbar />);

      const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
      const activeDashboard = dashboardLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activeDashboard).toBeDefined();
      expect(activeDashboard).toHaveAttribute("aria-current", "page");
      expect(activeDashboard?.className).toContain("text-emerald-800");
    });

    it("highlights Live Scanner button when on /scanner in Navbar", () => {
      mockPathname = "/scanner";
      render(<Navbar />);

      const scannerLink = screen.getByRole("link", { name: /live scanner/i });
      expect(scannerLink).toBeInTheDocument();
      expect(scannerLink).toHaveAttribute("data-active", "true");
      expect(scannerLink).toHaveAttribute("aria-current", "page");
      expect(scannerLink.className).toContain("ring-2 ring-emerald-500");
    });

    it("highlights public nav links when active (e.g. /blog)", () => {
      mockPathname = "/blog";
      render(<Navbar />);

      const blogLinks = screen.getAllByRole("link", { name: /^blog$/i });
      const activeBlog = blogLinks.find((l) => l.getAttribute("data-active") === "true");
      expect(activeBlog).toBeDefined();
      expect(activeBlog).toHaveAttribute("aria-current", "page");
      expect(activeBlog?.className).toContain("border-b-2 border-emerald-600");
    });
  });
});
