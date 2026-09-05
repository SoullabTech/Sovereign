import { chooseMount, fetchWriteState, type WriteState } from '../writeStateClient';

const sectionAware: WriteState = {
  mode: 'section_aware', version: 7,
  rows: [{ id: 'draft-sec-0', position: 0, heading: 'One', chars: 3 }],
  sections: [{ id: 'draft-sec-0', position: 0, heading: 'One', body: 'aaa', editable: true }],
};

describe('chooseMount', () => {
  it('LOADING mounts no writing engine at all', () => {
    // The hook takes its version and first active section at mount and resets
    // only on draftKey, so mounting it empty and filling it later builds a
    // session against the loading state.
    expect(chooseMount('loading', null)).toEqual({ mount: 'pending' });
    expect(chooseMount('loading', sectionAware)).toEqual({ mount: 'pending' });
  });

  it('section_aware mounts sections with resolved data in hand', () => {
    expect(chooseMount('ready', sectionAware)).toMatchObject({
      mount: 'sections', version: 7,
    });
  });

  it('continuous mounts the existing Worktable, unchanged', () => {
    const s: WriteState = { mode: 'continuous', version: 2, content: 'x', notice: { title: '', body: '' } };
    expect(chooseMount('ready', s)).toEqual({ mount: 'worktable' });
  });

  it('no_draft mounts Worktable — it owns first-draft creation', () => {
    // loadDraft → none → beginDraft. The GET simply sees that moment earlier;
    // treating its 404 as an error would strand a newly imported manuscript.
    expect(chooseMount('ready', { mode: 'no_draft' })).toEqual({ mount: 'worktable' });
  });

  it('continuous_unprovable keeps Worktable and carries the mapped notice', () => {
    const s: WriteState = {
      mode: 'continuous_unprovable', version: 3, content: 'x',
      notice: { title: "This draft's section breaks need your confirmation.", body: 'unchanged' },
    };
    const m = chooseMount('ready', s);
    expect(m).toMatchObject({ mount: 'worktable' });
    expect(m.mount === 'worktable' && m.notice?.title).toContain('confirmation');
  });

  it('FAILS CLOSED: an unknown write mode mounts neither engine', () => {
    // Guessing continuous would let the whole-manuscript writer touch a draft
    // that may already be section-authoritative — one save overwriting every
    // section at once.
    expect(chooseMount('error', null)).toEqual({ mount: 'unavailable' });
    expect(chooseMount('ready', null)).toEqual({ mount: 'unavailable' });
  });
});

describe('fetchWriteState', () => {
  const res = (status: number, body?: unknown) =>
    ({ status, ok: status >= 200 && status < 300, json: async () => body }) as Response;

  it('reads a resolved state', async () => {
    const r = await fetchWriteState('m', async () => res(200, sectionAware));
    expect(r).toEqual({ phase: 'ready', state: sectionAware });
  });

  it('a 404 is no_draft, not an error', async () => {
    const r = await fetchWriteState('m', async () => res(404));
    expect(r).toEqual({ phase: 'ready', state: { mode: 'no_draft' } });
  });

  it('a 500 is an error, and does not become continuous', async () => {
    expect(await fetchWriteState('m', async () => res(500))).toEqual({ phase: 'error', state: null });
  });

  it('a thrown fetch is an error', async () => {
    expect(await fetchWriteState('m', async () => { throw new Error('offline'); }))
      .toEqual({ phase: 'error', state: null });
  });
});
