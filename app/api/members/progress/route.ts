// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic'


/**
 * Update member onboarding progress
 * Tracks which step the member has reached
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const { memberId, step, complete } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
      );
    }

    if (complete) {
      // Mark onboarding as complete
      await query(
        `UPDATE members
         SET onboarded = true, onboarding_step = 'complete'
         WHERE id = $1`,
        [memberId]
      );

      return NextResponse.json({
        success: true,
        onboarded: true,
        step: 'complete'
      });
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
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID required' },
        { status: 400 }
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
