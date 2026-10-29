import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEducationalScore, SCORING_METHODOLOGY_VERSION } from '../../services/scoring.service.js';

test('Educational scoring algorithm (v1.0)', async (t) => {
  await t.test('returns null when no ingredients are provided', () => {
    const res = calculateEducationalScore({ ingredients: [] });
    assert.equal(res.score, null);
    assert.equal(res.methodologyVersion, SCORING_METHODOLOGY_VERSION);
  });

  await t.test('rewards whole-food foundation and fiber', () => {
    const ingredients = [
      { originalText: 'Whole Wheat Flour', normalizedName: 'Whole Wheat Flour', rating: 'generally_recognized_as_safe' },
      { originalText: 'Rolled Oats', normalizedName: 'Rolled Oats', rating: 'generally_recognized_as_safe' }
    ];
    const nutrition = {
      fiberG: 5,
      proteinG: 8,
      sugarG: 2,
      sodiumMg: 80
    };

    const res = calculateEducationalScore({ ingredients, nutrition });
    assert.ok(res.score >= 80, `Expected high score, got ${res.score}`);
    assert.ok(res.factors.some(f => f.includes('Wholesome')), 'Expected wholesome bonus factor');
  });

  await t.test('deducts for high added sugar, sodium, and saturated fat', () => {
    const ingredients = [
      { originalText: 'Refined Sugar', normalizedName: 'Sugar', rating: 'context_dependent' },
      { originalText: 'Partially Hydrogenated Palm Oil', normalizedName: 'Palm Oil', rating: 'context_dependent' }
    ];
    const nutrition = {
      sugarG: 32,
      sodiumMg: 850,
      saturatedFatG: 9
    };

    const res = calculateEducationalScore({ ingredients, nutrition });
    assert.ok(res.score <= 50, `Expected penalized score, got ${res.score}`);
  });

  await t.test('clamps score within safe educational bounds (15 to 95)', () => {
    // Extremely unwholesome hypothetical item
    const resLow = calculateEducationalScore({
      ingredients: [
        { originalText: 'partially hydrogenated oil', rating: 'requires_caution' },
        { originalText: 'artificial sweetener', rating: 'requires_caution' }
      ],
      nutrition: { sugarG: 80, sodiumMg: 2000, saturatedFatG: 25 }
    });
    assert.ok(resLow.score >= 15, 'Score should not drop below 15');

    // Extremely wholesome hypothetical item
    const resHigh = calculateEducationalScore({
      ingredients: [
        { originalText: 'whole wheat', rating: 'generally_recognized_as_safe' },
        { originalText: 'rolled oats', rating: 'generally_recognized_as_safe' },
        { originalText: 'chia seeds', rating: 'generally_recognized_as_safe' },
        { originalText: 'almonds', rating: 'generally_recognized_as_safe' }
      ],
      nutrition: { fiberG: 12, proteinG: 15, sugarG: 0, sodiumMg: 10 }
    });
    assert.ok(resHigh.score <= 95, 'Score should not exceed 95');
  });
});
