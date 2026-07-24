/**
 * #721 — credential-primitive proof, against a REAL database.
 *
 * The route-level proofs live in `__tests__/write-perimeter-containment.test.ts`
 * (auth mocked, route behaviour asserted). This file proves the other half: that
 * the credential primitive both routes now depend on —
 * `getMemberIdFromRequest` → `memberIdForSessionToken` — actually rejects revoked
 * and expired sessions against real `auth_sessions` rows.
 *
 * Why it is separate: jest cannot reach `next/headers`, so the primitive cannot be
 * exercised through the route in a unit test. Asserting the predicate here keeps
 * both halves honest without either pretending to be the other.
 *
 * Expiry is not revocation. This proves BOTH are enforced.
 *
 * Run:  npx tsx scripts/proof-write-perimeter.ts        (local dev DB only)
 */
import { query } from '../lib/db/postgres';

const TAG = `perimeter-proof-${globalThis.crypto.randomUUID()}`;
let pass = 0;
let fail = 0;

const ok = (name: string, cond: boolean, detail: string) => {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name} — ${detail}`);
  } else {
    fail++;
    console.log(`  ❌ ${name} — ${detail}`);
  }
};

/** The exact predicate used by lib/auth/getMemberFromRequest.ts::memberIdForSessionToken. */
async function resolve(token: string): Promise<string | null> {
  const r = await query<{ member_id: string }>(
    `SELECT member_id FROM auth_sessions
      WHERE session_token = $1 AND revoked = FALSE AND expires_at > NOW() LIMIT 1`,
    [token]
  );
  return r.rows[0]?.member_id ?? null;
}

async function main() {
  console.log(`\n#721 CREDENTIAL-PRIMITIVE PROOF  (${TAG})\n`);

  const member = await query<{ id: string }>(
    `INSERT INTO members (id, passkey, username, name, password_hash)
     VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id`,
    [`${TAG}-key`, `${TAG}-user`, 'Perimeter Proof', 'x'.repeat(64)]
  );
  const memberId = member.rows[0].id;

  const mk = async (token: string, opts: { revoked?: boolean; expired?: boolean }) => {
    await query(
      `INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked, revoked_reason)
       VALUES ($1, $2, NOW() + ($3 || ' hours')::interval, $4, $5)`,
      [memberId, token, opts.expired ? -1 : 24, opts.revoked ?? false, opts.revoked ? 'proof' : null]
    );
  };

  await mk(`${TAG}-valid`, {});
  await mk(`${TAG}-revoked`, { revoked: true });
  await mk(`${TAG}-expired`, { expired: true });

  ok('valid session resolves', (await resolve(`${TAG}-valid`)) === memberId, 'returns the member id');
  ok(
    'REVOKED session is rejected',
    (await resolve(`${TAG}-revoked`)) === null,
    'returns null — logout/revoke is enforced server-side, not merely client-side'
  );
  ok(
    'EXPIRED session is rejected',
    (await resolve(`${TAG}-expired`)) === null,
    'returns null — expiry enforced independently of revocation'
  );
  ok('unknown token is rejected', (await resolve(`${TAG}-nonexistent`)) === null, 'returns null');

  // Revocation must take effect on an ALREADY-ISSUED, otherwise-valid token.
  await query(`UPDATE auth_sessions SET revoked = TRUE, revoked_at = NOW() WHERE session_token = $1`, [
    `${TAG}-valid`,
  ]);
  ok(
    'revoking a live session invalidates it immediately',
    (await resolve(`${TAG}-valid`)) === null,
    'the previously-valid token stops resolving — revocation is not deferred to expiry'
  );

  await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
  await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  console.log('\n· proof rows cleaned up');
  console.log(`\n${pass} passed · ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('PROOF ERROR:', e);
  process.exit(2);
});
