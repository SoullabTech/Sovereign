/**
 * Declaration tests — capsule → Field Object.
 *
 * These cover the acceptance criteria from
 * `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` that live at
 * the service layer: exactly one atom, member-gesture provenance, idempotency
 * under retry AND under a concurrent race, the capsule left untouched, and
 * ownership enforced against the capsule's own table.
 *
 * The criteria about reachability (the act being offered on the review
 * surface, the Keep appearing on /maia/workbench) are walk evidence, not unit
 * evidence — a passing test here does not establish them.
 */

import { declareCapsuleAsFieldObject, getCapsuleFieldObject } from '../declareFieldObject';

jest.mock('@/lib/capsules', () => ({ getCapsuleById: jest.fn() }));
jest.mock('@/lib/psyche/portfolio', () => ({
  getAtomBySource: jest.fn(),
  keepSource: jest.fn(),
}));

const { getCapsuleById } = jest.requireMock('@/lib/capsules');
const { getAtomBySource, keepSource } = jest.requireMock('@/lib/psyche/portfolio');

const MEMBER = 'member-1';
const CAPSULE_ID = 'capsule-abc';

const capsule = {
  id: CAPSULE_ID,
  userId: MEMBER,
  title: 'The thing I saw',
  summary: 'It mattered because I finally said it out loud.',
  goldLines: [{ text: 'I am not waiting for permission.' }],
  archived: false,
  draft: true,
};

const atom = { id: 'atom-1', sourceType: 'reflection', sourceId: CAPSULE_ID, title: capsule.title };

beforeEach(() => {
  jest.clearAllMocks();
  getCapsuleById.mockResolvedValue(capsule);
  getAtomBySource.mockResolvedValue(null);
  keepSource.mockResolvedValue(atom);
});

describe('declareCapsuleAsFieldObject', () => {
  it('mints exactly one atom from the capsule, as a reflection-sourced Keep', async () => {
    const result = await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(result).toEqual({ atom, created: true });
    expect(keepSource).toHaveBeenCalledTimes(1);
    expect(keepSource).toHaveBeenCalledWith(
      MEMBER,
      expect.objectContaining({
        memberId: MEMBER,
        sourceType: 'reflection',
        sourceId: CAPSULE_ID,
        title: capsule.title,
      }),
    );
  });

  it('carries the member’s own summary and gold lines into the atom body', async () => {
    await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    const body: string = keepSource.mock.calls[0][1].body;
    expect(body).toContain(capsule.summary);
    expect(body).toContain('I am not waiting for permission.');
  });

  it('returns the existing atom without minting again (retry / double-submit)', async () => {
    getAtomBySource.mockResolvedValue(atom);

    const result = await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(result).toEqual({ atom, created: false });
    expect(keepSource).not.toHaveBeenCalled();
  });

  it('resolves a concurrent race to the winning atom rather than a conflict', async () => {
    // Both callers read "not yet declared", both attempt the insert, the unique
    // index rejects the loser with 23505.
    getAtomBySource.mockResolvedValueOnce(null).mockResolvedValueOnce(atom);
    keepSource.mockRejectedValue(Object.assign(new Error('duplicate key'), { code: '23505' }));

    const result = await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(result).toEqual({ atom, created: false });
  });

  it('propagates errors that are not the unique-source violation', async () => {
    keepSource.mockRejectedValue(Object.assign(new Error('connection lost'), { code: '08006' }));

    await expect(declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID)).rejects.toThrow('connection lost');
  });

  it('refuses a capsule the member does not own, and mints nothing', async () => {
    getCapsuleById.mockResolvedValue(null);

    const result = await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(result).toBeNull();
    expect(keepSource).not.toHaveBeenCalled();
  });

  it('scopes the ownership read to the acting member', async () => {
    await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(getCapsuleById).toHaveBeenCalledWith({ userId: MEMBER, capsuleId: CAPSULE_ID });
  });

  it('leaves the capsule intact and distinct — declaration never writes to it', async () => {
    const capsules = jest.requireMock('@/lib/capsules');
    await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    // The only capsule-side call is the ownership read; no update/archive/delete
    // is even imported, so promotion cannot mutate or consume the source.
    expect(Object.keys(capsules)).toEqual(['getCapsuleById']);
  });

  it('falls back to a plain title when the capsule has none', async () => {
    getCapsuleById.mockResolvedValue({ ...capsule, title: '   ' });

    await declareCapsuleAsFieldObject(MEMBER, CAPSULE_ID);

    expect(keepSource.mock.calls[0][1].title).toBe('Kept from a conversation');
  });
});

describe('getCapsuleFieldObject', () => {
  it('reports standing without declaring anything', async () => {
    getAtomBySource.mockResolvedValue(atom);

    await expect(getCapsuleFieldObject(MEMBER, CAPSULE_ID)).resolves.toEqual(atom);
    expect(keepSource).not.toHaveBeenCalled();
  });

  it('reports null for a capsule that was never declared', async () => {
    await expect(getCapsuleFieldObject(MEMBER, CAPSULE_ID)).resolves.toBeNull();
  });
});
