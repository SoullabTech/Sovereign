import type { WriteBlock } from '@/app/writers-studio/full-redesign/WriteRoom';
import { typesetProseBlocks, editableManuscriptProjection } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

export interface CraftProseBlock extends WriteBlock { start: number; end: number }
export interface CraftProseBreak { start: number; end: number }

/** A display map only. Stored text, working-copy text and editing coordinates
 * remain the original code points. Printed folios are omitted only from the
 * matching projection, exactly as in the existing reader-facing typesetter. */
export function craftProseBlocks(body: string): CraftProseBlock[] {
  const chars = Array.from(body);
  const ignored = new Set<number>();
  let lineStart = 0;
  for (const line of body.split('\n')) {
    const length = Array.from(line).length;
    if (/^[ \t]*\d{1,4}[ \t\r]*$/u.test(line)) {
      for (let i = lineStart; i < lineStart + length; i += 1) ignored.add(i);
    }
    lineStart += length + 1;
  }
  let flat = '';
  const starts: number[] = [], ends: number[] = [];
  let inSpace = false;
  chars.forEach((ch, i) => {
    if (ignored.has(i)) return;
    if (/\s/u.test(ch)) {
      if (!inSpace && flat.length) { flat += ' '; starts.push(i); ends.push(i + 1); }
      else if (inSpace && ends.length) ends[ends.length - 1] = i + 1;
      inSpace = true;
    } else {
      flat += ch;
      for (let j = 0; j < ch.length; j += 1) { starts.push(i); ends.push(i + 1); }
      inSpace = false;
    }
  });
  let cursor = 0;
  const out: CraftProseBlock[] = [];
  for (const block of typesetProseBlocks(body)) {
    const needle = block.text.replace(/\s+/gu, ' ').trim();
    if (!needle) continue;
    const at = flat.indexOf(needle, cursor);
    if (at < 0) return []; // No invented coordinates when projection cannot be mapped.
    const start = starts[at], end = ends[at + needle.length - 1];
    if (start === undefined || end === undefined) return [];
    out.push({ ...block, start, end });
    cursor = at + needle.length;
  }
  return out;
}

export function craftProseBreaks(blocks: readonly CraftProseBlock[]): CraftProseBreak[] {
  return blocks.slice(1).map((block, i) => ({ start: blocks[i]!.end, end: block.start }))
    .filter(gap => gap.end > gap.start);
}

/** Resolve paragraph context from the WHOLE section, not from independently
 * re-typeset before/after fragments. A focus boundary is not a paragraph break. */
export function splitActiveParagraph(body: string, start: number, end: number) {
  const chars = Array.from(body);
  const blocks = craftProseBlocks(body);
  const touched = blocks.filter(block => block.start < end && block.end > start);
  const first = touched[0], last = touched[touched.length - 1];
  if (!first || !last) {
    return { leadingBlocks: [] as WriteBlock[], trailingBlocks: [] as WriteBlock[],
      prefix: chars.slice(0, start).join(''), suffix: chars.slice(end).join(''),
      breaks: [] as CraftProseBreak[], reflow: false, mapped: false };
  }
  const outerStart = Math.min(start, first.start), outerEnd = Math.max(end, last.end);
  return {
    leadingBlocks: blocks.filter(block => block.end <= outerStart),
    trailingBlocks: blocks.filter(block => block.start >= outerEnd),
    prefix: chars.slice(outerStart, start).join(''),
    suffix: chars.slice(end, outerEnd).join(''),
    breaks: craftProseBreaks(blocks)
      .filter(gap => gap.start < end && gap.end > start)
      .map(gap => ({ start: Math.max(0, gap.start - start), end: Math.min(end - start, gap.end - start) })),
    reflow: editableManuscriptProjection(body).projected,
    mapped: true,
  };
}

/** Chunks preserve text exactly. A break is rendered as paragraph breathing
 * room rather than forcing the imported PDF's line measure onto the canvas. */
export function craftTypographyChunks(text: string, breaks: readonly CraftProseBreak[], offset = 0) {
  const chars = Array.from(text);
  const chunks: { text: string; paragraphBreak: boolean }[] = [];
  let cursor = 0;
  for (const gap of breaks) {
    const start = Math.max(cursor, gap.start - offset, 0);
    const end = Math.min(chars.length, gap.end - offset);
    if (end <= start || start > chars.length) continue;
    if (start > cursor) chunks.push({ text: chars.slice(cursor, start).join(''), paragraphBreak: false });
    chunks.push({ text: chars.slice(start, end).join(''), paragraphBreak: true });
    cursor = end;
  }
  if (cursor < chars.length) chunks.push({ text: chars.slice(cursor).join(''), paragraphBreak: false });
  return chunks;
}

/** New paragraph breaks supplied inside an insertion remain visible as breaks.
 * Do not infer a paragraph from the length of a short replacement fragment. */
export function craftInsertedBreaks(text: string): CraftProseBreak[] {
  return [...text.matchAll(/\r?\n[ \t\r]*\n+/gu)].map(match => ({
    start: Array.from(text.slice(0, match.index)).length,
    end: Array.from(text.slice(0, match.index! + match[0].length)).length,
  }));
}
