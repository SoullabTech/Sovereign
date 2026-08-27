/**
 * The five creative distances of the Writer's Studio.
 *
 * Design authority: docs/design/writer-studio/references/04-writing-field-wide.png
 * (canonical — it is the only reference that shows this navigation, which is
 * why it is canonical). Programme: WRITERS-STUDIO-V2, unit WS2-01.
 *
 * ── Why this file exists at all ──────────────────────────────────────────────
 *
 * The room being replaced had three tabs — Write · Develop · Reader — declared
 * inline in the middle of a 743-line page component, as a string union with the
 * labels written out in a ternary at the point of render. Adding a mode meant
 * editing a ternary. Asking "which modes exist?" meant reading the JSX.
 *
 * The Studio is five creative distances on ONE work, and that is the load-
 * bearing idea of the whole programme. It gets a model.
 *
 * ── The honesty rule this file enforces ─────────────────────────────────────
 *
 * A mode is `realized` only when its field is actually built. WS2-01 realizes
 * WRITE and nothing else. The other four appear in the navigation — the writer
 * should see the shape of the environment they are in — but they are NOT
 * clickable stubs that open an empty room and call it a field.
 *
 * A navigation that offers a door to nowhere teaches the writer that the
 * product lies about itself. So: named, visible, and plainly not yet open.
 * `STUDIO_MAP`'s `assertStudioMapHonest` holds the same line one layer up.
 */

export type StudioModeId = 'write' | 'develop' | 'explore' | 'review' | 'publish';

export interface StudioMode {
  id: StudioModeId;
  /** The word in the navigation. The reference's casing is applied in CSS. */
  label: string;
  /**
   * What this distance is FOR, in the member's terms. Shown where a mode is
   * not yet open, so the absence is legible rather than mysterious.
   */
  purpose: string;
  /**
   * True only when the field behind this mode is built and mounted. Never set
   * this ahead of the field — the whole point of the flag is that it cannot be
   * true and empty at the same time.
   */
  realized: boolean;
  /** The unit that builds it, so the navigation dates its own gaps. */
  unit: string;
}

export const STUDIO_MODES: StudioMode[] = [
  {
    id: 'write',
    label: 'Write',
    purpose: 'the manuscript, the chapter, the sentence',
    realized: true,
    unit: 'WS2-01',
  },
  {
    id: 'develop',
    label: 'Develop',
    purpose: 'the work seen whole — review, findings, evidence',
    realized: false,
    unit: 'WS2-08',
  },
  {
    id: 'explore',
    label: 'Explore',
    purpose: 'what exists, what is recent, what MAIA noticed',
    realized: false,
    unit: 'WS2-05',
  },
  {
    id: 'review',
    label: 'Review',
    purpose: 'reader lenses, dispositions, response',
    realized: false,
    unit: 'WS2-08',
  },
  {
    id: 'publish',
    label: 'Publish',
    purpose: 'assembly, export, sharing',
    realized: false,
    unit: 'WS2-11',
  },
];

export const DEFAULT_MODE: StudioModeId = 'write';

export function modeById(id: string): StudioMode | null {
  return STUDIO_MODES.find((m) => m.id === id) ?? null;
}

/** The modes a writer can actually enter today. */
export function realizedModes(): StudioMode[] {
  return STUDIO_MODES.filter((m) => m.realized);
}

/**
 * Resolve a requested mode to one that exists AND is open.
 *
 * Deliberately NOT a silent fallback to `write` for a mode that exists but is
 * not yet realized — the caller is told which it got and why, so a member who
 * asked for Develop is not quietly handed Write and left to wonder. That is the
 * same rule as D-010 one layer up: a control that cannot open what it names
 * must say so rather than open something else.
 */
export type ModeResolution =
  | { kind: 'open'; mode: StudioMode }
  | { kind: 'not-yet'; requested: StudioMode; fallback: StudioMode }
  | { kind: 'unknown'; requested: string; fallback: StudioMode };

export function resolveMode(requested: string | null): ModeResolution {
  const fallback = modeById(DEFAULT_MODE)!;
  if (requested === null) return { kind: 'open', mode: fallback };
  const found = modeById(requested);
  if (!found) return { kind: 'unknown', requested, fallback };
  if (!found.realized) return { kind: 'not-yet', requested: found, fallback };
  return { kind: 'open', mode: found };
}

/** The navigation parameter. One definition, imported — never re-typed. */
export const STUDIO_MODE_PARAM = 'mode';
