/**
 * SHIFt Zod Schemas
 * 
 * Runtime validation for the implicit SHIFt inference engine
 */

import { z } from 'zod';

// ============================================================================
// BASE ENUMS & TYPES
// ============================================================================

export const ElementZ = z.enum(['fire', 'earth', 'water', 'air', 'aether']);
export const PhaseZ = z.enum(['initiation', 'grounding', 'collaboration', 'transformation', 'completion']);

export const FacetCodeZ = z.enum([
  'F1_Meaning', 'F2_Courage',
  'E1_Coherence', 'E2_Grounding',
  'W1_Attunement', 'W2_Belonging',
  'A1_Reflection', 'A2_Adaptability',
  'AE1_Values', 'AE2_Fulfillment',
  'C1_Integration', 'C2_Integrity'
]);

// ============================================================================
// SIGNAL SCHEMAS
// ============================================================================

export const ConversationalSignalsZ = z.object({
  meaningDensity: z.number().min(0).max(1),
  actionCommitmentCount: z.number().int().min(0),
  truthNaming: z.boolean(),
  coherenceMarkers: z.number().min(0).max(1),
  routineLanguage: z.number().min(0).max(1),
  affectRegulationOk: z.number().min(0).max(1),
  reciprocityIndex: z.number().min(0).max(1),
  metaReferences: z.number().min(0).max(1),
  valuesHits: z.number().int().min(0),
  wholenessReferences: z.number().min(0).max(1),
  integrationCommitment: z.boolean(),
  integrityRepair: z.boolean()
});

export const BehavioralSignalsZ = z.object({
  streakDays: z.number().int().min(0),
  journalsLast7Days: z.number().int().min(0).max(7),
  ritualsLast7Days: z.number().int().min(0).max(7),
  tasksCompletionRate: z.number().min(0).max(1),
  ontimeRate: z.number().min(0).max(1),
  helpSeekingAppropriate: z.boolean()
});

export const ContentQualitySignalsZ = z.object({
  readabilityVariance: z.number().min(0),
  sentimentVariance: z.number().min(0),
  avoidanceScore: z.number().min(0).max(1)
});

export const BioEmbodiedSignalsZ = z.object({
  hrvTrend: z.number().optional(),
  sleepRegularity: z.number().min(0).max(1).optional()
}).optional();

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const FacetScoreZ = z.object({
  code: FacetCodeZ,
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  delta7d: z.number(),
  evidenceWeights: z.record(z.string(), z.number()),
  source: z.enum(['implicit', 'explicit', 'blended'])
});

export const ElementalProfileZ = z.object({
  fire: z.number().min(0).max(100),
  earth: z.number().min(0).max(100),
  water: z.number().min(0).max(100),
  air: z.number().min(0).max(100),
  aether: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1)
});

export const PhaseInferenceZ = z.object({
  primary: PhaseZ,
  primaryConfidence: z.number().min(0).max(1),
  secondary: PhaseZ,
  secondaryConfidence: z.number().min(0).max(1),
  logits: z.record(PhaseZ, z.number())
});

export const SuggestedPracticeZ = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  targetFacets: z.array(FacetCodeZ),
  durationMinutes: z.number().int().positive()
});

export const SHIFtAlertZ = z.object({
  code: z.enum(['low_grounding', 'avoidance_spike', 'calibration_needed', 'phase_transition']),
  severity: z.enum(['info', 'warning', 'action']),
  message: z.string(),
  recommendation: z.string(),
  facetsAffected: z.array(FacetCodeZ)
});

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const SHIFtIngestRequestZ = z.object({
  userId: z.string(),
  sessionId: z.string(),
  text: z.string().optional(),
  events: z.array(z.object({
    type: z.string(),
    timestamp: z.string().datetime(),
    payload: z.any()
  })).optional(),
  metrics: z.object({
    streakDays: z.number().int().min(0).optional(),
    tasksCompleted: z.number().int().min(0).optional(),
    journalEntries: z.number().int().min(0).optional()
  }).optional()
});

export const SHIFtComputeRequestZ = z.object({
  userId: z.string(),
  windowDays: z.number().int().positive().default(28),
  includeExplicit: z.boolean().default(true)
});

export const SHIFtProfileResponseZ = z.object({
  elements: ElementalProfileZ,
  facets: z.array(z.object({
    code: FacetCodeZ,
    label: z.string(),
    score: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    delta7d: z.number()
  })),
  phase: z.object({
    primary: PhaseZ,
    primaryConfidence: z.number().min(0).max(1),
    secondary: PhaseZ,
    secondaryConfidence: z.number().min(0).max(1)
  }),
  narrative: z.string(),
  practice: z.object({
    title: z.string(),
    steps: z.array(z.string())
  }).optional(),
  alerts: z.array(z.object({
    code: z.string(),
    message: z.string()
  })).optional()
});

// ============================================================================
// EXPLICIT SURVEY SCHEMAS (for your survey items)
// ============================================================================

export const SurveyItemResponseZ = z.object({
  itemId: z.string(),
  facetCode: FacetCodeZ,
  response: z.number().int().min(1).max(7), // 1-7 Likert scale
  timestamp: z.string().datetime()
});

export const ExplicitSurveyResponseZ = z.object({
  userId: z.string(),
  sessionId: z.string(),
  version: z.string(),
  items: z.array(SurveyItemResponseZ),
  completedAt: z.string().datetime()
});

// Survey items for explicit testing
export const SHIFT_SURVEY_ITEMS = [
  // Fire - Meaning & Inspiration
  { id: 'F1_1', facet: 'F1_Meaning', text: "I feel a spark of purpose that guides me, even when life feels uncertain." },
  { id: 'F1_2', facet: 'F1_Meaning', text: "My daily actions connect to something larger than myself." },
  { id: 'F2_1', facet: 'F2_Courage', text: "I'm willing to name difficult truths, even when it's uncomfortable." },
  { id: 'F2_2', facet: 'F2_Courage', text: "When I imagine my future, I see a vision worth pursuing." },
  
  // Earth - Coherence & Grounding
  { id: 'E1_1', facet: 'E1_Coherence', text: "The path I'm walking feels solid, as though each step builds on the last." },
  { id: 'E1_2', facet: 'E1_Coherence', text: "My past choices and current direction feel aligned." },
  { id: 'E2_1', facet: 'E2_Grounding', text: "The way I live day to day matches the life I say I want." },
  { id: 'E2_2', facet: 'E2_Grounding', text: "I have reliable practices that keep me centered." },
  
  // Water - Connection & Emotional Flow
  { id: 'W1_1', facet: 'W1_Attunement', text: "My emotions move through me like a river—I can feel them without being swept away." },
  { id: 'W1_2', facet: 'W1_Attunement', text: "I notice and honor the full range of what I feel." },
  { id: 'W2_1', facet: 'W2_Belonging', text: "I feel supported and held by the communities I belong to." },
  { id: 'W2_2', facet: 'W2_Belonging', text: "I offer care and compassion as easily as I receive it." },
  
  // Air - Reflection & Adaptability
  { id: 'A1_1', facet: 'A1_Reflection', text: "I regularly step back to make sense of my experiences." },
  { id: 'A1_2', facet: 'A1_Reflection', text: "I can observe my thoughts without being controlled by them." },
  { id: 'A2_1', facet: 'A2_Adaptability', text: "When things change, I can reimagine my path without losing my center." },
  { id: 'A2_2', facet: 'A2_Adaptability', text: "Curiosity leads me to reframe challenges in new ways." },
  
  // Aether - Fulfillment & Values Integration
  { id: 'AE1_1', facet: 'AE1_Values', text: "My life expresses what I most deeply value." },
  { id: 'AE1_2', facet: 'AE1_Values', text: "My actions and choices reflect my core principles." },
  { id: 'AE2_1', facet: 'AE2_Fulfillment', text: "I sense a harmony between who I am, what I do, and the larger whole I belong to." },
  { id: 'AE2_2', facet: 'AE2_Fulfillment', text: "Even with unfinished dreams, I feel my life carries meaning." },
  
  // Cross-cutting - Integration & Integrity
  { id: 'C1_1', facet: 'C1_Integration', text: "I actively practice integrating new insights into my daily life." },
  { id: 'C1_2', facet: 'C1_Integration', text: "When I learn something important, I find ways to embody it." },
  { id: 'C2_1', facet: 'C2_Integrity', text: "My words and actions are in alignment." },
  { id: 'C2_2', facet: 'C2_Integrity', text: "When I notice a gap between what I say and do, I take steps to close it." }
] as const;

// Pulse version (5-10 items for frequent use)
export const SHIFT_PULSE_ITEMS = [
  { id: 'P_F1', facet: 'F1_Meaning', text: "I feel connected to my purpose today." },
  { id: 'P_E2', facet: 'E2_Grounding', text: "My daily practices are keeping me grounded." },
  { id: 'P_W1', facet: 'W1_Attunement', text: "I'm able to feel and move through my emotions." },
  { id: 'P_A1', facet: 'A1_Reflection', text: "I've taken time to reflect on recent experiences." },
  { id: 'P_C2', facet: 'C2_Integrity', text: "My actions today match my intentions." }
] as const;