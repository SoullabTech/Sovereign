export const dynamic = 'force-dynamic';
/**
 * DRAFT MESSAGE API
 *
 * Uses MAIA/Claude to draft the message the user is avoiding.
 * Understands context, tone, and the specific awkwardness of the situation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { logAction, checkThreshold, type ThresholdCheck } from '@/lib/focus/weightTracking';

// Helper to map threshold check to API response format
function mapStewardship(check: ThresholdCheck) {
  return {
    threshold: check.level === 'none' ? 'none' :
               check.level === 'acknowledgment' ? 'acknowledgment' :
               check.level === 'invitation' ? 'invitation' : 'pause',
    weeklyWeight: check.currentWeight,
    projectedWeight: check.projectedWeight,
    tier: check.tier,
  };
}

interface DraftRequest {
  messageType: 'text' | 'email';
  recipient: string;
  situation: string;
  context?: string;
  regenerate?: boolean;
  memberId?: string; // For weight tracking
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

    try {
      const userPrompt = `Message type: ${messageType}
Recipient: ${recipient}
Situation: ${situation}
${context ? `Additional context: ${context}` : ''}
${regenerate ? '\n(Please try a different approach than before)' : ''}

Draft the message:`;

      const llmResponse = await getLLMProvider().generateSimple({
        tier: 'core',
        systemPrompt: DRAFT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
        maxTokens: 300,
      });

      let draft = llmResponse.text.trim();
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

      // Log weight for AI draft (weight = 3, real Claude API cost)
      let stewardship: ReturnType<typeof mapStewardship> | null = null;
      if (body.memberId) {
        try {
          await logAction(body.memberId, 'ai_draft', {
            source: 'avoidance-breaker',
            metadata: { messageType, recipient }
          });
          // Get updated threshold after logging
          const check = await checkThreshold(body.memberId, 'ai_draft');
          stewardship = mapStewardship(check);
        } catch (weightError) {
          console.warn('[Draft] Weight logging skipped:', weightError);
        }
      }

      return NextResponse.json({
        draft,
        subject,
        stewardship,
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
