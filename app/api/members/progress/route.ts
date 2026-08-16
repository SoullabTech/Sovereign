// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'


/**
 * Update member onboarding progress
 * Tracks which step the member has reached
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function POST(request: NextRequest) {
  try {
    const { memberId: suppliedMemberId, step, complete, youthOnboarded } = await request.json();

    // ACTOR from the verified session. This handler writes the identity row
    // itself — onboarded, onboarding_step, youth_onboarded — so a supplied id
    // could force any member past the orientation the flow exists to deliver.
    // memberId is now OPTIONAL: /faq already posts without one, which the old
    // 400 rejected and silently swallowed.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedMemberId && suppliedMemberId !== memberId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    if (complete) {
      // Mark onboarding as complete (optionally including youth onboarding)
      const youthClause = youthOnboarded ? ', youth_onboarded = true' : '';
      await query(
        `UPDATE members
         SET onboarded = true, onboarding_step = 'complete'${youthClause}
         WHERE id = $1`,
        [memberId]
      );

      return NextResponse.json({
        success: true,
        onboarded: true,
        youthOnboarded: youthOnboarded || false,
        step: 'complete'
      });
    }

    // Mark youth onboarding complete (separate from main onboarding)
    if (youthOnboarded) {
      await query(
        'UPDATE members SET youth_onboarded = true WHERE id = $1',
        [memberId]
      );
      return NextResponse.json({ success: true, youthOnboarded: true });
    }

    if (step) {
      // Update current step
      const validSteps = ['begin', 'test-elemental', 'faq', 'onboarding', 'complete'];
      if (!validSteps.includes(step)) {
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
      }

      await query(
        'UPDATE members SET onboarding_step = $1 WHERE id = $2',
        [step, memberId]
      );

      return NextResponse.json({
        success: true,
        step
      });
    }

    return NextResponse.json(
      { error: 'Step or complete flag required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[MEMBERS] Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const suppliedMemberId = searchParams.get('memberId');

    // ACTOR from the verified session. The prior GET also acted as a member
    // existence oracle — 404 vs 200 distinguished a real member UUID from a
    // fabricated one; requiring a session closes that too.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedMemberId && suppliedMemberId !== memberId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    const result = await query(
      'SELECT onboarded, onboarding_step FROM members WHERE id = $1',
      [memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      onboarded: result.rows[0].onboarded,
      step: result.rows[0].onboarding_step
    });
  } catch (error) {
    console.error('[MEMBERS] Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
