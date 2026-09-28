import type { HousePlaceId } from '@/lib/house/catalog';

export const BECOMING_SOURCE_PORT_FACETS = [
  'journal',
  'dream',
  'relationships',
  'decisions',
  'changes',
  'astrology',
  'divination',
  'reflections',
  'ideas',
] as const satisfies readonly HousePlaceId[];

export type BecomingSourcePortFacet = typeof BECOMING_SOURCE_PORT_FACETS[number];
export type BecomingSourcePortStanding = 'live_read_only';

export interface BecomingSourcePortPolicy {
  facet: BecomingSourcePortFacet;
  standing: BecomingSourcePortStanding;
  authority: 'member_explicit';
  retrieval: 'none_until_member_act';
  transfer: 'source_identity_plus_member_selected_context';
  epistemicRule: 'preserve_native_kind';
  returnRule: 'exact_source_return_required';
  persistence: 'none_by_port';
}

export const BECOMING_SOURCE_PORTS: readonly BecomingSourcePortPolicy[] =
  BECOMING_SOURCE_PORT_FACETS.map(facet => ({
    facet,
    standing: 'live_read_only',
    authority: 'member_explicit',
    retrieval: 'none_until_member_act',
    transfer: 'source_identity_plus_member_selected_context',
    epistemicRule: 'preserve_native_kind',
    returnRule: 'exact_source_return_required',
    persistence: 'none_by_port',
  }));

const OBJECT_TYPES: Record<BecomingSourcePortFacet, string> = {
  journal: 'journal_entry',
  dream: 'dream_entry',
  relationships: 'relationship',
  decisions: 'decision',
  changes: 'change',
  astrology: 'natal_chart',
  divination: 'divination_reading',
  reflections: 'reflection',
  ideas: 'idea_block',
};

export interface BecomingSourcePortRef {
  facet: BecomingSourcePortFacet;
  objectType: string;
  objectId: string;
  revision?: number;
  returnHref: string;
  memberSelected: true;
}

export interface BecomingSourcePortPacket extends BecomingSourcePortRef {
  label: string;
  excerpt: string;
  persistence: 'none';
}

export function isBecomingSourcePortFacet(value: string): value is BecomingSourcePortFacet {
  return (BECOMING_SOURCE_PORT_FACETS as readonly string[]).includes(value);
}

export function becomingSourceObjectType(facet: BecomingSourcePortFacet): string {
  return OBJECT_TYPES[facet];
}

export function validateBecomingSourcePortRef(value: BecomingSourcePortRef): void {
  if (!BECOMING_SOURCE_PORT_FACETS.includes(value.facet)) throw new Error('BECOMING_SOURCE_FACET_NOT_ADMITTED');
  if (!value.objectType.trim()) throw new Error('BECOMING_SOURCE_OBJECT_TYPE_REQUIRED');
  if (!value.objectId.trim()) throw new Error('BECOMING_SOURCE_OBJECT_ID_REQUIRED');
  if (value.revision !== undefined && (!Number.isInteger(value.revision) || value.revision < 1)) {
    throw new Error('BECOMING_SOURCE_REVISION_INVALID');
  }
  if (!value.returnHref.startsWith('/')) throw new Error('BECOMING_SOURCE_RETURN_REQUIRED');
  if (value.memberSelected !== true) throw new Error('BECOMING_SOURCE_MEMBER_SELECTION_REQUIRED');
}
