// @ts-check
/**
 * Defeat candidates for founder-workspace-viewmodel.v1 (B1).
 * Each is the smallest competent embodiment of ONE wrong belief about the
 * view-model, applied to a conforming reference. A candidate that survives
 * its named law repairs the SUITE, never the candidate (S3 Class-B discipline).
 */

/** @param {any} x */
const clone = (x) => JSON.parse(JSON.stringify(x));

export const CANDIDATES = Object.freeze([
  {
    id: 'DC-1', kills: 'VM-1', belief: 'a Monitor is clearer with one overall health score',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.monitor_summary = { score: 0.82, health: 'mostly fine' }; return c; },
  },
  {
    id: 'DC-2', kills: 'VM-2', belief: 'a value can be shown without naming what observed it or how fresh it is',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); const r = c.monitor[0]; delete r.instrument; r.freshness = 'fresh'; return c; },
  },
  {
    id: 'DC-3', kills: 'VM-3', belief: 'an obvious relationship may be drawn without a record that asserts it',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.graph.edges.push({ from: c.graph.nodes[0].id, to: c.graph.nodes[1].id, rel: 'obviously relates to' }); return c; },
  },
  {
    id: 'DC-4', kills: 'VM-4', belief: 'a hand-curated programme list may declare itself complete',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.programme_state.projector = 'manual'; c.programme_state.population.complete = true; return c; },
  },
  {
    id: 'DC-5', kills: 'VM-5', belief: 'an illustrative example may stand in for a live Work Unit until the real one exists',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.work.units.push({ id: 'wu-example', title: 'Example unit', plain: 'An example.', state: 'DRAFT', evidence_state: 'ILLUSTRATIVE' }); return c; },
  },
  {
    id: 'DC-6', kills: 'VM-6', belief: 'a commit is best labelled by its hash',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.graph.nodes.push({ id: 'c1', kind: 'commit', label: '51890bc0a1f', sub: 'O4 router' }); return c; },
  },
  {
    id: 'DC-7', kills: 'VM-7', belief: 'carrying needs_founder_count saves the renderer a loop',
    /** @param {any} vm */ apply(vm) { const c = clone(vm); c.work.needs_founder_count = 3; c.monitor_counts = { failed: 1 }; return c; },
  },
]);
