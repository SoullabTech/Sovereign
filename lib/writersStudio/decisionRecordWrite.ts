/**
 * WS-DECISION-CONTINUITY — the ONLY writer of decision events: the member's own gestures (settle, withdraw).
 * ⛔ Not imported by the Ask route or the editorial turn; they only read.
 */
import { query } from '@/lib/db/postgres';
import type { DecisionRoom, DecisionSubjectKind } from './decisionRecord';

/** Writer gestures only. Ownership of the Work is proven in the SQL. */
export async function settleDecision(input: {
  memberId: string; livingWorkId: string; room: DecisionRoom; subjectKind: DecisionSubjectKind;
  subjectRef?: string | null; saidIn: string; versionRef?: string | null;
}): Promise<string | null> {
  const said = input.saidIn.trim();
  if (said.length < 1 || said.length > 1000) return null;
  const r = await query<{ id: string }>(
    `INSERT INTO writer_decision_events (member_id, living_work_id, event, room, subject_kind, subject_ref, said_in, version_ref)
     SELECT $1, w.id, 'settle', $3, $4, $5, $6, $7 FROM living_works w WHERE w.id = $2 AND w.member_id = $1 RETURNING id`,
    [input.memberId, input.livingWorkId, input.room, input.subjectKind, input.subjectRef ?? null, said, input.versionRef ?? null]);
  return r.rows[0]?.id ?? null;
}

export async function withdrawDecision(input: { memberId: string; livingWorkId: string; targetId: string }): Promise<boolean> {
  try {
    const r = await query<{ id: string }>(
      `INSERT INTO writer_decision_events (member_id, living_work_id, event, target_id)
       SELECT $1, w.id, 'withdraw', $3 FROM living_works w WHERE w.id = $2 AND w.member_id = $1 RETURNING id`,
      [input.memberId, input.livingWorkId, input.targetId]);
    return r.rows.length === 1;
  } catch { return false; /* the database refuses a withdraw that does not target this member's own settle */ }
}

