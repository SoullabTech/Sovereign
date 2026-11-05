/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { P4R1HistoryPage, type P4R1HistoryPageProps } from '../P4R1HistoryPage';
import { DeletionUnconfirmed } from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, container: HTMLDivElement;
const A = (id: string, manuscriptId: string | null, over: any = {}) => ({
  id, kind: 'version_kept', at: '2026-09-07T18:00:00.000Z', workTitle: null, manuscriptTitle: 'Book',
  manuscriptId, detail: '2', note: null, ...over,
});
const base = (): P4R1HistoryPageProps => ({
  phase: 'ready',
  acts: [A('1', 'm1'), A('2', 'gone'), A('3', 'm2')] as any,
  manuscripts: [{ id: 'm1', title: 'Book' }, { id: 'm2', title: 'Shared' }, { id: 'm3', title: 'Other' }] as any,
  works: [{ id: 'w', expressions: [{ expressionType: 'manuscript', expressionId: 'm2' }, { expressionType: 'manuscript', expressionId: 'm3' }] }] as any,
  onOpen: jest.fn(), onDeleteWriting: jest.fn().mockResolvedValue(undefined), onRetry: jest.fn(), onBack: jest.fn(),
});
const render = (p: P4R1HistoryPageProps) => act(() => root.render(React.createElement(P4R1HistoryPage, p)));
const btns = (name: string) => Array.from(container.querySelectorAll('button')).filter((b) => b.textContent === name) as HTMLButtonElement[];
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

describe('full History view', () => {
  it('offers Open on held writings, Delete only where the writing is not in a multi-manuscript Work, nothing for gone ones', () => {
    render(base());
    expect(btns('Open writing')).toHaveLength(2); // m1, m2 (the "gone" one has none)
    expect(btns('Delete')).toHaveLength(1);       // m1 only
  });
  it('Back and Open call through', () => {
    const p = base(); render(p);
    act(() => btns('Open writing')[0].click()); expect(p.onOpen).toHaveBeenCalledWith('m1');
    act(() => btns('← Back to Home')[0].click()); expect(p.onBack).toHaveBeenCalled();
  });
  it('Delete asks first, and only deletes after Delete permanently', async () => {
    const p = base(); render(p);
    act(() => btns('Delete')[0].click());
    expect(p.onDeleteWriting).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Delete “Book”?');
    await act(async () => btns('Delete permanently')[0].click());
    expect(p.onDeleteWriting).toHaveBeenCalledWith('m1');
  });
  it('a refusal is shown and the confirmation stays; no success claimed', async () => {
    const p = base(); p.onDeleteWriting = jest.fn().mockRejectedValue(new Error('Nothing was deleted.')); render(p);
    act(() => btns('Delete')[0].click());
    await act(async () => btns('Delete permanently')[0].click());
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Nothing was deleted');
  });
  it('removed-but-unconfirmed closes the question and says what could not be confirmed', async () => {
    const p = base(); p.onDeleteWriting = jest.fn().mockRejectedValue(new DeletionUnconfirmed('could not confirm the original file')); render(p);
    act(() => btns('Delete')[0].click());
    await act(async () => btns('Delete permanently')[0].click());
    expect(container.querySelector('[role="status"]')?.textContent).toContain('could not confirm');
  });
  it('has honest empty, error and signed-out states', () => {
    const p = base();
    render({ ...p, acts: [] }); expect(container.textContent).toContain('Nothing has been recorded yet');
    render({ ...p, phase: 'error' }); expect(container.textContent).toContain('could not be read');
    act(() => btns('Try again')[0].click()); expect(p.onRetry).toHaveBeenCalled();
    render({ ...p, phase: 'unauthorized' }); expect(container.textContent).toContain('Sign in');
  });
});
