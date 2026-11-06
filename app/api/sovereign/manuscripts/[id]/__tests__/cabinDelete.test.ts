/**
 * WS-DELETE-01 — DELETE /api/sovereign/manuscripts/:id?workId=, CABIN branch (MAIA_CABIN_MODE=offline).
 *
 * The cabin must answer the same observable contract as the web path, from one cabin-store transaction:
 *
 *   malformed workId                          → 400, nothing touched
 *   the named Work no longer declares it      → 409 { refusal: 'work_no_longer_holds_it' }
 *   more than one Work declares it            → 409 { refusal: 'declared_in_other_works', works: n }
 *   otherwise                                 → the writing goes, the named Work's declaration ends, the Work
 *                                               goes only if it then declares nothing → 200 { removed, workRemoved }
 *
 * Hermetic: a real CabinLocalStore on a temp SQLite file, with only the cabin request helpers replaced (the real
 * ones are `server-only` and read the environment). The route closes the store it is handed, so `cabinStore` opens
 * a fresh connection per request and the test inspects through its own, as production would see it. The web path's
 * modules are replaced with spies that must NEVER be called: the cabin branch does not reach Postgres.
 *
 * Every refusal is asserted by SNAPSHOT EQUALITY (writings, sections, Works, declarations before and after), not by
 * status code alone, because "nothing was deleted" is the substance of a refusal.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

import { DELETE } from '../route';
import { CabinLocalStore, type CabinMember } from '@/lib/cabin/localStore';
import { cabinMemberFromRequest, cabinStore, setCabinSessionCookie } from '@/lib/cabin/request';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';

jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(),
  cabinMemberFromRequest: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/eraseManuscript', () => ({ eraseManuscript: jest.fn() }));

const openStore = cabinStore as jest.Mock;
const memberFromRequest = cabinMemberFromRequest as jest.Mock;
const setCookie = setCabinSessionCookie as jest.Mock;

let dir: string;
let dbPath: string;
let seed: CabinLocalStore;
let member: CabinMember;

/** A well-formed id that names nothing. */
const NOBODY = '99999999-9999-4999-8999-999999999999';

beforeEach(() => {
  process.env.MAIA_CABIN_MODE = 'offline';
  process.env.MAIA_CABIN_DATA_PATH = '/unused/the-store-is-injected';
  dir = mkdtempSync(join(tmpdir(), 'cabin-delete-'));
  dbPath = join(dir, 'cabin.sqlite');
  seed = new CabinLocalStore(dbPath);
  member = seed.ensureLocalMember();

  jest.clearAllMocks();
  openStore.mockImplementation(() => new CabinLocalStore(dbPath));
  memberFromRequest.mockImplementation(() => ({ member, issuedToken: null }));
});

afterEach(() => {
  /* The cabin branch must never reach the web path, whatever the outcome. */
  expect(query).not.toHaveBeenCalled();
  expect(transaction).not.toHaveBeenCalled();
  expect(getMemberIdFromRequest).not.toHaveBeenCalled();
  expect(eraseManuscript).not.toHaveBeenCalled();
  seed.close();
  rmSync(dir, { recursive: true, force: true });
});

afterAll(() => {
  delete process.env.MAIA_CABIN_MODE;
  delete process.env.MAIA_CABIN_DATA_PATH;
});

// ── fixtures ────────────────────────────────────────────────────────────────────────────────────

function writing(title: string, ownerId = member.id): string {
  const made = seed.createManuscript(ownerId, { title, provenance: 'member_written' });
  seed.addManuscriptSections(ownerId, made.id, [
    { position: 1, heading: 'One', body: 'Fictional first section.' },
    { position: 2, heading: 'Two', body: 'Fictional second section.' },
  ]);
  return made.id;
}

function work(title: string, declares: string[] = []): string {
  const made = seed.createWork(member.id, { title });
  for (const manuscriptId of declares) {
    seed.declareExpression(member.id, { workId: made.id, expressionType: 'manuscript', expressionId: manuscriptId });
  }
  return made.id;
}

/** Everything a refusal must leave exactly as it was. */
function snapshot() {
  const raw = (sql: string) => seed.db.prepare(sql).all() as Array<Record<string, unknown>>;
  return {
    manuscripts: raw('SELECT id, member_id, title FROM member_manuscripts ORDER BY id'),
    sections: raw('SELECT id, manuscript_id, position, body FROM manuscript_sections ORDER BY id'),
    works: raw('SELECT id, member_id, title FROM living_works ORDER BY id'),
    declarations: raw('SELECT living_work_id, expression_type, expression_id FROM living_work_expressions ORDER BY living_work_id, expression_id'),
  };
}

function hasWriting(id: string): boolean {
  return seed.getManuscript(member.id, id) !== null;
}
function hasWork(id: string): boolean {
  return seed.getWork(member.id, id) !== null;
}
function declarationsOf(workId: string): string[] {
  return (seed.getWork(member.id, workId)?.expressions ?? []).map((e) => e.expressionId);
}
/** No declaration anywhere may name a writing that is not there: the detached state. */
function detachedDeclarations(): string[] {
  return (
    seed.db
      .prepare("SELECT e.expression_id AS id FROM living_work_expressions e WHERE e.expression_type = 'manuscript' AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)")
      .all() as Array<Record<string, unknown>>
  ).map((row) => String(row.id));
}

async function erase(manuscriptId: string, search = '') {
  const res = await DELETE(
    new NextRequest(`http://localhost/api/sovereign/manuscripts/${manuscriptId}${search}`, { method: 'DELETE' }),
    { params: Promise.resolve({ id: manuscriptId }) },
  );
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

// ── the contract ────────────────────────────────────────────────────────────────────────────────

describe('cabin DELETE · the writing is the Work\'s only expression', () => {
  it('removes the writing, its sections, the declaration AND the Work, and says so', async () => {
    const w = writing('Fictional memoir');
    const wk = work('Fictional memoir work', [w]);

    const { status, body } = await erase(w, `?workId=${wk}`);

    expect(status).toBe(200);
    expect(body).toEqual({ removed: true, workRemoved: true });
    expect(hasWriting(w)).toBe(false);
    expect(snapshot().sections).toEqual([]); // sections cascade with the writing
    expect(hasWork(wk)).toBe(false);
    expect(snapshot().declarations).toEqual([]);
    expect(detachedDeclarations()).toEqual([]);
  });
});

describe('cabin DELETE · the Work declares other things too', () => {
  it('ends only the dead expression; the Work survives still naming what remains', async () => {
    const dead = writing('Fictional draft to delete');
    const kept = writing('Fictional draft to keep');
    const wk = work('Fictional two-part work', [dead, kept]);

    const { status, body } = await erase(dead, `?workId=${wk}`);

    expect(status).toBe(200);
    expect(body).toEqual({ removed: true, workRemoved: false });
    expect(hasWriting(dead)).toBe(false);
    expect(hasWriting(kept)).toBe(true);
    expect(hasWork(wk)).toBe(true);
    expect(declarationsOf(wk)).toEqual([kept]);
    expect(detachedDeclarations()).toEqual([]);
    // the surviving writing keeps its own sections; only the dead one's went
    expect(snapshot().sections.map((s) => s.manuscript_id)).toEqual([kept, kept]);
  });
});

describe('cabin DELETE · a writing no Work declares', () => {
  it('is simply deleted, and workRemoved is an explicit false (not absent)', async () => {
    const w = writing('Fictional loose writing');
    const unrelated = work('Fictional unrelated work', []);

    const { status, body } = await erase(w);

    expect(status).toBe(200);
    expect(body).toEqual({ removed: true, workRemoved: false });
    expect(hasWriting(w)).toBe(false);
    expect(hasWork(unrelated)).toBe(true); // a Work that never named it is not touched
  });
});

describe('cabin DELETE · workId omitted', () => {
  it('still ends the ONE declaration that names the writing, so no Work is left naming a gone writing', async () => {
    const w = writing('Fictional memoir');
    const wk = work('Fictional memoir work', [w]);

    const { status, body } = await erase(w);

    expect(status).toBe(200);
    expect(body).toEqual({ removed: true, workRemoved: true });
    expect(hasWork(wk)).toBe(false);
    expect(detachedDeclarations()).toEqual([]);
  });

  it('with several declaring Works there is no card to follow: shared refusal, nothing changed', async () => {
    const w = writing('Fictional shared writing');
    work('Fictional A', [w]);
    work('Fictional B', [w]);
    const before = snapshot();

    const { status, body } = await erase(w);

    expect(status).toBe(409);
    expect(body).toEqual({ refusal: 'declared_in_other_works', works: 2 });
    expect(snapshot()).toEqual(before);
  });
});

// ── refusals change nothing ─────────────────────────────────────────────────────────────────────

describe('cabin DELETE · stale card → 409 work_no_longer_holds_it', () => {
  it('the named Work exists but no longer declares this writing', async () => {
    const w = writing('Fictional writing');
    const other = writing('Fictional other writing');
    const holder = work('Fictional holder', [w]);
    const moved = work('Fictional moved-on work', [other]); // the card says this one; it does not hold `w`
    const before = snapshot();

    const { status, body } = await erase(w, `?workId=${moved}`);

    expect(status).toBe(409);
    expect(body).toEqual({ refusal: 'work_no_longer_holds_it' });
    expect(snapshot()).toEqual(before);
    expect(hasWork(holder)).toBe(true);
  });

  it('the named Work does not exist at all (a well-formed id that names nothing)', async () => {
    const w = writing('Fictional writing');
    work('Fictional holder', [w]);
    const before = snapshot();

    const { status, body } = await erase(w, `?workId=${NOBODY}`);

    expect(status).toBe(409);
    expect(body).toEqual({ refusal: 'work_no_longer_holds_it' });
    expect(snapshot()).toEqual(before);
  });

  it('is decided before sharing: a card that holds nothing is stale even when OTHER Works share the writing', async () => {
    const w = writing('Fictional shared writing');
    work('Fictional A', [w]);
    work('Fictional B', [w]);
    const before = snapshot();

    const { status, body } = await erase(w, `?workId=${NOBODY}`);

    expect(status).toBe(409);
    expect(body).toEqual({ refusal: 'work_no_longer_holds_it' });
    expect(snapshot()).toEqual(before);
  });
});

describe('cabin DELETE · shared writing → 409 declared_in_other_works', () => {
  it('refuses with the number of Works, even when the card names one of them, and destroys nothing', async () => {
    const w = writing('Fictional shared writing');
    const a = work('Fictional A', [w]);
    work('Fictional B', [w]);
    work('Fictional C', [w]);
    const before = snapshot();

    const { status, body } = await erase(w, `?workId=${a}`);

    expect(status).toBe(409);
    expect(body).toEqual({ refusal: 'declared_in_other_works', works: 3 });
    expect(snapshot()).toEqual(before);
    expect(declarationsOf(a)).toEqual([w]);
  });
});

describe('cabin DELETE · malformed workId → 400, before the store is even opened', () => {
  const cases: Array<[string, string]> = [
    ['not an identifier', '?workId=not-a-uuid'],
    ['empty', '?workId='],
    ['an injection attempt', `?workId=${encodeURIComponent("x' OR '1'='1")}`],
    ['a UUID with trailing junk', `?workId=${NOBODY}x`],
    ['repeated', `?workId=${NOBODY}&workId=${NOBODY}`],
  ];

  it.each(cases)('%s', async (_label, search) => {
    const w = writing('Fictional writing');
    work('Fictional holder', [w]);
    const before = snapshot();

    const { status } = await erase(w, search);

    expect(status).toBe(400);
    expect(openStore).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
    expect(snapshot()).toEqual(before);
  });
});

describe('cabin DELETE · not found', () => {
  it('an unknown writing is 404 (the client reads absence as the outcome it sought)', async () => {
    const w = writing('Fictional writing');
    const wk = work('Fictional holder', [w]);
    const before = snapshot();

    expect((await erase(NOBODY)).status).toBe(404);
    expect((await erase(NOBODY, `?workId=${wk}`)).status).toBe(404);
    expect(snapshot()).toEqual(before);
  });

  it('another member\'s writing is 404 and untouched, never confirming that it exists', async () => {
    const stranger = '33333333-3333-4333-8333-333333333333';
    seed.db
      .prepare("INSERT INTO members (id, username, created_at, updated_at) VALUES (?, 'someone-else', datetime('now'), datetime('now'))")
      .run(stranger);
    const theirs = writing('Fictional stranger writing', stranger);
    const before = snapshot();

    const { status } = await erase(theirs);

    expect(status).toBe(404);
    expect(snapshot()).toEqual(before);
  });
});

// ── one transaction ─────────────────────────────────────────────────────────────────────────────

describe('cabin DELETE · one transaction', () => {
  it('a failure in the LAST step undoes the first: the writing is not gone while its Work still names it', async () => {
    const w = writing('Fictional memoir');
    const wk = work('Fictional memoir work', [w]);
    const before = snapshot();
    // The writing is deleted first and the Work last. Make the Work's deletion fail.
    seed.db.exec("CREATE TRIGGER fictional_fault BEFORE DELETE ON living_works BEGIN SELECT RAISE(ABORT, 'fictional fault'); END");

    await expect(erase(w, `?workId=${wk}`)).rejects.toThrow(/fictional fault/);

    expect(snapshot()).toEqual(before); // writing, sections, Work and declaration all still there
    expect(detachedDeclarations()).toEqual([]);
  });

  it('the connection is left usable after a failed erase (ROLLBACK ran), and the retry then succeeds', () => {
    const w = writing('Fictional memoir');
    const wk = work('Fictional memoir work', [w]);
    seed.db.exec("CREATE TRIGGER fictional_fault BEFORE DELETE ON living_works BEGIN SELECT RAISE(ABORT, 'fictional fault'); END");

    // The SAME connection throughout: a transaction left open would make the retry's BEGIN fail.
    expect(() => seed.eraseManuscript(member.id, w, wk)).toThrow(/fictional fault/);
    seed.db.exec('DROP TRIGGER fictional_fault');

    expect(seed.eraseManuscript(member.id, w, wk)).toEqual({ ok: true, workRemoved: true });
    expect(hasWriting(w)).toBe(false);
    expect(hasWork(wk)).toBe(false);
  });
});

// ── session cookie ──────────────────────────────────────────────────────────────────────────────

describe('cabin DELETE · session cookie', () => {
  it('a newly issued session is handed back on success and on a refusal alike', async () => {
    memberFromRequest.mockImplementation(() => ({ member, issuedToken: 'fictional-token' }));
    const w = writing('Fictional writing');
    work('Fictional A', [w]);
    work('Fictional B', [w]);

    expect((await erase(w)).status).toBe(409);
    expect(setCookie).toHaveBeenLastCalledWith(expect.anything(), 'fictional-token');

    setCookie.mockClear();
    const solo = writing('Fictional solo writing');
    expect((await erase(solo)).status).toBe(200);
    expect(setCookie).toHaveBeenLastCalledWith(expect.anything(), 'fictional-token');
  });
});
