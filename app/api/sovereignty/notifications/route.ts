export const dynamic = 'force-dynamic' // Changed for Capacitor build compatibility;

/**
 * System Notifications API — OPERATOR SURFACE, NOT A MEMBER SURFACE.
 *
 * GET  - Get unread notifications
 * POST - Mark notification as read
 *
 * SCOPING (verified 2026-07-28): `system_notifications` has NO member column
 * (see database/migrations/20260119000001_tts_sovereignty_monitor.sql:33-42).
 * It holds system/ops alerts — currently TTS sovereignty reports written by
 * lib/sovereignty/TTSSovereigntyMonitor.ts. There is therefore nothing to scope
 * per-member here, and adding a member filter would be wrong: these rows do not
 * belong to a member.
 *
 * SECURITY: both handlers previously ran with no guard at all. GET exposed
 * internal ops state to anonymous callers, and POST was an unauthenticated
 * global write — any caller could send `{ markAllRead: true }` and silently
 * clear every operator-facing sovereignty alert, suppressing the very signal
 * the monitor exists to raise. Guarded with the established admin contract
 * (isAdminRequest), which fails closed when LABTOOLS_ADMIN_PASSWORD is unset.
 *
 * Deliberately NOT guarded via middleware roles: `x-maia-roles` is
 * client-settable and is not a trustworthy authorization input.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', notifications: [] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = `
      SELECT id, type, title, message, variant, data, read, created_at
      FROM system_notifications
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (unreadOnly) {
      query += ` AND read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const result = await db.query(query, params);

    return NextResponse.json({
      notifications: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('[Notifications API] Error fetching:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', notifications: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await db.query(`UPDATE system_notifications SET read = TRUE WHERE read = FALSE`);
      return NextResponse.json({ status: 'ok', message: 'All notifications marked as read' });
    }

    if (id) {
      await db.query(`UPDATE system_notifications SET read = TRUE WHERE id = $1`, [id]);
      return NextResponse.json({ status: 'ok', message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('[Notifications API] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
