/**
 * S3 · P1 — THE DATABASE, NOT A MOCK, PROVES ONLY ONE ACT 3 CAN WIN.
 *
 * The fixture claimant modelled the contract. Three obligations only a real
 * substrate can discharge:
 *
 *   D1  ATOMICITY IS IN THE MUTATION — independent connections race,
 *       exactly one is CLAIMED
 *   D2  DURABLE TRUTH — after the winner commits, a LATER connection observes
 *       consumed without relying on process memory
 *   D3  TRANSACTION-FAILURE NORMALIZATION — concurrency mechanics do not leak
 *       upward as false semantics
 *
 * ⛔ SKIPPED unless S3_TEST_DATABASE_URL names a disposable cluster. This suite
 * creates and drops tables; it must never be pointed at production.
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createPendingAskClaimant, type SqlExecutor } from '../pendingAskClaimant';
import { claimAcquired, type ClaimOutcome } from '../claimContract';
import { runClaimObligations, failedObligations, type ClaimCandidate, type ResumeDeps, type ResumeResult } from '../claimObligations';

const URL = process.env.S3_TEST_DATABASE_URL;
const d = URL ? describe : describe.skip;

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const MIGRATION = join(ROOT, 'database', 'migrations', '20260910000001_pending_ask_claims.sql');

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';
const THREAD = '33333333-3333-3333-3333-333333333333';
const READING = '44444444-4444-4444-4444-444444444444';
/** The CHECK requires >= 32 characters: an opaque ref, not a counter. */
const pad = (s: string) => `${s}-${'0'.repeat(Math.max(0, 40 - s.length))}`;

let admin: Client;

const exec = (c: Client): SqlExecutor => ({
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
    const r = await c.query(sql, params as any[]);
    return { rows: r.rows as T[], rowCount: r.rowCount };
  },
});

/**
 * ⭐ An expired row is seeded with BOTH timestamps in the past. The CHECK
 * `expires_at > created_at` is a lifetime invariant, not a freshness one, so an
 * expired resume must be written as one that was created earlier and has since
 * lapsed — never as one created now that expired before it existed. Found by
 * running the seed, not by reading the constraint.
 */
async function seed(ref: string, opts: { expired?: boolean } = {}) {
  await admin.query(
    `INSERT INTO pending_ask_claims
       (ref, member_id, manuscript_id, thread_id, reading_id, observation_key,
        created_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,'obs-1',
             now() - ($6 || ' minutes')::interval,
             now() + ($7 || ' minutes')::interval)
     ON CONFLICT (ref) DO NOTHING`,
    [ref, MEMBER, WORK, THREAD, READING,
     opts.expired ? '60' : '0', opts.expired ? '-5' : '30'],
  );
}

d('S3 · P1 · pending_ask_claims — the real substrate', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    admin = new Client({ connectionString: URL });
    await admin.connect();
    await admin.query(`
      CREATE TABLE IF NOT EXISTS members (id uuid PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS member_manuscripts (id uuid PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS ask_threads (id uuid PRIMARY KEY);
      INSERT INTO members VALUES ($1) ON CONFLICT DO NOTHING;
      INSERT INTO member_manuscripts VALUES ($2) ON CONFLICT DO NOTHING;
      INSERT INTO ask_threads VALUES ($3) ON CONFLICT DO NOTHING;`
      .replace(/\$1/g, `'${MEMBER}'`).replace(/\$2/g, `'${WORK}'`).replace(/\$3/g, `'${THREAD}'`));
    await admin.query(readFileSync(MIGRATION, 'utf8'));
  });

  afterAll(async () => { await admin?.end(); });

  /* ── ⭐ THE LAWFUL CONTRACT, ON THE REAL TABLE ───────────────────────────── */

  it('the DB claimant passes all ten contract obligations', async () => {
    let n = 0;
    const candidate: ClaimCandidate = {
      make(s) {
        const prefix = `db-${Date.now()}-${n++}`;
        const map = (ref: string) => pad(`${prefix}-${ref}`);
        const ready = (async () => {
          for (const p of s.pending) await seed(map(p.ref));
          for (const r of s.expired) await seed(map(r), { expired: true });
        })();
        const faulting: SqlExecutor = {
          async query() { throw Object.assign(new Error('substrate down'), { code: '08006' }); },
        };
        const inner = createPendingAskClaimant(s.faulted ? faulting : exec(admin));
        return {
          async claim(ref) { await ready; return inner.claim(map(ref)); },
          async recordCompleted(ref) { await ready; return inner.recordCompleted(map(ref)); },
        };
      },
      resume: async (ref, deps: ResumeDeps): Promise<ResumeResult> => {
        const o = await deps.claimant.claim(ref);
        if (!claimAcquired(o)) return { kind: 'refused', outcome: o };
        if (await deps.establishBoundary() !== 'may_cross') {
          return { kind: 'refused', outcome: { kind: 'unavailable', reason: 'boundary' } };
        }
        await deps.loadBody();
        await deps.confirmCrossing();
        return { kind: 'crossed' };
      },
    };
    const results = await runClaimObligations(candidate);
    expect(results).toHaveLength(10);
    expect(failedObligations(results)).toEqual([]);
  });

  /* ── ⭐⭐ D1 · TWO INDEPENDENT CONNECTIONS RACE ──────────────────────────── */

  it('D1 · exactly one of many independent connections is CLAIMED', async () => {
    const ref = pad(`race-${Date.now()}`);
    await seed(ref);

    const clients = await Promise.all(
      Array.from({ length: 8 }, async () => { const c = new Client({ connectionString: URL }); await c.connect(); return c; }));
    try {
      const outcomes = await Promise.all(
        clients.map((c) => createPendingAskClaimant(exec(c)).claim(ref)));
      const winners = outcomes.filter(claimAcquired);
      const consumed = outcomes.filter((o) => o.kind === 'already_consumed');
      expect(winners).toHaveLength(1);
      expect(consumed).toHaveLength(7);
      /* ⛔ No loser may be told a database fact instead of the truth. */
      expect(outcomes.filter((o) => o.kind === 'unavailable')).toHaveLength(0);
    } finally {
      await Promise.all(clients.map((c) => c.end()));
    }
  });

  /* ── ⭐ D2 · DURABLE TRUTH, NOT PROCESS MEMORY ──────────────────────────── */

  it('D2 · a later connection observes the consumption', async () => {
    const ref = pad(`durable-${Date.now()}`);
    await seed(ref);

    const first = new Client({ connectionString: URL });
    await first.connect();
    const won = await createPendingAskClaimant(exec(first)).claim(ref);
    await first.end();
    expect(claimAcquired(won)).toBe(true);

    const later = new Client({ connectionString: URL });
    await later.connect();
    const seen = await createPendingAskClaimant(exec(later)).claim(ref);
    await later.end();
    expect(seen.kind).toBe('already_consumed');
    if (seen.kind === 'already_consumed') expect(seen.completion).toBe('incomplete');
  });

  /* ── ⭐⭐ D3 · CONCURRENCY MECHANICS DO NOT LEAK AS FALSE SEMANTICS ──────── */

  it('D3 · a losing race under REPEATABLE READ yields a truthful outcome, never a throw', async () => {
    const ref = pad(`iso-${Date.now()}`);
    await seed(ref);

    const a = new Client({ connectionString: URL });
    const b = new Client({ connectionString: URL });
    await a.connect(); await b.connect();
    try {
      await a.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      await b.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      const first = await createPendingAskClaimant(exec(a)).claim(ref);
      expect(claimAcquired(first)).toBe(true);

      const second = createPendingAskClaimant(exec(b)).claim(ref);
      await a.query('COMMIT');
      const outcome: ClaimOutcome = await second;

      /* ⭐ Whatever PostgreSQL raised, the member-facing answer is one of the
         contract's semantics — and it is NEVER a claim, and NEVER a lie that
         someone else consumed it when the substrate could not say so. */
      expect(['already_consumed', 'unavailable']).toContain(outcome.kind);
      expect(claimAcquired(outcome)).toBe(false);
    } finally {
      await b.query('ROLLBACK').catch(() => undefined);
      await a.end(); await b.end();
    }
  });

  /* ── ⭐ THE PROHIBITED DURABLE FIELDS ARE ABSENT ────────────────────────── */

  it('the table stores identity and lifecycle, never permission', async () => {
    const r = await admin.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'pending_ask_claims' ORDER BY column_name`);
    const columns = r.rows.map((x) => x.column_name);
    expect(columns).toEqual([
      'completed_at', 'consumed_at', 'created_at', 'expires_at', 'manuscript_id',
      'member_id', 'observation_key', 'reading_id', 'ref', 'thread_id',
    ]);
    for (const forbidden of ['section_id', 'section_ref', 'authorized', 'scope_kind',
      'disclosure_id', 'may_cross', 'consent', 'permission', 'body', 'text', 'prose']) {
      expect(columns).not.toContain(forbidden);
    }
  });

  it('a consumed claim can never be returned to pending', async () => {
    const ref = pad(`forward-${Date.now()}`);
    await seed(ref);
    await createPendingAskClaimant(exec(admin)).claim(ref);
    await expect(
      admin.query(`UPDATE pending_ask_claims SET consumed_at = NULL WHERE ref = $1`, [ref]),
    ).rejects.toThrow(/already consumed/i);
  });
});
