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
      passages.push({
        key, sectionId, heading: section?.heading || 'Untitled section',
        position: section?.position,
        chapterHeading: section ? [...sections].filter(s => s.position <= section.position && /^Chapter\s+\d+/i.test(s.heading ?? '')).sort((a, b) => b.position - a.position)[0]?.heading ?? undefined : undefined,
        body: section?.body ?? '', range: bodyRange,
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
