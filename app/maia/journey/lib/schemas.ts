/**
 * Zod Validation Schemas - Journey Page Phase 2
 *
 * Runtime validation schemas matching TypeScript types from types/index.ts
 * Used for API response validation and data integrity checks.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Created: December 23, 2024
 */

import { z } from 'zod';

// ============================================================================
// Thread Schemas (💧 Water Layer)
// ============================================================================

export const ThreadSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string(),
  weekNumber: z.number(),
  coherence: z.number().min(0).max(1),
  timestamp: z.string().datetime(),
  elementType: z.enum(['water', 'fire', 'earth', 'air', 'aether']),
  facetCode: z.string().optional(),
});

export const ThreadsResponseSchema = z.object({
  threads: z.array(ThreadSchema),
  count: z.number(),
});

export type ThreadsResponse = z.infer<typeof ThreadsResponseSchema>;

// ============================================================================
// Insight Schemas (🌬️ Air Layer)
// ============================================================================

export const InsightSchema = z.object({
  id: z.string(),
  type: z.enum(['pattern', 'reflection', 'question']),
  text: z.string(),
  confidence: z.number().min(0).max(1),
  relatedThreadIds: z.array(z.number()),
  timestamp: z.string().datetime(),
});

export const InsightsResponseSchema = z.object({
  insights: z.array(InsightSchema),
  count: z.number(),
});

export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;

// ============================================================================
// Symbol Schemas (🌬️ Air Layer)
// ============================================================================

export const SymbolSchema = z.object({
  id: z.string(),
  label: z.string(),
  archetype: z.string(),
  frequency: z.number(),
  threadIds: z.array(z.number()),
  color: z.string(),
});

export const SymbolsResponseSchema = z.object({
  symbols: z.array(SymbolSchema),
  count: z.number(),
});

export type SymbolsResponse = z.infer<typeof SymbolsResponseSchema>;

// ============================================================================
// Synthesis Schemas (✨ Aether Layer)
// ============================================================================

export const MotifSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  frequency: z.number(),
  significance: z.number().min(0).max(1),
  description: z.string(),
});

export const CycleSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.number(), // days
  amplitude: z.number().min(0).max(1),
  phase: z.number().min(0).max(1),
  description: z.string(),
});

export const SynthesisReportSchema = z.object({
  motifs: z.array(MotifSchema),
  cycles: z.array(CycleSchema),
  growthArc: z.string(),
  coherenceTrend: z.number(),
  timestamp: z.string().datetime(),
});

export const SynthesisResponseSchema = z.object({
  report: SynthesisReportSchema,
  threadCount: z.number(),
});

export type SynthesisResponse = z.infer<typeof SynthesisResponseSchema>;

// ============================================================================
// Collective Coherence Schemas (✨ Aether Layer)
// ============================================================================

export const CollectiveCoherenceSchema = z.object({
  groupCoherence: z.number().min(0).max(1),
  participantCount: z.number(),
  trend: z.enum(['rising', 'stable', 'declining']),
  timestamp: z.string().datetime(),
});

export const CollectiveCoherenceResponseSchema = z.object({
  coherence: CollectiveCoherenceSchema,
});

export type CollectiveCoherenceResponse = z.infer<typeof CollectiveCoherenceResponseSchema>;

// ============================================================================
// Biofield Schemas (🫀 Earth Layer)
// ============================================================================

export const BiofieldDataSchema = z.object({
  hrvData: z.object({
    rmssd: z.number(),
    sdnn: z.number(),
    coherenceScore: z.number().min(0).max(1),
    timestamp: z.string().datetime(),
  }),
  voiceData: z.object({
    prosody: z.number().min(0).max(1),
    affect: z.number().min(0).max(1),
    energyLevel: z.number().min(0).max(1),
    timestamp: z.string().datetime(),
  }),
});

export const BiofieldResponseSchema = z.object({
  biofield: BiofieldDataSchema,
});

export type BiofieldResponse = z.infer<typeof BiofieldResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Safely parse and validate API response data
 * @param schema - Zod schema to validate against
 * @param data - Raw data from API response
 * @returns Validated data or null if validation fails
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    console.error('[Schema Validation Error]', result.error.format());
    return { success: false, error: result.error };
  }
}

/**
 * Validate response and throw if invalid (useful for hooks)
 * @param schema - Zod schema to validate against
 * @param data - Raw data from API response
 * @returns Validated data
 * @throws ZodError if validation fails
 */
export function assertValidResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// ============================================================================
// Exports
// ============================================================================

export const schemas = {
  thread: ThreadSchema,
  threads: ThreadsResponseSchema,
  insight: InsightSchema,
  insights: InsightsResponseSchema,
  symbol: SymbolSchema,
  symbols: SymbolsResponseSchema,
  motif: MotifSchema,
  cycle: CycleSchema,
  synthesis: SynthesisReportSchema,
  synthesisResponse: SynthesisResponseSchema,
  collectiveCoherence: CollectiveCoherenceSchema,
  collectiveCoherenceResponse: CollectiveCoherenceResponseSchema,
  biofield: BiofieldDataSchema,
  biofieldResponse: BiofieldResponseSchema,
};
