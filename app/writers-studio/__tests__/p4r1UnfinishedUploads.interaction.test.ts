/** @jest-environment jsdom */
/**
 * D3 — the member's list of what is held for them and not in a Work, and the removal door, EXERCISED in a DOM.
 *
 * The network is the only fake: `apiFetch` is routed by URL so the list request and the removal request are answered
 * independently. What is pinned is what the member experiences: nothing appears when nothing is held, removal always
 * asks first, the screen never says "removed" for something the server only STARTED removing, a failure is a failure,
 * a double press sends one request, and the component is independent of Sanctuary, the roster and the intake hold.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import P4R1UnfinishedUploads, { UNFINISHED_UPLOADS_COPY as COPY } from '@/app/dev/writers-studio-pc3-live/P4R1UnfinishedUploads';
import P4R1ImportManuscript from '@/app/dev/writers-studio-pc3-live/P4R1ImportManuscript';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const mocked = apiFetch as jest.Mock;
const LIST = '/api/sovereign/manuscripts/unfinished-uploads';
const DISCARD = '/api/sovereign/manuscripts/unfinished-uploads/discard';

const INCOMPLETE = { id: '33333333-3333-4333-8333-333333333333', kind: 'incomplete', createdAt: '2026-11-01T10:00:00.000Z', filename: null, bytes: 4096 };
const UNCLAIMED = { id: '44444444-4444-4444-8444-444444444444', kind: 'unclaimed', createdAt: '2026-10-30T10:00:00.000Z', filename: 'fictional-draft.docx', bytes: 3 * 1024 * 1024 };

type Reply = { status: number; body?: unknown; reject?: boolean; json?: 'throws' };
let root: Root;
let container: HTMLDivElement;
let world: { items: unknown; list: Reply; discard: Reply };

const reply = (r: Reply) => {
  if (r.reject) return Promise.reject(new Error('fictional network fault'));
  return Promise.resolve({
    status: r.status,
    ok: r.status >= 200 && r.status < 300,
    json: r.json === 'throws' ? async () => { throw new Error('not json'); } : async () => r.body,
  });
};
const posts = () => mocked.mock.calls.filter(([url, init]) => url === DISCARD && init?.method === 'POST');
const lists = () => mocked.mock.calls.filter(([url]) => url === LIST);

const settle = async () => { await act(async () => { await new Promise((r) => setTimeout(r, 0)); }); };
const byText = (label: string) => {
  const match = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
  if (!match) throw new Error(`button not found: ${label}`);
  return match as HTMLButtonElement;
};
const byLabel = (label: string) => {
  const match = container.querySelector(`button[aria-label="${label}"]`);
  if (!match) throw new Error(`button not found: ${label}`);
  return match as HTMLButtonElement;
};
async function click(el: HTMLElement) { await act(async () => { el.click(); }); await settle(); }
async function mount(el: React.ReactElement = React.createElement(P4R1UnfinishedUploads)) {
  await act(async () => { root.render(el); });
  await settle();
}

beforeEach(() => {
  mocked.mockReset();
  window.localStorage.clear();
  world = { items: [INCOMPLETE, UNCLAIMED], list: { status: 200 }, discard: { status: 200, body: { result: 'removed' } } };
  mocked.mockImplementation((url: string, init?: RequestInit) => {
    if (url === LIST) return reply(world.list.status === 200 && !world.list.body ? { status: 200, body: { items: world.items } } : world.list);
    if (url === DISCARD && init?.method === 'POST') return reply(world.discard);
    return Promise.reject(new Error(`unexpected request ${String(url)}`));
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('what it shows', () => {
  it('shows nothing at all when nothing is held: no heading, no empty-state card', async () => {
    world.items = [];
    await mount();
    expect(container.querySelector('[data-unfinished-uploads]')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('lists each held item with a plain description, never its identity or storage detail', async () => {
    await mount();
    const rows = container.querySelectorAll('li');
    expect(rows).toHaveLength(2);
    expect(container.textContent).toContain(COPY.heading);
    expect(container.textContent).toContain(COPY.unlabeled);
    expect(container.textContent).toContain(COPY.kind.incomplete);
    expect(container.textContent).toContain('fictional-draft.docx');
    expect(container.textContent).toContain(COPY.kind.unclaimed);
    expect(container.textContent).toContain('3.0 MB');
    expect(container.textContent).toContain('Oct 30, 2026');
    expect(container.innerHTML).not.toContain(INCOMPLETE.id);
    expect(container.innerHTML).not.toContain(UNCLAIMED.id);
  });

  it('renders a member-authored filename as text, never as markup', async () => {
    world.items = [{ ...UNCLAIMED, filename: '<img src=x onerror=alert(1)>.docx' }];
    await mount();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>.docx');
  });

  it('drops malformed entries instead of rendering them', async () => {
    world.items = [INCOMPLETE, { id: 7 }, null, 'x', { ...UNCLAIMED, kind: 'arrival' }];
    await mount();
    expect(container.querySelectorAll('li')).toHaveLength(1);
  });

  it.each([
    ['the list request fails', { status: 500 } as Reply],
    ['the list request is refused', { status: 401, body: { error: 'Unauthorized' } } as Reply],
    ['the list request rejects', { status: 0, reject: true } as Reply],
    ['the list body is not an items array', { status: 200, body: { items: 'nope' } } as Reply],
    ['the list body is not JSON', { status: 200, body: {}, json: 'throws' } as Reply],
  ])('says it could not check, rather than showing nothing, when %s', async (_n, reply_) => {
    world.list = reply_;
    await mount();
    expect(container.textContent).toContain(COPY.unavailable);
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});

describe('removal always asks first', () => {
  it('sends nothing on the first press; Keep it cancels without any request', async () => {
    await mount();
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull();
    expect(container.textContent).toContain(COPY.confirmBody);
    expect(posts()).toHaveLength(0);
    await click(byText(COPY.keep));
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(posts()).toHaveLength(0);
  });

  it('puts keyboard focus on the safe choice', async () => {
    await mount();
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    expect(document.activeElement).toBe(byText(COPY.keep));
  });

  it('confirming sends exactly the id and kind of that row', async () => {
    await mount();
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    await click(byText(COPY.confirm));
    expect(posts()).toHaveLength(1);
    const [, init] = posts()[0];
    expect(JSON.parse(String(init.body))).toEqual({ id: UNCLAIMED.id, kind: 'unclaimed' });
  });

  it('confirming the unfinished upload sends ITS id and the `incomplete` kind (not the other row, not the other kind)', async () => {
    await mount();
    await click(byLabel(`${COPY.remove} ${COPY.unlabeled}`));
    await click(byText(COPY.confirm));
    expect(posts()).toHaveLength(1);
    expect(JSON.parse(String(posts()[0][1].body))).toEqual({ id: INCOMPLETE.id, kind: 'incomplete' });
  });

  it('a double press on the confirmation sends one request', async () => {
    let release!: (v: unknown) => void;
    mocked.mockImplementation((url: string, init?: RequestInit) => {
      if (url === LIST) return reply({ status: 200, body: { items: world.items } });
      if (url === DISCARD && init?.method === 'POST') return new Promise((r) => { release = r; });
      return Promise.reject(new Error('unexpected'));
    });
    await mount();
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    const confirm = byText(COPY.confirm);
    await act(async () => { confirm.click(); confirm.click(); });
    expect(posts()).toHaveLength(1);
    expect(container.textContent).toContain(COPY.working);
    await act(async () => { release({ status: 200, ok: true, json: async () => ({ result: 'removed' }) }); });
    await settle();
    expect(posts()).toHaveLength(1);
  });
});

describe('the screen says what happened and never more', () => {
  async function removeUnclaimed() {
    await mount();
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    await click(byText(COPY.confirm));
  }

  it('200 removed: the row goes and the member is told it is deleted', async () => {
    await removeUnclaimed();
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.textContent).toContain(COPY.removed);
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('202 removal_pending: the row goes but the member is NOT told the file is deleted', async () => {
    world.discard = { status: 202, body: { result: 'removal_pending' } };
    await removeUnclaimed();
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.textContent).toContain(COPY.pending);
    expect(container.textContent).toContain('not yet confirmed deleted');
    expect(container.textContent).not.toContain(COPY.removed);
  });

  it('404 not_found: the row goes with a plain "already gone"', async () => {
    world.discard = { status: 404, body: { result: 'not_found' } };
    await removeUnclaimed();
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.textContent).toContain(COPY.gone);
  });

  it('409 in_progress: the row STAYS and the member is told to try again later', async () => {
    world.discard = { status: 409, body: { result: 'in_progress' } };
    await removeUnclaimed();
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.textContent).toContain(COPY.inProgress);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it.each([
    ['attached_to_work', COPY.attached],
    ['already_recorded', COPY.alreadyRecorded],
  ])('409 %s: the list is re-read and the member is told why', async (result, text) => {
    world.discard = { status: 409, body: { result } };
    await removeUnclaimed();
    expect(lists()).toHaveLength(2); // mount + refresh
    expect(container.textContent).toContain(text);
  });

  it.each([
    ['a server error', { status: 500, body: { error: 'removal_failed' } } as Reply],
    ['an unexpected success body', { status: 200, body: { result: 'something_else' } } as Reply],
    ['a success with no body', { status: 200, body: {}, json: 'throws' } as Reply],
    ['a network failure', { status: 0, reject: true } as Reply],
    ['a refusal', { status: 401, body: { error: 'Unauthorized' } } as Reply],
  ])('%s: the row STAYS, nothing is reported deleted, and it says so', async (_n, r) => {
    world.discard = r;
    await removeUnclaimed();
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.textContent).toContain(COPY.failed);
    expect(container.textContent).not.toContain(COPY.removed);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('removing the last item leaves the outcome on screen, then nothing else', async () => {
    world.items = [UNCLAIMED];
    await removeUnclaimed();
    expect(container.querySelector('li')).toBeNull();
    expect(container.textContent).toContain(COPY.removed);
    expect(container.textContent).not.toContain(COPY.heading);
  });
});

describe('independence from the gates that control putting something in', () => {
  it('works in Sanctuary and sends no posture header: removal is not a content write', async () => {
    window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    await mount();
    expect(container.querySelectorAll('li')).toHaveLength(2);
    await click(byLabel(`${COPY.remove} fictional-draft.docx`));
    await click(byText(COPY.confirm));
    expect(posts()).toHaveLength(1);
    const headers = JSON.stringify(posts()[0][1].headers ?? {}).toLowerCase();
    expect(headers).not.toContain('sanctuary');
    expect(container.textContent).toContain(COPY.removed);
  });
});

describe('where the Import room mounts it', () => {
  const noop = () => undefined;
  const room = (props: { localReview: boolean; sourceIntakeReleased: boolean }) =>
    React.createElement(P4R1ImportManuscript, { ...props, onCancel: noop, onComplete: noop });

  it('a local review retains nothing server-side, so it makes no request and shows no list', async () => {
    await mount(room({ localReview: true, sourceIntakeReleased: true }));
    expect(mocked).not.toHaveBeenCalled();
    expect(container.querySelector('[data-unfinished-uploads]')).toBeNull();
  });

  it.each([
    ['intake released', true],
    ['intake still held', false],
  ])('a server session shows what is held and offers removal when %s: removal does not wait on the hold', async (_n, released) => {
    await mount(room({ localReview: false, sourceIntakeReleased: released }));
    expect(lists()).toHaveLength(1);
    expect(container.querySelector('[data-unfinished-uploads]')).not.toBeNull();
    expect(container.querySelectorAll('[data-unfinished-uploads] li')).toHaveLength(2);
  });
});
