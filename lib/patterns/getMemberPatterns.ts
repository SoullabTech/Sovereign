import { query } from '@/lib/db/postgres';

export interface MemberPattern {
  id: string;
  memberId: string;
  practitionerId: string;
  theme: string;
  description: string | null;
  status: 'emerging' | 'offered' | 'confirmed' | 'rejected';
  confidence: number | null;
  memberResponse: string | null;
  memberRespondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SELECT_COLS = `
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
  updated_at           AS "updatedAt"
`;

// For practitioner: all patterns for a client (all statuses)
export async function getPatternsForClient(
  memberId: string,
  practitionerId: string
): Promise<MemberPattern[]> {
  const result = await query<MemberPattern>(
    `SELECT ${SELECT_COLS}
     FROM member_patterns
     WHERE member_id = $1 AND practitioner_id = $2
     ORDER BY created_at DESC`,
    [memberId, practitionerId]
  );
  return result.rows;
}

// For member: only offered/confirmed/rejected (emerging is practitioner-internal)
export async function getMemberVisiblePatterns(memberId: string): Promise<MemberPattern[]> {
  const result = await query<MemberPattern>(
    `SELECT ${SELECT_COLS}
     FROM member_patterns
     WHERE member_id = $1 AND status IN ('offered', 'confirmed', 'rejected')
     ORDER BY created_at DESC`,
    [memberId]
  );
  return result.rows;
}
