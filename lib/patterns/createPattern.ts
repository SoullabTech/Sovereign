import { queryOne } from '@/lib/db/postgres';
import type { MemberPattern } from './getMemberPatterns';

export async function createPattern(params: {
  memberId: string;
  practitionerId: string;
  theme: string;
  description?: string;
  confidence?: number;
  status?: 'emerging' | 'offered';
}): Promise<MemberPattern> {
  const pattern = await queryOne<MemberPattern>(
    `INSERT INTO member_patterns (
       member_id,
       practitioner_id,
       theme,
       description,
       confidence,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6)
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
    [
      params.memberId,
      params.practitionerId,
      params.theme,
      params.description ?? null,
      params.confidence ?? null,
      params.status ?? 'emerging',
    ]
  );

  if (!pattern) {
    throw new Error('Pattern insert returned null');
  }

  return pattern;
}
