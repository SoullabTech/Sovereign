/**
 * Capsule Generation API
 *
 * Uses AI to extract meaningful wisdom capsules from a conversation.
 *
 * POST /api/capsules/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CapsuleSuggestion {
  title: string;
  insight: string;
  themes: string[];
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 messages required' },
        { status: 400 }
      );
    }

    // Format conversation for analysis
    const conversationText = messages
      .map((m: Message) => `${m.role === 'user' ? 'Human' : 'MAIA'}: ${m.content}`)
      .join('\n\n');

    // Use Claude to extract capsules
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a wisdom extractor. Your job is to identify the most meaningful insights from a conversation between a human and MAIA (a consciousness companion).

Extract 1-3 "wisdom capsules" - distilled insights that capture something true and valuable that emerged in the conversation.

Each capsule should be:
- Concise (1-2 sentences)
- Personal but universal (applicable to the human's situation but resonant for others)
- Actionable or reflective (something to remember or act on)

Respond ONLY with valid JSON in this exact format:
{
  "capsules": [
    {
      "title": "Short title (3-6 words)",
      "insight": "The distilled wisdom (1-2 sentences)",
      "themes": ["theme1", "theme2"],
      "element": "fire|water|earth|air|aether",
      "confidence": 0.8
    }
  ]
}

Element meanings:
- fire: action, passion, transformation, courage
- water: emotion, intuition, flow, healing
- earth: stability, body, practice, grounding
- air: thought, communication, clarity, perspective
- aether: spirit, meaning, connection, wholeness

Only extract capsules if there's genuinely meaningful content. It's okay to return an empty array if the conversation is casual or surface-level.`,
      messages: [
        {
          role: 'user',
          content: `Extract wisdom capsules from this conversation:\n\n${conversationText}`
        }
      ]
    });

    // Parse the response
    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const capsules: CapsuleSuggestion[] = parsed.capsules || [];

      return NextResponse.json({
        success: true,
        capsules,
        sessionId,
      });
    } catch (parseError) {
      console.error('[Capsules] Parse error:', parseError);
      return NextResponse.json({
        success: true,
        capsules: [],
        sessionId,
        note: 'No meaningful capsules extracted from this conversation',
      });
    }
  } catch (error) {
    console.error('[Capsules] Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate capsules' },
      { status: 500 }
    );
  }
}
