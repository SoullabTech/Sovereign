/** Database-only final-write fence. No connection, provider or transport default. */
import type { QueryResultRow } from 'pg';
import { decideEncounterConsent, ENCOUNTER_CONSENT_PURPOSES, type EncounterConsentEvent,
  type EncounterConsentPurpose } from './consentDecision';
import { assertVerifiedParticipantStopAuthority, type VerifiedParticipantStopAuthority } from './roomStopAuthority';
import { ROOM_STOP_TARGETS, type RoomStopScope } from './roomStopContract';
import type { RoomStopDatabase, RoomStopTransactionClient } from './roomStopStore';

export class RoomWorkFenceError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'RoomWorkFenceError'; }
}

export interface RoomWorkContext { role: string; displayName: string; admissionEventId: string }

/** Match accepted A/R3A ordering: participant Stop first, join next, other purposes sorted. */
export async function lockRoomWorkScope(client: RoomStopTransactionClient, scope: RoomStopScope,
  purposes: readonly EncounterConsentPurpose[]): Promise<void> {
  await client.query(`SELECT pg_advisory_xact_lock(hashtextextended('encounter-room-stop|' || $1::text || '|' || $2::text, 0))`,
    [scope.encounterId, scope.participantId]);
  const ordered = ['join', ...[...new Set(purposes)].filter(p => p !== 'join').sort()];
  for (const purpose of ordered) await client.query(
    `SELECT pg_advisory_xact_lock(hashtextextended($1::text || '|' || $2::text || '|' || $3::text || '|' || $4::text || '|' || $5::text, 0))`,
    [scope.encounterId, scope.participantId, purpose, scope.agreementVersion, scope.consentGeneration]);
}

/** Call only within a transaction whose relevant locks have been acquired. */
export async function inspectRoomWorkScope(client: RoomStopTransactionClient, scope: RoomStopScope,
  purposes: readonly EncounterConsentPurpose[]): Promise<RoomWorkContext> {
  const context = await client.query(`SELECT e.consent_agreement_version, e.consent_generation, e.status,
      ep.role, ep.display_name FROM encounters e JOIN encounter_participants ep ON ep.encounter_id = e.id
      WHERE e.id = $1 AND ep.id = $2 FOR SHARE OF e, ep`, [scope.encounterId, scope.participantId]);
  const row = context.rows[0];
  if (context.rows.length !== 1 || row.consent_agreement_version !== scope.agreementVersion
      || Number(row.consent_generation) !== scope.consentGeneration) throw new RoomWorkFenceError('STALE_CONSENT_SCOPE');
  if (!['draft', 'active'].includes(row.status)) throw new RoomWorkFenceError('ROOM_ENDED');
  const stopped = await client.query(`SELECT id, stop_generation, runtime_id FROM encounter_room_stop_operations
      WHERE encounter_id = $1 AND participant_id = $2 AND agreement_version = $3 AND consent_generation = $4`,
    [scope.encounterId, scope.participantId, scope.agreementVersion, scope.consentGeneration]);
  if (stopped.rows.length) throw new RoomWorkFenceError('ROOM_STOPPED');
  let admissionEventId = '';
  for (const purpose of [...new Set<EncounterConsentPurpose>(['join', ...purposes])]) {
    const result = await client.query(`SELECT id AS event_id, encounter_id, participant_id, actor_participant_id,
        purpose, action, agreement_version, generation, EXTRACT(EPOCH FROM decided_at) * 1000 AS decided_at_ms
        FROM encounter_consent_events WHERE encounter_id = $1 AND participant_id = $2 AND purpose = $3
        AND agreement_version = $4 AND generation = $5 AND legacy_provenance = FALSE ORDER BY decided_at, id`,
      [scope.encounterId, scope.participantId, purpose, scope.agreementVersion, scope.consentGeneration]);
    const events: EncounterConsentEvent[] = result.rows.map(event => ({ eventId: event.event_id,
      encounterId: event.encounter_id, participantId: event.participant_id, actorParticipantId: event.actor_participant_id,
      purpose: event.purpose, action: event.action, agreementVersion: event.agreement_version,
      generation: Number(event.generation), createdAt: Number(event.decided_at_ms) }));
    const decision = decideEncounterConsent(events, { encounterId: scope.encounterId, participantId: scope.participantId,
      purpose, agreementVersion: scope.agreementVersion, generation: scope.consentGeneration });
    if (!decision.allowed || !decision.authoritativeEventId) throw new RoomWorkFenceError('CONSENT_REFUSED');
    if (purpose === 'join') admissionEventId = decision.authoritativeEventId;
  }
  return { role: row.role, displayName: row.display_name, admissionEventId };
}

/**
 * Only a server-owned parameterized SQL statement belongs here. The write and
 * gate share one connection/transaction. No callback, network, file or later
 * asynchronous effect receives a transferable permission from this function.
 */
export async function executeRoomWork<T extends QueryResultRow = any>(input: {
  authority: VerifiedParticipantStopAuthority;
  purposes: readonly EncounterConsentPurpose[];
  statement: { text: string; values?: any[] };
}, database: RoomStopDatabase): Promise<{ rows: T[] }> {
  assertVerifiedParticipantStopAuthority(input?.authority);
  if (!database || typeof database.connect !== 'function' || !Array.isArray(input.purposes)
      || input.purposes.length === 0 || input.purposes.length > ENCOUNTER_CONSENT_PURPOSES.length
      || input.purposes.some(p => !ENCOUNTER_CONSENT_PURPOSES.includes(p))
      || !input.statement || typeof input.statement.text !== 'string'
      || input.statement.text.length > 16384 || !/^\s*(INSERT|UPDATE|DELETE)\s/i.test(input.statement.text)
      || input.statement.text.includes(';') || (input.statement.values !== undefined && !Array.isArray(input.statement.values))) {
    throw new RoomWorkFenceError('INVALID_WORK_STATEMENT');
  }
  // Snapshot arguments before the first await; mutable callers cannot change the guarded scope or SQL.
  const authority = input.authority, scope = authority.scope;
  const purposes = [...input.purposes], text = input.statement.text;
  const values = (input.statement.values ?? []).map(value => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean'
        || (typeof value === 'number' && Number.isFinite(value))) return value;
    if (Buffer.isBuffer(value)) return Buffer.from(value);
    throw new RoomWorkFenceError('INVALID_WORK_PARAMETER');
  });
  let client: RoomStopTransactionClient | undefined, committing = false;
  try {
    client = await database.connect();
    await client.query('BEGIN');
    await lockRoomWorkScope(client, scope, purposes);
    assertVerifiedParticipantStopAuthority(authority);
    const binding = await client.query(`SELECT admission_event_id, target_bindings FROM encounter_room_stop_bindings
        WHERE encounter_id=$1 AND participant_id=$2 AND agreement_version=$3 AND consent_generation=$4 AND runtime_id=$5`,
      [scope.encounterId, scope.participantId, scope.agreementVersion, scope.consentGeneration, scope.runtimeId]);
    const b = binding.rows[0];
    if (binding.rows.length !== 1 || b.admission_event_id !== authority.binding.admissionEventId
        || !ROOM_STOP_TARGETS.every(target => {
          const actual = b.target_bindings?.[target], expected = authority.binding.targetBindings[target];
          return actual && actual.principalId === expected.principalId && actual.adapterRuntimeId === expected.adapterRuntimeId
            && actual.evidenceKind === expected.evidenceKind;
        })) throw new RoomWorkFenceError('UNBOUND_RUNTIME');
    await inspectRoomWorkScope(client, scope, purposes);
    assertVerifiedParticipantStopAuthority(authority);
    const result = await client.query<T>(text, values);
    assertVerifiedParticipantStopAuthority(authority);
    committing = true;
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client?.query('ROLLBACK'); } catch { /* preserve outcome */ }
    if (committing) throw new RoomWorkFenceError('COMMIT_OUTCOME_UNKNOWN');
    if (error instanceof RoomWorkFenceError) throw error;
    throw new RoomWorkFenceError('PERSISTENCE_FAILED');
  } finally { try { client?.release(); } catch { /* successful COMMIT remains known */ } }
}
