// JOP-02b — RING-LABEL CLEARANCE.
//
// Founder ruling 2026-08-25: ring semantics win, nodes yield. Radius carries
// standing; angle carries nothing. Ring labels are what make the radial
// coordinate readable, so their glyphs are protected and nodes move angularly.
//
// The live witness on build 194b659ec found node dots overprinting the glyphs
// of OBSERVED OPERATIONAL, and "Local model worker" intersecting NOT AUTHORIZED.
// These controls fail if that returns.
//
// The falsification block is the point of this file: with the clearance rule
// switched OFF, the crowded fixture MUST overlap. A rule that cannot be shown
// to fail when removed proves nothing.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const LAY = require(path.join(SRC, 'spiral-layout.js'));

const C = 250, R0 = 76, STEP = 44;
const rOf = i => R0 + i * STEP;
const RINGS = ['OBSERVED OPERATIONAL', 'NOT AUTHORIZED', 'IMPEDED', 'NOT OBSERVED'];
const PHEN = ['transformation', 'conveyance', 'consolidation', 'discrimination', 'composition'];
const bands = RINGS.map((k, i) => LAY.ringLabelBand(C, rOf(i), k));

/** Lay out a fixture the way the renderer does. */
function layout(nodes, opts) {
  return nodes.map((n) => {
    const ring = n.ring, sector = PHEN.indexOf(n.phenomenon);
    const peers = nodes.filter(m => m.phenomenon === n.phenomenon && m.ring === ring);
    const within = peers.indexOf(n);
    const rr = rOf(ring);
    const perPeer = Math.min(30, (74 / (2 * Math.PI * rr)) * 360);
    const spread = peers.length > 1 ? (within - (peers.length - 1) / 2) * perPeer : 0;
    const text = n.label.length > 24 ? n.label.slice(0, 22) + '…' : n.label;
    return { n, rr, ring, ...LAY.resolve(C, rr, sector * 72 - 90 + spread, within, text, bands, opts) };
  });
}

// The density that actually failed on 194b659ec: the top sector, inner ring.
const REALISTIC = [
  { label: 'Builder execution mechanism', phenomenon: 'transformation', ring: 0 },
  { label: 'Local model worker',          phenomenon: 'transformation', ring: 0 },
  { label: 'Claude reasoning',            phenomenon: 'discrimination', ring: 0 },
  { label: 'Automatic C3 execution',      phenomenon: 'discrimination', ring: 1 },
  { label: 'Deterministic registry',      phenomenon: 'discrimination', ring: 0 },
  { label: 'Builder OS',                  phenomenon: 'composition',    ring: 0 },
  { label: 'Image-context isolation',     phenomenon: 'transformation', ring: 2 },
  { label: 'Spiral state persistence',    phenomenon: 'conveyance',     ring: 2 },
  { label: 'C0 Operator Desktop',         phenomenon: 'discrimination', ring: 3 },
];

// Deliberately crowded: every phenomenon stacked on the innermost ring, where
// the sector is widest in degrees and narrowest in arc.
const CROWDED = PHEN.flatMap(ph =>
  [0, 1].flatMap(ring =>
    [0, 1, 2].map(k => ({ label: `${ph} organ number ${k}`, phenomenon: ph, ring }))));

describe('JOP-02b · ring-label glyphs are not overprinted', () => {
  for (const [name, fixture] of [['realistic', REALISTIC], ['crowded', CROWDED]]) {
    test(`${name} density: no dot or node label intersects a ring-label band`, () => {
      const offenders = layout(fixture).filter(p => !p.clears)
        .map(p => `${p.n.label} (ring ${p.ring}, yielded ${p.yieldedDeg}deg)`);
      assert.deepEqual(offenders, [], `overprinting ring labels: ${offenders.join('; ')}`);
    });
  }

  test('the two specific pairs from the live witness are clear', () => {
    const laid = layout(REALISTIC);
    for (const label of ['Local model worker', 'Builder execution mechanism']) {
      const p = laid.find(q => q.n.label === label);
      assert.equal(p.clears, true, `${label} still overprints a ring label`);
    }
  });
});

describe('JOP-02b · nodes yield ANGULARLY only — standing is never restated', () => {
  test('every node keeps the exact radius of its own ring', () => {
    for (const p of layout(CROWDED)) {
      const d = Math.hypot(p.x - C, p.y - C);
      assert.ok(Math.abs(d - rOf(p.ring)) < 1e-9,
        `${p.n.label} moved radially: ${d} != ${rOf(p.ring)}`);
    }
  });

  test('no node leaves its own 72-degree sector', () => {
    for (const p of layout(CROWDED)) {
      assert.ok(Math.abs(p.yieldedDeg) <= LAY.MAX_YIELD_DEG,
        `${p.n.label} yielded ${p.yieldedDeg}deg, beyond its sector`);
    }
  });
});

describe('JOP-02b · FALSIFICATION — removing the rule reproduces the overlap', () => {
  test('with clearance OFF, the realistic fixture overprints ring labels', () => {
    const off = layout(REALISTIC, { avoidRingLabels: false }).filter(p => !p.clears);
    assert.ok(off.length > 0,
      'clearance disabled produced no overlap — the control cannot detect the defect it exists for');
  });

  test('with clearance OFF, the crowded fixture overprints ring labels', () => {
    const off = layout(CROWDED, { avoidRingLabels: false }).filter(p => !p.clears);
    assert.ok(off.length > 0, 'crowded fixture did not overlap with the rule disabled');
  });

  test('turning the rule ON strictly reduces overlaps on the same fixture', () => {
    const off = layout(CROWDED, { avoidRingLabels: false }).filter(p => !p.clears).length;
    const on = layout(CROWDED).filter(p => !p.clears).length;
    assert.ok(on < off, `rule did not reduce overlaps (off=${off}, on=${on})`);
  });
});

describe('JOP-02b · the protected band matches where the glyphs actually draw', () => {
  test('band vertical centre tracks RING_LAB_INSET, not a stale constant', () => {
    const b = LAY.ringLabelBand(C, rOf(0), RINGS[0]);
    const drawnY = C - rOf(0) + LAY.RING_LAB_INSET;
    assert.ok(b.y0 < drawnY && drawnY < b.y1,
      'protected band does not contain the drawn baseline — it would protect empty space');
  });
});
