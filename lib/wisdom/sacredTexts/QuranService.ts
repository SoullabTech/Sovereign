/**
 * QuranService — Loader and accessor for Qur'anic sacred text entries.
 *
 * This service provides read-only access to the seed data.
 * It does NOT integrate with WisdomFacets, WisdomQuotes, or ElderCouncilService.
 * It does NOT expose internal tags (_themes, _internalTags) in any return value
 * intended for UI consumption.
 *
 * Future: This may connect to a database table or support dynamic ingestion.
 * For now it reads from the static seed array.
 */

import {
  QURAN_ENTRIES,
  QURAN_DISCLAIMER,
  type QuranEntry,
} from './quran';

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC TYPES (safe for UI consumption — no internal tags)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SacredPassage {
  id: string;
  sourceType: 'sacred';
  tradition: 'islam';
  title: string;
  surah: number;
  ayah: string;
  citation: string;
  translation: string;
  translator: string;
  arabic?: string;
  contextualFraming?: string;
  reflectionPrompts?: string[];
  integrationPractice?: string;
  cautionNote?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Strip internal fields before sending to UI */
function toSacredPassage(entry: QuranEntry): SacredPassage {
  return {
    id: entry.id,
    sourceType: entry.sourceType,
    tradition: entry.tradition,
    title: entry.title,
    surah: entry.surah,
    ayah: entry.ayah,
    citation: entry.citation,
    translation: entry.translation,
    translator: entry.translator,
    arabic: entry.arabic,
    contextualFraming: entry.contextualFraming,
    reflectionPrompts: entry.reflectionPrompts,
    integrationPractice: entry.integrationPractice,
    cautionNote: entry.cautionNote,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const QuranService = {
  /** Get all passages (UI-safe, no internal tags) */
  getAll(): SacredPassage[] {
    return QURAN_ENTRIES.map(toSacredPassage);
  },

  /** Get a single passage by ID */
  getById(id: string): SacredPassage | undefined {
    const entry = QURAN_ENTRIES.find(e => e.id === id);
    return entry ? toSacredPassage(entry) : undefined;
  },

  /** Get the disclaimer text */
  getDisclaimer() {
    return QURAN_DISCLAIMER;
  },

  /** Total count of available passages */
  count(): number {
    return QURAN_ENTRIES.length;
  },
} as const;
