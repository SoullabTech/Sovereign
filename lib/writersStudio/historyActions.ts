import type { SectionWriting } from './useSectionWriting';
import {
  checkpointServerDraft, restoreRevision, newIdempotencyKey,
  type Http, type RevisionSummary,
} from '@/app/press/manuscript/workingDraftClient';

export type HistoryWriting = Pick<SectionWriting,
  'sections' | 'statusOf' | 'flushPending' | 'hasUnsavedWork' | 'currentRevisionId' | 'acknowledgeCheckpoint'>;
export class HistoryActionRefused extends Error {}

/** Wait for this writer's acknowledged saves; never adopt a newer unseen server base. */
export async function settleHistoryWriting(writing: HistoryWriting, timeoutMs = 5000): Promise<void> {
  const blocked = () => writing.sections.some(s => ['conflict', 'error'].includes(writing.statusOf(s.id)));
  if (blocked()) throw new HistoryActionRefused('Your writing needs attention before a version can be kept or restored.');
  writing.flushPending();
  const deadline = Date.now() + timeoutMs;
  while (writing.hasUnsavedWork()) {
    if (blocked() || Date.now() >= deadline) throw new HistoryActionRefused('Your latest words are still saving. No history action was sent.');
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  if (blocked()) throw new HistoryActionRefused('Your writing needs attention before continuing.');
}

/** Existing bodyless checkpoint service, with the exact queue base and a new explicit gesture. */
export async function keepHistoryVersion(http: Http, manuscriptId: string, writing: HistoryWriting) {
  await settleHistoryWriting(writing);
  const baseRevisionId = writing.currentRevisionId();
  const result = await checkpointServerDraft(http, manuscriptId, {baseRevisionId, idempotencyKey: newIdempotencyKey()});
  if (result.kind !== 'ok' || result.revisionId !== baseRevisionId + 1) {
    throw new HistoryActionRefused(result.kind === 'conflict'
      ? 'The manuscript changed after this view was opened. Save any local drafts, then reopen the writing before trying again.'
      : 'The version could not be confirmed. Your local writing is retained; no automatic retry was made.');
  }
  // A checkpoint changes only revision metadata, not manuscript or editorial text.
  const acknowledged = writing.acknowledgeCheckpoint?.(baseRevisionId, result.revisionId) ?? false;
  return {...result, acknowledged};
}

/** Displaced words are checkpointed BEFORE a guarded restore; older history is never rewritten. */
export async function restoreHistoryVersion(
  http: Http, manuscriptId: string, writing: HistoryWriting, revision: RevisionSummary,
  blockedReason: () => string | null,
) {
  if (!revision.restorable || !Number.isInteger(revision.revisionNumber) || revision.revisionNumber < 1) {
    throw new HistoryActionRefused('This version has no restorable section record. No structure was guessed.');
  }
  const reason = blockedReason();
  if (reason) throw new HistoryActionRefused(reason);
  await settleHistoryWriting(writing);
  const changedReason = blockedReason();
  if (changedReason) throw new HistoryActionRefused(changedReason);
  const kept = await keepHistoryVersion(http, manuscriptId, writing);
  if (writing.hasUnsavedWork() || blockedReason()) {
    throw new HistoryActionRefused('Your current writing was kept, but new local work appeared. Restore was not sent.');
  }
  const restored = await restoreRevision(http, manuscriptId, revision.revisionNumber, {
    baseRevisionId: kept.revisionId!, idempotencyKey: newIdempotencyKey(),
  });
  if (restored.kind !== 'ok' || restored.revisionId !== kept.revisionId! + 1) throw new HistoryActionRefused(restored.kind === 'conflict'
    ? 'The manuscript moved while restoring. Your current version was kept; the newer writing was not overwritten.'
    : 'The restore could not be confirmed. Your pre-restore version is kept. No automatic retry was made.');
  return restored;
}
