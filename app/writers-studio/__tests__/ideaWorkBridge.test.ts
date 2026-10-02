/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const reload = jest.fn(async () => {});
const mockUseLivingWorks = jest.fn();

jest.mock('@/app/writers-studio/useLivingWorks', () => ({
  useLivingWorks: () => mockUseLivingWorks(),
}));

const apiFetch = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

jest.mock('next/link', () => {
  return function MockLink(props: any) {
    return React.createElement('a', { href: props.href, className: props.className }, props.children);
  };
});

import IdeaWorkBridge from '@/app/maia/ideas/[id]/IdeaWorkBridge';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

const WORK = {
  id: 'work-1',
  title: 'Elemental Alchemy',
  purpose: 'A book about living the elements.',
  form: 'Book',
  stage: 'writing',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-28T00:00:00Z',
  expressions: [],
  materials: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLivingWorks.mockReturnValue({
    phase: 'ready',
    works: [WORK],
    reload,
  });
  apiFetch.mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({}),
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((node) =>
    node.textContent?.trim().startsWith(text)
  ) as HTMLButtonElement;

test('Idea stays an Idea while the member explicitly relates it to a Work', async () => {
  act(() => root.render(React.createElement(IdeaWorkBridge, { ideaId: 'idea-1' })));

  expect(container.textContent).toContain('The Idea stays here.');
  expect(container.textContent).toContain('Nothing is copied into your manuscript.');

  act(() => button('Bring to a Work').click());
  act(() => button('Elemental Alchemy').click());

  const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
      .call(textarea, 'the question this book began from');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await act(async () => button('Bring it to this Work').click());

  expect(apiFetch).toHaveBeenCalledWith(
    '/api/sovereign/living-works/work-1/materials',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        materialType: 'idea',
        materialId: 'idea-1',
        sentence: 'the question this book began from',
      }),
    }),
  );
  expect(reload).toHaveBeenCalledTimes(1);

  // The bridge never writes Idea status, blocks, title, framing, or manuscript text.
  const calls = apiFetch.mock.calls.map((call) => String(call[0]));
  expect(calls.some((url) => url.includes('/api/ideas/'))).toBe(false);
  expect(calls.some((url) => url.includes('/manuscripts/'))).toBe(false);
});

test('an existing Idea belonging can be withdrawn without deleting the Idea', async () => {
  mockUseLivingWorks.mockReturnValue({
    phase: 'ready',
    works: [{
      ...WORK,
      materials: [{
        materialType: 'idea',
        materialId: 'idea-1',
        sentence: 'the question this book began from',
        declaredAt: '2026-09-28T00:00:00Z',
      }],
    }],
    reload,
  });

  act(() => root.render(React.createElement(IdeaWorkBridge, { ideaId: 'idea-1' })));
  expect(container.textContent).toContain('Feeds Elemental Alchemy');
  expect(container.textContent).toContain('the question this book began from');

  apiFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
  await act(async () => button('no longer feeds this Work').click());

  expect(apiFetch).toHaveBeenCalledWith(
    '/api/sovereign/living-works/work-1/materials',
    expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ materialType: 'idea', materialId: 'idea-1' }),
    }),
  );
  expect(reload).toHaveBeenCalledTimes(1);
});
