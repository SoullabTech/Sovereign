/**
 * MAIA Title Proposal — stateless, server-composed primitive.
 *
 * Invoked by POST /api/ideas/[id]/suggest-title when a member asks MAIA to
 * suggest a name for an inquiry. Returns 2–3 candidate names.
 *
 * Constitutional boundary (the reason this is a separate primitive rather than
 * a field on the reflection call):
 *   MAIA may propose. Only the member ratifies.
 *   This function returns STRINGS. It does not write to member_ideas.title,
 *   and the route that calls it writes only to proposed_titles. There is no
 *   path from this output to the idea's name that does not pass through a
 *   member's click.
 *
 * A name is not a summary and not a claim about what the idea means. It is a
 * handle, so the member can find the inquiry again and feel that it has become
 * something distinct from where it began.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface TitleProposalContext {
  seed: string | null;
  currentTitle: string | null;
  recentBlocks: string[]; // member-authored, oldest first
}

export const MAX_PROPOSALS = 3;
export const TITLE_PROPOSAL_CHAR_BUDGET = 1500;
export const MAX_TITLE_LENGTH = 90;

export const TITLE_PROPOSAL_SYSTEM_PROMPT = `You name inquiries. A member has been developing an idea and wants candidate names for it.

Return 2 to 3 candidates, one per line. Nothing else — no numbering, no preamble, no explanation, no quotation marks.

Each candidate must:
- be a noun phrase, not a sentence
- be under 60 characters
- name what the inquiry is ABOUT, in the member's own conceptual vocabulary
- use terms the member has actually used where they have introduced them

Each candidate must NOT:
- be a summary of the member's conclusions
- assert what the idea means, proves, or is really about
- add framing the member has not introduced
- use colons to append an explanatory subtitle
- be generic ("Exploring Consciousness", "Some Thoughts", "An Inquiry")

You are offering handles, not verdicts. The member will choose, edit, or ignore them.`;

/** Split, clean, and bound the model's line-per-candidate output. */
export function parseTitleCandidates(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*[-*•]\s*/, '')      // bullet
        .replace(/^\s*\d+[.)]\s*/, '')    // numbering
        .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '') // wrapping quotes
        .trim()
    )
    .filter((line) => line.length > 0 && line.length <= MAX_TITLE_LENGTH)
    .slice(0, MAX_PROPOSALS);
}

export async function generateTitleProposals(
  ctx: TitleProposalContext
): Promise<string[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const parts: string[] = [];
  if (ctx.seed) parts.push(`Where the inquiry began:\n${ctx.seed}`);
  if (ctx.currentTitle) parts.push(`Current working name: ${ctx.currentTitle}`);
  if (ctx.recentBlocks.length > 0) {
    // Newest material is the most indicative of what the idea has become, so
    // the budget is spent from the end backwards.
    const collected: string[] = [];
    let used = 0;
    for (let i = ctx.recentBlocks.length - 1; i >= 0; i--) {
      const b = ctx.recentBlocks[i];
      if (used + b.length > TITLE_PROPOSAL_CHAR_BUDGET) {
        const remaining = TITLE_PROPOSAL_CHAR_BUDGET - used;
        if (remaining > 200) collected.unshift(`${b.slice(0, remaining).trimEnd()}…`);
        break;
      }
      collected.unshift(b);
      used += b.length;
    }
    parts.push(`What it has become (member's own entries, oldest first):\n${collected.join('\n\n')}`);
  }
  parts.push('Give 2 to 3 candidate names, one per line.');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: TITLE_PROPOSAL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: parts.join('\n\n') }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from title proposal');
  }
  return parseTitleCandidates(content.text);
}
