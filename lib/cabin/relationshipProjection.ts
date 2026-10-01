import type { ActiveRelationalContext, RelationshipRealm } from '@/lib/relationships/types';

export const CABIN_RELATIONSHIP_PROJECTION_SCHEMA =
  'soullab.cabin.relationship-reference.v1' as const;

export type CabinRelationshipProjection = {
  schema: typeof CABIN_RELATIONSHIP_PROJECTION_SCHEMA;
  source: {
    kind: 'member_relationships';
    id: string;
  };
  permission: {
    scope: 'member';
    basis: 'explicit_handoff';
  };
  relationship: {
    id: string;
    label: string | null;
    realm: RelationshipRealm;
    bondType: string | null;
  };
};

export type CabinRelationshipHandoff = {
  relationshipId: string;
  authority: 'member_explicit';
};

/**
 * Read-only projection of an explicitly handed-off relationship.
 *
 * The Relational Context Bridge may contain inferred/derived signals. Those
 * signals are deliberately not part of this portable identity reference.
 */
export function projectRelationshipForCabin(
  context: ActiveRelationalContext,
  handoff: CabinRelationshipHandoff,
): CabinRelationshipProjection | null {
  if (
    !handoff.relationshipId ||
    handoff.authority !== 'member_explicit' ||
    handoff.relationshipId !== context.relationshipId
  ) {
    return null;
  }

  return {
    schema: CABIN_RELATIONSHIP_PROJECTION_SCHEMA,
    source: {
      kind: 'member_relationships',
      id: context.relationshipId,
    },
    permission: {
      scope: 'member',
      basis: 'explicit_handoff',
    },
    relationship: {
      id: context.relationshipId,
      label: context.relationshipLabel,
      realm: context.realm,
      bondType: context.bondType,
    },
  };
}

export function serializeCabinRelationshipProjection(
  projection: CabinRelationshipProjection,
): string {
  return JSON.stringify(projection);
}
