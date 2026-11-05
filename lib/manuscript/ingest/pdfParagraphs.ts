/**
 * PDF paragraph reconstruction — WHITESPACE ONLY.
 *
 * pdf-parse's `getText()` returns flat text: soft line wraps and paragraph
 * boundaries are indistinguishable. The PDF's own layout still knows where the
 * author broke paragraphs (a larger vertical gap, a first-line indent, a short
 * last line). This module reads that layout and returns the same characters
 * with paragraph breaks restored.
 *
 * DOCTRINE (same as parseUpload.ts): the author's words, unchanged — and
 * nothing added. Reconstruction may change WHITESPACE ONLY:
 *   - it never alters, drops, reorders or adds any non-whitespace character;
 *   - it does NOT strip page numbers, running headers or hyphens (that would
 *     remove characters) — a page-number-looking line is only kept apart as its
 *     own paragraph so it does not splice into a sentence;
 *   - a hyphen at a line end is kept; only the newline after it is removed.
 * `sameNonWhitespace()` is the guard the caller runs against the flat text;
 * on any mismatch the caller falls back to the flat output.
 *
 * Pure, deterministic, no I/O. Coordinates are top-down (y grows downward).
 */

export interface PositionedLine {
  text: string;
  /** left edge */
  x: number;
  /** right edge */
  xEnd: number;
  /** baseline, top-down */
  y: number;
  /** font height */
  height: number;
}

export interface PositionedItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEOL?: boolean;
}

const TERMINAL = /[.!?…:;"'”’)\]]$/;
const PAGE_NUMBER = /^\s*(?:\d{1,4}|[ivxlcdm]{1,7}|[–—-]\s*\d{1,4}\s*[–—-])\s*$/i;

/** Group raw text items (stream order) into visual lines. Never reorders. */
export function itemsToLines(items: PositionedItem[]): PositionedLine[] {
  const lines: PositionedLine[] = [];
  let cur: PositionedLine | null = null;
  let pendingEol = false;
  for (const it of items) {
    if (it.str === '' && !it.hasEOL) continue;
    const tol = Math.max(1, (it.height || 0) * 0.4);
    const sameLine = cur !== null && !pendingEol && Math.abs(it.y - cur.y) <= tol;
    if (sameLine && cur) {
      cur.text += it.str;
      cur.xEnd = Math.max(cur.xEnd, it.x + it.width);
      cur.height = Math.max(cur.height, it.height);
    } else {
      cur = { text: it.str, x: it.x, xEnd: it.x + it.width, y: it.y, height: it.height };
      lines.push(cur);
    }
    pendingEol = !!it.hasEOL;
  }
  return lines.filter((l) => l.text.trim() !== '');
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Reconstruct paragraph text from per-page positioned lines.
 * Returns null when detection finds no paragraph break (caller keeps flat text).
 */
export function reconstructParagraphs(pages: PositionedLine[][]): string | null {
  const all: { l: PositionedLine; page: number }[] = [];
  pages.forEach((p, i) => p.forEach((l) => all.push({ l, page: i })));
  if (all.length < 2) return null;

  // Left margin: the most common rounded x.
  const counts = new Map<number, number>();
  for (const a of all) counts.set(Math.round(a.l.x), (counts.get(Math.round(a.l.x)) ?? 0) + 1);
  let margin = all[0].l.x;
  let best = 0;
  for (const [x, c] of counts) {
    if (c > best || (c === best && x < margin)) { best = c; margin = x; }
  }
  const rights = all.map((a) => a.l.xEnd).sort((a, b) => a - b);
  const rightMargin = rights[Math.min(rights.length - 1, Math.floor(rights.length * 0.9))];
  const width = Math.max(1, rightMargin - margin);
  const bodyHeight = median(all.map((a) => a.l.height));

  const pitches: number[] = [];
  for (let i = 1; i < all.length; i++) {
    if (all[i].page !== all[i - 1].page) continue;
    const d = all[i].l.y - all[i - 1].l.y;
    if (d > 0) pitches.push(d);
  }
  const pitch = median(pitches);
  const indent = Math.max(bodyHeight * 0.8, width * 0.02);

  const isNumber = (l: PositionedLine) => PAGE_NUMBER.test(l.text);
  const sizeDiffers = (l: PositionedLine) =>
    bodyHeight > 0 && Math.abs(l.height - bodyHeight) / bodyHeight > 0.15;

  const out: string[] = [];
  let para = all[0].l.text.trim();
  let breaks = 0;
  for (let i = 1; i < all.length; i++) {
    const prev = all[i - 1].l;
    const cur = all[i].l;
    const samePage = all[i].page === all[i - 1].page;
    const gap = samePage ? cur.y - prev.y : 0;
    const prevShort = prev.xEnd < rightMargin - width * 0.2;
    const prevTerminal = TERMINAL.test(prev.text.trim());
    const brk =
      (samePage && pitch > 0 && gap > pitch * 1.4) ||
      cur.x > margin + indent ||
      prevShort ||
      (!samePage && prevTerminal && prev.xEnd < rightMargin - width * 0.03) ||
      isNumber(prev) || isNumber(cur) ||
      sizeDiffers(prev) || sizeDiffers(cur);
    if (brk) {
      out.push(para);
      para = cur.text.trim();
      breaks++;
    } else {
      const c = cur.text.trim();
      // Keep the hyphen; drop only the newline after it (no space inserted).
      para = /[A-Za-z]-$/.test(para) && /^[a-z]/.test(c) ? para + c : para + ' ' + c;
    }
  }
  out.push(para);
  if (breaks === 0) return null;
  return out.join('\n\n');
}

const stripWs = (s: string) => s.replace(/\s+/g, '');

/** The whitespace-only guard: same characters, same order, ignoring whitespace. */
export function sameNonWhitespace(a: string, b: string): boolean {
  return stripWs(a) === stripWs(b);
}
