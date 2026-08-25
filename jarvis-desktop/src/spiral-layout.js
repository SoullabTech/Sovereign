// Living Spiral — PURE LAYOUT GEOMETRY.
//
// This module computes positions. It holds NO state, reads NO status, and
// decides NOTHING about standing. It is extracted from the renderer for one
// reason: the clearance rule below has to be FALSIFIABLE. A layout rule that
// cannot be shown to fail when removed is not a proof of anything.
//
// ── PRECEDENCE (founder ruling 2026-08-25) ───────────────────────────────
// Ring semantics win. Nodes yield.
//
// Radius carries STANDING. Exact angular position carries nothing. The ring
// labels — OBSERVED OPERATIONAL, NOT AUTHORIZED, IMPEDED, NOT OBSERVED — are
// what make the radial coordinate system mean anything at all. If their
// glyphs are overprinted, the geometry stops being readable as evidence.
//
// Therefore:
//   RING / STANDING        fixed semantic meaning
//   NODE RADIAL POSITION   PRESERVED — never moved for legibility
//   NODE ANGLE             adjustable within its own sector
//   NODE LABEL POSITION    adjustable tangentially / outward
//   RING LABEL GLYPHS      protected from overprint
//
// A node is NEVER pushed onto another radius to make the picture prettier.
// That would silently restate its standing.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisSpiralLayout = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Type metrics, matched to the stylesheet. Monospace advance is ~0.6em.
  const RING_LAB_FS = 7.2, RING_LAB_TRACK = 0.16;   // .sp-ring-lab
  const NODE_LAB_FS = 8.0,  NODE_LAB_TRACK = 0.02;  // .sp-node text
  const ringLabWidth = t => t.length * (RING_LAB_FS * 0.6 + RING_LAB_FS * RING_LAB_TRACK);
  const nodeLabWidth = t => t.length * (NODE_LAB_FS * 0.6 + NODE_LAB_FS * NODE_LAB_TRACK);

  // Ring labels are seated INSIDE their own ring, deep enough that the dot band
  // sitting ON that ring cannot reach them. At r=76 the sector is 72 degrees
  // wide and the label is ~110px: no angle inside the sector clears it, so
  // angular yield alone is provably insufficient at the innermost ring.
  const RING_LAB_INSET = 20;
  const PAD = 3;            // clearance added around the protected band
  const DOT_R = 7.5;        // largest dot radius plus its stroke
  const MAX_YIELD_DEG = 34; // a node may not leave its own 72-degree sector
  const LABEL_OUT = [4, 12, 20, 28, 36]; // label-only radial travel; the dot never moves

  const rect = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
  const hits = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

  /** Protected band for one ring label, padded. */
  function ringLabelBand(C, r, text) {
    const w = ringLabWidth(text), y = C - r + RING_LAB_INSET;
    return rect(C - w / 2 - PAD, y - 5.5 - PAD, C + w / 2 + PAD, y + 2 + PAD);
  }

  function dotBox(x, y) { return rect(x - DOT_R, y - DOT_R, x + DOT_R, y + DOT_R); }

  function labelBox(lx, ly, anchor, text) {
    const w = nodeLabWidth(text);
    const x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2;
    return rect(x0, ly - 6, x0 + w, ly + 2);
  }

  const anchorFor = cos => (cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle');

  /**
   * Place one node at a given angle. Radius is an input and never changes.
   * `labelOut` pushes only the LABEL radially outward — the dot stays on the
   * ring. At the innermost radius the sector is too narrow in arc for angular
   * yield alone, so the label is allowed to travel outward instead. The mark
   * itself never leaves its ring.
   */
  function place(C, rr, angDeg, within, label, labelOut) {
    const out = (labelOut === undefined ? 4 : labelOut);
    const ang = angDeg * Math.PI / 180;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const anchor = anchorFor(cos), pad = anchor === 'middle' ? 0 : 11;
    return {
      angDeg, anchor,
      x: C + cos * rr, y: C + sin * rr,
      lx: C + cos * (rr + out) + (anchor === 'start' ? pad : anchor === 'end' ? -pad : 0),
      ly: C + sin * (rr + out) + (anchor === 'middle'
            ? (sin < 0 ? -12 - (within % 2) * 14 : 17 + (within % 2) * 14)
            : 4 + (within % 2) * 13),
      label,
    };
  }

  /**
   * Move a node ANGULARLY along its own ring until neither its dot nor its
   * label overprints any ring-label band. Radius is never touched.
   *
   * `avoidRingLabels:false` disables the rule — that is the falsification
   * path, and the crowded fixture must overlap when it is off.
   */
  function resolve(C, rr, idealDeg, within, label, bands, opts) {
    const on = !opts || opts.avoidRingLabels !== false;
    let best = place(C, rr, idealDeg, within, label);
    if (!on) return { ...best, yieldedDeg: 0, labelOut: 4, clears: clearOf(best, bands) };
    if (clearOf(best, bands)) return { ...best, yieldedDeg: 0, labelOut: 4, clears: true };

    // Angle first — it is the cheapest move and preserves the reading of the
    // sector. Only when no angle inside the sector clears does the label travel
    // outward, and the dot still does not move.
    for (const out of LABEL_OUT) {
      for (let d = 0; d <= MAX_YIELD_DEG; d += 2) {
        for (const s of (d === 0 ? [1] : [1, -1])) {
          const cand = place(C, rr, idealDeg + s * d, within, label, out);
          if (clearOf(cand, bands)) {
            return { ...cand, yieldedDeg: s * d, labelOut: out, clears: true };
          }
        }
      }
    }
    // Nothing inside the sector clears. Report it rather than hiding it: the
    // node keeps its radius and its sector, and the caller learns the truth.
    const forced = place(C, rr, idealDeg + MAX_YIELD_DEG, within, label, LABEL_OUT[LABEL_OUT.length - 1]);
    return { ...forced, yieldedDeg: MAX_YIELD_DEG, labelOut: LABEL_OUT[LABEL_OUT.length - 1],
             clears: clearOf(forced, bands) };
  }

  function clearOf(p, bands) {
    const db = dotBox(p.x, p.y), lb = labelBox(p.lx, p.ly, p.anchor, p.label);
    return !bands.some(b => hits(db, b) || hits(lb, b));
  }

  return { ringLabelBand, dotBox, labelBox, place, resolve, clearOf, hits,
           RING_LAB_INSET, MAX_YIELD_DEG, ringLabWidth, nodeLabWidth };
});
