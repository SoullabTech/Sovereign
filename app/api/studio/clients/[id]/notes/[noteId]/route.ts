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
import { MAX_NOTE_LENGTH } from '../route';
import { isValidNoteDate } from '@/lib/studio/noteDate';
import { validateStatusUpdate } from '@/lib/studio/continuityKind';

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
    const { content, note_date: noteDate, status } = body ?? {};

    if (content === undefined && noteDate === undefined && status === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
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

    // A status transition is only meaningful on a commitment, so the existing kind
    // must be read before it can be validated. Scoped to this practitioner+client —
    // a row outside scope is simply not found.
    if (status !== undefined) {
      const existing = await db.query(
        `SELECT kind FROM practitioner_client_notes
          WHERE id = $1 AND client_id = $2 AND practitioner_id = $3`,
        [noteId, clientId, practitionerId]
      );
      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const check = validateStatusUpdate(existing.rows[0].kind, status);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
    }

    // Re-encrypt against the SAME row id so the AAD stays valid.
    const encrypted =
      content !== undefined
        ? encryptClientNoteContent(content.trim(), { rowId: noteId, practitionerId })
        : null;

    const updated = await db.query(
      `UPDATE practitioner_client_notes
          SET content_enc      = COALESCE($1, content_enc),
              content_enc_meta = COALESCE($2::jsonb, content_enc_meta),
              note_date        = COALESCE($3::date, note_date),
              status           = COALESCE($7, status),
              updated_at       = NOW()
        WHERE id = $4 AND client_id = $5 AND practitioner_id = $6
       RETURNING id, client_id, practitioner_id, content_enc, content_enc_meta,
                 note_date, created_at, updated_at, kind, status, promoted_from`,
      [
        encrypted?.contentEnc ?? null,
        encrypted?.contentEncMeta ?? null,
        noteDate ?? null,
        noteId,
        clientId,
        practitionerId,
        status ?? null,
      ]
    );

    if (updated.rows.length === 0) {
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
