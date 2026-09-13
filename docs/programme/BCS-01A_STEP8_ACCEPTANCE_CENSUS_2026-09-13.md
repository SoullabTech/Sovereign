# BCS-01A · Step 8 — Full P1–P12 Acceptance Census

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `0e69439c`
**Kind:** ⭐ **read-only acceptance adjudication** · ⛔ **no build authorization added by this act**
**Suite at base:** 9 suites · 108 tests · 108 passed

> **A requirement is not proved merely because the implementation has not yet built the thing that
> could violate it.**

## 0 · Dispositions

```text
PROVED               materially exercised, falsifier demonstrated
NOT YET EXERCISED    the required subject does not yet exist, so a green would be vacuous
FAIL                 the subject exists and violates the obligation
CONTRACT CHALLENGE   contact with implementation shows the governing contract is false
```

⭐ `NOT YET EXERCISED` is an **acceptance-census disposition**, not a new runtime state.

---

## 1 · Ledger, adjudicated against the witnesses that exist

Each row is checked against the committed witness and its demonstrated falsifier — not against the
step's own summary.

| | Obligation | Disposition | Materially exercised by | Falsifier demonstrated |
|---|---|---|---|---|
| **P1** | commissioned scope | **PROVED** | Step 4 A · commission independently observable before any execution | Step 6 M7 partition plan ≠ frozen scope |
| **P2** | frozen Work state | **PROVED** | Step 4 A · exact frozen identity reads back; Step 7 A · typed lineage names revision + digest | Step 7 M1 lineage fabricated from plan |
| **P3** | current-consent contraction | **PROVED** ⚠️ *ceiling below* | Step 2 W-P3 (function + re-read count); **Step 7 D** on the real material path | Step 2 M-cache; Step 7 M3 permission after acquisition |
| **P4** | durable execution | **PROVED** | Step 4 C/D/E/F · concurrent claim, worker identity, heartbeat, attempts, terminal states | Step 4 M1–M5 |
| **P5** | expired-claim recovery | **PROVED** | Step 5 A–K · three reaper fns, ABA, exhausted budget | Step 5 M1–M7 |
| **P6** | checkpoint resume | **PROVED** | Step 6 · `seen === ['s1','s2','s2','s3']` | Step 6 M1–M8 |
| **P7** | cancellation act ≠ state | **PROVED** | Step 2 W-P7 (semantics); Step 4 G (durable interval) | Step 2 M2; Step 4 M2 |
| **P8** | frozen input lineage | **PROVED** | Step 7 A/B/C + **F′** commit-time re-verification | Step 7 M1, M5, M10, **M11** |
| **P9** | three-state currency | **PROVED** | Step 2 W-P9 (three arms); Step 7 H/I/J/K on durable lineage | Step 2 M-null; Step 7 M7, M8 |
| **P10** | no automatic recomputation | **PROVED** | Step 2 W-P10 (spy queue, fresh-commission positive control); Step 7 K (measuring creates nothing) | Step 2 M-enqueue; Step 7 M9 |
| **P11** | output classified by material type | ⛔ **NOT YET EXERCISED** | — | — |
| **P12** | CMT boundary for outputs | ⛔ **NOT YET EXERCISED** | — | — |

```text
10 materially exercised · 2 not yet exercised · 0 failed · 0 contract challenges

BCS-01A   NOT YET ACCEPTED · NOT FAILED
          implementation sequence remains open only for P11/P12 closure
```

### ⚠️ P3's PROVED carries a ceiling, recorded so it is not read wider

P3 is proved **for the recurrence acquisition path**: the permission function models contraction
(Step 2), and the real material crossing is wired through it (Step 7 D — provider call count stays
at `['s1']` after contraction). ⛔ It does **not** establish that every future material-crossing
path in MAIA is wired through `permitCrossing`. That is a separate obligation with a separate
subject.

---

## 2 · Why P11 cannot be green

P11 requires *output classified by material type — never by the fact a job produced it.* The
implementation today holds commission · execution · partitions · checkpoints · frozen input
lineage · currency measurement, **and no durable epistemic output at all.**

⛔ The following reasoning is refused:

```text
there is no generic bounded-job producer  →  therefore output classification is correct
```

⭐ **There is no output to classify.** The absence is a success of the earlier gates and evidence
for nothing here.

**Closure requires** one real bounded recurrence-sweep output, classified by what the material
**is** — never `bounded-job output`, `recurrence-job result`, `worker output`, which name
machinery. ⭐ The **F-J2.3 test**: the classification must remain true had the same observation
been produced by a different lawful execution mechanism.

## 3 · Why P12 cannot be green

Today there is no recurrence output path into MAIA, which establishes a real negative fact — **no
current bypass exists in this proving implementation** — and nothing more.

⚠️ **A system in which nothing can ever be offered would satisfy the identical observation.** That
is the universal-refusal pathology this programme has already rejected twice: at FR-J4's *a
boundary that only refuses proves nothing*, and in the RB-6 note where a negative arm stopped
discriminating once its positive arm became unreachable.

⭐ P12 therefore needs a **positive neighbouring control**, and ⛔ **still does not require CMT-01
M3.** The lawful proving target is the boundary itself:

```text
truthfully registered material   → the boundary can process it
unregistered recurrence output   → cannot bypass it
```

⛔ Not: `nothing enters anything`. ⛔ No live served-response contribution is required or
authorized, and a producer may **not** be registered merely to obtain a positive result.

---

## 4 · The next implementation unit, narrower than discovery

> One durable, explicitly evidenced recurrence observation produced from already-supplied proving
> inputs, classified as material, and held outside CMT participation unless an existing producer
> truthfully applies.

⛔ No general recurrence detector. ⛔ No new taxonomy. ⛔ No producer registration by convenience.
Occurrence locations come from a deterministic proving fixture. Reuses **Step 3** (admission law)
and **Step 7** (frozen input lineage).

### ⭐ Claim-specific coverage becomes earned here — and only here

Earlier steps correctly refused `checkpoint → coverage` and `lineage → coverage` as **automatic**
derivations. P11 closure may authorize the narrower relation:

```text
lineage                                   ≠ coverage
lineage + THIS claim's evidentiary use    → candidate claim-specific coverage → Step-3 admission
```

⭐ This is the first point at which lineage may legitimately participate in constructing coverage,
**because there is finally a specific claim for the coverage to qualify.** The Step-6 M8 instrument
must be narrowed once more, per R1 — it bans the derivation, and the newly lawful derivation is
*claim-scoped*, not automatic.

### Falsifiers owed

```text
F11-A machinery classification (job type / worker / execution type)      RED owed
F11-B output persisted without recoverable frozen lineage                RED owed
F11-C checkpoint promoted to observation without admission               RED owed
F11-D claimed extent outruns claim-specific coverage                     Step-3 gate must refuse
F11-E uniform evidence promoted to recurrence                            Step-3 gate must refuse

F12-A direct MAIA bypass (renderer / prompt / served turn)               RED owed
F12-B actor/material collapse (producer = sweep / job / worker / model)  RED owed
F12-C registry-by-convenience                                            RED owed
F12-D universal-refusal instrument (positive control broken)             RED owed
```

⭐ **F12-D is the one that keeps P12 honest** — it fails the *instrument*, not the implementation,
and is the direct descendant of both FR-J4 and the RB-6 warning.

---

## 5 · Gates that are not constitutional evidence

```text
npm run typecheck · npm run test    OWED, green required before merge
                                    no-regression / integration gates; they do not
                                    substitute for P1–P12 evidence

FrozenSectionProvider               fixture seam
PRODUCTION WORK-TABLE INTEGRATION   NOT PROVED
PRODUCTION READINESS                NOT PROVED
```

⛔ That does not erase the proving-lane evidence for P3/P8/P9: BCS-01A was authorized as a proving
implementation in a disposable environment, and production integration receives its own gate later.

## 6 · Acceptance rule

```text
PASS requires   P1–P12 materially exercised
                no obligation green by absence alone
                every required mutant demonstrated bad before its RED is counted
                project integration gates green before merge
```

A final PASS would mean only: **the bounded-cognition contract survived one recurrence proving
flow.** ⛔ It would not authorize production · a second cognition flow · architectural
generalization · CMT-01 M3 · automatic member-wide sweeps.

## 7 · Standing

```text
STEPS 2–7             CLOSED            SUITE   108 / 108
P1–P10                PROVED            P3 carries a recorded ceiling
P11 · P12             NOT YET EXERCISED
BCS-01A ACCEPTANCE    INCOMPLETE · NOT FAILED
CONTRACT CHALLENGE    NONE
NEXT                  one bounded P11/P12 closure step · ⛔ no general recurrence discovery
CODE WRITTEN          NONE by this act
```

> **Absence can prove that a forbidden path is missing. It cannot prove that a required
> relationship works.**
