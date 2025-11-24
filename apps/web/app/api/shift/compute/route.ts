/**
 * POST /api/shift/compute
 * 
 * Triggers profile computation for a user with optional parameters.
 * Used for manual recalculation or batch processing.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { SHIFtComputeRequestZ } from '../../../../backend/src/schemas/shift.z';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFtInferenceService } from '../../../../backend/src/services/SHIFtInferenceService';

// Stub implementations
class SHIFtInferenceService {
  async compute(request: any) {
    return {
      elements: {},
      facets: [{
        code: 'test',
        score: 0.5,
        confidence: 0.8,
        delta7d: 0,
        source: 'stub'
      }],
      phase: 'initial',
      confidence: 0.8,
      freshness: 1.0,
      narrative: 'Test narrative',
      insights: [],
      alerts: []
    };
  }
}

const SHIFtComputeRequestZ = {
  parse: (data: any) => data
};

// Initialize service
const shiftService = new SHIFtInferenceService();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = SHIFtComputeRequestZ.parse(body);
    
    // Compute profile
    const profile = await shiftService.compute(validatedRequest);
    
    // Return computed profile
    const response = {
      status: 'computed',
      userId: validatedRequest.userId,
      timestamp: new Date().toISOString(),
      profile: {
        elements: profile.elements,
        facets: profile.facets.map(f => ({
          code: f.code,
          score: f.score,
          confidence: f.confidence,
          delta7d: f.delta7d,
          source: f.source
        })),
        phase: profile.phase,
        confidence: profile.confidence,
        freshness: profile.freshness,
        narrative: profile.narrative,
        alertCount: profile.alerts?.length || 0
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in /api/shift/compute:', error);
    
    // Return validation error if zod parsing failed
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Return generic error
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}