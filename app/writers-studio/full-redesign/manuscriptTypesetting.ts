import type { WriteBlock, WriteBlockKind } from './WriteRoom';

const ROMAN_SUBHEAD = /^(?:[IVXLCDM]+\.|[A-Z]\.)\s+\S/;
const NUMBERED_SUBHEAD = /^\d{1,2}[.)]\s+[A-Z]/;
const LIST_LINE = /^(?:[-*•]|\d+[.)])\s+/;
const FOLIO = /^\d{1,4}$/;
const SENTENCE_END = /[.!?…][”’"']?$/;

function classify(text: string): WriteBlockKind {
  const t = text.trim();
  const markdownWrapped = /^(\*|_)([\s\S]+)\1$/.exec(t);
  const visible = markdownWrapped ? markdownWrapped[2]!.trim() : t;
  // A numeric-only line may be a year, count or other authored text.
  // Without trusted import-page provenance it cannot be labeled a folio.
  if (FOLIO.test(visible)) return 'paragraph';
  if (ROMAN_SUBHEAD.test(visible) || NUMBERED_SUBHEAD.test(visible)) return 'subhead';
  if (visible.split('\n').every((line) => !line.trim() || LIST_LINE.test(line.trim()))) return 'list';
  if (/^[“"‘']/.test(visible) && (/[”"’']\s*[—–-]\s*\S/.test(visible) || /[”"’']$/.test(visible))) return 'epigraph';
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
  const proseLines = nonempty.map((line) => line.trim())
    .filter((line) => !FOLIO.test(line) && !ROMAN_SUBHEAD.test(line) && !NUMBERED_SUBHEAD.test(line) && !LIST_LINE.test(line));
  const sentenceEnded = proseLines.filter((line) => SENTENCE_END.test(line)).length;
  const authoredParagraphProfile = proseLines.length >= 3
    && median(proseLines.map((line) => line.length)) >= 70
    && sentenceEnded / proseLines.length >= 0.7;
  const hasStandaloneStructure = nonempty.some((line) => {
    const t = line.trim();
    return FOLIO.test(t) || ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t);
  });
  if (typical < 45 && !authoredParagraphProfile && !hasStandaloneStructure) {
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
    if (authoredParagraphProfile && SENTENCE_END.test(t)) { flush(); continue; }
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


/**
 * Craft-specific reader projection. These helpers do NOT replace or mutate
 * typesetManuscriptBody, which remains the deployed manuscript view.
 *
 * Printed page folios and PDF soft wraps are presentation artifacts; source
 * text stays untouched. A later Apply requires its separate author authority.
 */
function looksLikeImportedHardWrap(body: string): boolean {
  const normalized = body.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  // A bare numeric line does not prove PDF/printed-page provenance.
  const prose = lines.filter(line =>
    !ROMAN_SUBHEAD.test(line) &&
    !NUMBERED_SUBHEAD.test(line) &&
    !LIST_LINE.test(line)
  );
  if (prose.length < 4) return false;
  const typical = median(prose.map(line => line.length));
  const sentenceEnded = prose.filter(line => SENTENCE_END.test(line)).length;
  return typical >= 45 && sentenceEnded / prose.length < 0.6;
}

function reflowCraftBlock(block: WriteBlock): string {
  if (block.kind === 'list') {
    return block.text.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
  }
  return block.text.split('\n').map(line => line.trim()).filter(Boolean).join(' ');
}

export interface EditableManuscriptProjection {
  text: string;
  projected: boolean;
}

/** Only a display/editing projection, never a silent Source transformation. */
export function editableManuscriptProjection(body: string): EditableManuscriptProjection {
  const normalized = body.replace(/\r\n?/g, '\n');
  if (!looksLikeImportedHardWrap(normalized)) return { text: normalized, projected: false };
  const text = typesetProseBlocks(normalized)
    .map(reflowCraftBlock).filter(Boolean).join('\n\n');
  return { text, projected: text !== normalized };
}

/**
 * Reader-only Craft blocks. Numeric-only lines are preserved as authored
 * text until explicit trusted import evidence proves an actual printed folio.
 * Neither display heuristics nor CSS can grant source-editing authority.
 */
export function typesetProseBlocks(body: string): WriteBlock[] {
  const blocks = typesetManuscriptBody(body);
  // Reader and Craft keep every numeric line selectable as authored text.
  // Preserve fallback handling for older provenance-tagged folio blocks; it
  // never removes their characters or grants edit authority.
  return blocks.map(block => block.kind === 'folio'
    ? { ...block, kind: 'paragraph' as const }
    : block);
}
