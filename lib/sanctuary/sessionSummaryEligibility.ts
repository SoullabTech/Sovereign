/**
 * RF01 R1-A — database-evidenced eligibility BEFORE reading turn content.
 *
 * A session-level mode is NOT enough. Mixed sessions, unknown-historical
 * turns, missing/foreign exchange provenance, Sanctuary consent records,
 * and deletion scopes all refuse summary processing.
 *
 * This is CONTENT-FREE classification. A positive result does NOT authorize
 * sending text to any external summary provider; that separately verified
 * background-processing grant has not been designed/ratified.
 *
 * R1-B must still qualify race-free storage, backup restore, tombstone-only
 * deletion, and derived-influence erasure. None of those are inferred here.
 */
import { query } from '@/lib/db/postgres';

export type SummaryEligibilityOutcome =
  | { ok: true; turnCount: number }
  | { ok: false; code: 'SUMMARY_ELIGIBILITY_UNRESOLVED' |
      'SUMMARY_SESSION_NOT_OWNED' | 'SUMMARY_SESSION_STATE_INELIGIBLE' |
      'SUMMARY_NON_NORMAL_TURN_OR_CONSENT' | 'SUMMARY_DELETION_CUSTODY_HOLD' |
      'SUMMARY_INSUFFICIENT_VERIFIED_TURNS' };

type EligibilityRow = {
  mode: string | null;
  status: string | null;
  turn_count: number | string;
  disallowed_turns: number | string;
  disallowed_receipts: boolean;
  deletion_scope_present: boolean;
};

export const SUMMARY_RECOVERY_POLICY = 'rf01-r1a-all-turns-explicit-normal-v1';

const ELIGIBILITY_SQL = [
  'SELECT s.mode,s.status,',
  '(SELECT COUNT(*)::integer FROM conversation_turns t',
  ' WHERE t.session_id = s.id) AS turn_count,',
  '(SELECT COUNT(*)::integer FROM conversation_turns t',
  ' WHERE t.session_id = s.id AND (',
  ' t.user_id IS DISTINCT FROM $2',
  " OR t.posture_at_creation IS DISTINCT FROM 'normal'",
  ' OR t.exchange_id IS NULL',
  ' OR NOT EXISTS (',
  ' SELECT 1 FROM runtime_consent_state c',
  ' WHERE c.request_id = t.exchange_id::text',
  ' AND c.member_id = $2 AND c.session_id = s.id',
  " AND c.posture = 'normal'",
  " AND c.resolved_from = 'member-explicit-preflight-v1'",
  ' ))) AS disallowed_turns,',
  'EXISTS(SELECT 1 FROM runtime_consent_state c WHERE c.session_id=s.id',
  ' AND (c.member_id IS DISTINCT FROM $2',
  " OR c.posture IS DISTINCT FROM 'normal'",
  " OR c.resolved_from IS DISTINCT FROM 'member-explicit-preflight-v1'",
  ' )) AS disallowed_receipts,',
  'EXISTS(SELECT 1 FROM deletion_manifest_scopes d',
  " WHERE d.table_name IN ('conversation_turns','maia_sessions',",
  " 'member_sessions','episodic_memories')",
  ' AND (d.session_id = s.id OR',
  '  (d.session_id IS NULL AND d.member_id = $2))',
  ') AS deletion_scope_present',
  'FROM maia_sessions s',
  'WHERE s.id=$1 AND s.member_id=$2',
  'LIMIT 1',
].join(' ');

export async function evaluateSummaryEligibility(input: {
  sessionId: string;
  memberId: string;
  minimumTurns?: number;
  requireClosed?: boolean;
}): Promise<SummaryEligibilityOutcome> {
  if (!input.sessionId || input.sessionId.length > 200 ||
      !input.memberId || input.memberId.length > 200) {
    return { ok: false, code: 'SUMMARY_ELIGIBILITY_UNRESOLVED' };
  }
  try {
    const result = await query<EligibilityRow>(ELIGIBILITY_SQL, [
      input.sessionId, input.memberId,
    ]);
    const row = result.rows[0];
    if (!row) return { ok: false, code: 'SUMMARY_SESSION_NOT_OWNED' };
    if (row.mode !== 'continuity' ||
        !['active','closing','completed'].includes(row.status ?? '') ||
        (input.requireClosed && !['closing','completed'].includes(row.status ?? ''))) {
      return { ok: false, code: 'SUMMARY_SESSION_STATE_INELIGIBLE' };
    }
    if (row.deletion_scope_present) {
      return { ok: false, code: 'SUMMARY_DELETION_CUSTODY_HOLD' };
    }
    if (row.disallowed_receipts || Number(row.disallowed_turns) > 0) {
      return { ok: false, code: 'SUMMARY_NON_NORMAL_TURN_OR_CONSENT' };
    }
    const turnCount = Number(row.turn_count);
    if (!Number.isSafeInteger(turnCount) ||
        turnCount < Math.max(2,input.minimumTurns ?? 2)) {
      return { ok: false, code: 'SUMMARY_INSUFFICIENT_VERIFIED_TURNS' };
    }
    return { ok: true, turnCount };
  } catch {
    // Missing S5 tables, permission failure, outage, schema drift: never
    // make a guess and never reveal content or raw SQL error strings.
    return { ok: false, code: 'SUMMARY_ELIGIBILITY_UNRESOLVED' };
  }
}

/** There is no production grant for post-session external summarization yet. */
export function summaryProviderFixtureEnabled(): boolean {
  return process.env.NODE_ENV === 'test' &&
    process.env.RF01_R1_SUMMARY_FIXTURE_ENABLED === '1';
}

/** Existing summaries may contain pre-R1 derived influence; hold their use. */
export function summaryReadFixtureEnabled(): boolean {
  return process.env.NODE_ENV === 'test' &&
    process.env.RF01_R1_SUMMARY_READ_FIXTURE_ENABLED === '1';
}
