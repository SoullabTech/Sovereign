/** @jest-environment jsdom */
/**
 * WS-JONDI-CONTINUOUS-RETURN-01 · Never silently replace an edited draft.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ContinuousDraftRecovery } from '../../dev/writers-studio-pc3-live/ContinuousDraftRecovery';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let node: HTMLDivElement;
const onBack = jest.fn();
const controllerSource = () => readFileSync(
  join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
  'utf8',
);

beforeEach(async () => {
  node = document.createElement('div');
  document.body.appendChild(node);
  root = createRoot(node);
  onBack.mockClear();
  await act(async () => {
    root.render(React.createElement(ContinuousDraftRecovery, {manuscriptId:'existing-draft-1',onBack}));
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  node.remove();
});

test('a visually legible recovery surface names the saved draft, not a missing book', () => {
  const main = node.querySelector('[data-continuous-draft-recovery="available"]') as HTMLElement;
  expect(main).toBeTruthy();
  expect(main.style.color).toBe('rgb(241, 233, 220)');
  expect(main.style.background).toBe('rgb(30, 26, 22)');
  expect(node.textContent).toContain('Continue from the writing you already saved.');
  expect(node.textContent).toContain('Nothing has been converted or replaced.');
  expect(node.textContent).toContain('verify that your words appear');
});

test('member-selected route preserves exactly the addressed manuscript identity', () => {
  const link = node.querySelector('[data-continuous-recovery-open]') as HTMLAnchorElement;
  expect(link.tagName).toBe('A');
  expect(link.getAttribute('href')).toBe('/writers-studio/canvas?m=existing-draft-1');
  expect(node.querySelectorAll('[data-continuous-recovery-open]')).toHaveLength(1);
});

test('member may return Home without triggering a conversion', async () => {
  const button = Array.from(node.querySelectorAll('button')).find(b => b.textContent === 'Back to my Works');
  expect(button).toBeTruthy();
  await act(async () => button!.click());
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('surface never fetches, uploads, converts or mutates on mount', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/dev/writers-studio-pc3-live/ContinuousDraftRecovery.tsx'), 'utf8',
  );
  expect(source).not.toMatch(/\bapiFetch\(|\bfetch\(|sendBeacon\(|\blocalStorage\.|\btransaction\(/);
  expect(source).toContain('canvasForManuscript');
  expect(source).toContain('<a');
});

test('controller discriminates server continuous from no_draft; does not infer boundaries', () => {
  const code = controllerSource();
  const continuous = code.indexOf("if (body.state === 'continuous')");
  const noDraft = code.indexOf("if (body.state === 'no_draft')");
  const refusal = code.indexOf("if (body.state !== 'section_aware')");
  expect(noDraft).toBeGreaterThan(0);
  expect(continuous).toBeGreaterThan(noDraft);
  expect(refusal).toBeGreaterThan(continuous);
  const branch = code.slice(continuous,refusal);
  expect(branch).toContain('body.manuscriptId !== manuscriptId');
  expect(branch).toContain("setPhase('continuous')");
  expect(branch).toContain('setContinuousDraftId(manuscriptId)');
  expect(branch).not.toContain('convert: true');
  expect(branch).not.toMatch(/apiFetch\(|POST|seed|UPDATE/);
  expect(code).toContain('<ContinuousDraftRecovery manuscriptId={continuousDraftId}');
});
