export const dynamic = 'force-dynamic';

/**
 * PRACTITIONER CLIENT NOTE — single note
 *
 * PATCH  /api/studio/clients/[id]/notes/[noteId] - Edit a note
 * DELETE /api/studio/clients/[id]/notes/[noteId] - Delete a note
 *
 * Practitioner-private. Every statement scopes on practitioner_id from the
 * session, so a note belonging to another practitioner is a 404 rather than
 * a 403 — the existence of another practitioner's note is not disclosed.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import {
  encryptClientNoteContent,
  decryptClientNoteRow,
  type ClientNoteRow,
} from '@/lib/security/phiAccessors/practitionerClientNotes';
import { MAX_NOTE_LENGTH, NOTE_COLUMNS, validateSessionLink } from '../route';
import { isValidNoteDate } from '@/lib/studio/noteDate';
import { validateStatusUpdate } from '@/lib/studio/continuityKind';
import {
  validateLifecycleTransition,
  isEditableInPlace,
  findCompletionAuthorityField,
  LOCKED_NOTE_MESSAGE,
  COMPLETION_AUTHORITY_ERROR,
  COMPLETION_REVOCATION_ERROR,
  type NoteLifecycle,
} from '@/lib/studio/noteLifecycle';

type Params = { params: Promise<{ id: string; noteId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: clientId, noteId } = await params;

    const body = await request.json();
    const {
      content,
      note_date: noteDate,
      status,
      lifecycle,
      session_id: sessionId,
      expected_version: expectedVersion,
    } = body ?? {};

    if (
      content === undefined &&
      noteDate === undefined &&
      status === undefined &&
      lifecycle === undefined &&
      sessionId === undefined
    ) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if (
      expectedVersion !== undefined &&
      (!Number.isInteger(expectedVersion) || expectedVersion < 1)
    ) {
      return NextResponse.json(
        { error: 'expected_version must be a positive integer' },
        { status: 400 }
      );
    }

    // kind and promoted_from are IMMUTABLE after creation. Rejected, not ignored:
    //  - kind, because Carry Forward CREATES a new item rather than retyping an old one;
    //  - promoted_from, because provenance that can be edited is not provenance.
    if (body?.kind !== undefined) {
      return NextResponse.json(
        { error: 'kind cannot be changed after creation' },
        { status: 400 }
      );
    }
    if (body?.promoted_from !== undefined) {
      return NextResponse.json(
        { error: 'promoted_from cannot be changed after creation' },
        { status: 400 }
      );
    }

    // Completion authority is NOT client-settable — refused before anything is
    // read or written, so a rejected request cannot have partially applied.
    //
    // These fields were already inert (nothing below reads them), but silence
    // made a misleading contract: a client could send authority and receive an
    // ordinary 200 with no way to learn it was disregarded. Rejecting keeps the
    // transition unreachable by construction AND legible at the boundary.
    const authorityField = findCompletionAuthorityField(body);
    if (authorityField) {
      return NextResponse.json(
        {
          error: COMPLETION_AUTHORITY_ERROR,
          message: `${authorityField} is set by completing the note, not by updating it.`,
        },
        { status: 400 }
      );
    }

    // Same guard as POST: note_date reaches `$3::date`, so an invalid value would
    // otherwise surface as a 500 rather than a rejected request.
    if (noteDate !== undefined && noteDate !== null && !isValidNoteDate(noteDate)) {
      return NextResponse.json(
        { error: 'note_date must be a calendar date in YYYY-MM-DD form' },
        { status: 400 }
      );
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'content must be non-empty' }, { status: 400 });
      }
      if (content.length > MAX_NOTE_LENGTH) {
        return NextResponse.json(
          { error: `content exceeds ${MAX_NOTE_LENGTH} characters` },
          { status: 400 }
        );
      }
    }

    // The current row governs every remaining check — a status transition is only
    // meaningful on a commitment, a lifecycle transition depends on where the note
    // already is, and the lock depends on how it was completed. Read it once.
    // Scoped to this practitioner+client, so a row outside scope is simply not found.
    const existing = await db.query(
      `SELECT kind, lifecycle, completion_mode, version
         FROM practitioner_client_notes
        WHERE id = $1 AND client_id = $2 AND practitioner_id = $3`,
      [noteId, clientId, practitionerId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const current = existing.rows[0];
    const currentLifecycle: NoteLifecycle = current.lifecycle ?? 'completed';

    if (status !== undefined) {
      const check = validateStatusUpdate(current.kind, status);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
    }

    // Revoking completion is the third face of the same rule. It stays 409
    // rather than 400: the request is well-formed and the practitioner is
    // authorised — the note's STATE is what refuses it.
    const lifecycleCheck = validateLifecycleTransition(currentLifecycle, lifecycle);
    if (!lifecycleCheck.ok) {
      // A typo and a refused transition are different failures. 400 says the
      // request was malformed; 409 says it was fine and the note's state
      // refused it — the third face of the completion-authority rule.
      return lifecycleCheck.reason === 'revocation'
        ? NextResponse.json(
            { error: COMPLETION_REVOCATION_ERROR, message: lifecycleCheck.error },
            { status: 409 }
          )
        : NextResponse.json({ error: lifecycleCheck.error }, { status: 400 });
    }
    const completing = currentLifecycle === 'draft' && lifecycleCheck.value === 'completed';

    // The completed-note lock, read off completion_mode alone — the note is
    // locked because a practitioner declared it complete, not because some
    // timestamp is absent.
    //
    // Applies to the BODY and the date, the things that would rewrite the
    // record. `status` is deliberately exempt: a commitment moving
    // alive -> completed is the continuity object doing its job, not an edit of
    // a finished note.
    //
    // 409 rather than 403: the request is well-formed and the practitioner is
    // authorised. What refuses it is the state of the note.
    if (
      (content !== undefined || noteDate !== undefined) &&
      !isEditableInPlace(current.completion_mode)
    ) {
      return NextResponse.json({ error: LOCKED_NOTE_MESSAGE }, { status: 409 });
    }

    // Optimistic concurrency for the debounced autosave loop. Two saves in flight
    // can complete out of order; without this the STALER body would win and
    // silently discard writing the practitioner watched land.
    if (expectedVersion !== undefined && current.version !== expectedVersion) {
      return NextResponse.json(
        {
          error: 'This note changed somewhere else. Reload to see the current version.',
          currentVersion: current.version,
        },
        { status: 409 }
      );
    }

    const sessionLink = await validateSessionLink(sessionId, clientId, practitionerId);
    if ('error' in sessionLink) {
      return NextResponse.json({ error: sessionLink.error }, { status: 400 });
    }

    // Re-encrypt against the SAME row id so the AAD stays valid.
    const encrypted =
      content !== undefined
        ? encryptClientNoteContent(content.trim(), { rowId: noteId, practitionerId })
        : null;

    // `version` increments on every update — it is the token the next autosave
    // echoes back. The WHERE clause re-checks it so the guard above cannot be
    // defeated by a write landing between the read and this statement.
    //
    // session_id COALESCEs, so omitting it leaves the link alone. Unlinking is
    // deliberately not offered in this slice.
    const updated = await db.query(
      `UPDATE practitioner_client_notes
          SET content_enc      = COALESCE($1, content_enc),
              content_enc_meta = COALESCE($2::jsonb, content_enc_meta),
              note_date        = COALESCE($3::date, note_date),
              status           = COALESCE($7, status),
              lifecycle        = COALESCE($8, lifecycle),
              -- Completing through this route IS the governed declaration.
              completion_mode  = CASE WHEN $9::boolean THEN 'practitioner_declared'
                                      ELSE completion_mode END,
              completed_at     = CASE WHEN $9::boolean THEN NOW() ELSE completed_at END,
              session_id       = COALESCE($10::uuid, session_id),
              version          = version + 1,
              updated_at       = NOW()
        WHERE id = $4 AND client_id = $5 AND practitioner_id = $6
          AND ($11::int IS NULL OR version = $11::int)
       RETURNING ${NOTE_COLUMNS}`,
      [
        encrypted?.contentEnc ?? null,
        encrypted?.contentEncMeta ?? null,
        noteDate ?? null,
        noteId,
        clientId,
        practitionerId,
        status ?? null,
        lifecycleCheck.value ?? null,
        completing,
        sessionLink.value,
        expectedVersion ?? null,
      ]
    );

    if (updated.rows.length === 0) {
      // The row was read a moment ago under the same scope, so zero rows here
      // means the version guard in the WHERE clause caught a concurrent write.
      // Reporting 404 would be a lie — the note exists, it just moved.
      if (expectedVersion !== undefined) {
        return NextResponse.json(
          { error: 'This note changed somewhere else. Reload to see the current version.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const note = decryptClientNoteRow(updated.rows[0] as ClientNoteRow);
    if (!note) {
      console.error('[ClientNotes] PATCH wrote a note that failed to decrypt:', noteId);
      return NextResponse.json({ error: 'Note saved but could not be read back' }, { status: 500 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('[ClientNotes] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: clientId, noteId } = await params;

    const deleted = await db.query(
      `DELETE FROM practitioner_client_notes
        WHERE id = $1 AND client_id = $2 AND practitioner_id = $3
       RETURNING id`,
      [noteId, clientId, practitionerId]
    );

    if (deleted.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[ClientNotes] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
