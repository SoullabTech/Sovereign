/**
 * Mobile Test Identity — resettable, ephemeral, synthetic authenticated member
 * for an IN-PROCESS proof of MAIA's real session-token auth lifecycle.
 *
 * CANONICAL ISOLATION (founder-ratified — spec §2.1 + scripts/verify-test-env.sh):
 *   - Runs ONLY after scripts/verify-test-env.sh passes (the fail-closed guard,
 *     which asserts TEST_DATABASE_URL + DB name + role + live owner before this).
 *   - Reads TEST_DATABASE_URL; the target DB must be `maia_consciousness_test`
 *     (owner `maia_test_user`). The production-named `maia_consciousness` is
 *     refused. There is NO MTI_CONFIRM_LOCAL and NO generic DATABASE_URL guard —
 *     the dedicated test DB/role + the fail-closed guard ARE the isolation.
 *   - Exercises the REAL lib/auth contract (verifyPassword + createSession +
 *     validateSession + getMemberIdFromSessionToken + revokeSession). No bypass.
 *   - Temporary credential, created for the run and destroyed by manifest cleanup.
 *
 * FIDELITY: IN-PROCESS authentication lifecycle proof — NOT HTTP, NOT on-device.
 * It resolves a production-shaped Request's x-session-token through the exact
 * resolver every protected route uses for the native (iOS) path
 * (getMemberFromRequest.ts:44-47); a null result is what enforcing routes
 * (e.g. atoms/[id]/breakthrough:58-60) return as 401. The over-the-wire leg is
 * the phone's job, using the credential this instrument mints.
 *
 * Commands: verify (default) · cleanup <id|runId>
 */

import { randomBytes } from 'crypto';

const APPROVED_TEST_DB = 'maia_consciousness_test';
const APPROVED_TEST_ROLE = 'maia_test_user';
const LABEL = 'DEVICE-TEST';

type QueryFn = <T = any>(sql: string, params?: unknown[]) => Promise<{ rows: T[]; rowCount?: number | null }>;

function fail(msg: string): never {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

/**
 * Read + validate TEST_DATABASE_URL, then point the app DB layer at it by setting
 * DATABASE_URL (which @/lib/db/postgres reads) BEFORE the auth modules load. This
 * is plumbing, not a guard — the fail-closed scripts/verify-test-env.sh is the
 * gate and must already have passed. The live current_user/current_database
 * assertion below is the authoritative in-process isolation check.
 */
function bindTestDatabase(): void {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) fail('TEST_DATABASE_URL is not set — run scripts/verify-test-env.sh first.');
  if (/\/maia_consciousness(\?|$)/.test(url)) {
    fail('TEST_DATABASE_URL targets the production-named DB maia_consciousness — refusing.');
  }
  let dbName = '';
  try {
    dbName = new URL(url).pathname.replace(/^\//, '').replace(/\?.*$/, '');
  } catch {
    fail('TEST_DATABASE_URL is not a parseable URL.');
  }
  if (dbName !== APPROVED_TEST_DB) fail(`TEST_DATABASE_URL database "${dbName}" != approved "${APPROVED_TEST_DB}".`);
  process.env.DATABASE_URL = url;
}

function newRunId(): string {
  return `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
}

interface TestMember {
  id: string;
  username: string;
  email: string;
  passkey: string;
  password: string;
}

async function createTestMember(query: QueryFn, hashPassword: (p: string) => Promise<string>, runId: string): Promise<TestMember> {
  const password = randomBytes(18).toString('base64url');
  const passwordHash = await hashPassword(password);
  const passkey = `${LABEL}-${runId.toUpperCase()}`;
  const username = `device_test_${runId}`;
  const email = `device-test-${runId}@synthetic.invalid`;
  const name = `${LABEL} — session-token lifecycle proof (${runId})`;
  const res = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step)
     VALUES ($1, $2, $3, $4, $5, true, 'complete')
     RETURNING id`,
    [passkey, username, passwordHash, name, email],
  );
  const id = res.rows[0]?.id;
  if (!id) fail('member INSERT returned no id');
  return { id, username, email, passkey, password };
}

/** All public BASE TABLES (never views) that reference a member. */
async function discoverMemberColumns(query: QueryFn): Promise<Array<{ table: string; column: string }>> {
  const res = await query<{ table_name: string; column_name: string }>(
    `SELECT c.table_name, c.column_name
       FROM information_schema.columns c
       JOIN information_schema.tables t
         ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND (c.column_name = 'member_id' OR c.column_name LIKE '%\\_member\\_id')
        AND c.table_name <> 'members'
      ORDER BY c.table_name`,
  );
  return res.rows.map((r) => ({ table: r.table_name, column: r.column_name }));
}

/** Manifest-driven deletion of every row referencing the member, then the member. */
async function cleanupMember(query: QueryFn, member: { id: string; email: string }): Promise<{ stuck: string[] }> {
  const cols = await discoverMemberColumns(query);
  let pending = [...cols];
  for (let pass = 0; pass < 6 && pending.length > 0; pass++) {
    const remaining: typeof pending = [];
    for (const { table, column } of pending) {
      try {
        await query(`DELETE FROM "${table}" WHERE "${column}" = $1`, [member.id]);
      } catch {
        remaining.push({ table, column });
      }
    }
    if (remaining.length === pending.length) break;
    pending = remaining;
  }
  try {
    await query(`DELETE FROM magic_link_tokens WHERE email = $1`, [member.email]);
  } catch {
    /* table may be absent */
  }
  await query(`DELETE FROM members WHERE id = $1`, [member.id]);
  return { stuck: pending.map((p) => `${p.table}.${p.column}`) };
}

/** Zero-residue scan across every member-referencing base table. */
async function verifyGone(query: QueryFn, memberId: string): Promise<Array<{ table: string; column: string; count: number }>> {
  const residuals: Array<{ table: string; column: string; count: number }> = [];
  const m = await query<{ n: string }>(`SELECT count(*)::text AS n FROM members WHERE id = $1`, [memberId]);
  if (Number(m.rows[0]?.n ?? 0) > 0) residuals.push({ table: 'members', column: 'id', count: Number(m.rows[0].n) });
  for (const { table, column } of await discoverMemberColumns(query)) {
    try {
      const r = await query<{ n: string }>(`SELECT count(*)::text AS n FROM "${table}" WHERE "${column}" = $1`, [memberId]);
      const n = Number(r.rows[0]?.n ?? 0);
      if (n > 0) residuals.push({ table, column, count: n });
    } catch {
      /* unreadable table */
    }
  }
  return residuals;
}

function step(n: number, msg: string) {
  console.log(`  [${n}] ${msg}`);
}

async function loadDeps() {
  const { query } = await import('@/lib/db/postgres');
  const { hashPassword, verifyPassword } = await import('@/lib/auth/passwordUtils');
  const { createSession, validateSession, revokeSession } = await import('@/lib/auth/serverSessions');
  const { getMemberIdFromSessionToken } = await import('@/lib/auth/getMemberFromRequest');
  return { query: query as unknown as QueryFn, hashPassword, verifyPassword, createSession, validateSession, revokeSession, getMemberIdFromSessionToken };
}

/** Authoritative in-process isolation check: the live connection, not DSN text. */
async function assertConnectedToTestDb(query: QueryFn): Promise<{ u: string; d: string }> {
  const who = await query<{ u: string; d: string }>('SELECT current_user AS u, current_database() AS d');
  const { u, d } = who.rows[0] ?? { u: '', d: '' };
  if (u !== APPROVED_TEST_ROLE) fail(`connected as role "${u}", not "${APPROVED_TEST_ROLE}"`);
  if (d !== APPROVED_TEST_DB) fail(`connected to database "${d}", not "${APPROVED_TEST_DB}"`);
  return { u, d };
}

async function runVerify(): Promise<void> {
  bindTestDatabase();
  const deps = await loadDeps();
  const { query, hashPassword, verifyPassword, createSession, validateSession, revokeSession, getMemberIdFromSessionToken } = deps;

  const { u, d } = await assertConnectedToTestDb(query);
  const runId = newRunId();
  console.log(`\n▶ Mobile Test Identity — in-process auth lifecycle proof (runId=${runId}, role=${u}, db=${d})\n`);

  let member: TestMember | null = null;
  try {
    // 1. Synthetic member in the isolated test DB.
    member = await createTestMember(query, hashPassword, runId);
    step(1, `created synthetic member ${member.passkey} (id=${member.id})`);

    // 2. Real sign-in path + validate (verifyPassword + createSession + validateSession).
    const row = await query<{ password_hash: string }>(`SELECT password_hash FROM members WHERE id = $1`, [member.id]);
    const vr = await verifyPassword(member.password, row.rows[0]!.password_hash);
    if (!vr.ok) fail('sign-in FAILED: verifyPassword rejected the correct password');
    const session = await createSession({ memberId: member.id, userAgent: 'mobile-test-identity' });
    if (!/^[0-9a-f]{64}$/.test(session.sessionToken)) fail('createSession returned a malformed token');
    const validated = await validateSession(session.sessionToken);
    if (!validated || validated.memberId !== member.id) fail('validateSession did not confirm the fresh session');
    step(2, `signed in — real auth_sessions row minted + validated (session id=${session.id})`);

    // 3. Resolve a PRODUCTION-SHAPED request via the exact native x-session-token resolver.
    const prodReq = new Request('https://soullab.life/api/sovereign/atoms/probe/breakthrough', {
      headers: { 'x-session-token': session.sessionToken, 'x-member-id': member.id, 'user-agent': 'MAIA/iOS CFNetwork Darwin' },
    });
    const resolved = await getMemberIdFromSessionToken(prodReq.headers.get('x-session-token'));
    if (resolved !== member.id) fail(`production-shaped request did NOT authorize (got ${resolved})`);
    step(3, 'production-shaped request authorized — x-session-token resolves to the member');

    // 4. Revoke.
    const revoked = await revokeSession(session.id, 'mti-lifecycle-proof');
    if (!revoked) fail('revokeSession returned false');
    step(4, 'session revoked');

    // 5. Rejection: the same production-shaped request now resolves to null — the 401 condition.
    const afterRevoke = await getMemberIdFromSessionToken(prodReq.headers.get('x-session-token'));
    if (afterRevoke !== null) fail(`rejection FAILED: revoked token still resolved to ${afterRevoke}`);
    step(5, 'production-shaped request REJECTED after revoke — the 401 condition holds');

    // 6. Recovery.
    const session2 = await createSession({ memberId: member.id, userAgent: 'mobile-test-identity' });
    const recovered = await getMemberIdFromSessionToken(session2.sessionToken);
    if (recovered !== member.id) fail(`recovery FAILED: fresh session did not resolve (got ${recovered})`);
    step(6, 'recovery works — re-authentication resolves again');

    // 7. Manifest-driven cleanup.
    const { stuck } = await cleanupMember(query, member);
    if (stuck.length) fail(`CLEANUP INCOMPLETE — ${stuck.join(', ')}\n   member id=${member.id} (rerun: cleanup ${member.id})`);
    step(7, 'manifest cleanup executed');

    // 8. Zero-residue assertion.
    const residuals = await verifyGone(query, member.id);
    if (residuals.length) {
      fail(`VERIFY-GONE FAILED — ${residuals.map((r) => `${r.table}.${r.column}=${r.count}`).join(', ')}\n   member id=${member.id} (rerun: cleanup ${member.id})`);
    }
    step(8, 'verify-gone — zero residual rows reference the member');

    console.log('\n✅ PASS — in-process native auth lifecycle: authorize → revoke (401 condition) → recover; identity fully removed.\n');
    process.exit(0);
  } catch (err) {
    let swept = false;
    if (member) {
      try {
        await cleanupMember(query, member);
        swept = (await verifyGone(query, member.id)).length === 0;
      } catch {
        /* fall through */
      }
    }
    const note = member ? (swept ? `\n   (member ${member.id} auto-cleaned)` : `\n   member id=${member.id} — run: cleanup ${member.id}`) : '';
    fail(`Unhandled error: ${(err as Error).message}${note}`);
  }
}

async function runCleanup(arg: string): Promise<void> {
  bindTestDatabase();
  const { query } = await loadDeps();
  await assertConnectedToTestDb(query);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(arg);
  const sel = isUuid
    ? await query<{ id: string; email: string }>(`SELECT id, email FROM members WHERE id = $1`, [arg])
    : await query<{ id: string; email: string }>(`SELECT id, email FROM members WHERE passkey = $1`, [arg.startsWith(LABEL) ? arg : `${LABEL}-${arg.toUpperCase()}`]);
  const target = sel.rows[0];
  if (!target) {
    console.log(`\nℹ️  No synthetic member for "${arg}" — nothing to clean (idempotent).\n`);
    process.exit(0);
  }
  const { stuck } = await cleanupMember(query, target);
  const residuals = await verifyGone(query, target.id);
  if (stuck.length || residuals.length) {
    fail(`cleanup incomplete for ${target.id}: stuck=[${stuck.join(', ')}] residual=[${residuals.map((r) => `${r.table}.${r.column}=${r.count}`).join(', ')}]`);
  }
  console.log(`\n✅ Cleaned up ${target.id} — zero residual.\n`);
  process.exit(0);
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'cleanup') {
    if (!arg) fail('usage: cleanup <member-id|runId>');
    await runCleanup(arg);
    return;
  }
  if (cmd === 'verify' || cmd === undefined) {
    await runVerify();
    return;
  }
  fail(`unknown command "${cmd}" — use: verify | cleanup <id>`);
}

void main();
