/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · capture, against the database.
 *
 * READ-ONLY, BY CONSTRUCTION AND BY TEST. This module and everything under
 * `lib/manuscript/development/` contains no INSERT, UPDATE or DELETE
 * (`evidenceCannotAct.test.ts` walks the directory and asserts it). A capture
 * observes what the Work is; it does not checkpoint, convert, restore, or
 * touch structure. Where the latest revision is not the state now held, the
 * capture REFUSES — it does not helpfully make a revision so that it can
 * proceed. Whether a checkpoint should precede a reading, and who performs
 * it, is a BUILD-07B/07D question about a member's act.
 *
 * ONE CONSISTENT SNAPSHOT. The reads run inside one REPEATABLE READ
 * transaction, and the draft row is taken FOR SHARE. Every draft write path
 * (create, save, restore) locks that row FOR UPDATE, so a save cannot land
 * between reading the draft and reading its revision; structure writes lock
 * the manuscript rather than the draft, which is what the snapshot isolation
 * covers. Nothing is held past the read.
 *
 * NO MODEL, NO READER, NO PROMPT. Nothing here can reach a model or a reader
 * module, and the same test asserts that statically. What this returns is
 * evidence a reader may later be given; giving it is BUILD-07B.
 */

import { transaction, type TransactionClient } from '@/lib/db/postgres';
import type { RevisionSectionRange } from '@/lib/manuscript/draftSections';
import type { CanonicalMemberRow, CanonicalUnitRow } from '@/lib/manuscript/structure/structureDigest';
import {
  freezeReadState,
  type DevelopmentalEvidence,
  type FreezeRefusal,
  type LiveDraftState,
  type RevisionRecord,
  type StructureRows,
} from './readState';
import type { LiveWork } from './resolve';

export interface CaptureOptions {
  /** Section ids to be read at body depth. May be empty. */
  bodyScope: readonly string[];
  /**
   * Whether authoritative structure is being supplied to this reading. When
   * false, structural evidence is refused at bind — absent, not degraded.
   */
  withStructure: boolean;
}

export type CaptureRefusal =
  | FreezeRefusal
  /** No draft for this member and manuscript. Not distinguished from "not yours". */
  | 'not_found'
  /** The draft is not section-addressable, so no section is a stable identity yet. */
  | 'not_addressable'
  /** The draft has no revision at all. */
  | 'no_revision';

export type CaptureResult =
  | { ok: true; value: DevelopmentalEvidence }
  | { ok: false; refusal: CaptureRefusal; detail: string };

interface DraftRow {
  id: string;
  content: string;
  section_addressable_at: string | null;
}

async function readDraft(
  tx: TransactionClient,
  manuscriptId: string,
  memberId: string,
): Promise<DraftRow | null> {
  /* Ownership is in the predicate. A draft that is someone else's is
     indistinguishable here from one that does not exist. */
  const r = await tx.query<DraftRow>(
    `SELECT id, content, section_addressable_at
       FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2
      FOR SHARE`,
    [manuscriptId, memberId]);
  return r.rows[0] ?? null;
}

async function readSections(
  tx: TransactionClient,
  draftId: string,
): Promise<{ id: string; text: string }[]> {
  const r = await tx.query<{ id: string; text: string }>(
    `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position ASC`,
    [draftId]);
  return r.rows;
}

async function readLatestRevision(
  tx: TransactionClient,
  draftId: string,
): Promise<RevisionRecord | null> {
  const r = await tx.query<{ revision_number: number; content: string; section_partition: RevisionSectionRange[] | null }>(
    `SELECT revision_number, content, section_partition
       FROM working_draft_revisions
      WHERE draft_id = $1
      ORDER BY revision_number DESC
      LIMIT 1`,
    [draftId]);
  const row = r.rows[0];
  return row
    ? { revisionNumber: row.revision_number, content: row.content, sectionPartition: row.section_partition }
    : null;
}

/** The same columns, in the same order, that `canonicalFingerprint` selects. */
export async function readStructureRows(
  tx: TransactionClient,
  manuscriptId: string,
): Promise<StructureRows> {
  const units = await tx.query<CanonicalUnitRow>(
    `SELECT id, parent_id, position, kind, title, origin, adopted_from_id
       FROM manuscript_structure_units
      WHERE manuscript_id = $1
      ORDER BY id`, [manuscriptId]);
  const members = await tx.query<CanonicalMemberRow>(
    `SELECT m.unit_id, m.draft_section_id
       FROM manuscript_structure_members m
       JOIN manuscript_structure_units u ON u.id = m.unit_id
      WHERE u.manuscript_id = $1
      ORDER BY m.unit_id, m.draft_section_id`, [manuscriptId]);
  return { units: units.rows, members: members.rows };
}

/**
 * Freeze developmental evidence for a member's Work, from the revision that
 * exactly matches its current state.
 */
export async function captureEvidence(
  manuscriptId: string,
  memberId: string,
  options: CaptureOptions,
): Promise<CaptureResult> {
  return transaction(async (tx) => {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');

    const draft = await readDraft(tx, manuscriptId, memberId);
    if (!draft) return { ok: false as const, refusal: 'not_found' as const, detail: 'no draft for this member and manuscript' };
    if (draft.section_addressable_at === null) {
      return { ok: false as const, refusal: 'not_addressable' as const,
        detail: 'the draft is not section-addressable; no section has a stable identity yet' };
    }

    const [sections, revision] = await Promise.all([
      readSections(tx, draft.id),
      readLatestRevision(tx, draft.id),
    ]);
    if (!revision) {
      return { ok: false as const, refusal: 'no_revision' as const, detail: 'the draft has no revision' };
    }

    const live: LiveDraftState = { draftId: draft.id, content: draft.content, sections };
    const structure = options.withStructure ? await readStructureRows(tx, manuscriptId) : undefined;

    return freezeReadState({ draft: live, revision, bodyScope: options.bodyScope, structure });
  });
}

/** The content of one immutable revision, for `recoverEvidence`. Null when absent. */
export async function loadRevisionContent(
  draftId: string,
  revisionNumber: number,
): Promise<string | null> {
  return transaction(async (tx) => {
    const r = await tx.query<{ content: string }>(
      `SELECT content FROM working_draft_revisions WHERE draft_id = $1 AND revision_number = $2`,
      [draftId, revisionNumber]);
    return r.rows[0]?.content ?? null;
  });
}

/**
 * The Work as it stands now, for `locateCurrent`. Each part is null where it
 * could not be measured, so the caller's answer is `unmeasured` rather than a
 * guess.
 */
export async function loadLiveWork(
  manuscriptId: string,
  memberId: string,
): Promise<LiveWork> {
  return transaction(async (tx) => {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    const draft = await readDraft(tx, manuscriptId, memberId);
    if (!draft || draft.section_addressable_at === null) {
      return { sections: null, structure: null };
    }
    const [sections, structure] = await Promise.all([
      readSections(tx, draft.id),
      readStructureRows(tx, manuscriptId),
    ]);
    return { sections, structure };
  });
}
