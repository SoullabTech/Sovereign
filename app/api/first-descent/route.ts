/**
 * First Descent — Generate Reply
 *
 * POST /api/first-descent
 *
 * Accepts the user's origin input and returns MAIA's constrained
 * threshold reply. Does NOT persist — that's /api/first-descent/complete.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { MultiLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  getFirstDescentSystemPrompt,
  getPromptVersion,
  validateDescentReply,
  getRetryInstruction,
} from '@/lib/maia/prompts/firstDescentPrompt';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { originInput, userName } = body;

    if (!originInput || typeof originInput !== 'string' || originInput.trim().length < 5) {
      return NextResponse.json(
        { error: 'hold on' },
        { status: 400 }
      );
    }

    const trimmedInput = originInput.trim().slice(0, 2000); // Cap input length
    const systemPrompt = getFirstDescentSystemPrompt(userName);
    const promptVersion = getPromptVersion();

    const llm = new MultiLLMProvider();

    // First attempt
    let response = await llm.generate({
      systemPrompt,
      userInput: trimmedInput,
      level: 'CORE',
      maxTokensOverride: 300,
    });

    let reply = response.text.trim();
    let validation = validateDescentReply(reply);

    // Retry once if validation fails
    if (!validation.valid) {
      console.warn('[FirstDescent] First attempt failed validation:', validation.issues);

      const retryPrompt = systemPrompt + '\n\n' + getRetryInstruction(validation.issues);
      response = await llm.generate({
        systemPrompt: retryPrompt,
        userInput: trimmedInput,
        level: 'CORE',
        maxTokensOverride: 300,
      });

      reply = response.text.trim();
      validation = validateDescentReply(reply);

      if (!validation.valid) {
        console.warn('[FirstDescent] Retry also failed validation:', validation.issues);
        // Use the retry result anyway — it's likely close enough
      }
    }

    return NextResponse.json({
      reply,
      promptVersion,
      modelUsed: response.model,
      validation: {
        valid: validation.valid,
        wordCount: reply.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error('[FirstDescent] Generate error:', error);
    return NextResponse.json(
      { error: 'hold on' },
      { status: 500 }
    );
  }
}
