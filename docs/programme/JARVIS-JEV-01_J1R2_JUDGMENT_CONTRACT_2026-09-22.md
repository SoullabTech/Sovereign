# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R2
## Jev Judgment Contract — authority-invariant advisory semantics + exact vocabulary binding

**Status:** ⛔ **CANDIDATE. NOT RATIFIED.** Produced under founder adjudication 2026-09-22:
**J1R1 RETURNED · NOT RATIFIED**, repair `J1R2` authorized (documentary contract repair only).
**Supersedes as candidate:** `J1R1` (commit `7fec3629…`, blob `12a0c631…`) — historical.
**Bound to canonical at construction:** `0691cd3668c1ba0312e3578d5264a8b1abf90ec3`
**J0 blob verified before mutation:** `494cd61973ed02c4453067716657631f3f9143e9` ✅
**Branch:** `claude/sovereign-governance-review-s8skj2`

**Governing law:** the **ratified J0 constitution**, §7 of the canonical J0 document.
⭐ **J0 constrains J1; J1 contributes nothing to the meaning of J0.**

> ⭐⭐ **The whole of this repair, in one line:**
> **Jev may change what JARVIS thinks is prudent. It may not change what JARVIS is
> permitted to do.**

---

## 0 · DISPOSITION

| Axis | J1R1 verdict |
|---|---|
| Separate address | ✅ **PASS — accepted as correct and complete** |
| Exact schema | ⛔ RETURN |
| Monotone advisory semantics | ⛔ RETURN |
| Lethality | ⚠️ OWED — not demonstrated |

**Accepted and ⛔ not reopened:** the canonical J0 document remains byte-identical; its
embedded §3 remains **historical candidate evidence only**; the separate J1 successor is the
sole object of J1 adjudication; ⛔ **no J0 annotation is authorized.**

⭐ **Founder ruling on the §3 residual — option 2 taken, and the durable repair named:** *a
ratified historical object should not be rewritten every time its successor state changes.*
The eventual repair is a **separate programme status/custody index** naming the immutable J0
object and the current J1 object, so live standing has an owner without turning the J0 blob
into a living status page. ⛔ **That index is not opened here.**

```text
J0 historical blob            stays immutable
embedded §3                   historical candidate only
J1 successor                  owns current J1 standing
future status/custody index   owns live programme navigation   ⛔ NOT OPENED
```

---

## 1 · ⭐⭐ THE CORRECTION — J1R1's M1 CONTRADICTED RATIFIED A7

**This is a defect in my formalization, not a wording preference, and it is the reason
J1R1 was returned.**

J1R1 M1 stated `A'(s, J) ⊆ A(s)`, where `A(s)` was explicitly *the set of acts available
under governing authority*. **Subset permits strict subset** — i.e. a Jev judgment removing
an otherwise-authorized act.

⭐ **Ratified A7 requires that removing Jev preserve the authority lattice, the available
authorized acts, the prohibited acts, and the derivability of authority gates.** If a
judgment could make an authorized act unavailable, then deleting Jev would **restore** that
act — and removal would not be the identity.

⛔ **So M1 and A7 could not both hold.** The contract asserted two laws that were mutually
unsatisfiable for any non-empty judgment set, and J1R1's own M3 (`A'(s,∅) = A(s)`) concealed
this by making the only *checked* case the empty one.

⚠️ **The root error was domain confusion:** I applied a restriction law to the **authority**
domain when it belongs to the **advice** domain. *Narrowing advice* and *narrowing
authority* are different acts, and only the first is Jev's.

⭐ **`Q_LLM_NEEDED = false` is the cleanest illustration:** it may recommend *not* using an
optional model. ⛔ It may **not suppress the authorized model path itself.**

---

## 2 · AUTHORITY-INVARIANT ADVISORY SEMANTICS

Two disjoint domains, ⛔ never merged:

```text
AUTHORITY DOMAIN                    ADVICE DOMAIN
authority lattice                   preference
available authorized acts           recommended route
prohibited acts                     recommended deliberation depth
governing requirements              escalation recommendation
derivability of authority gates     clarification recommendation

INVARIANT under every J              MAY be altered by J
```

**I1 · AUTHORITY INVARIANCE (replaces J1R1 M1).**
> For every state `s` and every admitted judgment set `J`:
> ```text
> Authority'(s, J)      = Authority(s)
> AvailableActs'(s, J)  = AvailableActs(s)
> Prohibited'(s, J)     = Prohibited(s)
> Requirements'(s, J)   = Requirements(s)
> ```

⭐ **Equality, ⛔ not subset.** Jev may neither **create nor remove** an authorized act.

**I2 · ADVICE IS THE ONLY MUTABLE OUTPUT.** A judgment set may alter only `Advice(s, J)` —
preference, recommended route, recommended depth, escalation and clarification
recommendations. ⛔ Nothing in `Advice` is an input to `Authority`.

**I3 · ABSENCE IS THE IDENTITY (A7).** `Advice(s, ∅)` is the governing non-Jev advice and
`Authority'(s, ∅) = Authority(s)`. ⭐ Removing Jev entirely changes no authority outcome; ⛔ it
need not preserve advice quality, latency, cost, route preference or deliberative burden.

**I4 · CONFIDENCE IS ADVICE-ONLY (A2).** Confidence may enter `Advice` at any value and
⛔ **may never appear in any position that computes `Authority`** — so no confidence value,
at any magnitude, creates **or removes** an authorized act.

**I5 · REPETITION AND ORDER ARE INERT.** `Authority'` is unchanged by re-submitting,
re-asking, re-sequencing or accumulating judgments. ⛔ *"Ask again until it agrees"* reaches
nothing. ⭐ Agreement between judgments is not evidence and confers no standing (ratified J5:
*model agreement remains evidence only*).

**I6 · NO DISCHARGE (A1).** Admitting any `J` leaves every governing requirement — review,
authority, gate, human provider-execution grant, disclosure grant — in exactly the state it
held under `Authority(s)`. ⛔ A Jev judgment may never mark anything *satisfied*, and
⛔ **may not satisfy a review requirement merely by being a Jev judgment.**

**I7 · ABSTENTION IS AUTHORITY-INERT (A3).** An abstention recommends return to the
governing non-Jev path. ⛔ It changes no authority state, is never assent, and is never
itself a route.

---

## 3 · EXACT SCHEMA

⛔ **A document, deliberately not committed source.** Landing this under `lib/**` or
`scripts/**` would be the first increment of the adapter, which is not authorized.

### 3.1 · `JudgmentPacket`

```text
JudgmentPacket := {
  packet_version          : "jev-2"                 // exact literal
  work_unit_ref           : OpaqueId                // /^[0-9a-f]{32}$/
  task_shape              : TaskShape               // §3.2 — BOUND to canonical J5.v1
  contains_sensitive      : Boolean                 // computed by the membrane, never by Jev
  requires_external_info  : Boolean
  change_scope            : ChangeScope
}

ChangeScope := {
  file_count  : Integer in [0, 10000]
  migration   : Boolean
  auth        : Boolean
  production  : Boolean
}
```

⛔ **REMOVED from J1R1** — `requested_effect`, `affected_surface`, `candidate_routes`.

⭐ **Every remaining field is a closed enum member, a bounded integer, a boolean, or an
opaque fixed-width id.** ⛔ No free string, no path, no name, no prose, no extension point.

### 3.2 · `TaskShape` — bound by exact blob, ⛔ not redefined here

> `TaskShape` is **exactly** the canonical `TASK_SHAPES` vocabulary of
> `scripts/builder/routing-intelligence-j5-v1.mjs`, `ROUTE_VERSION = 'J5.v1'`,
> **blob `e840d705c9c1059667379d321cc7b5c802045754`** (verified present at canonical
> `0691cd36…`):
>
> `CODE_GROUNDED` · `ARCHITECTURE_REASONING` · `ADVERSARIAL_FALSIFICATION` ·
> `LONG_HORIZON_DECOMPOSITION` · `EVIDENCE_SYNTHESIS` · `FRONTIER_UNKNOWN`

⛔ **J1 does not define, extend, reorder or reinterpret this vocabulary.** The members are
reproduced above for legibility only; **the blob is the binding**, and if the two ever
disagree the blob governs and this document is defective.

⚠️ If the parent lane changes `TASK_SHAPES`, this contract is **stale until rebound by a
governed act** — ⛔ it does not silently follow.

### 3.3 · ⛔ Fields removed for want of an exact canonical vocabulary

`requested_effect` and `affected_surface` are **removed**. A canonical-wide search at
`0691cd36…` found **no pre-existing vocabulary** for `RequestedEffect`, `requested_effect`,
`AffectedSurface` or `affected_surface` in `scripts/`, `lib/` or `jarvis-desktop/`.

⛔ **J1 will not invent parent-routing vocabulary.** ⭐ Inventing it here is the inversion
`J0R1` severed between J0 and J1, one layer down — the governed object defining the
vocabulary that governs it.

⚠️ **Bonus effect, stated rather than claimed as design credit:** removing `affected_surface`
also retires the J1R1 residual in which the packet disclosed Soullab's internal surface
taxonomy to whoever hosts Jev. ⛔ That was a consequence of the vocabulary ruling, not its
purpose, and ⛔ it does not mean the remaining packet is safe to send — the standing
2026-09-20 hold is untouched.

⭐ **OBSERVATION, ⛔ NOT USED AND NOT AUTHORIZED:** the same J5 file carries other exact
frozen vocabularies — `EVIDENCE_CLASSES` (`E0_TASK_TEXT` · `E1_REPOSITORY_LOCAL` ·
`E2_CONTINUITY_LOCAL` · `E3_EXTERNAL_REPO_BUNDLE` · `E4_SENSITIVE_OR_PRODUCTION`),
`MODEL_FAMILIES`, `REVIEW_PRESSURES`, `CHALLENGE_MODES`, `FRONTIER_POSTURES`. ⚠️
`EVIDENCE_CLASSES` may be the lawful successor to the `contains_sensitive` /
`requires_external_info` booleans. ⛔ **Not adopted here — no act authorizes it.** Recorded
so a later act can consider it deliberately rather than rediscover it.

### 3.4 · Judgment shapes — exactly three, closed

```text
Judgment := Score | YesNo | Abstain

Score   := { question_id: QuestionId, scale: { min: 0, max: 1 },
             score: Real in [0,1], confidence: Real in [0,1] }

YesNo   := { question_id: QuestionId, answer: Boolean,
             confidence: Real in [0,1] }

Abstain := { question_id: QuestionId, reason: AbstainReason }
             // ⛔ carries NO confidence — an abstention is not a weak judgment
```

⛔ **`Choice` is REMOVED.** Its only invariant was `choice ∈ options ⊆ packet.candidate_routes`,
and `candidate_routes` no longer exists — so `Choice` is not merely unused, it is
**unspecifiable**. ⭐ Retaining a shape with no satisfiable invariant would leave a dead slot
inviting `Q_ROUTE`'s silent return.

⭐ **`Abstain` carries no confidence**, so abstentions cannot be ranked against judgments —
*"it abstained, but only barely"* has nowhere to live.

### 3.5 · Questions — closed set of four

| `question_id` | shape | question | ⭐ asymmetry (binding) |
|---|---|---|---|
| `Q_DEPTH` | Score | How much deliberative reasoning does this require? | **high** may recommend more deliberation; **low** may never reduce an independently established floor |
| `Q_RISK` | YesNo | Does this appear to cross a structural-risk boundary? | **true** may recommend escalation; **false** changes no guard |
| `Q_SUFFICIENT` | YesNo | Is the supplied state sufficient to proceed without clarification? | **false** may recommend clarification; **true** discharges nothing |
| `Q_LLM_NEEDED` | YesNo | Is a generative model required at all? | **false** may recommend not using an optional model; **true** creates no model eligibility, authority, disclosure, route or execution permission |
| *(any)* | Abstain | — | recommends return to the governing non-Jev path; changes no authority state |

⛔ **`Q_ROUTE` is REMOVED.** Route identifiers were specified as opaque, and the packet
supplied no bounded facts describing any route — so Jev would have been asked which of
`route_a` / `route_b` / `route_c` "best fits". ⭐ **If the identifiers are truly opaque it
cannot distinguish them; if they encode route semantics they are not opaque.** ⛔ The defect
is not repaired by widening the external packet. Route-choice advice stays outside this
contract until a bounded route-option representation has its own governed definition.

⛔ **No question may ask Jev about Jev** (A6): not its own eligibility, not whether a hold
applies, not whether its confidence suffices, not whether it should have been invoked.

### 3.6 · J1-owned vocabularies — enumerated **here**, exhaustively

⭐ Parent-law independence forbids J1 defining the **parent's** vocabulary. ⛔ It does **not**
forbid J1 owning its **own response vocabulary** — and `AbstainReason` is J1 response
vocabulary, never parent-routing vocabulary. J1R1 applied the principle too broadly.

```text
QuestionId    := Q_DEPTH | Q_RISK | Q_SUFFICIENT | Q_LLM_NEEDED

AbstainReason := NO_RESPONSE        // nothing returned
               | TIMEOUT            // deadline passed
               | PARSE_FAILURE      // not well-formed
               | UNKNOWN_SHAPE      // well-formed, not a declared shape
               | OUT_OF_RANGE       // shape ok, invariant violated
               | MISMATCHED_QUESTION// answered a question other than the one asked
               | INSUFFICIENT_STATE // model declined for want of state
               | REFUSED            // model declined
```

### 3.7 · Host-bound response admission

```text
admit(expected_question_id, response_or_failure) :=

  response_or_failure is a well-formed Score or YesNo
    ∧ its question_id = expected_question_id
    ∧ its shape = the shape declared for expected_question_id in §3.5
    ∧ all range invariants hold
      → that Judgment

  response_or_failure is a well-formed Abstain
    ∧ its question_id = expected_question_id
      → that Abstain                    // ⭐ Abstain is admissible for EVERY question

  otherwise
      → Abstain{ question_id: expected_question_id, reason: <mapped per §3.6> }
```

⭐⭐ **Admission is host-bound, and this repairs two J1R1 defects at once.**

1. J1R1's `admit(response)` required *"shape matches the question's declared shape"*, and the
   table declared only `Choice`/`Score`/`YesNo` — so **read literally it rejected the very
   `Abstain` the contract said was legal on every question.** The two clauses contradicted.
2. ⛔ An **absent, timed-out or unparseable** response **cannot supply a `question_id`**, so
   J1R1's fallback `Abstain{ question_id, … }` had no lawful source for that field — it
   would have had to fabricate a response identity.

⭐ **The host already knows which question it asked.** The expected id is therefore supplied
by the host, never recovered from the failure. ⛔ **No response identity is ever fabricated.**

### 3.8 · Shape rule — mechanically checkable (`repository_derived_metadata`)

A packet conforms **iff every field** is a closed enum member, a boolean, a bounded integer,
a bounded real, an opaque fixed-width id, or an array of those. ⛔ Any free string, path,
filename, symbol, commit message, prose fragment or extension field is a class violation —
detectable by a guard, ⛔ not by review.

⛔ Naming the class neither adds it to the capability table nor grants it to any provider.

### 3.9 · Membrane ordering (A5)

```text
eligibility decision → (pass) → packet construction → outbound representation
```

⛔ On refusal the prospective representation is **not constructed, not logged, not hashed,
not cached, not digested.** *A refusal is not an occasion to disclose.*

---

## 4 · REQUIRED FALSIFIERS — ⛔ none built, none run (step 12)

| candidate | embodies | must fail |
|---|---|---|
| ⭐ `DC-REMOVES-AUTHORIZED-ACT` | **a judgment makes an otherwise-authorized act unavailable** | **I1 / A7** |
| `DC-ADDS-AUTHORIZED-ACT` | a judgment creates an act not in `Authority(s)` | I1 |
| `DC-ADVICE-FEEDS-AUTHORITY` | an `Advice` value is read when computing `Authority` | I2 |
| `DC-REMOVAL-CHANGES-LATTICE` | deleting Jev changes an authority outcome | I3 / A7 |
| `DC-CONFIDENCE-TOUCHES-AUTHORITY` | confidence appears in an authority computation | I4 / A2 |
| `DC-REPLAY-ACCUMULATES` | re-submitting widens or narrows authority | I5 |
| `DC-AGREEMENT-IS-STANDING` | two agreeing judgments confer standing | I5 / J5 |
| `DC-DISCHARGES-REVIEW` | a judgment marks a review requirement satisfied | I6 / A1 |
| `DC-ABSTAIN-MOVES-AUTHORITY` | an abstention changes an authority state | I7 / A3 |
| `DC-FALSE-LOWERS-GUARD` | `Q_RISK=false` lowers a guard | §3.5 |
| `DC-LOW-DEPTH-LOWERS-FLOOR` | low `Q_DEPTH` reduces an established deliberation floor | §3.5 |
| `DC-LLM-TRUE-GRANTS` | `Q_LLM_NEEDED=true` creates model eligibility or route permission | §3.5 |
| `DC-FABRICATED-QUESTION-ID` | a timeout yields an `Abstain` with a recovered id | §3.7 |
| `DC-ABSTAIN-REJECTED` | `Abstain` refused because it is not the declared shape | §3.7 |
| `DC-FREE-STRING` | an extension field carries prose past the shape rule | §3.8 |
| `DC-SELF-STANDING` | a question asks whether Jev should be used | A6 |
| `DC-REFUSAL-LOGS-PACKET` | the membrane logs the representation it refused | A5 / §3.9 |
| `DC-TASKSHAPE-DRIFT` | `TaskShape` diverges from the bound blob and is silently followed | §3.2 |

⛔ **If a candidate survives, the repair is the SUITE, never the candidate.**

⚠️⚠️ **This table is an obligation, ⛔ not evidence.** ⛔ Per step 12, **no falsifier is built
and no matrix is run in this act.** ⛔ Lethality is **NOT** demonstrated. ⛔ This contract must
not be ratified on the strength of tests that do not exist.

⭐ **Note on why `DC-REMOVES-AUTHORIZED-ACT` leads the table:** a suite that only catches
authority *enlargement* is insufficient under A7, and J1R1 would have passed such a suite
while contradicting the constitution.

---

## 5 · ⛔ WHAT THIS CANDIDATE DOES NOT DO

⛔ Not ratified · ⛔ does not amend J0 or its blob · ⛔ does not annotate embedded §3 · ⛔ does
not open the status/custody index · ⛔ does not open J2 · ⛔ does not edit
`PROVIDER_GOVERNANCE.md` or the capability table · ⛔ does not add
`repository_derived_metadata` to any table · ⛔ does not adopt `EVIDENCE_CLASSES` · ⛔ does
not admit TypeSafe/Jev as a provider · ⛔ does not authorize disclosure, network use,
external inference, provider transport or provider spend · ⛔ does not construct, log, hash,
cache or send a representation · ⛔ does not build an adapter · ⛔ does not change routing
runtime or `TASK_SHAPES` · ⛔ does not build or run falsifiers · ⛔ no merge · ⛔ no deploy ·
⛔ production untouched.

⛔ **The 2026-09-20 dev-lane interim hold remains operative, both lift conditions
undischarged.** ⛔ Jev remains external, advisory-only, the automatic fast path withdrawn,
and ⛔ must not be described as a fast path or automatic path.

---

## 6 · STANDING

```text
J0 Constitution         RATIFIED · CANONICAL · IMMUTABLE @ blob 494cd619
embedded §3             HISTORICAL CANDIDATE ONLY · ⛔ no standing
J1R1                    RETURNED · superseded as candidate · historical
J1R2 (this document)    CANDIDATE · NOT RATIFIED · sole object of J1 adjudication
TaskShape binding       J5.v1 @ blob e840d705 · verified at canonical 0691cd36
Falsifier suite         OWED · ⛔ NOT BUILT (step 12) · lethality ⛔ NOT DEMONSTRATED
status/custody index    NAMED · ⛔ NOT OPENED
J2                      NOT OPEN
ADAPTER                 NOT AUTHORIZED
PROVIDER EXECUTION      NOT OPENED
capability table        UNCHANGED
```

⭐ *Jev may change what JARVIS thinks is prudent. It may not change what JARVIS is permitted
to do. Authority is invariant under every judgment; only advice moves.*
