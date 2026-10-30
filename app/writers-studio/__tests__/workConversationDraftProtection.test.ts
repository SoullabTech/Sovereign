/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
const mockAsk = jest.fn(), mockLoadThread = jest.fn(), mockThreads = jest.fn(), mockClose = jest.fn();
const mockKeeps = [{ id: 'keep-a', sectionHeading: 'Rain', verbatimText: 'A fictional kept passage.' }];
jest.mock('@/app/writers-studio/useMemberIdentity', () => ({
  useMemberIdentity: () => ({ phase: 'ready', memberId: 'fictional-member' }),
}));
jest.mock('@/app/writers-studio/useManuscriptKeeps', () => ({ useManuscriptKeeps: () => ({ keeps: mockKeeps }) }));
jest.mock('@/lib/writersStudio/askClient', () => ({
  ask: (...args: unknown[]) => mockAsk(...args),
  askLivingWork: (...args: unknown[]) => mockAsk(...args),
  loadThread: (...args: unknown[]) => mockLoadThread(...args),
  loadLivingWorkAskThread: (...args: unknown[]) => mockLoadThread(...args),
  threadsOn: (...args: unknown[]) => mockThreads(...args),
  threadsOnLivingWorkAsk: (...args: unknown[]) => mockThreads(...args),
}));
jest.mock('@/lib/writersStudio/writerCorrectionsClient', () => ({ createWriterCorrection: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => React.createElement('a', props, children),
}));
import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';
import { requestConversationDeparture } from '@/lib/writersStudio/conversationDeparture';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const work = { id: 'fictional-work', title: 'Window and Rain' } as LivingWork;
const response = { ok: true, threadId: 'thread-a', thread: {
  id: 'thread-a', anchor: {on:'work'}, openedAt: '2026-10-29T20:00:00Z',
  turns: [{ index: 0, speaker: 'author', body: 'My question', staleness: 'current' }],
}};
beforeEach(() => {
  jest.clearAllMocks();
  mockThreads.mockResolvedValue({ kind: 'threads', threads: [] });
  mockLoadThread.mockResolvedValue(response.thread);
  mockAsk.mockResolvedValue(response);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: jest.fn() });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); jest.restoreAllMocks(); });
async function mount(initialDraft = '', manuscriptId: string | null = 'fictional-manuscript') {
  await act(async () => { root.render(React.createElement(WorkConversation, {
    work, manuscriptId, sectionId: 'section-a', initialDraft, onClose: mockClose,
  })); });
}
const input = () => host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message MAIA"]')!;
const button = (label: string) => Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
  .find((node) => node.textContent?.trim() === label)!;
async function click(label: string) { await act(async () => button(label).click()); }
async function type(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input(), value);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const promptStart = 'Help me reorient before we do anything else.';
it('puts a reorientation prompt in an empty composer without sending it', async () => {
  await mount(); await click('Where are we?');
  expect(input().value.startsWith(promptStart)).toBe(true);
  expect(host.querySelector('[data-reorientation-confirm]')).toBeNull();
  expect(mockAsk).not.toHaveBeenCalled();
});
it('keeps every character of an existing multiline draft when offering or declining reorientation', async () => {
  const draft = '  I have my own question.\nKeep this second line.\n ';
  await mount(draft); await click('Where are we?');
  expect(input().value).toBe(draft);
  expect(host.querySelector('[data-reorientation-confirm]')).not.toBeNull();
  await click('Keep my draft');
  expect(input().value).toBe(draft);
  expect(host.querySelector('[data-reorientation-confirm]')).toBeNull();
  expect(mockAsk).not.toHaveBeenCalled();
});
it('adds a prompt only after the author chooses it, using the newest draft and never duplicating it', async () => {
  await mount('First question'); await click('Where are we?');
  const revised = 'Revised question\nwith deliberate spacing.  ';
  await type(revised); await click('Add to my draft');
  const appended = input().value;
  expect(appended.startsWith(revised + '\n\n' + promptStart)).toBe(true);
  await click('Where are we?');
  expect(input().value).toBe(appended);
  expect(host.querySelector('[data-reorientation-confirm]')).toBeNull();
  expect(mockAsk).not.toHaveBeenCalled();
});
it('Focus and an explicitly selected Keep preserve the authored draft and do not send it', async () => {
  await mount('My two lines\nstay together.'); await click('Focus');
  expect(input().value).toBe('My two lines\nstay together.');
  await click('Keeps 1');
  await act(async () => host.querySelector<HTMLButtonElement>('[data-keeps-chooser] button')!.click());
  expect(input().value).toBe('From Rain:\n\n“A fictional kept passage.”\n\nMy two lines\nstay together.');
  expect(mockAsk).not.toHaveBeenCalled();
});
it('cancelling panel close keeps the draft; an explicit discard can close it', async () => {
  await mount('Do not lose this.');
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  const close = host.querySelector<HTMLButtonElement>('[data-close-conversation]')!;
  await act(async () => close.click());
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('unsent text'));
  expect(mockClose).not.toHaveBeenCalled(); expect(input().value).toBe('Do not lose this.');
  confirm.mockReturnValue(true); await act(async () => close.click());
  expect(mockClose).toHaveBeenCalledTimes(1);
});
it('protects Studio departures and reload while text is unsent, and removes the guard when empty', async () => {
  await mount('Still writing');
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  expect(requestConversationDeparture()).toBe(false);
  const unload = new Event('beforeunload', { cancelable: true });
  expect(window.dispatchEvent(unload)).toBe(false); expect(unload.defaultPrevented).toBe(true);
  expect(input().value).toBe('Still writing'); await type(''); confirm.mockClear();
  expect(requestConversationDeparture()).toBe(true); expect(confirm).not.toHaveBeenCalled();
  expect(window.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(true);
});
it('cancels Open in MAIA when the author keeps the unsent draft', async () => {
  await mount('Keep this question here'); jest.spyOn(window, 'confirm').mockReturnValue(false);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  await act(async () => host.querySelector('[data-open-in-maia]')!.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true); expect(input().value).toBe('Keep this question here');
});
it('retains the exact draft after a transport refusal instead of clearing it before the result', async () => {
  const draft = '  My question\nwith a second line.  ';
  mockAsk.mockResolvedValue({ ok: false, refusal: 'unreachable' });
  await mount(draft); await click('Send');
  expect(mockAsk).toHaveBeenCalledWith({ manuscriptId: 'fictional-manuscript', question: draft.trim(),
    anchor: { on: 'work' }, sectionId: 'section-a' });
  expect(input().value).toBe(draft); expect(host.textContent).toContain('That didn’t reach her');
});
it('retains the draft if the server records a thread but cannot produce an answer', async () => {
  mockAsk.mockResolvedValue({ ok: false, refusal: 'unreachable', threadId: 'thread-a' });
  await mount('Question to retry deliberately'); await click('Send');
  expect(mockLoadThread).toHaveBeenCalledWith('fictional-manuscript', 'thread-a');
  expect(input().value).toBe('Question to retry deliberately'); expect(mockAsk).toHaveBeenCalledTimes(1);
});
it('clears only a successfully confirmed submitted draft', async () => {
  await mount('My question'); await click('Send'); expect(input().value).toBe('');
  expect(host.querySelector('[data-turn="0"]')?.textContent).toContain('My question');
  expect(mockAsk).toHaveBeenCalledTimes(1);
});
it('does not clear text authored while a previous request is in flight', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('First submitted question'); await click('Send');
  expect(input().value).toBe('First submitted question');
  await type('A new question\nwritten while waiting.'); await act(async () => resolve(response));
  expect(input().value).toBe('A new question\nwritten while waiting.'); expect(mockAsk).toHaveBeenCalledTimes(1);
});
it('still blocks sends when discovery cannot establish the conversation', async () => {
  mockThreads.mockResolvedValue({ kind: 'unavailable', reason: 'unreachable' });
  await mount('My unconfirmed draft');
  expect(button('Send').disabled).toBe(true);
  await click('Where are we?'); expect(input().value).toBe('My unconfirmed draft');
  expect(mockAsk).not.toHaveBeenCalled();
});

it('keeps unsent text when only the section changes, without changing thread discovery', async () => {
  await mount('Draft for this Work');
  const before = mockThreads.mock.calls.length;
  await act(async () => root.render(React.createElement(WorkConversation, {
    work, manuscriptId: 'fictional-manuscript', sectionId: 'section-b',
    initialDraft: 'A different suggested starter', onClose: mockClose,
  })));
  expect(input().value).toBe('Draft for this Work');
  expect(mockThreads).toHaveBeenCalledTimes(before);
});
it('does not carry a draft or late response into a different Work', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('Question for the first Work');
  await click('Send');
  await act(async () => root.render(React.createElement(WorkConversation, {
    work: { ...work, id: 'other-fictional-work', title: 'The Garden' },
    manuscriptId: 'other-fictional-manuscript', sectionId: 'other-section',
    initialDraft: 'Question for the other Work', onClose: mockClose,
  })));
  expect(input().value).toBe('Question for the other Work');
  await act(async () => resolve(response));
  expect(input().value).toBe('Question for the other Work');
  expect(host.querySelector('[data-turn="0"]')).toBeNull();
});


it('preserves an identically retyped question after edits during a pending manuscript send', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('First question'); await click('Send');
  await type('Different draft'); await type('First question');
  await act(async () => resolve(response));
  expect(input().value).toBe('First question');
  expect(mockAsk).toHaveBeenCalledTimes(1);
});

it('preserves identical retyping after an in-flight Living Work send', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('Question before a manuscript', null); await click('Send');
  expect(mockAsk).toHaveBeenCalledWith({
    workId: 'fictional-work', question: 'Question before a manuscript'
  });
  await type('Other question'); await type('Question before a manuscript');
  await act(async () => resolve(response));
  expect(input().value).toBe('Question before a manuscript');
  expect(mockAsk).toHaveBeenCalledTimes(1);
});

it('synchronously rejects duplicate Send events before React can rerender', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('Only one pending request');
  await act(async () => { button('Send').click(); button('Send').click(); });
  expect(mockAsk).toHaveBeenCalledTimes(1);
  expect(input().value).toBe('Only one pending request');
  await act(async () => resolve(response));
});

it('retains text on a thrown transport error and allows an explicitly chosen retry', async () => {
  mockAsk.mockRejectedValueOnce(new Error('fictional transport failure')).mockResolvedValueOnce(response);
  await mount('My exact retry text');
  await click('Send');
  expect(input().value).toBe('My exact retry text');
  expect(host.textContent).toContain('That didn’t reach her');
  expect(mockAsk).toHaveBeenCalledTimes(1);
  await click('Send');
  expect(mockAsk).toHaveBeenCalledTimes(2);
  expect(input().value).toBe('');
});

it('does not overwrite a draft newly composed by choosing a Keep during a pending send', async () => {
  let resolve!: (value: typeof response) => void;
  mockAsk.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await mount('Question already sent'); await click('Send');
  await click('Keeps 1');
  await act(async () => host.querySelector<HTMLButtonElement>('[data-keeps-chooser] button')!.click());
  const newDraft = input().value;
  expect(newDraft).toContain('From Rain:');
  await act(async () => resolve(response));
  expect(input().value).toBe(newDraft);
});
