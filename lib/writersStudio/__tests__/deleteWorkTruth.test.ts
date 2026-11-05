/**
 * What the client says is TRUE of what it knows (the second full review of Work-card Delete, 2026-11-05).
 *
 * The page-level act (runDeleteWork / runRemoveWork) tells the member things about Home. It may only say "Home now shows what is
 * current" if the re-read worked; it may only say "nothing was deleted" about a refusal that happened before any act; and a
 * follow-through after "the writing is already gone" may only withdraw what the member confirmed.
 */
import {
  reReadAll,
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

  it('a successful act does not depend on the re-read: the server said it is gone', async () => {
    await expect(runDeleteWork({ workId: WORK, manuscriptId: MS }, async () => fake(200), async () => false)).resolves.toBeUndefined();
    await expect(runRemoveWork(WORK, async () => fake(200), async () => { throw new Error('offline'); })).resolves.toBeUndefined();
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

describe('the follow-through after "the writing is already gone" withdraws only what the member confirmed', () => {
  const calls: string[] = [];
  const record = (handler: (url: string) => Response) => async (url: string, init: RequestInit) => { calls.push(`${init.method} ${url}`); return handler(url); };
  beforeEach(() => { calls.length = 0; });

  it('the Work was to go: the whole Work is withdrawn', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(200))));
    expect(out).toEqual({ ok: true });
    expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS}?workId=${WORK}`, `DELETE /api/sovereign/living-works/${WORK}`]);
  });

  it('the Work was to STAY: only the dangling declaration is withdrawn, never the Work', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS, workStays: true }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(200))));
    expect(out).toEqual({ ok: true });
    expect(calls).toEqual([
      `DELETE /api/sovereign/manuscripts/${MS}?workId=${WORK}`,
      `DELETE /api/sovereign/living-works/${WORK}/expressions?expressionType=manuscript&expressionId=${MS}`,
    ]);
    expect(calls.some((c) => c === `DELETE /api/sovereign/living-works/${WORK}`)).toBe(false);
  });

  it('a declaration that is already gone (404) is done', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS, workStays: true }, record(() => fake(404)));
    expect(out).toEqual({ ok: true });
  });

  it('a failed follow-through keeps its own truth: sign-in sentence for 401, unknown for 5xx, plain for 4xx, and always asks for a re-read', async () => {
    for (const workStays of [false, true]) {
      const session = await deleteWork({ workId: WORK, manuscriptId: MS, workStays }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(401))));
      expect(session).toMatchObject({ ok: false, sessionEnded: true, stale: true });
      expect((session as { message: string }).message).toContain('Sign in again');
      const down = await deleteWork({ workId: WORK, manuscriptId: MS, workStays }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(500))));
      expect(down).toMatchObject({ ok: false, unknown: true, stale: true });
      const refused = await deleteWork({ workId: WORK, manuscriptId: MS, workStays }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(400))));
      expect(refused).toMatchObject({ ok: false, stale: true });
      expect((refused as { unknown?: boolean }).unknown).toBeUndefined();
    }
  });

  it('through runDeleteWork a failed follow-through re-reads the page first (the 404 already proved it out of date)', async () => {
    const trace: string[] = [];
    const err = await runDeleteWork(
      { workId: WORK, manuscriptId: MS },
      record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(400))),
      async () => { trace.push('refresh'); },
    ).catch((e: Error) => { trace.push('rejected'); return e; });
    expect(trace).toEqual(['refresh', 'rejected']);
    expect((err as Error).message).toContain('Nothing was removed');
  });

  it('a follow-through that commits but cannot confirm (owed image) is an unconfirmed removal', async () => {
    const out = await deleteWork({ workId: WORK, manuscriptId: MS }, record((url) => (url.includes('/manuscripts/') ? fake(404) : fake(500, { removed: true, refusal: 'image_bytes_owed' }))));
    expect(out).toMatchObject({ ok: false, removed: true, stale: true });
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
