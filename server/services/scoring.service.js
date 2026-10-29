/**
 * ScanBeforeEat Transparent Educational Product Profile Scoring Algorithm (v1.0)
 * 
 * IMPORTANT DISCLAIMER:
 * This score is an educational profile indicator designed to assist consumers in understanding
 * food label density and nutritional context. It is NOT a clinical health measurement,
 * diagnostic outcome, or individual probability of disease.
 */

export const SCORING_METHODOLOGY_VERSION = '1.0';

export function calculateEducationalScore({ ingredients = [], nutrition = null }) {
  if (!ingredients || ingredients.length === 0) {
    return {
      score: null,
      methodologyVersion: SCORING_METHODOLOGY_VERSION,
      reason: 'Insufficient ingredient data to establish an educational profile score.'
    };
  }

  let score = 70; // Baseline neutral score for packaged food
  const factors = [];

  // 1. Evaluate Ingredients Base & Categories
  let wholeFoodCount = 0;
  let highConcernCount = 0;
  let allergenCount = 0;

  for (const ing of ingredients) {
    const text = (ing.originalText || ing.normalizedName || '').toLowerCase();
    const rating = ing.rating || '';

    // Check for whole grain / plant foundation
    if (
      text.includes('whole wheat') ||
      text.includes('rolled oats') ||
      text.includes('almond') ||
      text.includes('chia') ||
      text.includes('lentil') ||
      text.includes('vegetable') ||
      text.includes('fruit') ||
      text.includes('tomato')
    ) {
      wholeFoodCount++;
    }

    // Check for hydrogenated oils / trans fat indicators
    if (text.includes('partially hydrogenated') || text.includes('hydrogenated vegetable oil')) {
      score -= 20;
      factors.push('Presence of hydrogenated oils (-20)');
    }

    if (rating === 'requires_caution') {
      highConcernCount++;
      score -= 8;
      factors.push(`Ingredient requiring caution: ${ing.normalizedName} (-8)`);
    } else if (rating === 'potential_allergen') {
      allergenCount++;
    }
  }

  if (wholeFoodCount > 0) {
    const bonus = Math.min(wholeFoodCount * 4, 15);
    score += bonus;
    factors.push(`Wholesome whole-food / grain ingredients detected (+${bonus})`);
  }

  // 2. Evaluate Nutrition Facts if available
  if (nutrition && typeof nutrition === 'object') {
    const sugar = parseFloat(nutrition.sugarG || nutrition.sugars_100g || nutrition.addedSugarG || 0);
    const sodium = parseFloat(nutrition.sodiumMg || nutrition.sodium_100g || 0);
    const satFat = parseFloat(nutrition.saturatedFatG || nutrition.saturated_fat_100g || 0);
    const fiber = parseFloat(nutrition.fiberG || nutrition.fiber_100g || 0);
    const protein = parseFloat(nutrition.proteinG || nutrition.protein_100g || 0);

    if (sugar > 15) {
      score -= 15;
      factors.push(`Elevated sugar content: ${sugar}g (-15)`);
    } else if (sugar > 8) {
      score -= 8;
      factors.push(`Moderate sugar content: ${sugar}g (-8)`);
    } else if (sugar > 0 && sugar <= 4) {
      score += 4;
      factors.push(`Low sugar content (+4)`);
    }

    if (sodium > 600) {
      score -= 15;
      factors.push(`High sodium content: ${sodium}mg (-15)`);
    } else if (sodium > 350) {
      score -= 7;
      factors.push(`Moderate sodium content: ${sodium}mg (-7)`);
    }

    if (satFat > 5) {
      score -= 10;
      factors.push(`Elevated saturated fat: ${satFat}g (-10)`);
    }

    if (fiber >= 3) {
      score += 8;
      factors.push(`Beneficial dietary fiber: ${fiber}g (+8)`);
    }

    if (protein >= 6) {
      score += 5;
      factors.push(`Beneficial protein density: ${protein}g (+5)`);
    }
  }

  // Clamp final score between 10 and 98 (avoid 100 or 0 to discourage false absolutism)
  const finalScore = Math.max(15, Math.min(95, Math.round(score)));

  return {
    score: finalScore,
    methodologyVersion: SCORING_METHODOLOGY_VERSION,
    factors,
    reason: `Calculated from ${ingredients.length} identified ingredients${nutrition ? ' and verified nutritional values' : ' (nutritional panel not provided)'}.`
  };
}

export default calculateEducationalScore;
