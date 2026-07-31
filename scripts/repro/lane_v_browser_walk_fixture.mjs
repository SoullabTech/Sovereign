#!/usr/bin/env node
/**
 * Lane V — browser-walk fixture (LOCAL ONLY).
 *
 * Seeds a synthetic member, a synthetic authenticated session, and two
 * synthetic threads already shared with a practitioner — one `practice` (shows
 * on /now-what/field) and one `question` (shows on /now-what/questions) — so
 * the withdrawal gesture can be exercised in a real browser.
 *
 * Nothing here touches a real member's record. Every row is prefixed
 * `lane-v-browser-` and removed by `--cleanup`.
 *
 * REFUSES to run against anything but a local database. This mints an auth
 * session; it must never be pointed at production.
 *
 *   node scripts/repro/lane_v_browser_walk_fixture.mjs --seed
 *   node scripts/repro/lane_v_browser_walk_fixture.mjs --cleanup
 */

import pg from 'pg';

const DSN = process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';

if (!/@?localhost|127\.0\.0\.1/.test(DSN)) {
  console.error('REFUSED: fixture is local-only, and DATABASE_URL is not local:', DSN);
  process.exit(1);
}

const TAG = 'lane-v-browser';
const TOKEN = 'lane-v-browser-walk-synthetic-session-token-do-not-reuse';
const PRACTICE = 'Synthetic visibility-withdrawal acceptance record (practice)';
const QUESTION = 'Synthetic visibility-withdrawal acceptance record (question)';

const client = new pg.Client({ connectionString: DSN });
await client.connect();

const mode = process.argv[2];

if (mode === '--cleanup') {
  const r = await client.query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
  console.log(`cleaned up ${r.rowCount} synthetic member(s) (threads + sessions cascade)`);
  await client.end();
  process.exit(0);
}

if (mode !== '--seed') {
  console.error('usage: --seed | --cleanup');
  process.exit(1);
}

// Idempotent: clear any prior fixture first.
await client.query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);

const m = await client.query(
  `INSERT INTO members (passkey, username, password_hash, name, onboarded)
   VALUES ($1, $2, 'not-a-real-hash', 'Lane V Browser Walk', TRUE) RETURNING id`,
  [`${TAG}-key`, `${TAG}-member`],
);
const memberId = m.rows[0].id;

for (const [title, phase] of [[PRACTICE, 'practice'], [QUESTION, 'question']]) {
  await client.query(
    `INSERT INTO member_field_note_threads
       (member_id, title, content, authorship, is_directly_stated, member_confirmed,
        member_decision, consent_state, can_be_remembered,
        can_be_shown_to_practitioner, confirmed_at, spiralogic_phase)
     VALUES ($1, $2, $2, 'member_authored', TRUE, TRUE,
             'keep', 'member-confirmed-memory', TRUE, TRUE, NOW(), $3)`,
    [memberId, title, phase],
  );
}

const expires = new Date();
expires.setDate(expires.getDate() + 1);
await client.query(
  `INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, $3)`,
  [memberId, TOKEN, expires.toISOString()],
);

console.log(JSON.stringify({ memberId, sessionToken: TOKEN, cookie: 'maia_session' }, null, 2));
await client.end();
