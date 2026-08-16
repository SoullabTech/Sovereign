# JARVIS Run Provenance Architecture

**Date:** 2026-08-16
**Classification:** **Cat-1 — preserved direction.** Held, not authorized.
**Authority:** founder-authorized *to be written* (2026-08-16). Writing this document is the whole
of what was authorized.
**Status of every mechanism described below:** `DISCOVERED` / `PROPOSED`. Nothing here is
`AUTHORIZED`.

> ⛔ **This document does not authorize implementation.** Not the run record, not a resolution
> contract, not an auditor, not a graph, not a UI, not an orchestration engine. It records a
> direction and the test that direction must pass before anyone may propose building it.
> Reading this document is not being told to act.
>
> ⛔ **It is not a plan.** There is no sequencing of work, no owner, no milestone, no estimate.
> The ordering in §12 is a *dependency claim* — what must be true before what — not a schedule.
>
> ⛔ **A future lane that cites this document as grounds to build a knowledge graph, a Context
> Studio, a Control Room, or a Buzz integration is misreading it.** Those are named here only to
> be explicitly deferred.

---

## §1 Problem statement

JARVIS already has a constitution. `~/.claude/CLAUDE.md` (JARVIS CORE) states authority rules
(§A), an evidence-class contract (§B), custody and lineage rules (§C), and stop conditions (§F).
`docs/governance/JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md` and
`docs/governance/JARVIS_FOUNDER_ESCALATION_CONTRACT_2026-08-12.md` govern above it.

These are binding on reasoning. They are not binding on *record*, because there is no record.

The consequence is specific and it is the reason this document exists:

> **JARVIS failures in this project have overwhelmingly not been reasoning failures. They have
> been referent-binding and evidence-class failures — and they were undetectable at the time and
> unfalsifiable afterward, because no run preserved an account of what it had loaded, what it had
> bound, by what method, and under what authority.**

Every entry in the failure corpus (§11) shares that shape. A run produced a coherent chain of
reasoning that was correct *given its inputs*, and the inputs were wrong in a way the run had no
obligation to expose. The rule that would have caught it already existed. Nothing checked the run
against the rule, because the run left nothing to check.

So the missing capability is narrower than a better model of the project:

> **JARVIS does not first need a better model of the project. JARVIS needs an auditable account of
> what JARVIS knew, from where, under what authority, at what time, when it made a claim.**

Without that, a graph visualizes an epistemic process that still cannot be inspected — and a
Control Room renders it beautifully.

---

## §2 The primitive: the Run Record

**Definition (deliberately narrow):**

> A **JARVIS Run Record** is the append-only trace sufficient to reconstruct *why a run was
> entitled to reach its conclusions*.

What it is **not**:

- ⛔ not chain-of-thought
- ⛔ not a transcript
- ⛔ not a log
- ⛔ not another memory store
- ⛔ not a performance or telemetry artifact

Entitlement, not narration. The test of any candidate field is: *does its absence make some
class of epistemic breach invisible from the record alone?* If not, it does not belong.

---

## §3 Run Record semantics

### 3.1 The three-way distinction that most of this rests on

> **loaded ≠ consulted ≠ relied upon.**

A run can hold information in context without grounding any conclusion in it; can retrieve
something and discard it; can rely on something it never explicitly retrieved because it arrived
in the initial context. Collapsing these three is what makes the retrospective question
*"what did this run actually know when it made that claim?"* unanswerable.

Three distinct fields, never merged:

| Field | Question it answers |
|---|---|
| `context_loaded` | What was the run *given*, without asking? (with source identity + version/hash) |
| `sources_consulted` | What did the run *go and get*? (reads, searches, retrievals) |
| `claims[].supporting_evidence` | What did a specific conclusion *actually rest on*? |

### 3.2 Execution locus

A first-class field, not metadata:

```
repo / worktree / branch / SHA
machine / host / container / service — wherever material
```

This is the field that separates *"I observed X"* from *"I observed X somewhere that could not
have shown me X."* Several corpus entries (§11.1, §11.5, §11.8, §11.12) are locus failures with
sound reasoning attached.

### 3.3 Referent bindings — and `binding_method`

The load-bearing field of the whole schema.

```
requested_referent      what the instruction named
resolved_identity       what it was bound to
binding_method          HOW the run decided those were the same thing   (§3.3.1)
ambiguities_rejected    what else it could have been, and why not
custody                 where the resolved thing stands (§4)
```

A future auditor's question is not *"what did you read?"* but:

> **"How did this run decide that X was the thing it thought X was?"**

`this checkout = production` · `remote branch = canonical` · `deployed mechanism = observed use` ·
`shared egress address = machine identity` — each is a *binding*, each was silently plausible,
each was wrong, and none of them are visible in a list of sources consulted.

#### 3.3.1 `binding_method` is resolver-level, not activity-level

> **Correction admitted 2026-08-16, forced by this document's own acceptance exercise (§11, entry
> 11). Cat-1 correction to an existing field — no new top-level field, no scope expansion.**

`binding_method` records the **resolver and the domain it operates over**, not a label for the
activity. An activity label is insufficient provenance because it cannot reconstruct *what could
and could not have been found*:

```
binding_method:
  resolver:   <the specific mechanism>
  domain:     <what that mechanism actually resolves over>
  scope:      <where it operated>
  query:      <the material selector>
```

**The case that forced this.** Corpus entry 11 (`WISDOM_IS_RECOVERED.md`) resolved two ways over
the same repository:

```
resolver: filename_find      domain: repository paths          → nothing
resolver: content_grep       domain: repository file contents  → live references present
```

Both are colloquially *"searched the repo."* They are epistemically different operations, and the
contradiction between them **is the finding** — a document that is referenced but does not exist.
A record carrying `binding_method: searched repo` preserves neither the discrepancy nor the
mechanism that produced the false conclusion, and would have hidden exactly the thing the record
exists to expose.

⛔ Insufficient: `searched repo` · `checked the DB` · `looked at the deploy` · `read the docs`.
✅ Sufficient: a resolver + domain pair specific enough that a later reader can say what the
operation was **structurally incapable** of returning.

This is a granularity requirement on an existing field. It does **not** rest on any claim that
entries 5 and 11 share a recurrence class (§8), and it establishes no such class.

### 3.4 Sketch of the record

Illustrative, **not a specification** — §11 governs what the fields must be.

```
run_id
parent_run / initiating_run

invocation
  skill                    identity + version or content hash
  instruction_class
  governing_contracts      which constitutions/canon were in force

execution_locus            §3.2

referent_bindings[]        §3.3

context_loaded[]           source identity + version/hash + how it arrived
sources_consulted[]        source + version/hash + reason + observed_at
tools_invoked[]            tool + consequential inputs + result identity/status

claims[]
  claim
  subject_referent
  evidence_class           per JARVIS CORE §B
  supporting_evidence[]    refs into context_loaded / sources_consulted / tools_invoked
  custody_basis            §4
  authority_basis          §5
  observed_at + freshness
  verdict

unknowns_held[]            question + why unresolved
stops_encountered[]        condition + whether triggered

artifacts_or_mutations[]   what changed, if anything
exit
  what is believed now
  what is explicitly NOT claimed
  authority_state
  next_admissible_action   (may be: none)
```

`unknowns_held` and `what is explicitly NOT claimed` are not padding. JARVIS CORE §F requires
holding an observation rather than completing the story; a record with no place to put a held
unknown quietly punishes compliance with §F.

---

## §4 Referent identity and custody

**Custody and authorization are different questions and must not be merged:**

```
custody        = what exact thing is this, and where does it stand?
authorization  = who or what is entitled to assert, change, merge, deploy, or approve it?
```

Custody is the chain JARVIS CORE §C already names:

```
local ≠ committed ≠ pushed ≠ merged ≠ deployed ≠ production-witnessed ≠ canonical
```

Keeping them distinct prevents two symmetric errors:

- `PR exists` → silently read as **canonical custody**
- `work is ready` → silently read as **authorized to deploy**

Neither follows. The first is a custody error; the second an authorization error. A single
"authority" field would let each hide inside the other.

---

## §5 Assertions, not nodes

Custody cannot be a property of a node, because nodes do not have custody — **assertions about
them do, and only at a time.**

`PR #1051` has no intrinsic canonical custody. The assertion
`PR #1051 —merged_into→ canonical @ t` does, and it was false before `t`.
`container X —serves→ soullab.life` may be true, stale, inferred, or runtime-witnessed, and which
one it is *is the fact of interest*.

Therefore, if a graph ever exists, **naked edges are prohibited**:

```
⛔  A ──implements──> B
```

The admissible unit is:

```
ASSERTION
  subject / predicate / object
  observed_at
  source
  resolver              who or what bound the identities
  evidence_class        per JARVIS CORE §B
  custody               §4
  authority_basis       §4
  status / confidence
```

This makes the authority gradient inseparable from the representation of reality itself, which is
the property being protected. An edge that can be retrieved without its custody is a referent
that can be retrieved without its state — the exact failure §11 is made of.

---

## §6 Append-only

Records are **append-only**. A superseded claim is marked superseded and retained with its
supersession; it is never edited or removed.

Rationale is constitutional, not archival — JARVIS CORE §G: *corrections replace confidence, not
evidence*, and superseded findings are preserved visibly where they matter to future reasoning. A
mutable record cannot answer *"what did the run believe at the time?"*, which is the only question
it exists to answer. A record that can be tidied is a record that can be tidied into agreement
with the outcome.

---

## §7 Ambiguity stop

> **Ambiguous identity stops the claim.**

Inherited directly from the memory resolution contract (§9), where it is already load-bearing:
if more than one file matches a `[[X]]`, the reader must stop and surface the ambiguity rather
than guess.

Generalized: a referent that does not resolve to exactly one identity does not yield a claim. It
yields an entry in `unknowns_held` and, where the mandate depends on it, a stop under
JARVIS CORE §F. **Absence resolves the same way** — absence from a search is evidence about the
search, not yet about the world (§B), so an unresolved absence is an unknown, never a negative
claim.

---

## §8 Recurrence governor

The anti-accretion rule. Without it, "errors improve the system" is a machine for producing an
ever-growing book of warnings — and is itself the *discovered gap becomes automatic homework*
failure JARVIS CORE §A prohibits.

```
FIRST OCCURRENCE
    → record failure exemplar                         (always; costs nothing; legislates nothing)

CLASS RECURS  (explicit class binding required)
    → repair becomes ELIGIBLE                          (eligible ≠ admitted)

ELIGIBLE
    → explicit admission decision                      (a governed act, by someone entitled)

ADMITTED
    → edge / evaluator / auditor / skill contract / constitutional amendment
```

Two constraints:

1. **Class binding must be explicit before recurrence counts.** Superficially similar failures
   collapsed into one class manufacture a pattern that was never there — the *property before
   pattern* error.
2. **Founder or constitutional authority may promote a first occurrence immediately** when blast
   radius warrants. The governor throttles accretion; it does not delay a warranted repair.

The principle:

> **Experience may nominate architecture. Experience may not silently legislate architecture.**

---

## §9 Precedent: the memory resolution and audit pattern

This is not a new subsystem. The discipline already exists in this project, in one domain, and
works.

Verified present (2026-08-16, existence confirmed by direct listing):

- `scripts/memory/RESOLUTION_CONTRACT.md` — written identity semantics
- `scripts/memory/audit-memory.py` — executable auditor
- `npm run memory:audit` — the invocation
- the memory root index — `[[X]]` edges, normalization, prefix fallback, **exact outranks
  normalized**, and an explicit *stop on multiple matches*

That is the complete pattern:

```
identity → normalization → resolution → ambiguity stop → edges → executable audit
```

So the framing is not *"build JARVIS a knowledge graph."* It is:

> **Generalize a resolution-and-audit discipline this project already knows how to govern, from
> memory artifacts to operational referents.**

Eventually — **not authorized, illustrative only** — the same rule could govern:

```
[[memory-file]]  [[sha:…]]  [[pr:…]]  [[branch:…]]  [[deployment:…]]
[[container:…]]  [[route:…]]  [[table:…]]  [[service:…]]
[[programme:…]]  [[work-unit:…]]  [[skill:…]]  [[run:…]]
```

Different entity kinds get **different resolution contracts** and share **one rule**: ambiguous
identity stops the claim. Graph engineering becomes the *consequence* of reliable identity rather
than the starting abstraction.

A related precedent, user-global rather than repo-versioned: the `jarvis-referent-discipline`
skill at `~/.claude/skills/jarvis-referent-discipline/` (directory confirmed present; contents
not opened for this document). Its detector list — *names are not identity · property before
pattern · verified content over feature name · a stale replica answers rather than fails ·
availability is not composition · convergence is not authority* — is the failure corpus already
compressed into heuristics.

Its status is recorded, and stops there:

```
EXISTS LOCALLY              established
CONTENT RELEVANCE           observed
REPO CUSTODY                absent
CANONICAL JARVIS CONTRACT   not established
ACTION REQUIRED             not implied
```

⛔ Do **not** copy, version, migrate, canonicalize, or create a work unit from this observation.
Laundering *"exists locally and looks relevant"* into *"is a canonical JARVIS contract"* is
precisely the move this architecture exists to stop.

It does, however, pose a real architectural question for later — **not now, and not a repair**:

> How does a run record identify a skill that demonstrably influenced execution but has no
> repository-custodied identity or version?

That question belongs to whatever work eventually reaches skill identity and versioning (§12,
"skills + context compiler consume it"). It is parked here as a test case, not as a defect.

---

## §10 Non-goals

Explicitly **out of scope and unauthorized** by this document:

| Not this | Why deferred |
|---|---|
| Context Studio / Control Room / any UI | A projection. Requires something true to project. |
| Knowledge-graph implementation | Requires resolution contracts (§9), which require the record. |
| Buzz / Camunda / orchestration integration | Different function entirely — see §13. |
| Automatic instrumentation of runs | Not required by the acceptance test (§11). Do not build to skip the test. |
| Changes to JARVIS CORE or the governance contracts | This document is subordinate to them and amends nothing. |
| Retrofitting historical runs | Records cannot be reconstructed; §11 is a *thought* replay, not a data migration. |
| Anything arising from §11 | See the corpus rule immediately below. |

### 10.1 Corpus rule (standing)

> **Inclusion in the §11 historical failure corpus creates no defect, remediation obligation, work
> unit, backlog item, ticket, or implementation authority. The corpus exists only to test whether
> the proposed run-record schema would have made the historical failure observable.**

```
historical exemplar  ≠  current defect  ≠  assigned work
```

Each entry is a **past event used as a test input**. Inclusion is not a claim that the condition
persists, not a claim that it was ever left unrepaired, and not standing to go and look. A future
lane converting the corpus into twelve work items has inverted the document.

---

## §11 Acceptance test (falsification)

**This is the governing test of the schema.** Requirements are not to be invented abstractly;
they are to be earned against failures that actually happened.

> **For each known failure: had the proposed Run Record existed, would the epistemic breach have
> been visible *from the record alone*, in the run in which it occurred?**
>
> - **No** → the schema is missing a datum. Add it.
> - **Yes, across the corpus** → the schema has earned the right to be *proposed* for
>   implementation.

It requires no graph, no UI, no orchestration, and no instrumentation. It is a paper test.

### 11.1 Nominated corpus

**Binding performed 2026-08-16** under the §11.2 contract (read-only; the prohibited third
question was not asked of any entry). Evidence located and quoted below; **11 entries bound, 1
dropped as `UNBOUND`.**

| # | Failure | Binding evidence (located 2026-08-16) | Status | Field that would expose it |
|---|---|---|---|---|
| 1 | Stale replica answered instead of failing | `~/.claude/skills/jarvis-referent-discipline/SKILL.md` — detector present | **QUALIFIED** — heuristic attests the class; no dated incident record located | execution_locus + source freshness |
| 2 | Shared-checkout deploy built whatever branch was checked out | `docs/ops/IMMUTABLE_SHA_DEPLOY.md:4` *"Origin incident: 2026-07-27 shared-checkout deploy race"*; `:16` *"two parallel Claude sessions raced"* | **BOUND** | assertion custody `merged_into @ t` (§5), not node identity |
| 3 | Daily Anchor "verified LIVE" — mechanism under a test member reported as member use | `…/AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md:377` — item 13, `member_daily_anchors` **0 rows** against CLAUDE.md's *"shipped + verified LIVE"* | **BOUND** | claim subject + evidence_class: *mechanism exercised* and *in member use* are different predicates |
| 4 | Breakthrough substrate described as member-lived | `AIN_LIVED_ARTIFACT_GESTURE_EVIDENCE_AUDIT_2026-08-09.md:95` (142 rows), `:128` (all `unattributed-historical`), `:258` (`surface_count > 0` = **0**) | **BOUND** | claims + unknowns_held; row provenance as evidence, not feature name |
| 5 | Phase 2 wired to a route that never fired in production | `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md:13` *"we audited why `[Oracle] conversational-block` never fired in production, we found the wire site was wrong"*; commit `f74ab4204` | **QUALIFIED** — event bound; **original §IX citation was wrong** (§IX is the 2026-07-13 closure, not the wire-site error) | execution_locus + tools_invoked target; *route is live* was an unevidenced claim |
| 6 | Bridge D spiral-state write severed | `…/m0-memory-map/07-production-liveness-evidence.md:76` — 9 rows, *"no writes since 2026-04-08"*; `05-lost-capability-archaeology.md:18-20` — `d7cea280d` amputated **34 modules**, *"silent amputation… no ruling, no doc"* | **BOUND** | context_loaded vs relied_upon; design doc consulted as if runtime evidence |
| 7 | ~~`GIT_COMMIT=unknown` misdiagnosed as missing wiring~~ | **none located** — see §11.4 | ⛔ **UNBOUND — dropped** | — |
| 8 | Hairpin-NAT probe read as proof of external unreachability | CLAUDE.md LAN-IP-drift trap (*"HTTP 000 there does not imply external traffic is broken"*) + founder statement 2026-08-16 | **QUALIFIED** — trap advisory + testimony; no audit, no dated run | execution_locus (probe ran *on* the host) + evidence_class: this probe cannot establish that claim |
| 9 | "typecheck passes" cited as application validation | `docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md:16,23,24` — **409 files**, **0 `.tsx`**, `:85` *"nothing is included except one file"* | **BOUND** | supporting_evidence identity — *which* config, *what* scope |
| 10 | Divergence §II.B reported open after it had been closed | `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md:95` ✅ helper extracted; `03-reader-composition-trace.md:114,146` — `appendAllContextAddenda` in the DEEP path | **BOUND** | observed_at + freshness on the consulted source |
| 11 | Spec grounded on `WISDOM_IS_RECOVERED.md`, which does not exist | repo-wide `find` for the filename returns **nothing**, while `grep` finds live references to it in several docs | **BOUND** — cleanest entry in the corpus | referent_binding with no resolution → ambiguity/absence stop (§7) |
| 12 | Preview name collision killed another lane's server | commit `87a972013` (2026-08-11) adding `docs/ops/PREVIEW_NAME_COLLISION_INCIDENT_2026-08-11.md` | **BOUND** | execution_locus (shared host + name namespace) + mutations_performed |

### 11.4 Binding findings

**Entry 7 — `UNBOUND`, dropped.** CLAUDE.md records a *diagnostic trap* (*"if you see `unknown`,
first verify which deploy path was used before suspecting the build-arg wiring"*). A repo-wide
search for a record of the misdiagnosis **actually occurring** returns only a preregistration
experiment doc and this document. **A trap advisory is not an incident record**, and the §11.1
description asserted a historical misdiagnosis that no evidence supports. Dropped rather than
massaged, per §11.2.

**Entry 5 — citation corrected.** The original entry cited ADDENDA §IX. §IX is the 2026-07-13
closure of the DEEP-primary audit, not the wire-site error. The event is bound elsewhere in the
same document (`:13`); CLAUDE.md's *"Spec §IX"* referred to the **Phase 2 spec**, not the
divergence doc. This is itself a §5 failure — a reference resolved to the right document and the
wrong section.

**Entries 1 and 8 — qualified, retained.** Both are attested as *classes* (a skill detector; a
CLAUDE.md trap, plus founder testimony this session) without a dated run in which they occurred.
They may be used to test the schema; they may **not** be cited as dated incidents.

**Corpus-level observation.** Two of twelve nominated entries came from CLAUDE.md prose rather
than an audit, and both were the ones that failed or weakened under binding. The failure mode the
document describes was present *in the document's own corpus* — inherited prose read as
established fact. This is evidence for the architecture, not against it, but it is also the
reason §11.2 exists.

### 11.2 Confirmation contract

Binding the corpus asks **two** questions per entry, and a third that is prohibited:

```
HISTORICAL BINDING     Did this failure actually occur, in the form claimed?
AUDIT BINDING          What evidence or audit establishes that description?

⛔ PROHIBITED          Is this defect still present?
```

The third question converts corpus validation into remediation reconnaissance. The acceptance test
needs only:

```
historical event → bound evidence → hypothetical run-record visibility
```

Nothing about present system health. Nothing about whether anyone fixed it.

**Outcome states per entry:**

| State | Meaning |
|---|---|
| `BOUND` | Event and description supported by the cited evidence. |
| `BOUND — QUALIFIED` | Event supported; description corrected or narrowed in place. |
| `UNBOUND` | The cited evidence does **not** support the description. |

> ⚠️ **`UNBOUND` entries are dropped or quarantined — never massaged into place.** A provenance
> architecture whose acceptance corpus contains inherited folklore would be a particularly
> unfortunate beginning. An entry that cannot be bound is a finding about the corpus, and the
> corpus is the thing under test here as much as the schema is.

Also prohibited while binding: expanding the corpus opportunistically, altering skills, creating
work units, and implementing instrumentation.

### 11.3 Reading the result

A corpus entry the record would **not** have exposed is the valuable outcome, not the failure of
the exercise. It names a missing field. The exercise is finished when either every entry is
exposed, or the un-exposed entries are understood and explicitly accepted as out of the record's
reach.

**Result on the bound corpus (2026-08-16): the schema exposes 11 of 11 — contingent on §3.3.1.**
Every bound entry maps to a field the record would have carried at the time (final column of
§11.1). No entry required a **new** field.

⚠️ **The contingency is load-bearing, not a caveat.** Entry 11 is exposed **only** under the
resolver-level reading of `binding_method` admitted in §3.3.1. Under the activity-level reading
the document originally carried — `binding_method: searched repo` — entry 11 is **not** exposed,
and the honest result would have been **10 of 11 plus a defect in an existing field**. The
exercise did not merely confirm the schema; it corrected it, and the 11/11 is stated after that
correction, not before it.

⚠️ **Read this result narrowly.** It says the schema survives a **retrospective, hand-run** test
against **eleven** exemplars drawn from **one project's written record**, three of which are
qualified (§11.4). It does **not** establish that the schema is sufficient, that the fields are
capturable in practice, that a run would populate them honestly, or that any of this should be
built. A schema that explains history is the weakest form of validation there is — the corpus was
known before the fields were chosen, so the exercise cannot distinguish "the schema is right" from
"the schema was fitted." **Prospective failure is the only test that would.**

---

## §12 Dependency ordering

Not a schedule. A claim about what must be true before what.

```
EXISTING
  JARVIS constitution + evidence classes + stop conditions
  + memory resolution/audit precedent
        ↓
FIRST NEW THING
  append-only Run Record
        ↓
VALIDATE
  replay the known failure corpus against the schema   (§11)
        ↓
THEN
  generalized entity resolution contracts + executable auditors
        ↓
THEN
  assertion graph                                      (§5 — assertions, never naked edges)
        ↓
THEN
  skills + context compiler consume it
        ↓
THEN
  observability / Context Studio renders it
```

**Studio is last because Studio is a projection. The run record is first because it creates
something true to project.**

---

## §13 Why this is not Buzz, Camunda, or CI

An event bus can eventually supply excellent events:

```
agent X said Y  ·  tool Z ran  ·  message Q arrived
```

The Run Record establishes something categorically different:

```
I consulted X
I bound it to referent Y by method Z
its custody was C at time t
I therefore made claim D
supported by evidence class E
while retaining unknown F
and I do not claim G
```

The first is *what happened*. The second is *what the run was entitled to conclude*. An
orchestration engine cannot supply the second, because it does not model entitlement. This is why
orchestration sits after the record in §12 rather than substituting for it.

---

## §14 Provenance of this document

Recorded here because a document about run provenance that does not carry its own has refuted
itself.

**Verified for this document (direct filesystem listing, 2026-08-16):** existence — *not
contents* — of `scripts/memory/{RESOLUTION_CONTRACT.md,audit-memory.py}`, the `memory:audit`
script entry in `package.json`, the two governance contracts, the four audits and three ops docs
cited in §11, `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`, and the directory
`~/.claude/skills/jarvis-referent-discipline/`.

**Verified in the second pass (2026-08-16, founder-authorized corpus binding):** targeted reads of
the cited audits, located by line. §11.1 now carries the located evidence per entry. **The corpus
is bound, not nominated** — 11 bound (3 qualified), 1 dropped `UNBOUND`.

**Still not verified:** the full contents of any cited audit. Binding was performed by targeted
retrieval against each entry's claim, not by reading the documents end to end. A claim elsewhere
in one of those audits that contradicts an entry would not have been seen.

**Not verified:** that the corpus is complete, correctly classified, or non-overlapping. Two
entries could belong to one class (§8.1) or one entry could be two. **No class binding under §8
has been performed**, so nothing in §11 is yet eligible for durable repair — and eligibility would
still require explicit admission.

**Not asked, deliberately:** whether any §11 condition persists. The §11.2 prohibition held
throughout.

**Evidence class of this document:** design reasoning over an existing written record. It
contains **no runtime evidence, no production evidence, and no member evidence**, and establishes
no claim requiring any.

**Authorizations consumed (all 2026-08-16, all complete):**

| # | Authorized act | Scope | Result |
|---|---|---|---|
| 1 | Write this document | Cat-1 direction only | §1–§14 |
| 2 | Bind the §11 corpus | Read-only; §11.2 contract | 11 bound, 1 `UNBOUND` dropped |
| 3 | Cat-1 correction of `binding_method` | §3.3 + §11.3 only; no new top-level field | §3.3.1; §11.3 contingency |

Ruling accompanying #3: `DISC-1` (prose-memory rule) remains `DISCOVERED`; `DISC-3` (wrong-domain
resolver class) remains `DISCOVERED / UNBOUND` — **not class-bound, no eligibility established, no
artifact minted.** §3.3.1 rests on entry 11 alone and asserts no recurrence class.

**Authority state at exit:** `PROPOSED`.

**No next action is authorized.** The schema's survival of a retrospective test (§11.3) is not
standing to implement it, instrument anything, create work units, or open any §11 entry. Any move
toward implementation requires a new founder ruling that names it.
