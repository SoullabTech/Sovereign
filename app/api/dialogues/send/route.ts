/**
 * DIALOGUES API - SEND
 * Phase 4.7: Meta-Dialogue Integration
 *
 * Endpoint:
 * - POST /api/dialogues/send  → Send user query and receive MAIA response
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processDialogue,
  quickStartDialogue,
} from '../../../../backend/src/services/dialogue/metaDialogueService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/dialogues/send
 *
 * Request body:
 * {
 *   sessionId?: string,      // Optional: existing session ID
 *   userQuery: string,        // Required: user's message
 *   reflectionId?: string,    // Optional: specific reflection to discuss
 *   useOllama?: boolean       // Optional: use Ollama for response (default: false)
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   session: { ... },          // Session metadata
 *   userExchange: { ... },     // User's query exchange
 *   maiaExchange: { ... }      // MAIA's response exchange
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userQuery, reflectionId, useOllama = false } = body;

    // Validate required fields
    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'userQuery is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // If no sessionId, start a new session
    if (!sessionId) {
      const result = await quickStartDialogue(userQuery, {
        reflectionId,
        useOllama,
      });

      return NextResponse.json({
        success: true,
        session: result.session,
        userExchange: result.userExchange,
        maiaExchange: result.maiaExchange,
      });
    }

    // Process dialogue in existing session
    const { userExchange, maiaExchange } = await processDialogue(sessionId, userQuery, {
      reflectionId,
      useOllama,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      userExchange,
      maiaExchange,
    });
  } catch (error: any) {
    console.error('[API] /api/dialogues/send error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process dialogue',
      },
      { status: 500 }
    );
  }
}
