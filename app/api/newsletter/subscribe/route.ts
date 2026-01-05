/**
 * Newsletter Subscription API
 *
 * Stores email signups for build letters / newsletter.
 * Uses local PostgreSQL (NOT Supabase).
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/postgres';

export const dynamic = 'force-static';

interface SubscribeRequest {
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, source = 'unknown' } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'Valid email required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!pool) {
      throw new Error('Database not configured');
    }

    // Upsert subscriber (update source if already exists)
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, source, subscribed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (email) DO UPDATE SET
         source = EXCLUDED.source,
         updated_at = NOW()`,
      [normalizedEmail, source]
    );

    console.log(`[Newsletter] New subscriber: ${normalizedEmail} from ${source}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Newsletter] Subscribe error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
