// Runtime proof for the Field Lab informed-consent gate (Step 4).
//
// Asserts the "honored" leg of informed · reversible · honored:
//   1. NO consent  → the save route persists NOTHING (saved:0, consent:'not-remembered').
//   2. WITH consent → threads persist AND an auditable consent_changed event is recorded
//      (consent_state_new='member-confirmed-memory', reason carries the protocol version).
//
// Drives the worktree dev server (separate port) so this verifies the real route, not a
// replica. Run:  CONSENT_TOKEN=<session> node scripts/repro/consent_gate_proof.mjs
import pg from 'pg';

const BASE = process.env.BASE || 'http://localhost:3100';
const TOK = process.env.CONSENT_TOKEN;
const MEMBER = 'd0ca2693-ae54-4729-9039-83c5894b75af';
const SR = 'consent-verify-' + Date.now();
const PROTO = 'recognition-continuity-v1';

function timed(url, opts = {}, ms = 6000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { ...opts, signal: ac.signal }).finally(() => clearTimeout(t));
}
const post = (body) =>
  timed(`${BASE}/api/maia/field-lab/field-note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-token': TOK },
    body: JSON.stringify(body),
  }, 30000).then(async (r) => ({ status: r.status, json: await r.json().catch(() => ({})) }));

async function waitReady(ms = 120000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await timed(`${BASE}/api/maia/field-lab/field-note`, { headers: { 'x-session-token': TOK } }, 8000);
      if (r.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 2500));
  }
  return false;
}

const db = new pg.Client({ connectionString: 'postgresql://soullab@localhost:5432/maia_consciousness' });

async function rowCount(sql, params) {
  return (await db.query(sql, params)).rows[0];
}

async function main() {
  if (!TOK) { console.log('NO CONSENT_TOKEN'); process.exit(2); }
  if (!(await waitReady())) { console.log('SERVER NOT READY on ' + BASE); process.exit(1); }
  await db.connect();

  const proposals = [{ title: 'a thread I want to keep', decision: 'keep' }];
  const created = ['my own originated thread'];

  // TEST 1 — no consent: must persist NOTHING.
  const noConsent = await post({ proposals, created, sessionRef: SR });
  const t1 = await rowCount('SELECT count(*)::int n FROM member_field_note_threads WHERE source_session_ref=$1', [SR]);
  const test1 = noConsent.json?.saved === 0 && noConsent.json?.consent === 'not-remembered' && t1.n === 0;

  // TEST 2 — with informed consent: persist + record consent event.
  const withConsent = await post({ proposals, created, sessionRef: SR, consent: { remembered: true, protocolVersion: PROTO } });
  const t2 = await rowCount('SELECT count(*)::int n FROM member_field_note_threads WHERE source_session_ref=$1', [SR]);
  const ce = await rowCount(
    `SELECT count(*)::int n, max(reason) reason, max(consent_state_new) state
       FROM member_field_note_events
      WHERE member_id=$1 AND event_type='consent_changed' AND created_at > NOW() - INTERVAL '5 min'`,
    [MEMBER],
  );
  const test2 =
    withConsent.json?.saved > 0 &&
    withConsent.json?.consent === 'remembered' &&
    t2.n > 0 &&
    ce.n > 0 &&
    ce.state === 'member-confirmed-memory' &&
    String(ce.reason || '').startsWith('informed-consent:');

  console.log(JSON.stringify({
    test1_no_consent: { pass: test1, resp: noConsent.json, dbThreads: t1.n },
    test2_with_consent: { pass: test2, resp: withConsent.json, dbThreads: t2.n, consentEvent: ce },
  }, null, 2));

  // cleanup — leave the disposable DB clean
  await db.query('DELETE FROM member_field_note_threads WHERE source_session_ref=$1', [SR]);
  await db.query(
    `DELETE FROM member_field_note_events WHERE member_id=$1 AND event_type='consent_changed' AND created_at > NOW() - INTERVAL '5 min'`,
    [MEMBER],
  );
  await db.end();

  console.log(test1 && test2 ? 'CONSENT GATE: PASS' : 'CONSENT GATE: FAIL');
  process.exit(test1 && test2 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
