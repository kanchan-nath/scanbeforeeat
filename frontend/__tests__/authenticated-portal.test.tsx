import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthenticatedShell from "@/components/AuthenticatedShell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock auth context
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "demo_pro",
      email: "elena@science.org",
      displayName: "Dr. Elena Vance",
      plan: "annual_pro",
      scansLimit: 99,
      scansUsed: 12,
      remainingScans: 87,
    },
    loading: false,
    logout: vi.fn(),
  }),
}));

describe("Authenticated Portal Shell & Navigation", () => {
  it("renders the brand header and pro toxicologist badge", () => {
    render(
      <AuthenticatedShell>
        <div data-testid="child-content">Portal Content</div>
      </AuthenticatedShell>
    );

    const brandTitles = screen.getAllByText("ScanBeforeEat");
    expect(brandTitles.length).toBeGreaterThan(0);
    expect(screen.getByText("Pro Toxicologist")).toBeDefined();
    expect(screen.getByTestId("child-content")).toBeDefined();
  });

  it("renders all 6 navigation sections", () => {
    render(
      <AuthenticatedShell>
        <div>Content</div>
      </AuthenticatedShell>
    );

    const coreAudit = screen.getAllByText("CORE AUDIT");
    expect(coreAudit.length).toBeGreaterThan(0);

    const pantry = screen.getAllByText("PANTRY & GROCERY");
    expect(pantry.length).toBeGreaterThan(0);

    const health = screen.getAllByText("HEALTH & TOXICOLOGY");
    expect(health.length).toBeGreaterThan(0);

    const billing = screen.getAllByText("BILLING & PLANS");
    expect(billing.length).toBeGreaterThan(0);

    const developer = screen.getAllByText("DEVELOPER API");
    expect(developer.length).toBeGreaterThan(0);

    const settings = screen.getAllByText("SETTINGS");
    expect(settings.length).toBeGreaterThan(0);
  });

  it("renders links for key authenticated screens", () => {
    render(
      <AuthenticatedShell>
        <div>Content</div>
      </AuthenticatedShell>
    );

    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Live Scanner").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Batch Queue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Audit History").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Digital Pantry").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Clean Alternatives").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shopping List").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Allergen Matrix").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Banned Additives").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Exposure Ledger").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Subscription Plans").length).toBeGreaterThan(0);
    expect(screen.getAllByText("API Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Security & 2FA").length).toBeGreaterThan(0);
  });

  it("renders user profile with correct initials and sign out button", () => {
    render(
      <AuthenticatedShell>
        <div>Content</div>
      </AuthenticatedShell>
    );

    expect(screen.getAllByText("Dr. Elena Vance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("elena@science.org").length).toBeGreaterThan(0);
    expect(screen.getAllByTitle("Sign Out").length).toBeGreaterThan(0);
  });

  it("renders the Stitch TopBar with search bar, ⌘K, Pro Plan badge, and New Scan CTA", () => {
    render(
      <AuthenticatedShell>
        <div>Content</div>
      </AuthenticatedShell>
    );

    // Search bar & ⌘K badge
    expect(screen.getByPlaceholderText("Search additives, E-numbers, products...")).toBeDefined();
    expect(screen.getByText("⌘K")).toBeDefined();

    // New Scan action CTA
    expect(screen.getByText("New Scan")).toBeDefined();

    // PRO PLAN badge
    const proBadges = screen.getAllByText("PRO PLAN");
    expect(proBadges.length).toBeGreaterThan(0);
  });

  it("verifies mobile navigation has NO hamburger breadcrumb button in the top corner and renders slideable bottom navigation", () => {
    render(
      <AuthenticatedShell>
        <div>Content</div>
      </AuthenticatedShell>
    );

    // Verify top corner breadcrumb / hamburger menu button is NOT in the document
    expect(screen.queryByRole("button", { name: /toggle navigation menu/i })).toBeNull();

    // Verify Mobile Bottom Navigation is rendered
    const mobileNav = screen.getByRole("navigation", { name: "Mobile Bottom Navigation" });
    expect(mobileNav).toBeDefined();

    // Verify primary items matching reference (Home, Scanner, Pantry, Grocery, Profile) are present in bottom nav
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Scanner").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pantry").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Grocery").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Profile").length).toBeGreaterThan(0);

    // Verify pinned Menu button is present
    const menuBtn = screen.getByRole("button", { name: /toggle full menu directory/i });
    expect(menuBtn).toBeDefined();
    expect(screen.getAllByText("Menu").length).toBeGreaterThan(0);
  });
});
