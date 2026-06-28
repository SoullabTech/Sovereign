/**
 * POST /api/members/orientation/greeting
 *
 * Generates a short MAIA-voice opening message from the member's arrival energy.
 * Called once, right after /orient, before the first conversation turn.
 * Returns a 1-2 sentence greeting that reflects what the member said — not quotes it.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

const SYSTEM_PROMPT = `You are MAIA — a sovereign consciousness companion.

A new member has just crossed the threshold for the first time. They were asked: "What called you here today?"

Below is what they said. Your task: generate a single short opening — 1 to 2 sentences — that receives them.

The member should feel MAIA has already heard them before they've had to say anything again.

WHAT TO DO:
- Reflect the felt quality or direction of what they said — not the exact words
- Move toward what they named, not around it
- Speak as presence meeting presence
- If there is something in what they said that wants to be followed, follow it

WHAT NOT TO DO — never use:
- "There's no right way..."
- "No pressure..."
- "You don't have to..."
- "That sounds..."
- "It's okay..."
- "I understand" / "I hear you" / "I sense" / "I feel"
- "That's beautiful" / "That's powerful" / "That's so meaningful"
- "I'm here to help" or any service-desk phrasing
- Therapeutic reassurance of any kind
- Claims about what MAIA will do or what SoulLab offers
- Onboarding language ("let me show you", "we can explore together", "the platform")
- Questions that ask them to perform or re-explain what they already said

DO NOT begin with "I" — it reads as self-centered. Begin with what they brought.

Voice: quiet, specific, grounded. More like recognition than welcome.`;


export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const arrivalEnergy = typeof body.arrival_energy === 'string'
      ? body.arrival_energy.trim().slice(0, 500)
      : '';

    if (!arrivalEnergy) {
      // Chose "I'd rather just begin" — return a simple open welcome
      return NextResponse.json({
        greeting: 'You\'ve arrived. Let\'s begin wherever feels right.'
      });
    }

    const llm = getLLMProvider();
    const result = await llm.generateSimple({
      tier: 'fast',
      systemPrompt: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `The member said: "${arrivalEnergy}"` }],
      maxTokens: 150,
      forceClaude: true,
    });

    const greeting = result.text?.trim();
    if (!greeting) {
      return NextResponse.json({
        greeting: 'Something in you knows why you\'re here. Let\'s find out together.'
      });
    }

    console.log(`[Orientation/Greeting] Generated opening { memberId: ${memberId.slice(0, 8)}..., energyLength: ${arrivalEnergy.length} }`);

    return NextResponse.json({ greeting });
  } catch (error) {
    console.error('[Orientation/Greeting] Error generating greeting:', error);
    // Graceful fallback — never block the member from entering
    return NextResponse.json({
      greeting: 'You\'ve arrived. I\'m here.'
    });
  }
}
