import type { WriteBlock, WriteBlockKind } from './WriteRoom';

const ROMAN_SUBHEAD = /^(?:[IVXLCDM]+\.|[A-Z]\.)\s+\S/;
const NUMBERED_SUBHEAD = /^\d{1,2}[.)]\s+[A-Z]/;
const LIST_LINE = /^(?:[-*•]|\d+[.)])\s+/;
const FOLIO = /^\d{1,4}$/;
/** Beyond any printed measure: a line this long is a paragraph, not a wrapped line. */
const LINE_PER_PARAGRAPH_MIN = 140;
const SENTENCE_END = /[.!?…][”’"']?$/;

function classify(text: string): WriteBlockKind {
  const t = text.trim();
  if (FOLIO.test(t)) return 'folio';
  if (ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t)) return 'subhead';
  if (t.split('\n').every((line) => !line.trim() || LIST_LINE.test(line.trim()))) return 'list';
  if (/^[“"‘']/.test(t) && (/[”"’']\s*[—–-]\s*\S/.test(t) || /[”"’']$/.test(t))) return 'epigraph';
  return 'paragraph';
}

function visualText(text: string, _kind: WriteBlockKind): string {
  /* Preserve every authored/extracted character inside a block. CSS reflows
     hard PDF line-wraps visually; the DOM must retain the original newlines so
     exact passage selection can still resolve against the canonical body. */
  return text.trim();
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m]! : (sorted[m - 1]! + sorted[m]!) / 2;
}

function pushBlock(out: WriteBlock[], raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  const kind = classify(trimmed);
  out.push({ text: visualText(trimmed, kind), kind });
}

/** Presentation-only typesetting. Stored manuscript text is never rewritten here. */
export function typesetManuscriptBody(body: string): WriteBlock[] {
  const normalized = body.replace(/\r\n?/g, '\n');
  if (!normalized.trim()) return [{ text: '', kind: 'paragraph' }];

  const explicit = normalized.split(/\n[ \t]*\n+/).filter((part) => part.trim());
  if (explicit.length > 1) {
    return explicit.map((raw) => {
      const kind = classify(raw);
      return { text: visualText(raw, kind), kind };
    });
  }

  const lines = normalized.split('\n');
  const nonempty = lines.filter((line) => line.trim());
  if (nonempty.length < 3) {
    const kind = classify(normalized);
    return [{ text: visualText(normalized, kind), kind }];
  }

  const proseLengths = nonempty.map((line) => line.trim())
    .filter((line) => !FOLIO.test(line) && !ROMAN_SUBHEAD.test(line) && !LIST_LINE.test(line))
    .map((line) => line.length).filter((n) => n >= 25);
  const typical = median(proseLengths);

  /* Line-per-paragraph profile. A hard-wrapped page tops out near one printed
     measure (~110 characters). When the typical line is far beyond that, each
     line is a whole paragraph the source separated with a single newline, and
     collapsing those newlines would weld the chapter into one wall of text. */
  if (typical >= LINE_PER_PARAGRAPH_MIN) {
    const out: WriteBlock[] = [];
    for (const raw of lines) pushBlock(out, raw);
    return out.length ? out : [{ text: visualText(normalized, classify(normalized)), kind: classify(normalized) }];
  }
  if (typical < 45) {
    const kind = classify(normalized);
    return [{ text: visualText(normalized, kind), kind }];
  }

  const out: WriteBlock[] = [];
  let current: string[] = [];
  const flush = () => { pushBlock(out, current.join('\n')); current = []; };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i] ?? '';
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const standalone = FOLIO.test(t) || ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t);
    if (standalone) { flush(); pushBlock(out, t); continue; }

    current.push(raw);
    const nextRaw = lines[i + 1] ?? '';
    const next = nextRaw.trim();
    if (!next) { flush(); continue; }
    if (ROMAN_SUBHEAD.test(next) || NUMBERED_SUBHEAD.test(next) || FOLIO.test(next)) { flush(); continue; }

    /* In a hard-wrapped typeset page, a paragraph's last line is usually
       shorter than the prevailing line measure and ends with sentence
       punctuation. 0.98 is deliberately paired with BOTH signals: length
       alone is never enough to invent a paragraph boundary. */
    const shortLastLine = t.length <= typical * 0.98;
    const nextIndented = /^\s{2,}\S/.test(nextRaw);
    const listBoundary = LIST_LINE.test(next) !== LIST_LINE.test(t);
    if ((shortLastLine && SENTENCE_END.test(t)) || nextIndented || listBoundary) flush();
  }
  flush();
  return out.length ? out : [{ text: visualText(normalized, classify(normalized)), kind: classify(normalized) }];
}

export function typesetParagraphs(body: string): string[] {
  return typesetManuscriptBody(body).map((block) => block.text);
}
