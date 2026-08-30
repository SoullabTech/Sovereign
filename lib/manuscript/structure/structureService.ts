/**
 * WS2-05A — reading and authoring the structure of a Work.
 *
 * OWNERSHIP IS CHECKED AGAINST THE MANUSCRIPT, not the draft. Structure belongs
 * to `member_manuscripts`, so every gesture here begins by establishing that
 * this member owns this Work. A gesture on someone else's manuscript is
 * refused as `not_found` rather than `forbidden`: the difference between "does
 * not exist" and "exists and is not yours" is itself information about another
 * member's library.
 *
 * THE ZERO-CHARACTER PROPERTY. No statement in this file reads or writes
 * `manuscript_draft_sections.text` or `manuscript_working_drafts.content`.
 * Structure operations cannot change the flattening, because they never touch
 * the tables that hold it. `flattenedBytes()` below exists so a test can prove
 * that from the outside rather than take this comment's word for it.
 */

import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import {
  buildTree, wouldCycle, renumberSiblings, sectionRun,
  type UnitRow, type MemberRow, type PlaceableSection, type StructureTree,
} from './tree';

export type StructureRefusal =
  | 'not_found'            // no such manuscript for this member
  | 'no_addressable_draft' // structure needs writing units to point at
  | 'unknown_unit'
  | 'unknown_parent'
  | 'parent_other_manuscript'
  | 'would_cycle'
  | 'unknown_section'
  | 'empty_name';

export type StructureResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'refused'; refusal: StructureRefusal };

const refuse = <T>(refusal: StructureRefusal): StructureResult<T> => ({ status: 'refused', refusal });
const ok = <T>(value: T): StructureResult<T> => ({ status: 'ok', value });

/** The manuscript's addressable draft, or null. Ownership is part of the query. */
async function ownedDraft(
  manuscriptId: string,
  memberId: string,
  q: { query: typeof query } | TransactionClient = { query },
): Promise<{ draftId: string } | null> {
  const r = await q.query<{ id: string }>(
    `SELECT d.id
       FROM manuscript_working_drafts d
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL`,
    [manuscriptId, memberId],
  );
  return r.rows.length ? { draftId: r.rows[0].id } : null;
}

async function readRows(
  manuscriptId: string,
  draftId: string,
  q: { query: typeof query } | TransactionClient = { query },
): Promise<{ units: UnitRow[]; members: MemberRow[]; sections: PlaceableSection[] }> {
  const [u, m, s] = await Promise.all([
    q.query<{ id: string; parent_id: string | null; position: number; kind: string | null; title: string | null; origin: string }>(
      `SELECT id, parent_id, position, kind, title, origin
         FROM manuscript_structure_units WHERE manuscript_id = $1`, [manuscriptId]),
    q.query<{ unit_id: string; draft_section_id: string }>(
      `SELECT sm.unit_id, sm.draft_section_id
         FROM manuscript_structure_members sm
         JOIN manuscript_structure_units su ON su.id = sm.unit_id
        WHERE su.manuscript_id = $1`, [manuscriptId]),
    q.query<{ id: string; position: number }>(
      `SELECT id, position FROM manuscript_draft_sections
        WHERE draft_id = $1 ORDER BY position ASC`, [draftId]),
  ]);
  return {
    units: u.rows.map((r) => ({
      id: r.id, parentId: r.parent_id, position: r.position,
      kind: r.kind, title: r.title,
      origin: r.origin as UnitRow['origin'],
    })),
    members: m.rows.map((r) => ({ unitId: r.unit_id, draftSectionId: r.draft_section_id })),
    sections: s.rows.map((r) => ({ id: r.id, position: r.position })),
  };
}

/**
 * The Work's structure, with every section accounted for.
 *
 * 05B NOTE, enforced here rather than left to the caller: `proposed` units are
 * filtered out of the authored tree. A suggestion that renders where authored
 * structure renders has already become authorship, whether or not anyone
 * accepted it. When 05B ships, proposals get their own surface — not a badge
 * on this one.
 */
export async function loadStructure(
  manuscriptId: string,
  memberId: string,
): Promise<StructureResult<StructureTree>> {
  const draft = await ownedDraft(manuscriptId, memberId);
  if (!draft) {
    const owns = await query(
      `SELECT 1 FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId]);
    return refuse(owns.rows.length ? 'no_addressable_draft' : 'not_found');
  }
  const { units, members, sections } = await readRows(manuscriptId, draft.draftId);
  const authored = units.filter((u) => u.origin !== 'proposed');
  const authoredIds = new Set(authored.map((u) => u.id));
  return ok(buildTree(authored, members.filter((m) => authoredIds.has(m.unitId)), sections));
}

export interface CreateUnitInput {
  kind: string | null;
  title: string | null;
  parentId: string | null;
  /** Index among siblings. Omitted means last. */
  index?: number;
}

/** Author a new unit. Holds no sections until the member places some. */
export async function createUnit(
  manuscriptId: string,
  memberId: string,
  input: CreateUnitInput,
): Promise<StructureResult<{ id: string }>> {
  const kind = input.kind?.trim() || null;
  const title = input.title?.trim() || null;
  /* A unit with neither a kind nor a title is an unnameable thing in the
     outline. Refusing is kinder than rendering a blank row the member cannot
     identify. */
  if (!kind && !title) return refuse('empty_name');

  return transaction(async (tx) => {
    const draft = await ownedDraft(manuscriptId, memberId, tx);
    if (!draft) return refuse<{ id: string }>('not_found');

    if (input.parentId) {
      const p = await tx.query(
        `SELECT 1 FROM manuscript_structure_units WHERE id = $1 AND manuscript_id = $2`,
        [input.parentId, manuscriptId]);
      if (p.rows.length === 0) return refuse<{ id: string }>('parent_other_manuscript');
    }

    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, parent_id, position, kind, title, origin)
       VALUES ($1, $2, 0, $3, $4, 'member') RETURNING id`,
      [manuscriptId, input.parentId, kind, title]);
    const id = inserted.rows[0].id;

    const siblings = await siblingRows(tx, manuscriptId, input.parentId, id);
    await applyPositions(tx, renumberSiblings(siblings, id, input.index ?? siblings.length));
    return ok({ id });
  });
}

/** Rename, or change what the member calls this kind of division. */
export async function renameUnit(
  manuscriptId: string,
  memberId: string,
  unitId: string,
  input: { kind: string | null; title: string | null },
): Promise<StructureResult<null>> {
  const kind = input.kind?.trim() || null;
  const title = input.title?.trim() || null;
  if (!kind && !title) return refuse('empty_name');

  const r = await query(
    `UPDATE manuscript_structure_units su
        SET kind = $3, title = $4, updated_at = now()
       FROM member_manuscripts m
      WHERE su.id = $1 AND su.manuscript_id = $2
        AND m.id = su.manuscript_id AND m.member_id = $5`,
    [unitId, manuscriptId, kind, title, memberId]);
  return r.rowCount ? ok(null) : refuse('unknown_unit');
}

/**
 * Move a unit: reparent, reorder, or both.
 *
 * Cycles are refused BEFORE the write. The database CHECK stops a unit being
 * its own parent; a two-unit loop would pass it and make the tree unreadable,
 * so ancestry is walked here.
 */
export async function moveUnit(
  manuscriptId: string,
  memberId: string,
  unitId: string,
  input: { parentId: string | null; index: number },
): Promise<StructureResult<null>> {
  return transaction(async (tx) => {
    const draft = await ownedDraft(manuscriptId, memberId, tx);
    if (!draft) return refuse<null>('not_found');

    const { units } = await readRows(manuscriptId, draft.draftId, tx);
    const self = units.find((u) => u.id === unitId);
    if (!self) return refuse<null>('unknown_unit');
    if (input.parentId && !units.some((u) => u.id === input.parentId)) {
      return refuse<null>('parent_other_manuscript');
    }
    if (wouldCycle(unitId, input.parentId, units)) return refuse<null>('would_cycle');

    const oldParent = self.parentId;
    await tx.query(
      `UPDATE manuscript_structure_units SET parent_id = $2, updated_at = now() WHERE id = $1`,
      [unitId, input.parentId]);

    const newSibs = await siblingRows(tx, manuscriptId, input.parentId, unitId);
    await applyPositions(tx, renumberSiblings(newSibs, unitId, input.index));

    /* The vacated list is renumbered too, so leaving a parent never leaves a
       hole in its ordering for the next reader to interpret. */
    if (oldParent !== input.parentId) {
      const oldSibs = await siblingRows(tx, manuscriptId, oldParent, unitId);
      await applyPositions(tx, oldSibs
        .sort((a, b) => a.position - b.position)
        .map((u, i) => ({ id: u.id, position: i })));
    }
    return ok(null);
  });
}

/**
 * Delete a unit.
 *
 * Deletes a GROUPING, never a word. Child units and membership rows cascade;
 * the draft sections themselves are untouched and simply become unplaced,
 * where the outline shows them.
 */
export async function deleteUnit(
  manuscriptId: string,
  memberId: string,
  unitId: string,
): Promise<StructureResult<null>> {
  return transaction(async (tx) => {
    const draft = await ownedDraft(manuscriptId, memberId, tx);
    if (!draft) return refuse<null>('not_found');

    const existing = await tx.query<{ parent_id: string | null }>(
      `SELECT parent_id FROM manuscript_structure_units WHERE id = $1 AND manuscript_id = $2`,
      [unitId, manuscriptId]);
    if (existing.rows.length === 0) return refuse<null>('unknown_unit');
    const parentId = existing.rows[0].parent_id;

    await tx.query(`DELETE FROM manuscript_structure_units WHERE id = $1`, [unitId]);

    const sibs = await siblingRows(tx, manuscriptId, parentId, unitId);
    await applyPositions(tx, sibs
      .sort((a, b) => a.position - b.position)
      .map((u, i) => ({ id: u.id, position: i })));
    return ok(null);
  });
}

/**
 * Place an inclusive RUN of draft sections into a unit, or unplace them.
 *
 * A run rather than a set, so contiguity is true by construction instead of
 * policed afterwards: the member names the ends of a stretch of the book and
 * says what it is. `unitId: null` removes the placement, returning those
 * sections to "not yet placed" — visible, never hidden.
 *
 * UNIQUE(draft_section_id) makes re-placing a section a MOVE rather than a
 * second home, and the upsert below is what performs that move honestly.
 */
export async function placeSections(
  manuscriptId: string,
  memberId: string,
  input: { unitId: string | null; fromSectionId: string; toSectionId: string },
): Promise<StructureResult<{ placed: number }>> {
  return transaction(async (tx) => {
    const draft = await ownedDraft(manuscriptId, memberId, tx);
    if (!draft) return refuse<{ placed: number }>('not_found');

    const { sections } = await readRows(manuscriptId, draft.draftId, tx);
    const run = sectionRun(input.fromSectionId, input.toSectionId, sections);
    if (!run.ok) return refuse<{ placed: number }>('unknown_section');

    if (input.unitId === null) {
      await tx.query(
        `DELETE FROM manuscript_structure_members WHERE draft_section_id = ANY($1::uuid[])`,
        [run.ids]);
      return ok({ placed: 0 });
    }

    const unit = await tx.query(
      `SELECT 1 FROM manuscript_structure_units WHERE id = $1 AND manuscript_id = $2`,
      [input.unitId, manuscriptId]);
    if (unit.rows.length === 0) return refuse<{ placed: number }>('unknown_unit');

    /* Delete-then-insert rather than ON CONFLICT: the conflict target is
       draft_section_id while the primary key is (unit_id, draft_section_id),
       so a section moving between units is two different rows and an upsert on
       the PK would leave the old one standing. */
    await tx.query(
      `DELETE FROM manuscript_structure_members WHERE draft_section_id = ANY($1::uuid[])`,
      [run.ids]);
    await tx.query(
      `INSERT INTO manuscript_structure_members (unit_id, draft_section_id)
       SELECT $1, unnest($2::uuid[])`,
      [input.unitId, run.ids]);
    return ok({ placed: run.ids.length });
  });
}

/**
 * The draft's flattening, as bytes.
 *
 * Exists for the invariant test, not for the room: it is how a caller proves
 * from OUTSIDE this module that a structure operation changed no character of
 * the member's manuscript.
 */
export async function flattenedBytes(draftId: string): Promise<string> {
  const r = await query<{ flat: string }>(
    `SELECT COALESCE(string_agg(text, '' ORDER BY position), '') AS flat
       FROM manuscript_draft_sections WHERE draft_id = $1`, [draftId]);
  return r.rows[0]?.flat ?? '';
}

async function siblingRows(
  tx: TransactionClient,
  manuscriptId: string,
  parentId: string | null,
  excludeId: string,
): Promise<UnitRow[]> {
  const r = await tx.query<{ id: string; position: number }>(
    parentId === null
      ? `SELECT id, position FROM manuscript_structure_units
          WHERE manuscript_id = $1 AND parent_id IS NULL AND id <> $2`
      : `SELECT id, position FROM manuscript_structure_units
          WHERE manuscript_id = $1 AND parent_id = $3 AND id <> $2`,
    parentId === null ? [manuscriptId, excludeId] : [manuscriptId, excludeId, parentId]);
  return r.rows.map((x) => ({
    id: x.id, parentId, position: x.position, kind: null, title: null, origin: 'member' as const,
  }));
}

async function applyPositions(
  tx: TransactionClient,
  positions: readonly { id: string; position: number }[],
): Promise<void> {
  if (positions.length === 0) return;
  await tx.query(
    `UPDATE manuscript_structure_units su SET position = v.position
       FROM (SELECT unnest($1::uuid[]) AS id, unnest($2::int[]) AS position) v
      WHERE su.id = v.id`,
    [positions.map((p) => p.id), positions.map((p) => p.position)]);
}
