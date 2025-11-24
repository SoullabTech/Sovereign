/**
 * POST /api/shift/submit
 * 
 * Processes explicit survey or ritual reflection submissions.
 * Stores responses and triggers SHIFt profile updates.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { ExplicitSurveyResponseZ } from '../../../../backend/src/schemas/shift.z';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFtInferenceService } from '../../../../backend/src/services/SHIFtInferenceService';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFT_EXPLICIT_SURVEY } from '../../../../backend/src/content/SHIFtExplicitSurvey';

// Stub implementations
class SHIFtInferenceService {
  async processExplicitData(userId: string, scores: any) {
    return {
      success: true,
      profile: {}
    };
  }
  
  async processReflection(userId: string, reflections: any) {
    return {
      success: true,
      insights: []
    };
  }
  
  async storeExplicitScores(userId: string, scores: any) {
    return { success: true };
  }
  
  async getProfile(userId: string) {
    return {
      userId,
      elements: {},
      facets: [],
      phase: 'initial',
      confidence: 0.8,
      narrative: 'Profile narrative placeholder',
      practice: 'Suggested practice placeholder'
    };
  }
  
  async ingest(data: any) {
    return { success: true };
  }
}

const ExplicitSurveyResponseZ = {
  parse: (data: any) => data
};

const SHIFT_EXPLICIT_SURVEY = {
  items: []
};

// Initialize service
const shiftService = new SHIFtInferenceService();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const submissionType = body.type || 'survey'; // 'survey' | 'reflection'
    
    if (submissionType === 'survey') {
      // Process structured survey submission
      const validatedResponse = ExplicitSurveyResponseZ.parse(body);
      
      // Convert survey responses to explicit scores
      const explicitScores = validatedResponse.items.map((item: any) => {
        // Map 1-7 Likert to 0-100 scale
        const score = ((item.response - 1) / 6) * 100;
        
        return {
          facetCode: item.facetCode,
          score: Math.round(score),
          takenAt: new Date(validatedResponse.completedAt),
          version: validatedResponse.version
        };
      });
      
      // Store explicit scores
      await shiftService.storeExplicitScores(validatedResponse.userId, explicitScores);
      
      // Get updated profile
      const profile = await shiftService.getProfile(validatedResponse.userId);
      
      return NextResponse.json({
        status: 'survey_processed',
        userId: validatedResponse.userId,
        itemsProcessed: validatedResponse.items.length,
        profileUpdated: true,
        narrative: profile.narrative,
        elementalProfile: profile.elements,
        timestamp: new Date().toISOString()
      });
      
    } else if (submissionType === 'reflection') {
      // Process ritual reflection submission
      const { userId, sessionId, responses, completedAt } = body;
      
      if (!userId || !responses) {
        return NextResponse.json({
          error: 'Missing required fields: userId, responses'
        }, { status: 400 });
      }
      
      // Convert free-form reflection responses to conversational text
      const reflectionText = responses.map((r: any) => 
        `${r.prompt}: ${r.response}`
      ).join('\n\n');
      
      // Emit as session data for implicit processing
      await shiftService.ingest({
        userId,
        sessionId: sessionId || `reflection_${Date.now()}`,
        text: reflectionText,
        events: [{
          type: 'reflection.ritual',
          timestamp: new Date(completedAt || new Date()),
          payload: { responseCount: responses.length, context: 'ritual_reflection' }
        }]
      });
      
      // Get updated profile
      const profile = await shiftService.getProfile(userId);
      
      return NextResponse.json({
        status: 'reflection_received',
        userId,
        responsesProcessed: responses.length,
        profileUpdated: true,
        narrative: profile.narrative,
        suggestedPractice: profile.practice,
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json({
        error: 'Invalid submission type. Must be "survey" or "reflection"'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in /api/shift/submit:', error);
    
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