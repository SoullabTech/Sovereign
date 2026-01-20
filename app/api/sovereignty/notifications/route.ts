export const dynamic = 'force-static' // Changed for Capacitor build compatibility;

/**
 * System Notifications API
 *
 * GET  - Get unread notifications
 * POST - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
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
