import { queryOne } from '@/lib/db/postgres';
import type { MemberPattern } from './getMemberPatterns';

export async function respondToPattern(params: {
  patternId: string;
  memberId: string;
  response: 'confirmed' | 'rejected';
  resonanceResponse?: string;
  responseText?: string;
}): Promise<MemberPattern | null> {
  // Try practitioner-named patterns first
  const practitionerResult = await queryOne<MemberPattern>(
    `UPDATE member_patterns
     SET
       status               = $1,
       member_response      = $2,
       member_responded_at  = now()
     WHERE id        = $3
       AND member_id = $4
       AND status    = 'offered'
     RETURNING
       id,
       member_id            AS "memberId",
       practitioner_id      AS "practitionerId",
       theme,
       description,
       status,
       confidence,
       member_response      AS "memberResponse",
       member_responded_at  AS "memberRespondedAt",
       created_at           AS "createdAt",
       updated_at           AS "updatedAt"`,
    [params.response, params.responseText ?? null, params.patternId, params.memberId]
  );

  if (practitionerResult) {
    return { ...practitionerResult, source: 'practitioner' };
  }

  // Fall back to MAIA-detected patterns in pattern_ledger
  const maiaResult = await queryOne<{
    id: string;
    member_id: string;
    statement: string;
    confidence: number;
    status: string;
    member_response: string | null;
    member_response_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `UPDATE pattern_ledger
     SET
       status              = CASE WHEN $1 = 'confirmed' THEN 'confirmed'
                                  WHEN $1 = 'rejected'  THEN 'rejected'
                                  ELSE status END,
       member_response     = $2,
       resonance_response  = $3,
       member_response_at  = now()
     WHERE id        = $4
       AND member_id = $5
     RETURNING
       id,
       member_id,
       statement,
       confidence,
       status,
       member_response,
       resonance_response,
       member_response_at,
       created_at,
       updated_at`,
    [params.response, params.responseText ?? null, params.resonanceResponse ?? null, params.patternId, params.memberId]
  );

  if (!maiaResult) return null;

  return {
    id: maiaResult.id,
    memberId: maiaResult.member_id,
    practitionerId: '',
    theme: maiaResult.statement,
    description: null,
    status: maiaResult.status as MemberPattern['status'],
    confidence: Number(maiaResult.confidence),
    memberResponse: maiaResult.member_response,
    memberRespondedAt: maiaResult.member_response_at,
    createdAt: maiaResult.created_at,
    updatedAt: maiaResult.updated_at,
    source: 'maia',
  };
}
