/**
 * WRITERS-STUDIO-C11R2 — one explicit whole-work eight-lens commission.
 *
 * Each lens remains one independent frozen developmental reading.
 * This helper groups the results for synthesis; it does not interpret them.
 */
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingPayload, ReadingSummary } from '@/lib/writersStudio/developClient';
import {
  fetchReading,
  fetchReadingSummaries,
  requestDevelopmentalReading,
} from '@/lib/writersStudio/developClient';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { findingsFromPayloads, type ReviewFailure, type ReviewFinding } from '@/lib/writersStudio/rebuild/chapterReview';

export interface WholeManuscriptReviewBundle {
  readingIds: string[];
  payloads: ReadingPayload[];
  findings: ReviewFinding[];
  failures: ReviewFailure[];
  remaining: DevelopmentalLens[];
}

export interface WholeManuscriptResume {
  revisionNumber: number;
  sectionIds: readonly string[];
}

const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

async function exactFrozenFor(
  manuscriptId: string,
  lens: DevelopmentalLens,
  summaries: readonly ReadingSummary[],
  resume: WholeManuscriptResume,
): Promise<ReadingPayload | null> {
  const candidates = summaries.filter((summary) => summary.commissionedLens === lens);
  for (const summary of candidates) {
    const fetched = await fetchReading(manuscriptId, summary.id);
    if (!fetched.ok) continue;
    const reading = fetched.payload.reading;
    if (reading.readState.revisionNumber !== resume.revisionNumber) continue;
    if (!same(reading.scope.bodyScope, resume.sectionIds)) continue;
    return fetched.payload;
  }
  return null;
}

const upstream = (f: ReviewFailure) =>
  f.refusal === 'unreachable'
  || f.refusal.startsWith('http_5')
  || f.attribution === 'system'
  || (f.attribution !== 'contract_violation' && f.stage === 'read');
export async function runWholeManuscriptReview(
  manuscriptId: string,
  onProgress?: (done: number, total: number, lens: DevelopmentalLens) => void,
  resume?: WholeManuscriptResume,
): Promise<WholeManuscriptReviewBundle> {
  const payloads: ReadingPayload[] = [];
  const readingIds: string[] = [];
  const failures: ReviewFailure[] = [];
  let remaining: DevelopmentalLens[] = [];
  const listed = resume ? await fetchReadingSummaries(manuscriptId) : null;
  const summaries = listed?.ok ? listed.readings : [];

  for (let i = 0; i < LENS_ORDER.length; i += 1) {
    const lens = LENS_ORDER[i]!;
    onProgress?.(i, LENS_ORDER.length, lens);

    if (resume && summaries.length > 0) {
      const frozen = await exactFrozenFor(manuscriptId, lens, summaries, resume);
      if (frozen) {
        readingIds.push(frozen.reading.id);
        payloads.push(frozen);
        continue;
      }
    }

    const commissioned = await requestDevelopmentalReading(
      manuscriptId,
      lens,
      { kind: 'whole' },
    );
    if (!commissioned.ok) {
      const failure: ReviewFailure = {
        lens,
        refusal: commissioned.refusal,
        stage: commissioned.stage,
        ...(commissioned.attribution ? { attribution: commissioned.attribution } : {}),
      };
      failures.push(failure);
      if (upstream(failure)) {
        remaining = LENS_ORDER.slice(i + 1);
        break;
      }
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
  return {
    readingIds,
    payloads,
    findings: findingsFromPayloads(payloads),
    failures,
    remaining,
  };
}

export function wholeReviewComplete(bundle: WholeManuscriptReviewBundle): boolean {
  return bundle.readingIds.length === LENS_ORDER.length
    && bundle.failures.length === 0
    && bundle.remaining.length === 0;
}
