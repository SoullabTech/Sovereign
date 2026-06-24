/**
 * END-TO-END TEST — Member-Marked Episodic Write Path + Sanctuary Gate (Step 7).
 * Turn-primary provenance.
 *
 * Drives the ACTUAL route handler (app/api/sovereign/episodes/mark/route.ts:POST)
 * through real NextRequests against REAL fixtures (maia_sessions / conversation_turns),
 * so server-authoritative Sanctuary + ownership resolution is genuinely exercised.
 *
 *   STANDARD: "MAIA may preserve what the member marked. MAIA may not add what the
 *              member did not author." A Sanctuary moment must never persist.
 *   AUTHORITY: the TURN. Ownership = conversation_turns.user_id; Sanctuary = the
 *              turn's session mode/privacy. maia_sessions.member_id is NEVER the
 *              ownership proof (NULL on ~68% of live continuity sessions).
 *
 * Cases:
 *   A  owned turn (member_id-set session)      -> 201 + PROOF 1/2/3
 *   A2 owned turn in member_id=NULL session     -> 201   (regression fix: no false 403)
 *   B  turn whose session is Sanctuary          -> 403, no insert
 *   C  turn owned by a DIFFERENT member         -> 403, no insert (ownership via turn)
 *   D  missing sourceTurnId (sessionId only)     -> 400, no insert
 *   E  empty verbatim                            -> 400, no insert
 *   (unauthenticated -> 401: inherited; see note, not offline-testable)
 *
 * Local dev DB only. All fixtures + written episodes deleted on completion.
 * Run:  npx tsx scripts/test-episodic-member-mark.ts
 */

import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { POST } from '@/app/api/sovereign/episodes/mark/route';
import { query } from '@/lib/db/postgres';

const VERBATIM = 'Fire,  then the long quiet — I hadn’t named it until now. (twice)';

let failures = 0;
function assert(name: string, cond: boolean, detail = '') {
  if (!cond) failures++;
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? `  ${detail}` : ''}`);
}
const isEmptyArr = (v: unknown) => Array.isArray(v) && v.length === 0;

function makeReq(memberId: string | null, body: unknown): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (memberId) headers['x-member-id'] = memberId;
  return new NextRequest('http://localhost/api/sovereign/episodes/mark', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

async function markedCount(memberId: string): Promise<number> {
  const r = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM episodic_memories WHERE user_id = $1 AND marked_by_member = TRUE`,
    [memberId],
  );
  return Number(r.rows[0].n);
}

async function createSession(memberId: string | null, sanctuary: boolean): Promise<string> {
  const id = randomUUID();
  await query(
    `INSERT INTO maia_sessions (id, member_id, mode, privacy_mode, status)
     VALUES ($1, $2, $3, $4, 'active')`,
    [id, memberId, sanctuary ? 'sanctuary' : 'continuity', sanctuary ? 'sanctuary' : 'standard'],
  );
  return id;
}

async function createTurn(ownerId: string, sessionId: string): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO conversation_turns (user_id, session_id, role, content)
     VALUES ($1, $2, 'user', $3) RETURNING id`,
    [ownerId, sessionId, 'fixture turn content'],
  );
  return r.rows[0].id;
}

async function main() {
  const m = await query<{ id: string }>(`SELECT id FROM members LIMIT 1`);
  if (m.rows.length === 0) { console.log('No members in local DB.'); process.exit(2); }
  const memberId = m.rows[0].id;
  const other = await query<{ id: string }>(`SELECT id FROM members WHERE id <> $1 LIMIT 1`, [memberId]);
  const otherMemberId = other.rows[0]?.id ?? `other-${randomUUID()}`;
  console.log(`\nMember: ${memberId.slice(0, 8)}…   verbatim chars: ${VERBATIM.length}`);

  const sessions: string[] = [];
  const turns: string[] = [];
  const episodeIds: number[] = [];

  try {
    // Fixtures.
    const ownedSession = await createSession(memberId, false);       // continuity, member_id set
    const nullMemberSession = await createSession(null, false);      // continuity, member_id NULL (the 68% case)
    const sanctSession = await createSession(memberId, true);        // sanctuary
    sessions.push(ownedSession, nullMemberSession, sanctSession);
    const ownedTurn = await createTurn(memberId, ownedSession);
    const nullMemberTurn = await createTurn(memberId, nullMemberSession); // owned turn, session.member_id NULL
    const sanctTurn = await createTurn(memberId, sanctSession);
    const foreignTurn = await createTurn(otherMemberId, ownedSession);    // turn owned by someone else
    turns.push(ownedTurn, nullMemberTurn, sanctTurn, foreignTurn);

    const n0 = await markedCount(memberId);

    // ── CASE A: owned turn → 201 + three proofs ──────────────────────────────
    console.log('\nCASE A — owned turn (member_id-set session) → 201:');
    const resA: any = await POST(makeReq(memberId, { verbatimText: VERBATIM, sourceTurnId: ownedTurn, sourceSessionId: ownedSession }));
    const jsonA: any = await resA.json();
    assert('returns 201 Created', resA.status === 201, `(got ${resA.status} ${JSON.stringify(jsonA).slice(0, 90)})`);
    if (resA.status === 201) {
      episodeIds.push(jsonA.episode.id);
      const back = await query<any>(
        `SELECT user_id, verbatim_text, marked_by_member, source_turn_id, source_session_id,
                experience_title, experience_description, experience_context,
                significance, emotional_intensity, breakthrough_level, spiral_stage,
                archetypal_resonances, frameworks_active, semantic_vector, emotional_vector,
                somatic_vector, related_episodes, connection_strengths, connection_types
           FROM episodic_memories WHERE episode_id = $1`,
        [jsonA.episode.episodeId],
      );
      assert('exactly one row written', back.rows.length === 1);
      const row = back.rows[0];
      console.log('  PROOF 1 — verbatim fidelity:');
      assert('  verbatim_text byte-for-byte', row.verbatim_text === VERBATIM,
        row.verbatim_text === VERBATIM ? '' : `\n        stored: ${JSON.stringify(row.verbatim_text)}`);
      console.log('  PROOF 2 — interpretive abstention:');
      for (const c of ['experience_title','experience_description','experience_context','significance','emotional_intensity','breakthrough_level','spiral_stage'])
        assert(`  ${c} IS NULL`, row[c] === null);
      for (const c of ['archetypal_resonances','frameworks_active','semantic_vector','emotional_vector','somatic_vector','related_episodes','connection_strengths','connection_types'])
        assert(`  ${c} = []`, isEmptyArr(row[c]));
      assert('  marked_by_member = TRUE', row.marked_by_member === true);
      console.log('  PROOF 3 — provenance stored exactly:');
      assert('  user_id === member', row.user_id === memberId);
      assert('  source_turn_id === owned turn', row.source_turn_id === ownedTurn);
      assert('  source_session_id === corroborating session', row.source_session_id === ownedSession);
    }

    // ── CASE A2: owned turn in member_id=NULL session → 201 (REGRESSION FIX) ──
    console.log('\nCASE A2 — owned turn, session.member_id = NULL → 201 (false-refusal fixed):');
    const resA2: any = await POST(makeReq(memberId, { verbatimText: VERBATIM, sourceTurnId: nullMemberTurn }));
    const jsonA2: any = await resA2.json();
    assert('returns 201 (turn ownership, not session.member_id)', resA2.status === 201, `(got ${resA2.status} ${JSON.stringify(jsonA2).slice(0, 90)})`);
    if (resA2.status === 201) {
      episodeIds.push(jsonA2.episode.id);
      assert('source_session_id stored NULL (turn-only)', jsonA2.episode.sourceSessionId === null);
    }

    const baseline = await markedCount(memberId); // n0 + 2 after A, A2

    // ── CASE B: turn whose session is Sanctuary → 403 ────────────────────────
    console.log('\nCASE B — turn in a Sanctuary session → 403, no insert:');
    const resB: any = await POST(makeReq(memberId, { verbatimText: VERBATIM, sourceTurnId: sanctTurn }));
    const jsonB: any = await resB.json();
    assert('returns 403', resB.status === 403, `(got ${resB.status})`);
    assert('error names Sanctuary', /sanctuary/i.test(jsonB.error || ''), `(${jsonB.error})`);
    assert('wrote no row', (await markedCount(memberId)) === baseline);

    // ── CASE C: turn owned by a DIFFERENT member → 403 ───────────────────────
    console.log('\nCASE C — turn owned by another member → 403, no insert:');
    const resC: any = await POST(makeReq(memberId, { verbatimText: VERBATIM, sourceTurnId: foreignTurn }));
    assert('returns 403', resC.status === 403, `(got ${resC.status})`);
    assert('wrote no row', (await markedCount(memberId)) === baseline);

    // ── CASE D: missing sourceTurnId (session only) → 400 ────────────────────
    console.log('\nCASE D — missing sourceTurnId (only sourceSessionId) → 400, no insert:');
    const resD: any = await POST(makeReq(memberId, { verbatimText: VERBATIM, sourceSessionId: ownedSession }));
    const jsonD: any = await resD.json();
    assert('returns 400', resD.status === 400, `(got ${resD.status})`);
    assert('error names sourceTurnId', /sourceturnid/i.test(jsonD.error || ''), `(${jsonD.error})`);
    assert('wrote no row', (await markedCount(memberId)) === baseline);

    // ── CASE E: empty verbatim → 400 ─────────────────────────────────────────
    console.log('\nCASE E — empty verbatim → 400, no insert:');
    const resE: any = await POST(makeReq(memberId, { verbatimText: '   ', sourceTurnId: ownedTurn }));
    assert('returns 400', resE.status === 400, `(got ${resE.status})`);
    assert('wrote no row', (await markedCount(memberId)) === baseline);

    // NOTE on 401 (no-member): inherited from getMemberIdFromRequest (same auth as
    // atoms/[id]/breakthrough). Not exercisable offline — no valid x-member-id makes
    // the helper fall through to Next's cookies(), which throws outside a request scope.
  } finally {
    if (episodeIds.length) await query(`DELETE FROM episodic_memories WHERE id = ANY($1::int[])`, [episodeIds]);
    if (turns.length) await query(`DELETE FROM conversation_turns WHERE id = ANY($1::uuid[])`, [turns]);
    if (sessions.length) await query(`DELETE FROM maia_sessions WHERE id = ANY($1::text[])`, [sessions]);
    console.log(`\nCleaned up: ${episodeIds.length} episodes, ${turns.length} turns, ${sessions.length} sessions.`);
  }

  console.log(`\n${failures === 0 ? 'ALL CASES PASSED' : `${failures} ASSERTION(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\nTEST CRASHED:', e?.message || e);
  process.exit(1);
});
