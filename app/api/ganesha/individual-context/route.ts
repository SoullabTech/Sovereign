/**
 * G2-1 read-only entrance capability probe.
 *
 * A Ganesha member has a personal identity even without practitioners rows.
 * This route DOES NOT create professional identity, mutate any account,
 * activate billing, or authorize a practitioner/client scope.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { resolveIndividualContext } from '@/lib/auth/individualContext';

export async function GET(request: NextRequest) {
  try {
    const context = await resolveIndividualContext(request);
    if (!context) {
      return NextResponse.json(
        { error: 'Sign in required' }, { status: 401 },
      );
    }
    // Do not expose compatibility practitioner IDs to the Ganesha UI. An
    // internal reference remains available only to future authenticated
    // read-only legacy adapters, after their own owner checks.
    return NextResponse.json({
      authenticated: true,
      personalField: {
        identityReady: true,
        owner: 'member',
        // Legacy notes and Changes still require separately reviewed
        // compatibility paths. Do not imply those screens are usable yet.
        contentAccess: 'not_assessed',
      },
      legacyPersonal: { status: context.legacyPersonalStatus },
      // A personal arrival cannot be interpreted as a professional grant.
      professionalStanding: 'not_evaluated',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Ganesha IndividualContext] Unable to resolve member-owned context', {
      failureKind: 'internal_error',
    });
    return NextResponse.json(
      { error: 'Personal context is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
