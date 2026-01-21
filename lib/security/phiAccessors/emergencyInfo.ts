/**
 * PHI ACCESSOR: client_emergency_info
 *
 * Free-Text PHI Doctrine - Wave 2
 *
 * Provides PHI-aware read/write helpers for emergency info fields:
 * - safety_plan
 * - medications
 * - medical_conditions
 * - risk_notes
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

interface EmergencyInfoPHIContext {
  rowId: string;
  practitionerId: string;
}

/**
 * Fields that can be encrypted in client_emergency_info
 */
type EncryptableField = 'safety_plan' | 'medications' | 'medical_conditions' | 'risk_notes';

interface EncryptedFieldResult {
  ciphertext: string;
  meta: string; // JSON stringified
}

/**
 * Encrypted columns for INSERT/UPDATE
 */
export interface EmergencyInfoEncryptedColumns {
  safety_plan_enc?: string;
  safety_plan_enc_meta?: string;
  medications_enc?: string;
  medications_enc_meta?: string;
  medical_conditions_enc?: string;
  medical_conditions_enc_meta?: string;
  risk_notes_enc?: string;
  risk_notes_enc_meta?: string;
}

/**
 * Input patch for upsert operations
 */
export interface EmergencyInfoPatch {
  safety_plan?: string | null;
  medications?: string | null;
  medical_conditions?: string | null;
  risk_notes?: string | null;
}

// ============================================================================
// ENCRYPTION HELPERS
// ============================================================================

/**
 * Build PHI context for a specific column
 */
function buildContext(field: EncryptableField, ctx: EmergencyInfoPHIContext): PHIContext {
  return {
    table: 'client_emergency_info',
    column: field,
    rowId: ctx.rowId,
    ownerId: ctx.practitionerId,
  };
}

/**
 * Encrypt a single field value
 */
function encryptField(
  value: string,
  field: EncryptableField,
  ctx: EmergencyInfoPHIContext
): EncryptedFieldResult {
  const phiContext = buildContext(field, ctx);
  const { ciphertext, meta } = encryptForDB(value, phiContext);
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
  ctx: EmergencyInfoPHIContext
): string {
  const phiContext = buildContext(field, ctx);
  const parsedMeta = typeof meta === 'string' ? JSON.parse(meta) : meta;
  return decryptFromDB(ciphertext, parsedMeta, phiContext);
}

// ============================================================================
// STAGE A: DUAL-WRITE HELPERS
// ============================================================================

/**
 * Get encrypted column values for INSERT/UPDATE
 *
 * Usage in INSERT:
 * ```
 * const enc = encryptEmergencyInfoPatch(patch, { rowId, practitionerId });
 * // Spread enc into your INSERT values
 * ```
 */
export function encryptEmergencyInfoPatch(
  patch: EmergencyInfoPatch,
  ctx: EmergencyInfoPHIContext
): EmergencyInfoEncryptedColumns {
  const encrypted: EmergencyInfoEncryptedColumns = {};

  if (patch.safety_plan) {
    const result = encryptField(patch.safety_plan, 'safety_plan', ctx);
    encrypted.safety_plan_enc = result.ciphertext;
    encrypted.safety_plan_enc_meta = result.meta;
  }

  if (patch.medications) {
    const result = encryptField(patch.medications, 'medications', ctx);
    encrypted.medications_enc = result.ciphertext;
    encrypted.medications_enc_meta = result.meta;
  }

  if (patch.medical_conditions) {
    const result = encryptField(patch.medical_conditions, 'medical_conditions', ctx);
    encrypted.medical_conditions_enc = result.ciphertext;
    encrypted.medical_conditions_enc_meta = result.meta;
  }

  if (patch.risk_notes) {
    const result = encryptField(patch.risk_notes, 'risk_notes', ctx);
    encrypted.risk_notes_enc = result.ciphertext;
    encrypted.risk_notes_enc_meta = result.meta;
  }

  return encrypted;
}

// ============================================================================
// STAGE B: ENCRYPTED-PREFER READ
// ============================================================================

/**
 * Decrypt emergency info row, preferring encrypted if available
 *
 * Stage A: Returns plaintext, verifies encrypted in background
 * Stage B: Returns decrypted, falls back to plaintext
 */
export function decryptEmergencyInfoRow<T extends Record<string, any>>(
  row: T,
  ctx: EmergencyInfoPHIContext,
  options: { preferEncrypted?: boolean } = {}
): T {
  const { preferEncrypted = false } = options;
  const result = { ...row };

  const fields: EncryptableField[] = ['safety_plan', 'medications', 'medical_conditions', 'risk_notes'];

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
          (result as any)[field] = decrypted;
        } else {
          // Stage A: Background verification (non-blocking)
          const plaintext = row[field as keyof T];
          if (plaintext && decrypted !== plaintext) {
            console.error(`[PHI] Decrypt mismatch for emergency_info.${field}:`, ctx.rowId);
          }
        }
      } catch (err) {
        if (preferEncrypted) {
          console.error(`[PHI] Decrypt failed for emergency_info.${field}, using plaintext:`, ctx.rowId, err);
          // Keep plaintext in Stage B fallback
        } else {
          console.error(`[PHI] Background verify failed for emergency_info.${field}:`, ctx.rowId, err);
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
 * SECURITY: Sanitize emergency info row before returning from data layer
 * Strips *_enc columns to prevent encrypted blobs from leaking.
 *
 * Call this on every row before returning from sessionPrep functions.
 */
export function sanitizeEmergencyInfoRow<T>(row: T): T {
  return stripEncryptedColumns(row);
}

// ============================================================================
// ENVIRONMENT FLAG
// ============================================================================

/**
 * Check if PHI encryption is enabled
 *
 * Phase 2B: Always returns true. Encryption is unconditional.
 * Kept for backwards compatibility - will be removed in Phase 3.
 *
 * @deprecated Use encryption unconditionally; this function always returns true
 */
export function isPHIEncryptionEnabled(): boolean {
  return true;
}
