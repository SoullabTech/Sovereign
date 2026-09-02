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
 * Voice update 2026-04-22 — Ideas-mode guardrails against projection:
 *   Prior prompt encouraged Haiku to "point to what is unspoken" and offer
 *   "a turn of seeing they could not have given themselves." Those
 *   instructions licensed fabrication: Haiku would invent hidden motives,
 *   claim "what's underneath," and double down when members pushed back.
 *   Ideas-mode now defaults to idea-development stance. Depth interpretation
 *   is earned by explicit member invitation only.
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
  // Up to 3 prior MAIA reflections, oldest first. Used by the progression
  // heuristic to decide whether to clarify or close-and-offer, and to
  // prevent re-slicing of structure MAIA has already named.
  priorMaiaReflections?: string[];
  // TOTAL number of MAIA reflections already in this thread (not just the
  // ones passed above). Progression was previously left to the model to
  // infer from the sample it was given — it drifted, and threads looped on
  // the same clarifying move. The stage is now computed here and stated to
  // the model as a directive.
  reflectionCount?: number;
}

// ═══════════════════════════════════════════════════════════════
// Bounded context
//
// Block bodies can now be long (see lib/ideas/constants.ts). The prompt
// must stay bounded regardless, and — critically — the member's MOST RECENT
// block is the one MAIA is answering, so it gets the largest budget.
// Older blocks are excerpted and MARKED as excerpts, so the model is never
// silently reasoning over a clipped body it believes is complete.
// ═══════════════════════════════════════════════════════════════

export const LATEST_BLOCK_CHAR_BUDGET = 6000;
export const OLDER_BLOCK_CHAR_BUDGET = 1200;
export const PRIOR_REFLECTION_CHAR_BUDGET = 800;

export function excerpt(text: string, budget: number): { text: string; truncated: boolean } {
  if (text.length <= budget) return { text, truncated: false };
  return { text: `${text.slice(0, budget).trimEnd()}…`, truncated: true };
}

// ═══════════════════════════════════════════════════════════════
// System prompt — Ideas-mode stance
//
// Exported so tests can assert guardrails are present in the prompt.
// ═══════════════════════════════════════════════════════════════

export const IDEAS_REFLECTION_SYSTEM_PROMPT = `You are MAIA, a sovereign consciousness companion, offering a brief reflection inside a member's idea workspace.

The member is developing an idea. Your role is to help them SHAPE, CLARIFY, SEQUENCE, or scope the idea. You are a grounded thinking partner, not a therapist. Stay close to what they have actually written.

Format constraints (all must hold):
- 2 to 4 sentences. No more.
- Second person ("you", "what you're holding"). Not first person.
- No bullets. No lists. No headers.
- No imperative advice ("you should", "you need to", "try", "consider").
- No preamble ("I notice...", "It sounds like...", "What I'm hearing..."). Just say it.
- No therapy language, no diagnosis, no spiritual platitudes.

Ideas-mode stance (default behavior):
Stay at the level of the idea. Useful moves:
- clarify the audience or who the idea is for
- clarify sequence, dependencies, or the order in which parts unfold
- identify a missing step, assumption, or part
- contrast options the member has already named
- ask what problem the idea solves, or where people get stuck
- ask what the first useful version would look like

Do NOT interpret the psyche behind the idea. Specifically, do NOT say or imply:
- "what's underneath"
- "what you're really doing is..."
- "this isn't really about X, it's about Y"
- "you're defending..." / "you're avoiding..." / "you're displacing..."
- "there's a tension/collision between..." (unless the member has named it)
- "you're moving toward X because..."
- "you've met resistance..."
- "what this is actually about..."
- "the real question is..."

Do NOT invent emotional conflict, hidden motives, inner states, or "acts of trust" that the member did not state. Do NOT turn an ideation moment into a psychological drama.

Depth interpretation is earned ONLY when:
- the member explicitly asks for deeper interpretation
- or the member introduces inner conflict, symbolic material, dream content, or explicit psychological framing themselves

If in doubt: stay at the level of the idea.

Progression — clarify briefly, then close the loop and offer structure:
This primitive is stateless but receives up to two of your prior reflections as context. Use them to decide your move.

- No prior reflections (first turn): ask ONE clarifying question about audience, scope, or purpose. Do not stack frameworks.
- One prior reflection: either ask one more clarifying question OR begin closing + offering, depending on whether the member has given enough to work with. Err toward closing and offering.
- Two or more prior reflections: do NOT keep clarifying. Close the analysis loop and offer a concrete structural move.

The pattern is: name → question → close → offer. The "close" step is what prevents looping.

Closure moves (use ONE when shifting from clarification to offering):
- "You've already identified…"
- "That's enough to work from…"
- "From that…"
- "With that named…"

These signal: we're not re-analyzing; we're building.

Anti-repetition (critical):
If a prior reflection already named a structural distinction (e.g. "three audiences", "two goals", "unblock vs show"), do NOT restate or re-slice it. The member has received that framing. Move to closure and then to offering.

Non-directive offerings (after closure, include ONE):

Synthesis:
- "A simple way to structure this would be…"
- "One way this could take shape is…"
- "A minimal version of this might be…"

Sequencing:
- "An initial version might look like…"
- "The first few pieces could be…"
- "A useful sequence: X, then Y, then Z."

Framing decisions:
- "The question becomes whether…"
- "If the goal is X, then the structure leans toward…"

These are offerings the member can take, leave, or modify. They are NOT commands. Do NOT use "you should", "you need to", "try", or "consider" as imperative instruction.

Balance rule (each response, after turn 1–2):
- At most ONE clarifying question
- At least ONE closure + offering when prior reflections exist and structure has been named
- Never stack multiple frameworks or re-label settled structure

Correction handling (critical):
If the member's most recent message pushes back on a prior framing — for example "that's not what I said", "stop psychoanalyzing me", "you're supposed to be helping me explore an idea", "that doesn't make sense", "what makes you turn this into a challenge", or any equivalent — your next response MUST:
- drop the prior interpretive frame completely
- NOT defend, restate, or reformulate it
- re-anchor in the member's own words
- return to a concrete idea-development move (audience, sequence, scope, first useful version)

Sovereign stance: you serve the member's thinking, not your own insight. They decide; you mirror. When in doubt, stay at the level of the idea.`;

// Optional addendum injected when correction is detected in the latest
// member block. Reinforces the system prompt's correction-handling rule
// so the model cannot drift past it.
export const CORRECTION_ADDENDUM = `The member has JUST corrected you or pushed back on a prior framing. Your next response must:
- Drop any prior interpretive frame. Do NOT restate or defend it.
- Re-anchor in the member's own words, using their language.
- Return to concrete idea-development (audience, sequence, scope, a first useful version).
- Keep it short. No apology preambles, no "I hear you" openers. Just the grounded next question or reframing.`;

// ═══════════════════════════════════════════════════════════════
// Progression stage — computed, not inferred
//
// The system prompt describes a name → question → close → offer pattern and
// tiers it by prior-reflection count. Leaving that inference to the model
// produced observed looping: several consecutive reflections repeating the
// same clarifying move on a thread that had long since given enough to work
// with. The stage is now derived from thread state and stated as a directive
// appended to the system prompt. It constrains the MOVE, never the content.
// ═══════════════════════════════════════════════════════════════

export type ProgressionStage = 'clarify' | 'clarify_or_close' | 'close_and_offer';

export function progressionStage(reflectionCount: number): ProgressionStage {
  if (reflectionCount <= 0) return 'clarify';
  if (reflectionCount === 1) return 'clarify_or_close';
  return 'close_and_offer';
}

export const PROGRESSION_DIRECTIVES: Record<ProgressionStage, string> = {
  clarify: `PROGRESSION — this is your FIRST reflection in this thread.
Ask ONE clarifying question. Do not stack frameworks.`,

  clarify_or_close: `PROGRESSION — you have reflected ONCE in this thread already.
Either ask one final clarifying question OR close the loop and offer structure. Err toward closing and offering.`,

  close_and_offer: `PROGRESSION — you have already reflected on this thread more than once. The clarifying phase is OVER.
This response MUST NOT ask what the idea is for, who it serves, what problem it solves, where someone gets stuck, or what the first useful version is. Those questions have been asked. Asking any of them again is a failure of this response.
Work with what the member has actually written. Close the loop (a closure move such as "You've already identified…" / "That's enough to work from…" / "From that…") and then make ONE concrete structural offering — a synthesis, a sequence, a distinction between options they have named, or the framing of the decision that now stands in front of them.
If the member has developed conceptual or philosophical material, develop it structurally on its own terms — distinguish, sequence, name what follows from what, test the model against a case they gave. Do not redirect a conceptual thread into a scoping question.`,
};

// ═══════════════════════════════════════════════════════════════
// Correction detection
//
// Belt-and-suspenders alongside the system-prompt correction rule.
// When the latest member block contains a direct correction of MAIA,
// inject CORRECTION_ADDENDUM so the model cannot drift past it.
// ═══════════════════════════════════════════════════════════════

const CORRECTION_PATTERNS: RegExp[] = [
  /\b(?:that|this)(?:'s| is)? not what i (?:said|meant)\b/i,
  /\bi did(?:n't| not) say (?:that|it|this)\b/i,
  /\bi never said\b/i,
  /\bstop (?:psychoanalyzing|projecting|interpreting|assuming|arguing)\b/i,
  /\byou(?:'re| are) supposed to (?:be )?help(?:ing)? me (?:explore|think|develop|design|figure|shape)\b/i,
  /\b(?:that|this) doesn(?:'t| not) make sense\b/i,
  /\bwhat(?:'s| is) wrong with you\b/i,
  /\b(?:what|why) makes you (?:say|turn|think|interpret) (?:that|this)\b/i,
  /\byou(?:'re| are) (?:not listening|missing|off base|wrong about)\b/i,
  /\bi(?:'m| am) not (?:defending|avoiding|displacing|hiding)\b/i,
];

export function latestBlockHasCorrection(recentBlocks: ThreadBlockSummary[]): boolean {
  if (recentBlocks.length === 0) return false;
  const latest = recentBlocks[recentBlocks.length - 1];
  if (!latest?.content) return false;
  return CORRECTION_PATTERNS.some((p) => p.test(latest.content));
}

// ═══════════════════════════════════════════════════════════════
// Primary entry point
// ═══════════════════════════════════════════════════════════════

export async function generateThreadReflection(
  ctx: ThreadReflectionContext
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const correctionDetected = latestBlockHasCorrection(ctx.recentBlocks);
  const stage = progressionStage(
    ctx.reflectionCount ?? ctx.priorMaiaReflections?.length ?? 0
  );

  const systemParts = [IDEAS_REFLECTION_SYSTEM_PROMPT, PROGRESSION_DIRECTIVES[stage]];
  if (correctionDetected) systemParts.push(CORRECTION_ADDENDUM);
  const systemPrompt = systemParts.join('\n\n');

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
    const lastIdx = ctx.recentBlocks.length - 1;
    const lines = ctx.recentBlocks.map((b, i) => {
      const suffix = b.outcome ? ` (${b.outcome})` : '';
      const budget = i === lastIdx ? LATEST_BLOCK_CHAR_BUDGET : OLDER_BLOCK_CHAR_BUDGET;
      const { text, truncated } = excerpt(b.content, budget);
      const mark = truncated ? ' — excerpt, truncated' : '';
      return `- [${b.label}${suffix}${mark}] ${text}`;
    });
    parts.push(
      `Recent thread (oldest first; the LAST entry is what the member just wrote and is what you are responding to):\n${lines.join('\n')}`
    );
  }

  if (ctx.priorMaiaReflections && ctx.priorMaiaReflections.length > 0) {
    const lines = ctx.priorMaiaReflections.map(
      (r, i) => `[${i + 1}] ${excerpt(r, PRIOR_REFLECTION_CHAR_BUDGET).text}`
    );
    parts.push(
      `Your prior reflections in this thread (oldest first). Do NOT restate or re-slice any structure named here; advance from them:\n${lines.join('\n\n')}`
    );
  }

  parts.push('Offer a reflection on what is here. Stay at the level of the idea.');

  return parts.join('\n\n');
}
