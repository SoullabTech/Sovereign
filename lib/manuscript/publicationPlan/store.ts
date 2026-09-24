import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { isPublicationMatterRole, type PublicationMatterRole } from './roles';

export type PublicationPlanRefusal =
  | 'not_found'
  | 'invalid_role'
  | 'nothing_selected'
  | 'duplicate_section'
  | 'section_not_current'
  | 'non_contiguous'
  | 'section_already_assigned';

export interface PublicationPlacement {
  role: PublicationMatterRole;
  sectionIds: string[];
}

export type PublicationPlanResult =
  | { status: 'ok'; placements: PublicationPlacement[] }
  | { status: 'refused'; refusal: PublicationPlanRefusal; detail?: string };

const refuse = (refusal: PublicationPlanRefusal, detail?: string): PublicationPlanResult =>
  detail ? { status: 'refused', refusal, detail } : { status: 'refused', refusal };

export interface CurrentSection {
  id: string;
  position: number;
}

export interface ExistingPlacement {
  role: PublicationMatterRole;
  sectionId: string;
}

/** Pure gate. Every member-facing refusal is decided before a write occurs. */
export function planPublicationAssignment(
  role: string,
  requestedSectionIds: readonly string[],
  currentSections: readonly CurrentSection[],
  existing: readonly ExistingPlacement[],
): PublicationPlanResult {
  if (!isPublicationMatterRole(role)) return refuse('invalid_role');
  if (requestedSectionIds.length === 0) return refuse('nothing_selected');
  if (new Set(requestedSectionIds).size !== requestedSectionIds.length) return refuse('duplicate_section');

  const currentById = new Map(currentSections.map((s) => [s.id, s]));
  const selected: CurrentSection[] = [];
  for (const id of requestedSectionIds) {
    const row = currentById.get(id);
    if (!row) return refuse('section_not_current', id);
    selected.push(row);
  }
  selected.sort((a, b) => a.position - b.position);
  for (let i = 1; i < selected.length; i += 1) {
    if (selected[i]!.position !== selected[i - 1]!.position + 1) return refuse('non_contiguous');
  }

  const requested = new Set(requestedSectionIds);
  const conflict = existing.find((p) => requested.has(p.sectionId) && p.role !== role);
  if (conflict) return refuse('section_already_assigned', `${conflict.sectionId}:${conflict.role}`);

  const byRole = new Map<PublicationMatterRole, string[]>();
  for (const p of existing) {
    if (p.role === role) continue;
    const ids = byRole.get(p.role) ?? [];
    ids.push(p.sectionId);
    byRole.set(p.role, ids);
  }
  byRole.set(role, selected.map((s) => s.id));
  return {
    status: 'ok',
    placements: [...byRole.entries()].map(([r, sectionIds]) => ({ role: r, sectionIds })),
  };
}

async function loadCurrentSections(tx: TransactionClient, manuscriptId: string, memberId: string): Promise<CurrentSection[]> {
  const rows = await tx.query<{ id: string; position: number }>(
    `SELECT ds.id, ds.position
       FROM manuscript_working_drafts d
       JOIN manuscript_draft_sections ds ON ds.draft_id = d.id
      WHERE d.manuscript_id = $1 AND d.member_id = $2 AND d.section_addressable_at IS NOT NULL
      ORDER BY ds.position`,
    [manuscriptId, memberId],
  );
  return rows.rows.map((r) => ({ id: r.id, position: Number(r.position) }));
}

async function loadExisting(tx: TransactionClient, manuscriptId: string): Promise<ExistingPlacement[]> {
  const rows = await tx.query<{ role: string; draft_section_id: string }>(
    `SELECT o.role, m.draft_section_id
       FROM manuscript_publication_objects o
       JOIN manuscript_publication_members m ON m.object_id = o.id
      WHERE o.manuscript_id = $1`,
    [manuscriptId],
  );
  return rows.rows
    .filter((r) => isPublicationMatterRole(r.role))
    .map((r) => ({ role: r.role as PublicationMatterRole, sectionId: r.draft_section_id }));
}

export async function assignPublicationRole(
  manuscriptId: string,
  memberId: string,
  role: string,
  requestedSectionIds: readonly string[],
): Promise<PublicationPlanResult> {
  return transaction(async (tx) => {
    const owned = await tx.query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId],
    );
    if (owned.rows.length === 0) return refuse('not_found');

    const current = await loadCurrentSections(tx, manuscriptId, memberId);
    if (current.length === 0) return refuse('not_found');
    const existing = await loadExisting(tx, manuscriptId);
    const planned = planPublicationAssignment(role, requestedSectionIds, current, existing);
    if (planned.status === 'refused') return planned;

    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_publication_objects (manuscript_id, role)
       VALUES ($1, $2)
       ON CONFLICT (manuscript_id, role)
       DO UPDATE SET updated_at = now()
       RETURNING id`,
      [manuscriptId, role],
    );
    const objectId = inserted.rows[0]!.id;
    await tx.query(`DELETE FROM manuscript_publication_members WHERE object_id = $1`, [objectId]);
    const assigned = planned.placements.find((p) => p.role === role)!;
    await tx.query(
      `INSERT INTO manuscript_publication_members (object_id, draft_section_id, position)
       SELECT $1, x.section_id::uuid, x.ordinality - 1
         FROM unnest($2::text[]) WITH ORDINALITY AS x(section_id, ordinality)`,
      [objectId, assigned.sectionIds],
    );
    return planned;
  });
}

export async function readPublicationPlan(
  manuscriptId: string,
  memberId: string,
): Promise<PublicationPlanResult> {
  return transaction(async (tx) => {
    const owned = await tx.query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (owned.rows.length === 0) return refuse('not_found');

    const rows = await tx.query<{ role: string; draft_section_id: string | null; position: number | null }>(
      `SELECT o.role, m.draft_section_id, m.position
         FROM manuscript_publication_objects o
         LEFT JOIN manuscript_publication_members m ON m.object_id = o.id
        WHERE o.manuscript_id = $1
        ORDER BY o.created_at, m.position NULLS LAST`,
      [manuscriptId],
    );
    const grouped = new Map<PublicationMatterRole, string[]>();
    for (const row of rows.rows) {
      if (!isPublicationMatterRole(row.role)) continue;
      const ids = grouped.get(row.role) ?? [];
      if (row.draft_section_id) ids.push(row.draft_section_id);
      grouped.set(row.role, ids);
    }
    return {
      status: 'ok',
      placements: [...grouped.entries()].map(([r, sectionIds]) => ({ role: r, sectionIds })),
    };
  });
}

export async function clearPublicationRole(
  manuscriptId: string,
  memberId: string,
  role: string,
): Promise<PublicationPlanResult> {
  if (!isPublicationMatterRole(role)) return refuse('invalid_role');
  return transaction(async (tx) => {
    const owned = await tx.query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId],
    );
    if (owned.rows.length === 0) return refuse('not_found');
    await tx.query(
      `DELETE FROM manuscript_publication_objects WHERE manuscript_id = $1 AND role = $2`,
      [manuscriptId, role],
    );
    const existing = await loadExisting(tx, manuscriptId);
    const grouped = new Map<PublicationMatterRole, string[]>();
    for (const row of existing) {
      const ids = grouped.get(row.role) ?? [];
      ids.push(row.sectionId);
      grouped.set(row.role, ids);
    }
    return {
      status: 'ok',
      placements: [...grouped.entries()].map(([r, sectionIds]) => ({ role: r, sectionIds })),
    };
  });
}
