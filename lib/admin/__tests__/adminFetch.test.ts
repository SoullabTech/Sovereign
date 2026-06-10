/**
 * PoC for the shared adminFetch seam: it injects x-admin-password from
 * localStorage['soullab_admin_secret'], omits it when absent, preserves caller
 * headers/method/body, and never overwrites an explicit header.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mem: Record<string, string> = {};
// Minimal browser shims for the node test env.
(global as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => (k in mem ? mem[k] : null),
    setItem: (k: string, v: string) => { mem[k] = v; },
    removeItem: (k: string) => { delete mem[k]; },
  },
};
const mockFetch = jest.fn<(input: string, init?: RequestInit) => Promise<Response>>(
  async () => new Response('{}', { status: 200 }),
);
(global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;

import { adminFetch, storeAdminPassword, getAdminPassword, clearAdminPassword, hasAdminPassword } from '../adminFetch';

function lastInit(): RequestInit {
  return mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1] as RequestInit;
}

beforeEach(() => {
  for (const k of Object.keys(mem)) delete mem[k];
  mockFetch.mockClear();
});

describe('adminFetch', () => {
  it('injects x-admin-password from stored secret', async () => {
    storeAdminPassword('super-secret');
    await adminFetch('/api/admin/settings');
    expect(new Headers(lastInit().headers).get('x-admin-password')).toBe('super-secret');
  });

  it('omits the header when no secret is stored', async () => {
    await adminFetch('/api/admin/settings');
    expect(new Headers(lastInit().headers).get('x-admin-password')).toBeNull();
  });

  it('preserves caller method, body, and headers', async () => {
    storeAdminPassword('s');
    await adminFetch('/api/admin/security/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: 'x', action: 'revoke' }),
    });
    const init = lastInit();
    const h = new Headers(init.headers);
    expect(init.method).toBe('POST');
    expect(h.get('content-type')).toBe('application/json');
    expect(h.get('x-admin-password')).toBe('s');
  });

  it('does not overwrite an explicit x-admin-password header', async () => {
    storeAdminPassword('from-storage');
    await adminFetch('/api/admin/x', { headers: { 'x-admin-password': 'explicit' } });
    expect(new Headers(lastInit().headers).get('x-admin-password')).toBe('explicit');
  });

  it('store / get / clear roundtrip + hasAdminPassword', () => {
    expect(hasAdminPassword()).toBe(false);
    storeAdminPassword('abc');
    expect(getAdminPassword()).toBe('abc');
    expect(hasAdminPassword()).toBe(true);
    clearAdminPassword();
    expect(getAdminPassword()).toBeNull();
    expect(hasAdminPassword()).toBe(false);
  });
});
