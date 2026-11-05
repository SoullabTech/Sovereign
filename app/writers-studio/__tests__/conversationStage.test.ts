/** @jest-environment jsdom */
import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/* Conversation Stage (founder R1 2026-11-04; authorized to build 2026-11-05):
   one wide conversation, the passage pinned above, options as turns, the box
   to answer MAIA always present. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let host: HTMLDivElement;
beforeEach(() => {
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: jest.fn() });
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

const option = { id: 'v1', author: 'maia' as const, wording: 'A quieter ending.', supersedes: null, rationale: null };
const turns = [
  { turnIndex: 0, speaker: 'author', body: 'Show me edit options for this passage.', at: 't0', adjunct: null },
  { turnIndex: 1, speaker: 'maia', body: 'What I’d preserve: the image.\nFriction I notice: the ending explains.\nWhat I’d try: end on the image.', at: 't1', adjunct: { kind: 'version', id: 'v1' } },
];
const thread = { threadId: 't1', chainId: 'c', locusText: 'A loud ending.', targetSectionId: 's1', sectionLabel: null,
  legacyLocus: false, turns, versions: [option], headVersionId: 'v1', application: null };

function render(extra: Record<string, unknown> = {}) {
  const props = {
    stage: true, manuscriptTitle: 'T', currentText: 'A loud ending.', sectionBody: 'A loud ending.',
    thread, version: option, lastMaiaTurn: turns[1], appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    onUseVersion: jest.fn(async () => true), onBackToPage: jest.fn(),
    ...extra,
  };
  act(() => root.render(React.createElement(EditorialDancePanel, props as any)));
  return props as any;
}
const q = (s: string) => host.querySelector<HTMLElement>(s);
const typeInto = (el: HTMLTextAreaElement, v: string) => act(() => {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});

test('the passage is pinned above one conversation, with a way back to the page', () => {
  const p = render();
  expect(q('[data-stage-passage]')!.textContent).toContain('A loud ending.');
  act(() => Array.from(q('[data-stage-passage]')!.querySelectorAll('button')).find((b) => b.textContent === 'Back to the page')!.click());
  expect(p.onBackToPage).toHaveBeenCalled();
});

test('an option arrives as a turn: MAIA speaks plainly, the wording follows with Use it · Change it · Talk about it', () => {
  render();
  const turn = q('[data-stage-thread] [data-stage-option="v1"]')!.closest('li')!;
  expect(turn.querySelector('p')!.textContent).toContain('the ending explains');
  expect(turn.querySelector('p')!.textContent).not.toContain('What I’d preserve');
  expect(Array.from(turn.querySelectorAll('.ws-stage-option-actions button')).map((b) => b.textContent))
    .toEqual(['Use it', 'Change it', 'Talk about it']);
});

test('Use it is the writer’s one act; it applies MAIA’s exact wording and nothing else', async () => {
  const p = render();
  await act(async () => { q('[data-stage-use]')!.click(); await Promise.resolve(); });
  expect(p.onUseVersion).toHaveBeenCalledTimes(1);
  expect(p.onUseVersion.mock.calls[0][0]).toMatchObject({ threadId: 't1', sectionId: 's1', text: 'A quieter ending.' });
  expect(p.onSend).not.toHaveBeenCalled();
});

test('Change it offers directions; choosing one asks MAIA for a new option, never mutating this one', () => {
  const p = render();
  act(() => q('[data-stage-change]')!.click());
  const lighter = Array.from(q('[data-stage-change-choices]')!.querySelectorAll('button')).find((b) => b.textContent === 'Lighter')!;
  act(() => lighter.click());
  expect(p.onSend).toHaveBeenCalledTimes(1);
  // Only the writer's words are stored; the act key carries how MAIA answers.
  expect(p.onSend).toHaveBeenCalledWith('Make it lighter.', { proposalPolicy: 'allow', proposalRequested: true, passageAct: 'option-lighter' });
  expect(p.onUseVersion).not.toHaveBeenCalled();
});

test('the box to answer MAIA is always there, and sends only the writer’s words', () => {
  const p = render();
  const box = q('[data-stage-composer] textarea') as HTMLTextAreaElement;
  typeInto(box, 'Keep the rhythm.');
  act(() => Array.from(q('[data-stage-composer]')!.querySelectorAll('button')).find((b) => b.textContent === 'Send')!.click());
  expect(p.onSend).toHaveBeenCalledWith('Keep the rhythm.', { turnShape: 'conversation' });
});

test('a reply-only turn is shown in the conversation', () => {
  const more = [...turns,
    { turnIndex: 2, speaker: 'author', body: 'Why?', at: 't2', adjunct: null },
    { turnIndex: 3, speaker: 'maia', body: 'Because the image already carries it.', at: 't3', adjunct: null }];
  render({ thread: { ...thread, turns: more }, lastMaiaTurn: more[3] });
  expect(q('[data-stage-thread]')!.textContent).toContain('Because the image already carries it.');
});

test('after Use this the earlier conversation stays reachable, with its Undo', () => {
  const earlier = { ...thread, threadId: 't0', application: { authorizationId: 'a', versionId: 'v1', resultingVersion: 2, undone: false, canUndo: true } };
  const p = render({ thread: { ...thread, threadId: 't2', turns: [], versions: [] }, version: null, lastMaiaTurn: null, earlierThread: earlier });
  const undo = q('.ws-stage-earlier-undo button')!;
  act(() => undo.click());
  expect(p.onUndo).toHaveBeenCalled();
});

test('an unanswered gate speaks in the conversation with its buttons; nothing is sent', () => {
  const p = render({ thread: null, version: null, lastMaiaTurn: null, sessionPosture: { resolved: false, sanctuary: false } });
  const gate = q('[data-stage-gate]')!;
  expect(Array.from(gate.querySelectorAll('button')).map((b) => b.textContent)).toEqual(expect.arrayContaining(['Ordinary', 'Sanctuary']));
  const box = q('[data-stage-composer] textarea') as HTMLTextAreaElement;
  typeInto(box, 'Hello');
  act(() => Array.from(q('[data-stage-composer]')!.querySelectorAll('button')).find((b) => b.textContent === 'Send')!.click());
  expect(p.onSend).not.toHaveBeenCalled();
  expect(gate.textContent).toContain('I’ll continue');
});

test('controller: a conversation held after Use this is never pulled back over the new one', () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8');
  expect(src).toContain('|| heldApplicationThread?.threadId === candidate.threadId) return;');
  expect(src).toContain('setHeldApplicationThread(previous);');
  expect(src).toContain(': heldApplicationThread ?? scopedEditorialThread;');
});

test('an edit turn reads as MAIA speaking, never label-stripped fragments', () => {
  // Local walk 2026-11-05: the turn read "cutting 'which was' and letting…".
  const fragTurns = [turns[0]!, { ...turns[1]!, body: 'What I’d preserve: the list.\nFriction I notice: "which was" is the softest phrase in the sentence.\nWhat I’d try: cutting "which was" so the verdict lands bare.' }];
  render({ thread: { ...thread, turns: fragTurns }, lastMaiaTurn: fragTurns[1] });
  const said = q('[data-stage-option="v1"]')!.closest('li')!.querySelector('p')!.textContent!;
  expect(said).toContain('I notice "which was" is the softest phrase');
  expect(said).toContain('I’d try cutting "which was"');
  expect(said).not.toMatch(/^cutting/m);
});

test('the change is visible in the text and named before the buttons', () => {
  render();
  const option = q('[data-stage-option="v1"]')!;
  expect(option.querySelector('[data-stage-change-count]')!.textContent).toMatch(/change/);
  expect(option.querySelectorAll('ins').length + option.querySelectorAll('del').length).toBeGreaterThan(0);
  const css = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-p4r1/p4r1-live.css'), 'utf8');
  const del = css.match(/\.ws-stage-option-words del\{[^}]*\}/)![0];
  expect(del).toMatch(/background/);   // a deletion is marked, not merely greyed
  expect(del).not.toMatch(/var\(--fr-muted\)/);
});
