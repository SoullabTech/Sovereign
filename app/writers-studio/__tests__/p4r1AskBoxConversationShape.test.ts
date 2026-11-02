/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';
import { CONVERSATION_TURN_SHAPE } from '@/lib/writersStudio/conversationTurn';

/** Design 3C: what a typed question in Passage Focus actually sends. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

function renderEmpty(onSend: jest.Mock) {
  act(() => root.render(React.createElement(EditorialDancePanel, {
    manuscriptTitle: 'Threshold', currentText: 'Original words.', sectionBody: 'Before.\n\nOriginal words.\n\nAfter.',
    thread: null, version: null, lastMaiaTurn: null, appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend, onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
  } as any)));
}

function ask(text: string) {
  const box = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="What do you want to do with this passage?"]')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
  act(() => { setter.call(box, text); box.dispatchEvent(new Event('input', { bubbles: true })); });
  const button = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Ask MAIA')!;
  act(() => button.click());
}

test('a typed question goes with the writer’s words and the conversational shape', () => {
  const onSend = jest.fn();
  renderEmpty(onSend);
  ask('Give me everything you notice about the rhythm.');
  expect(onSend).toHaveBeenCalledTimes(1);
  const sent: string = onSend.mock.calls[0][0];
  expect(sent).toContain('Give me everything you notice about the rhythm.');
  for (const line of CONVERSATION_TURN_SHAPE) expect(sent).toContain(line);
  expect(sent).toContain('Do not change or apply anything unless I later choose a revision');
});

test('a card does not get the free-box shape', () => {
  const onSend = jest.fn();
  renderEmpty(onSend);
  act(() => Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Give me ideas'))!.click());
  expect(onSend.mock.calls.at(-1)?.[0]).not.toContain(CONVERSATION_TURN_SHAPE[0]);
});
