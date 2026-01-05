export const dynamic = 'force-dynamic';
/**
 * Check if passkey exists in database
 * Used to determine if user is new or returning
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey required' },
        { status: 400 }
      );
    }

    // Check if passkey exists in members table
    const result = await query(
      'SELECT id, username, name, onboarded, onboarding_step FROM members WHERE passkey = $1',
      [passkey.toUpperCase()]
    );

    if (result.rows.length > 0) {
      const member = result.rows[0];
      return NextResponse.json({
        exists: true,
        onboarded: member.onboarded,
        onboardingStep: member.onboarding_step,
        username: member.username,
        name: member.name
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('[MEMBERS] Check passkey error:', error);
    return NextResponse.json(
      { error: 'Failed to check passkey' },
      { status: 500 }
    );
  }
}
