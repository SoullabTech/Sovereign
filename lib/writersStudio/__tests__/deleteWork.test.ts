/**
 * WS-DELETE-01 — the member act that ends custody, and what it must never do.
 *
 * The governing promise (founder ruling 2026-09-07): "The Work is gone." Delete
 * must not mean hidden, archived, detached, or unreferenced but retained. These
 * tests hold the client half of that; the vault sweep that holds the other half
 * is exercised in lib/storage/__tests__/destroyVaultBytes.test.ts.
 */
import { deleteWork, deletionRefusalCopy, DELETE_WORK_COPY } from '../deleteWork';

const gone = () => new Response(JSON.stringify({ removed: true }), { status: 200 });
const notFound = () => new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

type Call = [string, RequestInit];
const recorder = (responder: (url: string) => Response) => {
  const calls: Call[] = [];
  const fetcher = async (u: string, i: RequestInit) => {
    calls.push([u, i]);
    return responder(u);
  };
  return { calls, fetcher };
};

describe('the act reaches the existing route, by id', () => {
  /* ONE request. The declaration is removed inside the same server transaction
     as the material, so there is no interval in which a live Work points at
     absent material — the detached state the ruling forbids. A second call from
     here would reintroduce exactly that interval. */
  it('DELETEs the manuscript and nothing else — the declaration goes with it, server-side', async () => {
    const { calls, fetcher } = recorder(gone);

    const out = await deleteWork({ workId: 'w-1', manuscriptId: 'm-1' }, fetcher);

    expect(out).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/manuscripts/m-1');
    expect(calls[0][1].method).toBe('DELETE');
    expect(calls.some((c) => c[0].includes('living-works'))).toBe(false);
  });

  it('deletes unclaimed writing without inventing a work to withdraw', async () => {
    const { calls, fetcher } = recorder(gone);

    const out = await deleteWork({ workId: null, manuscriptId: 'm-9' }, fetcher);

    expect(out).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/manuscripts/m-9');
  });

  it('removes a work that never had a manuscript', async () => {
    const { calls, fetcher } = recorder(gone);

    await deleteWork({ workId: 'w-2', manuscriptId: null }, fetcher);

    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/living-works/w-2');
  });

  it('sends nothing at all when there is nothing to delete', async () => {
    const { calls, fetcher } = recorder(gone);
    const out = await deleteWork({ workId: null, manuscriptId: null }, fetcher);
    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });
});

describe('a refusal destroys nothing', () => {
  /* The negative that matters: a manuscript shared with another Work must not be
     erased out from under it, and nothing else may be sent afterwards. */
  it('refuses shared material without issuing any further request', async () => {
    const { calls, fetcher } = recorder(
      () => new Response(JSON.stringify({ refusal: 'declared_in_other_works' }), { status: 409 }),
    );

    const out = await deleteWork({ workId: 'w-1', manuscriptId: 'm-1' }, fetcher);

    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/manuscripts/m-1');
    expect(calls.some((c) => c[0].includes('living-works'))).toBe(false);
  });

  it('surfaces member copy, never the refusal code', async () => {
    const out = await deleteWork(
      { workId: 'w-1', manuscriptId: 'm-1' },
      async () =>
        new Response(JSON.stringify({ refusal: 'declared_in_other_works' }), { status: 409 }),
    );

    if (out.ok) throw new Error('expected a refusal');
    expect(out.message).toContain('another work');
    expect(out.message).toContain('Nothing was deleted');
    expect(out.message).not.toContain('declared_in_other_works');
    expect(out.message).not.toContain('409');
  });

  it('does not report success when custody could not be ended', async () => {
    const out = await deleteWork(
      { workId: null, manuscriptId: 'm-1' },
      async () =>
        new Response(JSON.stringify({ removed: true, refusal: 'custody_incomplete' }), {
          status: 500,
        }),
    );

    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.message).toContain('not going to tell you it is gone');
  });

  it('reports a transport failure without claiming anything was removed', async () => {
    const out = await deleteWork({ workId: 'w-1', manuscriptId: 'm-1' }, async () => {
      throw new Error('offline');
    });
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.message).toContain('Nothing was removed');
  });
});

describe('a member cannot delete what is not theirs', () => {
  /* The route answers 404 rather than 403 for another member's id, so it never
     confirms that the id exists. Nothing of another member's is touched, and the
     act sends exactly one request regardless. */
  it('sends one member-scoped request and treats the 404 as already gone', async () => {
    const { calls, fetcher } = recorder(notFound);

    const out = await deleteWork({ workId: 'someone-elses', manuscriptId: 'not-mine' }, fetcher);

    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/api/sovereign/manuscripts/not-mine');
    expect(out).toEqual({ ok: true });
  });
});

describe('the confirmation tells the truth about reach', () => {
  it('names the work being deleted', () => {
    expect(DELETE_WORK_COPY.question('The Long Field')).toContain('The Long Field');
  });

  it('says the original file goes too, and that nothing is kept', () => {
    expect(DELETE_WORK_COPY.body).toContain('original file');
    expect(DELETE_WORK_COPY.body).toContain('nothing is kept');
  });

  it('promises no recovery it cannot honour', () => {
    const copy = Object.values(DELETE_WORK_COPY)
      .map((v) => (typeof v === 'function' ? v('x') : String(v)))
      .join(' ')
      .toLowerCase();
    /* Denying an archive is the point; OFFERING one would be the lie. */
    expect(copy).toContain('no archive');
    expect(copy).toContain('cannot be undone');
    expect(copy).not.toMatch(/\brestore\b/);
    expect(copy).not.toMatch(/\btrash\b/);
    expect(copy).not.toMatch(/\brecover\b/);
  });

  it('falls back rather than letting an unknown code reach the member', () => {
    expect(deletionRefusalCopy('some_new_code_from_a_later_lane')).toContain(
      'Nothing was removed',
    );
  });
});
