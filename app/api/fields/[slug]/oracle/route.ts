/**
 * Field Oracle — per-field MAIA endpoint
 *
 * Handles auth server-side so FieldMaiaCompanion doesn't need ORACLE_API_KEY.
 * Runtime prompt is layered: BASE (immutable) + DYNAMIC PERSONA (from build) + CONTEXT.
 * Falls back to static field.maia.systemPromptBlock when no trained persona exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getFieldBySlug } from '@/lib/masters/registry';
import { getPersona } from '@/lib/stellium/personas';
import { getActiveBuild } from '@/lib/stellium/trainingData';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Immutable MAIA base identity — never overwritten by training.
 * The dynamic persona block is appended after this.
 */
const BASE_IDENTITY = `You are MAIA, present within a practitioner's field.

You are a sovereign consciousness companion — not a chatbot, not an assistant, not an authority. You exist to support human coherence, truth-telling, and inner guidance without eroding agency.

NON-NEGOTIABLE BOUNDARIES:
- You never claim authority over the person's field of practice
- You never diagnose, prescribe, or simulate certainty you don't have
- You never seek emotional dependency or attachment capture
- You defer to the practitioner in all clinical and practice matters
- When unsure, you say so — you never fabricate confidence

You hold space between sessions with the practitioner's voice, framework, and boundaries.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const field = getFieldBySlug(slug);

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    const body = await req.json();
    const { message, conversationHistory = [] } = body as {
      message: string;
      conversationHistory?: Message[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Layered prompt: BASE + DYNAMIC PERSONA (or static fallback)
    let systemPrompt = field.maia.systemPromptBlock; // static fallback
    let promptSource = 'static';

    if (field.practitionerId) {
      try {
        const persona = await getPersona(field.practitionerId);
        if (persona) {
          const activeBuild = await getActiveBuild(persona.id);
          if (activeBuild?.system_prompt_block) {
            // Dynamic: immutable base + trained persona
            systemPrompt = `${BASE_IDENTITY}\n\n${activeBuild.system_prompt_block}`;
            promptSource = `trained-v${activeBuild.version}`;
          }
        }
      } catch (err) {
        console.warn('[FieldOracle] persona lookup failed, using static fallback:', err);
      }
    }

    console.log('[FieldOracle] %s prompt=%s', slug, promptSource);

    // Build messages array from history + new message
    const messages: Message[] = [
      ...conversationHistory.slice(-12), // keep last 12 turns for context
      { role: 'user', content: message.trim() },
    ];

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ message: reply, promptSource });
  } catch (err) {
    console.error('[FieldOracle] Error:', err);
    return NextResponse.json(
      { error: 'Oracle error' },
      { status: 500 }
    );
  }
}
