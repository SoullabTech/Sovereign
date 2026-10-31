/**
 * Soullab's living design grammar — activity, not a matching skin.
 *
 * The person chooses the atmosphere; the current author-selected WORKING
 * ACTIVITY determines the environment's presentation rhythm. No prose,
 * psychological state, identity, pricing plan, skill score, astrology,
 * emotional profile, or inferred relationship changes these attributes.
 *
 * This module is pure and reusable across Soullab; Writer's Studio is the
 * initial implemented consumer, not a requirement that other studios look
 * identical.
 */
export const WORLD_DESIGN_PRINCIPLES = [
  'human_scale',
  'author_agency',
  'quiet_depth',
  'contextual_presence',
  'reversible_presentation',
  'shared_world_not_matching_rooms',
] as const;

export const WRITER_WORLD_INTENTS = {
  home: {
    intent: 'arrival', rhythm: 'spacious',
    priority: 'orientation', maia: 'invited',
  },
  write: {
    intent: 'composition', rhythm: 'uninterrupted',
    priority: 'manuscript', maia: 'summoned',
  },
  develop: {
    intent: 'exploration', rhythm: 'open',
    priority: 'one_question', maia: 'in_relation',
  },
  review: {
    intent: 'discernment', rhythm: 'deliberate',
    priority: 'comparison', maia: 'witness',
  },
  listen: {
    intent: 'resonance', rhythm: 'unhurried',
    priority: 'listening', maia: 'invited',
  },
  publish: {
    intent: 'offering', rhythm: 'purposeful',
    priority: 'release_readiness', maia: 'advisor',
  },
} as const;

export type WriterWorldMode = keyof typeof WRITER_WORLD_INTENTS;
export type LivingWorldIntent = typeof WRITER_WORLD_INTENTS[WriterWorldMode]['intent'];

/** Current explicit navigation only; never user text or subscription tier. */
export function designForWriterActivity(mode: WriterWorldMode) {
  return WRITER_WORLD_INTENTS[mode];
}
