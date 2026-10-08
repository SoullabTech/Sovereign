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
    return React.createElement('a', { href: props.href }, props.children);
  };
});

import P4R1WorkMaterialsDoor, {
  boundedOutline,
  buildMaterialContext,
  MAX_MATERIAL_CONTEXT,
  MAX_OUTLINE_HEADINGS,
  noteBody,
  safeFileName,
} from '@/app/dev/writers-studio-pc3-live/P4R1WorkMaterialsDoor';

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
  id: 'work-1', title: 'Elemental Alchemy', purpose: null, form: 'Book', stage: 'writing',
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-28T00:00:00Z', expressions: [], materials: [],
};

const json = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const button = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((n) => n.textContent?.trim().startsWith(text)) as HTMLButtonElement;

function setValue(el: HTMLTextAreaElement | HTMLInputElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

async function openDoor() {
  apiFetch.mockResolvedValueOnce(json(200, { sources: [] }));
  const details = container.querySelector('details')!;
  await act(async () => {
    details.open = true;
    details.dispatchEvent(new Event('toggle', { bubbles: true }));
  });
}

test('the door is available even when the Work has no materials, and renders nothing without a Work', () => {
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, { work: null })));
  expect(container.textContent).toBe('');
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, { work: WORK })));
  expect(container.textContent).toContain('Bring in material');
  expect(apiFetch).not.toHaveBeenCalled();
});

test('keeping a pasted note uploads it, declares it to the Work, and sends nothing to MAIA', async () => {
  const onExplore = jest.fn();
  const onChanged = jest.fn();
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, { work: WORK, onExplore, onChanged })));
  await openDoor();

  apiFetch
    .mockResolvedValueOnce(json(201, { source: { id: 'src-9', transcriptionStatus: 'reviewed' } }))
    .mockResolvedValueOnce(json(201, {}));

  const textarea = container.querySelector('textarea')!;
  const inputs = Array.from(container.querySelectorAll('input[type="text"], input:not([type])')) as HTMLInputElement[];
  await act(async () => {
    setValue(textarea, 'The imaginal is not the imaginary.');
    setValue(inputs[0], 'Corbin — the imaginal');
    setValue(inputs[1], 'Corbin, Mundus Imaginalis');
    setValue(inputs[2], 'feeds the Fire chapter');
  });
  await act(async () => button('Keep with this Work').click());

  const [uploadUrl, uploadInit] = apiFetch.mock.calls[1];
  expect(uploadUrl).toBe('/api/writers-studio/sources');
  const file = (uploadInit.body as FormData).get('file') as File;
  expect(file.name).toBe('Corbin — the imaginal.txt');
  const fileText = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(file);
  });
  expect(fileText).toBe('Reference: Corbin, Mundus Imaginalis\n\nThe imaginal is not the imaginary.');

  const [keepUrl, keepInit] = apiFetch.mock.calls[2];
  expect(keepUrl).toBe('/api/sovereign/living-works/work-1/materials');
  expect(JSON.parse(keepInit.body)).toEqual({
    materialType: 'source_upload', materialId: 'src-9', sentence: 'feeds the Fire chapter',
  });

  expect(container.textContent).toContain('Your manuscript, your place and this conversation are unchanged.');
  expect(onChanged).toHaveBeenCalledTimes(1);
  expect(onExplore).not.toHaveBeenCalled();
});

test('a PDF or image that still needs review is saved but never declared to the Work', async () => {
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, { work: WORK })));
  await openDoor();
  apiFetch.mockResolvedValueOnce(json(201, { source: { id: 'src-pdf', transcriptionStatus: 'draft' } }));

  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(fileInput, 'files', { value: [new File(['x'], 'a.pdf', { type: 'application/pdf' })], configurable: true });
  await act(async () => { fileInput.dispatchEvent(new Event('change', { bubbles: true })); });

  const urls = apiFetch.mock.calls.map((c) => c[0]);
  expect(urls).toContain('/api/writers-studio/sources');
  expect(urls.some((u) => String(u).includes('/materials'))).toBe(false);
  expect(container.textContent).toContain('needs your review before it can join this Work');
});

test('a failed upload adds nothing and says so', async () => {
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, { work: WORK })));
  await openDoor();
  apiFetch.mockResolvedValueOnce(json(415, { error: 'Unsupported file type' }));
  await act(async () => { setValue(container.querySelector('textarea')!, 'hello'); });
  await act(async () => button('Keep with this Work').click());
  expect(container.textContent).toContain('Unsupported file type. Nothing was added.');
  expect(apiFetch.mock.calls.some((c) => String(c[0]).includes('/materials'))).toBe(false);
});

test('Explore and Place send only on the writer’s explicit choice, and Place asks without drafting or choosing', async () => {
  const onExplore = jest.fn();
  act(() => root.render(React.createElement(P4R1WorkMaterialsDoor, {
    work: WORK, onExplore, outline: ['Rediscovering Ancient Wisdom', 'The Power of Imagination in Shaping Our Reality'],
  })));
  await openDoor();
  apiFetch
    .mockResolvedValueOnce(json(201, { source: { id: 'src-1', transcriptionStatus: 'reviewed' } }))
    .mockResolvedValueOnce(json(201, {}));
  await act(async () => { setValue(container.querySelector('textarea')!, 'A note about the imaginal.'); });
  await act(async () => button('Keep with this Work').click());
  expect(onExplore).not.toHaveBeenCalled();

  await act(async () => button('Help me find where it fits').click());
  expect(onExplore).toHaveBeenCalledTimes(1);
  const sent: string = onExplore.mock.calls[0][0];
  expect(sent).toContain('A note about the imaginal.');
  expect(sent).toContain('Do not draft insertion wording, do not choose for the member, and do not change the manuscript.');
  expect(sent).toContain('- Rediscovering Ancient Wisdom');
  expect(sent).toContain('not confirmed authored structure');

  await act(async () => button('Explore with MAIA').click());
  const explored: string = onExplore.mock.calls[1][0];
  expect(explored).not.toContain('Headings as stored');
});

test('material too long for one bounded context is refused, never trimmed', () => {
  const tooLong = 'x'.repeat(MAX_MATERIAL_CONTEXT + 1);
  const out = buildMaterialContext({ title: 't', text: tooLong, workTitle: 'W', sentence: null, intent: 'place' });
  expect(out.context).toBeNull();
  expect(out.reason).toContain('MAIA does not choose excerpts');
  expect(buildMaterialContext({ title: 't', text: '   ', workTitle: 'W', sentence: null, intent: 'explore' }).context).toBeNull();
});

test('pure helpers: file names are safe, references are visible, outlines are bounded', () => {
  expect(safeFileName('a/b:c*?')).toBe('a b c.txt');
  expect(safeFileName('   ')).toBe('Note.txt');
  expect(noteBody('  body  ', '')).toBe('body');
  expect(noteBody('body', ' Corbin ')).toBe('Reference: Corbin\n\nbody');
  const many = Array.from({ length: MAX_OUTLINE_HEADINGS + 20 }, (_, i) => `H${i}`);
  expect(boundedOutline(many)).toHaveLength(MAX_OUTLINE_HEADINGS);
  expect(boundedOutline(['  ', 'a  b'])).toEqual(['a b']);
});

test('the door writes only to intake and declaration routes — never to the manuscript, a section or a draft', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WorkMaterialsDoor.tsx'),
    'utf8',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  expect(code).not.toContain('onEditBody');
  expect(code).not.toContain('writing.edit');
  expect(code).not.toContain('adoptBoundEditorialVersion');
  expect(code).not.toMatch(/method:\s*'(PUT|PATCH|DELETE)'/);
  const urls = Array.from(code.matchAll(/apiFetch\(\s*[`'"]([^`'"]+)/g)).map((m) => m[1].replace(/\$\{[^}]+\}/g, '{}'));
  expect(new Set(urls)).toEqual(new Set([
    '/api/writers-studio/sources',
    '/api/sovereign/living-works/{}/materials',
    '/api/writers-studio/sources/{}',
  ]));
});

test('the door is mounted beside, not instead of, the existing Focus tray and the Develop MAIA rail', () => {
  const write = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'), 'utf8');
  const develop = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
  expect((write.match(/<P4R1WorkMaterialsDoor/g) ?? []).length).toBe(1);
  expect((write.match(/<P4R1FocusMaterials/g) ?? []).length).toBe(1);
  expect((develop.match(/<P4R1WorkMaterialsDoor/g) ?? []).length).toBe(1);
});
