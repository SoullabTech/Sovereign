# KERNEL-00 · DEVICE WITNESS · RUN 3 — 2026-09-12

**Status: OPEN — 3a and 3b EXECUTED (founder-reported; journal files not yet in the record) · A REJECTED · B REQUIRED (refined) · C premise SUPPORTED · W4 under VP ON NOT MEASURED.**
**Subject:** kernel `32047f9f5` (PRE-WITNESS-03 A+B+C+D) at tested SHA `e5046059e` (C4/C5 tests-only). Compile of record: `KERNEL-00_MAC-COMPILE-04_2026-09-12.md` — GREEN (build · test 22/22 · gate 20/20 · xcodegen · unsigned · signed).
**Question this run answers (founder acceptance conditions, run-2 record §10):** EXIT — after `session_released`, no later `graph_started`/`graph_rebuilt`, floor stays idle · RECOVERY — configuration-change reactions bounded by the existing RecoveryPolicy, exhaustion → `degraded` · VP OFF CONTROL — do the repeated `engine_configuration_changed` disappear (local evidence for VP-induced reconfiguration) or continue (VP attribution falsified) · NO B/C DECISION until that control journal exists.
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · `A0736AC8-793B-516F-AC72-C076DB6CEE38`. Voice processing default ON.

## 1. Artifact identity

```
debug dylib   UUID F00F11D4-E589-3F06-9919-5609C11DF6C3   (THE binding; identical across MAC-COMPILE-04 passes 1–3)
main exe      stub executor, build-invariant — not evidence
codesign      Identifier=life.soullab.voicekernel.k00 · TeamIdentifier=ZVK2X646Z2 · Apple Development: Kelly Nezat (N9DTF6434L)
```

## 2. Pre-install device state

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` at 10:58 → **empty**.

## 3. Install (verbatim, founder, 10:58:38 local)

```
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/5CD545D7-487E-441D-94DE-59E7DC7D161E/VoiceKernelHarness.app/
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4200
```

New container (`5CD545D7-…`, was `0E9272DC-…` for run 2) — the run-2 bundle is replaced. **The install is taken as the founder's acceptance of MAC-COMPILE-04 by conduct**, as for run 2; correctable by a word, not by uninstalling.

## 4. Protocol

Force-quit the harness before each session (H1 latch, held out of PRE-WITNESS-03). Export only after Enter; hand each file off from the first share sheet. Launch by icon; no debugger.

| Run | Control | Steps | Files |
|---|---|---|---|
| 3a | Voice processing **ON** (default, untouched) | Enter → 15 s → Export → Leave → 3 s → Export | 2 |
| 3b | Voice processing **OFF** (press the control until it reads OFF, BEFORE Enter) | Enter → 15 s → Export → Leave → 3 s → Export | 2 |

## 5. Run 3a — voice processing ON — session `K00-18f515e1` (FOUNDER-REPORTED; journal NOT YET RECEIVED by this record)

⛔ The journal files for run 3 were read by the founder on the Mac Studio and have **not** been supplied to this record. Everything in §5 and §6 is the founder's reading, quoted, and is marked so until the files are preserved beside this record. Nothing below is verified here.

Founder's reading, verbatim in substance (58 records): *Enter → gen 1 starts · 48 kHz · VP ON → configuration change → `configuration_change` attempt 1 · 500 ms → gen 2 sees 0 Hz → guard REFUSES installTap → `graph_rebuild_failed` Swift-visible → recovery → gen 3 starts valid → configuration change → attempt 2 · 1000 ms → gen 4 valid → configuration change → attempt 3 · 2000 ms → gen 5 valid → configuration change → DEGRADED · budget 3/3.* Degraded ≈ 6.8 s after Enter with zero input callbacks. Every successful VP-ON graph start was followed ≈100 ms later by another configuration change while the physical route stayed `builtInSpeaker/builtInMic`. **No Leave in this journal** → the W4 post-exit guard under a VP-ON in-flight change is NOT MEASURED. If a post-Leave export of this session exists it is owed; if it does not, the founder's ruling is to record NOT MEASURED, not to run another session to fill the blank.

## 6. Run 3b — voice processing OFF — session `K00-24694629` (FOUNDER-REPORTED; journal NOT YET RECEIVED)

Founder's reading (39 records, cumulative through Leave): before Enter `voice_processing_set = false`; gen 1 · 48 kHz · `engineRunning = true`; **NO `engine_configuration_changed`, NO `recovery_requested`, NO `recovery_scheduled`, NO rebuild, NO generation change**; input healthy ≈333 ms after Enter; `entering → listening`; generation 1 held with continuous real microphone callbacks and energy samples for > 20 s; Leave → `session_deactivated` exactly once → `session_released` exactly once → `listening → idle`; nothing after.

## 7. Findings and founder ruling (2026-09-12, verbatim in substance)

**Causal finding, on this exact iPhone / build / runtime:** VP ON → repeated configuration change after every graph start; VP OFF → configuration changes disappear completely and the same graph reaches and holds listening. An intervention on the suspected variable, not a correlation. Supports voice-processing initialization as the causal discriminator on this device/runtime; **does not justify an Apple-universal claim**; VP OFF remains a control, not the production answer.

```
W3 bounded recovery             PASS   (the ratified 3/60 s ceiling governs the configuration-change path; no storm)
W1/W2                           remain CLOSED
VP causal discriminator         PASS · DECISIVE
K00-03 with VP ON               FAIL   (degraded ≈6.8 s after Enter, 0 callbacks)
K00-03 VP-OFF control           PASS   (listening ≈333 ms, held > 20 s, gen 1)
W4 post-exit guard, VP ON       NOT YET MEASURED (no Leave in the 3a journal)
W4 post-exit guard, VP OFF      exercised lawfully but cannot stress the failure mode (no change was in flight)
```

**Rulings:**
- **Candidate A — REJECTED as normal entry behaviour.** Retained as safety behaviour: it bounds the organism instead of allowing W3. A healthy ordinary entry cannot legitimately consume the entire fault budget and degrade.
- **Candidate B — REQUIRED, refined by the new evidence.** Not the original `wait → build another generation`: run 3a shows every fresh VP-ON graph start can provoke the same change, so a delayed rebuild could recreate the cycle more slowly. First test for B: *VP-induced configuration change → classify/defer → do NOT immediately replace the generation → observe whether the existing graph settles → rebuild only if the bounded health evidence says it actually failed.* A refinement forced by evidence, not an architecture change.
- **Candidate C — causal premise SUPPORTED.** The change following VP-enabled graph initialization should not be represented as an ordinary route-recovery fault. Naming: `entry_reconfiguration` is now too narrow (the phenomenon follows later VP-enabled starts too); something like `voice_processing_reconfiguration` describes the observed cause; **exact vocabulary left to the next bounded plan, not mutated here.**
- Architecture UNCHANGED. Thresholds UNCHANGED.

## 8. Standing

```
SUBJECT              kernel 32047f9f5 @ e5046059e · dylib F00F11D4-…
RUN 3a (VP ON)       EXECUTED · founder-reported · file NOT IN RECORD
RUN 3b (VP OFF)      EXECUTED · founder-reported · file NOT IN RECORD
A                    REJECTED for normal operation (kept as safety)
B                    REQUIRED, refined (defer → observe settle → rebuild only on health evidence)
C                    causal premise SUPPORTED · naming deferred to the next plan
W4 under VP ON       NOT MEASURED
RECORD               OPEN — owed: the run-3 journal files (verbatim beside this record), any 3a post-Leave export, protocol fields
NEXT                 bounded plan for B (refined) + C (naming), for founder acceptance; no code before it
```
