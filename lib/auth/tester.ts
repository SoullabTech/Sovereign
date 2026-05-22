/**
 * Tester status helpers.
 *
 * The tester flag is opt-in access to /maia/field-lab — the bounded
 * experimental ecology. It is operational only.
 *
 * Invariant: do not read this flag inside conversation, oracle, or
 * interpretation pipelines. It governs surface visibility, not response
 * generation.
 */

import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

export interface TesterCheck {
  memberId: string | null;
  isTester: boolean;
}

/**
 * Resolve the current session and return the tester flag for that member.
 * Returns memberId=null + isTester=false when no session is present.
 */
export async function getCurrentTesterStatus(): Promise<TesterCheck> {
  const session = await getCurrentSession();
  if (!session) return { memberId: null, isTester: false };
  return {
    memberId: session.memberId,
    isTester: await isMemberTester(session.memberId),
  };
}

export async function isMemberTester(memberId: string): Promise<boolean> {
  try {
    const result = await query<{ tester: boolean }>(
      `SELECT tester FROM members WHERE id = $1 LIMIT 1`,
      [memberId]
    );
    return result.rows[0]?.tester === true;
  } catch (err) {
    console.error('[tester] lookup failed:', err);
    return false;
  }
}

export async function setMemberTester(
  memberId: string,
  value: boolean
): Promise<boolean> {
  try {
    await query(
      `UPDATE members SET tester = $1 WHERE id = $2`,
      [value, memberId]
    );
    return true;
  } catch (err) {
    console.error('[tester] update failed:', err);
    return false;
  }
}
