# KERNEL-00 C1 — K00-06 Validity-Hardened Built-In Witness Design — 2026-09-16

**Status:** DESIGN RETURNED · records/code design only · implementation and device execution NOT AUTHORIZED by this record.

## 1. Question

Can the current SID VPIO-02 subject earn a fresh, constitutionally valid built-in K00-06 population without changing the frozen duplex physiology law and without another phase-driven `UNMEASURED-06` row?

SOURCE-03 supplies the defect shape: sample 8 was healthy and continuously running but produced only one full rendering-overlap health window. Its second 3 s stream began at health-sample phase such that the first health record straddled stream start, one later window was fully contained, and the next health record arrived after `stream_complete`. Nine sibling rows happened to fit ≥2 full windows. This is a **measurement-validity phase race**, not a K00-06 physiological failure.

## 2. Frozen law

Unchanged from the accepted qualification plan:

- exactly N=10; no pilot, top-up or replacement row;
- built-in PASS requires **10/10 valid invocations PASS-06**;
- any valid FAIL-06 decides FAIL;
- any non-evidence preventing ten valid rows returns INCOMPLETE;
- full rendering-overlap windows only;
- `baselineRate` from ≥2 healthy pre-output windows;
- callback rate <0.90× baseline = FAIL;
- sustained all-zero full window or `input_dead` = FAIL;
- partial zero = CHARACTERIZE/INCOMPLETE;
- `ioRunning` and separate input/output health families required;
- coupling descriptive; no suppression threshold;
- even a built-in 10/10 PASS does **not** finally close K00-06 until physiology/coupling travels with K00-11 route witnesses.

SOURCE-03 and all earlier K00-06 populations remain historical and are never pooled into C1.

## 3. Smallest witness-instrument change

Create a **new external-driver method** `testK0006ValiditySample`; do not alter historical `testOutputSample`.

Per invocation, retain the known output sequence and add one additional full-completion stream:

1. require cold;
2. cold launch; VP ON; Enter;
3. wait for existing `Play 3 s tone` to exist and become enabled;
4. existing settle;
5. Play 1 → cancel at 1000 ms → wait 1 s (historical cancellation shape; K00-05 evidence incidental only);
6. Play 2 → allow full 3 s completion → wait until Play becomes enabled;
7. Play 3 → allow full 3 s completion;
8. wait 4.5 s for trailing health/output observations;
9. export through the kernel and terminate.

Why this closes the phase race: with healthy approximately 1 s input-health observation, a 3 s completed render can contribute at least one fully enclosed health window even at the worst start phase. Two independent 3 s completed renders therefore provide ≥2 full rendering windows at the invocation level without selecting rows or aligning after seeing the data. If health observation itself gaps enough that the two streams still cannot provide ≥2 full windows, that is honest non-evidence/physiology and the N=10 population returns INCOMPLETE; the instrument does not repair or replace it.

## 4. Closed orchestration surface

Add a new batch token `--act duplex` rather than changing historical `entry|output` behavior.

`duplex` is lawful only when all are true:

- `--subject vpio-02-sid`
- `--vp on`
- `--mode L`
- no `--stimulus`
- no `--w4`
- exact N=10 population under a separately pinned successor instrument.

It selects exactly `testK0006ValiditySample` and still invokes the **unchanged** `k00-output-ledger.py` evidence reader. K00-05 rows produced by the copied cancellation/completion sequence are collateral evidence only; K00-05 remains CLOSED and is never reopened.

## 5. SID output custody repair required before C1 execution

The guarded instrument used by SOURCE-03 fails closed only for the exact `vpio-02-sid + output + sid-nearend-gated` tuple. A no-stimulus SID output/duplex invocation would currently fall into the historical `harness_present → testTerminateOnly` normalization path. C1 must not execute under that behavior.

Successor batch law:

- **all `vpio-02-sid + duplex` samples bypass every terminate/cleanup path**;
- full process-set read immediately before the output act's preparation (**PRE-ACT**) must be readable and total `VoiceKernelHarness = 0`;
- a second full process-set read immediately adjacent to the phone driver (**JIT**) must again be readable and zero;
- any nonzero/unreadable read → preserve evidence + STOP before phone launch; no wait-out, terminate, normalize or retry;
- historical `entry`, historical `output`, and SOURCE-03 evidence remain untouched.

Implementation may use a new `sid_duplex_harness_zero_guard` rather than renaming SOURCE-03 evidence paths. This keeps historical source custody semantically intact.

## 6. Permitted implementation surface if separately authorized

Instrument only:

- `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift` — add new method only;
- `scripts/witness/k00-driver-batch.sh` — closed `duplex` dispatch + fail-closed SID duplex guards;
- `__tests__/voice-kernel-00-source-gates.test.ts` — historical preservation + new obligations;
- C1 records/pins.

Frozen byte/semantic surface:

- `ios/VoiceKernel/**` organism;
- `ios/VoiceKernelHarness/**` harness behavior and 3 s tone;
- `k00-ledger.py`;
- `k00-output-ledger.py`;
- `k00-source-ledger.py`;
- every threshold/classification rule;
- all historical journals/ledgers.

## 7. Falsifiers

C1 implementation must be refused if any of these occurs:

1. historical `testOutputSample` executable behavior changes rather than adding a distinct method;
2. kernel or harness runtime files change;
3. either frozen reader changes;
4. a threshold, class, baseline rule, full-window rule or N changes;
5. `duplex` is accepted with any subject other than `vpio-02-sid`, with stimulus, VP OFF, Mode I, or W4;
6. a SID duplex sample can enter `testTerminateOnly`, process termination, wait-out or cleanup normalization;
7. PRE-ACT/JIT zero-harness evidence is missing or not adjacent to the driver launch;
8. Play 2 or Play 3 is silently absent but the row is still treated as valid;
9. fewer than ten declared invocations are turned into a PASS by dropping/replacing rows;
10. C1 is described as final K00-06 closure before K00-11 route physiology/coupling passes.

## 8. Reading

A complete C1 population returns one of exactly:

- **BUILT-IN K00-06 PASS CONDITION MET** — 10/10 valid PASS-06;
- **K00-06 FAIL** — ≥1 valid FAIL-06;
- **K00-06 BUILT-IN INCOMPLETE** — non-evidence/characterize/unmeasured prevents ten PASS rows without a valid FAIL.

No result opens C2/C3/BRIDGE by itself. Founder adjudication and separate authority remain required.

## 9. Standing

C1 design returned. **Implementation CLOSED · device execution CLOSED · fresh authority NONE.** K00-06 remains INCOMPLETE. SOURCE-03 remains complete/spent and is not rerun. Next records-only work may design C2 while C1 awaits a separate founder implementation ruling.
