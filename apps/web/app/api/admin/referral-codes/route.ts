import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { generateReferralCodes, getReferralStats } from '@/lib/auth/BetaAuth';

/**
 * Admin API for Referral Code Management
 * POST: Generate referral codes for a user
 * GET: Get referral stats for all users
 */

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, count = 10 } = await req.json();

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName' },
        { status: 400 }
      );
    }

    console.log(`🎫 Admin generating ${count} referral codes for ${userName} (${userId})`);

    const codes = await generateReferralCodes(userId, userName, count);

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate referral codes' },
        { status: 500 }
      );
    }

    console.log(`✅ Generated ${codes.length} referral codes for ${userName}`);

    return NextResponse.json({
      success: true,
      codes,
      message: `Generated ${codes.length} referral codes for ${userName}`
    });

  } catch (error) {
    console.error('❌ Error generating referral codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get stats for specific user
      const stats = await getReferralStats(userId);
      return NextResponse.json(stats);
    }

    // Return basic response for now
    // TODO: Implement admin-wide stats aggregation
    return NextResponse.json({
      message: 'Referral codes API active',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}