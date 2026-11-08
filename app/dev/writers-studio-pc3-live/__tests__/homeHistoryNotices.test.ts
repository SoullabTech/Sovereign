/**
 * The REAL Home view hands its notice stack to History: a custody alert raised while the member is on History is still on screen
 * after "Back to Home", and an outcome that arrives after they have gone back is still delivered.
 *
 * historyContainerAndNotices.test.ts proves the page and container against a stand-in parent. This file proves the wiring in the real
 * parent (P4R1HomeView passing its stack to P4R1HistoryContainer), which nothing else exercises: without the hand-over History quietly
 * falls back to a private stack and the alert is lost at Back, with every other test still green.
 *
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ work }: { work: React.ReactNode }) => React.createElement('main', { 'data-test-shell': '' }, work),
}));
jest.mock('@/app/writers-studio/useWorkVisual', () => ({ useWorkVisual: () => ({ src: null }) }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/writers-studio/useStudioHistory', () => ({ useStudioHistory: jest.fn() }));

import P4R1HomeView from '@/app/dev/writers-studio-pc3-live/P4R1HomeView';
import { useStudioHistory } from '@/app/writers-studio/useStudioHistory';
import { DeletionUnconfirmed } from '@/lib/writersStudio/deleteWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const hook = useStudioHistory as unknown as jest.Mock;
const act1 = { id: '1', kind: 'version_kept', at: '2026-09-07T18:00:00.000Z', workTitle: null, manuscriptTitle: 'Loose Book', manuscriptId: 'loose-1', detail: '2', note: null };
const looseManuscript = {
  id: 'loose-1', title: 'Loose Book', createdAt: '2026-10-01T00:00:00Z', sectionCount: 1, charCount: 30, keepCount: 0, draftCharCount: 30,
  hasDraftWriting: true, hasWriting: true, hasCurrentMemberContribution: true, lastMemberDraftActivityAt: '2026-10-02T00:00:00Z',
};
const orient = { kind: 'orient', resume: null, alsoWritten: [], shelf: [], feature: null, imported: [] };
const onDeleteWriting = jest.fn();
const baseProps = {
  appearance: 'night', arrival: orient, works: [], manuscripts: [looseManuscript],
  resumeActivity: null, returnWork: null, returnActivity: null,
  markedLines: [], historyActs: [act1], busy: false, error: null, pendingMode: null,
  onMode: jest.fn(), onChooseManuscript: jest.fn(), onBegin: jest.fn(), onOpen: jest.fn(),
  onMakeWork: jest.fn(), onAddToWork: jest.fn(), onStartWriting: jest.fn(), onImport: jest.fn(), onSources: jest.fn(),
  onDeleteWriting, onDeleteWork: jest.fn(), onRemoveWork: jest.fn(),
};

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  jest.clearAllMocks();
  onDeleteWriting.mockReset();
  hook.mockReturnValue({ phase: 'ready', acts: [act1], reload: jest.fn().mockResolvedValue(true) });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(React.createElement(P4R1HomeView, baseProps as any)));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const button = (label: string) => Array.from(host.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
const click = async (label: string) => {
  const target = button(label);
  expect({ label, found: Boolean(target) }).toEqual({ label, found: true });
  await act(async () => { target!.click(); });
};
const openHistoryAndStartDeleting = async () => {
  await click('See all history');
  expect(host.querySelector('.p4r1-history-page')).not.toBeNull();
  await click('Delete');
};
const CUSTODY = 'This writing was deleted from your studio, but we could not confirm that its original file has been destroyed. Until we can, we are not going to tell you it is gone.';

describe('Home gives History its notice stack', () => {
  it('a custody alert raised on History is still on screen after Back to Home', async () => {
    onDeleteWriting.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
    await openHistoryAndStartDeleting();
    await click('Delete permanently');
    expect(host.querySelector('.p4r1-history-page [role="alert"]')?.textContent).toContain('“Loose Book”: This writing was deleted from your studio');
    await click('← Back to Home');
    expect(host.querySelector('.p4r1-history-page')).toBeNull();
    const alert = host.querySelector('[data-delete-notices] [role="alert"]');
    expect(alert?.textContent).toContain('“Loose Book”: This writing was deleted from your studio');
  });

  it('the outcome of a deletion still in flight when the member goes back is delivered to Home', async () => {
    let fail: (error: Error) => void = () => undefined;
    onDeleteWriting.mockReturnValue(new Promise<never>((_, reject) => { fail = reject; }));
    await openHistoryAndStartDeleting();
    await click('Delete permanently');
    await click('← Back to Home');                                                         // the request has not answered yet
    expect(host.querySelector('[data-delete-notices]')).toBeNull();
    await act(async () => { fail(new DeletionUnconfirmed(CUSTODY, true)); });
    expect(host.querySelector('[data-delete-notices] [role="alert"]')?.textContent).toContain('“Loose Book”: This writing was deleted from your studio');
  });

  it('the notice is dismissed once, wherever it is read: dismissing it on Home leaves no copy behind on History', async () => {
    onDeleteWriting.mockRejectedValue(new DeletionUnconfirmed(CUSTODY, true));
    await openHistoryAndStartDeleting();
    await click('Delete permanently');
    await click('← Back to Home');
    await click('Dismiss');
    expect(host.querySelector('[data-delete-notices]')).toBeNull();
    await click('See all history');
    expect(host.querySelector('.p4r1-history-page [data-delete-notice]')).toBeNull();
  });
});
