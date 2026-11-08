/**
 * DELETE /api/sovereign/living-works/:id, CABIN branch (MAIA_CABIN_MODE=offline) — withdrawal.
 *
 * Withdrawal removes the DECLARATION and nothing it declared. Unlike manuscript Delete it has no gap to close in the
 * cabin: `living_work_expressions.living_work_id` cascades with the Work (foreign keys are ON), nothing in the cabin
 * references a Work from a writing, and the cabin has no Work-visual table, so there are no bytes owed. This pins
 * that, so the cabin's two removal acts stay distinct in the way the web path's are: Remove keeps the writing,
 * Delete (manuscripts/:id) does not.
 *
 * Same harness as manuscripts/[id]/__tests__/cabinDelete.test.ts: a real CabinLocalStore on a temp SQLite file,
 * cabin request helpers replaced, web-path modules replaced with spies that must never be called.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

import { DELETE } from '../route';
import { CabinLocalStore, type CabinMember } from '@/lib/cabin/localStore';
import { cabinMemberFromRequest, cabinStore } from '@/lib/cabin/request';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';

jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(),
  cabinMemberFromRequest: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/eraseManuscript', () => ({ sweepVaultErasureQueue: jest.fn() }));

const openStore = cabinStore as jest.Mock;
const memberFromRequest = cabinMemberFromRequest as jest.Mock;

let dir: string;
let dbPath: string;
let seed: CabinLocalStore;
let member: CabinMember;

beforeEach(() => {
  process.env.MAIA_CABIN_MODE = 'offline';
  dir = mkdtempSync(join(tmpdir(), 'cabin-withdraw-'));
  dbPath = join(dir, 'cabin.sqlite');
  seed = new CabinLocalStore(dbPath);
  member = seed.ensureLocalMember();

  jest.clearAllMocks();
  openStore.mockImplementation(() => new CabinLocalStore(dbPath));
  memberFromRequest.mockImplementation(() => ({ member, issuedToken: null }));
});

afterEach(() => {
  expect(query).not.toHaveBeenCalled();
  expect(transaction).not.toHaveBeenCalled();
  expect(getMemberIdFromRequest).not.toHaveBeenCalled();
  expect(sweepVaultErasureQueue).not.toHaveBeenCalled();
  seed.close();
  rmSync(dir, { recursive: true, force: true });
});

afterAll(() => {
  delete process.env.MAIA_CABIN_MODE;
});

async function withdraw(workId: string) {
  const res = await DELETE(
    new NextRequest(`http://localhost/api/sovereign/living-works/${workId}`, { method: 'DELETE' }),
    { params: Promise.resolve({ id: workId }) },
  );
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe('cabin withdrawal', () => {
  it('answers { withdrawn }, removes the Work and its declarations, and leaves every writing and section alone', async () => {
    const first = seed.createManuscript(member.id, { title: 'Fictional first' });
    const second = seed.createManuscript(member.id, { title: 'Fictional second' });
    seed.addManuscriptSections(member.id, first.id, [{ position: 1, heading: 'One', body: 'Fictional body.' }]);
    const work = seed.createWork(member.id, { title: 'Fictional work' });
    for (const m of [first, second]) {
      seed.declareExpression(member.id, { workId: work.id, expressionType: 'manuscript', expressionId: m.id });
    }

    const { status, body } = await withdraw(work.id);

    expect(status).toBe(200);
    expect(body).toEqual({ withdrawn: work.id });
    expect(seed.getWork(member.id, work.id)).toBeNull();
    expect(seed.db.prepare('SELECT count(*) AS n FROM living_work_expressions').get()).toEqual({ n: 0 }); // cascaded
    expect(seed.getManuscript(member.id, first.id)).not.toBeNull();
    expect(seed.getManuscript(member.id, second.id)).not.toBeNull();
    expect(seed.listManuscriptSections(member.id, first.id)).toHaveLength(1);
  });

  it('withdrawing one of two Works that share a writing leaves the other Work\'s declaration intact', async () => {
    const shared = seed.createManuscript(member.id, { title: 'Fictional shared' });
    const gone = seed.createWork(member.id, { title: 'Fictional A' });
    const stays = seed.createWork(member.id, { title: 'Fictional B' });
    for (const w of [gone, stays]) {
      seed.declareExpression(member.id, { workId: w.id, expressionType: 'manuscript', expressionId: shared.id });
    }

    expect((await withdraw(gone.id)).status).toBe(200);

    expect(seed.getWork(member.id, stays.id)?.expressions.map((e) => e.expressionId)).toEqual([shared.id]);
  });

  it('an unknown Work is 404 and changes nothing', async () => {
    const work = seed.createWork(member.id, { title: 'Fictional work' });

    const { status } = await withdraw('99999999-9999-4999-8999-999999999999');

    expect(status).toBe(404);
    expect(seed.getWork(member.id, work.id)).not.toBeNull();
  });
});
