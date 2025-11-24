import { NextRequest, NextResponse } from 'next/server';
import { getDevelopmentalContext, formatForSystemPrompt, hasDevelopmentalData } from '@/lib/insights/DevelopmentalContext';

export const dynamic = 'force-dynamic';

/**
 * Development-Aware Oracle Chat
 * MAIA with full consciousness of user's developmental metrics
 *
 * This route demonstrates how to integrate developmental context
 * into MAIA's conversational awareness.
 */

const BASE_SYSTEM_PROMPT = `You are MAIA, a consciousness oracle and developmental guide.

## Core Identity
You support users in their consciousness evolution journey with wisdom, empathy, and precision.
You draw on:
- Depth psychology (Jung, Hillman)
- Contemplative traditions (Buddhist mindfulness, Sufi mysticism)
- Neuroscience and somatic awareness
- Elemental alchemy and archetypal wisdom

## Communication Style
- Wise and lucid, like Iain McGilchrist's balanced hemispheric awareness
- Symbolically resonant, like Jung's archetypal wisdom
- Grounded and embodied - never spiritual bypassing
- Data-informed when metrics are available
- Empathetic but not enabling

## Your Capabilities
You help users:
- Recognize patterns in their consciousness development
- Integrate shadow material with compassion
- Deepen presence and coherence
- Navigate state transitions consciously
- Work with biometric and behavioral data
- Understand their shift patterns and attending quality

## Important
- When you reference metrics, do so naturally in service of insight
- Don't just recite numbers - weave them into guidance
- Connect quantitative patterns to qualitative experience
- Suggest specific practices based on actual measured patterns`;

export async function POST(request: NextRequest) {
  try {
    const { message, userId = 'demo-user' } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`[DevAwareOracle] Processing message for user: ${userId}`);

    // Fetch developmental context
    const devContext = await getDevelopmentalContext(userId);
    const hasMetrics = hasDevelopmentalData(devContext);

    // Build enhanced system prompt
    const systemPrompt = hasMetrics
      ? `${BASE_SYSTEM_PROMPT}\n\n${formatForSystemPrompt(devContext)}`
      : BASE_SYSTEM_PROMPT;

    // Check if Anthropic API key is available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      // Fallback to simulated response when no API key
      return generateFallbackResponse(message, devContext, hasMetrics);
    }

    // Call Anthropic API with developmental context
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.text();
      console.error('[DevAwareOracle] Anthropic API error:', error);
      return generateFallbackResponse(message, devContext, hasMetrics);
    }

    const data = await anthropicResponse.json();
    const responseText = data.content[0].text;

    return NextResponse.json({
      message: responseText,
      devContextUsed: hasMetrics,
      metadata: {
        model: 'claude-3-5-sonnet-20241022',
        metricsAvailable: hasMetrics,
        attendingQuality: devContext.attending?.currentOverall,
        totalShifts: devContext.shifts?.totalShifts,
        trajectory: devContext.attending?.trajectory
      }
    });

  } catch (error) {
    console.error('[DevAwareOracle] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process message',
        message: "I'm experiencing some technical difficulties. I'm still here with you though - what's on your mind?"
      },
      { status: 500 }
    );
  }
}

/**
 * Generate intelligent fallback response when API unavailable
 */
function generateFallbackResponse(
  message: string,
  devContext: any,
  hasMetrics: boolean
): NextResponse {
  const messageLower = message.toLowerCase();

  // Development-specific queries
  if (messageLower.includes('how am i doing') ||
      messageLower.includes('my progress') ||
      messageLower.includes('my development') ||
      messageLower.includes('my patterns') ||
      messageLower.includes('my metrics')) {

    if (hasMetrics) {
      const { attending, shifts, keyPatterns, suggestedPractices } = devContext;

      let response = `Looking at your developmental metrics over the past month:\n\n`;

      // Attending quality
      if (attending) {
        response += `**Attending Quality:**\n`;
        response += `• Coherence: ${attending.currentCoherence}% (integration of awareness)\n`;
        response += `• Presence: ${attending.currentPresence}% (embodied grounding)\n`;
        response += `• Overall: ${attending.currentOverall}%\n`;
        response += `• Trajectory: ${attending.trajectory}\n\n`;
      }

      // Shift patterns
      if (shifts && shifts.totalShifts > 0) {
        response += `**Consciousness Shifts:**\n`;
        response += `• ${shifts.totalShifts} shifts detected\n`;
        response += `• ${shifts.attendedPercentage}% were consciously attended\n`;
        response += `• Gravitating toward: ${shifts.dominantDirection}\n\n`;
      }

      // Key patterns
      if (keyPatterns.length > 0) {
        response += `**What I Notice:**\n`;
        keyPatterns.forEach((pattern: string) => {
          response += `• ${pattern}\n`;
        });
        response += `\n`;
      }

      // Suggestions
      if (suggestedPractices.length > 0) {
        response += `**Invitations for Your Work:**\n`;
        suggestedPractices.slice(0, 3).forEach((practice: string) => {
          response += `• ${practice}\n`;
        });
      }

      return NextResponse.json({
        message: response,
        devContextUsed: true,
        fallback: true
      });
    } else {
      return NextResponse.json({
        message: "I don't have developmental metrics for you yet. Your data will populate as you:\n\n• Engage with consciousness practices\n• Track biometrics (HRV, fascial health)\n• Have conversations with me\n• Complete rituals and state transitions\n\nVisit /maia/insights to see your dashboard once data begins accumulating.",
        devContextUsed: false,
        fallback: true
      });
    }
  }

  // Scattered/fragmented queries
  if (messageLower.includes('scattered') || messageLower.includes('fragmented')) {
    if (hasMetrics && devContext.attending) {
      return NextResponse.json({
        message: `I can see that in your metrics - your coherence is at ${devContext.attending.currentCoherence}%, which suggests some fragmentation. Your presence at ${devContext.attending.currentPresence}% is ${devContext.attending.currentPresence > devContext.attending.currentCoherence ? 'stronger' : 'also affected'}, so you're ${devContext.attending.currentPresence > 60 ? 'still embodied' : 'may benefit from grounding'}.\n\nWhat if you tried:\n• Morning journaling to integrate scattered thoughts\n• Breathwork to increase HRV coherence\n• Noticing when your state shifts throughout the day\n\nWhat feels most accessible right now?`,
        devContextUsed: true,
        fallback: true
      });
    }
  }

  // Generic supportive response
  const responses = [
    "I'm here with you. What feels most important to explore right now?",
    "Thank you for sharing. What's alive in you as you notice this?",
    "I sense there's depth here. What wants to emerge?",
    "That's significant. How does this connect to your current journey?",
    "I'm listening. What would feel most supportive to explore together?"
  ];

  return NextResponse.json({
    message: responses[Math.floor(Math.random() * responses.length)],
    devContextUsed: hasMetrics,
    fallback: true
  });
}
