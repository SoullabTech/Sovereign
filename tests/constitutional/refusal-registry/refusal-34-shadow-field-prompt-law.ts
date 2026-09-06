import type { RefusalCheck } from './harness';

/**
 * Refusal 34 — The Field's prompt law forbids declaration, etiology, status and scoring.
 *
 * Constitution v0.2 L2 (register ceiling), L5, plus falsifiers F4, F11, F13, F16.
 * The prompt text is the enforcement surface for what MAIA may say about a member inside
 * the Field. This check pins the prohibitions that a later "improvement" would most
 * plausibly soften.
 */

const PROMPTS = 'lib/maia/shadowField/prompts.ts';
const TYPES = 'lib/maia/shadowField/types.ts';

/** Each prohibition must be present, in force, in the prompt law. */
const REQUIRED: readonly [string, string][] = [
  ['never says "this is your shadow"', 'this is your shadow'],
  ['never declares projection as fact', 'you are projecting'],
  ['forbids supplying an unreported past (F16)', 'may not supply the missing past'],
  ['forbids progress / integration / mastery language (F13)', 'Never report progress'],
  ['forbids assigning an element, type or score (F11)', 'Never assign an element, a type, a score'],
  ['forbids modelling the absent person (L5)', 'Never answer what an absent person really meant'],
  ['forbids pointing back at another MAIA conversation (F15)', 'Another conversation with you is NOT among them'],
  ['names the register ceiling (F4)', 'You may speak in ONLY the last three registers'],
];

export const check: RefusalCheck = {
  id: 'R34',
  refusal:
    'Inside the Shadow Field MAIA offers possibilities and never declares the member\'s unconscious, supplies a past they did not report, scores them, or reports progress',
  grade: 'Proposed',
  enforcedBy:
    'lib/maia/shadowField/prompts.ts FIELD_LAW + per-movement law; SYSTEM_AUTHORED_REGISTER_CEILING in types.ts',
  evidence:
    'encounter and stay movements admit no possibility at all; differentiate admits one at a time, marked and refusable',
  violationAttempted:
    'delete or soften any of the eight named prohibitions, or widen the system-authored register ceiling beyond possibility / archetypal / unknown',
  passingAuthorizes:
    'the prompt law as written forbids the declaration, etiology, scoring and status failures',
  passingDoesNotAuthorize:
    'it does not establish that the model OBEYS the prompt — that is the offline rater and the founder walk (F4, F7, F13, F15, F16 rater halves), not this check',
  hostileForkMustChange:
    'a fork wanting diagnostic shadow work would have to remove these sentences from the prompt, which this check enumerates',
  run(io) {
    const prompts = io.read(PROMPTS);
    for (const [label, needle] of REQUIRED) {
      if (prompts.includes(needle)) io.pass(label);
      else io.fail(`prompt law no longer ${label}`, `missing: "${needle}"`);
    }

    const types = io.read(TYPES);
    const ceiling = types.slice(types.indexOf('SYSTEM_AUTHORED_REGISTER_CEILING'));
    const widened = /'observed'|'felt'|'member_interpretation'/.test(
      ceiling.slice(0, ceiling.indexOf(']')),
    );
    if (!widened) io.pass('system-authored register ceiling is possibility / archetypal / unknown');
    else io.fail('the register ceiling has been widened to a member-authored register');

    // Encounter and Stay admit no MAIA possibility.
    if (/Offer no possibility yet — not one/.test(prompts) && /Still no possibility/.test(prompts)) {
      io.pass('encounter and stay admit no system-authored possibility');
    } else {
      io.fail('the pre-differentiation movements now admit a possibility');
    }
  },
};
