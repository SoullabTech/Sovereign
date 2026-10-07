/**
 * JARVIS-JEV-01 / JEV-INT-05 — J1R5-WIRE CANDIDATE (connection experiment only)
 *
 * STATUS: CANDIDATE. Ratified by nobody. Authorizes nothing.
 * - No network client, no credential access, no environment reads live in this module.
 *   The transport is injected; with no transport the experiment cannot run.
 * - The frozen J1 host (jev-judgment-host-v1.mjs) is imported, never modified.
 * - Q_RISK only. Native observations are NEVER passed through the J1 admission path.
 * - The response-shape descriptor below is UNWITNESSED: it must be replaced by a founder-run
 *   schema witness (and the table version bumped) before any live call is allowed.
 *
 * Record: docs/programme/JARVIS-JEV-01_JEV-INT-05_WIRE_AMENDMENT_AND_SYNTHETIC_CONNECTION_TEST_PROPOSAL_2026-10-07.md
 */
import { createHash } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, writeSync } from 'node:fs';
import { TASK_SHAPES } from './routing-intelligence-j5-v1.mjs';
import { constructJevPacket, packetIsExact } from './jev-judgment-host-v1.mjs';

export const WIRE_VERSION = 'JEV-WIRE.v1';
export const MODEL_ID = 'jev-1.13.0';

/** ⛔ UNWITNESSED. Paths are assumptions to be replaced by a real schema witness. */
export const RESPONSE_SHAPE = Object.freeze({
  witnessed: false,
  model: Object.freeze(['model']),
  input_tokens: Object.freeze(['usage', 'input_tokens']),
  answer_type: Object.freeze(['questions', '$Q', 'type']),
  answer_noul: Object.freeze(['questions', '$Q', 'noul']),
});

export const QUESTION_TABLE = deepFreeze({
  table_version: 'jev-wire-q1',
  model: MODEL_ID,
  questions: {
    Q_RISK: {
      type: 'noul',
      instructions: 'Does this appear to cross a structural-risk boundary?',
    },
  },
  response_shape: RESPONSE_SHAPE,
});

export const BUDGET = Object.freeze({
  ceiling_usd: 1.0,
  max_attempts: 31,
  reserve_usd: 0.005,
  usd_per_input_token: 0.042 / 1_000_000,
});

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('NON_FINITE_NUMBER');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort()
      .map((key) => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  }
  throw new Error('UNSERIALIZABLE');
}

export const sha256Hex = (text) => createHash('sha256').update(text).digest('hex');
export const questionTableHash = () => sha256Hex(canonicalJson(QUESTION_TABLE));

const REFUSE = (reason) => Object.freeze({ ok: false, reason });
const exact = (value, members) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === members.length && members.every((m) => Object.hasOwn(value, m));

/** Build the single permitted wire body for a J1 packet. Nothing is sent. */
export function buildWireBody(packet) {
  if (!packetIsExact(packet)) return REFUSE('UNREPRESENTABLE');
  const entry = QUESTION_TABLE.questions[packet.question_id];
  if (!entry) return REFUSE('QUESTION_NOT_IN_TABLE');
  const body = {
    state: packet,
    model: QUESTION_TABLE.model,
    questions: { [packet.question_id]: { type: entry.type, instructions: entry.instructions } },
  };
  const bodyJson = canonicalJson(body);
  return deepFreeze({ ok: true, body, bodyJson, bodyHash: sha256Hex(bodyJson) });
}

/** Verify a body independently of how it was built. */
export function verifyWireBody(body) {
  if (!exact(body, ['state', 'model', 'questions'])) return REFUSE('WIRE_SHAPE');
  if (!packetIsExact(body.state)) return REFUSE('STATE_NOT_J1_PACKET');
  if (body.model !== QUESTION_TABLE.model) return REFUSE('MODEL_NOT_PINNED');
  const keys = body.questions && typeof body.questions === 'object' && !Array.isArray(body.questions)
    ? Object.keys(body.questions) : [];
  if (keys.length !== 1) return REFUSE('QUESTIONS_NOT_EXACTLY_ONE');
  if (keys[0] !== body.state.question_id) return REFUSE('QUESTION_KEY_MISMATCH');
  const table = QUESTION_TABLE.questions[keys[0]];
  if (!table) return REFUSE('QUESTION_NOT_IN_TABLE');
  const q = body.questions[keys[0]];
  if (!exact(q, ['type', 'instructions'])) return REFUSE('QUESTION_SHAPE');
  if (q.type !== table.type || q.instructions !== table.instructions) return REFUSE('WORDING_NOT_FROZEN');
  return Object.freeze({ ok: true });
}

// ── The frozen fixture allowlist ───────────────────────────────────────────

const BASE = Object.freeze({
  taskShape: 'CODE_GROUNDED', containsSensitive: false, requiresExternalInfo: false,
  fileCount: 1, migration: false, auth: false, production: false,
});
const st = (over) => ({ ...BASE, ...over });

function fixtureStates() {
  const f = [];
  TASK_SHAPES.forEach((taskShape, i) => f.push([`F0${i + 1}`, st({ taskShape })]));
  f.push(['F07', st({ migration: true })]);
  f.push(['F08', st({ auth: true })]);
  f.push(['F09', st({ production: true })]);
  f.push(['F10', st({ requiresExternalInfo: true })]);
  f.push(['F11', st({ fileCount: 0 })]);
  f.push(['F12', st({ fileCount: 10 })]);
  f.push(['F13', st({ fileCount: 10_000 })]);
  TASK_SHAPES.forEach((taskShape, i) => f.push([`F${14 + i}`,
    st({ taskShape, migration: true, auth: true, production: true })]));
  return f;
}
const REPEATED = Object.freeze(['F01', 'F10', 'F14']);

function buildAllowlist() {
  const list = [];
  for (const [id, state] of fixtureStates()) {
    const made = constructJevPacket(state, 'Q_RISK');
    if (!made.ok) throw new Error('FIXTURE_UNREPRESENTABLE:' + id);
    const wire = buildWireBody(made.packet);
    list.push({ attemptId: id, fixtureId: id, wire });
    if (REPEATED.includes(id)) {
      for (let n = 1; n <= 4; n += 1) list.push({ attemptId: `${id}.r${n}`, fixtureId: id, wire });
    }
  }
  return list;
}
const ALLOWLIST = deepFreeze(buildAllowlist());
const ALLOWED_HASHES = new Set(ALLOWLIST.map((a) => a.wire.bodyHash));

export const fixtureAttemptIds = () => ALLOWLIST.map((a) => a.attemptId);
export const fixtureListHash = () => sha256Hex(canonicalJson(ALLOWLIST.map((a) => [a.attemptId, a.wire.bodyHash])));

/** Experiment-specific no-send rule: a body not byte-identical to a frozen fixture is refused. */
export function isAllowlistedBody(body) {
  if (!verifyWireBody(body).ok) return false;
  return ALLOWED_HASHES.has(sha256Hex(canonicalJson(body)));
}

/** The runner takes an attempt id ONLY — never a state, a packet or a body. */
export function planAttempt(attemptId) {
  const hit = ALLOWLIST.find((a) => a.attemptId === attemptId);
  return hit ? hit.wire : REFUSE('NOT_IN_ALLOWLIST');
}

// ── Durable ledger: reservation is persisted BEFORE send ──────────────────

export function createLedger(path) {
  const read = () => {
    if (!existsSync(path)) return [];
    const text = readFileSync(path, 'utf8');
    if (text === '') return [];
    if (!text.endsWith('\n')) throw new Error('LEDGER_CORRUPT');
    return text.slice(0, -1).split('\n').map((line) => {
      try { return JSON.parse(line); } catch { throw new Error('LEDGER_CORRUPT'); }
    });
  };
  const append = (record) => {
    const fd = openSync(path, 'a');
    try { writeSync(fd, JSON.stringify(record) + '\n'); fsyncSync(fd); } finally { closeSync(fd); }
  };
  const state = () => {
    const records = read();
    const reserved = records.filter((r) => r.kind === 'reserved');
    const settled = new Map(records.filter((r) => r.kind === 'settled').map((r) => [r.attempt_id, r]));
    let usd = 0;
    for (const r of reserved) {
      const s = settled.get(r.attempt_id);
      usd += s && s.cost_known ? s.cost_usd : BUDGET.reserve_usd;
    }
    return {
      attempts: reserved.length,
      usd,
      halted: records.some((r) => r.kind === 'halted'),
      used: new Set(reserved.map((r) => r.attempt_id)),
    };
  };
  return { read, append, state };
}

// ── Native response parsing (shape descriptor is UNWITNESSED) ──────────────

const pick = (value, path, q) => path.reduce((acc, key) =>
  (acc && typeof acc === 'object' ? acc[key === '$Q' ? q : key] : undefined), value);

export function parseNativeResponse(raw, questionId) {
  const model = pick(raw, RESPONSE_SHAPE.model, questionId);
  const tokens = pick(raw, RESPONSE_SHAPE.input_tokens, questionId);
  const type = pick(raw, RESPONSE_SHAPE.answer_type, questionId);
  const p = pick(raw, RESPONSE_SHAPE.answer_noul, questionId);
  if (typeof model !== 'string') return REFUSE('RESPONSE_MODEL_MISSING');
  if (!Number.isInteger(tokens) || tokens < 0) return REFUSE('RESPONSE_USAGE_MISSING');
  if (type !== 'noul') return REFUSE('RESPONSE_TYPE');
  if (typeof p !== 'number' || !(p >= 0 && p <= 1)) return REFUSE('RESPONSE_PROBABILITY');
  return Object.freeze({ ok: true, model, input_tokens: tokens, p_yes: p });
}

// ── The experiment runner ──────────────────────────────────────────────────

/**
 * Run ONE frozen attempt. Returns a NativeObservation (never an admitted judgment).
 * `transport.send(bodyJson)` is injected; no network client exists in this module.
 */
export async function runAttempt({ attemptId, ledger, transport, now = () => Date.now() }) {
  const refused = (reason) => Object.freeze({ sent: false, reason });

  if (!transport || typeof transport.send !== 'function') return refused('TRANSPORT_NOT_CONNECTED');
  if (!RESPONSE_SHAPE.witnessed) return refused('RESPONSE_SHAPE_UNWITNESSED');

  const plan = planAttempt(attemptId);
  if (!plan.ok) return refused(plan.reason);
  if (!verifyWireBody(plan.body).ok) return refused('WIRE_VERIFY_FAILED');
  if (!isAllowlistedBody(plan.body)) return refused('NOT_IN_ALLOWLIST');

  let s;
  try { s = ledger.state(); } catch { return refused('LEDGER_UNREADABLE'); }
  if (s.halted) return refused('HALTED');
  if (s.used.has(attemptId)) return refused('ATTEMPT_ALREADY_USED');
  if (s.attempts >= BUDGET.max_attempts) return refused('ATTEMPT_CAP');
  if (s.usd + BUDGET.reserve_usd > BUDGET.ceiling_usd) return refused('BUDGET_CEILING');

  // hash and reservation are durable BEFORE anything is sent
  ledger.append({
    kind: 'reserved', attempt_id: attemptId, wire_body_hash: plan.bodyHash,
    table_version: QUESTION_TABLE.table_version, reserve_usd: BUDGET.reserve_usd, at: now(),
  });

  const started = now();
  let raw;
  try {
    raw = await transport.send(plan.bodyJson);
  } catch {
    // attempted / crossing unknown — reservation retained, experiment halts, no retry
    ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: false, outcome: 'crossing_unknown', at: now() });
    ledger.append({ kind: 'halted', reason: 'CROSSING_UNKNOWN', attempt_id: attemptId, at: now() });
    return Object.freeze({ sent: true, outcome: 'crossing_unknown', wire_body_hash: plan.bodyHash });
  }

  const questionId = plan.body.state.question_id;
  const parsed = parseNativeResponse(raw, questionId);
  if (!parsed.ok) {
    ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: false, outcome: parsed.reason, at: now() });
    ledger.append({ kind: 'halted', reason: parsed.reason, attempt_id: attemptId, at: now() });
    return Object.freeze({ sent: true, outcome: 'response_refused', reason: parsed.reason, wire_body_hash: plan.bodyHash });
  }

  const cost = parsed.input_tokens * BUDGET.usd_per_input_token;
  ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: true, cost_usd: cost, outcome: 'ok', at: now() });
  if (parsed.model !== QUESTION_TABLE.model) {
    ledger.append({ kind: 'halted', reason: 'MODEL_DRIFT', attempt_id: attemptId, at: now() });
  } else if (cost > BUDGET.reserve_usd) {
    ledger.append({ kind: 'halted', reason: 'UNEXPECTED_USAGE', attempt_id: attemptId, at: now() });
  }

  return Object.freeze({
    sent: true,
    outcome: 'ok',
    observation: Object.freeze({
      wire_body_hash: plan.bodyHash,
      table_version: QUESTION_TABLE.table_version,
      model_requested: QUESTION_TABLE.model,
      model_returned: parsed.model,
      p_yes: parsed.p_yes,
      billable_input_tokens: parsed.input_tokens,
      latency_ms: now() - started,
      provider_confidence_supplied: false,
    }),
  });
}
