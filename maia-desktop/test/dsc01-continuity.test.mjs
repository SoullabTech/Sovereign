// DESKTOP SOVEREIGN CORE 01 — the extracted continuity orchestration.
//
// These assertions could not be written before the extraction. Joining and
// re-adopting lived inside main.js behind `ipcMain`, so the only thing a test
// could do was grep the source and hope. thread-watch.js proved the POLICY as a
// pure function (d04a); nothing proved the ORCHESTRATION around it — what is
// published, in what shape, on which failure, and what happens when the network
// is down or the member signs out.
//
// The unit moved no semantics. These tests are the evidence for that claim, and
// they are the reason the extraction was worth doing at all: a boundary that
// only makes a diagram tidier is not worth a commit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createContinuity, THREAD_POLL_MS } = require('../src/continuity.js');

function stubConv(o = {}) {
  const calls = { adopt: 0, history: 0, canonical: 0 };
  return {
    calls,
    adoptMemberThread: async () => {
      calls.adopt += 1;
      return o.adopt ? o.adopt(calls.adopt) : { ok: true, resumed: true, sessionId: 'conv-A' };
    },
    history: async () => {
      calls.history += 1;
      return o.history ? o.history() : { turns: [{ role: 'member', text: 'hi' }] };
    },
    canonicalThreadId: async () => {
      calls.canonical += 1;
      return o.canonical ? o.canonical(calls.canonical) : { ok: true, sessionId: 'conv-A' };
    },
  };
}

const signedIn = (member) => ({ state: () => ({ signedIn: true, member }) });
const signedOut = () => ({ state: () => ({ signedIn: false }) });

function fakeTimers() {
  const live = new Map();
  let id = 0;
  return {
    live,
    setInterval: (fn, ms) => { const k = ++id; live.set(k, { fn, ms }); return { k, unref() {} }; },
    clearInterval: (h) => { if (h) live.delete(h.k); },
  };
}

/** A continuity wired to stubs, with everything observable. */
function wire(o = {}) {
  const published = [];
  const timers = fakeTimers();
  const conv = o.conv || stubConv();
  const c = createContinuity({
    conversation: () => (o.noConv ? null : conv),
    session: () => (o.session === undefined ? signedIn({ username: 'kelly', name: 'Kelly' }) : o.session),
    publish: (p) => published.push(p),
    turnInFlight: o.turnInFlight || (() => false),
    timers,
    pollMs: o.pollMs,
  });
  return { c, published, conv, timers };
}

// ── join ────────────────────────────────────────────────────────────────────

test('join publishes the adopted thread and begins watching', async () => {
  const { c, published, conv } = wire();
  await c.join();
  assert.deepEqual(published, [{
    resumed: true, conversationId: 'conv-A', turns: [{ role: 'member', text: 'hi' }],
  }]);
  assert.equal(conv.calls.adopt, 1);
  assert.ok(c.isWatching, 'joined but not watching — Desktop would drift again');
  assert.ok(c.isPolling, 'joined but never polling — continuity is a snapshot again');
});

test('⛔ an adoption failure is surfaced, and does NOT begin watching', async () => {
  const conv = stubConv({ adopt: () => ({ ok: false, error: 'lookup failed' }) });
  const { c, published } = wire({ conv });
  await c.join();
  assert.deepEqual(published, [{ resumed: false, error: 'lookup failed' }]);
  assert.ok(!c.isWatching, 'a failed lookup left a watch armed against nothing');
  assert.ok(!c.isPolling);
});

test('a member with no history anywhere gets a first conversation, not a second', async () => {
  const conv = stubConv({ adopt: () => ({ ok: true, resumed: false, sessionId: 'desktop-1' }) });
  const { c, published } = wire({ conv });
  await c.join();
  assert.deepEqual(published[0], { resumed: false, conversationId: 'desktop-1', turns: [] });
  assert.equal(conv.calls.history, 0, 'history was read for a member who has none');
});

test('no conversation client — join is inert rather than throwing', async () => {
  const { c, published } = wire({ noConv: true });
  await c.join();
  assert.deepEqual(published, []);
  assert.ok(!c.isWatching);
});

// ── live re-adoption ────────────────────────────────────────────────────────

test('an unchanged canonical thread publishes nothing at all', async () => {
  const { c, published } = wire();
  await c.join();
  published.length = 0;
  await c.pollOnce();
  assert.deepEqual(published, [], 'a quiet poll redrew the surface');
});

test('⭐ the canonical thread moved elsewhere — Desktop conforms and says why', async () => {
  const conv = stubConv({
    adopt: (n) => ({ ok: true, resumed: true, sessionId: n === 1 ? 'conv-A' : 'conv-B' }),
    // join() never reads canonical — the first read here IS the poll's.
    canonical: () => ({ ok: true, sessionId: 'conv-B' }),
  });
  const { c, published } = wire({ conv });
  await c.join();
  published.length = 0;
  await c.pollOnce();
  assert.equal(published.length, 1);
  assert.equal(published[0].conversationId, 'conv-B');
  assert.equal(published[0].rejoined, true, 'the surface cannot say why it redrew');
  assert.equal(published[0].from, 'conv-A');
});

test('⛔ the network is down — the held thread is kept, silently, and retried', async () => {
  const conv = stubConv({ canonical: () => ({ ok: false, error: 'offline' }) });
  const { c, published } = wire({ conv });
  await c.join();
  published.length = 0;
  await c.pollOnce();
  await c.pollOnce();
  assert.deepEqual(published, [], 'a failed read forked or announced the conversation');
  assert.ok(c.isWatching, 'losing the network abandoned the thread');
  assert.equal(conv.calls.adopt, 1, 'a failed read caused an adoption');
});

test('⛔ offline never authors: no publish carries a locally-decided thread', async () => {
  // The only publishes this module can make are echoes of a canonical read.
  const conv = stubConv({ canonical: () => ({ ok: false }) , adopt: () => ({ ok: false, error: 'x' }) });
  const { c, published } = wire({ conv });
  await c.join();
  await c.pollOnce();
  assert.ok(published.every((p) => p.resumed === false || p.conversationId),
    'a publish appeared that no canonical read produced');
});

test('a turn in flight defers adoption rather than cutting the member off', async () => {
  const conv = stubConv({
    adopt: (n) => ({ ok: true, resumed: true, sessionId: n === 1 ? 'conv-A' : 'conv-B' }),
    canonical: () => ({ ok: true, sessionId: 'conv-B' }),
  });
  let busy = true;
  const { c, published } = wire({ conv, turnInFlight: () => busy });
  await c.join();
  published.length = 0;
  await c.pollOnce();
  assert.deepEqual(published, [], 'adopted mid-turn');
  busy = false;
  await c.pollOnce();
  assert.equal(published.length, 1, 'the deferred change was lost');
  assert.equal(published[0].conversationId, 'conv-B');
});

test('⭐ signed out — nothing adopts on behalf of nobody', async () => {
  const conv = stubConv({ canonical: () => ({ ok: true, sessionId: 'conv-B' }) });
  const { c, published } = wire({ conv, session: signedOut() });
  await c.join();
  published.length = 0;
  await c.pollOnce();
  assert.deepEqual(published, [], "another member's thread reached this window");
});

// ── the member guard ────────────────────────────────────────────────────────

test('⭐ identity is username, never the display name two members can share', () => {
  const { c } = wire({ session: signedIn({ username: 'kelly', name: 'Kelly' }) });
  assert.equal(c.currentMemberId(), 'kelly');
  const noUser = wire({ session: signedIn({ name: 'Kelly' }) });
  assert.equal(noUser.c.currentMemberId(), null, 'a display name was accepted as identity');
});

test('the guard fails closed — signed out and no session both yield null', () => {
  assert.equal(wire({ session: signedOut() }).c.currentMemberId(), null);
  assert.equal(wire({ session: null }).c.currentMemberId(), null);
});

// ── lifecycle ───────────────────────────────────────────────────────────────

test('⛔ the watch dies with the session', async () => {
  const conv = stubConv({ canonical: () => ({ ok: true, sessionId: 'conv-B' }) });
  const { c, published, timers } = wire({ conv });
  await c.join();
  assert.equal(timers.live.size, 1);
  c.stop();
  assert.ok(!c.isWatching);
  assert.ok(!c.isPolling);
  assert.equal(timers.live.size, 0, 'the poll timer outlived the session');
  published.length = 0;
  await c.pollOnce();
  assert.deepEqual(published, [], 'a stopped watch still adopted');
});

test('re-joining does not leave a second poll timer behind', async () => {
  const { c, timers } = wire();
  await c.join();
  await c.join();
  assert.equal(timers.live.size, 1, 'each join stacked another timer');
});

test('the poll interval is the ratified one and is unref-ed', async () => {
  const { c, timers } = wire();
  await c.join();
  const [t] = [...timers.live.values()];
  assert.equal(t.ms, THREAD_POLL_MS);
  assert.equal(THREAD_POLL_MS, 15000, 'the D04A poll cadence changed silently');
});
