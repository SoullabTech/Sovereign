/** Shared sovereign intake for material arriving from outside Writer's Studio. */

import { query } from '@/lib/db/postgres';
import { extFromName, originalPath, writeDraft, writeOriginal, writeReviewed } from './storage';
import { extractText } from './extract/text';
import { extractDocx } from './extract/docx';
import { extractPdf } from './extract/pdf';
import { ocrImage, ocrPdf } from './ocr';

export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
export const HANDWRITING_OCR_FLAG = 'WRITERS_STUDIO_HANDWRITING_OCR_ENABLED';
export const MANUAL_TRANSCRIPTION_MESSAGE =
  'Automatic handwriting transcription is still being tested. The original is preserved for manual transcription.';
export type WorkbenchSourceKind = 'typed_text' | 'typed_doc' | 'handwritten_image' | 'scanned_pdf';

export function handwritingOcrEnabled(): boolean {
  return process.env[HANDWRITING_OCR_FLAG] === '1';
}

export function classifyWorkbenchUpload(mime: string, ext: string): WorkbenchSourceKind | null {
  const e = ext.toLowerCase();
  const m = mime.toLowerCase();
  if (e === 'txt' || e === 'md' || m === 'text/plain' || m === 'text/markdown') return 'typed_text';
  if (e === 'docx' || m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'typed_doc';
  if (e === 'pdf' || m === 'application/pdf') return 'typed_doc';
  if (['jpg', 'jpeg', 'png', 'heic', 'heif', 'tif', 'tiff', 'webp'].includes(e) || m.startsWith('image/')) return 'handwritten_image';
  return null;
}

export async function ingestWorkbenchUpload(memberId: string, file: File) {
  if (file.size === 0) throw new IntakeError('Empty file', 400);
  if (file.size > MAX_SOURCE_BYTES) throw new IntakeError('File is larger than 50 MB', 413);
  const ext = extFromName(file.name);
  const initialKind = classifyWorkbenchUpload(file.type, ext);
  if (!initialKind) throw new IntakeError('Unsupported file type', 415);

  const inserted = await query<{ id: string }>(
    `INSERT INTO workbench_uploads
       (arranger_id, original_name, mime_type, size_bytes, storage_path, source_kind, transcription_status)
     VALUES ($1, $2, $3, $4, '', $5, 'extracting') RETURNING id`,
    [memberId, file.name, file.type || 'application/octet-stream', file.size, initialKind],
  );
  const id = inserted.rows[0].id;

  try {
    const relPath = await writeOriginal(memberId, id, ext, Buffer.from(await file.arrayBuffer()));
    /* The original is custody, not a temporary extraction input. Persist its
       address BEFORE transcription so a failed OCR can never erase the only
       faithful copy of what the writer brought. */
    await query(
      `UPDATE workbench_uploads SET storage_path = $1, updated_at = NOW()
        WHERE id = $2 AND arranger_id = $3`,
      [relPath, id, memberId],
    );
    const storedPath = originalPath(memberId, id, ext);
    const preserveForManualTranscription = async (sourceKind: 'handwritten_image' | 'scanned_pdf') => {
      await query(
        `UPDATE workbench_uploads
            SET source_kind = $1, transcription_status = 'error', error_message = $2, updated_at = NOW()
          WHERE id = $3 AND arranger_id = $4`,
        [sourceKind, MANUAL_TRANSCRIPTION_MESSAGE, id, memberId],
      );
      return {
        id,
        sourceKind,
        transcriptionStatus: 'error' as const,
        originalName: file.name,
      };
    };
    let sourceKind: WorkbenchSourceKind = initialKind;
    let status: 'draft' | 'reviewed' = 'reviewed';
    let text = '';

    if (initialKind === 'typed_text') {
      text = await extractText(storedPath);
    } else if (initialKind === 'typed_doc' && ext === 'docx') {
      text = await extractDocx(storedPath);
    } else if (initialKind === 'typed_doc' && ext === 'pdf') {
      const extracted = await extractPdf(storedPath);
      status = 'draft';
      if (extracted.likelyScanned) {
        sourceKind = 'scanned_pdf';
        if (!handwritingOcrEnabled()) return await preserveForManualTranscription(sourceKind);
        text = await ocrPdf(storedPath);
      } else {
        text = extracted.text;
      }
    } else if (initialKind === 'handwritten_image') {
      if (!handwritingOcrEnabled()) return await preserveForManualTranscription(initialKind);
      status = 'draft';
      text = await ocrImage(storedPath);
    }

    if (status === 'reviewed') await writeReviewed(memberId, id, text);
    else await writeDraft(memberId, id, text);

    await query(
      `UPDATE workbench_uploads
          SET storage_path = $1, source_kind = $2,
              transcription_draft = $3, transcription_reviewed = $4,
              transcription_status = $5, updated_at = NOW()
        WHERE id = $6 AND arranger_id = $7`,
      [relPath, sourceKind, status === 'draft' ? text : null, status === 'reviewed' ? text : null, status, id, memberId],
    );

    return { id, sourceKind, transcriptionStatus: status, originalName: file.name };
  } catch (error) {
    /* Never roll the original back because transcription failed. The truthful
       failed state is: source preserved, transcription unavailable. */
    await query(
      `UPDATE workbench_uploads SET transcription_status = 'error', error_message = $1, updated_at = NOW() WHERE id = $2 AND arranger_id = $3`,
      [error instanceof Error ? error.message : 'Extraction failed', id, memberId],
    ).catch(() => undefined);
    throw error;
  }
}

export class IntakeError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
