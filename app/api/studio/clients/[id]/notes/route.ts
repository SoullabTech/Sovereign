export const dynamic = 'force-dynamic';

/**
 * PRACTITIONER CLIENT NOTES API
 *
 * GET  /api/studio/clients/[id]/notes - List this practitioner's notes on a client
 * POST /api/studio/clients/[id]/notes - Create a note
 *
 * Practitioner-private. Identity is derived from the session via
 * getCurrentPractitioner() and NEVER accepted from a query parameter or
 * request body — see docs/security/free-text-phi-doctrine.md and the
 * middleware role-trust security lane.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';
import {
  encryptClientNoteContent,
  decryptClientNoteRow,
  decryptClientNoteRows,
  type ClientNoteRow,
} from '@/lib/security/phiAccessors/practitionerClientNotes';
import { isValidNoteDate } from '@/lib/studio/noteDate';
import { validateContinuityCreate, isUuid } from '@/lib/studio/continuityKind';
import { validateLifecycleCreate } from '@/lib/studio/noteLifecycle';

type Params = { params: Promise<{ id: string }> };

export const MAX_NOTE_LENGTH = 20000;

/** The columns every note response is built from. Kept in one place so GET, POST and PATCH cannot drift. */
export const NOTE_COLUMNS = `id, client_id, practitioner_id, content_enc, content_enc_meta,
              note_date, created_at, updated_at, kind, status, promoted_from,
              lifecycle, completed_at, version, session_id`;

/** Confirm the client exists AND belongs to this practitioner. */
async function assertClientOwned(clientId: string, practitionerId: string): Promise<boolean> {
  const result = await db.query(
    `SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  return result.rows.length > 0;
}

/**
 * Validate an optional session link.
 *
 * All THREE must agree — the session exists, belongs to this practitioner, AND
 * is for this client. A composite FK cannot express this because
 * sessions.client_id is itself nullable, so it is enforced here and covered by
 * an explicit test.
 *
 * ⛔ A session is never inferred from proximity in time. The practitioner
 * supplies the id or the note stays unlinked.
 *
 * Returns an error string, or null when the link is acceptable.
 */
export async function validateSessionLink(
  sessionId: unknown,
  clientId: string,
  practitionerId: string
): Promise<{ error: string } | { value: string | null }> {
  if (sessionId === undefined || sessionId === null) return { value: null };
  if (!isUuid(sessionId)) return { error: 'session_id must be a uuid' };

  const result = await db.query(
    `SELECT id FROM sessions
      WHERE id = $1 AND practitioner_id = $2 AND client_id = $3`,
    [sessionId, practitionerId, clientId]
  );
  if (result.rows.length === 0) {
    // Same posture as a note outside scope: do not disclose whether the session
    // exists under some other practitioner or client.
    return { error: 'session_id must reference a session with this client' };
  }
  return { value: sessionId as string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: clientId } = await params;

    if (!(await assertClientOwned(clientId, practitionerId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT ${NOTE_COLUMNS}
         FROM practitioner_client_notes
        WHERE client_id = $1 AND practitioner_id = $2
        ORDER BY note_date DESC, created_at DESC`,
      [clientId, practitionerId]
    );

    return NextResponse.json({
      notes: decryptClientNoteRows(result.rows as ClientNoteRow[]),
    });
  } catch (error) {
    console.error('[ClientNotes] GET error:', error);
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id: clientId } = await params;

    if (!(await assertClientOwned(clientId, practitionerId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, note_date: noteDate, lifecycle, session_id: sessionId } = body ?? {};

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (content.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { error: `content exceeds ${MAX_NOTE_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (noteDate !== undefined && noteDate !== null && !isValidNoteDate(noteDate)) {
      return NextResponse.json(
        { error: 'note_date must be a calendar date in YYYY-MM-DD form' },
        { status: 400 }
      );
    }

    // Continuity triple. Rejects rather than coerces: a status on a non-commitment
    // is an error, not something to drop; a malformed commitment is not defaulted.
    const continuity = validateContinuityCreate(body ?? {});
    if (!continuity.ok) {
      return NextResponse.json({ error: continuity.error }, { status: 400 });
    }

    // Lifecycle is a SEPARATE axis from the commitment status validated above.
    // Omitted means 'completed', so a client that knows nothing about drafts —
    // including Carry Forward — keeps its existing behaviour exactly.
    const lifecycleCheck = validateLifecycleCreate(lifecycle, continuity.value!.kind);
    if (!lifecycleCheck.ok) {
      return NextResponse.json({ error: lifecycleCheck.error }, { status: 400 });
    }

    const sessionLink = await validateSessionLink(sessionId, clientId, practitionerId);
    if ('error' in sessionLink) {
      return NextResponse.json({ error: sessionLink.error }, { status: 400 });
    }

    // promoted_from is PROVENANCE ONLY — the server stores the id and copies
    // nothing. The practitioner supplies the wording they want kept.
    // Scope is enforced by a composite FK in the database; this pre-check exists
    // so a cross-scope id returns a clean 400 rather than surfacing as a 500.
    if (continuity.value!.promotedFrom) {
      const source = await db.query(
        `SELECT id FROM practitioner_client_notes
          WHERE id = $1 AND client_id = $2 AND practitioner_id = $3`,
        [continuity.value!.promotedFrom, clientId, practitionerId]
      );
      if (source.rows.length === 0) {
        return NextResponse.json(
          { error: 'promoted_from must reference a note on this client' },
          { status: 400 }
        );
      }
    }

    // The row id must exist before encryption — the AAD binds to it.
    const noteId = randomUUID();
    const { contentEnc, contentEncMeta } = encryptClientNoteContent(content.trim(), {
      rowId: noteId,
      practitionerId,
    });

    // completed_at records the moment a practitioner explicitly declared a
    // SESSION NOTE finished. It is what locks the note against ordinary edits.
    //
    // Stamped only for kind='note'. A commitment, recognition, or detail is
    // created whole by Carry Forward and its editability is governed by the
    // 2026-07-31 continuity ruling, which this slice does not touch — stamping
    // them would silently take the edit affordance away from
    // ClientContinuityPanel, which patches item content.
    //
    // Left null by the 20260802000002 backfill for the same reason it exists:
    // those notes' authors were never shown the completion warning.
    const inserted = await db.query(
      `INSERT INTO practitioner_client_notes
         (id, client_id, practitioner_id, content_enc, content_enc_meta, note_date,
          kind, status, promoted_from, lifecycle, completed_at, session_id)
       VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6::date, CURRENT_DATE),
               $7, $8, $9::uuid, $10,
               CASE WHEN $10 = 'completed' AND $7 = 'note' THEN NOW() ELSE NULL END,
               $11::uuid)
       RETURNING ${NOTE_COLUMNS}`,
      [
        noteId,
        clientId,
        practitionerId,
        contentEnc,
        contentEncMeta,
        noteDate ?? null,
        continuity.value!.kind,
        continuity.value!.status,
        continuity.value!.promotedFrom,
        lifecycleCheck.value,
        sessionLink.value,
      ]
    );

    const note = decryptClientNoteRow(inserted.rows[0] as ClientNoteRow);
    if (!note) {
      // Written but unreadable — surface it rather than returning a hollow note.
      console.error('[ClientNotes] POST wrote a note that failed to decrypt:', noteId);
      return NextResponse.json({ error: 'Note saved but could not be read back' }, { status: 500 });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('[ClientNotes] POST error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
