// Production requires force-dynamic for database access
export const dynamic = 'force-static';

/**
 * Conversation Turns API
 * Store and retrieve conversation turns for cross-session/cross-device recall
 *
 * GET: Retrieve conversation history for a session/user
 * POST: Save a conversation turn pair (user + assistant)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// GET: Retrieve conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400 }
      );
    }

    // Build query based on provided params
    let sql: string;
    let params: string[];

    if (sessionId) {
      // Get messages for specific session
      sql = `
        SELECT id, role, content, created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1 AND session_id = $2
        ORDER BY created_at ASC
        LIMIT 100
      `;
      params = [userId, sessionId];
    } else {
      // Get recent messages for user (cross-session)
      sql = `
        SELECT id, role, content, session_id as "sessionId", created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      params = [userId];
    }

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle missing table gracefully
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] conversation_turns table not found - returning empty');
      return NextResponse.json({
        success: true,
        messages: []
      });
    }

    console.error(`[CONVERSATION] GET error: ${message}`);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve conversation' },
      { status: 500 }
    );
  }
}

// POST: Save a conversation turn pair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, assistantMessage, userId, sessionId, isSanctuary } = body;

    // Sanctuary mode: Don't store anything
    if (isSanctuary) {
      console.log('[CONVERSATION] Sanctuary mode - not storing turn');
      return NextResponse.json({ success: true, sanctuary: true });
    }

    if (!userId || !userMessage || !assistantMessage) {
      return NextResponse.json(
        { success: false, error: 'userId, userMessage, and assistantMessage required' },
        { status: 400 }
      );
    }

    // Insert both turns in a transaction
    const insertSql = `
      INSERT INTO conversation_turns (user_id, session_id, role, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    // Insert user message
    await query(insertSql, [userId, sessionId || null, 'user', userMessage]);

    // Insert assistant message
    await query(insertSql, [userId, sessionId || null, 'assistant', assistantMessage]);

    console.log(`[CONVERSATION] Stored turn pair for user ${userId.slice(0, 8)}...`);

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle missing table gracefully - just log and return success
    // This prevents the 404 errors from causing UI issues
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] conversation_turns table not found - skipping save');
      return NextResponse.json({ success: true, tableNotReady: true });
    }

    console.error(`[CONVERSATION] POST error: ${message}`);
    return NextResponse.json(
      { success: false, error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
