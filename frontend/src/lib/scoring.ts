/**
 * Scientific Scoring Model & Algorithmic Bounds
 * Based on the 4-Pillar Algorithmic Architecture (NOVA, EFSA/FDA toxicology, Nutrient density, Clinical studies)
 * Defined in /methodology
 */

export const SCORING_BOUNDS = {
  BASE: 70,
  MIN: 15,
  MAX: 95,
  MAX_BONUS: 15,
  MAX_PENALTY_NOVA: 35,
  MAX_PENALTY_ADDITIVES: 40,
  MAX_PENALTY_SUGAR_TRANS: 25,
} as const;

export interface ScoreParameters {
  base?: number;
  bonusWhole?: number;
  bonusFiber?: number;
  bonusProtein?: number;
  penaltyNova?: number;
  penaltyAdditives?: number;
  penaltySugar?: number;
  penaltyTrans?: number;
}

/**
 * Clamps any raw score within the strict deterministic boundaries [15, 95]
 */
export function clampScore(score: number): number {
  return Math.max(SCORING_BOUNDS.MIN, Math.min(SCORING_BOUNDS.MAX, Math.round(score)));
}

/**
 * Calculates deterministic composite health score based on the methodology formula:
 * Score = max(15, min(95, round(70 + B_whole + B_fiber + B_protein - P_nova - P_additives - P_sugar - P_trans)))
 */
export function calculateHealthScore(params: ScoreParameters = {}): number {
  const base = params.base ?? SCORING_BOUNDS.BASE;
  const bonusWhole = Math.max(0, params.bonusWhole ?? 0);
  const bonusFiber = Math.max(0, params.bonusFiber ?? 0);
  const bonusProtein = Math.max(0, params.bonusProtein ?? 0);

  // Bonus points are capped at MAX_BONUS (+15)
  const totalBonuses = Math.min(SCORING_BOUNDS.MAX_BONUS, bonusWhole + bonusFiber + bonusProtein);

  const penaltyNova = Math.max(0, params.penaltyNova ?? 0);
  const penaltyAdditives = Math.max(0, params.penaltyAdditives ?? 0);
  const penaltySugar = Math.max(0, params.penaltySugar ?? 0);
  const penaltyTrans = Math.max(0, params.penaltyTrans ?? 0);

  const totalPenalties = penaltyNova + penaltyAdditives + penaltySugar + penaltyTrans;
  const rawScore = base + totalBonuses - totalPenalties;

  return clampScore(rawScore);
}
