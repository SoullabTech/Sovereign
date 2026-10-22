/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { apiFetch } from '@/lib/http/apiBase';
import WriterStudioBetaPlanNotice from '../WriterStudioBetaPlanNotice';

jest.mock('../writerBetaPlan.css', () => ({}));
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const fetchMock = apiFetch as jest.Mock;
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  jest.resetAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function mountPlan(response: unknown) {
  fetchMock.mockResolvedValue({ ok: true, json: async () => response });
  await act(async () => {
    root.render(React.createElement(WriterStudioBetaPlanNotice));
    await Promise.resolve();
    await Promise.resolve();
  });
}

test('verified complimentary Pro writer sees optional disclosure without enabling held features', async () => {
  await mountPlan({
    plan: 'pro', pilotEligible: true, complimentary: true, paymentEnabled: false,
  });
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/sovereign/writers-studio/plan', { method: 'GET' },
  );
  expect(container.querySelector('summary')?.textContent).toContain('Studio Pro · Beta');
  expect(container.textContent).toContain('currently approved Pro room');
  expect(container.textContent).toContain('security or source-custody');
});

test.each([
  { plan: 'free', pilotEligible: false, complimentary: false, paymentEnabled: false },
  { plan: 'pro', pilotEligible: false, complimentary: true, paymentEnabled: false },
  { plan: 'pro', pilotEligible: true, complimentary: false, paymentEnabled: false },
  { plan: 'pro', pilotEligible: true, complimentary: true, paymentEnabled: true },
])('non-authorized or paid response does not render complimentary Pro', async (response) => {
  await mountPlan(response);
  expect(container.querySelector('summary')).toBeNull();
});

test('failed session/plan check hides the badge, never guesses beta status', async () => {
  fetchMock.mockRejectedValue(new Error('unavailable'));
  await act(async () => {
    root.render(React.createElement(WriterStudioBetaPlanNotice));
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(container.querySelector('summary')).toBeNull();
});
