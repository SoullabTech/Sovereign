/**
 * WS-VISIBLE-02 — the instruments a 200-page manuscript needs to feel normal.
 *
 * Pure and framework-free: outline, find, and replace are decided here and
 * proved here, so the editor is only wiring. Every function takes the draft
 * text and returns a description of it — nothing in this module mutates, and
 * `replace` returns new text rather than editing in place.
 *
 * The load-bearing rule for replace: it is only ever computed from a set of
 * matches the writer has ALREADY been shown. There is no path that searches
 * and replaces in one step, because the writer must be able to see what will
 * change before it changes.
 */

export interface OutlineEntry {
  /** 1 = the outermost heading in this draft, growing inward. */
  level: number;
  title: string;
  /** Character offset of the heading line's first character. */
  offset: number;
  /** Characters from this heading to the next (or to the end). */
  extent: number;
}

const MD_HEADING = /^(#{1,6})\s+(.*\S)\s*$/;
/** "Chapter One", "CHAPTER 12", "Part III" — a heading a writer actually types. */
const NAMED_UNIT = /^\s*((?:chapter|part|book|section|act|scene)\b[^\n]{0,80})$/i;
/** A short standalone line in capitals, the oldest heading convention there is. */
const CAPS_LINE = /^[^a-z\n]{3,60}$/;

function looksLikeHeading(line: string): { level: number; title: string } | null {
  const md = MD_HEADING.exec(line);
  if (md) return { level: md[1].length, title: md[2] };

  const trimmed = line.trim();
  if (trimmed.length === 0) return null;

  const named = NAMED_UNIT.exec(trimmed);
  if (named) return { level: 1, title: named[1].trim() };

  // Capitals only counts when it is short AND has letters — a line of dashes
  // or a row of numbers is not a chapter title.
  if (trimmed.length <= 60 && CAPS_LINE.test(trimmed) && /[A-Z]/.test(trimmed)) {
    return { level: 2, title: trimmed };
  }
  return null;
}

/**
 * The draft's own structure, read from the text the writer wrote.
 *
 * This is NOT the manuscript's imported section structure (that lives in
 * manuscript_sections and is Source, not draft). A writer who types their own
 * chapter headings after import must still be able to move around, so the
 * outline is derived from what is on the table right now.
 *
 * Levels are normalised so the outermost heading present is level 1 — a draft
 * written entirely in `###` should not render as three levels of indent.
 */
export function outlineOf(content: string): OutlineEntry[] {
  const found: { level: number; title: string; offset: number }[] = [];
  let offset = 0;
  for (const line of content.split('\n')) {
    const h = looksLikeHeading(line);
    if (h) found.push({ ...h, offset });
    offset += line.length + 1;
  }
  if (found.length === 0) return [];

  const min = Math.min(...found.map((f) => f.level));
  return found.map((f, i) => ({
    level: f.level - min + 1,
    title: f.title,
    offset: f.offset,
    extent: (i + 1 < found.length ? found[i + 1].offset : content.length) - f.offset,
  }));
}

export interface FindOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

export interface Match {
  start: number;
  end: number;
  /** Text immediately before the match, for showing the writer where it is. */
  before: string;
  text: string;
  after: string;
  /** 1-indexed line the match begins on. */
  line: number;
}

const CONTEXT_CHARS = 42;
/** Beyond this a find is reported as truncated rather than silently cut. */
export const MAX_MATCHES = 500;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface FindResult {
  matches: Match[];
  /** True when more matches exist than were returned. Never silent. */
  truncated: boolean;
  total: number;
}

export function findMatches(content: string, query: string, opts: FindOptions = {}): FindResult {
  if (query.length === 0) return { matches: [], truncated: false, total: 0 };

  const body = escapeRegExp(query);
  // \b is wrong at a non-word boundary ("(" would never match as a whole
  // word), so word edges are only asserted where the query itself has one.
  const left = opts.wholeWord && /^\w/.test(query) ? '\\b' : '';
  const right = opts.wholeWord && /\w$/.test(query) ? '\\b' : '';
  const re = new RegExp(`${left}${body}${right}`, opts.caseSensitive ? 'g' : 'gi');

  const matches: Match[] = [];
  let total = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    total += 1;
    if (matches.length < MAX_MATCHES) {
      const start = m.index;
      const end = start + m[0].length;
      matches.push({
        start,
        end,
        text: m[0],
        before: content.slice(Math.max(0, start - CONTEXT_CHARS), start).replace(/\s+/g, ' '),
        after: content.slice(end, end + CONTEXT_CHARS).replace(/\s+/g, ' '),
        line: content.slice(0, start).split('\n').length,
      });
    }
    // A zero-length match would loop forever; step past it.
    if (m[0].length === 0) re.lastIndex += 1;
  }
  return { matches, truncated: total > matches.length, total };
}

/**
 * Replace exactly the ranges the writer was shown.
 *
 * Takes MATCHES, not a query — so what is replaced is what was previewed, and
 * a draft that changed underneath the find cannot be edited from a stale
 * search. Ranges are applied from the end backwards so earlier offsets stay
 * valid, and overlapping ranges are refused rather than producing garbage.
 */
export function replaceRanges(
  content: string,
  ranges: { start: number; end: number }[],
  replacement: string,
): { next: string; replaced: number } {
  const ordered = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].start < ordered[i - 1].end) {
      throw new Error('Overlapping ranges');
    }
  }
  let next = content;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const { start, end } = ordered[i];
    if (start < 0 || end > content.length || end < start) throw new Error('Range out of bounds');
    next = next.slice(0, start) + replacement + next.slice(end);
  }
  return { next, replaced: ordered.length };
}

/**
 * What the writer is told before a replace-all runs. A count is not enough:
 * "replace 412 occurrences" needs to say what it will read like afterwards.
 */
export function replacePreview(match: Match, replacement: string): string {
  return `${match.before}${replacement}${match.after}`;
}
