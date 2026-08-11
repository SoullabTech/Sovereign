/**
 * Journal Room — register.
 *
 * Derived from the House token layer (docs/canon/SOULLAB_THEME.md). Per that
 * canon the room modulates the SIGNAL layer only — "the field stays continuous."
 * Nothing here invents a second palette vocabulary.
 *
 * The approved experiential reference specifies no literal colour values, and
 * no values are inherited from Author Studio, Studio Field, Studio Threshold or
 * Wisdom Keepers. Similarity is not lineage (Work Unit §5). What the reference
 * DOES specify is register: quiet · spacious · literary · writing-first · ember
 * restraint · software recedes.
 *
 * @see docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
 * @see docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
 */

/**
 * Type roles. The visual-grammar law's four-layer hierarchy puts the member's
 * OWN words at the meaning layer — so the member's writing and the room's one
 * question are serif; everything the software says about itself is small sans.
 */
export const type = {
  /** The arrival question. The largest thing in the room. */
  question: 'font-serif text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.25] tracking-[-0.01em]',
  /** The member's own writing — reading and composing share one measure. */
  writing: 'font-serif text-[clamp(1.0625rem,1.6vw,1.1875rem)] leading-[1.75]',
  /** Room marker. Quiet, small, never competing. */
  marker: 'font-sans text-[0.6875rem] tracking-[0.18em] uppercase',
  /** Provenance and time. Beneath the writing, never above it. */
  meta: 'font-sans text-[0.8125rem] leading-relaxed',
  /** MAIA's two labelled statements. */
  maiaLabel: 'font-sans text-[0.625rem] tracking-[0.18em] uppercase',
  maiaBody: 'font-serif text-[clamp(1rem,1.5vw,1.0625rem)] leading-[1.7]',
} as const;

/**
 * MATERIAL — ivory, Journal-specific (founder ruling, 2026-08-11).
 *
 *   navy  = an evening room in which writing is DISPLAYED
 *   ivory = a surface on which writing HAPPENS
 *
 * Journal's primary human activity is inscription, so the material reinforces the
 * activity. ⛔ This does NOT make Soullab ivory: these variables are scoped to the
 * Journal room's own root and change no House token. Every other room continues to
 * resolve `--sl-*` unchanged.
 *
 * PROVENANCE — nothing invented, nothing taken from a neighbouring room's identity
 * (similarity is not lineage):
 *   · field / ink     `docs/SOULLAB_DESIGN_CANON.md` light theme — the House's own
 *                     canonical warm light palette (warm off-white; stone-800/600/500)
 *   · ember #A55A22   the shipped Journal's own accent, already in
 *                     `components/journal/UnifiedJournalView.tsx` — Journal's ember,
 *                     not one borrowed from Author Studio or Studio Field
 *
 * Applied once, on the room root in JournalRoom.
 */
export const roomVars: Record<string, string> = {
  '--jr-field': '#F8F7F5',
  '--jr-ink': '#292524',
  // The ramp is one step darker than the canon's default light text scale.
  // Measured on this field 2026-08-11: stone-500 (#78716C) gives 4.48:1 — it
  // fails AA by 0.02, which is invisible to the eye and still a failure. Ivory
  // is a lighter field than the canon's cards sit on, so the ramp moves with it.
  '--jr-ink-secondary': '#44403C',
  '--jr-ink-muted': '#57534E',
  '--jr-ember': '#A55A22',
  '--jr-hairline': 'rgba(214, 211, 209, 0.6)',
};

/**
 * Colour roles. The role NAMES are unchanged from the navy candidate — only what
 * they resolve to has moved. That is what keeps this a material change rather than
 * a redesign: no component's markup changes.
 *
 * `accent` is the ember signal — one per state, never decorative.
 */
export const color = {
  field: 'bg-[var(--jr-field)]',
  human: 'text-[var(--jr-ink)]',
  secondary: 'text-[var(--jr-ink-secondary)]',
  muted: 'text-[var(--jr-ink-muted)]',
  accent: 'text-[var(--jr-ember)]',
  accentBorder: 'border-[var(--jr-ember)]',
  hairline: 'border-[var(--jr-hairline)]',
} as const;

/**
 * Space. The reference's "spaciousness" and "software recedes" are mostly a
 * spacing claim — the room is defined by what it leaves empty.
 */
export const space = {
  /**
   * THE ROOM'S SINGLE COMPOSITIONAL AXIS (founder ruling, 2026-08-11).
   *
   * The desktop walk read as "unfinished" not because the room was empty but
   * because it had THREE alignments: the `Journal` marker at the page edge, the
   * writing column centred, and `Browse` back at the page edge. Empty space
   * either side of a column that nothing else agrees with reads as leftover.
   *
   * Every element in every state now hangs off this one axis. The emptiness then
   * has an organizing relationship to the writing — it becomes the margin of a
   * page rather than unused canvas.
   *
   * ⛔ Not a fix by filling: nothing was added, no box drawn, and the measure is
   * unchanged.
   */
  axis: 'mx-auto w-full max-w-[34rem]',
  /** Long readable measure. Governs writing AND reading — the same column. */
  measure: 'max-w-[34rem]',
  /** Room margin. Generous at every breakpoint; mobile keeps the quiet. */
  room: 'px-6 sm:px-8 md:px-10',
  /** Vertical breathing above the primary gesture. */
  breathing: 'mt-10 sm:mt-12',
} as const;

/**
 * Focus. Accessibility is not waived by experiential fidelity (Work Unit §14):
 * every interactive element must show focus, quietly but unmistakably.
 */
export const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jr-ember)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jr-field)] rounded-sm';

/**
 * Touch target. Measured 2026-08-10: the room's text gestures rendered at 21–33px
 * tall — below the 44px minimum — at every viewport from 375 to 1280.
 *
 * The fix expands the HIT AREA without touching visual weight: the type stays the
 * same size and the gesture stays quiet. Making these look like buttons would have
 * failed the reference ("software recedes") while fixing the accessibility defect.
 */
export const hit = 'inline-flex items-center min-h-[44px]';

/**
 * Touch target for block-level gestures whose content may wrap (the return
 * excerpt, browse rows). `inline-flex` would fight their block layout and
 * vertically centre wrapped text, so these take the height floor only.
 *
 * Measured 2026-08-10: a short one-line excerpt rendered 30px tall, so "it wraps,
 * therefore it is tall enough" was wrong — the floor is needed here too.
 */
export const hitBlock = 'min-h-[44px]';

/**
 * Touch target for gestures whose LABEL is short.
 *
 * Measured 2026-08-10 (accessibility pass on e8a23efe7): `hit` fixes height but
 * says nothing about width, so the writing surface's `day` / `dream` toggles
 * rendered 22px wide — under the 24px floor of WCAG 2.5.8 Target Size (Minimum).
 * A one- or two-syllable word simply is not wide enough on its own.
 *
 * As with `hit`, this widens the HIT AREA and not the visual weight: the type
 * stays the same size and the gesture stays quiet.
 */
export const hitTight = 'inline-flex items-center justify-center min-h-[44px] min-w-[44px]';

/**
 * Visually hidden, but present for assistive technology.
 *
 * The room's register is "software recedes", which means most states carry no
 * visible title — correct for the eye, and a real defect for a screen reader:
 * measured 2026-08-10, the writing, reading and browsing states each rendered a
 * <main> with no heading and no accessible name, so a member arriving by
 * keyboard or screen reader was told nothing about where they had landed.
 *
 * The fix is a heading that exists in the accessibility tree only. Nothing on
 * screen changes.
 */
export const srOnly = 'sr-only';

/**
 * Touch target for gestures that must each occupy their own line.
 *
 * `hit` uses inline-flex, which OVERRIDES a sibling `block` class — on the
 * arrival surface that silently collapsed "Begin writing" and "Or note
 * something" onto a single line. Block-level flex keeps them stacked.
 * Caught by looking at the render; the tap-target measurement passed throughout.
 */
export const hitStack = 'flex items-center min-h-[44px]';

/**
 * The room's only hover treatment, carrying its own reduced-motion opt-out.
 *
 * Measured 2026-08-10: `prefers-reduced-motion: reduce` left the room's
 * transitions running, because the opt-out lived on the `motion` token while the
 * gestures used a bare `transition-opacity`. Centralising it here is what makes
 * the guarantee hold — a per-element variant is a promise each call site can
 * forget to keep.
 */
export const quiet =
  'transition-opacity hover:opacity-80 motion-reduce:transition-none';

/** As `quiet`, but driven by a parent marked `group`. */
export const quietGroup =
  'transition-opacity group-hover:opacity-80 motion-reduce:transition-none';

/**
 * Motion: arrive/reveal only. Nothing announces itself — and nothing moves at all
 * for a member who has asked the system to stop moving.
 */
export const motion =
  'transition-opacity duration-500 ease-out motion-reduce:transition-none';
