/**
 * PHI ACCESSOR: client_messages
 *
 * HIPAA Sprint 7 Phase 2A - Stage A (Dual-Write)
 *
 * Provides PHI-aware read/write helpers for client_messages.body
 * - On WRITE: writes both plaintext AND encrypted columns
 * - On READ: reads plaintext (Stage A), verifies encrypted in background
 *
 * After backfill complete and Stage A verified:
 * - Stage B: reads prefer encrypted, fallback to plaintext
 * - Stage C: reads encrypted only, NULL plaintext
 */

import { query } from '@/lib/db/postgres';
import {
  encryptForDB,
  decryptFromDB,
  PHIContext,
  PHIEncryptionMeta,
} from '@/lib/security/phiEncryption';

// ============================================================================
// TYPES
// ============================================================================

interface ClientMessagePHIContext {
  rowId: string;
  practitionerId: string;
}

interface EncryptedBodyResult {
  body_enc: string;
  body_enc_meta: string; // JSON stringified
}

// ============================================================================
// ENCRYPTION HELPERS
// ============================================================================

/**
 * Build PHI context for client_messages.body
 */
function buildContext(ctx: ClientMessagePHIContext): PHIContext {
  return {
    table: 'client_messages',
    column: 'body',
    rowId: ctx.rowId,
    ownerId: ctx.practitionerId,
  };
}

/**
 * Encrypt message body for database storage
 * Returns encrypted columns ready for INSERT/UPDATE
 */
export function encryptMessageBody(
  body: string,
  ctx: ClientMessagePHIContext
): EncryptedBodyResult {
  const phiContext = buildContext(ctx);
  const { ciphertext, meta } = encryptForDB(body, phiContext);

  return {
    body_enc: ciphertext,
    body_enc_meta: JSON.stringify(meta),
  };
}

/**
 * Decrypt message body from database
 */
export function decryptMessageBody(
  bodyEnc: string,
  bodyEncMeta: PHIEncryptionMeta | string,
  ctx: ClientMessagePHIContext
): string {
  const phiContext = buildContext(ctx);
  const meta = typeof bodyEncMeta === 'string' ? JSON.parse(bodyEncMeta) : bodyEncMeta;
  return decryptFromDB(bodyEnc, meta, phiContext);
}

// ============================================================================
// STAGE A: DUAL-WRITE HELPERS
// ============================================================================

/**
 * Get encrypted column values for INSERT
 *
 * Usage in INSERT:
 * ```
 * const enc = getEncryptedColumnsForInsert(body, { rowId, practitionerId });
 * INSERT INTO client_messages (..., body, body_enc, body_enc_meta)
 * VALUES (..., $x, $y, $z)
 * ```
 */
export function getEncryptedColumnsForInsert(
  body: string,
  ctx: ClientMessagePHIContext
): { bodyEnc: string; bodyEncMeta: string } {
  const { body_enc, body_enc_meta } = encryptMessageBody(body, ctx);
  return {
    bodyEnc: body_enc,
    bodyEncMeta: body_enc_meta,
  };
}

/**
 * Verify encrypted body decrypts correctly
 * Called after INSERT to verify dual-write worked
 *
 * @returns true if verification passed, false if mismatch
 */
export async function verifyEncryptedBody(
  messageId: string,
  practitionerId: string,
  expectedPlaintext: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT body_enc, body_enc_meta FROM client_messages WHERE id = $1`,
      [messageId]
    );

    if (!result.rows[0]?.body_enc) {
      // No encrypted column yet (pre-migration)
      return true;
    }

    const { body_enc, body_enc_meta } = result.rows[0];
    const decrypted = decryptMessageBody(body_enc, body_enc_meta, {
      rowId: messageId,
      practitionerId,
    });

    return decrypted === expectedPlaintext;
  } catch (error) {
    console.error('[PHI] Verification failed for message:', messageId, error);
    return false;
  }
}

// ============================================================================
// STAGE B: ENCRYPTED-PREFER READ (Future)
// ============================================================================

/**
 * Read message body, preferring encrypted if available
 *
 * Stage A: Returns plaintext, verifies encrypted in background
 * Stage B: Returns decrypted, falls back to plaintext
 * Stage C: Returns decrypted only
 */
export async function readMessageBody(
  row: {
    id: string;
    practitioner_id: string;
    body: string | null;
    body_enc?: string | null;
    body_enc_meta?: PHIEncryptionMeta | string | null;
  },
  options: { verifyInBackground?: boolean } = {}
): Promise<string> {
  const { verifyInBackground = true } = options;

  // Stage A: Return plaintext
  const plaintext = row.body || '';

  // Background verification (non-blocking)
  if (verifyInBackground && row.body_enc && row.body_enc_meta) {
    setImmediate(async () => {
      try {
        const decrypted = decryptMessageBody(row.body_enc!, row.body_enc_meta!, {
          rowId: row.id,
          practitionerId: row.practitioner_id,
        });
        if (decrypted !== plaintext) {
          console.error('[PHI] Decrypt mismatch for message:', row.id);
        }
      } catch (err) {
        console.error('[PHI] Background verify failed:', row.id, err);
      }
    });
  }

  return plaintext;
}

/**
 * Read message body - Stage B version (prefer encrypted)
 * Enable this after backfill complete
 */
export async function readMessageBodyPreferEncrypted(
  row: {
    id: string;
    practitioner_id: string;
    body: string | null;
    body_enc?: string | null;
    body_enc_meta?: PHIEncryptionMeta | string | null;
  }
): Promise<string> {
  // If encrypted column exists, use it
  if (row.body_enc && row.body_enc_meta) {
    try {
      return decryptMessageBody(row.body_enc, row.body_enc_meta, {
        rowId: row.id,
        practitionerId: row.practitioner_id,
      });
    } catch (err) {
      console.error('[PHI] Decrypt failed, falling back to plaintext:', row.id, err);
    }
  }

  // Fallback to plaintext
  return row.body || '';
}

