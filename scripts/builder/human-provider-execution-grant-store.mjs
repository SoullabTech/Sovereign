/**
 * R5B append-only grant event store.
 *
 * The immutable Work Unit packet is never rewritten. Every human grant and
 * lifecycle event is appended to a separate JSONL ledger.
 */
import path from 'node:path';
import os from 'node:os';
import { createHumanExecutionGrant } from './human-provider-execution-grant.mjs';
import { mutateGrantLedgerV1, readGrantLedgerV1 } from './grant-ledger-core-v1.mjs';
import { resolveHome } from './grant-writer-lease-v1.mjs';

const HOME = (home) => home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');

const GRANTS_DIR = (home) => path.join(HOME(home), 'execution-grants');

function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,127}$/i.test(String(value || ''));
}

export function grantLedgerPath(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid work_unit_id');
  return path.join(GRANTS_DIR(home), workUnitId + '.jsonl');
}

/** O5-R3: the per-append lock beside this ledger. New in R3 for this store (compatibility fence, R3-R10). */
export function grantLedgerLockPath(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid work_unit_id');
  return path.join(GRANTS_DIR(home), workUnitId + '.lock');
}

/** Lease-free read: committed events plus any uncommitted terminal fragment (reported, never fatal). */
export function readGrantLedger(workUnitId, { home } = {}) {
  return readGrantLedgerV1(grantLedgerPath(workUnitId, home), { corruptCode: 'EXECUTION_GRANT_LEDGER_CORRUPT' });
}

export function readGrantEvents(workUnitId, { home } = {}) {
  return readGrantLedger(workUnitId, { home }).events;
}

/**
 * O5-R3 (R3-R2): the human-provider grant ledger is inside the grant authority domain.
 * Every mutation requires the writer lease, takes the per-append lock, and recovers a
 * torn terminal fragment behind the durable barrier, exactly as the canonical store does.
 * Before R3 this store had no lock at all.
 */
function withLedger(workUnitId, { home, lease } = {}, fn) {
  const file = grantLedgerPath(workUnitId, home);
  return mutateGrantLedgerV1({
    home,
    file,
    lockPath: grantLedgerLockPath(workUnitId, home),
    ledgerId: path.relative(resolveHome(home), file),
    store: 'human-provider',
    corruptCode: 'EXECUTION_GRANT_LEDGER_CORRUPT',
    lease,
  }, (ctx) => fn(ctx.append));
}

function issuedEvents(events) {
  return events.filter((event) => event.event === 'ISSUED' && event.grant?.grant_id);
}

function eventsForGrant(events, grantId) {
  return events.filter((event) => (
    event.grant?.grant_id === grantId || event.grant_id === grantId
  ));
}

export function grantStandingFromEvents(events, grantId) {
  const stream = eventsForGrant(events, grantId);
  const issued = stream.find((event) => event.event === 'ISSUED')?.grant || null;
  if (!issued) return { exists: false, grant: null, standing: 'MISSING', events: [] };

  let standing = 'ACTIVE';
  for (const event of stream) {
    if (event.event === 'CLAIMED') standing = 'CLAIMED';
    if (event.event === 'CONSUMED') standing = 'CONSUMED';
    if (event.event === 'REVOKED') standing = 'REVOKED';
    if (event.event === 'INVALIDATED') standing = 'INVALIDATED';
  }
  return { exists: true, grant: issued, standing, events: stream };
}

export function grantStanding(workUnitId, grantId, { home } = {}) {
  return grantStandingFromEvents(readGrantEvents(workUnitId, { home }), grantId);
}

export function listGrantStandings(workUnitId, { home } = {}) {
  const events = readGrantEvents(workUnitId, { home });
  return issuedEvents(events).map((event) => (
    grantStandingFromEvents(events, event.grant.grant_id)
  ));
}

export function activeGrantForProvider(workUnitId, providerId, { home } = {}) {
  return listGrantStandings(workUnitId, { home }).find((entry) => (
    entry.grant?.provider_id === providerId
    && entry.standing === 'ACTIVE'
  )) || null;
}

export function issueHumanExecutionGrant(preview, {
  home,
  grantor = 'founder',
  authorization_act = 'R5B_AUTHORIZE_ONCE',
  issued_at = new Date().toISOString(),
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
  return withLedger(preview.work_unit_id, { home, lease }, (appendEvent) => {
    const active = activeGrantForProvider(
      preview.work_unit_id,
      preview.provider_id,
      { home },
    );
    if (active) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'ACTIVE_GRANT_ALREADY_EXISTS',
        grant: active.grant,
      };
    }

    const events = readGrantEvents(preview.work_unit_id, { home });
    const sequence = issuedEvents(events).length + 1;
    const created = createHumanExecutionGrant(preview, {
      grantor,
      authorization_act,
      sequence,
      issued_at,
    });
    if (!created.ok) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: created.blockers?.[0]?.code || 'GRANT_CREATION_REFUSED',
        blockers: created.blockers || [],
        grant: null,
      };
    }

    appendEvent({
      event: 'ISSUED',
      at: issued_at,
      grant: created.grant,
    });
    return {
      ok: true,
      status: 'AUTHORIZED_ONCE',
      grant: created.grant,
      standing: 'ACTIVE',
    };
  });
}

/** One standing transition under the full R3 discipline. */
function transition(workUnitId, grantId, { home, lease }, { from, refusal, event, extra, status }) {
  return withLedger(workUnitId, { home, lease }, (appendEvent) => {
    const standing = grantStanding(workUnitId, grantId, { home });
    if (!standing.exists) {
      return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    }
    if (!from.includes(standing.standing)) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: refusal,
        standing: standing.standing,
      };
    }
    appendEvent({ event, at: extra.at, grant_id: grantId, ...extra.fields });
    return { ok: true, status, grant: standing.grant };
  });
}

export function claimHumanExecutionGrant(
  workUnitId,
  grantId,
  { home, lease, at = new Date().toISOString() } = {},
) {
  return transition(workUnitId, grantId, { home, lease }, {
    from: ['ACTIVE'], refusal: 'GRANT_NOT_ACTIVE', event: 'CLAIMED', status: 'CLAIMED', extra: { at, fields: {} },
  });
}

export function consumeHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    outcome = 'attempt_recorded',
  } = {},
) {
  return transition(workUnitId, grantId, { home, lease }, {
    from: ['CLAIMED'], refusal: 'GRANT_NOT_CLAIMED', event: 'CONSUMED', status: 'CONSUMED', extra: { at, fields: { outcome } },
  });
}

export function invalidateHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    reason = 'CURRENT_FACTS_CHANGED',
  } = {},
) {
  return transition(workUnitId, grantId, { home, lease }, {
    from: ['ACTIVE', 'CLAIMED'], refusal: 'GRANT_NOT_INVALIDATABLE', event: 'INVALIDATED', status: 'INVALIDATED', extra: { at, fields: { reason } },
  });
}

export function revokeHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    lease,
    at = new Date().toISOString(),
    reason = 'HUMAN_REVOKED',
  } = {},
) {
  return transition(workUnitId, grantId, { home, lease }, {
    from: ['ACTIVE'], refusal: 'GRANT_NOT_ACTIVE', event: 'REVOKED', status: 'REVOKED', extra: { at, fields: { reason } },
  });
}
