import { compose, atmosphereVariables, type Atmosphere } from './atmospheres';

/**
 * CANVAS APPEARANCE — the material the writer writes ON.
 *
 * Founder ruling 2026-09-07, and the cleaner architecture than repainting the
 * design contract:
 *
 *   The Studio is the room. The Canvas is the surface you choose to write upon.
 *
 * The dark Studio shell is preserved exactly. Only the manuscript plane
 * changes. The rails, MAIA, outline, bottom dock, header and navigation are
 * untouched — not by convention, but by mechanism: these values are emitted as
 * CSS custom properties on the writing-field element alone, and a custom
 * property set on an element reaches that element and its descendants and
 * nothing else. There is no selector that could leak, and no component inside
 * the field needs to know this exists.
 *
 * ── ⛔ THREE. Not fifteen ─────────────────────────────────────────────────
 * clean page · warm page · dark page. No Sepia, Solarized, Ocean, Rose. The
 * need is a writing surface, and a surface marketplace answers a different and
 * worse need — it turns a writing room into a text-editor skin catalogue and
 * makes the choice a thing to fiddle with rather than a thing to settle.
 *
 * ── ⛔ A writer preference, never a property of the Work ──────────────────
 * Changing Paper → Dark must not alter the manuscript, its versions, its
 * provenance, or anything substantive. Nothing here is stored against a Work,
 * a manuscript, or a revision, and nothing downstream may read it. It is where
 * this person likes to write, which is not a fact about the book.
 *
 * ── Why DARK emits nothing ───────────────────────────────────────────────
 * Dark is not a fourth colour scheme; it is the absence of an override. The
 * field then inherits whatever atmosphere the writer chose for the Studio, so
 * Dark under Night Study is Night Study's field and Dark under Atelier is
 * Atelier's — which is what "preserves the current dark writing experience"
 * actually means once atmospheres exist.
 */

export const CANVAS_SURFACE_IDS = ['dark', 'paper', 'parchment'] as const;
export type CanvasSurfaceId = (typeof CANVAS_SURFACE_IDS)[number];

export const DEFAULT_CANVAS_SURFACE: CanvasSurfaceId = 'dark';

export function isCanvasSurfaceId(value: unknown): value is CanvasSurfaceId {
  return typeof value === 'string' && (CANVAS_SURFACE_IDS as readonly string[]).includes(value);
}

export interface CanvasSurface {
  id: CanvasSurfaceId;
  name: string;
  /** One line the writer reads while choosing. A material, never a mood. */
  character: string;
  /** Null for `dark`: it inherits the Studio's own field rather than overriding it. */
  room: Atmosphere | null;
}

/* The same `compose` the Studio atmospheres use. A writing surface is a room
   with a smaller boundary, so it gets the same ramps, the same derivations and
   — the reason this matters — the same contrast gate. */
const PAPER = compose('atelier', 'Paper', {
  ground: '#F7F5F0',
  ink: '#23211D',
  accent: '#7E5F22',
  toward: 'shadow',
});

const PARCHMENT = compose('atelier', 'Parchment', {
  ground: '#EFE6D4',
  ink: '#2A241B',
  accent: '#6F5518',
  toward: 'shadow',
});

export const CANVAS_SURFACES: Record<CanvasSurfaceId, CanvasSurface> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    character: 'The Studio’s own light.',
    room: null,
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    character: 'Soft warm off-white.',
    room: PAPER,
  },
  parchment: {
    id: 'parchment',
    name: 'Parchment',
    character: 'Warmer, closer to a book.',
    room: PARCHMENT,
  },
};

export const CANVAS_SURFACE_LIST: CanvasSurface[] = CANVAS_SURFACE_IDS.map(
  (id) => CANVAS_SURFACES[id],
);

/**
 * The variables to set ON THE WRITING FIELD ELEMENT — and only there.
 *
 * Deliberately the SAME variable names the Studio uses. Every token inside the
 * field already reads them, so redefining them locally repaints the prose, its
 * hairlines and its insets together, with no component edits and no second
 * vocabulary. Outside the element the Studio's own values still stand,
 * untouched, because that is how the cascade works.
 *
 * ⛔ `--ws-bg` is NOT emitted. That is the page gradient behind the whole
 * Studio; a writing surface that could repaint the room would be exactly the
 * leak this design exists to prevent.
 */
export function canvasSurfaceVariables(surface: CanvasSurface): Record<string, string> {
  if (!surface.room) return {};
  const { '--ws-bg': _pageGradient, ...scoped } = atmosphereVariables(surface.room);
  return scoped;
}
