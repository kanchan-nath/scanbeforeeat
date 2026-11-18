import { describe, it, expect } from "vitest";
import {
  SCORING_BOUNDS,
  clampScore,
  calculateHealthScore,
} from "@/lib/scoring";

describe("Methodology Scoring Engine & Algorithmic Bounds", () => {
  it("defines exact mathematical scoring bounds: min 15, max 95, base 70", () => {
    expect(SCORING_BOUNDS.MIN).toBe(15);
    expect(SCORING_BOUNDS.MAX).toBe(95);
    expect(SCORING_BOUNDS.BASE).toBe(70);
    expect(SCORING_BOUNDS.MAX_BONUS).toBe(15);
  });

  it("clampScore enforces minimum bound of 15 (never 0 or negative)", () => {
    expect(clampScore(15)).toBe(15);
    expect(clampScore(10)).toBe(15);
    expect(clampScore(0)).toBe(15);
    expect(clampScore(-50)).toBe(15);
  });

  it("clampScore enforces maximum bound of 95 (never 100 to prevent false absolutism)", () => {
    expect(clampScore(95)).toBe(95);
    expect(clampScore(96)).toBe(95);
    expect(clampScore(100)).toBe(95);
    expect(clampScore(150)).toBe(95);
  });

  it("clampScore preserves valid intermediate values within [15, 95]", () => {
    expect(clampScore(70)).toBe(70);
    expect(clampScore(55)).toBe(55);
    expect(clampScore(84.6)).toBe(85);
    expect(clampScore(42.2)).toBe(42);
  });

  it("calculateHealthScore starts from base 70 when no modifiers are applied", () => {
    const score = calculateHealthScore();
    expect(score).toBe(70);
  });

  it("calculateHealthScore clamps extreme positive whole-food bonuses to maximum 95", () => {
    const maxBonusScore = calculateHealthScore({
      base: 70,
      bonusWhole: 20,
      bonusFiber: 20,
      bonusProtein: 20,
    });
    // Base 70 + bonus cap 15 = 85
    expect(maxBonusScore).toBe(85);

    // If base were higher or bonuses pushed above max
    const extremeScore = calculateHealthScore({
      base: 90,
      bonusWhole: 30,
    });
    expect(extremeScore).toBe(95);
    expect(extremeScore).toBeLessThanOrEqual(SCORING_BOUNDS.MAX);
  });

  it("calculateHealthScore clamps extreme toxicological & UPF penalties to minimum 15", () => {
    const heavilyProcessedScore = calculateHealthScore({
      base: 70,
      penaltyNova: 35,
      penaltyAdditives: 40,
      penaltySugar: 20,
      penaltyTrans: 10,
    });
    // 70 - 105 = -35 -> clamped to 15
    expect(heavilyProcessedScore).toBe(15);
    expect(heavilyProcessedScore).toBeGreaterThanOrEqual(SCORING_BOUNDS.MIN);
  });

  it("evaluates typical realistic UPF vs Whole Food scenarios", () => {
    // Whole food: raw fruit / nuts
    const wholeFood = calculateHealthScore({
      base: 70,
      bonusWhole: 10,
      bonusFiber: 5,
    });
    expect(wholeFood).toBe(85);

    // Moderate processed food: artisan bread with mild salt
    const moderateFood = calculateHealthScore({
      base: 70,
      bonusFiber: 3,
      penaltyNova: 10,
    });
    expect(moderateFood).toBe(63);

    // UPF junk food: soda with artificial sweeteners and dyes
    const upfFood = calculateHealthScore({
      base: 70,
      penaltyNova: 30,
      penaltyAdditives: 20,
      penaltySugar: 15,
    });
    expect(upfFood).toBe(15);
  });
});
