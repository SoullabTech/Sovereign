# KERNEL-00 C2 — Core Fault / Recovery Witness Design — 2026-09-16

**Status:** DESIGN RETURNED · no implementation or device execution authorized by this record.

## 1. Purpose

Discharge the current-subject device obligations that do not require route/interruption/reset/endurance: K00-02, K00-07, K00-08, K00-09 and K00-10, while producing current VPIO-02/SID evidence for K00-03, K00-17 and K00-18.

The accepted SID harness already exposes the four required synthetic controls and the frozen organism already implements the ratified recovery policy. C2 therefore adds **driver/orchestration only**; it does not add a new organism capability.

## 2. Why four independent cold invocations

Fault classes must not contaminate one another's recovery budget or make a later result depend on an earlier fault's state. C2 is one governed witness package containing exactly four separately named cold invocations, each starting from total `VoiceKernelHarness = 0`, each producing exactly one journal, with no automatic retry/top-up:

1. `C2-EXIT` — K00-02 clean entry/exit;
2. `C2-INPUT-STALE` — K00-07 + K00-09;
3. `C2-STALL` — K00-08;
4. `C2-PERSISTENT` — K00-10.

A failure in one does not authorize rerunning it or dropping it. The other predeclared invocations may continue only if the C2 orchestrator itself remains valid and the failed row did not leave a live harness/process state; otherwise STOP and carry the partial package.

## 3. C2-EXIT — K00-02

Driver sequence:

- cold launch, VP ON, Enter;
- wait boundedly for the existing listening condition (`Play 3 s tone` enabled is acceptable orchestration evidence, never the K00-02 verdict);
- hold a short predeclared observation interval;
- tap the existing `Leave` button exactly once;
- wait for the harness to return to idle / Enter available;
- export journal through the kernel, then terminate.

PASS condition from the journal:

- exactly one member-caused `session_activated` for entry;
- exactly one member-caused `session_deactivated` and `session_released` for exit;
- no other activation/deactivation unless it is a lawful separately stamped recovery (none is planned in this invocation);
- session inactive after Leave; no post-exit organism act.

This row also contributes K00-03 and K00-17 evidence but does not alone finalise either.

## 4. C2-INPUT-STALE — K00-07 + K00-09

Use existing harness toggles only: `Hold one callback, fire after recovery` + `Digital-zero input` → `Apply faults`.

Predeclared sequence:

- enter and establish listening;
- enable `holdStaleCallback=true` and `digitalZeroInput=true` together; apply once;
- keep the fault active through the ratified dead-input window and first recovery opportunity (fixed bounded hold; the journal, not the driver's sleep, decides whether K00-07/K00-09 occurred);
- clear both toggles and Apply once;
- allow bounded recovery observation;
- export and terminate.

K00-07 PASS:

- synthetic-zero evidence is labelled;
- `inputFlow → dead` / `input_dead` occurs within ≤2,000 ms of sustained synthetic-zero input;
- recovery is requested by `HealthSupervisor`, not the harness;
- after the fault clears, healthy/listening returns without a manual mic tap.

K00-09 PASS:

- one callback was held from the old generation;
- recovery increments generation;
- the held callback is later emitted as `stale_callback_dropped` with `callbackGeneration < current`;
- that stale callback causes no session/graph/configuration/output act.

No manual intervention is permitted.

## 5. C2-STALL — K00-08

Use existing `stallOutput=true` at the observation seam.

Sequence:

- enter/listening;
- enable Stall output → Apply once;
- Play the existing 3 s tone;
- hold through the ratified 1,000 ms stall window and first recovery opportunity;
- clear Stall output → Apply once;
- allow bounded recovery observation;
- export and terminate.

PASS:

- synthetic output observations are labelled;
- actual observed render progress freezes consistently with the harness stream counter;
- `outputFlow = stalled` / `output_stalled` verdict occurs within ≤1,000 ms without progress;
- recovery is HealthSupervisor-requested and bounded;
- clearing the fault permits healthy output/listening to return without manual intervention.

## 6. C2-PERSISTENT — K00-10

Use existing `persistentFault=true`, which generates digital-zero input that survives graph recovery.

Sequence:

- enter/listening;
- enable Persistent fault → Apply exactly once;
- do not clear, re-enter, alter route, interrupt, reset or otherwise rescue the organism;
- observe long enough for the ratified policy to exhaust;
- after `degraded` is reached, retain a fixed observation tail long enough to expose an unlawful fourth recovery if one occurs;
- export while degraded, then terminate.

PASS:

- one fault class consumes attempts exactly 1/2/3;
- scheduled backoffs are exactly 500 / 1,000 / 2,000 ms as journalled policy values;
- after budget 3/3 the floor becomes `degraded` with the fault cause visible;
- no fourth recovery is scheduled or executed during the observation tail;
- the budget is never reset by a successful start/rebuild.

Re-enter restoration is not required to discharge K00-10 and is deliberately excluded from this invocation so the terminal degraded state remains unambiguous.

## 7. Cross-row readings

### K00-03
Every C2 journal is scanned for session configuration mutation after entry. Only mutations expressly lawful under the acceptance law may exist. Synthetic health recovery does **not** license an unstamped category/mode/options/preferred-rate change. C2 can strengthen K00-03, but final K00-03 PASS remains contingent on C3/C4/C5 also remaining clean.

### K00-17
Every C2 journal must replay PASS with zero orphan transitions, zero unattributed automatic acts and zero broken `causeSeq` edges. In particular the K00-09 stale callback must remain an observation only, and all recovery scheduling/execution must have an earlier causal observation in the same or an earlier generation.

### K00-18
The external driver records the visible floor/input/recovery state needed to compare the UI against the exported snapshot/journal. C2 may establish dynamic projection evidence, but final K00-18 remains open until disruptive route/interruption/reset/endurance witnesses also preserve projection truth.

## 8. Custody / orchestration law

C2 should use a **dedicated C2 batch wrapper**, not overload historical ENTRY/output batch semantics.

Required shape:

- exact accepted SID subject/product identity;
- driver-only successor worktree; kernel/harness runtime byte-frozen;
- one driver build, then exactly the four named tests once each;
- before each phone invocation: full readable process-set evidence and total `VoiceKernelHarness = 0`;
- nonzero/unreadable → STOP before launch; **no terminate, cleanup, wait-out or normalization**;
- exactly one new journal bound to each named test; extra/zero journals = infrastructure refusal;
- preserve test log + journal SHA + process custody + replay result;
- no source stimulus, route act, interruption, reset, background/lock act or endurance act;
- no top-up or automatic rerun.

## 9. Permitted implementation surface if separately authorized

- external XCUITest driver: add four C2 methods/helpers only;
- a new dedicated `k00-c2-core-witness.sh` orchestration script;
- evidence-only C2 reader/checker if needed to compute exact threshold deltas from journal timestamps;
- gate/tests + records/pins.

Frozen:

- `ios/VoiceKernel/**`;
- `ios/VoiceKernelHarness/**`;
- all existing readers and thresholds;
- historical batch scripts and produced evidence.

## 10. Falsifiers

Refuse C2 implementation/execution if it requires any of:

- organism or harness runtime change;
- threshold/backoff/budget change;
- UI accessibility change merely to make the witness easier;
- process cleanup/termination inside the witness;
- outcome-conditioned retry or dropped row;
- combining two fault classes in a way that makes their recovery budgets unreadable (except the explicitly ruled digital-zero + held-callback pair for K00-07/09);
- importing route/interruption/reset/endurance acts;
- treating a fixed driver sleep as evidence instead of journal timestamps/state;
- declaring K00-03/17/18 finally PASS before later closure witnesses exist.

## 11. Standing

C2 design returned. **Implementation CLOSED · execution CLOSED · authority NONE.** C1 remains design-only and K00-06 incomplete. C3/C4/C5 remain records-only future work; BRIDGE-01 remains closed.
