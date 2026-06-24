/**
 * TEST — Member-mark enablement: surfaceExchangeTurns + markability.
 *
 * Proves the doorway plumbing for the member-facing mark gesture:
 *   1. surfaceExchangeTurns returns the REAL conversation_turns ids for the most
 *      recent exchange, correctly paired by role (recency + role mapping).
 *   2. Those surfaced ids are genuinely markable through the ACTUAL episodic-mark
 *      handler (201) — i.e. the id the client receives works end-to-end.
 *   3. Defense-in-depth: even a surfaced id from a Sanctuary session is refused
 *      at mark time (403). Surfacing enables; the guard authorizes.
 *
 * Local dev DB only. Fixtures + episodes deleted on completion.
 * Run:  npx tsx scripts/test-episodic-turn-surfacing.ts
 */

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { surfaceExchangeTurns } from '@/lib/sovereign/surfaceExchangeTurns';
import { POST } from '@/app/api/sovereign/episodes/mark/route';
import { query } from '@/lib/db/postgres';

let failures = 0;
function assert(name: string, cond: boolean, detail = '') {
  if (!cond) failures++;
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
}

function markReq(memberId: string, turnId: string, sessionId: string): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/episodes/mark', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-member-id': memberId },
    body: JSON.stringify({ verbatimText: 'Remember this.', sourceTurnId: turnId, sourceSessionId: sessionId }),
  });
}

async function createSession(memberId: string, sanctuary: boolean): Promise<string> {
  const id = randomUUID();
  await query(
    `INSERT INTO maia_sessions (id, member_id, mode, privacy_mode, status)
     VALUES ($1, $2, $3, $4, 'active')`,
    [id, memberId, sanctuary ? 'sanctuary' : 'continuity', sanctuary ? 'sanctuary' : 'standard'],
  );
  return id;
}

async function insertTurn(ownerId: string, sessionId: string, role: 'user' | 'assistant', seq: number, secondsAgo: number): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO conversation_turns (user_id, session_id, role, content, seq, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW() - ($6::int * interval '1 second')) RETURNING id`,
    [ownerId, sessionId, role, `fixture ${role}`, seq, secondsAgo],
  );
  return r.rows[0].id;
}

async function main() {
  const m = await query<{ id: string }>(`SELECT id FROM members LIMIT 1`);
  if (m.rows.length === 0) { console.log('No members in local DB.'); process.exit(2); }
  const memberId = m.rows[0].id;
  console.log(`\nMember: ${memberId.slice(0, 8)}…`);

  const sessions: string[] = [];
  const turns: string[] = [];
  const episodeIds: number[] = [];

  try {
    const contSession = await createSession(memberId, false);
    const sanctSession = await createSession(memberId, true);
    sessions.push(contSession, sanctSession);

    // Two exchanges in the continuity session; e2 is the most recent.
    const e1User = await insertTurn(memberId, contSession, 'user', 0, 10);
    const e1Asst = await insertTurn(memberId, contSession, 'assistant', 1, 9);
    const e2User = await insertTurn(memberId, contSession, 'user', 0, 1);
    const e2Asst = await insertTurn(memberId, contSession, 'assistant', 1, 0);
    const sanctTurn = await insertTurn(memberId, sanctSession, 'assistant', 1, 0);
    turns.push(e1User, e1Asst, e2User, e2Asst, sanctTurn);

    // ── 1. surfacing: recency + role mapping ─────────────────────────────────
    console.log('\n1 — surfaceExchangeTurns returns the newest exchange, paired by role:');
    const surfaced = await surfaceExchangeTurns(contSession);
    assert('returns a result', surfaced !== null);
    assert('assistantTurnId === newest assistant turn', surfaced?.assistantTurnId === e2Asst,
      surfaced?.assistantTurnId === e2Asst ? '' : `(got ${surfaced?.assistantTurnId})`);
    assert('userTurnId === newest user turn', surfaced?.userTurnId === e2User,
      surfaced?.userTurnId === e2User ? '' : `(got ${surfaced?.userTurnId})`);
    assert('does NOT return the older exchange', surfaced?.assistantTurnId !== e1Asst && surfaced?.userTurnId !== e1User);

    // ── 2. markability: surfaced ids work through the real handler ───────────
    console.log('\n2 — surfaced ids are markable end-to-end (real episodic-mark handler):');
    const resA: any = await POST(markReq(memberId, surfaced!.assistantTurnId!, contSession));
    const jsonA: any = await resA.json();
    assert('mark surfaced assistant turn → 201', resA.status === 201, `(got ${resA.status})`);
    if (resA.status === 201) {
      episodeIds.push(jsonA.episode.id);
      assert('  stored source_turn_id === surfaced assistant id', jsonA.episode.sourceTurnId === e2Asst);
    }
    const resU: any = await POST(markReq(memberId, surfaced!.userTurnId!, contSession));
    const jsonU: any = await resU.json();
    assert('mark surfaced user turn → 201', resU.status === 201, `(got ${resU.status})`);
    if (resU.status === 201) episodeIds.push(jsonU.episode.id);

    // ── 3. defense-in-depth: a surfaced Sanctuary id is still refused ────────
    console.log('\n3 — a surfaced Sanctuary-session id is refused at mark time (403):');
    const surfacedSanct = await surfaceExchangeTurns(sanctSession);
    assert('helper surfaces the sanctuary id (enablement is content-blind)', surfacedSanct?.assistantTurnId === sanctTurn);
    const resS: any = await POST(markReq(memberId, sanctTurn, sanctSession));
    assert('mark sanctuary turn → 403 (guard authorizes, not surfacing)', resS.status === 403, `(got ${resS.status})`);

    // ── 4. empty session → null ─────────────────────────────────────────────
    console.log('\n4 — a session with no turns surfaces null:');
    assert('null for empty session', (await surfaceExchangeTurns(randomUUID())) === null);
  } finally {
    if (episodeIds.length) await query(`DELETE FROM episodic_memories WHERE id = ANY($1::int[])`, [episodeIds]);
    if (turns.length) await query(`DELETE FROM conversation_turns WHERE id = ANY($1::uuid[])`, [turns]);
    if (sessions.length) await query(`DELETE FROM maia_sessions WHERE id = ANY($1::text[])`, [sessions]);
    console.log(`\nCleaned up: ${episodeIds.length} episodes, ${turns.length} turns, ${sessions.length} sessions.`);
  }

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} ASSERTION(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('\nTEST CRASHED:', e?.message || e); process.exit(1); });
