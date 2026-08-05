# Memory Integrity Gap Map — Phase 2

**Date:** 2026-08-04 · **Referent:** deployed SHA `57b0324fd`, evidence via `git show`/`git grep` at the SHA only · **Status:** analysis artifact. ⛔ No code changed, no tables created, no loader modification authorized. Companion to `docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md` (Phase 1) and `docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md` (the ruling instrument; its reframe governs this map: **the finding is an ungoverned selection policy, not absent intelligence; the hidden authority is the ORDER BY, not the LIMIT**).

## I. The lifecycle, classified

For each transition: *Observable? Persisted? Explainable? Governed?*

| Transition | Observable | Persisted | Explainable | Governed | Evidence |
|---|---|---|---|---|---|
| STORED → RETRIEVED | log count only (`atoms loaded: {count}`) | ✗ | SQL is legible in code | ✓ consent WHERE (`return_preference`, `sacred_protected`, `rejected`) | loader:274–284 |
| RETRIEVED → ELIGIBLE | collapsed into the same SQL step — indistinguishable at runtime | ✗ | ✓ | ✓ | same |
| **ELIGIBLE → OFFERED** | **✗ — the ORDER BY + LIMIT 8 act invisibly; 120 of 128 dropped with no trace** | ✗ | ✗ — no per-item reason exists anywhere (grep: no `selection_reason`/inclusion-provenance column) | **✗ — the ungoverned policy** | loader:232, 283–284 |
| OFFERED → INJECTED | partial: `context-inventory atoms:{loaded,injected,chars}`, `PROMPT_BLOCK_CHARS` (observes, never truncates) | ✗ | partial | tier-dependent: FAST/CORE ✓, DEEP-primary ✗ | maiaService:2898 |
| INJECTED → USED | **unknown — and correctly so; nothing infers usage** | ✗ | ✗ | n/a | — |

The missing intelligence is exactly where the founder placed it: **ELIGIBLE → OFFERED**. Everything upstream is governed (consent) and legible (SQL); everything at that transition is silent, deterministic, and unrecorded.

## II. Belonging-signal inventory — what already exists at the SHA

The candidate signals for "what makes a memory belong to this moment," each with its actual substrate status. These are **observable categories, not features to build**. None participates in atom selection today.

| Signal | Substrate at SHA | Status on live route |
|---|---|---|
| Semantic relationship | **No embedding column on `member_memory_atoms`** (migration `20260521000001`). pgvector + `match_*` RPCs exist only for other tables (`20241202000001`, bardic, selflet). Duplicate `SemanticMemoryService` (lib/memory/ `@ts-nocheck` prototype; lib/consciousness/memory/) — neither imported by route or lib/sovereign/; both do pattern-learning, not similarity retrieval | **ABSENT** (vector); BUILT-UNWIRED (services) |
| Topic continuity | `loadPriorCrossSessionExchanges` — `ORDER BY created_at DESC LIMIT 6`, sole filter = exclude current session (memoryLoaders:208–214). `memoryOrchestrator.ts` regex detectors (:48–93) set flags only — self-labelled "flag only" (:285–287); they select nothing | LIVE but **relevance-blind**; detectors WIRED-BUT-INERT |
| Unresolved threads / commitments | `lib/consciousness/unresolvedThreads.ts:28` exists; callers only in relationships route/page. No open-loop or commitment table for member memory | BUILT-UNWIRED |
| Developmental themes | `loadRecentDevelopmentalMemories(userId,3)` + `loadRecentThemeSignals(userId,10)` (route:785–787) — `ORDER BY significance DESC, formed_at DESC` / `detected_at DESC`. Themes pre-derived upstream; route only reads | LIVE, **message-independent** |
| Emotional / spiral state | Orchestrator accepts `input.spiralState` (:248–254) — route never passes it. `member_spiral_state`: 0 hits under `app/api/sovereign/**`. Spiral orientation commented out (route:134, 1003–1015 — "Cut 2 PARKED") | ABSENT on route |
| Time horizon | Atoms query has no recency window, decay, or dormancy distinction. `lib/memory/confidenceDecay.ts`: 0 route callers. **Recency is sovereign in the ORDER BY — the opposite of a time-horizon model**: origin-era material is structurally unreachable (truth #5 mechanism, per ruling instrument) | ABSENT |
| User invitation | No recall-gesture path exists. `/maia/moments` GETs episode marks only — a marking surface, not a retrieval trigger. Member text never alters retrieval | **ABSENT** — the C′ staged-trajectory target has no substrate yet |
| Explanation machinery | `memoryOrchestrator.reasoning: string[]` (:279–301) — per-source-class, log-only, never per-item, never persisted, never member-facing | Germ exists; log-only |

**Corpus Callosum is entirely parallel**: `WisdomRouter.routeWisdom(userMessage, {name, currentElement})` — zero references to atoms or memory in the file. The one component that DOES read the current message consults no memory; the components that read memory never see the message. **The two halves the Corpus Callosum names are, on this path, literally unconnected.**

## III. Integrity finding: `sem: ok` is a miscue

`memoryHealth.semantic` = **atom row count + error flag** (route:936 → `semantic: {count: atomsResult.length, error}`; emitted as `sem:` at memoryHealth:248). No semantic machinery is live anywhere on the route. The system's own health surface labels a recency-ordered row count as "semantic" — a self-report that misstates the memory state MAIA is in. This is precisely the Phase 3 failure class (*"I have no memory"* when the truth is *"not available in this context"*), occurring in the observability layer itself. **Flag for rename/relabel under the lane — a one-word truthfulness fix, but it is a behavior-adjacent change and waits for authorization like everything else.**

## IV. The four relational layers, mapped to substrate (vision reference — Cat 1, not scope)

Per the founder's relational-model framing (Biography / Pattern / Meaning / Becoming):

- **Biography** ("what happened") — exists: `conversation_turns`, `member_memory_atoms`, episodes. The only layer selection currently draws from, recency-first.
- **Pattern** ("what tends to happen") — partially exists: `member_theme_signals` (live, pre-derived), detectors (inert). Never participates in selection.
- **Meaning** ("what it means to them") — **correctly has no owning substrate, and must never acquire one.** The schema's `member_response_status` (accepted/rejected) is the right shape: the member's act, recorded, not interpreted.
- **Becoming** ("who they are becoming") — substrate exists (`developmental_memories`, spiral state) but is either message-independent or parked. The invitation form ("does that still feel alive?") has no delivery mechanism — connects to C′.

Elements at the SHA appear in selection nowhere; `currentElement` reaches only WisdomRouter. Consistent with *languages for reflection, not labels stored about the person* — nothing to un-build.

## V. What the gap map licenses next (per the staged trajectory, ⏳ awaiting formal ruling)

1. **Stage 1 — declare the current policy** (consent-bounded · breakthrough-first · recency-sovereign · take-8) as known-policy. Costless, honest, no behavior change.
2. **Stage 2 — observability at ELIGIBLE→OFFERED**: record eligible-count vs offered-set (and eventually per-item reason as *a reason, not a score* — never a `0.87`). This is instrumentation, not reordering. ⛔ Observability precedes any reordering (ruling instrument).
3. The `sem:` relabel (§III) as a truthfulness repair within Stage 2's spirit.
4. ⛔ Everything else — reordering, semantic relevance, invitation-based retrieval (C′), thread tracking — waits on the founder's ruling on the instrument's options (A / B / C / C′).

**Standing guards:** no recall maximization · no per-item relevance scores surfaced as numbers · no usage inference (USED stays unknown until observed) · every capability increase carries provenance + restraint + transparency + ownership boundary.
