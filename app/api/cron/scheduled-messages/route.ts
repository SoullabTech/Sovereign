export const dynamic = 'force-dynamic';

/**
 * SCHEDULED MESSAGES — process-due endpoint (the executor trigger).
 *
 * Called periodically by the same scheduler that drives the other cron endpoints
 * (e.g. session-reminders). Each call processes due, still-authorized rows and sends
 * them once. Mirrors the session-reminders cron security model: Bearer CRON_SECRET.
 *
 * This endpoint is the ONLY thing that turns a scheduled row into a sent message, and it
 * does so only via the atomic claim in processDueScheduledMessages (the active-check).
 */

import { NextRequest, NextResponse } from 'next/server';
import { processDueScheduledMessages } from '@/lib/maia/scheduledMessages';

function verifyCronSecret(request: NextRequest): boolean {
  // In development, allow without secret (mirrors session-reminders).
  if (process.env.NODE_ENV === 'development') return true;

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[ScheduledMessages] CRON_SECRET not configured');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

async function handle(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await processDueScheduledMessages();
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (err: any) {
    console.error('[ScheduledMessages] process error:', err?.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
