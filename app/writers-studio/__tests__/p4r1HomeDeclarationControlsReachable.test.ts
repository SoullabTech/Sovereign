/**
 * Home declaration controls stay reachable on return (candidate 5927e6192, #1800).
 * Mounts the real P4R1HomeView in jsdom with fictional data. Component-level only:
 * not a browser run. Fails against P4R1HomeView at 5ef5f5790 (4 of 6 cases).
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ work }: { work: React.ReactNode }) => React.createElement('main', { 'data-test-shell': '' }, work),
}));
jest.mock('@/app/writers-studio/useWorkVisual', () => ({
  useWorkVisual: () => ({ src: null }),
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsSummary', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({
  __esModule: true,
  default: () => null,
}));

import P4R1HomeView from '@/app/dev/writers-studio-pc3-live/P4R1HomeView';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const work = {
  id: 'fictional-work-1', title: 'The Fictional Book', purpose: null, form: 'Book',
  stage: 'writing', manuscriptState: 'partial-manuscript',
  createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z',
  expressions: [{ expressionType: 'manuscript', expressionId: 'fictional-manuscript-1', declaredAt: '2026-10-01T00:00:00Z' }],
  materials: [],
};
const manuscript = {
  id: 'fictional-manuscript-1', title: 'The Fictional Book',
  createdAt: '2026-10-01T00:00:00Z', sectionCount: 1,
  charCount: 30, keepCount: 0, draftCharCount: 30,
  hasDraftWriting: true, hasWriting: true, hasCurrentMemberContribution: true,
  lastMemberDraftActivityAt: '2026-10-02T00:00:00Z',
};
const orient = { kind: 'orient', resume: null, alsoWritten: [], shelf: [], feature: null, imported: [] };
const callbacks = {
  onMode: jest.fn(), onChooseManuscript: jest.fn(), onBegin: jest.fn(), onOpen: jest.fn(),
  onMakeWork: jest.fn(), onAddToWork: jest.fn(), onStartWriting: jest.fn(),
  onImport: jest.fn(), onSources: jest.fn(),
};
const baseProps = {
  appearance: 'night', arrival: orient, works: [work], manuscripts: [manuscript],
  resumeActivity: null, returnWork: null, returnActivity: null,
  markedLines: [], historyActs: [], busy: false, error: null, pendingMode: null, ...callbacks,
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  jest.clearAllMocks();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function render(props: Record<string, unknown> = {}) {
  act(() => root.render(React.createElement(P4R1HomeView, { ...baseProps, ...props } as any)));
  const field = host.querySelector<HTMLElement>('.fr-home-field');
  expect(field).not.toBeNull();
  return field!;
}
function preceding(first: Element | null, second: Element | null) {
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Boolean(first!.compareDocumentPosition(second!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
}
const loose = { ...manuscript, id: 'fictional-loose-2', title: 'A Loose Fictional Draft' };
const button = (scope: Element, label: string) =>
  Array.from(scope.querySelectorAll('button')).find((b) => b.textContent?.trim().startsWith(label));

describe('declaration controls are reachable when a writer returns', () => {
  const branches = [
    ['returnWork branch', { returnWork: work }],
    ['continue branch', { returnWork: null, arrival: { ...orient, kind: 'continue', resume: work } }],
  ] as const;

  for (const [name, extra] of branches) {
    it(`${name}: unclaimed writing and its controls precede creation controls; nothing fires on render`, () => {
      const field = render({ manuscripts: [manuscript, loose], ...extra });
      const list = field.querySelector('.fr-home-writing-list');
      expect(list).not.toBeNull();
      expect(list!.textContent).toContain('A Loose Fictional Draft');
      expect(list!.textContent).not.toContain('The Fictional Book');
      expect(button(list!, 'Make this a Work')).toBeTruthy();
      expect(button(list!, 'Add to a Work')).toBeTruthy();
      preceding(list, field.querySelector('[aria-label="Start or bring writing"]'));
      expect(callbacks.onMakeWork).not.toHaveBeenCalled();
      expect(callbacks.onAddToWork).not.toHaveBeenCalled();
      expect(callbacks.onBegin).not.toHaveBeenCalled();
    });

    it(`${name}: a member gesture acts on that exact manuscript only`, () => {
      const field = render({ manuscripts: [manuscript, loose], ...extra });
      act(() => button(field.querySelector('.fr-home-writing-list')!, 'Make this a Work')!.click());
      expect(callbacks.onMakeWork).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(callbacks.onMakeWork.mock.calls[0])).toContain('fictional-loose-2');
      expect(callbacks.onBegin).not.toHaveBeenCalled();
    });

    it(`${name}: renders no extra region when all writing is already in a Work`, () => {
      const field = render({ manuscripts: [manuscript], ...extra });
      expect(field.querySelector('.fr-home-writing-list')).toBeNull();
    });
  }
});
