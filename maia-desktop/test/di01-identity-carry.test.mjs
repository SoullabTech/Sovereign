// DESKTOP-IDENTITY-CARRY-01 — the entitlement projection, and its limits.
//
// The unit exists because `POST /api/members/signin` already returns
// `memberId`, `tier` and `roles`, and this client threw them away. A shell
// cannot draw entitlement-aware navigation from `{ name, username }`.
//
// Every test below is one of the ruling's falsifications, or one of its
// acceptances. The ones that matter most are the negatives: this unit widens
// what the renderer knows, and the value of widening it is entirely in what
// still does not cross.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs, { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const strip = (f) => readFileSync(path.join(srcDir, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const { createSession, safeTier, safeRoles } = require('../src/session.js');

const TOKEN = 'SECRET-SESSION-TOKEN';

/** The shape the live route returns, per app/api/members/signin/route.ts. */
function signinBody(over = {}) {
  return {
    success: true,
    memberId: 'ee6a0c1e-0000-4000-8000-000000000001',
    member: {
      id: 'ee6a0c1e-0000-4000-8000-000000000001',
      username: 'kelly',
      name: 'Kelly',
      preferredName: 'Kelly',
      onboarded: true,
      tier: 'free',
      roles: ['member'],
      ...over,
    },
    session: { token: TOKEN, expiresAt: new Date(Date.now() + 8.64e7).toISOString() },
    token: TOKEN,
  };
}

/**
 * A session whose only I/O is the injected fetch. `getPath` points nowhere
 * writable, so persistence fails quietly and each test starts signed out —
 * which is what we want: this suite is about the projection, not about disk.
 */
function sessionWith(body, calls = []) {
  return createSession({
    app: { getPath: () => '/nonexistent-for-test' },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => body };
    },
  });
}

// ── ACCEPTANCE 1–2 · the fields are carried ─────────────────────────────────

test('sign-in still works, and main now retains memberId, tier and roles', async () => {
  const s = sessionWith(signinBody({ tier: 'pro', roles: ['practitioner', 'member'] }));
  const out = await s.signIn('kelly', 'pw');

  assert.equal(out.ok, true, 'the existing sign-in contract broke');
  assert.equal(s.state().signedIn, true);
  assert.equal(s.memberId(), 'ee6a0c1e-0000-4000-8000-000000000001',
    'the canonical member id was discarded — the defect this unit exists to repair');
  assert.equal(s.state().member.tier, 'pro');
  assert.deepEqual(s.state().member.roles, ['practitioner', 'member']);
});

// ── FALSIFICATION 1 · the token must not appear in getAuth() ────────────────

test('FALSIFICATION — the token is absent from every renderer-visible value', async () => {
  const s = sessionWith(signinBody());
  const returned = await s.signIn('kelly', 'pw');

  // `state()` is what `maia:auth-state` and `maia:auth` carry; `signIn`'s own
  // return value crosses the bridge too, so both are held to the same rule.
  for (const [what, value] of [['state()', s.state()], ['signIn()', returned]]) {
    const json = JSON.stringify(value);
    assert.ok(!json.includes(TOKEN), `the token leaked through ${what}`);
    assert.ok(!/"(token|sessionToken|password)"/.test(json),
      `${what} carries a credential-shaped key`);
  }
});

test('FALSIFICATION — no credential or session secret reaches the renderer', () => {
  const preload = strip('preload.js');
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  for (const banned of ['token', 'sessionToken', 'password:', 'memberId']) {
    assert.ok(!exposed.includes(banned), `preload exposes ${banned} to the renderer`);
  }
});

test('memberId stays in MAIN — it is not part of the renderer projection', async () => {
  const s = sessionWith(signinBody());
  await s.signIn('kelly', 'pw');

  // Retained in main…
  assert.ok(s.memberId(), 'main lost the member id');
  // …and deliberately absent from what the renderer can read. Nothing the
  // shell draws needs it, so the narrowest thing that works is what crosses.
  assert.ok(!JSON.stringify(s.state()).includes(s.memberId()),
    'the member id crossed into the renderer projection without a consumer that needs it');
  assert.ok(!('memberId' in s.state().member));
});

// ── FALSIFICATION 4 · identity comes from the response, not from the input ──

test('FALSIFICATION — identity is read from the sign-in RESPONSE, not the typed input', async () => {
  // The server's answer differs from what was typed. Only one of them is identity.
  const s = sessionWith(signinBody({ username: 'kelly.nezat', name: 'Kelly Nezat' }));
  await s.signIn('KELLY', 'pw');

  assert.equal(s.state().member.username, 'kelly.nezat',
    'Desktop echoed its own input back as identity instead of reading the server');
  assert.equal(s.state().member.name, 'Kelly Nezat');
});

test('a response that omits username falls back to the typed value rather than going blank', async () => {
  const s = sessionWith(signinBody({ username: undefined, name: undefined, preferredName: undefined }));
  await s.signIn('kelly', 'pw');
  assert.equal(s.state().member.username, 'kelly');
  assert.equal(s.state().member.name, 'kelly');
});

// ── ACCEPTANCE 4 · free and pro/practitioner differ meaningfully ────────────

test('a free member and a practitioner produce different entitlement projections', async () => {
  const free = sessionWith(signinBody({ tier: 'free', roles: ['member'] }));
  const pro = sessionWith(signinBody({ tier: 'pro', roles: ['practitioner', 'member'] }));
  await free.signIn('a', 'pw');
  await pro.signIn('b', 'pw');

  const f = free.state().member;
  const p = pro.state().member;
  assert.notDeepEqual({ tier: f.tier, roles: f.roles }, { tier: p.tier, roles: p.roles },
    'the projection cannot tell a practitioner from a free member — the shell could not draw a nav from it');
  assert.equal(f.tier, 'free');
  assert.equal(p.tier, 'pro');
  assert.ok(p.roles.includes('practitioner'));
  assert.ok(!f.roles.includes('practitioner'));
});

// ── FALSIFICATION 7 · exactly one auth_sessions row ─────────────────────────

test('FALSIFICATION — one sign-in makes exactly one request; reading the projection makes none', async () => {
  const calls = [];
  const s = sessionWith(signinBody(), calls);
  await s.signIn('kelly', 'pw');
  assert.equal(calls.length, 1, 'a second request would mint a second auth_sessions row');
  assert.ok(calls[0].url.endsWith('/api/members/signin'), 'a new auth endpoint was introduced');

  s.state(); s.state(); s.memberId();
  assert.equal(calls.length, 1, 'reading the projection costs a network call — it must be local state');
});

test('FALSIFICATION — no second auth mechanism; the wire still carries only x-session-token', async () => {
  const calls = [];
  const s = sessionWith(signinBody(), calls);
  await s.signIn('kelly', 'pw');
  await s.authedFetch('/api/anything', { method: 'GET' });

  const headers = calls[1].init.headers;
  assert.equal(headers['x-session-token'], TOKEN);
  // ⛔ The entitlement fields are for DRAWING. Asserting any of them on the wire
  // would be Desktop telling the server who it is, which is the exact inversion
  // middleware.ts refuses.
  for (const banned of ['x-member-id', 'x-access-tier', 'x-access-roles', 'x-access-member-id']) {
    assert.ok(!(banned in headers), `Desktop asserted ${banned} — identity must be derived server-side`);
  }
});

// ── sanitization — a projection is drawn from, so it must be well-shaped ────

test('an unplaceable tier fails closed to free; roles are shape-sanitized, not name-filtered', () => {
  assert.equal(safeTier('pro'), 'pro');
  assert.equal(safeTier('enterprise'), 'free', 'an unknown tier must not sit somewhere on the scale');
  assert.equal(safeTier(undefined), 'free');

  // A role the server adds tomorrow must survive: dropping it would hide a door
  // the member is entitled to, long after anyone remembers why.
  assert.deepEqual(safeRoles(['facilitator']), ['facilitator']);
  assert.deepEqual(safeRoles([]), ['member']);
  assert.deepEqual(safeRoles('practitioner'), ['member']);
  assert.deepEqual(safeRoles(['MEMBER', 'member']), ['member'], 'duplicates survived normalization');
  assert.deepEqual(safeRoles([{ evil: 1 }, '<script>', 'x'.repeat(400)]), ['member'],
    'a malformed payload put arbitrary strings into the projection');
  assert.equal(safeRoles(Array(50).fill('member')).length, 1);
});

test('the carried identity SURVIVES A RELAUNCH — persist and restore keep the member id', async () => {
  // A real round trip through session.bin, because the defect this catches was
  // invisible in-memory: the persisted record spells the field `memberId`, and
  // a restore that only looked for `id` silently reverted Desktop to the login
  // handle on every launch after the first.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'di01-'));
  const app = { getPath: () => dir };
  const safeStorage = { isEncryptionAvailable: () => false };
  const fetchImpl = async () => ({ ok: true, status: 200, json: async () => signinBody({ tier: 'pro' }) });

  const first = createSession({ app, safeStorage, fetchImpl });
  await first.signIn('kelly', 'pw');
  assert.ok(fs.existsSync(path.join(dir, 'session.bin')), 'nothing was persisted');

  // A second launch: same userData, no sign-in, no network.
  const relaunched = createSession({ app, safeStorage, fetchImpl: async () => { throw new Error('no network on restore'); } });
  assert.equal(relaunched.state().signedIn, true, 'the session did not survive relaunch');
  assert.equal(relaunched.memberId(), first.memberId(),
    'the member id was lost on restore — the thread guard silently reverts to the login handle');
  assert.equal(relaunched.state().member.tier, 'pro', 'entitlements were lost on restore');
  assert.deepEqual(relaunched.state().member.roles, ['member']);
  assert.ok(!JSON.stringify(relaunched.state()).includes(TOKEN), 'the restored token leaked to the renderer');

  fs.rmSync(dir, { recursive: true, force: true });
});

test('a session.bin written before this unit restores with a usable shape, not undefined', async () => {
  // The pre-unit record: name and username only.
  const legacy = { name: 'Kelly', username: 'kelly' };
  const { memberRecord } = require('../src/session.js');
  const restored = memberRecord({ member: legacy }, legacy.username);
  assert.equal(restored.tier, 'free', 'an upgraded install would read tier as undefined');
  assert.deepEqual(restored.roles, ['member']);
  assert.equal(restored.memberId, null, 'invented a member id the server never returned');
  assert.equal(restored.username, 'kelly');
});

// ── the projection is presentation, never authorization ─────────────────────

test('the entitlement fields are never used to gate anything in main', () => {
  const mainJs = strip('main.js');
  // Main may READ identity for the thread guard; it may not branch on tier or
  // roles. The server is the only authority on what a member may reach, and a
  // client-side gate would be a second, weaker answer to that question.
  assert.ok(!/\.tier\b/.test(mainJs), 'main branches on tier — that is an authorization decision');
  assert.ok(!/\.roles\b/.test(mainJs), 'main branches on roles — that is an authorization decision');
});

test('the thread guard uses canonical identity, with the pre-unit fallback intact', () => {
  const mainJs = strip('main.js');
  const fn = /function currentMemberId\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(fn.includes('memberSession.memberId()'),
    'the guard still identifies the member by login handle when a canonical id exists');
  assert.ok(fn.includes('username'),
    'the fallback for a pre-unit session.bin was removed — restored sessions would go unguarded');
  assert.ok(!/member\.name\b/.test(fn), 'the guard gates on a display name');
});
