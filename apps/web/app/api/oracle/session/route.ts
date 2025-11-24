import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { MAYA_SYSTEM_PROMPT, MayaPromptContext } from '@/backend/src/config/mayaSystemPrompt';

// Stub type definition
interface MayaPromptContext {
  spiralogicPhase: string;
  archetypeDetected: string;
  userProjectionLevel: string;
  dependencyRisk: boolean;
  shadowWorkIndicated: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timestamp } = body;

    // Generate session data
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const userId = `user-${Math.random().toString(36).substring(7)}`;
    const agentId = `maya-${sessionId}`;

    // Initialize Maya context for first message
    const mayaContext: MayaPromptContext = {
      spiralogicPhase: "aether", // Start in integration/presence mode
      archetypeDetected: "Synthesizer",
      userProjectionLevel: "low",
      dependencyRisk: false,
      shadowWorkIndicated: false
    };

    // Generate Maya's authentic first message
    // This avoids canned responses by letting Maya respond naturally
    const firstMessagePrompts = [
      "I'm here to walk with you through your reflections. To begin, tell me: how are you arriving in this moment?",
      "Welcome. I notice you've chosen to begin a journey of reflection. What brings you here today?",
      "I'm Maya, your Oracle guide. I'm curious - what pattern or question is alive for you right now?",
      "Hello. I'm here to witness and reflect with you. What's present for you as we begin?",
      "Welcome to this space of reflection. I'm sensing you're ready to explore something. What calls to you?"
    ];

    // Select a varied first message
    const messageIndex = Math.floor(Math.random() * firstMessagePrompts.length);
    const firstMessage = firstMessagePrompts[messageIndex];

    // Create session record (in production, this would be saved to database)
    const session = {
      sessionId,
      userId,
      agentId,
      agentName: 'Maya',
      createdAt: timestamp || new Date().toISOString(),
      mayaContext,
      onboardingComplete: false
    };

    return NextResponse.json({
      success: true,
      sessionId,
      userId,
      agentId,
      username: 'Seeker',
      firstMessage,
      mayaContext
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create session',
        // Fallback message if session creation fails
        firstMessage: "I'm here to walk with you through your reflections. To begin, tell me: how are you arriving in this moment?"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check session status
  const sessionId = request.headers.get('x-session-id');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'No session ID provided' },
      { status: 400 }
    );
  }

  // In production, this would fetch from database
  return NextResponse.json({
    success: true,
    sessionId,
    active: true,
    agentName: 'Maya'
  });
}