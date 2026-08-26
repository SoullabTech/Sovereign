/**
 * SA-02 — consciousness-sw.js service-worker strategy tests.
 *
 * Loads the REAL service-worker source (public/consciousness-sw.js) with mocked
 * SW globals and proves the remediation:
 *   1+2 navigation is NETWORK-FIRST — network attempted first; current network
 *       response wins over a stale cached shell (fixes "Failed to find Server
 *       Action" from a pinned pre-deploy HTML shell).
 *   3   navigation falls back to the cached document only when the network fails.
 *   4   static/immutable GET stays CACHE-FIRST (not broadly network-first).
 *   5/8 non-GET (POST) is bypassed — not intercepted (Safari POST-body fix, v3.0.1).
 *   6   activate purges the old `consciousness-v3` cache.
 *   7   the new `consciousness-v4` namespace is used by install.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

type Handler = (event: any) => any;

function makeCacheStorage() {
  const map = new Map<string, Map<string, any>>();
  const keyOf = (r: any) => (typeof r === 'string' ? r : r.url);
  return {
    _map: map,
    async open(name: string) {
      if (!map.has(name)) map.set(name, new Map());
      const c = map.get(name)!;
      return {
        async put(r: any, res: any) { c.set(keyOf(r), res); },
        async match(r: any) { return c.get(keyOf(r)); },
        async addAll(reqs: any[]) { for (const r of reqs) c.set(keyOf(r), { ok: true, precached: r }); },
      };
    },
    async match(r: any) {
      for (const c of map.values()) { const hit = c.get(keyOf(r)); if (hit) return hit; }
      return undefined;
    },
    async keys() { return [...map.keys()]; },
    async delete(name: string) { return map.delete(name); },
  };
}

function loadSW() {
  const src = readFileSync(resolve(process.cwd(), 'public/consciousness-sw.js'), 'utf8');
  const handlers: Record<string, Handler> = {};
  const caches = makeCacheStorage();
  const fetchMock = jest.fn();
  const selfMock: any = {
    addEventListener: (t: string, h: Handler) => { handlers[t] = h; },
    skipWaiting: jest.fn(async () => undefined),
    clients: { claim: jest.fn(async () => undefined), matchAll: jest.fn(async () => []) },
    registration: {},
  };
  const R = (global as any).Response ?? class {};
  const Rq = (global as any).Request ?? class {};
  const quietConsole = { log() {}, error() {}, warn() {}, info() {} };
  // eslint-disable-next-line no-new-func
  const fn = new Function('self', 'caches', 'fetch', 'console', 'URL', 'Response', 'Request', src);
  fn(selfMock, caches, fetchMock, quietConsole, URL, R, Rq);
  return { handlers, caches, fetchMock, selfMock };
}

const fetchEvent = (request: any) => {
  const ev: any = {
    request,
    respondWith: (p: any) => { ev._res = p; },
    waitUntil: (p: any) => { ev._wait = p; },
  };
  return ev;
};

const req = (url: string, opts: { mode?: string; method?: string } = {}) => ({
  url,
  mode: opts.mode ?? 'no-cors',
  method: opts.method ?? 'GET',
});

describe('SA-02 consciousness-sw remediation', () => {
  test('1+2 navigation is network-first: network attempted first; current response beats stale cache', async () => {
    const { handlers, caches, fetchMock } = loadSW();
    const c = await caches.open('consciousness-v4');
    await c.put(req('https://x/maia'), { ok: true, body: 'STALE_SHELL' }); // pinned pre-deploy shell
    const network = { ok: true, body: 'CURRENT_SHELL', clone: () => ({ ok: true, body: 'CURRENT_SHELL' }) };
    fetchMock.mockResolvedValueOnce(network);

    const ev = fetchEvent(req('https://x/maia', { mode: 'navigate' }));
    handlers.fetch(ev);
    const res = await ev._res;

    expect(fetchMock).toHaveBeenCalledTimes(1);   // network attempted BEFORE cache
    expect(res.body).toBe('CURRENT_SHELL');       // current network wins over stale cache
  });

  test('3 navigation falls back to cached document when the network fails (offline)', async () => {
    const { handlers, caches, fetchMock } = loadSW();
    const c = await caches.open('consciousness-v4');
    await c.put(req('https://x/maia'), { ok: true, body: 'CACHED_SHELL' });
    fetchMock.mockRejectedValueOnce(new Error('offline'));

    const ev = fetchEvent(req('https://x/maia', { mode: 'navigate' }));
    handlers.fetch(ev);
    const res = await ev._res;

    expect(res.body).toBe('CACHED_SHELL');        // cache only on network failure
  });

  test('4 static/immutable GET stays cache-first (no network when cached)', async () => {
    const { handlers, caches, fetchMock } = loadSW();
    const url = 'https://x/_next/static/chunks/main-app-abc123.js';
    const c = await caches.open('consciousness-v4');
    await c.put(req(url), { ok: true, body: 'CACHED_CHUNK' });

    const ev = fetchEvent(req(url, { mode: 'no-cors' }));
    handlers.fetch(ev);
    const res = await ev._res;

    expect(res.body).toBe('CACHED_CHUNK');
    expect(fetchMock).not.toHaveBeenCalled();     // immutable asset served from cache, not network
  });

  test('5+8 non-GET (POST) is bypassed — SW does not intercept (Safari POST-body fix retained)', () => {
    const { handlers } = loadSW();
    const ev = fetchEvent(req('https://x/api/sovereign/manuscripts/ingest', { method: 'POST' }));
    handlers.fetch(ev);
    expect(ev._res).toBeUndefined();              // respondWith NOT called → native network, body intact
  });

  test('6+7 install uses consciousness-v4; activate purges consciousness-v3', async () => {
    const { handlers, caches } = loadSW();
    // simulate an already-affected client holding the stale v3 cache
    (caches as any)._map.set('consciousness-v3', new Map([['https://x/maia', { ok: true, body: 'v3' }]]));

    const inst = fetchEvent(req('x'));
    handlers.install(inst);
    await inst._wait;

    const act = fetchEvent(req('x'));
    handlers.activate(act);
    await act._wait;

    const names = await caches.keys();
    expect(names).toContain('consciousness-v4');  // new namespace in use
    expect(names).not.toContain('consciousness-v3'); // old cache released
  });
});
