/**
 * GET /api/shift/profile?userId=U
 * 
 * Returns the current SHIFt profile for a user.
 * Includes elemental profile, facet scores, phase inference, and narrative.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { SHIFtInferenceService } from '../../../../backend/src/services/SHIFtInferenceService';

// Stub implementation
class SHIFtInferenceService {
  async getProfile(userId: string) {
    return {
      userId,
      elements: {},
      facets: [],
      phase: 'initial',
      confidence: 0.8,
      narrative: 'Test profile'
    };
  }
}

// Initialize service
const shiftService = new SHIFtInferenceService();

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        error: 'userId parameter is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Get profile
    const profile = await shiftService.getProfile(userId);
    
    // Return profile with cache headers
    const response = NextResponse.json(profile);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5min cache
    response.headers.set('Content-Type', 'application/json');
    
    return response;
    
  } catch (error) {
    console.error('Error in /api/shift/profile:', error);
    
    // Return fallback profile
    const fallbackProfile = {
      elements: {
        fire: 50,
        earth: 50,
        water: 50,
        air: 50,
        aether: 50,
        confidence: 0.3
      },
      facets: [
        { code: 'F1_Meaning', label: 'Inspired purpose', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'F2_Courage', label: 'Willingness to face truth / take action', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'E1_Coherence', label: 'Life-path coherence / "crystal" clarity', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'E2_Grounding', label: 'Reliable routines / embodied stability', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'W1_Attunement', label: 'Emotional range & regulation', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'W2_Belonging', label: 'Felt support / reciprocity', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'A1_Reflection', label: 'Meta-cognition / sense-making', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'A2_Adaptability', label: 'Reframing / cognitive flexibility', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'AE1_Values', label: 'Values/virtue alignment', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'AE2_Fulfillment', label: 'Narrative wholeness / life-satisfaction', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'C1_Integration', label: 'Practice of integrating insights', score: 50, confidence: 0.3, delta7d: 0 },
        { code: 'C2_Integrity', label: 'Word–deed alignment / congruence', score: 50, confidence: 0.3, delta7d: 0 }
      ],
      phase: {
        primary: 'initiation',
        primaryConfidence: 0.3,
        secondary: 'grounding',
        secondaryConfidence: 0.2
      },
      narrative: 'Just beginning to understand your journey. Keep engaging to reveal deeper patterns.',
      practice: {
        title: 'Presence Practice',
        steps: [
          'Pause whatever you\'re doing',
          'Take three conscious breaths',
          'Notice five things you can sense right now',
          'Return to your activity with fresh attention'
        ]
      }
    };
    
    return NextResponse.json(fallbackProfile, { status: 200 });
  }
}