// JOP-01 — Operator legibility proof.
//
// Acceptance is the founder's question: can someone determine whether JARVIS is
// working, what it is connected to, what it can do, and what needs them —
// without knowing the architecture? These assert the facts that question rests on.
//
// The load-bearing guard is the LAST describe(): no presentation path may
// upgrade a refusal into health. A prettier screen that reports a governed
// refusal as READY is worse than the UNKNOWN it replaced, because UNKNOWN at
// least prompted a question.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const L = require(path.join(HERE, '..', 'src', 'legibility.js'));

// ── fixtures: shaped exactly as jarvis:status emits ─────────────────────────
const UNBOUND = {
  observed_at: '2026-08-16T00:00:00.000Z',
  repo_root: 'UNKNOWN (packaged mode) — set JARVIS_REPO_ROOT, or run from inside a checkout with all four canonical markers',
  repo_root_mode: 'packaged',
  sessions: [],
  builder_os: { state: 'UNKNOWN', detail: null },
  route_a: { state: 'UNKNOWN', detail: null },
  local_worker: { state: 'UNKNOWN', detail: null },
  claude_lane: { state: 'AVAILABLE', detail: 'Router can select C3; Desktop Alpha does not auto-execute it.' },
  builder_mechanism: { state: 'UNAVAILABLE', detail: 'no execution substrate is bound — bind a repository before submitting work units' },
  governance_holds: [],
  desktop_runtime: { state: 'AVAILABLE', detail: 'Electron 32, node 20' },
};

const BOUND_NO_MECHANISM = {
  ...UNBOUND,
  repo_root: '/Users/soullab/OldCheckout',
  repo_root_mode: 'dev',
  builder_os: { state: 'DEGRADED', detail: 'session.mjs status failed: not found' },
  route_a: { state: 'UNAVAILABLE', detail: 'deterministic.mjs not found on this checkout' },
  local_worker: { state: 'UNAVAILABLE', detail: 'Ollama unreachable at 127.0.0.1:11434' },
  builder_mechanism: {
    state: 'UNAVAILABLE',
    detail: 'the bound repository does not carry the builder execution mechanism — missing jarvis-runtime-pipeline.mjs, jarvis-context.mjs in /Users/soullab/OldCheckout/scripts/builder',
  },
};

const READY_STATE = {
  ...UNBOUND,
  repo_root: '/Users/soullab/MAIA-SOVEREIGN',
  repo_root_mode: 'dev',
  builder_os: { state: 'AVAILABLE', detail: { active: 0, limit: 3, queued: 0, sessions: [] } },
  route_a: { state: 'AVAILABLE', detail: '12 deterministic capabilities registered' },
  local_worker: { state: 'AVAILABLE', detail: 'Ollama reachable, qwen2.5 present' },
  builder_mechanism: { state: 'AVAILABLE', detail: "governed work-unit lane 'local-native' (read-only)" },
};

// ─────────────────────────────────────────────────────────────────────────────
describe('IS JARVIS WORKING? — the operational sentence is derived, not hard-coded', () => {
  test('unbound says it cannot operate, and why', () => {
    const v = L.deriveOperatorView(UNBOUND);
    assert.match(v.headline, /cannot operate/i);
    assert.match(v.sentence, /no sovereign repository is connected/i);
  });

  test('bound-but-no-mechanism is a DIFFERENT sentence from unbound', () => {
    const a = L.deriveOperatorView(UNBOUND);
    const b = L.deriveOperatorView(BOUND_NO_MECHANISM);
    assert.notEqual(a.headline, b.headline, 'the two must not read the same');
    assert.match(b.headline, /connected/i);
    assert.match(b.sentence, /does not carry the execution mechanism/i);
  });

  test('ready says it is operating, and names the lane as read-only-governed', () => {
    const v = L.deriveOperatorView(READY_STATE);
    assert.match(v.headline, /operating/i);
    assert.match(v.sentence, /governed read-only execution lane is available/i);
  });

  test('the sentence never claims operation while the mechanism is unavailable', () => {
    for (const fx of [UNBOUND, BOUND_NO_MECHANISM]) {
      assert.doesNotMatch(L.deriveOperatorView(fx).headline, /^JARVIS is operating/);
    }
  });
});

describe('WHAT IS IT CONNECTED TO? — binding carries cause and remedy', () => {
  test('unbound surfaces the mechanism\'s OWN reason and remediation, not a paraphrase', () => {
    const b = L.deriveOperatorView(UNBOUND).binding;
    assert.equal(b.bound, false);
    assert.equal(b.state, L.NEEDS_SETUP);
    assert.ok(b.reason, 'a reason is mandatory');
    assert.ok(b.remediation, 'a remediation is mandatory');
    assert.match(b.remediation, /JARVIS_REPO_ROOT/, 'must carry the actual remedy the mechanism states');
  });

  test('bound reports the root and needs no remediation', () => {
    const b = L.deriveOperatorView(READY_STATE).binding;
    assert.equal(b.bound, true);
    assert.equal(b.root, '/Users/soullab/MAIA-SOVEREIGN');
    assert.equal(b.state, L.READY);
    assert.equal(b.remediation, null);
  });
});

describe('the JOP-00 distinctions survive presentation', () => {
  test('NO REPO BOUND and REPO BOUND / MECHANISM ABSENT give different reasons', () => {
    const a = L.deriveOperatorView(UNBOUND).organs.find(o => /mechanism/i.test(o.name));
    const b = L.deriveOperatorView(BOUND_NO_MECHANISM).organs.find(o => /mechanism/i.test(o.name));
    assert.notEqual(a.reason, b.reason);
    assert.notEqual(a.remediation, b.remediation);
  });

  test('the missing modules stay NAMED all the way to the surface', () => {
    const m = L.deriveOperatorView(BOUND_NO_MECHANISM).organs.find(o => /mechanism/i.test(o.name));
    assert.match(m.reason, /jarvis-runtime-pipeline\.mjs/);
    assert.match(m.reason, /jarvis-context\.mjs/);
  });

  test('unobserved organs say they were NOT OBSERVED, and why — not UNKNOWN', () => {
    const v = L.deriveOperatorView(UNBOUND);
    for (const name of ['Builder OS', 'Deterministic registry', 'Local model worker']) {
      const o = v.organs.find(x => x.name === name);
      assert.equal(o.state, L.UNVERIFIED, `${name} must be UNVERIFIED, not a health claim`);
      assert.match(o.reason, /not observed/i, `${name} must say it was not observed`);
      assert.match(o.evidence, /not reached/, `${name} must declare the aperture`);
      assert.ok(o.remediation, `${name} must say what would allow observation`);
    }
  });

  test('no organ is ever left with a null reason while non-ready', () => {
    for (const fx of [UNBOUND, BOUND_NO_MECHANISM, READY_STATE]) {
      for (const o of L.deriveOperatorView(fx).organs) {
        if (o.state === L.READY) continue;
        assert.ok(o.reason, `${o.name} in ${o.state} must carry a reason`);
      }
    }
  });
});

describe('C3 — available reasoning is not executable authority', () => {
  test('Claude reasoning and automatic C3 are TWO facts, not one row', () => {
    const v = L.deriveOperatorView(READY_STATE);
    const r = v.organs.find(o => o.name === 'Claude reasoning');
    const x = v.organs.find(o => o.name === 'Automatic C3 execution');
    assert.ok(r && x, 'both must exist independently');
    assert.equal(r.state, L.READY);
    assert.equal(x.state, L.NEEDS_AUTHORITY);
  });

  test('absent-by-design does not read as broken', () => {
    const x = L.deriveOperatorView(READY_STATE).organs.find(o => o.name === 'Automatic C3 execution');
    assert.equal(x.by_design, true);
    assert.notEqual(x.state, L.FAILED);
    assert.notEqual(x.state, L.DEGRADED);
    assert.equal(x.remediation, null, 'no operator act grants this — offering one would be a lie');
  });

  test('C3 is listed under not_authorized, never under available', () => {
    const c = L.deriveOperatorView(READY_STATE).capabilities;
    assert.ok(c.not_authorized.some(o => o.name === 'Automatic C3 execution'));
    assert.ok(!c.available.some(o => o.name === 'Automatic C3 execution'));
  });
});

describe('WHAT IS IT DOING? — observed, never inferred', () => {
  test('no sessions on a readable governor reports none observed', () => {
    const w = L.deriveOperatorView(READY_STATE).active_work;
    assert.equal(w.observable, true);
    assert.match(w.summary, /no active work observed/i);
  });

  test('an unreadable governor does NOT claim zero work — it claims no observation', () => {
    const w = L.deriveOperatorView(BOUND_NO_MECHANISM).active_work;
    assert.equal(w.observable, false);
    assert.match(w.summary, /not observed/i);
    assert.doesNotMatch(w.summary, /no active work/i, 'unobserved must not be reported as empty');
  });

  test('sessions are reported when the governor actually reports them', () => {
    const w = L.deriveOperatorView({ ...READY_STATE, sessions: [{ session_id: 's1', work_unit: 'u1' }] }).active_work;
    assert.equal(w.sessions.length, 1);
    assert.match(w.summary, /1 session/i);
  });
});

describe('DOES ANYTHING NEED ME? — no fabrication in either direction', () => {
  test('no holds says so plainly', () => {
    assert.match(L.deriveOperatorView(READY_STATE).needs_founder.summary,
      /nothing currently requires founder action/i);
  });

  test('a technical failure is NOT promoted into a founder decision', () => {
    const n = L.deriveOperatorView(BOUND_NO_MECHANISM).needs_founder;
    assert.equal(n.items.length, 0, 'a broken checkout is an operator act, not a founder ruling');
    assert.match(n.summary, /nothing currently requires founder action/i);
  });

  test('a real governance hold is surfaced', () => {
    const n = L.deriveOperatorView({
      ...READY_STATE,
      governance_holds: [{ id: 's9', unit: 'u9', claim_state: 'STALE', held: 'HELD' }],
    }).needs_founder;
    assert.equal(n.items.length, 1);
    assert.match(n.summary, /1 item/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regressions from the 2026-08-16 founder walk. The walk FAILED on these; the
// structural proof above had passed while the screen was still unusable, which
// is precisely why the walk is a required acceptance step and not a formality.
describe('FOUNDER-WALK REGRESSIONS — a badge alone is never a founder-facing fact', () => {
  const holdsFor = (claim_state) => L.deriveOperatorView({
    ...READY_STATE, governance_holds: [{ id: 's1', unit: 'u1', claim_state, held: 'HELD' }],
  }).needs_founder.items[0];

  test('every hold explains what its state MEANS — walk found bare STALE/CAPACITY badges', () => {
    for (const cs of ['STALE', 'AMBIGUOUS_OWNERSHIP', 'CAPACITY']) {
      const h = holdsFor(cs);
      assert.ok(h.means && h.means.length > 20, `${cs} must say what it means`);
      assert.ok(h.remediation && h.remediation.length > 10, `${cs} must say what to do`);
      assert.doesNotMatch(h.means, new RegExp(`^${cs}$`), 'the raw token is not an explanation');
    }
  });

  test('the governor\'s own claim_state is preserved, not replaced', () => {
    assert.equal(holdsFor('STALE').claim_state, 'STALE');
  });

  test('CAPACITY is explained as not-broken — queueing is not a fault', () => {
    assert.match(holdsFor('CAPACITY').remediation, /nothing is broken/i);
  });

  test('an UNRECOGNISED hold state is described as unrecognised, not left bare', () => {
    const h = holdsFor('SOMETHING_NEW');
    assert.match(h.means, /unrecognised/i);
    assert.match(h.means, /SOMETHING_NEW/);
    assert.ok(h.remediation, 'even an unknown hold must offer a next step');
  });

  test('provenance rows carry reason + remediation — walk found a bare UNKNOWN', () => {
    const r = L.describeProvenanceRow('Artifact identity', { state: 'UNKNOWN', detail: 'JARVIS — dev (unpackaged)' });
    assert.equal(r.state, L.UNVERIFIED);
    assert.ok(r.reason, 'a bare UNKNOWN badge is the defect this unit exists to remove');
    assert.match(r.reason, /normal when running from source/i, 'must not read as broken');
    assert.ok(r.remediation);
    assert.equal(r.by_design, true);
  });

  test('a stamped packaged build reads READY with nothing to explain away', () => {
    const r = L.describeProvenanceRow('Artifact identity', { state: 'AVAILABLE', detail: 'Desktop build abc1234' });
    assert.equal(r.state, L.READY);
    assert.equal(r.reason, null);
    assert.equal(r.remediation, null);
  });

  test('provenance still cannot be upgraded — a refusal stays non-operational', () => {
    for (const raw of ['UNAVAILABLE', 'DEGRADED', 'UNKNOWN', undefined]) {
      const r = L.describeProvenanceRow('x', { state: raw });
      assert.ok(L.NON_OPERATIONAL.includes(r.state));
    }
  });
});

describe('SABOTAGE — no path may upgrade a refusal into health', () => {
  test('every non-AVAILABLE raw state maps to a non-operational founder state', () => {
    for (const raw of ['UNAVAILABLE', 'DEGRADED', 'UNKNOWN', null, undefined, 'LANE_NOT_PERMITTED', 'FAILED', 'nonsense']) {
      const m = L.mapState(raw);
      assert.ok(L.NON_OPERATIONAL.includes(m),
        `raw '${raw}' mapped to '${m}' — a refusal must never become operational`);
    }
  });

  test('an UNRECOGNISED state defaults to UNVERIFIED, never READY', () => {
    assert.equal(L.mapState('SOMETHING_NEW_NOBODY_MAPPED'), L.UNVERIFIED);
  });

  test('a mechanism refusal can never appear in capabilities.available', () => {
    for (const fx of [UNBOUND, BOUND_NO_MECHANISM]) {
      const c = L.deriveOperatorView(fx).capabilities;
      assert.ok(!c.available.some(o => /mechanism/i.test(o.name)),
        'an unavailable mechanism must never be listed as available');
    }
  });

  test('LANE_NOT_PERMITTED reaching the surface is not rendered as READY', () => {
    const v = L.deriveOperatorView({
      ...READY_STATE,
      builder_mechanism: { state: 'LANE_NOT_PERMITTED', detail: "runtime accepts local-native only; got 'claude-c3'" },
    });
    const m = v.organs.find(o => /mechanism/i.test(o.name));
    assert.equal(m.state, L.UNVERIFIED, 'an unmapped refusal falls to UNVERIFIED');
    assert.notEqual(m.state, L.READY);
    assert.doesNotMatch(v.headline, /^JARVIS is operating/);
  });

  test('an empty status object does not produce a healthy screen', () => {
    const v = L.deriveOperatorView({});
    assert.match(v.headline, /cannot operate/i);
    assert.ok(v.organs.every(o => o.state !== L.READY),
      'nothing may be READY when nothing was observed');
  });

  test('a null status does not throw and does not claim health', () => {
    const v = L.deriveOperatorView(null);
    assert.match(v.headline, /cannot operate/i);
  });
});
