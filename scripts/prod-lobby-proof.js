/* eslint-disable */
// Phase 2 PROD verification — extends the consent-path proof with Sovereign Lobby `retention`
// assertions. Runs INSIDE the maia container AFTER the Phase 2 deploy:
//   docker cp scripts/prod-lobby-proof.js maia-sovereign:/app/prod-lobby-proof.js
//   docker exec maia-sovereign node /app/prod-lobby-proof.js
// Seeds clearly-marked test data (ff000000-*), drives the full path against localhost:3000,
// asserts the reveal invariant AND the additive retention field (incl. the Sanctuary indicator),
// then cleans up in a finally. Prints PASS/FAIL. Uses the in-container DATABASE_URL.
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE = 'http://localhost:3000';
const SID = 'ff000000-0000-4000-8000-000000000001';
const CID = 'ff000000-0000-4000-8000-000000000002';
const SESSTOK = 'lobbyproof-sess-ff000000-0000-4000-8000-000000000003';
const LINK = 'https://zoom.us/j/LOBBYPRODPROOF';

async function GET(p, h) { const r = await fetch(BASE + p, { headers: h || {} }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }
async function POST(p, h, body) { const r = await fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(h || {}) }, body: body ? JSON.stringify(body) : undefined }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }
const checks = [];
const pass = (n, ok, d) => checks.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`);

(async () => {
  const health = await GET('/api/health');
  pass('health 200', health.s === 200, `(status ${health.s})`);
  const fake = await GET('/api/session/join/faketoken_lobbyproof');
  pass('no-token -> 401', fake.s === 401, `(status ${fake.s})`);

  const pr = await pool.query("SELECT p.member_id AS mid FROM practitioners p JOIN members m ON m.id=p.member_id WHERE p.status='active' LIMIT 1");
  if (!pr.rows.length) { console.log('NO active practitioner with a real member; cannot run seeded path.'); console.log(checks.join('\n')); await pool.end(); return; }
  const mid = pr.rows[0].mid;
  const HDR = { 'x-session-token': SESSTOK };
  const REFLECT = { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: LINK };
  const SANCT = { agreementMode: 'sanctuary', videoProvider: 'soullab' };

  try {
    await pool.query('DELETE FROM auth_sessions WHERE session_token=$1', [SESSTOK]);
    await pool.query("INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked) VALUES ($1,$2, NOW() + INTERVAL '1 hour', false)", [mid, SESSTOK]);
    await pool.query("INSERT INTO practitioner_clients (id, practitioner_id, name, email, status) SELECT $1, p.id, 'Lobby Prod Proof', 'lobby-proof@test.invalid', 'active' FROM practitioners p WHERE p.member_id=$2 AND p.status='active' LIMIT 1 ON CONFLICT (id) DO NOTHING", [CID, mid]);
    await pool.query("INSERT INTO scribe_sessions (id, member_id, container, client_id) VALUES ($1,$2,'practitioner',$3) ON CONFLICT (id) DO UPDATE SET room_state='pre', agreement_mode=NULL, agreement_version=NULL, consent_client_at=NULL, video_link_reveal_allowed=false, video_link=NULL", [SID, mid, CID]);
    await pool.query('DELETE FROM session_join_tokens WHERE session_id=$1', [SID]);
    await pool.query('DELETE FROM session_consent_events WHERE session_id=$1', [SID]);

    // --- Reflection: full path + retention + reveal invariant ---
    const set1 = await POST(`/api/studio/sessions/${SID}/agreement`, HDR, REFLECT);
    const t1 = set1.b && set1.b.joinToken;
    pass('practitioner set (reflection) -> token', set1.s === 200 && !!t1, `(status ${set1.s}, body ${JSON.stringify(set1.b).slice(0, 140)})`);

    const g1 = await GET(`/api/session/join/${t1}`);
    const r1 = g1.b && g1.b.retention;
    pass('pre-accept: retention correct (reflection)',
      !!r1 && r1.mode === 'reflection' && r1.summary === true && r1.transcript === 'temporary' && r1.recording === false && r1.sanctuary === false,
      `(retention ${JSON.stringify(r1)})`);
    pass('pre-accept: no link, pending (gate holds)', g1.b && g1.b.videoLink === null && g1.b.state === 'pending', `(state ${g1.b && g1.b.state}, link ${g1.b && g1.b.videoLink})`);

    const ac = await POST(`/api/session/join/${t1}/accept`);
    pass('accept -> 200', ac.s === 200, `(status ${ac.s})`);
    const g2 = await GET(`/api/session/join/${t1}`);
    pass('post-accept: state accepted (Lobby renders)', g2.b && g2.b.state === 'accepted', `(state ${g2.b && g2.b.state})`);
    pass('post-accept: link revealed', g2.b && g2.b.videoLink === LINK, `(link ${g2.b && g2.b.videoLink})`);
    pass('post-accept: retention present', !!(g2.b && g2.b.retention) && g2.b.retention.summary === true, `(retention ${JSON.stringify(g2.b && g2.b.retention)})`);

    // --- Sanctuary: indicator-only retention (re-set in pre state mints a new version/token) ---
    await pool.query("UPDATE scribe_sessions SET room_state='pre', consent_client_at=NULL, video_link_reveal_allowed=false WHERE id=$1", [SID]);
    const set2 = await POST(`/api/studio/sessions/${SID}/agreement`, HDR, SANCT);
    const t2 = set2.b && set2.b.joinToken;
    pass('practitioner set (sanctuary) -> token', set2.s === 200 && !!t2, `(status ${set2.s})`);
    if (t2) {
      const g3 = await GET(`/api/session/join/${t2}`);
      const r3 = g3.b && g3.b.retention;
      pass('sanctuary: retention indicator (sanctuary=true, nothing kept)',
        !!r3 && r3.sanctuary === true && r3.recording === false && r3.summary === false && r3.transcript === 'none',
        `(retention ${JSON.stringify(r3)})`);
    }

    // Old reflection token is now stale (agreement version changed) — must still withhold the link.
    const g4 = await GET(`/api/session/join/${t1}`);
    pass('old token -> no link (stale version)', g4.b && g4.b.videoLink === null, `(reason ${g4.b && g4.b.linkBlockedReason})`);
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
