/**
 * SacredTextRegistry — Central registry for all sacred text traditions.
 *
 * Loads passages from per-tradition modules and provides cross-tradition
 * querying. All passages use the shared SacredPassageEntry schema.
 *
 * To add a new tradition:
 * 1. Create lib/wisdom/sacredTexts/<tradition>.ts with entries + disclaimer
 * 2. Import and register here
 */

import type {
  SacredPassageEntry,
  SacredTradition,
  TraditionDisclaimer,
  SacredPassage,
  Element,
  EncounterState,
  SacredMode,
  EngagementStyle,
} from './types';
import { toSacredPassage } from './types';
import { QURAN_ENTRIES, QURAN_DISCLAIMER } from './quran';
import { TAO_ENTRIES, TAO_DISCLAIMER } from './tao';
import { GITA_ENTRIES, GITA_DISCLAIMER } from './gita';
import { ZOHAR_ENTRIES, ZOHAR_DISCLAIMER } from './zohar';

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_ENTRIES: SacredPassageEntry[] = [
  ...QURAN_ENTRIES,
  ...TAO_ENTRIES,
  ...GITA_ENTRIES,
  ...ZOHAR_ENTRIES,
];

const DISCLAIMERS: Partial<Record<SacredTradition, TraditionDisclaimer>> = {
  quran: QURAN_DISCLAIMER,
  tao: TAO_DISCLAIMER,
  gita: GITA_DISCLAIMER,
  zohar: ZOHAR_DISCLAIMER,
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegistryQuery {
  element?: Element;
  stateAffinity?: EncounterState;
  mode?: SacredMode;
  engagementStyle?: EngagementStyle;
  tradition?: SacredTradition;
  maxIntensity?: 1 | 2 | 3;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const SacredTextRegistry = {
  /** All passages (internal, includes _meta) */
  getAllEntries(): SacredPassageEntry[] {
    return ALL_ENTRIES;
  },

  /** All passages stripped for UI */
  getAll(): SacredPassage[] {
    return ALL_ENTRIES.map(toSacredPassage);
  },

  /** Get passages for a specific tradition */
  getByTradition(tradition: SacredTradition): SacredPassageEntry[] {
    return ALL_ENTRIES.filter(e => e.tradition === tradition);
  },

  /** Get disclaimer for a tradition */
  getDisclaimer(tradition: SacredTradition): TraditionDisclaimer | undefined {
    return DISCLAIMERS[tradition];
  },

  /** Query passages by metadata filters */
  query(filters: RegistryQuery): SacredPassageEntry[] {
    return ALL_ENTRIES.filter(entry => {
      if (filters.tradition && entry.tradition !== filters.tradition) return false;
      if (filters.element && entry._meta.element !== filters.element) return false;
      if (filters.stateAffinity && !entry._meta.stateAffinity.includes(filters.stateAffinity)) return false;
      if (filters.mode && entry._meta.mode !== filters.mode) return false;
      if (filters.engagementStyle && entry._meta.engagementStyle !== filters.engagementStyle) return false;
      if (filters.maxIntensity && entry._meta.intensity > filters.maxIntensity) return false;
      return true;
    });
  },

  /** Total count */
  count(): number {
    return ALL_ENTRIES.length;
  },

  /** List available traditions */
  traditions(): SacredTradition[] {
    return [...new Set(ALL_ENTRIES.map(e => e.tradition))];
  },
} as const;
