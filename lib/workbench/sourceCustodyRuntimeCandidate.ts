/** SOURCE-CUSTODY-RUNTIME-01: server-side adapters for candidate ingestion.
 * This module is intentionally NOT referenced by source POST/PATCH, which
 * remain HTTP 423 until the old-version fence and migration review pass.
 */
import { query, transaction } from '@/lib/db/postgres';
import type { TransactionClient } from '@/lib/db/postgres';
import { extFromName, workbenchUploadRoot } from './storage';
import {
  beginSourceCustody, stageSourceCustodyFile, publishStagedSource,
  reconcileSourceCustody, type SourceCustodyIntent,
} from './sourceCustodyFiles';
import {
  reserveSourceCustody, markSourceCustodyWriting, markSourceCustodyCommitted,
  SourceCustodyReservationRefused,
} from './sourceCustodyReservations';
import { extractText } from './extract/text';
import { extractDocx } from './extract/docx';
import { extractPdf } from './extract/pdf';
import { ocrImage, ocrPdf } from './ocr';
import { handwritingOcrEnabled, MANUAL_TRANSCRIPTION_MESSAGE } from './intake';
import type { CandidateCommit, CandidateCustodyPorts, CandidateDbOutcome, CandidateExtraction } from './sourceCustodyIngestCandidate';
import type { WorkbenchSourceKind } from './intake';

export async function extractStagedSource(
  stagedPath: string, kind: WorkbenchSourceKind, ext: string,
): Promise<CandidateExtraction> {
  const cleanError = (): CandidateExtraction => ({
    kind, status: 'error', text: null, errorMessage: MANUAL_TRANSCRIPTION_MESSAGE,
  });
  if (kind === 'typed_text') return {
    kind, status: 'reviewed', text: await extractText(stagedPath), errorMessage: null,
  };
  if (kind === 'typed_doc' && ext === 'docx') return {
    kind, status: 'reviewed', text: await extractDocx(stagedPath), errorMessage: null,
  };
  if (kind === 'typed_doc' && ext === 'pdf') {
    const found = await extractPdf(stagedPath);
    if (found.likelyScanned) {
      if (!handwritingOcrEnabled()) return {
        ...cleanError(), kind: 'scanned_pdf',
      };
      return {kind:'scanned_pdf', status:'draft', text: await ocrPdf(stagedPath), errorMessage:null};
    }
    return {kind:'typed_doc',status:'draft',text:found.text,errorMessage:null};
  }
  if (kind === 'handwritten_image') {
    if (!handwritingOcrEnabled()) return cleanError();
    return {kind,status:'draft',text:await ocrImage(stagedPath),errorMessage:null};
  }
  return cleanError();
}

/** Final row and custody terminal state are committed together on one client. */
export async function finalizeCommittedSource(value: CandidateCommit): Promise<void> {
  const {intent, extraction} = value;
  await transaction(async client => {
    await client.query(
      `INSERT INTO workbench_uploads
         (id,arranger_id,original_name,mime_type,size_bytes,storage_path,
          source_kind,transcription_status,transcription_draft,transcription_reviewed,error_message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [intent.uploadId,intent.memberId,value.originalName,value.mimeType,value.sizeBytes,
       value.storagePath,extraction.kind,extraction.status,
       extraction.status==='draft'?extraction.text:null,
       extraction.status==='reviewed'?extraction.text:null,
       extraction.errorMessage],
    );
    await markSourceCustodyCommitted(client, intent);
  });
}

export async function readSourceCustodyDbOutcome(intent: SourceCustodyIntent): Promise<CandidateDbOutcome> {
  const row = await query<{ state: string }>(
    `SELECT state FROM workbench_source_custody_ops
      WHERE operation_id=$1 AND arranger_id=$2 AND upload_id=$3`,
    [intent.operationId,intent.memberId,intent.uploadId],
  );
  if (!row.rows[0]) return 'missing';
  if (row.rows[0].state === 'committed') return 'committed';
  if (row.rows[0].state === 'aborted') return 'aborted';
  if (['reserved','writing','recovering'].includes(row.rows[0].state)) return 'pending';
  throw new SourceCustodyReservationRefused();
}

/** Retryable same-writer failure path. NOT an unattended crash janitor:
 * caller must have definitively stopped all writes for this operation.
 * Lock the operation row across fsync cleanup, then set DB aborted ONLY after
 * the canonical and staged bytes are proved absent. The row remains pending
 * if cleanup fails. This is distinct from OCR errors, which retain originals.
 */
export async function recoverSourceCustodyFromSettledWriter(
  root: string, intent: SourceCustodyIntent,
): Promise<void> {
  await transaction(async client => {
    const locked = await client.query<{ state: string }>(
      `SELECT state FROM workbench_source_custody_ops
        WHERE operation_id=$1 AND arranger_id=$2 AND upload_id=$3
        FOR UPDATE NOWAIT`,
      [intent.operationId,intent.memberId,intent.uploadId],
    );
    const state = locked.rows[0]?.state;
    if (!state) throw new SourceCustodyReservationRefused();
    if (state === 'committed') throw new SourceCustodyReservationRefused();
    if (state === 'aborted') return;
    if (!['reserved','writing','recovering'].includes(state)) throw new SourceCustodyReservationRefused();
    if (state !== 'recovering') {
      await client.query(
        `UPDATE workbench_source_custody_ops SET state='recovering'
         WHERE operation_id=$1 AND state IN ('reserved','writing')`,
        [intent.operationId],
      );
    }
    await reconcileSourceCustody(root, intent, 'aborted');
    const done = await client.query<{ operation_id: string }>(
      `UPDATE workbench_source_custody_ops SET state='aborted'
        WHERE operation_id=$1 AND arranger_id=$2 AND upload_id=$3
          AND state='recovering' RETURNING operation_id`,
      [intent.operationId,intent.memberId,intent.uploadId],
    );
    if (!done.rows[0]) throw new SourceCustodyReservationRefused();
  });
}

export const sourceCustodyCandidatePorts: CandidateCustodyPorts = {
  reserve: reserveSourceCustody,
  begin: beginSourceCustody,
  stage: stageSourceCustodyFile,
  markWriting: async intent => transaction((client: TransactionClient) => markSourceCustodyWriting(client,intent)),
  extract: extractStagedSource,
  publish: publishStagedSource,
  commit: finalizeCommittedSource,
  dbOutcome: readSourceCustodyDbOutcome,
  reconcileCommitted: async(root,intent) => { await reconcileSourceCustody(root,intent,'committed'); },
  reconcileFailedWriter: recoverSourceCustodyFromSettledWriter,
};

/** Return the same configured filesystem root as legacy Workbench, but the
 * candidate stays unmounted behind the existing immutable HTTP 423 hold. */
export function sourceCustodyCandidateRoot(): string {
  return workbenchUploadRoot();
}

/** Exposed to explicit test drivers to confirm the candidate uses the same
 * legacy extension normalization; not an independent permissions surface. */
export function sourceCustodyCandidateExtension(filename: string): string {
  return extFromName(filename);
}
