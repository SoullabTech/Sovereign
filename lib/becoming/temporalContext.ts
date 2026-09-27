export const TIME_RELATIONS = ['has_been','is_being','is_becoming'] as const;
export type TimeRelation = typeof TIME_RELATIONS[number];

export const EPISTEMIC_KINDS = [
  'remembered_experience',
  'present_self_report',
  'imagined_possibility',
  'member_declared_intention',
  'member_proposed_connection',
  'maia_hypothesis',
  'counterevidence',
] as const;
export type EpistemicKind = typeof EPISTEMIC_KINDS[number];

export const AUTHOR_KINDS = ['member','maia'] as const;
export type AuthorKind = typeof AUTHOR_KINDS[number];

export type TemporalSourceIdentity = {
  facet: string;
  objectType: string;
  objectId: string;
  revision?: number;
};

export type TemporalContextItem = {
  source: TemporalSourceIdentity;
  authoredBy: AuthorKind;
  epistemicKind: EpistemicKind;
  timeRelation: TimeRelation;
  memberSelected: true;
  contextScope: 'this_conversation';
  text: string;
};

export type TemporalContextEnvelope = {
  schemaVersion: 1;
  purpose: 'becoming_selected_context';
  items: TemporalContextItem[];
  durableInterpretationAuthorized: false;
  receivingObjectAuthorized: false;
};

function fail(message: string): never { throw new Error(message); }
function nonEmpty(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) fail('INVALID_' + label);
}
export function validateTemporalContextEnvelope(value: TemporalContextEnvelope): void {
  if (!value || typeof value !== 'object') fail('INVALID_ENVELOPE');
  if (value.schemaVersion !== 1) fail('INVALID_SCHEMA_VERSION');
  if (value.purpose !== 'becoming_selected_context') fail('INVALID_PURPOSE');
  if (value.durableInterpretationAuthorized !== false) fail('DURABLE_INTERPRETATION_NOT_AUTHORIZED');
  if (value.receivingObjectAuthorized !== false) fail('RECEIVING_OBJECT_NOT_AUTHORIZED');
  if (!Array.isArray(value.items) || value.items.length > 24) fail('INVALID_ITEMS');

  for (const item of value.items) {
    if (!item || typeof item !== 'object') fail('INVALID_ITEM');
    nonEmpty(item.source?.facet, 'FACET');
    nonEmpty(item.source?.objectType, 'OBJECT_TYPE');
    nonEmpty(item.source?.objectId, 'OBJECT_ID');
    if (item.source.revision !== undefined && (!Number.isInteger(item.source.revision) || item.source.revision < 1)) fail('INVALID_REVISION');
    if (!AUTHOR_KINDS.includes(item.authoredBy)) fail('INVALID_AUTHOR');
    if (!EPISTEMIC_KINDS.includes(item.epistemicKind)) fail('INVALID_EPISTEMIC_KIND');
    if (!TIME_RELATIONS.includes(item.timeRelation)) fail('INVALID_TIME_RELATION');
    if (item.memberSelected !== true) fail('CONTEXT_NOT_MEMBER_SELECTED');
    if (item.contextScope !== 'this_conversation') fail('INVALID_CONTEXT_SCOPE');
    nonEmpty(item.text, 'TEXT');

    if (item.timeRelation === 'is_becoming' && item.epistemicKind === 'remembered_experience') {
      fail('TIME_EPISTEMIC_CONFLICT');
    }
    if (item.epistemicKind === 'imagined_possibility' && item.timeRelation !== 'is_becoming') {
      fail('IMAGINED_MUST_REMAIN_BECOMING');
    }
    if (item.authoredBy === 'maia' && item.epistemicKind !== 'maia_hypothesis') {
      fail('MAIA_AUTHORSHIP_MUST_REMAIN_HYPOTHESIS');
    }
  }
}

export function makeTemporalContextEnvelope(items: TemporalContextItem[]): TemporalContextEnvelope {
  const envelope: TemporalContextEnvelope = {
    schemaVersion: 1,
    purpose: 'becoming_selected_context',
    items,
    durableInterpretationAuthorized: false,
    receivingObjectAuthorized: false,
  };
  validateTemporalContextEnvelope(envelope);
  return envelope;
}
