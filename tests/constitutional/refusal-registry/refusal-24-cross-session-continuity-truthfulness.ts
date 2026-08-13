import type { RefusalCheck } from './harness';

/**
 * Refusal 24 — Cross-session continuity must fail loudly and describe itself
 * truthfully. It may not fail silently, and it may not report a turn count that
 * contradicts what was injected.
 *
 * Three defects in the CORE cross-session recall block, all repaired by CTR-001:
 *
 *   1. PARITY-BRITTLE PAIRING. The loop strode `i += 2` and required role 'user' at
 *      every even index. One orphan turn — a leading assistant turn, a member send
 *      whose MAIA turn was never written, a tier that returned early before logging
 *      its side — shifts parity for every subsequent turn, so the loop yields zero
 *      pairs and the member's whole cross-session history vanishes from the prompt.
 *
 *   2. SILENT ZERO-PAIR FAILURE. The only log lived inside `if (pairs.length > 0)`.
 *      The failure case emitted nothing, so "turns were fetched but none paired" was
 *      indistinguishable in the record from "this member has no history". A continuity
 *      failure read as a continuity non-event.
 *
 *   3. UNTRUTHFUL SUMMARY. `MaiaContext.summary` counted `conversationHistory`, but
 *      the recall branch only runs when `conversationHistory.length === 0`. So
 *      whenever recall actually worked, the summary said "1 turns" while up to four
 *      prior exchanges were in the prompt — wrong in precisely the case where
 *      continuity was functioning, and reaching the model as context.
 *
 * The refusal is TRUTHFULNESS AND RELIABILITY, not capability. Nothing here admits
 * more memory: the `.slice(-4)` cap is untouched, no retrieval source is added, no
 * reordering or relevance ranking is introduced. Tolerant pairing is strictly a
 * superset of the parity stride — every pair the old loop found is still found — so
 * it recovers exchanges that were being dropped rather than widening what may enter.
 *
 * Grade B — code chokepoints plus one bounded absence (the parity stride must not
 * return). A fork defeats it only by reinstating the stride, moving the absence log
 * back inside the success branch, or reverting the summary to the empty variable —
 * all visible diffs.
 */

const SERVICE = 'lib/sovereign/maiaService.ts';

// ── Limb 1: tolerant pairing, not the parity stride ──
// The recall block, bounded so the checks cannot match unrelated loops elsewhere.
const RECALL_BLOCK_RE =
  /if\s*\(crossSessionTurns && crossSessionTurns\.length > 0 && conversationHistory\.length === 0\)\s*\{[\s\S]*?\n  \}/;
const PARITY_STRIDE_RE = /for\s*\([^)]*i\s*\+=\s*2\s*\)/;
const TOLERANT_SCAN_RE = /if\s*\(userTurn\?\.role !== 'user'\)\s*continue;[\s\S]*?if\s*\(assistantTurn\?\.role !== 'assistant'\)\s*continue;/;

// ── Limb 2: zero-pair failure is visible ──
// The absence emission must sit in the ELSE of the success branch. Testing merely that
// the string exists somewhere would pass with the log back inside `if (pairs.length > 0)`,
// where it can never fire.
const ZERO_PAIR_IN_ELSE_RE =
  /if\s*\(pairs\.length > 0\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?Zero pairs from/;

// ── Limb 3: the summary describes what was injected ──
const TRUTHFUL_SUMMARY_RE = /summary:\s*`Conversation: \$\{conversationContext\.profile\.dominantElement\} element, \$\{effectiveHistory\.length \+ 1\} turns`/;
const STALE_SUMMARY_RE = /summary:\s*`Conversation:[^`]*\$\{conversationHistory\.length \+ 1\} turns`/;

// ── Limb 4: no volume expansion rode in with the repair ──
const SLICE_CAP_RE = /effectiveHistory = pairs\.slice\(-4\)/;

export const check: RefusalCheck = {
  id: 'R24',
  refusal:
    'Cross-session continuity may not fail silently and may not misreport itself: pairing must tolerate an unpaired turn rather than losing all history to parity drift, a zero-pair outcome must be logged, and the context summary must count the history actually injected — while admitting no additional memory',
  grade: 'B',
  enforcedBy:
    'lib/sovereign/maiaService.ts — the CORE cross-session recall block scans for user→assistant adjacency instead of striding i += 2; the zero-pair warning sits in the else of `if (pairs.length > 0)`; MaiaContext.summary counts effectiveHistory; the pairs.slice(-4) cap is unchanged',
  evidence: [
    `${SERVICE}: tolerant scan — \`continue\` on non-user and non-assistant, no \`i += 2\` stride`,
    `${SERVICE}: zero-pair warning emitted from the else branch, carrying the fetched role sequence`,
    `${SERVICE}: summary interpolates effectiveHistory.length, not conversationHistory.length`,
    `${SERVICE}: pairs.slice(-4) unchanged — the repair recovers dropped pairs without widening intake`,
  ].join(' | '),
  violationAttempted: [
    '(1) has the parity stride returned, so one orphan turn again erases all cross-session history?',
    '(2) has the absence log moved back inside the success branch, where it can never fire?',
    '(3) does the summary again count the variable the enclosing branch has already established is empty?',
    '(4) has the volume cap been widened, turning a truthfulness repair into a memory expansion?',
  ].join('; '),
  passingAuthorizes:
    'the claim that a single unpaired turn no longer silently erases a member\'s cross-session history on the CORE path, that a zero-pair outcome leaves a record instead of resembling a member with no history, and that the context summary reaching the model states the number of exchanges actually injected — with no increase in how much memory may enter the prompt',
  passingDoesNotAuthorize:
    'that cross-session continuity WORKS for any member — this reads source only and never data, so it says nothing about whether turns are being written, whether pairs exist in production, or whether any member experiences recall; that the FAST path is covered (it uses a separate recentContext path at :720 and is not asserted here); that DEEP is covered (DEEP-tier is unexercised in observed traffic); that the four-exchange cap is correct (it is merely unchanged); or that memory reaching the prompt influenced the response (composition is not influence)',
  hostileForkMustChange:
    'reinstate `i += 2` or drop the role guards in the recall loop (visible diff), move the zero-pair warning back inside `if (pairs.length > 0)` (visible diff), revert the summary to conversationHistory.length (visible diff), or change pairs.slice(-4) (visible diff)',

  run(io) {
    const service = io.read(SERVICE);
    const block = RECALL_BLOCK_RE.exec(service)?.[0] ?? '';

    if (!block) {
      io.fail(
        'cross-session recall block not found — the check cannot establish any limb',
        'the guard condition was renamed or restructured; re-derive before trusting this refusal',
      );
      return;
    }

    // ── 1: tolerant pairing ──
    const strided = PARITY_STRIDE_RE.test(block);
    const tolerant = TOLERANT_SCAN_RE.test(block);
    if (tolerant && !strided) {
      io.pass(
        'pairing tolerates an unpaired turn',
        'scans for user→assistant adjacency — one orphan no longer shifts parity and erases all history',
      );
    } else {
      io.fail(
        'pairing is parity-brittle again',
        `tolerantScan=${tolerant} parityStride=${strided} — a single missing turn drops every subsequent exchange`,
      );
    }

    // ── 2: zero-pair failure is visible ──
    if (ZERO_PAIR_IN_ELSE_RE.test(block)) {
      io.pass(
        'a zero-pair outcome is recorded',
        'the warning is emitted from the else branch, so continuity failure is distinguishable from a member with no history',
      );
    } else {
      io.fail(
        'continuity failure is silent again',
        'no zero-pair emission in the else of `if (pairs.length > 0)` — an absent log reads as an absent history',
      );
    }

    // ── 3: truthful summary ──
    const truthful = TRUTHFUL_SUMMARY_RE.test(service);
    const stale = STALE_SUMMARY_RE.test(service);
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

    // ── 4: no volume expansion ──
    if (SLICE_CAP_RE.test(block)) {
      io.pass(
        'no additional memory rode in with the repair',
        'pairs.slice(-4) unchanged — dropped pairs are recovered, intake is not widened',
      );
    } else {
      io.fail(
        'the volume cap changed',
        'a truthfulness repair must not become a memory expansion — slice(-4) is no longer present',
      );
    }
  },
};
