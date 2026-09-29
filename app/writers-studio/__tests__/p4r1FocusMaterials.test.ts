/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const apiFetch = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

jest.mock('next/link', () => {
  return function MockLink(props: any) {
    return React.createElement('a', { href: props.href, className: props.className }, props.children);
  };
});

import P4R1FocusMaterials from '@/app/dev/writers-studio-pc3-live/P4R1FocusMaterials';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const WORK: any = {
  id: 'work-1',
  title: 'Elemental Alchemy',
  purpose: null,
  form: 'Book',
  stage: 'writing',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-28T00:00:00Z',
  expressions: [],
  materials: [
    {
      materialType: 'idea',
      materialId: 'idea-1',
      sentence: 'the question this book began from',
      declaredAt: '2026-09-28T00:00:00Z',
    },
    {
      materialType: 'source_upload',
      materialId: 'source-1',
      sentence: 'notes from the original seminar',
      declaredAt: '2026-09-28T00:00:00Z',
    },
  ],
};

const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((node) =>
    node.textContent?.trim().startsWith(text)
  ) as HTMLButtonElement;

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test('Focus exposes declared Work materials without copying them or handing them to MAIA by default', () => {
  const onUseWithMaia = jest.fn();
  act(() => root.render(React.createElement(P4R1FocusMaterials, {
    work: WORK,
    onUseWithMaia,
  })));

  expect(container.textContent).toContain('Work materials');
  expect(container.textContent).toContain('the question this book began from');
  expect(container.textContent).toContain('notes from the original seminar');
  expect(container.textContent).toContain('Nothing is copied into this passage or handed to MAIA unless you choose it here.');
  expect(onUseWithMaia).not.toHaveBeenCalled();
  expect(apiFetch).not.toHaveBeenCalled();

  const links = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
  expect(links).toContain('/maia/ideas/idea-1');
  expect(links).toContain('/writers-studio/sources');
});

test('explicitly using an Idea sends only the bounded member-authored Idea context', async () => {
  const onUseWithMaia = jest.fn();
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    idea: {
      title: 'The seed question',
      framing: 'What if the elements are modes of consciousness?',
    },
    blocks: [
      { block_type: 'note', content: 'old reflection' },
      { block_type: 'decision', content: 'I will organize this around four elements.' },
      { block_type: 'note', content: 'recent one' },
      { block_type: 'maia_reflection', content: 'MAIA prior reflection must not cross' },
      { block_type: 'change', content: 'The fifth element belongs as synthesis.' },
      { block_type: 'note', content: 'recent two' },
      { block_type: 'note', content: 'recent three' },
    ],
  }));

  act(() => root.render(React.createElement(P4R1FocusMaterials, {
    work: { ...WORK, materials: [WORK.materials[0]] },
    onUseWithMaia,
  })));

  await act(async () => button('Use with MAIA here').click());

  expect(apiFetch).toHaveBeenCalledWith('/api/ideas/idea-1');
  expect(onUseWithMaia).toHaveBeenCalledTimes(1);
  const context = onUseWithMaia.mock.calls[0][0] as string;

  expect(context).toContain('MEMBER MATERIAL · IDEA');
  expect(context).toContain('Title: The seed question');
  expect(context).toContain('Framing: What if the elements are modes of consciousness?');
  expect(context).toContain('Why the member says this feeds the Work: the question this book began from');
  expect(context).toContain('Most recent decision: I will organize this around four elements.');
  expect(context).toContain('Shift: The fifth element belongs as synthesis.');
  expect(context).toContain('Boundary: This is a bounded Idea context slice, not the full Idea history.');
  expect(context).not.toContain('MAIA prior reflection must not cross');
  expect(context).not.toContain('old reflection');
  expect(context).toContain('Do not copy this material into the manuscript automatically.');
  expect(container.textContent).toContain('The Idea and manuscript are unchanged.');
});

test('explicitly using a reviewed Source sends reviewed text as attributed member material', async () => {
  const onUseWithMaia = jest.fn();
  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    source: {
      id: 'source-1',
      originalName: 'seminar-notes.txt',
      transcriptionStatus: 'reviewed',
      transcriptionReviewed: 'These are the reviewed seminar notes.',
    },
  }));

  act(() => root.render(React.createElement(P4R1FocusMaterials, {
    work: { ...WORK, materials: [WORK.materials[1]] },
    onUseWithMaia,
  })));

  await act(async () => button('Use with MAIA here').click());

  expect(apiFetch).toHaveBeenCalledWith('/api/writers-studio/sources/source-1', { method: 'GET' });
  expect(onUseWithMaia).toHaveBeenCalledTimes(1);
  const context = onUseWithMaia.mock.calls[0][0] as string;

  expect(context).toContain('MEMBER MATERIAL · REVIEWED SOURCE');
  expect(context).toContain('Source: seminar-notes.txt');
  expect(context).toContain('These are the reviewed seminar notes.');
  expect(context).toContain('It is not manuscript text');
  expect(context).toContain('Do not copy source wording into the manuscript automatically.');
  expect(container.textContent).toContain('The Source and manuscript are unchanged.');
});

test('unreviewed or oversized Sources refuse rather than silently handing material to MAIA', async () => {
  const onUseWithMaia = jest.fn();

  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    source: {
      id: 'source-1',
      originalName: 'draft-notes.txt',
      transcriptionStatus: 'draft',
      transcriptionReviewed: null,
    },
  }));

  act(() => root.render(React.createElement(P4R1FocusMaterials, {
    work: { ...WORK, materials: [WORK.materials[1]] },
    onUseWithMaia,
  })));

  await act(async () => button('Use with MAIA here').click());
  expect(onUseWithMaia).not.toHaveBeenCalled();
  expect(container.textContent).toContain('does not have a reviewed transcription yet');
  expect(container.textContent).toContain('Nothing was sent to MAIA.');

  apiFetch.mockResolvedValueOnce(jsonResponse(200, {
    source: {
      id: 'source-1',
      originalName: 'long-notes.txt',
      transcriptionStatus: 'reviewed',
      transcriptionReviewed: 'x'.repeat(12001),
    },
  }));

  await act(async () => button('Use with MAIA here').click());
  expect(onUseWithMaia).not.toHaveBeenCalled();
  expect(container.textContent).toContain('too long to bring into Focus as one bounded context');
  expect(container.textContent).toContain('Focus does not choose excerpts from a long Source automatically.');
});

test('Focus material participation has no mutation path of its own', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1FocusMaterials.tsx'),
    'utf8',
  );
  expect(source).not.toContain("method: 'POST'");
  expect(source).not.toContain("method: 'DELETE'");
  expect(source).not.toContain('onEditBody');
  expect(source).not.toContain('writing.edit');
  expect(source).not.toContain('adoptBoundEditorialVersion');
});

test('the Focus materials tray is mounted only in the isolated editorial room and routes context into existing editorial MAIA', () => {
  const host = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
    'utf8',
  );
  expect((host.match(/<P4R1FocusMaterials/g) ?? []).length).toBe(1);
  expect(host).toContain('<P4R1FocusMaterials');
  expect(host).toContain('onUseWithMaia={(context) => props.onSendEditorial(context)}');
});
