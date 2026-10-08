/**
 * SOURCE-CUSTODY-INTAKE-01 — integration candidate, deliberately NOT wired to
 * the HTTP source route while the old-writer fence and migration review remain
 * unadmitted. This defines the ordering contract across the file and DB
 * reservation adapters; all real writes still require independent approval.
 */
import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { MAX_SOURCE_BYTES, IntakeError, classifyWorkbenchUpload, type WorkbenchSourceKind } from './intake';
import { extFromName } from './storage';
import {
  sourceCustodyRelativeOriginal, stagedSourceFilePath,
  type SourceCustodyIntent,
} from './sourceCustodyFiles';

export type CandidateExtraction = Readonly<{
  kind: WorkbenchSourceKind;
  status: 'draft' | 'reviewed' | 'error';
  text: string | null;
  errorMessage: string | null;
}>;
export type CandidateSource = Readonly<{
  id: string;
  sourceKind: WorkbenchSourceKind;
  transcriptionStatus: 'draft' | 'reviewed' | 'error';
  originalName: string;
}>;
export type CandidateDbOutcome = 'committed' | 'pending' | 'aborted' | 'missing';

export type CandidateCommit = Readonly<{
  intent: SourceCustodyIntent;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  extraction: CandidateExtraction;
}>;

/** Every callback is a server-owned adapter; none is a browser-supplied grant. */
export interface CandidateCustodyPorts {
  reserve(request: NextRequest, memberId: string, intent: SourceCustodyIntent): Promise<void>;
  begin(root: string, intent: SourceCustodyIntent): Promise<void>;
  stage(root: string, intent: SourceCustodyIntent, name: string, data: Buffer): Promise<void>;
  markWriting(intent: SourceCustodyIntent): Promise<void>;
  extract(stagedOriginal: string, kind: WorkbenchSourceKind, ext: string): Promise<CandidateExtraction>;
  publish(root: string, intent: SourceCustodyIntent): Promise<void>;
  commit(value: CandidateCommit): Promise<void>;
  dbOutcome(intent: SourceCustodyIntent): Promise<CandidateDbOutcome>;
  reconcileCommitted(root: string, intent: SourceCustodyIntent): Promise<void>;
  /** Only the SAME settled writer may invoke this synchronous failure cleanup.
   * Automatic crash-recovery workers need separate worker-quiescence authority.
   */
  reconcileFailedWriter(root: string, intent: SourceCustodyIntent): Promise<void>;
}

const extractionFailure = (kind: WorkbenchSourceKind): CandidateExtraction => ({
  kind, status: 'error', text: null,
  errorMessage: 'Automatic extraction is unavailable. The original is preserved for review.',
});

/** Candidate does not bypass upload POST's unconditional 423 refusal. */
export async function ingestSourceWithCustodyCandidate(
  request: NextRequest,
  memberId: string,
  file: File,
  root: string,
  ports: CandidateCustodyPorts,
): Promise<CandidateSource> {
  if (file.size === 0) throw new IntakeError('Empty file', 400);
  if (file.size > MAX_SOURCE_BYTES) throw new IntakeError('File is larger than 50 MB', 413);
  const ext = extFromName(file.name);
  const kind = classifyWorkbenchUpload(file.type, ext);
  if (!kind) throw new IntakeError('Unsupported file type', 415);
  // Read untrusted input into volatile memory before durable reservation; no
  // content is staged on disk until the DB reservation is committed.
  const original = Buffer.from(await file.arrayBuffer());
  if (original.length !== file.size) throw new IntakeError('Incomplete file', 400);
  const intent: SourceCustodyIntent = Object.freeze({
    version: 1, memberId, uploadId: randomUUID(), operationId: randomUUID(),
  });
  const outcome: CandidateSource = {
    id: intent.uploadId, sourceKind: kind, transcriptionStatus: 'error', originalName: file.name,
  };
  let reserved = false;
  let prepared: CandidateExtraction | null = null;
  try {
    await ports.reserve(request, memberId, intent);
    reserved = true;
    await ports.begin(root, intent);
    await ports.stage(root, intent, `original.${ext}`, original);
    await ports.markWriting(intent);
    try {
      prepared = await ports.extract(stagedSourceFilePath(root, intent, `original.${ext}`), kind, ext);
    } catch {
      // Extraction failure does not revoke deliberate custody of the original.
      // The error intentionally contains no exception text or member content.
      prepared = extractionFailure(kind);
    }
    if (prepared.text !== null && prepared.status === 'reviewed') {
      await ports.stage(root, intent, 'reviewed.txt', Buffer.from(prepared.text, 'utf8'));
    } else if (prepared.text !== null && prepared.status === 'draft') {
      await ports.stage(root, intent, 'draft.txt', Buffer.from(prepared.text, 'utf8'));
    }
    await ports.publish(root, intent);
    const value: CandidateCommit = {
      intent, originalName: file.name, mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size, storagePath: sourceCustodyRelativeOriginal(intent, ext),
      extraction: prepared,
    };
    await ports.commit(value);
    // Database COMMIT is the authority; journal cleanup can be retried without
    // revoking the intentionally accepted original.
    try { await ports.reconcileCommitted(root, intent); } catch { /* leave journal for recovery */ }
    return { ...outcome, sourceKind: prepared.kind, transcriptionStatus: prepared.status };
  } catch (error) {
    if (reserved) {
      // A thrown COMMIT response is not proof that the transaction rolled back.
      // Read durable DB state before deciding whether bytes can be removed.
      let state: CandidateDbOutcome | 'unavailable' = 'unavailable';
      try { state = await ports.dbOutcome(intent); } catch { /* fail closed */ }
      if (state === 'committed') {
        try { await ports.reconcileCommitted(root, intent); } catch { /* deferred */ }
        // A final COMMIT may have succeeded even if its acknowledgment was lost.
        // Preserve accepted custody rather than deleting it or recommending a
        // duplicate retry.
        return { ...outcome, sourceKind: prepared?.kind ?? kind, transcriptionStatus: prepared?.status ?? 'error' };
      }
      if (state === 'pending') {
        try { await ports.reconcileFailedWriter(root, intent); }
        catch { /* pending reservation must keep Sanctuary transition blocked */ }
      }
      // missing, aborted and unavailable never entitle deletion from the caller.
    }
    throw error;
  }
}
