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
import { PROCESS_STANCE_BLOCK } from '@/lib/maia/prompts/processStance';

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

  const agentSpecificInstructions = `
You are entering a specific thread inside an active process surface.

Offer 2–4 sentences.
Use second person.
No bullet points.
No advice, directives, or prescriptions.
No summary or recap.

Focus on articulating 1–2 tensions, distinctions, or possible framings that help the thread move without closing it.
`.trim();

  const systemPrompt = `
${PROCESS_STANCE_BLOCK}

${agentSpecificInstructions}
`.trim();

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
