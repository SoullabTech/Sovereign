import { queryOne } from '@/lib/db/postgres';
import type { MemberPattern } from './getMemberPatterns';

export async function respondToPattern(params: {
  patternId: string;
  memberId: string;
  response: 'confirmed' | 'rejected';
  responseText?: string;
}): Promise<MemberPattern | null> {
  return queryOne<MemberPattern>(
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
}
