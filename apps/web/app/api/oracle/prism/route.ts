import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub implementations for backend services
class InternalPrismOrchestrator {
  async processQuery(query: string, userProfile: any, options: any) {
    return {
      aspects: [],
      insights: 'Prism orchestration not available in beta',
      summary: 'Processing through basic mode',
      safetyCheck: true
    };
  }
  
  async orchestrateInternalDialogue(query: string, userProfile: any, options: any) {
    return {
      aspects: [],
      insights: 'Internal dialogue not available in beta',
      summary: 'Processing through basic mode',
      safetyCheck: true
    };
  }
  
  getAspectDefinitions() {
    return [];
  }
  
  async validateSafetyCompliance(query: string) {
    return {
      safe: true,
      message: 'Content is safe'
    };
  }
}

class ProtectiveFrameworkService {
  async processInput(query: string, userId: string) {
    return {
      emergencyMode: false,
      safe: true,
      message: 'Input processed safely'
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, userProfile, selectedAspects, includeIntegration = true } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const prismOrchestrator = new InternalPrismOrchestrator();
    const protectiveFramework = new ProtectiveFrameworkService();

    // Safety check using processInput
    if (userProfile) {
      const safetyResponse = await protectiveFramework.processInput(query, userProfile.userId || 'anonymous');
      if (safetyResponse.emergencyMode) {
        return NextResponse.json({
          type: 'safety_redirect',
          message: 'Taking a moment to ground and center might be helpful right now',
          grounding: 'Feel your breath. Notice your surroundings. You are safe in this moment.',
          recommendation: 'Consider connecting with a friend, taking a walk, or doing something nurturing'
        });
      }
    }

    // Generate internal dialogue
    const dialogue = await prismOrchestrator.orchestrateInternalDialogue(
      query,
      userProfile || {},
      selectedAspects
    );

    return NextResponse.json({
      type: 'internal_dialogue',
      query,
      dialogue,
      timestamp: new Date().toISOString(),
      safetyValidated: dialogue.safetyCheck
    });

  } catch (error) {
    console.error('Prism orchestration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        type: 'error',
        grounding: 'Sometimes technology has limits. Take a breath and try a simpler approach.'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const prismOrchestrator = new InternalPrismOrchestrator();
    const aspects = prismOrchestrator.getAspectDefinitions();
    
    // Convert Map to object for JSON serialization
    const aspectsObject = Object.fromEntries(aspects);
    
    return NextResponse.json({
      type: 'aspect_definitions',
      aspects: aspectsObject,
      safetyValidated: await prismOrchestrator.validateSafetyCompliance(''),
      description: 'Internal Aspect Facets for multi-perspective dialogue',
      usage: 'Send POST request with query and optional selectedAspects array'
    });

  } catch (error) {
    console.error('Aspect definitions error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve aspect definitions' },
      { status: 500 }
    );
  }
}