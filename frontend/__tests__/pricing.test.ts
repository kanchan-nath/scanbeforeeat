import { describe, it, expect } from "vitest";
import { pricingPlans, siteConfig } from "@/lib/config";

describe("Pricing Plans Configuration", () => {
  it("defines exactly 4 pricing tiers", () => {
    expect(pricingPlans).toHaveLength(4);
  });

  it("asserts Free Plan has exact parameters: ₹0 and 15 free scans per month", () => {
    const freePlan = pricingPlans.find((p) => p.id === "free");
    expect(freePlan).toBeDefined();
    expect(freePlan?.name).toBe("Free Plan");
    expect(freePlan?.price).toBe("₹0");
    expect(freePlan?.scans).toBe("15 free scans per month");
    expect(freePlan?.ctaHref).toBe(siteConfig.scanUrl);
    expect(freePlan?.highlight).toBe(false);
    expect(freePlan?.features).toContain("15 free scans per month");
  });

  it("asserts Monthly Pro has exact parameters: ₹199 and 99 scans", () => {
    const monthlyPlan = pricingPlans.find((p) => p.id === "monthly");
    expect(monthlyPlan).toBeDefined();
    expect(monthlyPlan?.name).toBe("Monthly Pro");
    expect(monthlyPlan?.price).toBe("₹199");
    expect(monthlyPlan?.scans).toBe("99 scans included");
    expect(monthlyPlan?.scans).toContain("99 scans");
    expect(monthlyPlan?.period).toBe("/ month");
    expect(monthlyPlan?.ctaHref).toBe(siteConfig.scanUrl);
    expect(monthlyPlan?.highlight).toBe(false);
  });

  it("asserts 6-Month Saver has exact parameters: ₹499 and 99 scans", () => {
    const sixMonthPlan = pricingPlans.find((p) => p.id === "six-month");
    expect(sixMonthPlan).toBeDefined();
    expect(sixMonthPlan?.name).toBe("6-Month Saver");
    expect(sixMonthPlan?.price).toBe("₹499");
    expect(sixMonthPlan?.scans).toBe("99 scans included");
    expect(sixMonthPlan?.scans).toContain("99 scans");
    expect(sixMonthPlan?.period).toBe("/ 6 months");
    expect(sixMonthPlan?.ctaHref).toBe(siteConfig.scanUrl);
    expect(sixMonthPlan?.highlight).toBe(false);
  });

  it("asserts Annual Pro has exact parameters: ₹999 and 99 scans (highlighted best value)", () => {
    const annualPlan = pricingPlans.find((p) => p.id === "annual");
    expect(annualPlan).toBeDefined();
    expect(annualPlan?.name).toBe("Annual Pro");
    expect(annualPlan?.price).toBe("₹999");
    expect(annualPlan?.scans).toBe("99 scans included");
    expect(annualPlan?.scans).toContain("99 scans");
    expect(annualPlan?.period).toBe("/ year");
    expect(annualPlan?.ctaHref).toBe(siteConfig.scanUrl);
    expect(annualPlan?.highlight).toBe(true);
  });

  it("ensures each pricing plan contains essential feature descriptions and CTAs", () => {
    for (const plan of pricingPlans) {
      expect(plan.id).toBeTruthy();
      expect(plan.name).toBeTruthy();
      expect(plan.price).toMatch(/^₹\d+$/);
      expect(plan.scans).toBeTruthy();
      expect(plan.ctaText).toBeTruthy();
      expect(plan.ctaHref).toBe(siteConfig.scanUrl);
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThanOrEqual(3);
    }
  });
});
