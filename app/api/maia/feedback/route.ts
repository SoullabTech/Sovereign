export const dynamic = 'force-static';
// app/api/maia/feedback/route.ts
// API endpoint for collecting user feedback on MAIA's responses
// Uses clean schema: maia_decision_feedback linked to maia_decisions

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database/postgres';
import { z } from 'zod';

// Skip during static export (Capacitor builds)

// Type definitions based on clean schema (20260113000002_decision_trace_clean.sql)
const MaiaFeedbackSchema = z.object({
  // Primary linkage: decision_id is preferred, turnId as fallback
  decisionId: z.string().uuid().optional(),  // Links to maia_decisions
  turnId: z.number().int().positive().optional(),  // Fallback: lookup decision by turn

  // Backward compatibility alias
  deliberationId: z.string().uuid().optional(),  // Alias for decisionId

  sourceType: z.enum(['user', 'tester', 'dev', 'auto']).default('user'),

  // Scores (1-5 scale)
  feltSeenScore: z.number().int().min(1).max(5).optional(),
  attunementScore: z.number().int().min(1).max(5).optional(),
  safetyScore: z.number().int().min(1).max(5).optional(),
  depthScore: z.number().int().min(1).max(5).optional(),

  // Classification correction (super valuable for learning)
  correctedLabel: z.string().optional(),  // User says: "No, it was Water-2 not Fire-1"

  // Freeform
  tags: z.array(z.string()).optional(),
  comment: z.string().optional(),
  idealReply: z.string().optional()
}).refine(
  data => data.decisionId || data.deliberationId || data.turnId,
  { message: 'Either decisionId, deliberationId, or turnId is required' }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validatedData = MaiaFeedbackSchema.parse(body);

    // Resolve decisionId (prefer explicit, then deliberationId alias, then lookup by turnId)
    let decisionId = validatedData.decisionId || validatedData.deliberationId;
    let turnId = validatedData.turnId;

    if (!decisionId && turnId) {
      // Lookup decision by turnId
      const decisionByTurn = await queryOne<{ id: string }>(
        'SELECT id FROM maia_decisions WHERE turn_id = $1',
        [turnId]
      );
      if (decisionByTurn) {
        decisionId = decisionByTurn.id;
      }
    }

    if (!decisionId) {
      // Fallback: check old maia_turn_feedback table for backward compatibility
      // This handles feedback before clean schema migration
      return NextResponse.json(
        { error: 'Decision not found. Ensure decisionId or valid turnId is provided.' },
        { status: 404 }
      );
    }

    // Verify decision exists
    const existingDecision = await queryOne<{
      id: string;
      session_id: string;
      turn_id: number;
      final_label: string;
    }>(
      'SELECT id, session_id, turn_id, final_label FROM maia_decisions WHERE id = $1',
      [decisionId]
    );

    if (!existingDecision) {
      return NextResponse.json(
        { error: 'Decision not found' },
        { status: 404 }
      );
    }

    // Insert feedback record into new clean schema table
    const feedbackData = await queryOne<{ id: number }>(
      `INSERT INTO maia_decision_feedback (
        decision_id,
        turn_id,
        source_type,
        felt_seen_score,
        attunement_score,
        safety_score,
        depth_score,
        corrected_label,
        tags,
        comment,
        ideal_reply
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        decisionId,
        existingDecision.turn_id,  // Redundancy for easier joins
        validatedData.sourceType,
        validatedData.feltSeenScore ?? null,
        validatedData.attunementScore ?? null,
        validatedData.safetyScore ?? null,
        validatedData.depthScore ?? null,
        validatedData.correctedLabel ?? null,
        validatedData.tags || [],
        validatedData.comment ?? null,
        validatedData.idealReply ?? null
      ]
    );

    if (!feedbackData) {
      console.error('❌ Failed to save feedback: no data returned');
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Compute feedback quality flags
    const isGoldCandidate = (
      (validatedData.feltSeenScore || 0) >= 4 &&
      (validatedData.attunementScore || 0) >= 4 &&
      (validatedData.safetyScore || 0) >= 4
    );

    const isNegativeOutcome = (
      (validatedData.feltSeenScore || 5) <= 2 ||
      (validatedData.attunementScore || 5) <= 2
    );

    const hasCorrectedLabel = !!validatedData.correctedLabel &&
      validatedData.correctedLabel !== existingDecision.final_label;

    const flags: string[] = [];
    if (isGoldCandidate) flags.push('gold-candidate');
    if (isNegativeOutcome) flags.push('negative-outcome');
    if (hasCorrectedLabel) flags.push('label-corrected');

    console.log(
      `🎯 Feedback received | Session: ${existingDecision.session_id} ` +
      `| Decision: ${decisionId.slice(0, 8)}... ` +
      `| Attunement: ${validatedData.attunementScore || 'unrated'}/5 ` +
      `| Corrected: ${hasCorrectedLabel ? validatedData.correctedLabel : 'no'} ` +
      `| Flags: [${flags.join(', ')}]`
    );

    return NextResponse.json({
      success: true,
      feedbackId: feedbackData.id,
      decisionId,
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

// Get feedback analytics and insights using clean schema views
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '7');
    const sessionId = searchParams.get('sessionId');

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    // Use the decision_feedback_pairs view from clean schema
    let sqlQuery = `
      SELECT
        decision_id,
        session_id,
        turn_id,
        final_label,
        final_confidence,
        decided_by,
        deliberation_triggered,
        trigger_reason,
        mode,
        created_at,
        felt_seen_score,
        attunement_score,
        safety_score,
        depth_score,
        corrected_label,
        feedback_tags,
        feedback_comment,
        positive_outcome,
        negative_outcome,
        was_corrected
      FROM decision_feedback_pairs
      WHERE created_at >= $1
    `;

    const params: (string | number)[] = [dateThreshold.toISOString()];

    // Filter by session if provided
    if (sessionId) {
      sqlQuery += ' AND session_id = $2';
      params.push(sessionId);
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const results = await query(sqlQuery, params);
    const decisions = results.rows || results;

    // Calculate analytics
    const decisionsWithFeedback = decisions.filter((d: any) =>
      d.felt_seen_score !== null ||
      d.attunement_score !== null ||
      d.safety_score !== null
    );
    const totalFeedback = decisionsWithFeedback.length;

    const attunementScores = decisions
      .map((d: any) => d.attunement_score)
      .filter((score: any) => score !== null && score !== undefined);

    const feltSeenScores = decisions
      .map((d: any) => d.felt_seen_score)
      .filter((score: any) => score !== null && score !== undefined);

    const positiveOutcomes = decisions.filter((d: any) => d.positive_outcome);
    const negativeOutcomes = decisions.filter((d: any) => d.negative_outcome);
    const correctedDecisions = decisions.filter((d: any) => d.was_corrected);
    const triggeredDecisions = decisions.filter((d: any) => d.deliberation_triggered);

    const analytics = {
      period: `${daysBack} days`,
      totalDecisions: decisions.length,
      decisionsWithFeedback: totalFeedback,
      feedbackRate: totalFeedback / Math.max(decisions.length, 1),

      // Score averages
      averageAttunement: attunementScores.length > 0 ?
        attunementScores.reduce((a: number, b: number) => a + b, 0) / attunementScores.length : null,
      averageFeltSeen: feltSeenScores.length > 0 ?
        feltSeenScores.reduce((a: number, b: number) => a + b, 0) / feltSeenScores.length : null,

      // Outcome tracking
      positiveOutcomes: positiveOutcomes.length,
      positiveRate: positiveOutcomes.length / Math.max(totalFeedback, 1),
      negativeOutcomes: negativeOutcomes.length,
      negativeRate: negativeOutcomes.length / Math.max(totalFeedback, 1),

      // Learning signals
      correctedDecisions: correctedDecisions.length,
      correctionRate: correctedDecisions.length / Math.max(totalFeedback, 1),

      // Deliberation analysis
      totalTriggered: triggeredDecisions.length,
      triggerRate: triggeredDecisions.length / Math.max(decisions.length, 1),

      // Decision method breakdown
      decidedByBreakdown: {
        atlas_confident: decisions.filter((d: any) => d.decided_by === 'atlas_confident').length,
        deliberation_pending: decisions.filter((d: any) => d.decided_by === 'deliberation_pending').length,
        committee: decisions.filter((d: any) => d.decided_by === 'committee').length,
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
