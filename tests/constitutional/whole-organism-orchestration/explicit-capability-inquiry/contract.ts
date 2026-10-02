import {
  PILOT_PRESENTATIONS,
  type PilotCapabilityId,
  type PilotPresentation,
} from './fixture';
import type { DescriptionOnlyPayload } from './resolver';

export interface InquiryLawResult {
  readonly lawId: string;
  readonly ok: boolean;
  readonly detail: string;
}

const EXPECTED_IDS: readonly PilotCapabilityId[] = [
  'journal.create',
  'journal.dream',
  'astrology.reading',
] as const;

const FORBIDDEN_OPERATIONAL_KEYS = [
  'route',
  'href',
  'button',
  'buttonId',
  'available',
  'availability',
  'eligible',
  'entitlement',
  'tier',
  'role',
  'offer',
  'cta',
  'invoke',
  'execute',
  'canInvoke',
] as const;

const FORBIDDEN_MEMBER_KEYS = [
  'memberId',
  'userId',
  'sessionId',
  'history',
  'conversationHistory',
  'memory',
  'preferences',
  'currentRoom',
  'confidence',
  'relevance',
] as const;

function result(lawId: string, ok: boolean, detail: string): InquiryLawResult {
  return { lawId, ok, detail };
}

function hasOwnKey(value: unknown, keys: readonly string[]): boolean {
  if (!value || typeof value !== 'object') return false;
  return keys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function expectedPresentation(
  capabilityId: PilotCapabilityId,
): PilotPresentation {
  const record = PILOT_PRESENTATIONS.find(
    (candidate) => candidate.capabilityId === capabilityId,
  );
  if (!record) throw new Error('EXPECTED_PILOT_PRESENTATION_MISSING');
  return record;
}

export function runPilotFixtureLaws(
  records: readonly PilotPresentation[],
): readonly InquiryLawResult[] {
  const ids = records.map((record) => record.capabilityId);

  return [
    result(
      'PILOT_ALLOWLIST_FIXED',
      ids.length === 3
        && new Set(ids).size === 3
        && ids.every((id, index) => id === EXPECTED_IDS[index]),
      'pilot allowlist must remain exactly journal.create, journal.dream, astrology.reading',
    ),
    result(
      'EXACT_COPY_CUSTODY',
      records.length === PILOT_PRESENTATIONS.length
        && records.every((record, index) =>
          record.capabilityId === PILOT_PRESENTATIONS[index].capabilityId
          && record.name === PILOT_PRESENTATIONS[index].name
          && record.purpose === PILOT_PRESENTATIONS[index].purpose
        ),
      'pilot name and purpose copy must remain exactly founder-approved',
    ),
    result(
      'PILOT_FIXTURE_NON_OPERATIONAL',
      records.every((record) => !hasOwnKey(record, FORBIDDEN_OPERATIONAL_KEYS)),
      'pilot fixture may not carry route, availability, offer, entitlement, or execution fields',
    ),
    result(
      'PILOT_FIXTURE_MEMBER_INDEPENDENT',
      records.every((record) => !hasOwnKey(record, FORBIDDEN_MEMBER_KEYS)),
      'pilot fixture may not carry member/session/history/context state',
    ),
  ];
}

export function runDescriptionPayloadLaws(
  payload: DescriptionOnlyPayload,
): readonly InquiryLawResult[] {
  const expected = expectedPresentation(payload.capabilityId);
  const keys = Object.keys(payload).sort();

  return [
    result(
      'DESCRIPTION_PAYLOAD_SHAPE',
      JSON.stringify(keys) === JSON.stringify(
        ['capabilityId', 'kind', 'name', 'purpose'].sort(),
      ),
      'description payload must contain exactly kind, capabilityId, name, purpose',
    ),
    result(
      'EXACT_COPY_REQUIRED',
      payload.kind === 'DESCRIPTION_ONLY'
        && payload.name === expected.name
        && payload.purpose === expected.purpose,
      'description payload must preserve exact founder-approved copy',
    ),
    result(
      'DESCRIPTION_NOT_ROUTING',
      !hasOwnKey(payload, ['route', 'href', 'button', 'navigation']),
      'description payload must carry no route or navigation',
    ),
    result(
      'DESCRIPTION_NOT_AVAILABILITY',
      !hasOwnKey(payload, ['available', 'availability', 'eligible', 'entitlement']),
      'description payload must carry no availability or entitlement semantics',
    ),
    result(
      'DESCRIPTION_NOT_OFFER',
      !hasOwnKey(payload, ['offer', 'cta', 'suggestion', 'invoke', 'execute']),
      'description payload must carry no offer or execution semantics',
    ),
    result(
      'DESCRIPTION_NOT_MEMBER_RELATIVE',
      !hasOwnKey(payload, FORBIDDEN_MEMBER_KEYS),
      'description payload must remain independent of member/session context',
    ),
  ];
}

export function exactRenderedDescription(
  payload: DescriptionOnlyPayload,
): string {
  const expected = expectedPresentation(payload.capabilityId);
  return `${expected.name} — ${expected.purpose}`;
}

export function renderedDescriptionIsTerminal(
  rendered: string,
  payload: DescriptionOnlyPayload,
): boolean {
  return rendered === exactRenderedDescription(payload);
}
