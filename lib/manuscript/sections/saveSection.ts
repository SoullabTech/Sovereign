/**
 * WS2-04B — the section-aware write path.
 *
 * Once a draft is section-addressable, the browser edits ONE SECTION and never
 * submits a whole-manuscript string. That is not a convenience: a client that
 * posts the entire draft can silently carry a stale copy of every section it
 * did not touch, and a save of section A would rewrite section B with whatever
 * the browser last happened to hold.
 *
 * So the write contract is:
 *
 *     draft_section_id + body + baseVersion
 *          ↓
 *     lock the draft, check the version
 *     update that ONE section row
 *     derive content from the ordered sections, in SQL
 *     increment version ONCE
 *          ↓
 *     the deferred invariant verifies the two representations agree
 *
 * Content is DERIVED, never accepted. Nothing the client sends can make the
 * compatibility representation disagree with the sections.
 *
 * HEADINGS ARE READ-ONLY IN THIS CUT (founder ruling, 04B v1). A section's
 * stored text contains its heading bytes, but there is no draft-level heading
 * field — only source_section_id provenance. Editing a heading through the
 * body box would mean inferring "first line = heading" forever, which goes
 * ambiguous the moment a section has no heading or a member deletes one. So
 * the heading is rendered structurally, the body is editable, and rename /
 * split / merge become explicit structure operations later rather than hidden
 * behaviour inside a text box.
 */

import { createHash } from 'node:crypto';
import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { splitStoredSection } from './sectionProjection';

export type SaveRefusal =
  | 'draft_not_found'
  | 'not_section_addressable'
  | 'stale_base'
  | 'section_not_found'
  | 'heading_prefix_not_found';

export interface SaveResult {
  status: 'saved' | 'refused';
  refusal?: SaveRefusal;
  detail?: string;
  version?: number;
  sectionChars?: number;
  /**
   * A1-LS1 · R3 — on success, WHICH precondition admitted the save.
   * 'version': the draft was still at the client's base version, so nothing
   * else in the Work had changed and the new version is fully known to it.
   * 'observed_body': the draft had moved on elsewhere and only THIS section's
   * body matched — the new version then includes changes the client has not
   * seen, and it must not adopt that version as its base.
   */
  acceptedBy?: 'version' | 'observed_body';
  /** A1-LS1 · R3 — on success, SHA-256 of the body exactly as saved (the next observed body). */
  observedBodySha256?: string;
}

/** One section, as the writing surface needs it. */
export interface EditableSection {
  id: string;
  position: number;
  heading: string | null;
  /** The member's editable text when `editable`; the whole opaque slice when not. */
  body: string;
  /**
   * Whether this cut can edit the section.
   *
   * False when the stored slice does not begin with the heading the Source
   * records — still scaffolded, or a shape this cut does not understand. The
   * UI must not offer an edit gesture the server is guaranteed to refuse, and
   * without this flag it could not tell the two cases apart: an opaque slice
   * arrives in `body` looking exactly like editable text.
   */
  editable: boolean;
}

/**
 * Load the ordered sections of an addressable draft for the writing surface.
 * `id` is the stable navigation identity — the outline and the canvas agree on
 * a section because they name the same row, never because they counted to the
 * same number.
 */
export async function loadEditableSections(
  manuscriptId: string,
  memberId: string,
): Promise<{ sections: EditableSection[]; version: number } | null> {
  const { query } = await import('@/lib/db/postgres');
  const draft = await query<{ id: string; version: string; section_addressable_at: Date | null }>(
    `SELECT id, version, section_addressable_at FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`, [manuscriptId, memberId]);
  if (draft.rows.length === 0 || draft.rows[0].section_addressable_at === null) return null;

  const rows = await query<{ id: string; position: number; text: string; heading: string | null }>(
    `SELECT s.id, s.position, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1 ORDER BY s.position ASC`, [draft.rows[0].id]);

  return {
    version: Number(draft.rows[0].version),
    sections: rows.rows.map((r) => {
      const split = splitStoredSection(r.text, r.heading);
      return {
        id: r.id,
        position: r.position,
        heading: r.heading,
        /* A section whose shape this cut cannot split is shown whole and
           read-only rather than silently reinterpreted. */
        body: split ? split.body : r.text,
        editable: split !== null,
      };
    }),
  };
}

/**
 * Save one section. ONE logical save, ONE transaction, ONE version increment.
 *
 * ⭐ THIS IS NOW A WRAPPER, AND THE BEHAVIOUR IS UNCHANGED. The body moved to
 * `saveSectionInTransaction` so that an authority which must bind its own
 * decision to this mutation — RevisionProposal acceptance — can run both on ONE
 * client, inside ONE transaction.
 *
 * ⛔ WHY IT COULD NOT SIMPLY BE CALLED FROM INSIDE ANOTHER TRANSACTION:
 * `transaction()` takes a NEW client from the pool. Calling this from within an
 * outer transaction would put the mutation on a different connection, outside
 * the caller's BEGIN — so a rollback would not undo it. That is exactly the
 * defect caught in the D1 witness, where a pooled `query('BEGIN')` made the
 * rollback a fiction.
 *
 * ⛔ AND IT IS NOT A SECOND WRITE PATH. It is the same implementation, exposed
 * at its proper transactional seam. A duplicated read inside one transaction is
 * acceptable; a duplicated UPDATE is not.
 */
export async function saveSection(
  manuscriptId: string,
  memberId: string,
  draftSectionId: string,
  body: string,
  baseVersion: number,
  observedBodySha256?: string | null,
): Promise<SaveResult> {
  return transaction((tx: TransactionClient) =>
    saveSectionInTransaction(tx, manuscriptId, memberId, draftSectionId, body, baseVersion, observedBodySha256));
}

/**
 * A1-LS1 · R3 — the only digest form accepted as a concurrency precondition:
 * lowercase hex SHA-256. Anything else is treated as ABSENT, and absence never
 * weakens protection — the draft-version rule then decides alone.
 */
const OBSERVED_DIGEST = /^[0-9a-f]{64}$/;

/** SHA-256 over the exact UTF-8 bytes of a section body. No normalization. */
export function sectionBodySha256(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

/**
 * The mutation itself, on a caller-supplied client.
 *
 * ⛔ IT KNOWS NOTHING OF PROPOSALS. Expected text, single-use acceptance and
 * proposal locking are AUTHORIZATION, and they stay with the authority that
 * owns them. This owns the manuscript lock, the version discipline, the section
 * mutation, the content derivation and the one version increment — and nothing
 * else is taught to it.
 */
export async function saveSectionInTransaction(
  tx: TransactionClient,
  manuscriptId: string,
  memberId: string,
  draftSectionId: string,
  body: string,
  baseVersion: number,
  /**
   * A1-LS1 · R3 — SHA-256 of this section's body exactly as the client last
   * observed it (as delivered by the context route, or as it last saved it).
   * A concurrency precondition only: never stored, never shown, not a version.
   */
  observedBodySha256?: string | null,
): Promise<SaveResult> {
  {
    const draftRes = await tx.query<{
      id: string; version: string; section_addressable_at: Date | null;
    }>(
      `SELECT id, version, section_addressable_at FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId]);
    if (draftRes.rows.length === 0) return { status: 'refused', refusal: 'draft_not_found' as const };
    const draft = draftRes.rows[0];
    if (draft.section_addressable_at === null) {
      return { status: 'refused', refusal: 'not_section_addressable' as const };
    }
    /* A1-LS1 · R3 — SECTION-LOCAL CONCURRENCY, decided HERE, under the draft
       row lock taken above, in the same transaction that performs the save.
       A save is accepted when EITHER the draft is still at the version the
       client built on, OR the body of THIS section is still byte-for-byte the
       body the client last observed. The draft version says something
       changed; the observed-body digest says whether the thing being changed
       changed. A change elsewhere in the Work therefore cannot make this
       section conflict — and a change to this section always does.

       Without a valid digest the draft-version rule decides alone, exactly as
       before, in the same order: a stale version is refused before anything
       else is read. */
    const versionMatches = Number(draft.version) === baseVersion;
    const observed = typeof observedBodySha256 === 'string' && OBSERVED_DIGEST.test(observedBodySha256)
      ? observedBodySha256 : null;
    if (!versionMatches && observed === null) {
      return {
        status: 'refused', refusal: 'stale_base' as const,
        detail: `draft is at version ${draft.version}`,
      };
    }

    const secRes = await tx.query<{ id: string; text: string; heading: string | null }>(
      `SELECT s.id, s.text, ms.heading
         FROM manuscript_draft_sections s
         LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        WHERE s.id = $1 AND s.draft_id = $2`, [draftSectionId, draft.id]);
    if (secRes.rows.length === 0) return { status: 'refused', refusal: 'section_not_found' as const };
    const sec = secRes.rows[0];

    const split = splitStoredSection(sec.text, sec.heading);
    if (!split) return { status: 'refused', refusal: 'heading_prefix_not_found' as const };

    if (!versionMatches && sectionBodySha256(split.body) !== observed) {
      return {
        status: 'refused', refusal: 'stale_base' as const,
        detail: `draft is at version ${draft.version}`,
      };
    }

    /* The heading is carried over untouched. In this cut the member cannot
       change it, and the server does not take their word for what it was. */
    const newText = split.headingPrefix + body;

    await tx.query(
      `UPDATE manuscript_draft_sections SET text = $2, updated_at = now() WHERE id = $1`,
      [sec.id, newText]);

    /* DERIVE the compatibility representation from the sections themselves, in
       the same statement space the trigger will check. The client's copy of
       the rest of the manuscript never enters this. */
    const updated = await tx.query<{ version: string }>(
      `UPDATE manuscript_working_drafts
          SET content = (SELECT COALESCE(string_agg(text, '' ORDER BY position), '')
                           FROM manuscript_draft_sections WHERE draft_id = $1),
              version = version + 1,
              updated_at = now()
        WHERE id = $1
        RETURNING version`, [draft.id]);

    return {
      status: 'saved',
      version: Number(updated.rows[0].version),
      sectionChars: newText.length,
      acceptedBy: versionMatches ? 'version' : 'observed_body',
      observedBodySha256: sectionBodySha256(body),
    };
  }
}

/* ────────────────────────────────────────────────────────────────────────
   THE THREE TRUTHFUL STATES.

   A draft is in exactly one of these, and the writing surface says which
   rather than falling back to a single "not ready" that quietly implies the
   others. Founder ruling, 2026-08-30.
   ──────────────────────────────────────────────────────────────────────── */

export type DraftWriteState =
  /** Converted: sections are the writing authority, outline navigates. */
  | { kind: 'section_aware'; sections: EditableSection[]; version: number }
  /** Not converted yet. The existing continuous editor, outline inert. */
  | { kind: 'continuous'; content: string; version: number }
  /** Converted is not provable for this draft. Continuous, and the outline
      offers no navigation — never a guess at where sections fall. */
  | { kind: 'continuous_unprovable'; content: string; version: number; reason: string }
  /**
   * The draft is section-addressable but its writing state could not be
   * established. Mounts NEITHER engine — see resolveDraftWriteState.
   */
  | { kind: 'indeterminate' }
  | { kind: 'no_draft' };

/**
 * What the writing surface should render, decided on the server.
 *
 * The client never infers this. A UI that decides for itself whether sections
 * exist will eventually decide wrong on a draft mid-conversion and offer
 * navigation into rows that are not there.
 *
 * NOTE ON WHAT THIS DOES NOT DO: it never converts. During this cut a
 * convertible-but-unconverted draft reports `continuous`, and conversion stays
 * an explicit act. When 04B is activated, the open path re-proves eligibility
 * and converts BEFORE the UI claims navigation exists — so there is never an
 * intermediate screen with an empty outline beside a working manuscript.
 */
export async function resolveDraftWriteState(
  manuscriptId: string,
  memberId: string,
): Promise<DraftWriteState> {
  const { query } = await import('@/lib/db/postgres');
  const draft = await query<{
    id: string; content: string; version: string; section_addressable_at: Date | null;
  }>(
    `SELECT id, content, version, section_addressable_at
       FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
    [manuscriptId, memberId]);
  if (draft.rows.length === 0) return { kind: 'no_draft' };
  const d = draft.rows[0];
  const version = Number(d.version);

  if (d.section_addressable_at !== null) {
    const loaded = await loadEditableSections(manuscriptId, memberId);
    if (loaded) return { kind: 'section_aware', sections: loaded.sections, version: loaded.version };
    /* FAIL CLOSED. The draft IS section-addressable but its sections could not
       be loaded. Falling through to the classification below would answer
       `continuous` and hand a section-authoritative draft to the
       whole-manuscript writer, where one save overwrites every section at
       once. The honest answer is that the mode could not be established. */
    return { kind: 'indeterminate' };
  }

  /* Unconverted. Say WHY navigation is unavailable when it is structurally
     unavailable, so the outline can be honest instead of merely inert. */
  const { classifyDraft } = await import('./draftProof');
  const sections = await query<{ heading: string | null; body: string }>(
    `SELECT heading, body FROM manuscript_sections
      WHERE manuscript_id = $1 ORDER BY position ASC`, [manuscriptId]);
  const verdict = classifyDraft(sections.rows, d.content);
  const provable =
    verdict.classification === 'PRISTINE' ||
    verdict.classification === 'LEGACY_COMPOSER_VARIANT' ||
    (verdict.classification === 'EDITED' &&
      verdict.proof.otherHeadingDiff === 0 &&
      verdict.proof.resolved === verdict.proof.boundaries);

  return provable
    ? { kind: 'continuous', content: d.content, version }
    : { kind: 'continuous_unprovable', content: d.content, version, reason: verdict.classification };
}
