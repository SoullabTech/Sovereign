/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/* R2 "MAIA opens" (O1(a)) — client laws. The opening is asked for ONLY by the room's
   deliberate gesture (autoOpenWithMaia), once, after both gates are answered. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let host: HTMLDivElement;
beforeEach(() => {
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: jest.fn() });
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const emptyThread = { threadId: 't1', chainId: 'c', locusText: 'A loud ending.', targetSectionId: 's1', sectionLabel: null,
  legacyLocus: false, turns: [] as any[], versions: [], headVersionId: null, application: null };
const openingTurn = { turnIndex: 0, speaker: 'maia', body: 'I notice the ending explains itself. What are you after here?', at: 't0', adjunct: null };

function render(extra: Record<string, unknown> = {}) {
  const props = {
    stage: true, manuscriptTitle: 'T', currentText: 'A loud ending.', sectionBody: 'A loud ending.',
    thread: emptyThread, version: null, lastMaiaTurn: null, appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    onUseVersion: jest.fn(async () => true), onBackToPage: jest.fn(), onOpenWithMaia: jest.fn(),
    ...extra,
  };
  act(() => root.render(React.createElement(EditorialDancePanel, props as any)));
  return props as any;
}
const q = (s: string) => host.querySelector<HTMLElement>(s);

test('no opening on selection or mount: without the room gesture nothing is asked of MAIA', () => {
  const p = render();                       // side panel / selection: autoOpenWithMaia not set
  render({ onOpenWithMaia: p.onOpenWithMaia });
  expect(p.onOpenWithMaia).not.toHaveBeenCalled();
  expect(q('[data-stage-opening]')).not.toBeNull();       // the fixed line stays
});

test('the room gesture opens exactly once, however many times it re-renders (ref guard)', () => {
  const p = render({ autoOpenWithMaia: true });
  for (let i = 0; i < 4; i += 1) render({ autoOpenWithMaia: true, onOpenWithMaia: p.onOpenWithMaia, message: 'tick ' + i });
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(1);
  expect(q('[data-stage-opening-pending]')!.textContent).toContain('MAIA is reading');
  expect(q('[data-stage-opening]')).toBeNull();
});

test('a busy cycle that leaves the thread empty and unannounced does not re-open (ref guard, not prop stability)', () => {
  const p = render({ autoOpenWithMaia: true });
  render({ autoOpenWithMaia: true, onOpenWithMaia: p.onOpenWithMaia, busy: true });
  render({ autoOpenWithMaia: true, onOpenWithMaia: p.onOpenWithMaia, busy: false });
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(1);
});

test('no opening while the posture gate is open; it fires once when the writer answers', () => {
  const p = render({ autoOpenWithMaia: true, sessionPosture: { resolved: false, sanctuary: false } });
  expect(p.onOpenWithMaia).not.toHaveBeenCalled();
  render({ autoOpenWithMaia: true, onOpenWithMaia: p.onOpenWithMaia, sessionPosture: { resolved: true, sanctuary: false } });
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(1);
});

test('no opening under Sanctuary', () => {
  const p = render({ autoOpenWithMaia: true, sessionPosture: { resolved: true, sanctuary: true } });
  expect(p.onOpenWithMaia).not.toHaveBeenCalled();
});

test('no opening while the MAIA-relationship gate is open', () => {
  const p = render({ autoOpenWithMaia: true, maiaRelationship: { active: false, busy: false, choices: [], message: null, onBegin: jest.fn(), onChoose: jest.fn() } });
  expect(p.onOpenWithMaia).not.toHaveBeenCalled();
});

test('no opening into a conversation that already has turns, or while a request is in flight', () => {
  const a = render({ autoOpenWithMaia: true, thread: { ...emptyThread, turns: [openingTurn] } });
  expect(a.onOpenWithMaia).not.toHaveBeenCalled();
  const b = render({ autoOpenWithMaia: true, thread: emptyThread, busy: true });
  expect(b.onOpenWithMaia).not.toHaveBeenCalled();
});

test('a failed opening says so plainly, keeps the fixed line, never retries by itself, and Try again asks once more', () => {
  const p = render({ autoOpenWithMaia: true });
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(1);
  render({ autoOpenWithMaia: true, onOpenWithMaia: p.onOpenWithMaia, openingFailure: 'MAIA couldn’t start this conversation just now. Nothing was changed.' });
  expect(q('[data-stage-opening-failure]')!.textContent).toContain('Nothing was changed');
  expect(q('[data-stage-opening]')!.textContent).toContain('I’m here with this passage');
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(1);
  act(() => q('[data-stage-opening-retry]')!.click());
  expect(p.onOpenWithMaia).toHaveBeenCalledTimes(2);
});

test('a MAIA turn with no writer turn before it renders, and the three starting chips stay under it', () => {
  render({ autoOpenWithMaia: true, thread: { ...emptyThread, turns: [openingTurn] } });
  const turn = q('[data-stage-thread] [data-turn-speaker="maia"]')!;
  expect(turn.textContent).toContain('What are you after here?');
  expect(host.querySelector('[data-turn-speaker="author"]')).toBeNull();
  expect(Array.from(q('[data-stage-chips]')!.querySelectorAll('button')).map((b) => b.textContent))
    .toEqual(['Talk about what’s happening', 'Show me an edit', 'Teach me the craft here']);
});
