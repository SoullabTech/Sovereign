'use client';

/**
 * R1.1 — Returning (spatial continuity for a single working draft).
 *
 * Purely client-side session memory: no server, no schema, no ontology, no
 * cross-surface gathering. It stores only *observable position facts* — where
 * the caret was, what was selected, how far the draft was scrolled — so that
 * when a writer comes back, the draft is already where they left it.
 *
 * Constitutional lines it keeps, by construction:
 *   - Nothing inferred. It records position, never intent or meaning.
 *   - Never load-bearing. A storage failure is swallowed; the work is unaffected.
 *   - Single work only. Keyed by manuscriptId; it reaches nothing else.
 */

export interface DraftPosition {
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
  savedAt: number; // epoch ms
}

const key = (manuscriptId: string) => `press:returning:draft:${manuscriptId}`;

export function saveDraftPosition(
  manuscriptId: string,
  pos: Omit<DraftPosition, 'savedAt'>,
): void {
  if (typeof window === 'undefined' || !manuscriptId) return;
  try {
    window.localStorage.setItem(
      key(manuscriptId),
      JSON.stringify({ ...pos, savedAt: Date.now() }),
    );
  } catch {
    // localStorage can be unavailable (private mode, quota). Position memory is
    // a courtesy; a failure here must never touch the writer's words.
  }
}

export function loadDraftPosition(manuscriptId: string): DraftPosition | null {
  if (typeof window === 'undefined' || !manuscriptId) return null;
  try {
    const raw = window.localStorage.getItem(key(manuscriptId));
    if (!raw) return null;
    const p = JSON.parse(raw) as DraftPosition;
    if (typeof p?.selectionStart !== 'number' || typeof p?.scrollTop !== 'number') return null;
    return p;
  } catch {
    return null;
  }
}

/**
 * The nearest Markdown heading at or above `offset` in the draft's own text.
 *
 * This is enumeration over the writer's own words — it answers only "which of
 * *your* headings is the caret under?" It never characterises, summarises, or
 * infers. Returns null when the draft has no headings, in which case the
 * welcome simply says less.
 */
export function headingAtOffset(text: string, offset: number): string | null {
  if (!text) return null;
  const clamped = Math.max(0, Math.min(offset, text.length));
  const before = text.slice(0, clamped);
  const lines = before.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(lines[i]);
    if (m) return m[1].trim();
  }
  return null;
}

/**
 * The last pane the writer had open in the Manuscript Room. Restored only when
 * there is no explicit `?tab=` deep link — a deep link always wins. Stored as a
 * bare string; the Room validates it against its own tab list.
 */
const LAST_TAB_KEY = 'press:returning:lastTab';

export function saveLastTab(tab: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_TAB_KEY, tab);
  } catch {
    /* courtesy only */
  }
}

export function loadLastTab(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_TAB_KEY);
  } catch {
    return null;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
