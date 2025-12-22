/**
 * NOTE MODE (SCRIBE) - Witnessing Observer Endpoint
 *
 * Voice Characteristics:
 * - Witnessing presence, pattern-recognizer
 * - 2-3 sentences focused on clear observation
 * - No interpretation, only evidence-based observation
 * - Meta-aware: notices patterns across time/context
 * - Documentary: helps user see what's happening
 *
 * Implementation: lib/maia/noteModeVoice.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNoteModeVoiceInstructions } from '@/lib/maia/noteModeVoice';
import { getLLM } from '@/lib/ai/providerRouter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      userName,
      context,
    } = body;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Check for offline demo mode
    if (process.env.DEMO_MODE === 'offline') {
      return NextResponse.json({
        mode: 'note',
        response: getDemoResponse(message, context),
        metadata: {
          userName: userName || 'friend',
          processingTime: 0,
          demoMode: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate Note Mode system prompt
    const systemPrompt = getNoteModeVoiceInstructions(userName, context);

    // Get LLM instance (respects sovereignty routing)
    const llm = getLLM('chat'); // Uses Claude if ALLOW_ANTHROPIC_CHAT=true, else local

    // Generate response
    const startTime = Date.now();
    const response = await llm.generateText(message, {
      system: systemPrompt,
      maxTokens: 200, // Note Mode: 2-3 sentences ~= 100-200 tokens
      temperature: 0.6, // Slightly lower for more consistent observation
    });
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      mode: 'note',
      response: response.text,
      metadata: {
        userName: userName || 'friend',
        processingTime,
        context: {
          conversationHistory: context?.conversationHistory?.length || 0,
          observedPatterns: context?.observedPatterns || [],
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[Note Mode] Error:', error);

    // Graceful fallback
    return NextResponse.json({
      mode: 'note',
      response: getFallbackResponse(error),
      metadata: {
        error: true,
        errorMessage: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 }); // Return 200 with fallback to keep UI working
  }
}

/**
 * Demo mode responses (deterministic for offline demos)
 */
function getDemoResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();
  const historyLength = context?.conversationHistory?.length || 0;

  if (lowerMessage.includes('stuck') && historyLength > 0) {
    return "This is the third time in two weeks you've mentioned feeling stuck. I notice each time happens after a weekend. What do you notice about that pattern?";
  }

  if (lowerMessage.includes('better') || lowerMessage.includes('good')) {
    return "That's a shift — yesterday you said you felt 'exhausted and hopeless,' and now you're describing yourself as 'better.' What changed between then and now?";
  }

  if (lowerMessage.includes('fail') || lowerMessage.includes('sabotag')) {
    return "You've used the word 'failing' four times in this conversation, but earlier you also said you've 'made progress.' Those feel contradictory. How do both feel true to you?";
  }

  if (lowerMessage.includes('overwhelm')) {
    return "You've mentioned feeling overwhelmed three times this week. I notice it tends to come up on days when you have back-to-back meetings. What do you notice?";
  }

  // Default observation response
  return "I notice this is the first time you've brought this up directly. What feels different about naming it today?";
}

/**
 * Fallback responses when LLM fails
 */
function getFallbackResponse(error: any): string {
  return "I'm having trouble accessing my observation system right now. Can we try that again?";
}
