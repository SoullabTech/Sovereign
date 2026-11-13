import { SECTION_PARAM } from './placeInWork';
import { apiFetch } from '@/lib/http/apiBase';
import { fetchReading, type ReadingPayload } from './developClient';
import { readingView, type ObservationView } from './developPresentation';
import { sectionIdsOf, type CodePointRange } from '@/lib/manuscript/development/evidenceRef';
import type { RebuildSection } from './rebuild/model';

export interface InsightPassage {
  key: string;
  sectionId: string;
  heading: string;
  position?: number;
  chapterHeading?: string;
  body: string;
  range: CodePointRange | null;
  /**
   * The passage the desk holds for this evidence. The reader writes its own code-point offsets and on a long section they drift:
   * founder walk 2026-11-12, the "embedded URL" place cited 4550–4800 while the URL sits at ~5207, so the desk held other words,
   * mid-word, and every edit MAIA proposed was refused as quote_not_in_text. This anchors to words the observation quotes that occur
   * VERBATIM in the section (the occurrence nearest the cited range), widened to whole paragraphs; with no such words, the cited range
   * widened to whole paragraphs. Null exactly when `range` is null. `range` itself is untouched: it stays the reader's evidence.
   */
  holdRange: CodePointRange | null;
  /** how holdRange was placed */
  heldBy: 'quoted_words' | 'cited_range' | null;
  verified: boolean;
  editable: boolean;
  note: string;
}
export interface CanvasInsight {
  manuscriptId: string;
  readingId: string;
  observation: ObservationView;
  coverage: string;
  passages: InsightPassage[];
}
export const INSIGHT_READING = 'insightReading';
export const INSIGHT_OBSERVATION = 'insightObservation';

export function insightWriteHref(manuscriptId: string, readingId: string, observationKey: string, sectionId: string): string {
  const query = new URLSearchParams({ m: manuscriptId, [SECTION_PARAM]: sectionId,
    [INSIGHT_READING]: readingId, [INSIGHT_OBSERVATION]: observationKey });
  return '/writers-studio/rebuild?' + query.toString();
}

/** No normalization: a mark requires the exact UTF-8 bytes frozen by the reader. */
export async function browserDigest(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
}

export async function buildCanvasInsight(
  manuscriptId: string, payload: ReadingPayload, sections: readonly RebuildSection[],
  observationKey: string, digest: (text: string) => Promise<string> = browserDigest,
): Promise<CanvasInsight | null> {
  const reading = payload.reading;
  if (reading.manuscriptId !== manuscriptId || reading.outcome !== 'reading') return null;
  const source = reading.observations.find(o => o.key === observationKey);
  const view = readingView(reading, payload.assessment, payload.sections);
  const observation = view.observations.find(o => o.key === observationKey);
  if (!source || !observation) return null;
  const passages: InsightPassage[] = [];
  const seen = new Set<string>();
  for (const ref of source.evidenceRefs) {
    for (const sectionId of sectionIdsOf(ref)) {
      const range = ref.kind === 'passage' ? ref.range : null;
      const key = sectionId + ':' + (range ? range.start + '-' + range.end : 'section');
      if (seen.has(key)) continue;
      seen.add(key);
      const section = sections.find(s => s.draftSectionId === sectionId);
      const frozen = reading.readState.sections[sectionId];
      const prefix = section?.headingPrefix ?? '';
      const stored = prefix + (section?.body ?? '');
      const bodyStart = Array.from(prefix).length;
      let matches = false;
      let hashUnavailable = false;
      if (section && frozen && observation.state === 'current') {
        try { matches = await digest(stored) === frozen.digest; }
        catch { hashUnavailable = true; }
      }
      const validRange = !range || (Number.isInteger(range.start) && Number.isInteger(range.end)
        && range.start >= bodyStart && range.end > range.start && range.end <= Array.from(stored).length);
      const verified = matches && validRange && reading.coverage.sections[sectionId] === 'body';
      const bodyRange = verified && range ? { start: range.start - bodyStart, end: range.end - bodyStart } : null;
      const note = !section ? 'This section is no longer available.'
        : observation.state !== 'current' ? 'The reading has not been confirmed against this draft. Current text is shown for reference.'
        : !frozen ? 'The reading has no recorded text fingerprint for this section.'
        : reading.coverage.sections[sectionId] !== 'body' ? 'MAIA knew this section’s position but did not read its text. No exact evidence is marked.'
        : hashUnavailable ? 'Text verification is unavailable in this browser. No exact evidence is marked.'
        : !matches ? 'This section differs from the text recorded in the reading. Current text is shown without old evidence markers.'
        : !validRange ? 'The cited range cannot be placed wholly in this section’s editable body. No passage is selected.'
        : range ? 'Exact passage · matches the text MAIA read.'
        : 'Whole section verified · the observation names no narrower passage.';
      const held = bodyRange && section ? anchorHeldRange(section.body, bodyRange, quotedWords(source.observation)) : null;
      passages.push({
        key, sectionId, heading: section?.heading || 'Untitled section',
        position: section?.position,
        chapterHeading: section ? [...sections].filter(s => s.position <= section.position && /^Chapter\s+\d+/i.test(s.heading ?? '')).sort((a, b) => b.position - a.position)[0]?.heading ?? undefined : undefined,
        body: section?.body ?? '', range: bodyRange,
        holdRange: held?.range ?? null, heldBy: held?.by ?? null,
        verified, editable: Boolean(section?.editable),
        note,
      });
    }
  }
  return { manuscriptId, readingId: reading.id, observation, coverage: view.coverage.sentence, passages: passages.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)) };
}

export async function loadCanvasInsight(manuscriptId: string, readingId: string, observationKey: string): Promise<CanvasInsight | null> {
  try {
    const [reading, response] = await Promise.all([
      fetchReading(manuscriptId, readingId),
      apiFetch('/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId)),
    ]);
    if (!reading.ok || !response.ok) return null;
    const context = await response.json();
    if (context.manuscriptId !== manuscriptId || context.state !== 'section_aware' || !Array.isArray(context.sections)) return null;
    return buildCanvasInsight(manuscriptId, reading.payload, context.sections, observationKey);
  } catch { return null; }
}

/** Context changes the window, never the evidence range. All offsets are code points. */
export function passageWindow(body: string, range: CodePointRange | null, paragraphs: number) {
  const points = Array.from(body);
  if (!range) return { before: '', selected: body, after: '', clippedBefore: false, clippedAfter: false };
  const before = points.slice(0, range.start).join('');
  const after = points.slice(range.end).join('');
  const n = Math.max(0, Math.min(3, Math.floor(paragraphs)));
  const left = n === 0 ? '' : before.split(/\n\s*\n/).slice(-n).join('\n\n');
  const right = n === 0 ? '' : after.split(/\n\s*\n/).slice(0, n).join('\n\n');
  return { before: left, selected: points.slice(range.start, range.end).join(''), after: right,
    clippedBefore: left.length < before.length, clippedAfter: right.length < after.length };
}

/** Pure: the writer's words an observation quotes ("…" or “…”), split at ellipses, each long enough to be a real anchor. */
export function quotedWords(observation: string): string[] {
  const out: string[] = [];
  for (const m of observation.matchAll(/[“"]([^”"]{4,})[”"]/g)) {
    for (const part of m[1]!.split(/\.\.\.|…/)) {
      const t = part.trim().replace(/[.,;:!?]+$/, '');
      if (Array.from(t).length >= 12 && !out.includes(t)) out.push(t);
    }
  }
  return out;
}

const PARA = /\n\s*\n/g;

/** Pure: widen [start,end) (code units) to the paragraphs that contain it. */
function toParagraphs(body: string, start: number, end: number): [number, number] {
  let s = 0;
  let e = body.length;
  for (const m of body.matchAll(PARA)) {
    const at = m.index!;
    const after = at + m[0].length;
    if (after <= start) s = after;
    if (at >= end) { e = at; break; }
  }
  return [s, e];
}

const cp = (body: string, unit: number) => Array.from(body.slice(0, unit)).length;
const unitOf = (body: string, point: number) => Array.from(body).slice(0, point).join('').length;

/**
 * Pure: where the desk holds a passage. Words the observation quotes that occur verbatim in `body` win (the occurrence nearest the cited
 * range); otherwise the cited range. Either way widened to whole paragraphs, so a held passage never begins or ends inside a word.
 * All ranges are code points.
 */
export function anchorHeldRange(body: string, cited: CodePointRange, quotes: readonly string[]): { range: CodePointRange; by: 'quoted_words' | 'cited_range' } {
  const citedStart = unitOf(body, cited.start);
  const citedEnd = unitOf(body, cited.end);
  let best: { start: number; end: number; distance: number } | null = null;
  for (const q of quotes) {
    for (let at = body.indexOf(q); at >= 0; at = body.indexOf(q, at + 1)) {
      const end = at + q.length;
      const distance = end <= citedStart ? citedStart - end : at >= citedEnd ? at - citedEnd : 0;
      if (!best || distance < best.distance) best = { start: at, end, distance };
    }
  }
  const [s, e] = best ? toParagraphs(body, best.start, best.end) : toParagraphs(body, citedStart, citedEnd);
  return { range: { start: cp(body, s), end: cp(body, e) }, by: best ? 'quoted_words' : 'cited_range' };
}

/** Pure: which evidence passage "Show me options" opens the desk on. In the place's own section first; words quoted verbatim first. */
export function pickDeskPassage<T extends { p: Pick<InsightPassage, 'sectionId' | 'heldBy'> }>(found: readonly T[], primary: string | null): T | null {
  const rank = (x: T) => (x.p.sectionId === primary ? 0 : 2) + (x.p.heldBy === 'quoted_words' ? 0 : 1);
  return [...found].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}
