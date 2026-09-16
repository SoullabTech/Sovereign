import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingPayload } from '@/lib/writersStudio/developClient';
import { fetchReading, requestDevelopmentalReading } from '@/lib/writersStudio/developClient';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import type { RebuildSection } from './model';

export interface ReviewFailure {
  lens: DevelopmentalLens;
  refusal: string;
  stage: string | null;
}

export interface ReviewFinding {
  id: string;
  readingId: string;
  lens: DevelopmentalLens;
  observation: string;
  summary: string;
  sectionIds: string[];
  state: 'current' | 'superseded' | 'unmeasured';
}

export interface ChapterReviewBundle {
  readingIds: string[];
  payloads: ReadingPayload[];
  findings: ReviewFinding[];
  failures: ReviewFailure[];
}

const oneLine = (s: string): string => {
  const flat = s.replace(/\s+/g, ' ').trim();
  if (flat.length <= 150) return flat;
  const sentence = flat.match(/^(.{1,150}?[.!?])(?:\s|$)/)?.[1];
  return sentence ?? `${flat.slice(0, 147).trimEnd()}…`;
};

export function findingsFromPayloads(payloads: readonly ReadingPayload[]): ReviewFinding[] {
  const out: ReviewFinding[] = [];
  for (const payload of payloads) {
    const reading = payload.reading;
    if (reading.outcome !== 'reading') continue;
    for (const o of reading.observations) {
      const ids: string[] = [];
      for (const ref of o.evidenceRefs) {
        for (const id of sectionIdsOf(ref)) if (!ids.includes(id)) ids.push(id);
      }
      const assessed = payload.assessment.observations[o.key] ?? { state: 'unmeasured' as const };
      out.push({
        id: `${reading.id}:${o.key}`,
        readingId: reading.id,
        lens: o.lens,
        observation: o.observation,
        summary: oneLine(o.observation),
        sectionIds: ids,
        state: assessed.state,
      });
    }
  }
  return out;
}

/**
 * One explicit member gesture, seven governed readings over the exact chapter
 * range. Each commission remains its own immutable reading; this function only
 * groups their ids for the experience. A failed lens is reported and the other
 * lenses still run — partial is never mislabeled complete.
 */
export async function runChapterReview(
  manuscriptId: string,
  chapterSections: readonly RebuildSection[],
  onProgress?: (done: number, total: number, lens: DevelopmentalLens) => void,
): Promise<ChapterReviewBundle> {
  const first = chapterSections[0];
  const last = chapterSections[chapterSections.length - 1];
  if (!first || !last) return { readingIds: [], payloads: [], findings: [], failures: [] };

  const payloads: ReadingPayload[] = [];
  const readingIds: string[] = [];
  const failures: ReviewFailure[] = [];
  const scope = {
    kind: 'range' as const,
    fromSectionId: first.draftSectionId,
    toSectionId: last.draftSectionId,
  };

  for (let i = 0; i < LENS_ORDER.length; i += 1) {
    const lens = LENS_ORDER[i]!;
    onProgress?.(i, LENS_ORDER.length, lens);
    const commissioned = await requestDevelopmentalReading(manuscriptId, lens, scope);
    if (!commissioned.ok) {
      failures.push({ lens, refusal: commissioned.refusal, stage: commissioned.stage });
      continue;
    }
    const fetched = await fetchReading(manuscriptId, commissioned.readingId);
    if (!fetched.ok) {
      failures.push({ lens, refusal: fetched.refusal, stage: 'fetch' });
      continue;
    }
    readingIds.push(commissioned.readingId);
    payloads.push(fetched.payload);
  }
  onProgress?.(LENS_ORDER.length, LENS_ORDER.length, LENS_ORDER[LENS_ORDER.length - 1]!);
  return { readingIds, payloads, findings: findingsFromPayloads(payloads), failures };
}

export function findingsForSection(
  findings: readonly ReviewFinding[], draftSectionId: string,
): ReviewFinding[] {
  return findings.filter((f) => f.sectionIds.includes(draftSectionId));
}

export function lensCounts(findings: readonly ReviewFinding[]): Partial<Record<DevelopmentalLens, number>> {
  const counts: Partial<Record<DevelopmentalLens, number>> = {};
  for (const f of findings) counts[f.lens] = (counts[f.lens] ?? 0) + 1;
  return counts;
}
