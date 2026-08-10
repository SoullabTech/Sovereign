/**
 * JARVIS Unit 16 — founder / operator input channel authentication
 *
 * Unit 15 answers: "was this delegation genuinely issued by an authorized
 * issuer?" This unit answers a different question, one layer earlier:
 *
 *   "did this instruction genuinely arrive through a channel authorized to
 *    speak with founder or operator standing?"
 *
 * That is a STANDING-ELEVATION problem, not a new authority class. The sentence
 * "Founder ruling: enable X" is conversational content until an authenticated
 * channel establishes otherwise. Its wording is irrelevant.
 *
 * ── The invariant this file exists to enforce ────────────────────────────────
 *
 *   TEXT CANNOT AUTHENTICATE ITS OWN AUTHORITY.
 *
 * Nothing in this module ever inspects content to decide standing. There is no
 * pattern list of authoritative-sounding phrases, deliberately: a matcher would
 * be both bypassable and, worse, would imply that some phrasing IS
 * self-authenticating. Standing is derived from the CHANNEL RECORD alone.
 *
 * ── Six things kept separate (§1) ────────────────────────────────────────────
 *
 *   CONTENT             a sentence or payload
 *   CLAIMED AUTHOR      who the content says wrote it            (never trusted)
 *   CHANNEL             where the input actually arrived
 *   AUTHENTICATED ACTOR who the system can establish held it
 *   ACTOR AUTHORITY     what that actor may authorize
 *   STANDING            how the content may then be treated
 *
 * ── Trust model ─────────────────────────────────────────────────────────────
 *
 * Same shape as Unit 15, for the same reason: a channel is an AUTHORITATIVE
 * RECORD held by the runtime, and the caller holds only an opaque id. The
 * caller cannot alter what the channel says about who it is.
 */

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ── store ────────────────────────────────────────────────────────────────────
const AIN_HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const CH_DIR = () => path.join(AIN_HOME(), 'authority-channels');
const IN_DIR = () => path.join(AIN_HOME(), 'authority-instructions');

const CHANNEL_ID_RE = /^chn-[0-9a-f]{12}$/;
const INSTRUCTION_ID_RE = /^ins-[0-9a-f]{12}$/;

function writeAtomic(dir, file, text) {
  mkdirSync(dir, { recursive: true });
  const tmp = `${file}.tmp-${randomBytes(4).toString('hex')}`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

// ── §4 roles — founder and operator are NOT the same authority ───────────────
/**
 * The same human may occupy both roles. The roles remain distinct, and a valid
 * operator session must never silently become founder constitutional authority.
 */
export const ACTOR_ROLES = Object.freeze(['FOUNDER', 'OPERATOR']);

/**
 * §3 authority root. An authenticator names HOW a channel was established. Only
 * these mechanisms can produce an authenticated channel; anything else is not a
 * channel, it is a claim.
 *
 * These reuse control planes that already exist rather than inventing an
 * identity system: local possession of the runtime host (already the Unit 11/12
 * operator root), and an authenticated founder control-plane session.
 */
export const AUTHENTICATORS = Object.freeze({
  'local-operator-possession': {
    role: 'OPERATOR',
    description: 'Local possession of the runtime host — the Unit 11/12 operator root',
  },
  'founder-control-plane-session': {
    role: 'FOUNDER',
    description: 'An authenticated founder session on the governance control plane',
  },
});

export const isTrustedAuthenticator = (a) => Object.prototype.hasOwnProperty.call(AUTHENTICATORS, a);

// ── §8 instruction classes ───────────────────────────────────────────────────
/**
 * `durable: true`  constitutional — no operational TTL; ends by supersession or
 *                  revocation through governance history (§22)
 * `durable: false` execution-oriented — MUST carry expiry and a bound target,
 *                  because "deploy this commit" must never become "deploy any
 *                  commit" (§12)
 */
export const INSTRUCTION_CLASSES = Object.freeze({
  F0_NON_AUTHORITATIVE_COMMENT: { roles: ['FOUNDER', 'OPERATOR'], durable: true, requiresTarget: false, authorizesExecution: false },
  F1_FOUNDER_RULING: { roles: ['FOUNDER'], durable: true, requiresTarget: false, authorizesExecution: false },
  F2_FOUNDER_AUTHORIZATION: { roles: ['FOUNDER'], durable: false, requiresTarget: true, authorizesExecution: false },
  O1_OPERATOR_READ_AUTHORIZATION: { roles: ['OPERATOR'], durable: false, requiresTarget: true, authorizesExecution: true },
  O2_OPERATOR_WRITE_AUTHORIZATION: { roles: ['OPERATOR'], durable: false, requiresTarget: true, authorizesExecution: true },
  O3_PRODUCTION_AUTHORIZATION: { roles: ['OPERATOR'], durable: false, requiresTarget: true, authorizesExecution: true, requiresCommitSha: true },
  // §8 — defined so the vocabulary is complete and the gap is explicit, but NO
  // role may mint it. A broad governance/security override is exactly the
  // "SUPERUSER" this unit refuses to create; it needs its own governance unit.
  O4_GOVERNANCE_OVERRIDE: { roles: [], durable: false, requiresTarget: true, authorizesExecution: true },
});

// ── §7 standing ──────────────────────────────────────────────────────────────
export const STANDING = Object.freeze({
  CONVERSATIONAL: 'CONVERSATIONAL',
  MAIA_INFERRED: 'MAIA_INFERRED',
  HISTORICAL_QUOTE: 'HISTORICAL_QUOTE',
  FOUNDER_INSTRUCTION: 'FOUNDER_INSTRUCTION',
  OPERATOR_INSTRUCTION: 'OPERATOR_INSTRUCTION',
});

const STANDING_FOR_ROLE = Object.freeze({
  FOUNDER: STANDING.FOUNDER_INSTRUCTION,
  OPERATOR: STANDING.OPERATOR_INSTRUCTION,
});

// ── §26 refusal semantics ────────────────────────────────────────────────────
export const AUTHORITY_REFUSAL = Object.freeze({
  AUTHENTICATED_ACTOR_REQUIRED: 'AUTHENTICATED_ACTOR_REQUIRED',
  CHANNEL_NOT_AUTHENTICATED: 'CHANNEL_NOT_AUTHENTICATED',
  CHANNEL_EXPIRED: 'CHANNEL_EXPIRED',
  CHANNEL_REVOKED: 'CHANNEL_REVOKED',
  FOUNDER_AUTHORITY_REQUIRED: 'FOUNDER_AUTHORITY_REQUIRED',
  OPERATOR_AUTHORITY_REQUIRED: 'OPERATOR_AUTHORITY_REQUIRED',
  ROLE_MISMATCH: 'ROLE_MISMATCH',
  INSTRUCTION_SCOPE_MISMATCH: 'INSTRUCTION_SCOPE_MISMATCH',
  INSTRUCTION_EXPIRED: 'INSTRUCTION_EXPIRED',
  INSTRUCTION_REVOKED: 'INSTRUCTION_REVOKED',
  INSTRUCTION_SUPERSEDED: 'INSTRUCTION_SUPERSEDED',
  INSTRUCTION_CLASS_NOT_ISSUABLE: 'INSTRUCTION_CLASS_NOT_ISSUABLE',
  INSTRUCTION_INVALID: 'INSTRUCTION_INVALID',
});

/** §26 — public surface stays coarse; audit retains the exact reason. */
export const PUBLIC_AUTHORITY_REFUSAL = 'AUTHORITY_NOT_ESTABLISHED';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const bound = (s, n = 240) => (typeof s === 'string' && s.trim() ? s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : null);

// ── channels ─────────────────────────────────────────────────────────────────
/**
 * Open an authenticated channel. This is the ONLY way standing is ever created.
 *
 * `authenticator` names the mechanism that established the session out of band.
 * The role comes from the AUTHENTICATOR REGISTRY, never from the caller — so a
 * caller cannot open an OPERATOR-authenticated channel and label it FOUNDER.
 */
export function openChannel({ authenticator, actor_id, expires_at = null } = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });
  if (!isTrustedAuthenticator(authenticator)) {
    return deny(AUTHORITY_REFUSAL.CHANNEL_NOT_AUTHENTICATED,
      `'${authenticator}' is not a recognised authentication mechanism`);
  }
  if (typeof actor_id !== 'string' || !actor_id.trim()) {
    return deny(AUTHORITY_REFUSAL.AUTHENTICATED_ACTOR_REQUIRED, 'actor_id is required');
  }
  if (expires_at != null && Number.isNaN(Date.parse(expires_at))) {
    return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, 'expires_at must be a timestamp');
  }
  const channel = {
    channel_id: `chn-${randomBytes(6).toString('hex')}`,
    status: 'ACTIVE',
    authenticator,
    // Derived from the registry. The caller does not get a vote.
    actor_role: AUTHENTICATORS[authenticator].role,
    actor_id: actor_id.trim(),
    opened_at: now,
    expires_at,
    revoked_at: null,
  };
  writeAtomic(CH_DIR(), path.join(CH_DIR(), `${channel.channel_id}.json`), JSON.stringify(channel, null, 2));
  return { ok: true, channel };
}

export function loadChannel(id) {
  if (typeof id !== 'string' || !CHANNEL_ID_RE.test(id)) return null;
  const f = path.join(CH_DIR(), `${id}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

export function revokeChannel(id, now = new Date().toISOString()) {
  const c = loadChannel(id);
  if (!c) return { ok: false, refusal: AUTHORITY_REFUSAL.CHANNEL_NOT_AUTHENTICATED };
  c.status = 'REVOKED';
  c.revoked_at = now;
  writeAtomic(CH_DIR(), path.join(CH_DIR(), `${id}.json`), JSON.stringify(c, null, 2));
  return { ok: true, channel: c };
}

/** Establish the authenticated actor behind a channel reference, or refuse. */
export function authenticateChannel(channel_id, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });
  if (typeof channel_id !== 'string' || !channel_id.trim()) {
    return deny(AUTHORITY_REFUSAL.AUTHENTICATED_ACTOR_REQUIRED, 'no channel presented');
  }
  const c = loadChannel(channel_id);
  if (!c) return deny(AUTHORITY_REFUSAL.CHANNEL_NOT_AUTHENTICATED, 'no such channel');
  // Re-checked here, not only at open: an authenticator removed from the
  // registry must invalidate channels that relied on it.
  if (!isTrustedAuthenticator(c.authenticator)) {
    return deny(AUTHORITY_REFUSAL.CHANNEL_NOT_AUTHENTICATED, `authenticator '${c.authenticator}' is not trusted`);
  }
  if (AUTHENTICATORS[c.authenticator].role !== c.actor_role) {
    return deny(AUTHORITY_REFUSAL.ROLE_MISMATCH, 'channel role does not match its authenticator');
  }
  if (c.status === 'REVOKED') return deny(AUTHORITY_REFUSAL.CHANNEL_REVOKED, `revoked at ${c.revoked_at}`);
  if (c.expires_at != null && Date.parse(c.expires_at) <= Date.parse(now)) {
    return deny(AUTHORITY_REFUSAL.CHANNEL_EXPIRED, `expired at ${c.expires_at}`);
  }
  return { ok: true, channel: c };
}

// ── §15/§16/§17 the conversational firewall ──────────────────────────────────
/**
 * Decide the standing of inbound material.
 *
 * Note what is absent: content is never examined. `provenance` describes how the
 * material reached us, and an authenticated channel is the only thing that
 * elevates. Quoted or retrieved material is historical evidence no matter how
 * authoritative it reads, and MAIA's inference about intent stays inference.
 */
export function classifyInbound({ channel_id = null, provenance = 'CONVERSATION' } = {}, now = new Date().toISOString()) {
  if (provenance === 'QUOTE' || provenance === 'TRANSCRIPT' || provenance === 'RETRIEVED') {
    return { standing: STANDING.HISTORICAL_QUOTE, authenticated: false, actor_role: null,
      note: 'quoted or retrieved material — historical evidence, never a live instruction' };
  }
  if (provenance === 'MAIA_INFERENCE') {
    return { standing: STANDING.MAIA_INFERRED, authenticated: false, actor_role: null,
      note: 'model inference about intent — a question for verification, never an authority' };
  }
  if (channel_id == null) {
    return { standing: STANDING.CONVERSATIONAL, authenticated: false, actor_role: null,
      note: 'no authenticated channel — content cannot authenticate itself' };
  }
  const a = authenticateChannel(channel_id, now);
  if (!a.ok) {
    return { standing: STANDING.CONVERSATIONAL, authenticated: false, actor_role: null,
      refusal: a.refusal, note: 'channel did not authenticate; standing is not elevated' };
  }
  return {
    standing: STANDING_FOR_ROLE[a.channel.actor_role],
    authenticated: true,
    actor_role: a.channel.actor_role,
    actor_id: a.channel.actor_id,
    channel_id: a.channel.channel_id,
  };
}

// ── instructions ─────────────────────────────────────────────────────────────
/**
 * Mint an authoritative instruction — the only object that carries elevated
 * standing, and only ever derived from an authenticated channel.
 *
 * §10 channel binding: the instruction records the channel and actor that
 * produced it. Copying its content into an unauthenticated request carries
 * nothing, because standing lives on the record and not in the payload.
 */
export function submitInstruction(input = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  const a = authenticateChannel(input.channel_id, now);
  if (!a.ok) return deny(a.refusal, a.reason);
  const channel = a.channel;

  const cls = input.instruction_class;
  const spec = INSTRUCTION_CLASSES[cls];
  if (!spec) return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, `unknown instruction class '${cls}'`);

  // §8 — a class no role may mint stays unmintable.
  if (spec.roles.length === 0) {
    return deny(AUTHORITY_REFUSAL.INSTRUCTION_CLASS_NOT_ISSUABLE,
      `${cls} is not issuable by any role in this unit; it requires its own governance unit`);
  }

  // §4/§20 — role separation. Refusals name the authority that IS required, so
  // the gap is legible rather than a flat denial.
  if (!spec.roles.includes(channel.actor_role)) {
    const needed = spec.roles.includes('FOUNDER')
      ? AUTHORITY_REFUSAL.FOUNDER_AUTHORITY_REQUIRED
      : AUTHORITY_REFUSAL.OPERATOR_AUTHORITY_REQUIRED;
    return deny(needed, `${cls} requires ${spec.roles.join(' or ')} authority; this channel is ${channel.actor_role}`);
  }

  const objective = bound(input.objective);
  if (!objective) return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, 'a bounded objective is required');

  // §11/§12/§22 — replay and scope policy differ per class. Constitutional
  // rulings are durable and untargeted; execution authorizations are bound.
  const target = isObj(input.target) ? { ...input.target } : null;
  if (spec.requiresTarget) {
    if (!target) return deny(AUTHORITY_REFUSAL.INSTRUCTION_SCOPE_MISMATCH, `${cls} requires a bound target`);
    if (spec.requiresCommitSha && !/^[0-9a-f]{7,40}$/.test(String(target.commit_sha ?? ''))) {
      return deny(AUTHORITY_REFUSAL.INSTRUCTION_SCOPE_MISMATCH,
        `${cls} must name a specific commit — "deploy this commit" must not become "deploy any commit"`);
    }
  }

  let expiresAt = input.expires_at ?? null;
  if (spec.durable) {
    // §22 — do not impose an operational TTL on constitutional canon.
    if (expiresAt != null) {
      return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID,
        `${cls} is constitutional and does not take an operational expiry; it is superseded or revoked instead`);
    }
  } else {
    if (typeof expiresAt !== 'string' || Number.isNaN(Date.parse(expiresAt))) {
      return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, `${cls} requires an expiry`);
    }
    if (Date.parse(expiresAt) <= Date.parse(now)) {
      return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, 'expires_at must be in the future');
    }
  }

  const instruction = {
    instruction_id: `ins-${randomBytes(6).toString('hex')}`,
    status: 'ACTIVE',
    instruction_class: cls,
    // Standing is derived, never supplied.
    standing: STANDING_FOR_ROLE[channel.actor_role],
    authenticated_actor_id: channel.actor_id,
    actor_role: channel.actor_role,
    channel_id: channel.channel_id,
    authority_source: `authenticated:${channel.authenticator}:${channel.channel_id}`,
    objective,
    content: bound(input.content, 4000),
    target,
    issued_at: now,
    expires_at: expiresAt,
    revoked_at: null,
    supersedes: typeof input.supersedes === 'string' ? input.supersedes : null,
    superseded_by: null,
    // §13/§14 — an authenticated ruling becomes a DURABLE PENDING record. It
    // does not mutate canon, and it does not execute. Publication stays a
    // separate governed step.
    publication_state: spec.durable && cls !== 'F0_NON_AUTHORITATIVE_COMMENT' ? 'PENDING_PUBLICATION' : 'NOT_APPLICABLE',
    authorizes_execution: spec.authorizesExecution,
    executed_by: [],
  };

  writeAtomic(IN_DIR(), path.join(IN_DIR(), `${instruction.instruction_id}.json`), JSON.stringify(instruction, null, 2));

  if (instruction.supersedes) {
    const prior = loadInstruction(instruction.supersedes);
    if (prior && prior.status === 'ACTIVE') {
      prior.status = 'SUPERSEDED';
      prior.superseded_by = instruction.instruction_id;
      writeAtomic(IN_DIR(), path.join(IN_DIR(), `${prior.instruction_id}.json`), JSON.stringify(prior, null, 2));
    }
  }
  return { ok: true, instruction };
}

export function loadInstruction(id) {
  if (typeof id !== 'string' || !INSTRUCTION_ID_RE.test(id)) return null;
  const f = path.join(IN_DIR(), `${id}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

export function revokeInstruction(id, { reason } = {}, now = new Date().toISOString()) {
  const i = loadInstruction(id);
  if (!i) return { ok: false, refusal: AUTHORITY_REFUSAL.INSTRUCTION_INVALID };
  i.status = 'REVOKED';
  i.revoked_at = now;
  i.revocation_reason = bound(reason);
  writeAtomic(IN_DIR(), path.join(IN_DIR(), `${id}.json`), JSON.stringify(i, null, 2));
  return { ok: true, instruction: i };
}

/** Is this instruction currently usable, and for this target? */
export function verifyInstruction({ instruction_id, required_class = null, target = null } = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });
  const i = loadInstruction(instruction_id);
  if (!i) return deny(AUTHORITY_REFUSAL.INSTRUCTION_INVALID, 'no such instruction');
  if (i.status === 'REVOKED') return deny(AUTHORITY_REFUSAL.INSTRUCTION_REVOKED, `revoked at ${i.revoked_at}`);
  if (i.status === 'SUPERSEDED') return deny(AUTHORITY_REFUSAL.INSTRUCTION_SUPERSEDED, `superseded by ${i.superseded_by}`);
  if (i.expires_at != null && Date.parse(i.expires_at) <= Date.parse(now)) {
    return deny(AUTHORITY_REFUSAL.INSTRUCTION_EXPIRED, `expired at ${i.expires_at}`);
  }
  // The channel that produced it must still authenticate — revoking a channel
  // withdraws the standing of what it said.
  const a = authenticateChannel(i.channel_id, now);
  if (!a.ok) return deny(a.refusal, 'the channel that produced this instruction no longer authenticates');
  if (required_class && i.instruction_class !== required_class) {
    return deny(AUTHORITY_REFUSAL.ROLE_MISMATCH, `expected ${required_class}, got ${i.instruction_class}`);
  }
  if (target) {
    for (const [k, v] of Object.entries(target)) {
      if ((i.target?.[k] ?? null) !== v) {
        return deny(AUTHORITY_REFUSAL.INSTRUCTION_SCOPE_MISMATCH, `instruction is not bound to ${k}=${v}`);
      }
    }
  }
  return { ok: true, instruction: i };
}

/** §24 — what a future MAIA client could safely be told. No secrets, no session. */
export function publicInstruction(i) {
  if (!i) return null;
  return {
    instruction_id: i.instruction_id,
    instruction_class: i.instruction_class,
    standing: i.standing,
    actor_role: i.actor_role,
    objective: i.objective,
    status: i.status,
    publication_state: i.publication_state,
    authorizes_execution: i.authorizes_execution,
    issued_at: i.issued_at,
    expires_at: i.expires_at,
  };
}

// ── §25 Unit 15 compatibility ────────────────────────────────────────────────
/**
 * The one place an authenticated instruction touches runtime execution
 * authority — and it does so by *calling* Unit 15, never by replacing it.
 *
 *   authenticated instruction → authorized issuer decision
 *   → Unit 15 delegation issuance → Unit 14 admission → runtime governance
 *
 * The channel authenticates input standing. It does not mint delegations, and
 * an instruction is not itself a delegation. If Unit 15 refuses the issuance —
 * because the issuer is untrusted, or the grant exceeds its registry entry, or
 * the class is above the principal ceiling — this refuses too. There is no path
 * here that reaches the runtime without going through Unit 15.
 *
 * @param {string} instruction_id an ACTIVE, unexpired, execution-authorizing instruction
 * @param {object} delegationInput passed verbatim to Unit 15's issueDelegation
 */
export async function authorizeDelegationIssuance(instruction_id, delegationInput = {}, now = new Date().toISOString()) {
  const v = verifyInstruction({ instruction_id }, now);
  if (!v.ok) return { ok: false, refusal: v.refusal, reason: v.reason };

  const i = v.instruction;
  if (!i.authorizes_execution) {
    // §9 — "founder decides X is constitutional" is not "deploy X now".
    return { ok: false, refusal: AUTHORITY_REFUSAL.OPERATOR_AUTHORITY_REQUIRED,
      reason: `${i.instruction_class} carries standing but not execution authorization; a separate operator authorization is required` };
  }

  // Unit 15 remains the sole issuer of runtime delegations.
  const { issueDelegation } = await import('./jarvis-delegation.mjs');
  const issued = issueDelegation(delegationInput, now);
  if (!issued.ok) return { ok: false, refusal: issued.refusal, reason: issued.reason };

  i.executed_by.push({ delegation_id: issued.delegation.delegation_id, at: now });
  writeAtomic(IN_DIR(), path.join(IN_DIR(), `${i.instruction_id}.json`), JSON.stringify(i, null, 2));
  return { ok: true, instruction: i, delegation: issued.delegation };
}

export function listInstructions() {
  mkdirSync(IN_DIR(), { recursive: true });
  return readdirSync(IN_DIR()).filter((f) => f.endsWith('.json') && !f.includes('.tmp-'))
    .map((f) => { try { return JSON.parse(readFileSync(path.join(IN_DIR(), f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
}
