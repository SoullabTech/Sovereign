import { query } from '@/lib/db/postgres';

export interface PatternSummary {
  theme: string;
  status: 'confirmed' | 'offered';
}

/**
 * Returns the member's top confirmed patterns for oracle injection.
 * Confirmed patterns come first (member validated), then offered.
 * Capped at 5 to keep the prompt compact. Returns [] on error.
 */
export async function getTopPatterns(memberId: string): Promise<PatternSummary[]> {
  try {
    const result = await query<PatternSummary>(
      `SELECT theme, status
       FROM member_patterns
       WHERE member_id = $1
         AND status IN ('confirmed', 'offered')
       ORDER BY
         CASE WHEN status = 'confirmed' THEN 0 ELSE 1 END,
         created_at DESC
       LIMIT 5`,
      [memberId]
    );
    return result.rows;
  } catch {
    return [];
  }
}
