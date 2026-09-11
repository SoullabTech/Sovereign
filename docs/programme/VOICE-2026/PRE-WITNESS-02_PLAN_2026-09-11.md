# PRE-WITNESS-02 · K00 entry seam — plan

**Lane:** VOICE-2026 · KERNEL-00 · **Status:** PLAN ONLY — no source changed by this document
**Opened by:** founder ruling recorded in `KERNEL-00_WITNESS_2026-09-11.md` §5, effective from the seal (2026-09-11 17:06)
**Witnessed subject:** `488e0666c` (unchanged; remains the subject of witness record 1)
**Law:** `ARCH-01/06_KERNEL-00_ACCEPTANCE_LAW.md` — thresholds ratified ×6, untouched by this plan

---

## 1. Charter (founder, verbatim)

```text
PRE-WITNESS-02 — K00 ENTRY SEAM

PURPOSE
Make entry and configuration recovery survivable and journalable
without changing the ratified architecture or thresholds.

IN SCOPE
1. Validate input format before every input-tap installation.
2. An invalid format must never reach AVAudioNode.installTap.
3. Invalid/unready format becomes a journaled graph-start/rebuild failure.
4. That failure enters the existing bounded RecoveryPolicy.
5. Resolve configuration-change behavior while floor == entering:
      rebuild now
      defer/wait
      or another bounded state transition
   by falsification against the witnessed sequence.
6. Preserve generation custody and one-engine-per-generation law.

OUT OF SCOPE
STT · TTS · providers · turn detection · BENCH-01 · BRIDGE-01 · MIGRATE-01
threshold changes · architecture amendment · legacy repair · lower-level AudioUnit migration

PRINCIPLE
Do not try to catch NSException. Make the invalid call unreachable.
```

## 2. The witnessed sequence this plan must survive

```text
tap Enter → entering · gen 1 · session active (one owner)
gen 1     engine starts with voice processing ON; input tap installed; ZERO input callbacks
OS        AVAudioEngineConfigurationChange
kernel    handleConfigurationChange → journal engine_configuration_changed
          → rebuildGraph(cause: route_recovery) → gen 2
gen 2     new engine inside the reconfiguration window; input.outputFormat(forBus:0) = <1 ch, 0 Hz>
          installTap(format: 0 Hz) → NSException → process dead; recorder never wrote the death
```

Two seams, in the code as it stands (`AudioGraph.start`, `VoiceKernel.handleConfigurationChange` / `rebuildGraph`):

- **S1 — precondition seam.** `inFormat = input.outputFormat(forBus: 0)` is passed to `installTap` unguarded.
- **S2 — timing seam.** The configuration change is answered by building the next generation immediately (one actor hop), inside the window the OS opened.

## 3. Mandatory work (charter items 1–4, 6) — not a hypothesis

Regardless of how S2 is resolved, S1 is closed as follows. This is the part the principle line makes non-optional.

**3.1 Precondition, not exception handling.** `AudioGraph` gains a pure validity check on the input node's format before any tap install: sample rate > 0 and channel count > 0. If it fails, `AudioGraph.start` **throws a Swift error** (`AudioGraphError.invalidInputFormat(sampleRate:channels:)`) *before* `installTap` is reached. `installTap` is therefore unreachable with an invalid format. No `NSException` machinery anywhere; the source gate must assert its absence.

**3.2 The thrown error takes the road that already exists.** `rebuildGraph` already wraps `startGraph` in `do/catch` → `journal("error", cause: graph_rebuild_failed)` → `recovery_requested` → `RecoveryPolicy`. With 3.1 the witnessed failure becomes exactly that journaled path. No new recovery logic. Generation custody and one-engine-per-generation are untouched: a refused build consumes the generation number it was given and the next attempt takes the next one, as today.

**3.3 Entry's own failure path is reviewed, not widened.** `enterConversation` catches a failed *first* `startGraph` and transitions straight to `.degraded` (no recovery attempts). That is lawful for a session that cannot be configured at all, but a generation-1 format failure should be evidence for the supervisor, not an instant terminal state. Whether gen-1 failure should also route through `RecoveryPolicy` is decided by the same falsification in §4 (it is the same seam seen one generation earlier). Default if the evidence is silent: leave as is.

**3.4 Instrument the seam so the journal can adjudicate §4.** Every `graph_started`, every `engine_configuration_changed`, and every refused build journals the input node format observed at that instant (`inputSampleRate`, `inputChannels`) and the generation age in ms. This is record coherence (K00-17), not a new capability; the fields are additive.

**3.5 Gates for this work.** `swift test` gains pure-logic tests for the validity check and for "invalid format → thrown error before tap"; the repo source gate `__tests__/voice-kernel-00-source-gates.test.ts` gains: (a) a validity check lexically precedes every `installTap(onBus: 0` on the input node, (b) no `NSException`/`ExceptionCatcher`/`objc_try` constructs anywhere in the package. Then MAC-COMPILE-03 on the exact new SHA, verbatim, before any device act.

## 4. Falsification for charter item 5 (S2) — decided by evidence, not by preference

Three candidate behaviours for a configuration change that arrives while `floor == entering`:

| | Behaviour | Prediction if right | Falsified if |
|---|---|---|---|
| **A** | Rebuild now (as today) + §3 guard | gen 2 refused (journaled), `RecoveryPolicy` retries at 500 ms, gen 3 builds with a valid format, input healthy; entry completes | budget (3/fault/60 s) exhausted → `degraded` on ordinary entry; **or** every entry consumes recovery attempts (an expected event counted as a fault) |
| **B** | Defer: on a change during `entering`, do not build; wait a bounded interval (proposal ≤ 250 ms, journaled) for the input format to become valid, then build the next generation | gen 2 builds once with a valid format; zero refused builds; zero recovery attempts spent on entry | the format is still invalid after the bound (then A's path runs as fallback); **or** K00-03 (≤ 1500 ms to healthy) is missed because of the wait |
| **C** | Reclassify: the first configuration change after a voice-processing-enabled start is stamped `entry_reconfiguration`, not `route_recovery`, and handled by B; later changes keep today's semantics | causal record reads true (K00-02/K00-17); `route_recovery` no longer appears on a run with no route change | a second configuration change arrives during entry that is *not* attributable to voice processing (then C's classifier is wrong and B alone stands) |

**Protocol.** Land §3 first (it is required whatever S2 becomes). Run the device entry with A. Read the journal:

1. If A completes entry within K00-03 **and** spends zero recovery attempts → A stands; B/C not needed. (Unlikely given the witnessed sequence, but it is the cheapest answer and it is tested first.)
2. If A completes entry but spends recovery budget on every ordinary entry → **B** is required. Recovery budget counts faults; an expected reconfiguration is not a fault. Counting it would be the inverse of the E23 anti-pattern (there, a ceiling was suppressed; here, a ceiling would be spent by normal operation). C is then adopted if and only if the journal shows the change is attributable to the voice-processing start (present on every entry, absent when voice processing is off — one control run with `voiceProcessingEnabled = false` decides it).
3. If A exhausts the budget → B is required and the bounded wait is measured, not guessed: the journal's `inputSampleRate` samples at each change give the settle time directly.

The K00-03 ceiling (1500 ms) is the constraint on B's wait, never a value to be loosened to fit it.

## 5. What this plan does not do

- No change to `AudioSessionAuthority` (the session was configured lawfully; the seam is the graph).
- No change to `HealthSupervisor` windows, `RecoveryPolicy` budget/backoff, or any threshold.
- No STT/TTS/provider/turn work; no lower-level AudioUnit path (§20.1 of the blueprint is not triggered; this is sequencing inside the higher-level path).
- No legacy touch.
- No device act before MAC-COMPILE-03 is green on the new SHA and recorded.

## 6. Sequence after this plan is accepted

```text
implement §3 (+ instrumentation) on claude/voice-2026-census-01 → new SHA
swift build · swift test · source gate · xcodegen · unsigned iOS · signed device  → MAC-COMPILE-03 record
device witness rerun from Enter under the UNCHANGED runbook → KERNEL-00_WITNESS_<date>_run2.md
  ├─ A stands → continue the runbook (K00-03…18)
  └─ B/C required → implement B (and C if evidenced) → MAC-COMPILE-04 → rerun
```

Founder acts required: accept this plan (or amend it); accept each compile record; attest each witness. No other approvals are consumed.
