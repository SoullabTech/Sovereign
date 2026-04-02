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
  | 'depth.explore'
  | 'depth.shadow'
  | 'studio.transition'
  | 'schedule.create';

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
  {
    id: 'astrology.reading',
    label: 'Astrology reading',
    worldId: 'patterns',
    voicePhrases: ['show me my chart', 'astrology reading', 'what do the stars say'],
  },
  {
    id: 'astrology.transit',
    label: 'Current transits',
    worldId: 'patterns',
    voicePhrases: ['current transits', 'what transits are active', 'planetary influences'],
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

  // Depth
  {
    id: 'depth.explore',
    label: 'Go deeper',
    worldId: 'depth',
    voicePhrases: ['go deeper', 'take this deeper', 'explore this'],
  },
  {
    id: 'depth.shadow',
    label: 'Shadow work',
    worldId: 'depth',
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
