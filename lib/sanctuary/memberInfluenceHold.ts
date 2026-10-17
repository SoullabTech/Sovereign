/**
 * RF01 R1-B — fail-closed member influence hold.
 *
 * A successful exact-turn erasure might leave derivative interpretations,
 * vectors, summaries, cached responses, and backups. Until all dependencies
 * are reconciled under R1-C, MAIA must not admit this member to inference or
 * memory retrieval and must not pretend an empty DB result is safe.
 *
 * This hold is member-wide and read-only. No automatic release and no
 * environment/config/client bypass.
 */
import { query } from '@/lib/db/postgres';

export class MemberInfluenceHeld extends Error {
  readonly code = 'MEMBER_INFLUENCE_ERASURE_HOLD';
  constructor() {
    super('MEMBER_INFLUENCE_ERASURE_HOLD');
    this.name='MemberInfluenceHeld';
  }
}
export class MemberInfluenceCustodyUnavailable extends Error {
  readonly code = 'MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE';
  constructor() {
    super('MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE');
    this.name='MemberInfluenceCustodyUnavailable';
  }
}

export async function assertMemberInfluenceAllowed(memberId: string):Promise<void> {
  if (!memberId || typeof memberId !== 'string' || memberId.length>200) {
    throw new MemberInfluenceCustodyUnavailable();
  }
  try {
    const result = await query<{held:number}>(
      'SELECT 1::integer AS held FROM rf01_member_erasure_holds '+
      'WHERE member_id=$1 LIMIT 1',[memberId],
    );
    if (result.rows[0]) throw new MemberInfluenceHeld();
  } catch(err) {
    if(err instanceof MemberInfluenceHeld) throw err;
    // Schema absence, database outage and invalid responses refuse in order
    // to avoid synthesizing "there are no erased memories" from a failed read.
    throw new MemberInfluenceCustodyUnavailable();
  }
}

/** Content-free static refusal. Neither a partial history nor a safe-mode
 * generation is substituted when the member's influence state is unknown. */
export function influenceHoldResponse(error:unknown):{
  error:'MEMBER_INFLUENCE_ERASURE_HOLD'|'MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE';
  action:'REVIEW_ERASURE_CUSTODY';
} {
  return {
    error:error instanceof MemberInfluenceHeld
      ? 'MEMBER_INFLUENCE_ERASURE_HOLD'
      : 'MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE',
    action:'REVIEW_ERASURE_CUSTODY',
  };
}
