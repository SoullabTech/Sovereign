/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE CONDUCTOR — pass-through implementation (packet P2)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Program:   MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01, packet P2
 * Authority: docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md
 *
 *   GOVERNING RULE: MOVE THE DECISION BOUNDARY BEFORE CHANGING THE DECISION.
 *
 * `conduct()` is DELIBERATELY STUPID at this stage. It exercises no judgment.
 * It reproduces today's composition exactly — same source eligibility, same
 * ordering, same tier-specific omissions (INCLUDING the D7 developmental-memory
 * gap on CORE), same authority behavior, same consent behavior.
 *
 * WHY IT MUST STAY STUPID
 * -----------------------
 * If P2 also improved selection, ordering, restraint or relevance, then any
 * behavioral difference after deployment becomes uninterpretable: was it the
 * Conductor extraction, the memory restoration, an ordering change, an
 * authority change, or prompt formatting? Causality is the deliverable here.
 *
 * The acceptance standard is byte-identical model-facing composition, not
 * "equivalent meaning". See lib/maia/contract/__tests__/conductorEquivalence.test.ts.
 *
 * D7 IS REPRODUCED ON PURPOSE. CORE currently lacks developmental memory on
 * the dominant production path (72.9% of turns). P2 reproduces that defect
 * exactly. Packet P3a then changes exactly one thing, deliberately: eligibility
 * convergence.
 *
 * WHAT THIS PACKET DOES NOT DO
 * ----------------------------
 * No D7/D8 repair · no health-truthfulness repair · no source retirement · no
 * table creation · no lattice activation · no MythicAtlas repair · no prompt
 * rewriting · no reprioritization · no new relevance scoring · no restraint
 * logic beyond today's · no endpoint consolidation · no model/tier routing
 * change. Finding a defect here does not create authority to repair it.
 */

import {
  INTELLIGENCE_REGISTRY,
  type IntelligenceSourceId,
  type ProcessingTier,
} from './intelligenceSources';
import type {
  CompositionPlan,
  ConsentState,
  EvidenceItem,
} from './evidence';

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ORDERING — captured verbatim from the assembly it replaces
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Order of `ADDENDA_SPECS` in lib/sovereign/maiaVoice.ts at fc66b477a.
 *
 * This single ordering serves BOTH the CORE prompt (`buildMaiaWisePrompt`) and
 * the DEEP repair prompt (`buildMaiaComprehensivePrompt`) — they call the same
 * `appendAllContextAddenda`. Tier differences do NOT come from the loop; they
 * come from which context fields the caller populated. An unpopulated field
 * renders as absence, which is exactly how the D7/D8 gaps manifest today.
 *
 * ⚠️ Changing this array changes MAIA's prompt. It is a transcription of
 * running code, not a design choice, and P2 may not alter it.
 */
export const SHARED_SEAM_ORDERING: readonly IntelligenceSourceId[] = [
  'place',
  'relationshipMode',
  'governor',
  'guestContext',
  'journalContext',
  'captureContext',
  'astrologicalContext',
  'spiralSnapshot',
  'wuxingSnapshot',
  'bridgeSnapshot',
  'therapeuticFramework',
  'reflectionLens',
  'epistemicPath',
  'maiaMode',
  'scribeSessionDiscussion',
  'studio',
  'knowledgeGate',
  'memberWeb',
  'consultation',
  'fieldWisdom',
  'conversationalRecall',
  'episodicRecall',
  'memoryAtoms',
  'relationalContext',
];

/**
 * Order of the contiguous addendum run inside the FAST template literal
 * (lib/sovereign/maiaService.ts:1432), captured verbatim at fc66b477a.
 *
 * FAST assembles differently from the shared seam: a template literal with
 * addenda interleaved among non-addendum content. `place` appears earlier in
 * that template and `youthSupport` last, so both sit OUTSIDE this run and are
 * handled as separately-positioned segments. This array is the contiguous
 * middle only.
 *
 * NOT YET ADOPTED BY THE RUNTIME — see the P2 closure record. Proven
 * equivalent, wiring deferred: rewiring a single 3,000-character template
 * expression is a distinct risk unit and P2 does not take it blind.
 */
export const FAST_RUN_ORDERING: readonly IntelligenceSourceId[] = [
  'knowledgeField',
  'epistemicPath',
  'spiralSnapshot',
  'therapeuticFramework',
  'reflectionLens',
  'governor',
  'maiaMode',
  'scribeSessionDiscussion',
  'wuxingSnapshot',
  'astrologicalContext',
  'practiceField',
  'studio',
  'knowledgeGate',
  'memberWeb',
  'fieldWisdom',
  'conversationalRecall',
  'episodicRecall',
  'memoryAtoms',
  'relationalContext',
  'developmentalMemory',
  'forwardReadiness',
];

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZATION — verbatim behavior of `safeAddendum` (maiaVoice.ts:394)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Byte-for-byte reproduction of the legacy normalizer. Trims, and treats the
 * literal strings 'undefined' and 'null' as empty — a quirk of the original
 * that MUST be preserved for equivalence, not tidied away.
 */
export function normalizeContent(v: unknown): string {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  if (!s || s === 'undefined' || s === 'null') return '';
  return s;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════

/** Consent state used while the legacy path still owns eligibility decisions. */
const LEGACY_CONSENT: ConsentState = {
  eligible: true,
  gate: null,
  reason:
    'Eligibility was decided upstream by the legacy loaders; the Conductor is ' +
    'pass-through in P2 and does not re-decide it.',
};

/**
 * Build typed evidence from a legacy `MaiaContext`-shaped record.
 *
 * Reads each source through `INTELLIGENCE_REGISTRY[id].legacyContextKey`, so
 * the mapping is the registry's, not a second hand-maintained list. A source
 * whose content normalizes to empty is simply not offered — matching the
 * legacy `if (safe)` guard.
 */
export function evidenceFromLegacyContext(
  context: Record<string, unknown>,
  ordering: readonly IntelligenceSourceId[] = SHARED_SEAM_ORDERING
): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  for (const source of ordering) {
    const spec = INTELLIGENCE_REGISTRY[source];
    const content = normalizeContent(context[spec.legacyContextKey]);
    if (!content) continue;
    items.push({
      source,
      authority: spec.authority,
      provenance: spec.provenance,
      consent: LEGACY_CONSENT,
      content,
      memberDeclaredSignificant: spec.memberDeclaredSignificance,
    });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════════════════
// conduct() — THE SEAM
// ═══════════════════════════════════════════════════════════════════════════

export interface ConductInput {
  readonly evidence: readonly EvidenceItem[];
  readonly tier: ProcessingTier;
  /** Composition order for this seam. Defaults to the shared CORE/DEEP order. */
  readonly ordering?: readonly IntelligenceSourceId[];
}

/**
 * Pass-through composition.
 *
 * Selects every offered item, in the given legacy order. Withholds nothing —
 * because today's assembly withholds nothing: a source is either populated in
 * the context or it is absent, and absence is upstream of this seam.
 *
 * That `withheld` is empty here is not a bug and not a placeholder. It is an
 * accurate statement about the architecture being replaced: **today there is
 * no restraint at composition time.** Packets P3+ give this function something
 * to decide; P2 only gives it somewhere to stand.
 */
export function conduct(input: ConductInput): CompositionPlan {
  const ordering = input.ordering ?? SHARED_SEAM_ORDERING;
  const byId = new Map<IntelligenceSourceId, EvidenceItem>();
  for (const item of input.evidence) byId.set(item.source, item);

  const selected: Array<{ item: EvidenceItem; reason: string }> = [];
  const finalOrdering: IntelligenceSourceId[] = [];

  for (const source of ordering) {
    const item = byId.get(source);
    if (!item) continue;
    selected.push({
      item,
      reason: 'Pass-through: offered by the legacy loaders and present in context.',
    });
    finalOrdering.push(source);
  }

  return {
    selected,
    // See the doc comment above — empty is the truthful value, not a stub.
    withheld: [],
    ordering: finalOrdering,
    tier: input.tier,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Render a plan onto a prompt, reproducing the legacy concatenation exactly:
 * `out += '\n\n' + content` per selected item, in plan order.
 *
 * Kept separate from `conduct()` so that later packets can change the decision
 * without touching the byte-level rendering, and vice versa.
 */
export function renderPlan(plan: CompositionPlan, prompt: string): string {
  let out = prompt;
  for (const { item } of plan.selected) {
    out += `\n\n${item.content}`;
  }
  return out;
}
