export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

type Params = { params: Promise<{ sessionId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { sessionId } = await params;
  const result = await query(
    `SELECT s.*, COUNT(e.id)::int AS event_count
     FROM with_me_sessions s
     LEFT JOIN session_events e ON e.session_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [sessionId],
  );
  if (!result.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session: result.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const facilitatorId = await getMemberIdFromRequest(req);
  if (!facilitatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json();

  const allowed = [
    'intention', 'elemental_phase', 'spiral_position',
    'facilitator_notes', 'transcript', 'closing_reflection',
    'status', 'synthesis',
  ];

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in body) {
      updates.push(`${key} = $${idx++}`);
      values.push(key === 'synthesis' ? JSON.stringify(body[key]) : body[key]);
    }
  }

  if (body.status === 'closed') {
    updates.push(`closed_at = NOW()`);
  }
  if (body.status === 'synthesized') {
    updates.push(`synthesized_at = NOW()`);
  }
  if (body.status === 'complete') {
    updates.push(`completed_at = NOW()`);
  }

  if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  values.push(sessionId, facilitatorId);
  const result = await query(
    `UPDATE with_me_sessions
     SET ${updates.join(', ')}
     WHERE id = $${idx++} AND facilitator_id = $${idx}
     RETURNING *`,
    values,
  );

  if (!result.rows[0]) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

  const session = result.rows[0];

  // On completion: write approved synthesis candidates to member_memory_atoms as
  // practitioner observations. Provenance-preserving — these enter the 'witnessed'
  // register with facilitator_id and epistemological_status: 'observed'.
  // Gate: requires member_id on the session (not all sessions have one).
  if (body.status === 'complete' && session.member_id) {
    const candidates: Record<string, unknown>[] = body.synthesis?.candidates ?? [];

    if (candidates.length > 0) {
      const validLenses = new Set(['fire', 'water', 'earth', 'air', 'aether']);
      let written = 0;

      for (const c of candidates) {
        const lenses = c.elemental_phase && validLenses.has(String(c.elemental_phase))
          ? [String(c.elemental_phase)]
          : [];

        const title = String(c.category ?? 'observation').replace(/_/g, ' ');
        const bodyText = [
          String(c.content ?? ''),
          c.basis ? `\n\nBasis: ${c.basis}` : '',
          c.bookmark_timestamp ? `\n\nMarked at: ${c.bookmark_timestamp}` : '',
          `\n\nSession: ${sessionId}`,
        ].join('').trim();

        try {
          await query(
            `INSERT INTO member_memory_atoms
               (member_id, source_type, source_id,
                facilitator_id, title, body,
                primary_register, registers, elemental_lenses,
                epistemological_status, status, return_preference, crossing_allowed)
             VALUES
               ($1, 'practitioner_observation', gen_random_uuid(),
                $2, $3, $4,
                'witnessed', ARRAY['witnessed']::text[], $5::text[],
                'observed', 'active', 'contextual_doorway', false)`,
            [session.member_id, facilitatorId, title, bodyText, lenses],
          );
          written++;
        } catch (err) {
          console.error(`[with-me/complete] atom write failed for candidate:`, c.id, err);
        }
      }

      console.log(
        `[with-me/complete] ${written}/${candidates.length} practitioner observations → member_memory_atoms`,
        { sessionId, memberId: session.member_id, facilitatorId },
      );
    }
  } else if (body.status === 'complete' && !session.member_id) {
    console.log(
      `[with-me/complete] session ${sessionId} has no member_id — practitioner observations not written to memory`,
    );
  }

  return NextResponse.json({ session });
}
