/**
 * ASTRO-FREE-TESTERS-ONLY — founder admission 2026-10-30.
 *
 * Free Astrology's room pages are visible only to members whose `members.tester`
 * flag is true. Everyone else, signed in or not, receives a hard 404 from the
 * proxy before rendering. A page-level notFound() would arrive after streaming
 * began and still carry HTTP 200.
 *
 * Deliberately NOT gated here:
 * - identity-free calculator APIs (/api/astrology/*): they are not the room, hold
 *   no member data, and the House's transits panel calls current-transits for
 *   every member;
 * - /astrology/pro-preview/**: the founder-only Pro preview keeps its own gate,
 *   unchanged.
 */
import { query } from '@/lib/db/postgres';

const ASTROLOGY_ROOM = /^\/astrology(?:\/|$)/;
const OWN_GATE = /^\/astrology\/pro-preview(?:\/|$)/;

export function isTesterGatedAstrologyPage(pathname: string): boolean {
  return ASTROLOGY_ROOM.test(pathname) && !OWN_GATE.test(pathname);
}

/** Fails closed: any lookup error counts as "not a tester". */
export async function memberIsAstrologyTester(memberId: string): Promise<boolean> {
  try {
    const result = await query<{ tester: boolean | null }>(
      'SELECT tester FROM members WHERE id = $1 LIMIT 1',
      [memberId],
    );
    return result.rows[0]?.tester === true;
  } catch {
    return false;
  }
}
