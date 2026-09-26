/**
 * O7R2R1 — Ratified Presentation Reconciliation Contract.
 *
 * Test/governance only. Pure laws over documentary presentation records.
 * No runtime utterance, route, access, offer, entitlement, House, or MAIA authority.
 */
import type { CapabilityAuthorityId } from '../../../../lib/maia/capabilityAuthorityRegistry';
import { CANONICAL_IDS } from '../capability-awareness/contract';

export type PresentationStanding = 'APPROVED' | 'UNRESOLVED' | 'WITHHOLD';
export type ReconciliationClass =
  | 'COMPATIBLE'
  | 'STALE_MAP_SENSITIVE'
  | 'NOT_REPRESENTED'
  | 'NOT_ELIGIBLE_FOR_RECONCILIATION';

export interface PresentationReconciliationRecord {
  readonly capabilityId: CapabilityAuthorityId;
  readonly standing: PresentationStanding;
  readonly name?: string;
  readonly purpose?: string;
  readonly sourceRefs: readonly string[];
  readonly authorship: string;
  readonly platformKnowledgeReconciliation: ReconciliationClass;
  readonly utteranceContextCandidate: 'EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY' | 'NONE';
  readonly runtimeUtterance: 'NOT_AUTHORIZED' | string;
  readonly [key: string]: unknown;
}

export interface PresentationLawResult {
  readonly lawId: string;
  readonly ok: boolean;
  readonly detail: string;
}
const EXPECTED_RECONCILIATION: Readonly<Record<string, ReconciliationClass>> = {
  'journal.create': 'COMPATIBLE',
  'journal.save': 'STALE_MAP_SENSITIVE',
  'journal.dream': 'COMPATIBLE',
  'astrology.reading': 'COMPATIBLE',
  'astrology.transit.current': 'STALE_MAP_SENSITIVE',
  'astrology.transit.personal': 'STALE_MAP_SENSITIVE',
  'wisdom.open': 'NOT_REPRESENTED',
  'wisdom.surface': 'STALE_MAP_SENSITIVE',
  'wisdom.text.open': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
  'relationship.reflect': 'STALE_MAP_SENSITIVE',
  'shadow.open': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
  'studio.choose': 'STALE_MAP_SENSITIVE',
  'studio.writer.open': 'NOT_REPRESENTED',
  'studio.personal.open': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
  'studio.pro.open': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
  'booking.practitioner.request': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
  'studio.session.create': 'STALE_MAP_SENSITIVE',
  'pattern.detect': 'NOT_ELIGIBLE_FOR_RECONCILIATION',
};

const FORBIDDEN_ACCESS_KEYS = [
  'available', 'eligible', 'eligibility', 'tier', 'role', 'roles',
  'entitlement', 'entitlements', 'access', 'canInvoke', 'enabled',
] as const;

const FORBIDDEN_ROUTE_KEYS = [
  'route', 'href', 'modal', 'modalId', 'button', 'buttonId',
  'voicePhrase', 'voicePhrases', 'navigation',
] as const;

const FORBIDDEN_OFFER_KEYS = [
  'offer', 'suggestion', 'cta', 'callToAction', 'invoke', 'execute',
] as const;
function hasOwnKey(value: unknown, keys: readonly string[]): boolean {
  if (!value || typeof value !== 'object') return false;
  return keys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function canonicalCoverage(records: readonly PresentationReconciliationRecord[]): boolean {
  const ids = records.map((r) => r.capabilityId);
  return ids.length === CANONICAL_IDS.length
    && new Set(ids).size === CANONICAL_IDS.length
    && CANONICAL_IDS.every((id) => ids.includes(id));
}

function counts(records: readonly PresentationReconciliationRecord[]) {
  return {
    approved: records.filter((r) => r.standing === 'APPROVED').length,
    unresolved: records.filter((r) => r.standing === 'UNRESOLVED').length,
    withhold: records.filter((r) => r.standing === 'WITHHOLD').length,
    compatible: records.filter((r) => r.platformKnowledgeReconciliation === 'COMPATIBLE').length,
    stale: records.filter((r) => r.platformKnowledgeReconciliation === 'STALE_MAP_SENSITIVE').length,
    notRepresented: records.filter((r) => r.platformKnowledgeReconciliation === 'NOT_REPRESENTED').length,
    notEligible: records.filter((r) => r.platformKnowledgeReconciliation === 'NOT_ELIGIBLE_FOR_RECONCILIATION').length,
  };
}

function containsOfferLanguage(record: PresentationReconciliationRecord): boolean {
  const text = [record.name, record.purpose]
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
    .toLowerCase();
  return /would you like|want me to|let me |i can do that|shall i|tap here|click here/.test(text);
}

function result(lawId: string, ok: boolean, detail: string): PresentationLawResult {
  return { lawId, ok, detail };
}
export function runPresentationReconciliationLaws(
  records: readonly PresentationReconciliationRecord[],
): readonly PresentationLawResult[] {
  const c = counts(records);
  const approved = records.filter((r) => r.standing === 'APPROVED');
  const held = records.filter((r) => r.standing !== 'APPROVED');

  return [
    result(
      'PRESENTATION_IDENTITY_COMPLETENESS',
      canonicalCoverage(records),
      'exactly the 18 canonical capability identities must be present once each',
    ),
    result(
      'PRESENTATION_STANDING_COUNTS',
      c.approved === 12 && c.unresolved === 5 && c.withhold === 1,
      'standing counts must remain 12 APPROVED / 5 UNRESOLVED / 1 WITHHOLD',
    ),
    result(
      'APPROVED_PRESENTATION_SHAPE',
      approved.every((r) =>
        typeof r.name === 'string' && r.name.trim().length > 0
        && typeof r.purpose === 'string' && r.purpose.trim().length > 0
        && r.authorship === 'FOUNDER_AUTHORED_O7R1'
        && Array.isArray(r.sourceRefs) && r.sourceRefs.length > 0
      ),
      'approved records require founder-authored name, purpose, and source references',
    ),
    result(
      'HELD_SET_SILENCE',
      held.every((r) => r.name === undefined && r.purpose === undefined),
      'UNRESOLVED and WITHHOLD records must carry no presentation copy',
    ),
    result(
      'RECONCILIATION_COUNTS',
      c.compatible === 3 && c.stale === 7 && c.notRepresented === 2 && c.notEligible === 6,
      'reconciliation counts must remain 3 / 7 / 2 / 6',
    ),
    result(
      'RECONCILIATION_CUSTODY',
      records.every((r) => EXPECTED_RECONCILIATION[r.capabilityId] === r.platformKnowledgeReconciliation),
      'each capability must retain its ratified platformKnowledge reconciliation class',
    ),
    result(
      'UTTERANCE_CONTEXT_CUSTODY',
      approved.every((r) => r.utteranceContextCandidate === 'EXPLICIT_CAPABILITY_INQUIRY_DESCRIPTION_ONLY')
        && held.every((r) => r.utteranceContextCandidate === 'NONE'),
      'only approved records may carry the documentary explicit-inquiry context candidate',
    ),
    result(
      'RUNTIME_UTTERANCE_CLOSED',
      records.every((r) => r.runtimeUtterance === 'NOT_AUTHORIZED'),
      'all 18 records must remain closed for runtime utterance',
    ),
    result(
      'PRESENTATION_ACCESS_SEMANTICS_FORBIDDEN',
      records.every((r) => !hasOwnKey(r, FORBIDDEN_ACCESS_KEYS)),
      'presentation records may not carry availability, access, role, tier, or entitlement state',
    ),
    result(
      'PRESENTATION_ROUTING_FORBIDDEN',
      records.every((r) => !hasOwnKey(r, FORBIDDEN_ROUTE_KEYS)),
      'presentation records may not carry routes, hrefs, modals, buttons, or voice navigation',
    ),
    result(
      'PRESENTATION_OFFER_FORBIDDEN',
      records.every((r) => !hasOwnKey(r, FORBIDDEN_OFFER_KEYS) && !containsOfferLanguage(r)),
      'presentation records may not carry suggestion, CTA, or execution language',
    ),
    result(
      'SOURCE_REFS_REQUIRED',
      records.every((r) => Array.isArray(r.sourceRefs) && r.sourceRefs.length > 0),
      'every presentation record must retain documentary provenance',
    ),
  ];
}
