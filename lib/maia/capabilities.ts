/**
 * MAIA Capability Registry — Talk-first architecture
 *
 * MAIA is not a feature set. MAIA is the orchestrator.
 * Capabilities are things MAIA can invoke, guide, and contextualize.
 *
 * Users don't navigate to features. They speak, and MAIA routes.
 * UI supports the routing — it does not drive it.
 */

import type { MaiaWorldId } from '@/lib/navigation/types';

// --- Capability IDs ---

export type MaiaCapability =
  | 'journal.create'
  | 'journal.save'
  | 'journal.dream'
  | 'astrology.reading'
  | 'astrology.transit'
  | 'pattern.detect'
  | 'pattern.show'
  | 'wisdom.surface'
  | 'wisdom.text'
  | 'relationship.reflect'
  | 'depth.shadow'
  | 'studio.transition'
  | 'schedule.create'
  // ── MAIA-NODE-03 · NAVIGATE slice ──────────────────────────────────────
  // Going to a place is its own capability, distinct from doing something
  // there. These carry a House destination and no domain authority at all.
  | 'journal.open'
  | 'relationships.open'
  | 'livingField.open'
  | 'keeps.open'
  | 'writersStudio.open'
  // ── MAIA-NODE-04 · READ slice ──────────────────────────────────────────
  | 'changes.continuity';

// --- Operation classes (MAIA-NODE-01 §XIII) ---

/**
 * What KIND of thing a capability does. Only the two lowest-consequence classes
 * are implemented in MAIA-NODE-03; the rest are declared so that a capability
 * can be described truthfully before it is executable.
 */
export type CapabilityClass =
  | 'ORIENT' | 'NAVIGATE' | 'READ' | 'CAPTURE'
  | 'CONTINUE' | 'TRANSFORM' | 'ACT' | 'SHARE' | 'CROSS';

/**
 * Whether MAIA may actually invoke this, which is a DIFFERENT fact from whether
 * the capability exists.
 *
 *   executable — traced to a canonical authority and safe to invoke now
 *   withheld   — exists in Soullab, deliberately not exposed through MAIA
 *   unknown    — repository truth has not established the authority yet
 *
 * ⭐ `unknown` is the default for anything unproven, and it is not a synonym for
 * permitted. A capability with no `availability` is NOT executable: the
 * resolver treats absence as unknown, so a field left unfilled can never
 * become an accidental grant.
 */
export type CapabilityAvailability =
  | { state: 'executable' }
  | { state: 'withheld'; reason: string }
  | { state: 'unknown'; reason: string };

/**
 * WHO owns execution — never MAIA. A capability names the canonical operation
 * it defers to; it does not become the operation. Added in MAIA-NODE-04 because
 * the Changes READ slice is the first capability with a domain authority to
 * name, and the registry grows by evidence.
 */
export type CapabilityAuthority =
  | { kind: 'route'; method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; path: string }
  | { kind: 'navigation' }
  | { kind: 'unresolved'; note: string };

// --- Capability Definition ---

export interface CapabilityDefinition {
  id: MaiaCapability;
  /** Human-readable label */
  label: string;
  /** Which world this relates to, if any */
  worldId?: MaiaWorldId;
  /** Which modal/sheet this triggers, if any */
  modalId?: string;
  /** Voice phrases that invoke this capability */
  voicePhrases: string[];

  // ── MAIA-NODE-03 additions. Every field is OPTIONAL, so the thirteen
  //    capabilities that predate this slice remain valid unchanged, and the
  //    registry grows by evidence rather than by speculation.

  /**
   * What this helps a member accomplish, in the member's terms. AUTHORED, never
   * model-generated: ORIENT answers are composed from this string, so an
   * unauthored capability simply has no orientation rather than an invented one.
   */
  purpose?: string;
  /** ORIENT / NAVIGATE / … — see CapabilityClass. */
  operationClass?: CapabilityClass;
  /**
   * A `HOUSE_DESTINATIONS` id. ⛔ Never a route literal: the House owns paths,
   * native policy and the web bridge, and this layer must not restate any of it.
   */
  destinationId?: string;
  /** Absent means `unknown` — see CapabilityAvailability. */
  availability?: CapabilityAvailability;
  /** The canonical operation that owns execution. ⛔ Never MAIA herself. */
  authority?: CapabilityAuthority;
  /** Which member context this may run in. Absent means unconstrained-by-record. */
  allowedContexts?: readonly string[];
}

// --- Registry ---

export const CAPABILITY_REGISTRY: CapabilityDefinition[] = [
  // Journal
  {
    id: 'journal.create',
    label: 'Start journal entry',
    worldId: 'journal',
    modalId: 'journal-sheet',
    voicePhrases: ['capture this thought', 'start a journal entry', 'write this down', 'let me journal this'],
  },
  {
    id: 'journal.save',
    label: 'Save as journal',
    worldId: 'journal',
    modalId: 'journal-sheet',
    voicePhrases: ['save this', 'save this as a journal entry'],
  },
  {
    id: 'journal.dream',
    label: 'Record dream',
    worldId: 'journal',
    modalId: 'journal-sheet',
    voicePhrases: ['record a dream', 'I had a dream', 'dream journal'],
  },

  // Astrology
  // ⛔ WITHHELD — MAIA-NODE-03 §12. `/api/astrology/reading` accepts birth data
  // with no authentication and binds no member identity, so MAIA may know that
  // Astrology exists in Soullab and may not execute it. The bounded repair is
  // specified in MAIA-NODE-02 §8 and is NOT authorized. Astrology remains
  // reachable by ordinary House navigation; only the MAIA-executable capability
  // is withheld.
  {
    id: 'astrology.reading',
    label: 'Astrology reading',
    worldId: 'patterns',
    voicePhrases: ['show me my chart', 'astrology reading', 'what do the stars say'],
    availability: { state: 'withheld', reason: 'unauthenticated reading route — MAIA-NODE-03 §12' },
  },
  {
    id: 'astrology.transit',
    label: 'Current transits',
    worldId: 'patterns',
    voicePhrases: ['current transits', 'what transits are active', 'planetary influences'],
    availability: { state: 'withheld', reason: 'unauthenticated reading route — MAIA-NODE-03 §12' },
  },

  // Patterns
  {
    id: 'pattern.detect',
    label: 'Detect pattern',
    worldId: 'patterns',
    voicePhrases: ['what pattern is this', 'is there a pattern here', 'show me the pattern'],
  },
  {
    id: 'pattern.show',
    label: 'Show patterns',
    worldId: 'patterns',
    voicePhrases: ['show my patterns', 'open patterns'],
  },

  // Wisdom
  {
    id: 'wisdom.surface',
    label: 'Surface wisdom',
    worldId: 'wisdom',
    voicePhrases: ['what wisdom applies here', 'show me guidance', 'what does wisdom say'],
  },
  {
    id: 'wisdom.text',
    label: 'Sacred text',
    worldId: 'wisdom',
    voicePhrases: ['show sacred text', 'open wisdom', 'sacred texts'],
  },

  // Relationships
  {
    id: 'relationship.reflect',
    label: 'Relationship reflection',
    worldId: 'relationships',
    voicePhrases: ['reflect on this relationship', 'relationship pattern'],
  },

  // Shadow work (previously under Depth — surface via modal, no world)
  {
    id: 'depth.shadow',
    label: 'Shadow work',
    modalId: 'shadow-work',
    voicePhrases: ['shadow work', 'explore my shadow'],
  },

  // Studio
  {
    id: 'studio.transition',
    label: 'Move to Studio',
    voicePhrases: ['move to studio', 'open studio', 'this is studio work'],
  },

  // Scheduling
  {
    id: 'schedule.create',
    label: 'Schedule session',
    voicePhrases: ['schedule a session', 'book a session', 'set up a time'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAIA-NODE-03 · NAVIGATE slice
  //
  // Five places, each already canonical in HOUSE_DESTINATIONS with
  // `audience: 'all'`. These capabilities carry NO domain authority: going to a
  // room is not doing anything in it, which is why this is the first slice.
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'journal.open',
    label: 'Journal',
    purpose: 'Expressive writing — a place to put down what you are thinking, in your own words.',
    operationClass: 'NAVIGATE',
    destinationId: 'journal',
    availability: { state: 'executable' },
    voicePhrases: [
      'take me to my journal', 'take me to journal', 'open my journal', 'open journal',
      'go to my journal', 'go to journal', 'show me my journal',
    ],
  },
  {
    id: 'relationships.open',
    label: 'Relational Field',
    purpose: 'Outer and inner relationships, made visible — a place to look at a relationship more fully.',
    operationClass: 'NAVIGATE',
    destinationId: 'relationships',
    availability: { state: 'executable' },
    voicePhrases: [
      'open relationships', 'take me to relationships', 'go to relationships',
      'show me my relationships', 'open the relational field', 'take me to the relational field',
    ],
  },
  {
    id: 'livingField.open',
    label: 'Living Field',
    purpose: 'A place to gather and reflect on lived experience, drawn from what you have kept.',
    operationClass: 'NAVIGATE',
    destinationId: 'living-field',
    availability: { state: 'executable' },
    voicePhrases: [
      'open living field', 'take me to living field', 'go to living field',
      'show me my living field', 'open my living field',
    ],
  },
  {
    // ⚠️ "Keeps" here means the CANONICAL personal Keep gesture — the
    // member-memory-atom formation act at /maia/keep-capture (MAIA-NODE-02 §2).
    // It is NOT the Writer's Studio manuscript object, which is called a Saved
    // Passage at this layer and has no House destination.
    id: 'keeps.open',
    label: 'Keeps',
    purpose: 'What you have chosen to keep — the things you decided should remain available to you.',
    operationClass: 'NAVIGATE',
    destinationId: 'keeps',
    availability: { state: 'executable' },
    voicePhrases: [
      'show me my keeps', 'open my keeps', 'open keeps', 'take me to my keeps',
      'go to my keeps',
    ],
  },
  {
    id: 'writersStudio.open',
    label: "Writer's Studio",
    purpose: 'Where your work takes form — the environment your writing lives in.',
    operationClass: 'NAVIGATE',
    destinationId: 'studio',
    availability: { state: 'executable' },
    voicePhrases: [
      "take me to writer's studio", 'take me to writers studio', "open writer's studio",
      'open writers studio', "go to writer's studio", 'go to writers studio',
      'take me back to my writing',
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAIA-NODE-04 · READ slice — truthful continuity over Changes
  //
  // The first capability that reads member material. It answers only what the
  // member asks about Changes, from recorded lifecycle state, through the
  // canonical member-owned read authority. ⛔ It decides nothing: a Change is
  // open because the member left it open, not because MAIA judges it unfinished.
  //
  // ⛔ NOT a navigation capability. MAIA-NODE-04 §XIII: the House models Changes
  // as a SHEET while a historical literal pushes '/studio/changes', and that
  // disagreement is not reconciled here — so this slice adds no
  // "take me to Changes" transition at all.
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'changes.continuity',
    label: 'Open Changes',
    purpose: 'The Changes you have named and not yet completed, with the state you left them in.',
    operationClass: 'READ',
    authority: { kind: 'route', method: 'GET', path: '/api/changes' },
    allowedContexts: ['personal'],
    availability: { state: 'executable' },
    voicePhrases: [
      'what changes do i still have open',
      'what changes are still open',
      'am i working with any changes',
      'remind me which changes are not complete',
      'what changes have i named',
      'my open changes',
      'do i have any open changes',
    ],
  },
];

// --- Helpers ---

/** Find capability by ID */
export function getCapability(id: MaiaCapability): CapabilityDefinition | undefined {
  return CAPABILITY_REGISTRY.find(c => c.id === id);
}

/** Find capabilities for a given world */
export function getCapabilitiesForWorld(worldId: MaiaWorldId): CapabilityDefinition[] {
  return CAPABILITY_REGISTRY.filter(c => c.worldId === worldId);
}
