import type { WriteBlock, WriteBlockKind } from './WriteRoom';

const ROMAN_SUBHEAD = /^(?:[IVXLCDM]+\.|[A-Z]\.)\s+\S/;
const NUMBERED_SUBHEAD = /^\d{1,2}[.)]\s+[A-Z]/;
const ALL_CAPS_SUBHEAD = /^(?=.{2,120}$)(?=.*[A-Z])[A-Z0-9“”‘’'\"—–,:;()&/\-.\s]+$/;
const LIST_LINE = /^(?:[-*•]|\d+[.)])\s+/;
const FOLIO = /^\d{1,4}$/;
const SENTENCE_END = /[.!?…][”’"']?$/;

function classify(text: string): WriteBlockKind {
  const t = text.trim();
  const markdownWrapped = /^(\*|_)([\s\S]+)\1$/.exec(t);
  const visible = markdownWrapped ? markdownWrapped[2]!.trim() : t;
  if (FOLIO.test(visible)) return 'folio';
  if (ROMAN_SUBHEAD.test(visible) || NUMBERED_SUBHEAD.test(visible) || ALL_CAPS_SUBHEAD.test(visible)) return 'subhead';
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
    /* A standalone folio between blank lines is page-layout evidence, not an
       authorial paragraph boundary. In that case keep the whole body together
       so the linewise recovery pass can bridge a sentence across the page. */
    const containsPagination = explicit.some((raw) => FOLIO.test(raw.trim()));
    if (!containsPagination) {
      return explicit.flatMap((raw) => {
        const hasInternalStructure = raw.split('\n').some((line) => {
          const t = line.trim();
          return FOLIO.test(t) || ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t) || ALL_CAPS_SUBHEAD.test(t);
        });
        if (hasInternalStructure) return typesetManuscriptBody(raw);
        const kind = classify(raw);
        return [{ text: visualText(raw, kind), kind }];
      });
    }
  }

  const lines = normalized.split('\n');
  const nonempty = lines.filter((line) => line.trim());
  if (nonempty.length < 3) {
    const kind = classify(normalized);
    return [{ text: visualText(normalized, kind), kind }];
  }

  const proseLengths = nonempty.map((line) => line.trim())
    .filter((line) => !FOLIO.test(line) && !ROMAN_SUBHEAD.test(line) && !NUMBERED_SUBHEAD.test(line) && !ALL_CAPS_SUBHEAD.test(line) && !LIST_LINE.test(line))
    .map((line) => line.length).filter((n) => n >= 25);
  const typical = median(proseLengths);
  const proseLines = nonempty.map((line) => line.trim())
    .filter((line) => !FOLIO.test(line) && !ROMAN_SUBHEAD.test(line) && !NUMBERED_SUBHEAD.test(line) && !ALL_CAPS_SUBHEAD.test(line) && !LIST_LINE.test(line));
  const sentenceEnded = proseLines.filter((line) => SENTENCE_END.test(line)).length;
  const authoredParagraphProfile = proseLines.length >= 3
    && median(proseLines.map((line) => line.length)) >= 70
    && sentenceEnded / proseLines.length >= 0.7;
  const hasStandaloneStructure = nonempty.some((line) => {
    const t = line.trim();
    return FOLIO.test(t) || ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t) || ALL_CAPS_SUBHEAD.test(t);
  });
  if (typical < 45 && !authoredParagraphProfile && !hasStandaloneStructure) {
    const kind = classify(normalized);
    return [{ text: visualText(normalized, kind), kind }];
  }

  const out: WriteBlock[] = [];
  let current: string[] = [];
  let pendingFolios: string[] = [];
  const flush = () => {
    pushBlock(out, current.join('\n'));
    current = [];
    for (const folio of pendingFolios) pushBlock(out, folio);
    pendingFolios = [];
  };
  const nextNonempty = (from: number) => {
    for (let j = from; j < lines.length; j += 1) {
      const value = (lines[j] ?? '').trim();
      if (value) return value;
    }
    return '';
  };
  let previousNonempty = '';

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i] ?? '';
    const t = raw.trim();
    if (!t) {
      const upcoming = nextNonempty(i + 1);
      /* Imported PDF page boundaries often appear as blank + folio + blank.
         They are pagination, not authorial paragraph evidence. */
      if (FOLIO.test(upcoming) || FOLIO.test(previousNonempty)) continue;
      flush();
      continue;
    }
    if (FOLIO.test(t)) {
      const lastCurrent = (current[current.length - 1] ?? '').trim();
      if (current.length && SENTENCE_END.test(lastCurrent)) {
        flush();
        pushBlock(out, t);
      } else if (current.length) {
        pendingFolios.push(t);
      } else {
        pushBlock(out, t);
      }
      previousNonempty = t;
      continue;
    }

    const romanOrNumbered = ROMAN_SUBHEAD.test(t) || NUMBERED_SUBHEAD.test(t);
    const capsSubhead = ALL_CAPS_SUBHEAD.test(t);
    if (romanOrNumbered || capsSubhead) {
      flush();
      let heading = t;
      /* A print line-break may split a numbered heading itself:
         “IV. The Architecture Beneath the” / “Experience”. */
      const candidate = (lines[i + 1] ?? '').trim();
      const afterCandidate = (lines[i + 2] ?? '').trim();
      if (
        romanOrNumbered
        && candidate
        && candidate.length <= 40
        && /^[A-Z][A-Za-z’' -]*$/.test(candidate)
        && afterCandidate.length >= 45
      ) {
        heading += ' ' + candidate;
        i += 1;
      }
      pushBlock(out, heading);
      previousNonempty = heading;
      continue;
    }

    current.push(raw);
    if (authoredParagraphProfile && SENTENCE_END.test(t)) { flush(); continue; }
    const nextRaw = lines[i + 1] ?? '';
    const next = nextRaw.trim();
    if (!next) {
      const upcoming = nextNonempty(i + 1);
      if (FOLIO.test(upcoming)) { previousNonempty = t; continue; }
      flush();
      continue;
    }
    if (ROMAN_SUBHEAD.test(next) || NUMBERED_SUBHEAD.test(next) || ALL_CAPS_SUBHEAD.test(next)) { flush(); continue; }
    if (FOLIO.test(next)) { previousNonempty = t; continue; }

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
 * Reader-facing projection of manuscript blocks.
 * Printed folios are not authored content. When a folio interrupts a paragraph
 * mid-sentence, collapse the two prose fragments back into one paragraph for
 * Prose View while leaving stored manuscript text untouched.
 */
export function typesetProseBlocks(body: string): WriteBlock[] {
  const blocks = typesetManuscriptBody(body);
  const out: WriteBlock[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;
    if (
      block.kind === 'paragraph'
      && blocks[i + 1]?.kind === 'folio'
      && blocks[i + 2]?.kind === 'paragraph'
      && !SENTENCE_END.test(block.text.trim())
    ) {
      const continuation = blocks[i + 2]!;
      out.push({
        kind: 'paragraph',
        text: block.text.trimEnd() + '\n' + continuation.text.trimStart(),
      });
      i += 2;
      continue;
    }
    if (block.kind !== 'folio') out.push(block);
  }

  return out.length ? out : [{ text: '', kind: 'paragraph' }];
}
