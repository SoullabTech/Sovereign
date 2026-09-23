# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R1
## Jev Judgment Contract — separate address · exact schema · monotone advisory semantics

**Status:** ⛔ **CANDIDATE. NOT RATIFIED.** Produced under founder disposition 2026-09-22:
**J1 RETURNED · NOT RATIFIED**, with repair `J1R1` authorized.
**Bound to canonical at construction:** `0691cd3668c1ba0312e3578d5264a8b1abf90ec3`
(J0 blob verified present and unchanged at `494cd61973ed02c4453067716657631f3f9143e9`).
**Branch:** `claude/sovereign-governance-review-s8skj2`

**Governing law:** the **ratified J0 constitution**, §7 of
`JARVIS-JEV-01_J0_CONSTITUTION_AND_J1_JUDGMENT_CONTRACT_2026-09-22.md`, canonical and
immutable. ⛔ Nothing in this document amends, qualifies, extends or reinterprets J0.
⭐ **J0 constrains J1; J1 contributes nothing to the meaning of J0.**

---

## 0 · DISPOSITION AND AUTHORITY

```text
J1 disposition       RETURNED · NOT RATIFIED

Authorized repair:
J1R1 — SEPARATE ADDRESS
     + EXACT SCHEMA
     + MONOTONE ADVISORY SEMANTICS

J0                    IMMUTABLE
J2                    NOT OPEN
provider/capability   UNCHANGED
adapter/runtime       UNTOUCHED
```

⚠️ **Provenance note, recorded rather than smoothed over.** The founder's message directing
this act referred to a J1 adjudication "as written" and to a numbered construction whose
step 1 binds `T` dynamically and whose step 2 protects J0 by blob identity. **No such
document was drafted in this session** — the prior act ended with J1 eligible and unopened.
This candidate is therefore built from the **disposition block above**, which is
self-sufficient for producing a candidate. ⛔ The two referenced steps concern a later
*admission*, not this construction, and no admission is performed here. ⭐ Both named
protections were nonetheless honoured: `T` was re-read at construction (`0691cd36…`), and
J0 was verified by blob identity, not by path.

---

## 1 · ⭐⭐ SEPARATE ADDRESS — and the standing of the embedded §3

**This document is the sole object of future J1 adjudication.**

The Judgment Contract previously existed as **§3 of the J0 document**. Under this
disposition that embedded text:

- ⭐ **remains historically visible**, unchanged, at its original address in canonical; and
- ⛔ **loses all candidate standing.** It is a historical draft. ⛔ It may not be cited as
  the contract, adjudicated as the contract, or relied on as the contract.

### ⚠️ How that was effected, and the residual it leaves

⛔ **The J0 document was NOT edited**, because J0 is canonical and immutable at blob
`494cd619…`; annotating §3 in place would change that blob and would require its own
admission act. The loss of standing is therefore declared **here**, in the governing object,
⛔ not by mutating the superseded text.

⚠️ **The residual this leaves, named because this lane has already been bitten by it
once today:** a reader who opens the J0 document and reaches §3 sees a contract with no
marking that it has been superseded. That is the same shape as the stale
`Current state: J1 — ROUTING-LAW DISCOVERY` line that generated a false constitutional
finding this morning — *a record asserting a standing it no longer has.*

⭐ **The two available repairs, ⛔ neither taken here:**
1. annotate §3 in place and re-admit the J0 document — ⛔ changes the immutable blob, needs
   its own founder act;
2. leave §3 untouched and accept that this document is the only place the standing is
   recorded — ⛔ carries the residual above.

⭐ This candidate takes **(2)**, because it is the only option available without mutating an
immutable canonical object. ⚠️ **If the residual is judged unacceptable, (1) is a separate
act and should be issued as one** — it is not a defect in this candidate to be quietly
patched later.

---

## 2 · CONFORMANCE TO RATIFIED J0

| Ratified article | How this contract satisfies it |
|---|---|
| **A1** judgment is evidence, never permission; may not satisfy a review requirement merely by being a Jev judgment | §4 M1 ceiling; §3.1 `candidate_routes` closed to already-authorized routes; §4 M6 |
| **A2** confidence may constrain or close, never open | §4 M4 — confidence cannot raise the ceiling at any value |
| **A3** abstention is fail-closed; escalates to the governing non-Jev path; an error or abstention is never itself a route | §3.2 `Abstain` on every question; §3.4 malformed→abstain; §4 M2 |
| **A4** bounded non-content representation only; no member message, repository source or prose, canon or constitutional text, prior turns, free-text justification | §3.1 — closed enums, bounded numerics, opaque ids only; §3.5 shape rule |
| **A5** membrane precedes every outbound representation; refusal before construction/logging/hashing/caching | §3.6 |
| **A6** Jev may not judge its own standing | §3.3 — no question asks about Jev's eligibility, hold applicability, or confidence adequacy |
| **A7** removal is a no-op on the authority lattice | §4 M3 — absence is the identity element |

---

## 3 · EXACT SCHEMA

⛔ **A document, deliberately not committed source.** Landing this under `lib/**` or
`scripts/**` would be the first increment of the adapter, which is not authorized.

### 3.1 · `JudgmentPacket` — the only thing Jev may receive

```text
JudgmentPacket := {
  packet_version          : "jev-1"                      // exact literal
  work_unit_ref           : OpaqueId                     // /^[0-9a-f]{32}$/
  task_kind               : TaskKind                     // closed enum, §3.7
  requested_effect        : RequestedEffect              // closed enum, §3.7
  affected_surface        : AffectedSurface              // closed enum, §3.7
  contains_sensitive      : Boolean                      // computed by the membrane, never by Jev
  requires_external_info  : Boolean
  candidate_routes        : RouteId[1..8]                // closed enum, already-authorized ONLY
  change_scope            : ChangeScope
}

ChangeScope := {
  file_count  : Integer in [0, 10000]
  migration   : Boolean
  auth        : Boolean
  production  : Boolean
}
```

⭐ **Every field is a closed enum, a bounded integer, a boolean, or an opaque fixed-width
id.** ⛔ There is no free string, no path, no name, no prose, and no extension point.

⛔ **`candidate_routes` holds only routes the Work Unit is ALREADY authorized to take.** Jev
selects **among** them; ⛔ it never nominates one. A packet containing an unauthorized route
is **malformed** and refused at construction — this makes A1 structural rather than checked
afterwards.

⚠️ **Residual the schema does NOT close, carried forward from the superseded draft because
it remains true:** even with no prose and no paths, `affected_surface` and `task_kind`
disclose **Soullab's internal surface taxonomy** — that a surface exists and that work is
occurring on it — to whoever hosts Jev. ⛔ The packet narrows exposure; it does not
eliminate it, and it does not authorize the crossing.

### 3.2 · Judgment shapes — exactly four, closed

```text
Judgment := Choice | Score | YesNo | Abstain

Choice  := { question_id: QuestionId, options: RouteId[1..8],
             choice: RouteId, confidence: Real in [0,1] }
             // invariant: choice ∈ options ⊆ packet.candidate_routes

Score   := { question_id: QuestionId, scale: { min: 0, max: 1 },
             score: Real in [0,1], confidence: Real in [0,1] }

YesNo   := { question_id: QuestionId, answer: Boolean,
             confidence: Real in [0,1] }

Abstain := { question_id: QuestionId, reason: AbstainReason }
             // ⛔ carries NO confidence — an abstention is not a weak judgment
```

⭐ **`Abstain` deliberately carries no confidence field.** A confidence on an abstention
would invite ranking abstentions against judgments, which is how *"it abstained, but only
barely"* becomes a route.

⭐ **`Abstain` is representable on EVERY question.** A contract where abstention cannot be
expressed forces judgment where none is warranted, and the resulting confidence then
measures the contract rather than the task.

### 3.3 · Questions — closed set

| `question_id` | shape | question |
|---|---|---|
| `Q_ROUTE` | Choice | Which **already-authorized** route best fits this work unit? |
| `Q_DEPTH` | Score | How much deliberative reasoning does this require? (0 mechanical → 1 deeply ambiguous) |
| `Q_RISK` | YesNo | Does this appear to cross a structural-risk boundary? |
| `Q_SUFFICIENT` | YesNo | Is the supplied state sufficient to proceed without clarification? |
| `Q_LLM_NEEDED` | YesNo | Is a generative model required at all? |

⭐ `Q_LLM_NEEDED` is the highest-leverage question and the likeliest to be dropped: some
JARVIS actions need no inference once the operation is identified.

⛔ **Asymmetric reading, binding.** `Q_RISK` and `Q_SUFFICIENT` are advisory in the A1
sense. A **`true`** on `Q_RISK` may raise escalation; a **`false`** may never lower a guard.
A **`false`** on `Q_SUFFICIENT` may raise a clarification requirement; a **`true`** may
never discharge one. ⛔ Otherwise a confident wrong negative silently removes a boundary,
which is A2's failure mode arriving through a different field.

⛔ **No question may be added that asks Jev about Jev** (A6): not its own eligibility, not
whether a hold applies, not whether its confidence suffices, not whether it should have been
invoked.

### 3.4 · Response admission

```text
admit(response) :=
  parse ok           ∧
  question_id ∈ closed set                     ∧
  shape matches the question's declared shape  ∧
  all invariants of §3.2 hold
    → the Judgment
  otherwise
    → Abstain{ question_id, reason: MALFORMED }
```

⛔ An unparseable, absent, timed-out, unrecognised, or out-of-range response is an
**abstention**, never a judgment and never a route (A3).

### 3.5 · Shape rule — mechanically checkable (capability class `repository_derived_metadata`)

A packet conforms **iff every field** is one of: a closed enum member, a boolean, a bounded
integer, a bounded real, an opaque fixed-width id, or an array of those. ⛔ **Any free
string, path, filename, symbol, commit message, prose fragment, or extension field is a
class violation** — detectable by a guard, ⛔ not by review.

⭐ This is why the class is `repository_derived_metadata` and ⛔ not `repository_source`:
**it is defined by shape, not subject matter, so it cannot widen by usage.**

⛔ Naming the class here neither adds it to the capability table nor grants it to any
provider. Table mutation, provider assignment, disclosure permission, network authority,
spend authority and one-shot execution authorization remain **separate acts**.

### 3.6 · Membrane ordering (A5)

```text
eligibility decision
        ↓ (pass)
packet construction
        ↓
outbound representation
```

⛔ On refusal, the prospective representation is **not constructed, not logged, not hashed,
not cached, and not digested.** *A refusal is not an occasion to disclose.*

### 3.7 · Closed enums — ⛔ deliberately NOT enumerated here

`TaskKind`, `RequestedEffect`, `AffectedSurface`, `RouteId` and `AbstainReason` are closed
enums whose **members are set by the parent lane's policy**, ⛔ not by this contract.

⭐ **This is a boundary, not an omission.** Enumerating them here would let the judgment
contract define the routing vocabulary it is supposed to be governed by — the same
inversion `J0R1` severed between J0 and J1, one layer down.

---

## 4 · ⭐⭐ MONOTONE ADVISORY SEMANTICS

Let `A(s)` be the set of acts available in state `s` under governing authority **without**
any Jev judgment — the authority lattice of ratified A7. Let `A'(s, J)` be the set available
after admitting judgment set `J`.

**M1 · CEILING (narrowing only).**
> `A'(s, J) ⊆ A(s)` for every state `s` and every judgment set `J`.

⭐ A Jev judgment can only **narrow or leave unchanged** what is available. ⛔ There is no
`J` at any confidence, of any shape, in any combination, that adds an act. This is A1 and A2
expressed as a single inequality.

**M2 · ABSTENTION IS NON-EXPANDING.**
> For `J` containing any `Abstain`: `A'(s, J) ⊆ A'(s, J \ {abstentions})`.

⛔ An abstention never restores an act that a judgment removed, and never supplies one on
its own. Abstention escalates to the governing non-Jev path (A3).

**M3 · ABSENCE IS THE IDENTITY ELEMENT (A7).**
> `A'(s, ∅) = A(s)`.

⭐ Removing Jev entirely leaves the authority lattice, the available authorized acts, the
prohibited acts, and the derivability of authority gates **exactly** as they were. ⛔ It need
not preserve advice quality, latency, cost, route preference, or amount of deliberation.

**M4 · CONFIDENCE CANNOT RAISE THE CEILING (A2).**
> For judgments `j`, `j'` identical except in `confidence`: both `A'(s, {j}) ⊆ A(s)` and
> `A'(s, {j'}) ⊆ A(s)`.

⭐ Confidence may move the result **within** `[∅, A(s)]`. ⛔ No confidence value, at any
magnitude, moves it **above** `A(s)`. ⭐ **Falsifiable:** if raising a confidence threshold
enlarges the available set, M4 is violated.

**M5 · IDEMPOTENT AND ORDER-INDEPENDENT.**
> `A'(s, J ∪ J) = A'(s, J)`, and `A'` does not depend on the order in which the members of
> `J` were admitted.

⛔ Re-asking, re-submitting, or re-sequencing judgments cannot accumulate into an
enlargement. ⭐ Without M5, *"ask again until it agrees"* becomes a mechanism.

**M6 · NO DISCHARGE (A1).**
> Admitting any `J` leaves every governing requirement — review, authority, gate, human
> provider-execution grant, disclosure grant — in exactly the state it held under `A(s)`.

⛔ A Jev judgment may narrow what is *available*; ⛔ it may never mark anything as
*satisfied*.

⭐⭐ **Taken together M1–M6 are a single claim: *Jev is a monotone restriction on an
authority lattice it cannot enlarge, and whose removal is the identity.*** That is the whole
of what "advisory" means here, stated so it can be tested rather than asserted.

---

## 5 · REQUIRED FALSIFIERS — ⛔ none built, none run

⭐ Per the ratified lethality-first discipline (S3 Class B; TESTING-01 §0; REVIEW-CUSTODY-01
Step 1), each law needs a **defeat candidate**: a plausible, competent, WRONG implementation
that passes every other case and fails this one. ⛔ **A suite written against a conforming
implementation passes by construction and proves nothing.**

| candidate | embodies | must fail |
|---|---|---|
| `DC-CEILING-BREACH` | a judgment adds an act not in `A(s)` | M1 |
| `DC-ABSTAIN-RESTORES` | an abstention restores a removed act | M2 |
| `DC-REMOVAL-CHANGES-LATTICE` | deleting Jev changes an authority outcome | M3 / A7 |
| `DC-CONFIDENCE-OPENS` | a threshold enlarges the available set | M4 / A2 |
| `DC-REPLAY-ACCUMULATES` | re-submitting the same judgment widens the result | M5 |
| `DC-DISCHARGES-REVIEW` | a judgment marks a review requirement satisfied | M6 / A1 |
| `DC-FALSE-LOWERS-GUARD` | `Q_RISK=false` lowers a guard | §3.3 |
| `DC-FREE-STRING` | an extension field carries prose past the shape rule | §3.5 |
| `DC-UNAUTHORIZED-ROUTE` | `candidate_routes` contains a non-authorized route | §3.1 |
| `DC-SELF-STANDING` | a question asks whether Jev should be used | A6 |
| `DC-REFUSAL-LOGS-PACKET` | the membrane logs the representation it refused | A5 / §3.6 |
| `DC-ENUM-SELF-DEFINITION` | the contract defines its own routing vocabulary | §3.7 |

⛔ **If a candidate survives, the repair is the SUITE, never the candidate.**

⚠️ **This table is an obligation, not evidence.** No falsifier is written, no candidate is
built, and no matrix has been run. ⛔ Lethality is **NOT** demonstrated, and this contract
must not be ratified on the strength of a table of tests that do not exist.

---

## 6 · ⛔ WHAT THIS CANDIDATE DOES NOT DO

⛔ It is not ratified · ⛔ does not amend J0 or its blob · ⛔ does not open J2 · ⛔ does not
edit `PROVIDER_GOVERNANCE.md` or the capability table · ⛔ does not add
`repository_derived_metadata` to any table · ⛔ does not admit TypeSafe/Jev as a provider ·
⛔ does not authorize disclosure, network use, external inference, provider transport or
provider spend · ⛔ does not construct, log, hash, cache or send a representation · ⛔ does
not build an adapter · ⛔ does not change routing runtime · ⛔ does not enumerate the parent
lane's routing vocabulary · ⛔ no merge · ⛔ no deploy · ⛔ production untouched.

⛔ **The 2026-09-20 dev-lane interim hold remains operative, both lift conditions
undischarged.** ⛔ Jev remains external, advisory-only, with the automatic fast path
withdrawn, and ⛔ must not be described as a fast path or automatic path.

---

## 7 · STANDING

```text
J0 Constitution       RATIFIED · CANONICAL · IMMUTABLE @ blob 494cd619
J1 (embedded §3)      HISTORICALLY VISIBLE · ⛔ NO CANDIDATE STANDING
J1R1 (this document)  CANDIDATE · NOT RATIFIED · sole object of future J1 adjudication
Falsifier suite       OWED · ⛔ NOT BUILT · lethality ⛔ NOT DEMONSTRATED
J2                    NOT OPEN
ADAPTER               NOT AUTHORIZED
PROVIDER EXECUTION    NOT OPENED
capability table      UNCHANGED
```

⭐ *Jev is a monotone restriction on an authority lattice it cannot enlarge, and whose
removal is the identity. Everything else in this contract exists to make that statement
checkable.*
