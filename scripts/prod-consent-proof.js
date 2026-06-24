/* eslint-disable */
// One-shot production consent-path proof. Runs INSIDE the maia container.
// Seeds clearly-marked test data, drives the full path against localhost:3000,
// verifies the reveal invariant, and cleans up in a finally. Prints PASS/FAIL.
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE = 'http://localhost:3000';
const SID = 'dd000000-0000-4000-8000-000000000001'; // marked test session
const CID = 'dd000000-0000-4000-8000-000000000002'; // marked test client
const LINK = 'https://zoom.us/j/PRODPROOF';
const SESSTOK = 'deployproof-sess-dd000000-0000-4000-8000-000000000003'; // marked test session token

async function GET(p, h) { const r = await fetch(BASE + p, { headers: h || {} }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }
async function POST(p, h, body) { const r = await fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(h || {}) }, body: body ? JSON.stringify(body) : undefined }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }

const checks = [];
const pass = (name, ok, detail) => checks.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);

(async () => {
  const health = await GET('/api/health');
  pass('health 200', health.s === 200, `(status ${health.s})`);
  const fake = await GET('/api/session/join/faketoken_prodproof');
  pass('no-token -> 401', fake.s === 401, `(status ${fake.s})`);

  const pr = await pool.query("SELECT p.member_id AS mid FROM practitioners p JOIN members m ON m.id=p.member_id WHERE p.status='active' LIMIT 1");
  if (!pr.rows.length) { console.log('NO active practitioner with a real member; cannot run seeded path.'); console.log(checks.join('\n')); await pool.end(); return; }
  const mid = pr.rows[0].mid;
  const HDR = { 'x-session-token': SESSTOK };
  const BODY = { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: LINK };

  try {
    await pool.query('DELETE FROM auth_sessions WHERE session_token=$1', [SESSTOK]);
    await pool.query("INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked) VALUES ($1,$2, NOW() + INTERVAL '1 hour', false)", [mid, SESSTOK]);
    await pool.query("INSERT INTO practitioner_clients (id, practitioner_id, name, email, status) SELECT $1, p.id, 'Deploy Proof Test', 'deploy-proof@test.invalid', 'active' FROM practitioners p WHERE p.member_id=$2 AND p.status='active' LIMIT 1 ON CONFLICT (id) DO NOTHING", [CID, mid]);
    await pool.query("INSERT INTO scribe_sessions (id, member_id, container, client_id) VALUES ($1,$2,'practitioner',$3) ON CONFLICT (id) DO UPDATE SET room_state='pre', agreement_mode=NULL, agreement_version=NULL, consent_client_at=NULL, video_link_reveal_allowed=false, video_link=NULL", [SID, mid, CID]);
    await pool.query('DELETE FROM session_join_tokens WHERE session_id=$1', [SID]);
    await pool.query('DELETE FROM session_consent_events WHERE session_id=$1', [SID]);

    const set1 = await POST(`/api/studio/sessions/${SID}/agreement`, HDR, BODY);
    const t1 = set1.b && set1.b.joinToken;
    pass('practitioner set (v1) -> token', set1.s === 200 && !!t1, `(status ${set1.s}, body ${JSON.stringify(set1.b).slice(0, 160)})`);

    const g1 = await GET(`/api/session/join/${t1}`);
    pass('pending -> no link', g1.b && g1.b.state === 'pending' && g1.b.videoLink === null, `(state ${g1.b && g1.b.state}, link ${g1.b && g1.b.videoLink})`);

    const rf = await POST(`/api/session/join/${t1}/refuse`);
    const g2 = await GET(`/api/session/join/${t1}`);
    pass('refuse -> no link', rf.b && rf.b.state === 'refused' && g2.b && g2.b.videoLink === null, `(state ${g2.b && g2.b.state})`);

    const set2 = await POST(`/api/studio/sessions/${SID}/agreement`, HDR, BODY);
    const t2 = set2.b && set2.b.joinToken;
    const v1 = set1.b && set1.b.agreement && set1.b.agreement.version;
    const v2 = set2.b && set2.b.agreement && set2.b.agreement.version;
    pass('revise -> new token + new version', !!t2 && t2 !== t1 && !!v1 && !!v2 && v1 !== v2, `(status ${set2.s}, vDiff ${!!v1 && !!v2 && v1 !== v2})`);

    const g3 = await GET(`/api/session/join/${t2}`);
    pass('new agreement -> no link yet', g3.b && g3.b.videoLink === null, `(state ${g3.b && g3.b.state})`);

    const ac = await POST(`/api/session/join/${t2}/accept`);
    pass('accept -> link appears', ac.b && ac.b.state === 'accepted' && ac.b.videoLink === LINK, `(status ${ac.s}, link ${ac.b && ac.b.videoLink})`);

    const g5 = await GET(`/api/session/join/${t1}`);
    pass('old token -> no link (stale)', g5.b && g5.b.videoLink === null, `(reason ${g5.b && g5.b.linkBlockedReason})`);

    // admin-auth still rejects unauthenticated (proves the reconciled guard is live)
    const adminNo = await GET('/api/admin/research/overview?days=7');
    pass('admin-auth rejects no-session', adminNo.s === 401, `(status ${adminNo.s})`);
  } finally {
    await pool.query('DELETE FROM scribe_sessions WHERE id=$1', [SID]); // cascade tokens + events
    await pool.query('DELETE FROM practitioner_clients WHERE id=$1', [CID]);
    await pool.query('DELETE FROM auth_sessions WHERE session_token=$1', [SESSTOK]);
    const left = await pool.query('SELECT (SELECT count(*) FROM scribe_sessions WHERE id=$1) a, (SELECT count(*) FROM session_join_tokens WHERE session_id=$1) b, (SELECT count(*) FROM session_consent_events WHERE session_id=$1) c, (SELECT count(*) FROM practitioner_clients WHERE id=$2) d, (SELECT count(*) FROM auth_sessions WHERE session_token=$3) e', [SID, CID, SESSTOK]);
    pass('cleanup (all test rows removed)', Object.values(left.rows[0]).every((n) => Number(n) === 0), `(${JSON.stringify(left.rows[0])})`);
  }
  console.log(checks.join('\n'));
  await pool.end();
})().catch((e) => { console.log('FATAL', String(e)); process.exit(1); });
