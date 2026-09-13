# JOP-04 — Effect Substrate Specification v0.3

**Date:** 2026-09-13 · **Status:** ⚠️ CANDIDATE — not ratified · **Executable code changed:** none
**Authority:** `JOP-04_EFFECT_SUBSTRATE_RULINGS_2026-09-13.md` — R1–R9 · D1–D3 · C1
**Supersedes:** v0.2 (retained, dated, not edited) · v0.1 (superseded by v0.2)

> **Authorization makes an act eligible for execution. It does not execute the act.**
> ⭐ **Each layer must lose the ability to impersonate the layer above it.**

## What changed from v0.2

| # | v0.2 | v0.3 |
|---|---|---|
| 1 | request narrowing at step 4, before obligations | ⭐ **step 5 — after authority comparison** (R9). A pure final veto; cannot influence derivation even by timing |
| 2 | six refusal reasons, policy folded into `NOT_AUTHORIZED` | **six disjoint categories** incl. `POLICY_REQUIREMENT_UNSATISFIED` and `EXECUTION_REFUSED` (R9) |
| 3 | `MEMBER_DATA` dropped, flagged open | **D1** — jurisdictional **absence**, not a forbidden value |
| 4 | expiry open | **D2** — property of the canonical grant; request may only shorten |
| 5 | `PARTIAL` an `observed_effect` value | **D3** — moved to a separate `execution_completion` field |
| 6 | — | **C1** candidate derived law; falsifiers F19–F24 |

---

## §1 — Effect vector *(unchanged from v0.2 except §1.2)*

Three classes (R7): **descriptive** (classified) · **derived obligation** (computed) · **payload
property** (material). Axes, independence table and partial order carry forward unchanged.

### 1.2 Custody domains — D1

```text
custody ⊆ { WORKTREE · REPO_LOCAL · REPO_REMOTE · PRODUCTION_DB · PRODUCTION_RUNTIME · THIRD_PARTY }
```

⛔ **`MEMBER_DATA` is not a value in this vocabulary — including as a forbidden one.**

> **No authority object can grant JARVIS reach into a domain JARVIS does not possess.**

A capability requiring such reach fails **before ordinary effect admission**, as **jurisdictional
absence**. ⭐ The distinction is load-bearing: a forbidden *value* still makes member data part of
the operator's representational universe and leaves a field that a future policy change could flip.
An absent *vocabulary* cannot be flipped.

### 1.4 UNKNOWN — the two regimes (R8, unchanged)

```text
STATIC   UNKNOWN ≈ TOP        conservative abstraction, permitted
RUNTIME  UNKNOWN → REFUSE     mandatory — EFFECT_CLASSIFICATION_UNRESOLVED
```

---

## §2 — Registry contract *(unchanged from v0.2)*

```text
LAW:   classified_effective_effect ≤ capability_effect_contract
```

Request constraint is **not** in the chain. `classifyEffect` is pure, total, zero-model. Contract
violation **refuses, never clamps** (R8).

---

## §3 — Refusal ontology — R9

Six **semantically disjoint** categories. ⛔ None may substitute for another.

| Reason | Proposition | Audit meaning |
|---|---|---|
| `EFFECT_CLASSIFICATION_UNRESOLVED` | we do not know what kind of act this is | epistemic failure |
| `CAPABILITY_CONTRACT_VIOLATION` | the declared capability boundary is wrong | ⭐ **platform defect** |
| `POLICY_REQUIREMENT_UNSATISFIED` | a policy-derived obligation is unmet | obligation gap |
| `NOT_AUTHORIZED` | act is known; granted authority insufficient | authority gap |
| `REQUEST_CONSTRAINT_VIOLATION` | caller permitted something narrower than this act | caller veto |
| `EXECUTION_REFUSED` | refusal **after** admission | execution decision |

⭐ `CAPABILITY_CONTRACT_VIOLATION` must never read as *"a human declined."* Collapsed into
`NOT_AUTHORIZED`, registry defects become indistinguishable from ordinary denials and unauditable.

⭐ `EXECUTION_REFUSED` exists **because of the hard law**: admission is not execution, so the
separate execution decision must have a refusal reason of its own. Without it, a system that admits
and then declines has no honest way to say so.

---

## §4 — Execution ordering — R9, pinned

```text
1  classify effective descriptive effect
     ├─ UNKNOWN?      → REFUSE  EFFECT_CLASSIFICATION_UNRESOLVED
     └─ comparable?   → no → REFUSE  EFFECT_INCOMPARABLE
2  verify capability contract
     └─ classified ≰ contract → REFUSE  CAPABILITY_CONTRACT_VIOLATION   (no clamp)
3  derive policy obligations           ← consults payload eligibility (§6)
     └─ unmet → REFUSE  POLICY_REQUIREMENT_UNSATISFIED
4  compare granted authority
     └─ insufficient → REFUSE  NOT_AUTHORIZED  ·  or → GATE
5  ⭐ apply caller / request narrowing   ← may ONLY refuse
     └─ exceeded → REFUSE  REQUEST_CONSTRAINT_VIOLATION
6  ⭐ SEPARATE EXECUTION DECISION
     └─ declined → EXECUTION_REFUSED
   ↓ attempt → tool report → independent observation → append-only receipt

⛔ NOT:  permission supplied → try to decide whether that seems enough
```

⭐ **Why step 5 and not step 3.** Placing the request earlier would let it influence which
obligations get derived and which authority gets compared — contamination by *timing* rather than by
declaration. At step 5 the request is a pure veto over an already-settled disposition.

---

## §5 — Receipts — D3

```text
intended              YES | NO
attempted             YES | NO
tool_reported         OK | FAILED | NO_REPORT
observed_effect       per-axis: CONFIRMED | ABSENT | UNKNOWN      ⛔ no PARTIAL
execution_completion  NONE | PARTIAL | COMPLETE                   ⭐ separate field
```

⛔ No `success` field at any layer. An effect dimension that cannot be established is `UNKNOWN`,
⛔ never laundered through `PARTIAL` — *"something happened, partly"* is a disguised `UNKNOWN`.

**Observation independence (R8):** a handler's return may establish `TOOL_REPORTED_OK`; it may never
establish `observed_effect`. The observer need not be a different service but MUST be **epistemically
independent of the execution claim** — capable of returning `ABSENT` while the handler reported `OK`.

Append-only: later observation appends a refinement event; ⛔ never rewrites the earlier belief.

---

## §6 — Outward custody *(unchanged)*

Trigger `externalization ≠ NONE`, independent of `mutation`. **READ-only does not imply
non-externalizing.** Eligibility `NOT_DISTRIBUTABLE | BOUNDED_DESTINATION_ONLY | DISTRIBUTABLE |
UNKNOWN`; ⛔ absence ≡ UNKNOWN ≡ refusal; request cannot elevate.

---

## §7 — Authority grants — D2

```text
AuthorityGrant { scope · effects · subject · issued_at · expires_at / consumption condition }
```

The invocation **presents or references**; it does not constitute. One-way rule:

```text
request may demand a SHORTER usable window
⛔ request cannot extend the authority's canonical lifetime
```

⚠️ **Undecided:** time-expiring vs consumable vs both — likely differs by effect class. F20 tests
only the settled half.

---

## §8 — C1 · candidate derived law, with its defeat conditions

> **Untrusted or invocation-local inputs may narrow authority, but can never enlarge, create,
> repair, or reinterpret authority.**

⚠️ **CANDIDATE.** Observed across request constraint · confirmation assertion · expiry override ·
effect contract vs UNKNOWN. Potentially governs scope · duration · audience · destination · budget ·
custody boundary.

**Earned by:** F15 · F18 · F20 · F23 passing, **and** no counterexample surface found.

**Defeated by:** any legitimate operator surface that genuinely requires an invocation-local input
to enlarge, create, repair, or reinterpret authority. ⭐ **Adversarial probe set** — the four places
systems classically want exactly that:

| Probe | The temptation |
|---|---|
| **Break-glass / emergency override** | an operator asserts elevated authority at invocation time |
| **Incident rollback under time pressure** | urgency argues for skipping a gate |
| **Self-healing retry** | a failed run escalates its own scope to recover |
| **Mid-run scope discovery** | the act turns out to need more reach than classified |

⭐ **Prediction worth recording before testing:** C1 likely survives all four, but by
**reclassification rather than exception** — a legitimate break-glass is not invocation-local; it is
a **separate pre-constituted grant** with its own issuing authority, scope and audit trail. If that
prediction holds, C1's real content is *"there is no such thing as invocation-local authority — only
grants presented at invocation time."* ⛔ If any probe genuinely requires invocation-local
enlargement, C1 is defeated and must not be elevated. F24.

---

## §9 — Falsifiers

F1–F18 carry forward from v0.2. Added:

| # | Falsifier | Tests |
|---|---|---|
| **F19** | ⭐ `domain = MEMBER_DATA` + `authority = MAXIMAL` ⇒ **still impossible**, refused as jurisdictional absence and ⛔ not as a policy denial | D1 |
| **F20** | A request asserting a longer `expires_at` than the grant does not extend authority; a shorter one does bind | D2 (settled half) |
| **F21** | `observed_effect` admits no `PARTIAL`; an unestablished axis reads `UNKNOWN` while `execution_completion` may read `PARTIAL` | D3 |
| **F22** | `POLICY_REQUIREMENT_UNSATISFIED` and `NOT_AUTHORIZED` are distinguishable in the receipt and never substituted | R9 |
| **F23** | ⭐ Two runs identical but for the request constraint derive **identical obligations and identical authority comparison** — the request influences only step 5 | R9 ordering |
| **F24** | Each C1 probe (§8) either reclassifies as a pre-constituted grant or defeats C1 | C1 |

### Runnability audit — answering the sequencing question

⛔ **Do F15–F18 depend on the unresolved questions?** Checked individually: **no.**

```text
RUNNABLE NOW (independent of D1/D2/D3 and of the F12 fixture)
  F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F13 F14 F15 F16 F17 F18 F22 F23

TESTS A DIRECTION — would EARN it
  F19 (D1)   F20 (D2, settled half)   F21 (D3)   F24 (C1)

DEFERRED BY CONSTRUCTION
  F12 — fixture choice awaits the semantic questions
```

⭐ F6 was the one to check twice: it binds an authorization to a **target**, not a lifetime, so it
is independent of D2's undecided half. F7 was the other: it exercises receipt non-collapse without
touching `PARTIAL`.

**Therefore the ruled sequence is viable as stated:**

```text
F1–F14 (+ F15–F18, F22–F23) → evidence → resolve D1/D2/D3 → pin F12 fixture → F19–F21, F24
```

### F12 scope and sequencing constraint

```text
F12 PROVES             the effect architecture can enter the organism
                       without changing the organism's behavior
⛔ F12 DOES NOT PROVE  write safety
⛔ THE FIXTURE         must instantiate a ruled law, never quietly decide one
```

---

## §10 — Standing

```text
v0.1 · v0.2                          SUPERSEDED · PRESERVED · dated, not edited
v0.3                                 OPERATIVE — ⛔ CANDIDATE, not ratified
RULINGS INCORPORATED                 R1–R9 + hard law
DIRECTIONS                           D1 D2 D3 — falsification owed
CANDIDATE DERIVED LAW                C1 — ⛔ not elevated
REQUEST SEMANTICS                    narrowing only · step 5 · pure veto
REFUSAL ONTOLOGY                     six disjoint categories
FALSIFIERS                           F1–F24 specified · ⛔ none executed
EXECUTABLE CODE CHANGED              none
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
WRITE HANDLER                        ⛔ NOT AUTHORIZED
IMPLEMENTATION                       ⛔ NOT AUTHORIZED
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED
NEXT ACT                             falsification of the 19 runnable falsifiers
```
