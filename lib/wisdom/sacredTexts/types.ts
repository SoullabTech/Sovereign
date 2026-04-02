/**
 * Sacred Text Types — Shared across all tradition modules
 *
 * Core principle: each tradition expresses a different mode of knowing.
 * MAIA matches the mode, not the text. These types enable that routing.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TRADITION
// ═══════════════════════════════════════════════════════════════════════════════

export type SacredTradition =
  | 'quran'
  | 'bible'
  | 'torah'
  | 'gita'
  | 'dhammapada'
  | 'tao'
  | 'upanishads'
  | 'gospel-of-thomas'
  | 'zohar'
  | 'yoga-sutras'
  | 'tibetan-dead'
  | 'tibetan-living'
  | 'tibetan-mysticism'
  | 'milarepa'
  | 'pistis-sophia';

// ═══════════════════════════════════════════════════════════════════════════════
// MODE — How a text speaks (not what it's about)
// ═══════════════════════════════════════════════════════════════════════════════

/** The mode of knowing a passage expresses */
export type SacredMode =
  | 'instruction'    // directive, action-oriented (Gita, Qur'an commands)
  | 'revelation'     // divine speech, disclosed truth (Qur'an, Psalms)
  | 'poetic'         // lyric, devotional expression (Milarepa, Psalms)
  | 'philosophical'  // conceptual clarity, inquiry (Tao, Upanishads)
  | 'paradox';       // dissolution, koan-like (Tao ch.1, Zen, Gospel of Thomas)

// ═══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT — How the passage meets the reader
// ═══════════════════════════════════════════════════════════════════════════════

export type EngagementStyle =
  | 'direct'       // meets you head-on, clear instruction
  | 'reflective'   // invites contemplation, spacious
  | 'disruptive'   // breaks pattern, interrupts assumption
  | 'devotional';  // calls toward surrender, reverence, prayer

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT + STATE (reuse existing types)
// ═══════════════════════════════════════════════════════════════════════════════

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type EncounterState =
  | 'strain'
  | 'searching'
  | 'remorse'
  | 'restlessness'
  | 'endurance';

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED PASSAGE ENTRY — Universal schema for all traditions
// ═══════════════════════════════════════════════════════════════════════════════

export interface SacredPassageEntry {
  /** Unique identifier */
  id: string;
  /** Always 'sacred' */
  sourceType: 'sacred';
  /** Which tradition this belongs to */
  tradition: SacredTradition;
  /** Brief, reverent title */
  title: string;
  /** Citation (format varies by tradition) */
  citation: string;
  /** The passage text */
  translation: string;
  /** Attribution for translation */
  translator: string;
  /** Original script text (Qur'an Arabic, etc.) */
  originalScript?: string;

  // --- Routing metadata (NEVER exposed to UI) ---

  _meta: {
    /** How this passage speaks */
    mode: SacredMode;
    /** Elemental resonance for routing */
    element: Element;
    /** Which lived states this passage fits */
    stateAffinity: EncounterState[];
    /** How intense/direct the passage is (1=gentle, 2=moderate, 3=strong) */
    intensity: 1 | 2 | 3;
    /** How it engages the reader */
    engagementStyle: EngagementStyle;
  };

  // --- Presentation (shown to UI) ---

  contextualFraming?: string;
  reflectionPrompts?: string[];
  integrationPractice?: string;
  cautionNote?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-SAFE PASSAGE (stripped of _meta)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SacredPassage {
  id: string;
  sourceType: 'sacred';
  tradition: SacredTradition;
  title: string;
  citation: string;
  translation: string;
  translator: string;
  originalScript?: string;
  contextualFraming?: string;
  reflectionPrompts?: string[];
  integrationPractice?: string;
  cautionNote?: string;
}

/** Strip _meta before sending to UI */
export function toSacredPassage(entry: SacredPassageEntry): SacredPassage {
  return {
    id: entry.id,
    sourceType: entry.sourceType,
    tradition: entry.tradition,
    title: entry.title,
    citation: entry.citation,
    translation: entry.translation,
    translator: entry.translator,
    originalScript: entry.originalScript,
    contextualFraming: entry.contextualFraming,
    reflectionPrompts: entry.reflectionPrompts,
    integrationPractice: entry.integrationPractice,
    cautionNote: entry.cautionNote,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRADITION DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

export interface TraditionDisclaimer {
  short: string;
  extended: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION CONTEXT (tradition lock)
// ═══════════════════════════════════════════════════════════════════════════════

export interface EncounterSessionContext {
  /** The tradition currently active in this session (if any) */
  activeTradition?: SacredTradition;
  /** Whether a tradition switch has already occurred this session */
  hasSwitchedTradition: boolean;
  /** Whether the disclaimer has been shown this session */
  disclaimerShown: boolean;
}
