/**
 * E1 append-only canonical execution-grant event store.
 *
 * This sidecar never rewrites W0.v2/W2.v2/W3.v2/W3T.v1/W4.v2 truth.
 */
import path from 'node:path';
import os from 'node:os';
import { createCanonicalExecutionGrantV1 } from './canonical-provider-execution-v1.mjs';
import { mutateGrantLedgerV1, readGrantLedgerV1 } from './grant-ledger-core-v1.mjs';
import { resolveHome } from './grant-writer-lease-v1.mjs';

const HOME = (home) => home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');

const STORE = (home) => path.join(HOME(home), 'work-units-v2', 'execution-grants');

function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,127}$/i.test(String(value || ''));
}

export function canonicalGrantLedgerPathV1(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid work_unit_id');
  return path.join(STORE(home), workUnitId + '.jsonl');
}

export function canonicalGrantLedgerLockPathV1(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid work_unit_id');
  return path.join(STORE(home), workUnitId + '.lock');
}

/**
 * O5-R3: every mutation runs under the shared grant-ledger core, which enforces the
 * writer lease inside the store (R3-R3), keeps the legacy per-append lock (R3-R10),
 * and recovers a torn terminal fragment behind the durable barrier (R3-R5/R12).
 */
function withLedgerLock(workUnitId, { home, lease } = {}, fn) {
  const file = canonicalGrantLedgerPathV1(workUnitId, home);
  return mutateGrantLedgerV1({
    home,
    file,
    lockPath: canonicalGrantLedgerLockPathV1(workUnitId, home),
    ledgerId: path.relative(resolveHome(home), file),
    store: 'canonical',
    corruptCode: 'CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT',
    lease,
  }, (ctx) => fn(ctx.append));
}

/** Lease-free read: committed events plus any uncommitted terminal fragment (reported, never fatal). */
export function readCanonicalGrantLedgerV1(workUnitId, { home } = {}) {
  return readGrantLedgerV1(canonicalGrantLedgerPathV1(workUnitId, home), {
    corruptCode: 'CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT',
  });
}

export function readCanonicalGrantEventsV1(workUnitId, { home } = {}) {
  return readCanonicalGrantLedgerV1(workUnitId, { home }).events;
}

function eventsForGrant(events, grantId) {
  return events.filter((event) =>
    event?.grant?.grant_id === grantId || event?.grant_id === grantId);
}

export function canonicalGrantStandingFromEventsV1(events, grantId) {
  const stream = eventsForGrant(events, grantId);
  const grant = stream.find((event) => event.event === 'ISSUED')?.grant || null;
  if (!grant) return { exists: false, grant: null, standing: 'MISSING', events: [] };

  let standing = 'ACTIVE';
  for (const event of stream) {
    if (event.event === 'CLAIMED') standing = 'CLAIMED';
    if (event.event === 'CONSUMED') standing = 'CONSUMED';
    if (event.event === 'REVOKED') standing = 'REVOKED';
    if (event.event === 'INVALIDATED') standing = 'INVALIDATED';
  }
  return { exists: true, grant, standing, events: stream };
}

export function canonicalGrantStandingV1(workUnitId, grantId, { home } = {}) {
  return canonicalGrantStandingFromEventsV1(
    readCanonicalGrantEventsV1(workUnitId, { home }),
    grantId,
  );
}

export function listCanonicalGrantStandingsV1(workUnitId, { home } = {}) {
  const events = readCanonicalGrantEventsV1(workUnitId, { home });
  const issued = events.filter((event) => event.event === 'ISSUED' && event.grant?.grant_id);
  return issued.map((event) =>
    canonicalGrantStandingFromEventsV1(events, event.grant.grant_id));
}

export function activeCanonicalGrantForParticipantV1(
  workUnitId,
  participantId,
  { home } = {},
) {
  return listCanonicalGrantStandingsV1(workUnitId, { home }).find((entry) =>
    entry.standing === 'ACTIVE'
    && entry.grant?.route_participant_id === participantId) || null;
}

export function unresolvedCanonicalGrantForParticipantV1(
  workUnitId,
  participantId,
  { home } = {},
) {
  return listCanonicalGrantStandingsV1(workUnitId, { home }).find((entry) =>
    ['ACTIVE', 'CLAIMED'].includes(entry.standing)
    && entry.grant?.route_participant_id === participantId) || null;
}

export function issueCanonicalExecutionGrantV1(preview, {
  home,
  actor_id,
  issued_at = new Date().toISOString(),
  authorization_act = 'JARVIS_DESKTOP_E1_AUTHORIZE_ONCE',
  lease,
} = {}) {
  if (!preview?.ok) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'AUTHORIZATION_PREVIEW_REQUIRED',
      grant: null,
    };
  }

  return withLedgerLock(preview.work_unit_id, { home, lease }, (appendEvent) => {
    const unresolved = unresolvedCanonicalGrantForParticipantV1(
      preview.work_unit_id,
      preview.route_participant.participant_id,
      { home },
    );
    if (unresolved) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'UNRESOLVED_GRANT_ALREADY_EXISTS',
        standing: unresolved.standing,
        grant: unresolved.grant,
      };
    }

    const events = readCanonicalGrantEventsV1(preview.work_unit_id, { home });
    const sequence = events.filter((event) => event.event === 'ISSUED').length + 1;
    const made = createCanonicalExecutionGrantV1(preview, {
      sequence,
      issued_at,
      actor_id,
      authorization_act,
    });
    if (!made.ok) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: made.blockers?.[0]?.code || 'GRANT_CREATION_REFUSED',
        blockers: made.blockers || [],
        grant: null,
      };
    }

    appendEvent({
      event: 'ISSUED',
      at: issued_at,
      grant: made.grant,
    });
    return {
      ok: true,
      status: 'AUTHORIZED_ONCE',
      standing: 'ACTIVE',
      grant: made.grant,
    };
  });
}

export function claimCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  { home, lease, at = new Date().toISOString() } = {},
) {
  return withLedgerLock(workUnitId, { home, lease }, (appendEvent) => {
    const standing = canonicalGrantStandingV1(workUnitId, grantId, { home });
    if (!standing.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (standing.standing !== 'ACTIVE') {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'GRANT_NOT_ACTIVE',
        standing: standing.standing,
      };
    }
    appendEvent({
      event: 'CLAIMED',
      at,
      grant_id: grantId,
    });
    return { ok: true, status: 'CLAIMED', grant: standing.grant };
  });
}

export function consumeCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    outcome = 'execution_attempted',
  } = {},
) {
  return withLedgerLock(workUnitId, { home, lease }, (appendEvent) => {
    const standing = canonicalGrantStandingV1(workUnitId, grantId, { home });
    if (!standing.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (standing.standing !== 'CLAIMED') {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'GRANT_NOT_CLAIMED',
        standing: standing.standing,
      };
    }
    appendEvent({
      event: 'CONSUMED',
      at,
      grant_id: grantId,
      outcome,
    });
    return { ok: true, status: 'CONSUMED', grant: standing.grant };
  });
}

export function invalidateCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    reason = 'CURRENT_FACTS_CHANGED',
  } = {},
) {
  return withLedgerLock(workUnitId, { home, lease }, (appendEvent) => {
    const standing = canonicalGrantStandingV1(workUnitId, grantId, { home });
    if (!standing.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (!['ACTIVE', 'CLAIMED'].includes(standing.standing)) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'GRANT_NOT_INVALIDATABLE',
        standing: standing.standing,
      };
    }
    appendEvent({
      event: 'INVALIDATED',
      at,
      grant_id: grantId,
      reason,
    });
    return { ok: true, status: 'INVALIDATED', grant: standing.grant };
  });
}

export function revokeCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    reason = 'HUMAN_REVOKED',
  } = {},
) {
  return withLedgerLock(workUnitId, { home, lease }, (appendEvent) => {
    const standing = canonicalGrantStandingV1(workUnitId, grantId, { home });
    if (!standing.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (standing.standing !== 'ACTIVE') {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'GRANT_NOT_ACTIVE',
        standing: standing.standing,
      };
    }
    appendEvent({
      event: 'REVOKED',
      at,
      grant_id: grantId,
      reason,
    });
    return { ok: true, status: 'REVOKED', grant: standing.grant };
  });
}
