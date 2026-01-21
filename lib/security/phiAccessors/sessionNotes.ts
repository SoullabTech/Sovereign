/**
 * PHI ACCESSOR: case_notes (session notes)
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Provides PHI-aware read/write helpers for case_notes.content
 * - On WRITE: writes both plaintext AND encrypted columns
 * - On READ: reads plaintext (Stage A), verifies encrypted in background
 *
 * After backfill complete and Stage A verified:
 * - Stage B: reads prefer encrypted, fallback to plaintext
 * - Stage C: reads encrypted only, NULL plaintext
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

import { query } from '@/lib/db/postgres';
import {
  encryptForDB,
  decryptFromDB,
  stripEncryptedColumns,
  PHIContext,
  PHIEncryptionMeta,
} from '@/lib/security/phiEncryption';

// ============================================================================
// TYPES
// ============================================================================

interface SessionNotePHIContext {
  rowId: string;
  practitionerId: string;
}

interface EncryptedContentResult {
  content_enc: string;
  content_enc_meta: string; // JSON stringified
}

// ============================================================================
// ENCRYPTION HELPERS
// ============================================================================

/**
 * Build PHI context for case_notes.content
 */
function buildContext(ctx: SessionNotePHIContext): PHIContext {
  return {
    table: 'case_notes',
    column: 'content',
    rowId: ctx.rowId,
    ownerId: ctx.practitionerId,
  };
}

/**
 * Encrypt note content for database storage
 * Returns encrypted columns ready for INSERT/UPDATE
 */
export function encryptNoteContent(
  content: string,
  ctx: SessionNotePHIContext
): EncryptedContentResult {
  const phiContext = buildContext(ctx);
  const { ciphertext, meta } = encryptForDB(content, phiContext);

  return {
    content_enc: ciphertext,
    content_enc_meta: JSON.stringify(meta),
  };
}

/**
 * Decrypt note content from database
 */
export function decryptNoteContent(
  contentEnc: string,
  contentEncMeta: PHIEncryptionMeta | string,
  ctx: SessionNotePHIContext
): string {
  const phiContext = buildContext(ctx);
  const meta = typeof contentEncMeta === 'string' ? JSON.parse(contentEncMeta) : contentEncMeta;
  return decryptFromDB(contentEnc, meta, phiContext);
}

// ============================================================================
// STAGE A: DUAL-WRITE HELPERS
// ============================================================================

/**
 * Get encrypted column values for INSERT
 *
 * Usage in INSERT:
 * ```
 * const enc = getEncryptedColumnsForInsert(content, { rowId, practitionerId });
 * INSERT INTO case_notes (..., content, content_enc, content_enc_meta)
 * VALUES (..., $x, $y, $z)
 * ```
 */
export function getEncryptedColumnsForInsert(
  content: string,
  ctx: SessionNotePHIContext
): { contentEnc: string; contentEncMeta: string } {
  const { content_enc, content_enc_meta } = encryptNoteContent(content, ctx);
  return {
    contentEnc: content_enc,
    contentEncMeta: content_enc_meta,
  };
}

/**
 * Verify encrypted content decrypts correctly
 * Called after INSERT to verify dual-write worked
 *
 * @returns true if verification passed, false if mismatch
 */
export async function verifyEncryptedContent(
  noteId: string,
  practitionerId: string,
  expectedPlaintext: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT content_enc, content_enc_meta FROM case_notes WHERE id = $1`,
      [noteId]
    );

    if (!result.rows[0]?.content_enc) {
      // No encrypted column yet (pre-migration)
      return true;
    }

    const { content_enc, content_enc_meta } = result.rows[0];
    const decrypted = decryptNoteContent(content_enc, content_enc_meta, {
      rowId: noteId,
      practitionerId,
    });

    return decrypted === expectedPlaintext;
  } catch (error) {
    console.error('[PHI] Verification failed for note:', noteId, error);
    return false;
  }
}

// ============================================================================
// STAGE B: ENCRYPTED-PREFER READ
// ============================================================================

/**
 * Read note content, preferring encrypted if available
 *
 * Stage A: Returns plaintext, verifies encrypted in background
 * Stage B: Returns decrypted, falls back to plaintext
 * Stage C: Returns decrypted only
 */
export async function readNoteContent(
  row: {
    id: string;
    practitioner_id: string;
    content: string | null;
    content_enc?: string | null;
    content_enc_meta?: PHIEncryptionMeta | string | null;
  },
  options: { verifyInBackground?: boolean } = {}
): Promise<string> {
  const { verifyInBackground = true } = options;

  // Stage A: Return plaintext
  const plaintext = row.content || '';

  // Background verification (non-blocking)
  if (verifyInBackground && row.content_enc && row.content_enc_meta) {
    setImmediate(async () => {
      try {
        const decrypted = decryptNoteContent(row.content_enc!, row.content_enc_meta!, {
          rowId: row.id,
          practitionerId: row.practitioner_id,
        });
        if (decrypted !== plaintext) {
          console.error('[PHI] Decrypt mismatch for note:', row.id);
        }
      } catch (err) {
        console.error('[PHI] Background verify failed:', row.id, err);
      }
    });
  }

  return plaintext;
}

/**
 * Read note content - Stage B version (prefer encrypted)
 * Enable this after backfill complete
 */
export async function readNoteContentPreferEncrypted(
  row: {
    id: string;
    practitioner_id: string;
    content: string | null;
    content_enc?: string | null;
    content_enc_meta?: PHIEncryptionMeta | string | null;
  }
): Promise<string> {
  // If encrypted column exists, use it
  if (row.content_enc && row.content_enc_meta) {
    try {
      return decryptNoteContent(row.content_enc, row.content_enc_meta, {
        rowId: row.id,
        practitionerId: row.practitioner_id,
      });
    } catch (err) {
      console.error('[PHI] Decrypt failed, falling back to plaintext:', row.id, err);
    }
  }

  // Fallback to plaintext
  return row.content || '';
}

// ============================================================================
// STAGE B: ROW DECRYPTION
// ============================================================================

interface NoteRowContext {
  rowId: string;
  practitionerId: string;
}

/**
 * Decrypt note row, preferring encrypted content if available
 *
 * Stage B: Returns decrypted content from _enc, falls back to plaintext
 */
export function decryptNoteRow<T extends Record<string, any>>(
  row: T,
  ctx: NoteRowContext,
  options: { preferEncrypted?: boolean } = {}
): T {
  const { preferEncrypted = false } = options;
  if (!preferEncrypted) return row;

  const result = { ...row };

  // Only process if encrypted columns exist
  if (row.content_enc && row.content_enc_meta) {
    try {
      const decrypted = decryptNoteContent(row.content_enc, row.content_enc_meta, {
        rowId: ctx.rowId,
        practitionerId: ctx.practitionerId,
      });
      (result as any).content = decrypted;
    } catch (err) {
      console.error('[PHI] Decrypt failed for case_notes.content, using plaintext:', ctx.rowId, err);
      // Keep plaintext fallback
    }
  }

  return result;
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * SECURITY: Sanitize note row before returning from data layer
 * Strips *_enc columns to prevent encrypted blobs from leaking.
 *
 * Call this on every row before returning from CaseStore functions.
 */
export function sanitizeNoteRow<T>(row: T): T {
  return stripEncryptedColumns(row);
}

/**
 * SECURITY: Sanitize array of note rows
 */
export function sanitizeNoteRows<T>(rows: T[]): T[] {
  return rows.map(sanitizeNoteRow);
}

