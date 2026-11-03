/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/** Conversation-first Focus, step 2: Focus shows the conversation, not only MAIA's latest reply. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

const turns = [
  { turnIndex: 0, speaker: 'author', body: 'Let’s talk about what’s happening in this passage.', at: '2026-11-03T00:00:00Z' },
  { turnIndex: 1, speaker: 'maia', body: 'Is God tired here, or scolding? [[studio:editorial-pass]]', at: '2026-11-03T00:00:01Z' },
  { turnIndex: 2, speaker: 'author', body: 'Tired and affectionate.', at: '2026-11-03T00:00:02Z' },
  { turnIndex: 3, speaker: 'maia', body: 'Then the line already carries it.\n\n[[studio:develop-overview]]', at: '2026-11-03T00:00:03Z' },
] as const;

function render(extra: Record<string, unknown> = {}) {
  const thread = { threadId: 't1', chainId: 'c1', locusText: 'x', targetSectionId: null, sectionLabel: null, legacyLocus: false, turns, versions: [], headVersionId: null };
  const props = {
    manuscriptTitle: 'Threshold', currentText: 'Original words.', sectionBody: 'Original words.',
    thread, version: null, lastMaiaTurn: turns[3], appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    onStudioAction: jest.fn(),
    ...extra,
  };
  act(() => root.render(React.createElement(EditorialDancePanel, props as any)));
  return props;
}
const items = () => Array.from(container.querySelectorAll('[data-focus-conversation] > li'));

test('every turn is shown, oldest first, including the writer’s own words', () => {
  render();
  expect(items().map((li) => li.getAttribute('data-turn-speaker'))).toEqual(['author', 'maia', 'author', 'maia']);
  expect(items()[2]!.textContent).toContain('Tired and affectionate.');
  expect(items()[0]!.textContent).toContain('You');
  expect(items()[1]!.textContent).toContain('MAIA');
});

test('markers never show; only MAIA’s latest turn offers a control', () => {
  render();
  expect(container.textContent).not.toContain('[[studio:');
  const actions = container.querySelectorAll('[data-studio-action]');
  expect(actions.length).toBe(1);
  expect(actions[0]!.getAttribute('data-studio-action')).toBe('develop-overview');
  expect(items()[3]!.contains(actions[0]!)).toBe(true);
});

test('while MAIA is replying, the conversation stays and a status says so', () => {
  render({ busy: true });
  expect(items().length).toBe(4);
  expect(container.textContent).toContain('MAIA is with the passage…');
  expect(container.querySelector('[data-studio-action]')).toBeNull();
});

test('a long older writer turn is folded, not hidden or rewritten', () => {
  const long = 'Help me revise this exact passage. '.repeat(20);
  const t = [...turns.slice(0, 3), { ...turns[3] }];
  (t as any)[0] = { ...turns[0], body: long };
  render({ thread: { threadId: 't1', chainId: 'c1', locusText: 'x', targetSectionId: null, sectionLabel: null, legacyLocus: false, turns: t, versions: [], headVersionId: null } });
  const first = items()[0]!;
  expect(first.querySelector('details')).not.toBeNull();
  expect(first.querySelector('details > p')!.textContent).toBe(long);
});

test('with no turns yet, the empty room is unchanged (cards are the starters)', () => {
  render({ thread: null, lastMaiaTurn: null });
  expect(container.querySelector('[data-focus-conversation]')).toBeNull();
  expect(container.textContent).toContain('What would help you here?');
});
