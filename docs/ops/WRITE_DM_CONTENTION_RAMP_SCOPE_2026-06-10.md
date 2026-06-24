# Write + DM Contention Ramp — Scope (for sign-off before execution)

**Date:** 2026-06-10 · **Status:** scope only, **nothing run, no harness code changed yet.**
**Closes the gap** the 2026-06-10 text ramp left open: that ramp ran every turn `meta.sanctuary:true` (writes suppressed) and never touched DMs, so **memory-write contention and DM load are unmeasured.** Reads + Claude at 50-way are measured and clean (50/50, 0 429, 0 5xx, p95 11.6s). This ramp measures the rest.

**Risk profile change vs the text ramp:** this one writes **real rows + real DMs to prod under load.** So isolation/teardown and a sign-off gate are load-bearing, not nice-to-haves. Off-peak only.

---

## 1. Isolation & **verified** teardown (the load-bearing part)

**The orphan risk is worse than it looks** — the per-turn write fan-out is wide *and* uses inconsistent key columns, so a naive `DELETE WHERE member_id` would leave orphans (your exact failure mode). Tables a non-sanctuary turn through `/api/sovereign/app/maia/list` can write:

**PROD-VERIFIED keys (2026-06-10 preflight — my first draft was wrong on most of these):**

| Table | **actual** key (prod) | rows now |
|---|---|---|
| `runtime_events` | **`member_id_prefix`** — a PREFIX; teardown matches `left(synthetic_id, N)`, not `=` | 658 |
| `agent_runs` (8-voice traces) | **`user_id`** | 26,368 |
| `episodic_memories` | **`user_id`** | 53 |
| `breakthrough_moments` | **`user_id`** | 724 |
| `memory_links` | **`user_id`** | — |
| `memory_contracts` | `member_id` | — |
| `team_dm_messages` (DM) | **`sender_id`** | 34 |
| `embedding_jobs` | `target_id` (indirect; whatever the turn embeds) | — |
| ~~`semantic_memories`/`_vectors`~~ | **DO NOT EXIST on prod** — `SemanticMemoryService` inserts a non-existent table (no-op); **off the teardown list** | — |

**Why a `member_id`/`user_id` net was dangerously incomplete:** prod uses `user_id` for four of these, `member_id_prefix` for `runtime_events`, and `sender_id` for DM — so the two-column net would have orphaned the *majority* of actual writes. The schema carries **16** distinct member-identifier column names: `member_id` (162 tables), `user_id` (84), `created_by` (19), `member` (3), `sender_id` (3), `actor_id` (2), `member_id_prefix`, `owner_user_id`, `provider_user_id`, and a `*_by_member_id` family + `a_member_id`/`b_member_id` (on `synastry_analyses`). The discovery net must enumerate **all of them**.

**Teardown design = discovery-based, not a hardcoded list:**
1. **Pre-ramp discovery — SCHEMA-driven over the FULL identifier set (corrected by the preflight):** enumerate every `(table, column)` where the column is any of the **16 prod-verified** member-identifier names (`member_id`, `user_id`, `created_by`, `member`, `sender_id`, `actor_id`, `member_id_prefix`, `owner_user_id`, `provider_user_id`, the `*_by_member_id` family, `a_member_id`/`b_member_id`) — derived from `information_schema`, **not** from the ramp's expected write list. That's the TOCTOU answer: a write to an unanticipated keyed table still lands in the zero-assertion's net because the net is the schema. `member_id_prefix` is matched by `left(synthetic_id, N)`, not `=`. Snapshot baseline counts per synthetic member across all pairs (delete only ramp-created rows). **Indirect residual:** tables keyed *only* by an FK with no identifier column — `embedding_jobs` (`target_id`) resolved explicitly; the verify step also scans `information_schema` FKs *referencing* the tables we wrote, so any second indirect table surfaces as a non-zero orphan rather than a silent pass. (`semantic_memories`/`_vectors` are NOT a concern — they don't exist on prod.)
2. **Teardown order:** delete indirect rows first (`embedding_jobs WHERE target_id IN (synthetic members' semantic_memories ids)`), then all `member_id`- and `user_id`-keyed rows; DMs cascade (§2).
3. **VERIFIED, fail-loud:** re-run the discovery counts → **assert exactly zero** rows remain for every synthetic member across **every** enumerated table (member_id *and* user_id columns) + zero dangling `embedding_jobs`. Any non-zero → the run is reported **FAILED / DIRTY**, not "cleaned." Teardown success is a measured assertion, never an assumption.
4. **Async-write race:** embeddings + some memory writes are fire-and-forget (queued post-response). Teardown must **quiesce** — wait for `embedding_jobs` for the synthetic members to drain (or be force-deleted) — before the zero-assertion, or it'll false-positive on in-flight rows.

Synthetic identities: **two** members (a DM needs both sides), random UUIDs created at start, both in the teardown set.

## 2. DM read **and** write — both sides

`findOrCreateDMThread` → `INSERT INTO team_dm_threads DEFAULT VALUES` + `team_dm_members`; `sendDMMessage` → `INSERT INTO team_dm_messages`. `team_dm_members`/`team_dm_messages` are `ON DELETE CASCADE` from `team_dm_threads`, so **DM teardown = delete the synthetic thread(s) → cascades** (then verify zero per §1.3).

The ramp exercises **concurrent read-while-write on one thread**, not just send throughput (else it inherits the text ramp's shape of gap):
- **Writers:** N concurrent `sendDMMessage` to the same synthetic thread.
- **Readers:** M concurrent `getDMMessagesSince` (the SSE "reaches other viewers on next load" path) against that thread *while writes land*.
- **Pinned to ONE thread:** writers and readers target the **same** synthetic `dm_thread_id` — same-thread contention is what exposes serialization on `team_dm_messages`. Parallel *isolated* threads would look clean and tell us nothing about the contention we're probing, so the harness uses a single shared thread id for the read/write mix (a second thread, if any, is only for create-throughput, measured separately).
- Measure send latency, read latency, and read **staleness/consistency** under concurrency — not just 2xx.

## 3. Capture the **contention** signal (not pass/fail)

**Baseline first (differential, not absolute):** capture the *same* metric set during (a) the off-peak quiet window immediately before the ramp and (b) the preflight dry-run (zero Claude, zero writes). Some `pg_locks NOT granted` / lock waits exist under normal prod load, so the headline is the **delta over baseline** — "lock-wait climbed at conc=25" only means something as "from baseline X to Y." This baseline also feeds the §5 abort threshold. Without it the curve is uninterpretable.

Sample every ~2s during each level (alongside CPU/mem):
- `pg_locks WHERE NOT granted` → count of **lock waits** (the direct signal).
- `pg_stat_activity` → backends in `wait_event_type IN ('Lock','LWLock')`, classified.
- `pg_stat_database (maia_consciousness)` deltas → **deadlocks**, **xact_rollback** (retry/abort rate), `blks_read`.
- Per-statement write latency: **`pg_stat_statements` is NOT installed on prod (preflight-confirmed, `pg_extension` count 0)** → per-INSERT latency is unavailable; **request-level write latency is the binding signal** (limitation: it blends app + Claude + DB, so the lock-wait/deadlock counters carry the write-contention truth, latency is corroborating only).
- **Headline to decide:** do concurrent writes to the same memory structures **serialize / deadlock / degrade**? A "50/50 OK" that hides rising `pg_locks.NOT granted` reproduces the original problem in a new place — so the lock-wait curve is the primary output, latency second, 2xx last.

## 4. `team_id` pre-check — ✅ RAN 2026-06-10, GREEN (DM creation healthy)

`findOrCreateDMThread` uses `INSERT INTO team_dm_threads DEFAULT VALUES`. Probed schema **and** behavior; both green:
- **Schema:** `team_dm_threads` has only `id` (default `gen_random_uuid()`) + `created_at` (default `now()`) — **no `team_id` column at all** → `DEFAULT VALUES` always succeeds. The only `NOT NULL team_id` tables in prod are `studio_team_invites` / `studio_team_members` (membership tables, legitimately required); `team_channels` doesn't appear → the multi-team `team_id NOT NULL` migration is **not applied on this prod DB** (consistent with deploy-flag #2's "500s *where applied*").
- **Behavioral:** 26 DM threads / 34 messages; last thread created today 04:03 UTC, last message today 17:50 UTC → DM create+send is alive. Schema and behavior cross-validate: no live bug.

**Decoupling principle (recorded):** had this been red (`team_dm_threads.team_id NOT NULL` no default), it would **not** have been "stop the ramp" — it would be a **P1: DM creation broken for all users**, surfaced and fixed as its own thing with the ramp waiting behind the fix. The pre-check's value is independent of whether the ramp ever runs. Here: green → proceed.

**Carry-over to the (separate, frozen) channel-lift track — note, don't lose:** the same probe shows `team_channels` carries **no `NOT NULL team_id`** on this prod DB → the multi-team migration isn't applied here, so **deploy-flag #2's channel-creation `team_id` concern is also moot on this DB.** When the lift unfreezes (behind the *open SHA reconciliation* — a separate track, NOT unblocked by this ramp), that's one fewer prod check to re-run. Recorded here so it isn't re-verified from scratch later. **This note does not unfreeze the lift; the SHA question stands.**

## 5. Window, abort conditions, sign-off gate

- **Window:** 04:00–09:00 UTC (the measured zero-traffic band). Run inside the container (`docker exec`), localhost:3000, like the text ramp.
- **Abort (auto-stop the ramp):**
  - **Binary (any occurrence aborts):** any 5xx, any deadlock (`pg_stat_database.deadlocks` delta > 0), any Anthropic 429, wall-time runaway.
  - **Baseline ≈ 0 → use an ABSOLUTE FLOOR, not a pure multiple (preflight finding):** the baseline sample (even at active ~18:00 UTC load) showed `pg_locks NOT granted = 0`, `backends_lock_waiting = 0`, `deadlocks = 0`. With baseline 0, "N× baseline" degenerates (×0 = 0). So the gate is `pg_locks NOT granted` **sustained above a small absolute floor** (proposed in preflight, e.g. >3) — *and* if the off-peak baseline is non-zero, `max(N× baseline, floor)`. Either way: held across **≥2 consecutive 2s samples** — *not* a single sample, so a one-sample transient at a level boundary (connection pool ramping 10→25) doesn't false-abort. Deadlock = **binary** (one occurrence = real defect = abort); lock-**wait** = **sustained-over-threshold** (graded). Different signals, different gates. Baseline from §3 (quiet window + preflight); couple by design: **capture baseline → set the multiple → run.** N proposed in the preflight, surfaced for sign-off — not chosen blind.
  - **Bound the blast radius:** hard ceiling on total synthetic rows so even a teardown failure is finite and fully enumerable for manual cleanup.
- **Levels:** start smaller than the read ramp (writes are heavier) — e.g. 1/5/10/25, hold 50 only if 25 is clean.
- **Sign-off gate:** this scope reviewed + the §4 pre-check green → then I build the harness (§6) → then a **dry-run with teardown-verify but zero Claude/writes** (preflight) → then execute in-window.

## 6. Harness changes (post-sign-off, on a branch)

- `scripts/load/write-dm-ramp.cjs` — a write variant: turns with `meta.sanctuary:false` (real writes) + a DM read/write mixed mode (§2).
- Extend `run-text-ramp.sh` (or a sibling) with: synthetic-pair create, §1 discovery+baseline, §3 contention sampling, §4 pre-check, the ramp, drain/quiesce, teardown, **verify-zero assertion**, result file. Self-cleaning `EXIT` trap like the existing one, but with the verify-zero as the success criterion.

## 7. What it will / won't tell us (honest bounds)

- **Will:** whether concurrent memory writes + DM read/write serialize/deadlock/degrade on the current single Postgres + single app container, with lock-wait and deadlock numbers.
- **Won't:** voice path (separate Whisper finding), multi-day soak, or real-user content distribution (synthetic messages). Marked measured-vs-derived in the eventual ADR, like the text-ramp correction.

**Nothing run. Review against your five requirements; I'll revise, then we gate.**
