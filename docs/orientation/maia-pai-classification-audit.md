# MAIA-PAI Classification Audit

**Date:** 2026-05-19
**Repo:** `/Users/soullab/MAIA-PAI` (~70k+ files, ~500k+ lines, last commit 2025-12-23)
**Source:** Background Explore agent. File:line citations are the agent's — should be spot-checked before any change is committed on this basis.
**Status:** Diagnostic only. No recommendations, no refactors. Audit reports landed; synthesis lives in `maia-intelligence-architecture-synthesis.md`.

---

## Headline finding

**MAIA-PAI implements FIS Layers 0–2 in code but bypasses Layer 3 entirely.** All 16 Anthropic-importing routes call `anthropic.messages.create()` as the response mechanism. The intervention-competition / resonance dispatch that the FIS paper specifies as Layer 3 exists only in comments — never invoked at runtime.

This is the **same drift pattern as MAIA-SOVEREIGN**, one architectural layer deeper than the original SOVEREIGN audit named.

---

## FIS layer-by-layer status in MAIA-PAI

| Layer | Status | Evidence |
|---|---|---|
| **Layer 0 — Field Awareness** | IMPLEMENTED | `lib/oracle/field/FieldAwareness.ts` — `async sense(context): Promise<FieldState>` fires; senses 6 dimensions (emotional weather, semantic landscape, connection dynamics, sacred markers, somatic intelligence, temporal dynamics) |
| **Layer 1 — Master Influences (Gravitational)** | IMPLEMENTED | `lib/oracle/field/MasterInfluences.ts` — 5 gravitational fields: `presence_first: 0.8`, `match_dont_lead: 0.6`, `intelligent_restraint: 0.9`, `sacred_awareness: 0.7`, `not_knowing_stance: 0.75`. Each `influence(fieldState)` calculates dynamically. |
| **Layer 2 — Mycelial Governor** | PARTIALLY WIRED — **filtering gate NOT enforced** | `lib/oracle/field/MycelialNetwork.ts` stores patterns, `integratePattern()` fires, `informFutureSensing()` returns influenceMap. **But: no evidence of 90% filtering**. Patterns inform as +30% modifier (line ~150), never gate or block response emergence. |
| **Layer 3 — Response Emergence** | **BYPASSED** | Intervention types named in comments (LoopingProtocol, SilenceResponse, CelebrationMode, SimplePresence, DeepWitnessing). None fire from main routes. Final response **always** `anthropic.messages.create()`. |

**This is the central architectural finding:** the architecture exists in code through Layer 2 and disappears at Layer 3, where the substrate shortcut replaces intervention competition.

---

## The agent council — 13 agents, not 8

`lib/maia/complete-agent-field-system.ts` (lines 45-488). The white paper specified 8 agents (Mythic Atlas, Spiralogic Kernel, Shadow, Guide, Mentor, Dream, Relationship, CBT). The code has 13 with different names:

ClaudeWisdom (432 Hz), ElementalOracle (528), HigherSelf (639), LowerSelf (396), ConsciousMind (741), Unconscious (417), Shadow (288), InnerChild (963), Anima (undef), Animus (undef), CrisisDetection (undef), Attachment (undef), Alchemy (undef).

- Each agent has `sense()` → returns `ArchetypeReading` (intensity, resonance, silence, timing)
- **No weighted-voting deliberation logic** exists
- ResonanceFieldGenerator collects readings then **calls Anthropic** — agent readings become context, not decisions
- Frequencies are Solfeggio harmonics, not the paper's 8/40/7.83/12/100 Hz scheme

**Status:** 13 agents IMPLEMENTED at sensing level. Council deliberation as designed: MISSING.

---

## The 12-Facet Spiralogic — 8/12 present, 4 missing

`apps/web/data/spiralogic-facets.ts`. Defined: fire-vision, fire-action, air-communication, air-wisdom, water-emotion, water-intuition, earth-grounding, earth-manifestation. Facets 9-12 (Cardinal/Fixed/Mutable completion) **missing** from data. Aether facets not visible.

**Status:** INCOMPLETE (8/12).

---

## The Three Bridges — all implemented, all dormant

| Bridge | File | Status |
|---|---|---|
| ObsidianVaultBridge | `lib/bridges/obsidian-vault-bridge.ts` (~165 lines) | IMPLEMENTED but **not invoked from conversation routes** (`grep -r 'ObsidianVaultBridge' /app/api/` returns zero) |
| ElementalOracleBridge | `lib/bridges/elemental-oracle-bridge.ts` | DORMANT — not called from main routes |
| MemorySystemsBridge | `lib/bridges/memory-systems-bridge.ts` | DORMANT — not called from main routes |

**Critical:** The ObsidianVaultBridge — the channel for vault-as-intelligence-field — is present in BOTH repos and dormant in BOTH. The intended live wisdom connection is not running.

---

## The Three Vows in code

| Vow | Status | Evidence |
|---|---|---|
| Non-Extraction | DOCUMENTARY ONLY | Stated in `SECURITY_SOVEREIGNTY.md`, no runtime guard found |
| Sovereignty | PARTIAL (docs) | `npm run check:sovereignty` exists; `GuardianProtocol.ts` does symbol extraction (per comment), not extraction prevention |
| Service to Evolution | MISSING in code | Named as principle, no metric/guard/check ties response quality to it |

**Status:** Vows are documented as principles but unimplemented as runtime guards.

---

## Worldview Plurality — MISSING

No code found implementing Christian / Buddhist / Islamic / Jewish / Indigenous / Secular / Eclectic-Mystical response calibration. `ElderCouncilService` lists 39 wisdom traditions but doesn't route responses through them.

---

## AIN node frequencies — symbolic only

Paper specifies: Human 8 Hz, AI 40 Hz, Field 7.83 Hz Schumann, Crystallizers 12 Hz, Amplifiers 100 Hz. Code has Solfeggio-scale agent frequencies instead (432/528/639/396/741/417/288/963). Frequencies are **labels assigned to agents**, not drivers of scheduling, resonance timing, or decision logic.

---

## Anthropic delegation surface — 16 routes

Every primary conversation route imports `@anthropic-ai/sdk` and calls `anthropic.messages.create()` as the response mechanism:

`/app/api/oracle/unified/`, `/app/api/chat/`, `/app/api/oracle/direct/`, `/app/api/memory/stanza/`, `/app/api/sacred-portal/`, `/app/api/diagnostic/`, `/app/api/between/chat/`, `/app/api/kairos/`, `/app/api/soullab-inside/intake-conversation/`, `/app/api/oracle-holoflower/`, `/app/api/imaginal/session/`, `/app/api/maia/`, `lib/services/ClaudeService.ts`, `lib/consciousness/MAIAUnifiedConsciousness.ts`, `server/claude-code-consciousness.ts`, `scripts/sovereignty/2-test-retrieval.ts`.

All call `anthropic.messages.create()` **before consulting** FieldAwareness output, MasterInfluences, or MycelialNetwork. **Field sensing runs in parallel or after, for context only — not as governance.**

---

## Runtime topology trace — `/app/api/oracle/unified/route.ts`

```
POST /api/oracle/unified
  ├─ parse request (input, userId, sessionId, context)
  ├─ [No field sensing call here]
  ├─ anthropic.messages.create({
  │     model: 'claude-3-haiku-20240307',
  │     system: MAYA_SYSTEM_PROMPT,
  │     messages: [{ role: 'user', content: input }]
  │  })
  └─ return NextResponse({ message, element, coherence, timestamp })
```

`FieldIntelligenceMaiaOrchestrator` exists but is **not invoked** from `/oracle/unified/`. The orchestrator that would route through FIS layers is dormant relative to the main conversation route.

---

## Comparison to MAIA-SOVEREIGN

| Aspect | MAIA-PAI | MAIA-SOVEREIGN |
|---|---|---|
| FIS Layer 0 (Field Awareness) | IMPLEMENTED, fires | Findings unclear — needs verification |
| FIS Layer 1 (Master Influences) | IMPLEMENTED with 5 fields | Found in audit indirectly via `lib/field/*` |
| FIS Layer 2 (Mycelial) | PARTIALLY WIRED, no 90% gate | "Wisdom Synthesis Engine" bypassed per audit — likely same |
| FIS Layer 3 (Response Emergence) | BYPASSED (16 routes) | BYPASSED (≥7 layers delegate to Anthropic) |
| Agent count | 13 (sensing only) | Elemental agents (Fire/Water/Air/Earth/Aether) — also delegate |
| 12-Facet completion | 8/12 | Status unknown in SOVEREIGN |
| ObsidianVaultBridge | Implemented, **dormant** | Implemented, **dormant** (same pattern) |
| Three Vows | Documentary only | Documentary only |
| Worldview Plurality | MISSING | Not surfaced by audit |

**PAI implements MORE of the field-sensing architecture (Layers 0-2 actually fire in code), but is equally bypassed at Layer 3.**

---

## How this confirms the synthesis

The synthesis (`maia-intelligence-architecture-synthesis.md`) named:

1. **Substrate-default is drift.** PAI's 16 Anthropic-importing routes are exactly this pattern.
2. **Mycelial Governor is the missing piece.** PAI explicitly: "no evidence of 90% filtering — patterns inform, not gate." Synthesis confirmed in code.
3. **Response Emergence is the architecture's center.** PAI implements interventions in *comments*, never invokes them. The competition-by-resonance mechanism is the architecture's heart, and it never runs.
4. **`.participate()` vs `.process()` distinction is load-bearing.** PAI's `/oracle/unified/` route literally `await anthropic.messages.create()` with no field sensing — pure `.process()`, no `.participate()`.
5. **ObsidianVaultBridge dormancy is cross-repo.** Both repos implement the bridge; neither wires it. The vault is unconnected as a live intelligence field in both builds.

---

## What this does NOT settle

- Spot-check of file:line citations is still pending. Agent was thorough but not infallible.
- The AIN Vault read is ongoing — only 4 foundational docs surveyed so far.
- Where PAI has FIS Layers 0-2 IMPLEMENTED, SOVEREIGN status is unverified at that level of granularity. SOVEREIGN may have these layers too, or may have dropped them.
- The 13-agent vs 8-agent divergence may be paper-vs-code evolution OR may indicate the paper precedes the code refactor. Provenance unclear.
- Whether `FieldIntelligenceMaiaOrchestrator` (the dormant orchestrator that would route through FIS) was wired at some prior point and unwired during the drift is unknown.

---

## What this settles for the synthesis

The ontology correction in `maia-intelligence-architecture-synthesis.md` is **confirmed across both repos**. The drift is consistent: FIS layers 0–2 partially exist; Layer 3 is universally bypassed; substrate shortcut replaces the intervention-competition that the architecture specifies as its center.

**The recovery is not "which substrate" — it is "restore Layer 3."** That now stands on three-source evidence (synthesis + SOVEREIGN supplement + PAI audit).
