/**
 * O5 — Capability Awareness Conformance Contract.
 *
 * Test/governance only. Pure laws over awareness records.
 * No runtime, member, access, routing, persistence, model, or I/O authority.
 */
import type { CapabilityAwarenessRecord } from '../../../../lib/maia/capabilityAwarenessProjection';

export interface CapabilityAwarenessLawResult {
  readonly lawId: string;
  readonly ok: boolean;
  readonly detail: string;
}

export const CANONICAL_IDS = [
  'journal.create',
  'journal.save',
  'journal.dream',
  'astrology.reading',
  'astrology.transit.current',
  'astrology.transit.personal',
  'wisdom.open',
  'wisdom.surface',
  'wisdom.text.open',
  'relationship.reflect',
  'shadow.open',
  'studio.choose',
  'studio.writer.open',
  'studio.personal.open',
  'studio.pro.open',
  'booking.practitioner.request',
  'studio.session.create',
  'pattern.detect',
] as const;
export const LEGACY_IDS = [
  'astrology.transit',
  'pattern.show',
  'wisdom.text',
  'depth.shadow',
  'studio.transition',
  'schedule.create',
  'depth.explore',
] as const;

const FORBIDDEN_OPERATIONAL_KEYS = [
  'available', 'enabled', 'eligible', 'allowed', 'canInvoke',
  'route', 'label', 'economicClass', 'consent',
  'readScopes', 'writeScopes', 'membranes', 'runtimeEligibility',
] as const;

const FORBIDDEN_MEMBER_KEYS = [
  'memberId', 'userId', 'role', 'roles', 'tier', 'entitlement',
  'entitlements', 'consentState', 'availabilityForMember',
] as const;

const EXPECTED_RESEARCH: Readonly<Record<string, string>> = {
  'journal.create': 'NONE',
  'journal.save': 'NONE',
  'journal.dream': 'NONE',
  'astrology.reading': 'INTERPRETIVE_STANDING_REQUIRED',
  'astrology.transit.current': 'INTERPRETIVE_STANDING_REQUIRED',
  'astrology.transit.personal': 'INTERPRETIVE_STANDING_REQUIRED',
  'wisdom.open': 'NONE',
  'wisdom.surface': 'SOURCE_GOVERNED',
  'wisdom.text.open': 'SOURCE_GOVERNED',
  'relationship.reflect': 'NONE',
  'shadow.open': 'UNKNOWN',
  'studio.choose': 'NONE',
  'studio.writer.open': 'NONE',
  'studio.personal.open': 'NONE',
  'studio.pro.open': 'NONE',
  'booking.practitioner.request': 'NONE',
  'studio.session.create': 'NONE',
  'pattern.detect': 'HYPOTHESIS_DEPENDENT',
};
function byId(records: readonly CapabilityAwarenessRecord[], id: string) {
  return records.find((r) => r.id === id);
}

function exactIdentitySet(records: readonly CapabilityAwarenessRecord[]): boolean {
  const ids = records.map((r) => r.id);
  return ids.length === CANONICAL_IDS.length
    && new Set(ids).size === CANONICAL_IDS.length
    && CANONICAL_IDS.every((id) => ids.includes(id));
}

function hasForbiddenKey(record: unknown, keys: readonly string[]): boolean {
  if (!record || typeof record !== 'object') return false;
  return keys.some((key) => Object.prototype.hasOwnProperty.call(record, key));
}

function result(lawId: string, ok: boolean, detail: string): CapabilityAwarenessLawResult {
  return { lawId, ok, detail };
}

export function runCapabilityAwarenessLaws(
  records: readonly CapabilityAwarenessRecord[],
): readonly CapabilityAwarenessLawResult[] {
  const ids = records.map((r) => r.id);
  const journal = ['journal.create', 'journal.save', 'journal.dream']
    .map((id) => byId(records, id));
  const astrology = [
    'astrology.reading',
    'astrology.transit.current',
    'astrology.transit.personal',
  ].map((id) => byId(records, id));
  const wisdomOpen = byId(records, 'wisdom.open');
  const wisdomSurface = byId(records, 'wisdom.surface');
  const wisdomText = byId(records, 'wisdom.text.open');
  const relationship = byId(records, 'relationship.reflect');
  const shadow = byId(records, 'shadow.open');
  const pattern = byId(records, 'pattern.detect');
  const studioChoose = byId(records, 'studio.choose');
  const studioIds = [
    'studio.writer.open',
    'studio.personal.open',
    'studio.pro.open',
    'studio.session.create',
  ];
  const studioRecords = studioIds.map((id) => byId(records, id));
  const booking = byId(records, 'booking.practitioner.request');

  const researchOk = records.every((r) => {
    const expected = EXPECTED_RESEARCH[r.id];
    return expected === undefined || expected === r.researchDependency;
  });

  return [
    result(
      'IDENTITY_COMPLETENESS',
      exactIdentitySet(records),
      'exactly the 18 canonical v2 awareness identities must exist once each',
    ),
    result(
      'ORDER_CUSTODY',
      ids.length === CANONICAL_IDS.length
        && ids.every((id, i) => id === CANONICAL_IDS[i]),
      'canonical awareness order must remain unchanged',
    ),
    result(
      'WITHHELD_LEGIBILITY',
      Boolean(pattern
        && pattern.lifecycle === 'WITHHELD'
        && pattern.authorityGateStanding === 'WITHHELD'
        && pattern.species === 'integrative_field'),
      'pattern.detect must remain visible, withheld, and integrative_field',
    ),
    result(
      'JOURNAL_FAMILY_CUSTODY',
      journal.every((r) => r?.domain === 'journal' && r.species === 'modal_action'),
      'journal create/save/dream remain journal modal actions',
    ),
    result(
      'ASTROLOGY_FAMILY_CUSTODY',
      astrology.every((r) => r?.domain === 'astrology' && r.species === 'room')
        && Boolean(byId(records, 'astrology.transit.current'))
        && Boolean(byId(records, 'astrology.transit.personal')),
      'astrology reading/current-transit/personal-transit remain distinct astrology room acts',
    ),
    result(
      'WISDOM_DIFFERENTIATION',
      Boolean(
        wisdomOpen?.species === 'portal'
        && wisdomSurface?.species === 'portal'
        && wisdomText?.species === 'archive'
        && wisdomOpen.domain === 'wisdom'
        && wisdomSurface.domain === 'wisdom'
        && wisdomText.domain === 'wisdom',
      ),
      'Wisdom orientation/surfacing remain portals while specific text opening remains archive',
    ),
    result(
      'RELATIONSHIP_OBJECT_CUSTODY',
      Boolean(relationship?.domain === 'relationships' && relationship.species === 'room'),
      'relationship.reflect remains a Relationships room act',
    ),
    result(
      'SHADOW_NAMING_CUSTODY',
      Boolean(shadow?.domain === 'shadow' && shadow.species === 'modal_action')
        && !ids.includes('depth.shadow' as never),
      'shadow.open remains canonical and legacy depth.shadow stays absent',
    ),
    result(
      'STUDIO_DIFFERENTIATION',
      Boolean(studioChoose?.species === 'transition')
        && studioRecords.every((r) => r?.species === 'studio'),
      'Studio chooser remains transition; Writer/Personal/Pro/session acts remain studio species',
    ),
    result(
      'BOOKING_DIFFERENTIATION',
      Boolean(booking?.domain === 'booking' && booking.species === 'utility'),
      'member practitioner booking remains a booking utility, not a Studio-session alias',
    ),
    result(
      'RESEARCH_DEPENDENCY_CUSTODY',
      researchOk,
      'static research dependency must match the ratified awareness topology',
    ),
    result(
      'NO_OPERATIONAL_AWARENESS',
      records.every((r) => !hasForbiddenKey(r, FORBIDDEN_OPERATIONAL_KEYS)),
      'awareness may not carry availability, access, routing, effects, labels, or economic semantics',
    ),
    result(
      'NO_LEGACY_IDENTITIES',
      LEGACY_IDS.every((legacy) => !ids.includes(legacy as never)),
      'retired legacy capability identities must not reappear in awareness',
    ),
    result(
      'NO_MEMBER_RELATIVE_RESULT',
      records.every((r) => !hasForbiddenKey(r, FORBIDDEN_MEMBER_KEYS)),
      'awareness results must remain independent of member identity, role, tier, consent, and entitlement',
    ),
  ];
}
