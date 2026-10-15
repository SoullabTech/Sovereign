/**
 * Candidate-only post-withdrawal data custody.
 *
 * Member-authenticated rights to retrieve or delete their OWN writing must
 * not depend on currently active beta contact status or current consent.
 *
 * Historical self-member consent is a necessary enrollment witness. It is
 * NOT authority to run a model, reopen the writing room, or view another Work.
 * Route remains OFF unless explicitly enabled in an isolated qualification.
 */
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { restrictedBetaEnabled } from '@/lib/writersStudio/restrictedBetaAdmission';

export const VALID_WORK_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function authenticatedPostWithdrawalMember(request: NextRequest): Promise<
  { kind: 'allowed'; memberId: string } |
  { kind: 'refused'; status: number }
> {
  if (!restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA) ||
      process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED !== 'true') {
    return { kind: 'refused', status: 404 };
  }
  if (request.headers.get('host')?.split(':', 1)[0]?.toLowerCase() !== 'beta.soullab.life') {
    return { kind: 'refused', status: 403 };
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return { kind: 'refused', status: 401 };

  // Historical consent event, not membership or a currently valid notice.
  // An invitation can lapse without eliminating a member's custody rights.
  const witnessed = await query<{ witnessed: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM writers_studio_beta_consent_events
        WHERE member_id=$1 AND actor_member_id=$1 AND decision='accept'
     ) AS witnessed`,
    [memberId],
  );
  if (witnessed.rows[0]?.witnessed !== true) {
    return { kind: 'refused', status: 403 };
  }
  return { kind: 'allowed', memberId };
}
