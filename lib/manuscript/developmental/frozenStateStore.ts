/**
 * BUILD-07A — the adapter between PostgreSQL rows and the pure substrate.
 *
 * WHY THIS FILE EXISTS SEPARATELY. `frozenState.ts` has no database, no model,
 * no write verb, and a falsifier asserts that over its SOURCE — so the claim is
 * about what it CAN do, not about what one code path happened to do. Putting a
 * query in there would end that guarantee. Everything here is loading; every
 * rule stays next door.
 *
 * ⛔ IT IS READ-ONLY BY CONSTRUCTION. No INSERT, no UPDATE, no DELETE. Recovering
 * what a reading rested on must never be able to change the Work it rested on.
 *
 * ⛔ THE TWO LOADS ARE DIFFERENT OBJECTS, and keeping them apart is the point:
 *
 *     loadRevisionSnapshot   an IMMUTABLE revision. Never rewritten, so a range
 *                            into it means the same characters forever.
 *     loadCurrentSection     the LIVE draft. Changes on the next keystroke.
 *
 * A resolver that loaded the live section and called it history would be the
 * re-anchoring INV-19 forbids — an observation made against one state of the
 * Work surviving that state changing by being re-pointed at the new one.
 */
import { query } from '@/lib/db/postgres';
import type { DraftSectionState, RevisionSectionRange } from '@/lib/manuscript/draftSections';
import type { RevisionSnapshot } from './frozenState';
import {
  proveExactReadRevision,
  type ReadStateAdmissibility,
  type CandidateRevision,
} from './exactReadState';

export type LoadFailure =
  /** No such draft for this member, or no such revision of it. */
  | 'revision_not_found'
  /** The draft exists but holds no section by that id right now. */
  | 'section_not_found';

export type Loaded<T> = { ok: true; value: T } | { ok: false; failure: LoadFailure; detail: string };

/**
 * One immutable revision, as the substrate needs it.
 *
 * Member-scoped through the draft, with the same no-existence-leak discipline as
 * the manuscript routes: a revision of someone else's draft is not found, not
 * forbidden.
 *
 * `partition` may legitimately be NULL — the revision predates the draft
 * becoming section-addressable, and its boundaries were never observed. That is
 * carried through as it stands; the pure resolver refuses it by name rather than
 * inventing boundaries, and this loader must not smuggle in a guess.
 */
export async function loadRevisionSnapshot(
  draftId: string,
  memberId: string,
  revisionNumber: number,
): Promise<Loaded<RevisionSnapshot>> {
  const r = await query<{ content: string; section_partition: unknown }>(
    `SELECT r.content, r.section_partition
       FROM working_draft_revisions r
       JOIN manuscript_working_drafts d ON d.id = r.draft_id
      WHERE r.draft_id = $1 AND d.member_id = $2 AND r.revision_number = $3`,
    [draftId, memberId, revisionNumber],
  );
  if (r.rows.length === 0) {
    return {
      ok: false,
      failure: 'revision_not_found',
      detail: `no revision ${revisionNumber} of this draft`,
    };
  }
  return {
    ok: true,
    value: {
      revisionNumber,
      content: r.rows[0].content,
      /* jsonb arrives parsed. Passed through unvalidated ON PURPOSE: the pure
         resolver checks contiguity and coverage itself, and validating here too
         would put the same rule in two places to drift apart. */
      partition: (r.rows[0].section_partition ?? null) as RevisionSectionRange[] | null,
    },
  };
}

/**
 * One section of the LIVE draft — the other half of the currentness comparison.
 *
 * Returns `section_not_found` when the section is gone. ⛔ It does not look for
 * a similar one: a passage matched to a neighbour is invented evidence, and the
 * honest answer to "where is it now" is sometimes "nowhere".
 */
export async function loadCurrentSection(
  draftId: string,
  memberId: string,
  sectionId: string,
): Promise<Loaded<DraftSectionState>> {
  const r = await query<{ id: string; text: string }>(
    `SELECT s.id, s.text
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE s.draft_id = $1 AND d.member_id = $2 AND s.id = $3`,
    [draftId, memberId, sectionId],
  );
  if (r.rows.length === 0) {
    return {
      ok: false,
      failure: 'section_not_found',
      detail: `the draft no longer holds section ${sectionId}`,
    };
  }
  return { ok: true, value: { id: r.rows[0].id, text: r.rows[0].text } };
}

/**
 * The divisions the MEMBER authored — the only admissible structural identities.
 *
 * ⛔ THE MASQUERADE THIS EXISTS TO STOP IS SUBTLE. A proposal id is a `uuid`,
 * exactly like a unit id, so a structural reference carrying one is
 * indistinguishable by shape from a legitimate reference. Only membership in
 * THIS set can tell them apart. (A reviewed unit key — `p1`, `p3` — is
 * proposal-internal and not even a uuid, so it fails on sight; the dangerous
 * case is the one that looks right.)
 *
 * ⛔ ADOPTED UNITS ARE CANONICAL. A unit carrying `adopted_from_proposal_id` was
 * authored by the member from a reviewed reading; the provenance records where
 * it descended from and does not demote it. Excluding adopted units would be the
 * mirror error of admitting proposals — it would tell an author that structure
 * they explicitly authored is not their own.
 *
 * `origin = 'proposed'` is excluded on principle although nothing writes it any
 * more (05B moved proposals into their own table). The exclusion costs nothing
 * and the alternative is trusting that no future migration reintroduces the row
 * shape 05A once had.
 */
export async function loadCanonicalUnitIds(
  manuscriptId: string,
  memberId: string,
): Promise<ReadonlySet<string>> {
  const r = await query<{ id: string }>(
    `SELECT u.id
       FROM manuscript_structure_units u
       JOIN member_manuscripts m ON m.id = u.manuscript_id
      WHERE u.manuscript_id = $1 AND m.member_id = $2 AND u.origin <> 'proposed'`,
    [manuscriptId, memberId],
  );
  return new Set(r.rows.map((x) => x.id));
}

/**
 * SEAM A, at the custody boundary — find the frozen revision the current Work
 * exactly equals, if the member has frozen one.
 *
 * ⛔ IT WRITES NOTHING. Not a revision, not a checkpoint, not a flag. Asking
 * whether a frozen version exists must never be the act of creating one.
 *
 * The SQL narrows to byte-identical candidates and no further: PostgreSQL's `=`
 * on text is collation-dependent and may be nondeterministic, so the comparison
 * is on bytea — the same discipline the round-trip trigger uses, for the same
 * reason. Every candidate is then proven whole in the pure predicate, partition
 * included, because identical prose cut at different boundaries is a different
 * input.
 *
 * ⛔ NOT "the latest revision". A writer may change a sentence and restore it;
 * the frozen version they are again standing on could be any of them. Taking
 * the newest would refuse a Work that is character-for-character frozen.
 */
export async function findExactReadRevision(
  draftId: string,
  memberId: string,
  currentSections: readonly DraftSectionState[],
): Promise<ReadStateAdmissibility> {
  const candidates = await query<{ revision_number: number; content: string; section_partition: unknown }>(
    `SELECT r.revision_number, r.content, r.section_partition
       FROM working_draft_revisions r
       JOIN manuscript_working_drafts d ON d.id = r.draft_id
      WHERE r.draft_id = $1 AND d.member_id = $2
        AND convert_to(r.content, 'UTF8') = convert_to(d.content, 'UTF8')
      ORDER BY r.revision_number DESC`,
    [draftId, memberId],
  );

  if (candidates.rows.length === 0) {
    return {
      ok: false,
      refusal: 'checkpoint_required',
      detail: 'no frozen version of this Work matches it as it now stands',
    };
  }

  /* REFUSAL PRECEDENCE, FROZEN. When several revisions hold this exact prose and
     none survives the whole proof, the reported reason is the one from the
     MOST RECENT of them — the rows arrive `ORDER BY revision_number DESC`, so
     that is the first refusal seen and it is the one kept.
     ⛔ Keeping the LAST instead would make the answer depend on how many older
     revisions happen to share the same prose: a member could see
     `partition_not_recorded` one day and `partition_mismatch` the next without
     touching their Work. A client cannot map an order-dependent refusal to
     member-facing behaviour, and this is the same discipline the section-save
     contract froze for its own refusals. */
  let firstRefusal: ReadStateAdmissibility | null = null;
  for (const row of candidates.rows) {
    const candidate: CandidateRevision = {
      revisionNumber: row.revision_number,
      content: row.content,
      partition: (row.section_partition ?? null) as CandidateRevision['partition'],
    };
    const proof = proveExactReadRevision(candidate, currentSections);
    if (proof.ok) return proof;
    if (firstRefusal === null) firstRefusal = proof;
  }
  /* Prose matched and nothing survived the whole proof. The refusal reports WHY
     the most recent candidate failed rather than flattening to "no". */
  return firstRefusal as ReadStateAdmissibility;
}