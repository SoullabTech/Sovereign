/**
 * D5 append-only publication grant store.
 *
 * Events: ISSUED -> CLAIMED -> CONSUMED
 * Terminal alternatives: ACTIVE -> REVOKED; ACTIVE/CLAIMED -> INVALIDATED.
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
import { createDevelopmentPublicationGrantV1 } from './canonical-development-publication-v1.mjs';

const HOME = (home) => home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');

const STORE = (home) => path.join(HOME(home), 'work-units-v2', 'publication-grants');

function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,127}$/i.test(String(value || ''));
}
export function publicationGrantLedgerPathV1(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid work_unit_id');
  return path.join(STORE(home), workUnitId + '.jsonl');
}
function lockPath(workUnitId, home) {
  return publicationGrantLedgerPathV1(workUnitId, home) + '.lock';
}
function withLock(workUnitId, { home } = {}, fn) {
  const lock = lockPath(workUnitId, home);
  mkdirSync(path.dirname(lock), { recursive: true });
  let fd;
  try {
    fd = openSync(lock, 'wx', 0o600);
    closeSync(fd);
  } catch (error) {
    if (error?.code === 'EEXIST') return { ok: false, status: 'REFUSED', reason: 'PUBLICATION_GRANT_LEDGER_BUSY' };
    throw error;
  }
  try {
    return fn();
  } finally {
    try { unlinkSync(lock); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
}
export function readPublicationGrantEventsV1(workUnitId, { home } = {}) {
  const file = publicationGrantLedgerPathV1(workUnitId, home);
  if (!existsSync(file)) return [];
  const events = [];
  let line = 0;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    line += 1;
    if (!raw.trim()) continue;
    try { events.push(JSON.parse(raw)); }
    catch { throw new Error('DEVELOPMENT_PUBLICATION_GRANT_LEDGER_CORRUPT at line ' + line); }
  }
  return events;
}
function append(workUnitId, event, { home } = {}) {
  const file = publicationGrantLedgerPathV1(workUnitId, home);
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(event) + '\n', { mode: 0o600 });
}
function stream(events, grantId) {
  return events.filter((e) => e?.grant?.grant_id === grantId || e?.grant_id === grantId);
}
export function publicationGrantStandingFromEventsV1(events, grantId) {
  const eventsForGrant = stream(events, grantId);
  const grant = eventsForGrant.find((e) => e.event === 'ISSUED')?.grant || null;
  if (!grant) return { exists: false, standing: 'MISSING', grant: null, events: [] };
  let standing = 'ACTIVE';
  for (const event of eventsForGrant) {
    if (event.event === 'CLAIMED') standing = 'CLAIMED';
    if (event.event === 'CONSUMED') standing = 'CONSUMED';
    if (event.event === 'REVOKED') standing = 'REVOKED';
    if (event.event === 'INVALIDATED') standing = 'INVALIDATED';
  }
  return { exists: true, standing, grant, events: eventsForGrant };
}
export function publicationGrantStandingV1(workUnitId, grantId, { home } = {}) {
  return publicationGrantStandingFromEventsV1(
    readPublicationGrantEventsV1(workUnitId, { home }),
    grantId,
  );
}
function unresolved(workUnitId, { home } = {}) {
  const events = readPublicationGrantEventsV1(workUnitId, { home });
  const issued = events.filter((e) => e.event === 'ISSUED' && e.grant?.grant_id);
  return issued.map((e) => publicationGrantStandingFromEventsV1(events, e.grant.grant_id))
    .find((x) => ['ACTIVE', 'CLAIMED'].includes(x.standing)) || null;
}
export function issueDevelopmentPublicationGrantV1(prepared, {
  home,
  actor_id,
  issued_at = new Date().toISOString(),
} = {}) {
  if (!prepared?.ok || !prepared.preview?.work_unit_id) {
    return { ok: false, status: 'REFUSED', reason: 'PUBLICATION_PREVIEW_REQUIRED' };
  }
  return withLock(prepared.preview.work_unit_id, { home }, () => {
    const prior = unresolved(prepared.preview.work_unit_id, { home });
    if (prior) return { ok: false, status: 'REFUSED', reason: 'UNRESOLVED_PUBLICATION_GRANT_EXISTS', standing: prior.standing };
    const events = readPublicationGrantEventsV1(prepared.preview.work_unit_id, { home });
    const sequence = events.filter((e) => e.event === 'ISSUED').length + 1;
    const made = createDevelopmentPublicationGrantV1(prepared, {
      sequence,
      actor_id,
      issued_at,
    });
    if (!made.ok) return { ...made, reason: made.blockers?.[0]?.code || 'PUBLICATION_GRANT_CREATION_REFUSED' };
    append(prepared.preview.work_unit_id, { event: 'ISSUED', at: issued_at, grant: made.grant }, { home });
    return { ok: true, status: 'AUTHORIZED_ONCE', standing: 'ACTIVE', grant: made.grant };
  });
}
export function claimDevelopmentPublicationGrantV1(workUnitId, grantId, {
  home,
  at = new Date().toISOString(),
} = {}) {
  return withLock(workUnitId, { home }, () => {
    const current = publicationGrantStandingV1(workUnitId, grantId, { home });
    if (!current.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (current.standing !== 'ACTIVE') return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_ACTIVE', standing: current.standing };
    append(workUnitId, { event: 'CLAIMED', at, grant_id: grantId }, { home });
    return { ok: true, status: 'CLAIMED', grant: current.grant };
  });
}
export function consumeDevelopmentPublicationGrantV1(workUnitId, grantId, {
  home,
  at = new Date().toISOString(),
  outcome = 'publication_attempted',
} = {}) {
  return withLock(workUnitId, { home }, () => {
    const current = publicationGrantStandingV1(workUnitId, grantId, { home });
    if (!current.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (current.standing !== 'CLAIMED') return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_CLAIMED', standing: current.standing };
    append(workUnitId, { event: 'CONSUMED', at, grant_id: grantId, outcome }, { home });
    return { ok: true, status: 'CONSUMED', grant: current.grant };
  });
}
export function revokeDevelopmentPublicationGrantV1(workUnitId, grantId, {
  home,
  at = new Date().toISOString(),
  reason = 'HUMAN_REVOKED',
} = {}) {
  return withLock(workUnitId, { home }, () => {
    const current = publicationGrantStandingV1(workUnitId, grantId, { home });
    if (!current.exists) return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_FOUND' };
    if (current.standing !== 'ACTIVE') return { ok: false, status: 'REFUSED', reason: 'GRANT_NOT_ACTIVE', standing: current.standing };
    append(workUnitId, { event: 'REVOKED', at, grant_id: grantId, reason }, { home });
    return { ok: true, status: 'REVOKED', grant: current.grant };
  });
}
