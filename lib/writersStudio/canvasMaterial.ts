/**
 * CANVAS MATERIAL — the page, not the room.
 *
 * Ruled 2026-09-07 (`WRITERS-STUDIO-CANVAS-PRESENCE-01`, question C).
 *
 *   Studio atmosphere  changes the room   — NOT BUILT, held for its own ruling
 *   Canvas material    changes the page   — this module
 *
 *   ⭐ Choose the room. Choose the page.
 *
 * ── WHAT THIS IS NOT ──────────────────────────────────────────────────────
 *
 * ⛔ NOT a theme engine, and not the beginning of one. The Studio ground is
 * espresso by frozen design rule, enforced at runtime by `assertGroundIsWarm`.
 * A light Canvas does not make a light Studio: the whole point is that the dark
 * room survives around a materially different page.
 *
 * The material may change the writing plane, the manuscript's own text
 * treatment where readability requires it, and subtle page treatment. It may
 * NOT change rails, outline, MAIA panel, dock, shell or header, and it may not
 * touch any capability or state semantics.
 *
 * ── WHY THIS FILE EXISTS AT ALL ───────────────────────────────────────────
 *
 * ⭐ These materials were not missing. They were trapped.
 *
 * `WritingSurface` has carried Warm / Ivory Paper / White Paper / Midnight for
 * some time, and two defects came with them:
 *
 *   C1  the choice was keyed `writing_surface:<manuscriptId>` — per WORK.
 *       That is literally "the book itself is Parchment". Material belongs to
 *       the writer's eye, never to the manuscript, and it must not reach
 *       versions, provenance, saves, export, or a collaborator's view of a
 *       shared Work.
 *
 *   C2  the control lived inside the continuous surface only, so a member
 *       writing a sectioned manuscript — which is what a long book renders as
 *       — could not reach it at all. A capability is not meaningfully
 *       available when its control is unreachable from the state the member
 *       is actually in.
 *
 * So the values are HARVESTED here unchanged, not reinvented. What changes is
 * ownership and reach.
 */

/** The materials, harvested verbatim from WritingSurface. Ids are load-bearing —
 *  they are what legacy stored values contain, so renaming them would silently
 *  discard a member's existing choice. */
export const CANVAS_MATERIALS = {
  warm: { label: 'Warm Canvas', bg: '#221B17', ink: '#EFE6D9', caret: '#C9A227' },
  ivory: { label: 'Ivory Paper', bg: '#f3eddd', ink: '#2a2418', caret: '#8a6d1f' },
  white: { label: 'White Paper', bg: '#FAFAF7', ink: '#141414', caret: '#8a6d1f' },
  midnight: { label: 'Midnight', bg: '#0E1114', ink: '#C9CCD1', caret: '#C9A227' },
} as const;

export type CanvasMaterial = keyof typeof CANVAS_MATERIALS;

/** The order the chooser offers them: page first, then the two dark planes. */
export const MATERIAL_ORDER: readonly CanvasMaterial[] = [
  'white',
  'ivory',
  'warm',
  'midnight',
];

export const DEFAULT_MATERIAL: CanvasMaterial = 'warm';

/** ⭐ ONE key, and it names no manuscript. That absence is the C1 repair. */
export const CANVAS_MATERIAL_KEY = 'writers_studio:canvas_material';

/** Legacy keys. Read once for migration, never written again. */
const legacyWorkKey = (manuscriptId: string) => `writing_surface:${manuscriptId}`;
const LEGACY_GLOBAL_KEY = 'writing_surface';

export function isCanvasMaterial(v: unknown): v is CanvasMaterial {
  return typeof v === 'string' && v in CANVAS_MATERIALS;
}

/**
 * The migration, as a pure function so it can be tested without a browser.
 *
 * Order is the ruling, exactly:
 *
 *   1. an existing Canvas-level preference wins outright
 *   2. otherwise the CURRENT manuscript's legacy value seeds it, once
 *   3. otherwise the default
 *
 * ⛔ No attempt is made to infer a "true preference" where two manuscripts
 * historically carried different materials. The Work the member is looking at
 * seeds the choice; from then on they have one.
 */
export function resolveMaterial(read: {
  canvas: string | null;
  legacyWork: string | null;
  legacyGlobal: string | null;
}): { material: CanvasMaterial; seededFromLegacy: boolean } {
  if (isCanvasMaterial(read.canvas)) return { material: read.canvas, seededFromLegacy: false };
  if (isCanvasMaterial(read.legacyWork)) return { material: read.legacyWork, seededFromLegacy: true };
  if (isCanvasMaterial(read.legacyGlobal)) return { material: read.legacyGlobal, seededFromLegacy: true };
  return { material: DEFAULT_MATERIAL, seededFromLegacy: false };
}

/**
 * Read the writer's material, migrating a legacy per-Work value once.
 *
 * ⛔ Browser-local by ruling. No account or backend persistence is introduced
 * here; "per-writer" means per-writer-on-this-browser, and cross-device sync is
 * a separate decision nobody has taken.
 *
 * ⛔ Legacy keys are left in place. Ownership semantics are changing, and
 * destroying the old values in the same pass would make that irreversible.
 */
export function loadCanvasMaterial(manuscriptId: string | null): CanvasMaterial {
  if (typeof window === 'undefined') return DEFAULT_MATERIAL;
  let canvas: string | null = null;
  let legacyWork: string | null = null;
  let legacyGlobal: string | null = null;
  try {
    canvas = localStorage.getItem(CANVAS_MATERIAL_KEY);
    legacyWork = manuscriptId ? localStorage.getItem(legacyWorkKey(manuscriptId)) : null;
    legacyGlobal = localStorage.getItem(LEGACY_GLOBAL_KEY);
  } catch {
    /* Storage can throw (private mode, blocked site data). A writer who cannot
       store a preference still gets a Canvas. */
    return DEFAULT_MATERIAL;
  }
  const { material, seededFromLegacy } = resolveMaterial({ canvas, legacyWork, legacyGlobal });
  if (seededFromLegacy) saveCanvasMaterial(material);
  return material;
}

export function saveCanvasMaterial(material: CanvasMaterial): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CANVAS_MATERIAL_KEY, material);
  } catch {
    /* Presentation only. Failing to persist a look is not a failure worth
       telling a writer about mid-sentence. */
  }
}

/**
 * CANVAS TYPE — the size of the writing, responsive by construction.
 *
 * The writing plane carried a FIXED `17px` on every viewport. On a narrow
 * screen that is too large for the measure and the line breaks badly; on a
 * wide one it is small enough that the writer leans in. Type that does not
 * answer the viewport is not a style choice, it is a defect the writer pays
 * for in their eyes.
 *
 * `clamp()` rather than breakpoints: the writing plane has no layout states to
 * step between, it has one continuous measure, so the size should be continuous
 * too. The bounds are the point — it never falls below comfortable reading and
 * never grows into a display face.
 *
 * ⛔ This is presentation of the page, exactly like material. It does not
 * change what is written, saved, versioned, exported, or what a collaborator
 * receives. Two writers looking at the same Work at different widths are
 * looking at the same Work.
 *
 * ⛔ NOT a member-facing size control. Whether the writer should be able to set
 * their own size is a further question nobody has ruled on; this only makes the
 * one size the Canvas already had answer the screen it is on.
 */
export const CANVAS_TYPE = {
  /** ~16px on a phone, ~19px on a wide desktop, continuous between. */
  size: 'clamp(16px, 0.55vw + 14px, 19px)',
  /** Line height rides with the size, so the measure stays even. */
  leading: 1.75,
} as const;
