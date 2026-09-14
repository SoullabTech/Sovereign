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
