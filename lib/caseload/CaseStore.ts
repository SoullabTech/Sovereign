/**
 * CASE STORE
 *
 * Database operations for practitioner caseload management.
 * Handles cases, notes, and capture session links.
 *
 * SECURITY: Session notes (case_notes.content) are PHI.
 * - Uses dual-write pattern (plaintext + encrypted)
 * - Strips *_enc columns before returning
 * @see docs/security/free-text-phi-doctrine.md
 */

import { query, insertOne, transaction } from '@/lib/db/postgres';
import {
  getEncryptedColumnsForInsert,
  decryptNoteRow,
  sanitizeNoteRow,
  sanitizeNoteRows,
} from '@/lib/security/phiAccessors/sessionNotes';
import type {
  PractitionerCase,
  CreateCaseInput,
  UpdateCaseInput,
  CaseNote,
  CreateNoteInput,
  UpdateNoteInput,
  CaseListFilters,
  CaseWithStats,
  NoteListFilters,
  CaseCaptureLink,
} from './types';

// ================================================
// CASE OPERATIONS
// ================================================

/**
 * Create a new case for a practitioner
 */
export async function createCase(
  practitionerId: string,
  input: CreateCaseInput
): Promise<PractitionerCase> {
  const data = {
    practitioner_id: practitionerId,
    client_identifier: input.client_identifier,
    client_name_encrypted: input.client_name_encrypted || null,
    presenting_concerns: input.presenting_concerns || [],
    intake_date: input.intake_date || new Date().toISOString().split('T')[0],
    primary_element: input.primary_element || null,
    spiral_stage: input.spiral_stage || null,
    facet_code: input.facet_code || null,
    privacy_mode: input.privacy_mode || 'private',
    consent_notes: input.consent_notes || null,
  };

  return insertOne<PractitionerCase>('practitioner_cases', data);
}

/**
 * Get a single case by ID (with ownership verification)
 */
export async function getCase(
  caseId: string,
  practitionerId: string
): Promise<PractitionerCase | null> {
  const result = await query<PractitionerCase>(
    `SELECT * FROM practitioner_cases
     WHERE id = $1 AND practitioner_id = $2`,
    [caseId, practitionerId]
  );
  return result.rows[0] || null;
}

/**
 * Get case with statistics (note count, last session, memory count)
 */
export async function getCaseWithStats(
  caseId: string,
  practitionerId: string
): Promise<CaseWithStats | null> {
  const result = await query<CaseWithStats>(
    `SELECT
       c.*,
       COALESCE(n.note_count, 0)::int as note_count,
       n.last_session_date,
       COALESCE(m.memory_count, 0)::int as memory_count
     FROM practitioner_cases c
     LEFT JOIN (
       SELECT case_id,
              COUNT(*)::int as note_count,
              MAX(session_date) as last_session_date
       FROM case_notes
       GROUP BY case_id
     ) n ON n.case_id = c.id
     LEFT JOIN (
       SELECT case_id, COUNT(*)::int as memory_count
       FROM case_memories
       GROUP BY case_id
     ) m ON m.case_id = c.id
     WHERE c.id = $1 AND c.practitioner_id = $2`,
    [caseId, practitionerId]
  );
  return result.rows[0] || null;
}

/**
 * List cases for a practitioner with optional filters
 */
export async function listCases(
  practitionerId: string,
  filters: CaseListFilters = {}
): Promise<CaseWithStats[]> {
  const { status, element, search, limit = 50, offset = 0 } = filters;

  let whereClause = 'WHERE c.practitioner_id = $1';
  const params: any[] = [practitionerId];
  let paramIndex = 2;

  if (status) {
    whereClause += ` AND c.case_status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (element) {
    whereClause += ` AND c.primary_element = $${paramIndex}`;
    params.push(element);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (
      c.client_identifier ILIKE $${paramIndex}
      OR $${paramIndex} = ANY(c.presenting_concerns)
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  params.push(limit, offset);

  const result = await query<CaseWithStats>(
    `SELECT
       c.*,
       COALESCE(n.note_count, 0)::int as note_count,
       n.last_session_date,
       COALESCE(m.memory_count, 0)::int as memory_count
     FROM practitioner_cases c
     LEFT JOIN (
       SELECT case_id,
              COUNT(*)::int as note_count,
              MAX(session_date) as last_session_date
       FROM case_notes
       GROUP BY case_id
     ) n ON n.case_id = c.id
     LEFT JOIN (
       SELECT case_id, COUNT(*)::int as memory_count
       FROM case_memories
       GROUP BY case_id
     ) m ON m.case_id = c.id
     ${whereClause}
     ORDER BY
       CASE c.case_status
         WHEN 'active' THEN 1
         WHEN 'paused' THEN 2
         ELSE 3
       END,
       n.last_session_date DESC NULLS LAST,
       c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return result.rows;
}

/**
 * Update a case
 */
export async function updateCase(
  caseId: string,
  practitionerId: string,
  input: UpdateCaseInput
): Promise<PractitionerCase | null> {
  // Build SET clause dynamically
  const updates: string[] = [];
  const values: any[] = [caseId, practitionerId];
  let paramIndex = 3;

  const allowedFields = [
    'client_identifier',
    'client_name_encrypted',
    'presenting_concerns',
    'case_status',
    'primary_element',
    'spiral_stage',
    'facet_code',
    'privacy_mode',
    'consent_captured_at',
    'consent_notes',
  ];

  for (const field of allowedFields) {
    if (field in input && input[field as keyof UpdateCaseInput] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(input[field as keyof UpdateCaseInput]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return getCase(caseId, practitionerId);
  }

  // Add closed_at if status is being set to completed/archived
  if (input.case_status === 'completed' || input.case_status === 'archived') {
    updates.push(`closed_at = NOW()`);
  }

  const result = await query<PractitionerCase>(
    `UPDATE practitioner_cases
     SET ${updates.join(', ')}
     WHERE id = $1 AND practitioner_id = $2
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Archive a case (soft delete)
 */
export async function archiveCase(
  caseId: string,
  practitionerId: string
): Promise<PractitionerCase | null> {
  return updateCase(caseId, practitionerId, { case_status: 'archived' });
}

/**
 * Get case count by status for practitioner
 */
export async function getCaseCounts(
  practitionerId: string
): Promise<Record<string, number>> {
  const result = await query<{ case_status: string; count: string }>(
    `SELECT case_status, COUNT(*)::int as count
     FROM practitioner_cases
     WHERE practitioner_id = $1
     GROUP BY case_status`,
    [practitionerId]
  );

  const counts: Record<string, number> = {
    active: 0,
    paused: 0,
    completed: 0,
    transferred: 0,
    archived: 0,
    total: 0,
  };

  for (const row of result.rows) {
    counts[row.case_status] = parseInt(row.count);
    counts.total += parseInt(row.count);
  }

  return counts;
}

// ================================================
// CASE NOTE OPERATIONS
// ================================================

/**
 * Create a new case note
 * SECURITY: Dual-writes content to both plaintext and encrypted columns
 */
export async function createNote(
  caseId: string,
  practitionerId: string,
  input: CreateNoteInput
): Promise<CaseNote> {
  // Generate a temporary ID for encryption context (will be replaced by DB)
  const tempId = crypto.randomUUID();

  const data: Record<string, any> = {
    case_id: caseId,
    practitioner_id: practitionerId,
    note_type: input.note_type,
    session_date: input.session_date || new Date().toISOString().split('T')[0],
    session_duration_minutes: input.session_duration_minutes || null,
    content: input.content,
    interventions_used: input.interventions_used || [],
    themes_observed: input.themes_observed || [],
    element_focus: input.element_focus || null,
    spiral_movement: input.spiral_movement || null,
    pattern_markers: [],
    linked_capture_session_id: input.linked_capture_session_id || null,
  };

  // SECURITY: Phase 2B - Encryption is unconditional
  const encrypted = getEncryptedColumnsForInsert(input.content, {
    rowId: tempId,
    practitionerId,
  });
  data.content_enc = encrypted.contentEnc;
  data.content_enc_meta = encrypted.contentEncMeta;

  const result = await insertOne<CaseNote>('case_notes', data);

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptNoteRow(
    result,
    { rowId: result.id, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeNoteRow(decrypted);
}

/**
 * Get a single note by ID
 * SECURITY: Stage B - Decrypt from _enc, then strip
 */
export async function getNote(
  noteId: string,
  practitionerId: string
): Promise<CaseNote | null> {
  const result = await query<CaseNote>(
    `SELECT * FROM case_notes
     WHERE id = $1 AND practitioner_id = $2`,
    [noteId, practitionerId]
  );
  if (!result.rows[0]) return null;

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptNoteRow(
    result.rows[0],
    { rowId: noteId, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeNoteRow(decrypted);
}

/**
 * List notes for a case with optional filters
 * SECURITY: Strips *_enc columns before returning
 */
export async function listNotes(
  caseId: string,
  practitionerId: string,
  filters: NoteListFilters = {}
): Promise<CaseNote[]> {
  const { type, element, from_date, to_date, limit = 50, offset = 0 } = filters;

  let whereClause = 'WHERE case_id = $1 AND practitioner_id = $2';
  const params: any[] = [caseId, practitionerId];
  let paramIndex = 3;

  if (type) {
    whereClause += ` AND note_type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (element) {
    whereClause += ` AND element_focus = $${paramIndex}`;
    params.push(element);
    paramIndex++;
  }

  if (from_date) {
    whereClause += ` AND session_date >= $${paramIndex}`;
    params.push(from_date);
    paramIndex++;
  }

  if (to_date) {
    whereClause += ` AND session_date <= $${paramIndex}`;
    params.push(to_date);
    paramIndex++;
  }

  params.push(limit, offset);

  const result = await query<CaseNote>(
    `SELECT * FROM case_notes
     ${whereClause}
     ORDER BY session_date DESC, created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = result.rows.map((row) =>
    decryptNoteRow(row, { rowId: row.id, practitionerId }, { preferEncrypted: true })
  );
  return sanitizeNoteRows(decrypted);
}

/**
 * Update a note
 * SECURITY: Dual-writes content to encrypted columns if content is being updated
 */
export async function updateNote(
  noteId: string,
  practitionerId: string,
  input: UpdateNoteInput
): Promise<CaseNote | null> {
  const updates: string[] = [];
  const values: any[] = [noteId, practitionerId];
  let paramIndex = 3;

  const allowedFields = [
    'note_type',
    'session_date',
    'session_duration_minutes',
    'content',
    'interventions_used',
    'themes_observed',
    'element_focus',
    'spiral_movement',
  ];

  for (const field of allowedFields) {
    if (field in input && input[field as keyof UpdateNoteInput] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(input[field as keyof UpdateNoteInput]);
      paramIndex++;
    }
  }

  // SECURITY: Phase 2B - Encryption is unconditional when content updated
  if (input.content !== undefined) {
    const encrypted = getEncryptedColumnsForInsert(input.content, {
      rowId: noteId,
      practitionerId,
    });
    updates.push(`content_enc = $${paramIndex}`);
    values.push(encrypted.contentEnc);
    paramIndex++;
    updates.push(`content_enc_meta = $${paramIndex}`);
    values.push(encrypted.contentEncMeta);
    paramIndex++;
  }

  if (updates.length === 0) {
    return getNote(noteId, practitionerId);
  }

  const result = await query<CaseNote>(
    `UPDATE case_notes
     SET ${updates.join(', ')}
     WHERE id = $1 AND practitioner_id = $2
     RETURNING *`,
    values
  );

  if (!result.rows[0]) return null;

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptNoteRow(
    result.rows[0],
    { rowId: noteId, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeNoteRow(decrypted);
}

/**
 * Delete a note
 */
export async function deleteNote(
  noteId: string,
  practitionerId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM case_notes
     WHERE id = $1 AND practitioner_id = $2`,
    [noteId, practitionerId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Update MAIA analysis on a note
 * SECURITY: Strips *_enc columns before returning
 */
export async function updateNoteAnalysis(
  noteId: string,
  practitionerId: string,
  analysis: CaseNote['maia_analysis'],
  patternMarkers: string[]
): Promise<CaseNote | null> {
  const result = await query<CaseNote>(
    `UPDATE case_notes
     SET maia_analysis = $3, pattern_markers = $4
     WHERE id = $1 AND practitioner_id = $2
     RETURNING *`,
    [noteId, practitionerId, JSON.stringify(analysis), patternMarkers]
  );
  if (!result.rows[0]) return null;

  // SECURITY: Stage B - Decrypt from _enc columns, then strip them
  const decrypted = decryptNoteRow(
    result.rows[0],
    { rowId: noteId, practitionerId },
    { preferEncrypted: true }
  );
  return sanitizeNoteRow(decrypted);
}

// ================================================
// CAPTURE SESSION LINK OPERATIONS
// ================================================

/**
 * Link a capture session to a case
 */
export async function linkCaptureSession(
  caseId: string,
  captureSessionId: string,
  linkedBy: string
): Promise<CaseCaptureLink> {
  return insertOne<CaseCaptureLink>('case_capture_links', {
    case_id: caseId,
    capture_session_id: captureSessionId,
    linked_by: linkedBy,
  });
}

/**
 * Get capture links for a case
 */
export async function getCaptureLinks(
  caseId: string
): Promise<CaseCaptureLink[]> {
  const result = await query<CaseCaptureLink>(
    `SELECT * FROM case_capture_links
     WHERE case_id = $1
     ORDER BY linked_at DESC`,
    [caseId]
  );
  return result.rows;
}

/**
 * Unlink a capture session from a case
 */
export async function unlinkCaptureSession(
  caseId: string,
  captureSessionId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM case_capture_links
     WHERE case_id = $1 AND capture_session_id = $2`,
    [caseId, captureSessionId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get unlinked capture sessions for a practitioner
 * (sessions that aren't linked to any case yet)
 */
export async function getUnlinkedCaptureSessions(
  practitionerId: string,
  limit = 20
): Promise<any[]> {
  const result = await query(
    `SELECT cs.*
     FROM capture_sessions cs
     LEFT JOIN case_capture_links ccl ON ccl.capture_session_id = cs.id
     WHERE cs.user_id = $1
       AND cs.ended_at IS NOT NULL
       AND ccl.id IS NULL
     ORDER BY cs.started_at DESC
     LIMIT $2`,
    [practitionerId, limit]
  );
  return result.rows;
}

// ================================================
// PRACTITIONER SETUP
// ================================================

/**
 * Enable practitioner mode for a member
 */
export async function enablePractitionerMode(
  memberId: string,
  licenseType?: string
): Promise<boolean> {
  const result = await query(
    `UPDATE members
     SET is_practitioner = true,
         practitioner_license_type = $2,
         practitioner_since = NOW()
     WHERE id = $1`,
    [memberId, licenseType || null]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Check if member is a practitioner
 */
export async function isPractitioner(memberId: string): Promise<boolean> {
  const result = await query<{ is_practitioner: boolean }>(
    `SELECT is_practitioner FROM members WHERE id = $1`,
    [memberId]
  );
  return result.rows[0]?.is_practitioner ?? false;
}

// ================================================
// EXPORTS
// ================================================

export const CaseStore = {
  // Cases
  createCase,
  getCase,
  getCaseWithStats,
  listCases,
  updateCase,
  archiveCase,
  getCaseCounts,

  // Notes
  createNote,
  getNote,
  listNotes,
  updateNote,
  deleteNote,
  updateNoteAnalysis,

  // Capture links
  linkCaptureSession,
  getCaptureLinks,
  unlinkCaptureSession,
  getUnlinkedCaptureSessions,

  // Practitioner setup
  enablePractitionerMode,
  isPractitioner,
};

export default CaseStore;
