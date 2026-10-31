/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"https://auth-return.invalid/signup"}
 */
/**
 * AUTH-RETURN-01 real React DOM click-flow tests.
 * All members and responses are fictional; no real SMTP, credentials or network.
 */
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import UnifiedAuth from '@/components/auth/UnifiedAuth';

const mockRouter = { push: jest.fn(), replace: jest.fn() };
let mockSearchParams = new URLSearchParams();
const mockTrustDevice = jest.fn();
const mockApiFetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));
jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    motion: {
      div: React.forwardRef(({ initial, animate, exit, transition, children, ...props }: any, ref: any) =>
        React.createElement('div', { ...props, ref }, children)),
    },
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});
jest.mock('@/components/ui/Holoflower', () => ({ Holoflower: () => null }));
jest.mock('@/lib/auth/biometricAuth', () => ({ biometricAuth: {
  getBiometricName: () => 'Touch ID',
  getAvailability: async () => ({ available: false, platformAvailable: false }),
  authenticate: jest.fn(), register: jest.fn(),
} }));
jest.mock('@/lib/auth/webBiometricOffer', () => ({
  shouldOfferWebBiometric: () => false,
  webBiometricNotice: () => null,
  readLocalPasskeyEvidence: () => false,
  markLocalPasskeyEvidence: jest.fn(),
}));
jest.mock('@/lib/auth/unifiedBiometry', () => ({ unifiedBiometry: {
  getAvailability: jest.fn(), authenticate: jest.fn(),
} }));
jest.mock('@/lib/auth/deviceTrust', () => ({ deviceTrust: {
  trustDevice: (...args: unknown[]) => mockTrustDevice(...args),
} }));
jest.mock('@/lib/http/apiBase', () => ({
  apiUrl: (path: string) => path,
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));
jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
jest.mock('@/lib/features/flags', () => ({ getFeatureFlag: () => false }));
jest.mock('@/lib/utils/feature-flags', () => ({ isFeatureEnabled: () => false }));

const alder = {
  id: 'fictional-alder', username: 'alder_writer', name: 'Alder Writer',
  preferredName: 'Alder', onboarded: true,
};
const birch = {
  id: 'fictional-birch', username: 'birch_writer', name: 'Birch Writer',
  preferredName: 'Birch', onboarded: true,
};
const identityStorageKeys = [
  'memberId', 'beta_user', 'explorerId', 'explorerName', 'explorerPreferredName',
  'betaOnboardingComplete', 'maia_session_version', 'signup_completed', 'maia_session_token',
];

function reply(status: number, data: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

describe('AUTH-RETURN-01 browser authentication state', () => {
  let container: HTMLDivElement;
  let root: Root;
  let fetchMock: jest.Mock;
  let originalFetch: typeof fetch;
  let originalLocation: PropertyDescriptor;
  let navigation: { assign: jest.Mock; replace: jest.Mock; href: string };
  let consoleError: jest.SpyInstance;
  let respond: (url: string, init?: RequestInit) => Promise<Response>;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    // A signed-out browser cannot take the unrelated silent-whoami shortcut.
    localStorage.setItem('maia_signed_out', '1');
    mockSearchParams = new URLSearchParams('email=alder%40fictional.invalid');
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    mockTrustDevice.mockReset().mockResolvedValue(undefined);
    mockApiFetch.mockReset();
    originalFetch = globalThis.fetch;
    respond = async (url) => {
      if (url === '/api/members/lookup-email') return reply(200, { exists: false });
      throw new Error(`Unexpected fictional fetch: ${url}`);
    };
    fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => respond(String(input), init));
    globalThis.fetch = fetchMock as typeof fetch;
    originalLocation = Object.getOwnPropertyDescriptor(window, 'location')!;
    // jest-environment-jsdom 29 uses configurable Location on its window.
    // Capture actual navigation attempts; unchanged href alone would not prove
    // absence of navigation because jsdom does not load a new document.
    expect(originalLocation.configurable).toBe(true);
    navigation = { assign: jest.fn(), replace: jest.fn(), href: 'https://auth-return.invalid/signup' };
    Object.defineProperty(window, 'location', { configurable: true, value: navigation });
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    if (originalLocation) Object.defineProperty(window, 'location', originalLocation);
    globalThis.fetch = originalFetch;
    localStorage.clear();
    consoleError?.mockRestore();
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  });

  async function render(mode: 'signup' | 'signin' = 'signup') {
    await act(async () => { root.render(createElement(UnifiedAuth, { mode })); });
  }

  function button(label: string): HTMLButtonElement {
    const found = Array.from(container.querySelectorAll('button')).find((node) => node.textContent?.trim() === label);
    expect(found).toBeDefined();
    return found!;
  }

  function input(placeholder: string): HTMLInputElement {
    const found = Array.from(container.querySelectorAll('input')).find((node) => node.placeholder === placeholder);
    expect(found).toBeDefined();
    return found!;
  }

  async function click(label: string) {
    await act(async () => {
      const node = button(label);
      expect(node.disabled).toBe(false);
      node.click();
      await Promise.resolve();
    });
  }

  async function type(placeholder: string, value: string) {
    await act(async () => {
      const node = input(placeholder);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(node, value);
      node.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
  }

  function callsTo(url: string): Array<[string, RequestInit]> {
    return fetchMock.mock.calls.filter(([inputUrl]) => String(inputUrl) === url) as Array<[string, RequestInit]>;
  }

  function expectNoAuthenticationSideEffects() {
    for (const key of identityStorageKeys) expect(localStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem('maia_signed_out')).toBe('1');
    expect(mockTrustDevice).not.toHaveBeenCalled();
    expect(navigation.assign).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  }

  it('does not treat ?verified=true as permission to collect a name or register', async () => {
    mockSearchParams = new URLSearchParams('verified=true&email=alder%40fictional.invalid&next=%2Fwriters-studio');
    respond = async () => reply(503, { error: 'Fictional email delivery refused', reason: 'provider_refused' });
    await render();
    expect(input('Email address').value).toBe('alder@fictional.invalid');
    expect(container.querySelector('input[placeholder="Your name"]')).toBeNull();
    expect(container.textContent).not.toContain('is verified.');
    await click('Continue');
    expect(container.textContent).toContain('Fictional email delivery refused');
    expect(container.querySelector('input[placeholder="Your name"]')).toBeNull();
    expect(callsTo('/api/members/email-code/verify')).toHaveLength(0);
    expect(callsTo('/api/members/register-email')).toHaveLength(0);
    expectNoAuthenticationSideEffects();
  });

  it('retains one key for an ambiguous retry and creates a new key only on explicit new-code action', async () => {
    let sends = 0;
    respond = async (url) => {
      if (url === '/api/members/lookup-email') return reply(200, { exists: false });
      if (url !== '/api/members/email-code') throw new Error(`Unexpected fictional fetch: ${url}`);
      sends += 1;
      if (sends === 1) throw new TypeError('Fictional connection ended after send');
      if (sends === 2) return reply(503, { error: 'Fictional delivery state unknown', reason: 'delivery_state_unknown' });
      return reply(202, { accepted: true });
    };
    await render();
    await click('Continue');
    expect(container.textContent).toContain('We could not confirm whether the code was sent');
    expect(button('Request a new code')).toBeDefined();
    await click('Continue');
    expect(container.textContent).toContain('Fictional delivery state unknown');
    await click('Request a new code');
    const sendsMade = callsTo('/api/members/email-code');
    expect(sendsMade).toHaveLength(3);
    const keys = sendsMade.map(([, init]) => Object.entries(init.headers as Record<string, string>)
      .find(([name]) => name.toLowerCase() === 'x-soullab-auth-request')?.[1]);
    expect(keys[0]).toEqual(expect.any(String));
    expect(keys[0]!.length).toBeGreaterThanOrEqual(16);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
    for (const [, init] of sendsMade) {
      expect(init.credentials).toBe('include');
      expect(JSON.parse(String(init.body))).toEqual({ email: 'alder@fictional.invalid' });
    }
    expect(input('••••••')).toBeDefined();
    expect(container.querySelector('input[placeholder="Your name"]')).toBeNull();
    expectNoAuthenticationSideEffects();
  });

  it('does not store or redirect when existing-member session readback names another fictional member', async () => {
    respond = async (url) => {
      if (url === '/api/members/lookup-email') return reply(200, { exists: false });
      if (url === '/api/members/email-code') return reply(202, { accepted: true });
      if (url === '/api/members/email-code/verify') return reply(200, { authenticated: true, member: alder, redirect: '/writers-studio' });
      if (url === '/api/members/session') return reply(200, { authenticated: true, member: birch });
      throw new Error(`Unexpected fictional fetch: ${url}`);
    };
    await render();
    await click('Continue');
    await type('••••••', '123456');
    expect(callsTo('/api/members/email-code/verify')).toHaveLength(1);
    expect(callsTo('/api/members/session')).toHaveLength(1);
    expect(callsTo('/api/members/session')[0][1]).toEqual(expect.objectContaining({ method: 'GET', credentials: 'include', cache: 'no-store' }));
    expect(container.textContent).toContain('Could not verify the code');
    expectNoAuthenticationSideEffects();
  });

  it('opens name collection only after challenge verification and refuses wrong-member signup session readback', async () => {
    respond = async (url) => {
      if (url === '/api/members/lookup-email') return reply(200, { exists: false });
      if (url === '/api/members/email-code') return reply(202, { accepted: true });
      if (url === '/api/members/email-code/verify') return reply(200, { registrationRequired: true });
      if (url === '/api/members/register-email') return reply(201, { authenticated: true, member: alder, redirect: '/writers-studio' });
      if (url === '/api/members/session') return reply(200, { authenticated: true, member: birch });
      throw new Error(`Unexpected fictional fetch: ${url}`);
    };
    await render();
    expect(container.querySelector('input[placeholder="Your name"]')).toBeNull();
    await click('Continue');
    await type('••••••', '123456');
    expect(input('Your name')).toBeDefined();
    expect(callsTo('/api/members/register-email')).toHaveLength(0);
    await type('Your name', 'Alder Writer');
    await click('Enter Soullab');
    const registration = callsTo('/api/members/register-email');
    expect(registration).toHaveLength(1);
    expect(registration[0][1].credentials).toBe('include');
    expect(JSON.parse(String(registration[0][1].body))).toEqual(expect.objectContaining({ email: 'alder@fictional.invalid', name: 'Alder Writer' }));
    expect(callsTo('/api/members/session')).toHaveLength(1);
    expect(container.textContent).toContain('The secure session could not be confirmed');
    expectNoAuthenticationSideEffects();
  });

  it('stores the confirmed member and uses a safe fallback for a normalized external redirect', async () => {
    mockSearchParams = new URLSearchParams('email=alder%40fictional.invalid&next=%2Fwriters-studio%3Fwork%3Dalder%23edit');
    respond = async (url) => {
      if (url === '/api/members/lookup-email') return reply(200, { exists: false });
      if (url === '/api/members/email-code') return reply(202, { accepted: true });
      if (url === '/api/members/email-code/verify') return reply(200, {
        authenticated: true, member: { id: alder.id, name: 'Unconfirmed presentation name' },
        redirect: '/writers-studio/..//outside.invalid',
      });
      if (url === '/api/members/session') return reply(200, { authenticated: true, member: alder });
      throw new Error(`Unexpected fictional fetch: ${url}`);
    };
    await render();
    await click('Continue');
    await type('••••••', '123456');
    expect(callsTo('/api/members/session')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('beta_user')!)).toEqual(alder);
    expect(localStorage.getItem('memberId')).toBe(alder.id);
    expect(localStorage.getItem('maia_signed_out')).toBeNull();
    expect(mockTrustDevice).toHaveBeenCalledTimes(1);
    expect(navigation.assign).toHaveBeenCalledTimes(1);
    expect(navigation.assign).toHaveBeenCalledWith('/writers-studio?work=alder#edit');
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('keeps password sign-in and the email-code alternative reachable without invoking native authority', async () => {
    mockSearchParams = new URLSearchParams('next=%2Fwriters-studio');
    await render('signin');
    expect(input('Email or username')).toBeDefined();
    expect(input('Password').type).toBe('password');
    expect(container.querySelector('a[href="/reset-password"]')).not.toBeNull();
    await click('Email me a sign-in code instead');
    expect(input('Email address')).toBeDefined();
    expect(button('Sign in with username and password')).toBeDefined();
    expect(mockApiFetch).not.toHaveBeenCalled();
    expectNoAuthenticationSideEffects();
  });
});
