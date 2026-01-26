export const dynamic = 'force-dynamic';

/**
 * Waitlist API
 *
 * POST /api/waitlist
 *
 * Captures email addresses from visitors who don't have an invite.
 * These are potential members waiting for the community to expand.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already on waitlist
    const existing = await query(
      'SELECT id, created_at FROM waitlist WHERE email = $1',
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      // Already on waitlist - that's okay, just acknowledge
      return NextResponse.json({
        success: true,
        message: "You're already on the waitlist. We'll be in touch.",
        alreadyExists: true,
      });
    }

    // Check if already a member
    const existingMember = await query(
      'SELECT id FROM members WHERE email = $1',
      [normalizedEmail]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: "You already have an account. Try signing in.",
        alreadyMember: true,
      });
    }

    // Add to waitlist
    await query(
      `INSERT INTO waitlist (email, source, created_at)
       VALUES ($1, $2, NOW())`,
      [normalizedEmail, source || 'landing']
    );

    console.log(`[Waitlist] New signup: ${normalizedEmail} (source: ${source || 'landing'})`);

    return NextResponse.json({
      success: true,
      message: "You're on the list. When a door opens, you'll know.",
    });

  } catch (error) {
    // Handle case where waitlist table doesn't exist
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('[Waitlist] Table does not exist, creating...');

      try {
        await query(`
          CREATE TABLE IF NOT EXISTS waitlist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL UNIQUE,
            source VARCHAR(50) DEFAULT 'landing',
            invited_at TIMESTAMP WITH TIME ZONE,
            invited_by UUID REFERENCES members(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);

        // Retry the insert
        const body = await request.clone().json();
        const normalizedEmail = body.email.toLowerCase().trim();

        await query(
          `INSERT INTO waitlist (email, source, created_at)
           VALUES ($1, $2, NOW())`,
          [normalizedEmail, body.source || 'landing']
        );

        return NextResponse.json({
          success: true,
          message: "You're on the list. When a door opens, you'll know.",
        });
      } catch (retryError) {
        console.error('[Waitlist] Retry error:', retryError);
      }
    }

    console.error('[Waitlist] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist
 *
 * Returns waitlist stats (admin only, for now just count)
 */
export async function GET() {
  try {
    const result = await query(
      'SELECT COUNT(*) as total FROM waitlist WHERE invited_at IS NULL'
    );

    return NextResponse.json({
      waiting: parseInt(result.rows[0]?.total || '0', 10),
    });
  } catch (error) {
    // Table might not exist
    return NextResponse.json({ waiting: 0 });
  }
}
