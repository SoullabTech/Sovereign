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
 * It proposes SPANS AND WORDS. It does not certify evidence: the tool schema has
 * no digest field, because provenance is established by the boundary holding the
 * Work, never by the cognition proposing the observation (E2-C/A).
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
6. Every observation must point at specific text you can quote from what you were shown.

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
 * Note what is still absent: no digest, no confidence, no severity, no priority.
 * `additionalProperties: false` at every level, and the parser enforces the same
 * rather than trusting a provider to have done so — a field the model invented
 * must not acquire meaning merely because something tolerated it.
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
            text: { type: 'string' },
            spans: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  startCodePoint: { type: 'integer', minimum: 0 },
                  endCodePoint: { type: 'integer', minimum: 1 },
                },
                required: ['startCodePoint', 'endCodePoint'],
              },
            },
          },
          required: ['family', 'text', 'spans'],
        },
      },
    },
    required: ['outcome'],
  },
} as const;

/**
 * One request per traversal window. Windows are transport, not structure, so the
 * message says where in the Work this text sits — the model needs absolute
 * offsets to point at anything — and says nothing about chapters or sections,
 * because none have been decided.
 *
 * C8: the Work, the contract, and the coordinates needed to bind evidence.
 * Nothing else. No member memory, no prior Encounter, no other Work, no
 * developmental taxonomy. Transport coordinates are not semantic context.
 */
export function renderWindowRequest(
  snapshot: EncounterSnapshot,
  w: ReadWindow,
): StructuredRequest {
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
          `Character offsets ${w.contextStartCodePoint} to ${w.endCodePoint} of a ${snapshot.length}-character piece of writing. `
          + `Offsets in any span you report are absolute within the whole piece.\n\n`
          + w.text,
      },
    ],
  } as StructuredRequest;
}
