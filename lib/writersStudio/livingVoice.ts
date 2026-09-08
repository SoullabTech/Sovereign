/**
 * LIVING VOICE — v1 prototype.
 *
 *     Living Voice helps the writer encounter more possibilities in their own
 *     writing. It does not determine what the writing should become.
 *
 *     MAIA notices from the Work, invites without judgement, and returns the
 *     act of writing to the writer.
 *
 * ── THE PROPERTY THIS MODULE LEANS ON ──────────────────────────────────────
 *
 * LIVING VOICE v1 HAS NO DATABASE TABLE, AND THAT IS THE DESIGN.
 *
 * LV-H requires the offered passage to be non-durable: not written to Studio
 * persistence, MAIA memory, developmental-reading artifacts, member attributes,
 * analytics content, or a cumulative Living Voice record. The strongest form of
 * that guarantee is not a deletion policy — it is having nowhere to write. No
 * migration, no table, no store, no accumulation across turns. The passage
 * exists in one request and is gone.
 *
 * The grant is likewise unstored (LV-B): entering the practice is a stance the
 * writer holds while they are here, not a preference recorded about them. A
 * stored "writes in Living Voice" is one refactor from a fact about how a
 * person writes, and LV-C forbids exactly that.
 *
 * ── THE THREE TERMS (LV-A · LV-B) ──────────────────────────────────────────
 *
 *     GRANT     entering Living Voice — "I am open to this while I am here"
 *     SUBJECT   a selection — establishes WHAT, invites nothing
 *     OCCASION  "Explore this passage" — the only thing that reaches a model
 *
 * A writer selects text constantly while editing. Nothing in this module is
 * reachable from a selection alone.
 */

import { runStructured } from '@/lib/ai/structured/router';

/**
 * LV-F — the five lenses, as the founder corrected them.
 *
 * `simplify` does not exist: "simple" privileges plainness over poetic
 * complexity, and a dense, strange, lyrical sentence may be exactly right.
 * `clarify` asks whether the writing knows what it is doing without implying
 * that complexity is a fault.
 *
 * `risk` does not exist either. `goCloser` is creative courage; it is not an
 * instruction to disclose, and the checker below refuses the difference.
 */
export type LivingVoiceLens = 'see' | 'feel' | 'hear' | 'goCloser' | 'clarify';

export const LENSES: readonly LivingVoiceLens[] = ['see', 'feel', 'hear', 'goCloser', 'clarify'];

/** What the writer reads. Questions, never verdicts. */
export const LENS_LABEL: Readonly<Record<LivingVoiceLens, string>> = {
  see: 'See it',
  feel: 'Feel it',
  hear: 'Hear it',
  goCloser: 'Go closer',
  clarify: 'Clarify it',
};

export const LENS_INVITATION: Readonly<Record<LivingVoiceLens, string>> = {
  see: 'Give the reader something they can picture.',
  feel: 'Let the feeling live in something concrete.',
  hear: 'Listen to the rhythm of the sentence.',
  goCloser: "Is there something you're circling that you want to approach more directly?",
  clarify: 'Does the writing know what it is doing?',
};

/**
 * ⚠️ A LENS IS AN INVITATION TO LOOK, NOT A CLASSIFICATION OF THE PASSAGE.
 *
 * Founder boundary, pinned before code because it is easy to blur.
 *
 *   MAY      "You might try See it or Hear it here."
 *   MAY NOT  "This passage is a Water/Image passage."
 *   MAY NOT  "This needs more feeling."
 *
 * The lens has no standing after the encounter and is not persisted as metadata
 * about the passage or the writer — which, given the module has no store at
 * all, is guaranteed by construction rather than by policy.
 */

/* ── LV-I · THE PASSAGE BOUND ─────────────────────────────────────────────── */

/**
 * PROPOSED, pending the founder's LV-I ruling.
 *
 * The constitutional requirement is that the limit **preserve the meaning of
 * "passage"** rather than quietly becoming another manuscript-reading route.
 * So the number is sized against what a passage IS, not against what a model
 * could hold:
 *
 *     a sentence            ~  80 code points
 *     a prose paragraph     ~ 600 code points
 *     a few paragraphs      ~2000 code points   ← a passage
 *     a section in a real
 *       manuscript          ~6000 code points   ← NOT a passage
 *
 * 2,000 admits several paragraphs and refuses a section. It is deliberately far
 * below anything that could be mistaken for reading a chapter.
 *
 * ⛔ NOT `DEVELOPMENTAL_READ_CEILING_CODE_POINTS`. That constant governs a
 * different act — "what may MAIA read of the Work?" — and someone will
 * eventually reach for it because it is the only prose ceiling that exists.
 * This one answers "what has the writer handed MAIA for this exchange?"
 *
 * ── LV-I · WHAT IS LAW HERE, AND WHAT IS NOT ──────────────────────────────
 *
 * ⛔ THE NUMBER IS NOT THE LAW. Ruled 2026-09-08: `2_000` is a PROVISIONAL
 * IMPLEMENTATION CONSTANT for the first prototype and must never be elevated
 * into constitutional status. It is expected to move once real writers meet
 * it, and moving it is an ordinary implementation change.
 *
 * The law is the relation, and it does not move:
 *
 *     Living Voice receives a PASSAGE, not an arbitrarily large region of the
 *     Work. The writer chooses it. The system never truncates it and never
 *     enlarges it.
 *
 * So the four properties below are constitutional — passage-scale ·
 * writer-selected · whole selection or refusal · never truncated, never
 * auto-expanded — and this integer is only the current, revisable expression
 * of the first of them. A change to the number is a tuning; a change to any
 * of the four is a constitutional amendment.
 */
export const LIVING_VOICE_PASSAGE_MAX_CODE_POINTS = 2_000;

/**
 * Can this selection be offered at all?
 *
 * ── LV-I · THE THRESHOLD TELLS THE TRUTH BEFORE IT IS CROSSED ─────────────
 *
 * The client already knows how long the selection is. Making the writer press
 * "Explore this passage", enter the encounter, and only then meet a wall is a
 * worse relation than saying so at the door — it stages an invitation the
 * system has already decided to decline.
 *
 *     within bound   →  Explore this passage
 *     over bound     →  Choose a shorter passage to explore
 *
 * No truncation, and no network request. The selection is untouched: the
 * writer narrows it themselves, which is the whole point of the writer being
 * the one who chooses the passage.
 *
 * ⛔ THIS IS NOT CUSTODY. Client enforcement is a courtesy to the writer, not
 * a boundary — the route calls `checkPassage` independently and refuses on its
 * own authority. Deleting this function would degrade the experience; deleting
 * the server check would remove the bound.
 */
export function canOfferPassage(raw: string): boolean {
  return checkPassage(raw).ok;
}

/** Said at the door, before the encounter opens. See `canOfferPassage`. */
export const PASSAGE_TOO_LONG_AT_THE_DOOR = 'Choose a shorter passage to explore';

export type PassageRefusal = 'empty' | 'too_long';

export type PassageCheck =
  | { readonly ok: true; readonly passage: string; readonly codePoints: number }
  | { readonly ok: false; readonly refusal: PassageRefusal; readonly codePoints: number };

const codePoints = (s: string) => Array.from(s).length;

/**
 * The offered passage, checked.
 *
 * ⛔ AN OVER-LONG SELECTION IS REFUSED, NEVER TRUNCATED. Silent truncation would
 * be the system deciding which part of the writer's selection mattered — the
 * same move as silently widening scope, pointing the other way. LV-H's
 * corollary generalizes: *scope is never silently changed; the mismatch is
 * spoken.*
 */
export function checkPassage(raw: string): PassageCheck {
  const passage = raw.trim();
  const n = codePoints(passage);
  if (n === 0) return { ok: false, refusal: 'empty', codePoints: 0 };
  if (n > LIVING_VOICE_PASSAGE_MAX_CODE_POINTS) return { ok: false, refusal: 'too_long', codePoints: n };
  return { ok: true, passage, codePoints: n };
}

/** Spoken, not silent (LV-H corollary). Addressed to the writer, in their terms. */
export function passageRefusalCopy(refusal: PassageRefusal): string {
  return refusal === 'empty'
    ? 'Choose a passage first.'
    : 'That is more than a passage — choose a smaller piece and I will look at that.';
}

/* ── THE RESPONSE, AND WHAT IT MAY NOT BE ─────────────────────────────────── */

export type LivingVoiceRefusal =
  | 'empty'
  | 'too_long'
  | 'diagnoses_deficiency'
  | 'evaluates'
  | 'rewrites_for_the_writer'
  | 'presses_for_disclosure'
  | 'classifies_the_passage'
  | 'claims_the_works_voice'
  | 'reaches_beyond_the_passage';

export type LivingVoiceCheck =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly refusal: LivingVoiceRefusal };

/** Brief. A noticing and an invitation, not a critique. */
export const MAX_RESPONSE_CHARS = 420;

const has = (t: string, ...words: string[]) =>
  words.some((w) => new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i').test(t));

/**
 * The Living Voice form contract, executable.
 *
 * Same instrument as Goals Support Phase 1 and for the same reason: a prompt
 * asking MAIA not to grade someone's writing is a wish; a checker that refuses
 * is a rule. And as there, **silence is lawful** — a refused response becomes
 * no response, which costs nothing and lets the checker be severe.
 */
export function checkLivingVoiceResponse(raw: string): LivingVoiceCheck {
  const text = raw.trim();
  if (text.length === 0) return { ok: false, refusal: 'empty' };
  if (text.length > MAX_RESPONSE_CHARS) return { ok: false, refusal: 'too_long' };

  /* "This needs more feeling." — the diagnosis of deficiency the whole lane
     exists to refuse. A lens is an invitation to look, never a finding that
     something is missing. */
  if (/\b(needs?|lacks?|missing|wants for|could use|would benefit from)\b/i.test(text))
    return { ok: false, refusal: 'diagnoses_deficiency' };

  /* No verdict on the writing, in either direction. Praise is judgement too:
     "this is strong" teaches the writer to write for the judgement. */
  if (has(text, 'strong', 'weak', 'good', 'bad', 'better', 'worse', 'effective',
          'powerful', 'compelling', 'improve', 'improved', 'polished', 'works well',
          'well written', 'nicely done'))
    return { ok: false, refusal: 'evaluates' };

  /* MAIA does not hand back a version of the writer's sentence as the answer.
     Where she offers example language it must be clearly optional and separate
     until the writer adopts it — never presented as the reply. */
  if (has(text, 'try this', 'here is a version', "here's a version", 'rewritten',
          'you could write', 'for example you might write', 'revised'))
    return { ok: false, refusal: 'rewrites_for_the_writer' };

  /* GO CLOSER is creative permission. It is not an instruction to disclose,
     and the gap between them is the whole of flow §10. */
  if (has(text, 'tell me what happened', 'what really happened', 'what are you hiding',
          'you must have felt', 'share more about', 'open up', 'be honest about',
          'what are you afraid'))
    return { ok: false, refusal: 'presses_for_disclosure' };

  /* A lens is a way of looking, not a label for the passage. */
  if (/\bthis (?:passage|paragraph|section|writing) is (?:a|an|very|quite|really)\b/i.test(text)
      || has(text, 'water passage', 'fire passage', 'image passage', 'lyrical passage',
             'type of writing', 'kind of passage'))
    return { ok: false, refusal: 'classifies_the_passage' };

  /* LV-H: v1 does not hand MAIA enough of the manuscript to compare a sentence
     with the whole Work, so she may not claim to have done so. Insufficiency is
     spoken; it is not covered over with a confident-sounding claim. */
  if (has(text, 'the rest of the book', 'the rest of the manuscript', 'elsewhere in the work',
          'elsewhere in the manuscript', 'your usual', 'your established voice',
          'unlike the rest', 'compared to the rest', 'throughout the work',
          'throughout the manuscript'))
    return { ok: false, refusal: 'claims_the_works_voice' };

  /* And she may not act as though she saw more than was offered. */
  if (has(text, 'the surrounding', 'the previous paragraph', 'the next paragraph',
          'earlier in this chapter', 'later in this chapter', 'the whole chapter'))
    return { ok: false, refusal: 'reaches_beyond_the_passage' };

  return { ok: true, text };
}

const SYSTEM = `You are MAIA, reading one passage a writer has handed you inside their Studio.

The writer chose this passage and chose a lens. You are a thoughtful reader and
a creative companion — not a grader, editor, critic, therapist or ghostwriter.

Offer ONE brief noticing and ONE invitation. Two or three sentences at most.

NOTICE what is actually happening in these words. Then invite the writer toward
a possibility they might not have considered. The writer does the writing.

NEVER:
- say the passage needs, lacks or is missing anything
- evaluate it as strong, weak, good, better, effective or powerful
- rewrite it, or offer a version of their sentence as your answer
- ask what really happened, or press the writer to disclose anything
- label the passage as a type or kind of writing
- refer to the rest of the manuscript, their usual voice, or anything you
  were not given — you have ONLY this passage
- mention surrounding paragraphs, the chapter, or the whole work

If you need more text to say something true, say only that the passage on its
own does not show you enough, and stop. Do not guess.

Write plainly. No exclamation marks. Do not flatter.`;

const LENS_INSTRUCTION: Record<LivingVoiceLens, string> = {
  see: 'Attend to what the reader can picture. Notice what is concrete here and what stays abstract, then invite the writer toward something visible.',
  feel: 'Attend to where the feeling lives. Notice whether it is stated or embodied in something particular, then invite the writer toward the concrete.',
  hear: 'Attend to rhythm and sound. Notice how the sentences move when read aloud, then invite the writer to listen to one of them.',
  goCloser: 'Attend to what the writing approaches without saying. Invite the writer to move nearer to it if they wish. This is creative permission, never a request to disclose anything personal.',
  clarify: 'Attend to whether the writing knows what it is doing. Complexity is not a fault; obscurity that is not doing work may be. Invite the writer to see what the passage is actually saying.',
};

export const LIVING_VOICE_MODEL =
  process.env.MAIA_LIVING_VOICE_MODEL || 'claude-opus-5';

/**
 * One encounter, and THREE distinct outcomes.
 *
 * ── WHY SILENCE AND UNAVAILABILITY MAY NOT SHARE A RETURN VALUE ───────────
 *
 * An earlier cut returned `string | null`, and both of these produced `null`:
 *
 *     MAIA had nothing that held to her own rules   →  lawful silence
 *     the inference seam refused the call            →  nothing happened
 *
 * They are not the same event and must never look the same to the writer. A
 * missing key, or `sovereign` mode with no local provider, would have rendered
 * as "Nothing to add to this one" — an infrastructure refusal wearing the
 * costume of a constitutional outcome. A writer would then have witnessed
 * Living Voice declining to speak about their passage when in fact Living
 * Voice was never reached.
 *
 * ⛔ THE DISTINCTION IS THE SOURCE OF THE REFUSAL, NOT ITS SEVERITY:
 *
 *     refusal to INFER     infrastructure  →  'unavailable'  →  say so
 *     refusal to RESPOND   constitutional  →  'silent'       →  say nothing
 *
 * So every content-based outcome stays silence — a response that fails the
 * form contract, an empty completion, a passage that cannot be checked. Only
 * the seam declining to run at all becomes `unavailable`. Silence remains
 * lawful, unremarkable, and never something to retry; it just stops being the
 * bucket that a broken deployment falls into.
 */
export type LivingVoiceOutcome =
  | { readonly kind: 'response'; readonly text: string }
  /** Lawful. MAIA looked and had nothing worth saying. Not an error. */
  | { readonly kind: 'silent' }
  /** The encounter could not happen. Nothing was looked at. */
  | { readonly kind: 'unavailable' };

export async function livingVoiceEncounter(
  input: { passage: string; lens: LivingVoiceLens; sectionHeading?: string | null },
  model: string = LIVING_VOICE_MODEL,
): Promise<LivingVoiceOutcome> {
  const checked = checkPassage(input.passage);
  if (!checked.ok) return { kind: 'silent' };

  /* ONLY what LV-H authorizes: the exact passage, the chosen lens, and minimal
     anchor information to situate it. Nothing else about the Work travels. */
  const anchor = input.sectionHeading ? `\n\nFrom a section the writer titled "${input.sectionHeading}".` : '';
  const outcome = await runStructured({
    model,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `${LENS_INSTRUCTION[input.lens]}${anchor}\n\nThe passage the writer chose:\n\n${checked.passage}`,
    }],
    maxTokens: 220,
  });

  /* The seam refused to run. Not silence — the passage was never looked at. */
  if (!outcome.ok) return { kind: 'unavailable' };

  const text = outcome.result.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  /* From here down every outcome is content, so every failure is silence: the
     check is the product, and a response that cannot hold to its own rules is
     a response MAIA does not make. */
  const verdict = checkLivingVoiceResponse(text);
  return verdict.ok ? { kind: 'response', text: verdict.text } : { kind: 'silent' };
}
