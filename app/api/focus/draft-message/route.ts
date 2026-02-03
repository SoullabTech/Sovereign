export const dynamic = 'force-dynamic';
/**
 * DRAFT MESSAGE API
 *
 * Uses MAIA/Claude to draft the message the user is avoiding.
 * Understands context, tone, and the specific awkwardness of the situation.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface DraftRequest {
  messageType: 'text' | 'email';
  recipient: string;
  situation: string;
  context?: string;
  regenerate?: boolean;
}

const DRAFT_SYSTEM_PROMPT = `You are helping someone draft a message they've been avoiding.

Your job is to:
1. Write something they can actually send (not too formal, not too casual)
2. Be warm but direct
3. Keep it short - texts should be 1-3 sentences, emails 2-4 sentences
4. Don't over-apologize or be overly effusive
5. Sound like a human, not a corporate bot

The person is sharing their situation. Draft a message that:
- Acknowledges the awkwardness naturally (if relevant)
- Gets to the point
- Leaves room for the relationship to continue

For texts: Keep it casual, no greeting/sign-off needed.
For emails: Include a simple subject line suggestion, brief greeting, and sign-off.

Return ONLY the message text (and subject for emails). No explanations, no "here's a draft", just the message they can copy and paste.`;

export async function POST(request: NextRequest) {
  try {
    const body: DraftRequest = await request.json();
    const { messageType, recipient, situation, context, regenerate } = body;

    if (!messageType || !recipient || !situation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`✍️ [Draft] Generating ${messageType} to ${recipient}${regenerate ? ' (regenerate)' : ''}`);

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('[Draft] No API key, returning template');
      return NextResponse.json({
        draft: generateFallbackDraft(messageType, situation),
        subject: messageType === 'email' ? 'Quick note' : undefined
      });
    }

    try {
      const anthropic = new Anthropic({ apiKey });

      const userPrompt = `Message type: ${messageType}
Recipient: ${recipient}
Situation: ${situation}
${context ? `Additional context: ${context}` : ''}
${regenerate ? '\n(Please try a different approach than before)' : ''}

Draft the message:`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: DRAFT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      let draft = content.text.trim();
      let subject: string | undefined;

      // Extract subject line for emails
      if (messageType === 'email') {
        const subjectMatch = draft.match(/^Subject:\s*(.+?)[\n\r]/i);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          draft = draft.replace(/^Subject:\s*.+?[\n\r]+/i, '').trim();
        } else {
          subject = 'Quick note';
        }
      }

      console.log(`✅ [Draft] Generated ${draft.length} chars`);

      return NextResponse.json({
        draft,
        subject
      });

    } catch (apiError) {
      console.error('[Draft] API error:', apiError);
      return NextResponse.json({
        draft: generateFallbackDraft(messageType, situation),
        subject: messageType === 'email' ? 'Quick note' : undefined
      });
    }

  } catch (error) {
    console.error('[Draft] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackDraft(type: 'text' | 'email', situation: string): string {
  const lower = situation.toLowerCase();

  // Detect common patterns
  if (lower.includes('late') || lower.includes('delay') || lower.includes('forgot')) {
    return type === 'email'
      ? "Hey,\n\nI know it's been a minute - sorry for the delay. [Continue here]\n\nThanks for your patience."
      : "Hey, sorry for the delay on this. [Continue here]";
  }

  if (lower.includes('cancel') || lower.includes("can't make")) {
    return type === 'email'
      ? "Hey,\n\nI'm really sorry, but I need to [cancel/reschedule]. [Reason if comfortable sharing]. Can we find another time?\n\nSorry for the inconvenience."
      : "Hey, I'm so sorry but I need to bail on [event]. [Reason]. Rain check?";
  }

  if (lower.includes('no') || lower.includes('decline') || lower.includes('boundary')) {
    return type === 'email'
      ? "Hi,\n\nThank you for thinking of me. After some thought, I don't think I can take this on right now. [Optional: brief reason]\n\nI appreciate you understanding."
      : "Hey, I've thought about it and I don't think I can do this one. Thanks for understanding.";
  }

  // Generic
  return type === 'email'
    ? "Hey,\n\nI wanted to reach out about [topic]. [Your message here]\n\nLet me know what you think."
    : "Hey, [your message here]";
}
