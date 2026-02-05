export const dynamic = 'force-dynamic';
/**
 * 🧭 NAVIGATOR LAB FEEDBACK API
 *
 * Bridge endpoint for submitting Navigator decision feedback
 * Forwards feedback to the beta consciousness computing server for storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session-utils';

const BETA_SERVER_URL = process.env.BETA_SERVER_URL || 'http://localhost:3008';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { decisionId, rating, notes, scenarioId } = body;

    if (!decisionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: decisionId'
      }, { status: 400 });
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: rating'
      }, { status: 400 });
    }

    // Get authenticated user (optional for lab scenarios)
    const userId = await getSessionUserId(request);
    const labUserId = userId || `lab_anonymous_${Date.now()}`;

    console.log(`📝 Navigator Lab feedback from user: ${labUserId}`);
    console.log(`   Decision: ${decisionId}`);
    console.log(`   Rating: ${rating}/3`);
    console.log(`   Scenario: ${scenarioId || 'unknown'}`);

    // Forward to beta consciousness computing server
    const response = await fetch(`${BETA_SERVER_URL}/api/consciousness/navigator-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': labUserId,
      },
      body: JSON.stringify({
        decisionId,
        rating,
        notes: notes || '',
        source: 'lab_evaluation',
        scenarioId: scenarioId || null
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Beta server error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      decisionId,
      rating,
      timestamp: new Date().toISOString(),
      ...data
    });

  } catch (error) {
    console.error('❌ Navigator Lab feedback error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to save feedback',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
