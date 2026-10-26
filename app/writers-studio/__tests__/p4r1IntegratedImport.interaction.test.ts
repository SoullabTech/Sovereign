/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import fs from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import P4R1ImportManuscript from '@/app/dev/writers-studio-pc3-live/P4R1ImportManuscript';
import { readLocalReviewManuscript } from '@/lib/writersStudio/localReviewManuscript';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const mocked = apiFetch as jest.Mock;
let root: Root;
let container: HTMLDivElement;

const response = (status: number, body: unknown) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});

const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const button = (label: string) => {
  const match = Array.from(container.querySelectorAll('button'))
    .find((item) => item.textContent?.trim() === label);
  if (!match) throw new Error(`button not found: ${label}`);
  return match as HTMLButtonElement;
};

beforeEach(() => {
  mocked.mockReset();
  sessionStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test('local review carries EPUB through source preview, author structure confirmation and exact manuscript identity', async () => {
  const onComplete = jest.fn();
  mocked
    .mockResolvedValueOnce(response(200, {
      title: 'The Paper Lantern',
      format: 'epub',
      text: '# Chapter One\n\nThe lantern crossed the fictional river.',
      warnings: ['EPUB text is brought in in reading order. Layout stays in the original.'],
      sourceArrivalId: null,
      custody: 'none_local_review',
      persistent: false,
    }))
    .mockResolvedValueOnce(response(200, {
      lossless: true,
      preview: [{
        position: 0,
        heading: 'Chapter One',
        body: 'The lantern crossed the fictional river.',
        headingDepth: 1,
        headingSignal: 'markdown',
      }],
    }))
    .mockResolvedValueOnce(response(201, {
      id: 'fiction-imported-manuscript',
      sectionCount: 1,
      sourceCustody: 'local_review_only',
    }));

  await act(async () => {
    root.render(React.createElement(P4R1ImportManuscript, {
      localReview: true,
      onCancel: jest.fn(),
      onComplete,
    }));
  });

  expect(container.textContent).toContain('PDF · EPUB · DOCX');
  expect(container.textContent).toContain('Local review · not retained');

  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['fictional-epub-package'], 'paper-lantern.epub', {
    type: 'application/epub+zip',
  });
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
  await settle();

  expect(mocked).toHaveBeenCalledTimes(1);
  expect(mocked.mock.calls[0][0]).toBe('/api/writers-studio/local-review/import');
  expect(mocked.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  expect((container.querySelector('textarea') as HTMLTextAreaElement).value)
    .toBe('# Chapter One\n\nThe lantern crossed the fictional river.');
  expect((container.querySelector('input[placeholder="Title of the Work"]') as HTMLInputElement).value)
    .toBe('The Paper Lantern');
  expect(container.textContent).toContain('Layout stays in the original.');

  await act(async () => button('Review structure').click());
  await settle();
  expect(mocked).toHaveBeenCalledTimes(2);
  expect(mocked.mock.calls[1][0]).toBe('/api/sovereign/manuscripts');
  const previewBody = JSON.parse(String(mocked.mock.calls[1][1].body));
  expect(previewBody).toEqual({
    title: 'The Paper Lantern',
    text: '# Chapter One\n\nThe lantern crossed the fictional river.',
  });
  expect(container.textContent).toContain('1 proposed section');
  expect(container.textContent).toContain('No cut is accepted without your final gesture.');
  const heading = container.querySelector('input[aria-label="Section 1 heading"]') as HTMLInputElement;
  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setValue?.call(heading, 'Still Water');
    heading.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await act(async () => button('Confirm and open in Write').click());
  await settle();
  expect(mocked).toHaveBeenCalledTimes(3);
  const saveBody = JSON.parse(String(mocked.mock.calls[2][1].body));
  expect(saveBody.title).toBe('The Paper Lantern');
  expect(saveBody.sections).toHaveLength(1);
  expect(saveBody.sections[0].heading).toBe('Still Water');
  expect(saveBody.confirmedText).toBe('# Chapter One\n\nThe lantern crossed the fictional river.');
  expect('sourceArrivalId' in saveBody).toBe(false);
  expect(onComplete).toHaveBeenCalledWith('fiction-imported-manuscript');
  expect(readLocalReviewManuscript('fiction-imported-manuscript')).toMatchObject({
    title: 'The Paper Lantern',
    author: null,
    sections: [{ heading: 'Still Water', body: 'The lantern crossed the fictional river.' }],
  });
});

test('the integrated Home path owns Import and no longer leaves for the legacy Press page', () => {
  const rootDir = process.cwd();
  const controller = fs.readFileSync(
    path.join(rootDir, 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'), 'utf8',
  );
  const view = fs.readFileSync(
    path.join(rootDir, 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'), 'utf8',
  );
  const importRoom = fs.readFileSync(
    path.join(rootDir, 'app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx'), 'utf8',
  );

  expect(controller).toContain("import P4R1ImportManuscript from './P4R1ImportManuscript'");
  expect(controller).toContain("params?.get('import') === '1'");
  expect(controller).toContain('<P4R1ImportManuscript');
  expect(controller).toContain('onImport={openImport}');
  expect(controller).not.toContain('IMPORT_HREF');
  expect(controller).not.toContain('window.location.assign');
  expect(view).toContain('Import writing');
  expect(view).not.toContain('Paste existing writing');
  expect(importRoom).toContain('.docx,.pdf,.epub,.txt,.md,.markdown');
  expect(importRoom).toContain("'/api/writers-studio/local-review/import'");
  expect(importRoom).toContain("body?.lossless === false");
  expect(importRoom).toContain('Confirm and open in Write');
});


test('completed import consumes the threshold query while preserving local-review authority', () => {
  const controller = fs.readFileSync(
    path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeController.tsx'),
    'utf8',
  );
  const openStart = controller.indexOf('const open = useCallback');
  const openEnd = controller.indexOf('const openImport = useCallback', openStart);
  const open = controller.slice(openStart, openEnd);
  expect(open).toContain("next.delete('import')");
  expect(open).not.toContain("next.delete('localReview')");

  const modeStart = controller.indexOf('const navigateMode = useCallback');
  const modeEnd = controller.indexOf('const onMode = useCallback', modeStart);
  expect(controller.slice(modeStart, modeEnd)).toContain("next.delete('import')");
});
