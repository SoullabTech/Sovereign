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
  source?: 'practitioner' | 'maia';
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
  return result.rows.map((r) => ({ ...r, source: 'practitioner' as const }));
}

// For member: MAIA-detected patterns from pattern_ledger (confidence >= 0.5, not retired)
export async function getMaiaDetectedPatterns(memberId: string): Promise<MemberPattern[]> {
  const result = await query<{
    id: string;
    member_id: string;
    statement: string;
    scope: string;
    confidence: number;
    status: string;
    member_response: string | null;
    member_response_at: Date | null;
    recurrence_count: number;
    created_at: Date;
    updated_at: Date;
  }>(
    `SELECT
       id,
       member_id,
       statement,
       scope,
       confidence,
       status,
       member_response,
       member_response_at,
       recurrence_count,
       created_at,
       updated_at
     FROM pattern_ledger
     WHERE member_id = $1
       AND confidence >= 0.5
       AND status NOT IN ('retired')
     ORDER BY confidence DESC, last_evidence_at DESC
     LIMIT 20`,
    [memberId]
  );

  return result.rows.map((r) => ({
    id: r.id,
    memberId: r.member_id,
    practitionerId: '',
    theme: r.statement,
    description: null,
    status: (r.status === 'emerging' ? 'offered' : r.status) as MemberPattern['status'],
    confidence: Number(r.confidence),
    memberResponse: r.member_response,
    memberRespondedAt: r.member_response_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    source: 'maia' as const,
  }));
}
