/**
 * WS-DELETE-01 — declaring a writing into a Work vs. erasing that writing:
 * deterministic interleaving probe, against real PostgreSQL 16.
 *
 * THE LAW (founder ruling): no *detached* Work. After any interleaving of
 * "declare this writing into a Work" and "delete this writing", no
 * `living_work_expressions` row may name a manuscript that no longer exists.
 * The table has no foreign key to `member_manuscripts` by ratified design, so
 * only the two transactions can keep the law.
 *
 * ── How an interleaving is made without a sleep ──────────────────────────
 * A second connection (the "holder") takes a lock so that exactly one
 * statement of one actor must wait. The test then polls `pg_stat_activity`
 * until that statement is observed waiting on a lock, starts the other actor,
 * and again polls until the other actor has either finished or is itself
 * observed waiting. Only then does the holder release. The poll tick is the
 * cadence of the observation, not a wait-for-correctness: every step is gated
 * on a state the database reports.
 *
 *   A  declare parked at its INSERT  → erase starts
 *   B  erase parked inside `claims`  → declare starts
 *
 * ── Why wrong implementations are in the same file ───────────────────────
 * A probe that has only ever run against the conforming implementation proves
 * nothing about whether it can see the defect. Two wrong declare
 * implementations are run through the same schedules and MUST produce the
 * detached state:
 *
 *   original       the route as it was: check, then insert, nothing held between
 *   rowLocksOnly   one transaction with FOR SHARE on the Work and manuscript
 *                  rows, and no serialisation with the erase. This is the shape
 *                  that closes the original race and still leaves the mirror
 *                  open: the erase's DELETE merely waits for the share lock and
 *                  then runs on a `claims` read taken before the declaration
 *                  committed.
 *
 * The suite is skipped unless WS_DELETE_DECLARATION_RACE=fictional-only, and
 * refuses to run against a database whose name does not contain "fictional".
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { Client } from 'pg';

jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })),
  r20LedgerErrorCode: jest.fn(() => 'fictional_r20_error'),
}));

import { closePool, query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { declareManuscriptExpression } from '@/lib/livingWork/declareManuscriptExpression';
import { eraseManuscript, type EraseOutcome } from '@/lib/manuscript/source/eraseManuscript';
import { holdManuscriptDeclarationShared } from '@/lib/manuscript/source/manuscriptDeclarationLock';

const enabled = process.env.WS_DELETE_DECLARATION_RACE === 'fictional-only';
const suite = enabled ? describe : describe.skip;

jest.setTimeout(90_000);

/* ── fixtures ─────────────────────────────────────────────────────────── */

interface Ids {
  readonly member: string;
  readonly manuscript: string;
  readonly workA: string;
  readonly workB: string;
}
type DeclareArgs = { livingWorkId: string; manuscriptId: string; memberId: string };
type DeclareImpl = (args: DeclareArgs) => Promise<string>;

let admin: Client;
const holders: Client[] = [];
const observations: Record<string, unknown> = {};

async function connect(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

async function seed(declaredIn: Array<'A' | 'B'> = []): Promise<Ids> {
  const ids: Ids = {
    member: randomUUID(),
    manuscript: randomUUID(),
    workA: randomUUID(),
    workB: randomUUID(),
  };
  await admin.query(`INSERT INTO members (id) VALUES ($1)`, [ids.member]);
  await admin.query(
    `INSERT INTO member_manuscripts (id, member_id, title) VALUES ($1, $2, 'Fictional writing')`,
    [ids.manuscript, ids.member],
  );
  for (const [id, title] of [[ids.workA, 'Work A'], [ids.workB, 'Work B']] as const) {
    await admin.query(`INSERT INTO living_works (id, member_id, title) VALUES ($1, $2, $3)`, [id, ids.member, title]);
  }
  for (const w of declaredIn) {
    await admin.query(
      `INSERT INTO living_work_expressions (living_work_id, expression_type, expression_id, declared_by)
       VALUES ($1, 'manuscript', $2, $3)`,
      [w === 'A' ? ids.workA : ids.workB, ids.manuscript, ids.member],
    );
  }
  return ids;
}

/** Declarations that name a manuscript which no longer exists — the forbidden state. */
async function dangling(manuscriptId: string): Promise<number> {
  const r = await admin.query(
    `SELECT 1 FROM living_work_expressions e
      WHERE e.expression_type = 'manuscript' AND e.expression_id = $1
        AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`,
    [manuscriptId],
  );
  return r.rows.length;
}

async function manuscriptExists(id: string): Promise<boolean> {
  return (await admin.query(`SELECT 1 FROM member_manuscripts WHERE id = $1`, [id])).rows.length === 1;
}
async function declarationsOf(manuscriptId: string): Promise<number> {
  return (await admin.query(
    `SELECT 1 FROM living_work_expressions WHERE expression_type = 'manuscript' AND expression_id = $1`,
    [manuscriptId],
  )).rows.length;
}

/* ── the observation primitives (no sleeps) ───────────────────────────── */

interface Waiting { pid: number; wait_event: string; query: string }

/** Every other backend that is, right now, blocked on a lock. */
async function waiting(): Promise<Waiting[]> {
  const r = await admin.query<Waiting>(
    `SELECT pid, wait_event, query FROM pg_stat_activity
      WHERE datname = current_database() AND pid <> pg_backend_pid()
        AND state = 'active' AND wait_event_type = 'Lock'`,
  );
  return r.rows;
}

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 10));

async function until<T>(label: string, probe: () => Promise<T | null | false>, ms = 20_000): Promise<T> {
  const deadline = Date.now() + ms;
  for (;;) {
    const value = await probe();
    if (value) return value;
    if (Date.now() > deadline) {
      throw new Error(`timed out waiting for: ${label}\nblocked backends: ${JSON.stringify(await waiting())}`);
    }
    await tick();
  }
}

interface Tracked<T> { settled: boolean; value?: T; error?: unknown; done: Promise<void> }
function track<T>(promise: Promise<T>): Tracked<T> {
  const t: Tracked<T> = { settled: false, done: Promise.resolve() };
  t.done = promise.then(
    (value) => { t.value = value; t.settled = true; },
    (error) => { t.error = error; t.settled = true; },
  );
  return t;
}

/** First of: the actor finished, or the actor is observed waiting on a lock whose statement matches. */
async function settledOrParked(t: Tracked<unknown>, statement: RegExp, label: string): Promise<'settled' | string> {
  return until(label, async () => {
    if (t.settled) return 'settled' as const;
    const hit = (await waiting()).find((w) => statement.test(w.query));
    return hit ? classify(hit) : null;
  });
}

function classify(w: Waiting): string {
  if (w.wait_event === 'advisory') return 'advisory-lock';
  if (/^\s*DELETE FROM member_manuscripts/.test(w.query)) return 'delete-manuscript-row';
  if (/ws-delete:lock-works-first/.test(w.query)) return 'works-first-row-locks';
  if (/FOR UPDATE OF e\b/.test(w.query)) return 'claims-row-locks';
  if (/^\s*INSERT INTO living_work_expressions/.test(w.query)) return 'insert-declaration';
  return `other:${w.query.slice(0, 40)}`;
}

async function holder(): Promise<Client> {
  const client = await connect();
  holders.push(client);
  await client.query('BEGIN');
  return client;
}
async function release(client: Client): Promise<void> {
  await client.query('ROLLBACK');
}

async function bothSettle(d: Tracked<unknown>, e: Tracked<unknown>): Promise<void> {
  await until('declare and erase both settle after release', async () => (d.settled && e.settled) || null);
}

/* ── declare implementations: the real one and two that must be seen to fail ── */

const real: DeclareImpl = async (args) => (await declareManuscriptExpression(args)).kind;

const INSERT_SQL = `INSERT INTO living_work_expressions
       (living_work_id, expression_type, expression_id, declared_by)
     VALUES ($1, 'manuscript', $2, $3)
     ON CONFLICT (living_work_id, expression_type, expression_id) DO NOTHING
     RETURNING id`;

/** The route as it was: existence check, then insert, nothing held between. */
const original: DeclareImpl = async ({ livingWorkId, manuscriptId, memberId }) => {
  const m = await query(`SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`, [manuscriptId, memberId]);
  if (m.rows.length === 0) return 'not_found';
  const ins = await query(INSERT_SQL, [livingWorkId, manuscriptId, memberId]);
  return ins.rows.length === 0 ? 'already_declared' : 'declared';
};

/** One transaction, FOR SHARE on both rows, and NO serialisation with the erase. */
const rowLocksOnly: DeclareImpl = async ({ livingWorkId, manuscriptId, memberId }) =>
  transaction(async (tx) => {
    const w = await tx.query(`SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR SHARE`, [livingWorkId, memberId]);
    if (w.rows.length === 0) return 'not_found';
    const m = await tx.query(`SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR SHARE`, [manuscriptId, memberId]);
    if (m.rows.length === 0) return 'not_found';
    const ins = await tx.query(INSERT_SQL, [livingWorkId, manuscriptId, memberId]);
    return ins.rows.length === 0 ? 'already_declared' : 'declared';
  });

/* ── schedules ────────────────────────────────────────────────────────── */

/** What a completed erase answers on the current base: custody confirmed, nothing owed, and whether the Work went with it. */
const erased = (workRemoved: boolean) => ({
  ok: true, artifactsQueued: 0, sweptAll: true, recoverySealed: true,
  owed: { originalFile: false, image: false }, workRemoved,
});

interface Run {
  readonly ids: Ids;
  readonly declare: string | { threw: string };
  readonly erase: EraseOutcome | { threw: string };
  readonly erasePhase: string;
  readonly declarePhase: string;
}

const describeError = (e: unknown) => ({ threw: e instanceof Error ? `${(e as { code?: string }).code ?? ''} ${e.message}`.trim() : String(e) });

/**
 * A — the declaration is parked at its INSERT (after every check it makes), then
 * the erase starts.
 *
 * The holder inserts the SAME (work, manuscript) row uncommitted. The declaration's
 * ON CONFLICT insert must wait for that transaction to end, so it stops at its
 * INSERT whatever it did before — which makes this the same park point for every
 * implementation. Releasing by ROLLBACK lets the declaration's own insert through.
 *
 * `prior` declares the writing into Work A first, so the declaration into Work B
 * makes it shared; the erase must then refuse rather than erase it.
 */
async function scheduleA(impl: DeclareImpl, prior: boolean): Promise<Run> {
  const ids = await seed(prior ? ['A'] : []);
  const target = prior ? ids.workB : ids.workA;
  const h = await holder();
  await h.query(
    `INSERT INTO living_work_expressions (living_work_id, expression_type, expression_id, declared_by)
     VALUES ($1, 'manuscript', $2, $3)`,
    [target, ids.manuscript, ids.member],
  );

  const d = track(impl({ livingWorkId: target, manuscriptId: ids.manuscript, memberId: ids.member }));
  const declarePhase = await settledOrParked(d, /^\s*INSERT INTO living_work_expressions/, 'declaration parked at its INSERT');
  expect(declarePhase).toBe('insert-declaration');

  const e = track(eraseManuscript(ids.manuscript, ids.member));
  const erasePhase = await settledOrParked(
    e, /^(?!\s*INSERT INTO living_work_expressions)/, 'erase either finishes or is observed waiting',
  );

  await release(h);
  await bothSettle(d, e);
  return {
    ids,
    declare: d.error ? describeError(d.error) : (d.value as string),
    erase: e.error ? describeError(e.error) : (e.value as EraseOutcome),
    erasePhase,
    declarePhase,
  };
}

/**
 * B — the erase is parked INSIDE its `claims` read (it has already decided who
 * declares the writing, and has not yet deleted it), then a declaration starts.
 *
 * The holder row-locks the existing declaration, which `claims` must also lock.
 */
async function scheduleB(impl: DeclareImpl): Promise<Run> {
  const ids = await seed(['A']);
  const h = await holder();
  await h.query(
    `SELECT id FROM living_work_expressions WHERE living_work_id = $1 AND expression_id = $2 FOR UPDATE`,
    [ids.workA, ids.manuscript],
  );

  const e = track(eraseManuscript(ids.manuscript, ids.member));
  const erasePhase = await settledOrParked(e, /FOR UPDATE OF e\b/, 'erase parked inside its claims read');
  expect(erasePhase).toBe('claims-row-locks');

  const d = track(impl({ livingWorkId: ids.workB, manuscriptId: ids.manuscript, memberId: ids.member }));
  // The erase is still parked on its claims statement, so "any waiter" would be attributed to the wrong actor.
  // Exclude it explicitly: only a waiter that is NOT the erase's claims read can be the declaration.
  const declarePhase = await settledOrParked(
    d, /^(?![\s\S]*FOR UPDATE OF e\b)/, 'declaration either finishes or is observed waiting',
  );

  await release(h);
  await bothSettle(d, e);
  return {
    ids,
    declare: d.error ? describeError(d.error) : (d.value as string),
    erase: e.error ? describeError(e.error) : (e.value as EraseOutcome),
    erasePhase,
    declarePhase,
  };
}

/* ── the suite ────────────────────────────────────────────────────────── */

suite('WS-DELETE-01 · declaring a writing vs. erasing it (real PostgreSQL 16)', () => {
  beforeAll(async () => {
    admin = await connect();
    const db = (await admin.query(`SELECT current_database() AS d`)).rows[0].d as string;
    if (!db.includes('fictional')) throw new Error(`REFUSED: '${db}' is not a fictional database`);
  });

  // A failing test must not leak a held lock into the next one: an erase parked on a leaked lock is already holding the
  // global R20 recovery key, so every later erase in the file would queue behind it and one failure would read as ten.
  afterEach(async () => {
    while (holders.length > 0) {
      const h = holders.pop() as Client;
      try { await h.query('ROLLBACK'); } catch { /* already ended */ }
      await h.end().catch(() => undefined);
    }
  });

  afterAll(async () => {
    for (const h of holders) { try { await h.query('ROLLBACK'); } catch { /* already ended */ } await h.end().catch(() => undefined); }
    await admin.end();
    await closePool();
    if (process.env.WS_DELETE_OBSERVATIONS_OUT) {
      writeFileSync(process.env.WS_DELETE_OBSERVATIONS_OUT, JSON.stringify(observations, null, 2));
    }
  });

  describe('the real implementation keeps the law under every forced interleaving', () => {
    it('A1 · declaration is mid-flight when the Delete arrives → the Delete waits, then erases the Work too', async () => {
      const r = await scheduleA(real, false);
      expect(r.erasePhase).toBe('advisory-lock');
      expect(r.declare).toBe('declared');
      expect(r.erase).toEqual(erased(true));
      // Serialised AFTER the declaration: the Work existed only to name this writing, so it goes with it.
      expect(await dangling(r.ids.manuscript)).toBe(0);
      expect(await manuscriptExists(r.ids.manuscript)).toBe(false);
      expect(await declarationsOf(r.ids.manuscript)).toBe(0);
    });

    it('A2 · the in-flight declaration makes the writing shared → the Delete REFUSES (the refusal is not bypassed)', async () => {
      const r = await scheduleA(real, true);
      expect(r.erasePhase).toBe('advisory-lock');
      expect(r.declare).toBe('declared');
      expect(r.erase).toEqual({ ok: false, refusal: 'declared_in_other_works', works: 2 });
      expect(await manuscriptExists(r.ids.manuscript)).toBe(true);
      expect(await declarationsOf(r.ids.manuscript)).toBe(2);
      expect(await dangling(r.ids.manuscript)).toBe(0);
    });

    it('B · the Delete is mid-flight (claims read, not yet deleted) when a declaration arrives → the declaration waits, then is told Not found', async () => {
      const r = await scheduleB(real);
      expect(r.declarePhase).toBe('advisory-lock');
      expect(r.erase).toEqual(erased(true));
      expect(r.declare).toBe('not_found');
      expect(await dangling(r.ids.manuscript)).toBe(0);
      expect(await declarationsOf(r.ids.manuscript)).toBe(0);
    });

    it('id spelling cannot defeat the serialisation · the writing named in UPPER CASE by the declaration still waits for the Delete', async () => {
      // The route passes the client's expressionId verbatim; the erase gets the route param. If the lock key were
      // derived from the raw text, 'AAAA…' and 'aaaa…' would be two keys and the two transactions would never meet.
      const upper: DeclareImpl = (a) => real({ ...a, manuscriptId: a.manuscriptId.toUpperCase() });
      const r = await scheduleA(upper, false);
      expect(r.erasePhase).toBe('advisory-lock');
      expect(r.declare).toBe('declared');
      expect(r.erase).toEqual(erased(true));
      expect(await dangling(r.ids.manuscript)).toBe(0);
    });

    it('a foreign member contends with nothing: another member\'s declaration naming this writing does not delay the owner\'s Delete', async () => {
      const ids = await seed(['A']);
      const stranger = randomUUID();
      await admin.query(`INSERT INTO members (id) VALUES ($1)`, [stranger]);
      // The stranger's declaration holds ITS key (stranger, manuscript) for the whole transaction. The key is taken
      // through the REAL helper, not rebuilt here: a hand-built key can never collide with a mutated one, which would
      // make this test pass for any key derivation at all.
      const h = await holder();
      await holdManuscriptDeclarationShared(h as unknown as TransactionClient, stranger, ids.manuscript);
      const e = track(eraseManuscript(ids.manuscript, ids.member));
      // Would be observed waiting on the stranger's lock if the key ignored the member.
      await until('the owner\'s Delete settles while the stranger holds its own key', async () => e.settled || null, 10_000);
      await release(h);
      expect(e.error).toBeUndefined();
      expect(e.value).toEqual(erased(true));
    });

    it('lock order · threadOrigin\'s whole walk (Work → manuscript → expression, all FOR SHARE) does not deadlock with the Delete', async () => {
      // threadOrigin: living_works → member_manuscripts → living_work_expressions, each FOR SHARE. Two cycles are ruled out here:
      //  - an erase that locked the MANUSCRIPT row first (the advisory lock adds no row-lock edge, so it cannot);
      //  - an erase that locked the EXPRESSION row before the Work row (the pre-existing cycle upstream closed by taking the Work
      //    rows first), which this walk would still hit if my advisory lock had reordered anything.
      const ids = await seed(['A']);
      const walker = await holder();
      await walker.query(`SET LOCAL lock_timeout = '5s'`);
      await walker.query(`SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR SHARE`, [ids.workA, ids.member]);

      const e = track(eraseManuscript(ids.manuscript, ids.member));
      expect(await settledOrParked(e, /ws-delete:lock-works-first/, 'erase parked behind the walker on the Work row')).toBe('works-first-row-locks');

      // The walker's next two steps must NOT wait: the erase holds nothing but advisory locks while it waits for the Work row.
      await walker.query(`SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR SHARE`, [ids.manuscript, ids.member]);
      await walker.query(
        `SELECT id FROM living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript' AND expression_id = $2 FOR SHARE`,
        [ids.workA, ids.manuscript],
      );
      await walker.query('COMMIT');

      await until('erase settles', async () => e.settled || null);
      expect(e.error).toBeUndefined();
      expect(e.value).toEqual(erased(true));
      expect(await dangling(ids.manuscript)).toBe(0);
    });

    it('supplementary (not the evidence of record) · 30 rounds of concurrent declarations racing a Delete: no deadlock, no error, never a detached Work', async () => {
      for (let round = 0; round < 30; round += 1) {
        const ids = await seed([round % 2 === 0 ? 'A' : 'B']);
        const settled = await Promise.allSettled([
          declareManuscriptExpression({ livingWorkId: ids.workA, manuscriptId: ids.manuscript, memberId: ids.member }),
          declareManuscriptExpression({ livingWorkId: ids.workB, manuscriptId: ids.manuscript, memberId: ids.member }),
          eraseManuscript(ids.manuscript, ids.member),
          declareManuscriptExpression({ livingWorkId: ids.workA, manuscriptId: ids.manuscript, memberId: ids.member }),
        ]);
        const failures = settled.filter((s) => s.status === 'rejected').map((s) => String((s as PromiseRejectedResult).reason));
        expect(failures).toEqual([]);
        expect(await dangling(ids.manuscript)).toBe(0);
      }
    });
  });

  describe('lethality · wrong implementations must be seen to produce the detached state', () => {
    // Each of these is expected to LEAVE a declaration naming an erased writing. If one ever comes back
    // clean, the schedule has stopped being able to see the defect and the green results above prove nothing.
    const candidates: Array<[string, DeclareImpl]> = [
      ['original (check, then insert — nothing held)', original],
      ['rowLocksOnly (FOR SHARE on both rows, no serialisation with the Delete)', rowLocksOnly],
    ];

    describe.each(candidates)('%s', (_name, impl) => {
      it('A1 · Delete commits between the check and the insert → a Work names an erased writing', async () => {
        const r = await scheduleA(impl, false);
        observations[`candidate:${_name}:A1`] = { erasePhase: r.erasePhase, declare: r.declare, erase: r.erase };
        expect(await dangling(r.ids.manuscript)).toBeGreaterThanOrEqual(1);
      });

      it('A2 · the Delete erases a writing a declaration has just made shared → detached AND the refusal is bypassed', async () => {
        const r = await scheduleA(impl, true);
        observations[`candidate:${_name}:A2`] = { erasePhase: r.erasePhase, declare: r.declare, erase: r.erase };
        expect(await dangling(r.ids.manuscript)).toBeGreaterThanOrEqual(1);
      });

      it('B · a declaration lands while the Delete holds a stale read of who declares → detached', async () => {
        const r = await scheduleB(impl);
        observations[`candidate:${_name}:B`] = { erasePhase: r.erasePhase, declarePhase: r.declarePhase, declare: r.declare, erase: r.erase };
        expect(await dangling(r.ids.manuscript)).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('observation (recorded, not a requirement)', () => {
    it('what a Delete does with a declaration that already names an erased writing: from nowhere, and from the Work\'s own card', async () => {
      const ids = await seed();
      const gone = randomUUID();
      for (const work of [ids.workA, ids.workB]) {
        await admin.query(
          `INSERT INTO living_work_expressions (living_work_id, expression_type, expression_id, declared_by)
           VALUES ($1, 'manuscript', $2, $3)`,
          [work, gone, ids.member],
        );
      }
      const fromNowhere = await eraseManuscript(gone, ids.member);
      const afterNowhere = { declarations: await declarationsOf(gone) };
      const fromCard = await eraseManuscript(gone, ids.member, { viaWorkId: ids.workA });
      observations['redelete-of-an-already-detached-declaration'] = {
        fromNowhere, afterNowhere,
        fromTheNamedWorksCard: fromCard,
        afterCard: {
          declarations: await declarationsOf(gone),
          namedWorkStillPresent: (await admin.query(`SELECT 1 FROM living_works WHERE id = $1`, [ids.workA])).rows.length === 1,
          otherWorkStillPresent: (await admin.query(`SELECT 1 FROM living_works WHERE id = $1`, [ids.workB])).rows.length === 1,
        },
      };
      // Recorded only. No assertion on the outcome: this documents present behaviour so that a claim about it can be checked.
      expect(fromCard).toBeDefined();
    });
  });
});
