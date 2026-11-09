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
async function mountWith(thread: any, onStudioPlace?: jest.Mock, onReadChapter?: jest.Mock) {
  mockThreadsOn.mockResolvedValue({ kind: 'threads', threads: [{ id: thread.id, openedAt: thread.openedAt, turnCount: thread.turns.length }] });
  mockLoadThread.mockResolvedValue(thread);
  await act(async () => {
    root.render(React.createElement(WorkConversation, {
      work: workA, manuscriptId: 'fictional-ms-a', sectionId: null, onClose: () => undefined, onStudioPlace, onReadChapter,
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

describe('G4: Read this chapter from the conversation', () => {
  afterEach(() => { try { localStorage.removeItem('maia_settings'); } catch { /* */ } });

  it('nothing is read until the writer clicks; the click reads through the named lens and asks MAIA nothing', async () => {
    const d = deferred<{ ok: true; label: string }>();
    const onReadChapter = jest.fn(() => d.promise);
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    await mountWith(maiaThread('t1', ['Want me to read it through its arc? [[studio:read-chapter:arc]]']), jest.fn(), onReadChapter);
    expect(onReadChapter).not.toHaveBeenCalled();
    const b = host.querySelector<HTMLButtonElement>('[data-studio-action="read-chapter"]')!;
    expect(b.textContent).toBe('Read this chapter');
    await act(async () => { b.click(); await flush(); });
    expect(onReadChapter).toHaveBeenCalledWith('arc');
    expect(host.querySelector('[data-chapter-reading="running"]')?.textContent).toContain('MAIA is reading the chapter');
    expect(b.disabled).toBe(true);
    await act(async () => { d.resolve({ ok: true, label: 'Return' }); await flush(); });
    expect(host.querySelector('[data-chapter-reading="done"]')?.textContent).toContain('MAIA has read Return. Ask her what she noticed.');
    expect(mockAsk).not.toHaveBeenCalled();
  });

  it('in Sanctuary the click reads nothing and says why', async () => {
    const onReadChapter = jest.fn();
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    await mountWith(maiaThread('t1', ['Shall I? [[studio:read-chapter]]']), jest.fn(), onReadChapter);
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="read-chapter"]')!.click(); await flush(); });
    expect(onReadChapter).not.toHaveBeenCalled();
    expect(host.querySelector('[data-chapter-reading="refused"]')?.textContent).toContain('Sanctuary is on');
  });

  it('a refused reading is said plainly', async () => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    const onReadChapter = jest.fn().mockResolvedValue({ ok: false, message: 'Open a chapter first, then ask MAIA to read it. Nothing was changed.' });
    await mountWith(maiaThread('t1', ['Shall I? [[studio:read-chapter]]']), jest.fn(), onReadChapter);
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="read-chapter"]')!.click(); await flush(); });
    expect(host.querySelector('[data-chapter-reading="refused"]')?.textContent).toContain('Open a chapter first');
  });

  it('where the room cannot read, the offer becomes the navigation to where the writer can — never a dead button', async () => {
    const onStudioPlace = jest.fn();
    await mountWith(maiaThread('t1', ['Shall I? [[studio:read-chapter:voice]]']), onStudioPlace);
    expect(host.querySelector('[data-studio-action="read-chapter"]')).toBeNull();
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="develop-overview"]')!.click(); await flush(); });
    expect(onStudioPlace).toHaveBeenCalledWith('develop-overview');
  });

  it('with neither handler, no button at all', async () => {
    await mountWith(maiaThread('t1', ['Shall I? [[studio:read-chapter]]']));
    expect(host.querySelector('[data-studio-action]')).toBeNull();
    expect(host.textContent).not.toContain('[[studio:');
  });
});

describe('Sanctuary exchange is visible (it was rendered inside the correction menu, so it never showed)', () => {
  afterEach(() => { try { localStorage.removeItem('maia_settings'); } catch { /* */ } });
  it('shows the not-kept exchange in the conversation, outside any menu', async () => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: null, thread: null, staleness: 'current', sanctuary: { notKept: true, question: 'Is Dana too exposed?', answer: 'Perhaps. What does the reader need?' } });
    await mount(workA, 'fictional-ms-a');
    type('Is Dana too exposed?');
    await act(async () => { enter(); await flush(); });
    const shown = host.querySelector('[data-sanctuary-turns="true"]');
    expect(shown?.textContent).toContain('this exchange is not kept');
    expect(shown?.textContent).toContain('Perhaps. What does the reader need?');
    expect(shown?.closest('select')).toBeNull();
  });
});

describe('a not-kept exchange does not follow the writer into another conversation', () => {
  afterEach(() => { try { localStorage.removeItem('maia_settings'); } catch { /* */ } });
  it('Start a new conversation clears it', async () => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    await mountWith(maiaThread('t1', ['Fresh start? [[studio:new-conversation]]']), jest.fn());
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 't1', thread: maiaThread('t1', ['Fresh start? [[studio:new-conversation]]']), staleness: 'current', sanctuary: { notKept: true, question: 'private q', answer: 'private a' } });
    type('private q');
    await act(async () => { enter(); await flush(); });
    expect(host.textContent).toContain('private a');
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="new-conversation"]')!.click(); await flush(); });
    expect(host.textContent).not.toContain('private a');
  });
});

describe('G4 isolation: async results never land in the wrong conversation', () => {
  afterEach(() => { try { localStorage.removeItem('maia_settings'); } catch { /* */ } });

  it('a reading that finishes after the writer started a new conversation does not reappear there', async () => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    const d = deferred<{ ok: true; label: string }>();
    await mountWith(maiaThread('t1', ['Shall I? [[studio:read-chapter]]']), jest.fn(), jest.fn(() => d.promise));
    await act(async () => { host.querySelector<HTMLButtonElement>('[data-studio-action="read-chapter"]')!.click(); await flush(); });
    expect(host.querySelector('[data-chapter-reading="running"]')).not.toBeNull();
    // the latest reply still offers a fresh start; it is not blocked by a running reading
    await act(async () => { startFreshButton().click(); await flush(); });
    expect(host.querySelector('[data-chapter-reading]')).toBeNull();
    await act(async () => { d.resolve({ ok: true, label: 'Return' }); await flush(); });
    expect(host.querySelector('[data-chapter-reading]')).toBeNull();
  });

  it('switching Sanctuary off mid-conversation keeps the not-kept exchange in its place in time', async () => {
    const first = maiaThread('t1', ['First kept answer.']);
    await mountWith(first, jest.fn());
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 't1', thread: first, staleness: 'current', sanctuary: { notKept: true, question: 'private q', answer: 'private a' } });
    type('private q');
    await act(async () => { enter(); await flush(); });
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 't1', thread: maiaThread('t1', ['First kept answer.', 'Second kept answer.']), staleness: 'current' });
    type('ordinary q');
    await act(async () => { enter(); await flush(); });
    const firstAnswer = host.querySelector('[data-turn="1"]')!;
    const privateTurn = host.querySelector('[data-sanctuary-turn="2"]')!;
    const laterKept = host.querySelector('[data-turn="3"]')!;
    expect(privateTurn.textContent).toContain('private a');
    expect(firstAnswer.compareDocumentPosition(privateTurn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(privateTurn.compareDocumentPosition(laterKept) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('a not-kept exchange is cleared the moment another conversation is adopted, not when it finishes loading', async () => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    await mountWith(maiaThread('t1', ['Kept answer.']), jest.fn());
    mockAsk.mockResolvedValueOnce({ ok: true, threadId: 't1', thread: maiaThread('t1', ['Kept answer.']), staleness: 'current', sanctuary: { notKept: true, question: 'private q', answer: 'private a' } });
    type('private q');
    await act(async () => { enter(); await flush(); });
    expect(host.textContent).toContain('private a');
    // a refusal that names another conversation adopts it; its load is slow
    const slow = deferred<any>();
    mockLoadThread.mockImplementationOnce(() => slow.promise);
    mockAsk.mockResolvedValueOnce({ ok: false, refusal: 'unreachable', threadId: 't2' });
    type('another q');
    await act(async () => { enter(); await flush(); });
    expect(host.textContent).not.toContain('private a');
    await act(async () => { slow.resolve(maiaThread('t2', ['Other.'])); await flush(); });
    expect(host.textContent).not.toContain('private a');
  });
});

function startFreshButton(): HTMLButtonElement {
  const b = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((x) => /new conversation/i.test(x.textContent ?? ''));
  expect(b).toBeDefined();
  return b!;
}
