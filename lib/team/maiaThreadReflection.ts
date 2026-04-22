/**
 * MAIA Thread Reflection — stateless, server-composed primitive.
 *
 * Invoked by POST /api/ideas/[id]/ask-maia when a member clicks "Ask MAIA"
 * inside an idea workspace. The server composes a tight bounded context
 * (title + framing + last decision + last 3–4 blocks) and this primitive
 * returns a 2–4 sentence reflection that is persisted in-thread as a
 * `maia_reflection` block.
 *
 * Design:
 *   - Haiku 4.5 — the work is narrow, disciplined, and format-bound
 *   - No streaming, no state, no conversation machinery
 *   - The system prompt carries the doctrinal voice
 *   - The user does not author the prompt; the server does
 *
 * Modeled on `maiaReflectService.ts` (team reflection primitive) —
 * same containment pattern, different context shape.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ThreadBlockSummary {
  type: 'note' | 'decision' | 'change';
  label: string;                // user-facing label ("Reflection" / "Decision" / "Shift")
  content: string;
  outcome?: string;             // Shift outcome, if present
}

export interface ThreadReflectionContext {
  ideaTitle: string;
  ideaFraming: string | null;
  lastDecision: string | null;    // content of the most recent decision, or null
  recentBlocks: ThreadBlockSummary[]; // last 3–4, oldest first
}

export async function generateThreadReflection(
  ctx: ThreadReflectionContext
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are MAIA, a sovereign consciousness companion, offering a brief reflection inside a member's idea workspace.

The member is developing an idea over time. They have opened this thread and asked for a moment of reflective intelligence. Your role is NOT to advise, plan, or answer. It is to offer a reflective shift — a small turn of seeing that they could not have given themselves.

Constraints (all must hold):
- 2 to 4 sentences. No more.
- Second person ("you", "what you're holding"). Not first person.
- No bullets. No lists. No headers.
- No "you should", "you need to", "try", "consider" — no imperative advice.
- No summary of what they wrote. They already know it.
- No therapy language, no diagnosis, no spiritual platitudes.
- No preamble ("I notice...", "It sounds like..."). Just say it.
- Sovereign stance: you serve clarity, not comfort.

Shape of a good reflection:
- Names the shape of what is present, not the content.
- Points to what is unspoken or almost-spoken.
- Returns authority to the member. They decide; you mirror.`;

  const userMessage = composeUserMessage(ctx);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from thread reflection');
  }
  return content.text.trim();
}

function composeUserMessage(ctx: ThreadReflectionContext): string {
  const parts: string[] = [];

  parts.push(`Idea: ${ctx.ideaTitle}`);

  if (ctx.ideaFraming) {
    parts.push(`Framing:\n${ctx.ideaFraming}`);
  }

  if (ctx.lastDecision) {
    parts.push(`Most recent decision:\n${ctx.lastDecision}`);
  }

  if (ctx.recentBlocks.length > 0) {
    const lines = ctx.recentBlocks.map((b) => {
      const suffix = b.outcome ? ` (${b.outcome})` : '';
      return `- [${b.label}${suffix}] ${b.content}`;
    });
    parts.push(`Recent thread (oldest first):\n${lines.join('\n')}`);
  }

  parts.push('Offer a reflection on what is here.');

  return parts.join('\n\n');
}
