# KERNEL-00 C0 — Invariant Evidence Packet — 2026-09-16

**Status:** records-only adjudication packet; no device act.
**Exact SID organism:** `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` (accepted REPAIR-01; MAC-COMPILE-02 qualified and signed; runtime kernel bytes unchanged by its test-only repair).
**Dynamic evidence:** complete SOURCE-03 population `VPIO-02-SID-SOURCE-20260916T151408Z`, ten journals.

## K00-01 — one session owner

**PASS CONDITION MET · eligible for final checklist acceptance.**

Static exact-tree read: executable `AVAudioSession` ownership is confined to `AudioSessionAuthority.swift`; the only other source-tree match is an `AudioGraph.swift` comment stating that the substrate never owns session state. Dynamic read over all ten SOURCE-03 journals: 40 session mutation rows total, exactly four per invocation (`session_category_set`, `session_preferred_sample_rate_set`, `session_preferred_io_buffer_set`, `session_activated`), and **40/40 carry component `AudioSessionAuthority`; 0 second-writer rows**.

This finding is K00-01 only. It does not discharge K00-02 because the output/source driver intentionally exports and terminates without a governed Leave.

## K00-16 — nothing else in the build

**PASS CONDITION MET · eligible for final checklist acceptance.**

On exact subject `faf918b5c…`: `ios/VoiceKernel/Package.swift` has `dependencies: []`; the runtime target links only `AudioToolbox`. The harness XcodeGen target contains only `Harness/` plus the local `VoiceKernel` package. No executable source contains `SFSpeechRecognizer`, `SpeechAnalyzer`, Whisper, Web `SpeechRecognition`, `getUserMedia`, `URLSession`, `AVAudioEngine`, `AVAudioPlayerNode` or `installTap(`. Apparent repository hits for `AudioSessionManager.swift`, `VoiceController.swift`, Capacitor speech and canonical MAIA are exclusion comments; `maiaSpeaking` is the kernel's physical output floor/state vocabulary, not an LLM/cognition dependency. MAC-COMPILE-02 on this exact subject passed Swift tests and produced the signed SID harness product identity.

## K00-18 — UI projection

**STATIC CONDITION MET · D-GATE STILL OWED; not discharged.**

Exact subject `HarnessModel.swift` says and implements a reducer over `KernelSnapshot`: the stored runtime display state is `snapshot`; lifecycle/route/interruption/reset/cycle counters are witness bookkeeping derived from observed snapshots; commands delegate to `VoiceKernel`; journal export goes through the actor. `HarnessView.swift` reads `m.snapshot`; its listening line is `s.displaysListening ? "listening (input healthy)" : ...`, so the UI cannot display that phrase from a local listening flag. Final K00-18 still requires dynamic confirmation across the disruptive/final witnesses and is not promoted here.

## K00-03 / K00-17

Current successful VPIO-02/SID evidence is supportive but not a final discharge. K00-03 must survive the remaining disruptive witnesses with no unstamped session mutation. K00-17 must replay the final closure corpus—including actual recovery, route, interruption and reset automatic acts—with zero orphan/unattributed/broken-causality edges. Neither is marked PASS here.

## C0 disposition

- K00-01: **PASS CONDITION MET**.
- K00-16: **PASS CONDITION MET**.
- K00-18: static condition met; dynamic D-gate owed.
- K00-03: final current-subject adjudication owed.
- K00-17: final closure-corpus replay owed.

No phone authority is created. Next = C1 K00-06 validity design under the unchanged frozen physiological law.
