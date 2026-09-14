# KERNEL-00 · HIDDEN-RUNTIME-STATE CENSUS — pass 1 (tiers FIRST + SECOND: already-recorded state only)

**Status: PASS 1 COMPLETE · READ-ONLY · NO CODE · NO DEVICE ACT · classification only.** Authorized by founder ruling 2026-09-14 (repro record §7). Question: *what state exists before or during generation-1 startup that differs between a take and a miss, without changing the startup itself?*

**Observer-effect firewall (governing):** FIRST externally observable / already-recorded state → SECOND existing trace fields → LAST new in-process reads. Any proposed read that could initialize or touch AVAudio state is **INTRUSIVE** and is never admitted as instrumentation by this census; it may only be named. Precedent: the Phase-A pre-VP `outputFormat(forBus:0)` read was a "read-only observation" that changed the subject (P5-F1). The firewall therefore treats *every* `AVAudioSession` / `AVAudioEngine` / node property read before `start()` as LAST-tier at best and INTRUSIVE by default.

**Evidence base for this pass:** the 116 valid AUTOMATED-COLD-LAUNCH journals (Stage A 29 · Stage B 28 · post-clean control 29 · R1 30; 58 gen-1 takes, 58 gen-1 misses; two subjects, P5-B0 13-step and Phase-A 14-step, analysed together only for *antecedent* fields that both subjects record identically — strata are otherwise never pooled). Manual journals excluded (different stratum, human timing). Method: every event and evidence key recorded at or before generation-1 `start_return` was enumerated, then compared take vs miss (categorical: exact counts; numeric: median, range, and the probability that a take's value exceeds a miss's, 0.50 = no separation).

## §1 Result — tiers FIRST and SECOND: **no recorded antecedent distinguishes a take from a miss**

Everything the journal records before `start_return` is either byte-identical across all 116 samples or statistically indistinguishable:

| Antecedent (recorded before `start_return`) | Take (n=58) | Miss (n=58) | Separation |
|---|---|---|---|
| `session_category_set` outcome (playAndRecord / voiceChat / options) | ok ×58 | ok ×58 | none |
| `session_preferred_sample_rate_set` / `_io_buffer_set` outcome | ok ×58 | ok ×58 | none |
| `session_activated` outcome · activation duration | ok · 27 ms [22–82] | ok · 27 ms [21–101] | P=0.50 |
| `session_configured` actual sample rate · IO buffer | 48000 · 0.01 ×58 | 48000 · 0.01 ×58 | none |
| `route_changed` before start: count · data source · IO ms · rate | 1 · `-` · 10.0 · 48000 ×58 | 1 (one sample 2) · `-` (one `Bottom`) · 10.0 · 48000 | none (one outlier, §3) |
| `route_changed` position: **inside the VP-enable call**, ms after `vp_enable_begin` | 79.5 [50–101] ×58 | 80 [−10–109] ×58 | none |
| `route_changed` ms after activation | 96 [71–150] | 95.5 [4–149] | P=0.49 |
| `vp_enable_return` elapsed · readBack | 87 ms [76–138] · true ×58 | 88 ms [80–145] · true ×58 | P=0.45 |
| `input_format_after_vp` | 48000 / 1 ch ×58 | 48000 / 1 ch ×58 | none |
| `input_format_before_vp` (Phase-A subject only, R1) | 48000 / 1 ch ×13 | 48000 / 1 ch ×17 | none |
| `prepare_return` elapsed | 25 ms [22–45] | 26 ms [23–32] | P=0.45 |
| `vp_enable_return` → `start_begin` gap | 29 ms [24–48] | 28.5 ms [24–34] | none |
| `start()` duration (`start_return` elapsed) · trace total | 151 ms [144–174] · 270 ms | 151 ms [143–167] · 274 ms | P=0.48 / 0.44 |
| Enter → `start_return` | 324 ms [308–482] | 327 ms [307–493] | P=0.47 |
| Cold `didBecomeActive` → Enter (driver timing) | 4620 ms [4534–5046] | 4618 ms [4550–5337] | P=0.52 |
| Device monotonic time at launch (uptime) | spread across the whole range | same | P=0.50 |
| Inter-sample gap within a batch (s) | A 31 · B 36 · C 49 · R1 32 | A 31 · B 35.5 · C 47.5 · R1 32 | none |
| `is_running_immediate` (at `start_return`, last pre-outcome read) | true ×58 | true ×55 · false ×3 | none for 55/58 |

Two weak, non-admitted patterns, recorded so they can be falsified rather than forgotten: takes are slightly rarer in the first ten samples of a batch (14/37 vs 44/79, Fisher p=0.11), and slightly more likely after a miss than after a take (32/54 vs 23/56, p=0.086). Neither reaches a level at which it would be called a signal; both are consistent with chance at N=116; neither is a *state* the kernel can read. They are named only because the next batch, if any, can check them at no cost.

**Conclusion of pass 1:** the state that decides generation 1 is **not in the journal**. Under the firewall, the kernel's own record contains no antecedent that separates the two outcomes. Whatever differs is either (a) external to the process and unrecorded, (b) inside AVAudio / the VP I/O unit and unreadable without an intrusive read, or (c) a race whose deciding moment lies inside the ~151 ms of `engine.start()` itself, which the trace cannot see into.

## §2 Earliest visible divergence — post-`start_return`, diagnostic, not antecedent

Recorded here because the founder's classification rule needs the boundary drawn precisely: *anything visible only after the engine has already failed is diagnostic, not hidden antecedent state.* The boundary is `start_return`.

| First post-start observable | Take | Miss |
|---|---|---|
| `graph_started` journal record, ms after `start_return` | **2 ms** (48/58 ≤ 2; max 11) | **25 ms** [1–44]; 42/58 ≥ 20 ms |
| `engineRunning` at `graph_started` | true ×58 | **false ×42** · true ×16 |
| `engine_configuration_changed`, ms after `start_return` | **4 ms** [2–15] ×58, engine still running | 127.5 ms [2–148]: **late (≥50 ms) ×49** with engine false in 42 · early (<20 ms) ×9 with engine still running |
| classification | `voice_processing_reconfiguration` ×58 | `voice_processing_reconfiguration` ×58 |
| `callbacksSinceStart` at the change | 0 ×58 | 0 ×58 |
| first `engine_running_observed` tick | 106 ms, running ×58 | 128 ms, **not running ×58** |
| `first_input_callback` | 99 ms [94–104] ×58 | never |
| first `recovery_requested` | never | 1538 ms (`entry_timeout` ×35) · 127 ms (`configuration_change` ×23) |

Two miss sub-shapes, both ending with zero callbacks: **M-a (42/58)** the very next journal write after `start_return` is delayed 20–44 ms and already reads `engineRunning false`; the configuration change arrives ~125 ms later against a stopped engine. **M-b (16/58)** the engine still reads running at `graph_started`; 9 of these receive the change early (<20 ms, like a take) and are dead by the first tick anyway; 7 receive it late. So the take's signature is *change within ~4 ms and the engine survives it*; the dominant miss signature is *a 20–44 ms stall immediately after `start()` returns, engine already stopped, change ~125 ms later*. The stall is the earliest recorded symptom (**O10**: the `graph_started` record delay, 25 ms vs 2 ms median). It is a symptom of the failure, not its antecedent; the event that decides has already happened inside `start()`.

## §3 One outlier, recorded

Control sample 5 (`failure then recovery`) is the only journal whose first `route_changed` reports `inputDataSource: Bottom` (then `-`, then `Bottom` again) and the only one with two route changes before `start_return`. One sample cannot separate anything; it is recorded so that a future data-source reading is not treated as new.

## §4 Candidate inventory — four buckets, five questions each

Legend: **tier** F = external / already recorded · S = existing trace field · L = new in-process read · **I** = INTRUSIVE (could initialize or touch AVAudio state; never admitted as instrumentation). Questions: Q1 available before the outcome? · Q2 distinguishes success from failure? · Q3 observable without mutating startup? · Q4 already in existing evidence? · Q5 what would falsify its relevance?

### 4.1 Audio-session state
| Candidate | Tier | Q1 | Q2 | Q3 | Q4 | Q5 / disposition |
|---|---|---|---|---|---|---|
| category / mode / options as set | S | yes | **no** (identical ×116) | yes | yes | — eliminated |
| activation outcome and duration | S | yes | **no** | yes | yes | — eliminated |
| actual sample rate · IO buffer after configure | S | yes | **no** | yes | yes | — eliminated |
| route at activation: ports, data source, rate, IO ms | S | yes | **no** (one outlier) | yes | yes | — eliminated; data-source outlier held |
| route-change timing relative to activation and to the VP call | S | yes | **no** | yes | yes | — eliminated |
| `isInputAvailable`, `inputLatency`/`outputLatency`, `isOtherAudioPlaying`, `secondaryAudioShouldBeSilencedHint`, `inputGain`, `availableInputs` | L **I** | yes | unknown | **no** — property reads on the session before `start()`; by the P5-F1 precedent a "read" is not presumed inert | no | would be falsified if identical across ≥30 takes and ≥30 misses; cannot be read lawfully under the firewall → **named, not admitted** |
| other audio clients holding the session (mediaserverd view) | F | yes | unknown | yes — external | **no** | the highest-value unrecorded antecedent in this bucket; observable only from outside the process (§5) |

### 4.2 Engine / I/O state
| Candidate | Tier | Q1 | Q2 | Q3 | Q4 | Q5 / disposition |
|---|---|---|---|---|---|---|
| engine created · VP enabled (elapsed, readBack) · tap · prepare · start elapsed | S | yes | **no** | yes | yes | — eliminated |
| input format before / after VP | S | yes | **no** | yes (already traced) | yes | — eliminated as antecedent; the *before* read is itself the P5-F1 perturbation |
| `isRunning` immediately at `start_return` | S | at the boundary | **no** for 55/58 misses | yes | yes | — the last pre-outcome read; it does not know |
| VP I/O unit internal lifecycle (AUVoiceIO init / reconfigure / stop) | L **I** / private | yes | unknown — the likeliest locus | **no** in-process; **yes** from the system log | no | observable only externally (§5); any in-process probe is intrusive |
| input node / engine state reads before `start()` (format, `isRunning`, node counts) | L **I** | yes | unknown | **no** | partially | Phase A shows such reads perturb; not admitted |
| configuration-change ordering and timing | S | **no** — post-start | yes (§2) | yes | yes | diagnostic only |
| first-callback timing · `engineRunning` ticks | S | **no** — post-start | yes (§2) | yes | yes | diagnostic only |

### 4.3 OS lifecycle state
| Candidate | Tier | Q1 | Q2 | Q3 | Q4 | Q5 / disposition |
|---|---|---|---|---|---|---|
| cold process (driver precondition + in-test `.notRunning`) | F | yes | **no** (cold ×116) | yes | yes | — eliminated |
| media-services reset / interruption history in this process | S | yes | **no** (0 / 0 in all 116) | yes | yes | — eliminated |
| app lifecycle timing (`didBecomeActive` → Enter) | S/F | yes | **no** | yes | yes | — eliminated |
| device uptime · time of day · inter-sample gap · batch position · previous outcome | F | yes | **no** (two weak non-signals, §1) | yes | yes (from filenames/ledgers) | falsified if the next 30 show no position/alternation effect; not a state the kernel can read |
| `mediaserverd` / `coreaudiod` process age and restarts between samples | F | yes | unknown | yes — external process list from the Mac | **no** (the batch lists only the harness) | falsified if identical between takes and misses; **admissible, unrecorded** |
| device unified log around each start (audio session, VP I/O, route arbitration) | F | yes | unknown — the only view into `start()` | yes — external capture | **no** | falsified if the log sequences for takes and misses are identical; **admissible, unrecorded, highest value** |
| thermal state · memory pressure (`ProcessInfo`) | L (non-AVAudio) | yes | unknown | probably — not an audio read; still a new in-process read | no | falsified if identical; LAST tier, needs its own admission |
| other foreground/background audio apps, Bluetooth peripherals present | F | yes | unknown | yes — external | no | falsified if constant across the batch |

### 4.4 Timing / state races
| Candidate | Tier | Q1 | Q2 | Q3 | Q4 | Q5 / disposition |
|---|---|---|---|---|---|---|
| VP-enable return → `start_begin` gap · `start()` duration · trace total | S | yes | **no** (29 ms · 151 ms, identical) | yes | yes | — eliminated |
| route change inside the VP call: offset | S | yes | **no** (≈80 ms in both) | yes | yes | — eliminated |
| the interval `start_return` → next journal write (O10 stall) | S | **no** — post-start | **yes** (2 vs 25 ms) | yes | yes | earliest symptom; a candidate *marker* for future external log alignment, not an antecedent |
| configuration change arrival vs `start_return` (4 ms vs ~125 ms) | S | **no** | yes | yes | yes | diagnostic |
| `isRunning` collapse timing (running at return → false by first tick) | S | **no** | yes | yes | yes | diagnostic |
| whatever happens inside the 143–174 ms of `engine.start()` | L **I** / F | yes | unknown — the deciding interval | **not from inside**; possibly from the system log | no | the census's central unknown |

## §5 Where the hidden state can still be looked for — without touching the organism

Pass 1 exhausts tiers FIRST and SECOND as currently recorded. Every remaining candidate is either intrusive (in-process AVAudio reads — not admissible under the firewall) or **external and unrecorded**. Three external candidates are non-intrusive by construction, because they are captured on the Mac and read nothing inside the app:

1. **Device unified log** for the audio subsystem (`mediaserverd`, `coreaudiod`, audio-session / VP I/O subsystems) time-aligned to each sample's `start_begin`…`start_return` window. This is the only candidate that can see inside the 151 ms of `start()` and inside the VP I/O unit. Capture verb must be read from `--help` and founder-verified (the `devicectl device info crashes` lesson); never guessed here.
2. **`mediaserverd` / `coreaudiod` identity per sample** (PID and start time) from the same external process listing the batch already runs, extended by one read. A restart of the audio daemon between samples would be an external antecedent no in-process instrument can see.
3. **Position / previous-outcome bookkeeping** from existing ledgers (already possible; §1 weak patterns).

None of these is authorized by this census. The census names them as the only lawful next reads; whether any is opened is a founder act. The in-process candidates (session property reads, node reads, `ProcessInfo`) stay LAST-tier and are not proposed.

## §6 Standing

PASS 1 COMPLETE · antecedent state in the journal: **NONE FOUND** (every recorded pre-start field identical or indistinguishable across 116 samples) · earliest symptom **O10** = the 20–44 ms stall after `start_return` with `engineRunning false` (42/58 misses) · miss sub-shapes M-a 42 / M-b 16 · mechanism claim NONE · no code · no device act · B2 HOLD · E1–E4 HELD · kernel and harness FROZEN · thresholds UNCHANGED · device R1 HOLD.

## §7 PASS 2 — EXTERNAL OBSERVATION (founder ruling 2026-09-14; not an architecture phase, not a repair lane)

Ruling, verbatim in substance: pass 1 closed the in-process avenue — *nothing already recorded before `start_return` distinguishes take from miss* — so **no further AVAudio reads inside the process**. Pass 2 is external: (1) existing-ledger bookkeeping, run now; (2) daemon identity as witness instrumentation; (3) unified log: discovery + one bounded calibration, stage HELD. Pinned: **EXTERNAL READ ≠ PRESUMED INERT** — the first successful calibration is instrument validation, not physiological evidence. Frozen: VoiceKernel/harness · B2 · E1–E4 · new AVAudio reads · recovery · thresholds · mechanism claim NONE · device R1 HOLD. Target: *what does the operating system know during the 143–174 ms inside `engine.start()` that the app cannot see before `start_return`?*

### 7.1 Existing-ledger bookkeeping — RUN (read-only, 116 valid automated samples; falsification of the two weak patterns)

| Bookkeeping field | Take vs miss | Reading |
|---|---|---|
| position within batch | idx 1–5 6/18 · 6–10 8/19 · 11–20 21/39 · 21–30 23/40; P(take idx > miss idx) = 0.57 | weak, not a signal; early-batch takes rarer, consistent with chance at this N |
| prior valid sample's outcome | after miss 32/55 · after take 24/57 (Fisher p = 0.13) | weak alternation tendency; not a signal |
| run length of prior outcomes | after 1 take 16/33 · 2 takes 6/16 · ≥3 takes 2/8 · after 1 miss 17/33 · 2 misses 9/15 · ≥3 misses 6/7 | the ≥3 cells are n=8 and n=7 — recorded for a future batch to falsify, nothing more |
| time since prior valid sample | take median 35 s · miss 33 s · P = 0.59 | none of consequence (the driver's cadence is nearly constant) |
| per stratum, after miss / after take | A 8/14 · 5/14 — B 8/13 · 7/14 — C 8/12 · 8/16 — R1 8/16 · 4/13 | same weak direction in 3 of 4 strata; never pooled for inference |

Conclusion: none of the four bookkeeping fields is antecedent state, and none rises above a weak tendency at N=116. They stay named so the next batch can falsify them at no cost; no causal language attaches.

### 7.2 Daemon identity — AUTHORIZED, IMPLEMENTED (instrument only, not yet run)

`scripts/witness/k00-driver-batch.sh` now takes a **daemon snapshot immediately before every sample and immediately after its export**: the same `devicectl device info processes` listing the precondition already reads, filtered post-hoc to rows containing `mediaserverd` or `coreaudiod`, written verbatim to `<ledger>/daemons/sample-<i>-{before,after}.txt` (sample 1 additionally keeps the listing's documented `--json-output` so the field names are learned from the tool, not guessed). A failed listing, or a listing with neither row, is recorded as `UNOBSERVABLE`; no other mechanism is substituted. The batch never launches, signals, suspends, terminates or attaches to either daemon (gate-pinned: `daemon_snapshot` before/after present; no `process signal|terminate|suspend`, `kill`, `sendMemoryWarning` in executable lines). Daemon rows are read here on receipt (PID, start time if the listing carries it) and laid beside each sample's class; a daemon restart between samples would be an external antecedent no in-process instrument can see.

### 7.3 Unified log — DISCOVERY + CALIBRATION IMPLEMENTED, stage HELD

`xcrun devicectl` was probed two levels deep on 2026-09-13 and has **no log verb** (`device sysdiagnose` exists and is ruled out unless separately ruled). The candidate is therefore macOS `log(1)`:

- **A/B discovery — `scripts/witness/k00-log-probe.sh`**: captures the *installed* tool's own help pages verbatim (`log help`, `log help collect|show|stream|config`, `man log`, and `devicectl device sysdiagnose --help` for the record) into `driver-ledger/log-probe-<stamp>/`, then writes a SUMMARY answering, from those pages only: does `log collect` document a device option and a time window; does `log show` document `--archive`/`--start`/`--end`/`--style`/`--predicate`; what `collect` says it does. Nothing is captured, nothing configured (gate-pinned: no `log collect|show|stream|config` invocation in executable lines).
- **C/D/E calibration — `scripts/witness/k00-log-calibrate.sh`**: **fail-closed** on the newest probe (refuses with STOP unless the required options are documented; a refusal returns the mechanism for ruling). On pass it: records T0; runs **exactly one** driver sample as its own stratum `LOG-CAL` (`k00-driver-batch.sh LOG-CAL 1 --mode L --subject phase-a` on the installed R1 — never counted, never pooled; the batch's daemon snapshots apply); records T1; issues **one** `log collect <device-option> <UDID 00008140-…> --start <T0−5 s> --output <archive>` (the persisted device log store read into an archive on the Mac) and **one** `log show --archive … --start T0 --end T1 --style json`; then, with **no predicate given to the tool**, filters post-hoc by known process names (harness, `mediaserverd`, `coreaudiod`, `audiomxd`, `runningboardd`, `SpringBoard`, `bluetoothd`) and writes `CALIBRATION.md` with the six fields the ruling requires: exact commands · processes/subsystems observed (top-15 each) · output size and window length · configuration changed (none issued; daemon identity before/after from the batch) · whether the sample completed normally (its ledger row) · **time-alignment demonstration** — anchor A = first harness-process log entry ↔ journal `app_lifecycle` (upper bound), anchor B = first activation-like harness entry ↔ `session_activated`; A−B reported in ms; `start_begin` / `start_return` / `graph_started` / configuration change / first callback projected to wall time; every audio-daemon entry inside the aligned start window listed. If the harness writes no log lines, alignment falls back to the export epoch and the record says so (±1 s). Never issued: `log config`, `sysdiagnose`, any level/mode change, any debugger (gate-pinned). The archive and the raw window stay on the Mac (gitignored); `window-audio.jsonl`, `CALIBRATION.md` and hashes travel via the ledger branch.
- **Held until the calibration is read:** any logged batch, any matched no-log control, any predicate. The founder decides both on the calibration record.

Standing after pass 2 implementation: bookkeeping READ (no signal) · daemon witness IMPLEMENTED (gate 35/35) · log discovery + calibration IMPLEMENTED, fail-closed, NOT RUN · no code in the organism · device R1 HOLD.

### 7.4 First discovery run INVALID — C-D11 (this session's instrument defect), repaired and shim-tested

Founder ran `k00-log-probe.sh` from a fresh detached worktree `/private/tmp/voice-pass2-6801` at `680144940` (the earlier worktree was left untouched: its untracked R1 evidence made Git refuse the checkout, which is custody protection working). Output `log-probe-20260914T021452Z` reported `NONE FOUND` for every question — **invalid as tool evidence**: the `capture()` helper never shifted its filename argument, so every "capture" executed the filename (`log-collect-help.txt: command not found`) and never invoked `log(1)` at all. Founder correctly stopped; the fail-closed calibration was not run; no device act, no `log config`, no sysdiagnose, R1 evidence untouched. Repair (instrument only): `local f="$1"; shift` before the command runs; gate pins the shift; shim-tested here with a fake `log` on PATH — the probe now records `$ log help collect` and finds the shim's documented `--device-udid` / `--start` / `--archive` lines. The invalid probe directory stays on the Mac as a record of the defect if the founder commits it; it is never read by the calibration because a re-run writes a newer directory and the calibration reads the newest.

### 7.5 Discovery VALID (`log-probe-20260914T121147Z`) → two founder rulings → calibration authorized

The repaired probe interrogated the installed `log(1)` and established, from its help text: (1) device-targeted collection — `log collect --device-udid <UDID>` (also `--device`, `--device-name`); (2) bounded window — `--start <time>`, `--last <num>[m|h|d]`; (3) archive replay — **`usage: log show [options] <archive>`**, the archive as a positional argument. **The frozen condition 3 was spelled `--archive`; no such flag exists on this install.** Preserved here as the failed assumption: the capability was never absent, the spelling was wrong, and the fail-closed gate refused the wrong invocation (`log show --archive …`) before it could become a calibration result — the probe did exactly its job: it refused to infer archive support from intent and made the installed binary define the interface.

**Ruling 1 (founder): ACCEPT the positional form.** Condition 3 is unchanged in substance (the collected device archive must be readable back by the installed `log show`); only the CLI grammar is corrected. Precision: invoke literally as documented, options first, archive last — `log show --start … --end … --style json <archive>` — never relying on permissive parsing. Gate now tests for `usage: log show [options] <archive>`; the invocation is pinned in that order; the superseded spelling is pinned absent. `--device-udid` is required (the other device forms do not target R1 unambiguously; their presence alone does not pass).

**Ruling 2 (founder): first read at DEFAULT level only** — no `--info`, no `--debug`. Calibration 1 establishes the narrowest fact: *does a device-targeted, bounded archive contain sufficient default-level evidence from the audio path to be useful as-is?* If the relevant daemons are absent at default level, that is not evidence that collection failed; it establishes only that default-level replay did not expose the required evidence. The same already-collected archive may then be re-read under separately recorded escalation (default → `--info` → `--debug`), each a distinct archive-side read with its own record, so the level that was necessary stays in provenance. Gate pins the first read free of `--info`/`--debug`.

Both probe directories (`021452Z` invalid, `121147Z` valid) are to be committed beside each other as the record of C-D11. Gate 35/35. ~~**The single calibration line is authorized on this tip.**~~ **← INVALIDATED (founder, §7.8): this sentence minted execution authority from the record itself — AUTH-2 self-ratification. Preserved struck through, not deleted.**

### 7.6 First calibration attempt (`20260914T121709Z`): 0 audio samples · 0 archive · two external facts · one instrument defect (C-D12)

Run from `/private/tmp/voice-pass2-6801` at `09c1bd251` (the worktree had been checked out to a schema-lane commit `404f59e4c` and back in between — recorded, no custody effect). Gate passed on a **third** probe directory `log-probe-20260914T121405Z` (a re-run between the valid `121147Z` probe and the calibration; same tool, same answers; all three probe directories are the C-D11 record). Facts, in order:

1. **The LOG-CAL invocation produced no audio sample.** Ledger row: `DRIVER/INFRASTRUCTURE FAILURE — runner could not enable automation mode on the device (rc=65 · wall 68 s)`; `journals/` empty. The same first-invocation shape as Stage B samples 1–2 and attempt-3 samples 1–4. Not counted; nothing to align a log against. The batch's daemon snapshots (`daemons/sample-1-before.txt`, `.json`, `sample-1-after.txt`) fired for the first time — the first real daemon-witness artefacts; their format is read here on receipt.
2. **`log collect` from an attached device requires root on this Mac** — `log: Must be root to collect logs from attached device`, rc 77, 0 s, no archive. The mechanism exists (probe) but needs host privilege. Returned for ruling: root on the Mac is a host act, not a device act, and changes nothing on the phone; it is nonetheless a privilege escalation and is not added silently. Seam implemented: `K00_LOG_SUDO=1` at invocation prefixes `sudo` to **the collect line only** (gate-pinned: nothing else escalates; `sudo` never touches `xcrun`, `log show`, `log config` or scripts). Unset → the refusal is recorded and returned, as this run did.
3. **C-D12 (this session's instrument defect):** the calibration named its output `log-cal-<stamp>` and the batch named its ledger `LOG-CAL-<stamp>` with the identical second-resolution stamp; on the Mac's case-insensitive volume these are one directory, so the batch wrote into the calibration directory and the calibration's case-sensitive glob for `LOG-CAL-*` found "no row". Custody was never lost (founder listing confirmed `ledger.md`, `daemons/`, `journals/`, both logs inside `log-cal-20260914T121709Z/`). Repair: output directory `unifiedlog-cal-<stamp>`; the ledger is located from the batch's own `batch complete —` line, never a glob; and **the calibration now refuses to collect unless the row is a real audio-sample class** — one capture is paired with one sample that actually occurred, or nothing. Gate 35/35.

Standing: calibration NOT ACHIEVED · mechanism returned for ruling (root) · no archive · no device configuration · R1 HOLD.

### 7.7 Daemon identity — what the device actually runs (read from the first snapshot's JSON; ruling A2 pending)

Both 121709Z snapshots read `UNOBSERVABLE: listing succeeded, neither mediaserverd nor coreaudiod row present`. Founder-read JSON (`daemons/sample-1-before.json`, 333 distinct executables including `SpringBoard`, `powerd`, `CommCenter`, `AudioConverterService`): **neither `mediaserverd` nor `coreaudiod` exists anywhere in the listing**; the audio daemons present are `/usr/libexec/audiomxd` (pid 55561 at 12:17:16Z), `audioclocksyncd`, `audioaccessoryd`, `audioanalyticsd`. The listing sees system daemons; the ruled names are simply not what this device (iOS 26) runs — the audio server role is carried by `audiomxd`. Schema: `{"executable": "file:///…", "processIdentifier": N}`, **no start time** → identity is PID only; a restart between samples reads as a PID change. Instrument (implemented, shim-tested, gate-pinned, pending ruling A2 to be *used* as witness): the snapshot now uses the documented `--json-output` (the table text truncates paths), records `mediaserverd`/`coreaudiod` as `NOT PRESENT` on every sample (the ruled names are never silently dropped), and records `audiomxd`/`audioclocksyncd`/`audioaccessoryd` by PID. Not a substitution made by the instrument: the substitution is the founder's to rule.

### 7.8 COMPENSATING CUSTODY RECORD — founder ruling on execution authority (2026-09-14); lane FROZEN until four local corrections exist

**What failed in `09c1bd251`.** The amendment's mechanical CLI repairs (positional archive, options-first ordering, default read level) are VALID. But the same change set also (a) wrote in §7.5 that "the single calibration line is authorized on this tip", and (b) let the calibration select its witness by `ls … | sort | tail -1` — the newest probe in the repository. At 12:17 the calibration therefore ran against `log-probe-20260914T121405Z`, a probe captured **before** the amended criterion existed, and treated the record's own sentence as its permission. That is the exact prohibited sequence: *invent/alter a criterion → declare it authorized → satisfy it from repository state → permit the protected act.*

**House rule (founder, pinned):** *Attribution may explain a constraint; it may never authorize an act. Execution authority must originate outside the instrument and outside the change set that consumes it. A repository change may reference authority, but it may not create, infer, or satisfy the permission required for its own execution.* Derived invariants: **AUTH-1** attribution ≠ authority (a "founder ruling", a date, a comment, a test description or a prose record explains why a gate exists; none becomes execution permission by being committed) · **AUTH-2** no self-ratification (one change set may not invent/alter a criterion, declare it authorized, satisfy it from repo state and permit the act) · **AUTH-3** authority is an input, never a discovery (an instrument may validate externally supplied authority; it may not search its own repo to learn whether it is allowed to act). Repo-wide invariant, not repo-wide cleanup: the ~200 founder-attribution comments preserve rationale and are not outlawed. Canon placement of the house rule is a founder act, not made here.

**Standing (founder, verbatim):** mechanical CLI repairs VALID · §7.5 self-authorization INVALID · pre-amendment probe as new witness INVALID · 12:17 calibration attempt SPENT · valid physiological LOG-CAL NONE · physiological entitlement UNSPENT · R1 contact OCCURRED · root/sudo authority NOT GRANTED · lane FROZEN.

**Four local corrections (implemented in this commit; gate-pinned; shim-tested):**
1. *Compensating custody record* — this section; §7.5's sentence struck through in place; the 12:17 attempt recorded accurately in §7.6 (infrastructure row, no sample, collect refused for root, C-D12).
2. *Explicit witness selection* — `k00-log-calibrate.sh` takes `--probe <dir>` and refuses without it; the `ls … | sort | tail -1` mechanism is deleted (pinned absent).
3. *Capture-time provenance* — `k00-log-probe.sh` writes `manifest.json` **during the same execution** (execution HEAD · criterion `PASS2-COND3-POSITIONAL-ARCHIVE@09c1bd251` · whether that revision is an ancestor of HEAD · tool identity incl. `log` binary hash · timestamp · SHA-256 of every captured file) and seals it (`SEAL.sha256`). The calibration verifies mechanically: seal == manifest · hashes == files · criterion id == expected · criterion revision is an ancestor of the probe's execution HEAD. A pre-provenance probe (no manifest) is refused as a witness; a tampered file fails the hash check (shim-verified). **None of this authorizes calibration**; it establishes only that the evidence post-dates and targets the criterion.
4. *Separate execution authority* — the calibration refuses (exit 4, before any device act) unless `K00_EXEC_AUTHORITY` is supplied at invocation; it records the value verbatim and never reads, compares or satisfies it from repository state (pinned). Root remains a further, separate jurisdiction (`K00_LOG_SUDO=1`), not implied by either evidence or LOG-CAL authority.

**Sequence from here (nothing executed yet):** a fresh post-amendment probe (evidence; run on a HEAD containing the corrections) → founder supplies execution authority for one LOG-CAL at invocation → separate root ruling → one calibration naming that probe. The two questions never answer each other: *is this a valid post-amendment witness?* and *has someone with jurisdiction authorized the next act?*

### 7.9 Rulings A · A2 · A3 (founder, 2026-09-14) — recorded; calibration still HELD

- **A — root for `log collect`: YES, narrowly.** `K00_LOG_SUDO=1` permits elevation only where the script invokes `log collect`, for one calibration, against an explicitly named sealed probe. Not authorized: running the witness as root, any device logging configuration, installing/changing anything, `--info`/`--debug`, a batch, any organism repair. The boundary is mechanical (gate: `sudo` may appear only on the collect construction; never on `xcrun`, `log show`, `log config` or scripts); if it could not be held mechanically the instrument must refuse rather than broaden the grant.
- **A2 — daemon identity: YES, with the wording constraint.** Absence is scoped to its object of evidence: `mediaserverd` / `coreaudiod` → `NOT PRESENT IN THE DOCUMENTED JSON WINDOW` (not "do not exist", not "were not running"); `audiomxd` / `audioclocksyncd` / `audioaccessoryd` → `PRESENT — witnessed by PID`. Applied to the snapshot text and pinned. The distinction is kept because a default-level replay may omit a daemon that `--info` later exposes.
- **A3 — execution authority: YES, supplied explicitly at invocation.** The founder's authority string for the one calibration is, verbatim: `FOUNDER-AUTH: one LOG-CAL calibration only; explicitly named sealed post-amendment probe; root authorized only for log collect; default-level archive read only; no --info, no --debug, no batch, no organism change.` It is recorded here as *what will be supplied*; the authorization is the invocation input itself, recorded verbatim by the instrument, never normalized or reconstructed from repository state (AUTH-3). Its presence in this record authorizes nothing.
- **Canon placement:** AUTH-1/2/3 stay a compensating programme record (§7.8) until the corrected sequence — fresh sealed probe → gate accepts it → one explicitly authorized calibration → custody record survives — has actually been exercised. Only then is promotion to a reusable house rule earned.

Standing: A YES (one collect only) · A2 YES (absence scoped) · A3 YES (string supplied) · C, D, E still owed · CALIBRATION HELD until E passes and the probe is named.

### 7.10 C · D · E complete — fresh sealed post-amendment probe `log-probe-20260914T123612Z` (founder-run, 2026-09-14)

C: custody `2e78688a6` on `feature/k00-driver-ledger` (three probe directories + `log-cal-20260914T121709Z`), cherry-picked here. D: worktree at `06d80f16d`. E: probe executed on HEAD `06d80f16d1085f8c2248d48fdd459671e2a1762f`; criterion `PASS2-COND3-POSITIONAL-ARCHIVE@09c1bd251` is an ancestor (`yes`); from the installed help: `--device-udid <UDID>` (line 11) · `--start <time>` / `--last` (12, 15) · `usage: log show [options] <archive>` (line 2) · `--[no-]info` / `--[no-]debug` documented for the separately ruled escalation ladder; manifest sealed `da30b4848a4548e290418cbd202b3d624583ea0b3602fe59e6542a0b355ed334`. Provenance note (founder): the remote command runner initially refused direct execution; the 46-line script was inspected as help-page-only and invoked as `bash scripts/witness/k00-log-probe.sh`. No device act; calibration sample UNSPENT. **The evidence question is answered. The authority question is answered separately by the founder's string at invocation. Neither answered the other.**


### 7.11 LOG-CAL calibration `unifiedlog-cal-20260914T124328Z` — EXECUTED (founder invocation, 2026-09-14) · mechanism PASS · verdict INCOMPLETE (parser defect, this session's instrument)

**Invocation (founder, from `/private/tmp/voice-pass2-6801` at `06d80f16d`):** `K00_EXEC_AUTHORITY="FOUNDER-AUTH: one LOG-CAL calibration only; explicitly named sealed post-amendment probe; root authorized only for log collect; default-level archive read only; no --info, no --debug, no batch, no organism change." K00_LOG_SUDO=1 bash scripts/witness/k00-log-calibrate.sh --probe docs/programme/VOICE-2026/driver-ledger/log-probe-20260914T123612Z`. Authority recorded verbatim by the instrument (AUTH-3: an input). Witness verification PASS ×4 (seal == manifest · hashes == files · criterion id · ancestry). Gate read from the sealed probe: `--device-udid` · `--start` · positional `<archive>`.

**The corrected sequence of §7.8/§7.9 has now been exercised once end to end:** fresh sealed post-amendment probe (`123612Z`) → gate accepted it mechanically → one explicitly authorized calibration → this custody record. Whether that satisfies the condition for promoting AUTH-1/2/3 to a reusable house rule is the founder's judgment, not this record's.

**The six ruled fields (§7 opening), answered as far as the run reached:**

| # | field | result |
|---|---|---|
| 1 | exact command | `sudo log collect --device-udid 00008140-00163D9922E0801C --start 2026-09-14 08:43:23 --output …/unifiedlog-cal-20260914T124328Z/device.logarchive` · `log show --start <T0> --end <T1> --style json …/device.logarchive` (default level; options first, archive last per ruling 1). `sudo` appeared exactly once, on the collect (ruling A held mechanically). |
| 2 | processes / subsystems observed | **NOT READ** — the enumeration step never ran (see defect). |
| 3 | output size / rate | archive **291 MB** collected in **185 s**; default-level `--style json` replay of the **49 s** window = **149 MB** (`show rc=0`), i.e. roughly 3 MB of JSON per second of device time at DEFAULT level. Escalation (`--info`, `--debug`) can only be larger. |
| 4 | configuration changed | **NONE issued** (no `log config`, no profile, no debugger, no level change). Daemon identity before/after the sample is in `LOG-CAL-20260914T124328Z/daemons/` (files owed with the custody commit; not yet read here). |
| 5 | sample completed normally | **YES** — batch rc=0; ledger row `AUTOMATED-COLD-LAUNCH · 1 · L · K00-6dbc2752 (kernel00-K00-6dbc2752-1789389844.jsonl) · 54 records · sha256 c32d05d9…dfa18 · gen-1 listen · cold=True · isRunningImmediate=true · graphStartedRunning=true`. Stratum LOG-CAL, **never counted**; its audio outcome is irrelevant to the calibration and is not physiological evidence of anything. |
| 6 | time-alignment demonstration | **NOT DEMONSTRATED** — anchors A/B are computed from the parsed window; parsing failed first. The window itself was correctly constructed: T0 `12:43:28Z` (collect from T0−5 s, local `08:43:23`), T1 `12:44:10Z` after export. |

**Classification (founder's reading, adopted):**

```
COLLECTION MECHANISM       PASS   (root-scoped collect returned an archive; rc=0; owner soullab)
ARCHIVE REPLAY             PASS   (log show rc=0 on the positional archive; default level)
DEFAULT-LEVEL READ         PRODUCED DATA (149 MB; content uninterpreted)
CALIBRATION PARSER         FAIL   ("Extra data: line 3996225 column 3 (char 150211740)")
LOG-CAL VERDICT            INCOMPLETE
```

**Defect C-D13 (instrument, this session; CANDIDATE until the file shape is read):** step E does `json.load(open(window.json))`, i.e. it assumes `log show --style json` emits exactly one JSON document. Python reports extra data beginning at character 150,211,740 of a ~149 MiB file — the first document ends with several megabytes still to follow, so **the file is not a single JSON document**. What follows it is not known from the error alone (a second array, a trailing non-JSON line, and a truncated/multi-segment emission are all consistent with it). The distinction the founder drew is the load-bearing one: *we have not learned that default-level logs are insufficient; we have learned that the calibration cannot yet read the default-level output it successfully obtained.* Nothing about the device, the daemon or the physiology is implied.

**Ruling adopted (founder recommendation, 2026-09-14):** no `--info`, no rerun of the device sample, no parser change yet. Next act = **read-only inspection of the existing `window.json`** (custody-verified against sha256 `72871a24cb256b82337f17edc99bcebc6fce58d6e6fbfe9412d5e47dd9bddf37` before reading): head, the bytes either side of the parse boundary, tail, top-level bracket counts, and `show-stderr.txt`. Only after the shape is on record may the parser be repaired (as C-D13, offline, against this same file — no new sample, no new collect) and step E re-run to produce fields 2 and 6. The 291 MB archive stays on the Mac uncommitted (gitignored); `window.json` likewise; both hashes are custody.

**Owed:** founder custody commit of `LOG-CAL-20260914T124328Z` (ledger · journal · daemons · logs) and `unifiedlog-cal-20260914T124328Z` (`CALIBRATION.md` · `collect-stdout.txt` · `show-stderr.txt`; archive and `window.json` excluded by `.gitignore`) on `feature/k00-driver-ledger`, cherry-picked here · shape inspection output · then a C-D13 ruling.

Standing: LOG-CAL EXECUTED · MECHANISM PASS · REPLAY PASS · PARSER FAIL (C-D13 candidate) · VERDICT INCOMPLETE · fields 2 and 6 OWED · escalation NOT AUTHORIZED · second sample NOT AUTHORIZED · logged batch / no-log control NOT OPENED · organism UNTOUCHED.
