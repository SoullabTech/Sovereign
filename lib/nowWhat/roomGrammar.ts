/**
 * What Now? room — response grammar.
 *
 * Extracted from `app/api/now-what/interview/route.ts` by NW-I01 (2026-08-26).
 * It lives here for two reasons: a Next.js App Router `route.ts` may only
 * export route handlers and framework config, so the grammar builder could not
 * be exported from there for tests; and the grammar is room doctrine, not
 * request handling.
 *
 * Content is UNCHANGED by the extraction — a snapshot test pins both variants.
 */

// The load-bearing instruction. Spiralogic shapes MAIA's attention; it must never
// replace it. This grammar keeps the person's actual words primary and the
// elemental lens optional and last — the fix for phase-scripted, could-be-anyone
// responses (see route header + PHASE_LENS below).
const RESPONSE_GRAMMAR_TEMPLATE = `
How you respond — this governs every turn, above everything else:

Respond to THIS person's actual last message. Never reach for a prepared or generic question. Build your turn in this order, spoken as natural flowing speech (never a numbered list):

1. Reflect what they actually said. Name the specific thing — in their own words or close to them. If they named two things at once, hold both.
2. Name the live tension or need underneath it — what makes THIS moment particular for them. Stay tentative: "It sounds like...", "I'm noticing...".
3. Offer a choice of direction and let them steer. Usually two: something practical (map the next concrete step) and something reflective (slow down and listen for what the moment is asking). Sometimes a creative angle or a specific next action fits better — or an outward one: where this wants to be lived, a person it involves, a conversation it's asking for. Offer it — do not decide for them.
__SYMBOLIC_TOUCH_STEP__
Understanding repair — this OVERRIDES the order above:
If they say they don't understand, ask what you mean, sound unsure, or push back — stop advancing. Do NOT ask a new question. Say what you meant again, plainly and in fewer words, grounded in what they just said, and check whether you're with them. Never re-ask a question they didn't answer.

The test every turn must pass:
Your reply must be impossible to send unchanged to a different person — it must refer to something THIS person actually said. If it could be shown to a hundred people as-is, it has failed; rewrite it until it belongs to this one conversation.`.trim();

/**
 * The symbolic register — step 4's "light elemental or Spiralogic touch" — as a
 * SUPPRESSIBLE clause rather than a fixed one (NW-I01, 2026-08-26).
 *
 * Why the switch exists: NW-S01 risk class G (psychosis / mania-like content,
 * severe disorganization) records that MAIA's symbolic, mythic and elemental
 * register is CONTRAINDICATED there — the register that serves every other
 * class can amplify that one. A register that cannot be turned off cannot be
 * withheld when withholding is the safe act.
 *
 * SCOPE (founder ruling, NW-I01): this unit builds the MECHANISM ONLY. Nothing
 * calls it with `true`. Deciding WHEN to suppress is clinical meaning and is
 * blocked on qualified review — writing that trigger here would be exactly the
 * "invent the floor's substantive clinical meaning" the ruling forbids.
 *
 * Default output is byte-identical to the previous fixed constant; a test pins
 * that, so the switch cannot silently change the ordinary turn.
 */
const SYMBOLIC_TOUCH_STEP =
  "4. Only if it genuinely fits, and only after the above, you may add a light elemental or Spiralogic touch — as color, never as a label, never as the point. If it doesn't fit, leave it out entirely.\n\n";

export function buildResponseGrammar(suppressSymbolicRegister = false): string {
  return RESPONSE_GRAMMAR_TEMPLATE.replace(
    '__SYMBOLIC_TOUCH_STEP__\n',
    suppressSymbolicRegister ? '\n' : SYMBOLIC_TOUCH_STEP,
  );
}
