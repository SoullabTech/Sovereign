/**
 * Design 1B in the Work conversation: MAIA's latest reply may offer one control;
 * markers never show; places need a navigation handler; nothing is sent.
 * Real component; ask client, identity and keeps are fictional doubles.
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



function maiaThread(id: string, replies: string[]) {
  const turns: any[] = [];
  replies.forEach((r, i) => {
    turns.push({ index: i * 2, speaker: 'author', body: 'q', staleness: 'current' });
    turns.push({ index: i * 2 + 1, speaker: 'maia', body: r, staleness: 'current' });
  });
  return { id, anchor: { on: 'work' }, openedAt: '2026-10-30T00:00:00Z', turns };
}
async function mountWith(thread: any, onStudioPlace?: jest.Mock) {
  mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [{ id: thread.id, openedAt: thread.openedAt, turnCount: thread.turns.length }] });
  mockLoadThread.mockResolvedValue(thread);
  await act(async () => {
    root.render(React.createElement(WorkConversation, {
      work: workA, manuscriptId: 'fictional-ms-a', sectionId: null, onClose: () => undefined, onStudioPlace,
    } as any));
    await flush();
  });
}

describe('Work conversation: offered controls (Design 1B)', () => {
  it('a Develop place shows as a button and only navigates', async () => {
    const onStudioPlace = jest.fn();
    await mountWith(maiaThread('t1', ['Go read it whole.\n\n[[studio:develop-overview]]']), onStudioPlace);
    expect(host.textContent).not.toContain('[[studio:');
    const b = host.querySelector<HTMLButtonElement>('[data-studio-action="develop-overview"]')!;
    await act(async () => { b.click(); await flush(); });
    expect(onStudioPlace).toHaveBeenCalledWith('develop-overview');
    expect(mockAsk).not.toHaveBeenCalled();
  });

  it('only the latest MAIA reply offers a control; older markers are stripped', async () => {
    await mountWith(maiaThread('t1', ['Old [[studio:editorial-pass]]', 'New [[studio:develop-overview]]']), jest.fn());
    expect(host.querySelectorAll('[data-studio-action]').length).toBe(1);
    expect(host.querySelector('[data-studio-action="develop-overview"]')).not.toBeNull();
    expect(host.textContent).not.toContain('[[studio:');
  });

  it('a place with no navigation handler shows no button', async () => {
    await mountWith(maiaThread('t1', ['Go read it whole. [[studio:develop-overview]]']));
    expect(host.querySelector('[data-studio-action]')).toBeNull();
  });

  it('Craftsman’s Table is never offered here', async () => {
    await mountWith(maiaThread('t1', ['Use the table. [[studio:craftsmans-table]]']), jest.fn());
    expect(host.querySelector('[data-studio-action]')).toBeNull();
    expect(host.textContent).not.toContain('[[studio:');
  });

  it('Start a new conversation works in place, opening the next question as a new thread', async () => {
    await mountWith(maiaThread('t1', ['Fresh start? [[studio:new-conversation]]']), jest.fn());
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="new-conversation"]')!.click(); await flush(); });
    expect(composer().getAttribute('data-send-mode')).toBe('open');
  });
});
