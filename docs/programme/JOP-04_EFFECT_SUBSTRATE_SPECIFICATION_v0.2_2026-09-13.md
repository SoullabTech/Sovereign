# JOP-04 — Effect Substrate Specification v0.2

**Date:** 2026-09-13 · **Status:** ⚠️ CANDIDATE — not ratified · **Executable code changed:** none
**Authority:** `docs/governance/JOP-04_EFFECT_SUBSTRATE_RULINGS_2026-09-13.md` — R1–R6 + **R7–R8**
**Supersedes:** `…_SPECIFICATION_v0.1_2026-09-13.md` (retained, dated, not edited)

> ⛔ **SUPERSEDED 2026-09-13 by v0.3** — `…_SPECIFICATION_v0.3_2026-09-13.md`. **R9** pins a refusal
> ontology of six disjoint categories (adding `POLICY_REQUIREMENT_UNSATISFIED` and
> `EXECUTION_REFUSED`) and **moves request narrowing to step 5, after authority comparison** —
> this document's §6 ordering applied it earlier and is superseded. Directions **D1–D3** and
> candidate law **C1** are added there. Retained verbatim; a superseded specification is dated,
> not edited.

> **Authorization makes an act eligible for execution. It does not execute the act.**
> ⭐ **Language about an act never becomes authority over the act.**

## What changed from v0.1

| # | v0.1 | v0.2 — per R7/R8 |
|---|---|---|
| 1 | request narrowing sat inside the `≤` chain | ⛔ **removed from the chain.** Request constraint is checked **independently** against the classified invocation |
| 2 | `UNKNOWN` → treated as maximal | **static** `UNKNOWN ≈ TOP`; **runtime** `UNKNOWN → REFUSE` with `EFFECT_CLASSIFICATION_UNRESOLVED` |
| 3 | observer = "a distinct invocation" | observer = **epistemically independent of the execution claim** — not necessarily a different service |
| 4 | §1.1 split proposed | **RATIFIED** (R7) |
| 5 | incomparability, F14 proposed | **RATIFIED** (R8 addendum) |
| 6 | F12 framed as substrate acceptance | unchanged, ⛔ with explicit scope: **F12 does not prove write safety** |

---

## §1 — The effect-vector contract *(item 1)*

### 1.1 The three classes — RATIFIED (R7)

| Class | Members | Authority semantics |
|---|---|---|
| **A · Descriptive** | mutation · custody · reversibility · idempotency · externalization | registry declares ceiling; **classified** from trusted runtime facts |
| **B · Derived obligation** | authority requirement · confirmation requirement | **computed**, never supplied. Strengthened by policy; ⛔ never weakened by request |
| **C · Payload property** | distribution eligibility | property of the **material**; consulted by the outward gate |

Class A is classified from: capability identity · validated arguments · target · destination ·
execution context. ⛔ Never from the packet's own description of the act.

### 1.2 Descriptive axes

```text
mutation          NONE | CREATE | MODIFY | DELETE
custody           set ⊆ { WORKTREE · REPO_LOCAL · REPO_REMOTE · PRODUCTION_DB
                          PRODUCTION_RUNTIME · THIRD_PARTY }
reversibility     GUARANTEED | CONDITIONAL | NONE | UNKNOWN
idempotency       IDEMPOTENT | KEYED | NON_IDEMPOTENT | UNKNOWN
externalization   NONE | BOUNDED_INTERNAL | NAMED_EXTERNAL | BROAD_EXTERNAL
```

⚠️ `MEMBER_DATA` is dropped from the custody set pending §7.2 — under the MAIA exclusion boundary
the operator substrate should arguably have no domain for it at all.

### 1.3 Independence obligations

| Pair | Agree on | Differ on | Proves |
|---|---|---|---|
| `git commit` vs `send email` | mutation = CREATE | reversibility, custody | severity is not one line |
| `upload artifact` vs `git commit` | reversibility | mutation NONE vs CREATE, externalization | ⭐ **externalization ⊥ mutation** |
| `git commit` vs `git push --force` | mutation, custody | reversibility, idempotency | reversibility ⊥ mutation |
| `git tag` vs `git tag -f` | mutation, custody, reversibility | idempotency | idempotency is its own axis |

### 1.4 Ordering — partial, and two fail-closed rules

```text
mutation          NONE < CREATE < MODIFY < DELETE
custody           A ≤ B  iff  A ⊆ B
reversibility     GUARANTEED < CONDITIONAL < NONE
idempotency       IDEMPOTENT < KEYED < NON_IDEMPOTENT
externalization   NONE < BOUNDED_INTERNAL < NAMED_EXTERNAL < BROAD_EXTERNAL

A ≤ B  iff  A.axis ≤ B.axis  for EVERY axis
```

**UNKNOWN — the two-regime rule (R8).**

```text
STATIC REASONING       UNKNOWN ≈ TOP        conservative abstraction, permitted
RUNTIME ELIGIBILITY    UNKNOWN → REFUSE     mandatory
```

⛔ The forbidden path, stated so it can be tested for:

```text
UNKNOWN → convert to MAX → broad contract allows MAX → EXECUTE
```

An unclassifiable invocation is **not a maximally dangerous authorized invocation** — it is an
**unclassified** one. Refusal reason `EFFECT_CLASSIFICATION_UNRESOLVED`, ⛔ **not**
`NOT_AUTHORIZED`: the system does not know what authority would be sufficient, and saying otherwise
misreports the nature of the refusal.

**Incomparability — RATIFIED.** No manufactured ordering. Incomparable where execution requires
comparison → `REFUSE`. ⛔ Not "pick the scarier one."

---

## §2 — Registry declaration and classification *(item 2)*

```ts
CAPABILITIES[name] = { args, effectContract, classifyEffect, handler }
```

### 2.1 The law — corrected per R7

```text
LAW:   classified_effective_effect  ≤  capability_effect_contract

⛔ NOT: request_constraint ≤ classified_effective_effect ≤ capability_effect_contract
```

The request constraint is a **separate, independent check** against the already-classified
invocation. It is never an input to classification.

> **A request cannot make an operation safer merely by describing it as safer.**

⭐ **Structural property the request check must hold:** it can only ever cause *additional* refusal,
never additional permission. If the classified effect exceeds what the caller said they would
permit, refuse — the caller asked for something narrower than this actually is. This mirrors the
fail-closed heuristic already in the substrate: `normaliseReason` in
`jarvis-governance-gate.mjs` *"can only ever refuse more, never authorise."*

### 2.2 `classifyEffect` obligations

- Pure and deterministic. No I/O, no network, no filesystem, ⛔ **no model call**.
- Runs **after** arg validation, **before** any handler dispatch.
- **Total** over the validated arg domain; where it cannot resolve an axis it returns `UNKNOWN`,
  which refuses at runtime per §1.4 — it never guesses.

### 2.3 Contract violation — RATIFIED, refuse not clamp

```text
classified ≰ effectContract  →  CAPABILITY_CONTRACT_VIOLATION
                             →  refuse · ⛔ do not clamp to the contract
```

⭐ Clamping converts *"this capability does more than it declares"* into *"pretend it only did what
it declared"*, destroying the registry contract's evidentiary purpose.

### 2.4 Migration posture

All 13 existing capabilities are read-class and write-free (census §1). Each receives an explicit
read-class `effectContract` and a constant `classifyEffect`. ⛔ A **declaration of what is already
true** — provable as such by F12.

---

## §3 — act ⇄ gate ⇄ lane mapping, without merging *(item 3)*

```text
T1  effect vector  →  required gate class        (obligation derivation — class B)
T2  execution lane →  admissible effect envelope (lane ceiling)
T3  act            →  eligible capability set
```

```text
resolveExecutionDisposition({ act, capability, validatedArgs, target,
                              destination, lane, requestConstraint,
                              resolvedAuthorities })
  → PERMITTED
  | REFUSED { reason }
  | GATED   { gateClass, boundTo: { operation, target } }
```

**Refusal reasons are distinguishable, not one bucket:**

```text
EFFECT_CLASSIFICATION_UNRESOLVED   an axis is UNKNOWN
EFFECT_INCOMPARABLE                no valid ordering
CAPABILITY_CONTRACT_VIOLATION      classified ≰ contract  (registry defect)
REQUEST_CONSTRAINT_EXCEEDED        act is broader than the caller permitted
PAYLOAD_NOT_ELIGIBLE               outward gate
NOT_AUTHORIZED                     obligations genuinely unmet
```

### 3.1 Closed boundary

A handler is unreachable except through this function. The three R1 prohibitions are structural:

```text
⛔ gate resolved → executable   ⛔ lane available → authorized   ⛔ act named → permitted
```

### 3.2 Inherited unchanged

`READ_ONLY_LANES = ['local-native']` and the `WRITE_REQUESTING_KEYS` refusal
(`jarvis-runtime-pipeline.mjs:91-97`) seed T2 and are not weakened.

### 3.3 Authorization objects *(R4)*

Issued by an authority distinct from the worker's claim · bound to a specific operation or bounded
class · bound to target/destination · non-self-granting (inherits `SELF_GRANT_KEYS`) · consumed by a
**separate execution decision**. ⛔ Resolution never triggers execution.

---

## §4 — Four-stage receipt lifecycle *(item 4)*

```text
intended         YES | NO
attempted        YES | NO
tool_reported    OK  | FAILED | NO_REPORT
observed_effect  CONFIRMED | ABSENT | UNKNOWN | PARTIAL
```

⛔ No `success` field exists at any layer. Both R5 states are representable and neither renders as a
verdict:

```text
intended YES · attempted YES · tool_reported OK     · observed_effect UNKNOWN
intended YES · attempted YES · tool_reported FAILED · observed_effect CONFIRMED   ⭐
```

### 4.1 Observation independence — corrected per R8

A handler's return value may establish `TOOL_REPORTED_OK`. ⛔ It may **never** establish
`OBSERVED_EFFECT`.

> The observer need not be a different software service, but MUST be **epistemically independent of
> the execution claim being verified**.

Practically: independent of the executing invocation's own report — a distinct evidentiary act that
could return `ABSENT` while the handler reported `OK`. Precedent: 2026-08-11, where
`inventory.routes` was verified by a separate `git ls-files` and the separation caught a real
test-design error rather than rubber-stamping the run.

### 4.2 Append-only

Extends `events.jsonl` (`jarvis-runtime-store.mjs:29`). A later observation appends a **refinement
event**; ⛔ it never rewrites the earlier belief. `UNKNOWN` is a legitimate terminal state and must
not be resolved by assumption.

---

## §5 — Outward custody boundary *(item 5)*

**Trigger:** `externalization ≠ NONE`, ⛔ independent of `mutation`.

> **READ-only does not imply non-externalizing.**

```text
NOT_DISTRIBUTABLE          never crosses
BOUNDED_DESTINATION_ONLY   crosses only to named destinations — gate checks membership
DISTRIBUTABLE              may cross
UNKNOWN                    ⛔ REFUSE
```

```text
LAW:  absence of eligibility is NOT permission.  missing ≡ UNKNOWN ≡ refusal.
```

⛔ A request cannot elevate eligibility (R7-C). Distribution *of mutating authority* remains blocked
on JOP-01 closure — a separate mechanism; neither satisfies the other.

---

## §6 — Execution ordering *(ratified shape)*

```text
REQUEST
  ↓ validate arguments
  ↓ classify effective descriptive effect
  ├─ UNKNOWN?      → REFUSE  EFFECT_CLASSIFICATION_UNRESOLVED
  ├─ comparable?   → no → REFUSE  EFFECT_INCOMPARABLE
  ├─ ≤ contract?   → no → REFUSE  CAPABILITY_CONTRACT_VIOLATION
  ↓ check request constraint against classified invocation   (may only refuse)
  ↓ consult payload eligibility
  ↓ derive authority / confirmation obligations
  ↓ reconcile act + gate + lane + destination
  ├─ not eligible  → REFUSE / GATE
  ↓ authority resolution
  ↓ ⭐ SEPARATE EXECUTION DECISION
  ↓ attempt
  ↓ tool report
  ↓ independent observation where required
  ↓ append-only receipt
```

---

## §7 — Falsifiers *(item 6)*

| # | Falsifier | Defeats |
|---|---|---|
| **F1** | A packet declaring `mutation: MODIFY` on a read-contract capability is REFUSED naming the **contract**, not the packet | packet-declared effect |
| **F2** | For each axis, two acts agreeing on all others and differing on it classify differently | axis collapse |
| **F3** | ⭐ A capability reading local files and transmitting them — `mutation: NONE` — is GATED outward | *read ⇒ safe* |
| **F4** | ⭐ A resolved `WRITE_AUTHORITY_REQUIRED` gate with no separate execution decision does **not** execute | the hard law |
| **F5** | A worker-supplied authorization object is refused | self-grant |
| **F6** | An authorization bound to target A does not authorize the same operation on target B | scope creep |
| **F7** | `attempted YES · tool_reported FAILED · observed_effect CONFIRMED` is representable, not rendered as failure | receipt collapse |
| **F8** | A later `observed_effect` does not mutate the earlier `tool_reported` record | append-only |
| **F9** | An artifact with no eligibility field is REFUSED outward | absence ≠ permission |
| **F10** | Gate-resolved alone, lane-available alone, act-named alone — none authorizes | caller inference |
| **F11** | `classifyEffect` performs 0 model calls, 0 network, 0 filesystem reads; deterministic across repeats | zero-LLM ledger |
| **F12** | ⭐ `git.rev_parse` re-expressed through the contract: byte-identical results, stable effect classification, no new authority, no behavioral widening | substrate acceptance |
| **F13** | Two incomparable vectors REFUSE rather than resolving to either | manufactured ordering |
| **F14** | `classifyEffect` exceeding `effectContract` refuses and does **not** clamp | silent under-declaration |
| **F15** | ⭐ **NEW (R7).** A request constraint cannot raise *or* lower the classified effect. Identical args + identical context ⇒ identical classification, **whatever the request says** | request-as-effect-declaration |
| **F16** | ⭐ **NEW (R8).** An `UNKNOWN` axis under a maximally broad `effectContract` still REFUSES — the breadth of the contract must not admit it | UNKNOWN→MAX→execute |
| **F17** | **NEW.** `EFFECT_CLASSIFICATION_UNRESOLVED` and `NOT_AUTHORIZED` are distinguishable in the receipt and never substituted | misreported refusal |
| **F18** | **NEW (R7-B).** A packet asserting `confirmation_requirement: NONE` or `authority_requirement: NONE` does not weaken a policy-derived obligation | obligation narrowing |

### F12 scope — stated so it cannot be overread

```text
F12 PROVES      the effect architecture can enter the organism
                without changing the organism's behavior
⛔ F12 DOES NOT PROVE   write safety
```

That is the correct **first** gate, and only the first.

---

## §8 — Open questions remaining

| v0.1 § | Question | Status |
|---|---|---|
| 7.1 | descriptive / obligation / payload split | ✅ **RATIFIED** (R7) |
| 7.3 | `UNKNOWN` as maximal | ✅ **RATIFIED with correction** (R8) |
| 7.2 | custody domain set — is `MEMBER_DATA` a domain here at all? | ⛔ OPEN |
| 7.4 | authorization expiry — by time, by run, or only by consumption? | ⛔ OPEN |
| 7.5 | is `PARTIAL` a legitimate `observed_effect`, or a disguised `UNKNOWN`? | ⛔ OPEN |
| 7.6 | F12 fixture — `git.rev_parse`, or broader? | ⛔ OPEN |

## §9 — Standing

```text
SPECIFICATION                        v0.2 CANDIDATE — ⛔ not ratified
v0.1                                 SUPERSEDED · retained · dated, not edited
RULINGS INCORPORATED                 R1–R8 + hard law
FALSIFIERS                           F1–F18 specified · ⛔ none executed
EXECUTABLE CODE CHANGED              none
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
WRITE HANDLER                        ⛔ NOT AUTHORIZED
PROOF FIXTURE (F12)                  ⛔ not built
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED
NEXT ACT                             adjudicate §8 · then falsification
```
