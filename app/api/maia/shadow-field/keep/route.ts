export const dynamic = 'force-dynamic';

/**
 * Shadow Field — the keep act (MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 · P4 / P4-C1).
 *
 * THE ONLY SHADOW FIELD PERSISTENCE PATH. Nothing else in the Field writes: the turn route
 * imports no database client at all. Constitution v0.2 L3 / §4, falsifier F8.
 *
 * SANCTUARY IS SERVER-AUTHORITATIVE (P4-C1). The decision reads the server-held Field
 * session, never the request. This route does not look at a client `sanctuary` field, so a
 * forged request claiming non-Sanctuary during a Sanctuary sitting has nothing to assert
 * with, and creates zero rows. Fail closed: an unknown, expired, foreign or closed token is
 * a refusal, not an assumption of non-Sanctuary.
 *
 * What is written, when the decision allows it (founder P4 ruling 2026-09-06):
 *   source_type        'shadow_field'   — member-authored material explicitly kept
 *   source_id          NULL             — the member's text lives in the atom itself
 *   body               member-authored text, never a MAIA reading
 *   return_preference  'member_pulled'  — not ambiently retrieved by the prompt loader
 *   provenance / facilitator_id / epistemological_status  untouched (NULL)
 *
 * Withdrawal never reaches this route: leaving is handled in the turn route, which closes
 * the Field session and returns before any keep is offered (L6, F14).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { query } from '@/lib/db/postgres';
import { verifyFieldSession } from '@/lib/maia/shadowField/fieldSession';
import { decideKeep } from '@/lib/maia/shadowField/keepDecision';

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  const tester = await isMemberTester(session.memberId);
  if (!tester) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Server-held state is the only authority consulted. The client's own view of Sanctuary
  // is not read here at all.
  const field = verifyFieldSession(body.fieldToken, session.memberId);
  const decision = decideKeep(body, field);

  if (!decision.allow) {
    return NextResponse.json(
      { kept: false, reason: decision.reason, text: decision.text },
      { status: decision.reason === 'invalid_kind' || decision.reason === 'empty' ? 400 : 409 },
    );
  }

  const result = await query<{ id: string; source_type: string }>(
    `INSERT INTO member_memory_atoms
       (member_id, source_type, source_id, title, body, return_preference)
     VALUES ($1, 'shadow_field', NULL, $2, $3, 'member_pulled')
     RETURNING id, source_type`,
    [session.memberId, decision.title, decision.body],
  );

  const row = result.rows[0];
  return NextResponse.json({
    kept: true,
    id: row.id,
    sourceType: row.source_type,
    kind: decision.kind,
    returnPreference: 'member_pulled',
  });
}
