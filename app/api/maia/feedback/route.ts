// app/api/maia/feedback/route.ts
// API endpoint for collecting user feedback on MAIA's responses

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database/postgres';
import { z } from 'zod';

// Type definitions based on user's schema
const MaiaFeedbackSchema = z.object({
  turnId: z.number().int().positive(),
  sourceType: z.enum(['user', 'tester', 'dev', 'auto']).default('user'),
  feltSeenScore: z.number().int().min(1).max(5).optional(),
  attunementScore: z.number().int().min(1).max(5).optional(),
  safetyScore: z.number().int().min(1).max(5).optional(),
  depthAppropriatenessScore: z.number().int().min(1).max(5).optional(),
  ruptureMark: z.boolean().default(false),
  idealForRepair: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  comment: z.string().optional(),
  idealMaiaReply: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validatedData = MaiaFeedbackSchema.parse(body);

    // Check if turn exists
    const existingTurn = await queryOne<{ id: number; session_id: string; turn_index: number }>(
      'SELECT id, session_id, turn_index FROM maia_turns WHERE id = $1',
      [validatedData.turnId]
    );

    if (!existingTurn) {
      return NextResponse.json(
        { error: 'Turn not found' },
        { status: 404 }
      );
    }

    // Insert feedback record
    const feedbackData = await queryOne<{ id: number }>(
      `INSERT INTO maia_turn_feedback (
        turn_id, source_type, felt_seen_score, attunement_score, safety_score,
        depth_appropriateness_score, rupture_mark, ideal_for_repair, tags,
        comment, ideal_maia_reply
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        validatedData.turnId,
        validatedData.sourceType,
        validatedData.feltSeenScore,
        validatedData.attunementScore,
        validatedData.safetyScore,
        validatedData.depthAppropriatenessScore,
        validatedData.ruptureMark,
        validatedData.idealForRepair,
        validatedData.tags || [],
        validatedData.comment,
        validatedData.idealMaiaReply
      ]
    );

    if (!feedbackData) {
      console.error('❌ Failed to save feedback: no data returned');
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Check if this feedback qualifies for gold response corpus
    const isGoldCandidate = (
      (validatedData.feltSeenScore || 0) >= 4 &&
      (validatedData.attunementScore || 0) >= 4 &&
      (validatedData.safetyScore || 0) >= 4 &&
      !validatedData.ruptureMark
    );

    // Check if this is a rupture event that needs pattern tracking
    const isRuptureEvent = (
      validatedData.ruptureMark ||
      validatedData.idealForRepair ||
      (validatedData.feltSeenScore || 5) <= 2 ||
      (validatedData.attunementScore || 5) <= 2
    );

    let flags: any /* TODO: specify type */[] = [];
    if (isGoldCandidate) flags.push('gold-candidate');
    if (isRuptureEvent) flags.push('rupture-detected');

    console.log(`🎯 Feedback received | Session: ${existingTurn.session_id} | Turn: ${existingTurn.turn_index} | Attunement: ${validatedData.attunementScore || 'unrated'}/5 | Flags: [${flags.join(', ')}]`);

    return NextResponse.json({
      success: true,
      feedbackId: feedbackData.id,
      flags,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid feedback data:', error.errors);
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Feedback recording failed:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

// Get feedback analytics and insights
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '7');
    const sessionId = searchParams.get('sessionId');

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    // Build SQL query with LEFT JOIN to include turns without feedback
    let sqlQuery = `
      SELECT
        t.id,
        t.session_id,
        t.turn_index,
        t.processing_profile,
        t.primary_engine,
        t.latency_ms,
        t.rupture_flag,
        t.repair_flag,
        t.created_at,
        f.felt_seen_score,
        f.attunement_score,
        f.safety_score,
        f.depth_appropriateness_score,
        f.rupture_mark,
        f.ideal_for_repair,
        f.source_type,
        f.tags,
        f.comment
      FROM maia_turns t
      LEFT JOIN maia_turn_feedback f ON f.turn_id = t.id
      WHERE t.created_at >= $1
    `;

    const params = [dateThreshold.toISOString()];

    // Filter by session if provided
    if (sessionId) {
      sqlQuery += ' AND t.session_id = $2';
      params.push(sessionId);
    }

    sqlQuery += ' ORDER BY t.created_at DESC';

    const turns = await query(sqlQuery, params);

    // Calculate analytics (working with flat JOIN structure)
    const turnsWithFeedback = turns.filter(turn =>
      turn.felt_seen_score !== null ||
      turn.attunement_score !== null ||
      turn.safety_score !== null ||
      turn.rupture_mark !== null
    );
    const totalFeedback = turnsWithFeedback.length;

    const attunementScores = turns
      .map(turn => turn.attunement_score)
      .filter(score => score !== null && score !== undefined);

    const feltSeenScores = turns
      .map(turn => turn.felt_seen_score)
      .filter(score => score !== null && score !== undefined);

    const ruptureEvents = turns.filter(turn =>
      turn.rupture_mark ||
      turn.ideal_for_repair ||
      (turn.felt_seen_score || 5) <= 2 ||
      (turn.attunement_score || 5) <= 2
    );

    const goldCandidates = turns.filter(turn => {
      return (
        (turn.felt_seen_score || 0) >= 4 &&
        (turn.attunement_score || 0) >= 4 &&
        (turn.safety_score || 0) >= 4 &&
        !turn.rupture_mark
      );
    });

    const analytics = {
      period: `${daysBack} days`,
      totalTurns: turns.length,
      turnsWithFeedback: totalFeedback,
      feedbackRate: totalFeedback / Math.max(turns.length, 1),
      averageAttunement: attunementScores.length > 0 ?
        attunementScores.reduce((a, b) => a + b, 0) / attunementScores.length : null,
      averageFeltSeen: feltSeenScores.length > 0 ?
        feltSeenScores.reduce((a, b) => a + b, 0) / feltSeenScores.length : null,
      ruptureEvents: ruptureEvents.length,
      ruptureRate: ruptureEvents.length / Math.max(totalFeedback, 1),
      goldCandidates: goldCandidates.length,
      goldRate: goldCandidates.length / Math.max(totalFeedback, 1),
      processingProfileBreakdown: {
        FAST: turns.filter(t => t.processing_profile === 'FAST').length,
        CORE: turns.filter(t => t.processing_profile === 'CORE').length,
        DEEP: turns.filter(t => t.processing_profile === 'DEEP').length
      }
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Failed to generate analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}