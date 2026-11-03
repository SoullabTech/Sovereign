/** @jest-environment jsdom */
/**
 * Academy 2c walk, F2: on the Write-view observation marker, "Help me
 * understand", "Teach me why" and "Go deeper" open MAIA's conversation below
 * the popover's visible area. The conversation must be brought into view when
 * it opens, or the writer's question seems to do nothing.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ObservationManuscriptLayer from '@/app/dev/writers-studio-pc3-live/ObservationManuscriptLayer';
import type { CanvasInsight } from '@/lib/writersStudio/insightCanvas';

jest.mock('@/app/writers-studio/develop/ObservationDialogue', () => ({
  __esModule: true,
  default: ({ initialQuestion }: { initialQuestion: string }) =>
    <div data-fiction-dialogue>{initialQuestion}</div>,
}));

const insight = {
  manuscriptId: 'm-1',
  readingId: 'r-1',
  coverage: 'Read: Section 1.',
  observation: {
    key: 'o1',
    lens: 'structure',
    phenomenonLabel: 'register shift',
    stateLabel: 'Current',
    state: 'current',
    observation: 'The prose stops and hands off to other material.',
  },
  passages: [{
    key: 'p1', sectionId: 's-1', heading: 'Section 1',
    body: 'The room was quiet.', range: { start: 0, end: 8 },
    verified: true, editable: true, note: 'Marked because MAIA noticed it here.',
  }],
} as unknown as CanvasInsight;

let root: Root;
let host: HTMLDivElement;
let scrolled: Element[];

beforeEach(() => {
  jest.useFakeTimers();
  scrolled = [];
  (globalThis as { CSS?: unknown }).CSS = { escape: (value: string) => value };
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  // jsdom has no layout: give the marked passage a box so the marker renders.
  Range.prototype.getClientRects = () =>
    [{ left: 100, top: 100, width: 200, height: 20 }] as unknown as DOMRectList;
  Element.prototype.scrollIntoView = function (this: Element) { scrolled.push(this); };
  host = document.createElement('div');
  host.innerHTML = '<div data-write-editor data-section-id="s-1">The room was quiet.</div>';
  document.body.appendChild(host);
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  root = createRoot(mount);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.innerHTML = '';
  jest.useRealTimers();
});

async function render() {
  await act(async () => {
    root.render(
      <ObservationManuscriptLayer insight={insight} activeSectionId="s-1" onRevise={() => {}} onClose={() => {}} />,
    );
  });
  await act(async () => { jest.runOnlyPendingTimers(); });
}

function button(label: string): HTMLButtonElement {
  const found = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === label);
  if (!found) throw new Error(`no button "${label}"`);
  return found;
}

it.each(['Help me understand', 'Teach me why', 'Go deeper'])(
  '"%s" brings the opened conversation into view',
  async (label) => {
    await render();
    expect(document.querySelector('.p4r1-observation-popover')).not.toBeNull();
    expect(scrolled).toHaveLength(0);

    await act(async () => { button(label).click(); });
    await act(async () => { jest.runOnlyPendingTimers(); });

    const dialogue = document.querySelector('.p4r1-observation-marker-dialogue');
    expect(dialogue).not.toBeNull();
    expect(scrolled).toContain(dialogue);
  },
);

it('does not scroll anything before a conversation is asked for', async () => {
  await render();
  await act(async () => { jest.runOnlyPendingTimers(); });
  expect(document.querySelector('.p4r1-observation-marker-dialogue')).toBeNull();
  expect(scrolled).toHaveLength(0);
});
