/* eslint-disable */
// Track 2 PROD proof — verifies write-time video-link hardening (#457) on the practitioner
// agreement route. Runs INSIDE the maia container AFTER the #457 deploy:
//   docker cp scripts/prod-track2-proof.js maia-sovereign:/app/prod-track2-proof.js
//   docker exec maia-sovereign node /app/prod-track2-proof.js
//   (then, since docker cp writes as root:)  docker exec -u root maia-sovereign rm -f /app/prod-track2-proof.js
//
// Asserts exactly:
//   - valid https:// external link persists
//   - javascript: external link -> 400
//   - http: external link -> 400
//   - blank / missing external link -> 400
//   - soullab internal provider remains valid (no external URL persisted)
//   - existing accepted-token reveal still works
// Seeds clearly-marked test data (gg000000-*) and cleans up in a finally. Uses the in-container
// DATABASE_URL + a real auth_sessions session token (the practitioner route is session-hardened).
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE = 'http://localhost:3000';
const SID = 'fade0000-0000-4000-8000-000000000001';
const CID = 'fade0000-0000-4000-8000-000000000002';
const SESSTOK = 'track2proof-sess-fade0000-0000-4000-8000-000000000003';
const LINK_OK = 'https://zoom.us/j/TRACK2OK';

async function GET(p, h) { const r = await fetch(BASE + p, { headers: h || {} }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }
async function POST(p, h, body) { const r = await fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(h || {}) }, body: body ? JSON.stringify(body) : undefined }); let b = null; try { b = await r.json(); } catch {} return { s: r.status, b }; }
const checks = [];
const pass = (n, ok, d) => checks.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`);
const AG = `/api/studio/sessions/${SID}/agreement`;

(async () => {
  const health = await GET('/api/health');
  pass('health 200', health.s === 200, `(status ${health.s})`);

  const pr = await pool.query("SELECT p.member_id AS mid FROM practitioners p JOIN members m ON m.id=p.member_id WHERE p.status='active' LIMIT 1");
  if (!pr.rows.length) { console.log('NO active practitioner with a real member; cannot run.'); console.log(checks.join('\n')); await pool.end(); return; }
  const mid = pr.rows[0].mid;
  const HDR = { 'x-session-token': SESSTOK };

  try {
    await pool.query('DELETE FROM auth_sessions WHERE session_token=$1', [SESSTOK]);
    await pool.query("INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked) VALUES ($1,$2, NOW() + INTERVAL '1 hour', false)", [mid, SESSTOK]);
    await pool.query("INSERT INTO practitioner_clients (id, practitioner_id, name, email, status) SELECT $1, p.id, 'Track2 Proof', 'track2-proof@test.invalid', 'active' FROM practitioners p WHERE p.member_id=$2 AND p.status='active' LIMIT 1 ON CONFLICT (id) DO NOTHING", [CID, mid]);
    await pool.query("INSERT INTO scribe_sessions (id, member_id, container, client_id) VALUES ($1,$2,'practitioner',$3) ON CONFLICT (id) DO UPDATE SET room_state='pre', agreement_mode=NULL, agreement_version=NULL, consent_client_at=NULL, video_link_reveal_allowed=false, video_link=NULL", [SID, mid, CID]);
    await pool.query('DELETE FROM session_join_tokens WHERE session_id=$1', [SID]);
    await pool.query('DELETE FROM session_consent_events WHERE session_id=$1', [SID]);

    // 1. valid https:// external link persists
    const ok1 = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: LINK_OK });
    pass('valid https set -> 200 + token', ok1.s === 200 && !!(ok1.b && ok1.b.joinToken), `(status ${ok1.s})`);
    const g1 = await GET(AG, HDR);
    pass('valid https PERSISTS (practitioner GET)', g1.s === 200 && g1.b && g1.b.agreement && g1.b.agreement.videoLink === LINK_OK, `(stored ${g1.b && g1.b.agreement && g1.b.agreement.videoLink})`);

    // 2. javascript: external -> 400
    const js = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: 'javascript:alert(1)' });
    pass('javascript: external -> 400', js.s === 400, `(status ${js.s}, err ${js.b && js.b.error})`);

    // 3. http: external -> 400
    const http = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: 'http://insecure.example/x' });
    pass('http: external -> 400', http.s === 400, `(status ${http.s}, err ${http.b && http.b.error})`);

    // 4. blank / missing external -> 400
    const blank = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: '' });
    pass('blank external -> 400', blank.s === 400, `(status ${blank.s})`);
    const missing = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom' });
    pass('missing external -> 400', missing.s === 400, `(status ${missing.s})`);

    // 5. soullab internal provider remains valid (no external URL persisted)
    const sl = await POST(AG, HDR, { agreementMode: 'notes', videoProvider: 'soullab' });
    pass('soullab set -> 200', sl.s === 200, `(status ${sl.s})`);
    const g5 = await GET(AG, HDR);
    pass('soullab persists NO external URL', g5.s === 200 && g5.b && g5.b.agreement && g5.b.agreement.videoLink === null, `(stored ${g5.b && g5.b.agreement && g5.b.agreement.videoLink})`);

    // 6. existing accepted-token reveal still works (valid https, end-to-end)
    const set6 = await POST(AG, HDR, { agreementMode: 'reflection', videoProvider: 'zoom', videoLink: LINK_OK });
    const t6 = set6.b && set6.b.joinToken;
    const j1 = await GET(`/api/session/join/${t6}`);
    pass('reveal: pre-accept no link', j1.b && j1.b.state === 'pending' && j1.b.videoLink === null, `(state ${j1.b && j1.b.state})`);
    await POST(`/api/session/join/${t6}/accept`);
    const j2 = await GET(`/api/session/join/${t6}`);
    pass('reveal: post-accept link revealed', j2.b && j2.b.state === 'accepted' && j2.b.videoLink === LINK_OK, `(link ${j2.b && j2.b.videoLink})`);
  } finally {
    // Defensive cleanup — session token first (most sensitive), each delete independent so a
    // single failure can never strand the others (the gg-UUID bug stranded a token once).
    for (const [sql, args] of [
      ['DELETE FROM auth_sessions WHERE session_token=$1', [SESSTOK]],
      ['DELETE FROM scribe_sessions WHERE id=$1', [SID]], // cascade tokens + events
      ['DELETE FROM practitioner_clients WHERE id=$1', [CID]],
    ]) {
      try { await pool.query(sql, args); } catch (e) { console.log('cleanup warn:', String(e)); }
    }
    const left = await pool.query('SELECT (SELECT count(*) FROM scribe_sessions WHERE id=$1) a, (SELECT count(*) FROM session_join_tokens WHERE session_id=$1) b, (SELECT count(*) FROM session_consent_events WHERE session_id=$1) c, (SELECT count(*) FROM practitioner_clients WHERE id=$2) d, (SELECT count(*) FROM auth_sessions WHERE session_token=$3) e', [SID, CID, SESSTOK]);
    pass('cleanup (all test rows removed)', Object.values(left.rows[0]).every((n) => Number(n) === 0), `(${JSON.stringify(left.rows[0])})`);
  }
  console.log(checks.join('\n'));
  await pool.end();
})().catch((e) => { console.log('FATAL', String(e)); process.exit(1); });
