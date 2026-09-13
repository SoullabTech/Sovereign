# DRIVER-01 · STAGE C — the historical Phase-A binary, AUTOMATED-COLD-LAUNCH, N=30 (Mode L)

Lane: `VOICE-2026` · `KERNEL-00` · `DRIVER-01` · subject **`4596b9bdb`** (Phase A, 14-step startup trace WITH the pre-VP `input.outputFormat(forBus: 0)` read) · expected binding **`VoiceKernelHarness.debug.dylib` UUID `11A057AA-4A3C-3CAE-8C28-E29792489459`** (MAC-COMPILE-06, the run-5 binding) · device iPhone 16 Pro Max (`A0736AC8-793B-516F-AC72-C076DB6CEE38`, Xcode destination `00008140-00163D9922E0801C`).

Plan reference: `DRIVER-01_PLAN_2026-09-12.md` (D1–D5; §20–§22 for this stage). Stage A: `DRIVER-01_STAGE-A_2026-09-12.md` (CLOSED · ACCEPTED). Stage B: `DRIVER-01_STAGE-B_2026-09-12.md` (CLOSED · ACCEPTED).

**Status of this record: STAGE C AUTHORIZED · PREPARED · NOT EXECUTED.** Nothing has been located, installed, or sampled. The custody gate (§2) decides whether the stage can begin at all.

---

## §1 Authorization (founder, 2026-09-13, verbatim where quoted)

> *"Stage C — AUTHORIZED. SUBJECT 4596b9bdb / EXPECTED BINDING VoiceKernelHarness.debug.dylib 11A057AA-4A3C-3CAE-8C28-E29792489459 / STRATUM AUTOMATED-COLD-LAUNCH / Mode L / N 30 fixed invocations / VP ON / REINSTALL once before Stage C, none inside the stage / DRIVER same repaired instrument / VOICEKERNEL / HARNESS no source changes."*
>
> *"Critical custody gate: before installing, read the Phase-A product's dylib UUID. It must be exactly 11A057AA-4A3C-3CAE-8C28-E29792489459. If that exact binary no longer exists, STOP. Do not rebuild 4596b9bdb and call the resulting artifact the historical Phase-A subject. A rebuild would be a new reproduction subject and needs its own ruling."*
>
> Interpretation, bounded in advance: *markedly different* gen-1 distribution → the source delta may influence startup probability, **NOT** causation; *about the same* → the pre-VP read loses explanatory weight; *mixed / infrastructure-heavy* → characterize, no mechanism claim. *"E1–E4 and B2 remain held."*

What Stage C asks, exactly: on the AUTOMATED-COLD-LAUNCH stratum, with the same driver, the same device, the same procedure, does the **historical** Phase-A build show a different gen-1 take rate from the P5-B0 build (A 14/29 · B 15/28)? Stage C is laid beside A and B, never pooled with them (different subject) and never with the manual Phase-A sessions (run 5 + repro, 5/5 — MANUAL-COLD stratum).

## §2 Custody gate — locate, then verify, then install (in that order; each step can STOP)

Why this gate exists: the harness product path `~/Library/Developer/Xcode/DerivedData/VoiceKernelHarness-…/Build/Products/Debug-iphoneos/VoiceKernelHarness.app` has held the **P5-B0** build (`CC0D3604-…`) since MAC-COMPILE-07 (2026-09-12); the Phase-A product that MAC-COMPILE-06 read as `11A057AA-…` was built at that same path one compile earlier. Whether a copy survives anywhere on the Mac is **unknown to this record** and is the first thing Stage C establishes.

| step | act | instrument | STOP condition |
|---|---|---|---|
| C-1 locate | walk DerivedData · Archives · `ios/` · the ledger worktree for every `VoiceKernelHarness.debug.dylib`; print each UUID; name matches | `scripts/witness/k00-locate-binding.sh 11A057AA-4A3C-3CAE-8C28-E29792489459 <ledger-root>` (reads only; writes `locate-<stamp>.txt`) | **0 matches → STOP.** Record the locate output as the Stage-C outcome (`NOT EXECUTABLE — historical binary absent`). No rebuild. |
| C-2 archive first | container archive of every `tmp/kernel00-*.jsonl` BEFORE the reinstall touches the device (housekeeping §4, archive mode) | `scripts/witness/k00-container-archive.sh pre-stage-c` | `NOT RECONCILED` → resolve before proceeding; it is not itself a STOP for the stage, but deletion later depends on it |
| C-3 reinstall with the gate | reinstall the `.app` that contains the matching dylib; the script reads the dylib UUID BEFORE `install app` and refuses on any other reading (exit 3, `reinstall-<stamp>.REFUSED.txt`, device untouched) | `K00_EXPECT_UUID=11A057AA-4A3C-3CAE-8C28-E29792489459 scripts/witness/k00-reinstall.sh <ledger-root> <path-to-matching>.app` | REFUSED artefact → STOP |
| C-4 process absent | post-install `devicectl device info processes` shows no harness process | inside `k00-reinstall.sh` | a process present → terminate is the driver's job at sample 1 (precondition event, not a sample), recorded |
| C-5 device automatable | phone awake, unlocked, on USB, UI automation already granted; the harness icon may be anywhere (Mode L launches by bundle id) | operator | samples that begin before the device is automatable are infrastructure rows (A/B/attempt 3 lost 1–4 each) |

Reinstall boundary law for this stage: **exactly one** reinstall (C-3), none inside the 30. The batch script cannot reinstall (source gate pins `install app` out of it).

## §3 Execution (one command, N fixed at 30, subject declared)

```
scripts/witness/k00-driver-batch.sh STAGE-C 30 --mode L --subject phase-a
```

`--subject phase-a` tells the classifier the lawful gen-1 trace is the 14-step list with `input_format_before_vp` second; a 13-step journal on this stage is a `SUBJECT-MISMATCH` row (the wrong binary answered), never a class. The C-D6 prefix rule (lawful gen-1 §3 refusal ends the trace at `input_format_after_vp`) applies to this subject through C-D7 (plan §21). Everything else is the Stage-B instrument unchanged: cold check every sample · one `xcodebuild test-without-building` per sample · one new journal pulled and hashed · C-D5 listing discipline · a failed driver operation is not an audio sample · the declared 30 are finished regardless of outcome.

Verification owed here after the run (as for A and B): SHA-256 as ledgered · cold (`didBecomeActive` first, generation 0) · **14-step** gen-1 trace with `input_format_before_vp` present · VP ON (`vp_enable_return readBack true`) · refusals = failures · resets · interruptions · max generation · gen-1 listen latencies; the reinstall artefact's UUID line = `11A057AA-…`.

## §4 Predeclared reading (from the ruling; filled after the run)

| Stage C gen-1 take rate vs A (14/29) and B (15/28) | reading |
|---|---|
| markedly different | the source delta (the one pre-VP read) **may influence** startup probability on this device/runtime — probabilistic influence, never deterministic causation |
| about the same | the pre-VP read **loses explanatory weight**; the nondeterminism belongs to something the two builds share |
| mixed / infrastructure-heavy | characterize the shapes; no mechanism claim |

"Markedly different" is not given a number here; N=30 per stratum cannot separate small differences from run-to-run variation (Stage B's recovery tail already showed that), and the record will not manufacture a threshold after seeing the data. Whatever the rate, the run-5/repro manual sessions (5/5) stay in their own stratum.

## §5 Container housekeeping tied to this stage (founder ruling, verbatim)

> *"NOW archive the existing kernel00-*.jsonl files → local copy → SHA-256 manifest → remote/local filename + count reconciliation → DELETE NOTHING. AFTER STAGE C pull the new Stage-C exports → extend and verify manifest → delete only tmp/kernel00-*.jsonl from the device → leave every other app-data file untouched → re-list and record the empty journal set … If container listing becomes so unreliable that Stage C cannot begin or maintain custody, abort the stage rather than cleaning the container halfway through it. No mid-stage environmental mutation."*

Archive mode is implemented (`k00-container-archive.sh`, §2 C-2; run again as `post-stage-c` after the batch). **Deletion is not implemented**: no `devicectl` verb for removing a file from an app container is known to this record, and a subcommand is never guessed (the voided `device info crashes` query is the precedent). Before any purge script is written, the founder runs and records `xcrun devicectl device --help` (and `… device info files --help`) into the ledger root; if no such verb exists, the deletion mechanism is a founder decision (e.g. uninstall as a boundary — which would also end this install's custody — or leaving the container as is), not a script.

## §6 Result — OWED

*(filled after execution: boundary table · 30 rows · A beside B beside C · reading per §4 · post-stage archive and manifest extension · deletion record or its refusal)*

## §7 Standing at the time of writing

STAGE A CLOSED · ACCEPTED · STAGE B CLOSED · ACCEPTED (header amended) · **STAGE C AUTHORIZED, PREPARED, NOT EXECUTED — custody gate first** · HOUSEKEEPING archive now, delete after Stage C · MECHANISM CLAIM NONE · VoiceKernel + harness FROZEN (no source change for Stage C; the subject is a historical binary, not a build) · B2 HOLD · E1–E4 HELD · instrument changes this session are orchestration only: expected-UUID refusal in `k00-reinstall.sh`, C-D7 in the classifier (89 prior rows reclassified identically), `k00-locate-binding.sh`, `k00-container-archive.sh` (archive only).
