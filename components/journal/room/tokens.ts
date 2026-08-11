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
 * Colour roles, all resolving to House CSS variables.
 * `accent` is the ember signal — one per state, never decorative.
 */
export const color = {
  field: 'bg-[var(--sl-bg-canvas)]',
  surface: 'bg-[var(--sl-bg-surface)]',
  human: 'text-[var(--sl-text-primary)]',
  secondary: 'text-[var(--sl-text-secondary)]',
  muted: 'text-[var(--sl-text-muted)]',
  accent: 'text-[var(--sl-accent-primary)]',
  accentBorder: 'border-[var(--sl-accent-primary)]',
  hairline: 'border-[var(--sl-border-subtle)]',
} as const;

/**
 * Space. The reference's "spaciousness" and "software recedes" are mostly a
 * spacing claim — the room is defined by what it leaves empty.
 */
export const space = {
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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sl-accent-primary)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-bg-canvas)] rounded-sm';

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
