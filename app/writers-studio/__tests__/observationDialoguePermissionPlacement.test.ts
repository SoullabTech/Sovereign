/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/* Production 2026-11-05: a question that needed MAIA to read sections paused for
   permission, but the permission box was drawn above the whole conversation.
   The writer, at the composer, saw no answer. It now sits beside the question. */

const mockAskForBody = jest.fn();
jest.mock('@/lib/writersStudio/askClient', () => ({
  askForBody: (...a: unknown[]) => mockAskForBody(...a),
  authorizeSections: jest.fn(),
  loadThread: jest.fn(async () => ({ id: 't1', turns: [
    { index: 0, speaker: 'author', body: 'Teach me the craft at work in what you noticed.' },
    { index: 1, speaker: 'maia', body: 'Here is what I noticed.' },
  ] })),
  threadsOn: jest.fn(async () => ({ kind: 'threads', threads: [{ id: 't1', openedAt: '2026-11-05T10:00:00Z', turnCount: 2 }] })),
}));
import ObservationDialogue from '@/app/writers-studio/develop/ObservationDialogue';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement; let root: Root;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

it('the permission to read appears after the conversation, just above the question box', async () => {
  const S = { sectionId: 'sec-175', heading: 'Section 175', label: 'Section 175' };
  mockAskForBody.mockResolvedValue({
    outcome: { kind: 'BODY_AUTHORITY_REQUIRED', sections: [S], pendingAskRef: 'p' },
    ask: { ok: false, refusal: 'unreachable', threadId: 't1' },
  });
  await act(async () => { root.render(React.createElement(ObservationDialogue, {
    manuscriptId: 'm1', readingId: 'r1', observationKey: 'o1', about: 'Something returns',
    superseded: false, onClose: jest.fn(),
  } as any)); });
  const box = host.querySelector<HTMLTextAreaElement>('textarea')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(box, 'Offer edits for these stories.');
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const ask = Array.from(host.querySelectorAll('button')).find((b) => b.textContent === 'ask')!;
  await act(async () => { ask.click(); });
  const panel = host.querySelector('[data-body-authorization]')!;
  const turns = host.querySelector('[data-dialogue-turns]')!;
  expect(panel).not.toBeNull();
  expect(turns.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(panel.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
