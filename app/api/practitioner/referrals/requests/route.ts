/**
 * REFERRAL REQUESTS API
 *
 * GET - List referrals (inbox or sent)
 * POST - Create a new referral draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getReferrals,
  createReferralDraft,
} from '@/lib/practitioner/trustedColleagues';

export async function GET(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'inbox' | 'sent' | null;

    // Get both inbox and sent if no type specified
    if (!type) {
      const [inbox, sent] = await Promise.all([
        getReferrals(memberId, 'inbox'),
        getReferrals(memberId, 'sent'),
      ]);

      return NextResponse.json({ inbox, sent });
    }

    const referrals = await getReferrals(memberId, type);
    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('[Referrals GET] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json();

    if (!body.to_practitioner_id) {
      return NextResponse.json(
        { error: 'to_practitioner_id is required' },
        { status: 400 }
      );
    }

    if (!body.requester_note) {
      return NextResponse.json(
        { error: 'requester_note is required' },
        { status: 400 }
      );
    }

    const referral = await createReferralDraft(memberId, body.to_practitioner_id, {
      client_age_range: body.client_age_range,
      client_pronouns: body.client_pronouns,
      presenting_themes: body.presenting_themes,
      urgency: body.urgency,
      constraints: body.constraints,
      requester_note: body.requester_note,
    });

    return NextResponse.json({ referral });
  } catch (error) {
    console.error('[Referrals POST] Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'NOT_COLLEAGUES') {
        return NextResponse.json(
          { error: 'Can only send referrals to accepted colleagues' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
