/**
 * Draft and thread custody in WorkConversation (#1800): double submit, a Work
 * change while the same instance stays mounted, and a reply that lands after
 * the Work changed. Real component; ask client, identity and keeps are
 * fictional doubles. Component-level only: not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockAsk = jest.fn();
const mockThreadsOn = jest.fn();
const mockLoadThread = jest.fn();

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => React.createElement('a', null, children),
}));
jest.mock('@/lib/writersStudio/askClient', () => ({
  ask: (...a: unknown[]) => mockAsk(...a),
  askLivingWork: (...a: unknown[]) => mockAsk(...a),
  loadThread: (...a: unknown[]) => mockLoadThread(...a),
  loadLivingWorkAskThread: (...a: unknown[]) => mockLoadThread(...a),
  threadsOn: (...a: unknown[]) => mockThreadsOn(...a),
  threadsOnLivingWorkAsk: (...a: unknown[]) => mockThreadsOn(...a),
}));
jest.mock('@/app/writers-studio/useMemberIdentity', () => ({
  useMemberIdentity: () => ({ phase: 'ready', memberId: 'fictional-member', name: 'Fictional' }),
}));
jest.mock('@/app/writers-studio/useManuscriptKeeps', () => ({ useManuscriptKeeps: () => ({ keeps: [] }) }));
jest.mock('@/lib/writersStudio/writerCorrectionsClient', () => ({ createWriterCorrection: jest.fn() }));

import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no layout; the component scrolls the thread into view.
(Element.prototype as any).scrollIntoView = () => undefined;

const workA = { id: 'fictional-work-a', title: 'Fictional A' } as any;
const workB = { id: 'fictional-work-b', title: 'Fictional B' } as any;

function threadView(id: string, answer: string) {
  return {
    id, anchor: { on: 'work' }, openedAt: '2026-10-30T00:00:00Z',
    turns: [
      { index: 0, speaker: 'author', body: 'question', staleness: 'current' },
      { index: 1, speaker: 'maia', body: answer, staleness: 'current' },
    ],
  };
}
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

let host: HTMLDivElement;
let root: Root;

async function flush() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
async function mount(work: any, manuscriptId: string) {
  await act(async () => {
    root.render(React.createElement(WorkConversation, {
      work, manuscriptId, sectionId: null, onClose: () => undefined,
    }));
    await flush();
  });
}
function composer() {
  const el = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message MAIA"]');
  expect(el).not.toBeNull();
  return el!;
}
function type(text: string) {
  const el = composer();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function enter() {
  composer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

beforeEach(() => {
  mockAsk.mockReset();
  mockThreadsOn.mockReset();
  mockLoadThread.mockReset();
  mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [] });
  mockLoadThread.mockResolvedValue(null);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

describe('WorkConversation draft and thread custody', () => {
  it('a double Enter in the same tick sends once', async () => {
    const reply = deferred<any>();
    mockAsk.mockReturnValue(reply.promise);
    await mount(workA, 'fictional-ms-a');
    type('Fictional question');
    await act(async () => { enter(); enter(); await flush(); });
    expect(mockAsk).toHaveBeenCalledTimes(1);
    await act(async () => {
      reply.resolve({ ok: true, threadId: 'thread-a', thread: threadView('thread-a', 'answer A'), staleness: 'current' });
      await flush();
    });
  });

  it("after a Work change, the next question does not continue the previous Work's thread", async () => {
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 'thread-a', thread: threadView('thread-a', 'answer A'), staleness: 'current' });
    await mount(workA, 'fictional-ms-a');
    type('First fictional question');
    await act(async () => { enter(); await flush(); });
    expect(host.textContent).toContain('answer A');

    await mount(workB, 'fictional-ms-b');
    expect(host.textContent).not.toContain('answer A');
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 'thread-b', thread: threadView('thread-b', 'answer B'), staleness: 'current' });
    type('Second fictional question');
    await act(async () => { enter(); await flush(); });
    expect(mockAsk).toHaveBeenCalledTimes(2);
    const second = mockAsk.mock.calls[1][0];
    expect(second.manuscriptId).toBe('fictional-ms-b');
    expect(second.threadId).toBeUndefined();
  });

  it('a reply that lands after the Work changed does not enter the new Work or clear its draft', async () => {
    const reply = deferred<any>();
    mockAsk.mockReturnValueOnce(reply.promise);
    await mount(workA, 'fictional-ms-a');
    type('Fictional question for A');
    await act(async () => { enter(); await flush(); });

    await mount(workB, 'fictional-ms-b');
    type('Fictional question for A');
    await act(async () => {
      reply.resolve({ ok: true, threadId: 'thread-a', thread: threadView('thread-a', 'late answer A'), staleness: 'current' });
      await flush();
    });
    expect(host.textContent).not.toContain('late answer A');
    expect(composer().value).toBe('Fictional question for A');

    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 'thread-b', thread: threadView('thread-b', 'answer B'), staleness: 'current' });
    await act(async () => { enter(); await flush(); });
    expect(mockAsk.mock.calls[1][0].threadId).toBeUndefined();
  });
});
