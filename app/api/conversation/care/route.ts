/**
 * CARE MODE (COUNSEL) - Therapeutic Guide Endpoint
 *
 * Voice Characteristics:
 * - Therapeutic companion, wise counselor
 * - 2-4 sentences with therapeutic architecture
 * - Service language IS appropriate ("How can I help?")
 * - Pattern-naming, interpretation, shadow work welcome
 * - Trauma-informed: pacing, boundaries, safety first
 *
 * Implementation: lib/maia/careModeVoice.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCareModeVoiceInstructions } from '@/lib/maia/careModeVoice';
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
        mode: 'care',
        response: getDemoResponse(message),
        metadata: {
          userName: userName || 'friend',
          processingTime: 0,
          demoMode: true,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate Care Mode system prompt
    const systemPrompt = getCareModeVoiceInstructions(userName, context);

    // Get LLM instance (respects sovereignty routing)
    const llm = getLLM('chat'); // Uses Claude if ALLOW_ANTHROPIC_CHAT=true, else local

    // Generate response
    const startTime = Date.now();
    const response = await llm.generateText(message, {
      system: systemPrompt,
      maxTokens: 250, // Care Mode: 2-4 sentences ~= 150-250 tokens
      temperature: 0.7,
    });
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      mode: 'care',
      response: response.text,
      metadata: {
        userName: userName || 'friend',
        processingTime,
        context: {
          sessionHistory: context?.sessionHistory?.length || 0,
          currentThemes: context?.currentThemes || [],
          traumaAware: context?.traumaAwareness || true,
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[Care Mode] Error:', error);

    // Graceful fallback
    return NextResponse.json({
      mode: 'care',
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

  if (lowerMessage.includes('help') || lowerMessage.includes('need')) {
    return "I'm here. What's happening for you right now? Take your time — we can go at whatever pace feels right.";
  }

  if (lowerMessage.includes('sabotag') || lowerMessage.includes('failing')) {
    return "I hear a lot of self-judgment in what you're saying. What if we looked at what you're learning instead? Failure is often just feedback in disguise. What has each attempt taught you?";
  }

  if (lowerMessage.includes('shut down') || lowerMessage.includes('close')) {
    return "That sounds like a protective pattern — shutting down before you can be hurt. How long have you noticed yourself doing this? And what do you imagine it's protecting you from?";
  }

  if (lowerMessage.includes('overwhelm')) {
    return "Overwhelm can be a sign your system is processing a lot. What specifically feels overwhelming — thoughts, emotions, tasks, or something else? And is it safe for you to feel this right now?";
  }

  // Default therapeutic response
  return "I'm hearing you. This feels important. Can you tell me more about what's underneath that for you?";
}

/**
 * Fallback responses when LLM fails
 */
function getFallbackResponse(error: any): string {
  return "I'm experiencing a technical issue, but I'm still here with you. Would you like to try saying that again, or shift to something else?";
}
