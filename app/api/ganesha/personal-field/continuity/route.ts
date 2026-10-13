/**
 * G2-2 / Ganesha read-only Personal Field continuity.
 * Not the old Practitioner Studio page, not a general client-record API.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { resolveIndividualContext } from '@/lib/auth/individualContext';
import { readPersonalFieldContinuity } from '@/lib/ganesha/personalFieldContinuity';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest) {
  try {
    const context = await resolveIndividualContext(request);
    if (!context) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 401, headers: NO_STORE },
      );
    }
    return NextResponse.json(
      await readPersonalFieldContinuity(context),
      { headers: NO_STORE },
    );
  } catch {
    // Never log a person's journal, notes, identifiers, SQL/PG errors, or
    // other member-derived information to this endpoint's diagnostic logs.
    console.error('[Ganesha PersonalField] Read unavailable', {
      failureKind: 'source_unavailable',
    });
    return NextResponse.json(
      { error: 'Personal Field is temporarily unavailable' },
      { status: 503, headers: NO_STORE },
    );
  }
}
