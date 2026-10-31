/** @jest-environment jsdom */
/**
 * Actual React BirthDataStep interaction contracts in jsdom. HTTP responses,
 * animation wrappers and the optional birth form are mocked. These are not
 * a physical-browser, PostgreSQL, SMTP or full onboarding acceptance witness.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BirthDataStep } from '@/components/onboarding/BirthDataStep';
import { apiFetch } from '@/lib/http/apiBase';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('framer-motion', () => {
  const actualReact = jest.requireActual('react') as typeof React;
  const animated = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'];
  const wrapper = (tag: string) => function MotionWrapper(props: Record<string, unknown>) {
    return actualReact.createElement(tag, Object.fromEntries(Object.entries(props)
      .filter(([key]) => !animated.includes(key))));
  };
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: { div: wrapper('div'), button: wrapper('button') },
  };
});
jest.mock('@/components/astrology/BirthDataForm', () => {
  const actualReact = jest.requireActual('react') as typeof React;
  return {
    BirthDataForm: ({ onSubmit, loading }: { onSubmit: (data: unknown) => void; loading: boolean }) =>
      actualReact.createElement('button', {
        disabled: loading,
        onClick: () => onSubmit({
          date: '1990-01-01', time: '12:00',
          location: { name: 'Fictional Place', lat: 1, lng: 2, timezone: 'Etc/UTC' },
        }),
      }, 'Submit fictional birth data'),
  };
});

const fetchProfile = apiFetch as jest.MockedFunction<typeof apiFetch>;
const ALICE = '22222222-2222-4222-8222-222222222222';
const BOB = '33333333-3333-4333-8333-333333333333';
let host: HTMLDivElement;
let root: Root | null;
let onComplete: jest.Mock;

function reply(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300, status,
    json: jest.fn(async () => body),
  } as unknown as Response;
}
function confirmed(consent: 'declined' | 'opted_in', id = ALICE) {
  return reply({ success: true, profile: { id, astrology_consent: consent } });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function cache(consent: unknown = 'unknown', id = ALICE) {
  localStorage.setItem('beta_user', JSON.stringify({ id, astrologyConsent: consent }));
}
function cachedConsent() {
  return JSON.parse(localStorage.getItem('beta_user') ?? '{}').astrologyConsent;
}
function button(label: string) {
  const found = Array.from(host.querySelectorAll('button')).find((node) => node.textContent === label);
  expect(found).toBeDefined();
  return found!;
}
async function mount() {
  root = createRoot(host);
  await act(async () => { root!.render(React.createElement(BirthDataStep, { onComplete })); });
}
async function click(label: string) {
  await act(async () => { button(label).click(); });
}
function puts() {
  return fetchProfile.mock.calls.filter(([, options]) => options?.method === 'PUT');
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  jest.useRealTimers();
  fetchProfile.mockReset();
  fetchProfile.mockImplementation(async (_path, options) => options?.method === 'GET'
    ? reply({ id: ALICE, astrologyConsent: 'unknown' }) : confirmed('declined'));
  localStorage.clear();
  cache();
  onComplete = jest.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = null;
});
afterEach(async () => {
  await act(async () => { root?.unmount(); });
  host.remove();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it.each(['declined', 'opted_in'])('does not skip from a legacy local %s cache', async (consent) => {
  cache(consent);
  await mount();
  expect(fetchProfile).toHaveBeenCalledWith('/api/members/profile', expect.objectContaining({ method: 'GET', cache: 'no-store' }));
  expect(button('Continue without birth data')).toBeDefined();
  expect(onComplete).not.toHaveBeenCalled();
});

it.each(['declined', 'opted_in'])('accepts resolved %s only after the protected profile reply', async (consent) => {
  const pending = deferred<Response>();
  fetchProfile.mockReturnValueOnce(pending.promise);
  await mount();
  expect(onComplete).not.toHaveBeenCalled();
  await act(async () => { pending.resolve(reply({ id: ALICE, astrologyConsent: consent })); });
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(cachedConsent()).toBe(consent);
  expect(puts()).toHaveLength(0);
});

it.each([
  null,
  { id: ALICE, astrologyConsent: 'invalid' },
  { astrologyConsent: 'declined' },
  { id: ALICE, astrologyConsent: ['declined'] },
])('does not complete on malformed initial profile %j', async (body) => {
  cache('declined');
  fetchProfile.mockResolvedValueOnce(reply(body));
  await mount();
  expect(onComplete).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  expect(button('Continue without birth data')).toBeDefined();
});

it('shows a refused profile read without accepting the old local consent', async () => {
  cache('declined');
  fetchProfile.mockResolvedValueOnce(reply({ error: 'Session required' }, 401));
  await mount();
  expect(onComplete).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not check');
});

it('waits for confirmed durable decline before caching or advancing', async () => {
  const pending = deferred<Response>();
  await mount();
  fetchProfile.mockReturnValueOnce(pending.promise);
  await click('Continue without birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(button('Continue without birth data').disabled).toBe(true);
  expect(button('Add birth data').disabled).toBe(true);
  expect(host.querySelector('[role="status"]')?.textContent).toContain('Saving');
  await act(async () => { pending.resolve(confirmed('declined')); });
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(cachedConsent()).toBe('declined');
  expect(puts()[0][1]?.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(JSON.parse(String(puts()[0][1]?.body))).toEqual({ astrologyConsent: 'declined' });
});

it.each([401, 404, 503])('keeps a refused decline (%s) visible and retryable', async (status) => {
  await mount();
  fetchProfile.mockResolvedValueOnce(reply({ error: 'Fictional refusal' }, status));
  await click('Continue without birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  expect(button('Continue without birth data').disabled).toBe(false);
  fetchProfile.mockResolvedValueOnce(confirmed('declined'));
  await click('Continue without birth data');
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(cachedConsent()).toBe('declined');
});

it.each([
  null,
  { success: true },
  { success: false, profile: { id: ALICE, astrology_consent: 'declined' } },
  { success: true, profile: { id: ALICE, astrology_consent: 'opted_in' } },
  { success: true, profile: { astrology_consent: 'declined' } },
])('does not treat malformed or mismatched 200 body %j as a saved decline', async (body) => {
  await mount();
  fetchProfile.mockResolvedValueOnce(reply(body));
  await click('Continue without birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('could not confirm');
});

it('does not complete after an unreadable success body', async () => {
  await mount();
  fetchProfile.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new Error('Fictional malformed JSON'); } } as unknown as Response);
  await click('Continue without birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});

it('does not complete after a rejected network request', async () => {
  await mount();
  fetchProfile.mockRejectedValueOnce(new Error('Fictional network refusal'));
  await click('Continue without birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(button('Continue without birth data').disabled).toBe(false);
});

it('bounds an unreadable success body and keeps a later result from advancing', async () => {
  jest.useFakeTimers();
  const body = deferred<unknown>();
  await mount();
  fetchProfile.mockResolvedValueOnce({ ok: true, status: 200, json: () => body.promise } as unknown as Response);
  await click('Continue without birth data');
  await act(async () => { jest.advanceTimersByTime(30_001); });
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(button('Continue without birth data').disabled).toBe(false);
  expect(puts()[0][1]?.signal?.aborted).toBe(true);
  await act(async () => { body.resolve({ success: true, profile: { id: ALICE, astrology_consent: 'declined' } }); });
  expect(onComplete).not.toHaveBeenCalled();
});

it('blocks competing consent choices while the first save is pending', async () => {
  const pending = deferred<Response>();
  await mount();
  fetchProfile.mockReturnValueOnce(pending.promise);
  await act(async () => {
    button('Continue without birth data').click();
    button('Continue without birth data').click();
  });
  expect(puts()).toHaveLength(1);
  await act(async () => { pending.resolve(confirmed('declined')); });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it('uses a verified server save when local identity/cache is absent', async () => {
  localStorage.clear();
  await mount();
  await click('Continue without birth data');
  expect(puts()).toHaveLength(1);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('beta_user')).toBeNull();
});

it('does not write a late server result into another member cache', async () => {
  const pending = deferred<Response>();
  await mount();
  fetchProfile.mockReturnValueOnce(pending.promise);
  await click('Continue without birth data');
  cache('unknown', BOB);
  await act(async () => { pending.resolve(confirmed('declined')); });
  expect(JSON.parse(localStorage.getItem('beta_user')!)).toEqual({ id: BOB, astrologyConsent: 'unknown' });
  expect(onComplete).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('sign-in changed');
});

it('does not advance from an initial profile response after unmount', async () => {
  const pending = deferred<Response>();
  fetchProfile.mockReturnValueOnce(pending.promise);
  await mount();
  await act(async () => { root!.unmount(); root = null; });
  await act(async () => { pending.resolve(reply({ id: ALICE, astrologyConsent: 'declined' })); });
  expect(onComplete).not.toHaveBeenCalled();
});

it('confirms birth data and opt-in before showing saved or completing', async () => {
  jest.useFakeTimers();
  const pending = deferred<Response>();
  await mount();
  await click('Add birth data');
  fetchProfile.mockReturnValueOnce(pending.promise);
  await click('Submit fictional birth data');
  expect(onComplete).not.toHaveBeenCalled();
  expect(cachedConsent()).toBe('unknown');
  expect(host.textContent).not.toContain('Birth data recorded.');
  expect(button('Skip and continue').disabled).toBe(true);
  const sent = JSON.parse(String(puts()[0][1]?.body));
  expect(sent).toEqual({ astrologyConsent: 'opted_in', birthData: {
    date: '1990-01-01', time: '12:00',
    location: { name: 'Fictional Place', lat: 1, lng: 2, timezone: 'Etc/UTC' },
  } });
  await act(async () => { pending.resolve(confirmed('opted_in')); });
  expect(host.textContent).toContain('Birth data recorded.');
  expect(cachedConsent()).toBe('opted_in');
  expect(onComplete).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(900); });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

it('does not turn a failed birth save or failed decline into completion', async () => {
  await mount();
  await click('Add birth data');
  fetchProfile.mockResolvedValueOnce(reply({ error: 'Fictional database refusal' }, 503));
  await click('Submit fictional birth data');
  expect(host.textContent).not.toContain('Birth data recorded.');
  expect(onComplete).not.toHaveBeenCalled();
  fetchProfile.mockResolvedValueOnce(reply({ error: 'Fictional database refusal' }, 503));
  await click('Continue without birth data');
  expect(cachedConsent()).toBe('unknown');
  expect(onComplete).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
});
