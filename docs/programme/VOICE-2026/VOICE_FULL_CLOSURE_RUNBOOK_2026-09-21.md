# VOICE-2026 — Full Closure Runbook — 2026-09-21

**Status:** records-only orchestration map. This file authorizes no device act, implementation, deployment, migration, acceptance, or threshold change.

**Record-of-record:** `feature/voice-2026-record-of-record-20260916 @ 4e2600a406712bbfae6c6cdad2d21401bedb9554`.

**Closure candidate:** `claude/voice-2026-closure-reconcile-20260921`.

The programme is deliberately two coupled but independent lanes:

- **Lane P — Product voice acceptance** on the currently shipped MAIA product surfaces.
- **Lane K — Native VoiceKernel acceptance** under KERNEL-00, followed only then by BRIDGE-01 / MIGRATE-01.

Neither lane may borrow the other's acceptance evidence.

---

# Lane P — Product voice

## P0 — exact runtime census

For each supported surface, record exact current identity before testing:

1. Web / desktop browser;
2. Safari PWA on iPhone;
3. MAIA Desktop app;
4. MAIA native iOS / TestFlight app;
5. Android surface if still supported.

Bind version/SHA/build number, browser/app version, OS, microphone, output route, voice settings, floor-control mode, hands-free state, and effective TTS policy where observable.

An unidentified runtime may be diagnosed but cannot be accepted.

## P1 — one common product acceptance walk

Execute `VOICE_PRODUCT_ACCEPTANCE_MATRIX_2026-09-21.md` exactly:

- P1 explicit entry;
- P2 provisional-display-only authority;
- P3 exactly one ordinary final turn;
- P4 >=15 s reflective silence;
- P5 explicit Pause;
- P6 visible/spoken MAIA handoff;
- P7 post-TTS re-arm and second turn;
- P8 bounded genuine silent-death recovery where safely exercisable;
- P9 lifecycle/interruption truth;
- P10 canonical cognition convergence;
- then 10 consecutive clean voice turns.

Result per exact platform/build: PASS / INCOMPLETE / FAIL.

## P2 — product defects

A product FAIL opens its own bounded repair from exact failing build evidence.

Do not reopen KERNEL-00 to repair a current product-runtime defect unless evidence proves the defect belongs to the native kernel migration surface.

## P3 — pre-migration product standing

Once all retained product surfaces PASS, the current product voice may be called cross-platform accepted **on the current stack**.

That standing does not license native VoiceKernel migration.

---

# Lane K — Native VoiceKernel

## K0 — source visibility calibration

Adjudicate `SOURCE_LEVEL-CALIBRATION-01_DESIGN_2026-09-21.md`.

If accepted, separately authorize implementation of only:

- deterministic sealed gated source fixture / validator;
- dedicated calibration preflight + batch wrapper;
- evidence-only calibration reader/report;
- tests/gates/records.

No organism or harness runtime changes.

Then execute only under a fresh device authority:

### K0-A · VP-ON level calibration
- fixed geometry;
- Mac Studio Speakers;
- system volume 69;
- VP ON / Mode L;
- N=5 per closed level, first all-green level wins;
- frozen V1 stays 20 dB;
- calibration selection requires V1 + ordered 2 Hz validity + >=26 dB per row;
- no failed-row replacement;
- no L4.

### K0-B · VP-OFF characterization
- only after a level pin is earned;
- N=3 at exact selected level/geometry;
- characterization only;
- cannot alter the pin or KERNEL standing.

### K0-C · fresh source-discrimination population
Only after founder acceptance of the resulting source pin:
- fresh N=10 S-b;
- VP ON / Mode L;
- guarded zero-harness custody;
- unchanged source reader/law;
- old SOURCE-03 rows never pooled or re-read.

A readable source population resolves the SOURCE-ID discriminator; it does not alone close K00-06.

---

## K1 — C1 K00-06 built-in duplex population

C1 implementation is already accepted/pinned at:

`1708d52119e173853e0ad8b7ca7f71ad95c63d8d`

with frozen SID organism:

`faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8`.

Historical PRELIGHT-01 refused before physiology because of a generated-shell quoting defect. BATCH-01 was never invoked.

Current unspent successors:

- `SID_DUPLEX-PREFLIGHT-02_PIN_DRAFT_2026-09-16.sh`;
- `SID_DUPLEX-BATCH-02_PIN_DRAFT_2026-09-16.sh`.

Fresh founder device authority is required before spending them.

Execution:
1. PRELIGHT-02 must return CLEAN;
2. BATCH-02 must consume that sealed CLEAN marker within its declared age;
3. exactly N=10 `--act duplex`, SID / VP ON / Mode L / no stimulus;
4. PRE-ACT + JIT total-harness-zero every row;
5. frozen output reader only;
6. no top-up/rerun under inherited authority.

Built-in K00-06 can move only under its frozen population law and later still has to travel with route physiology in C3.

---

## K2 — C2 core fault/recovery

Adjudicate the returned C2 design, then separately authorize its external-driver implementation.

Four independent cold invocations only:

1. **C2-EXIT** → K00-02;
2. **C2-INPUT-STALE** → K00-07 + K00-09;
3. **C2-STALL** → K00-08;
4. **C2-PERSISTENT** → K00-10.

Every invocation:
- begins at total VoiceKernelHarness = 0;
- produces exactly one journal;
- no automatic repair/top-up;
- no organism/harness runtime mutation.

C2 also contributes K00-03/K00-17/K00-18 evidence, but does not finally close them.

---

## K3 — C3 route matrix

1. fresh read-only route capability census;
2. speaker ↔ receiver/system-default transitions;
3. admitted Bluetooth topology when compatible hardware is currently available;
4. at least a second Bluetooth transition to prove recurrence when applicable;
5. every admitted transition must restore healthy input/output without manual mic tap;
6. K00-06 physiology/coupling must travel on every tested/admitted route.

Unsupported routes are capability evidence, never manufactured failures.

An admitted route that fails recovery is K00-11 FAIL.

---

## K4 — C4 interruption / reset / lifecycle

Three separately named invocations:

- **C4-I** → K00-12 interruption;
- **C4-R** → K00-13 media-services reset;
- **C4-L** → K00-14 lock/background HOLD policy.

All must return healthy/listening without manual tap and preserve lawful generation/cause/session mutation semantics.

They also feed final K00-03/17/18 adjudication.

---

## K5 — C5 endurance

Only after K0–K4 prerequisites are adjudicated green enough to make endurance meaningful:

- 60 minutes;
- >=50 listen/play cycles;
- >=3 route changes;
- >=2 interruptions;
- exactly 1 media-services reset;
- zero manual taps/interventions;
- zero unstamped configuration mutations;
- zero unbounded recovery loops.

No missing witness control may be invented inside endurance.

---

## K6 — final KERNEL-00 packet

Bind exact organism/build/product/device identities and all accepted journals.

Explicitly list K00-01…K00-18.

Required terminal state:

- 18 PASS;
- 0 FAIL;
- 0 WARN;
- 0 SKIP;
- 0 MISSING.

K00-03 is reread across the complete closure corpus.
K00-17 replays every automatic act with zero orphan/unattributed/broken-cause transitions.
K00-18 combines static proof with truthful dynamic projection across fault/lifecycle/endurance states.

Only a founder act after this packet may accept KERNEL-00.

---

# Lane B — Bridge and migration

## B1 — BRIDGE-01

Opens only after KERNEL-00 acceptance.

Purpose: bind the accepted native kernel to MAIA product voice without creating a second mind or weakening consent/memory/provider law.

Must preserve:

- canonical spoken/typed cognition convergence;
- member-owned floor control;
- final-only transcript authority;
- sovereign STT/TTS provider law;
- visible/spoken response correspondence;
- interruption/recovery truth.

KERNEL-00 acceptance does not automatically authorize BRIDGE-01.

## B2 — MIGRATE-01

If still desired after BRIDGE-01 acceptance:

- move iOS native MAIA audio authority to the accepted bridge;
- exact native build identity;
- no silent fallback to legacy writers/session owners;
- old stack either explicitly retained as bounded fallback under law or retired by a separate ruling;
- migration failure must leave a truthful recoverable state, not a hybrid hidden authority.

## B3 — post-migration product matrix

Repeat Lane P on every retained platform.

This is the final non-degradation check: native improvement on iOS may not regress Safari/PWA, Desktop, Android, cognition convergence, memory/consent, or turn-taking sovereignty.

---

# Terminal definition

The full voice programme is **FINISHED** only when all of the following are simultaneously true:

1. every retained product surface has a current exact-build PASS under the common product matrix;
2. SOURCE-ID is readable under a prospectively pinned source level without moving the 20 dB law;
3. KERNEL-00 contains 18/18 PASS and is founder-accepted;
4. BRIDGE-01 is separately accepted;
5. native iOS migration is either accepted or explicitly ruled unnecessary;
6. the post-bridge/post-migration cross-platform product matrix is green;
7. the outward claim-state record is updated from evidence, not inference.

Until all seven are true, the honest standing is **VOICE PROGRAMME ACTIVE · NOT FULLY CLOSED**.
