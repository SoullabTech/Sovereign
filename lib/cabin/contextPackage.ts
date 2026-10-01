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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function validWorkProjection(value: unknown): value is CabinWorkProjection {
  if (
    !hasExactKeys(value, ['schema', 'source', 'permission', 'work']) ||
    value.schema !== CABIN_WORK_PROJECTION_SCHEMA
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.source, ['kind', 'id', 'updatedAt']) ||
    value.source.kind !== 'living_work' ||
    typeof value.source.id !== 'string' ||
    typeof value.source.updatedAt !== 'string'
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.permission, ['scope', 'basis']) ||
    value.permission.scope !== 'member' ||
    value.permission.basis !== 'member_owned'
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.work, [
      'id',
      'title',
      'purpose',
      'form',
      'stage',
      'manuscriptState',
      'expressions',
    ]) ||
    typeof value.work.id !== 'string' ||
    !isStringOrNull(value.work.title) ||
    !isStringOrNull(value.work.purpose) ||
    !isStringOrNull(value.work.form) ||
    !isStringOrNull(value.work.stage) ||
    !isStringOrNull(value.work.manuscriptState) ||
    !Array.isArray(value.work.expressions)
  ) {
    return false;
  }

  return value.work.expressions.every(
    (expression) =>
      hasExactKeys(expression, [
        'id',
        'expressionType',
        'expressionId',
        'authority',
        'declaredAt',
      ]) &&
      typeof expression.id === 'string' &&
      typeof expression.expressionType === 'string' &&
      typeof expression.expressionId === 'string' &&
      expression.authority === 'member_declared' &&
      typeof expression.declaredAt === 'string',
  );
}

function validRelationshipProjection(
  value: unknown,
): value is CabinRelationshipProjection {
  if (
    !hasExactKeys(value, ['schema', 'source', 'permission', 'relationship']) ||
    value.schema !== CABIN_RELATIONSHIP_PROJECTION_SCHEMA
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.source, ['kind', 'id']) ||
    value.source.kind !== 'member_relationships' ||
    typeof value.source.id !== 'string'
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.permission, ['scope', 'basis']) ||
    value.permission.scope !== 'member' ||
    value.permission.basis !== 'explicit_handoff'
  ) {
    return false;
  }

  return (
    hasExactKeys(value.relationship, [
      'id',
      'label',
      'realm',
      'bondType',
    ]) &&
    typeof value.relationship.id === 'string' &&
    isStringOrNull(value.relationship.label) &&
    typeof value.relationship.realm === 'string' &&
    isStringOrNull(value.relationship.bondType)
  );
}

function validMemoryProjection(
  value: unknown,
): value is CabinMemoryProjection {
  if (
    !hasExactKeys(value, [
      'schema',
      'source',
      'permission',
      'memory',
      'recall',
    ]) ||
    value.schema !== CABIN_MEMORY_PROJECTION_SCHEMA
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.source, [
      'kind',
      'id',
      'sourceType',
      'sourceId',
      'keptAt',
    ]) ||
    value.source.kind !== 'member_memory_atoms' ||
    typeof value.source.id !== 'string' ||
    typeof value.source.sourceType !== 'string' ||
    !isStringOrNull(value.source.sourceId) ||
    typeof value.source.keptAt !== 'string'
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.permission, ['scope', 'basis']) ||
    value.permission.scope !== 'member' ||
    !(
      value.permission.basis === 'member_kept' ||
      value.permission.basis === 'member_confirmed_observation'
    )
  ) {
    return false;
  }

  if (
    !hasExactKeys(value.memory, [
      'id',
      'title',
      'body',
      'sourceType',
      'sourceId',
      'primaryRegister',
      'registers',
      'elementalLenses',
      'status',
      'returnPreference',
      'keptAt',
    ]) ||
    typeof value.memory.id !== 'string' ||
    typeof value.memory.title !== 'string' ||
    !isStringOrNull(value.memory.body) ||
    typeof value.memory.sourceType !== 'string' ||
    !isStringOrNull(value.memory.sourceId) ||
    !isStringOrNull(value.memory.primaryRegister) ||
    !Array.isArray(value.memory.registers) ||
    !Array.isArray(value.memory.elementalLenses) ||
    typeof value.memory.status !== 'string' ||
    typeof value.memory.returnPreference !== 'string' ||
    typeof value.memory.keptAt !== 'string'
  ) {
    return false;
  }

  return (
    hasExactKeys(value.recall, ['standing', 'basis']) &&
    typeof value.recall.standing === 'string' &&
    typeof value.recall.basis === 'string'
  );
}

function validWork(projection: CabinWorkProjection): boolean {
  return validWorkProjection(projection);
}

function validRelationship(
  projection: CabinRelationshipProjection,
): boolean {
  return validRelationshipProjection(projection);
}

function validMemory(projection: CabinMemoryProjection): boolean {
  return validMemoryProjection(projection);
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

/**
 * Strict offline custody parser.
 *
 * Unknown fields are refused rather than silently preserved. This prevents a
 * future producer from smuggling ungoverned context through a package that
 * happens to have the right top-level schema.
 */
export function parseCabinContextPackage(
  serialized: string,
): CabinContextPackage | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    return null;
  }

  if (
    !hasExactKeys(parsed, [
      'schema',
      'scope',
      'works',
      'relationships',
      'memories',
    ]) ||
    parsed.schema !== CABIN_CONTEXT_PACKAGE_SCHEMA ||
    parsed.scope !== 'member' ||
    !Array.isArray(parsed.works) ||
    !Array.isArray(parsed.relationships) ||
    !Array.isArray(parsed.memories)
  ) {
    return null;
  }

  if (!parsed.works.every(validWorkProjection)) return null;
  if (!parsed.relationships.every(validRelationshipProjection)) return null;
  if (!parsed.memories.every(validMemoryProjection)) return null;

  return buildCabinContextPackage({
    works: parsed.works,
    relationships: parsed.relationships,
    memories: parsed.memories,
  });
}

export function serializeCabinContextPackage(
  packageValue: CabinContextPackage,
): string {
  return JSON.stringify(packageValue);
}
