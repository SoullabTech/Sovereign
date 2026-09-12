# KERNEL-00 · DEVICE WITNESS · RUN 6 — 2026-09-12 — P5-B0 removal control — EXECUTED · VERIFIED · MIXED · ATTESTED

**Question:** is the Phase-A pre-VP `input.outputFormat(forBus: 0)` read the cause of the VP-ON engine becoming running on this device/runtime (P5-F1)? Plan and predeclared decision table: `PRE-WITNESS-05_P5-B0_2026-09-12.md` §4.

## 1. Artifact identity

| | |
|---|---|
| Source | `24a6fcfa1` — P5-B0 subject (= `4596b9bdb` minus exactly the pre-VP format read and its trace step; 13-step trace) |
| Compile record | `KERNEL-00_MAC-COMPILE-07_2026-09-12.md` — GREEN (build · test 30/30 · gate 32/32 · xcodegen · unsigned + signed `BUILD SUCCEEDED`) |
| Code identity | `VoiceKernelHarness.debug.dylib` UUID **`CC0D3604-7902-373E-A2BB-2C093D9BF804`** (run 5: `11A057AA-…`; run 4: `37A27138-…`) |
| Signing | Apple Development: Kelly Nezat (N9DTF6434L) · iOS Team Provisioning Profile: * · team `ZVK2X646Z2` · `life.soullab.voicekernel.k00` |
| Install | bundle container `977ED940-4F17-4129-869D-0DA71BB3FC00` · databaseSequenceNumber 4224 (run 5's was 4216) |
| Device | iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · devicectl `A0736AC8-…` · Xcode destination `00008140-00163D9922E0801C` |
| Acceptance | founder, explicit (record read; `AudioGraph.swift` delta inspected against `4596b9bdb`; "Accepted") and by conduct (installed) |

## 2. Pre-run device state (founder, post-install)

`installed: VoiceKernel K00 · life.soullab.voicekernel.k00 · 0.0.1 · 1` · `running: (none)` → every run-6 session starts from a cold process.

## 3. Protocol (confirmed by the founder, verbatim substance)

- **6a — VP ON:** force-quit / confirm cold → icon → Voice processing ON → Enter once → ~15 s → Export.
- **6b — VP OFF:** fresh cold process → icon → OFF → Enter once → ~15 s → Export.
- **6a-2 — VP ON, only if 6a listens:** fresh cold process → icon → ON → Enter once → ~15 s → Export.
- Optional, still owed from runs 3–5, its own session: **W4 in-flight** — ON → Enter → Leave within 2 s → 3 s → Export.

Protocol fields not stated by the founder are recorded `UNKNOWN`; nothing is reconstructed from journals.

## 4. Predeclared reading (founder, verbatim substance)

```
6a fails to become running / listen      → pre-VP format read STRONGLY CAUSAL; initialization dependency promoted to finding
6a + 6a-2 both listen                    → pre-VP read FALSIFIED as sufficient cause; mechanism stays open
mixed VP-ON sessions                     → NONDETERMINISM; stop causal narrowing; no mechanism claim
6b (VP OFF control)                      → expected unchanged (listening ≈ 330 ms)
```

Not opened: E1–E4 · B2 · thresholds · recovery law · any further `AudioGraph.start()` change.

## 5. Sessions — RECEIVED, HASHED, VERIFIED

Every journal carries a 13-step generation-1 trace with **no `input_format_before_vp`** — the P5-B0 subject is confirmed from the evidence itself. Files preserved beside this record:

| Session | File | Records | SHA-256 |
|---|---|---|---|
| 6a · VP ON | `KERNEL-00_WITNESS_2026-09-12_run6a_K00-d2780a55_vpON.jsonl` | 58 | `6040cf07fc8691108dbb551dff8d95369b8f0baa2adf0a8ea20e7eeec7bd7858` |
| 6b · VP OFF | `KERNEL-00_WITNESS_2026-09-12_run6b_K00-1962f04b_vpOFF.jsonl` | 91 | `411f123741b650d1ce043612d2ed860aac293ad7237699d4538928e04cd2c9f4` |
| 6a-2 · VP ON | `KERNEL-00_WITNESS_2026-09-12_run6a-2_K00-3328bd74_vpON.jsonl` | 144 | `a181d62ba448cad6a5761e32b6ebdd4539c1f9d55de3afea3af475362a32780d` |
| W4 in-flight · VP ON | `KERNEL-00_WITNESS_2026-09-12_run6W4_K00-55471e75_vpON.jsonl` | 45 | `2612253796b5c011840228b3291ed79e6167e6720ca138505b35c6818d0de0f9` |

### 6a — VP ON — `K00-d2780a55` — LISTENED
`vp_enable_return` 136 ms, readBack true, `route_changed` inside the call · `start_return` ok 156 ms (329 total) · **`is_running_immediate` TRUE · `graph_started` engineRunning TRUE** · one `voice_processing_reconfiguration` at 4 ms, deferred, engine stays running · first callback +95 ms · **listening 555 ms after Enter** · 10/10 running ticks through 1048 ms · gen 1 held 21.4 s at 10–11 callbacks/s, every sample `healthy` · exported in conversation.

### 6b — VP OFF — `K00-1962f04b` — control LISTENED; then an UNPLANNED OS INTERRUPTION, recovered lawfully
`setVoiceProcessing false` journalled pre-Enter · `vp_enable_return` 0 ms, readBack false · engine running at start · first callback +98 ms · **listening 330 ms** · gen 1 held 20 s. **At 20.46 s after Enter, `interruption_began` (`os_interruption`)** — not in the protocol; cause UNKNOWN unless the founder states it. The kernel: floor `listening → recovering` (health suspended) · route `none/none` at 44.1 kHz · a sample with `engineRunning: false` during the interruption · `interruption_ended shouldResume: true` at +1.12 s · re-activation **stamped `interruption_recovery`** (category · rate · IO buffer · `session_activated` — the lawful OS-forced re-activation under the P2 clarification of K00-02) · **generation 2 rebuilt, not resumed** · engine running at start · first callback +94 ms · **`recovering → listening` 308 ms after re-activation, 1.43 s after the interruption ended** · 5/5 running ticks to export. This is the first time the interruption path (K00-12 shape) has been exercised on the device. It is recorded as **observed under an unplanned event**, not as a K00-12 protocol pass — the runbook step was not run.

### 6a-2 — VP ON — `K00-3328bd74` — DID NOT LISTEN IN GENERATION 1; reached listening at generation 4 through the existing policy
Pre-Enter the founder toggled VP OFF then ON (both journalled; VP ON at Enter). `vp_enable_return` 97 ms, readBack true, `route_changed` inside · `start_return` ok 143 ms (294 total) · **`is_running_immediate` FALSE · `graph_started` engineRunning FALSE** — the run-2/3/4 failure shape, on this subject · `voice_processing_reconfiguration` at 120 ms, deferred · zero callbacks · 0/10 running ticks · `input_health_sample` `inputFlow: unknown` · **`entry_timeout` at 1566 ms → recovery attempt 1 → gen 2 built 500 ms later inside a reconfiguration window → `graph_start_refused invalidInputFormat(0.0 Hz, 1 ch)`** (§3 guard, exactly as in run 2) → `graph_rebuild_failed` attempt 1 (six `input_dead` requests coalesced during the backoff, as in run 3) → **gen 3: `is_running_immediate` TRUE at start return, but `graph_started` 353 ms later reads engineRunning FALSE, zero callbacks** — a shape not seen before on this device (F2 was sharpened as "nothing ever ran"; in gen 3 something was running at start return and was not running 353 ms later, before any callback; the 353 ms gap between the two reads is itself unusual, other generations read ≤ 5 ms apart) → gen-3 change #1 classified VP (deferred), change #2 correctly refused the VP classification → `route_configuration_change` → `configuration_change` attempt 1 → **gen 4: engine running, first callback +2 ms, `suspect → healthy`, `recovering → listening` at 5.22 s after Enter** · gen 4 held 10.5 s to export at 10–13 callbacks/s. Three fault classes each spent attempt 1 of their own budget; K00-10 bounded; no orphan. **Generation-1 entry FAILED (ratified entry window 1500 ms); the organism reached listening later by lawful recovery — the first VP-ON failed entry on this device to end in listening rather than `degraded`.**

### W4 in-flight — VP ON — `K00-55471e75` — exit clean; the ≤ 2 s condition NOT MET a third time
Listening at 443 ms (gen 1, engine running, deferred VP change at 2 ms). **Leave at 3.57 s after Enter** (attempts: 10.8 s · 9.85 s · 3.57 s). One `session_deactivated`, `session_released`, `listening → idle` by the Leave chain; **nothing after `session_released`**. The generation had been healthy for 3.1 s at Leave; the deferred-reconfiguration window (closed at 2 ms) was not stressed. Exit clean; in-flight condition unexercised.

## 6. The predeclared table, applied

```
6a    VP ON   gen-1 engine RUNNING · listening 555 ms                     → LISTENED
6a-2  VP ON   gen-1 engine NOT RUNNING · entry_timeout · listening only at gen 4 (5.22 s) → DID NOT LISTEN (gen 1)
→ MIXED VP-ON RESULTS → NONDETERMINISM → causal narrowing STOPS → NO MECHANISM CLAIM
```

Neither cell of the pre-VP-read question is reached: the read is **not established as causal** (6a took without it) and **not falsified as a sufficient cause** (6a-2 did not take without it). The ruling that governs is the third row: investigate nondeterminism first.

**Tally kept as a tally, not an inference (small samples):** VP-ON generation-1 starts that took — run-2/3/4 builds: 0 of ≥ 15 · Phase-A subject `4596b9bdb`: 5 of 5 · P5-B0 subject `24a6fcfa1`: 2 of 3 (6a, W4 took; 6a-2 did not).

## 7. Observations (kept as observations)

- **O1** The gen-3 `is_running_immediate TRUE → graph_started FALSE` reading in 6a-2 is new evidence for the F2 question: at least once on this device, a VP-enabled `start()` returned with the engine running and the engine was not running 353 ms later with zero callbacks. Whether that is "started then stopped" or a read artefact of the 353 ms actor gap is **not determinable from this journal**.
- **O2** In 6a-2 the bounded recovery reached listening by traversing three fault classes (`entry_timeout` → `graph_rebuild_failed` → `configuration_change`), each within its own budget. That is lawful under the ratified per-class policy; whether a member-facing 5.2 s entry is acceptable is a K00-03 threshold question and the threshold is not loosened here.
- **O3** The 6b interruption is the first device evidence for the interruption/re-activation law (P2) and rebuild-not-resume under interruption; its cause is not in the journal.
- **O4** Every VP-ON `setVoiceProcessingEnabled` call on this subject still posts `route_changed` from inside the call (93–237 ms), on every generation, taking or not.

## 8. Standing after run 6 (superseded by §9)

```
SUBJECT              24a6fcfa1 · dylib CC0D3604-…
6a   VP ON           LISTENED (gen 1, 555 ms, held 21 s)
6b   VP OFF          control LISTENED (330 ms); unplanned OS interruption at 20.5 s → lawful interruption_recovery → gen 2 listening 1.43 s later
6a-2 VP ON           gen-1 FAILED (engine not running, entry_timeout) → refused 0 Hz gen 2 → gen 3 ran-then-not → gen 4 LISTENING at 5.22 s
W4   in-flight       exit clean · Leave at 3.57 s (≤ 2 s NOT met, third attempt)
TABLE                MIXED → NONDETERMINISM → causal narrowing STOPPED · mechanism UNKNOWN · pre-VP read neither causal nor falsified
E1–E4                HELD · B2 HOLD · thresholds UNCHANGED · architecture UNCHANGED · NO CODE
OWED                 founder attestation · 6b interruption cause (UNKNOWN unless stated) · founder ruling on how nondeterminism is investigated · protocol fields UNKNOWN
```

## 9. Founder attestation and rulings — 2026-09-12 (verbatim, no code)

**Attestation (founder, verbatim):**

> Founder attestation — 2026-09-12: I witnessed Run 6 as recorded. On the P5-B0 subject, voice processing ON produced mixed cold-start behavior: one session reached and held listening in generation 1, while another failed entry in generation 1 and reached listening only through bounded recovery. The VP-OFF control reached listening normally and later recovered lawfully from an unplanned interruption. I attest that the record fairly represents what occurred. Run 6 establishes nondeterminism on this subject; it does not establish a causal mechanism.

**RUN 6 ATTESTED. NONDETERMINISM ESTABLISHED on `24a6fcfa1`. Mechanism NOT established.**

**Rulings (founder, same act):**

1. **6b interruption cause — UNKNOWN.** Founder does not know whether it was a call, Siri, a notification, a system event, or something else. **No cause is to be inferred.** The only finding: a real interruption occurred and the governed rebuild path recovered from it.
2. **Nondeterminism investigation — NO CODE. Three stages, in order:**
   - **Stage 1:** five additional cold VP-ON sessions on the currently installed `24a6fcfa1` (dylib `CC0D3604-…`). Each classified **only** as one of: `gen-1 listen` · `failure then recovery` · `failure then degradation` · `other observed shape`.
   - **Stage 2:** reinstall the **exact same signed P5-B0 artifact** (same source, same dylib identity), then three more cold VP-ON sessions — separating source behaviour from possible install/runtime-state effects.
   - **Stage 3, conditional:** only if those eight sessions continue to show a coherent mixed distribution, reinstall Phase A `4596b9bdb` and run five cold VP-ON sessions for comparison. Even then, a difference in rates establishes **at most a possible probabilistic influence** of the pre-VP read, never deterministic causation.
3. **W4 manual protocol — CLOSED AS UNEXERCISABLE.** Three attempts (≈10.8 s · 9.85 s · 3.57 s) show the ≤ 2 s manual witness is not a reliable human test. Recorded:
   ```
   W4 manual protocol     CLOSED · UNEXERCISABLE
   W4 exact condition     UNMEASURED · NOT PASS · NOT FAIL
   ```
   If that exact condition later remains required for KERNEL-00 acceptance, it gets a **separately authorized deterministic harness instrument**. That instrument is **NOT authorized now**.
4. The question has changed, in the founder's words: from *"which startup line fixes Apple?"* to *"what hidden runtime state makes the same governed startup sometimes live and sometimes fail?"*

**Standing after this act:**

```
RUN 6                   ATTESTED
P5-B0                   MIXED · NONDETERMINISM ESTABLISHED · mechanism NOT established
6b interruption cause   UNKNOWN (no inference)
W4 manual protocol      CLOSED · UNEXERCISABLE · exact condition UNMEASURED (not pass, not fail); deterministic instrument NOT authorized
VOICEKERNEL CODE        FROZEN · E1–E4 HELD · B2 HOLD · STT/TTS OUT OF SCOPE · THRESHOLDS UNCHANGED · ARCHITECTURE UNCHANGED
NEXT (no code)          Stage 1: 5 × cold VP-ON on installed 24a6fcfa1 → Stage 2: reinstall the identical signed artifact, 3 × cold VP-ON
                        → Stage 3 only if a coherent mixed distribution persists: reinstall 4596b9bdb, 5 × cold VP-ON (rates ≠ causation)
```

## 10. Nondeterminism investigation — session ledger (filled on receipt)

Classification vocabulary is closed to the founder's four: `gen-1 listen` · `failure then recovery` · `failure then degradation` · `other observed shape`.

| Stage | # | Session | Records | SHA-256 | Class | Note |
|---|---|---|---|---|---|---|
| 1 | 1 | `K00-c187e547` (`…_run6S1-1_K00-c187e547_vpON.jsonl`) | 65 | `96fa0460c4e3c974d2e7109ce5eb900aa382e49b9f7352b21f70f91416ca617c` | **gen-1 listen** | isRunning immediate TRUE · vp_enable 124 ms · first callback +91 ms · listening 533 ms · 10/10 running ticks · gen 1 held 28.6 s · no recovery · 13-step trace, no pre-VP read |
| 1 | 2 | — | | | | |
| 1 | 3 | — | | | | |
| 1 | 4 | — | | | | |
| 1 | 5 | — | | | | |
| 2 (after reinstall; dylib must read `CC0D3604-…`) | 1 | — | | | | |
| 2 | 2 | — | | | | |
| 2 | 3 | — | | | | |

Prior on this subject, for the ledger's context: 6a `gen-1 listen` · W4 `gen-1 listen` · 6a-2 `failure then recovery`.
