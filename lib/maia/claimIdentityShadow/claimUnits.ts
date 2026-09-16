import crypto from 'node:crypto';
import type { ClaimKind, ClaimUnit, SegmentationStatus } from './types';

const CLAIM_ID_VERSION = 'claim-v1';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function claimIdFor(
  turnId: string,
  startChar: number,
  endChar: number,
  exactText: string,
): string {
  return sha256(`${CLAIM_ID_VERSION}\0${turnId}\0${startChar}\0${endChar}\0${exactText}`);
}

function claimKind(text: string): ClaimKind {
  const trimmed = text.trim();
  if (/\?\s*["')\]]*$/.test(trimmed)) return 'question';
  if (/^(?:what|why|how|where|when|who|which)(?:['’](?:s|re|d|ll))?\b/i.test(trimmed)) return 'question';
  if (/^(?:what|why|how|where|when|who|which)\s+(?:do|does|did|is|are|was|were|can|could|would|will|might|should|has|have)\b/i.test(trimmed)) return 'question';
  if (/^(?:do|does|did|is|are|was|were|can|could|would|will|might|should|has|have)\s+(?:you|we|it|this|that|the)\b/i.test(trimmed)) return 'question';
  if (/^(?:please\s+)?(?:tell|show|remember|consider|look|bring|give|let|stop|continue|notice)\b/i.test(trimmed)) return 'directive';
  if (!/[.!?]["')\]]*$/.test(trimmed) && trimmed.split(/\s+/).length <= 10) return 'fragment';
  return 'assertion';
}
function segmentationStatus(text: string): SegmentationStatus {
  const trimmed = text.trim();
  const quoteCount = (trimmed.match(/["“”]/g) ?? []).length;
  if (quoteCount % 2 !== 0) return 'uncertain';
  if (
    /;|\s—\s|\s-\s/.test(trimmed)
    || /\b(?:whereas|although|while)\b/i.test(trimmed)
    || /:\s+\S.{8,}/.test(trimmed)
  ) return 'composite';
  return 'atomic';
}

function makeUnit(
  units: ClaimUnit[],
  turnId: string,
  source: string,
  rawStart: number,
  rawEnd: number,
  forcedKind?: ClaimKind,
): void {
  let start = rawStart;
  let end = rawEnd;
  while (start < end && /\s/.test(source[start]!)) start += 1;
  while (end > start && /\s/.test(source[end - 1]!)) end -= 1;
  if (start >= end) return;
  const text = source.slice(start, end);
  units.push({
    claimId: claimIdFor(turnId, start, end, text),
    turnId,
    startChar: start,
    endChar: end,
    exactTextHash: sha256(text),
    text,
    kind: forcedKind ?? claimKind(text),
    segmentationStatus: forcedKind === 'quotation' ? segmentationStatus(text.slice(1, -1)) : segmentationStatus(text),
  });
}
function segmentPlainRange(
  units: ClaimUnit[],
  turnId: string,
  source: string,
  rangeStart: number,
  rangeEnd: number,
): void {
  let start = rangeStart;
  let i = rangeStart;
  while (i < rangeEnd) {
    const ch = source[i]!;
    if (ch === '\n') {
      makeUnit(units, turnId, source, start, i);
      start = i + 1;
      i += 1;
      continue;
    }
    if (ch === '.' || ch === '?' || ch === '!') {
      let end = i + 1;
      while (end < rangeEnd && /[.!?]/.test(source[end]!)) end += 1;
      while (end < rangeEnd && /["”')\]]/.test(source[end]!)) end += 1;
      const next = source[end];
      if (end >= rangeEnd || /\s/.test(next ?? '')) {
        makeUnit(units, turnId, source, start, end);
        start = end;
        i = end;
        continue;
      }
    }
    i += 1;
  }
  makeUnit(units, turnId, source, start, rangeEnd);
}

interface QuoteRange { start: number; end: number; }

function quoteRanges(source: string): QuoteRange[] {
  const ranges: QuoteRange[] = [];
  const re = /["“]([^"”]{2,})["”]/g;
  for (const m of source.matchAll(re)) {
    const start = m.index ?? 0;
    const full = m[0]!;
    const inner = m[1]!;
    const prefix = source.slice(Math.max(0, start - 12), start);
    if (inner.length >= 20 || /:\s*$/.test(prefix)) ranges.push({ start, end: start + full.length });
  }
  return ranges;
}
export function segmentClaimUnits(turnId: string, source: string): ClaimUnit[] {
  const units: ClaimUnit[] = [];
  const quotes = quoteRanges(source);
  let cursor = 0;

  for (const q of quotes) {
    if (q.start > cursor) segmentPlainRange(units, turnId, source, cursor, q.start);
    makeUnit(units, turnId, source, q.start, q.end, 'quotation');
    cursor = q.end;
  }

  if (cursor < source.length) segmentPlainRange(units, turnId, source, cursor, source.length);
  return units.sort((a, b) => a.startChar - b.startChar);
}
