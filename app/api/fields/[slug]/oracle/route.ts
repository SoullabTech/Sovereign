/**
 * Field Oracle — per-field MAIA endpoint
 *
 * Handles auth server-side so FieldMaiaCompanion doesn't need ORACLE_API_KEY.
 * Uses the field's maia.systemPromptBlock as the system prompt.
 * Calls Anthropic directly with the field persona.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { getFieldBySlug } from '@/lib/masters/registry';

export const dynamic = 'force-dynamic';

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

    const systemPrompt = field.maia.systemPromptBlock;

    // Build messages array from history + new message
    const messages: Message[] = [
      ...conversationHistory.slice(-12), // keep last 12 turns for context
      { role: 'user', content: message.trim() },
    ];

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'deep',
      systemPrompt,
      messages,
      maxTokens: 1024,
    });

    const reply = llmResponse.text;

    return NextResponse.json({ message: reply });
  } catch (err) {
    console.error('[FieldOracle] Error:', err);
    return NextResponse.json(
      { error: 'Oracle error' },
      { status: 500 }
    );
  }
}
