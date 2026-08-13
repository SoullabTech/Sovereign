import type { RefusalCheck } from './harness';

/**
 * Refusal 24 — Cross-session continuity must fail loudly and describe itself
 * truthfully, on EVERY tier that recalls it. It may not fail silently, it may not
 * report a turn count that contradicts what was injected, and it may not lose a
 * member's whole history to a single unpaired turn.
 *
 * Three defects, present at the shared parent 52b00bd39 and repaired by the
 * reconciled TODAY lineage:
 *
 *   1. PARITY-BRITTLE PAIRING, TWICE. Both the CORE (:1508) and DEEP (:1888) recall
 *      blocks strode `i += 2` and required role 'user' at every even index. One orphan
 *      turn — a leading assistant turn, a member send whose MAIA turn was never
 *      written, a tier returning early before logging its side — shifts parity for
 *      every subsequent turn, so the loop yields zero pairs and the member's whole
 *      cross-session history vanishes from the prompt.
 *
 *   2. SILENT ZERO-PAIR FAILURE. The only logs lived inside `if (pairs.length > 0)`.
 *      The failure case emitted nothing, so "turns fetched but none paired" was
 *      indistinguishable from "this member has no history".
 *
 *   3. UNTRUTHFUL SUMMARY. `MaiaContext.summary` counted `conversationHistory`, but the
 *      recall branch only runs when `conversationHistory.length === 0` — so whenever
 *      recall worked, the summary said "1 turns" while prior exchanges were in the
 *      prompt. Wrong precisely when continuity was functioning, and reaching the model.
 *
 * WHY THIS CHECK IS SCOPED TO THE FILE AND NOT TO ONE BLOCK
 *
 * The first version of this refusal bound its assertions to the CORE recall block,
 * because that is where the fix it was written alongside had been applied. It passed
 * green while the identical parity bug remained live in the DEEP block a few hundred
 * lines below. A guard scoped to the fix rather than to the risk cannot see the
 * instance nobody remembered to repair. Every limb below is therefore asserted over
 * the whole module, and pairing is required to be a single shared function rather than
 * a pattern repeated per call site — so a future third recall site inherits the
 * property instead of having to re-earn it.
 *
 * The refusal is TRUTHFULNESS AND RELIABILITY, not capability. No retrieval source is
 * added, no reordering or relevance ranking is introduced, and both pre-existing caps
 * (CORE 4, DEEP 5) are asserted unchanged, so a reliability repair cannot become a
 * memory expansion.
 *
 * Grade B — code chokepoints plus one bounded absence (the parity stride must not
 * return anywhere). A fork defeats it only by reinstating a stride, inlining pairing at
 * a call site, silencing a zero-pair branch, reverting the summary, or widening a cap —
 * all visible diffs.
 */

const SERVICE = 'lib/sovereign/maiaService.ts';

// ── Limb 1: pairing is one shared, tolerant function; no parity stride survives ──
const HELPER_RE =
  /export function pairCrossSessionTurns\([\s\S]*?\n\}/;
const PARITY_STRIDE_RE = /for\s*\([^)]*\bi\s*\+=\s*2\s*\)/g;
// Tolerance markers inside the helper: a non-user turn advances rather than aborting,
// and a trailing user turn with no reply does not fabricate a pair.
const TOLERANT_RE = /role !== 'user'[\s\S]{0,80}continue/;
const NO_TRAILING_FABRICATION_RE = /if\s*\(j >= turns\.length\)\s*break/;
const DEFENSIVE_INPUT_RE = /if\s*\(!Array\.isArray\(turns\)\)\s*return pairs/;

// ── Limb 2: every recall site uses the shared helper ──
const CALL_RE = /const pairs = pairCrossSessionTurns\(crossSessionTurns\)/g;
// An inlined re-implementation at a call site would defeat the shared guarantee.
const INLINE_PAIRING_RE = /pairs\.push\(\{\s*\n?\s*userMessage:/g;

// ── Limb 3: zero-pair visibility on every tier ──
const CORE_ABSENT_RE =
  /if\s*\(pairs\.length > 0\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?Cross-Session Recall CORE\] ABSENT/;
const DEEP_ABSENT_RE =
  /if\s*\(pairs\.length > 0\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?Cross-Session Recall DEEP\] ABSENT/;

// ── Limb 4: the summary describes what was injected ──
const TRUTHFUL_SUMMARY_RE =
  /summary:\s*`Conversation: \$\{conversationContext\.profile\.dominantElement\} element, \$\{effectiveHistory\.length \+ 1\} turns`/;
const STALE_SUMMARY_RE =
  /summary:\s*`Conversation:[^`]*\$\{conversationHistory\.length \+ 1\} turns`/;

// ── Limb 5: pre-existing caps unchanged ──
const CORE_CAP_RE = /effectiveHistory = pairs\.slice\(-4\)/;
const DEEP_CAP_RE = /effectiveHistory = pairs\.slice\(-5\)/;

export const check: RefusalCheck = {
  id: 'R24',
  refusal:
    'Cross-session continuity may not fail silently or misreport itself on any tier: pairing must be one shared tolerant function so no recall site loses a member\'s history to parity drift, every zero-pair outcome must be logged, the context summary must count the history actually injected, and the pre-existing per-tier caps must not widen',
  grade: 'B',
  enforcedBy:
    'lib/sovereign/maiaService.ts — pairCrossSessionTurns() is the single pairing implementation and is called at both the CORE and DEEP recall sites; each site warns ABSENT from the else of `if (pairs.length > 0)`; MaiaContext.summary counts effectiveHistory; the CORE slice(-4) and DEEP slice(-5) caps are unchanged from the shared parent',
  evidence: [
    `${SERVICE}: pairCrossSessionTurns advances past non-user turns, refuses to fabricate a pair from a trailing unreplied user turn, and returns empty on non-array input`,
    `${SERVICE}: no \`i += 2\` stride survives anywhere in the module`,
    `${SERVICE}: both recall sites call the shared helper — pairing is not re-implemented per site`,
    `${SERVICE}: CORE and DEEP each emit an ABSENT warning from the else branch`,
    `${SERVICE}: summary interpolates effectiveHistory.length; caps remain slice(-4)/slice(-5)`,
  ].join(' | '),
  violationAttempted: [
    '(1) has a parity stride returned anywhere, so one orphan turn again erases a history?',
    '(2) has pairing been inlined at a call site, so one recall path can drift from the shared guarantee?',
    '(3) does any tier fail to record a zero-pair outcome, making continuity loss invisible there?',
    '(4) does the summary again count the variable the enclosing branch has established is empty?',
    '(5) has a per-tier cap widened, turning a reliability repair into a memory expansion?',
  ].join('; '),
  passingAuthorizes:
    'the claim that on both the CORE and DEEP recall paths a single unpaired turn no longer silently erases a member\'s cross-session history, that a zero-pair outcome on either tier leaves a record instead of resembling a member with no history, that the summary reaching the model states the number of exchanges actually injected, and that no per-tier memory cap widened in the process',
  passingDoesNotAuthorize:
    'that cross-session continuity WORKS for any member — this reads source only and never data, so it says nothing about whether turns are being written or whether pairs exist in production; that the FAST path is covered (it uses a separate recentContext path and is not asserted here); that DEEP is exercised at all (observed DEEP prevalence is 0%); that the 4/5 caps are correct (they are merely unchanged); or that memory reaching the prompt influenced the response (composition is not influence)',
  hostileForkMustChange:
    'reinstate an `i += 2` stride (visible diff), inline pairing at a recall site instead of calling pairCrossSessionTurns (visible diff), remove or unreachable-guard a tier\'s ABSENT warning (visible diff), revert the summary to conversationHistory.length (visible diff), or change slice(-4)/slice(-5) (visible diff)',

  run(io) {
    const src = io.read(SERVICE);

    // ── 1: one shared, tolerant pairing implementation ──
    const helper = HELPER_RE.exec(src)?.[0] ?? '';
    const strides = src.match(PARITY_STRIDE_RE) ?? [];
    const tolerant =
      !!helper &&
      TOLERANT_RE.test(helper) &&
      NO_TRAILING_FABRICATION_RE.test(helper) &&
      DEFENSIVE_INPUT_RE.test(helper);
    if (tolerant && strides.length === 0) {
      io.pass(
        'pairing is one shared tolerant function and no parity stride survives',
        'advances past non-user turns, will not fabricate a pair from a trailing unreplied turn, empty on non-array input',
      );
    } else {
      io.fail(
        'pairing is parity-brittle or no longer shared',
        `helperFound=${!!helper} tolerant=${tolerant} parityStrides=${strides.length} — one orphan turn can erase a member's history`,
      );
    }

    // ── 2: every recall site uses it; none re-implements it ──
    // The helper legitimately contains the only `pairs.push({ userMessage: ... })` in
    // the module, so it is excised before counting re-implementations. Counting it
    // would fail the check on the very construct it exists to require.
    const outsideHelper = helper ? src.replace(helper, '') : src;
    const calls = (src.match(CALL_RE) ?? []).length;
    const inlines = (outsideHelper.match(INLINE_PAIRING_RE) ?? []).length;
    if (calls >= 2 && inlines === 0) {
      io.pass(
        'every recall site uses the shared helper',
        `${calls} call sites (CORE + DEEP), no inlined re-implementation — a future site inherits the property`,
      );
    } else {
      io.fail(
        'a recall site does not share the pairing guarantee',
        `sharedCalls=${calls} inlinedImplementations=${inlines} — this is how DEEP stayed broken while CORE was fixed`,
      );
    }

    // ── 3: zero-pair visibility on every tier ──
    const core = CORE_ABSENT_RE.test(src);
    const deep = DEEP_ABSENT_RE.test(src);
    if (core && deep) {
      io.pass(
        'every tier records a zero-pair outcome',
        'CORE and DEEP both warn ABSENT from the else branch — continuity failure is distinguishable from having no history',
      );
    } else {
      io.fail(
        'continuity failure is silent on at least one tier',
        `coreAbsentLog=${core} deepAbsentLog=${deep} — an absent log reads as an absent history`,
      );
    }

    // ── 4: truthful summary ──
    const truthful = TRUTHFUL_SUMMARY_RE.test(src);
    const stale = STALE_SUMMARY_RE.test(src);
    if (truthful && !stale) {
      io.pass(
        'the summary counts the history actually injected',
        'interpolates effectiveHistory.length — not a variable the enclosing branch has established is empty',
      );
    } else {
      io.fail(
        'the summary misreports the injected history',
        `effectiveHistory=${truthful} staleConversationHistory=${stale} — wrong precisely when recall is working`,
      );
    }

    // ── 5: caps unchanged ──
    if (CORE_CAP_RE.test(src) && DEEP_CAP_RE.test(src)) {
      io.pass(
        'no additional memory rode in with the repair',
        'CORE slice(-4) and DEEP slice(-5) unchanged from the shared parent — dropped pairs are recovered, intake is not widened',
      );
    } else {
      io.fail(
        'a per-tier memory cap changed',
        `coreCap4=${CORE_CAP_RE.test(src)} deepCap5=${DEEP_CAP_RE.test(src)} — a reliability repair must not become a memory expansion`,
      );
    }
  },
};
