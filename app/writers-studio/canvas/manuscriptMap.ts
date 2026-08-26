/**
 * Manuscript map — locating the member's carried cuts inside the working draft.
 *
 * Design authority: docs/design/author-studio/WORK_STRUCTURE_DESIGN_2026-08-05.md
 * ("Structure — Design"), including its refusals, and the draft-drift strain it
 * named as the first question the implementation walk must answer.
 *
 * ── What this module is allowed to do ────────────────────────────────────────
 * The parts are the member's own: rows of `manuscript_sections`, carried in by
 * their import and confirmed by them at the threshold. The draft was composed
 * from exactly those rows (see composeDraftText in the draft route) — each
 * heading written as its own plain line, in order.
 *
 * So this module does not DERIVE structure from prose. It LOCATES headings the
 * member already declared, by exact line match, in declared order. That is the
 * difference between an anchor and a detection, and it is the whole license:
 *
 *   ⛔ We never propose a part the member did not carry.
 *   ⛔ We never fuzzy-match, never infer a heading from formatting, never guess
 *      that an unfamiliar line "looks like a chapter".
 *   ⛔ We never silently drop a part we could not find. Drift is REPORTED
 *      (`anchored: false`), because a rail that quietly omits a chapter is
 *      dishonest display — the exact failure the design named.
 *
 * ── Coverage invariant ───────────────────────────────────────────────────────
 * Every character of the draft belongs to exactly one region, in order, with no
 * gaps and no overlaps. Text sitting before the first located heading becomes
 * an explicit opening region rather than an orphan: focusing a part must never
 * make part of the member's own draft unreachable.
 */

/** A part as the member carried it. Identity and order come from the import. */
export interface DeclaredPart {
  id: string;
  position: number;
  heading: string | null;
}

/** Stable key for the region that precedes the first located heading. */
export const OPENING_KEY = '__opening__';

export interface DraftRegion {
  /** Section id, or OPENING_KEY for the text before the first located heading. */
  key: string;
  /** The member's heading, verbatim. Null when they carried the part unnamed. */
  heading: string | null;
  /** Carried position, or null for the opening region (which was not carried). */
  position: number | null;
  /** Offset of the region's first character in the draft (inclusive). */
  start: number;
  /** Offset one past the region's last character (exclusive). */
  end: number;
}

export interface DraftMap {
  /** Contiguous, ordered, gap-free cover of the whole draft. */
  regions: DraftRegion[];
  /**
   * Parts the member carried whose heading line is no longer in the draft, in
   * declared order. Named, never hidden: they are the map going stale against
   * the living text, and only the member can resolve that.
   */
  adrift: DeclaredPart[];
}

/** Bounds of the line containing `at`, as [start, end) excluding the newline. */
function lineBounds(content: string, at: number): { start: number; end: number } {
  const start = content.lastIndexOf('\n', at - 1) + 1;
  const nl = content.indexOf('\n', at);
  return { start, end: nl === -1 ? content.length : nl };
}

/**
 * Offset of the line that IS this heading, at or after `from`; -1 if none.
 *
 * Native indexOf over the whole draft rather than a line-by-line walk: this
 * runs on every keystroke over a manuscript that may be hundreds of thousands
 * of characters, and building a line array per keystroke is the difference
 * between a writing surface and a laggy one.
 *
 * A hit only counts when the WHOLE line is the heading (surrounding whitespace
 * aside), so a chapter title quoted inside a paragraph is never mistaken for
 * the chapter itself.
 */
function findHeadingLine(content: string, heading: string, from: number): number {
  let at = from;
  for (;;) {
    const hit = content.indexOf(heading, at);
    if (hit === -1) return -1;
    const line = lineBounds(content, hit);
    if (content.slice(line.start, line.end).trim() === heading) return line.start;
    at = hit + 1;
  }
}

/**
 * Locate the declared parts in the draft.
 *
 * Forward-only: part N is searched for at or after where part N-1 was found, so
 * a heading whose words recur later in the prose cannot pull the map backwards,
 * and a repeated chapter name still resolves in declared order.
 */
export function mapDraft(content: string, parts: DeclaredPart[]): DraftMap {
  const declared = [...parts].sort((a, b) => a.position - b.position);

  const located: { part: DeclaredPart; start: number }[] = [];
  const adrift: DeclaredPart[] = [];

  let cursor = 0;
  for (const part of declared) {
    const heading = part.heading?.trim();
    // An unnamed part has no line to anchor to. That is not a failure of the
    // draft — it is a part the member never named — but it cannot be a door.
    if (!heading) {
      adrift.push(part);
      continue;
    }
    const start = findHeadingLine(content, heading, cursor);
    if (start === -1) {
      adrift.push(part);
      continue;
    }
    located.push({ part, start });
    cursor = Math.min(lineBounds(content, start).end + 1, content.length);
  }

  const regions: DraftRegion[] = [];
  if (located.length === 0) {
    // Nothing located: the whole draft is one region. Honest, and still fully
    // editable — the rail simply has no doors to offer.
    regions.push({
      key: OPENING_KEY,
      heading: null,
      position: null,
      start: 0,
      end: content.length,
    });
    return { regions, adrift };
  }

  if (located[0].start > 0) {
    regions.push({
      key: OPENING_KEY,
      heading: null,
      position: null,
      start: 0,
      end: located[0].start,
    });
  }
  located.forEach((l, i) => {
    regions.push({
      key: l.part.id,
      heading: l.part.heading,
      position: l.part.position,
      start: l.start,
      end: i + 1 < located.length ? located[i + 1].start : content.length,
    });
  });

  return { regions, adrift };
}

export function regionByKey(map: DraftMap, key: string | null): DraftRegion | null {
  if (!key) return null;
  return map.regions.find((r) => r.key === key) ?? null;
}

export function regionAtOffset(map: DraftMap, offset: number): DraftRegion | null {
  return map.regions.find((r) => offset >= r.start && offset < r.end) ?? map.regions.at(-1) ?? null;
}

// ---- Finding material across the whole manuscript --------------------------

export interface DraftHit {
  /** Offset of the match in the whole draft. */
  index: number;
  /** Length of the match, so a jump can select exactly what was found. */
  length: number;
  /** Text just before the match, within its line. */
  before: string;
  /** The matched text, in the draft's own casing — not the query's. */
  match: string;
  /** Text just after the match, within its line. */
  after: string;
  /** True when `before` / `after` were cut short of the line's own ends. */
  clippedStart: boolean;
  clippedEnd: boolean;
  /** The region this match lives in — the answer to "where is this?". */
  region: DraftRegion | null;
}

/** How much of the line to carry either side of a match, in characters. */
const LEAD = 48;
const TRAIL = 96;

export const FIND_LIMIT = 200;

/**
 * Plain, case-insensitive substring search over the whole draft.
 *
 * Deliberately not regex: a writer hunting for a stray "in the opening pages of
 * this book" should not have to escape anything, and a malformed pattern should
 * not be able to answer "no results" when results exist.
 *
 * Deliberately not semantic: this reports where the member's words literally
 * are. It does not judge which copy is misplaced — that reading is theirs.
 */
export function findInDraft(
  content: string,
  map: DraftMap,
  queryText: string,
  limit: number = FIND_LIMIT,
): { hits: DraftHit[]; truncated: boolean } {
  const needle = queryText.trim().toLowerCase();
  if (needle.length < 2) return { hits: [], truncated: false };

  const hay = content.toLowerCase();
  const hits: DraftHit[] = [];
  let searchFrom = 0;
  let truncated = false;

  for (;;) {
    const at = hay.indexOf(needle, searchFrom);
    if (at === -1) break;
    if (hits.length >= limit) {
      truncated = true;
      break;
    }
    const line = lineBounds(content, at);
    // A window around the match rather than the whole line: a match 900
    // characters into a paragraph is the one most worth finding, and a
    // truncated line would hide exactly that one.
    const from = Math.max(line.start, at - LEAD);
    const to = Math.min(line.end, at + needle.length + TRAIL);
    hits.push({
      index: at,
      length: needle.length,
      before: content.slice(from, at).trimStart(),
      match: content.slice(at, at + needle.length),
      after: content.slice(at + needle.length, to).trimEnd(),
      clippedStart: from > line.start,
      clippedEnd: to < line.end,
      region: regionAtOffset(map, at),
    });
    searchFrom = at + needle.length;
  }
  return { hits, truncated };
}

/** The member's own words for a region, or an honest absence of naming. */
export function regionLabel(region: DraftRegion): string {
  if (region.key === OPENING_KEY) return 'Opening pages';
  return region.heading ?? `Part ${region.position ?? ''}`.trim();
}

// ---- Editing inside a frame ------------------------------------------------

export interface Frame {
  start: number;
  end: number;
}

/**
 * Fold an edit made inside a frame back into the whole draft.
 *
 * This is the load-bearing function of framed writing, and its only job is to
 * be boring: everything before the frame and everything after it must come back
 * byte-identical, always. A frame is a way of looking at one chapter, never a
 * way of saving one chapter — the saver downstream still receives the whole
 * book, exactly as it did before frames existed.
 *
 * The frame is clamped rather than trusted. An out-of-range frame is a bug, but
 * an unclamped one would be a bug that silently truncates a manuscript.
 */
export function spliceFrame(content: string, frame: Frame | null, value: string): string {
  if (!frame) return value;
  const start = Math.max(0, Math.min(frame.start, content.length));
  const end = Math.max(start, Math.min(frame.end, content.length));
  return content.slice(0, start) + value + content.slice(end);
}

/**
 * The editable frame for a region — the region's text, minus the blank space
 * that separates it from the part below.
 *
 * Found by a failing test, and worth stating plainly: a region ends where the
 * NEXT heading line begins, so a frame drawn on the raw region puts the caret's
 * far end flush against that heading. A writer adding a sentence at the end of
 * Chapter Ten would silently produce "…and so it ended.Chapter Eleven" — welding
 * two chapters together and taking Chapter Eleven off the map in the same
 * keystroke, with nothing on screen to show it happened.
 *
 * So the separating newlines are held OUTSIDE the frame: untouchable from
 * inside, preserved verbatim through every splice. A frame cannot reach the
 * part below it. The last region has nothing below it and keeps its own tail.
 */
export function frameForRegion(content: string, map: DraftMap, key: string | null): Frame | null {
  const region = regionByKey(map, key);
  if (!region) return null;
  const isLast = map.regions[map.regions.length - 1]?.key === region.key;
  if (isLast) return { start: region.start, end: region.end };
  let end = region.end;
  while (end > region.start && (content[end - 1] === '\n' || content[end - 1] === '\r')) end--;
  return { start: region.start, end };
}

/** Where the frame sits after its own text was replaced. */
export function frameAfterEdit(frame: Frame | null, value: string): Frame | null {
  if (!frame) return null;
  return { start: frame.start, end: frame.start + value.length };
}
