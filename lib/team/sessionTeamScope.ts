import { query } from '@/lib/db/postgres';
import { ensureOwnCoLab } from './colabTeams';

/**
 * The Co-Lab a session booking belongs to.
 *
 * The contract is stated by migration 20260630000004_sessions_encounters_team_scope:
 *
 *   "A session (booking) belongs to the practitioner's active Co-Lab."
 *
 * That migration backfilled every existing row and set sessions.team_id NOT NULL,
 * but no write path was taught the rule — so every INSERT INTO sessions since has
 * omitted the column and violated the constraint (#899). This restores the write
 * path; it does not change the contract.
 *
 * Resolution defers to ensureOwnCoLab: the team the practitioner OWNS. The
 * migration's secondary fallback (earliest team overall) is deliberately NOT
 * reproduced here — getDefaultTeamId is documented as "NOT a write-fallback for
 * arbitrary members", and routing a booking into someone else's Co-Lab is the
 * scope leak this column exists to prevent. A booking that cannot be scoped must
 * fail loudly rather than land somewhere plausible.
 */
export async function resolveSessionTeamId(practitionerId: string): Promise<string> {
  const result = await query<{ member_id: string }>(
    `SELECT member_id FROM practitioners WHERE id = $1`,
    [practitionerId]
  );

  const memberId = result.rows[0]?.member_id;
  if (!memberId) {
    throw new Error(
      `Cannot scope session: no practitioner record for id ${practitionerId}`
    );
  }

  return ensureOwnCoLab(memberId);
}
