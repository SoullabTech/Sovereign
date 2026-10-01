import type { CabinExpression, CabinWork } from './localStore';

export const CABIN_WORK_PROJECTION_SCHEMA =
  'soullab.cabin.work-reference.v1' as const;

export type CabinWorkExpressionReference = {
  id: string;
  expressionType: string;
  expressionId: string;
  authority: 'member_declared';
  declaredAt: string;
};

export type CabinWorkProjection = {
  schema: typeof CABIN_WORK_PROJECTION_SCHEMA;
  source: {
    kind: 'living_work';
    id: string;
    updatedAt: string;
  };
  permission: {
    scope: 'member';
    basis: 'member_owned';
  };
  work: {
    id: string;
    title: string | null;
    purpose: string | null;
    form: string | null;
    stage: string | null;
    manuscriptState: string | null;
    expressions: CabinWorkExpressionReference[];
  };
};

function expressionOrder(a: CabinExpression, b: CabinExpression): number {
  const byDeclaredAt = a.declaredAt.localeCompare(b.declaredAt);
  if (byDeclaredAt !== 0) return byDeclaredAt;
  return a.id.localeCompare(b.id);
}

/**
 * Read-only projection of a member-owned Living Work into the portable Cabin
 * reference shape.
 *
 * The caller must supply the member scope that authorized the read. The
 * projection refuses a Work belonging to another member and never carries the
 * member id into the portable object.
 */
export function projectWorkForCabin(
  work: CabinWork,
  memberScopeId: string,
): CabinWorkProjection | null {
  if (!memberScopeId || work.memberId !== memberScopeId || !work.id) {
    return null;
  }

  const expressions = [...work.expressions]
    .sort(expressionOrder)
    .map((expression) => ({
      id: expression.id,
      expressionType: expression.expressionType,
      expressionId: expression.expressionId,
      authority: 'member_declared' as const,
      declaredAt: expression.declaredAt,
    }));

  return {
    schema: CABIN_WORK_PROJECTION_SCHEMA,
    source: {
      kind: 'living_work',
      id: work.id,
      updatedAt: work.updatedAt,
    },
    permission: {
      scope: 'member',
      basis: 'member_owned',
    },
    work: {
      id: work.id,
      title: work.title,
      purpose: work.purpose,
      form: work.form,
      stage: work.stage,
      manuscriptState: work.manuscriptState,
      expressions,
    },
  };
}

export function serializeCabinWorkProjection(
  projection: CabinWorkProjection,
): string {
  return JSON.stringify(projection);
}
