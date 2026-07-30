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
    const { content, note_date: noteDate } = body ?? {};

    if (content === undefined && noteDate === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
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
              updated_at       = NOW()
        WHERE id = $4 AND client_id = $5 AND practitioner_id = $6
       RETURNING id, client_id, practitioner_id, content_enc, content_enc_meta,
                 note_date, created_at, updated_at`,
      [
        encrypted?.contentEnc ?? null,
        encrypted?.contentEncMeta ?? null,
        noteDate ?? null,
        noteId,
        clientId,
        practitionerId,
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
