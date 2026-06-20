/**
 * Spiralogic Soul Portrait — Reusable Report Schema
 * ────────────────────────────────────────────────────────────────────────
 * A Soul Portrait is a human-centered, astrology-informed reflection that
 * integrates natal placements, Spiralogic elemental interpretation,
 * archetypal psychology, and developmental guidance — written as a wise
 * letter, not a deterministic forecast.
 *
 * DESIGN LAW (enforced structurally by the renderer via `framing`):
 *   1. Symbolic architecture, not fate.       (a chart describes patterns, not destiny)
 *   2. Archetypes are companions, not cages.   (a person is never reduced to a label)
 *   3. A becoming, not a fixed identity.       (orientation toward maturation, not diagnosis)
 *
 * This file is the first implementation step: a typed contract + canonical
 * catalogs. One person's portrait (see `portraits/`) is a static object that
 * conforms to `SoulPortrait`. Later, a generator can populate the same shape
 * from chart data + a person's stage — the renderer never changes.
 *
 * Canonical Spiralogic model: see `lib/maia/spiralogicReference.ts`.
 *   Earth (grounding/embodiment) · Water (feeling/psyche) · Fire (activation/will)
 *   Air (perspective/mind) · Aether (integration/wholeness).
 */

export type ElementKey = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type ArchetypeKey =
  | 'seeker'
  | 'guardian'
  | 'alchemist'
  | 'storyteller'
  | 'explorer'
  | 'builder'
  | 'healer'
  | 'sage'
  | 'steward';

/** How strongly an archetype shows in this person — never a ranking of worth. */
export type Resonance = 'strong' | 'present' | 'emerging';

// ── Schema fields ─────────────────────────────────────────────────────────

export interface Person {
  name: string;
  /** URL slug, e.g. "augusten" → /soul-portrait/augusten */
  slug: string;
  age?: number;
  pronouns?: string;
  /** Whether this portrait describes a minor — gates listing/sharing. */
  isMinor?: boolean;
}

export interface BirthData {
  date?: string;
  time?: string;
  place?: string;
  /** Use when full birth data is not on hand and only placements are known. */
  note?: string;
}

/** One natal placement rendered in plain, non-deterministic language. */
export interface NatalPlacement {
  /** "Sun", "Moon", "Ascendant", "Neptune", "Chiron", ... */
  body: string;
  sign?: string;
  house?: number;
  /** e.g. "near the Midheaven", "conjunct the MC" */
  angle?: string;
  /** A short, human reading of what this placement points toward. */
  meaning: string;
}

export interface NatalChartSummary {
  placements: NatalPlacement[];
  /** A woven paragraph that holds the placements together as one picture. */
  synthesis: string;
}

export interface ElementalProfileEntry {
  element: ElementKey;
  /** The element's keyword for this report, e.g. "courage, purpose, vitality". */
  keyword: string;
  title: string;
  body: string;
}

export interface ArchetypeEntry {
  key: ArchetypeKey;
  /** Display name (defaults available in ARCHETYPE_CATALOG). */
  name: string;
  /** What this archetype carries for this person. */
  essence: string;
  gift: string;
  /** The shadow side held honestly — a direction of growth, not a verdict. */
  shadow: string;
  resonance: Resonance;
}

export interface DevelopmentalStage {
  /** e.g. "Becoming a Young Man" */
  label: string;
  ageRange?: string;
  body: string;
}

export interface ChallengeTraining {
  challenge: string;
  training: string;
}

export interface SeerAndProphet {
  title: string;
  subtitle?: string;
  /** Verbatim body prose (paragraphs separated by blank lines). */
  body: string;
  /** Closing blessing lines, rendered with emphasis. */
  blessing?: string[];
}

/** Always rendered. The structural enforcement of the design law. */
export interface PortraitFraming {
  /** Short notes shown near the top and echoed at the close. */
  notes: string[];
}

/** The four kinds of Soul Portrait — see the Constitution's "act of love" section. */
export type PortraitMode = 'self' | 'parent-child' | 'gift' | 'legacy';

/**
 * The relationship THROUGH WHICH a portrait is offered. It shapes the *voice and
 * posture*, never the truth or the symbolism (Kelly 2026-06-18: "identity is never
 * formed in isolation; it is always encountered through relationship"). The giver's
 * love may be present, but must never overwrite the recipient's own becoming — a
 * giver contributes "what I cherish about you," never "who you are."
 */
export interface OfferedBy {
  /** Human label for the relationship, e.g. "her uncle". */
  relationship: string;
  /** The giver's name, e.g. "Kelly". */
  giverName?: string;
  /** A short framing the reader meets first: who offers this, and in what spirit. */
  giftOpening?: string;
  /** Optional: what the giver cherishes — the giver's love, not a claim on identity. */
  cherished?: { from: string; note: string };
  /**
   * Recipient-facing copy for the gift's OPENING threshold page
   * (`/soul-portrait/[slug]/welcome`) — the hand-delivered reception door the
   * recipient meets first. All optional; the threshold page derives sensible
   * defaults from `person.name` / `giverName` when omitted.
   */
  threshold?: {
    /** Eyebrow label, e.g. "A Soul Portrait". */
    eyebrow?: string;
    /** Who it's for, e.g. "For Katie Claire". */
    forLine?: string;
    /** Who offers it and in what spirit, e.g. "Offered with love by your Uncle Kelly". */
    attribution?: string;
    /** A brief, non-deterministic framing met before opening the portrait. */
    framing?: string;
  };
}

/** One elemental phase of the Year Ahead's Seasonal Spiral (Part II). */
export interface YearAheadPhase {
  element: ElementKey;
  /** e.g. "Leaving the Known". */
  title: string;
  /** e.g. "Spring · March – June". */
  timeframe?: string;
  /** The real transits this phase traces to — DATA, never a prediction. */
  transits: string[];
  /** Fresh, non-deterministic prose, addressed to the reader in second person. */
  body: string;
  /** The element's developmental question, e.g. "What foundations are no longer alive?". */
  question?: string;
  /** Optional elemental practice for the season. */
  practice?: { label?: string; prompt: string };
}

/**
 * The Year Ahead — Part II of the portrait (seasonal, revisited each year).
 * A Spiralogic "Seasonal Spiral": development-centered — the year's transits are
 * read as ecological forces moving the person through Earth → Fire → Water →
 * Air → Aether. Optional; only portraits with a transit reading carry it. The
 * element↔transit mapping is an authored Spiralogic reading (orientation, not
 * fixed astrology and not authority), kept traceable to real transits.
 */
export interface YearAhead {
  /** e.g. "The Year Ahead". */
  title: string;
  /** e.g. "The Spiral of Emergence". */
  subtitle?: string;
  /** e.g. "June 2027 – June 2028". */
  timeframe?: string;
  /** A single headline line met first — the heart of the opening theme. */
  openingHeadline?: string;
  /** The opening theme prose. */
  openingTheme: string;
  /** The five elemental phases, in spiral order. */
  phases: YearAheadPhase[];
  /** The weather-pattern table rows. */
  weatherPattern?: Array<{ season: string; element: ElementKey; invitation: string }>;
  /** The Golden Thread — the single developmental arc the year converges on. */
  goldenThread: string;
  /** Living questions to carry through the year (not goals, not predictions). */
  questions: string[];
}

export interface SoulPortrait {
  person: Person;
  /** Which kind of portrait — shapes structure (e.g. parent notes) and voice. */
  mode: PortraitMode;
  /** For gift / parent-child / legacy portraits: the relationship offering it. */
  offeredBy?: OfferedBy;
  birthData?: BirthData;
  natalChartSummary: NatalChartSummary;

  // The nine core sections, in render order ──────────────────────────────
  /** 1. Opening Letter */
  openingLetter: string;
  /** 2. Soul Signature */
  soulSignature: { headline: string; body: string };
  /** 3. Elemental Architecture */
  elementalProfile: ElementalProfileEntry[];
  /** 4. Archetypal Profile */
  archetypalProfile: ArchetypeEntry[];
  /** 5. The Seer and the Prophet */
  seerAndProphet: SeerAndProphet;
  /** 6. Challenges as Training */
  challengesAsTraining: { body: string; trainings?: ChallengeTraining[] };
  /** 7. Becoming a Young Man (developmental stage) */
  developmentalStage: DevelopmentalStage;
  /** 8. Questions for This Season */
  reflectionQuestions: string[];
  /** 9. Parent/Guide Notes — only for parent-child portraits. */
  guidanceForParents?: string[];

  /** A one-paragraph vocation statement — what the gift is *for*. */
  soulVocation: string;

  /** Always rendered. Defaults to DEFAULT_FRAMING if omitted by a generator. */
  framing: PortraitFraming;

  /**
   * Part II — The Year Ahead (seasonal). Optional; rendered after the natal
   * portrait when present. The natal portrait is timeless ("who are you?");
   * this is the current season ("what season is inviting you now?").
   */
  yearAhead?: YearAhead;

  /**
   * Whether THIS portrait exposes the live MAIA Mentor (guardrailed dialogue) —
   * a surface DISTINCT from the immutable portrait text. Opt-in, per-portrait,
   * default-deny: omitted / false → no Mentor (the page renders the gift only,
   * and /api/soul-portrait/[slug]/mentor returns 404). Path B replaces this flag
   * with per-record consent gating; until then it makes Mentor availability an
   * explicit, visible grant. See docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md.
   */
  mentorEnabled?: boolean;
}

// ── Canonical catalogs (reusable defaults for any portrait) ────────────────

/**
 * The five elements with their canonical Spiralogic meaning, the report
 * keyword the spec calls for, plus presentation tokens (colour, glow, icon).
 * Colours follow the softer in-app elemental palette used on /astrology;
 * Aether is added (luminous violet) as it is absent from the holoflower facets.
 */
export const ELEMENT_META: Record<
  ElementKey,
  { label: string; keyword: string; essence: string; color: string; glow: string; icon: string }
> = {
  fire: {
    label: 'Fire',
    keyword: 'courage, purpose, vitality',
    essence: 'activation / will',
    color: '#F5A362',
    glow: 'rgba(245, 163, 98, 0.35)',
    icon: 'Flame',
  },
  water: {
    label: 'Water',
    keyword: 'heart, empathy, emotional wisdom',
    essence: 'feeling / psyche',
    color: '#8BADD6',
    glow: 'rgba(139, 173, 214, 0.35)',
    icon: 'Droplet',
  },
  earth: {
    label: 'Earth',
    keyword: 'grounding, habits, responsibility',
    essence: 'grounding / embodiment',
    color: '#A8C69F',
    glow: 'rgba(168, 198, 159, 0.35)',
    icon: 'Sprout',
  },
  air: {
    label: 'Air',
    keyword: 'curiosity, communication, ideas',
    essence: 'perspective / mind',
    color: '#F5D565',
    glow: 'rgba(245, 213, 101, 0.35)',
    icon: 'Wind',
  },
  aether: {
    label: 'Aether',
    keyword: 'meaning, spirit, mystery',
    essence: 'integration / wholeness',
    color: '#C4B5E8',
    glow: 'rgba(196, 181, 232, 0.35)',
    icon: 'Sparkles',
  },
};

/** Canonical archetype names + one-line essences. A portrait personalises these. */
export const ARCHETYPE_CATALOG: Record<ArchetypeKey, { name: string; essence: string }> = {
  seeker: { name: 'The Seeker', essence: 'asks the deeper question; reaches past easy answers.' },
  guardian: { name: 'The Guardian', essence: 'protects what is vulnerable; keeps faith with the weak.' },
  alchemist: { name: 'The Alchemist', essence: 'turns pain and pressure into something new.' },
  storyteller: { name: 'The Storyteller', essence: 'gives shape to meaning so others can feel it.' },
  explorer: { name: 'The Explorer', essence: 'crosses thresholds; trusts the far horizon.' },
  builder: { name: 'The Builder', essence: 'brings vision into form, patiently and well.' },
  healer: { name: 'The Healer', essence: 'tends wounds — others’ and, first, their own.' },
  sage: { name: 'The Sage', essence: 'perceives clearly and speaks the truth kindly.' },
  steward: { name: 'The Steward', essence: 'cares for what is shared; leaves it better.' },
};

/** The default, always-on framing. Encodes the design law for every portrait. */
export const DEFAULT_FRAMING: PortraitFraming = {
  notes: [
    'This is symbolic architecture, not fate. A chart describes patterns to work with — it does not decide who you become.',
    'These archetypes are companions, not cages. You are always more than any single name for you.',
    'This describes a becoming, not a fixed identity. Read it the way you’d read a kind letter — keep what rings true, set the rest aside.',
  ],
};

export function getElementMeta(element: ElementKey) {
  return ELEMENT_META[element];
}

export const RESONANCE_LABEL: Record<Resonance, string> = {
  strong: 'Strongly present',
  present: 'Present',
  emerging: 'Emerging',
};
