// app/api/maia/log-turn/route.ts
// API endpoint for logging conversation turns into MAIA's learning system

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/database/postgres';
import { z } from 'zod';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Zod validation schema for turn logging
const MaiaTurnLogSchema = z.object({
  sessionId: z.string().min(1), // Changed from UUID to support TEXT session IDs
  turnIndex: z.number().int().min(0).optional(), // Auto-increment if not provided
  userTurn: z.object({
    content: z.string().min(1),
    meta: z.record(z.any()).default({})
  }),
  maiaTurn: z.object({
    content: z.string().min(1),
    processingProfile: z.enum(['FAST', 'CORE', 'DEEP']),
    primaryEngine: z.string().default('deepseek-r1:latest'),
    secondaryEngine: z.string().optional(),
    usedClaudeConsult: z.boolean().default(false),
    latencyMs: z.number().int().positive().optional(),
    ruptureFlag: z.boolean().default(false),
    repairFlag: z.boolean().default(false),
    element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
    facet: z.string().optional(),
    topicTags: z.array(z.string()).optional(),
    meta: z.record(z.any()).default({})
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = MaiaTurnLogSchema.parse(body);

    // Determine turn index (auto-increment or use provided)
    let nextTurnIndex = validatedData.turnIndex;
    if (nextTurnIndex === undefined) {
      // Get the latest turn index for this session
      const latestTurn = await query<{ turn_index: number }>(
        'SELECT turn_index FROM maia_turns WHERE session_id = $1 ORDER BY turn_index DESC LIMIT 1',
        [validatedData.sessionId]
      );
      nextTurnIndex = latestTurn.length > 0 ? latestTurn[0].turn_index + 1 : 0;
    }

    // Use transaction to insert both turns atomically
    const turnIds = await transaction(async (queryTx) => {
      // Create MAIA metadata with engine and performance info
      const maiaMetadata = {
        primaryEngine: validatedData.maiaTurn.primaryEngine,
        secondaryEngine: validatedData.maiaTurn.secondaryEngine,
        usedClaudeConsult: validatedData.maiaTurn.usedClaudeConsult,
        latencyMs: validatedData.maiaTurn.latencyMs,
        ruptureFlag: validatedData.maiaTurn.ruptureFlag,
        repairFlag: validatedData.maiaTurn.repairFlag,
        element: validatedData.maiaTurn.element,
        facet: validatedData.maiaTurn.facet,
        topicTags: validatedData.maiaTurn.topicTags || [],
        ...validatedData.maiaTurn.meta
      };

      // Insert user turn
      const userTurnResult = await queryTx<{ id: number }>(
        `INSERT INTO maia_turns (
          session_id, turn_index, role, content, processing_profile, engine, meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) RETURNING id`,
        [
          validatedData.sessionId,
          nextTurnIndex,
          'user',
          validatedData.userTurn.content,
          validatedData.maiaTurn.processingProfile, // Use MAIA's processing level for both turns
          'user-input', // Engine field for user turn
          JSON.stringify(validatedData.userTurn.meta)
        ]
      );

      // Insert MAIA turn
      const maiaTurnResult = await queryTx<{ id: number }>(
        `INSERT INTO maia_turns (
          session_id, turn_index, role, content, processing_profile, engine, meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) RETURNING id`,
        [
          validatedData.sessionId,
          nextTurnIndex + 1,
          'maia',
          validatedData.maiaTurn.content,
          validatedData.maiaTurn.processingProfile,
          validatedData.maiaTurn.primaryEngine,
          JSON.stringify(maiaMetadata)
        ]
      );

      return {
        userTurnId: userTurnResult[0]?.id,
        maiaTurnId: maiaTurnResult[0]?.id
      };
    });

    if (!turnIds.userTurnId || !turnIds.maiaTurnId) {
      console.error('❌ Failed to insert turn data: missing IDs');
      return NextResponse.json({
        success: false,
        error: 'Failed to log conversation turns'
      }, { status: 500 });
    }

    console.log(`✅ Turn logged | Session: ${validatedData.sessionId} | Turn: ${nextTurnIndex} | User ID: ${turnIds.userTurnId} | MAIA ID: ${turnIds.maiaTurnId} | Profile: ${validatedData.maiaTurn.processingProfile}`);

    return NextResponse.json({
      success: true,
      userTurnId: turnIds.userTurnId,
      maiaTurnId: turnIds.maiaTurnId,
      turnIndex: nextTurnIndex,
      message: 'Conversation turn logged successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid turn log payload:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid turn data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('❌ Turn logging API failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log conversation turn'
      },
      { status: 500 }
    );
  }
}