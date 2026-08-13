import type { RefusalCheck } from './harness';

/**
 * Refusal 23 — ConsciousnessPolicy may inform how MAIA speaks. It may not decide
 * whether the member is answered.
 *
 * This refusal is PROTECTIVE, not remedial. NSR-001 Phase 1 (sealed, standing map
 * blob 198d65d0e60073302c0633efe58c529ea6bd5f94) recorded ConsciousnessPolicy as
 * CURRENT_STANDING_APPEARS_WARRANTED — the one awareness mechanism in that census
 * whose jurisdiction matched its class. It is warranted by three structural
 * properties, none of them documentary:
 *
 *   1. an explicit abstention floor — it declines to speak about a member it has
 *      insufficient evidence about (totalBeads < 20, or no rows at all);
 *   2. the sample size is carried into the prompt alongside the claim, so the
 *      consumer receives the evidence base with the assertion;
 *   3. jurisdiction matched to class — it shapes register and disclosure only.
 *
 * Its immediate neighbour in the same file is the opposite case: an accumulated
 * heuristic average (cognitiveProfile.rollingAverage, surfaced as cognitiveAltitude)
 * that reaches AUTHORITY/GATE and can terminate a turn before generation, recorded
 * as WARRANT: NONE FOUND. The two share a file and a vocabulary but no table, no
 * data, and no code path. That adjacency is exactly why this check exists: a later
 * rehabilitation reading the standing map as a repair list would rebuild whatever it
 * did not find recorded as working, and "same subsystem" is not an authority class.
 *
 * Equally, this refusal must not become the vector by which the good mechanism grows.
 * A capacity that may abstain, that publishes its own sample size, and that cannot
 * block, is worth protecting AT THAT SIZE. Growth is a separate authorization.
 *
 * Grade B — two of the three limbs are code chokepoints (the floor, the additive
 * return); the third is bounded absence-of-code (no control-flow use of `policy`
 * within the one module that consumes it). A fork defeats it only by removing the
 * floor, making the adaptation non-additive, or giving the policy control-flow
 * authority — all visible diffs.
 *
 * SCOPE — the classification this protects is:
 *
 *     GOOD-STANDING MECHANISM / RUNTIME POPULATION UNPROVEN
 *
 * This check pins the mechanism's JURISDICTIONAL SHAPE. It asserts nothing about
 * whether bead_events is populated in production, and therefore nothing about
 * whether any member is currently experiencing this adaptation. Passing is not
 * evidence that the capacity is live.
 */

const SERVICE = 'lib/sovereign/maiaService.ts';
const ADAPTER = 'lib/consciousness/awareness-levels.ts';

// ── Limb 1: the abstention floor ──
// Both floors, inside the producer. The bead floor is the one that distinguishes this
// mechanism from its ungoverned neighbour, which has no floor at all.
const BEAD_FLOOR_RE = /if\s*\(\s*totalBeads\s*<\s*20\s*\)\s*return null/;
const EMPTY_ROWS_FLOOR_RE = /if\s*\(\s*result\.rows\.length\s*===\s*0\s*\)\s*return null/;

// ── Limb 2: the sample size travels with the claim ──
const SAMPLE_SIZE_RE = /\[SAMPLE SIZE:\s*\$\{policy\.totalBeads\}\s*beads\]/;

// ── Limb 3a: the adaptation is purely additive ──
// `basePrompt + adaptation` cannot remove, reorder or replace canonical context. A
// rewrite (returning `adaptation` alone, or a template that drops basePrompt) would
// convert influence into substitution — the SECREM-001 shape.
// SCOPED TO THE FUNCTION BODY, deliberately. A file-wide test for this pattern passes
// on the wrong evidence: awareness-levels.ts contains a second, unrelated additive
// return in adaptResponsePrompt (the non-policy variant). Mutation testing caught this
// — rewriting adaptResponsePromptWithPolicy to `return adaptation;` left the file-wide
// check green because the sibling function still matched. Availability of the pattern
// somewhere in the file is not evidence about the function under refusal.
const ADDITIVE_RE = /return\s+basePrompt\s*\+\s*adaptation\s*;/;
const POLICY_FN_RE = /export function adaptResponsePromptWithPolicy/;
const POLICY_FN_BODY_RE = /export function adaptResponsePromptWithPolicy\([\s\S]*?\n\}/;

// ── Limb 3b: no control-flow authority ──
// Every consumption site must be `if (policy)` guarded, and `policy` must never appear
// on a line that could block, reroute, or end the turn. `return policy` is exempt: it
// is the producer handing back its own result.
const CONTROL_FLOW_RE =
  /^(?!.*\breturn policy\b).*\bpolicy\b.*\b(throw|processingProfile|fieldWorkSafe|deepWorkRecommended|allowed|realm)\b/;
const BARE_RETURN_RE = /^(?!.*\breturn policy\b).*\bpolicy\b.*\breturn\b/;

// ── Limb 4: independence from the Row 1 gate ──
// The producer must not read the accumulated Bloom average or the field-safety flag.
// If it did, the abstention floor would be decorative: the policy would inherit the
// standing of a mechanism that has none.
const PRODUCER_RE = /async function getConsciousnessPolicy\([\s\S]*?\n\}/;
const GATE_DEPENDENCY_RE = /rollingAverage|cognitiveAltitude|fieldWorkSafe|cognitiveProfile/;

/** Source lines with `//` and `*` comment lines removed, for absence checks. */
function codeLines(src: string): string[] {
  return src
    .split('\n')
    .filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l));
}

export const check: RefusalCheck = {
  id: 'R23',
  refusal:
    'ConsciousnessPolicy may shape register and disclosure only. It may not block, reroute, change tier, or terminate a turn; it must abstain below its evidence floor; and it must not derive its standing from the ungated cognitive average adjacent to it',
  grade: 'B',
  enforcedBy:
    'lib/sovereign/maiaService.ts — getConsciousnessPolicy returns null below 20 beads and on empty rows; every consumption site is `if (policy)` guarded and calls only adaptResponsePromptWithPolicy; lib/consciousness/awareness-levels.ts — the adaptation returns basePrompt + adaptation and writes [SAMPLE SIZE] into the prompt',
  evidence: [
    `${SERVICE}: abstention floor \`if (totalBeads < 20) return null\` plus empty-rows floor, inside the producer`,
    `${ADAPTER}: \`[SAMPLE SIZE: \${policy.totalBeads} beads]\` — the evidence base is carried to the point of use`,
    `${ADAPTER}: \`return basePrompt + adaptation\` — purely additive, cannot displace canonical context`,
    `${SERVICE}: no line mentioning \`policy\` participates in routing, blocking or termination`,
    `${SERVICE}: getConsciousnessPolicy reads bead_events only — never rollingAverage/cognitiveAltitude/fieldWorkSafe`,
  ].join(' | '),
  violationAttempted: [
    '(1) has the abstention floor been lowered or removed, so the policy speaks about members it has thin evidence for?',
    '(2) has the sample size been dropped, so the claim arrives without its evidence base?',
    '(3) has the adaptation stopped being additive, so it can displace canonical context rather than shape it?',
    '(4) has `policy` acquired control-flow authority — routing, blocking, tier change, or turn termination?',
    '(5) has the producer started reading the ungated cognitive average or field-safety flag, inheriting standing it has not earned?',
  ].join('; '),
  passingAuthorizes:
    'the claim that ConsciousnessPolicy retains the jurisdictional shape recorded as warranted in the sealed NSR-001 Phase 1 standing map — abstains below its evidence floor, publishes its sample size, influences register only, holds no control-flow authority, and is independent of the adjacent ungated cognitive average. Rehabilitation of that neighbour therefore does not require touching this mechanism',
  passingDoesNotAuthorize:
    'that members are currently experiencing this adaptation — bead_events runtime population is UNPROVEN and this check reads source only, never data; that the awareness inference is valid (inferAwarenessLevel is a heuristic and its accuracy is untested); that the policy SHOULD be extended (protecting a capacity at its current size is not a licence to grow it — broader jurisdiction needs its own warrant); or that other awareness mechanisms in the same subsystem are governed (proximity is not an authority class — four further detectors exist and are dormant, not blessed)',
  hostileForkMustChange:
    'lower or delete the `totalBeads < 20` floor (visible diff), remove the [SAMPLE SIZE] interpolation (visible diff), change `return basePrompt + adaptation` to a replacing return (visible diff), reference `policy` in a routing/blocking/termination expression (visible diff), or make getConsciousnessPolicy read rollingAverage/fieldWorkSafe (visible diff)',

  run(io) {
    const service = io.read(SERVICE);
    const adapter = io.read(ADAPTER);

    // ── 1: abstention floor ──
    const beadFloor = BEAD_FLOOR_RE.test(service);
    const rowsFloor = EMPTY_ROWS_FLOOR_RE.test(service);
    if (beadFloor && rowsFloor) {
      io.pass(
        'the policy abstains below its evidence floor',
        'returns null under 20 beads and on empty rows — it declines to speak about a member it has insufficient evidence about',
      );
    } else {
      io.fail(
        'abstention floor weakened or absent',
        `beadFloor=${beadFloor} emptyRowsFloor=${rowsFloor} — without a floor this becomes an ungoverned inference like its neighbour`,
      );
    }

    // ── 2: sample size travels with the claim ──
    if (SAMPLE_SIZE_RE.test(adapter)) {
      io.pass(
        'the sample size is carried into the prompt',
        'the consumer receives the evidence base alongside the claim, not the claim alone',
      );
    } else {
      io.fail(
        'the claim now arrives without its evidence base',
        '[SAMPLE SIZE: ${policy.totalBeads} beads] is no longer written into the prompt',
      );
    }

    // ── 3a: additive, not substituting — inside the policy function specifically ──
    const adaptBody = POLICY_FN_BODY_RE.exec(adapter)?.[0] ?? '';
    if (adaptBody && ADDITIVE_RE.test(adaptBody)) {
      io.pass(
        'the adaptation is purely additive',
        'adaptResponsePromptWithPolicy returns basePrompt + adaptation — it cannot remove, reorder or replace canonical context',
      );
    } else if (!adaptBody) {
      io.fail(
        'adaptResponsePromptWithPolicy not found — the check cannot establish additivity',
        `fnPresent=${POLICY_FN_RE.test(adapter)} — renamed or restructured; re-derive before trusting this refusal`,
      );
    } else {
      io.fail(
        'the adaptation may now displace canonical context',
        'adaptResponsePromptWithPolicy no longer returns basePrompt + adaptation — substitution is the SECREM-001 shape',
      );
    }

    // ── 3b: no control-flow authority ──
    const lines = codeLines(service);
    const controlFlow = lines.filter(l => CONTROL_FLOW_RE.test(l));
    const bareReturns = lines.filter(l => BARE_RETURN_RE.test(l));
    const offenders = [...controlFlow, ...bareReturns];
    if (offenders.length === 0) {
      io.pass(
        'the policy holds no control-flow authority',
        'no line mentioning `policy` participates in routing, blocking, tier selection or termination — it cannot end an encounter',
      );
    } else {
      io.fail(
        'the policy has acquired control-flow authority',
        `${offenders.length} line(s): ${offenders.slice(0, 3).map(l => l.trim().slice(0, 90)).join(' // ')}`,
      );
    }

    // ── 4: independent of the ungated neighbour ──
    const producer = PRODUCER_RE.exec(service)?.[0] ?? '';
    if (producer && !GATE_DEPENDENCY_RE.test(producer)) {
      io.pass(
        'the policy is independent of the adjacent ungated cognitive average',
        'getConsciousnessPolicy reads bead_events only — repairing the neighbour requires no change here',
      );
    } else if (!producer) {
      io.fail(
        'producer not found — the check cannot establish independence',
        'getConsciousnessPolicy was renamed or restructured; re-derive before trusting this refusal',
      );
    } else {
      io.fail(
        'the policy now depends on the ungated cognitive average or the field-safety flag',
        'it would inherit standing from a mechanism recorded as WARRANT: NONE FOUND, making its own floor decorative',
      );
    }
  },
};
