/**
 * FLAGSHIP STUDIO — COMPOSITION TOKENS
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0`, checkpoint B2.
 *
 * ⭐ The EARNED GUARANTEES of `studioTheme` are imported, not restated: the warm
 * ground ramp, the bounded gold, MAIA's visual distinctness, the prose measure,
 * the spacing order and the type roles. Those are preserved unchanged.
 *
 * ⛔ What is NOT imported is `COLUMN_FRACTION` / `writingFieldLayout` / `PANELS`
 * / `PRESENT_AT_COMPACT`. Those describe a three-permanent-region architecture
 * that the approved flagship references replace, and `studioTheme` itself marks
 * them provisional and reference-derived, carrying no design authority.
 *
 * ⭐ Per the frozen composition law: existing components have NO VISUAL AUTHORITY
 * merely because they already exist.
 */

import { MEASURE, RADIUS, SPACE } from '../studioTheme';

/** Warm literary ground ramp — shell → panel → field → active. */
export const GROUND = {
  shell: '#F2F0EA',
  panel: '#EAE6DC',
  field: '#F7F4ED',
  card: '#FBFAF6',
  active: '#DED5C0',
} as const;

export const INK = {
  primary: '#26231E',
  secondary: '#4C473E',
  muted: '#766E61',
  quiet: '#9A9185',
  rule: '#CFC7B8',
  soft: '#DDD6CA',
} as const;

/** Bounded: state and action only. ⛔ Never decoration. */
export const GOLD = { line: '#8A6727', fill: '#CDBD91', on: '#FBF8F1' } as const;

/** ⭐ MAIA must remain visually distinct from the Work. */
export const MAIA = { voice: '#6E6596', tint: '#EEECF4', rule: '#CFC9E0' } as const;

/** The persistent app rail. ⭐ Navigation chrome — ⛔ never a content region. */
export const RAIL = {
  ground: '#241F1A',
  ink: '#B9AF9E',
  active: '#3B322A',
  on: '#F2EDE3',
  hair: 'rgba(255,255,255,.07)',
} as const;

/** The held passage. Quiet ground tint + edge marker, ⛔ never a highlighter. */
export const HELD = { fill: '#F3E7CE', edge: '#C9A961' } as const;

/** Revision diff, shown in place. */
export const DIFF = { removed: '#9A5B4A', added: '#4A6B4E' } as const;

export const SERIF = "'Spectral', Georgia, 'Times New Roman', serif";
export const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * ⭐ THE ONE COMPOSITION RULE, in one constant.
 *
 * The rail is a FIXED WIDTH of chrome. Everything else belongs to the
 * manuscript. ⛔ There is no second content column and no fraction table,
 * because there is nothing to divide the remainder between.
 */
export const COMPOSITION = {
  railWidth: 184,
  /** The manuscript's measure. Invariant under every contextual layer — MAIA
   *  never takes width from it, because she never participates in its layout. */
  proseMeasure: MEASURE.prose,
  /** ⭐ MAIA is an OVERLAY, not a column. This is what makes F3/V2 structural:
   *  a layer outside the manuscript's flow cannot shift its width, move its
   *  prose vertically, or change its scroll position by mounting. */
  maiaWidth: 336,
  maiaGutter: SPACE.roomy,
} as const;

export { RADIUS, SPACE, MEASURE };

/** ⭐ Member-facing modes under one shell. ⛔ Not three legacy products. */
export const MODES = ['write', 'develop', 'review'] as const;
export type Mode = (typeof MODES)[number];

/**
 * ⭐ RULED 2026-09-22 (founder act). The earlier "reading" is superseded.
 *
 *   BRAND               Write · Explore · Refine · Become
 *   PRODUCT NAVIGATION  Home · Write · Develop · Review · Library · Search
 *
 * ⭐ *The first describes the Soullab journey. The second tells the member where
 * they are.* ⛔ The brand arc is NOT navigation and NEVER becomes a clickable
 * mode label.
 *
 * ⛔ Desktop and mobile must use THE SAME SEMANTIC NAMES. Mobile may reduce the
 * immediately visible set to Write · Develop · Review with the rest behind the
 * menu — ⛔ it may NOT rename Develop to Explore or Review to Refine.
 */
/**
 * ⭐ CAPABILITY-HONEST NAVIGATION (founder ruling, 2026-09-22).
 *
 * ⛔ *The visual rail is a COMPOSITION REFERENCE, not permission to invent
 * destinations.* An earlier reference drew `Search` and `Library`; canonical has
 * no Studio Search destination, so drawing one would be `assertStudioMapHonest()`
 * broken by a picture.
 *
 * ⚠️ `review` is listed because this build is making it genuinely available. ⛔ It
 * is the one entry whose presence depends on B7 landing — if Review ships without
 * a room behind it, this list is wrong and the rail is lying.
 */
/**
 * ⭐⭐ `home` REMOVED — founder ruling, Home/Arrival §2 + §11.3.
 *
 * It was a CAPABILITY-FALSE DESTINATION: rendered as a named button in every
 * room on every viewport, with no room, no phase and no rendered state behind
 * it. ⛔ The repair is removal, ⛔ NOT an improvised Home room built to satisfy
 * a label — *a false destination is worse than a temporarily smaller
 * navigation set.*
 *
 * ⚠️ The Work-root / arrival question is UNRESOLVED future product semantics
 * (§5), and ⛔ the word `Home` is not assumed to survive that review. First
 * Arrival is an arrival STATE over the Work; ⛔ no fourth room is authorized.
 */
export const NAV_DESTINATIONS = ['write', 'develop', 'review'] as const;
export type NavDestination = (typeof NAV_DESTINATIONS)[number];

export const NAV_LABEL: Readonly<Record<NavDestination, string>> = {
  write: 'Write', develop: 'Develop', review: 'Review',
};

/** ⭐ Same semantic names as the rail. ⛔ Develop is never renamed Explore. */
export const MOBILE_PRIMARY: readonly NavDestination[] = ['write', 'develop', 'review'];

/**
 * R1-1C · the lawful action a LIVE host may put behind a destination: a location
 * (rendered `<a href>`) or an act (rendered `<button>`). ⛔ Never a fetch, a
 * commission or a write. The current destination carries no action.
 */
export type NavAction =
  | { readonly kind: 'link'; readonly href: string; readonly onSelect?: (e: { preventDefault(): void }) => void }
  | { readonly kind: 'act'; readonly onAct: () => void };
export type NavActions = Partial<Record<NavDestination, NavAction>>;
export const MOBILE_BEHIND_MENU: readonly NavDestination[] = [];

/* ══════════════════════════════════════════════════════════════════════════
   FACETS — ⭐ GUIDED · LEARNING · DIRECT

   *Three facets. One intelligence. One Work.*

   ⛔ A facet changes how much MAIA TRANSLATES and EXPLAINS. ⛔ It NEVER changes
   how much MAIA WRITES, what she believes happened, her evidence, her coverage,
   or the proposal scope — **proposal breadth is locus-bound and FACET-INVARIANT.**
   ⛔ Never assigned, never inferred, never a competence question.
   ⛔ A `Teach` tab is not a substitute for this control.
   ══════════════════════════════════════════════════════════════════════════ */

export const FACETS = ['guided', 'learning', 'direct'] as const;
export type Facet = (typeof FACETS)[number];

export const FACET_COPY: Readonly<Record<Facet, { label: string; line: string }>> = {
  guided: { label: 'Guided', line: 'Help me shape this with you.' },
  learning: { label: 'Learning', line: 'Help me write — and teach me as we go.' },
  direct: { label: 'Direct', line: 'Give me the editorial detail.' },
};

export const FACET_REASSURANCE = 'You can change this anytime. It does not change your Work.';

/** ⛔ None of these may ever appear beside a facet, in copy or in data. */
export const FACET_FORBIDDEN_FRAMINGS = [
  'beginner', 'intermediate', 'advanced', 'professional', 'expert',
  'skill level', 'experience level', 'recommended for you',
] as const;

/** ⭐ Brand arc. ⛔ Never rendered as a navigation control, on any viewport. */
export const BRAND_ARC = ['Write', 'Explore', 'Refine', 'Become'] as const;

/**
 * ⭐ THE RAIL BOUNDARY, frozen: *the rail may navigate the Studio; it may not
 * become a permanent content workspace.* Icons, labels and a small Project/Work
 * identity area are permitted. ⛔ These are not, ever:
 */
export const RAIL_MAY_NEVER_CONTAIN = [
  'manuscript-outline', 'findings', 'maia-dialogue',
  'developmental-analysis', 'version-history', 'source-content',
] as const;

/**
 * ATMOSPHERE — binding composition authority, ⭐ as quiet environmental identity,
 * ⛔ never decorative content competing with the manuscript.
 *
 * Shallow · low information density · ⛔ never significantly reducing reading
 * space · respects atmosphere preferences · ⭐ recedes in Focus mode.
 */
export const ATMOSPHERE = {
  /** Shallow by construction. A band that grew into a hero would breach the law
   *  above, so the depth is a constant the acceptance suite can read. */
  bandHeight: 44,
  focusBandHeight: 0,
  /** ⛔ Zero text, zero controls, zero data. Environmental identity only. */
  maxInformationElements: 0,
} as const;

/**
 * READ TIME — ⛔ a decorative estimate is forbidden. If shown, the basis is shown
 * with it. ⭐ There is no default that hides the assumption.
 */
export const READING_WPM = 200;
export function readTimeLabel(words: number): string {
  const mins = Math.round(words / READING_WPM);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const dur = h > 0 ? `~${h} hr${m > 0 ? ` ${m} min` : ''}` : `~${m} min`;
  return `${dur} at ${READING_WPM} wpm`;
}
