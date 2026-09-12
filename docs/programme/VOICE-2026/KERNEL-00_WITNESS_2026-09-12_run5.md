# KERNEL-00 · DEVICE WITNESS · RUN 5 — PRE-WITNESS-05 Phase A trace — 2026-09-12

**Status: OPEN — 5a, 5b, W4 all RECEIVED AND VERIFIED. ⭐ VP ON REACHED AND HELD LISTENING on the Phase-A subject (K00-03 PASS, 583 ms). First divergent seam = #4 `vp_enable_return`. P5-F1: the read-only instrument changed the VP-ON outcome — mechanism inferred, not established. Awaiting founder attestation and ruling on the removal control.**
**Subject:** `4596b9bdb` (Phase A instrumentation; no mutating startup call reordered — gated). Compile of record: `KERNEL-00_MAC-COMPILE-06_2026-09-12.md` — GREEN (build · test 30/30 · gate 28/28 · xcodegen · unsigned · signed).
**Question (plan §1/§2):** *where does the VP-ON startup first diverge from the VP-OFF startup?* — named by seam number from the two `graph_start_trace` sequences laid side by side, plus `engine_running_observed` on the existing tick through ≥ 1000 ms and `first_input_callback`. **No behavioural conclusion and no ordering change follows from the trace by itself; the founder selects E1–E4 or none.**
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · `A0736AC8-793B-516F-AC72-C076DB6CEE38`.

## 1. Artifact identity

```
debug dylib   UUID 11A057AA-4A3C-3CAE-8C28-E29792489459   (THE binding)
main exe      stub executor, build-invariant — not evidence
codesign      life.soullab.voicekernel.k00 · ZVK2X646Z2 · Apple Development: Kelly Nezat (N9DTF6434L)
```

## 2. Pre-install device state (founder, 11:58)

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` → **empty**. No resident harness this time (the run-4 install had found one).

## 3. Install (verbatim, 11:58:29 local)

```
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/90EF4EF5-6F1A-48D9-94DC-B7AF556C9387/VoiceKernelHarness.app/
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4216
```

Taken as the founder's acceptance of MAC-COMPILE-06 by conduct.

## 4. Protocol

Force-quit before every session · launch by icon · no debugger · export after Enter · if the sheet fails, list `tmp` via `devicectl … --domain-type appDataContainer --subdirectory tmp` and `copy from` (the trace is written before the sheet).

| Run | Control | Steps | Answers |
|---|---|---|---|
| 5a | VP **ON** (default) | Enter → 15 s → Export | the VP-ON startup trace |
| 5b | VP **OFF** before Enter | Enter → 15 s → Export | the like-for-like baseline |
| W4 | VP **ON**, fresh session | Enter → **Leave within 2 s** → 3 s → Export | W4 under VP ON, *measured on the Phase-A subject* (founder amendment: never relabelled as run-4 evidence) |

Identity check on each file: `graph_start_trace` records present (else not run-5 code); for 5b, `voice_processing_set false` before Enter.

## 5. Run 5a — voice processing ON — session `K00-ce7a7e48` — RECEIVED AND VERIFIED (59 records, SHA-256 `8b834b2945e22a7349fae634b7a4622152ac849bc025008399a53c8649e5df7c`)

Preserved verbatim as `…_run5a_K00-ce7a7e48_vpON.jsonl`. Run-5 code confirmed (`graph_start_trace` present). The startup trace, in order, with the founder's VP-ON expectation beside each line:

```
seq 2   enterConversation                                                  t=842050698
seq 4–8 session category/rate/buffer/activated (once) → configured  PlayAndRecord/VoiceChat 48 kHz 10 ms builtInSpeaker/builtInMic ds=Bottom
seq 9   trace engine_created            voiceProcessingRequested true                                   (+153 ms after Enter)
seq 10  trace input_format_before_vp    48000.0 Hz · 1 ch
seq 11  trace vp_enable_begin
seq 12    route_changed  inputDataSource "-"                                   ← arrives DURING the VP enable (+101 ms into it)
seq 13  trace vp_enable_return          outcome ok · elapsedMs 129 · readBack true
seq 14  trace output_connected
seq 15  trace input_format_after_vp     48000.0 Hz · 1 ch
seq 16–18 trace input_tap_installed · render_tap_installed · observer_installed
seq 19–20 trace prepare_begin → prepare_return elapsedMs 29
seq 21–22 trace start_begin → start_return outcome ok · elapsedMs 170 · totalMs 347
seq 23  trace is_running_immediate      engineRunning TRUE                                              ← first time ever under VP ON
seq 24  graph_started gen 1 · engineRunning TRUE · VP true · expectation armed
seq 25  engine_configuration_changed  age 8 ms · classification voice_processing_reconfiguration · engineRunning TRUE
seq 26  configuration_change_deferred (expectation consumed) — nothing done to the graph
seq 27  input_flow unknown → healthy  (rms 3.0e-4, peak 1.3e-3)
seq 28  first_input_callback           msSinceStartReturn 89
seq 29  floor entering → LISTENING                                                                    583 ms after Enter
seq 30–39 engine_running_observed on the existing tick: 107 · 214 · 316 · 418 · 522 · 624 · 730 · 833 · 938 · 1043 ms — engineRunning TRUE at every one, callbacks 1…10
seq 40–59 20 × input_health_sample · 10–11 callbacks/s · engineRunning true · speech-level energy (peak up to 0.62) · inputFlow healthy · generation 1 throughout
```

**Reading:** with voice processing ON, on this subject, the engine was running at `start_return`, the expected reconfiguration arrived 8 ms later and was deferred as accepted, input flowed 89 ms after start, the floor reached listening 583 ms after Enter and held it in generation 1 for the whole 20 s window. **K00-03 with VP ON: PASS on this subject (583 ms ≤ 1500).** Zero rebuilds. Zero recovery requests.

## 6. Run 5b — voice processing OFF — session `K00-f808cb65` — RECEIVED AND VERIFIED (64 records, SHA-256 `519500ddf207670f4f377ef9238b680f81a10c07195274dbe3f62ad9e1323322`)

Preserved as `…_run5b_K00-f808cb65_vpOFF.jsonl`. `voice_processing_set false` before Enter (seq 3). Trace: `input_format_before_vp` 48 kHz/1 · `vp_enable_return` **elapsedMs 0 · readBack false** · no route change during enable · `prepare_return` 2 ms · `start_return` 152 ms, total 168 · `is_running_immediate` TRUE · no configuration change at all · `first_input_callback` 97 ms · listening **331 ms** after Enter · `engine_running_observed` true at 106…1041 ms · 26 samples, held 27 s in generation 1. The baseline, as in 3b and 4b.

## 7. W4 on this subject — session `K00-ce69303e` (VP ON, fresh) — RECEIVED AND VERIFIED (52 records, SHA-256 `4a3d5232204aa29ddba55edf1c879170af2590008a67b2ae25e4f09b464c88e3`)

Preserved as `…_run5W4_K00-ce69303e_vpON.jsonl`. Same VP-ON startup shape as 5a (VP enable 83 ms with the route change inside it; `is_running_immediate` TRUE; deferred change at 4 ms; first callback 98 ms; listening 433 ms after Enter; running at every tick through 1045 ms; 9 samples). **Leave at seq 49 — 10.8 s after Enter, not within ~2 s: the protocol's in-flight condition was NOT met** (recorded as a deviation, not corrected). Exit: `session_deactivated` once → `session_released` → `listening → idle`; **no record after `session_released`**. So: W4 on this subject = **exit clean, no post-exit act; the in-flight-change condition itself was not stressed** (the only change had already been deferred at 4 ms). Recorded as *W4 measured on the Phase-A subject, condition partially met*; not relabelled as run-4 evidence.

## 8. First divergent seam — and a finding the plan did not anticipate

**Side by side (5a VP ON vs 5b VP OFF), first difference by seam:**

| Seam | VP ON (5a) | VP OFF (5b) |
|---|---|---|
| input_format_before_vp | 48 kHz / 1 | 48 kHz / 1 |
| **vp_enable_return** | **elapsedMs 129 · readBack true · a `route_changed` (ds `-`) lands inside the call** | **elapsedMs 0 · readBack false · no route change** |
| input_format_after_vp | 48 kHz / 1 | 48 kHz / 1 |
| prepare_return | 29 ms | 2 ms |
| start_return | 170 ms · ok | 152 ms · ok |
| is_running_immediate | TRUE | TRUE |
| post-start | one `voice_processing_reconfiguration` at 8 ms, deferred, engine stays running | none |
| first_input_callback | 89 ms | 97 ms |
| listening | 583 ms | 331 ms |

**The first divergent seam is #4, `vp_enable_return`: enabling voice processing takes ~130 ms and provokes a route reconfiguration inside the call; VP OFF is a 0 ms no-op.** On this subject that divergence is benign — both traces reach `is_running_immediate: true` and listening.

**P5-F1 — the instrument changed the subject (recorded, not explained).** Every VP-ON session on the run-2/3/4 builds — more than a dozen, across `1AEBEE45`, `F00F11D4`, `37A27138` — had `engineRunning: false` at `graph_started` and never produced a callback. Every VP-ON session on this build (`11A057AA`: 5a and W4) has `engineRunning: true` and listens. The source delta between the run-4 subject `35b0f61d0` and this subject `4596b9bdb` is 90 lines, gated as: **no mutating startup call reordered; added calls read-only or journal**. The added reads are: `input.outputFormat(forBus: 0)` **before** `setVoiceProcessingEnabled`, `input.isVoiceProcessingEnabled` after it, `engine.isRunning` after start, and elapsed-time reads. One of these "read-only" observations is not behaviourally inert on this runtime — or the outcome is non-deterministic in a way a dozen prior sessions never showed.

**Candidate mechanism — INFERENCE, kept as inference, not asserted:** reading the input node's output format *before* enabling voice processing forces the input IO unit to resolve against the already-active session; `setVoiceProcessingEnabled(true)` then reconfigures an initialized unit (the 129 ms + the route change inside the call are consistent with that), and `engine.start()` starts a unit that is actually there. In the run-4 code the first touch of the input format came *after* VP enable. Nothing here proves it; it is the falsifiable shape that fits.

**What this does to the plan:** Phase A's stated purpose — name the first divergent seam — is answered (#4). But the plan assumed the instrument would leave the VP-ON failure in place to be observed; it did not. The next act is therefore not "select E1–E4": it is to establish whether the pre-VP format read is causal, by **removing only that one read** on an otherwise identical subject (the E1–E4 orderings are all downstream of that question). That is a founder decision; nothing is chosen here.

## 9. Standing

```
SUBJECT              4596b9bdb · dylib 11A057AA-…
RUN 5a (VP ON)       VERIFIED · engineRunning TRUE at start · listening 583 ms · held 20 s gen 1 · K00-03 PASS on this subject
RUN 5b (VP OFF)      VERIFIED · baseline · listening 331 ms · held 27 s
W4 on this subject   exit clean, no post-exit act; in-flight condition NOT met (Leave at 10.8 s, not ≤ 2 s)
FIRST DIVERGENCE     seam 4 vp_enable_return (129 ms + route change inside the call vs 0 ms no-op) — benign on this subject
P5-F1                the Phase-A instrument changed the VP-ON outcome; source delta = read-only observations only (gated);
                     candidate mechanism = pre-VP outputFormat read initializes the input unit — INFERENCE, untested
REPRODUCIBILITY      2 VP-ON sessions on this subject (5a, W4) — both listened; not yet repeated deliberately
B2                   HOLD · B3 open · E1–E4 hypotheses only · nothing selected
OWED                 founder attestation · founder ruling on the removal control (one read removed, else identical) · deliberate repeat of 5a ×2 (no code) · protocol fields
```
