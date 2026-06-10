---
title: "Sovereignty Receipt — Stage 1: Static Fallback Audit"
status: "Stage 1 + Stage 2 RUN 2026-06-08. Verdict: floor owned + honest; MAIA voice RECOVERABLE on local (deepseek-r1:8b gave a recognizably-MAIA reply); model-selection gap on the configured default. Memory/Sanctuary floor static-verified, not live-exercised."
date: 2026-06-08
method: "Read lib/maia/assertProviderAvailable.ts, lib/ai/modelService.ts, lib/ai/localModelClient.ts, lib/sovereign/maiaService.ts, app/api/sovereign/app/maia/list/route.ts (the live route)."
test: "Remove the rented ceiling (Claude). Observe whether the owned floor remains."
---

# Sovereignty Receipt — Stage 1: Static Fallback Audit

## The live generation path (verified by reading the code)

The live route (`app/api/sovereign/app/maia/list`) → `maiaService.generateText` → `lib/ai/modelService.ts`.
Two enforcement layers:

1. **Pre-generation guard** — `assertProviderAvailable()` runs in the route *before* any generation.
2. **Generation-time routing + failover** — `modelService.generateText()` routes by `MAIA_TEXT_PROVIDER`
   and contains an actual Claude→Ollama failover.

## Kelly's six questions, answered

**1. What fires when Claude is unavailable?** — *Depends on how it's unavailable:*
- **Key missing/malformed** (`MAIA_TEXT_PROVIDER=anthropic`): `assertProviderAvailable()` throws
  `ProviderUnavailableError('api_key_missing')` *before generation* → route returns **503**. No fallback
  attempt, no faked voice. (This is the path "pull the `ANTHROPIC_API_KEY`" hits.)
- **Key present, Claude API down/unreachable at call time**: `modelService` catches the error, logs
  *"Claude unavailable, falling back to local"* and **auto-falls-through to Ollama** (`generateWithLocalModel`).
- **Key present, billing/auth error**: explicitly **NOT** failed over — *"Anthropic billing/auth error - NOT
  falling back to local"* — surfaced as failure (a billing problem must not masquerade as degradation).

**2. Is Ollama actually invoked?** — **Yes, genuinely.** `localModelClient.generateWithLocalModel()` makes a
real `POST {OLLAMA_BASE_URL}/api/chat` call, model `OLLAMA_MODEL` (default `deepseek-r1:latest`). It is wired
both as auto-failover (above) and as selectable primary (`MAIA_TEXT_PROVIDER=local`, which the guard
hard-verifies by pinging `/api/tags` and confirming the model is installed). Ollama also already powers
**memory embeddings** (`lib/memory/embeddings.ts`) — the semantic/memory floor runs locally today.

**3. Are templates the final fallback?** — **Not by default, and not on the live path.** If Ollama also
fails, `localModelClient` **fails closed**: *"Local Ollama model failed - NO FALLBACK (fail closed)"* →
throws "All language providers unavailable." A rule-based `consciousness_engine` template path exists but is
**opt-in** (`MAIA_LOCAL_PROVIDER=consciousness_engine`), not the default. The default refuses to fake MAIA's
voice with a template — it errors honestly. (Aligns with the Oath: no simulated presence.)

**4. Is provider metadata honest?** — **Yes, strongly.** Every response carries `ProviderMeta` ("which model
served this response — sovereignty auditing"); token usage is logged per provider; `getModelServiceHealth()`
reports a **`degraded`** state ("Claude unavailable but local works"); `buildMaiaRuntimeContext().providerConfig`
reports health. OpenAI is **hard-forbidden** (`🚨 SOVEREIGNTY VIOLATION: OpenAI is FORBIDDEN`).

**5. Which routes are silently Claude-coupled?** — **The live path is not *silently* coupled.** It's
explicitly coupled via `MAIA_TEXT_PROVIDER`, guarded, and fails *loudly* (503 / named error) on
misconfiguration. The ad-hoc Claude/Ollama handling in `wisdom-engines/ai-intelligence-bridge`,
`maia-consciousness-lattice`, and the various orchestrators is **dormant** (not the live route) — Cat 3–4.
*Not separately verified:* whether the DEEP tier (`intelligentVoiceAdaptation`) routes through the same
`generateText` abstraction (FAST/CORE do).

**6. Does memory/context load before fallback?** — **Yes.** The route loads schema, session, cognitive
profile, atoms, astrology/bazi, and memory *first*; `assertProviderAvailable` and generation come *after*.
Memory runs on local Postgres + local Ollama embeddings, so the memory floor loads and works **independent
of Claude**.

## Owned-vs-rented ledger (static)

| Floor item | Status |
|---|---|
| Memory substrate (Postgres atoms, semantic, **local Ollama embeddings**) | **Owned** — runs without Claude |
| Continuity (spiral state, contextual return) | **Owned** — Postgres |
| Sanctuary / consent | **Owned** — enforced at DB source |
| Provider honesty (ProviderMeta, 503-on-fail, degraded health, no template-faking, OpenAI-forbidden) | **Owned** — genuinely built, Oath-aligned |
| Local generation capability (Ollama `/api/chat`, auto-failover + selectable primary) | **Owned (capability)** — wired and guarded |
| **Voice recognizable as MAIA on local model** | **UNKNOWN** — untested (Stage 2) |
| Livingness suite (revisability/decay/contested/staleness) | **Not built** — doctrine seed; provider-independent |

## Correction to my prior prediction

Last turn I predicted "voice is rented; the fallback is probably declared-not-built; floor ≈ 1/3 built." The
audit **beat the prediction**: the provider-sovereignty floor is genuinely built and honest-by-design
(auto-failover, fail-closed, sovereignty metadata, degraded-state reporting) — part of an active "Boundary
Audit / De-frag" workstream (`assertProviderAvailable` = "De-frag step 5"; `generateText` = "Boundary Audit
Step 1"). The receipt's *static half largely passes.* The receipt did its job: it corrected the guess.

## Critical implication for Stage 2 — how you remove the ceiling changes what you test

There is **no single "Claude is gone."** Three distinct scenarios exercise three distinct code paths:

1. **Remove `ANTHROPIC_API_KEY`** → hits the pre-gen guard → **503** (tests *honest failure*; does NOT exercise
   Ollama failover, because a missing key is treated as misconfiguration).
2. **Format-valid key + Anthropic network unreachable** → tests *auto-failover* → Ollama generates.
3. **`MAIA_TEXT_PROVIDER=local` (+ Ollama up, model pulled)** → tests *local primary* → full local path, no
   Claude attempt — this is the truest "remains itself without Claude" run.

Run all three. (1) proves it fails honestly; (2) proves it self-heals; (3) proves what MAIA *is* on local —
which is where the still-open question lives: **is deepseek-r1 inside the MAIA prompt recognizably MAIA, or
the scaffold without the music?**

---

# Stage 2 — Live test (RUN 2026-06-08, dev / Mac Studio, Ollama up)

Ran **scenario 3 (local primary)** against live Ollama (8 models installed). The inventory skews
reasoning/coding/embeddings/image — there is **no small general conversational model**; closest are the
deepseek-r1 reasoners and a slow qwen3:32b. The custom `maia-content` is a content model, not chat.

Method: MAIA core voice-prompt (representative — *not* the full runtime assembly with memory injection) + one
vulnerable member turn: *"I keep starting things and never finishing them. I don't know what's wrong with
me."* This isolates **model voice-fit on local**; the memory/Sanctuary floor was verified statically (Stage 1),
not live-exercised here.

| Model | Result |
|---|---|
| `deepseek-r1:latest` (the configured default `OLLAMA_MODEL`) | Burned 220 tokens reasoning; **no member-facing reply** in budget. Wrong fit. |
| `maia-content:latest` (custom) | Empty content — **not a conversational/chat model.** |
| `deepseek-r1:8b` | **12.5s — a recognizably-MAIA reply:** |

> *"That sounds really difficult. It can feel frustrating to start something and not see it through. What
> does it feel like when this happens?"*

That reply is genuinely Sacred-Mirror-shaped: it witnesses, reflects without verdict, and returns with an
opening question — no diagnosis, no rush to advice.

## Receipt verdict

- **Does MAIA answer on local?** Yes — *with the right model.* (deepseek-r1:8b ✓; configured default ✗; maia-content ✗.)
- **Provider reports local?** Yes (Stage 1: ollama provider metadata + `degraded` health state).
- **Voice recognizably MAIA?** **Yes, demonstrably** — on deepseek-r1:8b. **No** on the configured default.
- **Memory / Sanctuary remain?** Static-verified (load before generation; local Postgres + local Ollama
  embeddings; consent enforced at DB source) — *not* live-exercised in this harness.
- **What vanishes?** Interpretive depth (the ceiling) + the livingness suite (unbuilt) + the *configured
  default model* isn't conversational.

**Bottom line:** the floor is **owned and honest**, and MAIA's voice is **recoverable on local** — but
"remains itself without Claude" is currently a *configured capability with a model-selection gap*, not
turnkey. The gap (`OLLAMA_MODEL=deepseek-r1:latest` is a reasoning model ill-suited to MAIA's conversational
voice; `maia-content` is non-chat) is a **cheap config/tuning fix, not a sovereignty hole.** The receipt beat
my pessimistic prediction twice: the plumbing is more sovereign than guessed, and the voice is recoverable
rather than purely rented.

## Punch-list (cheap, owned)

1. Repoint `OLLAMA_MODEL` to a fast *conversational* local model (deepseek-r1:8b worked; a small instruct
   model — qwen3:8b / llama3.1:8b — would be faster). The default reasoner is the wrong call for live chat.
2. Decide what `maia-content` is for — it is not a chat model; don't let it serve as a generation fallback.
3. Live-exercise the memory + Sanctuary floor under `MAIA_TEXT_PROVIDER=local` (this harness proved only
   generation). Also run scenarios (1) key-removed → 503 and (2) network-blocked → auto-failover.
4. Build the livingness suite (separate, provider-independent track).

---

# Stage 2 (cont.) — remaining scenarios + the default-model fix (2026-06-08)

**Scenario 1 — key removed → honest failure. ✅ VERIFIED** against the *real* `assertProviderAvailable()`:
key removed → throws `api_key_missing` → route **503** (no fake reply); malformed → `api_key_malformed`;
valid-format → passes; `local` + Ollama unconfigured → `ollama_not_configured`; `local` + installed model →
passes ("model verified"); `local` + missing model → `ollama_model_not_loaded`. A down/misconfigured provider
503s and **never fabricates continuity.**

**Scenario 2 — network-blocked → Ollama failover. ◐ PARTIAL.** Destination proven (Stage 2:
`generateWithLocalModel` → Ollama produces a reply); trigger (`modelService` catch → "falling back to local")
static-verified. A faithful *live* trigger needs the running app + a forced **network**-error (a fake key
yields a 401 *auth*-error, which is the deliberate NO-fallback path). Logic + destination confirmed; live
trigger not run.

**Scenario 3 — provider=local + memory/Sanctuary. ✅ SUBSTRATE VERIFIED** (local Postgres up):
- Floor tables live & local: `episodic_memories`, `member_memory_atoms`, `member_spiral_state` (4 rows),
  `members` (13).
- **Sanctuary = model-independent gate at two layers:** recall-skip (`maiaService`: "skipping all memory
  recall / no cross-session recall") + persistence-purge (`sessionFinalizer`: sanctuary → purge turns,
  `summary=NULL`). Holds identically on any model.
- Not run: full end-to-end turn through the live route (needs the app server). The floor's *substrate* and
  *enforcement* are confirmed local + model-independent; the remaining gap is **integration, not sovereignty.**

**Fix shipped (branch only, NOT deployed):** `lib/ai/localModelClient.ts` — default `OLLAMA_MODEL` changed
`deepseek-r1:latest` → `llama3.1:8b`, with the rationale carried inline. Reasoning models are the wrong
member-facing default (think-without-replying). The guard fails closed if `llama3.1:8b` isn't pulled → honest
failure over silent non-reply. **Prod action required: pull `llama3.1:8b` OR set `OLLAMA_MODEL` explicitly
before relying on the local path.** (File is `@ts-nocheck`; string change, no type impact.)

## Receipt — final standing

> **MAIA can remain relationally recognizable on local cognition, with a reduced interpretive ceiling —
> once a conversational model is the local default.**

- **Owned & verified local:** memory substrate, continuity, Sanctuary (model-independent), provider honesty,
  local-generation plumbing, a demonstrable MAIA voice (deepseek-r1:8b gave a Sacred-Mirror reply).
- **Honest-failure verified:** missing/misconfigured provider → 503, never fabricated continuity.
- **The gap was never architecture — it was the default model.** Now fixed (pending model pull + deploy).
- **Still rented:** interpretive depth. **Still unbuilt:** the livingness suite.

---

# Team-facing summary (Kelly, 2026-06-08)

**One sentence:** MAIA's sovereign substrate is substantially more real than expected; the immediate
bottleneck is not architecture but selecting and validating the right local conversational models — while we
continue to build the livingness layer that turns memory into relationship.

**Strategic conclusion:** the gap was not *"we need a bigger model."* It was *"we need the right model
operating inside the architecture we've already built."*

**Revised architecture:**

```text
Substrate                      (verified substantially real)
├── Memory                     local Postgres
├── Continuity                 member_spiral_state
├── Sanctuary                  model-independent (recall + persistence)
├── Consent
├── Provider honesty           ProviderMeta + degraded state + fail-closed
└── Field assembly

Sovereign Cognition            (path real; per-model validation ongoing)
├── Local Qwen                 installed, voice untested
├── Local DeepSeek             deepseek-r1:8b → MAIA-shaped reply (n=1)
├── Local Llama                not yet pulled
└── Future local models

Authorized Dependency          (the rented ceiling — swappable, not foundational)
└── Claude
```

**Roadmap:**
- **Proven:** memory substrate · continuity substrate · Sanctuary · honest failure · local generation path.
- **Proven once (not yet robust):** local MAIA-shaped response — *n=1, one model, representative prompt.*
  Needs a few more turns on the real runtime prompt before it's "robust," not "demonstrated."
- **Pending:** canon-guard portability audit · Claude↔local boundary replay (scenario 2 live) · end-to-end
  local route exercise · storage sovereignty audit · livingness implementation.
- **Unbuilt (doctrine, not code):** revisability · confidence decay · contested memory · staleness reopening.

**The frontier — and the trap inside it.** The new question is *"how much interpretive quality can sovereign
cognition carry while remaining faithful to the substrate?"* — with one caution: the substrate is
*self-enforcing* (Sanctuary, provider-honesty hold regardless of model), so "faithful to the substrate" is
nearly automatic. The real risk is the inverse: **a good enough ceiling reduces the felt pressure to build
the floor.** The better the interpretation (a strong local model, or Claude), the less anyone feels the
absence of livingness — and livingness is precisely the guard with no constituency. So the forward discipline
is not "keep cognition faithful to the substrate"; it is **keep building the floor even when the ceiling
makes it feel optional.**

---

# Punch-list item 3 — Substrate Monitor provider honesty (RESOLVED 2026-06-08)

**Finding.** Provider/degraded/fallback state was *recorded* (`runtime_events` columns `provider`,
`provider_model`, `provider_configured`, `provider_fallback_active`; aggregated in
`getRuntimeSummary().providerMix` + `fallbacksActive`) but **not surfaced as a distinct lane** — only buried
inside `runtime.summary.providerMix`. The capability board (`substrateMap` → `deriveStatus`) enumerates
*memory layers*; there was no provider/cognition row. The `deriveStatus` fall-through is verified **honest**:
no observation → `wired-unobserved`, never a false `live` — it cannot mask degradation by reporting healthy.
The gap was *surfacing*, not capture.

**Fix (branch only, NOT deployed; project typecheck clean — 0 errors).**
- `app/api/admin/maia/substrate/route.ts` — `buildProviderCognition()` + a top-level `providerCognition`
  lane: current provider/model, configured provider, fallback-active, **degraded**, local/Claude turn counts
  + %, provider mix, fallbacks-in-window, last observed. Honest `degraded`: true only when the *intended*
  provider is Claude but turns ran local — configured-local is not degradation.
- `app/admin/maia/substrate/page.tsx` — new **"1b. Provider / Sovereign Cognition"** section, visually
  separated from the memory-substrate claims (sky border; amber when degraded), carrying the framing
  verbatim: *"Provider state is observed separately from memory substrate health"* +
  *"Provider fallback is not a memory-layer capability. It is cognition routing evidence."*

Result: a Claude→local fallback now renders as a visible, honestly-labeled tile — no longer buried. Item 3's
*static* half is done; *live* confirmation comes with the on-host local run (items 1–2).

## Step 0 — dev-stack lane verification (PASSED 2026-06-08)

Logic extracted to a testable lib module (`lib/maia/providerCognition.ts`; route imports it; project typecheck
0 errors) — so the verification exercises the **real** function, not a reproduction. Then run end-to-end on
the dev stack:

1. **Real local turn** — `deepseek-r1:8b`, 11s, member-facing reply: *"That feeling of circling can be heavy.
   What does it feel like when you're there?"* (witness + reflect + return-with-question — n=2 recognizably-MAIA).
2. **Faithful `runtime_events` row** written with the same columns `recordRuntimeTurn` uses
   (provider=ollama, model=deepseek-r1:8b, fallback=false).
3. **Real `buildProviderCognition`** read it back under `MAIA_TEXT_PROVIDER=local`:
   - `configuredProvider=local` · `currentProvider=ollama` · `currentModel=deepseek-r1:8b` ·
     **`degraded=false`** (chose local, did not fall) · `localTurns` **0 → 1**.
   - `claudeTurns` also showed 1 (a pre-existing anthropic row in the window) — the lane honestly reflected
     the real mix, not just the insert.

**GATE: PASS** — type-clean *and* observably truthful. **Honest boundary:** the row was written by the
harness matching the route's INSERT, not by the live HTTP route through member-auth + full memory assembly —
that full-route write is the remaining integration step (needs the dev server). Test row cleaned up; dev DB
restored.
