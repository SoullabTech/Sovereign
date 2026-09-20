# Tiered Local Inference — Direction Note

**Date:** 2026-09-20
**Status:** DIRECTION (Cat 1 — preserved direction). ⛔ Not a lane. ⛔ No implementation authorized. ⛔ No deploy. ⛔ No schema change.
**Scope:** `services/local-inference/*`, `lib/ai/sovereignRouter.ts`, `lib/ai/localInferenceClient.ts`, `lib/consciousness/modelRouter.ts`.
**Occasion:** an AirLLM evaluation (§6) that resolved into a question about the *axis* of tiering rather than about model size.

---

## 1. The finding

MAIA already has **two** inference-tiering mechanisms. Neither is broken. **Both are axed on a
variable that does not predict whether local capacity is adequate.**

| Mechanism | File | Tiers on | Reaches |
|---|---|---|---|
| Conversational router | `lib/consciousness/modelRouter.ts` | conversation depth · voice mode · message length | Oracle conversational path |
| Sovereign router | `lib/ai/sovereignRouter.ts` | a global mode switch (`MAIA_INFERENCE_MODE`) | `lib/ai/modelService.ts` only |

`modelRouter.ts` sends `tier: 'local'` to **shallow Talk turns and short Note transforms** — that is,
to the member's *live, synchronous* turn. That is the single worst placement for the local tier,
because it is the only workload in the system with a human waiting on the first token.

`docker-compose.production.yml:165` records the consequence, and is the load-bearing measurement in
this note:

```yaml
# MAIA_TEXT_PROVIDER: "local"   # enable when route timeout raised; 7b@5.8tok/s = ~30s/turn
```

The local tier is commented out **not because the model is too small, but because the placement
makes throughput member-visible.** `LOCAL_TIER_ENABLED: "true"` is set in production while
`MAIA_STRICT_503: "1"` keeps the Claude-primary path from degrading — a correct posture, and also a
statement that the local tier currently earns nothing.

### The re-axis

> **5.8 tok/s is not slow. It is slow *for a synchronous member turn*, and entirely adequate for
> queued cognition where nobody is waiting.**

Tier on **latency tolerance**, not on depth, not on a global mode.

---

## 2. Why this is the highest-leverage cut available without hardware

The system's latency-indifferent cognition is substantial, already member-content-bearing, and
currently runs **on Anthropic**:

- `lib/memory/bardic/*` — recall, recognition, linking, re-entry
- `lib/transcript-analysis/*` — `PatternExtractor`, `WisdomLibrary`
- `lib/scribe/*` — `sessionSummaryGenerator`, `sovereignSummarizer`, `transcriptCleaner`
- `lib/patterns/*` — detection, hypothesis, intelligence generation
- `lib/pipelines/document-analysis.ts`, `lib/content/*`

Every one of these is work MAIA does **about** a member, **after** the conversation, with no member
waiting on a first token. Routing them local is therefore free of the only cost that blocks the
local tier today.

**And it is the one change that increases sovereignty rather than merely preserving it.** Today,
member transcripts, extracted patterns and session summaries leave minisforum to be reasoned over.
A deferred tier keeps the most intimate derived material — the material Sanctuary Mode exists to
govern — inside the machine the member's data already lives on. That is not a performance
optimization dressed as ethics; it is the ethics, and the performance question is what has been
blocking it.

### Drift measured while writing this note

`docs/phase1-sovereign-inference.md` (2026-05-19) records **~45 files** bypassing `sovereignRouter`
by importing `@anthropic-ai/sdk` directly. A count taken 2026-09-20:

```
grep -rIl --exclude-dir=node_modules "@anthropic-ai/sdk" --include=*.ts --include=*.js . | wc -l
→ 63
```

⚠️ The bypass surface has grown ~40% in four months with no guard in place. The audit's proposed
engineering invariant ("no cognitive surface bypasses `sovereignRouter` without explicit documented
exemption") was never enforced. **A CI guard is worth more than any routing change in this note**,
because without it every cut below decays at the same rate.

---

## 3. Proposed cut sequence (L1–L4) — ⛔ none authorized

**L1 — Name the axis.** Introduce a `latencyClass` discriminator at cognition call sites:

| Class | Definition | Provider default |
|---|---|---|
| `interactive` | a member is waiting on first token | Claude (unchanged) |
| `deferred` | queued; no member waiting; result surfaces later | **local** |
| `batch` | bulk/offline; hours acceptable | local, unconstrained |

⛔ L1 is a *type*, not a router change. It must be possible to land the discriminator with zero
behaviour change and an empty `deferred` set.

**L2 — Census (read-only).** Classify all 63 direct-SDK files by `latencyClass`. ⛔ Repairs nothing,
routes nothing. The census's own acceptance condition: **a file whose class is genuinely ambiguous is
recorded as ambiguous, never defaulted to `interactive` for convenience** — defaulting to
`interactive` silently preserves the status quo and makes the census look complete while answering
nothing.

**L3 — Route `deferred` local.** The queue substrate exists and has precedent: `embedding_jobs`
(`20260107000003`), `comms_analysis_queue` (`20260122`), `MAIA_EMBEDDINGS_MODE: queue` with
`maia-embed-worker`. ⛔ Do not build a new queue; extend the established pattern or state why it
cannot carry this.

**L4 — Leave `interactive` alone.** `MAIA_STRICT_503: "1"` stays. `modelRouter.ts`'s `tier: 'local'`
branch should be **retired or gated to `deferred` only** — routing a member's live Talk turn to a
5.8 tok/s backend is the placement error this note exists to name. Only hardware (§5) changes this.

---

## 4. Obligations any implementation must discharge

Predeclared, so that a later run is judged against a record rather than a counterfactual.

1. **Sanctuary boundary.** A Sanctuary session's content must not become eligible for deferred
   cognition by virtue of being queued. Queueing is not consent. The absolute-boundary invariant
   binds the `deferred` tier identically to the interactive one.
2. **Provenance is preserved across the tier.** `TextResult.provider` already carries
   `'local_inference'`. Any member-visible artifact derived on the local tier must remain
   attributable to it — a summary produced by qwen2.5 must not be indistinguishable from one
   produced by Claude in the durable record.
3. **Degradation is legible, never silent.** `localInferenceClient.ts`'s 45s circuit breaker
   currently produces a member-facing degraded message on the interactive path. On the `deferred`
   path there is no member to inform, so the failure must land somewhere durable, or deferred
   cognition can fail indefinitely while the system reports health.
4. **Streaming stays out of scope.** No layer of the sovereign path streams
   (`sovereignRouter.ts` returns `Promise<TextResult>`; `localInferenceClient.ts` buffers;
   `server.py` passes `"stream": False`). `deferred` work does not need streaming — which is
   precisely why it is the tier that can move first, and why moving it must not be read as progress
   on the voice-realtime streaming gap (Cut 0 in the 2026-05-19 audit). Those remain separate.
5. **Growth-obligation check** (CLAUDE.md): this increases capability (more cognition retained
   locally). *Uncertainty introduced:* a smaller model's inferences about a member are weaker and
   must be marked as such, not laundered through a uniform record. *Provenance required:* obligation
   2. *Responsibility created:* MAIA becomes accountable for the quality floor of anything it derives
   about a member without a human present.

---

## 5. Hardware — the honest constraint

Every routing change above works around the absence of a GPU on minisforum. It does not substitute
for one. A single 24GB card (3090/4090-class) puts a 14B–32B model fully resident at 20–40 tok/s,
which is the only condition under which `MAIA_TEXT_PROVIDER: "local"` becomes flippable for the
interactive tier. **The L1–L4 sequence is worth doing on its own merits — it moves the right work to
the right tier and keeps member material local — but it should not be reported as having solved
sovereign interactive inference.** That remains hardware-blocked.

---

## 6. AirLLM — disposition

**Mechanism:** layer-wise streaming inference. One transformer layer resident in VRAM at a time;
peak VRAM ≈ largest single layer. 70B claimed on 4GB, DeepSeek-V3 671B on ~12GB. Actively maintained
(~34.6k stars, training support Sept 2026). Requires CUDA, or MLX on Apple Silicon.

**Real trade:** the memory constraint is not removed, it is **relocated to disk bandwidth**. Every
generated token requires reading the entire model from disk. Floor is arithmetic —
`model_bytes ÷ sequential_read_bandwidth` — so a 70B at fp16 (~140GB) on a 7GB/s Gen4 NVMe is ~20s
per token before any compute. Reported real-world figures range 0.5–2 tok/s on smaller or quantized
configurations.

**Disposition:**

- ⛔ **REJECTED for `interactive`.** Moves throughput 10–100× in the wrong direction on the one tier
  where throughput is already the blocker.
- ⛔ **REJECTED for `deferred`.** A queued summarization taking 20 minutes instead of 30 seconds
  consumes the whole machine's I/O while producing no quality the 7B/14B does not already produce
  adequately for that task.
- ⏸️ **PARKED for `batch`**, with no expected use. Even there, a quantized 32B on a GPU dominates it
  on every axis. AirLLM's value is *possibility on hardware that otherwise cannot run the model at
  all* — a constraint MAIA does not have, because MAIA's constraint is throughput, not admissibility.
- ⚠️ **Claim-discipline note.** "70B on a 4GB GPU" is a true claim about *possibility* that reads as
  a claim about *capability*. Under `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` that is a
  Live/Designed/Vision collapse. Flagged so it does not enter a deck or a sovereignty narrative as
  evidence of local capability.

---

## 7. Standing

**DIRECTION RECORDED · ⛔ LANE NOT OPENED · ⛔ L1–L4 NOT AUTHORIZED · ⛔ NO ROUTER CHANGE ·
⛔ NO SCHEMA CHANGE · ⛔ NO DEPLOY · AIRLLM REJECTED FOR INTERACTIVE AND DEFERRED · PRODUCTION
UNTOUCHED.**

Open founder questions, in the order they gate work:

1. Is the bypass-surface CI guard (§2) opened as its own act, ahead of any tiering work? It is the
   only item here that stops ongoing decay.
2. Does `modelRouter.ts`'s `tier: 'local'` branch get retired, or gated to `deferred`? These are
   different acts with different blast radii.
3. Does deferred cognition over member transcripts require a distinct consent posture beyond
   Sanctuary, given that the material stays local rather than leaving? *Staying local is a reduction
   in exposure, not an absence of one.*
