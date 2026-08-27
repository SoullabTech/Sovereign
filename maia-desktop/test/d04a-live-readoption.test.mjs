// MAIA-D04A — live re-adoption.
//
// D04 proved Desktop joins the member's thread at LAUNCH. It then adopted once
// and drifted: a member could continue on their phone for an hour while the
// open Desktop beside them kept showing, and appending to, the thread it found
// at sign-in. That is continuity as a snapshot. The Companion's claim is
// continuity as a field.
//
// These assertions are the founder's nine acceptance points. The decision is a
// pure function over observations, so all nine are provable without a network,
// a second device, or a clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createThreadWatch } = require('../src/thread-watch.js');

const KELLY = 'kelly';
const OTHER = 'someone-else';

/** A watch already joined to conversation A, as after sign-in. */
function onA() {
  const w = createThreadWatch();
  w.start(KELLY, 'conv-A');
  return w;
}

// ── 1–5. The core journey ───────────────────────────────────────────────────

test('1–5. ⭐ open on A, B becomes canonical elsewhere, Desktop adopts B', () => {
  const w = onA();
  const d = w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false });
  assert.equal(d.action, 'adopt');
  assert.equal(d.canonicalId, 'conv-B');
  assert.equal(d.from, 'conv-A', 'the decision names what it is leaving');

  w.noteAdopted('conv-B');
  assert.equal(w.adoptedId, 'conv-B');
});

test('adoption is recorded only after it succeeds — a failed adopt retries', () => {
  const w = onA();
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false }).action, 'adopt');
  // Caller's adoption failed, so noteAdopted was never called.
  assert.equal(w.adoptedId, 'conv-A', 'must not believe a change it did not make');
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false }).action, 'adopt');
});

// ── 6. An in-flight turn is never silently discarded ────────────────────────

test('6. ⭐ a turn in flight defers adoption rather than discarding it', () => {
  const w = onA();
  const d = w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: true });
  assert.equal(d.action, 'defer');
  assert.equal(d.reason, 'turn_in_flight');
  assert.equal(w.adoptedId, 'conv-A', 'the member is still waiting on this thread');
});

test('6b. the deferred change is not lost — it adopts once the turn completes', () => {
  const w = onA();
  w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: true });
  const after = w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false });
  assert.equal(after.action, 'adopt', 'deferring must not mean forgetting');
});

// ── 7. No cross-member adoption is possible ─────────────────────────────────

test('7. ⭐ another member signed in cannot cause adoption', () => {
  const w = onA();
  const d = w.observe({ memberId: OTHER, canonicalId: 'conv-B', turnInFlight: false });
  assert.equal(d.action, 'ignore');
  assert.equal(d.reason, 'member_mismatch');
  assert.equal(w.adoptedId, 'conv-A');
});

test('7b. signed out — a null member adopts nothing', () => {
  const w = onA();
  assert.equal(w.observe({ memberId: null, canonicalId: 'conv-B', turnInFlight: false }).reason, 'member_mismatch');
});

test('7c. ⭐ the member check runs BEFORE the change check', () => {
  // Otherwise a watch started for nobody (memberId null) would adopt anything
  // the server offered. Failing closed is the point.
  const w = createThreadWatch();
  w.start(null, 'conv-A');
  assert.equal(w.observe({ memberId: OTHER, canonicalId: 'conv-B', turnInFlight: false }).action, 'ignore');
  assert.equal(w.observe({ memberId: null, canonicalId: 'conv-B', turnInFlight: false }).action, 'ignore');
});

// ── 8. No Desktop-only thread state becomes authoritative ───────────────────

test('8. a stopped watch adopts nothing — Desktop holds no standing claim', () => {
  const w = onA();
  w.stop();
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false }).reason, 'not_watching');
  assert.equal(w.adoptedId, null);
  assert.equal(w.noteAdopted('conv-B').reason, 'not_watching', 'a stopped watch cannot record an adoption');
});

test('8b. no canonical thread is not an instruction to abandon the one we hold', () => {
  const w = onA();
  const d = w.observe({ memberId: KELLY, canonicalId: null, turnInFlight: false });
  assert.equal(d.action, 'ignore');
  assert.equal(d.reason, 'no_canonical');
  assert.equal(w.adoptedId, 'conv-A', 'absence of an answer must not fork the conversation');
});

// ── 9. No churn, no duplicate adoption ──────────────────────────────────────

test('9. ⭐ repeated unchanged reads produce nothing at all', () => {
  const w = onA();
  for (let i = 0; i < 50; i++) {
    const d = w.observe({ memberId: KELLY, canonicalId: 'conv-A', turnInFlight: false });
    assert.equal(d.action, 'ignore');
    assert.equal(d.reason, 'unchanged');
  }
});

test('9b. adopting twice does not happen — the second read is unchanged', () => {
  const w = onA();
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false }).action, 'adopt');
  w.noteAdopted('conv-B');
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-B', turnInFlight: false }).reason, 'unchanged');
});

test('a member signing back in re-arms the watch cleanly', () => {
  const w = onA();
  w.stop();
  w.start(KELLY, 'conv-B');
  assert.equal(w.isWatching, true);
  assert.equal(w.adoptedId, 'conv-B');
  assert.equal(w.observe({ memberId: KELLY, canonicalId: 'conv-C', turnInFlight: false }).action, 'adopt');
});
