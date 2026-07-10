/**
 * Eval member helpers — synthetic identity for the What Now? eval harness.
 *
 * Spec: docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md
 *   - Constraint 2: eval members are flagged tester=true AT CREATION (the
 *     michael.demo demo-hygiene boundary made structural).
 *   - Constraint 3: every record this helper creates is labeled synthetic in
 *     the record itself (name/passkey carry the EVAL-SYNTHETIC marker; the
 *     email lives under the RFC-2606 .invalid TLD, so it is undeliverable by
 *     construction).
 *
 * Auth flow (the only supported path for eval members):
 *   1. POST /api/members/email-code { email }
 *      In local dev Resend usually fails → the route returns 500, but the
 *      code row is inserted into magic_link_tokens BEFORE the send, so the
 *      token persists either way.
 *   2. Read the 6-digit code from the local magic_link_tokens table.
 *   3. POST /api/members/email-code/verify { email, code } → maia_session cookie.
 */

import { createRequire } from 'node:module';
import { join } from 'node:path';

export const SYNTHETIC_LABEL = 'EVAL-SYNTHETIC';

export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  end(): Promise<void>;
}

/**
 * Open a pg connection using the `pg` package installed under appRoot.
 * The harness itself has no dependencies; it borrows the app's.
 */
export async function openDb(appRoot: string, databaseUrl: string): Promise<Db> {
  const req = createRequire(join(appRoot, 'package.json'));
  const { Client } = req('pg');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  return client as Db;
}

export interface EvalMember {
  id: string;
  email: string;
  username: string;
  runId: string;
}

/**
 * Create a synthetic eval member. tester=true is set IN THE INSERT — creation
 * and structural analytics exclusion are one atomic act, and the read-back
 * assertion below makes "tester at creation" a checked invariant, not a habit.
 *
 * password_hash is a sentinel that is not valid sha256 hex, so password
 * sign-in can never succeed for an eval member — the email-code flow is the
 * only door.
 */
export async function createEvalMember(db: Db, runId: string): Promise<EvalMember> {
  const email = `now-what-eval-${runId}@synthetic.invalid`;
  const username = `eval_nowwhat_${runId}`;
  const res = await db.query(
    `INSERT INTO members (passkey, username, password_hash, name, email, onboarded, onboarding_step, tester)
     VALUES ($1, $2, $3, $4, $5, true, 'complete', true)
     RETURNING id, tester`,
    [
      `${SYNTHETIC_LABEL}-${runId.toUpperCase()}`,
      username,
      `!${SYNTHETIC_LABEL}-NO-PASSWORD-LOGIN!`,
      `${SYNTHETIC_LABEL} — What Now? Tier 1 probe (${runId})`,
      email,
    ],
  );
  const row = res.rows[0];
  if (!row?.id) throw new Error('eval member insert returned no id');
  if (row.tester !== true) {
    throw new Error('tester flag is not true at creation — eval member would not be structurally excluded from analytics');
  }
  return { id: String(row.id), email, username, runId };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Authenticate the eval member through the real email-code flow and return a
 * Cookie header value carrying the maia_session token. Sessions are DB-backed
 * (auth_sessions), so the cookie stays valid across server restarts — one
 * authentication serves every scenario in a run.
 */
export async function authenticateEvalMember(
  baseUrl: string,
  member: EvalMember,
  db: Db,
): Promise<{ cookie: string }> {
  const reqRes = await fetch(`${baseUrl}/api/members/email-code`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: member.email }),
    signal: AbortSignal.timeout(120_000),
  });
  if (reqRes.status === 429) {
    throw new Error('email-code request was rate-limited — wait for the window to clear and re-run');
  }
  // 200 (Resend worked) and 500 (Resend failed AFTER the token insert) are both
  // acceptable in dev; anything else is a setup failure worth surfacing.
  if (reqRes.status !== 200 && reqRes.status !== 500) {
    throw new Error(`email-code request returned unexpected status ${reqRes.status}`);
  }

  let code: string | null = null;
  for (let i = 0; i < 10 && !code; i++) {
    const r = await db.query(
      `SELECT code FROM magic_link_tokens
        WHERE email = $1 AND used = false AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1`,
      [member.email],
    );
    code = (r.rows[0]?.code as string | undefined) ?? null;
    if (!code) await sleep(500);
  }
  if (!code) {
    throw new Error(
      `no live code row in magic_link_tokens for ${member.email} (email-code status ${reqRes.status})`,
    );
  }

  const verifyRes = await fetch(`${baseUrl}/api/members/email-code/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: member.email, code }),
    signal: AbortSignal.timeout(120_000),
  });
  const vj = (await verifyRes.json().catch(() => null)) as Record<string, unknown> | null;
  if (verifyRes.status !== 200 || !vj || vj.success !== true) {
    throw new Error(`email-code verify failed (status ${verifyRes.status}): ${JSON.stringify(vj)}`);
  }

  const setCookies: string[] =
    typeof (verifyRes.headers as { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (verifyRes.headers as unknown as { getSetCookie(): string[] }).getSetCookie()
      : [verifyRes.headers.get('set-cookie') ?? ''];
  const m = setCookies.join('; ').match(/maia_session=([^;,\s]+)/);
  if (!m) throw new Error('verify succeeded but no maia_session cookie was set');
  return { cookie: `maia_session=${m[1]}` };
}

/**
 * Remove every record the run created (member, sessions, code rows, and any
 * practice_fields row the guidance probes wrote). Default-on so repeated runs
 * leave no synthetic residue in the dev DB; pass --keep-member to retain the
 * rows for inspection (they remain labeled synthetic + tester=true).
 */
export async function cleanupEvalMember(db: Db, member: EvalMember): Promise<void> {
  await db.query('DELETE FROM practice_fields WHERE practitioner_member_id = $1', [member.id]);
  await db.query('DELETE FROM auth_sessions WHERE member_id = $1', [member.id]);
  await db.query('DELETE FROM magic_link_tokens WHERE email = $1', [member.email]);
  await db.query('DELETE FROM members WHERE id = $1', [member.id]);
}
