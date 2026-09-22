# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R4
## Jev Judgment Contract — abstention provenance + schema exactness

**Status:** ⛔ **CANDIDATE. NOT RATIFIED.** Produced under founder adjudication 2026-09-22:
**J1R3 RETURNED**, repair `J1R4 — ABSTENTION PROVENANCE + SCHEMA EXACTNESS` authorized
(documentary repair only).

**Supersedes as candidate:** `J1R3` (commit `474bca3f…`, blob `dfd422d3…`) — preserved as
historical candidate evidence, ⛔ not edited. Earlier: `J1R1`, `J1R2`, and a non-conforming
first attempt at `J1R3` (blob `60366f5f…`), all historical with ⛔ no candidate standing.
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
J1R3 RETURNED
      ↓
J1R4 documentary repair        ← THIS ACT
      ↓
STOP
      ↓
defeat-candidate / falsifier suite
      ↓
only after lethal evidence:
J1 adjudication
```

**Carried forward from J1R2 UNCHANGED** (⛔ not reopened, ⛔ not silently edited): the
separate address; authority invariance **I1–I4, I6, I7**; the `TaskShape` blob binding; the
removal of `requested_effect`, `affected_surface`, `candidate_routes`, `Q_ROUTE` and the
`Choice` shape; the four questions and their asymmetries; the J1-owned vocabularies; the
membrane ordering.

**ACCEPTED FROM J1R3 AND ⛔ NOT REOPENED:** removal of Jev-visible `work_unit_ref` ·
`question_id` inside the exact packet · packet-bound response admission · deterministic host
failure precedence · I5 agreement as advisory evidence only · advice surface as the exact
image of the question set · the construction-refusal law · the separation of construction
failure from abstention · no wrapper or envelope · J0 immutability · falsifier-first
sequencing · removal of the `Choice` shape.

**REPAIRED HERE — one substantive and three exactness defects found in J1R3:**

| # | Defect | Repair |
|---|---|---|
| ⭐⭐ 1 | **a provider could FORGE a host-observed failure** — `AbstainReason` was one flat enum and a matching `Abstain` was admitted directly, so `{Q_RISK, TIMEOUT}` was lawful with no host failure at all | §6, §7 — **provenance split**; the provider may never originate a `HostFailureReason` |
| 2 | *"Jev sees no identifier of any kind"* — too broad; the packet contains `question_id` | §2.1 — exact claim substituted |
| 3 | the cardinality / decidability claim was **false** | §2.1 — **withdrawn**; only the supported privacy rationale kept |
| 4 | `DC-EXTRA-MEMBER` said *"a third member"* — stale arithmetic | §9 — **any member not in the six-member exact packet** |

⚠️⚠️ **Provenance note — THIRD occurrence, and it caused a real defect.** Three successive
directing messages referred to act texts "as written", to formatting "in your pasted
message", and to a seven-item ruling on `J1R2` — **none of which reached this session.** The
first attempt at `J1R3` was written from the two constraints that *were* stated directly and
consequently addressed **one of seven** ruled defects. ⭐ This is no longer a formatting
curiosity: **content is being lost between us, and it has already produced a non-conforming
candidate.** ⛔ Recorded rather than routed around.

---

## 1 · AUTHORITY-INVARIANT ADVISORY SEMANTICS *(carried from J1R2, unchanged)*

Two disjoint domains, ⛔ never merged:

```text
AUTHORITY DOMAIN                    ADVICE DOMAIN
authority lattice                   recommended deliberation depth   (Q_DEPTH)
available authorized acts           escalation recommendation        (Q_RISK)
prohibited acts                     clarification recommendation     (Q_SUFFICIENT)
governing requirements              model-necessity recommendation   (Q_LLM_NEEDED)
derivability of authority gates

INVARIANT under every J              MAY be altered by J
```

⭐⭐ **The advice surface is EXACTLY the image of the question set — one member per
question, no more.** ⛔ `recommended route` and a generic `preference` are **removed**: the
first died with `Q_ROUTE`, and the second is an unbounded surface with no question behind
it. ⭐ Stating the advice domain as the image of the questions makes a dead or unbounded
advice surface **structurally impossible** rather than merely absent today — a new advice
member now requires a new question, which requires a governed act.

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
**I5 · REPETITION AND ORDER ARE INERT; AGREEMENT IS ADVISORY EVIDENCE, NEVER AUTHORITY.**
`Authority'` is unchanged by re-submitting, re-asking, re-sequencing or accumulating
judgments. ⛔ *"Ask again until it agrees"* reaches nothing.
⭐ **Agreement between two or more judgments is advisory evidence only.** It may inform
`Advice`; ⛔ it may never enter `Authority`, satisfy a review requirement, substitute for an
independent second opinion, or confer standing of any kind — ratified J5: *a retry is not an
independent second opinion*, and *model agreement remains evidence only and may never create
merge, deployment, production, constitutional, or founder authority.*
**I6 · NO DISCHARGE (A1).** ⛔ Never marks a requirement satisfied; ⛔ never satisfies a review
requirement merely by being a Jev judgment.
**I7 · ABSTENTION IS AUTHORITY-INERT (A3).**

---

## 2 · `JudgmentPacket` — ⭐ REPAIRED (defects 1 and 2)

```text
JudgmentPacket := {
  packet_version          : "jev-3"                 // exact literal
  question_id             : QuestionId              // §6 — closed protocol selector
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

⭐ Every field is a closed enum member, bounded integer, or boolean. ⛔ No free string, no
path, no name, no prose, no identifier, no extension point.

### 2.1 · ⭐⭐ `work_unit_ref` is REMOVED — the packet carries NO identity (defect 1)

> ⭐ **The representation carries no Work Unit, request, session, member, or other
> correlation identifier.** `question_id` remains a closed protocol selector and is ⛔ not a
> correlation handle.

**The supported rationale, and the whole of it:** a stable opaque Work Unit identifier
creates **cross-request linkability even when it reveals no content** — a provider holding
one can link requests across time, count them, order them, and assemble a profile of
Soullab's activity **without ever reading a single content field.** ⛔ Therefore it does not
cross the boundary.

⭐ **Correlation is a host-side concern and must not travel.** The host pairs a response to
its request through its own transport context; ⛔ nothing in the representation exists to
help anyone else do so.

⚠️ **TWO CLAIMS MADE IN J1R3 ARE WITHDRAWN AS FALSE, ⛔ not softened:**

1. *"Jev sees no identifier of any kind"* — **too broad.** The packet contains
   `question_id`. The exact claim is the quoted one above.
2. *"this removed the last unbounded field and thereby made the shape guard decidable"* —
   **false twice over.** `work_unit_ref` was constrained to `/^[0-9a-f]{32}$/`, so its domain
   was already **finite** (`16^32` values); and ⭐ **finite cardinality is not what makes a
   validator decidable** — infinite languages are routinely decidable.

⭐ *The privacy argument never needed either claim, and stating them made a sound conclusion
rest on unsound support.*

### 2.2 · ⭐ `question_id` is IN the packet (defect 2)

The question being asked is a **member of the packet**, not a sibling travelling beside it.
⭐ **The packet IS the outbound representation** (§4) — one object, one boundary, one thing to
guard. ⛔ A wrapper around the packet would be a second surface with its own admissible
fields, and that is where an `instructions` member appears three months later.

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
OutboundRepresentation := JudgmentPacket      // §2, exactly — nothing wraps it
```

⭐⭐ **The representation IS the packet.** ⛔ There is no envelope, no wrapper, no sibling
field, and no second object. The six members of §2 are the whole of what leaves the
boundary.

### 4.2 · ⛔ `question_id` is NOT a prompt channel

`question_id` selects which of four fixed questions is being asked. ⭐ **It is a closed
protocol selector, nothing more.**

⛔ **The representation may NEVER acquire**, under any name:

```text
question_text · instructions · context · reason · rationale · prompt
system · examples · hint · description · note · comment · metadata
guidance · criteria · background · justification
```

⛔ Nor any member not named in §2, whatever it is called.

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

⭐ Consequently **neither** `ModelAbstainReason` **nor** `HostFailureReason` (§6.2) contains a
member for construction failure, and ⛔ none may be added to either: an abstention presupposes
a representation that was sent, and the vocabulary of *responses* must not be able to
describe an event in which nothing was asked. ⛔ A construction failure is also not a
`HostFailureReason` — those are facts about an interaction that **occurred**.

### 5.5 · Applies to every bounded field

Same law for: a `question_id` not in the closed set of §6; a `task_shape` not in the bound
`TASK_SHAPES` blob; `file_count` outside `[0, 10000]`; any non-boolean in a boolean
position; any value of `packet_version` other than `"jev-3"`.

---

## 6 · Judgment shapes and J1-owned vocabularies *(carried from J1R2, unchanged)*

### 6.1 · ⭐⭐ TWO UNIONS, NOT ONE — what a provider may SAY vs what a host may RECORD

```text
ProviderResponse  := Score | YesNo | ProviderAbstain      // what may come back
AdmittedJudgment  := Score | YesNo | AdmittedAbstain      // what may be recorded

Score   := { question_id: QuestionId, scale: { min: 0, max: 1 },
             score: Real in [0,1], confidence: Real in [0,1] }
YesNo   := { question_id: QuestionId, answer: Boolean,
             confidence: Real in [0,1] }

ProviderAbstain := { question_id: QuestionId, reason: ModelAbstainReason }
AdmittedAbstain := { question_id: QuestionId, reason: AdmittedAbstainReason }
             // ⛔ neither carries confidence — an abstention is not a weak judgment

QuestionId := Q_DEPTH | Q_RISK | Q_SUFFICIENT | Q_LLM_NEEDED
```

### 6.2 · ⭐⭐ ABSTENTION PROVENANCE — the host is the sole author of host facts

```text
HostFailureReason :=            // ⛔ ONLY the host may originate these
    TIMEOUT
  | NO_RESPONSE
  | PARSE_FAILURE
  | UNKNOWN_SHAPE
  | MISMATCHED_QUESTION
  | OUT_OF_RANGE

ModelAbstainReason :=           // ⭐ the provider may originate these
    INSUFFICIENT_STATE
  | REFUSED

AdmittedAbstainReason :=        // what may appear in the record
    HostFailureReason
  | ModelAbstainReason
```

⭐⭐ **THE DEFECT THIS REPAIRS.** J1R3 had one flat `AbstainReason` and admitted a
well-formed matching `Abstain` **directly**. A provider could therefore lawfully return
`{ question_id: Q_RISK, reason: TIMEOUT }` or `{ question_id: Q_DEPTH, reason:
PARSE_FAILURE }` **with no host failure of any kind**, and the host would record it as the
host fact it names.

⚠️ **The precedence rule of §7.2 did not catch this**, and could not: precedence orders
*actual* host observations against each other. Here there was **no host observation to
order** — the model simply asserted one. ⛔ A rule about which true fact wins cannot detect a
fabricated fact.

⭐ **`TIMEOUT`, `NO_RESPONSE`, `PARSE_FAILURE`, `UNKNOWN_SHAPE`, `MISMATCHED_QUESTION` and
`OUT_OF_RANGE` are propositions about the host's own interaction with the provider.** Only
the host can observe them; ⛔ therefore only the host may author them. A response claiming one
is making a claim about a thing it cannot see.

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

## 7 · Response admission — ⭐ REPAIRED (defects 3 and 4)

### 7.1 · Bound to `packet.question_id`

```text
admit(packet, response_or_failure) : AdmittedJudgment :=

  well-formed Score or YesNo
    ∧ response.question_id = packet.question_id
    ∧ shape = the shape declared for packet.question_id in §6
    ∧ all range invariants hold
      → that Judgment

  well-formed ProviderAbstain
    ∧ response.question_id = packet.question_id
    ∧ reason ∈ ModelAbstainReason
      → AdmittedAbstain{ packet.question_id, that ModelAbstainReason }

  a host-observed failure occurred
      → AdmittedAbstain{ packet.question_id,
                         first HostFailureReason under §7.2 }

  ⭐ response is a matching Abstain whose reason ∈ HostFailureReason
      → AdmittedAbstain{ packet.question_id, OUT_OF_RANGE }
        // provider-originated host reason: REFUSED as a reason,
        // recorded as the host's own observation of an invalid response
```

⛔ **No model assertion may manufacture `TIMEOUT`, `NO_RESPONSE`, `PARSE_FAILURE`,
`UNKNOWN_SHAPE`, `MISMATCHED_QUESTION` or `OUT_OF_RANGE` as a fact about the host
interaction.**

⭐ Note what the last clause does **not** do: it does not record the reason the provider
claimed, and it does not discard the event. It records **`OUT_OF_RANGE`** — the host's own,
true observation that the response carried a value outside its admissible domain. ⭐ *The
host answers a forged fact with a fact of its own, never with silence and never with the
forgery.*

⭐⭐ **The expected question is read from the packet the host built and sent, ⛔ never from
the response.** The anti-fabrication guarantee is unchanged and now has a single source: an
absent, timed-out or unparseable response supplies nothing, and nothing is needed from it.
⛔ **No response identity is ever fabricated.**

⭐ `Abstain` is admissible for **every** question.

### 7.2 · ⭐⭐ DETERMINISTIC FAILURE-REASON PRECEDENCE (defect 4)

Several failure conditions can hold at once — a response may be simultaneously late,
malformed, and about the wrong question. ⛔ Without a fixed order the same failure yields
different records on different runs, and **the record becomes a fact about the
implementation rather than about what happened.**

**Total order. The FIRST condition that holds determines the reason:**

```text
1  TIMEOUT              deadline elapsed before a complete response
2  NO_RESPONSE          transport completed, nothing returned
3  PARSE_FAILURE        bytes present, not well-formed
4  UNKNOWN_SHAPE        well-formed, not Score | YesNo | Abstain
5  MISMATCHED_QUESTION  a declared shape, question_id ≠ packet.question_id
6  OUT_OF_RANGE         shape and question correct, an invariant violated
7  <model-supplied>     a well-formed, matching ProviderAbstain whose reason is a
                       ModelAbstainReason: that reason is taken
```

⭐ The order above applies to **actual host observations** and is unchanged from J1R3. ⛔ A
provider-originated `HostFailureReason` does not enter this order at all — it is refused as a
reason by §7.1 and recorded as `OUT_OF_RANGE`.

⭐ **Host-detected reasons (1–6) outrank model-supplied reasons (7), always.** A response
claiming `REFUSED` while also being malformed is recorded as `PARSE_FAILURE`: ⛔ the
malformation is the fact, and a model's account of itself does not override what the host
observed.

⭐ A well-formed matching `ProviderAbstain` carries exactly one `ModelAbstainReason`, so ⛔ no
precedence is needed *among* `INSUFFICIENT_STATE` and `REFUSED` — the host takes the one
given.

⚠️ This order is **part of the contract**, ⛔ not an implementation note. A candidate that
reorders it is non-conforming even if every individual mapping looks sensible.

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
| `DC-EXTRA-MEMBER` | **any member not among the six of the exact packet** | §2 / §4.1 |
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
| ⭐ `DC-CORRELATION-HANDLE` | any stable per-work-unit identifier reaches the packet | §2.1 |
| `DC-WRAPPER-ENVELOPE` | the packet is wrapped in an object with its own fields | §2.2 / §4.1 |
| `DC-QUESTION-FROM-RESPONSE` | expected question recovered from the response | §7.1 |
| ⭐ `DC-NONDETERMINISTIC-REASON` | same failure yields different `AbstainReason` across runs | §7.2 |
| `DC-MODEL-REASON-WINS` | a malformed response's self-declared `REFUSED` is recorded | §7.2 |
| `DC-PRECEDENCE-REORDERED` | the §7.2 order changed while each mapping looks sensible | §7.2 |
| ⭐ `DC-AGREEMENT-AS-AUTHORITY` | two agreeing judgments satisfy a review requirement | I5 |
| `DC-ORPHAN-ADVICE-SURFACE` | an advice member with no question behind it | §1 |
| ⭐⭐ `DC-MODEL-FORGES-HOST-REASON` | provider returns a matching `Abstain` with `TIMEOUT`, `PARSE_FAILURE` or another `HostFailureReason` → **must be refused as a provider-originated reason and admitted as host `OUT_OF_RANGE`, never trusted as the claimed host fact** | §6.2 / §7.1 |
| `DC-HOST-REASON-PASSTHROUGH` | a provider-supplied `HostFailureReason` recorded verbatim | §7.1 |
| `DC-FORGERY-DISCARDED` | a forged host reason silently dropped instead of recorded as `OUT_OF_RANGE` | §7.1 |
| `DC-UNION-COLLAPSE` | `ProviderResponse` and `AdmittedJudgment` merged back into one union | §6.1 |

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
J1R3 first attempt      NON-CONFORMING @ blob 60366f5f · ⛔ no standing · historical
J1R3                    RETURNED @ 474bca3f / blob dfd422d3 · historical evidence
J1R4 (this document)    CANDIDATE · NOT RATIFIED · sole object of J1 adjudication
TaskShape binding       J5.v1 @ blob e840d705 · verified at canonical 0691cd36
Falsifier suite         OWED · ⛔ NOT BUILT · lethality ⛔ NOT DEMONSTRATED
status/custody index    NAMED · ⛔ NOT OPENED
J2                      NOT OPEN
ADAPTER                 NOT AUTHORIZED
PROVIDER EXECUTION      NOT OPENED
capability table        UNCHANGED
```

⭐ *A protocol selector is not a prompt. A boundary is not a rounding error. An opaque
identifier is still a correlation handle. A packet that was never built is not a model that
declined. And the host is the sole author of the facts only the host can observe.*
