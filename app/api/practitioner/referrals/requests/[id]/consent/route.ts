/**
 * REFERRAL CONSENT API
 *
 * POST - Record client consent and optionally share identifying info
 *
 * This is the explicit step that unlocks name/contact sharing.
 * INVARIANT #2: No client exposure without explicit consent transition.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { recordConsent } from '@/lib/practitioner/trustedColleagues';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id: referralId } = await params;
    const body = await request.json();

    // Validate consent structure
    if (typeof body.client_consent_given !== 'boolean') {
      return NextResponse.json(
        { error: 'client_consent_given (boolean) is required' },
        { status: 400 }
      );
    }

    // If sharing name, consent must be given
    if (body.client_name_shared && !body.client_consent_given) {
      return NextResponse.json(
        { error: 'Cannot share name without consent' },
        { status: 400 }
      );
    }

    // If providing name/contact, sharing must be enabled
    if ((body.client_name || body.client_contact) && !body.client_name_shared) {
      return NextResponse.json(
        { error: 'Cannot provide name/contact without client_name_shared = true' },
        { status: 400 }
      );
    }

    const referral = await recordConsent(referralId, memberId, {
      client_consent_given: body.client_consent_given,
      client_name_shared: body.client_name_shared,
      client_name: body.client_name,
      client_contact: body.client_contact,
    });

    return NextResponse.json({ referral });
  } catch (error) {
    console.error('[Referral Consent] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'REFERRAL_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Referral not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}
