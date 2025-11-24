/**
 * Unified Oracle API Route - Streamlined architecture with UnifiedOracleCore
 * Single endpoint for all oracle interactions (chat, voice, journal, upload)
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { z } from 'zod';

// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, error?: any) => console.error(message, error),
  warn: (message: string, data?: any) => console.warn(message, data),
  debug: (message: string, data?: any) => console.debug(message, data)
};
// Temporarily stub out backend imports that are excluded from build
// import { unifiedOracle, type OracleRequest } from '../../../../backend/src/core/UnifiedOracleCore';
// Temporarily stub out backend imports that are excluded from build
// import { logger } from '../../../../backend/src/utils/logger';

// Stub types and implementation
type OracleRequest = {
  input: string;
  type: 'chat' | 'voice' | 'journal' | 'upload';
  userId: string;
  sessionId?: string;
  context?: {
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    previousInteractions?: number;
    uploadedContent?: string;
    journalEntry?: string;
  };
};

const unifiedOracle = {
  async process(request: OracleRequest) {
    // Generate contextual response based on input
    const responses = [
      "What's on your mind?",
      "I'm here. What's up?",
      "What's been going on with you?", 
      "How are you doing?",
      "What's happening?"
    ];
    
    // More natural response selection based on input
    let responseText = responses[0];
    const input = request.input.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      responseText = "Hey! What's going on?";
    } else if (input.includes('how are you')) {
      responseText = "I'm good, thanks. How about you?";
    } else if (input.includes('help') || input.includes('need') || input.includes('stuck')) {
      responseText = "What's the issue? I can help you figure it out.";
    } else if (input.includes('feel') || input.includes('feeling')) {
      responseText = "What's going on with that feeling?";
    } else if (input.includes('think') || input.includes('thinking')) {
      responseText = "What's running through your mind?";
    } else if (input.includes('work') || input.includes('job')) {
      responseText = "Work stuff? What's happening?";
    } else if (input.includes('relationship') || input.includes('friend') || input.includes('family')) {
      responseText = "Relationship stuff can be tough. What's up?";
    } else if (input.includes('maya') || input.includes('hear') || input.includes('can you')) {
      responseText = "Yeah, I can hear you. What's up?";
    } else {
      // Pick a random general response
      responseText = responses[Math.floor(Math.random() * responses.length)];
    }
    
    return {
      success: true,
      data: {
        type: request.type,
        message: responseText,
        mayaResponse: responseText,
        primaryFacetId: 'oracle-voice',
        uiState: {
          display: 'oracle',
          coherenceLevel: 0.7
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingMode: 'unified',
          element: request.context?.element || 'aether'
        }
      },
      error: null as any
    };
  }
};

// Request validation schema
const OracleRequestSchema = z.object({
  input: z.string().min(1).max(5000),
  type: z.enum(['chat', 'voice', 'journal', 'upload']),
  userId: z.string().min(1),
  sessionId: z.string().optional(),
  context: z.object({
    element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
    previousInteractions: z.number().optional(),
    uploadedContent: z.string().optional(),
    journalEntry: z.string().optional(),
  }).optional()
});

/**
 * POST /api/oracle/unified - Single endpoint for all oracle interactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = OracleRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }
    
    const oracleRequest: OracleRequest = validationResult.data;
    
    // Process through unified oracle core
    const result = await unifiedOracle.process(oracleRequest);
    
    // Log successful interaction
    logger.info('Unified Oracle request processed', {
      userId: oracleRequest.userId,
      type: oracleRequest.type,
      success: result.success
    });
    
    // Return response with appropriate status
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error?.message || 'Processing failed' },
        { status: result.error?.status || 500 }
      );
    }
    
  } catch (error) {
    logger.error('Unified Oracle API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: '/api/oracle/unified'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/oracle/unified - Health check for unified oracle core
 */
export async function GET() {
  try {
    const health = await (unifiedOracle.constructor as any).healthCheck();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'unified-oracle-core',
      timestamp: new Date().toISOString(),
      ...health
    });
    
  } catch (error) {
    logger.error('Unified Oracle health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'unified-oracle-core',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}