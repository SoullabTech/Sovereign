/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mockApi = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: (...args: unknown[]) => mockApi(...args) }));
import P4R1InteriorProof from '@/app/dev/writers-studio-pc3-live/P4R1InteriorProof';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const current = {
  state: 'section_aware', manuscriptId: 'fiction-manuscript',
  title: 'Fictional Book', version: 7,
  sections: [
    { draftSectionId: 's1', position: 0, heading: 'Opening',
      body: 'The first fictional chapter.\n\n<script>no execution</script>', editable: true },
    { draftSectionId: 's2', position: 1, heading: 'Chapter Two',
      body: 'A second authored chapter, unchanged.', editable: true },
  ],
};

let element: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockApi.mockReset();
  element = document.createElement('div');
  document.body.appendChild(element);
  root = createRoot(element);
});
afterEach(() => {
  act(() => root.unmount());
  element.remove();
});

function render(manuscriptId = 'fiction-manuscript') {
  act(() => root.render(React.createElement(P4R1InteriorProof, { manuscriptId })));
  return element.querySelector<HTMLDetailsElement>('[data-governed-interior-study]')!;
}

async function expand(details: HTMLDetailsElement) {
  await act(async () => {
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await Promise.resolve();
    await Promise.resolve();
  });
}

test('prose is NOT fetched before author opens Interior, and closes without retained DOM text', async () => {
  mockApi.mockResolvedValue({ ok: true, json: async () => current });
  const details = render();
  expect(details).not.toBeNull();
  expect(mockApi).not.toHaveBeenCalled();
  await expand(details);
  expect(mockApi).toHaveBeenCalledTimes(1);
  expect(mockApi).toHaveBeenCalledWith(
    '/api/writers-studio/rebuild/context?manuscriptId=fiction-manuscript',
    expect.objectContaining({ method: 'GET', cache: 'no-store', signal: expect.any(AbortSignal) }),
  );
  expect(details.dataset.interiorStatus).toBe('ready');
  expect(element.querySelector('[data-authored-interior-body]')?.textContent)
    .toBe(current.sections[0].body);
  expect(element.querySelector('[data-interior-page]')?.getAttribute('data-source-revision')).toBe('7');
  // Text is React-escaped, never injected from arbitrary author-owned source as HTML.
  expect(element.querySelector('script')).toBeNull();
  expect(element.textContent).toContain('pagination not measured');
  await act(async () => { details.open = false; details.dispatchEvent(new Event('toggle')); });
  expect(element.querySelector('[data-authored-interior-body]')).toBeNull();
  expect(mockApi).toHaveBeenCalledTimes(1);
});

test('source-safe session-only section navigation and typography study never send a write', async () => {
  mockApi.mockResolvedValue({ ok: true, json: async () => current });
  const details = render();
  await expand(details);
  const later = Array.from(element.querySelectorAll('button'))
    .find((button) => button.textContent === 'Later section')!;
  const classic = Array.from(element.querySelectorAll('button'))
    .find((button) => button.textContent === 'Classic')!;
  await act(async () => { later.click(); classic.click(); });
  expect(element.querySelector('[data-authored-interior-body]')?.textContent)
    .toBe(current.sections[1].body);
  expect(element.querySelector('[data-interior-page]')?.getAttribute('data-layout-style')).toBe('classic');
  expect(mockApi).toHaveBeenCalledTimes(1);
  const source = require('node:fs').readFileSync(
    require('node:path').join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1InteriorProof.tsx'),
    'utf8',
  );
  expect(source).not.toContain('localStorage');
  expect(source).not.toContain("method: 'POST'");
  expect(source).not.toContain('dangerouslySetInnerHTML');
});

test('never substitutes another member/manuscript or a continuous/legacy draft', async () => {
  mockApi.mockResolvedValueOnce({ ok: true, json: async () => ({
    ...current, manuscriptId: 'other-member-work',
  })});
  let details = render();
  await expand(details);
  expect(details.dataset.interiorStatus).toBe('held');
  expect(element.querySelector('[data-authored-interior-body]')).toBeNull();
  await act(async () => { details.open = false; details.dispatchEvent(new Event('toggle')); });
  mockApi.mockResolvedValueOnce({ ok: true, json: async () => ({
    state: 'continuous', manuscriptId: 'fiction-manuscript', content: 'not-safe-to-substitute',
  })});
  await expand(details);
  expect(details.dataset.interiorStatus).toBe('held');
  expect(element.textContent).not.toContain('not-safe-to-substitute');
});

test('unauthorized member sees refusal, not manuscript body', async () => {
  mockApi.mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) });
  const details = render();
  await expand(details);
  expect(details.dataset.interiorStatus).toBe('error');
  expect(element.querySelector('[role=alert]')?.textContent).toContain('could not be verified');
  expect(element.querySelector('[data-authored-interior-body]')).toBeNull();
});
