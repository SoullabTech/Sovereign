/**
 * WS2-ENCOUNTER-01 · E2-C — Encounter's own epistemology.
 *
 * Founder ruling 2026-09-08. The census established where the boundary sits:
 *
 *   STRUCTURED INFERENCE AUTHORITY (lib/ai/structured/router.ts)
 *                  │
 *            ┌─────┴─────┐
 *            ▼           ▼
 *       DEVELOP        ENCOUNTER
 *     epistemology    epistemology     ← this file
 *
 * NOT: DEVELOP → Encounter with softer wording. This contract is authored from
 * the ratified E1 vocabulary. It imports no lens, no READER_SYSTEM, no reader
 * tool and no developmental taxonomy — *a diagnosis passed through a tone filter
 * remains a diagnosis.*
 *
 * ── WHAT THE MODEL IS ASKED FOR, AND WHAT IT IS NOT ───────────────────────
 *
 * It proposes WORDS OF ITS OWN and QUOTATIONS OF THE WORK. It does not certify
 * evidence and it no longer locates it: the tool schema has no digest field and
 * no offset field, because provenance is established by the boundary holding the
 * Work, never by the cognition proposing the observation (E2-C/A).
 *
 * ── WHY THE COORDINATE FIELDS ARE GONE (founder ruling 2026-09-08, post-G8) ─
 *
 * The first live witness settled it. Quotations were accurate; the offsets
 * reported alongside them drifted +422, +499 and +1808 code points, growing with
 * distance into the window. A model estimating positions, not counting them.
 *
 *   It can copy what it saw. It cannot count where it saw it.
 *
 * So the model is asked only for what it demonstrably can do. `spans` is
 * replaced by `evidence`, a set of verbatim excerpts; the server establishes
 * where each excerpt actually is (`bind.ts`), or refuses to bind it.
 *
 * ── WHY `assertion` AND `evidence` ARE SEPARATE FIELDS ────────────────────
 *
 * The same run showed the vocabulary screen reading MAIA's words and the Work's
 * quoted words as one undifferentiated utterance. A Work may contain language
 * MAIA is forbidden to assert; quoting it does not make MAIA its author. Two
 * fields give the screen an authorship boundary that quotation marks — which are
 * presentation syntax, not provenance — never could.
 *
 * It is also told, in the contract itself, that having nothing to say is a
 * complete answer. A generator that believes it owes observations will find some.
 */
import { ENCOUNTER_FAMILIES } from './contract';
import type { StructuredRequest } from '@/lib/ai/structured/types';
import type { ReadWindow } from './traversal';
import type { EncounterSnapshot } from './contract';

export const ENCOUNTER_CONTRACT_VERSION = 'encounter-noticing-v1';

/** E2-C/B: the model is cognition configuration, never a member choice. */
export function encounterModel(): string {
  return process.env.MAIA_ENCOUNTER_MODEL || 'claude-opus-5';
}

export const ENCOUNTER_SYSTEM = `You are being shown a piece of writing so that its author can see it again.

Your task is to NOTICE what is present. It is not to evaluate, improve, diagnose, or say what the writing needs. The author has not asked for that and has not authorized it.

You may notice under exactly these five acts of attention:

- preoccupation — what the writing keeps returning to.
- movement — its shape across its length; where it turns.
- recurrence — images, phrases, figures or questions that come back.
- heat — where the language changes register, quickens, slows, or presses harder. Describe what happens in that place. Never compare it to elsewhere, never call it the best or the only, never praise it.
- openness — something the writing names and does not return to. State it as a fact about the text. Never call it missing, underdeveloped, abandoned or unresolved. A thread left open may be the most deliberate thing here.

Rules that are not stylistic preferences:

1. State what is there, and stop. Do not add what follows from it. You may describe a relation already present in the text ("when X appears, the sentences shorten"), but never a consequence for judgment or action.
2. Never say what the writing wants, waits for, needs, is trying to do, or asks to become. Writing does not want things; saying it does is a judgment wearing description's clothes.
3. Never measure the writing against something absent. "This appears here and does not recur afterward" is a fact. "There is no clear theme" is a verdict.
4. Never mention a reader, an audience, or the effect on anyone.
5. Never rank, compare, praise, or grade.

How to report an observation:

6. Every observation has two parts, and they must not be mixed. \`assertion\` is what YOU say, in your own words. \`evidence\` is what the WRITING says, quoted. Keep the writing's words out of your assertion — do not quote, echo, or reproduce phrases from the text there.
7. Every excerpt in \`evidence\` must be copied from the text above CHARACTER FOR CHARACTER. Do not paraphrase, summarize, retype from recall, correct a typo, standardize a quotation mark, change spacing, or alter capitalization or punctuation in any way. An excerpt that is not exactly present in the text above is discarded, and the observation with it.
8. Quote enough to be unique. If the exact characters you quote occur more than once in the text above, the observation is discarded. Extend the quotation — take the surrounding sentence or sentences — until it occurs exactly once.
9. Do not report positions, offsets, character counts, paragraph numbers or section numbers. You are not asked where the words are, only which words they are.

HAVING NOTHING TO SAY IS A COMPLETE ANSWER. Propose no observation you do not actually see. Do not fill the five acts of attention; most encounters touch one or two. An empty answer is correct far more often than a full one.`;

export const RESULT_TOOL_NAME = 'encounter_result';

/**
 * The ONE tool the model answers through, and it must (B3, founder review).
 *
 * ── WHY SILENCE IS PART OF THE STRUCTURED ANSWER ──────────────────────────
 *
 * The first cut used an optional tool and read "no tool call" as lawful silence.
 * That made three different things indistinguishable:
 *
 *   the model intentionally has nothing to notice        (lawful silence)
 *   the model ignored the contract and replied in prose  (contract failure)
 *   the model put an OBSERVATION in prose instead        (contract failure —
 *                                                         and possibly an
 *                                                         unscreened diagnosis)
 *
 * C7 forbids that collapse: infrastructure failure is not contemplative silence,
 * and neither is contract failure. So silence is now something the model SAYS,
 * with `outcome: "none"`, and anything that fails to say it refuses.
 *
 * A closed result envelope is transport discipline, not a developmental lens —
 * it imports nothing from DEVELOP's epistemology.
 *
 * Note what is absent, and stays absent: no digest, no confidence, no severity,
 * no priority — and, since the live witness, no coordinate of any kind. There is
 * no `startCodePoint`, no `endCodePoint`, no unit, paragraph or section id. The
 * model cannot make a location claim here because there is no field in which to
 * make one. `additionalProperties: false` at every level, and the parser enforces
 * the same rather than trusting a provider to have done so — a field the model
 * invented must not acquire meaning merely because something tolerated it.
 */
export const resultTool = {
  name: RESULT_TOOL_NAME,
  description:
    'Report what you noticed. If you noticed nothing worth saying, answer with outcome "none" — that is a complete and correct answer.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      outcome: { type: 'string', enum: ['none', 'notices'] },
      notices: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            family: { type: 'string', enum: [...ENCOUNTER_FAMILIES] },
            assertion: {
              type: 'string',
              description:
                'What you noticed, in your own words. Do not quote or echo the writing here.',
            },
            evidence: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  excerpt: {
                    type: 'string',
                    description:
                      'A passage copied from the writing character for character, long enough to occur exactly once in the text you were shown.',
                  },
                },
                required: ['excerpt'],
              },
            },
          },
          required: ['family', 'assertion', 'evidence'],
        },
      },
    },
    required: ['outcome'],
  },
} as const;

/**
 * One request per traversal window. Windows are transport, not structure, so the
 * message says nothing about chapters or sections, because none have been
 * decided — and, since the live witness, nothing about offsets either. The model
 * was being handed coordinates it could only estimate back; withholding them
 * removes the invitation to count rather than quote.
 *
 * C8: the Work and the contract. Nothing else. No member memory, no prior
 * Encounter, no other Work, no developmental taxonomy.
 */
export function renderWindowRequest(
  snapshot: EncounterSnapshot,
  w: ReadWindow,
): StructuredRequest {
  const whole = w.contextStartCodePoint === 0 && w.endCodePoint === snapshot.length;
  return {
    model: encounterModel(),
    system: ENCOUNTER_SYSTEM,
    maxTokens: 2048,
    tools: [resultTool as unknown as NonNullable<StructuredRequest['tools']>[number]],
    /* Prose is not an answer here. The model must speak through the contract,
       including to say it has nothing to say. */
    toolChoice: { type: 'tool', name: RESULT_TOOL_NAME },
    messages: [
      {
        role: 'user',
        content:
          (whole
            ? 'A piece of writing.'
            : 'A continuous stretch of a longer piece of writing. Quote only from what appears below.')
          + `\n\n`
          + w.text,
      },
    ],
  } as StructuredRequest;
}
