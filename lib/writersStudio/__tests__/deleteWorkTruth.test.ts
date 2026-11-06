/**
 * What the client says is TRUE of what it knows (the second full review of Work-card Delete, 2026-11-05).
 *
 * The page-level act (runDeleteWork / runRemoveWork) tells the member things about Home. It may only say "Home now shows what is
 * current" if the re-read worked; it may only say "nothing was deleted" about a refusal that happened before any act; and it sends
 * ONE request per act (a 404 is done: whatever remains to be finished for a vanished writing is finished by the server, in the same
 * transaction, so the client has no second request that could remove a Work the member did not confirm).
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
    await expect(runRemoveWork(WORK, async () => fake(200), async () => { throw new Error('offline'); })).resolves.toEqual({ refreshed: false, workRemoved: true });
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
    expect(out).toEqual({ ok: true, alreadyGone: true });
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
    // A body that does not say (a server older than this client), on a Work card: only what is certain is claimed. The WRITING was
    // deleted in every removed:true answer; "the Work was removed" is said only on evidence.
    const unsaid = await owed({ removed: true, refusal: 'custody_incomplete' }, { workId: WORK, manuscriptId: MS });
    expect(unsaid.message).toMatch(/^This writing was deleted from your studio, but/);
    expect(unsaid.message).not.toContain('This work was removed');
    // A card with no writing goes to the Work route, which has no workRemoved field and always removes the Work.
    const workRoute = await owed({ removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } }, { workId: WORK, manuscriptId: null });
    expect(workRoute.message).toMatch(/^This work was removed from your studio, but/);
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


describe('what became of the Work is the SERVER\'s word, carried to the page and never guessed', () => {
  const ms = (body: unknown, status = 200) => async () => fake(status, body);
  it('the manuscripts route says whether the Work went; the result and the outcome carry exactly that', async () => {
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, workRemoved: true }))).toEqual({ ok: true, workRemoved: true });
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, workRemoved: false }))).toEqual({ ok: true, workRemoved: false });
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, workRemoved: false }), async () => true)).resolves.toEqual({ refreshed: true, workRemoved: false });
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, workRemoved: true }), async () => false)).resolves.toEqual({ refreshed: false, workRemoved: true });
  });
  it('an answer that does not say (an older server, a body that is not JSON, a flag that is not a boolean) leaves it unsaid, never defaulted to "the Work went"', async () => {
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true }))).toEqual({ ok: true });         // unsaid, and NOT "already gone": this act deleted it
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, workRemoved: 'yes' }))).toEqual({ ok: true });
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, async () => ({ ok: true, status: 200, json: async () => { throw new Error('not json'); } }) as unknown as Response)).toEqual({ ok: true });
  });
  it('a writing that is already gone (404 on the manuscripts route) says nothing about the Work', async () => {
    expect(await deleteWork({ workId: WORK, manuscriptId: MS }, ms({ error: 'Not found' }, 404))).toEqual({ ok: true, alreadyGone: true });
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ error: 'Not found' }, 404), async () => true)).resolves.toEqual({ refreshed: true, alreadyGone: true });
    // ...and a 200 that does not say whether the Work went is NOT "already gone": the writing was deleted by this act.
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true }), async () => true)).resolves.toEqual({ refreshed: true });
  });
  it('the Work route always means the Work is gone: a no-writing Work\'s Delete, ok or already absent', async () => {
    expect(await deleteWork({ workId: WORK, manuscriptId: null }, ms({ withdrawn: WORK }))).toEqual({ ok: true, workRemoved: true });
    expect(await deleteWork({ workId: WORK, manuscriptId: null }, ms({ error: 'Not found' }, 404))).toEqual({ ok: true, workRemoved: true });
  });
  it('a committed removal with custody unconfirmed carries the server\'s word on the Work, through the error the page receives', async () => {
    const stays = await runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, refusal: 'custody_incomplete', workRemoved: false }, 500), async () => true).catch((e: Error) => e);
    expect(stays).toBeInstanceOf(DeletionUnconfirmed);
    expect((stays as DeletionUnconfirmed).workRemoved).toBe(false);
    const goes = await runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, refusal: 'custody_incomplete', workRemoved: true }, 500), async () => true).catch((e: Error) => e);
    expect((goes as DeletionUnconfirmed).workRemoved).toBe(true);
    const unsaid = await runDeleteWork({ workId: WORK, manuscriptId: MS }, ms({ removed: true, refusal: 'custody_incomplete' }, 500), async () => true).catch((e: Error) => e);
    expect((unsaid as DeletionUnconfirmed).workRemoved).toBeUndefined();
  });
  it('the Work route\'s owed-image answer means the Work is gone, from Delete (no-writing Work) and from Remove', async () => {
    const viaDelete = await runDeleteWork({ workId: WORK, manuscriptId: null }, ms({ removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } }, 500), async () => true).catch((e: Error) => e);
    expect((viaDelete as DeletionUnconfirmed).workRemoved).toBe(true);
    expect((viaDelete as Error).message).toMatch(/^This work was removed from your studio, but/);
    const viaRemove = await runRemoveWork(WORK, ms({ removed: true, refusal: 'image_bytes_owed' }, 500), async () => true).catch((e: Error) => e);
    expect((viaRemove as DeletionUnconfirmed).workRemoved).toBe(true);
    expect((viaRemove as Error).message).toMatch(/^This work was removed from your studio, but/);
  });
});

describe('a re-read that did not work is said on EVERY path where the act happened or was refused', () => {
  const RELOAD = 'We could not reload Home, so reload this page to see what is current.';
  const failing = async () => false;
  const working = async () => true;
  it('a committed removal whose custody is unconfirmed: the message ends with the reload line when the re-read failed, and not otherwise', async () => {
    const body = { removed: true, refusal: 'custody_incomplete', workRemoved: true };
    const failed = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, body), failing).catch((e: Error) => e);
    const ok = await runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(500, body), working).catch((e: Error) => e);
    expect((failed as Error).message.endsWith(RELOAD)).toBe(true);
    expect((ok as Error).message).not.toContain('reload this page');
  });
  it('the same for a Remove whose image bytes are owed', async () => {
    const body = { removed: true, refusal: 'image_bytes_owed' };
    const failed = await runRemoveWork(WORK, async () => fake(500, body), failing).catch((e: Error) => e);
    const ok = await runRemoveWork(WORK, async () => fake(500, body), working).catch((e: Error) => e);
    expect((failed as Error).message.endsWith(RELOAD)).toBe(true);
    expect((ok as Error).message).not.toContain('reload this page');
  });
  it('the same for a refusal as shared (the explanation the member reads on a loose-writing or History line)', async () => {
    const shared = async () => fake(409, { refusal: 'declared_in_other_works', works: 2 });
    const failed = await runDeleteWork({ workId: null, manuscriptId: MS }, shared, failing).catch((e: Error) => e);
    const ok = await runDeleteWork({ workId: null, manuscriptId: MS }, shared, working).catch((e: Error) => e);
    expect(failed).toBeInstanceOf(DeletionSharedMaterial);
    expect((failed as Error).message.endsWith(RELOAD)).toBe(true);
    expect((ok as Error).message).not.toContain('reload this page');
  });
});

describe('a shared refusal says whether the re-read that preceded it worked (so a page that cannot see the other Work can tell why)', () => {
  const shared = async () => fake(409, { refusal: 'declared_in_other_works', works: 2 });
  it('reloaded:true when the re-read worked, false when it did not', async () => {
    const ok = await runDeleteWork({ workId: WORK, manuscriptId: MS }, shared, async () => true).catch((e: Error) => e);
    const failed = await runDeleteWork({ workId: WORK, manuscriptId: MS }, shared, async () => false).catch((e: Error) => e);
    expect((ok as DeletionSharedMaterial).reloaded).toBe(true);
    expect((failed as DeletionSharedMaterial).reloaded).toBe(false);
  });
});
