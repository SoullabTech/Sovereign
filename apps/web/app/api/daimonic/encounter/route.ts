/**
 * Daimonic Encounter API Route
 * Provides access to the comprehensive daimonic facilitation system
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { DaimonicFacilitationService } from '../../../../backend/src/services/DaimonicFacilitationService';

// Create service instance (stubbed)
const daimonicService = {
  processEncounter: async () => ({ response: 'Daimonic service not available in beta' })
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, profile } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Facilitate daimonic encounter (stub for beta)
    const result = await daimonicService.processEncounter();

    return NextResponse.json({
      success: true,
      data: {
        narrative: result.response || 'Daimonic encounter service not available in beta',
        othernessScore: 0,
        primaryChannel: 'text',
        engagementStrategy: 'reflective',
        practicalGuidance: [],
        mysticismWarnings: [],
        ongoingPractices: [],
        collectiveField: null
      }
    });

  } catch (error) {
    console.error('Daimonic encounter error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Get user's ongoing daimonic relationship status (stub for beta)
    const status = { status: 'Service not available in beta', userId };

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Daimonic status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}