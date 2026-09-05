/**
 * WS2-02C — the rail's icon language.
 *
 * Every one of 04's sixteen destinations carries a small line glyph in a
 * fixed left column, so the pattern is genuinely repeated and earns a shared
 * treatment rather than per-item art. The icons are stroked in currentColor at
 * RAIL_RHYTHM.iconSize, which means an item's state colours its glyph and its
 * label together and nothing has to remember to keep them in step.
 *
 * ONE GLYPH PER CANONICAL DESTINATION AND NO MORE. There is no generic
 * fallback and no icon for anything the reference does not show: an invented
 * glyph is the visual form of inventing a destination. `iconFor` returns null
 * for an unknown id, and the rail simply reserves the column.
 *
 * These are readings of 04 at reference scale — a house, a page, a box, a
 * branch — not a claim to have reproduced its exact drawing. DERIVED, and
 * recorded as such.
 */
'use client';

import { RAIL_RHYTHM } from '../studioTheme';

/** Path data per destination id, matching STUDIO_MAP's canonical sixteen. */
const PATHS: Record<string, string> = {
  home: 'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  manuscript: 'M6 3h8l4 4v14H6zM14 3v4h4',
  materials: 'M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4',
  structure: 'M12 3v5M6 21v-5M18 21v-5M6 16h12v-3H6zM12 8v5',
  notes: 'M5 3h14v18l-7-4-7 4z',
  versions: 'M12 7v5l3 2M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  goals: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
  conversations: 'M4 5h16v11H9l-5 4z',
  discover: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9l-2 5-5 2 2-5z',
  insights: 'M9 20h6M10 23h4M12 2a6 6 0 0 0-4 10.5V16h8v-3.5A6 6 0 0 0 12 2z',
  suggestions: 'M12 3l1.8 4.7L19 9l-4.4 2.4L14 17l-2-3.6L8 17l.6-5.6L4 9l5.2-1.3z',
  'find-replace': 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 21l-4.2-4.2',
  statistics: 'M5 21V11M12 21V4M19 21v-7',
  timeline: 'M4 12h16M8 8v8M16 8v8M4 4v16',
  'word-web': 'M12 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM10.5 9.5 6.5 12M13.5 9.5l4 2.5',
  export: 'M12 15V3m0 0L8 7m4-4 4 4M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
};

export function iconFor(destinationId: string): string | null {
  return PATHS[destinationId] ?? null;
}

export function StudioIcon({ id }: { id: string }) {
  const d = iconFor(id);
  const size = RAIL_RHYTHM.iconSize;
  // The column is reserved either way, so a destination without a glyph still
  // aligns with its neighbours rather than shifting the whole band left.
  if (!d) return <span style={{ width: size, height: size, flexShrink: 0 }} />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}
