/**
 * ENCOUNTER PHI ACCESSOR
 * ======================
 * Encryption/decryption helpers for all PHI-bearing Encounter columns.
 *
 * Dual-write Stage A: write both plaintext + encrypted, read prefers encrypted.
 * Stage B (PHI_ENCOUNTER_STAGE_B=true): encrypted-only, no plaintext writes.
 *
 * Tables covered:
 *   encounter_transcripts  — raw_text
 *   transcript_turns       — text
 *   encounter_moments      — excerpt, candidate_interpretation
 *   encounter_reflections  — body
 *   encounter_interpretations — content (serialized JSON string)
 *
 * AAD binding: every encrypt call binds { table, column, rowId, ownerId=encounterId }
 * so ciphertexts cannot be transplanted across rows or columns.
 */

import {
  encryptForDB,
  decryptFromDB,
  stripEncryptedColumns,
  type PHIContext,
  type PHIEncryptionMeta,
} from '../phiEncryption';

// ============================================================================
// TYPES
// ============================================================================

export interface EncryptedFieldResult {
  enc: string;
  enc_meta: string;
}

export interface EncryptedRawTextResult {
  raw_text_enc: string;
  raw_text_enc_meta: string;
}

export interface EncryptedTurnTextResult {
  text_enc: string;
  text_enc_meta: string;
}

export interface EncryptedMomentFieldsResult {
  excerpt_enc: string | null;
  excerpt_enc_meta: string | null;
  candidate_interpretation_enc: string | null;
  candidate_interpretation_enc_meta: string | null;
}

export interface EncryptedBodyResult {
  body_enc: string;
  body_enc_meta: string;
}

export interface EncryptedContentResult {
  content_enc: string;
  content_enc_meta: string;
}

// Generic row shapes — only the columns we touch
export interface TranscriptRow {
  id: string;
  encounter_id: string;
  raw_text?: string | null;
  raw_text_enc?: string | null;
  raw_text_enc_meta?: string | PHIEncryptionMeta | null;
  [key: string]: unknown;
}

export interface TurnRow {
  id: string;
  encounter_id: string;
  text?: string | null;
  text_enc?: string | null;
  text_enc_meta?: string | PHIEncryptionMeta | null;
  [key: string]: unknown;
}

export interface MomentRow {
  id: string;
  encounter_id: string;
  excerpt?: string | null;
  excerpt_enc?: string | null;
  excerpt_enc_meta?: string | PHIEncryptionMeta | null;
  candidate_interpretation?: string | null;
  candidate_interpretation_enc?: string | null;
  candidate_interpretation_enc_meta?: string | PHIEncryptionMeta | null;
  [key: string]: unknown;
}

export interface ReflectionRow {
  id: string;
  encounter_id: string;
  body?: string | null;
  body_enc?: string | null;
  body_enc_meta?: string | PHIEncryptionMeta | null;
  [key: string]: unknown;
}

export interface InterpretationRow {
  id: string;
  encounter_id: string;
  content_enc?: string | null;
  content_enc_meta?: string | PHIEncryptionMeta | null;
  [key: string]: unknown;
}

// ============================================================================
// STAGE FLAG
// ============================================================================

export function isEncounterStageBActive(): boolean {
  return process.env.PHI_ENCOUNTER_STAGE_B === 'true';
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function parseMeta(meta: string | PHIEncryptionMeta): PHIEncryptionMeta {
  return typeof meta === 'string' ? JSON.parse(meta) : meta;
}

function buildCtx(table: string, column: string, rowId: string, encounterId: string): PHIContext {
  return { table, column, rowId, ownerId: encounterId };
}

// ============================================================================
// encounter_transcripts — raw_text
// ============================================================================

export function encryptRawText(text: string, encounterId: string): EncryptedRawTextResult {
  // rowId for a new transcript is unknown at call time — use encounterId as rowId
  // (one-to-one relationship; encounter_id IS effectively the row identity here)
  const ctx = buildCtx('encounter_transcripts', 'raw_text', encounterId, encounterId);
  const { ciphertext, meta } = encryptForDB(text, ctx);
  return {
    raw_text_enc: ciphertext,
    raw_text_enc_meta: JSON.stringify(meta),
  };
}

export function decryptRawText(row: TranscriptRow, encounterId: string): string {
  if (row.raw_text_enc && row.raw_text_enc_meta) {
    try {
      const ctx = buildCtx('encounter_transcripts', 'raw_text', encounterId, encounterId);
      return decryptFromDB(row.raw_text_enc, parseMeta(row.raw_text_enc_meta), ctx);
    } catch {
      console.warn(`[EncounterPHI] raw_text decryption failed for encounter ${encounterId}, falling back to plaintext`);
    }
  }
  return row.raw_text ?? '';
}

export function decryptTranscriptRow<T extends TranscriptRow>(row: T, encounterId: string): T {
  if (!row) return row;
  const decrypted = { ...row, raw_text: decryptRawText(row, encounterId) };
  return stripEncryptedColumns(decrypted) as T;
}

// ============================================================================
// transcript_turns — text
// ============================================================================

export function encryptTurnText(text: string, turnId: string, encounterId: string): EncryptedTurnTextResult {
  const ctx = buildCtx('transcript_turns', 'text', turnId, encounterId);
  const { ciphertext, meta } = encryptForDB(text, ctx);
  return {
    text_enc: ciphertext,
    text_enc_meta: JSON.stringify(meta),
  };
}

function decryptTurnText(row: TurnRow, encounterId: string): string {
  if (row.text_enc && row.text_enc_meta) {
    try {
      const ctx = buildCtx('transcript_turns', 'text', row.id, encounterId);
      return decryptFromDB(row.text_enc, parseMeta(row.text_enc_meta), ctx);
    } catch {
      console.warn(`[EncounterPHI] turn text decryption failed for turn ${row.id}`);
    }
  }
  return row.text ?? '';
}

export function decryptTurnRow<T extends TurnRow>(row: T, encounterId: string): T {
  if (!row) return row;
  const decrypted = { ...row, text: decryptTurnText(row, encounterId) };
  return stripEncryptedColumns(decrypted) as T;
}

export function decryptTurnRows<T extends TurnRow>(rows: T[], encounterId: string): T[] {
  return rows.map((row) => decryptTurnRow(row, encounterId));
}

// ============================================================================
// encounter_moments — excerpt + candidate_interpretation
// ============================================================================

export function encryptMomentFields(
  excerpt: string | null,
  interpretation: string | null,
  momentId: string,
  encounterId: string
): EncryptedMomentFieldsResult {
  let excerptResult: { enc: string; meta: string } | null = null;
  if (excerpt) {
    const ctx = buildCtx('encounter_moments', 'excerpt', momentId, encounterId);
    const { ciphertext, meta } = encryptForDB(excerpt, ctx);
    excerptResult = { enc: ciphertext, meta: JSON.stringify(meta) };
  }

  let interpResult: { enc: string; meta: string } | null = null;
  if (interpretation) {
    const ctx = buildCtx('encounter_moments', 'candidate_interpretation', momentId, encounterId);
    const { ciphertext, meta } = encryptForDB(interpretation, ctx);
    interpResult = { enc: ciphertext, meta: JSON.stringify(meta) };
  }

  return {
    excerpt_enc: excerptResult?.enc ?? null,
    excerpt_enc_meta: excerptResult?.meta ?? null,
    candidate_interpretation_enc: interpResult?.enc ?? null,
    candidate_interpretation_enc_meta: interpResult?.meta ?? null,
  };
}

export function decryptMomentRow<T extends MomentRow>(row: T, encounterId: string): T {
  if (!row) return row;

  let excerpt = row.excerpt ?? null;
  if (row.excerpt_enc && row.excerpt_enc_meta) {
    try {
      const ctx = buildCtx('encounter_moments', 'excerpt', row.id, encounterId);
      excerpt = decryptFromDB(row.excerpt_enc, parseMeta(row.excerpt_enc_meta), ctx);
    } catch {
      console.warn(`[EncounterPHI] moment excerpt decryption failed for moment ${row.id}`);
    }
  }

  let interpretation = row.candidate_interpretation ?? null;
  if (row.candidate_interpretation_enc && row.candidate_interpretation_enc_meta) {
    try {
      const ctx = buildCtx('encounter_moments', 'candidate_interpretation', row.id, encounterId);
      interpretation = decryptFromDB(row.candidate_interpretation_enc, parseMeta(row.candidate_interpretation_enc_meta), ctx);
    } catch {
      console.warn(`[EncounterPHI] moment interpretation decryption failed for moment ${row.id}`);
    }
  }

  const decrypted = { ...row, excerpt, candidate_interpretation: interpretation };
  return stripEncryptedColumns(decrypted) as T;
}

// ============================================================================
// encounter_reflections — body
// ============================================================================

export function encryptReflectionBody(body: string, reflectionId: string, encounterId: string): EncryptedBodyResult {
  const ctx = buildCtx('encounter_reflections', 'body', reflectionId, encounterId);
  const { ciphertext, meta } = encryptForDB(body, ctx);
  return {
    body_enc: ciphertext,
    body_enc_meta: JSON.stringify(meta),
  };
}

export function decryptReflectionRow<T extends ReflectionRow>(row: T, encounterId: string): T {
  if (!row) return row;

  let body = row.body ?? null;
  if (row.body_enc && row.body_enc_meta) {
    try {
      const ctx = buildCtx('encounter_reflections', 'body', row.id, encounterId);
      body = decryptFromDB(row.body_enc, parseMeta(row.body_enc_meta), ctx);
    } catch {
      console.warn(`[EncounterPHI] reflection body decryption failed for reflection ${row.id}`);
    }
  }

  const decrypted = { ...row, body };
  return stripEncryptedColumns(decrypted) as T;
}

// ============================================================================
// encounter_interpretations — content (stored as JSON string)
// ============================================================================

export function encryptInterpretationContent(
  content: string,
  interpretationId: string,
  encounterId: string
): EncryptedContentResult {
  const ctx = buildCtx('encounter_interpretations', 'content', interpretationId, encounterId);
  const { ciphertext, meta } = encryptForDB(content, ctx);
  return {
    content_enc: ciphertext,
    content_enc_meta: JSON.stringify(meta),
  };
}

export function decryptInterpretationRow<T extends InterpretationRow>(row: T, encounterId: string): T {
  if (!row) return row;

  let decryptedContent: unknown = null;
  if (row.content_enc && row.content_enc_meta) {
    try {
      const ctx = buildCtx('encounter_interpretations', 'content', row.id, encounterId);
      const raw = decryptFromDB(row.content_enc, parseMeta(row.content_enc_meta), ctx);
      decryptedContent = JSON.parse(raw);
    } catch {
      console.warn(`[EncounterPHI] interpretation content decryption failed for interpretation ${row.id}`);
    }
  }

  const decrypted = { ...row, content: decryptedContent };
  return stripEncryptedColumns(decrypted) as T;
}
