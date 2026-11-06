/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { P4R1HistoryPage, type P4R1HistoryPageProps } from '../P4R1HistoryPage';
import { DeletionNotice, DeletionSharedMaterial, DeletionUnconfirmed } from '@/lib/writersStudio/deleteWork';

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
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('could not confirm');
  });
  it('removed-but-unconfirmed names the writing, and a SECOND one does not replace the first', async () => {
    const p = base();
    p.acts = [A('1', 'm1'), A('4', 'm4')] as any;
    p.manuscripts = [{ id: 'm1', title: 'Book' }, { id: 'm4', title: 'Second' }] as any;
    p.works = [] as any;
    p.onDeleteWriting = jest.fn().mockRejectedValue(new DeletionUnconfirmed('custody message'));
    render(p);
    act(() => btns('Delete')[0].click());
    await act(async () => btns('Delete permanently')[0].click());
    act(() => btns('Delete')[1].click());                      // the second writing's line
    await act(async () => btns('Delete permanently')[0].click());
    const alerts = Array.from(container.querySelectorAll('.p4r1-home-delete-notice')).map((n) => n.textContent ?? '');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toContain('“Book”: custody message');
    expect(alerts[1]).toContain('“Second”: custody message');
  });
  it.each([
    ['an unknown outcome the page was re-read for', () => new DeletionNotice('We could not confirm whether that work was deleted.'), 'We could not confirm whether that work was deleted.'],
    ['a refusal as shared', () => new DeletionSharedMaterial('This writing is also in another of your Works. Nothing was deleted.'), 'Nothing was deleted.'],
  ])('%s is a status notice naming the writing, and closes the question (each case on a fresh page)', async (_name, make, text) => {
    const p = base();
    p.onDeleteWriting = jest.fn().mockRejectedValue(make());
    render(p);
    act(() => btns('Delete')[0].click());
    await act(async () => btns('Delete permanently')[0].click());
    expect(container.querySelector('[data-deleting-confirmation]')).toBeNull();
    const notes = container.querySelectorAll('.p4r1-home-delete-notice');
    expect(notes).toHaveLength(1);
    expect(notes[0]!.getAttribute('role')).toBe('status');
    expect(notes[0]!.textContent).toContain('“Book”: ');
    expect(notes[0]!.textContent).toContain(text);
  });
  it('a re-read that did not work is said', async () => {
    const p = base();
    p.onDeleteWriting = jest.fn().mockResolvedValue({ refreshed: false });
    render(p);
    act(() => btns('Delete')[0].click());
    await act(async () => btns('Delete permanently')[0].click());
    expect(container.querySelector('.p4r1-home-delete-notice')?.textContent).toContain('reload it');
  });
  it('a writing in a Work that holds several says why it cannot be deleted here, and where to go', () => {
    render(base());      // m2 sits in a Work with m3
    expect(container.textContent).toContain('This writing is in a Work that holds more than one writing');
    expect(container.textContent).toContain('On Home, press Remove on that Work');
    expect(container.textContent).toContain('deletes none of its writings');
  });
  it('a writing held by TWO Works has no Delete (it could only be refused) and says where the way forward is', () => {
    const p = base();
    render({
      ...p,
      acts: [A('1', 'sh')] as any,
      manuscripts: [{ id: 'sh', title: 'Held Twice' }] as any,
      works: [
        { id: 'w1', expressions: [{ expressionType: 'manuscript', expressionId: 'sh' }] },
        { id: 'w2', expressions: [{ expressionType: 'manuscript', expressionId: 'sh' }] },
      ] as any,
    });
    expect(btns('Delete')).toHaveLength(0);
    expect(btns('Open writing')).toHaveLength(1);
    expect(container.textContent).toContain('This writing is in 2 of your Works, so it cannot be deleted from here');
    expect(container.textContent).toContain('On Home, press Delete on one of those Works');
  });
  it('the confirmation says what THIS deletion reaches: a Work that holds only this writing goes with it', () => {
    const p = base();
    render({
      ...p,
      acts: [A('1', 'solo'), A('2', 'free')] as any,
      manuscripts: [{ id: 'solo', title: 'Solo' }, { id: 'free', title: 'Free' }] as any,
      works: [{ id: 'w', expressions: [{ expressionType: 'manuscript', expressionId: 'solo' }] }] as any,
    });
    act(() => btns('Delete')[0].click());
    expect(container.textContent).toContain('This deletes the Work and its writing');
    expect(container.textContent).toContain('what you built inside the Work');
    act(() => btns('Keep it')[0].click());
    act(() => btns('Delete')[1].click());
    expect(container.textContent).toContain('This deletes the writing:');
    expect(container.textContent).not.toContain('what you built inside the Work');
  });
  it('has honest empty, error and signed-out states', () => {
    const p = base();
    render({ ...p, acts: [] }); expect(container.textContent).toContain('Nothing has been recorded yet');
    render({ ...p, phase: 'error' }); expect(container.textContent).toContain('could not be read');
    expect(container.textContent).not.toContain('Nothing has changed');   // after an act that may have gone through, that would not be true
    act(() => btns('Try again')[0].click()); expect(p.onRetry).toHaveBeenCalled();
    render({ ...p, phase: 'unauthorized' }); expect(container.textContent).toContain('Sign in');
  });
});
