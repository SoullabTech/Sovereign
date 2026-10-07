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
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, unlinkSync, writeSync } from 'node:fs';
import { TASK_SHAPES } from './routing-intelligence-j5-v1.mjs';
import { constructJevPacket, packetIsExact } from './jev-judgment-host-v1.mjs';

export const WIRE_VERSION = 'JEV-WIRE.v1';
export const MODEL_ID = 'jev-1.13.0';

/**
 * Response-shape descriptor. ⛔ `witnessed` stays false until a founder act sets it.
 * Paths were corrected after independent review against the public OpenAPI snapshot
 * (sha256 below): responses carry `answers` (not `questions`) and `usage.input_tokens` +
 * `usage.output_tokens`. ⚠️ The location of the model identity (`model`) was NOT stated in the
 * review message and is UNCONFIRMED here: a wrong path fails closed (response refused, experiment
 * halts); it is never guessed around. Any additional top-level member the schema lists must be added
 * to `top_level` at witness time; unlisted members are refused.
 */
export const RESPONSE_SHAPE = Object.freeze({
  witnessed: false,
  schema_sha256: 'a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5',
  top_level: Object.freeze(['model', 'usage', 'answers']),
  model_key: 'model',
  usage_keys: Object.freeze(['input_tokens', 'output_tokens']),
  answers_key: 'answers',
  answer_keys: Object.freeze(['type', 'noul']),
});

export const QUESTION_TABLE = deepFreeze({
  table_version: 'jev-wire-q2',
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
  timeout_ms: 30_000,
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

// ── Durable ledger: bound, validated, hash-chained, single-writer ──────────
//
// Legal events: init · reserved · observed · settled · halted.
// Rules: exactly one init, first, bound to this experiment (table, fixtures, schema) · every record
// carries seq/prev/hash so edits and mid-file removals are detected · reserved/observed/settled follow
// their legal transitions · a missing file is NOT a fresh experiment (it must be initialized
// explicitly) · every write happens under an exclusive lock so reserve-once holds across processes.
// Residual (declared, not solved): truncation to a valid prefix, or deliberate deletion of the file
// plus re-initialization, needs an external anchor; `head` is returned so an operator can keep one.

const LEDGER_KINDS = Object.freeze(['init', 'reserved', 'observed', 'settled', 'halted']);
const isStr = (v) => typeof v === 'string' && v.length > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const fail = (code) => { throw new Error(code); };

function recordHash(record) {
  const { hash: _omit, ...rest } = record;
  return sha256Hex(canonicalJson(rest));
}

function validateRecords(records, identity) {
  const reserved = new Set(); const observed = new Set(); const settled = new Set();
  let prev = 'GENESIS';
  records.forEach((r, i) => {
    if (!r || typeof r !== 'object' || Array.isArray(r)) fail('LEDGER_CORRUPT');
    if (!LEDGER_KINDS.includes(r.kind)) fail('LEDGER_CORRUPT');
    if (r.seq !== i || r.prev !== prev || r.hash !== recordHash(r)) fail('LEDGER_CORRUPT');
    prev = r.hash;
    if (i === 0 && r.kind !== 'init') fail('LEDGER_CORRUPT');
    if (i > 0 && r.kind === 'init') fail('LEDGER_CORRUPT');
    switch (r.kind) {
      case 'init':
        if (![r.experiment_id, r.table_hash, r.fixture_list_hash, r.schema_sha256].every(isStr)) fail('LEDGER_CORRUPT');
        if (r.experiment_id !== identity.experiment_id || r.table_hash !== identity.table_hash
          || r.fixture_list_hash !== identity.fixture_list_hash || r.schema_sha256 !== identity.schema_sha256) {
          fail('LEDGER_BINDING_MISMATCH');
        }
        break;
      case 'reserved':
        if (!isStr(r.attempt_id) || !isStr(r.wire_body_hash) || !isNum(r.reserve_usd)) fail('LEDGER_CORRUPT');
        if (reserved.has(r.attempt_id)) fail('LEDGER_CORRUPT');
        reserved.add(r.attempt_id);
        break;
      case 'observed':
        if (!isStr(r.attempt_id) || !reserved.has(r.attempt_id) || observed.has(r.attempt_id) || settled.has(r.attempt_id)) fail('LEDGER_CORRUPT');
        if (!r.observation || typeof r.observation !== 'object' || !isStr(r.response_sha256) || !isStr(r.response_canonical)) fail('LEDGER_CORRUPT');
        observed.add(r.attempt_id);
        break;
      case 'settled':
        if (!isStr(r.attempt_id) || !reserved.has(r.attempt_id) || settled.has(r.attempt_id)) fail('LEDGER_CORRUPT');
        if (typeof r.cost_known !== 'boolean' || !isStr(r.outcome)) fail('LEDGER_CORRUPT');
        if (r.cost_known && !isNum(r.cost_usd)) fail('LEDGER_CORRUPT');
        settled.add(r.attempt_id);
        break;
      case 'halted':
        if (!isStr(r.reason)) fail('LEDGER_CORRUPT');
        break;
      default: fail('LEDGER_CORRUPT');
    }
  });
}

function summarize(records) {
  const reserved = records.filter((r) => r.kind === 'reserved');
  const settled = new Map(records.filter((r) => r.kind === 'settled').map((r) => [r.attempt_id, r]));
  let usd = 0; const unresolved = [];
  for (const r of reserved) {
    const st = settled.get(r.attempt_id);
    if (!st) unresolved.push(r.attempt_id);
    usd += st && st.cost_known ? st.cost_usd : BUDGET.reserve_usd;
  }
  return {
    attempts: reserved.length,
    usd,
    halted: records.some((r) => r.kind === 'halted'),
    unresolved,
    used: new Set(reserved.map((r) => r.attempt_id)),
    head: records.length ? records[records.length - 1].hash : null,
  };
}

export function createLedger(path, binding = {}) {
  const lockPath = path + '.lock';
  const identity = {
    experiment_id: binding.experiment_id ?? 'JEV-INT-05-SYNTHETIC-Q_RISK-1',
    table_hash: questionTableHash(),
    fixture_list_hash: fixtureListHash(),
    schema_sha256: RESPONSE_SHAPE.schema_sha256,
  };

  const readRaw = () => {
    if (!existsSync(path)) fail('LEDGER_NOT_INITIALIZED');
    const text = readFileSync(path, 'utf8');
    if (text === '' || !text.endsWith('\n')) fail('LEDGER_CORRUPT');
    return text.slice(0, -1).split('\n').map((line) => {
      try { return JSON.parse(line); } catch { return fail('LEDGER_CORRUPT'); }
    });
  };
  const read = () => { const recs = readRaw(); validateRecords(recs, identity); return recs; };

  const withLock = (fn) => {
    let fd;
    try { fd = openSync(lockPath, 'wx'); } catch { return fail('LOCK_HELD'); }
    try { writeSync(fd, String(process.pid)); return fn(); }
    finally { closeSync(fd); try { unlinkSync(lockPath); } catch { /* lock already gone */ } }
  };

  const writeRecord = (records, record) => {
    const body = { ...record, seq: records.length, prev: records.length ? records[records.length - 1].hash : 'GENESIS' };
    const full = { ...body, hash: sha256Hex(canonicalJson(body)) };
    validateRecords([...records, full], identity);          // illegal transitions never reach disk
    const fd = openSync(path, 'a');
    try { writeSync(fd, JSON.stringify(full) + '\n'); fsyncSync(fd); } finally { closeSync(fd); }
    return full;
  };

  return {
    path,
    identity,
    read,
    state: () => summarize(read()),
    initialize: () => withLock(() => {
      if (existsSync(path)) fail('LEDGER_EXISTS');
      return writeRecord([], { kind: 'init', ...identity, at: Date.now() });
    }),
    append: (record) => withLock(() => writeRecord(read(), record)),
    /** Atomic across processes: evaluate the gate and persist the reservation under one lock. */
    reserveIfAllowed: (record, gate) => withLock(() => {
      const records = read();
      const refusal = gate(summarize(records));
      if (refusal) return { ok: false, reason: refusal };
      writeRecord(records, record);
      return { ok: true };
    }),
  };
}

// ── Native response parsing: the experiment's permitted shape, enforced exactly ──

const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v);
const sameKeys = (obj, keys) => Object.keys(obj).length === keys.length && keys.every((k) => Object.hasOwn(obj, k));

export function parseNativeResponse(raw, questionId) {
  const S = RESPONSE_SHAPE;
  if (!isPlain(raw) || !sameKeys(raw, S.top_level)) return REFUSE('RESPONSE_SHAPE_UNEXPECTED');
  const model = raw[S.model_key];
  if (typeof model !== 'string' || model === '') return REFUSE('RESPONSE_MODEL_MISSING');
  const usage = raw.usage;
  if (!isPlain(usage) || !sameKeys(usage, S.usage_keys)) return REFUSE('RESPONSE_USAGE_MISSING');
  if (!S.usage_keys.every((k) => Number.isInteger(usage[k]) && usage[k] >= 0)) return REFUSE('RESPONSE_USAGE_MISSING');
  const answers = raw[S.answers_key];
  if (!isPlain(answers) || !sameKeys(answers, [questionId])) return REFUSE('RESPONSE_ANSWERS_UNEXPECTED');
  const answer = answers[questionId];
  if (!isPlain(answer) || !sameKeys(answer, S.answer_keys)) return REFUSE('RESPONSE_ANSWER_SHAPE');
  if (answer.type !== 'noul') return REFUSE('RESPONSE_TYPE');
  if (typeof answer.noul !== 'number' || !(answer.noul >= 0 && answer.noul <= 1)) return REFUSE('RESPONSE_PROBABILITY');
  return Object.freeze({
    ok: true, model, input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, p_yes: answer.noul,
    response_canonical: canonicalJson(raw),
  });
}

// ── The experiment runner ──────────────────────────────────────────────────

/**
 * Run ONE frozen attempt. Returns a NativeObservation (never an admitted judgment).
 * `transport.send(bodyJson, { signal })` is injected; no network client exists in this module.
 * An observation is returned as `ok` ONLY after it has been durably recorded.
 */
export async function runAttempt({ attemptId, ledger, transport, now = () => Date.now(), timeoutMs = BUDGET.timeout_ms }) {
  const refused = (reason) => Object.freeze({ sent: false, reason });
  const CODES = ['LEDGER_NOT_INITIALIZED', 'LEDGER_BINDING_MISMATCH', 'LOCK_HELD'];

  if (!transport || typeof transport.send !== 'function') return refused('TRANSPORT_NOT_CONNECTED');
  if (!RESPONSE_SHAPE.witnessed) return refused('RESPONSE_SHAPE_UNWITNESSED');

  const plan = planAttempt(attemptId);
  if (!plan.ok) return refused(plan.reason);
  if (!verifyWireBody(plan.body).ok) return refused('WIRE_VERIFY_FAILED');
  if (!isAllowlistedBody(plan.body)) return refused('NOT_IN_ALLOWLIST');

  // hash and reservation are durable BEFORE anything is sent; the gate and the write share one lock
  let reservation;
  try {
    reservation = ledger.reserveIfAllowed({
      kind: 'reserved', attempt_id: attemptId, wire_body_hash: plan.bodyHash,
      table_version: QUESTION_TABLE.table_version, reserve_usd: BUDGET.reserve_usd, at: now(),
    }, (s) => {
      if (s.halted) return 'HALTED';
      if (s.unresolved.length > 0) return 'UNRESOLVED_ATTEMPT';
      if (s.used.has(attemptId)) return 'ATTEMPT_ALREADY_USED';
      if (s.attempts >= BUDGET.max_attempts) return 'ATTEMPT_CAP';
      if (s.usd + BUDGET.reserve_usd > BUDGET.ceiling_usd) return 'BUDGET_CEILING';
      return null;
    });
  } catch (e) {
    return refused(CODES.includes(e.message) ? e.message : 'LEDGER_UNREADABLE');
  }
  if (!reservation.ok) return refused(reservation.reason);

  const started = now();
  const crossingUnknown = (reason) => {
    try {
      ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: false, outcome: 'crossing_unknown', reason, at: now() });
      ledger.append({ kind: 'halted', reason: 'CROSSING_UNKNOWN', attempt_id: attemptId, at: now() });
    } catch { /* restart rule covers this: a reservation with no settlement is unresolved and blocks all sends */ }
    return Object.freeze({ sent: true, outcome: 'crossing_unknown', reason, wire_body_hash: plan.bodyHash });
  };

  // owned deadline: a transport that never resolves ends as crossing-unknown, not as a hang
  const controller = new AbortController();
  let timer; let raw;
  try {
    const sending = Promise.resolve().then(() => transport.send(plan.bodyJson, { signal: controller.signal }));
    sending.catch(() => {});                                  // a late rejection must not escape
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, timeoutMs);
    });
    raw = await Promise.race([sending, deadline]);
  } catch (e) {
    return crossingUnknown(e && e.message === 'TIMEOUT' ? 'TIMEOUT' : 'TRANSPORT_ERROR');
  } finally {
    clearTimeout(timer);
  }

  const questionId = plan.body.state.question_id;
  const parsed = parseNativeResponse(raw, questionId);
  if (!parsed.ok) {
    try {
      ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: false, outcome: parsed.reason, at: now() });
      ledger.append({ kind: 'halted', reason: parsed.reason, attempt_id: attemptId, at: now() });
    } catch { /* unresolved reservation blocks further sends on restart */ }
    return Object.freeze({ sent: true, outcome: 'response_refused', reason: parsed.reason, wire_body_hash: plan.bodyHash });
  }

  const observation = Object.freeze({
    wire_body_hash: plan.bodyHash,
    table_version: QUESTION_TABLE.table_version,
    model_requested: QUESTION_TABLE.model,
    model_returned: parsed.model,
    p_yes: parsed.p_yes,
    billable_input_tokens: parsed.input_tokens,
    output_tokens: parsed.output_tokens,
    latency_ms: now() - started,
    provider_confidence_supplied: false,
  });
  const cost = parsed.input_tokens * BUDGET.usd_per_input_token;

  // 1) the observation is persisted FIRST; "ok" is never returned for an unsaved result
  try {
    ledger.append({
      kind: 'observed', attempt_id: attemptId, observation,
      response_sha256: sha256Hex(parsed.response_canonical), response_canonical: parsed.response_canonical, at: now(),
    });
  } catch {
    try { ledger.append({ kind: 'halted', reason: 'OBSERVATION_NOT_PERSISTED', attempt_id: attemptId, at: now() }); } catch { /* see restart rule */ }
    return Object.freeze({ sent: true, outcome: 'observation_not_persisted', wire_body_hash: plan.bodyHash });
  }
  // 2) then the settlement
  let head = null;
  try {
    ledger.append({ kind: 'settled', attempt_id: attemptId, cost_known: true, cost_usd: cost, outcome: 'ok', at: now() });
    if (parsed.model !== QUESTION_TABLE.model) {
      ledger.append({ kind: 'halted', reason: 'MODEL_DRIFT', attempt_id: attemptId, at: now() });
    } else if (cost > BUDGET.reserve_usd) {
      ledger.append({ kind: 'halted', reason: 'UNEXPECTED_USAGE', attempt_id: attemptId, at: now() });
    }
    head = ledger.state().head;
  } catch {
    return Object.freeze({ sent: true, outcome: 'observation_persisted_settlement_incomplete', observation });
  }

  return Object.freeze({ sent: true, outcome: 'ok', observation, ledger_head: head });
}
