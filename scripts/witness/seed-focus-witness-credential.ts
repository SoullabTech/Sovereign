/**
 * FOCUS-WITNESS-01 · the credential fixture.
 *
 *   ⭐⭐ IT CREATES REAL SUBSTRATE, NOT AN EXCEPTION. The witness must traverse
 *       the real identity seam, so this inserts exactly the row that seam
 *       already looks for and changes nothing about how it looks.
 *
 * `resolveCanonicalIdentity` → `getMemberIdFromRequest` → `auth_sessions`:
 *
 *     SELECT member_id FROM auth_sessions
 *      WHERE session_token = $1 AND revoked = FALSE AND expires_at > NOW()
 *
 * The walk presents the token as `x-session-token`, a transport the resolver
 * already honours for cookie-blocked clients.
 *
 * ⛔ WHAT THIS MAY NEVER BECOME. No authentication bypass. No hard-coded
 * "verified" return. No route-only test branch. No production credential, no
 * real person's credential, no committed secret. The token is minted per run,
 * printed once for the walk, and dies with the disposable database.
 *
 * ⛔ REFUSES A DATABASE THAT LOOKS INHABITED — the same structural guard
 * `seed-focus-witness-work.ts` uses, and for the same reason: a fixture that
 * could run against production is a fixture that eventually will.
 *
 *   DATABASE_URL=postgres://…/<disposable> npx tsx scripts/witness/seed-focus-witness-credential.ts
 */

import { randomBytes } from 'crypto';
import { query } from '../../lib/db/postgres';

/** The member `seed-focus-witness-work.ts` creates. */
const MEMBER = '3f3f3f3f-0000-4000-8000-000000000001';

async function main() {
  const inhabited = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM member_manuscripts WHERE member_id <> $1`, [MEMBER]);
  if (Number(inhabited.rows[0].n) > 0) {
    console.error(
      `\n⛔ REFUSING: this database holds ${inhabited.rows[0].n} Work(s) belonging to other members.\n` +
      '   The witness credential fixture is for a DISPOSABLE database only.\n');
    process.exit(1);
  }

  const member = await query<{ id: string }>(`SELECT id FROM members WHERE id = $1`, [MEMBER]);
  if (member.rows.length === 0) {
    console.error('\n⛔ The witness member does not exist. Run seed-focus-witness-work.ts first.\n');
    process.exit(1);
  }

  /* ⭐ High entropy, minted here, never derived from anything durable. */
  const token = `wit_${randomBytes(32).toString('base64url')}`;
  await query(
    `INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked)
     VALUES ($1, $2, NOW() + interval '2 hours', FALSE)`,
    [MEMBER, token]);

  /* ⭐ The fixture proves itself through the REAL predicate, not by trusting the
     INSERT. If the resolver's query cannot find this row, the walk would fail at
     the route with a 401 and the cause would be invisible there. */
  const resolves = await query<{ member_id: string }>(
    `SELECT member_id FROM auth_sessions
      WHERE session_token = $1 AND revoked = FALSE AND expires_at > NOW() LIMIT 1`, [token]);
  if (resolves.rows[0]?.member_id !== MEMBER) {
    console.error('\n⛔ The credential does not satisfy the resolver’s own predicate.\n');
    process.exit(1);
  }

  console.log(`memberId      ${MEMBER}`);
  console.log(`sessionToken  ${token}`);
  console.log('\n⛔ Disposable. Present it as `x-session-token`. It dies with this database.');
  process.exit(0);
}

main().catch(e => { console.error('credential fixture failed:', e); process.exit(1); });
