import type { CabinMemoryProjection } from './memoryProjection';
import type { CabinRelationshipProjection } from './relationshipProjection';
import type { CabinWorkProjection } from './workProjection';
import { CABIN_MEMORY_PROJECTION_SCHEMA } from './memoryProjection';
import { CABIN_RELATIONSHIP_PROJECTION_SCHEMA } from './relationshipProjection';
import { CABIN_WORK_PROJECTION_SCHEMA } from './workProjection';

export const CABIN_CONTEXT_PACKAGE_SCHEMA =
  'soullab.cabin.context-package.v1' as const;

export type CabinContextPackage = {
  schema: typeof CABIN_CONTEXT_PACKAGE_SCHEMA;
  scope: 'member';
  works: CabinWorkProjection[];
  relationships: CabinRelationshipProjection[];
  memories: CabinMemoryProjection[];
};

export type CabinContextPackageInput = {
  works?: CabinWorkProjection[];
  relationships?: CabinRelationshipProjection[];
  memories?: CabinMemoryProjection[];
};

function validWork(projection: CabinWorkProjection): boolean {
  return (
    projection.schema === CABIN_WORK_PROJECTION_SCHEMA &&
    projection.permission.scope === 'member'
  );
}

function validRelationship(
  projection: CabinRelationshipProjection,
): boolean {
  return (
    projection.schema === CABIN_RELATIONSHIP_PROJECTION_SCHEMA &&
    projection.permission.scope === 'member'
  );
}

function validMemory(projection: CabinMemoryProjection): boolean {
  return (
    projection.schema === CABIN_MEMORY_PROJECTION_SCHEMA &&
    projection.permission.scope === 'member'
  );
}

/**
 * Compose already-governed Cabin references into a portable package.
 *
 * This is an envelope, not a new domain object. It owns no source identity,
 * no navigation state, no permissions, and no inferred relationships.
 */
export function buildCabinContextPackage(
  input: CabinContextPackageInput = {},
): CabinContextPackage | null {
  const works = input.works ?? [];
  const relationships = input.relationships ?? [];
  const memories = input.memories ?? [];

  if (!works.every(validWork)) return null;
  if (!relationships.every(validRelationship)) return null;
  if (!memories.every(validMemory)) return null;

  return {
    schema: CABIN_CONTEXT_PACKAGE_SCHEMA,
    scope: 'member',
    works: structuredClone(works),
    relationships: structuredClone(relationships),
    memories: structuredClone(memories),
  };
}

export function serializeCabinContextPackage(
  packageValue: CabinContextPackage,
): string {
  return JSON.stringify(packageValue);
}
