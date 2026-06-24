# Executive Discernment Provenance Map — Live Path (FAST + CORE)

**Date:** 2026-06-02
**Scope:** `app/api/sovereign/app/maia/list/route.ts` → `lib/sovereign/maiaService.ts`, FAST + CORE tiers only.
**Out of scope:** `app/api/oracle/conversation/*` (not the live path); DEEP / BETWEEN paths (follow-up).
**Method:** static code trace by subagent, crux citations independently re-verified (three reads: `elementalResult` use-sites, `generateText` call-sites, `buildMaiaWisePrompt` body + `MaiaContext`).

## Question

Three layers of cognition:
- **L1 Generative** — produces interpretations / reframes / insight / language. *Known: largely Claude.*
- **L2 Executive mechanism** — routing, retrieval, orchestration, inhibition *code*. *Known: MAIA.*
- **L3 Executive discernment** — the *judgment* that decides what matters: what surfaces, what waits, which pattern dominates, which voice gets weight, which recurrence is signal not noise. **Whose judgment drives each step?** ← this audit.

## Findings (L3, live FAST+CORE)

| Step | Mechanism | Evidence (file:line) | Tier-B trace needed? | Notes |
|---|---|---|---|---|
| 1. Signal enters | **LOCAL-RULE** | tier regex `maiaService.ts:449-455`; element keyword-scoring `elemental-oracle-bridge.ts:328-389` (called `fastMode:true` at `maiaService.ts:759,1389`); model pick `claudeClient.ts:49-84` (`selectClaudeModel` switches on `reasoningMode` string) | No | Pure keyword/regex; FAST/CORE skip the LLM elemental path |
| 2. Voice weights | **LOCAL-RULE — and not integrated** | `findDominantElement` = max intensity `elemental-oracle-bridge.ts:732-744`; intensity `= min(1, score/5)` `:389`; WisdomRouter `confidence: 0.8` hardcoded `WisdomRouter.ts:387` | No | **8 voices' content does NOT reach the response.** `elementalResult` → `meta` + logs (`maiaService.ts:769,1415`); only `.dominant` label used (field-context hint `:1629`; `maiaVoice.ts:667`) |
| 3. Memory retrieved | **LOCAL-STATE** | atoms `ORDER BY is_breakthrough DESC, kept_at DESC LIMIT` `memoryAtomsLoader.ts:182`; relationship caps `maiaService.ts:677-683`; recall `ORDER BY created_at DESC LIMIT 2` `surfaceExchangeTurns.ts:44` | No | Member-mark + recency + fixed limits. No similarity ranking on read; embeddings (`embeddings.ts:21`) used on **write** path only (`maiaService.ts:3037`) |
| 4. Signals suppressed | **LOCAL-RULE** | `validateSocraticResponse` synchronous, no model call `socraticValidator.ts:60-94`, invoked `maiaService.ts:557`; `filterModeLanguage :245` | Partial | Only residual UNKNOWN in the whole map: does `REGENERATE` ever fire under load? (resolvable via `🛡️ [Socratic Validator]` `decision` log). Mechanism statically confirmed local |
| 5. Signals elevated | **LOCAL-RULE** | `wisdomRouting.activated` → append `promptInjection` `maiaService.ts:1101` (FAST) / `:1597` (CORE); `isMemoryRecallQuestion`, `isLikelyCheckin` keyword gates | No | What gets elevated *into the prompt* is decided locally; how Claude uses it = L1 |
| 6. Final integration ("~49%") | **HYBRID: local routing + single Claude generation; the "~49%" is OBSERVABILITY, not a live gate** | single `generateText` `maiaService.ts:1282` (FAST) / `:1646` (CORE) → `modelService` → Claude; `logIntegrationPass` = `INSERT INTO integration_passes` `corpusCallosumService.ts:164-184`; `integrationMethod` deterministic label `:479`; `maiaIntegrateConsultation` DEEP-only `:2033`, default-off | Partial | **No live multi-voice integrator on FAST/CORE.** Final text = one Sonnet completion from `buildMaiaWisePrompt` (`maiaVoice.ts:456`) = static MAIA specs + summary + memory addenda + element-label hint + an *instruction* to "integrate archetypal, elemental… perspectives" (`:592`). The "~49% selective integration" = post-hoc aggregate over `integration_passes` rows |

## Verdict

On the live FAST+CORE path, **L3 executive discernment is provably almost entirely LOCAL** — deterministic rules + persisted DB state (recurrence/recency/member-mark/threshold). The only Claude step is **generation itself (L1)**. UNKNOWN collapsed to near-zero, and it collapsed toward **local**, not Claude — vindicating the "don't assume mostly-Claude" correction.

**But the same trace corrects a standing claim:** the 8-voice "differentiation-before-synthesis" **does not influence the live response.** The voices are computed (cheaply, by keyword), written to telemetry (`agent_runs` / `integration_passes` / `meta`), and reduced to a single dominant-element *label* in the prompt. The "~49% selective integration" is a logged-label aggregate, not a live integrator. The one genuine Claude-arbitrated integrator (`maiaIntegrateConsultation`) is DEEP-only and default-off.

So on the live path: **differentiation-before-*logging*, not differentiation-before-*synthesis*.** WisdomRouter reaches the prompt only as a keyword-gated `promptInjection` with hardcoded confidence — receipts for a *templated injection*, not for "Wisdom."

This is a wiring gap, not an absence: the council substrate is real and emitting; it is simply **not wired into generation** on FAST+CORE. (Cat 6 *as telemetry* stands; Cat "live cognitive influence" does not.)

## Drift named

"Voices emit rows" → "selective integration emerging operationally" was an **existence → operation** substitution (rows-written read as influence-on-response). Corrects the Corpus Callosum Cat-6 framing in `CLAUDE.md` and `project_two_layer_sovereignty_doctrine`.

## Tier-B (runtime "why *this* sentence") — now a smaller job

Because there is no live multi-voice integrator on FAST/CORE, the per-turn "why was Voice A weighted over B" question has little live decision to trace there. Remaining Tier-B targets: (1) confirm Socratic `REGENERATE` fire-rate under load; (2) if/when the council is wired into generation, instrument the integration selection then. The DEEP `maiaIntegrateConsultation` path is where a genuine integration trace would live — gated off today.

## Runtime rung-4 (24h live logs, 2026-06-02, read-only `docker logs`)

~37 generations/24h; local discernment fires on ~every turn (`ElementalOracle` ×37, `Socratic Validator` ×33, `atoms loaded` ×28, `WisdomRout` ×46, `conversational-block` ×33, `MEMORY_HEALTH` ×33). Fed for **n=1 member** (`atoms loaded: { count: 8 }`, same `userId` across all samples; `count: 0` otherwise — consistent with the frozen ~127-atom / stranded-write finding).

**Ladder:** exists ✓ (static) · executes ✓ (runtime) · fed ✓ (n=1) · **influences output ?** · improves outcomes ??

**Did the evaluative path alter the path? (rung 4)**
- **Suppression (Socratic validator): NO.** 33/33 `decision: 'ALLOW'`, `ruptureCount: 0`, "GOLD" every turn. Resolves the flagged UNKNOWN — `REGENERATE` did not fire in 24h. Runs, never acts. (A 0%-action gate is either a clean generator or a too-lax detector — worth knowing which.)
- **Elevation (WisdomRouter): causal INTO the prompt — input only; not yet "influence."** Local pattern detection (`journalKeeper`/`bard`/`ganesha`) → agent activation → addendum injection: **Member web** (patterns+summaries+journals), **Astrology** (birth chart), **Knowledge Gate**, **State-vector contract**. ~56 activations / ~73 skips → selective (~1–2 inject/turn). **Correction to Step 5:** this is a multi-addendum injection layer, not a single "keyword promptInjection" — under-credited in the static map.

**Next rung (4.5 — the smallest still-open):** elevation alters the *input* (prompt); whether the injected content alters the *output* (Claude uses vs ignores it) is **not a log question** — needs **same-prompt ablation / decoy** (generate with vs without the injection, compare). Logs reach "injected"; subtraction reaches "influenced."

**Incidental:** astrology birth-chart context is **live-injected** (influence-untested; decoy method applies — Phase-5 symbolic surface arriving early). `PFI Full` = *"would integrate 50+ systems (pending canon drift tests)"* → gated, not live.
