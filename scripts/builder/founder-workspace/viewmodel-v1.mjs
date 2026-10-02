// @ts-check
/**
 * founder-workspace-viewmodel.v1 — contract + validator
 * ═══════════════════════════════════════════════════════════════════════════
 * JARVIS-FOUNDER-WORKSPACE-01 / B1 (founder-authorized 2026-09-23, P0 adjudication §VI).
 *
 * The view-model is the ONLY thing the five-surface renderer may read
 * (FD-1). It is presentation: `presentation_only: true`, `authority_effect:
 * 'none'`. Nothing in it confers, requests or records authority. It is
 * derived from governed organs by pure adapters and is disposable.
 *
 * Laws (F2 §4, ratified by the P0 adjudication), each with a defeat candidate
 * in tests/constitutional/founder-workspace/candidates.mjs:
 *   VM-1  no aggregate / score field anywhere (DC-1 forbids the synthetic health score)
 *   VM-2  every monitor row names instrument + freshness (+ level, observed_at when current)
 *   VM-3  every graph edge carries evidence {kind, ref} and joins two existing nodes
 *   VM-4  population.complete may be true only when projector !== 'manual'
 *   VM-5  a LIVE view-model carries no ILLUSTRATIVE object (fixtures may)
 *   VM-6  a node label is never an identifier (commit sha / uuid) — human meaning first
 *   VM-7  counts are computed by the renderer from rows, never carried
 *
 * This module is pure: no fs, no process, no network, no Desktop import.
 */

export const SCHEMA = 'founder-workspace-viewmodel.v1';

export const MONITOR_LEVELS = Object.freeze(['good', 'warn', 'failed', 'unobserved', 'unauthorized']);
export const FRESHNESS = Object.freeze(['current', 'historical', 'none']);
export const EVIDENCE_STATES = Object.freeze([
  'OBSERVED', 'PARTIAL', 'INFERRED', 'UNVERIFIED', 'UNOBSERVED', 'ABSENT', 'NOT FOUND',
  'CANDIDATE', 'RATIFIED', 'SUPERSEDED', 'DELIBERATELY REFUSED', 'UNREADABLE', 'ILLUSTRATIVE',
]);

/** Keys that would carry an aggregate or a score. VM-1. */
const AGGREGATE_KEYS = /^(score|health_score|health|aggregate|overall|rollup|grade|percent(_\w+)?|status_score)$/i;
/** Keys that would carry a count the renderer must compute itself. VM-7. */
const COUNT_KEYS = /^(count|counts|total|totals|n_\w+|\w+_count|summary|headline_count)$/i;
/** An identifier wearing a label. VM-6. */
const IDENTIFIER_LABEL = /^(?:[0-9a-f]{7,40}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|r-[0-9a-f]{10}|wu-[0-9a-f]{6,})$/i;

const TOP_LEVEL = Object.freeze(['meta', 'programme_state', 'work', 'monitor', 'graph', 'provenance', 'vocabularies', 'events']);
const WORK_ARRAYS = Object.freeze(['units', 'history', 'handoffs', 'results']);

/**
 * @typedef {{ law: string, path: string, detail: string }} Violation
 * @typedef {{ ok: boolean, schema: string, mode: 'live'|'fixture', violations: Violation[] }} ValidationResult
 */

/**
 * Validate a candidate view-model.
 * @param {unknown} vm
 * @param {{ mode?: 'live'|'fixture' }} [opts]  live = what the renderer may consume; fixture = recorded prototype data
 * @returns {ValidationResult}
 */
export function validateViewModel(vm, opts = {}) {
  const mode = opts.mode === 'fixture' ? 'fixture' : 'live';
  /** @type {Violation[]} */
  const v = [];
  /** @param {string} law @param {string} path @param {string} detail */
  const fail = (law, path, detail) => { v.push({ law, path, detail }); };

  if (!isObj(vm)) {
    fail('VM-0', '$', 'view-model must be an object');
    return { ok: false, schema: SCHEMA, mode, violations: v };
  }
  const m = /** @type {Record<string, any>} */ (vm);

  // ── VM-0 shape ──────────────────────────────────────────────────────────
  for (const k of TOP_LEVEL) if (!(k in m)) fail('VM-0', `$.${k}`, 'required top-level key missing');
  if (m.schema !== undefined && m.schema !== SCHEMA) fail('VM-0', '$.schema', `schema must be ${SCHEMA}`);
  if (!isObj(m.meta)) fail('VM-0', '$.meta', 'meta must be an object');
  else {
    if (!nonEmpty(m.meta.observed_against)) fail('VM-0', '$.meta.observed_against', 'observed_against (canonical SHA or "unobserved") required');
    if (!nonEmpty(m.meta.observed_at) && !nonEmpty(m.meta.fixture_recorded_at)) fail('VM-0', '$.meta.observed_at', 'observed_at or fixture_recorded_at required (DC-1: every value names its time)');
  }
  for (const k of ['monitor', 'vocabularies', 'events']) if (k in m && !Array.isArray(m[k])) fail('VM-0', `$.${k}`, 'must be an array');
  if (!isObj(m.work)) fail('VM-0', '$.work', 'work must be an object');
  else for (const k of WORK_ARRAYS) if (!Array.isArray(m.work[k])) fail('VM-0', `$.work.${k}`, 'must be an array');
  if (!isObj(m.graph) || !Array.isArray(m.graph.nodes) || !Array.isArray(m.graph.edges)) fail('VM-0', '$.graph', 'graph must be {nodes[], edges[]}');
  if (!isObj(m.provenance)) fail('VM-0', '$.provenance', 'provenance must be an object');
  if (m.presentation_only !== undefined && m.presentation_only !== true) fail('VM-0', '$.presentation_only', 'if present must be true');
  if (m.authority_effect !== undefined && m.authority_effect !== 'none') fail('VM-0', '$.authority_effect', "if present must be 'none'");

  // ── VM-1 no aggregate / score ───────────────────────────────────────────
  walk(m, '$', (key, _val, path) => { if (AGGREGATE_KEYS.test(key)) fail('VM-1', path, `aggregate/score key '${key}' is forbidden (no synthetic health)`); });

  // ── VM-2 monitor rows ───────────────────────────────────────────────────
  if (Array.isArray(m.monitor)) m.monitor.forEach((row, i) => {
    const p = `$.monitor[${i}]`;
    if (!isObj(row)) { fail('VM-2', p, 'row must be an object'); return; }
    if (!nonEmpty(row.instrument)) fail('VM-2', `${p}.instrument`, 'instrument is mandatory (every value names what observed it)');
    if (!FRESHNESS.includes(row.freshness)) fail('VM-2', `${p}.freshness`, `freshness must be one of ${FRESHNESS.join('|')}`);
    if (!MONITOR_LEVELS.includes(row.level)) fail('VM-2', `${p}.level`, `level must be one of ${MONITOR_LEVELS.join('|')}`);
    if (row.freshness === 'current' && !nonEmpty(row.observed_at)) fail('VM-2', `${p}.observed_at`, 'a current observation must carry its time');
    if (row.freshness === 'none' && row.level === 'good') fail('VM-2', `${p}.level`, 'an unobserved row can never read good (no false calm)');
    if (!nonEmpty(row.subject)) fail('VM-2', `${p}.subject`, 'subject required');
    if (!nonEmpty(row.plain)) fail('VM-2', `${p}.plain`, 'plain sentence required (ordinary language first)');
    if (!nonEmpty(row.evidence_state)) fail('VM-2', `${p}.evidence_state`, 'evidence_state required');
  });

  // ── VM-3 edges ──────────────────────────────────────────────────────────
  if (isObj(m.graph) && Array.isArray(m.graph.nodes) && Array.isArray(m.graph.edges)) {
    const ids = new Set(m.graph.nodes.filter(isObj).map((n) => n.id));
    m.graph.edges.forEach((e, i) => {
      const p = `$.graph.edges[${i}]`;
      if (!isObj(e)) { fail('VM-3', p, 'edge must be an object'); return; }
      if (!isObj(e.evidence) || !nonEmpty(e.evidence.kind) || !nonEmpty(e.evidence.ref)) fail('VM-3', `${p}.evidence`, 'no evidence → no edge: evidence {kind, ref} mandatory');
      if (!ids.has(e.from)) fail('VM-3', `${p}.from`, `edge from unknown node '${e.from}'`);
      if (!ids.has(e.to)) fail('VM-3', `${p}.to`, `edge to unknown node '${e.to}'`);
      if (!nonEmpty(e.rel)) fail('VM-3', `${p}.rel`, 'rel required');
    });
    // VM-6 labels
    m.graph.nodes.forEach((n, i) => {
      const p = `$.graph.nodes[${i}]`;
      if (!isObj(n)) { fail('VM-6', p, 'node must be an object'); return; }
      if (!nonEmpty(n.id)) fail('VM-6', `${p}.id`, 'id required');
      if (!nonEmpty(n.label)) fail('VM-6', `${p}.label`, 'label required');
      else if (IDENTIFIER_LABEL.test(String(n.label).trim())) fail('VM-6', `${p}.label`, `label '${n.label}' is an identifier; human meaning first, identifiers in sub`);
    });
  }

  // ── VM-4 population / projector ─────────────────────────────────────────
  const ps = m.programme_state;
  if (!isObj(ps)) fail('VM-0', '$.programme_state', 'programme_state must be an object');
  else {
    if (ps.schema !== 'programme-state.v1') fail('VM-4', '$.programme_state.schema', "must be 'programme-state.v1'");
    if (!Array.isArray(ps.programmes)) fail('VM-4', '$.programme_state.programmes', 'programmes must be an array');
    if (!isObj(ps.population)) fail('VM-4', '$.programme_state.population', 'population block is mandatory (PS-9: population before totals)');
    else {
      const pop = ps.population;
      if (typeof pop.examined !== 'number' || typeof pop.emitted !== 'number') fail('VM-4', '$.programme_state.population', 'examined and emitted must be numbers');
      if (Array.isArray(ps.programmes) && typeof pop.emitted === 'number' && pop.emitted !== ps.programmes.length) fail('VM-4', '$.programme_state.population.emitted', `emitted (${pop.emitted}) must equal programmes.length (${ps.programmes.length})`);
      if (typeof pop.complete !== 'boolean') fail('VM-4', '$.programme_state.population.complete', 'complete must be a boolean');
      if (pop.complete === true) {
        if (!nonEmpty(ps.projector) || ps.projector === 'manual' || ps.projector === 'absent') fail('VM-4', '$.programme_state.population.complete', `complete:true requires a deterministic projector (projector='${ps.projector}')`);
        if (typeof pop.examined === 'number' && typeof pop.emitted === 'number') {
          const excluded = Array.isArray(pop.excluded_by_rule) ? pop.excluded_by_rule.length : 0;
          const classified = Array.isArray(pop.classified) ? pop.classified.length : 0;
          const unclassified = Array.isArray(pop.unclassified) ? pop.unclassified.length : 0;
          const unreadable = Array.isArray(pop.unreadable) ? pop.unreadable.length : 0;
          if (unclassified > 0 || unreadable > 0) fail('VM-4', '$.programme_state.population.complete', 'complete:true with unclassified or unreadable subjects (FD-3)');
          if (pop.emitted + excluded + classified !== pop.examined) fail('VM-4', '$.programme_state.population.complete', 'complete:true requires examined = emitted + excluded_by_rule + classified (FD-3)');
        }
      } else if (!nonEmpty(pop.why_not_complete)) fail('VM-4', '$.programme_state.population.why_not_complete', 'an incomplete population must say why');
    }
  }

  // ── VM-5 no ILLUSTRATIVE in a live view-model ───────────────────────────
  if (mode === 'live') walk(m, '$', (key, val, path) => {
    if (typeof val === 'string' && /ILLUSTRATIVE/i.test(val) && /evidence_state|state/.test(key)) fail('VM-5', path, 'ILLUSTRATIVE object in a live view-model (fixtures only)');
    if (key === 'illustrative' && val === true) fail('VM-5', path, 'illustrative:true in a live view-model');
  });

  // ── VM-7 no carried counts (population block is the one lawful exception) ─
  walk(m, '$', (key, _val, path) => {
    if (path.startsWith('$.programme_state.population')) return;
    if (COUNT_KEYS.test(key)) fail('VM-7', path, `count key '${key}' is carried; the renderer computes counts from rows`);
  });

  // work rows must carry evidence_state
  if (isObj(m.work)) for (const k of WORK_ARRAYS) if (Array.isArray(m.work[k])) m.work[k].forEach((row, i) => {
    if (!isObj(row) || !nonEmpty(row.evidence_state)) fail('VM-0', `$.work.${k}[${i}].evidence_state`, 'every work row carries evidence_state');
  });

  return { ok: v.length === 0, schema: SCHEMA, mode, violations: v };
}

/**
 * Throwing form for adapters/harness.
 * @param {unknown} vm @param {{ mode?: 'live'|'fixture' }} [opts]
 */
export function assertViewModel(vm, opts) {
  const r = validateViewModel(vm, opts);
  if (!r.ok) {
    const e = new Error(`${SCHEMA} invalid (${r.mode}): ` + r.violations.slice(0, 5).map((x) => `${x.law} ${x.path}: ${x.detail}`).join(' · '));
    /** @type {any} */ (e).violations = r.violations;
    throw e;
  }
  return r;
}

/** Laws a validator run may report. */
export const LAWS = Object.freeze(['VM-0', 'VM-1', 'VM-2', 'VM-3', 'VM-4', 'VM-5', 'VM-6', 'VM-7']);

// ── helpers ──────────────────────────────────────────────────────────────────
/** @param {unknown} x @returns {x is Record<string, any>} */
function isObj(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
/** @param {unknown} s */
function nonEmpty(s) { return typeof s === 'string' && s.trim().length > 0; }
/**
 * @param {unknown} node @param {string} path @param {(key: string, val: unknown, path: string) => void} visit
 */
function walk(node, path, visit, depth = 0) {
  if (depth > 12 || node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((x, i) => walk(x, `${path}[${i}]`, visit, depth + 1)); return; }
  for (const [k, val] of Object.entries(/** @type {Record<string, unknown>} */ (node))) {
    const p = `${path}.${k}`;
    visit(k, val, p);
    walk(val, p, visit, depth + 1);
  }
}
