// MAIA-D04 — exact conversation continuity.
//
// Desktop used to open `desktop-<launch timestamp>`: member continuity without
// THREAD continuity, which is a Desktop-only conversation lineage and exactly
// what "one MAIA realm, many surfaces" forbids. The fix is a read, not a
// design — conversation_turns already holds every surface's turns against one
// member id — so these assertions are about Desktop JOINING rather than minting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const strip = (f) => readFileSync(path.join(srcDir, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const { createConversation, TURNS_PATH } = require('../src/conversation.js');

/** A session stub that answers the two turns reads and nothing else. */
function stubSession({ recent, thread }) {
  const seen = [];
  return {
    seen,
    authedFetch: async (pathname, init) => {
      seen.push({ pathname, method: init?.method });
      const rows = pathname.includes('sessionId=') ? thread : recent;
      return { ok: true, status: 200, res: { json: async () => ({ success: true, messages: rows }) } };
    },
  };
}

const mk = (session) => createConversation({
  session, diagnostics: { emit: () => {} }, sessionId: 'desktop-1787000000000',
});

test('Desktop adopts the member’s most recent thread instead of its own id', async () => {
  const conv = mk(stubSession({
    recent: [
      { role: 'assistant', content: 'b', sessionId: 'session_1787999999999' }, // newest first
      { role: 'user', content: 'a', sessionId: 'session_1787999999999' },
      { role: 'user', content: 'older', sessionId: 'session_1787000000001' },
    ],
    thread: [],
  }));
  const out = await conv.adoptMemberThread();
  assert.equal(out.ok, true);
  assert.equal(out.resumed, true);
  assert.equal(out.sessionId, 'session_1787999999999');
  assert.equal(conv.conversationId(), 'session_1787999999999',
    'the minted desktop- id is still in use — this is a Desktop-only lineage');
  assert.ok(!conv.conversationId().startsWith('desktop-'));
});

test('a thread minted on another surface is adopted verbatim', async () => {
  // The web client mints `session_<ms>` in localStorage; iOS does the same.
  // Desktop must carry that id unchanged, not derive a variant of it.
  const conv = mk(stubSession({ recent: [{ role: 'user', content: 'x', sessionId: 'session_1234567890123' }], thread: [] }));
  await conv.adoptMemberThread();
  assert.equal(conv.conversationId(), 'session_1234567890123');
});

test('a member with no history keeps the minted id — that is their FIRST conversation', async () => {
  const conv = mk(stubSession({ recent: [], thread: [] }));
  const out = await conv.adoptMemberThread();
  assert.deepEqual([out.ok, out.resumed], [true, false]);
  assert.equal(conv.conversationId(), 'desktop-1787000000000');
});

test('a failed lookup NEVER silently forks the conversation', async () => {
  const conv = mk({
    authedFetch: async () => ({ ok: false, status: 500, res: { text: async () => '<html>500</html>' } }),
  });
  const out = await conv.adoptMemberThread();
  assert.equal(out.ok, false, 'an unreachable server was reported as a successful adoption');
  assert.ok(out.error, 'the failure carries no explanation');
  assert.equal(conv.isResumed(), false, 'a failed lookup was recorded as a resume');
});

test('the adopted thread is read back in order, tail last', async () => {
  const thread = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `t${i}` }));
  const session = stubSession({ recent: [{ role: 'user', content: 'x', sessionId: 'session_9' }], thread });
  const conv = mk(session);
  await conv.adoptMemberThread();
  const h = await conv.history(20);
  assert.equal(h.turns.length, 20, 'the history window is not bounded');
  assert.equal(h.turns[19].content, 't29', 'the tail is not last — the member would open on stale turns');
  assert.ok(session.seen.some((c) => c.pathname.includes(`${TURNS_PATH}?sessionId=session_9`)),
    'history was not requested for the adopted thread');
});

test('adoption is a READ — it never writes and never invents an endpoint', async () => {
  const session = stubSession({ recent: [{ role: 'user', content: 'x', sessionId: 'session_1' }], thread: [] });
  const conv = mk(session);
  await conv.adoptMemberThread();
  assert.deepEqual(session.seen, [{ pathname: TURNS_PATH, method: 'GET' }]);
  const src = strip('conversation.js');
  assert.equal(TURNS_PATH, '/api/conversation/turns', 'Desktop is not using the canonical turns route');
  assert.ok(!/desktop[-/]?(thread|conversation|session)s?['"`]/i.test(src),
    'a Desktop-specific conversation endpoint has appeared');
});

test('main joins the thread on sign-in AND on a restored session', () => {
  const mainJs = strip('main.js');
  const signIn = /ipcMain\.handle\('maia:sign-in'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(/joinMemberThread\(\)/.test(signIn), 'signing in opens a fresh Desktop-only thread');
  assert.ok(/did-finish-load[\s\S]*?joinMemberThread\(\)/.test(mainJs),
    'a restored session never joins the member’s thread');
  const join = /async function joinMemberThread\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/if \(!out\.ok\)[\s\S]*?broadcast\('maia:thread'[\s\S]*?error/.test(join),
    'an adoption failure is swallowed rather than surfaced');
});
