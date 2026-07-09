# Soul Portrait — silent Ollama→Claude fallback (sovereignty-path regression)

**Date:** 2026-07-09  ·  **Prod commit observed:** `d9700e0c8` (minisforum)  ·  **Status:** diagnosis complete; observability landed in worktree (NOT deployed); correctness fix proposed, awaiting confirmation.

## Symptom

Every Soul Portrait generation attempts local Ollama first, blocks ~5 min, throws
`UND_ERR_HEADERS_TIMEOUT`, then **silently** completes on cloud Claude
(`coercing 'qwen2.5:14b-instruct' → 'claude-sonnet-4-6'`). Violates the sovereignty
promise (local primary, cloud fallback only) and the fallback is invisible.

## Root cause (confirmed + quantified on prod)

Prod env (`maia-sovereign` container): `LOCAL_TIER_ENABLED=true`,
`OLLAMA_MODEL_DEEP=qwen2.5:14b-instruct`, `OLLAMA_BASE_URL=http://host.docker.internal:11434`
(reachable), Node `v20.20.2`, `MAIA_STRICT_503=1` (guards only the Claude-primary path — the
Ollama-primary path always falls back).

Measured throughput of `qwen2.5:14b-instruct` on this box (CPU inference):
`eval_count`=37 / `eval_duration`=12.06s ≈ **3.07 tok/s**, plus **12.3s** cold load.

`generateSoulPortrait` requests `tier:'deep'`, `maxTokens: 8000`. Real portraits run into
the thousands of tokens:

| portrait length | est. wall-clock @ 3 tok/s |
|---|---|
| 2000 tok | ~11 min |
| 4000 tok | ~22 min |
| 8000 tok | ~43 min |

`generateOllama` calls Ollama with **`stream: false`** and no explicit timeout. With
`stream:false` Ollama withholds HTTP response headers until the *entire* generation is done.
undici's default `headersTimeout` is **300000 ms (5 min)**. So headers never arrive within
5 min → `UND_ERR_HEADERS_TIMEOUT` fires on **every** portrait. Structural, not transient:
this hardware cannot return a portrait-sized generation within the headers timeout while
non-streaming.

`lib/consciousness/LLMProvider.ts` — `generateSimple` Ollama-primary branch — then falls
back to Claude with only a `console.warn`, no structured provenance.

## Part 1 — Observability (LANDED in worktree, not deployed)

`lib/consciousness/LLMProvider.ts`:
- Added `logSovereigntyFallback()` — emits one greppable JSON line
  `{"tag":"llm.sovereignty_fallback", intended_provider:"ollama", intended_model, served_provider:"anthropic", served_model, tier_or_level, reason, local_elapsed_ms}`.
  `reason` prefers `error.cause.code` (surfaces `UND_ERR_HEADERS_TIMEOUT`).
- Wired into **both** Ollama-primary catch blocks (`generateSimple` and `generate`).

Grep in prod: `docker logs maia-sovereign | grep llm.sovereignty_fallback`

## Fix A — LANDED in worktree (verified against prod Ollama, not deployed)

`generateOllama` now uses `stream: true` and accumulates the NDJSON deltas into one
complete `LLMResponse` (external contract unchanged). Streaming makes Ollama send HTTP
headers at the first token, so undici's 5-min `headersTimeout` no longer bounds total
generation time (`bodyTimeout` is an idle timeout between chunks — satisfied at any tok/s).

**Verified 2026-07-09** by running the exact fetch+parse pattern via `node -e` inside the
prod `maia-sovereign` container against `host.docker.internal:11434`:
`headers_after_ms: 40005` (cold model load), stream accumulated to completion,
`eval_count` captured. Under `stream:false` those headers would arrive only at full
completion. Fix A converts "always silently fails to cloud" into "local path can complete" —
necessary, but NOT sufficient (a portrait still takes ~15–40 min locally; see Part 2).

## Hardware question — RESOLVED: deep tier is CPU-bound on minisforum today

Checked before choosing among B options (2026-07-09):
- **Repo:** zero references to EVO-X2 / GPU / inference node; every compose file pins
  `OLLAMA_BASE_URL=http://host.docker.internal:11434` (minisforum's own CPU).
- **Tailnet** (from minisforum): `soullab` (minisforum), iPhone, Mac Studio (offline 23d),
  one 8GB Hetzner VPS. **No GPU/cognition node exists.**
- **Memory** `project_two_node_cognition_substrate_topology` (2026-06-09): the cognition
  node (MS-S1 MAX 128GB preferred; EVO-X2 an alternative) is a **planned direction with an
  explicit purchase gate** — "Phase 1 proves local conversational quality is load-bearing."
  Not yet purchased. When it lands, the intended wiring is exactly `OLLAMA_BASE_URL` →
  the new node, i.e. B2 becomes a one-env-var change later.

So B2 is not available today, and per the decision rule: **B1 (async job + poll) is the
sovereignty-faithful answer**, with B3 (bounded local attempt → provenance-labeled cloud
fallback) as last resort. Both change the Soul Portrait product surface → Kelly's call.

**Bonus:** the measured 3 tok/s deep-tier throughput is direct Phase-1 evidence for the
cognition-node purchase gate: interactive deep-tier local inference is NOT viable on
minisforum CPU.

## Part 2 — Correctness (PROPOSED — needs confirmation, do not deploy yet)

Two independent problems; the fix depends on the product decision:

**A. The false timeout — smallest fix.** Switch `generateOllama` to `stream: true` and
accumulate the NDJSON `response` chunks. Streaming makes Ollama send headers at the first
token, so `headersTimeout` is satisfied immediately and generation can run to completion.
This alone makes the **local sovereign path actually succeed**. Low-risk, isolated to
`generateOllama`; the method's external contract (returns full `LLMResponse`) is unchanged.

**B. The throughput reality — product decision (not code-only).** Even with streaming, a
portrait takes ~15–40 min on this hardware — too slow for a blocking browser request. Options
(Kelly's call):
  1. **Async generation** — turn portrait generation into a job + poll/notify, so slow-but-
     sovereign local generation is acceptable. (Best honors sovereignty.)
  2. **Smaller/faster deep model or GPU** for the portrait tier (e.g. a quantized 7B, or move
     Ollama to a GPU host). Keeps it interactive and local.
  3. **Explicit, fast, LOGGED fallback** — bound the local attempt (e.g. 20–30s) via
     `AbortSignal.timeout`, then fall to Claude *with provenance surfaced to the practitioner*
     (draft labeled "generated on cloud Claude"). Honest, but concedes the sovereign path for
     portraits on this hardware.

Recommendation: land **A** regardless (it's correct and unblocks the local path), then decide
**B** — option 1 (async) is the most sovereignty-faithful; option 3 is the minimum honest
stopgap if interactivity must be preserved now. Do **not** change the Soul Portrait product
surface without a separate decision.

**Provenance surfacing (part of B, deferred):** persist `provider`/`model` on the portrait
draft row so an auditor can see which portraits were cloud-generated. Schema change — propose
separately; not done here.
