import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig, navItems } from "@/lib/config";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Auth Context
let mockUser: any = null;
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
    firebaseUser: null,
    loading: false,
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });
  it("renders brand logo, title, and links to home", () => {
    render(<Navbar />);
    
    // Check brand logo image
    const logos = screen.getAllByAltText("ScanBeforeEat Logo");
    expect(logos.length).toBeGreaterThanOrEqual(1);
    expect(logos[0]).toHaveAttribute("src", siteConfig.logoUrl);

    // Check brand link
    const brandLink = screen.getAllByRole("link", { name: /scanbeforeeat/i })[0];
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders exactly 6 primary navigation items with correct paths", () => {
    render(<Navbar />);

    expect(navItems).toHaveLength(6);

    const expectedItems = [
      { href: "/additives", label: "Additives & E-Numbers" },
      { href: "/upf-guide", label: "UPF Guide" },
      { href: "/methodology", label: "Methodology" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
    ];

    expect(navItems).toEqual(expectedItems);

    for (const item of expectedItems) {
      const links = screen.getAllByRole("link", { name: item.label });
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links.some((l) => l.getAttribute("href") === item.href)).toBe(true);
    }
  });

  it("renders loginUrl and scanUrl CTAs", () => {
    render(<Navbar />);

    // Sign in link
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(signInLinks[0]).toHaveAttribute("href", siteConfig.loginUrl);

    // Start scanning link
    const scanLinks = screen.getAllByRole("link", { name: /start scanning|scan now/i });
    expect(scanLinks.length).toBeGreaterThanOrEqual(1);
    expect(scanLinks.some((l) => l.getAttribute("href") === siteConfig.scanUrl)).toBe(true);
  });

  it("toggles mobile menu open and closed when mobile button is clicked", () => {
    render(<Navbar />);

    const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Click to open
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Drawer should show mobile specific CTA
    expect(screen.getByText(/start free scan \(15 included\)/i)).toBeInTheDocument();

    // Click to close
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("redirects unauthenticated users to /auth?redirect=/scanner when clicking scan CTA", () => {
    mockUser = null;
    render(<Navbar />);

    const scanLinks = screen.getAllByRole("link", { name: /start scanning|scan now/i });
    fireEvent.click(scanLinks[0]);

    expect(mockPush).toHaveBeenCalledWith("/auth?redirect=/scanner");
  });

  it("navigates authenticated users directly to /scanner when clicking scan CTA", () => {
    mockUser = { id: "user_123", email: "tester@scanbeforeeat.com" };
    render(<Navbar />);

    const scanLinks = screen.getAllByRole("link", { name: /start scanning|scan now/i });
    fireEvent.click(scanLinks[0]);

    expect(mockPush).toHaveBeenCalledWith("/scanner");
  });
});

describe("Footer Component", () => {
  it("renders logo and brand identity", () => {
    render(<Footer />);

    const logo = screen.getByAltText("ScanBeforeEat Logo");
    expect(logo).toHaveAttribute("src", siteConfig.logoUrl);

    const brandLink = screen.getByRole("link", { name: /scanbeforeeat/i });
    expect(brandLink).toHaveAttribute("href", "/");
  });

  it("renders all Product section links including scannerApp, additives, methodology, upfGuide, and apiDocs", () => {
    render(<Footer />);

    const scannerApp = screen.getByRole("link", { name: "Scanner App" });
    expect(scannerApp).toHaveAttribute("href", siteConfig.scanUrl);

    const ingredientDb = screen.getByRole("link", { name: "Ingredient Database" });
    expect(ingredientDb).toHaveAttribute("href", "/additives");

    const methodology = screen.getByRole("link", { name: "Methodology" });
    expect(methodology).toHaveAttribute("href", "/methodology");

    const upfGuide = screen.getByRole("link", { name: "UPF Guide (NOVA)" });
    expect(upfGuide).toHaveAttribute("href", "/upf-guide");

    const apiDocs = screen.getByRole("link", { name: "API Docs" });
    expect(apiDocs).toHaveAttribute("href", "/api-docs");
  });

  it("redirects unauthenticated users to /auth?redirect=/scanner when clicking Footer Scanner App", () => {
    mockUser = null;
    render(<Footer />);

    const scannerApp = screen.getByRole("link", { name: "Scanner App" });
    fireEvent.click(scannerApp);

    expect(mockPush).toHaveBeenCalledWith("/auth?redirect=/scanner");
  });

  it("renders Legal & Trust section links including privacy, terms, and security", () => {
    render(<Footer />);

    const privacy = screen.getByRole("link", { name: "Privacy Policy" });
    expect(privacy).toHaveAttribute("href", "/privacy");

    const terms = screen.getByRole("link", { name: "Terms of Service" });
    expect(terms).toHaveAttribute("href", "/terms");

    const security = screen.getByRole("link", { name: "Security Architecture" });
    expect(security).toHaveAttribute("href", "/security");
  });

  it("renders medical disclaimer, engine version, and copyright badge", () => {
    render(<Footer />);

    expect(screen.getByText(/disclaimer:/i)).toBeInTheDocument();
    expect(screen.getByText(/does not constitute medical advice/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(siteConfig.engineVersion))).toBeInTheDocument();
    expect(screen.getByText(/15 free scans \/ month/i)).toBeInTheDocument();
    expect(screen.getByText(/gdpr compliant/i)).toBeInTheDocument();
  });
});
