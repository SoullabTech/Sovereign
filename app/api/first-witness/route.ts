export const dynamic = 'force-dynamic';

/**
 * POST /api/first-witness — The First Witness (standalone experiment).
 *
 * Two modes:
 *   · { mode: 'converse', messages }            → the witness's next turn in the conversation.
 *   · { mode: 'reflect', messages, practice? }  → "The Living Architecture of <practice>, v0.1".
 *
 * No auth, no provisioning, NO PERSISTENCE — a standalone conversation that produces one
 * artifact, held only in the caller's browser. Sovereign LLM only (getLLMProvider → Claude,
 * Ollama fallback). Records nothing to any store. The reflection witnesses the architecture
 * of the work; it never concludes who the person is (see witnessPrompts.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  WITNESS_SYSTEM_PROMPT,
  REFLECTION_SYSTEM_PROMPT,
  buildReflectionPrompt,
} from '@/lib/firstWitness/witnessPrompts';

type Msg = { role: 'user' | 'assistant'; content: string };

function sanitize(messages: unknown): Msg[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content).slice(0, 6000) }))
    .slice(-40);
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const mode = body?.mode === 'reflect' ? 'reflect' : 'converse';
  const messages = sanitize(body?.messages);

  try {
    if (mode === 'reflect') {
      if (messages.length === 0) {
        return NextResponse.json({ error: 'There is nothing to reflect on yet.' }, { status: 400 });
      }
      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'Practitioner' : 'Witness'}: ${m.content}`)
        .join('\n\n');
      const practice = typeof body?.practice === 'string' ? body.practice.slice(0, 120) : undefined;
      const llm = await getLLMProvider().generateSimple({
        tier: 'deep',
        systemPrompt: REFLECTION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildReflectionPrompt(transcript, practice) }],
      });
      return NextResponse.json({ artifact: (llm.text || '').trim() });
    }

    // converse — the witness's next turn. Claude requires the transcript to start with a
    // user message, so drop any leading assistant turn (the page's opening line).
    const firstUser = messages.findIndex((m) => m.role === 'user');
    const convo: Msg[] = firstUser >= 0 ? messages.slice(firstUser) : [];
    const claudeMessages: Msg[] =
      convo.length > 0
        ? convo
        : [{ role: 'user', content: 'Please begin by inviting me into what is alive in my work right now.' }];
    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: WITNESS_SYSTEM_PROMPT,
      messages: claudeMessages,
    });
    return NextResponse.json({ reply: (llm.text || '').trim() });
  } catch (err: any) {
    console.error('[first-witness] error', err?.message);
    return NextResponse.json({ error: 'The witness lost the thread — please try again.' }, { status: 502 });
  }
}
