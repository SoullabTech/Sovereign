/**
 * Soullab Press — mechanical manuscript segmentation.
 *
 * Extracted verbatim from app/api/sovereign/manuscripts/route.ts so the same
 * cutting logic can serve both the text/paste ingest and the file-upload ingest
 * (DOCX/PDF), and so it can be unit-tested in isolation.
 *
 * DOCTRINE (unchanged): segmentation is MECHANICAL ONLY — markdown / plain-text
 * heading detection. The system never segments semantically and never invents
 * headings. Headings come from the document's own characters. Body text is
 * carried verbatim (no trim, no normalization). The member confirms or redraws
 * the cuts before anything is saved.
 */

export interface SectionInput {
  position: number;
  heading: string | null;
  body: string;
}

/** Hard cap on the number of sections a single manuscript may produce/save. */
export const MAX_SECTIONS = 400;

/**
 * The heading levels a document can declare, strongest first.
 *
 * WS2-01C, 2026-08-27 — the defect this exists to end.
 *
 * The previous rule was flat: any line matching ANY of these patterns was a
 * top-level cut. On a real print manuscript that is catastrophic, because a
 * printed book is full of capitalised lines that are not chapters — running
 * subheads, front matter, epigraph attributions, appendix labels. A 212-page
 * book came back as a rail of a hundred-plus fragments, every one of them "~1
 * page", with "Chapter 10: The Living Spiral" holding nothing but its own
 * epigraph because the chapter's first subhead cut immediately after it.
 *
 * The fix is NOT to start inferring which lines "look important" — that would
 * be the semantic segmentation this module refuses. It is to notice that the
 * document already declares levels, and to cut at the STRONGEST level the
 * document actually uses. Subheads are still the member's words and still
 * arrive verbatim; they simply sit inside the chapter they belong to instead
 * of being promoted to peers of it.
 *
 * "Chapter" matches case-insensitively ([Cc]hapter) but the branch is NOT a
 * global /i: making the whole pattern case-insensitive would turn the ALL-CAPS
 * alternative into "any short mixed-case line", cutting prose into confetti.
 * Caught by the 2026-08-05 five-persona walk.
 */
const MARKDOWN_RE = /^(#{1,3})\s+(.+)$/;
const CHAPTER_RE = /^[Cc]hapter\s+\w+.*$/;
const CAPS_RE = /^[A-Z][A-Z0-9 ,'&\-—:]{3,80}$/;

/** Strongest = 1. Markdown depth wins where it is present; CAPS is weakest. */
const CAPS_RANK = 4;

interface Detected {
  line: number;
  heading: string;
  rank: number;
}

function detect(raw: string): { heading: string; rank: number } | null {
  if (raw.length > 100) return null;
  const md = MARKDOWN_RE.exec(raw);
  if (md) return { heading: md[2], rank: md[1].length };
  // A chapter line is a top-level declaration in a document with no markdown.
  if (CHAPTER_RE.test(raw)) return { heading: raw, rank: 1 };
  if (CAPS_RE.test(raw)) return { heading: raw, rank: CAPS_RANK };
  return null;
}

/**
 * The strongest level that actually cuts the document into more than one part.
 *
 * Cumulative: cutting at level 2 also cuts at level 1, because a `#` part title
 * standing above `##` chapters is still a boundary. Levels are skipped only
 * when they would produce a single section — a book whose one `#` line is its
 * title page has not thereby declared itself a one-chapter book.
 */
function cuttingRank(found: Detected[]): number | null {
  for (let rank = 1; rank <= CAPS_RANK; rank++) {
    if (found.filter((f) => f.rank <= rank).length >= 2) return rank;
  }
  return null;
}

/**
 * Mechanical segmentation: split on the document's own strongest heading level.
 * Fallback: whole text as one section. Detection only — headings come from the
 * document's own characters.
 */
export function segment(text: string): SectionInput[] {
  const lines = text.split('\n');
  const found: Detected[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const hit = detect(raw);
    if (hit) found.push({ line: i, heading: hit.heading, rank: hit.rank });
  }

  const rank = cuttingRank(found);
  if (rank === null) {
    return [{ position: 0, heading: null, body: text }];
  }
  const headingIdx = found.filter((f) => f.rank <= rank);

  const sections: SectionInput[] = [];
  // Preamble before the first heading, if substantial.
  const preamble = lines.slice(0, headingIdx[0].line).join('\n');
  if (preamble.trim().length > 0) {
    sections.push({ position: 0, heading: null, body: preamble });
  }

  /* WS-01 — orphan headings are carried forward, never dropped.
   *
   * A heading immediately followed by another heading produces an empty body,
   * and `manuscript_sections` forbids one (CHECK (length(body) > 0)). This loop
   * used to `continue` past that case — which skipped the section AND took its
   * heading line with it, silently, before the member ever opened the Work. On a
   * print manuscript whose front matter is a stack of capitalised lines, that is
   * several arriving lines gone with no record they existed.
   *
   * The constraint was exposing a missing representation, not causing the error:
   * a heading with no body is an interpretation fact, not a malformed section. So
   * the constraint stays, and the orphan is carried into the body of the next
   * section that has one — where it remains the member's words, in order, and
   * reachable. The member can re-cut it; they cannot recover what was deleted.
   */
  let carried: string[] = [];
  let h = 0;
  for (; h < headingIdx.length && sections.length < MAX_SECTIONS - 1; h++) {
    const start = headingIdx[h].line + 1;
    const end = h + 1 < headingIdx.length ? headingIdx[h + 1].line : lines.length;
    const body = lines.slice(start, end).join('\n');
    if (body.trim().length === 0) {
      carried.push(headingIdx[h].heading);
      continue;
    }
    if (carried.length > 0) {
      sections.push({
        position: sections.length,
        heading: carried[0],
        body: [...carried.slice(1), headingIdx[h].heading, body].join('\n'),
      });
      carried = [];
      continue;
    }
    sections.push({ position: sections.length, heading: headingIdx[h].heading, body });
  }

  /* WS2-01C — the cap absorbs, it does not truncate.
   *
   * The loop used to stop at MAX_SECTIONS and simply end, dropping every
   * remaining line of the member's book on the floor with nothing said. A cap
   * is a limit on how many DOORS we will build, never a limit on how much of
   * their manuscript we will keep. Whatever is left becomes the tail of the
   * last section, verbatim and in order. */
  if (h < headingIdx.length) {
    const rest = lines.slice(headingIdx[h].line).join('\n');
    const last = sections[sections.length - 1];
    if (last) {
      last.body = [last.body, ...carried, rest].join('\n');
      carried = [];
    } else {
      sections.push({ position: 0, heading: headingIdx[h].heading, body: rest });
      carried = [];
    }
  }

  /* Headings trailing the document with nothing after them. They arrived, so
     they are kept — appended to the last section, or standing as their own if
     there is none. */
  if (carried.length > 0) {
    const last = sections[sections.length - 1];
    if (last) {
      last.body = [last.body, ...carried].join('\n');
    } else {
      sections.push({ position: 0, heading: carried[0], body: carried.slice(1).join('\n') || text });
    }
  }
  return sections.length > 0 ? sections : [{ position: 0, heading: null, body: text }];
}
