/**
 * WRITERS-STUDIO-NEXT-01 / A2-7 — durable return state.
 * Relationship return and manuscript place are separate member-owned records.
 * Neither one authorizes, derives or rewrites the other.
 */
import { query, transaction, type TransactionClient } from '@/lib/db/postgres';

export type ReturnStateRefusal =
  | 'scope_unavailable'
  | 'relationship_unavailable'
  | 'place_unavailable';

export interface ReturnScope {
  readonly memberId: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
}

async function validateScope(tx: TransactionClient, input: ReturnScope): Promise<boolean> {
  const r = await tx.query(
    `SELECT 1
       FROM living_works w
       JOIN member_manuscripts m ON m.id = $3 AND m.member_id = $1
      WHERE w.id = $2
        AND w.member_id = $1
        AND EXISTS (
          SELECT 1 FROM living_work_expressions e
           WHERE e.living_work_id = w.id
             AND e.expression_type = 'manuscript'
             AND e.expression_id = m.id
             AND e.declared_by = $1
        )
        AND (
          SELECT count(*) FROM living_work_expressions e2
           WHERE e2.expression_type = 'manuscript'
             AND e2.expression_id = m.id
             AND e2.declared_by = $1
        ) = 1`,
    [input.memberId, input.livingWorkId, input.manuscriptId],
  );
  return r.rows.length === 1;
}

export async function readRelationshipReturn(input: ReturnScope): Promise<string | null> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return null;
    const saved = await tx.query<{ relationship_id: string }>(
      `SELECT relationship_id FROM writer_studio_relationship_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    const relationshipId = saved.rows[0]?.relationship_id ?? null;
    if (!relationshipId) return null;
    const valid = await tx.query(
      `SELECT 1 FROM writer_editorial_relationships
        WHERE id = $1 AND member_id = $2 AND living_work_id = $3 AND manuscript_id = $4`,
      [relationshipId, input.memberId, input.livingWorkId, input.manuscriptId],
    );
    if (valid.rows.length === 1) return relationshipId;
    await tx.query(
      `DELETE FROM writer_studio_relationship_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    return null;
  });
}

export async function writeRelationshipReturn(
  input: ReturnScope & { readonly relationshipId: string },
): Promise<{ ok: true } | { ok: false; reason: ReturnStateRefusal }> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return { ok: false as const, reason: 'scope_unavailable' as const };
    const rel = await tx.query(
      `SELECT 1 FROM writer_editorial_relationships
        WHERE id = $1 AND member_id = $2 AND living_work_id = $3 AND manuscript_id = $4`,
      [input.relationshipId, input.memberId, input.livingWorkId, input.manuscriptId],
    );
    if (rel.rows.length !== 1) return { ok: false as const, reason: 'relationship_unavailable' as const };
    await tx.query(
      `INSERT INTO writer_studio_relationship_returns
         (member_id, living_work_id, manuscript_id, relationship_id, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (member_id, living_work_id, manuscript_id)
       DO UPDATE SET relationship_id = EXCLUDED.relationship_id, updated_at = now()`,
      [input.memberId, input.livingWorkId, input.manuscriptId, input.relationshipId],
    );
    return { ok: true as const };
  });
}

export async function clearRelationshipReturn(input: ReturnScope): Promise<{ ok: true } | { ok: false; reason: ReturnStateRefusal }> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return { ok: false as const, reason: 'scope_unavailable' as const };
    await tx.query(
      `DELETE FROM writer_studio_relationship_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    return { ok: true as const };
  });
}

export async function readPlaceReturn(input: ReturnScope): Promise<string | null> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return null;
    const saved = await tx.query<{ draft_section_id: string }>(
      `SELECT draft_section_id FROM writer_studio_place_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    const sectionId = saved.rows[0]?.draft_section_id ?? null;
    if (!sectionId) return null;
    const valid = await tx.query(
      `SELECT 1
         FROM manuscript_working_drafts d
         JOIN manuscript_draft_sections s ON s.draft_id = d.id
        WHERE d.manuscript_id = $1 AND d.member_id = $2
          AND d.section_addressable_at IS NOT NULL AND s.id = $3`,
      [input.manuscriptId, input.memberId, sectionId],
    );
    if (valid.rows.length === 1) return sectionId;
    await tx.query(
      `DELETE FROM writer_studio_place_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    return null;
  });
}

export async function writePlaceReturn(
  input: ReturnScope & { readonly draftSectionId: string },
): Promise<{ ok: true } | { ok: false; reason: ReturnStateRefusal }> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return { ok: false as const, reason: 'scope_unavailable' as const };
    const place = await tx.query(
      `SELECT 1
         FROM manuscript_working_drafts d
         JOIN manuscript_draft_sections s ON s.draft_id = d.id
        WHERE d.manuscript_id = $1 AND d.member_id = $2
          AND d.section_addressable_at IS NOT NULL AND s.id = $3`,
      [input.manuscriptId, input.memberId, input.draftSectionId],
    );
    if (place.rows.length !== 1) return { ok: false as const, reason: 'place_unavailable' as const };
    await tx.query(
      `INSERT INTO writer_studio_place_returns
         (member_id, living_work_id, manuscript_id, draft_section_id, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (member_id, living_work_id, manuscript_id)
       DO UPDATE SET draft_section_id = EXCLUDED.draft_section_id, updated_at = now()`,
      [input.memberId, input.livingWorkId, input.manuscriptId, input.draftSectionId],
    );
    return { ok: true as const };
  });
}

export async function clearPlaceReturn(input: ReturnScope): Promise<{ ok: true } | { ok: false; reason: ReturnStateRefusal }> {
  return transaction(async (tx) => {
    if (!(await validateScope(tx, input))) return { ok: false as const, reason: 'scope_unavailable' as const };
    await tx.query(
      `DELETE FROM writer_studio_place_returns
        WHERE member_id = $1 AND living_work_id = $2 AND manuscript_id = $3`,
      [input.memberId, input.livingWorkId, input.manuscriptId],
    );
    return { ok: true as const };
  });
}
