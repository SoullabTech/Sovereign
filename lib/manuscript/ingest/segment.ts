/**
 * Soullab Press — mechanical manuscript segmentation.
 *
 * Extracted verbatim from app/api/sovereign/manuscripts/route.ts so the same
 * cutting logic can serve both the text/paste ingest and the file-upload ingest
 * (DOCX/PDF), and so it can be unit-tested in isolation. No behavior change.
 *
 * DOCTRINE (unchanged): segmentation is MECHANICAL ONLY — markdown / plain-text
 * heading detection. The system never segments semantically and never invents
 * headings. Headings come from the document's own characters. Body text is
 * carried verbatim (no trim, no normalization). The member confirms or redraws
 * the cuts before anything is saved.
 */

/**
 * WS2-08A — how deep the document itself said a heading sits.
 *
 *   1 | 2 | 3   explicit: the document carried the depth in its own characters
 *               (`#`/`##`/`###`, or Word Heading 1/2 which DOCX extraction has
 *               already rendered as `#`/`##`), or in its own wording ("Chapter N").
 *   null        the boundary is real but its depth is UNCLASSIFIED. An ALL-CAPS
 *               line is a valid mechanical cut and an unreliable hierarchy signal:
 *               it is exactly what turned one print manuscript into 185 sections.
 *               Depth is never guessed for it; the member assigns it, or not.
 */
export type HeadingDepth = 1 | 2 | 3;

/**
 * Which mechanical rule DECIDED the heading's depth. A custody fact about the
 * arriving characters, recorded so the depth can always be traced to its cause.
 *
 *   markdown  `#{1,3} `          → depth = number of `#`
 *   chapter   "Chapter N …"      → depth 1, from the document's own wording
 *   caps      ALL-CAPS line      → boundary only; depth null
 *   member    the member cut here at confirm; depth null until they assign one
 *
 * ONE VALUE, BY PRECEDENCE — NOT EXHAUSTIVE PROVENANCE (founder ruling,
 * 2026-09-06). A line may carry more than one signal: `# CHAPTER ONE` is
 * markdown AND chapter wording AND caps. The field names the classifier that
 * won, in the fixed order markdown > chapter > caps, which is also the order
 * `classifyHeading` tests them. It does not claim the other signals were
 * absent. A reader needing every signal present re-derives it from the
 * heading text, which is kept verbatim.
 */
export type HeadingSignal = 'markdown' | 'chapter' | 'caps' | 'member';

export interface SectionInput {
  position: number;
  heading: string | null;
  body: string;
  /**
   * WS2-08A. Optional so every existing constructor of a section (untitled
   * preamble, member-confirmed payloads, tests) stays valid; absent means the
   * same as null — unclassified. `segment()` always sets both.
   */
  headingDepth?: HeadingDepth | null;
  headingSignal?: HeadingSignal | null;
}

/** Hard cap on the number of sections a single manuscript may produce/save. */
export const MAX_SECTIONS = 400;

/**
 * Mechanical segmentation: split on markdown headings (#, ##, ###) or
 * ALL-CAPS / "Chapter N" lines. Fallback: whole text as one section.
 * Detection only — headings come from the document's own characters.
 *
 * "Chapter" matches case-insensitively ([Cc]hapter) but the branch is NOT
 * a global /i: making the whole pattern case-insensitive would turn the
 * ALL-CAPS alternative into "any short mixed-case line", cutting prose into
 * confetti. Caught by the 2026-08-05 five-persona walk: a real manuscript's
 * "Chapter One — The Late Frost" headings were invisible to the lowercase
 * literal, and the whole book collapsed to one untitled section.
 */
interface DetectedHeading {
  line: number;
  heading: string;
  depth: HeadingDepth | null;
  signal: HeadingSignal;
}

/**
 * WS2-08A — classify one heading line. The three alternatives of `headingRe`
 * are tested in the same order, so the classification names the branch that
 * matched rather than re-deriving it: `#` marks carry their own depth; the
 * "Chapter" wording is depth 1; an ALL-CAPS line is a boundary with no depth.
 *
 * The `#` characters were always consumed here. Until this cut, their COUNT was
 * discarded with them — the one structural fact a Markdown or DOCX manuscript
 * states outright, thrown away before the section was ever returned.
 */
function classifyHeading(raw: string): Omit<DetectedHeading, 'line'> {
  const md = /^(#{1,3})\s+(.+)$/.exec(raw);
  if (md) {
    return { heading: md[2], depth: md[1].length as HeadingDepth, signal: 'markdown' };
  }
  /* Case-insensitive HERE only: "CHAPTER ONE" is the document's wording as
     much as "Chapter One" is. Boundary detection above stays case-sensitive
     (the 2026-08-05 confetti trap); this step only names what already cut. */
  if (/^chapter\s+\w+/i.test(raw)) {
    return { heading: raw, depth: 1, signal: 'chapter' };
  }
  return { heading: raw, depth: null, signal: 'caps' };
}

export function segment(text: string): SectionInput[] {
  const lines = text.split('\n');
  const headingIdx: DetectedHeading[] = [];

  const headingRe = /^(#{1,3}\s+.+|[Cc]hapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    if (headingRe.test(raw) && raw.length <= 100) {
      headingIdx.push({ line: i, ...classifyHeading(raw) });
    }
  }

  if (headingIdx.length < 2) {
    return [{ position: 0, heading: null, body: text, headingDepth: null, headingSignal: null }];
  }

  const sections: SectionInput[] = [];
  // Preamble before the first heading, if substantial.
  const preamble = lines.slice(0, headingIdx[0].line).join('\n');
  if (preamble.trim().length > 0) {
    sections.push({ position: 0, heading: null, body: preamble, headingDepth: null, headingSignal: null });
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
  /* WS2-08A — a carried orphan keeps its OWN depth. The section that results
     is headed by the first orphan, so it carries that orphan's classification:
     a "# Part One" followed straight by "## The Frost" is a depth-1 section
     whose body opens with the depth-2 line, not a depth-2 section. */
  let carried: DetectedHeading[] = [];
  for (let h = 0; h < headingIdx.length && sections.length < MAX_SECTIONS; h++) {
    const start = headingIdx[h].line + 1;
    const end = h + 1 < headingIdx.length ? headingIdx[h + 1].line : lines.length;
    const body = lines.slice(start, end).join('\n');
    if (body.trim().length === 0) {
      carried.push(headingIdx[h]);
      continue;
    }
    if (carried.length > 0) {
      const lead = carried[0];
      sections.push({
        position: sections.length,
        heading: lead.heading,
        body: [...carried.slice(1).map((c) => c.heading), headingIdx[h].heading, body].join('\n'),
        headingDepth: lead.depth,
        headingSignal: lead.signal,
      });
      carried = [];
      continue;
    }
    const cur = headingIdx[h];
    sections.push({
      position: sections.length,
      heading: cur.heading,
      body,
      headingDepth: cur.depth,
      headingSignal: cur.signal,
    });
  }
  /* Headings trailing the document with nothing after them. They arrived, so
     they are kept — appended to the last section, or standing as their own if
     there is none. */
  if (carried.length > 0) {
    const last = sections[sections.length - 1];
    if (last) {
      last.body = [last.body, ...carried.map((c) => c.heading)].join('\n');
    } else {
      const lead = carried[0];
      sections.push({
        position: 0,
        heading: lead.heading,
        body: carried.slice(1).map((c) => c.heading).join('\n') || text,
        headingDepth: lead.depth,
        headingSignal: lead.signal,
      });
    }
  }
  return sections.length > 0
    ? sections
    : [{ position: 0, heading: null, body: text, headingDepth: null, headingSignal: null }];
}
