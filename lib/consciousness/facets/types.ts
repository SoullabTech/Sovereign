/**
 * Elemental Facet Types — Canonical type definitions for the Inner Guide Field
 *
 * Based on Kelly Nezat's Elemental Alchemy framework (5 elements × 3 phases = 15 facets)
 * and Edward Steinbrecher's Inner Guide Meditation tradition.
 *
 * These types are the single source of truth for the facet system.
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════
// CORE ENUMS
// ═══════════════════════════════════════════════════════════════════════

export const ElementNameSchema = z.enum([
  'Water', 'Fire', 'Air', 'Earth', 'Aether',
]);
export type ElementName = z.infer<typeof ElementNameSchema>;

export const FacetIdSchema = z.enum([
  'water_1', 'water_2', 'water_3',
  'fire_1', 'fire_2', 'fire_3',
  'air_1', 'air_2', 'air_3',
  'earth_1', 'earth_2', 'earth_3',
  'aether_1', 'aether_2', 'aether_3',
]);
export type FacetId = z.infer<typeof FacetIdSchema>;

// ═══════════════════════════════════════════════════════════════════════
// FACET STRUCTURE
// ═══════════════════════════════════════════════════════════════════════

export const EncounterTypeSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  function: z.string(),
});
export type EncounterType = z.infer<typeof EncounterTypeSchema>;

export const FacetSchema = z.object({
  id: FacetIdSchema,
  element: ElementNameSchema,
  phase: z.number().int().min(1).max(3),
  title: z.string(),
  coreTheme: z.string(),
  psychologicalFunction: z.string(),
  developmentalTask: z.string(),
  commonSigns: z.array(z.string()),
  distortions: z.array(z.string()),
  archetype: z.object({
    primary: z.string(),
    shadow: z.string(),
    framing: z.string(),
  }),
  tarot: z.object({
    suit: z.string(),
    cards: z.array(z.string()),
    interpretation: z.string(),
  }),
  astrology: z.object({
    planets: z.array(z.string()),
    domains: z.array(z.string()),
    summary: z.string(),
  }),
  encounterTypes: z.array(EncounterTypeSchema),
  guide: z.object({
    role: z.string(),
    mode: z.array(z.string()),
    appearance: z.array(z.string()),
  }),
  meditationPrompt: z.string(),
  dialoguePrompts: z.array(z.string()),
  integration: z.object({
    actions: z.array(z.string()),
    grounding: z.array(z.string()),
    nextMovement: z.array(FacetIdSchema),
  }),
});
export type Facet = z.infer<typeof FacetSchema>;

// ═══════════════════════════════════════════════════════════════════════
// DETECTION / ROUTING TYPES
// ═══════════════════════════════════════════════════════════════════════

export const ElementDetectionSchema = z.object({
  element: ElementNameSchema,
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
});
export type ElementDetection = z.infer<typeof ElementDetectionSchema>;

export const FacetRouteResultSchema = z.object({
  facetId: FacetIdSchema,
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
});
export type FacetRouteResult = z.infer<typeof FacetRouteResultSchema>;

// ═══════════════════════════════════════════════════════════════════════
// MOVEMENT / STATE
// ═══════════════════════════════════════════════════════════════════════

export type FacetMovement = 'ascending' | 'descending' | 'stuck' | 'transitioning' | 'integrating';

export interface FacetSignal {
  facetId: FacetId;
  element: ElementName;
  phase: number;
  confidence: number;
  movement: FacetMovement;
  reasons: string[];
}

export interface FacetState {
  facet_id: string | null;
  facet_movement: string | null;
  element: string | null;
  phase: number | null;
  confidence: number | null;
}
