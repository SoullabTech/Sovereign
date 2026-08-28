/**
 * WS2-02A — the Writer's Studio visual foundation.
 *
 * The reusable vocabulary of form: type, surfaces, gold, spacing, states,
 * panel behaviour and responsive rules. WS2-02B composes rooms from it;
 * WS2-03 builds the persistent shell. Nothing here renders anything.
 *
 * ── AUTHORITY ──────────────────────────────────────────────────────────────
 *
 * Governing lane: claude/writers-studio-organization-wxpb7q (D-020).
 * DESIGN-CONTRACT.md is FROZEN; §2 states the composition rules this file
 * makes executable, and §0 puts six distinct reference screens under custody.
 *
 * Every value below was taken from the reference pack, not from prose about
 * it. Method: the PNGs were read directly and sampled — the ground ramp by
 * frequency, the accents by hue-clustering pixels above a saturation floor in
 * `04-writing-field-wide.png` (canonical) and `05-materials-studio.png`.
 * Sampled anchors are recorded beside the tokens they justify so a later
 * session can re-derive them instead of trusting this comment.
 *
 * ── WHAT THIS FILE DOES NOT DO ─────────────────────────────────────────────
 *
 * It does not fork the palette. `pressTheme.ts` already holds the Studio's
 * true ground, text, accent and rules, and is deliberately duplicated into
 * app/press/manuscript while PR #825 is open. PRESS and SERIF are imported and
 * re-exported here unchanged — one source, extended, never a second system.
 *
 * The sampling confirmed those existing values rather than replacing them:
 * PRESS.rule #4A4238 against a sampled border family of #4F453B, and
 * PRESS.ink #1A1513 against a ground ramp whose dominant tone is #1D1812.
 * The tokens that were missing are the ones added below.
 */

import { PRESS, SERIF } from './pressTheme';

export { PRESS, SERIF };

/* ══════════════════════════════════════════════════════════════════════════
   1 · GROUND — the ramp, darkest to lightest

   Sampled from 04. The room is not one flat colour: it is a shallow warm
   ramp, and depth is carried by that ramp rather than by borders. Ordered
   here so `deepest` really is the deepest — asserted in tests, because a ramp
   that stops being monotonic stops reading as depth and starts reading as
   noise.

   Warm on purpose. This is espresso, not neutral charcoal: every sampled
   ground tone has red > green > blue. A cool grey dropped into this room is
   immediately foreign, which is why `assertGroundIsWarm` exists.
   ══════════════════════════════════════════════════════════════════════════ */

export const GROUND = {
  /** Recessed wells — the panel behind panels. Sampled #15120D. */
  deepest: '#15120D',
  /** Page edge / shell ground. PRESS.ink, confirmed against sampled #1C1711. */
  base: '#1A1513',
  /** The writing field itself — the largest, quietest surface. Sampled #1D1812. */
  field: '#1D1812',
  /** Rails and bands sitting on the field. Sampled #221B12. */
  raised: '#221B12',
  /** Hover / selected row. Sampled #342715 on the active section row in 04. */
  active: '#342715',
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   2 · TYPOGRAPHY

   DESIGN-CONTRACT §2: "Generous type. Long-form reading is the primary act;
   the room is built around a column of prose, not around chrome."

   Two families, and the split is semantic rather than decorative. Serif is
   the member's work — manuscript prose, chapter titles, work identity,
   epigraphs. Sans is the room around it — navigation, labels, metadata,
   counts. A member can tell, without reading a word, whether they are looking
   at their writing or at the building it sits in.

   MAIA's reading is set in SANS on purpose. Her language is not the member's
   prose, and setting it in the manuscript's own face would blur exactly the
   line D-019 requires be kept: member material remains distinguishable from
   MAIA interpretation.
   ══════════════════════════════════════════════════════════════════════════ */

export const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, Helvetica, Arial, sans-serif';

export interface TypeRole {
  family: string;
  /** rem. Long-form prose sits at the top of the scale, not the middle. */
  size: number;
  lineHeight: number;
  weight: number;
  /** em. Positive only on the small uppercase labels the references use. */
  tracking?: number;
  uppercase?: boolean;
}

export const TYPE: Record<string, TypeRole> = {
  /** Chapter titles — the largest thing in the room. "Chapter Seven" in 04. */
  chapterTitle: { family: SERIF, size: 2.5, lineHeight: 1.15, weight: 400 },
  /** The chapter's subtitle/element, italic in 04 ("Air"). */
  chapterSubtitle: { family: SERIF, size: 1.75, lineHeight: 1.25, weight: 400 },
  /** Work identity in the chrome — the work's name, never a manuscript's. */
  workIdentity: { family: SERIF, size: 1.0625, lineHeight: 1.35, weight: 500 },
  /**
   * Long-form manuscript prose. The primary act, so the primary size.
   * 1.1875rem ≈ 19px: comfortably above UI text, which is the point.
   */
  prose: { family: SERIF, size: 1.1875, lineHeight: 1.75, weight: 400 },
  /** Epigraph — centred gold italic in 04. */
  epigraph: { family: SERIF, size: 1.0625, lineHeight: 1.6, weight: 400 },
  /** Rail band headings: WORK SPACE · MAIA · TOOLS. */
  bandLabel: {
    family: SANS, size: 0.6875, lineHeight: 1.2, weight: 600,
    tracking: 0.12, uppercase: true,
  },
  /** Panel headings: MANUSCRIPT · MATERIALS · DEVELOPMENTAL INSIGHTS. */
  panelLabel: {
    family: SANS, size: 0.75, lineHeight: 1.2, weight: 600,
    tracking: 0.1, uppercase: true,
  },
  /** Navigation and destination labels. */
  navItem: { family: SANS, size: 0.875, lineHeight: 1.4, weight: 500 },
  /** MAIA's reading. Sans — see the note above; this is not the member's prose. */
  maiaReading: { family: SANS, size: 0.875, lineHeight: 1.55, weight: 400 },
  /** Counts, timestamps, file facts. Quiet by construction. */
  metadata: { family: SANS, size: 0.75, lineHeight: 1.4, weight: 400 },
  /** Supporting text that must not compete: notes under a destination. */
  quiet: { family: SANS, size: 0.8125, lineHeight: 1.5, weight: 400 },
};

/* ══════════════════════════════════════════════════════════════════════════
   3 · INK — text tones on the ramp
   ══════════════════════════════════════════════════════════════════════════ */

export const INK = {
  /** Manuscript prose and titles. PRESS.text. */
  primary: PRESS.text,
  /** Chrome text that is not prose. */
  secondary: '#CFC5B6',
  /** Metadata, counts, timestamps. */
  muted: '#9A8F80',
  /** Present but deliberately receding — an inactive rail item. */
  quiet: '#7A7065',
  /** On a gold fill. Dark, because gold is a light surface here. */
  onAccent: PRESS.ink,
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   4 · GOLD — where it is permitted, and where it is not

   DESIGN-CONTRACT §2: "Gold used as accent and emphasis, not as decoration."

   A rule with no enforcement drifts within one sprint, because gold is the
   most attractive colour in the palette and every new surface wants a little.
   So the permitted uses are enumerated and the forbidden ones are named. The
   test asserts the two sets never overlap and that nothing in GROUND is gold.

   The deeper reason it is bounded: gold marks the member's own work and the
   member's own emphasis. Spend it on chrome and it stops meaning anything —
   and, worse, it stops being available to mean *this is yours*.
   ══════════════════════════════════════════════════════════════════════════ */

export const GOLD = {
  /** PRESS.accent. The one true accent. */
  DEFAULT: PRESS.accent,
  /** Fills at rest — sampled #734F1A on the New Work button in 04. */
  fill: '#734F1A',
  /** Epigraph / emphasis text — sampled #A7783A in 04. */
  text: '#A7783A',
  /** Hairline emphasis on a border. */
  edge: '#5A431C',
} as const;

export const GOLD_PERMITTED = [
  'primary-action-fill',
  'active-mode-indicator',
  'active-nav-item',
  'selected-item-border',
  'epigraph-and-emphasis',
  'writer-declared-goal-progress',
  'section-marker',
] as const;

export const GOLD_FORBIDDEN = [
  'panel-ground',
  'page-ground',
  'body-prose',
  'decorative-flourish',
  'maia-voice',
  'maia-authored-emphasis',
  'metadata',
] as const;

/* ══════════════════════════════════════════════════════════════════════════
   5 · MAIA — her own accent, and why that is architecture

   Sampled from 04, and this is the single most load-bearing finding of the
   read: MAIA's greeting is NOT gold. It is violet — #7A71A0 as text, over a
   #3D2E4D surface family, clustering at hue 240-270 degrees where every other
   accent in the room sits at 30-45.

   That is D-019 rendered. "Member material remains distinguishable from MAIA
   interpretation" is stated in the decisions record as an object-model rule;
   the reference pack independently keeps the same separation in colour. The
   member's work and the member's emphasis are gold. MAIA's voice is violet.
   A reader can tell whose language they are looking at pre-attentively,
   before parsing a single word.

   So this is not a palette preference. Recolouring MAIA gold would erase a
   constitutional distinction at the visual layer while leaving the schema
   intact — the kind of drift that is invisible in a code review and obvious
   in a screenshot. assertMaiaIsNotGold refuses it.
   ══════════════════════════════════════════════════════════════════════════ */

export const MAIA_ACCENT = {
  /** MAIA's speaking voice. Sampled #7A71A0 in 04. */
  voice: '#7A71A0',
  /** Her panel's chip/inset surface. Sampled #3D2E4D. */
  surface: '#3D2E4D',
  /** Her edge treatment. */
  edge: '#4A3A5E',
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   6 · INSIGHT TYPE CHIPS

   04 and 08 both label each developmental insight with a type chip, and the
   chips are colour-coded BY KIND — theme, structure, continuity, reader
   experience. Sampled families: violet (#3D2E4D), amber (#412E15), teal
   (#1F5750), blue.

   These encode kind, never severity. There is no worst-to-best ordering here
   and none may be introduced: a red "critical" chip would be a machine
   judgement wearing the costume of a category, which is exactly what D-003
   and maiaOffering.ts forbid. Both references show the same discipline — the
   only numbers beside an insight are "3 passages" and "2 suggestions".
   ══════════════════════════════════════════════════════════════════════════ */

export const INSIGHT_CHIP = {
  theme: { bg: '#3D2E4D', ink: '#C3B4D8' },
  structure: { bg: '#412E15', ink: '#D8B98A' },
  continuity: { bg: '#1F5750', ink: '#9FD4CB' },
  readerExperience: { bg: '#25384D', ink: '#A8C4DD' },
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   7 · SPACING & DENSITY

   DESIGN-CONTRACT §2: "Density is low. The references show restraint —
   whitespace is load-bearing."

   Treated as structure, not leftover. `prose` is the measure and it is a
   ceiling, not a target: a manuscript column that grows with the viewport
   stops being readable somewhere around 75 characters, and the whole room is
   built around that column staying comfortable.
   ══════════════════════════════════════════════════════════════════════════ */

export const SPACE = {
  hairline: 2, tight: 4, snug: 8, base: 12, comfortable: 16,
  roomy: 24, generous: 32, section: 48, band: 64,
} as const;

export const MEASURE = {
  /** ch. The manuscript column ceiling. Long-form reading degrades past this. */
  prose: 68,
  /** px. Room gutter around the writing field. */
  roomGutter: 32,
  /** px. Left rail at rest. */
  railWidth: 216,
  /** px. Contextual panel at rest. */
  panelWidth: 300,
  /** px. Below this the writing field cannot keep its measure — see RESPONSIVE. */
  fieldMinWidth: 420,
} as const;

export const RADIUS = { sm: 4, base: 6, panel: 8, pill: 999 } as const;

export const RULE = {
  /** PRESS.rule — confirmed against sampled #4F453B. */
  DEFAULT: PRESS.rule,
  soft: PRESS.ruleSoft,
  emphasis: GOLD.edge,
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   8 · STATES

   `unavailable` is the delicate one, and it is deliberately NOT a member
   affordance for an unbuilt room. Under the render-boundary rule ratified for
   studioMap.ts, an unbuilt destination never reaches a screen at all — it is
   dropped, not greyed. `unavailable` exists for a real control that is
   momentarily not actionable: an export with nothing yet to export, an action
   mid-save. If it is ever used to render a `later` destination, the roadmap
   has leaked and the guard has been routed around.

   `refusal` is separate from `error` on purpose. An error is the system
   failing; a refusal is the system declining — the Canvas leaving a
   manuscript unresolved when several works declare it rather than guessing.
   A refusal is correct behaviour and must not be dressed as a fault.
   ══════════════════════════════════════════════════════════════════════════ */

export type StudioState =
  | 'rest' | 'hover' | 'focus' | 'active' | 'selected'
  | 'quiet' | 'empty' | 'loading' | 'unavailable' | 'refusal' | 'error';

export const STATE: Record<StudioState, { bg?: string; ink: string; edge?: string }> = {
  rest: { ink: INK.secondary },
  hover: { bg: GROUND.raised, ink: INK.primary },
  focus: { ink: INK.primary, edge: GOLD.DEFAULT },
  active: { bg: GROUND.active, ink: INK.primary, edge: GOLD.edge },
  selected: { bg: GROUND.active, ink: INK.primary, edge: GOLD.DEFAULT },
  quiet: { ink: INK.quiet },
  empty: { ink: INK.muted },
  loading: { ink: INK.muted },
  unavailable: { ink: INK.quiet },
  refusal: { ink: INK.secondary, edge: RULE.DEFAULT },
  error: { ink: '#D9A48F', edge: '#6E3B2E' },
};

/* ══════════════════════════════════════════════════════════════════════════
   9 · PANEL BEHAVIOUR CONTRACT

   DESIGN-CONTRACT §2: "Panels are contextual and dismissible, not permanent
   furniture."

   Both 04 and 05 draw a close control on MAIA and on Materials. The rule is
   easy to lose to implementation convenience — a panel that is always mounted
   is simpler than one that is not — so dismissibility is declared per role and
   asserted, rather than left to whoever builds the panel.

   The writing field is the deliberate exception, and it is not furniture: it
   is the thing the room is for. A member cannot dismiss their own manuscript.
   ══════════════════════════════════════════════════════════════════════════ */

export type PanelRole =
  | 'writing-field' | 'manuscript-outline' | 'maia' | 'materials'
  | 'versions' | 'goals' | 'statistics';

export interface PanelContract {
  role: PanelRole;
  /** False only for the writing field — see above. */
  dismissible: boolean;
  /** True when the panel is summoned by context rather than always present. */
  contextual: boolean;
  /** Which side the reference places it on. */
  placement: 'center' | 'left' | 'right' | 'bottom';
}

export const PANELS: PanelContract[] = [
  { role: 'writing-field', dismissible: false, contextual: false, placement: 'center' },
  { role: 'manuscript-outline', dismissible: true, contextual: false, placement: 'left' },
  { role: 'maia', dismissible: true, contextual: true, placement: 'right' },
  { role: 'materials', dismissible: true, contextual: true, placement: 'right' },
  { role: 'versions', dismissible: true, contextual: true, placement: 'bottom' },
  { role: 'goals', dismissible: true, contextual: true, placement: 'bottom' },
  { role: 'statistics', dismissible: true, contextual: true, placement: 'bottom' },
];

/* ══════════════════════════════════════════════════════════════════════════
   10 · RESPONSIVE

   Only what the two reference architectures actually support. 04 is the wide
   field — five-mode nav, left rail, MAIA and Materials as right rails, a
   bottom band. 08 is the second architecture at a narrower width: no
   five-mode nav, Materials demoted to a horizontal strip along the bottom,
   MAIA still present at the right.

   The ordering below is read from that difference: chrome collapses before
   the writing field is crushed. Materials leaves the right rail before the
   field gives up its measure, because 08 shows exactly that trade being made.
   No mobile architecture is invented — neither reference shows one, and
   guessing it here would be the design-system equivalent of inventing a
   migration from a programme description.
   ══════════════════════════════════════════════════════════════════════════ */

export const BREAKPOINT = { compact: 1024, wide: 1440 } as const;

/** Collapsed in this order as width is lost. Earlier entries go first. */
export const COLLAPSE_ORDER: PanelRole[] = [
  'statistics', 'goals', 'versions', 'materials', 'manuscript-outline', 'maia',
];

/* ══════════════════════════════════════════════════════════════════════════
   11 · EXECUTABLE INVARIANTS
   ══════════════════════════════════════════════════════════════════════════ */

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function hueOf(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/** The ground ramp must stay monotonic, or depth reads as noise. */
export function assertGroundRampOrdered(): void {
  const ramp = [GROUND.deepest, GROUND.base, GROUND.field, GROUND.raised, GROUND.active];
  for (let i = 1; i < ramp.length; i++) {
    if (luminance(ramp[i]) <= luminance(ramp[i - 1])) {
      throw new Error(
        `Ground ramp is not monotonic at index ${i} (${ramp[i - 1]} → ${ramp[i]}). ` +
          `The room carries depth by the ramp, not by borders.`,
      );
    }
  }
}

/** Espresso, not charcoal. Every ground tone is warm: red > green > blue. */
export function assertGroundIsWarm(): void {
  for (const [name, hex] of Object.entries(GROUND)) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    if (!(r > g && g >= b)) {
      throw new Error(`GROUND.${name} (${hex}) is not warm. The Studio ground is espresso.`);
    }
  }
}

/** Gold is accent and emphasis. It may not become a surface or decoration. */
export function assertGoldIsBounded(): void {
  const forbidden = new Set<string>(GOLD_FORBIDDEN);
  for (const use of GOLD_PERMITTED) {
    if (forbidden.has(use)) {
      throw new Error(`"${use}" is listed as both a permitted and a forbidden gold use.`);
    }
  }
  for (const [name, hex] of Object.entries(GROUND)) {
    const h = hueOf(hex);
    if (h >= 30 && h <= 50 && luminance(hex) > 0.35) {
      throw new Error(
        `GROUND.${name} (${hex}) has become a gold surface. Gold is accent, not ground.`,
      );
    }
  }
}

/**
 * MAIA's voice may not be gold.
 *
 * D-019 at the visual layer: member material stays distinguishable from MAIA
 * interpretation. Gold marks the member's work and emphasis; MAIA speaks in
 * violet. Collapsing the two erases a constitutional distinction in a way a
 * schema review would never catch.
 */
export function assertMaiaIsNotGold(): void {
  const goldHue = hueOf(GOLD.DEFAULT);
  for (const [name, hex] of Object.entries(MAIA_ACCENT)) {
    const diff = Math.abs(hueOf(hex) - goldHue);
    if (Math.min(diff, 360 - diff) < 60) {
      throw new Error(
        `MAIA_ACCENT.${name} (${hex}) sits in gold's hue family. MAIA's voice must remain ` +
          `visually distinct from the member's own work and emphasis (D-019).`,
      );
    }
  }
}

/** Contextual panels are dismissible. The writing field is not furniture. */
export function assertPanelsAreNotFurniture(): void {
  for (const p of PANELS) {
    if (p.contextual && !p.dismissible) {
      throw new Error(
        `Panel "${p.role}" is contextual but not dismissible — that is permanent furniture.`,
      );
    }
    if (!p.dismissible && p.role !== 'writing-field') {
      throw new Error(
        `Panel "${p.role}" cannot be dismissed. Only the writing field may be undismissable.`,
      );
    }
  }
}

/** Long-form reading is the primary act, so prose outranks chrome in size. */
export function assertProseOutranksChrome(): void {
  const chrome = ['navItem', 'metadata', 'bandLabel', 'panelLabel', 'maiaReading', 'quiet'];
  for (const role of chrome) {
    if (TYPE[role].size >= TYPE.prose.size) {
      throw new Error(
        `TYPE.${role} is at least as large as prose. The room is built around the column ` +
          `of prose, not around chrome.`,
      );
    }
  }
}

/** Spacing is structure: the scale must stay ordered to mean anything. */
export function assertSpacingOrdered(): void {
  const vals = Object.values(SPACE);
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] <= vals[i - 1]) {
      throw new Error(`SPACE scale is not ascending at index ${i}.`);
    }
  }
}

/** Chrome yields before the writing field does. Read from 04 → 08. */
export function assertFieldSurvivesCollapse(): void {
  if (COLLAPSE_ORDER.includes('writing-field')) {
    throw new Error('The writing field may not be collapsed. It is what the room is for.');
  }
  if (COLLAPSE_ORDER.indexOf('materials') >= COLLAPSE_ORDER.indexOf('manuscript-outline')) {
    throw new Error(
      'Materials must yield before the manuscript outline — 08 demotes Materials to a ' +
        'bottom strip while the outline keeps its rail.',
    );
  }
}

/** Run the whole foundation. */
export function assertStudioThemeCoherent(): void {
  assertGroundRampOrdered();
  assertGroundIsWarm();
  assertGoldIsBounded();
  assertMaiaIsNotGold();
  assertPanelsAreNotFurniture();
  assertProseOutranksChrome();
  assertSpacingOrdered();
  assertFieldSurvivesCollapse();
}
