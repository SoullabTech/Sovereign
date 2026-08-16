// JOP-02 — Living Spiral projection proof.
//
// The single most important property is PROJECTION PURITY: if the Spiral needs
// to know something, it obtains that meaning from the governed derivation seam
// or renders an aperture. It must never be clever enough to reconstruct truth.
//
// The last two describes() are the stop-defect guards. They are the reason this
// file exists — a spiral that quietly re-derives state would look identical on
// screen and be epistemically worthless.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src');
const L = require(path.join(SRC, 'legibility.js'));
const S = require(path.join(SRC, 'spiral.js'));

const UNBOUND = {
  observed_at: '2026-08-16T00:00:00.000Z',
  repo_root: 'UNKNOWN (packaged mode) — set JARVIS_REPO_ROOT, or run from inside a checkout with all four canonical markers',
  repo_root_mode: 'packaged', sessions: [],
  builder_os: { state: 'UNKNOWN', detail: null },
  route_a: { state: 'UNKNOWN', detail: null },
  local_worker: { state: 'UNKNOWN', detail: null },
  claude_lane: { state: 'AVAILABLE', detail: 'Router can select C3; Desktop does not auto-execute it.' },
  builder_mechanism: { state: 'UNAVAILABLE', detail: 'no execution substrate is bound — bind a repository before submitting work units' },
  governance_holds: [], desktop_runtime: { state: 'AVAILABLE', detail: 'Electron 32' },
};
const READY = {
  ...UNBOUND, repo_root: '/repo', repo_root_mode: 'dev',
  builder_os: { state: 'AVAILABLE', detail: { active: 0, limit: 3, queued: 0, sessions: [] } },
  route_a: { state: 'AVAILABLE', detail: '12 deterministic capabilities registered' },
  local_worker: { state: 'AVAILABLE', detail: 'Ollama reachable' },
  builder_mechanism: { state: 'AVAILABLE', detail: "governed lane 'local-native' (read-only)" },
};
const proj = (fx) => S.projectSpiral(L.deriveOperatorView(fx));

// ── 1 ────────────────────────────────────────────────────────────────────────
describe('1. the Spiral renders the SAME governed assertion as the legibility path', () => {
  test('every node standing equals its organ state, verbatim', () => {
    for (const fx of [UNBOUND, READY]) {
      const view = L.deriveOperatorView(fx);
      const sp = S.projectSpiral(view);
      for (const organ of view.organs) {
        const n = sp.nodes.find(x => x.id === organ.name);
        assert.ok(n, `${organ.name} must appear`);
        assert.equal(n.standing, organ.state, `${organ.name}: spiral must not restate the assertion`);
        assert.equal(n.reason, organ.reason || null);
      }
    }
  });

  test('the spiral introduces no node the derivation did not assert', () => {
    const view = L.deriveOperatorView(READY);
    const known = new Set([...view.organs.map(o => o.name), 'Sovereign binding']);
    for (const n of S.projectSpiral(view).nodes) assert.ok(known.has(n.id), `invented node: ${n.id}`);
  });
});

// ── 2, 3, 4 ──────────────────────────────────────────────────────────────────
describe('2-4. unknowns stay unknown; missing evidence yields apertures', () => {
  test('UNVERIFIED organs stay UNVERIFIED — never upgraded by projection', () => {
    const sp = proj(UNBOUND);
    for (const id of ['Builder OS', 'Deterministic registry', 'Local model worker']) {
      assert.equal(sp.nodes.find(n => n.id === id).standing, 'UNVERIFIED');
    }
  });

  test('an unobserved organ is NOT flagged as needing attention', () => {
    const sp = proj(UNBOUND);
    const n = sp.nodes.find(x => x.id === 'Builder OS');
    assert.equal(n.disturbance.kind, 'UNOBSERVED');
    assert.equal(n.disturbance.needs_attention, false,
      'not-looked-at is not the same as broken; conflating them manufactures alarm');
  });

  test('apertures are declared, and name the limit AND its consequence', () => {
    const sp = proj(UNBOUND);
    assert.ok(sp.apertures.length >= 2);
    for (const a of sp.apertures) {
      assert.ok(a.subject && a.limit && a.consequence, 'an aperture must state what it could not establish');
    }
    assert.ok(sp.apertures.some(a => a.subject === 'custody layer (radial axis)'),
      'the radial axis has no lawful source and must say so rather than be invented');
  });

  test('absence is never converted to false', () => {
    const sp = proj(UNBOUND);
    for (const n of sp.nodes) {
      if (n.standing === 'UNVERIFIED') {
        assert.notEqual(n.standing, false);
        assert.ok(n.reason, 'an unobserved node must carry why it was not observed');
      }
    }
  });
});

// ── 5 ────────────────────────────────────────────────────────────────────────
describe('5. standing, disturbance and witness stay distinct dimensions', () => {
  test('by-design absence is disturbance BY_DESIGN and needs no attention', () => {
    const n = proj(READY).nodes.find(x => x.id === 'Automatic C3 execution');
    assert.equal(n.standing, 'NEEDS_AUTHORITY');
    assert.equal(n.disturbance.kind, 'BY_DESIGN');
    assert.equal(n.disturbance.needs_attention, false);
  });

  test('a genuinely impeded organ IS flagged, and is a different kind', () => {
    const n = proj(UNBOUND).nodes.find(x => x.id === 'Builder execution mechanism');
    assert.equal(n.disturbance.kind, 'IMPEDED');
    assert.equal(n.disturbance.needs_attention, true);
  });

  test('evidence is carried as its own dimension, not folded into standing', () => {
    for (const n of proj(UNBOUND).nodes) {
      assert.ok('evidence' in n, `${n.id} must carry its evidence pointer separately`);
    }
  });
});

// ── 6 ────────────────────────────────────────────────────────────────────────
describe('6. unsupported topology is absent — edges need assembly-point evidence', () => {
  test('all-READY yields NO edges: co-occurrence is not composition', () => {
    assert.equal(proj(READY).edges.length, 0,
      'two organs both working is not evidence they compose');
  });

  test('the blocking edge appears ONLY where the mechanism itself said so', () => {
    const sp = proj(UNBOUND);
    assert.ok(sp.edges.length > 0);
    for (const e of sp.edges) {
      assert.equal(e.from, 'Sovereign binding');
      assert.equal(e.kind, 'BLOCKS_OBSERVATION');
      assert.match(e.evidence, /no repository is bound/i,
        'every edge must quote the assembly-point evidence that licensed it');
    }
  });
});

// ── 7 ────────────────────────────────────────────────────────────────────────
describe('7. motion is UNOBSERVED without lawful history', () => {
  test('every node, in every fixture, reports UNOBSERVED motion with a reason', () => {
    for (const fx of [UNBOUND, READY]) {
      for (const n of proj(fx).nodes) {
        assert.equal(n.motion.state, 'UNOBSERVED', `${n.id} must not claim motion`);
        assert.equal(n.motion.reason, 'no lawful temporal evidence source');
      }
    }
  });

  test('a perfectly healthy static node is NOT reported as stable', () => {
    for (const n of proj(READY).nodes) {
      for (const forbidden of ['stable', 'improving', 'declining', 'steady', 'degrading']) {
        assert.doesNotMatch(String(n.motion.state), new RegExp(forbidden, 'i'),
          'nothing-changed-while-I-looked is not steadiness');
      }
    }
  });
});

// ── the nasty one ────────────────────────────────────────────────────────────
describe('REGRESSION — a fully-READY system must not become a glowing "healthy" one', () => {
  test('all organs READY + no assembly evidence + no temporal evidence', () => {
    const sp = proj(READY);
    assert.ok(sp.nodes.every(n => ['READY', 'NEEDS_AUTHORITY'].includes(n.standing)),
      'fixture invariant: this is the all-good case');

    assert.equal(sp.edges.length, 0, 'no assembly-point evidence ⇒ 0 composition edges');
    assert.ok(sp.nodes.every(n => n.motion.state === 'UNOBSERVED'), 'no temporal evidence ⇒ motion UNOBSERVED');
    assert.equal(sp.attention.length, 0, 'nothing is typed as needing attention');

    // …and none of that is allowed to become a positive claim about the whole.
    const out = JSON.stringify(sp);
    for (const w of ['healthy', 'all good', 'nominal', 'green', 'ok_count', 'uptime']) {
      assert.doesNotMatch(out, new RegExp(w, 'i'), `"${w}" would convert absence-of-alarm into a health claim`);
    }
    assert.ok(!('health' in sp) && !('score' in sp) && !('summary' in sp),
      'the projection must offer no whole-system verdict at all');
    assert.ok(sp.apertures.length >= 2,
      'even in the all-good case the apertures must remain visible — this is where a dashboard would go quiet and lie');
  });

  test('the axes declare their own meaning so geometry cannot imply maturity', () => {
    const sp = proj(READY);
    assert.equal(sp.axes.radial.means, 'standing');
    for (const forbidden of ['custody', 'maturity', 'importance', 'health']) {
      assert.ok(sp.axes.radial.not.includes(forbidden), `radius must explicitly disclaim '${forbidden}'`);
    }
    assert.equal(sp.axes.custody.state, 'UNOBSERVED');
    assert.equal(sp.axes.custody.encoded_spatially, false,
      'custody must be written, never drawn — a ring would be read as deployment maturity');
  });

  test('renaming the phenomena leaves geometry and logic unchanged', () => {
    // Elemental names are labels. Nothing may key on them, so a projection
    // computed with different labels must be structurally identical.
    const sp = proj(READY);
    const relabelled = JSON.parse(JSON.stringify(sp));
    for (const n of relabelled.nodes) n.phenomenon = 'ANYTHING';
    assert.equal(relabelled.nodes.length, sp.nodes.length);
    assert.equal(relabelled.edges.length, sp.edges.length);
    assert.deepEqual(relabelled.nodes.map(n => n.standing), sp.nodes.map(n => n.standing));
  });
});

// ── 8 + stop defects ─────────────────────────────────────────────────────────
describe('8. no alternate verification or state machinery was introduced', () => {
  const src = readFileSync(path.join(SRC, 'spiral.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

  test('the module imports nothing — no fs, no net, no ipc, no git', () => {
    for (const f of ['require(', 'import ', 'fetch(', 'ipcRenderer', 'child_process', 'node:fs', 'execFile', 'XMLHttpRequest']) {
      assert.ok(!src.includes(f), `spiral.js must not reference ${f} — projection reads only its input`);
    }
  });

  test('no persistence: it holds no store and writes nothing', () => {
    for (const f of ['localStorage', 'writeFile', 'sessionStorage', 'indexedDB', 'new Map(', 'globalThis.']) {
      assert.ok(!src.includes(f), `spiral.js must not use ${f} — it is not a state store`);
    }
  });

  test('no aggregate health, score, or confidence anywhere in the projection', () => {
    const out = JSON.stringify(proj(READY));
    for (const k of ['score', 'health', 'confidence', 'percent', 'overall', 'rating']) {
      assert.doesNotMatch(out, new RegExp(`"[a-z_]*${k}[a-z_]*"\\s*:`, 'i'), `aggregate '${k}' is prohibited`);
    }
  });

  test('no verification vocabulary: it displays verdicts, never reaches one', () => {
    for (const f of ['verifyEvidence', 'checkAuthority', 'validatePacket', 'adjudicat']) {
      assert.ok(!src.includes(f), `spiral.js must not contain ${f} — it is not a verifier`);
    }
  });

  test('the projection cannot mutate the view it was given', () => {
    const view = L.deriveOperatorView(READY);
    const before = JSON.stringify(view);
    S.projectSpiral(view);
    assert.equal(JSON.stringify(view), before, 'a renderer may not change the assertion it displays');
  });

  test('phenomenon is presentation only — nothing branches on it', () => {
    // It may be read for placement, but must never gate meaning.
    assert.ok(!/if\s*\([^)]*phenomenon/.test(src), 'no control flow may depend on the phenomenon alias');
    assert.ok(!/switch\s*\([^)]*phenomenon/.test(src));
    const sp = proj(READY);
    for (const n of sp.nodes) assert.ok(Object.keys(S.PHENOMENA).includes(n.phenomenon));
  });

  test('elemental vocabulary is absent — jurisdiction ruling 2026-08-16', () => {
    for (const e of ['Fire', 'Water', 'Earth', 'Aether', 'Spiralogic']) {
      assert.ok(!src.replace(/canonical JARVIS operational vocabulary[\s\S]*?collapse distinct referents\./, '').includes(e),
        `${e} belongs to MAIA's member-facing vocabulary and must not name a JARVIS phenomenon`);
    }
  });

  test('no member is representable as a node', () => {
    const out = JSON.stringify(proj(READY)).toLowerCase();
    for (const k of ['member_id', 'member_element', 'inner_state', 'engagement']) {
      assert.ok(!out.includes(k), `${k} is not an operator-spiral claim type`);
    }
  });
});
