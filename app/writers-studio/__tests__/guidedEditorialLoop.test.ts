/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import InsightReading from '../insight/InsightReading';
import { loadCanvasInsight } from '@/lib/writersStudio/insightCanvas';

jest.mock('@/lib/writersStudio/insightCanvas', () => ({
  loadCanvasInsight: jest.fn(),
  passageWindow: (body: string, range: { start: number; end: number } | null) => range
    ? { before: body.slice(0, range.start), selected: body.slice(range.start, range.end), after: body.slice(range.end), clippedBefore: false, clippedAfter: false }
    : { before: '', selected: body, after: '', clippedBefore: false, clippedAfter: false },
  insightWriteHref: (manuscriptId: string, readingId: string, observationKey: string, sectionId: string) =>
    `/writers-studio/rebuild?m=${manuscriptId}&s=${sectionId}&insightReading=${readingId}&insightObservation=${observationKey}`,
}));
jest.mock('../insight/MaiaListen', () => () => null);
jest.mock('../insight/WorkInspiration', () => ({ onBringToQuestion }: any) =>
  React.createElement('button', {
    type: 'button',
    onClick: () => onBringToQuestion('My declared direction'),
  }, 'Use this in our conversation'));
jest.mock('../develop/ObservationDialogue', () => ({ initialQuestion }: any) =>
  React.createElement('div', { 'data-dialogue-question': true }, initialQuestion));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  jest.clearAllMocks();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const insight = {
  manuscriptId: 'm1',
  readingId: 'r1',
  observation: {
    key: 'o1',
    observation: 'The repetition seems to carry the passage from image into explanation.',
    lens: 'development',
    phenomenonLabel: 'recurrence',
    evidence: ['Section 20, characters 10–32 as read'],
    limits: [
      { name: 'author intent', meaning: 'does not establish what the author intended' },
      { name: 'reader effect', meaning: 'does not establish an actual reader response' },
    ],
    dependsOnStructure: false,
    state: 'current',
    stateLabel: 'Current',
    stateSentence: 'Current.',
    moved: [],
  },
  coverage: 'MAIA read 1 of 1 section in full.',
  passages: [{
    key: 'p1',
    sectionId: 's20',
    heading: 'Section 20',
    position: 20,
    chapterHeading: 'Chapter 10',
    body: 'Before. The repeated image returns. After.',
    range: { start: 8, end: 34 },
    verified: true,
    editable: true,
    note: 'Exact passage · matches the text MAIA read.',
  }],
};

test('Guided opens with MAIA reading, coverage and responses without requiring an angle', async () => {
  (loadCanvasInsight as jest.Mock).mockResolvedValue(insight);
  const onRevise = jest.fn();
  await act(async () => {
    root.render(React.createElement(InsightReading, {
      manuscriptId: 'm1', readingId: 'r1', observationKey: 'o1', onRevise,
    }));
  });
  expect(container.textContent).toContain('MAIA · with this passage');
  expect(container.textContent).toContain('Here’s what I’m noticing.');
  expect(container.textContent).toContain('What I read:');
  expect(container.textContent).toContain('MAIA read 1 of 1 section in full.');
  expect(container.textContent).toContain('What do you think?');
  expect(container.textContent).toContain('Look at something else');
  expect(container.textContent).not.toContain('Your intention');
  expect(container.textContent).not.toContain('The reader’s experience');

  const button = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(b => b.textContent === label)!;
  /* ⭐ C6 convergence: with an exact bound passage and onRevise supplied, a bound
     response enters the same governed editorial seam as Talk about it. It no longer
     opens ObservationDialogue. */
  act(() => button('Yes, that’s what I mean').click());
  expect(onRevise).toHaveBeenCalledTimes(1);
  expect(onRevise.mock.calls[0][0].sectionId).toBe('s20');
  expect(onRevise.mock.calls[0][1]).toContain('Do not store it as a Work declaration');
  expect(container.querySelector('[data-dialogue-question]')).toBeNull();

  act(() => button('Try a revision').click());
  expect(onRevise).toHaveBeenCalledTimes(2);
  expect(onRevise.mock.calls[1][0].sectionId).toBe('s20');
});

test('Work direction enters only after explicit member gesture and remains editable/removable', async () => {
  (loadCanvasInsight as jest.Mock).mockResolvedValue(insight);
  await act(async () => {
    root.render(React.createElement(InsightReading, {
      manuscriptId: 'm1', readingId: 'r1', observationKey: 'o1',
    }));
  });
  expect(container.querySelector('textarea')).toBeNull();
  const tryLink = Array.from(container.querySelectorAll('a'))
    .find(a => a.textContent === 'Try a revision') as HTMLAnchorElement;
  expect(tryLink.href).toContain('insightAction=try-revision');
  const use = Array.from(container.querySelectorAll('button'))
    .find(b => b.textContent === 'Use this in our conversation')!;
  act(() => use.click());
  const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
  expect(textarea.value).toContain('My declared direction');
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    setValue.call(textarea, 'Member-supplied orientation for this turn only:\nMy edited direction');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const partly = Array.from(container.querySelectorAll('button'))
    .find(b => b.textContent === 'Partly')!;
  act(() => partly.click());
  expect(container.querySelector('[data-dialogue-question]')?.textContent)
    .toContain('My edited direction');
  const remove = Array.from(container.querySelectorAll('button'))
    .find(b => b.textContent === 'Remove from next turn')!;
  act(() => remove.click());
  expect(container.querySelector('textarea')).toBeNull();
});

test('full evidence and non-conclusions remain reachable without becoming the default interface', async () => {
  (loadCanvasInsight as jest.Mock).mockResolvedValue(insight);
  await act(async () => {
    root.render(React.createElement(InsightReading, {
      manuscriptId: 'm1', readingId: 'r1', observationKey: 'o1',
    }));
  });
  const detail = Array.from(container.querySelectorAll('details'))
    .find(d => d.querySelector('summary')?.textContent === 'What this reading rests on')!;
  expect(detail).toBeDefined();
  expect(detail.textContent).toContain('Section 20, characters 10–32 as read');
  expect(detail.textContent).toContain('author intent');
  expect(detail.textContent).toContain('reader effect');
});
