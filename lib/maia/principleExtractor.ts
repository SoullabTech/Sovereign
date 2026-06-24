/**
 * Organizing Principle Extractor
 *
 * After a conversation turn, detects whether a portable orientation statement
 * emerged that the member could carry forward into future decisions.
 *
 * Constitutional constraints:
 *   - Returns null when no clear principle emerged — not every conversation yields one
 *   - Frames as tentative emergence ("seems to be emerging") never as verdict ("your lesson")
 *   - Evidence must be grounded in what the member actually said, not inferred
 *
 * See: docs/canon/AGENCY_THE_FREEDOM_TO_MOVE.md
 */

import Anthropic from '@anthropic-ai/sdk';

export type OrganizingPrincipleProposal = {
  type: 'organizing_principle';
  id: string;
  title: string;
  principle: string;
  questionAnswered: string;
  evidence: string[];
  invitation: string;
  confidence: number;
};

type ConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

const EXTRACTOR_PROMPT = `You are analyzing a conversation to detect whether a clear organizing principle emerged.

An organizing principle is a portable orientation statement that:
- Emerged naturally from the specific situation discussed — not forced, not generic
- Can orient the person in future situations of a similar kind
- Is grounded in concrete evidence from THIS conversation
- Is specific enough to be useful ("Boundaries before rescue") not generic ("set limits")
- Represents something the person seems to be arriving at themselves — not advice from outside

Return JSON in exactly this shape:
{
  "detected": boolean,
  "title": string | null,       // short phrase, 3-6 words. null if not detected.
  "principle": string | null,   // full portable statement. null if not detected.
  "evidence": string[],         // 2-4 specific things from the conversation that ground the principle. [] if not detected.
  "invitation": string | null   // how to invite the member to keep this. null if not detected.
}

Invitation language — use one of these forms (adapt the specifics):
- "Something may have clarified here."
- "Would it help to keep this as an orientation?"
- "In what you shared, this principle seems to be emerging…"
- "This may be a principle you can carry into future decisions."

NEVER use: "Your lesson is", "You need to", "What you should take from this", "The takeaway", "You learned"

Return detected=false if:
- The conversation is too short or exploratory to yield a clear principle
- The material is still in motion (no clarity has emerged yet)
- The principle would be generic enough to apply to anyone in any situation
- The conversation was primarily informational, not developmental

Return JSON only. No other text.`;

const EXTRACTOR_TIMEOUT_MS = 6000;

export async function extractOrganizingPrinciple(
  turns: ConversationTurn[],
  currentMessage: string,
): Promise<OrganizingPrincipleProposal | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Need at least 2 prior turns + current message to detect a principle
  if (turns.length < 2) return null;

  const client = new Anthropic({ apiKey });

  const conversationBlock = [
    ...turns.map(t => `${t.role === 'user' ? 'Member' : 'MAIA'}: ${t.content}`),
    `Member: ${currentMessage}`,
  ].join('\n\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTRACTOR_TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `${EXTRACTOR_PROMPT}\n\n---\n\nConversation:\n${conversationBlock}`,
          },
        ],
      },
      { signal: controller.signal },
    );

    clearTimeout(timeout);

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(raw.trim());

    if (!parsed.detected || !parsed.title || !parsed.principle) return null;

    return {
      type: 'organizing_principle',
      id: `principle-${Date.now()}`,
      title: String(parsed.title),
      principle: String(parsed.principle),
      questionAnswered: 'What principle emerged that can guide future situations?',
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map(String).slice(0, 4) : [],
      invitation: String(parsed.invitation || 'Something may have clarified here.'),
      confidence: 0.8,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
