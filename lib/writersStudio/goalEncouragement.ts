/**
 * GOALS SUPPORT · PHASE 1 — BOUNDED ENCOURAGEMENT.
 *
 * The first positive behaviour in Goals Support, built after the negative space
 * (FR-13 grant · FR-14 separation · FR-15 occasion · FR-16 silence · FR-17
 * authority) and constrained by all five.
 *
 *     Can MAIA add warmth without making herself part of the transaction?
 *
 * That is the whole question, and it is not answered by whether a model can
 * write something pleasant.
 *
 * ── THE CHECK IS THE PRODUCT ───────────────────────────────────────────────
 *
 * A prompt asking for warmth "without a question, without suggesting a next
 * goal, without mentioning the calendar" is a wish. This module makes it a
 * refusal: generated text is checked mechanically against the FR-16 form
 * contract, and anything that fails becomes SILENCE.
 *
 * Refusing costs nothing, which is the whole reason this design is available:
 * FR-16 ruled that an occasion authorizes at most one response and never
 * requires one. **Silence is a lawful output**, so a strict checker has no
 * pressure to be lenient, and a false refusal is invisible rather than damaging.
 * Almost nowhere else in this system can a validator be this severe.
 *
 * ── ONE-SHOT BY CONSTRUCTION ───────────────────────────────────────────────
 *
 * Encouragement is produced in the handling of the member act that occasioned
 * it and returned with that act's response. There is no endpoint to redeem an
 * occasion, and nothing stores one — so it cannot be fetched twice, and a
 * re-render cannot reproduce it (FR-15). It exists in one HTTP response or not
 * at all.
 *
 * ── WHAT IS NOT HERE ───────────────────────────────────────────────────────
 *
 * No manuscript, no prose, no excerpt: the model is given the writer's own goal
 * statement and nothing else about their work (FR-15 rule 3 — a support grant
 * is not a reading grant). No history, no counter, no previous encouragement.
 * No conversation: `help_me_work_with_it` is Phase 3 and is not begun here.
 */

import { runStructured } from '@/lib/ai/structured/router';
import type { SupportOccasion, SupportOccasionKind } from './goalSupportOccasion';

/** The three acts Phase 1 answers. `asked` is Phase 2; `work_with` is Phase 3. */
export type EncourageableAct = Extract<SupportOccasionKind, 'declared' | 'met' | 'set_aside' | 'released'>;

export function isEncourageable(kind: SupportOccasionKind): kind is EncourageableAct {
  return kind === 'declared' || kind === 'met' || kind === 'set_aside' || kind === 'released';
}

/** Why a candidate was refused. Recorded for the log, never shown to a member. */
export type EncouragementRefusal =
  | 'empty'
  | 'too_long'
  | 'asks_a_question'
  | 'opens_the_next_thing'
  | 'praises_the_person'
  | 'invokes_the_clock'
  | 'compares'
  | 'leverages_progress'
  | 'evaluates_the_goal'
  | 'speaks_for_the_writer';

export type EncouragementCheck =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly refusal: EncouragementRefusal };

/** Brief means brief. Two sentences of warmth, not a paragraph of coaching. */
export const MAX_ENCOURAGEMENT_CHARS = 220;

/* Words are matched on word boundaries so "understand" does not trip "stand". */
const has = (t: string, ...words: string[]) =>
  words.some((w) => new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i').test(t));

/**
 * The FR-16 form contract, executable.
 *
 * Pure and exported so the rules are testable without a model, a network, or a
 * database — the prohibitions are the specification, and they should be
 * falsifiable on their own.
 */
export function checkEncouragement(raw: string, act: EncourageableAct): EncouragementCheck {
  const text = raw.trim();
  if (text.length === 0) return { ok: false, refusal: 'empty' };
  if (text.length > MAX_ENCOURAGEMENT_CHARS) return { ok: false, refusal: 'too_long' };

  /* F-B — A QUESTION IS NOT NEUTRAL. IT RECRUITS ANOTHER TURN. The strictest
     rule here and the simplest: a non-conversational response must close. */
  if (text.includes('?')) return { ok: false, refusal: 'asks_a_question' };

  /* F-C · MET — a completed goal is allowed to be complete. "What's next" will
     feel generous and is the trap: it makes the reward for finishing a prompt
     to start again. Enforced on every act, because the seed of another
     obligation is unwelcome at a declaration too. */
  if (has(text, 'next', 'momentum', 'keep going', 'keep it up', 'onward', 'another goal', 'now that'))
    return { ok: false, refusal: 'opens_the_next_thing' };

  /* Praise lands on the PERSON, not the work. "You're doing so well" is a
     judgement about a writer by a system with no standing to make one. */
  if (/\byou(?:'re| are)\s+(?:so\s+|really\s+|very\s+)?(?:doing|amazing|great|wonderful|incredible|unstoppable|on fire|a machine)\b/i.test(text)
      || has(text, 'proud of you', 'impressive', 'well done you'))
    return { ok: false, refusal: 'praises_the_person' };

  /* FR-10, unchanged by FR-13 and unchanged here: NO FIGURE MAY BE A FUNCTION
     OF THE CLOCK, at any grant level. Companionship, never a schedule. */
  if (has(text, 'today', 'tonight', 'tomorrow', 'yesterday', 'this week', 'deadline',
          'on track', 'behind', 'ahead', 'pace', 'per day', 'a day', 'schedule',
          'days', 'weeks', 'soon', 'still time', 'in time'))
    return { ok: false, refusal: 'invokes_the_clock' };

  /* No comparison — to other goals, other writers, or an earlier self. */
  if (has(text, 'more than', 'faster', 'better than', 'last time', 'other writers', 'most people'))
    return { ok: false, refusal: 'compares' };

  /* F-C · SET ASIDE / RELEASE — TRUTHFUL INFORMATION IS NOT NEUTRAL MERELY
     BECAUSE IT IS TRUE; PLACEMENT CAN MAKE IT PERSUASIVE. At the moment someone
     lets a goal go, a figure has one function: to make the choice harder. So no
     digits at all, and none of the phrasings that argue without them. */
  if (act === 'set_aside' || act === 'released') {
    if (/\d/.test(text)
        || has(text, 'so close', 'almost', 'nearly', 'already', 'progress', 'come back', 'still there')
        /* "when you are ready" / "when you're ready" — an invitation back,
           wearing patience. Matched with the apostrophe optional. */
        || /\bwhen\s+you(?:'re|\s+are)\s+ready\b/i.test(text))
      return { ok: false, refusal: 'leverages_progress' };
  }

  /* F-C · DECLARE — the goal belongs to the writer before MAIA has any
     relationship to it. Approving of it is a small act of co-authorship. */
  if (act === 'declared') {
    if (has(text, 'great goal', 'good goal', 'ambitious', 'love that', 'excellent', 'perfect',
            'achievable', 'realistic', 'doable', 'you can do', 'you will'))
      return { ok: false, refusal: 'evaluates_the_goal' };
  }

  /* MAIA does not narrate the writer's interior. What they felt, wanted or
     meant is theirs to say. */
  if (has(text, 'you must feel', 'you feel', 'you wanted', 'you needed', 'i know how', 'i can tell'))
    return { ok: false, refusal: 'speaks_for_the_writer' };

  return { ok: true, text };
}

const SYSTEM = `You are MAIA, accompanying a writer in their Studio.

The writer has just acted on a goal THEY declared. You may offer one brief, warm
sentence — or two at most — that accompanies the act.

You are not the point of this moment. The writer did something; you are nearby.

NEVER:
- ask a question, or use a question mark
- mention what comes next, another goal, momentum, or continuing
- praise the person ("you're doing so well")
- mention time, dates, days, deadlines, pace, or being ahead or behind
- compare them to anyone, including their earlier self
- describe what they feel, wanted, or meant
- evaluate whether their goal is good, ambitious, or achievable

Write plainly. No exclamation marks. Do not address yourself. Do not sign off.`;

const INSTRUCTION: Record<EncourageableAct, string> = {
  declared:
    'The writer has just declared this goal. Acknowledge that they said it, without approving of it. Silence is better than flattery — if nothing plain and true comes, answer with an empty string.',
  met:
    'The writer has just marked this goal met. Name what they accomplished, in terms of the work rather than the person. Let it be finished; do not gesture at anything after it.',
  set_aside:
    'The writer has just set this goal aside. Respect the choice. Do not mention progress, do not hold it open, do not invite them back to it.',
  released:
    'The writer has just released this goal. Respect the choice. Do not mention progress, do not hold it open, do not invite them back to it.',
};

/**
 * The one response an occasion may produce, or null.
 *
 * Null is not a failure and is never retried, logged as an error, or filled in
 * with a default: FR-16 makes silence a first-class result, so every path that
 * cannot produce clean warmth simply produces none.
 */
/**
 * Pinned by the caller's default rather than a router, for the same reason the
 * developmental reader pins its own: the seam must never run model selection
 * over a request whose provenance matters.
 */
export const ENCOURAGEMENT_MODEL =
  process.env.MAIA_GOAL_ENCOURAGEMENT_MODEL || 'claude-opus-5';

export async function encouragementFor(
  occasion: SupportOccasion,
  goal: { statement: string },
  model: string = ENCOURAGEMENT_MODEL,
): Promise<string | null> {
  if (!isEncourageable(occasion.kind)) return null;

  /* FR-17 — an occasion's authority may be standing or turn-local. Phase 1
     answers `encourage` in either form; a `work_with` scope is Phase 3 and is
     answered by silence rather than by a Phase 1 response wearing its name. */
  const scope = occasion.authority.kind === 'standing'
    ? occasion.authority.grant
    : occasion.authority.scope;
  if (scope !== 'encourage') return null;

  const act = occasion.kind;
  const outcome = await runStructured({
    model,
    system: SYSTEM,
    /* The writer's own words about their own goal — and nothing else about
       their work. No manuscript, no excerpt, no counts. */
    messages: [{ role: 'user', content: `${INSTRUCTION[act]}\n\nThe writer's goal, in their words: "${goal.statement}"` }],
    maxTokens: 120,
  });

  /* A refusal from the seam is silence, not an error to surface. The member
     acted on their goal; whether MAIA had something to say about it is not
     their problem to hear about. */
  if (!outcome.ok) return null;

  const text = outcome.result.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const checked = checkEncouragement(text, act);
  return checked.ok ? checked.text : null;
}
