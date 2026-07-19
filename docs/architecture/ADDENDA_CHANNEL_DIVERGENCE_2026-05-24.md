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

## §VIII. Closure (2026-05-26) — §V steps 1–3 complete

Per Kelly's "Option A" directive 2026-05-26 (preferring shared addenda foundation over FAST+CORE-only scope so episodic inherits a single attachment point), §V steps 1–3 are complete on branch `feature/conversational-memory-phase2`:

1. ✅ **Shared `appendAllContextAddenda` helper extracted** in `lib/sovereign/maiaVoice.ts` immediately before `buildMaiaWisePrompt`. Module-level. Single point of truth: the `ADDENDA_SPECS` const lists all 20 addenda with their stable log markers in canonical order.
2. ✅ **`buildMaiaWisePrompt` refactored** to delegate addenda injection to the helper (`adaptedPrompt = appendAllContextAddenda(context, adaptedPrompt)` replaces ~150 lines of open-coded `safeAddendum` blocks). FAST+CORE behavior preserved — same ordering, same log markers, same `safeAddendum` gating.
3. ✅ **DEEP repair path wired** in `buildMaiaComprehensivePrompt` (`lib/sovereign/maiaVoice.ts`). Helper call lands AFTER `buildComprehensiveVoicePrompt` returns, augmenting the returned `.prompt` field. Decision rationale: keeping the call in `maiaVoice.ts` (where `MaiaContext` is canonical) avoids importing the interface into `intelligentVoiceAdaptation.ts` (which uses `context: any`), preserving the loose-typing boundary while closing §II.B.

**Verification at commit time**: `npm run typecheck` clean. `npm run check:no-supabase` clean. Behavioral verification (FAST+CORE byte-identical, DEEP now receives addenda) requires production deploy + log inspection per §IV gate.

### What remains open (still tracked as divergence-debt)

4. **§V step 4** — `consciousnessOrchestrator.processRequest` audit (DEEP primary path, §II.C). The bridge function `buildMaiaComprehensivePrompt` only handles the repair path. Primary path still uninstrumented. *Separate cut.*
5. **§V step 5** — `atomsAddendum` end-to-end wire (extract in FAST template + add to `MaiaContext` interface). The helper now iterates the interface, so once `atomsAddendum` lands on `MaiaContext` it flows automatically. *Separate cut, downstream of episodic.*
6. **§V step 6** — Production verification across all three tiers (`[MAIA] conversational-block { emitted: true }` for ≥3 distinct members, multiple sessions). *Required before any "live across DEEP" claim.*

### Discipline maintained

This closure note covers what was wired. It does not claim what was not wired. The single honest source of truth for what's reaching prompts vs not remains this document.

### Sequencing context

This work unblocks **gate 1** of the priority-thread sequence (per `CLAUDE.md` priority thread). Gates 2–4 (consent toggle / engagement-shape clarification / production verification) remain ahead of episodic spec opening.

## §IX. Closure (2026-07-13) — §V step 4 complete: DEEP-primary audited, consultation lane wired

Per Kelly's directive 2026-07-13 (*"wire episodic memory fully"*), the §II.C audit was executed. Findings and actions:

### Audit result: DEEP-primary anatomy

`consciousnessOrchestrator.processRequest` (`lib/orchestration/consciousness-orchestrator.ts:1011`) forwards only `{sessionId, userId, sessionHistory}` into `orchestrateResponse`, discarding all addenda. The 10-stage pipeline it runs (witness → recall → retrieve → analyze → elemental → quest → enhance → reciprocal → observe → synthesize) produces its draft by **template weaving** (`synthesize` → `weaveResponse`), not by reading a system prompt. Stage 7 (`enhanceWithAI` → `aiBridge.generateEnhancedSynthesis`) consumes structured streams, not a prompt string. **There is no prompt seam in the local draft machine by construction.** Wiring MaiaContext addenda into it would require redesigning the orchestrator, not attaching to it — out of scope, and the machine sits Cat-4-adjacent in the six-category typology.

### What WAS wired (this cut)

The **Claude consultation lane** (`consultClaudeForConsciousness`, `lib/consciousness/claudeConsciousnessService.ts`) is the only real prompt seam on DEEP-primary — it builds a `systemPrompt` and calls `MultiLLMProvider.generate`. It is env-gated OFF by default (`MAIA_USE_CLAUDE_CONSULTATION !== 'true'`), but it is the one path where a future member turn could generate without member memory. Closed:

1. `ConsciousnessConsultationRequest.contextAddenda?: string` — new optional field; the service never loads memory itself, callers' consent gates decide what arrives.
2. `consultClaudeForConsciousness` appends the addenda to the consultation system prompt under a `MEMBER MEMORY CONTEXT` header (grounding-only framing; content boundaries live inside the blocks).
3. The DEEP call site in `lib/sovereign/maiaService.ts` (STEP 3) composes `conversationalRecallAddendum + episodicRecallAddendum + atomsAddendum` from meta and passes them through. Discoverable log marker: `[MAIA] deep-consultation recall-addenda { chars }`.

### Honest label (label travels)

- **Wired ≠ surfacing**: `agent_runs` shows **zero DEEP turns in the last 7 days of production** (CORE 645, FAST 198), and the consultation lane is env-disabled. This wire is reachability-complete and traffic-dormant. No "DEEP live" claim is authorized by this cut; the claim it does authorize is: *no prompt seam remains, on any tier, where a member turn can generate without its consent-gated recall blocks.*
- **§V step 5 (atoms)** — closed previously: `atomsAddendum` is on `MaiaContext`, in the FAST template, in `ADDENDA_SPECS`, and production `prompt_block_layers` shows `atoms: true` rows.
- **§V step 6 (production verification)** — closed for conversational 2026-07-13 via durable `runtime_events` evidence (5 distinct member prefixes / 30 days, FAST+CORE). Episodic awaits its first witness (zero marked moments exist in production as of this writing).

### Deliberately NOT wired (documented, not skipped)

- **Local orchestrator draft** — no prompt seam exists (above). Recall reaches DEEP output today via the repair/regeneration path (§VIII item 3), which is where DEEP responses that fail Socratic validation are actually regenerated.
- **`/api/between/chat`** — Tier-2 live-secondary per `MAIA_ROUTE_AUTHORITY_MAP.md` with an observe-only edit policy, zero `agent_runs` rows in the current window, and an unresolved consent question (surfacing personal member-marked moments in the BETWEEN container is a sovereign-placement ruling, not a wiring decision). Requires Kelly's ruling before any recall wiring.
- **Dormant routes** (`/api/sovereign/app/maia` root, `/api/oracle/conversation`) — superseded headers explicitly forbid new wiring; patches there do not reach live traffic.

### Discipline maintained

The `origin_route` label `/api/sovereign/app/maia` in `agent_runs` (468 rows/72h) originates from the **list route's own meta stamp** (`list/route.ts:235`), not from the dormant root route — verified this cut before concluding no hidden unwired ingress exists. The canonical live chat ingress remains `/api/sovereign/app/maia/list`, which carries conversational + episodic + atoms in prompt with durable telemetry.
