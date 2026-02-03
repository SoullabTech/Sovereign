export const dynamic = 'force-dynamic';
/**
 * PROCESS REMINDERS API
 *
 * Cron endpoint to process and send due reminders.
 * Should be called periodically (e.g., every 5 minutes) by a cron job.
 *
 * Security: This endpoint should be protected in production (e.g., via API key).
 */

import { NextRequest, NextResponse } from 'next/server';
import { focusReminderService } from '@/lib/focus/FocusReminderService';
import { query } from '@/lib/db/postgres';

// Simple user email lookup - in production, this would use the members table
async function getUserEmail(userId: string): Promise<string | null> {
  // For development/testing, check if userId is already an email first
  if (userId.includes('@')) {
    return userId;
  }

  try {
    // Try to get email from members table by username
    const result = await query<{ email: string }>(
      'SELECT email FROM members WHERE username = $1',
      [userId]
    );

    if (result.rows.length > 0 && result.rows[0].email) {
      return result.rows[0].email;
    }

    console.warn(`[ProcessReminders] No email found for user: ${userId}`);
    return null;
  } catch (error) {
    console.warn(`[ProcessReminders] Error looking up email for ${userId}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Check for API key in production
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[ProcessReminders] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[ProcessReminders] Starting reminder processing...');

    const results = await focusReminderService.processDueReminders(getUserEmail);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} reminders`,
      data: results,
    });

  } catch (error) {
    console.error('[ProcessReminders] Error:', error);

    // Graceful degradation
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('relation') || message.includes('does not exist')) {
      console.warn('[ProcessReminders] Database table not created - run migration');
      return NextResponse.json({
        success: true,
        message: 'No reminders to process (DB pending migration)',
        data: { processed: 0, sent: 0, failed: 0 }
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for easy manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
