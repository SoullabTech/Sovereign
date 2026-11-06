/**
 * What the client says is TRUE of what it knows (the second full review of Work-card Delete, 2026-11-05).
 *
 * The page-level act (runDeleteWork / runRemoveWork) tells the member things about Home. It may only say "Home now shows what is
 * current" if the re-read worked; it may only say "nothing was deleted" about a refusal that happened before any act; and a
 * follow-through after "the writing is already gone" may only withdraw what the member confirmed.
 */
import {
  reReadAll,
  DeletionNotice,
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  deleteWork,
  deletionRefusalCopy,
  removeWork,
  runDeleteWork,
  runRemoveWork,
} from '@/lib/writersStudio/deleteWork';

const fake = (status: number, body: unknown = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;
// Real UUIDs: the route rejects anything else with 400, so the client tests use the shape the route accepts.
const WORK = 'a0000000-0000-4000-8000-00000000000a';
const MS = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('"Home now shows what is current" is said only when the re-read worked', () => {
  const unknown = async () => fake(500);
  it.each([
    ['resolves true', async () => true, true],
    ['resolves with nothing (legacy callers)', async () => undefined, true],
    ['resolves false (a list could not be read)', async () => false, false],
    ['rejects', async () => { throw new Error('offline'); }, false],
  ] as const)('an unknown outcome when the re-read %s', async (_name, refresh, fresh) => {
    const err = await runDeleteWork({ workId: WORK, manuscriptId: MS }, unknown, refresh).catch((e: Error) => e);
    expect((err as Error).message).toContain('We could not confirm whether that work was deleted.');
    if (fresh) {
      expect((err as Error).message).toContain('Home now shows what is current');
    } else {
      expect((err as Error).message).not.toContain('Home now shows what is current');
      expect((err as Error).message).toContain('reload this page');
    }
  });

  it('a stale-card refusal says the same, and the base sentence alone makes no claim about Home', async () => {
    expect(deletionRefusalCopy('work_no_longer_holds_it')).not.toContain('Home now shows');
    const stale = async () => fake(409, { refusal: 'work_no_longer_holds_it' });
    const ok = await runDeleteWork({ workId: WORK, manuscriptId: MS }, stale, async () => true).catch((e: Error) => e);
    const failed = await runDeleteWork({ workId: WORK, manuscriptId: MS }, stale, async () => false).catch((e: Error) => e);
    expect((ok as Error).message).toContain('Home now shows what is current.');
    expect((failed as Error).message).not.toContain('Home now shows what is current');
    expect((failed as Error).message).toContain('Nothing was deleted');
  });

  it('the same for a removal whose outcome is unknown', async () => {
    const ok = await runRemoveWork(WORK, async () => fake(500), async () => true).catch((e: Error) => e);
    const failed = await runRemoveWork(WORK, async () => fake(500), async () => false).catch((e: Error) => e);
    expect((ok as Error).message).toContain('Home now shows what is current');
    expect((failed as Error).message).not.toContain('Home now shows what is current');
  });

  it('a successful act does not depend on the re-read: the server said it is gone, and the result says whether the page is current', async () => {
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(200), async () => false)).resolves.toEqual({ refreshed: false });
    await expect(runRemoveWork(WORK, async () => fake(200), async () => { throw new Error('offline'); })).resolves.toEqual({ refreshed: false });
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(200), async () => true)).resolves.toEqual({ refreshed: true });
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(200), async () => undefined)).resolves.toEqual({ refreshed: true });
  });
});

describe('the page re-read (reReadAll) is "worked" only when EVERY list was read', () => {
  it('all lists read: true', async () => {
    expect(await reReadAll([async () => true, async () => true])).toBe(true);
  });
  it('one list could not be read (false): false, and the other is still read', async () => {
    const other = jest.fn(async () => true);
    expect(await reReadAll([async () => false, other])).toBe(false);
    expect(other).toHaveBeenCalledTimes(1);
  });
  it('one list throws: false, never a rejection that would hide a committed delete', async () => {
    await expect(reReadAll([async () => { throw new Error('offline'); }, async () => true])).resolves.toBe(false);
  });
  it('a loader that resolves with anything but true does not count as read', async () => {
    expect(await reReadAll([async () => undefined as unknown as boolean])).toBe(false);
  });
  it('no lists: nothing failed', async () => {
    expect(await reReadAll([])).toBe(true);
  });
});

describe('refusal codes the client does not know', () => {
  it('a committed removal with an unknown code is still a committed, unconfirmed removal (never "nothing was removed")', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, { removed: true, refusal: 'something_new' }));
    expect(out).toMatchObject({ ok: false, removed: true, refusal: 'something_new' });
    expect((out as { message: string }).message).toContain('we are not going to tell you it is gone');
    expect((out as { message: string }).message).not.toContain('Nothing was removed');
  });
  it('a committed removal with NO code is the same', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, { removed: true }));
    expect(out).toMatchObject({ ok: false, removed: true });
  });
  it('a 5xx carrying a code the client does not know is UNKNOWN, not a refusal before any act', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(503, { refusal: 'something_new' }));
    expect(out).toMatchObject({ ok: false, unknown: true });
    expect((out as { refusal?: string }).refusal).toBeUndefined();
  });
  it('a 4xx carrying a code the client does not know is a plain rejection', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(422, { refusal: 'something_new' }));
    expect((out as { unknown?: boolean }).unknown).toBeUndefined();
    expect((out as { message: string }).message).toContain('Nothing was removed');
  });
  it('the Work route\'s own owed-image answer is a committed, unconfirmed removal, with words about the IMAGE', async () => {
    const out = await removeWork(WORK, async () => fake(500, { removed: true, refusal: 'image_bytes_owed' }));
    expect(out).toMatchObject({ ok: false, removed: true, refusal: 'image_bytes_owed' });
    expect((out as { message: string }).message).toContain('its image');
    expect((out as { message: string }).message).toContain('we are not going to tell you it is gone');
    expect((out as { message: string }).message).not.toContain('original file');
  });
  it('through runRemoveWork that is an unconfirmed removal after a re-read', async () => {
    const trace: string[] = [];
    const err = await runRemoveWork(WORK, async () => fake(500, { removed: true, refusal: 'image_bytes_owed' }), async () => { trace.push('refresh'); }).catch((e: Error) => e);
    expect(err).toBeInstanceOf(DeletionUnconfirmed);
    expect(trace).toEqual(['refresh']);
  });
  it('the same code through a no-writing Work\'s Delete (which goes to the Work route)', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: null }, async () => fake(500, { removed: true, refusal: 'image_bytes_owed' }));
    expect(out).toMatchObject({ ok: false, removed: true });
  });
});

describe('the retry after "the writing is already gone" is finished by the server, not guessed by the client', () => {
  const calls: string[] = [];
  const record = (status: number, body: unknown = {}) => async (url: string, init: RequestInit) => { calls.push(`${init.method} ${url}`); return fake(status, body); };
  beforeEach(() => { calls.length = 0; });

  it('a 404 from a Work card is done, in ONE request: no second request exists to remove a Work the member did not confirm', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, record(404));
    expect(out).toEqual({ ok: true });
    expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS}?workId=${WORK}`]);
  });

  it('through runDeleteWork it re-reads and resolves', async () => {
    const trace: string[] = [];
    await runDeleteWork({ workId: WORK, manuscriptId: MS }, record(404), async () => { trace.push('refresh'); });
    expect(trace).toEqual(['refresh']);
    expect(calls).toHaveLength(1);
  });
});

describe('the outcomes the page must be told about ON THE PAGE are a DeletionNotice, thrown after the re-read', () => {
  const order: string[] = [];
  const refresh = async () => { order.push('refresh'); };
  beforeEach(() => { order.length = 0; });

  it('a stale card', async () => {
    const err = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(409, { refusal: 'work_no_longer_holds_it' }), refresh).catch((e: Error) => { order.push('thrown'); return e; });
    expect(err).toBeInstanceOf(DeletionNotice);
    expect(order).toEqual(['refresh', 'thrown']);
  });
  it('an outcome we could not learn (Delete and Remove)', async () => {
    const del = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500), refresh).catch((e: Error) => e);
    const rem = await runRemoveWork(WORK, async () => fake(500), refresh).catch((e: Error) => e);
    expect(del).toBeInstanceOf(DeletionNotice);
    expect(rem).toBeInstanceOf(DeletionNotice);
  });
  it('a plain rejection (400, 401) is NOT a page notice: nothing happened, nothing was re-read, and the card keeps its dialog', async () => {
    for (const status of [400, 401]) {
      order.length = 0;
      const err = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(status), refresh).catch((e: Error) => e);
      expect(err).not.toBeInstanceOf(DeletionNotice);
      expect(order).toEqual([]);
    }
  });
  it('a shared-writing refusal and a committed-but-unconfirmed removal keep their own classes', async () => {
    const shared = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(409, { refusal: 'declared_in_other_works' }), refresh).catch((e: Error) => e);
    const owed = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, { removed: true, refusal: 'custody_incomplete' }), refresh).catch((e: Error) => e);
    expect(shared).toBeInstanceOf(DeletionSharedMaterial);
    expect(owed).toBeInstanceOf(DeletionUnconfirmed);
    expect(owed).not.toBeInstanceOf(DeletionNotice);
  });
});

describe('the custody sentence names exactly what the server says is unconfirmed, with its own verb, about the right subject', () => {
  const owed = async (body: unknown, target: { workId: string | null; manuscriptId: string }) =>
    (await deleteWork(target, async () => fake(500, body)) as { message: string; removed?: boolean; unconfirmed?: unknown });

  it('only the original file', async () => {
    const out = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: true, image: false, deletionRecord: false }, workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(out.message).toContain('could not confirm that its original file has been destroyed.');
    expect(out.message).not.toMatch(/two things|record of the deletion|image/);
  });
  it('only the independent record of the deletion: it is SEALED, never "destroyed"', async () => {
    const out = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: false, image: false, deletionRecord: true }, workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(out.message).toContain('could not confirm that our independent record of the deletion has been sealed.');
    expect(out.message).not.toMatch(/original file|image|destroyed/);
  });
  it('only the Work\'s image', async () => {
    const out = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: false, image: true, deletionRecord: false }, workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(out.message).toContain('could not confirm that its image has been destroyed.');
  });
  it('two and three things are listed, each with its verb', async () => {
    const two = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: true, image: false, deletionRecord: true }, workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(two.message).toContain('two things: that its original file has been destroyed, and that our independent record of the deletion has been sealed.');
    const three = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: true, image: true, deletionRecord: true }, workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(three.message).toContain('three things: that its original file has been destroyed, that its image has been destroyed, and that our independent record of the deletion has been sealed.');
  });
  it('when the server did not say which, it names the two that can be owed after a writing\'s deletion', async () => {
    const out = await owed({ removed: true, refusal: 'custody_incomplete' }, { workId: WORK, manuscriptId: MS });
    expect(out.message).toContain('its original file, if there was one, has been destroyed');
    expect(out.message).toContain('our independent record of the deletion has been sealed');
  });
  it('the subject: a Work card whose Work went says "work … removed"; a Work that STAYS (workRemoved false) and loose writing say "writing … deleted"', async () => {
    const goes = await owed({ removed: true, refusal: 'custody_incomplete', workRemoved: true }, { workId: WORK, manuscriptId: MS });
    expect(goes.message).toMatch(/^This work was removed from your studio, but/);
    const stays = await owed({ removed: true, refusal: 'custody_incomplete', workRemoved: false }, { workId: WORK, manuscriptId: MS });
    expect(stays.message).toMatch(/^This writing was deleted from your studio, but/);
    const loose = await owed({ removed: true, refusal: 'custody_incomplete' }, { workId: null, manuscriptId: MS });
    expect(loose.message).toMatch(/^This writing was deleted from your studio, but/);
  });
  it('the flags are carried on the outcome', async () => {
    const out = await owed({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: true } }, { workId: WORK, manuscriptId: MS });
    expect(out.unconfirmed).toEqual({ originalFile: true, image: false, deletionRecord: false });
  });
  it('the Work route\'s owed-image answer is told about the IMAGE, from deleteWork (a no-writing Work) and from removeWork, with or without a code', async () => {
    const viaDelete = await deleteWork({ workId: WORK, manuscriptId: null }, async () => fake(500, { removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } }));
    expect((viaDelete as { message: string }).message).toContain('its image');
    expect((viaDelete as { message: string }).message).not.toContain('original file');
    const viaRemove = await removeWork(WORK, async () => fake(500, { removed: true, refusal: 'image_bytes_owed' }));
    expect(viaRemove).toMatchObject({ ok: false, removed: true, unconfirmed: { image: true } });
    expect((viaRemove as { message: string }).message).toContain('its image');
    const noCode = await removeWork(WORK, async () => fake(500, { removed: true }));
    expect((noCode as { message: string }).message).toContain('its image');
  });
  it('an owed-image CODE with no flags (an older server) is still told about the IMAGE on the writing route, never as the generic pair', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, { removed: true, refusal: 'image_bytes_owed' }));
    const message = (out as { message: string }).message;
    expect(message).toContain('its image has been destroyed');
    expect(message).not.toContain('original file');
    expect(message).not.toContain('independent record');
  });
});

describe('a shared-writing refusal re-reads the page before the member is asked anything', () => {
  it('the card is then re-derived from a list that includes the other Work', async () => {
    const trace: string[] = [];
    const err = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(409, { refusal: 'declared_in_other_works', works: 2 }), async () => { trace.push('refresh'); }).catch((e: Error) => { trace.push('rejected'); return e; });
    expect(err).toBeInstanceOf(DeletionSharedMaterial);
    expect(trace).toEqual(['refresh', 'rejected']);
  });
  it('a failed re-read does not hide the refusal', async () => {
    const err = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(409, { refusal: 'declared_in_other_works', works: 2 }), async () => false).catch((e: Error) => e);
    expect(err).toBeInstanceOf(DeletionSharedMaterial);
  });
});
