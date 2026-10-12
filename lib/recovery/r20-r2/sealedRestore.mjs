/**
 * R20-R2 sealed-restoration simulator.
 * Explicit synthetic-only adapter: can NEVER connect to or promote production.
 * Actual PostgreSQL/canonical schema coverage requires a separate isolated
 * integration test, independent review, and human restoration authorization.
 */
import { digest, admitSignedDeletionAuthority } from './signedLedger.mjs';

const FIELDS = Object.freeze({
  member_manuscripts: 'member_id',
  living_works: 'member_id',
  conversation_turns: 'user_id',
  agent_runs: 'user_id',
  integration_passes: 'user_id',
});

function reject(reason) { throw new Error('R20 sealed restore refused: ' + reason); }

function matchScope(row, scope, table) {
  const owner = FIELDS[table];
  if (!owner || !row || typeof row !== 'object') reject('unknown row mapping');
  if (scope.memberId != null) {
    if (!(owner in row)) reject('member ownership column missing');
    if (String(row[owner]) !== scope.memberId) return false;
  }
  if (scope.sessionId != null) {
    if (!('session_id' in row)) reject('session column missing');
    if (String(row.session_id) !== scope.sessionId) return false;
  }
  if (scope.windowStart != null || scope.windowEnd != null) {
    if (!('created_at' in row)) reject('created_at column missing');
    const time = Date.parse(row.created_at);
    if (!Number.isFinite(time)) reject('created_at invalid');
    if (scope.windowStart != null && time < Date.parse(scope.windowStart)) return false;
    if (scope.windowEnd != null && time > Date.parse(scope.windowEnd)) return false;
  }
  return true;
}

export function rehearseSealedRestore({
  target, archive, independentlyPinnedArchiveSha256, authority,
}) {
  // Hard-coded synthetic boundary. Never import database/network libraries.
  if (target !== 'R20_DISPOSABLE_SYNTHETIC_ONLY' ||
      archive?.type !== 'SYNTHETIC_JSON_FIXTURE' ||
      archive?.containsMemberData !== false) {
    reject('target is not a sealed fabricated-data fixture');
  }
  if (digest(archive) !== independentlyPinnedArchiveSha256) {
    reject('backup hash differs from externally pinned source');
  }
  const admittedAuthority = admitSignedDeletionAuthority(authority);
  if (!Array.isArray(archive.rows)) reject('backup rows missing');

  const before = structuredClone(archive.rows);
  if (before.some(row =>
    !row || !FIELDS[row.table] || !row.id ||
    typeof row.id !== 'string' || !('synthetic' in row) || row.synthetic !== true)) {
    reject('unknown or non-synthetic restored content lane');
  }

  const events = authority.sealedLedger.payload.events;
  let after = before;
  const suppressedIds = new Set();

  // This simulator handles only its declared content lanes; it cannot promise
  // child FK cascading, independent file/vault destruction or offsite purge.
  for (const event of events) {
    for (const item of event.tombstones) {
      if (!FIELDS[item.table]) reject('tombstoned unknown lane');
      after = after.filter(row => {
        const matches = row.table === item.table && row.id === item.id;
        if (matches) suppressedIds.add(row.table + '/' + row.id);
        return !matches;
      });
    }
    for (const scope of event.scopes) {
      if (!FIELDS[scope.table]) reject('scoped unknown lane');
      after = after.filter(row => {
        const matches = row.table === scope.table &&
          matchScope(row, scope, scope.table);
        if (matches) suppressedIds.add(row.table + '/' + row.id);
        return !matches;
      });
    }
  }

  // Assert the same deletion constraints against the retained preview rows.
  for (const event of events) {
    for (const item of event.tombstones) {
      if (after.some(row => row.table === item.table && row.id === item.id)) {
        reject('tombstoned row still present');
      }
    }
    for (const scope of event.scopes) {
      if (after.some(row => row.table === scope.table &&
         matchScope(row, scope, scope.table))) {
        reject('scoped row still present');
      }
    }
  }

  const retainedIds = new Set(after.map(x => x.table + '/' + x.id));
  if (retainedIds.size !== after.length) reject('duplicate recovered row identity');
  const unaffected = before.filter(row => !suppressedIds.has(row.table + '/' + row.id));
  if (unaffected.some(row => !retainedIds.has(row.table + '/' + row.id))) {
    reject('unrelated synthetic control material was lost');
  }

  return Object.freeze({
    state: 'SYNTHETIC_QUARANTINED_VALIDATION_ONLY',
    promotionAllowed: false,
    ledgerSequence: admittedAuthority.latestSequence,
    archiveHashVerified: true,
    sourceRowCount: before.length,
    suppressedRowCount: suppressedIds.size,
    restoredRowCount: after.length,
    // The synthetic test harness may inspect these, never production routes.
    preview: structuredClone(after),
  });
}
