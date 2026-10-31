/** @jest-environment jsdom */

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import P4R1ImportManuscript from '@/app/dev/writers-studio-pc3-live/P4R1ImportManuscript';
import { apiFetch } from '@/lib/http/apiBase';
import { writeLocalReviewManuscript } from '@/lib/writersStudio/localReviewManuscript';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('@/lib/writersStudio/localReviewManuscript', () => ({ writeLocalReviewManuscript: jest.fn() }));

const manuscriptId = '22222222-2222-4222-8222-222222222222';
const workId = '33333333-3333-4333-8333-333333333333';
const text = `Chapter 1: Rain

  Rain tapped the sill.
`;
const sections = [{ position: 0, heading: 'Chapter 1: Rain', body: `  Rain tapped the sill.
` }];
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  // The component tests the return's truthiness, not an invented schema.
  (writeLocalReviewManuscript as jest.Mock).mockReturnValue(true);
  (apiFetch as jest.Mock).mockImplementation(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    return { ok: true, status: body.sections ? 201 : 200,
      json: async () => body.sections ? { id: manuscriptId, workId } : { preview: sections, lossless: true } };
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

function button(label: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error('Expected button: ' + label);
  return found;
}

function field(label: string): HTMLInputElement | HTMLTextAreaElement {
  const wrapper = Array.from(host.querySelectorAll('label')).find((item) => item.querySelector('span')?.textContent === label);
  const input = wrapper?.querySelector('input, textarea');
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) throw new Error('Expected field: ' + label);
  return input;
}

async function typeInto(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function reachConfirmation(localReview: boolean, onComplete = jest.fn()) {
  await act(async () => root.render(React.createElement(P4R1ImportManuscript, { localReview, onCancel: jest.fn(), onComplete })));
  await typeInto(field('Manuscript title'), 'Window and Rain');
  await typeInto(field('Extracted or pasted writing'), text);
  await act(async () => button('Review structure').click());
  expect(button(localReview ? 'Confirm and open in Write' : 'Create Work and open in Write')).toBeTruthy();
  return onComplete;
}

it('makes the Work declaration visible and sends it only with the member’s final confirmation', async () => {
  const onComplete = await reachConfirmation(false);
  expect(host.textContent).toContain('This creates a new Work named “Window and Rain”');
  expect(host.textContent).toContain('The original remains separately held as Source.');
  expect(apiFetch).toHaveBeenCalledTimes(1);
  const previewBody = JSON.parse((apiFetch as jest.Mock).mock.calls[0][1].body);
  expect(previewBody).toEqual({ title: 'Window and Rain', text });
  await act(async () => button('Create Work and open in Write').click());
  expect(onComplete.mock.calls[0][0]).toBe(manuscriptId);
  const saveBody = JSON.parse((apiFetch as jest.Mock).mock.calls[1][1].body);
  expect(saveBody).toEqual({ title: 'Window and Rain', sections, createWork: true, confirmedText: text });
  expect(writeLocalReviewManuscript).not.toHaveBeenCalled();
});

it('keeps temporary local review separate from a durable Work declaration', async () => {
  const onComplete = await reachConfirmation(true);
  await act(async () => button('Confirm and open in Write').click());
  expect(onComplete).toHaveBeenCalled();
  const saveBody = JSON.parse((apiFetch as jest.Mock).mock.calls[1][1].body);
  expect(saveBody).not.toHaveProperty('createWork');
  expect(writeLocalReviewManuscript).toHaveBeenCalledWith({ manuscriptId, title: 'Window and Rain', author: null, sections });
});

it('keeps confirmation disabled while exact-identity refresh and navigation are still pending', async () => {
  let finish!: () => void;
  const completion = new Promise<void>((resolve) => { finish = resolve; });
  const onComplete = jest.fn(() => completion);
  await reachConfirmation(false, onComplete);
  await act(async () => button('Create Work and open in Write').click());
  expect(onComplete).toHaveBeenCalledWith(manuscriptId);
  const pending = button('Opening manuscript…');
  expect(pending.disabled).toBe(true);
  expect(apiFetch).toHaveBeenCalledTimes(2);
  await act(async () => pending.click());
  expect(apiFetch).toHaveBeenCalledTimes(2);
  expect(onComplete).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); await completion; });
  expect(button('Open saved writing').disabled).toBe(false);
  expect(button('Back to source').disabled).toBe(true);
  expect(host.querySelector<HTMLInputElement>('[aria-label="Section 1 heading"]')?.disabled).toBe(true);
  await act(async () => button('Open saved writing').click());
  expect(apiFetch).toHaveBeenCalledTimes(2);
  expect(onComplete).toHaveBeenCalledTimes(2);
  expect(onComplete.mock.calls.map(([id]) => id)).toEqual([manuscriptId, manuscriptId]);
});

it('retries opening the already saved identity after navigation fails, without importing another copy', async () => {
  const onComplete = jest.fn()
    .mockRejectedValueOnce(new Error('fictional navigation failure'))
    .mockResolvedValueOnce(undefined);
  await reachConfirmation(false, onComplete);
  await act(async () => button('Create Work and open in Write').click());
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('Your writing was saved, but it could not be opened.');
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('This will not create another copy.');
  expect(button('Open saved writing').disabled).toBe(false);
  expect(apiFetch).toHaveBeenCalledTimes(2);
  await act(async () => button('Open saved writing').click());
  expect(apiFetch).toHaveBeenCalledTimes(2);
  expect(onComplete.mock.calls.map(([id]) => id)).toEqual([manuscriptId, manuscriptId]);
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
