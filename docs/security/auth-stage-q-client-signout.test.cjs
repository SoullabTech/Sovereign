/**
 * Stage Q client sign-out: self-contained fictional, zero-network contract tests.
 * Executes the actual TypeScript module with a mocked apiBase dependency.
 * Run only in an authorized isolated environment:
 *   node --test docs/security/auth-stage-q-client-signout.test.cjs
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require(process.env.AUTH_TEST_DEPS
  ? path.join(process.env.AUTH_TEST_DEPS, 'typescript')
  : 'typescript');

const root = path.resolve(__dirname, '../..');
const relativePath = 'lib/auth/webSignOut.ts';

function actualApi({ native = false, clearAuthState = () => {} } = {}) {
  const f = path.join(root, relativePath);
  const js = ts.transpileModule(fs.readFileSync(f, 'utf8'), {
    fileName: f,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      isolatedModules: true,
    },
  }).outputText;
  const m = new Module.Module(f + '.isolated.cjs');
  m.filename = f + '.isolated.cjs';
  m.paths = [];
  m.require = (id) => {
    if (id === '@/lib/http/apiBase') {
      return { isNativeCapacitor: () => native, clearAuthState };
    }
    if (id === '@capacitor/core') {
      return { Capacitor: { isNativePlatform: () => native } };
    }
    throw Error('Unapproved test dependency: ' + id);
  };
  m._compile(js, m.filename);
  return m.exports;
}

function serverReply({
  status = 200,
  success = true,
  localCookiesCleared = true,
  serverSessionRevoked = true,
} = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => ({ success, localCookiesCleared, serverSessionRevoked }),
  };
}

function fakeTransport(sequence) {
  const calls = [];
  return {
    calls,
    request: async (path, options) => {
      calls.push({ path, options });
      if (!sequence.length) throw Error('Unexpected extra signout request');
      const response = sequence.shift();
      if (response instanceof Error) throw response;
      return response;
    },
  };
}

test('cookie sign-out requires typed HTTP 200 success and stays same-origin', async () => {
  const api = actualApi();
  const f = fakeTransport([serverReply()]);
  const result = await api.signOutWebCredentials(f.request, null);
  assert.equal(result.kind, 'complete');
  assert.equal(result.confirmedRevocations, 1);
  assert.equal(result.headerCredentialChecked, false);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].path, '/api/members/signout');
  assert.equal(f.calls[0].options.method, 'POST');
  assert.equal(f.calls[0].options.credentials, 'same-origin');
  assert.equal(f.calls[0].options.mode, 'cors');
  assert.equal(f.calls[0].options.redirect, 'error');
  assert.equal(f.calls[0].options.headers, undefined);
});

test('Safari header-only session is checked in a second separate POST', async () => {
  const api = actualApi();
  const f = fakeTransport([
    serverReply({ serverSessionRevoked: false }),
    serverReply({ serverSessionRevoked: true }),
  ]);
  const result = await api.signOutWebCredentials(f.request, 'fictional-header-token');
  assert.equal(result.kind, 'complete');
  assert.equal(result.confirmedRevocations, 1);
  assert.equal(result.headerCredentialChecked, true);
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[0].options.headers, undefined);
  assert.deepEqual(f.calls[1].options.headers, { 'x-session-token': 'fictional-header-token' });
});

test('distinct cookie and header sessions receive separate revocation checks', async () => {
  const api = actualApi();
  const f = fakeTransport([serverReply(), serverReply()]);
  const result = await api.signOutWebCredentials(f.request, 'second-fictional-session');
  assert.equal(result.kind, 'complete');
  assert.equal(result.confirmedRevocations, 2);
  assert.equal(f.calls.length, 2);
});

test('same cookie and bearer checked twice does not invent second revocation', async () => {
  const api = actualApi();
  const f = fakeTransport([serverReply(), serverReply({ serverSessionRevoked: false })]);
  const result = await api.signOutWebCredentials(f.request, 'same-fictional-session');
  assert.equal(result.kind, 'complete');
  assert.equal(result.confirmedRevocations, 1);
});

test('403 and 409 refuse before a second bearer request', async () => {
  const api = actualApi();
  for (const status of [403, 409]) {
    const f = fakeTransport([serverReply({ status, success: false })]);
    const result = await api.signOutWebCredentials(f.request, 'fictional-bearer');
    assert.equal(result.kind, 'incomplete');
    assert.equal(result.confirmedRevocations, 0);
    assert.equal(result.cookieClearingConfirmed, false);
    assert.equal(f.calls.length, 1);
  }
});

test('503 cookie-clearing failure is incomplete; never claim success via a second request', async () => {
  const api = actualApi();
  const f = fakeTransport([
    serverReply({ status: 503, success: false, serverSessionRevoked: false }),
  ]);
  const result = await api.signOutWebCredentials(f.request, 'fictional-bearer');
  assert.equal(result.kind, 'incomplete');
  assert.equal(result.confirmedRevocations, 0);
  assert.equal(result.cookieClearingConfirmed, true);
  assert.match(result.detail, /remain valid/i);
  assert.equal(f.calls.length, 1);
});

test('malformed 503 cannot assert that the HttpOnly cookie was cleared', async () => {
  const api = actualApi();
  const f = fakeTransport([
    serverReply({ status: 503, success: true, localCookiesCleared: true, serverSessionRevoked: false }),
  ]);
  const result = await api.signOutWebCredentials(f.request, null);
  assert.equal(result.kind, 'incomplete');
  assert.equal(result.cookieClearingConfirmed, false);
});

test('second-phase refusal remains incomplete even after a confirmed cookie revocation', async () => {
  const api = actualApi();
  const f = fakeTransport([
    serverReply(),
    serverReply({ status: 503, success: false, serverSessionRevoked: false }),
  ]);
  const result = await api.signOutWebCredentials(f.request, 'fictional-bearer');
  assert.equal(result.kind, 'incomplete');
  assert.equal(result.confirmedRevocations, 1);
  assert.equal(result.cookieClearingConfirmed, true);
  assert.equal(f.calls.length, 2);
});

test('HTTP 200 without truthful response fields cannot grant completed status', async () => {
  const api = actualApi();
  const f = fakeTransport([
    serverReply({ success: false }),
  ]);
  const result = await api.signOutWebCredentials(f.request, null);
  assert.equal(result.kind, 'incomplete');
  assert.equal(result.confirmedRevocations, 0);
});

test('invalid JSON and transport loss cannot grant completed status', async () => {
  const api = actualApi();
  let f = fakeTransport([{ status: 200, ok: true, json: async () => { throw Error('Invalid JSON'); } }]);
  assert.equal((await api.signOutWebCredentials(f.request, null)).kind, 'incomplete');
  f = fakeTransport([Error('Synthetic connection reset')]);
  assert.equal((await api.signOutWebCredentials(f.request, null)).kind, 'incomplete');
});

test('native clients are refused without invoking browser signout fetch', async () => {
  const api = actualApi({ native: true });
  const oldWindow = global.window;
  const oldFetch = global.fetch;
  let networkCalls = 0;
  global.window = { location: { protocol: 'capacitor:' }, localStorage: { getItem: () => 'synthetic' } };
  global.fetch = async () => { networkCalls++; throw Error('Native must never reach fetch'); };
  try {
    const result = await api.signOutCurrentBrowserSession();
    assert.equal(result.kind, 'incomplete');
    assert.match(result.detail, /Native app/);
    assert.equal(result.cookieClearingConfirmed, false);
    assert.equal(networkCalls, 0);
  } finally {
    global.window = oldWindow;
    global.fetch = oldFetch;
  }
});

test('local-only exit preserves the unconfirmed marker without claiming revocation', () => {
  const clears = [];
  const api = actualApi({ clearAuthState: () => clears.push('clearAuthState') });
  const oldWindow = global.window;
  const removed = [];
  const set = {};
  let location = null;
  global.window = {
    localStorage: {
      removeItem: (key) => removed.push(key),
      setItem: (key, value) => { set[key] = value; },
    },
    sessionStorage: { clear: () => clears.push('sessionStorage.clear') },
    location: { replace: (path) => { location = path; } },
  };
  try {
    assert.equal(api.leaveThisBrowser(true, true), true);
    assert.equal(location, '/signin?signout=unconfirmed');
    assert.equal(set.maia_signed_out, '1');
    assert.equal(clears[0], 'clearAuthState');
    assert.equal(removed.length, 3);
  } finally {
    global.window = oldWindow;
  }
});

test('failed storage clearing refuses to claim device cleanup or navigate', () => {
  const api = actualApi({ clearAuthState: () => { throw Error('Synthetic storage failure'); } });
  const oldWindow = global.window;
  let navigated = false;
  global.window = {
    localStorage: { setItem: () => {} },
    sessionStorage: { clear: () => {} },
    location: { replace: () => { navigated = true; } },
  };
  try {
    assert.equal(api.leaveThisBrowser(true, true), false);
    assert.equal(navigated, false);
  } finally {
    global.window = oldWindow;
  }
});

test('UI wiring never treats raw successful fetch resolution as sign-out proof', () => {
  const maia = fs.readFileSync(path.join(root, 'app/maia/page.tsx'), 'utf8');
  const studio = fs.readFileSync(path.join(root, 'app/studio/account/page.tsx'), 'utf8');
  const auth = fs.readFileSync(path.join(root, 'components/auth/UnifiedAuth.tsx'), 'utf8');
  assert.match(maia, /await signOutCurrentBrowserSession\(\)/);
  assert.match(studio, /await signOutCurrentBrowserSession\(\)/);
  assert.doesNotMatch(studio, /Sign out of all devices/);
  assert.match(auth, /signOutUnconfirmed/);
  assert.match(auth, /role="alert"/);
});

test('HttpOnly cookie not confirmed cleared forbids any local-only exit claim', () => {
  const api = actualApi();
  const oldWindow = global.window;
  let navigated = false;
  let touchedStorage = false;
  global.window = {
    localStorage: { setItem: () => { touchedStorage = true; } },
    sessionStorage: { clear: () => { touchedStorage = true; } },
    location: { replace: () => { navigated = true; } },
  };
  try {
    assert.equal(api.leaveThisBrowser(true, false), false);
    assert.equal(touchedStorage, false);
    assert.equal(navigated, false);
  } finally {
    global.window = oldWindow;
  }
});
