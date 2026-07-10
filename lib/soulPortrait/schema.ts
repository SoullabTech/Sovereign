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

/**
 * Visual theme for the portrait PAGE — chosen by the giver/sender, presentation
 * only. A theme never alters the portrait's text, structure, or framing; it only
 * resolves to a token set (CSS custom properties) the renderer applies. New
 * themes are data (add an entry to PORTRAIT_THEMES), not code forks.
 *
 * The five element themes share one register (Kelly 2026-07-08, benchmarked on
 * the forest green he loved — now 'earth'): deep near-black ground with a hue
 * bias, warm parchment ink, ONE metallic/mineral accent, muted botanical label
 * colour — dignified and rich, never neon, never pastel. A sender may choose a
 * theme that quietly rhymes with the portrait's dominant element, but the
 * choice is ALWAYS the sender's — never derived from the chart, never imposed.
 */
export type PortraitThemeKey = 'classic' | 'earth' | 'fire' | 'water' | 'air' | 'aether';

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
  /** Optional closing word / blessing for the year (e.g. "A Word for the Year"). */
  closing?: { title?: string; body: string };
}

export interface SoulPortrait {
  person: Person;
  /** Which kind of portrait — shapes structure (e.g. parent notes) and voice. */
  mode: PortraitMode;
  /**
   * Visual theme of the page, chosen by the giver/sender. Optional; omitted →
   * 'classic', so every existing portrait renders exactly as before.
   */
  theme?: PortraitThemeKey;
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
  /**
   * Optional forward-pointing beam — "Your North Star / The Direction of
   * Becoming" (e.g. a North Node reading). Rendered between Challenges and the
   * developmental stage when present. Direction, never description — the one
   * place a portrait points forward. Omitted by portraits without it.
   */
  northStar?: { title: string; subtitle?: string; body: string };
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

/**
 * A literary Soul Portrait — bespoke, chapter-based prose, for a flowing reading
 * rather than the fixed nine-section structure. Shares the meta (person,
 * offeredBy, framing, yearAhead, mentor) with SoulPortrait, but carries
 * free-form `chapters` in place of the fixed sections. Same renderer, literary
 * mode. Used when a portrait wants to read as a letter/essay (e.g. an adult who
 * loves the symbolic language) rather than a structured report.
 */
export interface PortraitChapter {
  title: string;
  subtitle?: string;
  /** Flowing prose (paragraphs separated by blank lines). */
  body: string;
  /** Optional elemental accent (colour + icon) for the chapter heading. */
  element?: ElementKey;
}

export interface LiterarySoulPortrait {
  person: Person;
  mode: PortraitMode;
  /** Visual theme of the page (see SoulPortrait.theme). Omitted → 'classic'. */
  theme?: PortraitThemeKey;
  offeredBy?: OfferedBy;
  birthData?: BirthData;
  /** Optional chart reference. */
  natalChartSummary?: NatalChartSummary;
  /** The bespoke chapters, in reading order. */
  chapters: PortraitChapter[];
  framing: PortraitFraming;
  yearAhead?: YearAhead;
  mentorEnabled?: boolean;
}

/** Either structure may back a portrait page. */
export type AnyPortrait = SoulPortrait | LiterarySoulPortrait;

/** Narrow to the literary (chapter-based) form. */
export function isLiterarySoulPortrait(p: AnyPortrait): p is LiterarySoulPortrait {
  return Array.isArray((p as LiterarySoulPortrait).chapters);
}

// ── Canonical catalogs (reusable defaults for any portrait) ────────────────

/**
 * One mode (dark or light) of a portrait page theme: the token set the renderer
 * applies as CSS custom properties (`--sp-*`) on the page root. Everything the
 * page colours reference lives here — a new theme is a new entry, never a
 * renderer fork.
 *
 * Token vocabulary (all required, so a theme can never half-apply):
 *   ground-deep / ground   page background gradient (edges / center)
 *   ground-rgb / surface / surface-rgb   solid + translucent card surfaces
 *   border / border-soft   card borders, dividers
 *   ink-100 … ink-40       text scale, strongest → most muted
 *   ink-50                 the small-caps label colour (the "botanical" slot)
 *   accent / accent-rgb    the signal colour (section numbers, labels, icons)
 *   glow                   accent glow colour (with alpha) for featured panels
 */
export type PortraitThemeTokens = Record<string, string>;

export interface PortraitTheme {
  key: PortraitThemeKey;
  /** Display name for the sender-facing picker. */
  label: string;
  /** One-line description shown alongside the picker. */
  description: string;
  /** Dark-mode tokens (the primary register for every theme). */
  dark: PortraitThemeTokens;
  /**
   * Light-mode tokens — a DESIGNED light variant (parchment ground carrying the
   * theme's hue, dark ink, deepened accent), never a naive inversion. Omitted →
   * the theme renders its dark tokens in both modes ('classic' does this so
   * existing portraits are pixel-identical to the pre-theme renderer).
   */
  light?: PortraitThemeTokens;
}

export const DEFAULT_PORTRAIT_THEME: PortraitThemeKey = 'classic';

export const PORTRAIT_THEMES: Record<PortraitThemeKey, PortraitTheme> = {
  // The original look — midnight navy and gold. Token values mirror the maia.*
  // Tailwind palette the renderer used before themes existed, so 'classic'
  // (and every portrait with no theme set) renders exactly as before, in both
  // OS colour schemes (no light variant on purpose).
  // Note: ink-70/ink-50 never existed in the Tailwind palette, so those classes
  // were silently no-ops and inherited the body ink (#e2e8f0) — classic keeps
  // that rendered reality rather than "fixing" the look out from under it.
  classic: {
    key: 'classic',
    label: 'Midnight',
    description: 'Deep navy night sky with gold — the original.',
    dark: {
      '--sp-ground-deep': '#060D18',
      '--sp-ground': '#0A1628',
      '--sp-ground-rgb': '10, 22, 40',
      '--sp-surface': '#0F1D32',
      '--sp-surface-rgb': '15, 29, 50',
      '--sp-border': '#1E3A5F',
      '--sp-border-soft': '#162640',
      '--sp-ink-100': '#f8fafc',
      '--sp-ink-80': '#e2e8f0',
      '--sp-ink-70': '#e2e8f0',
      '--sp-ink-60': '#94a3b8',
      '--sp-ink-50': '#e2e8f0',
      '--sp-ink-40': '#64748b',
      '--sp-accent': '#B8860B',
      '--sp-accent-rgb': '184, 134, 11',
      '--sp-glow': 'rgba(245, 158, 11, 0.25)',
    },
  },
  // The register benchmark — the forest green Kelly loved (2026-07-08: "I also
  // like the rich green"), placed as Earth: forest ground, parchment ink,
  // antique gold, sage labels.
  earth: {
    key: 'earth',
    label: 'Earth',
    description: 'Rich forest green with parchment and antique gold.',
    dark: {
      '--sp-ground-deep': '#10160f',
      '--sp-ground': '#171f15',
      '--sp-ground-rgb': '23, 31, 21',
      '--sp-surface': '#1c2618',
      '--sp-surface-rgb': '28, 38, 24',
      '--sp-border': '#2b352a',
      '--sp-border-soft': '#222c1f',
      '--sp-ink-100': '#f4eeda',
      '--sp-ink-80': '#e9e2d0',
      '--sp-ink-70': '#d9d1b8',
      '--sp-ink-60': '#b8b09a',
      '--sp-ink-50': '#8ea183',
      '--sp-ink-40': '#7a8570',
      '--sp-accent': '#c9a35e',
      '--sp-accent-rgb': '201, 163, 94',
      '--sp-glow': 'rgba(201, 163, 94, 0.22)',
    },
    light: {
      '--sp-ground-deep': '#e3e1cf',
      '--sp-ground': '#f1efdf',
      '--sp-ground-rgb': '241, 239, 223',
      '--sp-surface': '#faf8ea',
      '--sp-surface-rgb': '250, 248, 234',
      '--sp-border': '#c8c5aa',
      '--sp-border-soft': '#d9d6bd',
      '--sp-ink-100': '#23281c',
      '--sp-ink-80': '#38402f',
      '--sp-ink-70': '#4d5542',
      '--sp-ink-60': '#616a55',
      '--sp-ink-50': '#5c7050',
      '--sp-ink-40': '#79816f',
      '--sp-accent': '#8a6a2a',
      '--sp-accent-rgb': '138, 106, 42',
      '--sp-glow': 'rgba(138, 106, 42, 0.16)',
    },
  },
  // Deep ember — charcoal maroon ground, burnished copper accent, clay labels.
  fire: {
    key: 'fire',
    label: 'Fire',
    description: 'Deep ember — charcoal maroon with burnished copper.',
    dark: {
      '--sp-ground-deep': '#170e0c',
      '--sp-ground': '#211410',
      '--sp-ground-rgb': '33, 20, 16',
      '--sp-surface': '#281a14',
      '--sp-surface-rgb': '40, 26, 20',
      '--sp-border': '#3b2a20',
      '--sp-border-soft': '#2f211a',
      '--sp-ink-100': '#f6efe0',
      '--sp-ink-80': '#ecdfcd',
      '--sp-ink-70': '#dccdb6',
      '--sp-ink-60': '#bfab94',
      '--sp-ink-50': '#b3906f',
      '--sp-ink-40': '#8f7663',
      '--sp-accent': '#d29a63',
      '--sp-accent-rgb': '210, 154, 99',
      '--sp-glow': 'rgba(210, 154, 99, 0.22)',
    },
    light: {
      '--sp-ground-deep': '#ecdfd0',
      '--sp-ground': '#f7efe2',
      '--sp-ground-rgb': '247, 239, 226',
      '--sp-surface': '#fcf6ea',
      '--sp-surface-rgb': '252, 246, 234',
      '--sp-border': '#d6c1ac',
      '--sp-border-soft': '#e3d3c1',
      '--sp-ink-100': '#2e1e14',
      '--sp-ink-80': '#443023',
      '--sp-ink-70': '#5c4737',
      '--sp-ink-60': '#7d685a',
      '--sp-ink-50': '#8f5c38',
      '--sp-ink-40': '#8d7869',
      '--sp-accent': '#9e5a26',
      '--sp-accent-rgb': '158, 90, 38',
      '--sp-glow': 'rgba(158, 90, 38, 0.15)',
    },
  },
  // Deep sea — ink blue-green ground (deliberately NOT the platform navy),
  // sea-pearl accent, sea-glass labels.
  water: {
    key: 'water',
    label: 'Water',
    description: 'Deep sea — ink blue-green with sea-pearl.',
    dark: {
      '--sp-ground-deep': '#0b1416',
      '--sp-ground': '#101c1f',
      '--sp-ground-rgb': '16, 28, 31',
      '--sp-surface': '#152428',
      '--sp-surface-rgb': '21, 36, 40',
      '--sp-border': '#263a3e',
      '--sp-border-soft': '#1d2e31',
      '--sp-ink-100': '#f1efe2',
      '--sp-ink-80': '#e6e3d2',
      '--sp-ink-70': '#d2cfba',
      '--sp-ink-60': '#adb0a0',
      '--sp-ink-50': '#85a79c',
      '--sp-ink-40': '#6f8a82',
      '--sp-accent': '#a9c7b9',
      '--sp-accent-rgb': '169, 199, 185',
      '--sp-glow': 'rgba(169, 199, 185, 0.20)',
    },
    light: {
      '--sp-ground-deep': '#dbe4de',
      '--sp-ground': '#ecf3ee',
      '--sp-ground-rgb': '236, 243, 238',
      '--sp-surface': '#f7faf6',
      '--sp-surface-rgb': '247, 250, 246',
      '--sp-border': '#b9cdc4',
      '--sp-border-soft': '#cfdcd4',
      '--sp-ink-100': '#17241f',
      '--sp-ink-80': '#2c3a34',
      '--sp-ink-70': '#43524b',
      '--sp-ink-60': '#59695f',
      '--sp-ink-50': '#41695a',
      '--sp-ink-40': '#75857c',
      '--sp-accent': '#38695b',
      '--sp-accent-rgb': '56, 105, 91',
      '--sp-glow': 'rgba(56, 105, 91, 0.14)',
    },
  },
  // Twilight slate — cool grey-violet ground, pale gold accent, dove labels.
  air: {
    key: 'air',
    label: 'Air',
    description: 'Twilight slate — grey-violet with pale gold.',
    dark: {
      '--sp-ground-deep': '#121118',
      '--sp-ground': '#191823',
      '--sp-ground-rgb': '25, 24, 35',
      '--sp-surface': '#201f2c',
      '--sp-surface-rgb': '32, 31, 44',
      '--sp-border': '#322f45',
      '--sp-border-soft': '#272536',
      '--sp-ink-100': '#f2f0e6',
      '--sp-ink-80': '#e7e4d6',
      '--sp-ink-70': '#d4d1c0',
      '--sp-ink-60': '#b1aea4',
      '--sp-ink-50': '#9d9db4',
      '--sp-ink-40': '#807f93',
      '--sp-accent': '#d6c68f',
      '--sp-accent-rgb': '214, 198, 143',
      '--sp-glow': 'rgba(214, 198, 143, 0.18)',
    },
    light: {
      '--sp-ground-deep': '#e0dfe7',
      '--sp-ground': '#f0eff5',
      '--sp-ground-rgb': '240, 239, 245',
      '--sp-surface': '#faf9fc',
      '--sp-surface-rgb': '250, 249, 252',
      '--sp-border': '#c5c3d4',
      '--sp-border-soft': '#d6d4e1',
      '--sp-ink-100': '#201f2b',
      '--sp-ink-80': '#34323f',
      '--sp-ink-70': '#4b4957',
      '--sp-ink-60': '#646273',
      '--sp-ink-50': '#5c5b7a',
      '--sp-ink-40': '#7f7d8c',
      '--sp-accent': '#7d6930',
      '--sp-accent-rgb': '125, 105, 48',
      '--sp-glow': 'rgba(125, 105, 48, 0.14)',
    },
  },
  // Deep indigo-violet ground, soft amethyst accent, amethyst-muted labels.
  aether: {
    key: 'aether',
    label: 'Aether',
    description: 'Deep indigo-violet with soft amethyst.',
    dark: {
      '--sp-ground-deep': '#120f1c',
      '--sp-ground': '#191527',
      '--sp-ground-rgb': '25, 21, 39',
      '--sp-surface': '#201b31',
      '--sp-surface-rgb': '32, 27, 49',
      '--sp-border': '#352c4c',
      '--sp-border-soft': '#292138',
      '--sp-ink-100': '#f4f0e4',
      '--sp-ink-80': '#eae4d4',
      '--sp-ink-70': '#d8d0bd',
      '--sp-ink-60': '#b6aea0',
      '--sp-ink-50': '#a695c4',
      '--sp-ink-40': '#857c9b',
      '--sp-accent': '#b49bd8',
      '--sp-accent-rgb': '180, 155, 216',
      '--sp-glow': 'rgba(180, 155, 216, 0.20)',
    },
    light: {
      '--sp-ground-deep': '#e4deec',
      '--sp-ground': '#f2eef7',
      '--sp-ground-rgb': '242, 238, 247',
      '--sp-surface': '#fbf9fd',
      '--sp-surface-rgb': '251, 249, 253',
      '--sp-border': '#ccc0dc',
      '--sp-border-soft': '#dbd2e6',
      '--sp-ink-100': '#251d33',
      '--sp-ink-80': '#392f48',
      '--sp-ink-70': '#514761',
      '--sp-ink-60': '#695f78',
      '--sp-ink-50': '#66508e',
      '--sp-ink-40': '#837a93',
      '--sp-accent': '#6f4d9e',
      '--sp-accent-rgb': '111, 77, 158',
      '--sp-glow': 'rgba(111, 77, 158, 0.14)',
    },
  },
};

/**
 * Resolve a (possibly missing/unknown) theme key to a theme. Never throws.
 * 'forest' is accepted as a legacy alias for 'earth' (the palette's first name,
 * briefly used on this branch before the element family existed).
 */
export function resolvePortraitTheme(key?: string | null): PortraitTheme {
  const k = key === 'forest' ? 'earth' : (key ?? DEFAULT_PORTRAIT_THEME);
  return PORTRAIT_THEMES[k as PortraitThemeKey] ?? PORTRAIT_THEMES.classic;
}

// ── Theme CSS (what the renderer injects) ──────────────────────────────────

/**
 * Element accent colours per colour-scheme. The dark set is the canonical
 * ELEMENT_META palette (soft, designed for dark ground); the light set is the
 * same five identities deepened for legibility on parchment. These are
 * mode-level, not per-theme: an element keeps its identity across themes.
 */
const ELEMENT_MODE_COLORS: Record<'dark' | 'light', Record<ElementKey, string>> = {
  dark: { fire: '#F5A362', water: '#8BADD6', earth: '#A8C69F', air: '#F5D565', aether: '#C4B5E8' },
  light: { fire: '#a3541e', water: '#38618d', earth: '#436b38', air: '#7f6712', aether: '#684b9e' },
};

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
}

/** The per-element CSS variables (`--sp-el-*`) for one colour scheme. */
function elementVars(mode: 'dark' | 'light'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const el of Object.keys(ELEMENT_MODE_COLORS[mode]) as ElementKey[]) {
    const rgb = hexToRgbTriplet(ELEMENT_MODE_COLORS[mode][el]);
    out[`--sp-el-${el}`] = ELEMENT_MODE_COLORS[mode][el];
    // Dark alphas mirror the pre-theme renderer exactly (#..40 border, #..1f
    // chip, 0.35 glow); light alphas are tuned for parchment ground.
    out[`--sp-el-${el}-border`] = `rgba(${rgb}, ${mode === 'dark' ? '0.25' : '0.45'})`;
    out[`--sp-el-${el}-chip`] = `rgba(${rgb}, 0.12)`;
    out[`--sp-el-${el}-glow`] = `rgba(${rgb}, ${mode === 'dark' ? '0.35' : '0.18'})`;
  }
  return out;
}

function cssDecls(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/**
 * The full CSS a portrait page injects for its theme: dark tokens on the
 * `[data-sp-theme]` root, plus a `prefers-color-scheme: light` override when
 * the theme carries a designed light variant. Themes without one (classic)
 * emit no media query at all, so they render identically in both schemes.
 */
export function portraitThemeCss(key?: string | null): string {
  const t = resolvePortraitTheme(key);
  const sel = `[data-sp-theme="${t.key}"]`;
  const darkCss = `${sel}{${cssDecls({ ...t.dark, ...elementVars('dark') })}}`;
  if (!t.light) return darkCss;
  const lightCss = `${sel}{${cssDecls({ ...t.light, ...elementVars('light') })}}`;
  return `${darkCss}@media (prefers-color-scheme: light){${lightCss}}`;
}

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

/**
 * The default, always-on framing. Still encodes the design law for every
 * portrait — symbolic-not-fate, companions-not-cages, a-becoming — but in a
 * magical register rather than a hedging one (Kelly 2026-06-20: "this style is
 * good for everyone"). The sovereignty truth is delivered as starlight, not as
 * a disclaimer; the protection is the same, the tone is dignified, not defensive.
 */
export const DEFAULT_FRAMING: PortraitFraming = {
  notes: [
    'The stars reveal the weather of a season; your soul chooses how to walk through it.',
    'You are never one sign, one name, one line — you are the whole sky.',
    'Read this as a mirror held up by love, and keep what your own heart already knows is true.',
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
