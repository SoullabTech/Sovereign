// @ts-check
/**
 * JEV longitudinal calibration projection.
 *
 * Presentation-only. Reads an optional local evidence ledger and projects the
 * current admitted trust envelope. It never changes thresholds, grants
 * authority, activates a provider, or promotes a candidate calibration.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const JEV_CALIBRATION_SCHEMA = 'jev-longitudinal-calibration.v1';
const STATES = new Set(['UNASSESSED', 'OBSERVING', 'ADMITTED', 'RESTRICTED', 'DRIFTING', 'UNINTERPRETABLE']);

/** @param {NodeJS.ProcessEnv} env */
function calibrationDir(env = process.env) {
  return env.JARVIS_JEV_CALIBRATION_DIR || path.join(os.homedir(), '.jarvis', 'jev-calibration');
}

/** @param {string} file */
function readJson(file) {
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

/** @param {string} file */
function readJsonl(file) {
  if (!existsSync(file)) return [];
  try {
    return readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
  } catch { return []; }
}

/** @param {unknown} value @param {string} [fallback] */
function safeState(value, fallback = 'UNASSESSED') {
  return STATES.has(String(value)) ? String(value) : fallback;
}

/** @param {any} row */
function normalShape(row) {
  if (!row || typeof row !== 'object' || !row.task_shape) return null;
  return {
    task_shape: String(row.task_shape),
    state: safeState(row.state, 'UNASSESSED'),
    evidence_state: String(row.evidence_state || 'UNOBSERVED'),
    sample_size: Number.isFinite(Number(row.sample_size)) ? Number(row.sample_size) : 0,
    undercall_rate: Number.isFinite(Number(row.undercall_rate)) ? Number(row.undercall_rate) : null,
    max_undercall: Number.isFinite(Number(row.max_undercall)) ? Number(row.max_undercall) : null,
    abstention_rate: Number.isFinite(Number(row.abstention_rate)) ? Number(row.abstention_rate) : null,
    last_evaluated_at: typeof row.last_evaluated_at === 'string' ? row.last_evaluated_at : null,
    reason: typeof row.reason === 'string' ? row.reason : null,
  };
}

/** @param {any} row */
function normalEvent(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    at: typeof row.at === 'string' ? row.at : null,
    kind: String(row.kind || 'observation'),
    task_shape: row.task_shape ? String(row.task_shape) : null,
    from_state: row.from_state ? safeState(row.from_state) : null,
    to_state: row.to_state ? safeState(row.to_state) : null,
    reason: typeof row.reason === 'string' ? row.reason : null,
    evidence_ref: typeof row.evidence_ref === 'string' ? row.evidence_ref : null,
  };
}

/** @param {{ env?: NodeJS.ProcessEnv, now?: string }} [opts] */
export function projectJevCalibration({ env = process.env, now = new Date().toISOString() } = {}) {
  const dir = calibrationDir(env);
  const envelope = readJson(path.join(dir, 'admitted-envelope.json'));
  const measurements = readJson(path.join(dir, 'measurements.json'));
  const events = readJsonl(path.join(dir, 'events.jsonl')).map(normalEvent).filter(Boolean).slice(-30).reverse();
  const shapes = Array.isArray(measurements?.shapes) ? measurements.shapes.map(normalShape).filter(Boolean) : [];
  const admittedShapes = new Set(Array.isArray(envelope?.task_shapes) ? envelope.task_shapes.map(String) : []);

  const projectedShapes = shapes.map((/** @type {any} */ s) => ({
    ...s,
    state: admittedShapes.has(s.task_shape) && s.state === 'OBSERVING' ? 'ADMITTED' : s.state,
  }));
  const states = projectedShapes.map((/** @type {any} */ s) => s.state);
  const state = states.includes('DRIFTING') ? 'DRIFTING'
    : states.includes('RESTRICTED') ? 'RESTRICTED'
    : states.includes('UNINTERPRETABLE') ? 'UNINTERPRETABLE'
    : projectedShapes.some((/** @type {any} */ s) => s.state === 'ADMITTED') ? 'ADMITTED'
    : projectedShapes.length ? 'OBSERVING'
    : 'UNASSESSED';

  return {
    schema: JEV_CALIBRATION_SCHEMA,
    state,
    evidence_state: envelope || measurements || events.length ? 'OBSERVED' : 'UNOBSERVED',
    observed_at: now,
    policy: {
      reduction_requires_admitted_shape: true,
      uncertainty_expands_cognition: true,
      self_widening_forbidden: true,
      provider_activation_authorized: false,
    },
    shapes: projectedShapes,
    recent_events: events,
    source: {
      kind: 'local calibration evidence',
      directory_present: existsSync(dir),
      envelope_present: !!envelope,
      measurements_present: !!measurements,
      events_present: events.length > 0,
    },
  };
}

/** @param {any} calibration */
export function jevCalibrationMonitorRows(calibration) {
  const rows = [];
  const base = {
    group: 'Judgment quality',
    instrument: 'JEV longitudinal calibration',
    observed_at: calibration.observed_at,
    freshness: 'current',
    evidence_state: calibration.evidence_state,
  };
  if (calibration.state === 'UNASSESSED') {
    rows.push({ ...base, subject: 'JEV calibration', plain: 'No admitted longitudinal calibration evidence is available yet.', value: 'UNASSESSED', level: 'unobserved' });
    return rows;
  }
  for (const shape of calibration.shapes) {
    const attention = ['DRIFTING', 'RESTRICTED', 'UNINTERPRETABLE'].includes(shape.state);
    rows.push({
      ...base,
      subject: `JEV · ${shape.task_shape}`,
      plain: shape.reason || (attention ? 'This task shape is not currently trusted for cognitive reduction.' : 'Calibration evidence is being tracked for this task shape.'),
      value: shape.state,
      level: attention ? 'warn' : (shape.state === 'ADMITTED' ? 'good' : 'unobserved'),
    });
  }
  return rows;
}
