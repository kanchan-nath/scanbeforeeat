import { z } from 'zod';

export const evidenceQualityEnum = z.enum(['strong', 'limited', 'none', 'context_dependent']);

export const identificationStatusEnum = z.enum(['confirmed', 'probable', 'unknown']);

export const ingredientRatingEnum = z.enum([
  'generally_recognized_as_safe',
  'low_concern',
  'context_dependent',
  'requires_caution',
  'insufficient_evidence',
  'potential_allergen'
]);

export const otherUseCategoryEnum = z.enum([
  'other_foods',
  'cosmetics',
  'pharmaceuticals',
  'industrial',
  'food_processing'
]);

export const timelineStageEnum = z.enum([
  'single_serving',
  'repeated_consumption',
  'months',
  'years',
  'dietary_pattern'
]);

export const verdictEnum = z.enum([
  'Generally reasonable in context',
  'Consider moderation',
  'Review specific ingredients or dietary needs',
  'Insufficient information for a reliable assessment'
]);

export const sourceCitationSchema = z.object({
  title: z.string().min(1).max(300),
  organization: z.string().min(1).max(150),
  year: z.string().max(20).optional().default(''),
  url: z.string().url().max(500).optional().nullable()
});

export const ingredientBenefitSchema = z.object({
  description: z.string().min(1).max(500),
  evidenceQuality: evidenceQualityEnum.default('limited'),
  nutrientContributed: z.string().max(100).optional()
});

export const ingredientConcernSchema = z.object({
  description: z.string().min(1).max(500),
  targetPopulation: z.string().max(200).optional().default('General population'),
  riskDependency: z.string().max(200).optional().default('Dose and frequency dependent'),
  evidenceQuality: evidenceQualityEnum.default('limited'),
  sourceTitle: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional().nullable()
});

export const ingredientOtherUseSchema = z.object({
  category: otherUseCategoryEnum,
  exampleUse: z.string().min(1).max(200),
  notes: z.string().max(300).optional().default('Food grade formulation differs from industrial grades.')
});

export const singleIngredientReportSchema = z.object({
  originalText: z.string().min(1).max(200),
  normalizedName: z.string().min(1).max(200),
  identificationStatus: identificationStatusEnum.default('confirmed'),
  insNumber: z.string().max(50).optional().nullable(),
  category: z.string().max(100).default('general_ingredient'),
  function: z.string().min(1).max(400),
  benefits: z.array(ingredientBenefitSchema).default([]),
  concerns: z.array(ingredientConcernSchema).default([]),
  rating: ingredientRatingEnum.default('low_concern'),
  ratingReason: z.string().max(400).optional().default('Evaluated based on standard public health and regulatory authority records.'),
  otherUses: z.array(ingredientOtherUseSchema).default([]),
  confidenceScore: z.number().min(0).max(100).optional().default(90)
});

export const nutritionObservedSchema = z.object({
  nutrient: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  perServing: z.string().max(100).optional(),
  context: z.string().max(300).optional()
});

export const longTermEvidenceSchema = z.object({
  stage: timelineStageEnum,
  evidenceSummary: z.string().min(1).max(600),
  evidenceQuality: evidenceQualityEnum.default('limited')
});

export const diseaseRiskEvidenceSchema = z.object({
  condition: z.string().min(1).max(150),
  summary: z.string().min(1).max(600),
  distinctionNote: z.string().max(400).default('Reflects overall dietary pattern associations, not an isolated causative effect of a single ingredient.'),
  hasNumericProbability: z.boolean().default(false),
  numericProbabilityPercent: z.number().nullable().optional(),
  probabilityExplanation: z.string().max(400).default('No reliable percentage is available for this specific ingredient and consumption pattern.'),
  sources: z.array(sourceCitationSchema).default([])
});

export const aiReportSchema = z.object({
  schemaVersion: z.string().default('1.0'),
  isDemonstration: z.boolean().optional().default(false),
  product: z.object({
    name: z.string().nullable().optional().default(null),
    brand: z.string().nullable().optional().default(null),
    category: z.string().nullable().optional().default(null)
  }).default({}),
  inputQuality: z.object({
    ingredientListConfirmed: z.boolean().default(true),
    nutritionDataAvailable: z.boolean().default(false),
    limitations: z.array(z.string()).default([])
  }),
  ingredients: z.array(singleIngredientReportSchema).min(1, 'At least one ingredient must be parsed'),
  allergenWarnings: z.array(z.string()).default([]),
  nutritionSummary: z.object({
    dataAvailable: z.boolean().default(false),
    observedValues: z.array(nutritionObservedSchema).default([]),
    limitations: z.array(z.string()).default([])
  }).default({ dataAvailable: false, observedValues: [], limitations: [] }),
  longTermEvidence: z.array(longTermEvidenceSchema).default([]),
  diseaseRiskEvidence: z.array(diseaseRiskEvidenceSchema).default([]),
  overallAssessment: z.object({
    verdict: verdictEnum,
    score: z.number().int().min(0).max(100).nullable().default(null),
    scoreMethodologyVersion: z.string().nullable().default('1.0'),
    explanation: z.array(z.string()).min(1)
  }),
  sources: z.array(sourceCitationSchema).default([]),
  disclaimer: z.string().min(10)
});

export default aiReportSchema;
