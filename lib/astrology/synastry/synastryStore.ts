/**
 * Synastry Store
 *
 * Database operations for persisted synastry analyses.
 */

import { query } from '@/lib/db/postgres';

export interface SynastryAnalysisRow {
  id: string;
  a_member_id: string | null;
  b_member_id: string | null;
  a_birth: unknown | null;
  b_birth: unknown | null;
  requested_by_member_id: string | null;
  result: unknown; // stored JSON payload
  created_at: string;
  updated_at: string;
  saved_at: string | null; // When user saved to timeline (NULL = not saved)
}

export interface CreateSynastryAnalysisInput {
  aMemberId?: string | null;
  bMemberId?: string | null;
  aBirth?: unknown | null;
  bBirth?: unknown | null;
  requestedByMemberId?: string | null;
  result: unknown;
}

/**
 * Create a new synastry analysis record
 */
export async function createSynastryAnalysis(
  input: CreateSynastryAnalysisInput
): Promise<SynastryAnalysisRow> {
  const res = await query<SynastryAnalysisRow>(
    `
    INSERT INTO synastry_analyses (
      a_member_id,
      b_member_id,
      a_birth,
      b_birth,
      requested_by_member_id,
      result
    )
    VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb)
    RETURNING *
    `,
    [
      input.aMemberId ?? null,
      input.bMemberId ?? null,
      input.aBirth ? JSON.stringify(input.aBirth) : null,
      input.bBirth ? JSON.stringify(input.bBirth) : null,
      input.requestedByMemberId ?? null,
      JSON.stringify(input.result),
    ]
  );

  return res.rows[0]!;
}

/**
 * Get a synastry analysis by ID
 */
export async function getSynastryAnalysisById(
  analysisId: string
): Promise<SynastryAnalysisRow | null> {
  const res = await query<SynastryAnalysisRow>(
    `SELECT * FROM synastry_analyses WHERE id = $1::uuid`,
    [analysisId]
  );
  return res.rows[0] ?? null;
}

/**
 * Delete a synastry analysis by ID
 */
export async function deleteSynastryAnalysisById(analysisId: string): Promise<boolean> {
  const res = await query<{ id: string }>(
    `DELETE FROM synastry_analyses WHERE id = $1::uuid RETURNING id`,
    [analysisId]
  );
  return (res.rows[0]?.id ?? null) !== null;
}

/**
 * List synastry analyses for a member (as either A or B side)
 */
export async function listSynastryAnalysesForMember(
  memberId: string,
  options?: { limit?: number; offset?: number }
): Promise<SynastryAnalysisRow[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const res = await query<SynastryAnalysisRow>(
    `
    SELECT * FROM synastry_analyses
    WHERE a_member_id = $1::uuid OR b_member_id = $1::uuid
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [memberId, limit, offset]
  );

  return res.rows;
}

/**
 * List recent synastry analyses (global)
 */
export async function listRecentSynastryAnalyses(
  options?: { limit?: number; offset?: number }
): Promise<SynastryAnalysisRow[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const res = await query<SynastryAnalysisRow>(
    `
    SELECT * FROM synastry_analyses
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return res.rows;
}

/**
 * Toggle saved_at for a synastry analysis (Save to Timeline)
 */
export async function setSynastryAnalysisSaved(
  analysisId: string,
  requestedByMemberId: string,
  saved: boolean
): Promise<{ id: string; saved_at: string | null } | null> {
  const res = await query<{ id: string; saved_at: string | null }>(
    `
    UPDATE synastry_analyses
    SET saved_at = CASE WHEN $3 THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = $1::uuid
      AND requested_by_member_id = $2
    RETURNING id, saved_at
    `,
    [analysisId, requestedByMemberId, saved]
  );

  return res.rows[0] ?? null;
}

/**
 * List saved synastry analyses for a member
 */
export async function listSavedSynastryAnalyses(
  memberId: string,
  options?: { limit?: number; offset?: number }
): Promise<SynastryAnalysisRow[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const res = await query<SynastryAnalysisRow>(
    `
    SELECT * FROM synastry_analyses
    WHERE requested_by_member_id = $1
      AND saved_at IS NOT NULL
    ORDER BY saved_at DESC
    LIMIT $2 OFFSET $3
    `,
    [memberId, limit, offset]
  );

  return res.rows;
}
