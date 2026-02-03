/**
 * PHI ACCESSOR: maia_consultations
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Provides PHI-aware read/write helpers for MAIA consultation fields:
 * - practitioner_query
 * - context_provided (JSONB)
 * - maia_response
 * - practitioner_feedback
 *
 * @see docs/security/free-text-phi-doctrine.md
 */

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

interface ConsultationPHIContext {
  rowId: string;
  practitionerId: string;
}

/**
 * Fields that can be encrypted in maia_consultations
 */
type EncryptableField = 'practitioner_query' | 'context_provided' | 'maia_response' | 'practitioner_feedback';

interface EncryptedFieldResult {
  ciphertext: string;
  meta: string; // JSON stringified
}

/**
 * Encrypted columns for INSERT/UPDATE
 */
export interface ConsultationEncryptedColumns {
  practitioner_query_enc?: string;
  practitioner_query_enc_meta?: string;
  context_provided_enc?: string;
  context_provided_enc_meta?: string;
  maia_response_enc?: string;
  maia_response_enc_meta?: string;
  practitioner_feedback_enc?: string;
  practitioner_feedback_enc_meta?: string;
}

/**
 * Input patch for create operations
 */
export interface ConsultationCreatePatch {
  practitioner_query: string;
  context_provided?: Record<string, unknown> | null;
  maia_response: string;
}

/**
 * Input patch for rate/feedback operations
 */
export interface ConsultationFeedbackPatch {
  practitioner_feedback?: string | null;
}

// ============================================================================
// ENCRYPTION HELPERS
// ============================================================================

/**
 * Build PHI context for a specific column
 */
function buildContext(field: EncryptableField, ctx: ConsultationPHIContext): PHIContext {
  return {
    table: 'maia_consultations',
    column: field,
    rowId: ctx.rowId,
    ownerId: ctx.practitionerId,
  };
}

/**
 * Encrypt a single field value (handles both string and JSONB)
 */
function encryptField(
  value: string | Record<string, unknown>,
  field: EncryptableField,
  ctx: ConsultationPHIContext
): EncryptedFieldResult {
  const phiContext = buildContext(field, ctx);
  // Stringify JSONB values for encryption
  const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
  const { ciphertext, meta } = encryptForDB(plaintext, phiContext);
  return {
    ciphertext,
    meta: JSON.stringify(meta),
  };
}

/**
 * Decrypt a single field value
 */
function decryptField(
  ciphertext: string,
  meta: PHIEncryptionMeta | string,
  field: EncryptableField,
  ctx: ConsultationPHIContext
): string {
  const phiContext = buildContext(field, ctx);
  const parsedMeta = typeof meta === 'string' ? JSON.parse(meta) : meta;
  return decryptFromDB(ciphertext, parsedMeta, phiContext);
}

// ============================================================================
// STAGE A: DUAL-WRITE HELPERS
// ============================================================================

/**
 * Get encrypted column values for INSERT (generate)
 *
 * Usage in INSERT:
 * ```
 * const enc = encryptConsultationCreate(patch, { rowId, practitionerId });
 * // Spread enc into your INSERT values
 * ```
 */
export function encryptConsultationCreate(
  patch: ConsultationCreatePatch,
  ctx: ConsultationPHIContext
): ConsultationEncryptedColumns {
  const encrypted: ConsultationEncryptedColumns = {};

  // practitioner_query is required
  const queryResult = encryptField(patch.practitioner_query, 'practitioner_query', ctx);
  encrypted.practitioner_query_enc = queryResult.ciphertext;
  encrypted.practitioner_query_enc_meta = queryResult.meta;

  // maia_response is required
  const responseResult = encryptField(patch.maia_response, 'maia_response', ctx);
  encrypted.maia_response_enc = responseResult.ciphertext;
  encrypted.maia_response_enc_meta = responseResult.meta;

  // context_provided is optional JSONB
  if (patch.context_provided) {
    const contextResult = encryptField(patch.context_provided, 'context_provided', ctx);
    encrypted.context_provided_enc = contextResult.ciphertext;
    encrypted.context_provided_enc_meta = contextResult.meta;
  }

  return encrypted;
}

/**
 * Get encrypted column values for UPDATE (rate/feedback)
 */
export function encryptConsultationFeedback(
  patch: ConsultationFeedbackPatch,
  ctx: ConsultationPHIContext
): ConsultationEncryptedColumns {
  const encrypted: ConsultationEncryptedColumns = {};

  if (patch.practitioner_feedback) {
    const feedbackResult = encryptField(patch.practitioner_feedback, 'practitioner_feedback', ctx);
    encrypted.practitioner_feedback_enc = feedbackResult.ciphertext;
    encrypted.practitioner_feedback_enc_meta = feedbackResult.meta;
  }

  return encrypted;
}

// ============================================================================
// STAGE B: ENCRYPTED-PREFER READ
// ============================================================================

/**
 * Decrypt consultation row, preferring encrypted if available
 *
 * Stage A: Returns plaintext, verifies encrypted in background
 * Stage B: Returns decrypted, falls back to plaintext
 */
export function decryptConsultationRow<T extends Record<string, any>>(
  row: T,
  ctx: ConsultationPHIContext,
  options: { preferEncrypted?: boolean } = {}
): T {
  const { preferEncrypted = false } = options;
  const result = { ...row };

  const fields: EncryptableField[] = ['practitioner_query', 'context_provided', 'maia_response', 'practitioner_feedback'];

  for (const field of fields) {
    const encField = `${field}_enc` as keyof T;
    const metaField = `${field}_enc_meta` as keyof T;

    if (row[encField] && row[metaField]) {
      try {
        const decrypted = decryptField(
          row[encField] as string,
          row[metaField] as string,
          field,
          ctx
        );

        if (preferEncrypted) {
          // Stage B: Use decrypted value
          // For context_provided, parse back to JSONB
          if (field === 'context_provided') {
            try {
              (result as any)[field] = JSON.parse(decrypted);
            } catch {
              (result as any)[field] = decrypted;
            }
          } else {
            (result as any)[field] = decrypted;
          }
        } else {
          // Stage A: Background verification (non-blocking)
          const plaintext = row[field as keyof T];
          const plaintextStr = typeof plaintext === 'object' ? JSON.stringify(plaintext) : plaintext;
          if (plaintextStr && decrypted !== plaintextStr) {
            console.error(`[PHI] Decrypt mismatch for maia_consultations.${field}:`, ctx.rowId);
          }
        }
      } catch (err) {
        if (preferEncrypted) {
          console.error(`[PHI] Decrypt failed for maia_consultations.${field}, using plaintext:`, ctx.rowId, err);
          // Keep plaintext in Stage B fallback
        } else {
          console.error(`[PHI] Background verify failed for maia_consultations.${field}:`, ctx.rowId, err);
        }
      }
    }
  }

  return result;
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * SECURITY: Sanitize consultation row before returning from data layer
 * Strips *_enc columns to prevent encrypted blobs from leaking.
 *
 * Call this on every row before returning from CaseConsultationService functions.
 */
export function sanitizeConsultationRow<T>(row: T): T {
  return stripEncryptedColumns(row);
}

/**
 * SECURITY: Sanitize array of consultation rows
 */
export function sanitizeConsultationRows<T>(rows: T[]): T[] {
  return rows.map(sanitizeConsultationRow);
}

