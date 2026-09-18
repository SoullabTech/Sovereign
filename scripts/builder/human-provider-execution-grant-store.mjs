/**
 * R5B append-only grant event store.
 *
 * The immutable Work Unit packet is never rewritten. Every human grant and
 * lifecycle event is appended to a separate JSONL ledger.
 */
import {
  existsSync,
  readFileSync,
  appendFileSync,
  mkdirSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHumanExecutionGrant } from './human-provider-execution-grant.mjs';

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

export function readGrantEvents(workUnitId, { home } = {}) {
  const file = grantLedgerPath(workUnitId, home);
  if (!existsSync(file)) return [];
  const events = [];
  let lineNumber = 0;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    lineNumber += 1;
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      throw new Error('EXECUTION_GRANT_LEDGER_CORRUPT at line ' + lineNumber);
    }
  }
  return events;
}

function appendEvent(workUnitId, event, { home } = {}) {
  const file = grantLedgerPath(workUnitId, home);
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + '\n', { mode: 0o600 });
  return event;
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
} = {}) {
  if (!preview?.ok) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'AUTHORIZATION_PREVIEW_REQUIRED',
      grant: null,
    };
  }
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

  appendEvent(preview.work_unit_id, {
    event: 'ISSUED',
    at: issued_at,
    grant: created.grant,
  }, { home });
  return {
    ok: true,
    status: 'AUTHORIZED_ONCE',
    grant: created.grant,
    standing: 'ACTIVE',
  };
}

export function claimHumanExecutionGrant(
  workUnitId,
  grantId,
  { home, at = new Date().toISOString() } = {},
) {
  const standing = grantStanding(workUnitId, grantId, { home });
  if (!standing.exists) {
    return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  }
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
}

export function consumeHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    outcome = 'attempt_recorded',
  } = {},
) {
  const standing = grantStanding(workUnitId, grantId, { home });
  if (!standing.exists) {
    return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  }
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
}

export function invalidateHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    reason = 'CURRENT_FACTS_CHANGED',
  } = {},
) {
  const standing = grantStanding(workUnitId, grantId, { home });
  if (!standing.exists) {
    return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  }
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
}

export function revokeHumanExecutionGrant(
  workUnitId,
  grantId,
  {
    home,
    at = new Date().toISOString(),
    reason = 'HUMAN_REVOKED',
  } = {},
) {
  const standing = grantStanding(workUnitId, grantId, { home });
  if (!standing.exists) {
    return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
  }
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
}
