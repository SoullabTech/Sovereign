/**
 * Zod validation schemas for retreat afferent streams
 * Provides runtime validation for ceremony data flowing into Neural Reservoir
 */

import { z } from 'zod';

export const GroupHandleZ = z.object({
  groupId: z.string().uuid(),
  cohort: z.string().optional(),
  facilitatorId: z.string().optional(),
  participantCount: z.number().int().positive().max(500).optional(),
});

export const PhenomenologyZ = z.object({
  grounding: z.number().min(0).max(1),
  emotionalIntensity: z.number().min(0).max(1),
  cognitiveClarity: z.number().min(0).max(1),
  openness: z.number().min(0).max(1),
  integrationLoad: z.number().min(0).max(1).optional(),
  notes: z.string().max(280).optional(),
});

export const ElementalResonanceZ = z.object({
  fire: z.number().min(0).max(1).optional(),
  water: z.number().min(0).max(1).optional(),
  earth: z.number().min(0).max(1).optional(),
  air: z.number().min(0).max(1).optional(),
  aether: z.number().min(0).max(1).optional(),
}).partial().optional();

export const ArchetypeActivationZ = z.record(z.string(), z.number().min(0).max(1)).optional();

export const ShadowSignalsZ = z.object({
  deflection: z.number().min(0).max(1).optional(),
  perfectionism: z.number().min(0).max(1).optional(),
  victimLoop: z.number().min(0).max(1).optional(),
  avoidance: z.number().min(0).max(1).optional(),
  collapse: z.number().min(0).max(1).optional(),
  aggression: z.number().min(0).max(1).optional(),
  notes: z.string().max(200).optional(),
}).partial().optional();

export const SafetySignalsZ = z.object({
  overwhelmRisk: z.enum(['low','medium','high']).optional(),
  crisisHint: z.boolean().optional(),
  needsGrounding: z.boolean().optional(),
  needsSlowing: z.boolean().optional(),
}).partial().optional();

export const RetreatAfferentZ = z.object({
  kind: z.enum(['personal', 'retreat']),
  phase: z.enum(['pre','active','post']),
  group: GroupHandleZ,
  userIdHash: z.string().min(16),
  sessionId: z.string().optional(),
  ts: z.string().datetime(),
  
  // Core phenomenological data
  phenomenology: PhenomenologyZ,
  resonance: ElementalResonanceZ,
  archetypes: ArchetypeActivationZ,
  
  // Evolution tracking
  spiralPhaseHint: z.enum(['initiation','challenge','integration','mastery','transcendence']).optional(),
  evolutionVelocity: z.number().min(-1).max(1).optional(),
  shadow: ShadowSignalsZ,
  
  // Ceremony context
  ritualStage: z.string().max(64).optional(),
  containerState: z.enum(['coherent','wobbly','fragmented']).optional(),
  safety: SafetySignalsZ,
  
  // Provenance
  source: z.enum(['personalizedOracleAgent','facilitatorConsole','system']),
  version: z.string().default('retreat.v1'),
});

// Export type inference
export type RetreatAfferentValidated = z.infer<typeof RetreatAfferentZ>;