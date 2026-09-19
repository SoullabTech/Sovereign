/**
 * E1 append-only canonical execution-grant event store.
 *
 * This sidecar never rewrites W0.v2/W2.v2/W3.v2/W3T.v1/W4.v2 truth.
 */
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createCanonicalExecutionGrantV1 } from './canonical-provider-execution-v1.mjs';

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

function withLedgerLock(workUnitId, { home } = {}, fn) {
  const lock = canonicalGrantLedgerLockPathV1(workUnitId, home);
  mkdirSync(path.dirname(lock), { recursive: true });

  let fd;
  try {
    fd = openSync(lock, 'wx', 0o600);
    closeSync(fd);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'GRANT_LEDGER_BUSY',
      };
    }
    throw error;
  }

  try {
    return fn();
  } finally {
    try {
      unlinkSync(lock);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

export function readCanonicalGrantEventsV1(workUnitId, { home } = {}) {
  const file = canonicalGrantLedgerPathV1(workUnitId, home);
  if (!existsSync(file)) return [];
  const events = [];
  let lineNumber = 0;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    lineNumber += 1;
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      throw new Error('CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT at line ' + lineNumber);
    }
  }
  return events;
}

function appendEvent(workUnitId, event, { home } = {}) {
  const file = canonicalGrantLedgerPathV1(workUnitId, home);
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + '\n', { mode: 0o600 });
  return event;
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
} = {}) {
  if (!preview?.ok) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'AUTHORIZATION_PREVIEW_REQUIRED',
      grant: null,
    };
  }

  return withLedgerLock(preview.work_unit_id, { home }, () => {
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

    appendEvent(preview.work_unit_id, {
      event: 'ISSUED',
      at: issued_at,
      grant: made.grant,
    }, { home });
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
  { home, at = new Date().toISOString() } = {},
) {
  return withLedgerLock(workUnitId, { home }, () => {
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
    appendEvent(workUnitId, {
      event: 'CLAIMED',
      at,
      grant_id: grantId,
    }, { home });
    return { ok: true, status: 'CLAIMED', grant: standing.grant };
  });
}

export function consumeCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    outcome = 'execution_attempted',
  } = {},
) {
  return withLedgerLock(workUnitId, { home }, () => {
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
    appendEvent(workUnitId, {
      event: 'CONSUMED',
      at,
      grant_id: grantId,
      outcome,
    }, { home });
    return { ok: true, status: 'CONSUMED', grant: standing.grant };
  });
}

export function invalidateCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    reason = 'CURRENT_FACTS_CHANGED',
  } = {},
) {
  return withLedgerLock(workUnitId, { home }, () => {
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
    appendEvent(workUnitId, {
      event: 'INVALIDATED',
      at,
      grant_id: grantId,
      reason,
    }, { home });
    return { ok: true, status: 'INVALIDATED', grant: standing.grant };
  });
}

export function revokeCanonicalExecutionGrantV1(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    reason = 'HUMAN_REVOKED',
  } = {},
) {
  return withLedgerLock(workUnitId, { home }, () => {
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
    appendEvent(workUnitId, {
      event: 'REVOKED',
      at,
      grant_id: grantId,
      reason,
    }, { home });
    return { ok: true, status: 'REVOKED', grant: standing.grant };
  });
}
