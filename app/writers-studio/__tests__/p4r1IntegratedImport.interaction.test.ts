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
let originalRandomUuid: PropertyDescriptor | undefined;

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
  window.localStorage.removeItem('maia_settings');
  originalRandomUuid = Object.getOwnPropertyDescriptor(globalThis.crypto, 'randomUUID');
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn(() => '33333333-3333-4333-8333-333333333333'),
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  if (originalRandomUuid) {
    Object.defineProperty(globalThis.crypto, 'randomUUID', originalRandomUuid);
  } else {
    delete (globalThis.crypto as unknown as { randomUUID?: unknown }).randomUUID;
  }
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

test('released production import reuses one upload identity after interruption and saves the returned Source arrival', async () => {
  // D6: an upload is a content write, so the member's CURRENT posture must be resolved. A real session has one.
  window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
  const onComplete = jest.fn();
  const uuid = '33333333-3333-4333-8333-333333333333';
  const randomUUID = (globalThis.crypto as unknown as { randomUUID: jest.Mock }).randomUUID;
  mocked
    .mockResolvedValueOnce(response(503, {
      error: 'The upload did not finish. Your protected upload record was preserved; retry the same file.',
      retryable: true,
      retryHeader: 'x-writer-upload-idempotency-key',
    }))
    .mockResolvedValueOnce(response(200, {
      title: 'Fictional River',
      format: 'docx',
      text: '# Opening\n\nThe fictional river moved under the bridge.',
      warnings: [],
      sourceArrivalId: '44444444-4444-4444-8444-444444444444',
    }))
    .mockResolvedValueOnce(response(200, {
      lossless: true,
      preview: [{
        position: 0,
        heading: 'Opening',
        body: 'The fictional river moved under the bridge.',
        headingDepth: 1,
        headingSignal: 'markdown',
      }],
    }))
    .mockResolvedValueOnce(response(201, {
      id: '55555555-5555-4555-8555-555555555555',
      sectionCount: 1,
      sourceCustody: 'source_custodied',
    }));

  await act(async () => {
    root.render(React.createElement(P4R1ImportManuscript, {
      localReview: false,
      sourceIntakeReleased: true,
      onCancel: jest.fn(),
      onComplete,
    }));
  });

  expect(container.textContent).toContain('Your original is encrypted before durable storage');
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['fictional-docx-package'], 'fictional-river.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    lastModified: 1_793_028_000_000,
  });

  const select = async () => {
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    await settle();
  };

  await select();
  expect(container.textContent).toContain('protected upload record was preserved');
  expect(mocked).toHaveBeenCalledTimes(1);
  expect(mocked.mock.calls[0][0]).toBe('/api/sovereign/manuscripts/ingest');
  expect(mocked.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    headers: { 'x-writer-upload-idempotency-key': uuid, 'x-maia-sanctuary': 'false' },
  });

  await select();
  expect(mocked).toHaveBeenCalledTimes(2);
  expect(mocked.mock.calls[1][0]).toBe('/api/sovereign/manuscripts/ingest');
  expect(mocked.mock.calls[1][1]).toMatchObject({
    method: 'POST',
    headers: { 'x-writer-upload-idempotency-key': uuid },
  });
  expect(randomUUID).toHaveBeenCalledTimes(1);
  expect((container.querySelector('textarea') as HTMLTextAreaElement).value)
    .toBe('# Opening\n\nThe fictional river moved under the bridge.');

  await act(async () => button('Review structure').click());
  await settle();
  await act(async () => button('Create Work and open in Write').click());
  await settle();

  expect(mocked).toHaveBeenCalledTimes(4);
  const saveBody = JSON.parse(String(mocked.mock.calls[3][1].body));
  expect(saveBody.sourceArrivalId).toBe('44444444-4444-4444-8444-444444444444');
  expect('confirmedText' in saveBody).toBe(false);
  expect(saveBody.sections).toEqual([{
    position: 0,
    heading: 'Opening',
    body: 'The fictional river moved under the bridge.',
    headingDepth: 1,
    headingSignal: 'markdown',
  }]);
  expect(onComplete).toHaveBeenCalledWith('55555555-5555-4555-8555-555555555555');
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
describe('D6 — the Import room never sends an original while Sanctuary is on or the posture is unresolved', () => {
  async function chooseFile() {
    await act(async () => {
      root.render(React.createElement(P4R1ImportManuscript, {
        localReview: false,
        sourceIntakeReleased: true,
        onCancel: jest.fn(),
        onComplete: jest.fn(),
      }));
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fictional-docx-package'], 'fictional-river.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastModified: 1_793_028_000_000,
    });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    await settle();
  }

  test('Sanctuary on: nothing is sent and the member is told why', async () => {
    window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true }));
    await chooseFile();
    expect(mocked).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Sanctuary is on');
    expect(container.textContent).toContain('Nothing has been sent');
  });

  test.each([
    ['no live settings at all', null],
    ['unreadable settings', '{not json'],
    ['a non-boolean posture', JSON.stringify({ sanctuary: 'false' })],
  ])('an unresolved posture (%s) is never read as ordinary: nothing is sent', async (_name, raw) => {
    if (raw !== null) window.localStorage.setItem('maia_settings', raw);
    await chooseFile();
    expect(mocked).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Choose Ordinary or Sanctuary');
  });

  test('a server Sanctuary refusal is shown as such, not mislabelled as the generic hold', async () => {
    window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    mocked.mockResolvedValueOnce(response(423, {
      error: 'Sanctuary is on. Original files are not saved during Sanctuary.',
      code: 'sanctuary_unavailable',
    }));
    await chooseFile();
    expect(mocked).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Original files are not saved during Sanctuary');
    expect(container.textContent).not.toContain('still held for member accounts');
  });
});

describe('D4 — the member is told when the original could not be stored with the Work', () => {
  const SAVED_ID = '55555555-5555-4555-8555-555555555555';
  async function importUntilCreate(saveBody: Record<string, unknown>) {
    window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    const onComplete = jest.fn();
    mocked
      .mockResolvedValueOnce(response(200, {
        title: 'Fictional River', format: 'docx', warnings: [],
        text: '# Opening\n\nThe fictional river moved under the bridge.',
        sourceArrivalId: '44444444-4444-4444-8444-444444444444',
      }))
      .mockResolvedValueOnce(response(200, {
        lossless: true,
        preview: [{ position: 0, heading: 'Opening', body: 'The fictional river moved under the bridge.', headingDepth: 1, headingSignal: 'markdown' }],
      }))
      .mockResolvedValueOnce(response(201, { id: SAVED_ID, sectionCount: 1, ...saveBody }));
    await act(async () => {
      root.render(React.createElement(P4R1ImportManuscript, {
        localReview: false, sourceIntakeReleased: true, onCancel: jest.fn(), onComplete,
      }));
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fictional-docx-package'], 'fictional-river.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', lastModified: 1_793_028_000_000,
    });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    await settle();
    await act(async () => button('Review structure').click());
    await settle();
    await act(async () => button('Create Work and open in Write').click());
    await settle();
    return onComplete;
  }

  test('original bound: the Work opens at once and no notice is shown', async () => {
    const onComplete = await importUntilCreate({ sourceCustody: 'source_custodied' });
    expect(onComplete).toHaveBeenCalledWith(SAVED_ID);
    expect(container.querySelector('[data-custody-notice]')).toBeNull();
  });

  test.each([
    ['legacy label', { sourceCustody: 'legacy_interpreted_import' }],
    ['no label at all (never read as bound)', {}],
  ])('original NOT bound (%s): the Work waits, the member is told plainly, and the same button then continues without a second import', async (_n, saveBody) => {
    const onComplete = await importUntilCreate(saveBody);
    expect(onComplete).not.toHaveBeenCalled();
    const notice = container.querySelector('[data-custody-notice]');
    expect(notice?.textContent).toContain('Your Work was saved with all of your words');
    expect(notice?.textContent).toContain('no original is held for this Work');
    expect(mocked).toHaveBeenCalledTimes(3);

    await act(async () => button('Open saved writing').click());
    await settle();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(SAVED_ID);
    expect(mocked).toHaveBeenCalledTimes(3); // continuing never imports the manuscript a second time
  });

  test('the pre-save promise no longer claims the original WILL remain held', async () => {
    window.localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
    await importUntilCreate({ sourceCustody: 'source_custodied' });
    const pre = fs.readFileSync(path.join(__dirname, '../../dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx'), 'utf8');
    expect(pre).not.toContain('The original remains separately held as Source');
    expect(pre).toContain('we will tell you if we cannot');
  });
});
