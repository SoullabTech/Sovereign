/**
 * DIALOGUES API - GET
 * Phase 4.7: Meta-Dialogue Integration
 *
 * Endpoints:
 * - GET /api/dialogues?sessionId={id}&limit={n}  → Fetch session exchanges
 * - GET /api/dialogues?limit={n}                 → Fetch recent sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionExchanges,
  getActiveSessions,
} from '../../../backend/src/services/dialogue/metaDialogueService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dialogues
 *
 * Query params:
 * - sessionId: UUID of dialogue session (optional)
 * - limit: Max results to return (default: 10)
 *
 * Returns:
 * - If sessionId provided: array of exchanges for that session
 * - If no sessionId: array of active sessions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch session exchanges
    if (sessionId) {
      const exchanges = await getSessionExchanges(sessionId, limit);

      return NextResponse.json({
        success: true,
        sessionId,
        exchanges,
        count: exchanges.length,
      });
    }

    // Fetch active sessions
    const sessions = await getActiveSessions(limit);

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error('[API] /api/dialogues error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch dialogues',
      },
      { status: 500 }
    );
  }
}
