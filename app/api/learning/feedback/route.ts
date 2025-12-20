// app/api/learning/feedback/route.ts
// API endpoint for user feedback integration with MAIA's learning system

import { NextRequest, NextResponse } from 'next/server';
import LearningSystemOrchestrator from '@/lib/learning/learningSystemOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turnId, feedback, maiaResponse } = body;

    // Validate required fields
    if (!turnId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: turnId, feedback' },
        { status: 400 }
      );
    }

    // Integrate feedback into learning system
    await LearningSystemOrchestrator.integrateFeedback({
      turnId,
      feedback,
      maiaResponse
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback integrated into learning system'
    });

  } catch (error) {
    console.error('❌ Feedback integration failed:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// Get learning analytics
export async function GET() {
  try {
    const analytics = await LearningSystemOrchestrator.getLearningAnalytics();

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Failed to get learning analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}