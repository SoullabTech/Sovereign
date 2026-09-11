export const dynamic = 'force-dynamic';

import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { noContextualReturn, returnPreferenceValue } from '@/lib/psyche/returnAuthority';

type Params = { params: Promise<{ sessionId: string }> };

// Deterministic source_id: same (session, candidate) pair always produces the
// same UUID, so the UNIQUE index on (member_id, source_type, source_id)
// prevents duplicates when a session is completed more than once.
export function candidateAtomSourceId(sessionId: string, candidateId: string): string {
  const hex = createHash('md5')
    .update(`withme:${sessionId}:${candidateId}`)
    .digest('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

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

  // On completion: write practitioner-approved synthesis candidates to
  // member_memory_atoms as witnessed observations.
  //
  // Governance rules:
  //   - Only candidates whose id appears in approved_candidate_ids are written.
  //   - Rejected candidates are never written.
  //   - Raw Claude synthesis without practitioner approval is never written.
  //   - source_id is deterministic (session + candidate), making this idempotent:
  //     completing the same session twice cannot create duplicate atoms.
  //   - provenance records session_id, practitioner_id, candidate_id, and timestamp.
  let createdAtomIds: string[] = [];

  if (body.status === 'complete' && session.member_id) {
    const approvedIds: Set<string> = new Set(
      Array.isArray(body.approved_candidate_ids) ? body.approved_candidate_ids : [],
    );
    const candidates: Record<string, unknown>[] = body.synthesis?.candidates ?? [];
    const approved = candidates.filter(
      (c) => typeof c.id === 'string' && approvedIds.has(c.id),
    );

    if (approved.length > 0) {
      const validLenses = new Set(['fire', 'water', 'earth', 'air', 'aether']);
      const writtenAt = new Date().toISOString();

      // P6 — DOORWAY CONSENT INTEGRITY.
      //
      // This write used to hardcode `return_preference: 'contextual_doorway'`,
      // collapsing three separate authorities into one:
      //
      //     facilitator authored something → system stores it → MAIA may
      //     resurface it into the member's life
      //
      // The facilitator has authority to author an attributed observation. That
      // is not authority to decide when MAIA brings it back to the member.
      // `facilitatorId` here is the authenticated caller; the subject is
      // `session.member_id` — a different person — so no member-conferred
      // return authority exists for this material, and none is invented.
      //
      // WHAT IS PRESERVED: the observation is still written, still attributed
      // (`practitioner_observation`, `facilitator_id`, `provenance`), still
      // epistemically framed (`observed`), and still visible to the member.
      // Only the permission nobody was entitled to grant is withheld.
      //
      // `member_pulled` is the schema's own documented meaning for this state —
      // "only when member asks directly (most restrictive)", per migration
      // 20260521000001 — so nothing is forced into a misleading enum.
      //
      // If the member later authorizes contextual return, that changes the
      // RETURN AUTHORITY and never the authorship: `authored_by = practitioner`
      // coexists with `return_authorized_by = member`.
      const practitionerReturnAuthority = noContextualReturn(
        'practitioner-authored observation about a different member; no member-conferred return authority exists and the doorway-consent gesture is not built',
      );

      for (let i = 0; i < approved.length; i++) {
        const c = approved[i];
        const candidateId = String(c.id ?? i);
        const sourceId = candidateAtomSourceId(sessionId, candidateId);

        const lenses = c.elemental_phase && validLenses.has(String(c.elemental_phase))
          ? [String(c.elemental_phase)]
          : [];

        const title = String(c.category ?? 'observation').replace(/_/g, ' ');
        // Body is the approved candidate text only — provenance is in the provenance column.
        const bodyText = String(c.content ?? '').trim();

        const provenance = {
          session_id: sessionId,
          practitioner_id: facilitatorId,
          candidate_id: candidateId,
          candidate_index: i,
          written_at: writtenAt,
        };

        try {
          const atomResult = await query<{ id: string }>(
            `INSERT INTO member_memory_atoms
               (member_id, source_type, source_id,
                facilitator_id, title, body,
                primary_register, registers, elemental_lenses,
                epistemological_status, status, return_preference,
                crossing_allowed, provenance,
                posture_at_creation, generated_by)
             VALUES
               ($1, 'practitioner_observation', $2,
                $3, $4, $5,
                'witnessed', ARRAY['witnessed']::text[], $6::text[],
                'observed', 'active', $8,
                false, $7::jsonb,
                'normal', 'practitioner-observation')
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [
              session.member_id,
              sourceId,
              facilitatorId,
              title,
              bodyText,
              lenses,
              JSON.stringify(provenance),
              returnPreferenceValue(practitionerReturnAuthority),
            ],
          );
          if (atomResult.rows[0]) {
            createdAtomIds.push(atomResult.rows[0].id);
          }
        } catch (err) {
          console.error(`[with-me/complete] atom write failed for candidate:`, candidateId, err);
        }
      }

      console.log(
        `[with-me/complete] ${createdAtomIds.length}/${approved.length} approved observations → member_memory_atoms`,
        { sessionId, memberId: session.member_id, facilitatorId, approvedCount: approved.length },
      );
    } else if (approvedIds.size === 0 && candidates.length > 0) {
      console.log(
        `[with-me/complete] session ${sessionId} completed with no approved candidates — nothing written to memory`,
      );
    }
  } else if (body.status === 'complete' && !session.member_id) {
    console.log(
      `[with-me/complete] session ${sessionId} has no member_id — practitioner observations not written to memory`,
    );
  }

  return NextResponse.json({ session, created_atom_ids: createdAtomIds });
}
