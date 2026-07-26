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
 */
export function segment(text: string): SectionInput[] {
  const lines = text.split('\n');
  const headingIdx: { line: number; heading: string }[] = [];

  const headingRe = /^(#{1,3}\s+.+|chapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/;
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
  for (let h = 0; h < headingIdx.length && sections.length < MAX_SECTIONS; h++) {
    const start = headingIdx[h].line + 1;
    const end = h + 1 < headingIdx.length ? headingIdx[h + 1].line : lines.length;
    const body = lines.slice(start, end).join('\n');
    if (body.trim().length === 0) continue;
    sections.push({ position: sections.length, heading: headingIdx[h].heading, body });
  }
  return sections.length > 0 ? sections : [{ position: 0, heading: null, body: text }];
}
