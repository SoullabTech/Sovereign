/**
 * History inside Home: the container that re-reads after every deletion, and the notices that must outlive the History view.
 *
 * Two things the page-level tests (historyPage.test.tsx) cannot see because they mount the page directly:
 *   - P4R1HistoryContainer is the ONLY production mount of History. It must re-read the list after every attempt (including a refused or
 *     unconfirmed one) and must report when that re-read did not work, or History keeps listing a writing that was just deleted.
 *   - A message raised on History (a custody alert above all) lives in Home's notice stack, so "Back to Home" does not lose it, and an
 *     outcome that arrives after the member has already gone back is still delivered.
 *
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/useStudioHistory', () => ({ useStudioHistory: jest.fn() }));

import { useStudioHistory } from '@/app/writers-studio/useStudioHistory';
import { P4R1HistoryContainer, P4R1HistoryPage } from '../P4R1HistoryPage';
import { NoticeList, useNoticeStack } from '../useNoticeStack';
import { DeletionUnconfirmed } from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const hook = useStudioHistory as unknown as jest.Mock;
const act1 = { id: '1', kind: 'version_kept', at: '2026-09-07T18:00:00.000Z', workTitle: null, manuscriptTitle: 'Book', manuscriptId: 'm1', detail: '2', note: null };
const manuscripts = [{ id: 'm1', title: 'Book' }] as any;
const reload = jest.fn();

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  jest.clearAllMocks();
  reload.mockReset().mockResolvedValue(true);
  hook.mockReturnValue({ phase: 'ready', acts: [act1], reload });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const buttons = (label: string) => Array.from(host.querySelectorAll('button')).filter((b) => b.textContent === label) as HTMLButtonElement[];
const deleteBook = async () => {
  act(() => buttons('Delete')[0]!.click());
  await act(async () => buttons('Delete permanently')[0]!.click());
};

describe('P4R1HistoryContainer re-reads History after every attempt, and says when it could not', () => {
  const mountContainer = (onDeleteWriting: (id: string) => Promise<any>) =>
    act(() => root.render(React.createElement(P4R1HistoryContainer, { manuscripts, works: [], onOpen: jest.fn(), onDeleteWriting, onBack: jest.fn() } as any)));

  it('after a deletion the server accepted: the list is re-read, and nothing extra is said when that worked', async () => {
    mountContainer(jest.fn().mockResolvedValue({ refreshed: true, workRemoved: false }));
    await deleteBook();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[data-delete-notice]')).toBeNull();
  });

  it('after a deletion the server accepted, when THIS list could not be re-read: the member is told to reload (it may still list the writing)', async () => {
    reload.mockResolvedValue(false);
    mountContainer(jest.fn().mockResolvedValue({ refreshed: true, workRemoved: false }));
    await deleteBook();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[data-delete-notice]')?.textContent).toContain('reload it');
  });

  it('after a refused or unconfirmed attempt the list is still re-read, and the original outcome still reaches the page', async () => {
    mountContainer(jest.fn().mockRejectedValue(new DeletionUnconfirmed('could not confirm the original file', true)));
    await deleteBook();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not confirm the original file');
  });

  it('a plain failure is re-read too, and stays a dialog error (nothing was removed)', async () => {
    mountContainer(jest.fn().mockRejectedValue(new Error('Nothing was deleted.')));
    await deleteBook();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[data-deleting-confirmation] [role="alert"]')?.textContent).toContain('Nothing was deleted');
  });

  it('a History that cannot be read after an act does not claim that nothing has changed', () => {
    hook.mockReturnValue({ phase: 'error', acts: [], reload });
    mountContainer(jest.fn());
    expect(host.textContent).toContain('could not be read');
    expect(host.textContent).not.toContain('Nothing has changed');
  });
});

describe('notices raised on History live in Home\'s stack: they survive Back to Home, and a late outcome is still delivered', () => {
  /** Home and History as the parent holds them: one stack, and a switch between the two views. */
  function Parent(props: { onDeleteWriting: (id: string) => Promise<any> }) {
    const stack = useNoticeStack();
    const [viewingHistory, setViewingHistory] = React.useState(true);
    return viewingHistory
      ? React.createElement(P4R1HistoryPage, {
          phase: 'ready', acts: [act1] as any, manuscripts, works: [], onOpen: jest.fn(),
          onDeleteWriting: props.onDeleteWriting, onRetry: jest.fn(), onBack: () => setViewingHistory(false), noticeStack: stack,
        })
      : React.createElement('div', { 'data-home': '' }, React.createElement(NoticeList, { stack }));
  }

  it('a custody alert raised on History is still on screen after Back to Home', async () => {
    act(() => root.render(React.createElement(Parent, { onDeleteWriting: jest.fn().mockRejectedValue(new DeletionUnconfirmed('we could not confirm the original file', true)) })));
    await deleteBook();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('“Book”: we could not confirm the original file');
    act(() => buttons('← Back to Home')[0]!.click());
    expect(host.querySelector('[data-home]')).not.toBeNull();
    expect(host.querySelector('[data-home] [role="alert"]')?.textContent).toContain('“Book”: we could not confirm the original file');
  });

  it('the outcome of a deletion still in flight when the member goes back is delivered to Home, not lost', async () => {
    let fail: (error: Error) => void = () => undefined;
    const pending = new Promise<never>((_, reject) => { fail = reject; });
    act(() => root.render(React.createElement(Parent, { onDeleteWriting: jest.fn().mockReturnValue(pending) })));
    act(() => buttons('Delete')[0]!.click());
    await act(async () => buttons('Delete permanently')[0]!.click());
    act(() => buttons('← Back to Home')[0]!.click());                      // the request has not answered yet
    expect(host.querySelector('[data-home] [role="alert"]')).toBeNull();
    await act(async () => { fail(new DeletionUnconfirmed('we could not confirm the original file', true)); });
    expect(host.querySelector('[data-home] [role="alert"]')?.textContent).toContain('“Book”: we could not confirm the original file');
  });

  it('a notice is brought into view (a long History would otherwise hide it above the fold)', async () => {
    const scroll = jest.fn();
    (Element.prototype as any).scrollIntoView = scroll;
    try {
      act(() => root.render(React.createElement(Parent, { onDeleteWriting: jest.fn().mockRejectedValue(new DeletionUnconfirmed('we could not confirm the original file', true)) })));
      await deleteBook();
      expect(scroll).toHaveBeenCalled();
    } finally {
      delete (Element.prototype as any).scrollIntoView;
    }
  });

  it('a page standing alone (no stack handed in) keeps its own notices', async () => {
    act(() => root.render(React.createElement(P4R1HistoryPage, {
      phase: 'ready', acts: [act1] as any, manuscripts, works: [], onOpen: jest.fn(),
      onDeleteWriting: jest.fn().mockRejectedValue(new DeletionUnconfirmed('we could not confirm the original file', true)), onRetry: jest.fn(), onBack: jest.fn(),
    } as any)));
    await deleteBook();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('“Book”: we could not confirm the original file');
  });
});
