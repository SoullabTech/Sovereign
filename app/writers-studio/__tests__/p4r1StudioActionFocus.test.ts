/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';

/** Design 1B in Passage Focus: MAIA's offered control renders as a button that only reports the click. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let container: HTMLDivElement;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

function render(body: string, extra: Record<string, unknown> = {}) {
  const props = {
    manuscriptTitle: 'Threshold', currentText: 'Original words.', sectionBody: 'Original words.',
    thread: { threadId: 't1', versions: [], turns: [] }, version: null,
    lastMaiaTurn: { speaker: 'maia', body, turnIndex: 1 }, appliedVersionId: null, busy: false, message: null, undoMessage: null,
    sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
    onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
    ...extra,
  };
  act(() => root.render(React.createElement(EditorialDancePanel, props as any)));
  return props;
}

test('a known marker becomes a button; the marker never shows; clicking only reports the action', () => {
  const onStudioAction = jest.fn();
  const props = render('Read it whole first.\n\n[[studio:develop-overview]]', { onStudioAction });
  expect(container.textContent).not.toContain('[[studio:');
  const b = container.querySelector<HTMLButtonElement>('[data-studio-action="develop-overview"]')!;
  expect(b.textContent).toBe('Go to “Read this chapter”');
  act(() => b.click());
  expect(onStudioAction).toHaveBeenCalledWith('develop-overview');
  expect((props as any).onSend).not.toHaveBeenCalled();
  expect((props as any).onApply).not.toHaveBeenCalled();
});

test('an invented marker renders no button and no marker text', () => {
  render('Hmm. [[studio:delete-work]]', { onStudioAction: jest.fn() });
  expect(container.querySelector('[data-studio-action]')).toBeNull();
  expect(container.textContent).not.toContain('[[studio:');
});

test('without a handler there is no button, and the marker is still stripped', () => {
  render('Use the table. [[studio:craftsmans-table]]');
  expect(container.querySelector('[data-studio-action]')).toBeNull();
  expect(container.textContent).not.toContain('[[studio:');
});

test('the button is disabled while MAIA is working', () => {
  render('Start fresh. [[studio:new-conversation]]', { onStudioAction: jest.fn(), busy: true });
  expect(container.querySelector<HTMLButtonElement>('[data-studio-action="new-conversation"]')?.disabled).toBe(true);
});
