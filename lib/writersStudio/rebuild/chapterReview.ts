import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingPayload } from '@/lib/writersStudio/developClient';
import { fetchReading, requestDevelopmentalReading } from '@/lib/writersStudio/developClient';
import { LENS_ORDER } from '@/lib/writersStudio/developPresentation';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import type { EvidenceRef } from '@/lib/manuscript/development/evidenceRef';
import type { RebuildSection } from './model';
import type { ChapterReviewManifest } from './chapterReviewManifest';

export interface ReviewFailure {
  lens: DevelopmentalLens;
  refusal: string;
  stage: string | null;
  /** ⭐ Why the sequence stopped here, when it did. */
  attribution?: string;
}

export interface ReviewFinding {
  id: string;
  readingId: string;
  lens: DevelopmentalLens;
  observation: string;
  summary: string;
  sectionIds: string[];
  /** Frozen evidence, preserved verbatim so passage precision is not discarded. */
  evidenceRefs: readonly EvidenceRef[];
  state: 'current' | 'superseded' | 'unmeasured';
}

export interface ChapterReviewBundle {
  readingIds: string[];
  payloads: ReadingPayload[];
  findings: ReviewFinding[];
  failures: ReviewFailure[];
  /**
   * ⭐⭐ THE LENSES NEVER ATTEMPTED, because the sequence stopped.
   *
   * ⛔ Empty when every lens was attempted. Non-empty is NOT a failure list:
   * these readings were not refused, they were not asked for — and the
   * difference matters, because *not attempted* is resumable by a new member
   * gesture where *refused* is not.
   */
  remaining: DevelopmentalLens[];
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
        evidenceRefs: o.evidenceRefs,
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
  onPartial?: (bundle: ChapterReviewBundle, settledLens: DevelopmentalLens) => void,
  /**
   * ⭐ The lenses this gesture commissions. ⛔ Resuming is a NEW member act over
   * the lenses that were never asked — it is not a retry of a reading that
   * refused, and nothing here may re-commission one.
   */
  lenses: readonly DevelopmentalLens[] = LENS_ORDER,
): Promise<ChapterReviewBundle> {
  const first = chapterSections[0];
  const last = chapterSections[chapterSections.length - 1];
  if (!first || !last) return { readingIds: [], payloads: [], findings: [], failures: [], remaining: [] };

  const payloads: ReadingPayload[] = [];
  const readingIds: string[] = [];
  const failures: ReviewFailure[] = [];
  const scope = {
    kind: 'range' as const,
    fromSectionId: first.draftSectionId,
    toSectionId: last.draftSectionId,
  };
  let remaining: DevelopmentalLens[] = [];
  const snapshot = (): ChapterReviewBundle => ({
    readingIds: [...readingIds], payloads: [...payloads],
    findings: findingsFromPayloads(payloads), failures: [...failures],
    remaining: [...remaining],
  });

  /* ⭐⭐ WHEN ONE READING FAILS UPSTREAM, THE NEXT THREE ARE NOT A PLAN.
     The loop used to `continue` through every remaining lens after the first
     upstream failure, so a writer watched the system grind through calls that
     were already doomed and then reported three separate failures for one
     cause.
     ⛔ NOT A RETRY, and this is the line that matters: one commission, one
     reading (INV-18/19). Stopping preserves what completed and leaves the rest
     UNASKED, so resuming is a NEW member gesture and never a hidden second
     attempt at a reading that already refused.
     ⚠️ A lawful contract refusal is lens-specific and predicts nothing about
     the next lens, so it does NOT stop the sequence. Only trouble that is
     plainly not about this lens does. */
  const upstream = (f: { refusal: string; stage: string | null; attribution?: string }) =>
    f.refusal === 'unreachable'
    || f.refusal.startsWith('http_5')
    || f.attribution === 'system'
    || (f.attribution !== 'contract_violation' && f.stage === 'read');

  for (let i = 0; i < lenses.length; i += 1) {
    const lens = lenses[i]!;
    onProgress?.(i, lenses.length, lens);
    const commissioned = await requestDevelopmentalReading(manuscriptId, lens, scope);
    if (!commissioned.ok) {
      const failure: ReviewFailure = {
        lens, refusal: commissioned.refusal, stage: commissioned.stage,
        ...(commissioned.attribution ? { attribution: commissioned.attribution } : {}),
      };
      failures.push(failure);
      if (upstream(failure)) {
        remaining = lenses.slice(i + 1);
        onPartial?.(snapshot(), lens);
        break;
      }
      onPartial?.(snapshot(), lens);
      continue;
    }
    const fetched = await fetchReading(manuscriptId, commissioned.readingId);
    if (!fetched.ok) {
      failures.push({ lens, refusal: fetched.refusal, stage: 'fetch' });
      onPartial?.(snapshot(), lens);
      continue;
    }
    readingIds.push(commissioned.readingId);
    payloads.push(fetched.payload);
    onPartial?.(snapshot(), lens);
  }
  onProgress?.(LENS_ORDER.length, LENS_ORDER.length, LENS_ORDER[LENS_ORDER.length - 1]!);
  return snapshot();
}

export type RehydrateChapterReviewOutcome =
  | { ok: true; bundle: ChapterReviewBundle }
  | { ok: false; refusal: string };

/** Rebuild one explicit Chapter Review from the exact reading ids its manifest kept. */
export async function rehydrateChapterReview(
  manuscriptId: string,
  manifest: ChapterReviewManifest,
): Promise<RehydrateChapterReviewOutcome> {
  const payloads: ReadingPayload[] = [];
  for (const readingId of manifest.readingIds) {
    const fetched = await fetchReading(manuscriptId, readingId);
    if (!fetched.ok) return { ok: false, refusal: fetched.refusal };
    payloads.push(fetched.payload);
  }
  return {
    ok: true,
    bundle: {
      readingIds: [...manifest.readingIds],
      payloads,
      findings: findingsFromPayloads(payloads),
      failures: [...manifest.failures],
    },
  };
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
