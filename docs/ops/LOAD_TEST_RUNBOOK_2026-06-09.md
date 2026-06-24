# Load Test Plan & Runbook — Soullab / MAIA-SOVEREIGN

**Date:** 2026-06-09
**Purpose:** Find the concurrency at which the **substrate node (minisforum)** becomes the bottleneck, and attribute the *first* wall to **API vs Whisper vs DB vs app** — so we split STT/cognition onto a separate node only when a *local* wall is proven, not preemptively. (See `project_two_node_cognition_substrate_topology`.)

---

## 0. Finding already established (zero-spend, from code) — answers Priority #1

**1 user turn = exactly 1 member-facing Claude call (N=1), on all tiers.**

- Single seam: `generateText()` (`lib/ai/modelService.ts:77`) → `generateWithClaude` (`lib/ai/claudeClient.ts:149`). Provider is Claude **OR** local-Ollama fallback, never both.
- FAST (`maiaService.ts:1289`), CORE (`:1655`), DEEP (`:2147`) each call it once. DEEP's optional 2nd Claude call (`consultClaudeForConsciousness`, `:2024`) is **DISABLED by default** (`:2014`). Conditional **+1 only** on Socratic-validator regeneration failure (`:580`).
- **Corpus Callosum is NOT an API multiplier.** The 8 voices (Fire/Water/Earth/Air/Aether + MaiaVoice + ShadowAgent + MythicAtlas) run `fastMode:true` → `processAllFast()` regex keyword matching (~50ms, `lib/bridges/elemental-oracle-bridge.ts:328`), zero model calls. MythicAtlas = external HTTP fetch (`mythicAtlasService.ts:79`), not an LLM. Their `agent_runs` rows are **observational traces** (co-presence), not model invocations.

**→ Corpus Callosum multiplier: NO. Per-turn API spend & rate-limit exposure scale 1×, not 8×.**
*Phrasing discipline: name the mechanism — lightweight regex classification writing trace rows — not the mythology of parallel cognition.*

**7-day live volume** (`agent_runs` traces): CORE 1979, FAST 245, DEEP 9 → order **tens of turns/day**. Far below any wall today.

---

## 1. Design — 3 isolated measurements

Isolation matters: if every run is gated by Anthropic limits we'd just re-measure Anthropic, not the box.

### Test 1 — Per-turn cost (tokens, $)  ·  LOCAL, ~pennies
`scripts/load/probe-turn-cost.ts` — calls the live `generateText()` seam with a representative assembled prompt (reuse `scripts/repro/boundary-audit.ts` assembly), reads `message.usage`.
- **Output:** tokens_in / tokens_out, latency, $/turn, and resulting tokens-per-minute headroom vs the Anthropic tier.
- **Why local:** token magnitude is model-side (hardware-independent); avoids touching prod env. Tokens are **not persisted** anywhere (no token columns in `agent_runs`/`runtime_events`; only transient stdout when `MAIA_LOG_TOKEN_USAGE=true`), so we measure in-process.

### Test 2 — Text concurrency  ·  PROD route, real Claude, sanctuary, **GATED**
`scripts/load/text-ramp.ts` — ramp **[1, 5, 10, 25, 50]** concurrent authenticated turns at the live route `/api/sovereign/app/maia/list`.
- **Auth:** header `x-member-id: <load-test member uuid>` (`lib/auth/getMemberFromRequest.ts`; member row just has to exist — no session/CSRF).
- **Body:** `{ "message": "<varied>", "meta": { "sanctuary": true } }`. Sanctuary suppresses all memory writes (`route.ts:384,420,1063,1103,1133`) → **no member memory residue**; only content-free `runtime_events` rows (`member_id_prefix` NULL).
- **Per level:** p50/p95/max latency, error rate, **HTTP 429 (Anthropic rate-limit) count**, sampled `pg_stat_activity` connections + host load avg.
- **Cost:** 1+5+10+25+50 = **91 Claude calls ≈ pennies**. Off-hours only.

### Test 3 — Voice concurrency  ·  minisforum → whisper:8000, ZERO spend
`scripts/load/voice-ramp.ts` — ramp **[1, 3, 5, 10, 20]** concurrent POSTs of a synthetic audio fixture to `POST http://whisper:8000/v1/audio/transcriptions` (multipart, field per OpenAI API, `model=base.en`).
- Runs **on minisforum** (real hardware; Whisper = CPU `base.en`). No auth, no API, stateless, no member data.
- **Per level:** p50/p95/max transcription latency, errors, sampled CPU%/load/mem.
- **Fixtures:** synthetic TTS clips in `scripts/load/fixtures/` (regenerable via `say` + `afconvert`; no member data — keep out of git).

### Optional stage-2 — pure box ceiling
`scripts/load/mock-model-server.ts` + force local provider pointed at the mock → isolates web/DB/orchestration cost from model latency. Run **only if** Test 2 shows API as the wall and we want to know the box's headroom *beyond* the API limit.

---

## 2. Safety gates

- **Dedicated load-test member** (labeled name, fixed UUID), created for the run, **deleted after**. Never a real member's id.
- **Sanctuary** on all synthetic turns → no memory residue.
- **Real-Claude ramp (Test 2):** explicit go-ahead + off-hours + capped concurrency (≤50) only.
- **Voice + cost tests:** zero API / zero member data — runnable anytime.
- **Cleanup:**
  - `DELETE FROM runtime_events WHERE member_id_prefix IS NULL AND created_at > '<run-start-ts>';` (sanctuary rows from the run)
  - `DELETE FROM members WHERE id = '<load-test uuid>';`

---

## 3. Hard findings

- **Safe concurrent text users:** ____ (pending Test 2)
- **Voice — MEASURED (single ramp, `base.en`/CPU/8s clips, STT stage in isolation — bypasses mic/app/Claude/TTS):** throughput flat ~1.1 transcriptions/sec across concurrency 1→20, latency linear, CPU ~18% at 20-way. → **appears configuration-bound, not compute-bound** (inference; prove by adding workers + re-measuring). N=1, not repeatability-checked. TTS stage unprofiled.
- **Voice — DERIVED (planning model, NOT measured):** ~25–30 concurrent active speakers / ~3–4 simultaneous-burst — extrapolated from 1.1/sec ÷ assumed ~30s cadence. Treat as forecast until a real end-to-end voice-path load test.
- **First (local) bottleneck:** **Whisper STT serialization** — and it is a **config limit, not hardware** (CPU only ~18% / load 2.9 on 16 threads during the 20-way burst). Text/API wall pending Test 2 (expected Anthropic-tier, fixed by plan not hardware).
- **Corpus Callosum multiplier:** **NO** — 1× Claude call per turn. Confirmed from code (§0) AND data (257 turns/7d → 257 `anthropic` rows, vs ~2,233 `agent_runs` trace rows ≈ 8.7/turn).
- **Recommended action:** Voice headroom is a **free software fix** — run multiple `faster-whisper` workers (≥13 idle threads) and/or GPU-enable the Radeon 780M; re-run Test 3, expect ~N× throughput. **Do NOT buy hardware for this.** Hardware/cognition-node split is justified only by a *proven* local wall that config can't fix.

### Test 3 results — Voice (8s clips, base.en, CPU, minisforum) 2026-06-09
| concurrent | p50 | p95 | throughput |
|---|---|---|---|
| 1 | 966ms | 966ms | 1.0/s |
| 3 | 2188ms | 2661ms | 1.1/s |
| 5 | 3577ms | 4522ms | 1.1/s |
| 10 | 6858ms | 8706ms | 1.1/s |
| 20 | 12956ms | 17143ms | 1.2/s |

Cold-start (model load) ≈ 3.9s on first request. Throughput flat across all levels = serial processing; latency linear in concurrency = pure queue. Shorter utterances scale the numbers (faster per job) but not the serial pattern.

### Test 1 partial — per-turn input size (free, from `runtime_events.prompt_block_chars`, 7d)
n=257 · avg **10,445 chars** · p50 10,994 · p95 13,996 · max 14,312 → ~3k tokens of assembled context block/turn (total input larger w/ base prompt + history). Exact tokens (incl. output) need the in-process probe.

---

## 4. Run params (confirmed)

- **Local dev stack:** up (postgres/whisper/workers) but **no `maia-sovereign` app container** → voice test runs on minisforum regardless.
- **Whisper reachability:** port NOT published; network `maia-sovereign_maia-internal` → reach via `docker exec maia-sovereign node`.
- **7-day turns (`runtime_events`):** 257 (all `anthropic`, 0 sanctuary, 0 local-fallback) ≈ **37/day**.
- **Load-test member uuid:** `a0adf00d-0000-4000-8000-000000000001` (labeled `ZZZ LOAD TEST`; created + deleted by the run; preflight confirmed cleanup).
- **Anthropic tier RPM / TPM:** ____ (needed to finish the $/min + tokens/min headroom calc — supply when known).
- **Traffic by UTC hour (14d):** zero-traffic window **04:00–09:00 UTC**; peaks 00–02 UTC & 13 UTC.

---

## 5. Scheduled run — Test 2 (text ramp)

**Armed:** self-removing cron one-shot `0 7 * * *` (**07:00 UTC**) on minisforum, marker `# MAIA-LOADTEST-ONESHOT`. Fires once, removes its own cron line, runs `~/text-ramp/run-text-ramp.sh`. (minisforum clock = UTC; existing `maia-reminders` cron preserved.)

**Validated:** zero-Claude preflight PASSED — `POST {}` → `400 NO_MESSAGE` in 105ms in-container (auth + route + reachability good, no spend).

**On fire it will:** create labeled load-test member → ramp **1/5/10/25/50** sanctuary turns at in-container `http://localhost:3000` (bypasses Caddy) → sample DB conns + app CPU/mem every 2s → scrape Claude-only latency from logs → **purge the member + this run's sanctuary `runtime_events` rows via EXIT trap (runs even on failure)** → write `~/text-ramp/result-<ts>.md`.

**Retrieve after 07:00 UTC:**
```bash
ssh soullab@minisforum 'cat /home/soullab/text-ramp/result-*.md'
```
Then fill §3: **safe concurrent text turns · first text bottleneck · whether 429 appears by 50-way.**
