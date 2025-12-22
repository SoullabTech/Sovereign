/**
 * TALK MODE (DIALOGUE) - Peer Conversation Endpoint
 *
 * Voice Characteristics:
 * - Peer presence, not service provider
 * - 1-2 sentences typically
 * - No service language ("how can I help")
 * - Mirror, not lamp (reflect their truth)
 * - Real, grounded, matching user energy
 *
 * Implementation: lib/maia/talkModeVoice.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTalkModeVoiceInstructions } from '@/lib/maia/talkModeVoice';
import { getLLM } from '@/lib/ai/providerRouter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      userName,
      fieldContext,
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
        mode: 'talk',
        response: getDemoResponse(message),
        metadata: {
          userName: userName || 'friend',
          processingTime: 0,
          demoMode: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate Talk Mode system prompt
    const systemPrompt = getTalkModeVoiceInstructions(userName, fieldContext);

    // Get LLM instance (respects sovereignty routing)
    const llm = getLLM('chat'); // Uses Claude if ALLOW_ANTHROPIC_CHAT=true, else local

    // Generate response
    const startTime = Date.now();
    const response = await llm.generateText(message, {
      system: systemPrompt,
      maxTokens: 150, // Talk Mode: 1-2 sentences ~= 50-150 tokens
      temperature: 0.7,
    });
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      mode: 'talk',
      response: response.text,
      metadata: {
        userName: userName || 'friend',
        processingTime,
        fieldContext: fieldContext?.dominantElement || 'balanced',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[Talk Mode] Error:', error);

    // Graceful fallback
    return NextResponse.json({
      mode: 'talk',
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
function getDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hey') || lowerMessage.includes('hi')) {
    return "Hey.";
  }

  if (lowerMessage.includes('stuck') || lowerMessage.includes('exhausted')) {
    return "Yeah. That's real.";
  }

  if (lowerMessage.includes('better') || lowerMessage.includes('good')) {
    return "What shifted?";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('need')) {
    return "What's happening?";
  }

  // Default response
  return "I'm here.";
}

/**
 * Fallback responses when LLM fails
 */
function getFallbackResponse(error: any): string {
  return "I'm having a technical moment. Can you say that again?";
}
