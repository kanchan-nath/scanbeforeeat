import test from 'node:test';
import assert from 'node:assert/strict';
import { aiReportSchema } from '../../schemas/ai-report.schema.js';
import { generateMockAnalysis } from '../../services/ai.service.js';

test('AI Analysis schema & deterministic mock engine', async (t) => {
  await t.test('generates valid report compliant with aiReportSchema', () => {
    const rawMock = generateMockAnalysis({
      ingredientsText: 'Whole wheat flour, sugar, edible palm oil, cocoa solids, salt, INS 322 soy lecithin.',
      productName: 'Choco Biscuit'
    });

    const validated = aiReportSchema.parse(rawMock);
    assert.equal(validated.schemaVersion, '1.0');
    assert.ok(validated.ingredients.length >= 5, 'Parsed at least 5 ingredients');
    assert.ok(validated.overallAssessment.score > 0, 'Produced score');
    assert.ok(validated.overallAssessment.verdict.length > 0, 'Produced verdict');
    assert.ok(validated.sources.length > 0, 'Included authoritative sources');
    assert.ok(validated.disclaimer.includes('Educational'), 'Included disclaimer');
  });

  await t.test('rejects report missing ingredients array', () => {
    const invalidReport = {
      schemaVersion: '1.0',
      inputQuality: { ingredientListConfirmed: true, nutritionDataAvailable: false, limitations: [] },
      ingredients: [], // min 1 required
      overallAssessment: {
        verdict: 'Consider moderation',
        score: 60,
        scoreMethodologyVersion: '1.0',
        explanation: ['Test']
      },
      disclaimer: 'Valid disclaimer for testing purposes.'
    };

    assert.throws(() => {
      aiReportSchema.parse(invalidReport);
    });
  });
});
