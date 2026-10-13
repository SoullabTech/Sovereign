/**
 * GANESHA–PRO–BOUNDARY G2-1 — member-owned individual identity.
 *
 * Personal Field belongs to an authenticated member. Neither a practitioner
 * record, a paid tier nor Co-Lab participation is a condition for arrival.
 *
 * The legacy personal practitioner ID is only a read-only compatibility hint
 * for already-authored records. It is NEVER evidence of professional standing.
 * Duplicate or suspended history fails closed for the legacy lookup, not for
 * the member's independent ability to use MAIA and member-owned Personal Field.
 */
import type { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export type LegacyPersonalStatus =
  | 'none'
  | 'active'
  | 'ambiguous'
  | 'unavailable';

export interface IndividualContext {
  memberId: string;
  /** Private compatibility reference. NOT proof of professional standing. */
  legacyPersonalPractitionerId: string | null;
  legacyPersonalStatus: LegacyPersonalStatus;
}

interface ExistingPractitioner {
  id: string;
  portal_type: string | null;
  status: string;
}

export function chooseLegacyPersonalReference(
  rows: readonly ExistingPractitioner[],
): Pick<IndividualContext, 'legacyPersonalPractitionerId' | 'legacyPersonalStatus'> {
  const personal = rows.filter(row => row.portal_type === 'personal');
  if (personal.length === 0) {
    return { legacyPersonalPractitionerId: null, legacyPersonalStatus: 'none' };
  }
  // Multiple personal records are an identity/custody problem. Selecting the
  // first row would silently move a person's writings to the wrong owner.
  if (personal.length !== 1) {
    return { legacyPersonalPractitionerId: null, legacyPersonalStatus: 'ambiguous' };
  }
  if (personal[0].status !== 'active') {
    return { legacyPersonalPractitionerId: null, legacyPersonalStatus: 'unavailable' };
  }
  return {
    legacyPersonalPractitionerId: personal[0].id,
    legacyPersonalStatus: 'active',
  };
}

export async function resolveIndividualContext(
  request: NextRequest,
): Promise<IndividualContext | null> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return null;

  // Inspect ONLY rows already owned by the authenticated member. Never select
  // personal legacy history by email, slug, body ID or ambiguous LIMIT 1.
  const result = await query<ExistingPractitioner>(
    `SELECT id, portal_type, status
       FROM practitioners
      WHERE member_id = $1
      ORDER BY id`,
    [memberId],
  );
  return { memberId, ...chooseLegacyPersonalReference(result.rows) };
}
