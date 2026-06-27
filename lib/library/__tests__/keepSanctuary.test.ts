/**
 * Acceptance — Sanctuary guard on the Personal Wisdom Library "keep" write path.
 *
 * PWL Slice 1 safety pair, item #1. Acceptance criterion: a keep performed during a
 * Sanctuary session must create ZERO rows — the route refuses BEFORE any DB write.
 * Constitutional anchor: CLAUDE.md → Sanctuary Mode §1, §6; architecture §9.6.
 *
 * (The jest toolchain is not installed in this environment, so this file is the CI
 *  artifact; the runnable proof of the pure guard lives in
 *  scripts/repro/sanctuary_guard_proof.mts.)
 */
import { shouldPersistKeep } from '@/lib/sanctuary/sanctuaryGuards';

// LibraryService writes are spied so "0 rows" == createSource never called.
const createSource = jest.fn(async () => 'src-1');
const addChunks = jest.fn(async () => undefined);
const updateSourceStatus = jest.fn(async () => undefined);
const generateChunkEmbeddings = jest.fn(async () => 1);

// Identity is server-derived — the guard must not depend on anything client-sent.
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: jest.fn(async () => ({ memberId: 'member-aaaa' })),
}));
jest.mock('@/lib/library/LibraryService', () => ({
  LibraryService: jest.fn().mockImplementation(() => ({
    createSource,
    addChunks,
    updateSourceStatus,
    generateChunkEmbeddings,
  })),
}));

import { POST } from '@/app/api/library/keep/route';

const req = (body: unknown) => ({ json: async () => body }) as any;

beforeEach(() => {
  createSource.mockClear();
  addChunks.mockClear();
  updateSourceStatus.mockClear();
  generateChunkEmbeddings.mockClear();
});

describe('PWL keep — Sanctuary guard (0 rows)', () => {
  it('pure guard: Sanctuary ⇒ do not persist; continuity ⇒ persist', () => {
    expect(shouldPersistKeep(true)).toBe(false);
    expect(shouldPersistKeep(false)).toBe(true);
  });

  it('keep during Sanctuary creates 0 rows (refused before any write)', async () => {
    const res = await POST(req({ content: 'something said in confidence', sanctuary: true }));
    expect(res.status).toBe(403);
    expect(createSource).not.toHaveBeenCalled();
    expect(addChunks).not.toHaveBeenCalled();
    expect(generateChunkEmbeddings).not.toHaveBeenCalled();
  });

  it('keep outside Sanctuary proceeds to write', async () => {
    const res = await POST(req({ content: 'a kept insight', sanctuary: false }));
    expect(res.status).toBe(201);
    expect(createSource).toHaveBeenCalledTimes(1);
  });

  it('an omitted sanctuary flag defaults to writing (continuity)', async () => {
    const res = await POST(req({ content: 'another kept insight' }));
    expect(res.status).toBe(201);
    expect(createSource).toHaveBeenCalledTimes(1);
  });
});
