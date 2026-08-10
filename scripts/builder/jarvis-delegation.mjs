/**
 * JARVIS Unit 15 — verified delegation issuance + authentication
 *
 * Unit 14 gave the runtime somewhere truthful to PUT a principal, and validated
 * a delegation's shape, scope, ceiling and expiry. It checked `authority_source`
 * for PRESENCE ONLY — a non-empty string. A caller could therefore construct its
 * own envelope and name its own authority.
 *
 * The gap: self-asserted delegation metadata is not verified delegated authority.
 *
 * This module supplies the missing antecedent, in order:
 *
 *   authorized issuer → legitimate issuance → integrity → verification
 *                     → (then, unchanged) Unit 14 admission checks
 *
 * ── Why a server-side reference, not a signed bearer token (§5) ──────────────
 *
 * Issuer and verifier are the same process on the same host, with a durable
 * local store already in use. So the delegation is an AUTHORITATIVE RECORD held
 * by the runtime, and the caller holds only an opaque id.
 *
 * That gives, with no cryptography at all:
 *   integrity    the caller never holds the authority content, so it cannot
 *                alter it — strictly stronger than detecting tampering
 *   revocation   a status flip, effective immediately, with no token lifetime
 *   privacy      subject scope and issuer never leave the runtime
 *   audit        the record IS the audit trail
 *
 * A MAC or signature would add ceremony without adding a property we lack.
 * §5 warns against choosing cryptography for appearance; the honest smallest
 * architecture here is the reference. If issuance ever moves off-host, this
 * becomes a hybrid (reference + integrity proof) — recorded, not pre-built.
 */

import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { PRINCIPAL_TYPES, OPERATION_CLASSES, PRINCIPAL_CEILINGS } from './jarvis-principal.mjs';

// ── store ────────────────────────────────────────────────────────────────────
const AIN_HOME = () => process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const DIR = () => path.join(AIN_HOME(), 'delegations');
const fileFor = (id) => path.join(DIR(), `${id}.json`);

const DELEGATION_ID_RE = /^dlg-[0-9a-f]{12}$/;

function ensureDir() { mkdirSync(DIR(), { recursive: true }); }

function writeAtomic(file, text) {
  ensureDir();
  const tmp = `${file}.tmp-${randomBytes(4).toString('hex')}`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

// ── §11 target binding ───────────────────────────────────────────────────────
/**
 * `R1A_SYSTEM_READ` alone is far too broad: "read the deployment SHA" and "read
 * secrets" are not the same authority. Targets are a closed, structured
 * vocabulary — never interpreted from prose.
 *
 * There is deliberately NO secrets target class. Unreachable beats prohibited:
 * a class that does not exist cannot be granted by an over-broad delegation, a
 * future registry edit, or a typo.
 */
export const TARGET_CLASSES = Object.freeze([
  'REPO_SOURCE', 'RUNTIME_STATE', 'DEPLOYMENT_SHA', 'RUN_HISTORY', 'WORKER_LOGS',
]);

export const DELEGATION_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', REVOKED: 'REVOKED', EXPIRED: 'EXPIRED' });

// ── §3/§7 authority root + issuer registry ───────────────────────────────────
/**
 * The smallest real authority root already available on this host. No general
 * IAM system is invented.
 *
 * `may_grant_to` is the anti-escalation control at issuance: an issuer cannot
 * mint authority for a principal type it does not govern. Note that no issuer
 * may grant to OPERATOR — operator authority comes from local possession
 * (Unit 11/12), never from a delegation, so a delegation can never manufacture
 * an operator.
 *
 * MAIA is deliberately ABSENT as an issuer. A future MAIA client may CARRY
 * authority; it may not MANUFACTURE it.
 */
export const ISSUER_REGISTRY = Object.freeze({
  'local-operator': {
    description: 'Local operator in possession of the runtime host (Unit 11/12 trust root)',
    may_grant_to: ['MAIA', 'SYSTEM_AUTOMATION', 'PRACTITIONER', 'MEMBER'],
    classes: ['R1A_SYSTEM_READ', 'R2_COMPUTE'],
    targets: ['REPO_SOURCE', 'RUNTIME_STATE', 'DEPLOYMENT_SHA', 'RUN_HISTORY', 'WORKER_LOGS'],
    may_grant_subject_scope: true,
  },
  'member-session': {
    description: 'An authenticated member session, granting only within that member’s own scope',
    may_grant_to: ['MAIA'],
    classes: ['R1A_SYSTEM_READ'],
    targets: ['RUNTIME_STATE', 'DEPLOYMENT_SHA'],
    may_grant_subject_scope: true,
    subject_scope_must_be_self: true,
  },
  'practitioner-session': {
    // A practitioner is a relational role, not an infrastructure one. It may not
    // grant subject-scoped authority over a member (that needs member consent),
    // and it never implies operator authority.
    description: 'An authenticated practitioner session — relational role only',
    may_grant_to: ['MAIA'],
    classes: ['R1A_SYSTEM_READ'],
    targets: ['RUNTIME_STATE'],
    may_grant_subject_scope: false,
  },
  'system-automation': {
    description: 'Explicitly scoped unattended automation',
    may_grant_to: ['SYSTEM_AUTOMATION'],
    classes: ['R1A_SYSTEM_READ'],
    targets: ['RUNTIME_STATE', 'DEPLOYMENT_SHA'],
    may_grant_subject_scope: false,
  },
});

export const isTrustedIssuer = (id) => Object.prototype.hasOwnProperty.call(ISSUER_REGISTRY, id);

// ── refusal vocabulary (§20) ─────────────────────────────────────────────────
export const DELEGATION_REFUSAL = Object.freeze({
  DELEGATION_REQUIRED: 'DELEGATION_REQUIRED',
  DELEGATION_UNKNOWN: 'DELEGATION_UNKNOWN',
  DELEGATION_INVALID: 'DELEGATION_INVALID',
  DELEGATION_EXPIRED: 'DELEGATION_EXPIRED',
  DELEGATION_REVOKED: 'DELEGATION_REVOKED',
  DELEGATION_PRINCIPAL_MISMATCH: 'DELEGATION_PRINCIPAL_MISMATCH',
  DELEGATION_SCOPE_MISMATCH: 'DELEGATION_SCOPE_MISMATCH',
  DELEGATION_OPERATION_DENIED: 'DELEGATION_OPERATION_DENIED',
  DELEGATION_TARGET_DENIED: 'DELEGATION_TARGET_DENIED',
  DELEGATION_ISSUER_UNAUTHORIZED: 'DELEGATION_ISSUER_UNAUTHORIZED',
});

/**
 * §20 — the public surface is coarser than the audit record. An external caller
 * learns that authority was not established, not which of ten checks caught it;
 * the exact reason is retained internally.
 */
export const PUBLIC_REFUSAL = 'AUTHORITY_NOT_ESTABLISHED';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const newDelegationId = () => `dlg-${randomBytes(6).toString('hex')}`;

// ── §4 legitimate issuance ───────────────────────────────────────────────────
/**
 * Mint a delegation. Refuses anything an issuer is not authorized to grant, so
 * an illegitimate delegation is never created in the first place.
 *
 * @returns {{ok: boolean, reason?: string, refusal?: string, delegation?: object}}
 */
export function issueDelegation(input = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  const issuerId = input.issuer;
  if (typeof issuerId !== 'string' || !isTrustedIssuer(issuerId)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `'${issuerId}' is not a trusted issuer`);
  }
  const issuer = ISSUER_REGISTRY[issuerId];

  const principalType = input.principal_type;
  if (!PRINCIPAL_TYPES.includes(principalType) || principalType === 'UNKNOWN') {
    return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, `invalid principal_type '${principalType}'`);
  }
  if (!issuer.may_grant_to.includes(principalType)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `issuer '${issuerId}' may not grant authority to principal type ${principalType}`);
  }
  const principalId = input.principal_id;
  if (typeof principalId !== 'string' || !principalId.trim()) {
    return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, 'principal_id is required');
  }

  const operationClass = input.operation_class;
  if (!OPERATION_CLASSES.includes(operationClass)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, `unknown operation class '${operationClass}'`);
  }
  if (!issuer.classes.includes(operationClass)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `issuer '${issuerId}' may not grant ${operationClass}`);
  }
  // An issuer may not grant above the principal type's Unit 14 ceiling either.
  // Two independent bounds must both hold; neither is redundant.
  if (!(PRINCIPAL_CEILINGS[principalType] ?? []).includes(operationClass)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `${operationClass} is above the ceiling for principal type ${principalType}`);
  }

  const targets = Array.isArray(input.allowed_targets) ? input.allowed_targets : [];
  if (!targets.length) return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, 'allowed_targets is required');
  for (const tgt of targets) {
    if (!TARGET_CLASSES.includes(tgt)) {
      return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, `unknown target class '${tgt}'`);
    }
    if (!issuer.targets.includes(tgt)) {
      return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
        `issuer '${issuerId}' may not grant target ${tgt}`);
    }
  }

  const subjectScope = input.subject_scope ?? null;
  if (subjectScope != null) {
    if (!issuer.may_grant_subject_scope) {
      return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
        `issuer '${issuerId}' may not grant subject-scoped authority`);
    }
    if (issuer.subject_scope_must_be_self && subjectScope !== input.issuer_subject) {
      return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
        `issuer '${issuerId}' may only grant authority over its own subject scope`);
    }
  }

  // §13 — expiry is bound at issuance and is mandatory. An unbounded delegation
  // is a standing grant, which is not a thing this unit issues.
  const expiresAt = input.expires_at;
  if (typeof expiresAt !== 'string' || Number.isNaN(Date.parse(expiresAt))) {
    return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, 'expires_at is required and must be a timestamp');
  }
  if (Date.parse(expiresAt) <= Date.parse(now)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_INVALID, 'expires_at must be in the future');
  }

  const delegation = {
    delegation_id: newDelegationId(),
    status: DELEGATION_STATUS.ACTIVE,
    issuer: issuerId,
    principal_type: principalType,
    principal_id: principalId,
    subject_scope: subjectScope,
    operation_class: operationClass,
    allowed_targets: targets.slice(),
    prohibited_operations: Array.isArray(input.prohibited_operations) ? input.prohibited_operations.slice() : [],
    prohibited_targets: Array.isArray(input.prohibited_targets) ? input.prohibited_targets.slice() : [],
    // §12 — purpose is audit/intent metadata. Operation + target bind authority;
    // enforcing purpose would mean comparing prose, which is brittle and would
    // invite semantic interpretation of caller-supplied text.
    purpose: typeof input.purpose === 'string' ? input.purpose.slice(0, 240) : null,
    issued_at: now,
    expires_at: expiresAt,
    revoked_at: null,
    revocation_reason: null,
    used_by_requests: [],
  };

  writeAtomic(fileFor(delegation.delegation_id), JSON.stringify(delegation, null, 2));
  return { ok: true, delegation };
}

export function loadDelegation(id) {
  if (typeof id !== 'string' || !DELEGATION_ID_RE.test(id)) return null;
  const f = fileFor(id);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

/** §14 — revocation is a status flip on the authoritative record. */
export function revokeDelegation(id, { by, reason } = {}, now = new Date().toISOString()) {
  const d = loadDelegation(id);
  if (!d) return { ok: false, refusal: DELEGATION_REFUSAL.DELEGATION_UNKNOWN };
  if (d.status === DELEGATION_STATUS.REVOKED) return { ok: true, delegation: d, already: true };
  // Only the issuing authority may revoke its own grant.
  if (by != null && by !== d.issuer) {
    return { ok: false, refusal: DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      reason: `'${by}' did not issue this delegation` };
  }
  d.status = DELEGATION_STATUS.REVOKED;
  d.revoked_at = now;
  d.revocation_reason = typeof reason === 'string' ? reason.slice(0, 240) : null;
  writeAtomic(fileFor(id), JSON.stringify(d, null, 2));
  return { ok: true, delegation: d };
}

/** Audit: record which requests used a delegation, without touching authority. */
export function recordUse(id, requestId) {
  const d = loadDelegation(id);
  if (!d || !requestId) return;
  if (!d.used_by_requests.includes(requestId)) {
    d.used_by_requests.push(requestId);
    if (d.used_by_requests.length > 500) d.used_by_requests.shift();
    writeAtomic(fileFor(id), JSON.stringify(d, null, 2));
  }
}

// ── verification (§8, §9, §10, §11, §15, §16) ────────────────────────────────
/**
 * Prove a presented delegation reference is genuine, current, and actually
 * covers this request.
 *
 * Every check reads the AUTHORITATIVE RECORD, never the caller's envelope. That
 * is the integrity property: the caller supplies an id and its own claims; the
 * claims are compared against the record and discarded.
 *
 * @returns {{ok: boolean, refusal?: string, reason?: string, delegation?: object}}
 */
export function verifyDelegation({ delegation_id, principal, subject_scope, operation_class, target } = {},
  now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  if (typeof delegation_id !== 'string' || !delegation_id.trim()) {
    return deny(DELEGATION_REFUSAL.DELEGATION_REQUIRED, 'no delegation reference presented');
  }
  const d = loadDelegation(delegation_id);
  if (!d) return deny(DELEGATION_REFUSAL.DELEGATION_UNKNOWN, 'no such delegation');

  // §4 load-bearing invariant, re-checked at verification and not only at
  // issuance: an authentic record from an issuer that is not (or is no longer)
  // trusted for this grant is INVALID. Authenticity is not authority.
  if (!isTrustedIssuer(d.issuer)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `issuer '${d.issuer}' is not trusted`);
  }
  const issuer = ISSUER_REGISTRY[d.issuer];
  if (!issuer.may_grant_to.includes(d.principal_type)
      || !issuer.classes.includes(d.operation_class)
      || !d.allowed_targets.every((t) => issuer.targets.includes(t))
      || (d.subject_scope != null && !issuer.may_grant_subject_scope)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_ISSUER_UNAUTHORIZED,
      `issuer '${d.issuer}' is not authorized for the authority this delegation carries`);
  }

  if (d.status === DELEGATION_STATUS.REVOKED) {
    return deny(DELEGATION_REFUSAL.DELEGATION_REVOKED, `revoked at ${d.revoked_at}`);
  }
  if (Date.parse(d.expires_at) <= Date.parse(now)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_EXPIRED, `expired at ${d.expires_at}`);
  }

  // §8 principal binding — a delegation issued to one principal is not
  // replayable by another. Loopback reachability is not a principal.
  if (!isObj(principal) || principal.type !== d.principal_type) {
    return deny(DELEGATION_REFUSAL.DELEGATION_PRINCIPAL_MISMATCH,
      `delegation was issued to principal type ${d.principal_type}`);
  }
  if (principal.id !== d.principal_id) {
    return deny(DELEGATION_REFUSAL.DELEGATION_PRINCIPAL_MISMATCH,
      'delegation was issued to a different principal');
  }

  // §9 subject binding
  const wantScope = subject_scope ?? null;
  if ((d.subject_scope ?? null) !== wantScope) {
    return deny(DELEGATION_REFUSAL.DELEGATION_SCOPE_MISMATCH,
      'requested subject scope is not the delegated subject scope');
  }

  // §10 operation binding — no "close enough" matching.
  if (operation_class !== d.operation_class) {
    return deny(DELEGATION_REFUSAL.DELEGATION_OPERATION_DENIED,
      `delegation grants ${d.operation_class}`);
  }
  if (d.prohibited_operations.includes(operation_class)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_OPERATION_DENIED, 'operation is explicitly prohibited');
  }

  // §11 target binding
  if (!TARGET_CLASSES.includes(target)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED, `unknown target class '${target}'`);
  }
  if (d.prohibited_targets.includes(target)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED, 'target is explicitly prohibited');
  }
  if (!d.allowed_targets.includes(target)) {
    return deny(DELEGATION_REFUSAL.DELEGATION_TARGET_DENIED, `delegation allows ${d.allowed_targets.join(', ')}`);
  }

  return { ok: true, delegation: d };
}

/**
 * Build the Unit 14 delegation object FROM the authoritative record.
 *
 * This is the seam that keeps Unit 14 intact: everything downstream still runs
 * exactly as committed, but the object it reasons about is now derived from a
 * verified record rather than from caller-supplied metadata. Nothing the caller
 * sent survives into it — which is what makes §13 (cannot extend expiry) and
 * §16 (cannot remove prohibitions) true by construction rather than by check.
 */
export function delegationToUnit14(d) {
  return {
    operation_class: [d.operation_class],
    authority_source: `verified:${d.issuer}:${d.delegation_id}`,
    subject_scope: d.subject_scope,
    allowed_targets: d.allowed_targets.slice(),
    prohibited_operations: d.prohibited_operations.slice(),
    purpose: d.purpose,
    expires_at: d.expires_at,
  };
}

/** §22 — what a public surface may learn about a delegation. */
export function publicDelegation(d) {
  if (!d) return null;
  return {
    delegation_id: d.delegation_id,
    issuer_class: isTrustedIssuer(d.issuer) ? ISSUER_REGISTRY[d.issuer].description.split(' ')[0] : 'UNTRUSTED',
    operation_class: d.operation_class,
    target_classes: d.allowed_targets.slice(),
    member_scope_present: d.subject_scope != null,
    status: d.status,
    expires_at: d.expires_at,
  };
}

/** Audit listing; never used for authority decisions. */
export function listDelegations() {
  ensureDir();
  return readdirSync(DIR()).filter((f) => f.endsWith('.json') && !f.includes('.tmp-'))
    .map((f) => { try { return JSON.parse(readFileSync(path.join(DIR(), f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
}
