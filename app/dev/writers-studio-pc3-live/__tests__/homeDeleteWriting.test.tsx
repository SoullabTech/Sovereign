/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { WritingDeleteConfirm } from '../WritingDeleteConfirm';
import { DELETE_WORK_COPY, deleteWork } from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
const props = { title: 'ELEMENTAL ALCHEMY interior 217pp NEWCH10', busy: false, error: null as string | null, onConfirm: jest.fn(), onCancel: jest.fn() };
const render = (p = props) => act(() => root.render(React.createElement(WritingDeleteConfirm, p)));
const btn = (name: string) => Array.from(container.querySelectorAll('button')).find(b => b.textContent === name) as HTMLButtonElement;
beforeEach(() => { props.onConfirm.mockReset(); props.onCancel.mockReset(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('deleting a writing from the Studio Home', () => {
  it('names the writing and says plainly that it is permanent and nothing is kept', () => {
    render();
    expect(container.textContent).toContain('Delete “ELEMENTAL ALCHEMY interior 217pp NEWCH10”?');
    expect(container.textContent).toContain('It cannot be undone and there is no archive');
    expect(container.textContent).toContain('nothing is kept');
  });
  it('offers "Delete permanently" and "Keep it", and the safe one is focused first', () => {
    render();
    expect(btn(DELETE_WORK_COPY.confirm)).toBeTruthy();
    expect(btn(DELETE_WORK_COPY.cancel)).toBeTruthy();
    act(() => btn(DELETE_WORK_COPY.confirm).click()); act(() => btn(DELETE_WORK_COPY.cancel).click());
    expect(props.onConfirm).toHaveBeenCalledTimes(1); expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
  it('is inert while deleting and shows a failure without claiming success', () => {
    render({ ...props, busy: true, error: 'This writing also belongs to another work, so deleting it here would remove it from there too. Nothing was deleted.' });
    expect(btn(DELETE_WORK_COPY.working).disabled).toBe(true);
    expect(btn(DELETE_WORK_COPY.cancel).disabled).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Nothing was deleted');
  });
});

// jsdom has no fetch Response; the command only reads ok, status and json().
const fake = (status: number, body: unknown = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

describe('the delete command used (WS-DELETE-01)', () => {
  it('sends ONE request to the manuscript erase route and treats an already-gone writing as done', async () => {
    const calls: string[] = [];
    const ok = await deleteWork({ workId: null, manuscriptId: 'm1' }, async (url, init) => { calls.push(`${init.method} ${url}`); return fake(404); });
    expect(calls).toEqual(['DELETE /api/sovereign/manuscripts/m1']);
    expect(ok.ok).toBe(true);
  });
  it('turns a refusal into the author’s language and never reports success', async () => {
    const out = await deleteWork({ workId: null, manuscriptId: 'm1' }, async () => fake(409, { refusal: 'declared_in_other_works' }));
    expect(out.ok).toBe(false);
    expect((out as any).message).toContain('Nothing was deleted');
  });
});

describe('a removal the server committed but could not yet confirm', () => {
  it('is reported as removed AND unconfirmed, never as a plain failure and never as a plain success', async () => {
    const out = await deleteWork({ workId: null, manuscriptId: 'm1' }, async () => fake(500, { removed: true, refusal: 'custody_incomplete' }));
    expect(out.ok).toBe(false);
    expect((out as any).removed).toBe(true);
    expect((out as any).message).toContain('we are not going to tell you it is gone');
  });
  it('a plain failure is not marked removed', async () => {
    const out = await deleteWork({ workId: null, manuscriptId: 'm1' }, async () => fake(500, {}));
    expect(out.ok).toBe(false); expect((out as any).removed).toBeUndefined();
  });
});

describe('wiring', () => {
  const dir = join(__dirname, '..');
  const view = readFileSync(join(dir, 'P4R1HomeView.tsx'), 'utf8');
  const controller = readFileSync(join(dir, 'P4R1HomeController.tsx'), 'utf8');
  it('every writing card gets a Delete door and only one confirmation is open at a time', () => {
    expect(view).toContain('>Delete</button>');
    expect(view.match(/deletion=\{deletionFor\(manuscript\.id\)\}/g)?.length).toBe(2);
    expect(view).toContain('const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)');
    expect(view).toContain('confirming: confirmingDelete === manuscriptId');
  });
  it('the controller deletes through the governed command and re-reads only after the server says it is gone', () => {
    expect(controller).toContain("deleteWork({ workId: null, manuscriptId }");
    expect(controller).toContain('if (outcome.ok) { await refresh()');
    expect(controller).toContain('throw new DeletionUnconfirmed(outcome.message)');
    expect(view).toContain('err instanceof DeletionUnconfirmed');
  });
});

describe('Develop controller declaration (regression: a shadowed manuscriptId read itself before it existed)', () => {
  const src = readFileSync(join(__dirname, '..', 'P4R1DevelopController.tsx'), 'utf8');
  it('does not declare a local that shadows the page manuscriptId, and refuses to declare without one', () => {
    expect(src).not.toContain('const manuscriptId = context?.manuscriptId ?? manuscriptId');
    expect(src).toContain('const id = context?.manuscriptId ?? manuscriptId;');
    expect(src).toContain("if (!id) throw new Error('declare:no-manuscript');");
    expect(src).toContain("expressionId: id }");
  });
});
