/**
 * JARVIS Unit 17 — authority gates, resolution, and governed resumption
 *
 * Unit 16 established WHO answered. This establishes WHAT they answered.
 *
 *   Authentication proves who answered.
 *   It does not prove what they answered.
 *
 * Therefore an authenticated answer resolves a gate only when it explicitly
 * carries that gate's opaque identifier and the digest of the exact question as
 * issued. Nothing here searches for "the question this probably answers":
 * there is no similarity scoring, no recency heuristic, no conversational
 * adjacency, no model inference. Correspondence is by reference or it does not
 * exist.
 *
 * ── The terminal-run decision (§1, §8) ──────────────────────────────────────
 *
 * `ESCALATION_REQUIRED` stays terminal. A resolution does NOT reopen it, and no
 * `AWAITING_AUTHORITY` state is added. Instead a resolution authorizes a NEW run
 * carrying explicit lineage (`resumes_run_id`, `resolution_id`).
 *
 * This is more truthful than mutating a terminal disposition, and it yields the
 * sentence the whole unit exists to make provable:
 *
 *   "Run B was not admitted because JARVIS interpreted the founder as saying
 *    yes. Run B was admitted because Resolution R explicitly closed Gate Q from
 *    terminal Run A."
 *
 * Resumption is therefore *lineage*, not continuation — the cost of leaving the
 * Unit 11 state machine untouched, and worth paying.
 */

import { randomBytes, createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { verifyInstruction, AUTHORITY_REFUSAL, STANDING } from './jarvis-authority-channel.mjs';

// ── store ────────────────────────────────────────────────────────────────────
const AIN_HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const GATE_DIR = () => path.join(AIN_HOME(), 'authority-gates');
const RES_DIR = () => path.join(AIN_HOME(), 'authority-resolutions');

const GATE_ID_RE = /^gat-[0-9a-f]{12}$/;
const RESOLUTION_ID_RE = /^res-[0-9a-f]{12}$/;

function writeAtomic(dir, file, text) {
  mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp-${randomBytes(4).toString('hex')}`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

/** §4 — the digest binds an answer to the exact question as issued. */
export const questionDigest = (text) => createHash('sha256').update(String(text ?? ''), 'utf8').digest('hex');

// ── §5 typed resolution vocabulary ───────────────────────────────────────────
/**
 * The system validates a DECLARED resolution type. It never infers authorization
 * from prose. Free text may ride along as rationale; it can never close a gate.
 *
 * AMEND is included but deliberately narrow: its parameters are structured and
 * may only NARROW the continuation scope the gate already declared (§9, §11).
 * An amendment that widens scope is refused — that is the only way to keep
 * amendment safe without inventing a policy language.
 */
export const RESOLUTION_TYPES = Object.freeze(['APPROVE', 'REFUSE', 'AMEND']);

export const GATE_STATUS = Object.freeze({
  OPEN: 'OPEN', RESOLVED: 'RESOLVED', SUPERSEDED: 'SUPERSEDED', WITHDRAWN: 'WITHDRAWN',
});

export const GATE_REFUSAL = Object.freeze({
  GATE_REFERENCE_REQUIRED: 'GATE_REFERENCE_REQUIRED',
  GATE_UNKNOWN: 'GATE_UNKNOWN',
  GATE_NOT_OPEN: 'GATE_NOT_OPEN',
  GATE_DIGEST_MISMATCH: 'GATE_DIGEST_MISMATCH',
  RESOLUTION_TYPE_REQUIRED: 'RESOLUTION_TYPE_REQUIRED',
  RESOLUTION_TYPE_NOT_PERMITTED: 'RESOLUTION_TYPE_NOT_PERMITTED',
  AUTHORITY_CLASS_MISMATCH: 'AUTHORITY_CLASS_MISMATCH',
  AMENDMENT_WIDENS_SCOPE: 'AMENDMENT_WIDENS_SCOPE',
  AMENDMENT_INVALID: 'AMENDMENT_INVALID',
  RESOLUTION_UNKNOWN: 'RESOLUTION_UNKNOWN',
  RESOLUTION_NOT_APPROVING: 'RESOLUTION_NOT_APPROVING',
  RESUMPTION_LINEAGE_MISMATCH: 'RESUMPTION_LINEAGE_MISMATCH',
  RESUMPTION_SCOPE_EXCEEDED: 'RESUMPTION_SCOPE_EXCEEDED',
  GATE_INVALID: 'GATE_INVALID',
});

/** §16/§13 — the public surface never explains which of the checks caught it. */
export const PUBLIC_GATE_REFUSAL = 'AUTHORITY_NOT_ESTABLISHED';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const bound = (s, n = 2000) => (typeof s === 'string' && s.trim()
  ? s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n)
  : null);

// ── §2 the gate object ───────────────────────────────────────────────────────
/**
 * An immutable record of an UNRESOLVED authority question.
 *
 * A gate records a question, not permission. Creating one grants nothing.
 *
 * `continuation` is the bounded work the gate could unlock if approved — named
 * at gate creation, before any answer exists, so an answer can never choose its
 * own scope (§9).
 */
export function createGate(input = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  const question = bound(input.question);
  if (!question) return deny(GATE_REFUSAL.GATE_INVALID, 'an immutable question is required');
  if (typeof input.source_run_id !== 'string' || !input.source_run_id.trim()) {
    return deny(GATE_REFUSAL.GATE_INVALID, 'source_run_id is required — a gate always comes from real work');
  }
  if (input.authority_class !== 'FOUNDER' && input.authority_class !== 'OPERATOR') {
    return deny(GATE_REFUSAL.GATE_INVALID, `authority_class must be FOUNDER or OPERATOR, got '${input.authority_class}'`);
  }
  const vocab = Array.isArray(input.answer_vocabulary) && input.answer_vocabulary.length
    ? input.answer_vocabulary.slice()
    : ['APPROVE', 'REFUSE'];
  for (const v of vocab) {
    if (!RESOLUTION_TYPES.includes(v)) return deny(GATE_REFUSAL.GATE_INVALID, `unknown resolution type '${v}'`);
  }
  if (!isObj(input.continuation)) {
    return deny(GATE_REFUSAL.GATE_INVALID, 'a bounded continuation scope is required at gate creation');
  }

  const gate = {
    gate_id: `gat-${randomBytes(6).toString('hex')}`,
    status: GATE_STATUS.OPEN,
    source_run_id: input.source_run_id.trim(),
    authority_class: input.authority_class,
    question,
    question_digest: questionDigest(question),
    answer_vocabulary: vocab,
    // The exact bounded work this gate could unlock. Fixed before any answer.
    continuation: { ...input.continuation },
    subject: bound(input.subject, 240),
    created_at: now,
    resolved_by: null,
    resolution_id: null,
    superseded_by: null,
  };
  writeAtomic(GATE_DIR(), path.join(GATE_DIR(), `${gate.gate_id}.json`), JSON.stringify(gate, null, 2));
  return { ok: true, gate };
}

export function loadGate(id) {
  if (typeof id !== 'string' || !GATE_ID_RE.test(id)) return null;
  const f = path.join(GATE_DIR(), `${id}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

const saveGate = (g) => writeAtomic(GATE_DIR(), path.join(GATE_DIR(), `${g.gate_id}.json`), JSON.stringify(g, null, 2));

/**
 * §4 — amending a question does NOT edit it. It supersedes the gate with a new
 * one carrying a new digest, so answers to the old question can never silently
 * resolve the new one, and historical evidence stays intact.
 */
export function amendGateQuestion(gate_id, newQuestion, now = new Date().toISOString()) {
  const g = loadGate(gate_id);
  if (!g) return { ok: false, refusal: GATE_REFUSAL.GATE_UNKNOWN };
  const q = bound(newQuestion);
  if (!q) return { ok: false, refusal: GATE_REFUSAL.GATE_INVALID, reason: 'a question is required' };

  const created = createGate({
    question: q, source_run_id: g.source_run_id, authority_class: g.authority_class,
    answer_vocabulary: g.answer_vocabulary, continuation: g.continuation, subject: g.subject,
  }, now);
  if (!created.ok) return created;

  g.status = GATE_STATUS.SUPERSEDED;
  g.superseded_by = created.gate.gate_id;
  saveGate(g);
  return { ok: true, gate: created.gate, superseded: g };
}

// ── §3/§5/§6/§7 resolution ───────────────────────────────────────────────────
/**
 * Resolve a gate with an authenticated answer.
 *
 * Every one of these must hold, and each is checked against a RECORD rather than
 * against anything the caller asserts:
 *
 *   gate_id present            correspondence is by reference (§3)
 *   gate exists and is OPEN    no re-resolving settled questions (§12)
 *   digest matches             the question did not mutate (§4)
 *   typed resolution present   prose alone closes nothing (§5)
 *   type permitted by gate     the gate declared its own vocabulary
 *   instruction verifies       Unit 16 standing, still live (§14)
 *   role matches gate class    a valid reference is not sufficient (§6)
 */
export function resolveGate(input = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  // §3 — no gate reference, no resolution. This is the whole invariant.
  if (typeof input.gate_id !== 'string' || !input.gate_id.trim()) {
    return deny(GATE_REFUSAL.GATE_REFERENCE_REQUIRED,
      'an answer resolves nothing unless it explicitly references a gate');
  }
  const gate = loadGate(input.gate_id);
  if (!gate) return deny(GATE_REFUSAL.GATE_UNKNOWN, 'no such gate');
  if (gate.status !== GATE_STATUS.OPEN) {
    return deny(GATE_REFUSAL.GATE_NOT_OPEN, `gate is ${gate.status}`);
  }

  // §4 — bound to the exact question as issued.
  if (input.question_digest !== gate.question_digest) {
    return deny(GATE_REFUSAL.GATE_DIGEST_MISMATCH,
      'the answer is not bound to the question this gate actually asked');
  }

  // §5 — a declared type, from the gate's own vocabulary. Free text cannot close.
  const type = input.resolution_type;
  if (typeof type !== 'string' || !type.trim()) {
    return deny(GATE_REFUSAL.RESOLUTION_TYPE_REQUIRED,
      'a typed resolution is required; rationale text alone closes nothing');
  }
  if (!RESOLUTION_TYPES.includes(type) || !gate.answer_vocabulary.includes(type)) {
    return deny(GATE_REFUSAL.RESOLUTION_TYPE_NOT_PERMITTED,
      `gate permits ${gate.answer_vocabulary.join(', ')}`);
  }

  // §14 — Unit 16 supplies standing. Not reimplemented here.
  const v = verifyInstruction({ instruction_id: input.instruction_id }, now);
  if (!v.ok) return deny(v.refusal, v.reason);
  const instruction = v.instruction;

  // §6 — a valid gate reference is necessary but not sufficient.
  if (instruction.actor_role !== gate.authority_class) {
    const needed = gate.authority_class === 'FOUNDER'
      ? AUTHORITY_REFUSAL.FOUNDER_AUTHORITY_REQUIRED
      : AUTHORITY_REFUSAL.OPERATOR_AUTHORITY_REQUIRED;
    return deny(needed,
      `this gate requires ${gate.authority_class} authority; the answer carries ${instruction.actor_role}`);
  }
  // Historical, quoted and inferred material never reaches here — Unit 16 only
  // ever stamps these two standings on an instruction — but assert it anyway
  // rather than relying on a property of another module.
  if (instruction.standing !== STANDING.FOUNDER_INSTRUCTION && instruction.standing !== STANDING.OPERATOR_INSTRUCTION) {
    return deny(GATE_REFUSAL.AUTHORITY_CLASS_MISMATCH, `standing ${instruction.standing} cannot resolve a gate`);
  }

  // §11 — an amendment may only NARROW what the gate already declared.
  let continuation = { ...gate.continuation };
  if (type === 'AMEND') {
    const amendment = input.amendment;
    if (!isObj(amendment)) return deny(GATE_REFUSAL.AMENDMENT_INVALID, 'AMEND requires structured parameters');
    for (const [k, val] of Object.entries(amendment)) {
      if (!(k in gate.continuation)) {
        return deny(GATE_REFUSAL.AMENDMENT_WIDENS_SCOPE, `amendment introduces '${k}', which the gate never declared`);
      }
      const original = gate.continuation[k];
      if (Array.isArray(original)) {
        if (!Array.isArray(val) || !val.every((x) => original.includes(x))) {
          return deny(GATE_REFUSAL.AMENDMENT_WIDENS_SCOPE, `amendment widens '${k}'`);
        }
      } else if (val !== original) {
        return deny(GATE_REFUSAL.AMENDMENT_WIDENS_SCOPE, `amendment changes '${k}', which may only be narrowed`);
      }
      continuation[k] = val;
    }
  }

  const resolution = {
    resolution_id: `res-${randomBytes(6).toString('hex')}`,
    gate_id: gate.gate_id,
    source_run_id: gate.source_run_id,
    question_digest: gate.question_digest,
    resolution_type: type,
    // §9 — the scope this resolution actually unlocked, frozen at resolution.
    continuation: type === 'REFUSE' ? null : continuation,
    amendment: type === 'AMEND' ? { ...input.amendment } : null,
    authenticated_actor_id: instruction.authenticated_actor_id,
    actor_role: instruction.actor_role,
    standing: instruction.standing,
    instruction_id: instruction.instruction_id,
    channel_id: instruction.channel_id,
    rationale: bound(input.rationale, 1000),
    resolved_at: now,
    // §10 — a refusal is durable evidence, not an absence of one.
    permits_resumption: type !== 'REFUSE',
  };
  writeAtomic(RES_DIR(), path.join(RES_DIR(), `${resolution.resolution_id}.json`), JSON.stringify(resolution, null, 2));

  gate.status = GATE_STATUS.RESOLVED;
  gate.resolution_id = resolution.resolution_id;
  gate.resolved_by = instruction.authenticated_actor_id;
  saveGate(gate);

  return { ok: true, resolution, gate };
}

export function loadResolution(id) {
  if (typeof id !== 'string' || !RESOLUTION_ID_RE.test(id)) return null;
  const f = path.join(RES_DIR(), `${id}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

// ── §8/§9 governed resumption ────────────────────────────────────────────────
/**
 * Decide whether a resolution authorizes a specific new run.
 *
 * This grants no runtime authority by itself. It answers one question: may a new
 * run claiming this lineage be admitted, and within what scope? Unit 15
 * delegation and Unit 14 admission remain downstream and authoritative (§15).
 *
 * @param {object} req  { resolution_id, resumes_run_id, requested }
 *   `requested` is the bounded work identity of the NEW run, checked field by
 *   field against the continuation the gate declared before any answer existed.
 */
export function verifyResumption(req = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  const resolution = loadResolution(req.resolution_id);
  if (!resolution) return deny(GATE_REFUSAL.RESOLUTION_UNKNOWN, 'no such resolution');

  // §10 — a REFUSE resolution can never be repurposed as approval.
  if (!resolution.permits_resumption) {
    return deny(GATE_REFUSAL.RESOLUTION_NOT_APPROVING,
      `resolution ${resolution.resolution_type} does not permit resumption`);
  }

  // Lineage must match the gate's own source run, not whatever the caller says.
  if (req.resumes_run_id !== resolution.source_run_id) {
    return deny(GATE_REFUSAL.RESUMPTION_LINEAGE_MISMATCH,
      `this resolution closed a gate from ${resolution.source_run_id}`);
  }

  const gate = loadGate(resolution.gate_id);
  if (!gate) return deny(GATE_REFUSAL.GATE_UNKNOWN, 'the resolved gate is missing');
  // A gate superseded after resolution withdraws the resumption it authorized.
  if (gate.status !== GATE_STATUS.RESOLVED || gate.resolution_id !== resolution.resolution_id) {
    return deny(GATE_REFUSAL.GATE_NOT_OPEN, `gate is ${gate.status}`);
  }
  if (gate.question_digest !== resolution.question_digest) {
    return deny(GATE_REFUSAL.GATE_DIGEST_MISMATCH, 'the gate no longer asks the question that was answered');
  }

  // §9 scope conservation — the new run may not exceed what was unlocked.
  const requested = isObj(req.requested) ? req.requested : {};
  const allowed = resolution.continuation ?? {};
  for (const [k, val] of Object.entries(requested)) {
    if (!(k in allowed)) {
      return deny(GATE_REFUSAL.RESUMPTION_SCOPE_EXCEEDED, `'${k}' was never within the unlocked continuation`);
    }
    const permitted = allowed[k];
    if (Array.isArray(permitted)) {
      if (!Array.isArray(val) || !val.every((x) => permitted.includes(x))) {
        return deny(GATE_REFUSAL.RESUMPTION_SCOPE_EXCEEDED, `'${k}' exceeds the unlocked continuation`);
      }
    } else if (val !== permitted) {
      return deny(GATE_REFUSAL.RESUMPTION_SCOPE_EXCEEDED, `'${k}' differs from the unlocked continuation`);
    }
  }

  return { ok: true, resolution, gate, lineage: { resumes_run_id: resolution.source_run_id, resolution_id: resolution.resolution_id } };
}

/** §16 — what a public surface may know about a gate. No question text. */
export function publicGate(g) {
  if (!g) return null;
  return {
    gate_id: g.gate_id, status: g.status, authority_class: g.authority_class,
    source_run_id: g.source_run_id, question_digest: g.question_digest,
    answer_vocabulary: g.answer_vocabulary.slice(), subject: g.subject,
    created_at: g.created_at, resolution_id: g.resolution_id, superseded_by: g.superseded_by,
  };
}

export function publicResolution(r) {
  if (!r) return null;
  return {
    resolution_id: r.resolution_id, gate_id: r.gate_id, resolution_type: r.resolution_type,
    actor_role: r.actor_role, standing: r.standing, permits_resumption: r.permits_resumption,
    resolved_at: r.resolved_at,
  };
}

const listDir = (dir) => {
  mkdirSync(dir, { recursive: true });
  return readdirSync(dir).filter((f) => f.endsWith('.json') && !f.includes('.tmp-'))
    .map((f) => { try { return JSON.parse(readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
};
export const listGates = () => listDir(GATE_DIR());
export const listResolutions = () => listDir(RES_DIR());
