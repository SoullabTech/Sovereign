/**
 * Start writing — the creation gesture, its duplicate guard, and its refusals.
 *
 * ── Why this suite exists (C1, 2026-08-02) ─────────────────────────────────
 *
 * The race this route guards was OBSERVED, not hypothesised: two POSTs fired in
 * parallel created two manuscripts, verified before the fix. A defect that was
 * found and repaired but left uncovered can return silently, so this pins it
 * the way #869 pinned its own W-2 race — deterministically, with the negative
 * assertion included.
 *
 * ── How the fake database makes the race REAL rather than assumed ──────────
 *
 * A mock that simply returns rows would pass whether or not the route takes the
 * advisory lock, which would make this suite decorative. So the fake models the
 * two things the guard actually depends on:
 *
 *   1. `pg_advisory_xact_lock(key)` is a genuine mutex, held for the lifetime
 *      of the transaction and released when it settles — as Postgres does.
 *
 *   2. The untouched-blank SELECT yields to the event loop before answering.
 *      This is what gives a second concurrent transaction the chance to run its
 *      own SELECT first.
 *
 * ── Mutation matrix (actually run, not asserted) ───────────────────────────
 *
 * Each mutation was applied to the route, the suite run, and the route
 * restored. Baseline is 12/12 green.
 *
 *   MUT1  remove `pg_advisory_xact_lock` call        → 3 fail
 *   MUT2  disable the reuse branch                   → 3 fail
 *   MUT3  drop `AND d.revision_count = 1`            → 1 fail
 *   MUT4  drop `AND m.title IS NULL`                 → 1 fail
 *   MUT5  drop `AND m.provenance = 'member_written'` → 1 fail
 *
 * TWO OF THOSE FAILED TO FAIL AT FIRST, and both blind spots are worth knowing
 * because they are the ordinary way a suite like this ends up decorative:
 *
 *   1. Yielding only at the SELECT was not enough. Everything after it resolved
 *      on the microtask queue, which drains fully before another macrotask
 *      runs, so the first transaction finished inside its own turn and the
 *      second never got a window. MUT1 stayed GREEN. Fixed by yielding on every
 *      statement, as a real client does.
 *
 *   2. The fake originally hardcoded the four reuse conditions in JavaScript —
 *      a restatement of the logic under test. Deleting a condition from the
 *      route's SQL therefore changed nothing, and MUT3/4/5 stayed GREEN. Fixed
 *      by reading each condition out of the statement text and applying it only
 *      if the route actually asked for it.
 *
 * A fake that reimplements what it is testing proves only that the copy agrees
 * with itself.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  computeSourceHash: jest.fn(() => 'hash-of-no-sections'),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { transaction } from '@/lib/db/postgres';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockTransaction = transaction as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const OTHER_MEMBER = '99999999-9999-9999-9999-999999999999';

function postRequest(): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/blank', { method: 'POST' });
}

/** One turn of the event loop. FIFO, so ordering between waiters is stable. */
const tick = () => new Promise((r) => setImmediate(r));

/** A fair mutex: acquire() resolves to its own release function. */
function makeMutex() {
  let tail: Promise<void> = Promise.resolve();
  return async function acquire(): Promise<() => void> {
    let release!: () => void;
    const mine = new Promise<void>((r) => { release = r; });
    const previous = tail;
    tail = tail.then(() => mine);
    await previous;
    return release;
  };
}

interface Manuscript { id: string; member_id: string; title: string | null; provenance: string }
interface Draft { id: string; manuscript_id: string; member_id: string; content: string; revision_count: number }

/** In-memory stand-in for the tables this route touches. */
function makeFakeDb() {
  const manuscripts: Manuscript[] = [];
  const drafts: Draft[] = [];
  const revisions: Array<{ draft_id: string; content: string; note: string }> = [];
  const statements: string[] = [];
  const locks = new Map<string, ReturnType<typeof makeMutex>>();
  let seq = 0;
  const nextId = (p: string) => `${p}-${++seq}`;

  const runTransaction = async (callback: (client: { query: Function }) => Promise<unknown>) => {
    let releaseLock: (() => void) | null = null;

    const client = {
      query: async (sql: string, params: unknown[] = []) => {
        const s = sql.replace(/\s+/g, ' ').trim();
        statements.push(s);

        if (s.includes('pg_advisory_xact_lock')) {
          const key = String(params[0]);
          if (!locks.has(key)) locks.set(key, makeMutex());
          releaseLock = await locks.get(key)!();
          return { rows: [] };
        }

        /**
         * EVERY statement costs a round-trip. This is the line that makes the
         * suite mutation-sensitive, and it was arrived at by being wrong first:
         * an earlier version yielded only at the SELECT, and deleting the
         * advisory lock still left the concurrency tests GREEN. The reason is
         * that everything following the SELECT — the INSERTs — resolves on the
         * microtask queue, which drains completely before another macrotask
         * runs. So the first transaction ran to completion inside its own turn
         * and the second never had a window to race into.
         *
         * Yielding on every statement models what a real client does (each
         * query is I/O) and gives the second transaction that window. Without
         * it this file would assert the guard's presence while being blind to
         * its removal.
         */
        await tick();

        if (s.startsWith('SELECT m.id, d.id AS draft_id')) {
          /**
           * The reuse predicate is READ OUT OF THE STATEMENT, not reimplemented
           * here. An earlier version hardcoded the four conditions in JS, which
           * meant deleting one from the route's SQL changed nothing the fake
           * did — the suite was blind to exactly the mutation it claimed to
           * catch (`AND d.revision_count = 1` removed, all ten tests green).
           *
           * A fake that restates the logic under test cannot test it. So each
           * condition is applied only if the route actually asked for it.
           */
          const memberId = String(params[0]);
          const asks = {
            member: s.includes('m.member_id = $1'),
            written: s.includes("m.provenance = 'member_written'"),
            unnamed: s.includes('m.title IS NULL'),
            empty: s.includes("d.content = ''"),
            firstRevision: s.includes('d.revision_count = 1'),
          };
          const row = manuscripts
            .filter((m) => (!asks.member || m.member_id === memberId))
            .filter((m) => (!asks.written || m.provenance === 'member_written'))
            .filter((m) => (!asks.unnamed || m.title === null))
            .map((m) => ({ m, d: drafts.find((d) => d.manuscript_id === m.id) }))
            .filter(({ d }) => d !== undefined)
            .filter(({ d }) => (!asks.empty || d!.content === ''))
            .find(({ d }) => (!asks.firstRevision || d!.revision_count === 1));
          return row ? { rows: [{ id: row.m.id, draft_id: row.d!.id }] } : { rows: [] };
        }

        /* The route writes title, provenance, content and note as SQL
           LITERALS, not bind parameters — that is the point of them (a blank
           page's emptiness is not something a caller supplies). So the fake
           reads them out of the statement text, which also means a route that
           stopped writing NULL, or started naming the page, would surface here
           rather than being quietly accepted from a parameter slot. */
        if (s.startsWith('INSERT INTO member_manuscripts')) {
          const id = nextId('ms');
          const literals = /VALUES \(\$1, (NULL|'[^']*'), '([^']*)'\)/.exec(s);
          if (!literals) throw new Error(`fake db: unrecognised manuscript INSERT: ${s}`);
          manuscripts.push({
            id,
            member_id: String(params[0]),
            title: literals[1] === 'NULL' ? null : literals[1].slice(1, -1),
            provenance: literals[2],
          });
          return { rows: [{ id }] };
        }

        if (s.startsWith('INSERT INTO manuscript_working_drafts')) {
          const id = nextId('draft');
          const content = /VALUES \(\$1, \$2, '([^']*)'/.exec(s);
          if (!content) throw new Error(`fake db: unrecognised draft INSERT: ${s}`);
          drafts.push({
            id,
            manuscript_id: String(params[0]),
            member_id: String(params[1]),
            content: content[1],
            revision_count: 1,
          });
          return { rows: [{ id }] };
        }

        if (s.startsWith('INSERT INTO working_draft_revisions')) {
          const note = /, '([^']*)'\)$/.exec(s);
          revisions.push({ draft_id: String(params[0]), content: '', note: note ? note[1] : '' });
          return { rows: [] };
        }

        throw new Error(`fake db: unexpected statement: ${s.slice(0, 90)}`);
      },
    };

    try {
      return await callback(client);
    } finally {
      // Transaction-scoped: the lock outlives the statements, not the transaction.
      releaseLock?.();
    }
  };

  return { manuscripts, drafts, revisions, statements, runTransaction };
}

let db: ReturnType<typeof makeFakeDb>;

beforeEach(() => {
  jest.clearAllMocks();
  db = makeFakeDb();
  mockTransaction.mockImplementation((cb: never) => db.runTransaction(cb));
  mockAuth.mockResolvedValue(MEMBER);
});

describe('POST /api/sovereign/manuscripts/blank — auth', () => {
  it('401 without a verified member, and creates nothing', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(postRequest());
    expect(res.status).toBe(401);
    expect(db.manuscripts).toHaveLength(0);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});

describe('POST /api/sovereign/manuscripts/blank — duplicate guard', () => {
  it('two parallel requests create exactly one manuscript and one draft', async () => {
    const [a, b] = await Promise.all([POST(postRequest()), POST(postRequest())]);
    const [bodyA, bodyB] = await Promise.all([a.json(), b.json()]);

    expect(db.manuscripts).toHaveLength(1);
    expect(db.drafts).toHaveLength(1);

    // Same page handed to both callers.
    expect(bodyA.id).toBe(bodyB.id);

    // One created, one reused — a caller retrying after a timeout can tell
    // which happened. This is the assertion that fails if the lock is removed:
    // unguarded, both requests create and both answer 201.
    expect([a.status, b.status].sort()).toEqual([200, 201]);
    expect(new Set([a.status, b.status]).size).toBe(2);
  });

  it('three concurrent requests still create exactly one', async () => {
    const results = await Promise.all([POST(postRequest()), POST(postRequest()), POST(postRequest())]);
    const bodies = await Promise.all(results.map((r) => r.json()));

    expect(db.manuscripts).toHaveLength(1);
    expect(new Set(bodies.map((b) => b.id)).size).toBe(1);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 200)).toHaveLength(2);
  });

  it('a sequential retry returns the same untouched blank page', async () => {
    const first = await POST(postRequest());
    const firstBody = await first.json();
    expect(first.status).toBe(201);

    const retry = await POST(postRequest());
    const retryBody = await retry.json();

    expect(retry.status).toBe(200);
    expect(retryBody.id).toBe(firstBody.id);
    expect(db.manuscripts).toHaveLength(1);
  });

  it('does not hand one member the blank page of another', async () => {
    await POST(postRequest());
    mockAuth.mockResolvedValue(OTHER_MEMBER);
    const res = await POST(postRequest());

    expect(res.status).toBe(201);
    expect(db.manuscripts).toHaveLength(2);
    expect(db.manuscripts.map((m) => m.member_id).sort()).toEqual([MEMBER, OTHER_MEMBER].sort());
  });
});

describe('POST /api/sovereign/manuscripts/blank — once writing has begun', () => {
  it('a new Start writing creates a NEW blank page rather than reusing a written one', async () => {
    const first = await POST(postRequest());
    const firstBody = await first.json();

    // The member writes a sentence. The page is no longer blank.
    db.drafts[0].content = 'The salt road began at the harbour.';
    db.drafts[0].revision_count = 2;

    const second = await POST(postRequest());
    const secondBody = await second.json();

    expect(second.status).toBe(201);
    expect(secondBody.id).not.toBe(firstBody.id);
    expect(db.manuscripts).toHaveLength(2);
  });

  it('never hands back a manuscript the member has named', async () => {
    // A named expression with an empty draft satisfies every OTHER condition of
    // the reuse predicate. Only `title IS NULL` keeps Start writing from
    // reopening the member's actual book and calling it a blank page.
    db.manuscripts.push({ id: 'ms-named', member_id: MEMBER, title: 'The Salt Road', provenance: 'member_written' });
    db.drafts.push({ id: 'draft-named', manuscript_id: 'ms-named', member_id: MEMBER, content: '', revision_count: 1 });

    const res = await POST(postRequest());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).not.toBe('ms-named');
    expect(db.manuscripts).toHaveLength(2);
  });

  it('never hands back an imported manuscript as a blank page', async () => {
    // Same shape, but brought in rather than begun here. Reusing it would hand
    // the writer their own import and call it an empty page.
    db.manuscripts.push({ id: 'ms-imported', member_id: MEMBER, title: null, provenance: 'member_uploaded' });
    db.drafts.push({ id: 'draft-imported', manuscript_id: 'ms-imported', member_id: MEMBER, content: '', revision_count: 1 });

    const res = await POST(postRequest());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).not.toBe('ms-imported');
    expect(db.manuscripts).toHaveLength(2);
  });

  it('a page emptied back out is still not offered as a fresh blank', async () => {
    await POST(postRequest());
    // Content deleted back to '' — but it HAS been written in, and the
    // revision count is the record of that. Reuse would silently hand the
    // member a page carrying someone's revision history.
    db.drafts[0].content = '';
    db.drafts[0].revision_count = 3;

    const res = await POST(postRequest());
    expect(res.status).toBe(201);
    expect(db.manuscripts).toHaveLength(2);
  });
});

describe('POST /api/sovereign/manuscripts/blank — what it refuses to invent', () => {
  it('stores no title, member_written provenance, and an empty first revision', async () => {
    const res = await POST(postRequest());
    const body = await res.json();

    expect(db.manuscripts[0].title).toBeNull();
    expect(db.manuscripts[0].provenance).toBe('member_written');
    expect(body.title).toBeNull();

    expect(db.drafts[0].content).toBe('');
    expect(db.revisions).toHaveLength(1);
    expect(db.revisions[0].note).toBe('Started writing');
  });

  it('writes no Source, no sections, and no Living Work attachment', async () => {
    await POST(postRequest());

    const wrote = (table: string) =>
      db.statements.some((s) => s.toLowerCase().includes(table));

    // A blank page was not brought in from anywhere: no Source rows.
    expect(wrote('manuscript_sections')).toBe(false);
    // Beginning to write is not declaring that this belongs to a work.
    expect(wrote('living_work_expressions')).toBe(false);

    expect(db.statements.some((s) => s.startsWith('INSERT INTO member_manuscripts'))).toBe(true);
  });

  it('takes the member-keyed advisory lock before looking for a blank page', async () => {
    await POST(postRequest());

    const lockAt = db.statements.findIndex((s) => s.includes('pg_advisory_xact_lock'));
    const selectAt = db.statements.findIndex((s) => s.startsWith('SELECT m.id, d.id AS draft_id'));

    expect(lockAt).toBeGreaterThanOrEqual(0);
    expect(selectAt).toBeGreaterThan(lockAt);
  });
});
