/**
 * Coach Field — practitioner-authored notes.
 *
 * ONE note entity with explicit `purpose` and `visibility` (founder ruling 2026-08-02):
 *   "The template or presentation is a VIEW. The visibility is a GOVERNING PROPERTY of
 *    the record. Those are different concerns."
 * A private observation and a note for the client may use different FORMS. They are not
 * different ontological entities, and this module is the single writer for both.
 *
 * The relationship key is `practitioner_clients.id` (founder ruling 2026-08-02) — there is
 * no second relationship identity anywhere in this module family.
 *
 * ISOLATION (founder ruling D-NW-2): this module does NOT read, write, or depend on
 * `practitioner_client_notes` / `_continuity` (PRs #888/#889/#890, 0/12 acceptance
 * verified) or on `sessions.notes` (plaintext PHI, unruled). The reconciliation point is
 * recorded in the migration's §RECONCILIATION and is deliberately left open.
 *
 * THE PUBLICATION BOUNDARY
 * ------------------------
 * A practitioner-private note must not become client-visible through an ordinary edit of
 * the visibility field. That is enforced in the DATABASE by a trigger requiring the
 * transaction to declare itself (`SET LOCAL app.coach_note_publication = 'on'`). This
 * module is the only place that flag is ever set, and it sets it only inside `publish`,
 * `updateShared` and alongside an audit write. A bulk UPDATE, a reused component, or a
 * careless form POST therefore CANNOT publish — it raises, rather than leaking.
 */

import { query, transaction } from '@/lib/db/postgres';
import { requirePractitionerWrite, resolveForPractitioner, CoachFieldAccessError } from './access';

export type NotePurpose =
  | 'private_observation'
  | 'session_preparation'
  | 'follow_up'
  | 'client_guidance'
  | 'administrative';

export type NoteVisibility = 'practitioner_private' | 'client_visible';

export interface CoachNote {
  id: string;
  relationship_id: string;
  process_id: string | null;
  session_id: string | null;
  title: string | null;
  body: string;
  purpose: NotePurpose;
  visibility: NoteVisibility;
  published_at: string | Date | null;
  withdrawn_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const PURPOSES: NotePurpose[] = [
  'private_observation', 'session_preparation', 'follow_up', 'client_guidance', 'administrative',
];

export const isNotePurpose = (v: unknown): v is NotePurpose =>
  typeof v === 'string' && (PURPOSES as string[]).includes(v);

/**
 * Create a note. ALWAYS starts practitioner-private, whatever the purpose.
 *
 * Even purpose='client_guidance' is created private: a note written *for* the client is
 * still not *shown* to the client until the practitioner performs the explicit share act.
 * Authoring intent and publication are separate gestures — that separation is the whole
 * point of the boundary, and collapsing them here would defeat the trigger downstream.
 */
export async function createNote(input: {
  practitionerMemberId: string;
  relationshipId: string;
  processId?: string | null;
  sessionId?: string | null;
  title?: string | null;
  body: string;
  purpose: NotePurpose;
}): Promise<CoachNote> {
  await requirePractitionerWrite(input.practitionerMemberId, input.relationshipId);
  const body = input.body?.trim();
  if (!body) throw new CoachFieldAccessError('A note needs a body.', 422);

  const { rows } = await query<CoachNote>(
    `INSERT INTO coach_authored_notes
       (relationship_id, process_id, session_id, author_practitioner_id, title, body, purpose, visibility)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'practitioner_private')
     RETURNING *`,
    [
      input.relationshipId,
      input.processId ?? null,
      input.sessionId ?? null,
      input.practitionerMemberId,
      input.title?.trim() || null,
      body,
      input.purpose,
    ],
  );
  return rows[0];
}

/**
 * Edit a note's own content. Structurally CANNOT change visibility.
 *
 * If the note is already published, this updates the private record only — the client
 * continues to see what was last explicitly shared until `updateShared` is called. That
 * is the founder ruling: "Do not let a private editing form silently alter what the
 * client sees."
 */
export async function editNote(input: {
  practitionerMemberId: string;
  noteId: string;
  title?: string | null;
  body?: string;
  purpose?: NotePurpose;
}): Promise<CoachNote> {
  const note = await loadOwnedNote(input.practitionerMemberId, input.noteId);
  const { rows } = await query<CoachNote>(
    `UPDATE coach_authored_notes
        SET title   = COALESCE($2, title),
            body    = COALESCE($3, body),
            purpose = COALESCE($4, purpose)
      WHERE id = $1
      RETURNING *`,
    [note.id, input.title ?? null, input.body?.trim() || null, input.purpose ?? null],
  );
  return rows[0];
}

/**
 * THE PUBLICATION ACT — "Share with client".
 *
 * Requires the caller to pass back the exact body it showed the practitioner on the
 * confirmation screen. If the note changed underneath (another tab, a concurrent edit),
 * the confirmation the practitioner gave no longer describes what would become visible,
 * so we refuse rather than publish something they did not read. This is what makes
 * "show exactly what will become visible" enforceable rather than decorative.
 */
export async function publishNote(input: {
  practitionerMemberId: string;
  noteId: string;
  confirmedBody: string;
}): Promise<CoachNote> {
  const note = await loadOwnedNote(input.practitionerMemberId, input.noteId);

  if (note.visibility === 'client_visible' && !note.withdrawn_at) {
    throw new CoachFieldAccessError('This note is already shared with the client.', 409);
  }
  if (note.body.trim() !== input.confirmedBody.trim()) {
    throw new CoachFieldAccessError(
      'This note changed since you reviewed it. Read it again before sharing.', 409,
    );
  }

  return transaction(async (client) => {
    // The declaration that unlocks the DB trigger. Set ONLY here and in updateShared.
    await client.query(`SET LOCAL app.coach_note_publication = 'on'`);
    const { rows } = await client.query<CoachNote>(
      `UPDATE coach_authored_notes
          SET visibility = 'client_visible',
              published_at = COALESCE(published_at, NOW()),
              withdrawn_at = NULL
        WHERE id = $1
        RETURNING *`,
      [note.id],
    );
    await client.query(
      `INSERT INTO coach_note_publication_events (note_id, actor_member_id, action, body_snapshot)
       VALUES ($1,$2,'published',$3)`,
      [note.id, input.practitionerMemberId, rows[0].body],
    );
    return rows[0];
  });
}

/**
 * Push edits of an ALREADY-published note to the client. Explicit second act, on purpose:
 * editing privately and changing what the client sees are different decisions.
 */
export async function updateSharedNote(input: {
  practitionerMemberId: string;
  noteId: string;
  confirmedBody: string;
}): Promise<CoachNote> {
  const note = await loadOwnedNote(input.practitionerMemberId, input.noteId);
  if (note.visibility !== 'client_visible') {
    throw new CoachFieldAccessError('This note is not shared. Use Share with client.', 409);
  }
  if (note.body.trim() !== input.confirmedBody.trim()) {
    throw new CoachFieldAccessError('This note changed since you reviewed it.', 409);
  }
  return transaction(async (client) => {
    await client.query(
      `INSERT INTO coach_note_publication_events (note_id, actor_member_id, action, body_snapshot)
       VALUES ($1,$2,'updated_shared',$3)`,
      [note.id, input.practitionerMemberId, note.body],
    );
    const { rows } = await client.query<CoachNote>(
      `UPDATE coach_authored_notes SET updated_at = NOW() WHERE id = $1 RETURNING *`,
      [note.id],
    );
    return rows[0];
  });
}

/**
 * Withdraw from FUTURE client display. Never rewrites the historical fact that it was
 * shared: the note keeps published_at and the audit trail keeps every prior act.
 */
export async function withdrawNote(input: {
  practitionerMemberId: string;
  noteId: string;
}): Promise<CoachNote> {
  const note = await loadOwnedNote(input.practitionerMemberId, input.noteId);
  if (note.visibility !== 'client_visible' || note.withdrawn_at) {
    throw new CoachFieldAccessError('This note is not currently shared.', 409);
  }
  return transaction(async (client) => {
    // Note: visibility deliberately STAYS 'client_visible' with withdrawn_at set, so the
    // record still says "this was shared once". Reads filter on withdrawn_at IS NULL.
    const { rows } = await client.query<CoachNote>(
      `UPDATE coach_authored_notes SET withdrawn_at = NOW() WHERE id = $1 RETURNING *`,
      [note.id],
    );
    await client.query(
      `INSERT INTO coach_note_publication_events (note_id, actor_member_id, action)
       VALUES ($1,$2,'withdrawn')`,
      [note.id, input.practitionerMemberId],
    );
    return rows[0];
  });
}

/** Practitioner's own view: every note on a relationship, private ones included. */
export async function listNotesForPractitioner(
  practitionerMemberId: string,
  relationshipId: string,
): Promise<CoachNote[]> {
  const grant = await resolveForPractitioner(practitionerMemberId, relationshipId);
  if (!grant) throw new CoachFieldAccessError('No such client relationship.', 404);
  const { rows } = await query<CoachNote>(
    `SELECT * FROM coach_authored_notes
      WHERE relationship_id = $1 AND archived_at IS NULL
      ORDER BY created_at DESC`,
    [relationshipId],
  );
  return rows;
}

/**
 * CLIENT's view — "Notes from Larry".
 *
 * Keyed on the client credential. The WHERE clause makes a private note structurally
 * unreachable: visibility must be client_visible AND not withdrawn AND published_at set.
 * There is no parameter on this function that can relax any of those.
 */
export async function listNotesForClient(
  clientMemberId: string,
  opts: { processId?: string | null } = {},
): Promise<Array<CoachNote & { practitioner_name: string }>> {
  const { rows } = await query<any>(
    `SELECT n.*, m.name AS practitioner_name
       FROM coach_authored_notes n
       JOIN practitioner_clients pc ON pc.id = n.relationship_id
       JOIN members m ON m.id = n.author_practitioner_id
      WHERE pc.member_id = $1
        AND n.visibility   = 'client_visible'
        AND n.withdrawn_at IS NULL
        AND n.archived_at  IS NULL
        AND n.published_at IS NOT NULL
        AND ($2::uuid IS NULL OR n.process_id = $2)
      ORDER BY n.published_at DESC
      LIMIT 50`,
    [clientMemberId, opts.processId ?? null],
  );
  return rows;
}

async function loadOwnedNote(practitionerMemberId: string, noteId: string): Promise<CoachNote> {
  const { rows } = await query<CoachNote>(
    `SELECT n.* FROM coach_authored_notes n
       JOIN practitioner_clients pc ON pc.id = n.relationship_id
       JOIN practitioners p         ON p.id  = pc.practitioner_id
      WHERE n.id = $1 AND p.member_id = $2`,
    [noteId, practitionerMemberId],
  );
  if (!rows.length) throw new CoachFieldAccessError('No such note.', 404);
  return rows[0];
}
