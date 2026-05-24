# Addenda Channel Divergence — Architectural Finding (2026-05-24)

**Status:** Open. Surfaced during Phase 2 wire-correction follow-up (see commit `f74ab4204` + this commit).
**Scope:** divergence-debt observability — does NOT fix anything; documents two structural gaps so they can be addressed deliberately rather than worked around.
**Authority:** continuity of `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` §IX. Operates under Kelly directive 2026-05-24 ("safety serves memory; do not smuggle channels").

---

## §I. The pattern

When a route passes a named addendum via `meta`, the addendum reaches MAIA's actual prompt only if **every tier's prompt assembly explicitly extracts that named key**. There is no generic iteration. Each addendum needs a per-tier wire.

Phase 2 surfaced this by accident: when we audited why `[Oracle] conversational-block` never fired in production, we found the wire site was wrong. When we audited why the corrected wire might also fail, we found that `atomsAddendum` — already shipped — was never actually consumed by `lib/sovereign/maiaService.ts`. Tracing the architecture revealed the gap is wider than atoms.

## §II. Confirmed defects

### §II.A. `atomsAddendum` is never extracted by any tier

**Evidence:**
- `grep "atomsAddendum\|atom" lib/sovereign/maiaService.ts` → **zero matches**.
- The sovereign route writes `meta.atomsAddendum` (`app/api/sovereign/app/maia/list/route.ts:~840`); `getMaiaResponse` never reads it.
- `PROMPT_BLOCK_CHARS` jumped from 7334 → 8590 with 8 atoms only because `summarizePromptBlock` in `buildMaiaRuntimeContext` sums all addenda lengths it receives — observability counts the string but the string never reaches the model.

**Consequence:** Any felt continuity attributed to atoms in 2026-05-23 production observations was either coming from a different memory channel (e.g. `memoryContext`, `relationshipContext`, `memoryBundle`) or was not actually occurring. Atoms `is_breakthrough` flag, atoms portfolio surfacing, atoms-as-substrate observability — all real at the substrate layer, all silent at the prompt layer.

**Fix (not in this cut):** Extract `(meta as any)?.atomsAddendum` in FAST tier (`maiaService.ts:1175` region); inject into the template literal at line 1229 between `forwardReadinessAddendum` and `memoryInfluenceAddendum` (or wherever member-placed authority tier should sit). Add `atomsAddendum?: string` to `MaiaContext` interface; add `safeAddendum(context.atomsAddendum)` injection in `buildMaiaWisePrompt` so CORE tier also receives it.

### §II.B. DEEP tier addenda channel is structurally inert

**Evidence:**
- DEEP tier (`deepPathResponse` lines 1701-2170) builds a `MaiaContext` with named addenda fields (`repairedContext` at line 2063, and presumably elsewhere for non-repair path).
- DEEP tier delegates to `buildMaiaComprehensivePrompt(input, context, history)` (`maiaVoice.ts:914`), which delegates to `buildComprehensiveVoicePrompt(input, context, insights, history)` (`intelligentVoiceAdaptation.ts:224`).
- `grep "safeAddendum\|Addendum" lib/sovereign/intelligentVoiceAdaptation.ts` → **zero matches**.
- The function does not iterate MaiaContext addenda fields. **Every named addendum** the route hands to DEEP — wuxing, astrology, governor, maiaMode, scribeDiscussion, knowledgeGate, memberWeb, consultation, fieldWisdom, conversationalRecall, all of them — is silently dropped.

**Consequence:** When MAIA is in DEEP path (6-20s, complex topics requiring full consciousness orchestration), none of the runtime context addenda reach the prompt. The MaiaContext gets built and passed; the prompt assembler doesn't read it.

**Fix (not in this cut):** Either (a) extend `buildComprehensiveVoicePrompt` in `lib/sovereign/intelligentVoiceAdaptation.ts` to iterate `context.*Addendum` fields with the same `safeAddendum` pattern as `buildMaiaWisePrompt`, or (b) extract a shared `appendAllContextAddenda(context, prompt)` helper used by both. Path (b) eliminates future divergence between the two wise-prompt functions.

### §II.C. DEEP primary path (consciousnessOrchestrator) unknown

**Evidence:**
- The primary DEEP path doesn't go through `buildMaiaComprehensivePrompt` — that's the regeneration/repair path. The primary call is `consciousnessOrchestrator.processRequest(input, context)` at `maiaService.ts:1964` (Promise.race wrapper).
- `consciousnessOrchestrator` lives in `lib/orchestration/consciousness-orchestrator.ts`. Its addenda handling was not audited in this finding.

**Consequence:** Unknown. May be a third structural gap or may handle addenda correctly. Needs separate audit.

**Fix (not in this cut):** Audit `consciousnessOrchestrator.processRequest` for MaiaContext addenda consumption. Either confirm it reaches the prompt or extend it.

## §III. What Phase 2 (this cut + `f74ab4204`) actually delivers

- **FAST tier**: `conversationalRecallAddendum` is extracted from meta and injected into the template literal at `maiaService.ts:1229`. Reaches the prompt. ✓
- **CORE tier**: `conversationalRecallAddendum` is set in MaiaContext construction (`maiaService.ts:~1506`) and consumed via `safeAddendum` injection in `buildMaiaWisePrompt` (`maiaVoice.ts:~876`). Reaches the prompt. ✓
- **DEEP tier (repair path)**: `conversationalRecallAddendum` is set in `repairedContext` (`maiaService.ts:~2103`) but `buildMaiaComprehensivePrompt` → `buildComprehensiveVoicePrompt` does **not** iterate addenda. Field is present for forward-compat; **does not reach prompt** until §II.B is fixed. ✗
- **DEEP tier (primary path)**: not wired pending §II.C audit. ✗
- **Observability**: `buildMaiaRuntimeContext.addenda.conversational` and `PromptBlockSummary.layers.conversational` added; route passes `conversationalRecallAddendum` to the seam. The PROMPT_BLOCK_CHARS sum and observability log now include conversational regardless of tier. ✓

**Net coverage:** FAST + CORE tiers receive Phase 2 in the prompt. DEEP tier receives it in observability only. Most MAIA conversations route through FAST/CORE — DEEP fires for ~explicit-depth-request turns. Verification of Phase 2 should be done on FAST/CORE first; DEEP verification waits for §II.B fix.

## §IV. The rule this divergence violates

From the conversational arc preceding this finding: *"Add a channel; don't smuggle it through another channel."* Phase 1 (atoms) added a channel structurally — addenda key existed, observability counted it — but the channel was never connected to the prompt. The smuggle happened in reverse: the channel existed in name only.

The doctrinal corrective: **a channel is not added until every active tier explicitly extracts and injects it.** Per-tier completeness is the bar. Anything less is observability theater.

## §V. Proposed fix sequencing

If/when Kelly authorizes the fix work:

1. **First**: extract a shared `appendAllContextAddenda(context, prompt)` helper that iterates every `MaiaContext.*Addendum` field with `safeAddendum`. Place in `lib/sovereign/maiaVoice.ts` next to `safeAddendum`.
2. **Second**: replace the open-coded sequence in `buildMaiaWisePrompt` (lines 745-880) with a call to the helper. Verify CORE behavior unchanged.
3. **Third**: add a call to the helper in `buildComprehensiveVoicePrompt`. Closes §II.B for DEEP repair path.
4. **Fourth**: audit `consciousnessOrchestrator.processRequest` and either wire it through the helper or document why it should not.
5. **Fifth**: wire `atomsAddendum` end-to-end (extract in FAST template + add to MaiaContext interface + verify it now flows through helper).
6. **Sixth**: verify in production for atoms (atoms blocks appear in DEEP responses) and for conversational (all three tiers carry the block).

Each step has its own commit. None of them are Phase 2 work.

## §VI. Drift canaries

- Any future PR that adds a new `*Addendum` to the route's `meta` object but does NOT also add it to a tier prompt extractor recreates this exact pattern. The substrate map should grow a per-addendum "tiers reached" column to make this visible.
- Any future PR that "fixes" this by adding new observability counts without verifying prompt reach will deepen the theater problem.
- Any test that asserts `addendum in PROMPT_BLOCK_CHARS` should be paired with a test that asserts `addendum text in generated prompt string`.

## §VII. Recording

This document is the artifact requested by Kelly's directive 2026-05-24 (post-Phase-2-wire-correction): *"Open a separate issue/spec note for atomsAddendum not reaching FAST/CORE prompt. Do not fix atoms in this same cut unless it is trivially identical and you explicitly scope it."*

The note is broader than atoms because the survey of DEEP tier (required by the same directive: "survey DEEP first") revealed that DEEP tier addenda channel is also inert. Both findings sit here so they can be addressed as a single architectural fix instead of layer-by-layer patches.
