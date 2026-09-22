# JARVIS-JEV-01 — J0 Constitution + J1 Judgment Contract

**Status:** ⛔ **CANDIDATE. NOT RATIFIED.** Authored on founder direction 2026-09-22
("worth opening as a real programme, beginning with J0 Constitution + J1 Judgment
Contract, before we write an adapter"). Ratification is a founder act; this document
performs none.

**Date:** 2026-09-22
**Base:** `9da7195e` on `clean-main-no-secrets` lineage
**Branch / custody:** `claude/sovereign-governance-review-s8skj2`

## Mandatory lane preamble (JARVIS manual §27)

```text
Class: A
Governing authority: founder direction 2026-09-22 + canonical JARVIS manual
                     + PROVIDER_GOVERNANCE.md + the 2026-09-20 dev-lane interim hold
Current gate: J0 — CONSTITUTION (J1 contract authored as candidate, not constituted)
Evidence subject: this repository's governing records only. ⛔ No provider was called.
                  ⛔ No judgment was performed. ⛔ No packet was constructed or sent.
Stop boundary: no adapter, no provider registration, no external inference,
               no routing change, no provider spend, no merge, no deploy
```

## What this document is, and is not

It is the **law a Jev lane would have to satisfy**, written before an adapter exists,
so that the adapter is written to a constitution rather than the constitution being
written to an adapter.

⛔ It is **not** an authorization to build the adapter.
⛔ It is **not** a verdict that Jev is valuable, or that fast-path routing is desirable.
⛔ It does **not** add a provider, edit a tier table, or open a lane.
⭐ Three findings below are **blocking as specified** — §1, §4 and §6 each name a gate
the proposal must pass through before J2, and none of them is a preference.

---

## 1 · PLACEMENT FINDING — the governing question is already owned

⭐⭐ **`JARVIS-ROUTING-INTELLIGENCE-01` (charter 2026-09-18) already owns this exact
question**, and its governing question is close to verbatim:

> *How should JARVIS select model family, review topology, evidence membrane, and
> provider transport without allowing model capability, provider availability, cost,
> or agreement to become authority?*

A Jev judgment lane selects **model family and transport** and must not let
**confidence become authority**. That is the parent question, not an adjacent one.

⚠️ **And the parent lane is at J1, not J2.** Its charter records `Current state: J1 —
ROUTING-LAW DISCOVERY`, and states plainly that `J2–J9 are a programme map, not present
authorization`. Its J2 gate is **CONSTITUTE / CANDIDATE ROUTING LAW** — *the routing law
does not yet exist*.

⭐ **So JEV-01 as proposed would constitute a routing mechanism before the routing law
it must satisfy has been constituted.** That is a gate jump in the parent flow, and this
project has refused that shape repeatedly: the defect is not that Jev is wrong, it is
that *the thing Jev must conform to has not been written yet*, so conformance could not
be assessed even if the adapter worked perfectly.

⚠️ Two further clauses of the parent charter bind directly. Its **explicit
non-authorizations** already forbid, at J1:

- *automatically selecting or executing any external provider*;
- *disclosing repository … material*;
- *adding a new provider*;
- *treating vendor benchmark claims or model agreement as JARVIS authority*.

If Jev is external, **JEV-01 as specified is blocked by its own parent lane's stop
boundary**, independently of anything in §4.

⭐ **RECOMMENDED, ⛔ NOT TAKEN** — placement is a founder call, not mine:
record this as **`JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 — JEV JUDGMENT LANE`**, a
bounded lane inside the parent flow under manual §27, rather than as a parallel
programme. Rationale: a second programme over one governing question creates two
authorities over one decision, and the 1:1 relation between them would be assumed
rather than guarded — the same shape the observation-address law refused on 2026-09-21.

⛔ The founder's chosen name `JARVIS-JEV-01` is preserved on this file and not
unilaterally demoted.

---

## 2 · J0 — CONSTITUTION

Seven articles. Each is written so that a violation is *observable*, not merely
disapproved of.

### A1 · Judgment is evidence about a choice; it is never permission to perform it

A Jev result enters the record as **evidence**. It may never widen a Work Unit's
capability, authorize a mutation, satisfy a review requirement, or discharge a gate.

⭐ **Observable form:** the ledger records three separately-sourced facts and never
collapses them —

```text
judgment:   source=JEV          choice=LOCAL_QWEN   confidence=0.93
authority:  source=JARVIS_POLICY permitted=true
execution:  source=WORK_UNIT     capability=READ_ONLY_PROPOSAL
```

*What appears appropriate* → *what is permitted* → *what actually happened.*
A record in which `judgment` is absent and `execution` occurred is lawful.
A record in which `judgment` is the only stated basis for `execution` is a breach.

### A2 · Confidence may close a path. It may never open one

⭐⭐ **This is the sharpest correction to the proposal as drafted.**

The proposal's J3 reads *strong → deterministic policy*, i.e. high confidence **opens**
the fast path. That makes confidence authority by degree: it does not widen what is
*permitted*, but it widens what *happens*, which is the consequence the permission
boundary exists to govern.

**Constituted instead:**

- the fast path is opened **only** by membership in a **predeclared class of work unit**,
  enumerated in advance and reviewable;
- within that class, confidence and abstention may only **close** the fast path and
  escalate to full deliberation;
- ⛔ no confidence value, at any magnitude, may move a work unit *into* the fast-path
  class.

⭐ **Falsifiable by construction:** a candidate in which raising a confidence threshold
changes the *set* of work units eligible for the fast path violates A2. A conforming
candidate's eligible set is invariant under every confidence value.

### A3 · Abstention is the fail-closed default

An unparseable result, an absent result, a timeout, a malformed packet, or an
unrecognised choice value are all **abstentions**, and an abstention escalates to full
deliberation. ⛔ Silence is never assent, and an error is never a route.

### A4 · Jev judges a representation, never a conversation

Jev receives the **typed packet of §3 and nothing else**. ⛔ Not the member's message,
⛔ not repository prose, ⛔ not canon text, ⛔ not prior turns, ⛔ not free-text
justification. The packet is constructed by JARVIS from state; it is never relayed.

⭐ This is what keeps Jev from becoming a second conversational authority — the founder's
own stated intent for J1, constituted here as law rather than as practice.

### A5 · The eligibility membrane precedes the packet

⛔ No packet is constructed until eligibility passes. A refusal at J0 must not construct,
log, hash, or cache the packet it refused. *A refusal is not an occasion to disclose* —
carried directly from the I0.5 receipt law.

### A6 · Jev may not judge its own standing

⛔ Jev may not be asked whether Jev should be used, whether its confidence is adequate,
whether a hold applies, or whether a work unit is eligible. Eligibility, calibration and
authority are **JARVIS policy questions**, adjudicated outside the judged path.

### A7 · Removing Jev must be a no-op on authority

⭐ At every stage, deleting the Jev lane entirely must leave every authority decision
unchanged — slower, more expensive, but identical in what is permitted and what is
refused. **A lane that cannot be removed without changing what the system may do has
become authority**, whatever the ledger says.

⭐ *This is the single acceptance test that survives every implementation detail.*

---

## 3 · J1 — JUDGMENT CONTRACT (candidate)

⛔ **Authored as a document, deliberately not as committed source.** Landing this as
`lib/**` or `scripts/**` TypeScript would be the first increment of the adapter the
founder explicitly sequenced *after* the constitution. The schemas are exact enough to
implement against and carry no runtime.

### 3.1 · The packet — what Jev may receive

```text
JudgmentPacket {
  packet_version:        "jev-1"
  work_unit_ref:         opaque id            # ⛔ never a path, never prose
  task_kind:             enum                 # closed set, enumerated in policy
  requested_effect:      enum                 # read | propose | repository_write | ...
  affected_surface:      enum                 # closed set of surface names
  contains_sensitive:    boolean              # computed by J0, never by Jev
  requires_external_info: boolean
  candidate_routes:      enum[]               # already-authorized routes ONLY
  change_scope: {
    file_count:   integer                     # ⛔ counts, never names
    migration:    boolean
    auth:         boolean
    production:   boolean
  }
}
```

⭐ **Closed enums throughout, and counts rather than names.** An open string field is a
relay channel wearing a schema's clothes — the §4 hazard arrives through free text long
before it arrives through a declared field.

⚠️ **`candidate_routes` contains only routes the Work Unit is *already* authorized to
take.** Jev selects **among** authorized routes; it never nominates one. A packet whose
candidate set contains an unauthorized route is malformed and refused at construction —
this is A1 made structural rather than checked afterwards.

### 3.2 · The judgments — exactly three shapes

```text
Choice  { question_id, options: enum[], choice: enum, confidence: 0..1 }
Score   { question_id, scale: {min, max, meaning}, score: number, confidence: 0..1 }
YesNo   { question_id, answer: boolean, confidence: 0..1 }
Abstain { question_id, reason: enum }          # A3 — always representable
```

⭐ **`Abstain` is representable on every question.** A contract in which abstention
cannot be expressed forces a judgment where none is warranted, and the resulting
confidence value is then a measurement of the contract rather than of the task.

### 3.3 · The questions (candidate set)

| id | shape | question |
|---|---|---|
| `Q_ROUTE` | Choice | Which **already-authorized** route best fits this work unit? |
| `Q_DEPTH` | Score | How much deliberative reasoning does this require? (0 mechanical → 1 deeply ambiguous) |
| `Q_RISK` | YesNo | Does this appear to cross a structural-risk boundary? |
| `Q_SUFFICIENT` | YesNo | Is the supplied state sufficient to proceed without clarification? |
| `Q_LLM_NEEDED` | YesNo | Is a generative model required at all? |

⭐ `Q_LLM_NEEDED` is the highest-leverage question in the set and the one most likely to
be dropped: some JARVIS actions need no inference once the operation is identified.

⚠️ **`Q_RISK` and `Q_SUFFICIENT` are advisory in the A1 sense and must not become
gates.** A `false` on `Q_RISK` may never *lower* a guard — only a `true` may raise the
escalation. ⛔ Otherwise a confident wrong negative silently removes a boundary, which is
A2's failure mode arriving through a different field.

---

## 4 · THE ELIGIBILITY MEMBRANE — and the blocking provider question

⭐⭐ **FINDING: JEV-01 is the second instance of the defect class named on 2026-09-20,
arriving from a different direction.**

`DEV_LANE_PROVIDER_EXPOSURE_FINDING_2026-09-20.md` established that
`PROVIDER_GOVERNANCE.md` scopes itself to *who may enter the **runtime***, and defers the
**development** boundary to `../ai/MULTI_MODEL_SESSION_MODE.md` — **a document that does
not exist and never has on any branch**. That finding was occasioned by a review CLI.
JEV-01 is a routing judge. **Same gap, different door.**

⛔ **The founder interim hold of 2026-09-20 is still operative.** Routing repository
source or constitutional text to a Lab-tier provider at development time is BLOCKED, with
two predeclared lift conditions, **neither discharged**:

1. a dev-lane governance canon **authored AND ratified** — not authored;
2. the capability table admitting explicit classes for repository source and
   constitutional canon (`repository_source`, `constitutional_canon` proposed) — ⛔ the
   tier table is unedited.

### 4.1 · The sharper problem: the packet has no capability class at all

⭐⭐ The §3.1 packet is **derived from repository state** — surface names, change scope,
effect class. The governing capability vocabulary is
`member_data · member_audio · chat · embedding · tts · stt · benchmark`.

**None of these names what a judgment packet is.** And this is *not only* a Lab-tier
problem:

- Sending it to a **Lab-tier** provider is blocked by the interim hold if the packet
  counts as repository source — and whether it does is exactly the question the missing
  vocabulary cannot answer.
- Sending it to a **Production-tier** provider (Ollama, Anthropic) is **transport-lawful
  but semantically silent**: `chat` authorizes the *transport*, not the *data class*.
  The tier table would permit the call while saying nothing whatever about whether this
  data may go there.

⚠️ **A permission that is silent is not a permission that was granted.** Reading `chat`
as covering a repository-derived judgment packet is the convenient-adjacent-field move
this project has refused at every previous encounter.

### 4.2 · The one question that decides whether this lane can act

⛔ **`Jev`'s provenance is not stated anywhere in this repository or in the founder
direction, and I have not guessed it.** It decides the lane's entire shape:

- **Sovereign-hosted** (local, on minisforum or equivalent, no egress): the interim hold
  does not bind, because nothing leaves the boundary. §4.1's vocabulary gap still
  applies, but it becomes a *naming* obligation rather than a custody hold, and J2 can
  proceed behind it.
- **External / hosted**: Jev is a **new provider**. It requires tier placement under
  `PROVIDER_GOVERNANCE.md` §"Adding / changing a provider", it is refused at J1 by the
  parent lane's own non-authorizations, and it sits squarely under the unlifted hold.

⭐ **Everything in §2 and §3 above is provider-agnostic and stands under either answer.**
That is why it was authored now rather than held — the constitution does not depend on
the question, and only the membrane does.

---

## 5 · E1 WITNESS — agreement is not accuracy

⚠️ **The proposed shadow witness, as specified, is an agreement study wearing an accuracy
study's clothes.** It measures Jev against the current JARVIS routing decision. That
establishes how often Jev **reproduces current behaviour, including its errors**.

⛔ And the current router is explicitly *not* a baseline: `JARVIS-ROUTING-INTELLIGENCE-01`
J1 question 2 asks *"Which provider/model facts are mechanically established versus
merely labeled in UI?"* — the current routing is **the subject under investigation**.
Treating it as ground truth would settle by assumption the question the parent lane was
opened to answer.

⭐ **This repository's own ratified discipline already answers this** (S3 Class B;
TESTING-01 §0; REVIEW-CUSTODY-01 Step 1): *a suite written against an existing
implementation passes by construction and proves nothing.* Lethality first.

**Required before E1 is evidence — each candidate must DIE on its named check:**

| candidate | embodies | must fail |
|---|---|---|
| `DC-CONFIDENCE-OPENS` | threshold widens the eligible set | A2 |
| `DC-ASSENT-ON-ERROR` | malformed result routes instead of abstaining | A3 |
| `DC-PROSE-RELAY` | free-text field carries the member's message | A4 |
| `DC-REFUSAL-LOGS-PACKET` | J0 refusal constructs and logs the packet | A5 |
| `DC-SELF-STANDING` | Jev asked whether Jev should be used | A6 |
| `DC-LOAD-BEARING` | removing Jev changes an authority outcome | A7 |
| `DC-UNAUTHORIZED-ROUTE` | candidate set contains a non-authorized route | §3.1 |
| `DC-AGREEMENT-IS-TRUTH` | witness scores agreement with current router as correctness | §5 |

⭐ **If a candidate survives, the repair is the SUITE, never the candidate.**

⭐ And the metric the founder named is the right one, preserved verbatim in substance:
*when Jev is allowed to make a fast-path recommendation, how often is that recommendation
safe enough that full deliberation was genuinely unnecessary?* — ⛔ which is a different
measurement from agreement, and is the one that decides whether Jev earns a role.

---

## 6 · OPEN — owed to a founder act, ⛔ none answered here

- **Q-JEV-1 · Placement.** Sub-lane of `JARVIS-ROUTING-INTELLIGENCE-01` (§1 recommended),
  or a parallel programme? ⛔ Not taken.
- **Q-JEV-2 · Provenance (BLOCKING).** Is Jev sovereign-hosted or external? §4.2. Until
  answered, the membrane cannot be written and J2 cannot open.
- **Q-JEV-3 · Vocabulary.** Does a repository-derived judgment packet require its own
  capability class, and is it `repository_source` or a narrower fourth name? ⛔ Naming it
  here would be the proposal-not-act error the 2026-09-20 ruling explicitly warned about.
- **Q-JEV-4 · Gate order.** May a routing mechanism be constituted while the parent lane's
  routing law (its J2) is unwritten? §1 says no; the ruling is the founder's.
- **Q-JEV-5 · Fast-path class.** Which work-unit classes are predeclared eligible under
  A2? ⛔ Unenumerated; A2 is inert until they exist.

---

## 7 · Standing

**J0 CONSTITUTION AUTHORED (A1–A7) · J1 CONTRACT AUTHORED AS CANDIDATE · ⛔ NEITHER
RATIFIED · ⛔ NO LANE OPENED · ⛔ PLACEMENT NOT TAKEN · ⛔ Q-JEV-2 BLOCKING AND
UNANSWERED · ⛔ 2026-09-20 INTERIM HOLD UNLIFTED, BOTH LIFT CONDITIONS UNDISCHARGED ·
⛔ NO PROVIDER ADDED · ⛔ NO TIER TABLE EDITED · ⛔ NO ADAPTER · ⛔ NO PACKET CONSTRUCTED ·
⛔ NO JUDGMENT PERFORMED · ⛔ NO PROVIDER CALLED · ⛔ NO ROUTING CHANGED · ⛔ NO PROVIDER
SPEND · ⛔ NO `lib/`, `app/`, `scripts/` OR `database/` FILE MODIFIED · ⛔ NO MERGE ·
⛔ NO DEPLOY · PRODUCTION UNTOUCHED.**

⭐ *Jev may tell JARVIS what appears to be the case. It may never tell JARVIS what it is
permitted to do — and the test of that is not the ledger's wording but whether removing
Jev entirely leaves every authority decision exactly where it was.*
