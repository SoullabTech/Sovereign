# PRE-WITNESS-04 — PLAN (for founder acceptance; no code until accepted) — 2026-09-12

**Authorized by:** founder, 2026-09-12, on the attested run-3 record — *"Draft authorized — plan only, no code. Scope stays exactly as stated: refined B, C vocabulary, and W4 VP-ON exit measurement folded into the next witness."*
**Standing it starts from:** PRE-WITNESS-03 bounded W3 (ratified 3/60 s ceiling governs the configuration-change path) and produced the causal lever: on this iPhone/build/runtime, **VP ON → a configuration change follows every graph start; VP OFF → none, and generation 1 reaches and holds listening.** Candidate A REJECTED for normal operation (kept as safety). Architecture UNCHANGED. Thresholds UNCHANGED.
**Evidence status:** the run-3 journals are founder-read; this plan is drafted from the founder's reading and the source. Nothing in it is asserted as Apple-universal.

## 1. The question this plan makes measurable

*When a VP-enabled graph start is followed by its expected configuration change, does the existing graph settle into a live input if the kernel does nothing — and if it does not, what exactly is dead?* Run 3a could not answer this because the kernel acted (rebuilt) on every change within the 500–2000 ms backoffs; the generation never lived long enough for the HealthSupervisor's ratified windows to run. The plan's first move is therefore to **stop acting on the notification and let the supervisor judge**, with instrumentation sufficient to say afterwards why it judged as it did.

## 2. Scope (verbatim from the ruling, made concrete)

### 2.1 C — vocabulary: `voice_processing_reconfiguration`

An `engine_configuration_changed` observation is **classified** at the instant it is journalled, by a pure function over evidence the kernel already has:

```
voice_processing_reconfiguration   when  voiceProcessing == true for the current generation
                                     AND  the session route at the instant equals the route recorded at that generation's graph_started
                                     AND  no interruption / media-services-reset is in progress
route_configuration_change         otherwise (the route actually changed — K00-11 territory, unchanged handling)
```

The classification is an **evidence field on the observation** (`classification`), never a new event and never a new state. `entry_reconfiguration` is retired as a name before it is ever used — run 3a showed the phenomenon follows later VP-enabled starts, not only generation 1. *The founder chooses the final word; this plan proposes `voice_processing_reconfiguration` because it names the observed cause and nothing more.*

### 2.2 B — refined: classify · defer · observe · rebuild only on a health verdict

For a change classified `voice_processing_reconfiguration`:

- **No rebuild, no recovery request, no generation change.** The handler journals the observation with its classification and a `configuration_change_deferred` record (`causeSeq` = the observation), and returns. The existing graph and generation stand.
- **The HealthSupervisor decides**, using only its ratified windows, exactly as it does for every other generation: if input callbacks arrive, `unknown → healthy` and the floor reaches `listening` (K00-03 becomes honestly measurable with VP ON); if none arrive within the 1500 ms entry window, the supervisor's existing `entry_timeout` verdict requests recovery through the existing RecoveryPolicy under the existing `entry_timeout` fault class. **No new budget, no new fault class, no new recovery logic.**
- A change classified `route_configuration_change` keeps PRE-WITNESS-03's path unchanged: `recovery_requested configuration_change` → RecoveryPolicy → bounded.
- **What this deliberately does not do:** it does not wait-then-rebuild (the founder's refinement: a delayed VP-enabled rebuild could recreate the cycle more slowly), and it does not restart the engine in place. Whether a restart-in-place is ever lawful is the fork in §4, ruled on evidence, not pre-chosen.

### 2.3 Instrumentation so the journal can adjudicate §4 (additive fields only)

- `engine_configuration_changed` gains `classification`, `voiceProcessing`, `engineRunning` (at the instant), `routeAtStart`, `routeNow`.
- `configuration_change_deferred` carries `generation`, `generationAgeMs`, `engineRunning`.
- After a deferred change, the existing per-second `input_health_sample` (P4) additionally carries `engineRunning` and `callbacksSinceChange`, so the record shows whether the engine kept rendering input after the change or went silent.
- Nothing else. No new timers.

### 2.4 W4 under VP ON — folded into the next witness

Runbook step for run 4a: **Leave within ~2 s of Enter** (while a VP change may be in flight), then export. Acceptance: after `session_released` the journal contains only `stale_callback_dropped cause not_in_conversation` for any late notification; no `graph_started`/`graph_rebuilt`; floor stays `idle`; replay 0 orphans.

### 2.5 Gates and tests

- `swift test`: pure tests for the classifier (VP on + same route → `voice_processing_reconfiguration`; route differs → `route_configuration_change`; VP off → never `voice_processing_reconfiguration`).
- Source gate additions: (a) a deferred change never reaches `rebuildGraph` or `requestRecovery` (the handler's deferred branch contains neither); (b) `HealthThresholds` and `RecoverySchedule` values byte-identical to the ratified ones (already pinned; re-asserted); (c) no new fault class string appears in the kernel other than the existing ones plus `configuration_change`.
- MAC-COMPILE-05 verbatim on the exact SHA before any device act.

## 3. Not authorized by this plan

Threshold changes · new recovery budgets or fault classes · restart-in-place of an engine (§4 B2) · configuring VP differently around session activation (§4 B3) · STT/TTS/providers · turn work · lower-level AudioUnit migration · architecture amendment · legacy repair · H1 (still held).

## 4. Falsification (decided by the run-4 journal, not by preference)

**F1 — defer succeeds.** After a deferred `voice_processing_reconfiguration`, input callbacks arrive within the existing 1500 ms entry window on the SAME generation; floor `entering → listening`; held ≥ 20 s; K00-03 measurable and, if ≤ 1500 ms, PASS with VP ON. → B refined is the operating answer; C's classification stands.

**F2 — defer fails, engine stopped.** After the deferred change, `engineRunning: false` in every sample and zero callbacks; `entry_timeout` fires; recovery via the existing policy rebuilds; the new generation provokes the same change; bounded exhaustion → `degraded`. This proves the change **stops the engine** on this runtime, so "observe settlement" cannot succeed by waiting. The fork then needs a founder ruling between: **B2** restart the same engine in place on the same generation (Apple's documented response to this notification — a reconnect+restart, which the ratified *rebuild-not-resume* line must be read against explicitly), and **B3** arrange VP so the reconfiguration does not occur after start (e.g., enabling VP before activation or before the first start, to be established, not assumed). Neither is implemented by this plan.

**F3 — defer fails, engine running but silent.** `engineRunning: true`, zero callbacks. The tap, not the engine, is dead after the change → the finding is at the tap seam; ruling owed; not pre-chosen.

**Control:** run 4b repeats VP OFF once as the baseline (expected: F1's shape without any change at all).

## 5. Sequence

Founder accepts this plan (by number, amendments recorded in place) → implement §2 only → `swift build/test` · gate · `xcodegen` · unsigned · signed = MAC-COMPILE-05 → founder accepts → install → **run 4a** VP ON: Enter → 20 s → Export → Leave-within-2-s-of-a-fresh-Enter → Export → **run 4b** VP OFF control → `KERNEL-00_WITNESS_<date>_run4.md` → founder rules F1/F2/F3.
