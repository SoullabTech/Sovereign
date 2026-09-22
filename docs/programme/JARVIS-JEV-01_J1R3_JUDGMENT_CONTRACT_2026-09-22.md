# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R3
## Jev Judgment Contract — closed outbound representation + construction-failure law

**Status:** ⛔ **CANDIDATE. NOT RATIFIED.** Produced under founder adjudication 2026-09-22:
**J1R2 RETURNED**, repair `J1R3` authorized (documentary repair only).
**Supersedes as candidate:** `J1R2` (commit `d7b1098e…`, blob `bb2c1c82…`) — historical.
**Bound to canonical at construction:** `0691cd3668c1ba0312e3578d5264a8b1abf90ec3`
**J0 blob verified before mutation:** `494cd61973ed02c4453067716657631f3f9143e9` ✅
**Branch:** `claude/sovereign-governance-review-s8skj2`

**Governing law:** the ratified **J0 constitution**, §7 of the canonical J0 document.
⭐ **J0 constrains J1; J1 contributes nothing to the meaning of J0.**

> ⭐⭐ **Jev may change what JARVIS thinks is prudent. It may not change what JARVIS is
> permitted to do.**
>
> ⭐⭐ **A protocol selector is not a prompt. A boundary is not a rounding error.**

---

## 0 · DISPOSITION AND SEQUENCING

```text
J1R2 RETURNED
      ↓
J1R3 documentary repair        ← THIS ACT
      ↓
STOP
      ↓
defeat-candidate / falsifier suite
      ↓
only after lethal evidence:
J1 adjudication
```

**Carried forward from J1R2 UNCHANGED** (⛔ not reopened, ⛔ not silently edited): the
separate address; authority-invariant semantics **I1–I7**; the `TaskShape` blob binding; the
removal of `requested_effect`, `affected_surface`, `candidate_routes`, `Q_ROUTE` and the
`Choice` shape; the four questions and their asymmetries; the J1-owned vocabularies; the
host-bound admission rule; the membrane ordering.

**REPAIRED HERE — two laws J1R2 left unstated:**
1. §4 — the **outbound representation** was referenced once, in an ordering diagram, and
   **never defined**. A representation with no declared contents cannot be constrained.
2. §5 — the packet declared **bounded domains with no rule for what happens when a real
   value falls outside them.** Silence there is an invitation to make the value fit.

⚠️ **Provenance note — second occurrence, recorded as signal.** This message, like the one
directing `J1R2`, referred to an act text "as written" and to formatting "in your pasted
message"; **no such act was drafted in this session.** Both repairs below were instead
derived from the two substantive constraints the message states directly, plus my own
re-reading of `J1R2`. ⛔ Nothing else was inferred. ⭐ Twice now suggests messages may be
going missing between us; worth checking rather than working around.

---

## 1 · AUTHORITY-INVARIANT ADVISORY SEMANTICS *(carried from J1R2, unchanged)*

Two disjoint domains, ⛔ never merged:

```text
AUTHORITY DOMAIN                    ADVICE DOMAIN
authority lattice                   preference
available authorized acts           recommended deliberation depth
prohibited acts                     escalation recommendation
governing requirements              clarification recommendation
derivability of authority gates     model-necessity recommendation

INVARIANT under every J              MAY be altered by J
```

**I1 · AUTHORITY INVARIANCE.** For every state `s` and admitted judgment set `J`:

```text
Authority'(s, J)      = Authority(s)
AvailableActs'(s, J)  = AvailableActs(s)
Prohibited'(s, J)     = Prohibited(s)
Requirements'(s, J)   = Requirements(s)
```

⭐ **Equality, ⛔ not subset.** Jev may neither **create nor remove** an authorized act.

**I2 · ADVICE IS THE ONLY MUTABLE OUTPUT.** ⛔ Nothing in `Advice` is an input to `Authority`.
**I3 · ABSENCE IS THE IDENTITY (A7).** Removing Jev changes no authority outcome.
**I4 · CONFIDENCE IS ADVICE-ONLY (A2).** ⛔ Never in any position computing `Authority`.
**I5 · REPETITION AND ORDER ARE INERT.** ⛔ *"Ask again until it agrees"* reaches nothing;
agreement confers no standing (ratified J5).
**I6 · NO DISCHARGE (A1).** ⛔ Never marks a requirement satisfied; ⛔ never satisfies a review
requirement merely by being a Jev judgment.
**I7 · ABSTENTION IS AUTHORITY-INERT (A3).**

---

## 2 · `JudgmentPacket` *(carried from J1R2, unchanged)*

```text
JudgmentPacket := {
  packet_version          : "jev-2"                 // exact literal
  work_unit_ref           : OpaqueId                // /^[0-9a-f]{32}$/
  task_shape              : TaskShape               // §3 — BOUND to canonical J5.v1
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

⭐ Every field is a closed enum member, bounded integer, boolean, or opaque fixed-width id.
⛔ No free string, no path, no name, no prose, no extension point.

---

## 3 · `TaskShape` — bound by exact blob *(carried from J1R2, unchanged)*

> Exactly the canonical `TASK_SHAPES` of `scripts/builder/routing-intelligence-j5-v1.mjs`,
> `ROUTE_VERSION = 'J5.v1'`, **blob `e840d705c9c1059667379d321cc7b5c802045754`** (verified
> present at canonical `0691cd36…`):
> `CODE_GROUNDED` · `ARCHITECTURE_REASONING` · `ADVERSARIAL_FALSIFICATION` ·
> `LONG_HORIZON_DECOMPOSITION` · `EVIDENCE_SYNTHESIS` · `FRONTIER_UNKNOWN`

⛔ J1 does not define, extend, reorder or reinterpret this vocabulary. **The blob is the
binding**; members are reproduced for legibility only. ⚠️ If the parent changes
`TASK_SHAPES`, this contract is **stale until rebound by a governed act** — ⛔ it does not
silently follow.

---

## 4 · ⭐⭐ THE OUTBOUND REPRESENTATION — closed, and `question_id` is a SELECTOR

### 4.1 · Exact definition

```text
OutboundRepresentation := {
  packet       : JudgmentPacket      // §2, exactly
  question_id  : QuestionId          // §6, exactly — a closed protocol selector
}
```

⛔ **There is nothing else.** The representation has exactly two members.

### 4.2 · ⛔ `question_id` is NOT a prompt channel

`question_id` selects which of four fixed questions is being asked. ⭐ **It is a closed
protocol selector, nothing more.**

⛔ **The representation may NEVER acquire**, under any name:

```text
question_text · instructions · context · reason · rationale · prompt
system · examples · hint · description · note · comment · metadata
guidance · criteria · background · justification
```

⛔ Nor any field not named in §4.1, whatever it is called.

### 4.3 · ⭐ The line, stated precisely so it cannot be fudged

The adapter **may** hold the fixed semantics of `Q_DEPTH`, `Q_RISK`, `Q_SUFFICIENT` and
`Q_LLM_NEEDED`. Such fixed wording is **adapter configuration**: constant across every
packet, independent of any work unit, reviewable in one place, and ⛔ **not part of the
representation.**

> ⭐⭐ **THE RULE: nothing that varies with the work unit may be prose.**

- A constant the adapter holds for all packets → ⭐ adapter configuration, governed as such.
- A value that changes with the work unit → ⛔ must be a closed enum member, a bounded
  numeric, a boolean, or an opaque id — **never characters chosen to describe this case.**

⚠️ **This is the seam the prohibition exists to protect.** A per-request `reason` or
`context` field is exactly how authored material re-enters an outbound representation that
was designed to carry none — ⛔ and it arrives looking helpful.

### 4.4 · Consequence for A4 and A5

⛔ The representation contains no member message, repository source or prose, canon or
constitutional text, prior turns, or free-text justification (A4). ⛔ It is constructed only
after the eligibility membrane passes (A5).

---

## 5 · ⭐⭐ CONSTRUCTION FAILURE IS A BOUNDARY EVENT

### 5.1 · The law

> **If any value required by §2 cannot be expressed exactly within its declared domain,
> construction FAILS and NO representation is constructed.**

⭐ **The schema's inability to express something is a boundary event, ⛔ not an invitation to
compress it until it fits.**

### 5.2 · ⛔ FORBIDDEN repairs — each named, because each looks reasonable in the moment

Given a work unit touching 15,000 files, ⛔ the lawful result is **no representation**. It is
⛔ **not**:

| forbidden repair | example |
|---|---|
| clamping / saturating | `file_count: 10000` |
| stringifying | `">10000"`, `"many"`, `"large"` |
| bucketing / bracketing | `"10000+"`, `"XL"` |
| hashing or digesting the value | any fingerprint of the true count |
| a locally invented enum member | `FILE_COUNT_OVERFLOW`, `TASK_SHAPE_OTHER` |
| omitting the field | packet without `change_scope.file_count` |
| substituting a default | `file_count: 0` |
| ⭐ splitting the work unit to fit | reshaping the **subject** to satisfy the instrument |

⚠️ The last is the subtlest and the most damaging: it changes what is being judged in order
to make it judgeable, and leaves a conforming packet describing something that did not
happen.

### 5.3 · What construction failure IS

- ⭐ **Authority is untouched.** By **I1**, `Authority'(s) = Authority(s)`. A failure to
  construct removes no act, creates none, and discharges nothing.
- ⭐ **The governing non-Jev path proceeds unchanged.** The work unit is not blocked; it
  simply receives no Jev advice.
- ⛔ **The failure is not reported outward.** Nothing is sent, so nothing can be.
- ⛔ **The offending value is not logged, hashed, cached or digested** (A5, §4.4) — *a
  refusal is not an occasion to disclose*, and that binds the failure record as much as the
  representation.

### 5.4 · ⭐⭐ CONSTRUCTION FAILURE IS NOT AN ABSTENTION

⛔ **These must never be collapsed**, though both end at the governing non-Jev path:

```text
ABSTENTION             a representation WAS sent; a question WAS asked;
                       no usable judgment came back          (§7)

CONSTRUCTION FAILURE   no representation was sent; no question was asked;
                       no provider was consulted             (§5)
```

⚠️ Recording a construction failure as an abstention would make the record say **a model
declined when no model was consulted** — a fabricated provider interaction, and exactly the
class of false record this programme has spent the day removing.

⭐ Consequently `AbstainReason` (§6) contains **no member for construction failure**, and
⛔ none may be added: the vocabulary of *responses* must not be able to describe an event in
which nothing was asked.

### 5.5 · Applies to every bounded field

Same law for: `work_unit_ref` failing `/^[0-9a-f]{32}$/`; a `task_shape` not in the bound
`TASK_SHAPES` blob; `file_count` outside `[0, 10000]`; any non-boolean in a boolean
position; any value of `packet_version` other than `"jev-2"`.

---

## 6 · Judgment shapes and J1-owned vocabularies *(carried from J1R2, unchanged)*

```text
Judgment := Score | YesNo | Abstain

Score   := { question_id: QuestionId, scale: { min: 0, max: 1 },
             score: Real in [0,1], confidence: Real in [0,1] }
YesNo   := { question_id: QuestionId, answer: Boolean,
             confidence: Real in [0,1] }
Abstain := { question_id: QuestionId, reason: AbstainReason }
             // ⛔ carries NO confidence — an abstention is not a weak judgment

QuestionId    := Q_DEPTH | Q_RISK | Q_SUFFICIENT | Q_LLM_NEEDED

AbstainReason := NO_RESPONSE | TIMEOUT | PARSE_FAILURE | UNKNOWN_SHAPE
               | OUT_OF_RANGE | MISMATCHED_QUESTION | INSUFFICIENT_STATE | REFUSED
```

⛔ `Choice` remains removed — its only invariant referenced `candidate_routes`, so it is
**unspecifiable**, not merely unused.

| `question_id` | shape | question | ⭐ asymmetry (binding) |
|---|---|---|---|
| `Q_DEPTH` | Score | How much deliberative reasoning does this require? | **high** may recommend more deliberation; **low** may never reduce an independently established floor |
| `Q_RISK` | YesNo | Does this appear to cross a structural-risk boundary? | **true** may recommend escalation; **false** changes no guard |
| `Q_SUFFICIENT` | YesNo | Is the supplied state sufficient to proceed without clarification? | **false** may recommend clarification; **true** discharges nothing |
| `Q_LLM_NEEDED` | YesNo | Is a generative model required at all? | **false** may recommend not using an optional model; **true** creates no model eligibility, authority, disclosure, route or execution permission |

⛔ No question may ask Jev about Jev (A6).

---

## 7 · Host-bound response admission *(carried from J1R2, unchanged)*

```text
admit(expected_question_id, response_or_failure) :=

  well-formed Score or YesNo
    ∧ question_id = expected_question_id
    ∧ shape = the shape declared for expected_question_id in §6
    ∧ all range invariants hold                → that Judgment

  well-formed Abstain
    ∧ question_id = expected_question_id       → that Abstain

  otherwise → Abstain{ question_id: expected_question_id, reason: <mapped, §6> }
```

⭐ The host supplies the expected id; ⛔ **no response identity is ever fabricated.**
⭐ `Abstain` is admissible for **every** question.

---

## 8 · Membrane ordering and shape rule *(carried from J1R2, unchanged)*

```text
eligibility decision → (pass) → packet construction → outbound representation
                              ↘ (any §5 failure) → NOTHING CONSTRUCTED
```

⛔ On refusal or construction failure the prospective representation is **not constructed,
not logged, not hashed, not cached, not digested.**

A packet conforms **iff every field** is a closed enum member, boolean, bounded integer,
bounded real, or opaque fixed-width id. ⛔ Any free string, path, filename, symbol, commit
message, prose fragment or extension field is a class violation — detectable by a guard,
⛔ not by review. ⛔ Naming the class `repository_derived_metadata` neither adds it to the
capability table nor grants it to any provider.

---

## 9 · REQUIRED FALSIFIERS — ⛔ none built, none run

**Carried from J1R2:** `DC-REMOVES-AUTHORIZED-ACT` · `DC-ADDS-AUTHORIZED-ACT` ·
`DC-ADVICE-FEEDS-AUTHORITY` · `DC-REMOVAL-CHANGES-LATTICE` ·
`DC-CONFIDENCE-TOUCHES-AUTHORITY` · `DC-REPLAY-ACCUMULATES` · `DC-AGREEMENT-IS-STANDING` ·
`DC-DISCHARGES-REVIEW` · `DC-ABSTAIN-MOVES-AUTHORITY` · `DC-FALSE-LOWERS-GUARD` ·
`DC-LOW-DEPTH-LOWERS-FLOOR` · `DC-LLM-TRUE-GRANTS` · `DC-FABRICATED-QUESTION-ID` ·
`DC-ABSTAIN-REJECTED` · `DC-FREE-STRING` · `DC-SELF-STANDING` · `DC-REFUSAL-LOGS-PACKET` ·
`DC-TASKSHAPE-DRIFT`

**Added by J1R3:**

| candidate | embodies | must fail |
|---|---|---|
| `DC-PROSE-IN-REPRESENTATION` | representation gains a `reason`/`context` field | §4.1 |
| `DC-QUESTION-TEXT` | `question_id` accompanied by `question_text` | §4.2 |
| `DC-VARYING-INSTRUCTION` | adapter wording that changes with the work unit | §4.3 |
| `DC-EXTRA-MEMBER` | a third member added to the representation | §4.1 |
| ⭐ `DC-CLAMP-ON-OVERFLOW` | `file_count` 15000 sent as 10000 | §5.2 |
| `DC-STRINGIFY-OVERFLOW` | `">10000"` or `"many"` | §5.2 |
| `DC-BUCKET-OVERFLOW` | `"10000+"` / `"XL"` | §5.2 |
| `DC-HASH-OVERFLOW` | a digest of the true value | §5.2 |
| `DC-LOCAL-OVERFLOW-ENUM` | `FILE_COUNT_OVERFLOW` invented in J1 | §5.2 |
| `DC-DEFAULT-SUBSTITUTION` | unrepresentable value replaced by a default | §5.2 |
| ⭐ `DC-SPLIT-TO-FIT` | work unit reshaped so the packet conforms | §5.2 |
| ⭐ `DC-FAILURE-AS-ABSTENTION` | construction failure recorded as an abstention | §5.4 |
| `DC-FAILURE-LOGS-VALUE` | the offending value logged or hashed | §5.3 |
| `DC-FAILURE-CHANGES-AUTHORITY` | a construction failure blocks an authorized act | §5.3 / I1 |
| `DC-UNBOUND-TASKSHAPE` | a shape outside the bound blob coerced to a member | §5.5 |

⛔ **If a candidate survives, the repair is the SUITE, never the candidate.**

⚠️⚠️ **This table is an obligation, ⛔ not evidence.** ⛔ **No falsifier is built and no matrix
is run in this act.** ⛔ Lethality is **NOT** demonstrated. ⛔ This contract must not be
ratified on the strength of tests that do not exist.

---

## 10 · ⛔ WHAT THIS CANDIDATE DOES NOT DO

⛔ Not ratified · ⛔ does not amend J0 or its blob · ⛔ does not annotate embedded §3 · ⛔ does
not open the status/custody index · ⛔ does not open J2 · ⛔ does not edit
`PROVIDER_GOVERNANCE.md` or the capability table · ⛔ does not adopt `EVIDENCE_CLASSES` ·
⛔ does not admit TypeSafe/Jev as a provider · ⛔ does not authorize disclosure, network use,
external inference, provider transport or provider spend · ⛔ does not construct, log, hash,
cache or send a representation · ⛔ does not build an adapter or adapter configuration ·
⛔ does not change routing runtime or `TASK_SHAPES` · ⛔ does not build or run falsifiers ·
⛔ no merge · ⛔ no deploy · ⛔ production untouched.

⛔ **The 2026-09-20 dev-lane interim hold remains operative, both lift conditions
undischarged.** ⛔ Jev remains external, advisory-only, the automatic fast path withdrawn,
and ⛔ must not be described as a fast path or automatic path.

---

## 11 · STANDING

```text
J0 Constitution         RATIFIED · CANONICAL · IMMUTABLE @ blob 494cd619
embedded §3             HISTORICAL CANDIDATE ONLY · ⛔ no standing
J1R1 · J1R2             RETURNED · superseded as candidates · historical
J1R3 (this document)    CANDIDATE · NOT RATIFIED · sole object of J1 adjudication
TaskShape binding       J5.v1 @ blob e840d705 · verified at canonical 0691cd36
Falsifier suite         OWED · ⛔ NOT BUILT · lethality ⛔ NOT DEMONSTRATED
status/custody index    NAMED · ⛔ NOT OPENED
J2                      NOT OPEN
ADAPTER                 NOT AUTHORIZED
PROVIDER EXECUTION      NOT OPENED
capability table        UNCHANGED
```

⭐ *A protocol selector is not a prompt. A boundary is not a rounding error. And a packet
that was never built is not a model that declined.*
