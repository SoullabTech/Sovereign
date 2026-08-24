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

export interface SectionInput {
  position: number;
  heading: string | null;
  body: string;
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
export function segment(text: string): SectionInput[] {
  const lines = text.split('\n');
  const headingIdx: { line: number; heading: string }[] = [];

  const headingRe = /^(#{1,3}\s+.+|[Cc]hapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    if (headingRe.test(raw) && raw.length <= 100) {
      headingIdx.push({ line: i, heading: raw.replace(/^#{1,3}\s+/, '') });
    }
  }

  if (headingIdx.length < 2) {
    return [{ position: 0, heading: null, body: text }];
  }

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
  for (let h = 0; h < headingIdx.length && sections.length < MAX_SECTIONS; h++) {
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
