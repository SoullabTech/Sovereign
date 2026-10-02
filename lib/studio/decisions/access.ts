import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export type DecisionScope = 'personal' | 'practice';

export interface DecisionActor {
  memberId: string;
  practitionerId: string | null;
}

export async function resolveDecisionActor(request: NextRequest): Promise<DecisionActor | null> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return null;
  const result = await query<{ practitioner_id: string }>(
    `SELECT id AS practitioner_id
       FROM practitioners
      WHERE member_id = $1 AND status = 'active'
      LIMIT 1`,
    [memberId],
  );
  return { memberId, practitionerId: result.rows[0]?.practitioner_id ?? null };
}

export function chooseDecisionScope(value: unknown, actor: DecisionActor): DecisionScope | null {
  if (value === 'personal') return 'personal';
  if (value === 'practice') return actor.practitionerId ? 'practice' : null;
  return actor.practitionerId ? 'practice' : 'personal';
}

export function decisionOwnerWhere(alias = 'd', memberParam = '$2', practitionerParam = '$3'): string {
  return `((${alias}.decision_scope = 'personal' AND ${alias}.personal_member_id = ${memberParam})
    OR (${alias}.decision_scope = 'practice' AND ${alias}.practitioner_id = ${practitionerParam}))`;
}

export function scopeOwnerValues(actor: DecisionActor): [string, string | null] {
  return [actor.memberId, actor.practitionerId];
}

export function explicitDecisionScope(request: NextRequest): DecisionScope | undefined | null {
  const value = request.nextUrl.searchParams.get('scope');
  if (value === null) return undefined;
  if (value === 'personal' || value === 'practice') return value;
  return null;
}

export function decisionScopeMatchesRequest(request: NextRequest, actual: string): boolean {
  const requested = explicitDecisionScope(request);
  return requested === undefined || requested === actual;
}
