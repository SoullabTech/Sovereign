/** @jest-environment jsdom */
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

describe('I2 — new arrival invites writing without an option wall', () => {
  it('asks what the writer is beginning and lets them create without naming a Work', () => {
    const field = render({
      arrival: { ...orient, kind: 'begin' },
      works: [], manuscripts: [], returnWork: null,
    });
    expect(field.querySelector('h1')?.textContent).toBe('What are you beginning?');
    expect(field.textContent).toContain('Import writing');
    const begin = Array.from(field.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Start writing');
    expect(begin).toBeTruthy();
    act(() => begin!.click());
    const title = field.querySelector<HTMLInputElement>('input#p4r1-work-title');
    expect(title).not.toBeNull();
    const confirm = Array.from(field.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Start writing');
    expect(confirm).toBeTruthy();
    act(() => confirm!.click());
    expect(callbacks.onBegin).toHaveBeenCalledWith('');
  });
});

describe('W1 — actual Home DOM presents real writing before creation controls', () => {
  it('shows a carried Work first and still opens that exact manuscript', () => {
    const field = render({ returnWork: work });
    const anchor = field.querySelector('[data-field="anchor"]');
    const create = field.querySelector('[aria-label="Start or bring writing"]');
    preceding(anchor, create);
    const open = anchor?.querySelector<HTMLButtonElement>('button.fr-home-primary');
    expect(open).not.toBeNull();
    act(() => open!.click());
    expect(callbacks.onOpen).toHaveBeenCalledWith('fictional-manuscript-1', undefined);
    expect(create?.textContent).toContain('New Work');
  });

  it('shows a genuinely resumable Work before its secondary creation tools', () => {
    const field = render({ returnWork: null, arrival: { ...orient, kind: 'continue', resume: work } });
    preceding(field.querySelector('[data-field="anchor"]'), field.querySelector('[aria-label="Start or bring writing"]'));
  });

  it('shows unclaimed writing before new-work controls without creating a Work', () => {
    const field = render({ works: [], returnWork: null });
    preceding(field.querySelector('.fr-home-writing-list'), field.querySelector('[aria-label="Start or bring writing"]'));
    expect(callbacks.onBegin).not.toHaveBeenCalled();
  });

  it('shows an existing Work shelf before new-work controls', () => {
    const field = render({ works: [work], returnWork: null });
    preceding(field.querySelector('.fr-home-shelf-4'), field.querySelector('[aria-label="Start or bring writing"]'));
  });
});
