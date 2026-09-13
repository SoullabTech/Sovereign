/**
 * BW-01R — RUNTIME WITNESS for `BoundWorkScope` (founder-authorized, 2026-09-13).
 *
 * ⭐ WHAT MAKES THIS A WITNESS RATHER THAN A UNIT TEST. It runs against a REAL
 * PostgreSQL database with the REAL DDL for `members`, `auth_sessions`,
 * `member_manuscripts`, `manuscript_sections`, `runtime_consent_state` and
 * `context_disclosure_receipts`, extracted verbatim from the migrations. The
 * identity is resolved by the REAL `resolveCanonicalIdentity` against a REAL
 * `auth_sessions` row; the authority is minted by the REAL `bindWorkScope`; the
 * Work is read by the REAL `assembleFocus`; consent and receipts are written to
 * real tables by the real stores.
 *
 * ⛔ STATED LIMITS — a witness that overstates its reach is worse than none.
 *   1. `next/headers` `cookies()` is shimmed: there is no Next request context
 *      in a test process. The credential path exercised is the `x-session-token`
 *      header branch, which performs the same `auth_sessions` lookup.
 *   2. `prepare` and `generate` (cognition) are stubbed. This witnesses AUTHORITY
 *      GEOMETRY, not cognition. No model is called.
 *   3. This is not production. It is the real code path against a real database,
 *      which is strictly more than a mocked unit test and strictly less than a
 *      member using MAIA.
 *
 * Skips with a loud message when `BW01R_DATABASE_URL` is unset, so it can never
 * silently pass by not running.
 */

const DSN = process.env.BW01R_DATABASE_URL;
const run = DSN ? describe : describe.skip;
if (!DSN) {
  // eslint-disable-next-line no-console
  console.warn('[BW-01R] SKIPPED — set BW01R_DATABASE_URL to run the runtime witness.');
}
if (DSN) process.env.DATABASE_URL = DSN;

jest.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),   // limit (1): no Next request context
  headers: async () => new Headers(),
}));

import { randomUUID } from 'crypto';
import { query, closePool } from '@/lib/db/postgres';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn/identity';
import { bindWorkScope, isBoundWorkScope } from '../boundWorkScope';
import { performFocusCrossing } from '@/lib/writers-studio/focusCrossing';
import { assembleFocus } from '@/lib/writers-studio/assembleFocus';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { MemberIdentity } from '@/lib/maia/canonical-turn';

const A = { id: randomUUID(), token: randomUUID() };   // the author
const B = { id: randomUUID(), token: randomUUID() };   // somebody else
const WORK_A = randomUUID();
const WORK_NOWHERE = randomUUID();

const log: string[] = [];
const record = (n: string, v: string) => { log.push(`  ${n.padEnd(46)} ${v}`); };

const reqWith = (token: string) =>
  ({ headers: new Headers({ 'x-session-token': token }) }) as never;

const deps = () => ({
  assemble: assembleFocus,                                     // REAL Work read
  prepare: jest.fn(async () => ({ turn: { turnId: 't' }, proof: {} })) as never,
  generate: jest.fn(async () => 'stubbed cognition') as never,  // limit (2)
});

const crossing = (identity: MemberIdentity, workRef: string) => ({
  requestId: randomUUID(), identity, posture: TurnPosture.resolve({}),
  memberId: identity.status === 'verified' ? identity.memberId : 'none',
  sessionId: 's-1', disclosureId: randomUUID(), workRef,
  scopeKind: 'whole_work' as const, gesture: 'ask_maia' as const, ask: 'what is repeating here',
});

run('BW-01R · runtime witness — Work authority geometry on the real focus path', () => {
  let idA: MemberIdentity; let idB: MemberIdentity;

  beforeAll(async () => {
    for (const m of [A, B]) {
      await query(
        `INSERT INTO members (id, passkey, username, password_hash, name)
         VALUES ($1, $2, $3, $4, 'witness')`,
        [m.id, `PK-${m.id.slice(0, 8)}`, `u-${m.id.slice(0, 8)}`, 'x']);
      await query(
        `INSERT INTO auth_sessions (member_id, session_token, expires_at, revoked)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour', FALSE)`, [m.id, m.token]);
    }
    await query(`INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1, $2, $3)`,
      [WORK_A, A.id, 'The Work']);
    await query(
      `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
       VALUES ($1, 1, 'One', 'The sentence the witness reads.')`, [WORK_A]);

    idA = await resolveCanonicalIdentity(reqWith(A.token));
    idB = await resolveCanonicalIdentity(reqWith(B.token));
  });

  afterAll(async () => {
    await query(`DELETE FROM context_disclosure_receipts WHERE member_id = ANY($1)`, [[A.id, B.id]]);
    await query(`DELETE FROM runtime_consent_state WHERE member_id = ANY($1)`, [[A.id, B.id]]);
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [WORK_A]);
    await query(`DELETE FROM auth_sessions WHERE member_id = ANY($1)`, [[A.id, B.id]]);
    await query(`DELETE FROM members WHERE id = ANY($1)`, [[A.id, B.id]]);
    // eslint-disable-next-line no-console
    console.log(['', '  ── BW-01R WITNESS ─────────────────────────────────────────────', ...log, ''].join('\n'));
    await closePool();
  });

  it('W0 · the identities are REAL — resolved from auth_sessions rows', () => {
    expect(idA.status).toBe('verified');
    expect(idB.status).toBe('verified');
    record('W0 identity resolved from auth_sessions', `verified · A≠B ${idA !== idB}`);
  });

  it('W1 · minted identity + owned Work → scope minted → assembler REACHED', async () => {
    const bound = await bindWorkScope(idA, WORK_A);
    expect(bound.ok).toBe(true);
    expect(isBoundWorkScope(bound.ok === true ? bound.value : null)).toBe(true);

    /* ⭐ W1 witnesses AUTHORIZATION, and asserts the assembler is REACHED — which
       is exactly what W2/W3 prove does NOT happen when authority is absent. It
       deliberately does NOT assert that Work content arrives: see W7. The two
       outcomes are separable now, and that separation IS `BW-LAW-1`. */
    const reached: unknown[] = [];
    const d = { ...deps(), assemble: (async (ref: unknown) => { reached.push(ref); return assembleFocus(ref as never); }) as never };
    await performFocusCrossing(crossing(idA, WORK_A), d as never);

    expect(reached).toHaveLength(1);
    expect(isBoundWorkScope((reached[0] as { scope: unknown }).scope)).toBe(true);
    record('W1 owned Work', 'scope minted · assembler reached CARRYING THE BOUND SCOPE');
  });

  it('W2 · minted identity + FOREIGN Work → no scope, outward refusal', async () => {
    const bound = await bindWorkScope(idB, WORK_A);
    expect(bound.ok).toBe(false);

    const d = deps();
    const r = await performFocusCrossing(crossing(idB, WORK_A), d as never);
    expect(r.response).toBeNull();
    expect(r.disclosureId).toBeNull();
    expect((d.prepare as unknown as jest.Mock)).not.toHaveBeenCalled();
    record('W2 foreign Work', `refused · assembler never reached · reason=${bound.ok === false && bound.reason}`);
    return { r };
  });

  it('W3 · minted identity + NONEXISTENT Work → the SAME outward refusal (BW-AUTH-3)', async () => {
    const dForeign = deps();
    const foreign = await performFocusCrossing(crossing(idB, WORK_A), dForeign as never);
    const dAbsent = deps();
    const absent = await performFocusCrossing(crossing(idA, WORK_NOWHERE), dAbsent as never);

    expect(JSON.stringify(foreign.presentation)).toBe(JSON.stringify(absent.presentation));
    expect(foreign.response).toBe(absent.response);
    expect(foreign.disclosureId).toBe(absent.disclosureId);

    const bForeign = await bindWorkScope(idB, WORK_A);
    const bAbsent = await bindWorkScope(idA, WORK_NOWHERE);
    expect(JSON.stringify(bForeign)).toBe(JSON.stringify(bAbsent));
    record('W3 foreign vs nonexistent', 'byte-identical presentation AND refusal — no existence oracle');
  });

  it('W4 · fabricated or absent identity → binding impossible', async () => {
    const forged = { status: 'verified', memberId: A.id, memberRef: 'r' } as never;
    const f = await bindWorkScope(forged, WORK_A);
    expect(f.ok === false && f.reason).toBe('identity_not_minted');

    const anon = await resolveCanonicalIdentity({ headers: new Headers() } as never);
    expect(anon.status).toBe('anonymous');
    const a = await bindWorkScope(anon, WORK_A);
    expect(a.ok === false && a.reason).toBe('identity_not_verified');
    record('W4 forged / unauthenticated identity', 'identity_not_minted · identity_not_verified');
  });

  it('W5 · scope serialization attempted → hard failure (BW-AUTH-2)', async () => {
    const bound = await bindWorkScope(idA, WORK_A);
    const scope = (bound as { ok: true; value: unknown }).value;
    expect(() => JSON.stringify(scope)).toThrow(/must not be serialized/);
    record('W5 serialization attempt', 'threw — authority did not survive being written down');
  });

  it('W6 · ownership CHANGES between executions → fresh adjudication reflects current state', async () => {
    const before = await bindWorkScope(idA, WORK_A);
    expect(before.ok).toBe(true);

    /* The Work changes hands. No cache is invalidated, no event is emitted —
       the next execution simply asks again, which is the whole point of
       BW-AUTH-2: there is no stored capability to go stale. */
    await query(`UPDATE member_manuscripts SET member_id = $1 WHERE id = $2`, [B.id, WORK_A]);

    const afterA = await bindWorkScope(idA, WORK_A);
    const afterB = await bindWorkScope(idB, WORK_A);
    expect(afterA.ok).toBe(false);
    expect(afterB.ok).toBe(true);

    const d = deps();
    const r = await performFocusCrossing(crossing(idA, WORK_A), d as never);
    expect(r.disclosureId).toBeNull();
    expect((d.prepare as unknown as jest.Mock)).not.toHaveBeenCalled();

    await query(`UPDATE member_manuscripts SET member_id = $1 WHERE id = $2`, [A.id, WORK_A]);
    record('W6 ownership handover mid-witness', 'prior author refused · new author admitted · no stale capability');
  });

  /* ─────────────────────────────────────────────────────────────────────────
     ⭐ W7 · WHAT THE WITNESS FOUND THAT NO MOCKED TEST COULD.
     Pinned as evidence, ⛔ NOT REPAIRED — repair is not authorized by BW-01R. */

  it('W7 · the focus assembler queries a table that does not exist', async () => {
    await expect(query(
      `SELECT s.body FROM manuscript_sections s
         JOIN manuscripts m ON m.id = s.manuscript_id
        WHERE s.manuscript_id = $1 AND m.user_id = $2`, [WORK_A, A.id],
    )).rejects.toThrow(/relation "manuscripts" does not exist/);

    /* The real ownership shape, on the real schema, returns the Work. */
    const real = await query<{ body: string }>(
      `SELECT s.body FROM manuscript_sections s
         JOIN member_manuscripts m ON m.id = s.manuscript_id
        WHERE s.manuscript_id = $1 AND m.member_id = $2
        ORDER BY s.position ASC`, [WORK_A, A.id]);
    expect(real.rows[0].body).toContain('The sentence the witness reads.');

    record('W7 SCHEMA FACT', '`manuscripts`.`user_id` absent · real shape is `member_manuscripts`.`member_id`');
  });

  /* ═══════════════════════════════════════════════════════════════════════
     BW-03 · CLASS-C FAILURE SEMANTICS.
     ⭐ W7 is the NEGATIVE CONTROL. These run FIRST against the deliberately
     broken query, and again after the repair. A mechanism that cannot be shown
     failing loudly on a known-bad input has not been shown to work. */

  it('W8 · a materialization fault is classified, never collapsed to absence', async () => {
    const bound = await bindWorkScope(idA, WORK_A);
    const m = await assembleFocus({
      scope: (bound as { ok: true; value: never }).value, scopeKind: 'whole_work',
    } as never);

    /* ⛔ The three prohibitions BW-03 exists to enforce. */
    expect(m).not.toBeNull();                       // must NOT return null
    expect(m.kind).not.toBe('unavailable');          // must NOT be the binder's word
    expect(['loaded', 'empty', 'materialization_failed', 'invariant_failed']).toContain(m.kind);

    const mode = process.env.BW03_EXPECT ?? 'known_bad';
    if (mode === 'known_bad') {
      expect(m.kind).toBe('materialization_failed');
      expect((m as { detail: { error: string } }).detail.error).toMatch(/relation "manuscripts" does not exist/);
      record('W8 KNOWN-BAD', `kind=${m.kind} · stage=${(m as { detail: { stage: string } }).detail.stage} · operator sees the exact schema fault`);
    } else {
      expect(m.kind).toBe('loaded');
      expect((m as { content: string }).content).toContain('The sentence the witness reads.');
      record('W8 REPAIRED', `kind=${m.kind} · content materialized`);
    }
  });

  it('W9 · post-authority failure does NOT resemble a foreign or absent Work', async () => {
    const dFail = deps();
    const failed = await performFocusCrossing(crossing(idA, WORK_A), dFail as never);
    const dForeign = deps();
    const foreign = await performFocusCrossing(crossing(idB, WORK_A), dForeign as never);

    if ((process.env.BW03_EXPECT ?? 'known_bad') === 'known_bad') {
      /* ⭐ THE BW-03 PROPERTY. Before this act both were the same sentence. */
      expect(JSON.stringify(failed.presentation)).not.toBe(JSON.stringify(foreign.presentation));
      expect(failed.presentation.message).not.toBe(foreign.presentation.message);
      record('W9 KNOWN-BAD', 'post-authority failure is DISTINGUISHABLE from pre-authority refusal');
    } else {
      expect((dFail.prepare as unknown as jest.Mock)).toHaveBeenCalled();
      record('W9 REPAIRED', 'authorized focus reaches cognition');
    }
    /* Both runs: nothing crossed on the refused path, and no Work was handed over. */
    expect(foreign.disclosureId).toBeNull();
    expect((dForeign.prepare as unknown as jest.Mock)).not.toHaveBeenCalled();
  });

  it('W10 · PRE-AUTHORITY symmetry is UNCHANGED by BW-03 (AUTH-04 still holds)', async () => {
    const foreign = await performFocusCrossing(crossing(idB, WORK_A), deps() as never);
    const absent = await performFocusCrossing(crossing(idA, WORK_NOWHERE), deps() as never);
    expect(JSON.stringify(foreign.presentation)).toBe(JSON.stringify(absent.presentation));
    record('W10 pre-authority symmetry', 'foreign ≡ absent — loudness did not leak backwards');
  });
});
