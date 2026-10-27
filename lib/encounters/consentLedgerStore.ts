import db from '@/lib/db/postgres';
import type { QueryResultRow } from 'pg';
import {
  decideEncounterConsent,
  type EncounterConsentAction,
  type EncounterConsentDecision,
  type EncounterConsentEvent,
  type EncounterConsentPurpose,
  type EncounterConsentScope,
} from './consentDecision';

export interface ConsentQueryable {
  query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
}

export interface EncounterConsentContext {
  encounterId: string;
  participantId: string;
  displayName: string;
  role: string;
  agreementVersion: string;
  generation: number;
}

interface ConsentContextRow {
  encounter_id: string;
  participant_id: string;
  display_name: string;
  role: string;
  consent_agreement_version: string;
  consent_generation: number;
}

interface ConsentEventRow {
  event_id: string;
  encounter_id: string;
  participant_id: string;
  actor_participant_id: string;
  purpose: EncounterConsentPurpose;
  action: EncounterConsentAction;
  agreement_version: string;
  generation: number;
  decided_at_ms: string | number;
}

const PURPOSES = new Set<EncounterConsentPurpose>([
  'join','record_audio','temporary_captions','retain_transcript','maia_attendance',
  'retain_summary','retain_developmental_memory','share_artifact',
]);
const ACTIONS = new Set<EncounterConsentAction>(['grant','refuse','revoke']);

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function currentGeneration(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}
function mapEvent(row: ConsentEventRow): EncounterConsentEvent {
  return Object.freeze({
    eventId: row.event_id,
    encounterId: row.encounter_id,
    participantId: row.participant_id,
    actorParticipantId: row.actor_participant_id,
    purpose: row.purpose,
    action: row.action,
    agreementVersion: row.agreement_version,
    generation: Number(row.generation),
    createdAt: Number(row.decided_at_ms),
  });
}

export async function loadEncounterConsentContext(
  encounterId: string,
  participantId: string,
  database: ConsentQueryable = db,
): Promise<EncounterConsentContext | null> {
  const result = await database.query<ConsentContextRow>(
    `SELECT e.id AS encounter_id, ep.id AS participant_id, ep.display_name, ep.role,
            e.consent_agreement_version, e.consent_generation
       FROM encounters e
       JOIN encounter_participants ep ON ep.encounter_id = e.id
      WHERE e.id = $1 AND ep.id = $2`,
    [encounterId, participantId],
  );
  const row = result.rows[0];
  if (!row || !nonEmpty(row.consent_agreement_version) || !currentGeneration(row.consent_generation)) return null;
  return Object.freeze({
    encounterId: row.encounter_id,
    participantId: row.participant_id,
    displayName: row.display_name,
    role: row.role,
    agreementVersion: row.consent_agreement_version,
    generation: Number(row.consent_generation),
  });
}

export async function loadEncounterConsentEvents(
  scope: EncounterConsentScope,
  database: ConsentQueryable = db,
): Promise<EncounterConsentEvent[]> {
  const result = await database.query<ConsentEventRow>(
    `SELECT id AS event_id, encounter_id, participant_id, actor_participant_id,
            purpose, action, agreement_version, generation,
            EXTRACT(EPOCH FROM decided_at) * 1000 AS decided_at_ms
       FROM encounter_consent_events
      WHERE encounter_id = $1
        AND participant_id = $2
        AND purpose = $3
        AND agreement_version = $4
        AND generation = $5
        AND legacy_provenance = FALSE
      ORDER BY decided_at ASC, id ASC`,
    [scope.encounterId, scope.participantId, scope.purpose, scope.agreementVersion, scope.generation],
  );
  return result.rows.map(mapEvent);
}

export async function decideStoredEncounterConsent(
  scope: EncounterConsentScope,
  database: ConsentQueryable = db,
): Promise<EncounterConsentDecision> {
  return decideEncounterConsent(await loadEncounterConsentEvents(scope, database), scope);
}

export async function appendEncounterConsentDecision(
  input: EncounterConsentScope & {
    action: EncounterConsentAction;
    textSnapshot?: string | null;
  },
  database: ConsentQueryable = db,
): Promise<EncounterConsentEvent> {
  if (!nonEmpty(input.encounterId) || !nonEmpty(input.participantId)
      || !PURPOSES.has(input.purpose) || !ACTIONS.has(input.action)
      || !nonEmpty(input.agreementVersion) || !currentGeneration(input.generation)) {
    throw new Error('INVALID_ENCOUNTER_CONSENT_DECISION');
  }
  const result = await database.query<ConsentEventRow>(
    `INSERT INTO encounter_consent_events
       (encounter_id, participant_id, actor_participant_id, kind, purpose, action,
        agreement_version, generation, decided_at, text_snapshot, legacy_provenance)
     SELECT e.id, ep.id, ep.id, NULL, $3, $4, $5, $6, clock_timestamp(), $7, FALSE
       FROM encounters e
       JOIN encounter_participants ep ON ep.encounter_id = e.id
      WHERE e.id = $1
        AND ep.id = $2
        AND e.consent_agreement_version = $5
        AND e.consent_generation = $6
     RETURNING id AS event_id, encounter_id, participant_id, actor_participant_id,
               purpose, action, agreement_version, generation,
               EXTRACT(EPOCH FROM decided_at) * 1000 AS decided_at_ms`,
    [input.encounterId, input.participantId, input.purpose, input.action,
     input.agreementVersion, input.generation, input.textSnapshot ?? null],
  );
  if (result.rows.length !== 1) throw new Error('CONSENT_SCOPE_STALE_OR_UNKNOWN');
  return mapEvent(result.rows[0]);
}

export function scopeFromContext(
  context: EncounterConsentContext,
  purpose: EncounterConsentPurpose,
): EncounterConsentScope {
  return Object.freeze({
    encounterId: context.encounterId,
    participantId: context.participantId,
    purpose,
    agreementVersion: context.agreementVersion,
    generation: context.generation,
  });
}
