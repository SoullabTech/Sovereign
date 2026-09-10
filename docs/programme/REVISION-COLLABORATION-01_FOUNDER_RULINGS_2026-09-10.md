# REVISION-COLLABORATION-01 — Founder rulings

**Ruled 2026-09-10, on the lane record `REVISION-COLLABORATION-01_LANE_2026-09-10.md`.**

These rulings govern the novel part of the lane — what happens after MAIA proposes.
The proposal-authority and staleness halves are already ratified elsewhere (WS2-05A
structure proposals; BUILD-07A `locateCurrent`) and are not reopened here.

---

## RC-01 — `MODIFY` does not mutate MAIA's proposal

The original proposal is **immutable**. It preserves exactly what MAIA proposed.

```
MAIA proposal
    immutable
    preserves exactly what MAIA proposed
             |
    writer chooses MODIFY
             |
new revision candidate
    derived_from = MAIA proposal
    editable by writer
             |
    writer explicitly applies
             |
         Work changes
```

This is the law already established for structure proposals, carried to prose:
**the historical fact of what the system proposed can never be rewritten after the
fact.**

---

## RC-02 — Authorship and provenance are two different questions

The writer has authority over the resulting revision. That does not make every word
in it exclusively theirs.

⛔ **Both simplistic classifications are refused:**

```
modified proposal = MAIA-authored      NO
modified proposal = writer-authored    NOT NECESSARILY
```

⭐ **A modified proposal is a writer-controlled derivative of a MAIA proposal, and
its provenance must retain that relationship.**

```
proposal_id        P17
proposed_by        MAIA
proposal_text      immutable

candidate_id       C22
derived_from       P17
modified_by        member
candidate_text     mutable until applied

application_id     A31
authorized_by      member
applied_from       C22
```

### At the text level

Where practical, preserve the distinction more accurately still:

```
unchanged words from proposal     MAIA-origin  ·  member-adopted
words changed by writer           member-origin
whole resulting revision          member-authorized
```

That is the provenance truth. ⛔ **If span-level attribution is too much for the
first implementation, do not fake it.** Preserve at minimum:

```
final revision
  derived from MAIA proposal P17
  subsequently modified by member
  explicitly applied by member
```

Finer attribution can then be added later **without corrupting the historical
record** — which is the property that makes deferring it lawful.

---

## RC-03 — The three acts have genuinely different provenance

An exact acceptance must remain distinguishable from a rewrite. It is not recorded
as though the writer wrote the wording themselves.

```
ACCEPT     MAIA proposed these exact words
           member explicitly adopted them

REJECT     proposal preserved
           Work unchanged

MODIFY     proposal preserved
           new writer-controlled derivative created
           writer edits the derivative
           member applies the final result
```

---

## RC-04 — MAIA never edits the writer's candidate in place

MAIA may continue discussing the candidate and may offer another proposal. She may
not silently regain authorship over the object the writer is currently shaping.

> *"Make my version tighter."* → MAIA creates **another proposal, derived from the
> current candidate.** She does not edit the candidate.

The result is a clean alternating chain in which **every handoff remains visible**:

```
Work
 |
MAIA proposal P1
 |  writer modifies
member candidate C1
 |  asks MAIA again
MAIA proposal P2
 |  writer accepts / modifies
 ...
 |
explicit member application
Work
```

---

## RC-05 — Candidate prose storage

**Ruled 2026-09-10, on the design finding in §1a of `…_DESIGN_2026-09-10.md`.**

A writer's MODIFY candidate is not MAIA's proposal and is not yet the Work.
Calling it a diff would hide the fact that the system holds a new copy of
member-authored prose; holding it only in-session would break the continuity RC-01
requires.

⭐ **A writer-created MODIFY candidate may be stored durably as its own governed
manuscript artifact. It is treated as member prose, not proposal metadata.**

```
MAIA proposal             STORE
  immutable
  model-origin

bounded original          REFERENCE ONLY
  never copied into proposal/candidate substrate

writer MODIFY candidate   STORE
  member-controlled prose
  separate artifact
  derived_from proposal
  not yet the Work
```

### The storage authority is limited by these conditions

```
1  creation requires the member's explicit MODIFY act
   no speculative candidate may be minted

2  the candidate stays a separate object from BOTH the immutable MAIA
   proposal and the canonical manuscript revision

3  it carries lineage to the proposal and to the exact
   manuscript / revision / target it arose from

4  its existence grants NOTHING — no may_cross, no body-reading
   permission, no consent, no application authority, no standing
   permission to MAIA

5  MAIA may never mutate it in place. Handing it back and asking for
   another revision produces a NEW proposal row under RC-04

6  erasure / export / custody rules for member-authored manuscript prose
   must explicitly reach this store. It cannot become an orphaned
   secondary manuscript repository

7  application stays separately gated: only a target resolved `current`
   may enter the Work. `superseded` and `unmeasured` REFUSE

8  span-level attribution is never manufactured retroactively. The
   explicit attribution-grain discriminator is the correct approach
```

### ⭐ To be stated explicitly in the migration record

> **Durability does not make the candidate canonical.** It is recoverable working
> material. The Work remains unchanged until a member explicitly applies it.

## RC-06 — One authoritative textual home at a time

**Ruled 2026-09-10, amending RC-05's rationale.** This supersedes the shorthand *"no
member prose in proposal tables"* — a content-type prohibition — with the law that
actually explains why each storage decision is lawful.

> ⭐ **Every piece of member writing has one authoritative textual home at a time.
> Other records may point to it, prove what acted on it, and preserve lineage — but
> must not quietly become competing copies of the Work.**

The governing test is therefore not *"is this member prose?"* but **"does persisting
this text create a second authoritative copy of writing that already has a home?"**

```
MAIA proposal
  STORE       not the Work; evidence of what MAIA proposed

bounded original
  REFERENCE   already has an authoritative home in the revision store
              copying it would create a rival

MODIFY candidate
  STORE       member prose, yes — but no other authoritative home exists yet
              this is its FIRST copy, not its second
```

⭐ **RC-05 amended:** *a MODIFY candidate may be durably stored because, until
application, that store is the sole authoritative home of that candidate — not a
second copy of the Work.*

### RC-06a — Application changes the candidate's status

```
before apply    candidate row owns candidate prose

after apply     canonical revision owns adopted prose
                candidate record preserves provenance / lineage
                and points to the resulting revision
```

⛔ **At the moment of application the candidate substrate must not be allowed to
become a permanent rival manuscript store.** That does not necessarily mean deleting
its history.

⛔ **OPEN, requires an act:** whether the candidate body remains immutable as
historical evidence, or collapses to a reference once adopted. **The RC-06 test is
what decides it, not convenience.**

### RC-06b — Candidate identity ⭐ RATIFIED 2026-09-10

> **A MODIFY candidate has a stable identity plus an append-only revision
> history. Any proposal made against a candidate must identify the exact
> candidate revision it saw, not merely the candidate.**

```
lawful      (candidate_id, revision_number, digest)
NOT         candidate_id
```

**Why.** A writer keeps changing their candidate while discussing it:

```
C1 r1 -> writer edits -> C1 r2 -> asks MAIA -> P2 based on C1 r2
                                            -> writer edits -> C1 r3
```

If P2 records only `candidate_id = C1`, *what wording was MAIA responding to?* has
no truthful answer. **A frozen digest alone proves the candidate subsequently
changed but cannot recover the state MAIA actually saw. The revision history can.**

### Required shape — the Work's versioning law, applied to candidates

```
revision_candidate
    stable identity / lifecycle

revision_candidate_revisions
    candidate_id · revision_number · body · digest
    created_at · authored_by member
    UNIQUE (candidate_id, revision_number)
```

**Candidate prose is never edited in place** — a writer change appends revision
N+1. Earlier candidate revisions are immutable under ordinary operation.

⚠️ **Immutability must not become an excuse to defeat member erasure rights.**
Governed erasure remains a separate lifecycle obligation (RC-05 condition 6).

A monotonic `current_revision_number` pointer on the identity is lawful if useful:
**advancing a pointer does not rewrite historical prose.**

### The reference must be enforced, not disciplined

A proposal against a candidate carries `derived_from_candidate_id` ·
`_revision` · `_digest`. ⭐ **The database relationship should make it impossible
to point to a revision number with the wrong digest — not merely depend on
application discipline.**

Mechanism: `UNIQUE (candidate_id, revision_number, digest)` on the revisions
table, with the proposal's three columns as a **composite foreign key** onto that
triple. A mismatched pairing is then unrepresentable rather than merely incorrect.

Existing recovery and staleness logic then operates honestly, never fuzzy:

```
same candidate revision + digest    current
later candidate revision exists     superseded
cannot establish the relationship   unmeasured
```

### ⛔ One boundary

```
canonical Work revisions    authority over the manuscript
candidate revisions         authority over this unfinished candidate
```

Different authored objects. **This does not turn the candidate into another
Work.** Before application the candidate revision store is that prose's sole
authoritative home; application later changes that relationship — **which is why
RC-06a stays open and is not silently settled by this ruling.**

---

### RC-06b — original statement of the problem (retained)

If MAIA makes P2 against C1 before C1 is applied, **P2 must identify the exact
candidate state it saw.** A candidate cannot be a mutable blob whose prior state
disappears while downstream proposals still claim to derive from it.

⛔ *(As first recorded — now resolved by the ratification above.)* **This blocks part of the R1 migration shape.** Under design §7, R1 must persist
the full proposal shape so R2 needs no backfill — and a proposal's reference to a
candidate is then **not an id but a triple**: `(candidateId, candidateRevision,
digest)`. Choosing wrong now means migrating history later.

**Recommendation, not a decision** — give the candidate its own append-only revision
sequence, the same shape as `working_draft_revisions` (UPDATE refused by trigger,
`UNIQUE (candidate_id, revision_number)`), and have a proposal name the triple.
Then both existing instruments work unchanged on candidates:

```
recoverEvidence   can display exactly what P2 was based on, digest-verified
locateCurrent     three-state against the candidate, never fuzzy
```

⭐ **The alternative — a mutable candidate plus a frozen digest on P2 — detects
divergence but cannot recover what P2 saw**, because there would be no history to
recover from. That is `unmeasured` where the Work would give `superseded` with the
text. Reusing the accepted versioning shape is what makes RC-06b *literally* true
rather than merely detectable.

---

### The lineage

```
WORK@R17
   | referenced
MAIA PROPOSAL P1          immutable
   | MODIFY
MEMBER CANDIDATE C1       durable, member-controlled
   | ask MAIA again
MAIA PROPOSAL P2          immutable, derived from C1
   | ACCEPT / MODIFY
  ...
   | explicit APPLY + current check
WORK@R18
```

⭐ **R1 is UNBLOCKED by this ruling** — RC-05 settles the only §9 item identified as
blocking it. ⛔ **The other four open design acts remain open; this ruling does not
silently settle them, and implementation beyond R1 is not generally authorized.**

---

## RC-08 — Proposal ↔ exact conversation turn

**Ruled 2026-09-10**, on finding S-2 of `JARVIS-RC-RESEARCH-01` (Sundial keys its
diff payload by `assistantMessageId`; Prose independently carries
`provenanceMessageId`).

> ⭐ **Every proposal produced in a developmental conversation must identify the
> exact MAIA turn in which it was produced. Conversation identity alone is
> insufficient provenance.**

⛔ **`thread_message_id` REFUSED — it would duplicate identity.** `ask_turns` is
already append-only and already keyed `PRIMARY KEY (thread_id, turn_index)`;
`appendTurn()` returns that index. Inventing a second UUID vocabulary adds a
second thing to keep true.

```
thread_id + produced_in_turn_index  ->  ask_turns(thread_id, turn_index)
```

```
Author: "tighten this"          MAIA turn 4  -> P1
Author: "too strong"            MAIA turn 6  -> P2, P3, P4
Author: "P3, but less polished" MAIA turn 8  -> P5
```

Several proposals MAY share one producer turn; their ids distinguish them. What is
gained is a permanent answer to **which exact act of MAIA produced this proposal** —
which `thread_id` alone can never give.

### Required shape (amended into the unapplied R1 migration, not a later one)

```
produced_in_turn_index integer CHECK (>= 0)
(thread_id, produced_in_turn_index)   both NULL or both present
FOREIGN KEY (thread_id, produced_in_turn_index)
  REFERENCES ask_turns(thread_id, turn_index) ON DELETE SET NULL
```

⛔ **`thread_id`'s independent FK to `ask_threads` is REMOVED, not kept alongside.**
Two FK actions on one column is a way for a row to satisfy one and violate the
other. Integrity is transitive: the composite FK guarantees the turn exists, and
`ask_turns.thread_id` already guarantees the thread does. *A proposal claiming
conversational origin should point to an actual turn, not merely an existing
thread.*

Deletion principle preserved: member deletes thread → turns cascade away →
**proposal survives**, `thread_id` and `produced_in_turn_index` become NULL.
Lineage is **severed rather than ghosted.**

### ⚠️ IMPLEMENTATION FINDING — freezing and `ON DELETE SET NULL` are in direct conflict

The ruling asks for the producer turn to be frozen. **Taken literally that would
have made this table refuse thread deletion**, because `ON DELETE SET NULL`
performs an UPDATE and the freeze trigger would raise on it — immutability
defeating member erasure, the exact failure RC-06b warns against.

⭐ **The rule is therefore MONOTONIC SEVERANCE, not immutability:**

```
value -> NULL              ALLOWED   the member deleted the thread
NULL  -> value             REFUSED   a proposal cannot acquire an origin
                                     it never had
value -> different value   REFUSED   a proposal cannot be reassigned to a
                                     different act of MAIA
```

This satisfies the ruling's intent exactly — *reassignment* is what must be
impossible, and severance is what deletion legitimately does.

### ⚠️ Semantic note — what a severed NULL means, and what it must never be read as

⛔ **After erasure, `NULL` must NEVER later be interpreted as "this proposal never
had conversational provenance."** It means only that **the reference is no longer
available.**

If a later feature genuinely needs to distinguish *never linked* from *link
intentionally severed*, that distinction gets **its own explicit state then** — it
is never reconstructed from `NULL`.

⭐ **This is the same lesson as Sundial's `decision?: 'accepted' | 'rejected'`
defaulting to `accepted` on older rows** (finding S-7): a field whose absence is
later *interpreted* will be interpreted toward whatever the reader finds
convenient. Absence is representable or it is guessed.

⛔ Not a reason to reopen the migration now. Recorded so the reading is fixed
before any code depends on it.

## RC-08a — Producer provenance exists at birth

**Ruled 2026-09-10**, on two holes S-12/S-13 exposed in our own migration.

> ⭐ **A MAIA revision proposal may not be born without an exact producing MAIA
> turn. Loss of that reference may occur only later, through lawful erasure.**

```
INSERT     value REQUIRED
LIFETIME   value -> same    YES
           value -> other   NO
           value -> NULL    YES, lawful severance
           NULL  -> value   NO
```

There is no *"not yet linked"* state and no *"forgot to link it"* state. **That is
the architectural advantage the atomic write boundary buys us over Sundial**, whose
single nullable column carries three meanings at once (S-13).

### The two holes it closes

**(1) The composite FK proves a turn, not a MAIA turn.** `ask_turns` holds both
speakers, so a proposal could name an *author* turn and satisfy the key — while
RC-08 says *the exact MAIA turn in which it was produced.*

**(2) `NULL/NULL` at birth was still permitted**, so a NULL could mean *severed* or
*never recorded*. Sundial showed what happens when nullable provenance accumulates
meanings; one meaning is removable now, before any row exists.

### Enforcement — ⛔ no new provenance enum

`producer_link_state` REFUSED. The composite FK keeps referential integrity; a
`BEFORE INSERT` trigger owns the semantic fact.

⚠️ **`NOT NULL` cannot express this** — `ON DELETE SET NULL` requires the columns to
be nullable, so a NOT NULL constraint would make member erasure fail. **Birth-time
requirement and lifetime rule are two different obligations and need two different
instruments** (BEFORE INSERT, BEFORE UPDATE). Same shape as the freeze/severance
conflict, one layer down.

⭐ **The speaker read is an AUTHORITY, not a precheck** — and only because
`ask_turns` refuses UPDATE unconditionally. The speaker of a turn can never later
differ from the speaker this trigger read. Under a mutable `ask_turns` this would be
a precheck, and FR-18 already established that a precheck is not an authority.

### ⚠️ Instrument finding — three tests began passing for the wrong reason

Adding the BEFORE INSERT trigger made **T4, T5 and T6 refuse at the producer check
instead of at the constraints they are named for** — the candidate-reference
completeness, origin agreement, and work-authority checks silently stopped being
tested while still reporting PASS.

Caught by reading the refusal *reason*, not the result. Repaired by giving those
three a valid MAIA producer turn so each reaches its own constraint.

> **A new gate upstream of an existing test can retire that test without failing
> it.** FR-14's law in a new place: *an instrument can satisfy all of its remaining
> questions by forgetting to ask the difficult ones.*

### Validated

```
17 passed · 0 failed        PostgreSQL 16.13, disposable cluster
T15 discriminates           known-bad (FK only) ADMITS an author turn
T16 discriminates           known-bad ADMITS a NULL/NULL birth
```

⛔ If genuinely non-conversational proposal generation is ever introduced, it needs
**a new explicit provenance origin** — never `NULL` reused as *"well, this one had
no turn."*

---

### Write boundary, when generation lands

```
BEGIN
  append MAIA turn  -> obtain turn_index
  insert P1 referencing that exact turn
COMMIT
```

If either fails, neither becomes historical fact. Otherwise the conversation can
say something was proposed while no proposal exists, or the inverse.

⛔ **`requested_by_turn_index` NOT added.** The producing turn answers the finding.
If branching or non-linear replies arrive, an explicit `in_response_to` relation is
additive then — **not a conversation graph prebuilt today.**

---

## RC-07 — The capability rule (product)

**Ruled 2026-09-10, on a live Develop-room transcript.** The writer asked *"Do we
need to adjust the languaging of any iteration to make it flow better? Offer ideas
to revise them to work best."* — and the system had nowhere to go. It could only
produce more chat.

> ⭐ **When a writer explicitly asks MAIA to edit, revise, tighten, adjust,
> rewrite, or offer alternative language, MAIA must be able to return concrete
> revision proposals against the authorized text — not merely advice about what
> might be changed.**
>
> ⭐ **Every proposal remains a proposal until the writer accepts or modifies it.
> Only the writer's explicit application changes the Work.**

### The intended exchange, in place

Proposals appear **inside the conversation the writer is already in**. Observation,
discussion, permission and proposed revisions belong together.

```
SECTION 13 — A Vivid Dream and a New Understanding

MAIA suggests:
  [proposed revised wording]

Why:
  Keeps the first waking resolved and lets the later Aether waking
  carry the unanswered question.

[Accept]   [Revise]   [Leave it]
```

```
ACCEPT     approved revision, ready to apply through the governed WRITE path
           ⛔ still does not silently overwrite the Work

REVISE     the proposal opens as the writer's editable candidate
             MAIA'S PROPOSAL   immutable original suggestion
             YOUR VERSION      editable
           then [Apply to Work]

LEAVE IT   proposal preserved, Work unchanged (RC-03)

KEEP TALKING   "keep the first exactly as it is; give me three subtler
               versions of the second" -> NEW proposals (RC-04), never
               modifications of her old proposal and never changes to
               the writer's candidate
```

Only when the writer wants to work directly in the manuscript does the transition
become `Work on this →`, opening WRITE at the section **with the conversation
continuing beside them**.

## ⭐ RC-07a — Permission to propose is not an obligation to change

**Ruled 2026-09-10**, before generation, on a collision RC-07 created.

RC-07 read literally *rewards making a change merely because the writer opened the
revision loop.* That would destroy behaviour MAIA already demonstrates correctly —
in the very transcript that opened this lane she answered *"Then the recurrence is
doing what you want it to do, and I'd leave it alone."*

> **A request for revision authorizes MAIA to consider and propose changes; it does
> not establish that a change is warranted. If MAIA judges the existing language
> stronger than the available revision, she may explicitly recommend leaving it
> unchanged. When she does propose a change, the proposal must be concrete against
> the authorized text — not merely advice about what might be changed.**

### Two lawful outcomes

```
REVISION WARRANTED      one or more concrete RevisionProposal objects

NO REVISION WARRANTED   explicit `no_change` outcome
                        reason given in the conversation
                        ZERO proposal rows
```

⛔ **`no_change` is a successful editorial judgement:**

```
no_change  ≠  failed generation
no_change  ≠  empty model response
no_change  ≠  refusal
```

⛔ **`no_change` is NOT persisted as a proposal, because no proposal occurred.** The
MAIA turn already records what she said. Analytics about restraint, if ever wanted,
are a separate question and are not smuggled into R1.

⭐ **Why this is ratified before generation rather than after:** an editorial agent
optimised to always edit — because editing is the visible feature — is a specific
and likely failure. The restraint specimen exists to make that failure loud.

---

## RC-GEN-01 — constraints on the generation slice

**Ruled 2026-09-10.** Narrow by construction: make MAIA answer the typed contract
through exactly one forced tool call, prove both lawful outcomes against real
inference, then persist.

### The result geometry, enforced by the caller

⛔ `toolChoice: {type:'tool'}` **asks** for a tool call; it does not **guarantee**
the geometry.

```
zero revision_outcome calls   -> no_answer
more than one                 -> malformed     ⛔ NEVER "take the first"
wrong tool name               -> malformed
exactly one                   -> admitRevisionOutcome(...)
```

Multiple proposals belong **inside one call**. Two calls are two answers.

```
text only                 -> no_answer
text + malformed tool     -> malformed        prose never repairs a tool input
text + one lawful tool    -> the tool input IS the answer
```

⛔ **No gating on a vendor `stop_reason`.** The semantic fact is the structured
block that arrived; a provider's word for how it stopped is not evidence about what
it said.

### ⛔ Proposed wording is NOT copied into `ask_turns.body`

Forcing a tool call means there is no longer necessarily an `outcome.answer` to put
in the turn. **Implementation must not improvise this.**

```
proposals   ask_turn.body  = the conversational reason(s)
            proposal row   = canonical proposed_text · reason · target ·
                             provenance · producer turn

no_change   ask_turn.body  = the admitted no_change reason
            proposal rows  = ZERO
```

> ⭐ **The conversation says what MAIA is doing. The proposal records exactly what
> MAIA proposes.**

The renderer composes `MAIA turn + proposal card(s)`; later reconstruction rejoins
proposal rows through the exact producer turn RC-08 established.

### ⚠️ Atomicity is not idempotency

The one-transaction rule solves *turn commits / proposal fails* and its inverse. It
does **not** solve:

```
BEGIN turn + P17 COMMIT -> the HTTP response is lost -> client retries
                        -> the provider runs again
                        -> BEGIN turn + P18 COMMIT

two historical MAIA acts for ONE member invocation
```

⛔ **Required before the persistence lane is accepted**, not before step 2: a fault
specimen where a commit succeeds, the response is lost, and the same invocation is
retried → **no duplicate historical proposal act.** If a stable
request/invocation identity already exists, reuse it; otherwise **record the gap
explicitly rather than pretending transaction atomicity gave exactly-once
behaviour.**

⭐ The same class this programme keeps finding:

```
atomic transaction  ≠  exactly-once act
tool chosen         ≠  one tool call
structured output   ≠  admitted output
model proposal      ≠  Work mutation
```

### Step 3 database

⛔ **The minimal FK stub is NOT sufficient for step 3.** It answered *does this
FK/trigger behave correctly?* Step 3 asks *can the real conversation substrate and
the real proposal substrate commit as one historical act?* — so the disposable
cluster carries the **actual relevant migrations** (members · manuscript · working
draft · sections · ask_threads · ask_turns · R1) and their genuine dependencies.
Still disposable, still destroyed, still nowhere near production.

### Scope

```
IN     typed outcome · forced tool envelope · atomic persistence ·
       one proposal card in DEVELOP
OUT    Accept-to-Work · candidate store · Modify · batch ·
       cross-section proposals · DEVELOP -> WRITE handoff
```

**Milestone:** authorized read → the writer asks for a revision → MAIA either says
leave it alone **or** emits one concrete proposal → **the Work remains
byte-identical.**

---

## ⛔ F / authorial aggregation — the boundary for R2

```
ALLOWED NOW                      NOT ALLOWED NOW
proposal P17                     "writer prefers understatement"
candidate C22/r1                 "writer dislikes intensification"
candidate C22/r2                 style preference scores
exact P17 -> C22/rN lineage      authorial tendency vectors
diff computed transiently        derived writer traits
                                 system-authored preference memory
```

⛔ **No column, JSON field, memory atom or hidden profile may appear as a side
effect of candidate storage.** If F returns it gets its own constitutional act
against **FR-06** and **Invariant 14**, covering what the member can see, contest
and erase, and whether aggregation is authorized at all.

> ⭐ **The delta is evidence of an act. The aggregate is a system-authored claim
> about the person. Those cannot inherit the same authority merely because one can
> be computed from the other.**

---

### The build order this fixes

```
DISCUSS                  BUILT
ASK FOR REVISION         UNDERSTOOD by MAIA already
GENERATE PROPOSALS       BUILD
REVISE A PROPOSAL        BUILD
ACCEPT / LEAVE           BUILD
APPLY TO WORK            BUILD
CONTINUE SAME CONVO      BUILD
```

⛔ **The next visible implementation is not another permission improvement.**

---

## The constitutional rule for the novel part

> ⭐ **Modification transfers control, not history. The writer owns what happens
> next; the record continues to remember where the candidate came from.**

---

## Classification — this is a JARVIS application, not a new JARVIS architecture

```
NEW JARVIS ARCHITECTURE     NO
JARVIS APPLICATION          YES
IMPLEMENTATION COMPLEXITY   relatively bounded
EXPERIENTIAL ADVANCE        potentially very large
```

What makes it Jarvis-like is **not** that MAIA is agentic. It is that the work has
continuity and custody:

```
Work
-> MAIA observes / writer asks
-> bounded evidence is retrieved lawfully
-> MAIA makes a proposal
-> proposal remains an inspectable historical object
-> writer accepts / rejects / modifies
-> provenance survives the decision
-> Work changes only under writer authority
-> conversation continues
-> later state can supersede earlier state without erasing history
```

Which maps onto the established division:

```
MAIA remembers the person.
JARVIS remembers the work.
AIN governs what may become context.
```

**Why this instance stays simple.** Full JARVIS coordinates work episodes, task
custody, multiple workers, delegation, evidence gathering, verification,
risk/authority, recovery, cross-session continuity, supersession and routing. This
loop has **one human, one Work, one MAIA, one governed revision chain**, so the
operational flow stays:

```
NOTICE -> DISCUSS -> PROPOSE -> ACCEPT / MODIFY / REJECT -> WORK
```

with Jarvis-grade custody underneath: who proposed what, what text it was based on,
whether it is still current, who changed it, who ultimately authorized it.

### ⭐ The design target

> **Jarvis underneath; almost invisible to the writer.**
>
> *If we make the user operate the provenance architecture, we have failed.* If the
> writer can sit with MAIA and revise Chapter 10 naturally while JARVIS quietly
> remembers the work, the source, the alternatives, the decisions and the lineage —
> that is the mature form of the architecture.

The `MODIFY -> ask MAIA again -> modify again` loop is where this becomes a
next-generation interaction: **neither party silently overwrites the other**, the
system remembers the lineage, and the experience is simply two people working on a
paragraph together.

---

## What this ruling corrects

⚠️ The lane record as first written contained:

> *"`WRITER CAN alter` settles the provenance of a modified proposal. The writer
> editing MAIA's words before adopting them is the writer's authorship."*

**That is superseded by RC-02.** `WRITER CAN alter` settles **authority**, not
**authorship**. The line collapsed two different questions into one and would have
licensed exactly the classification RC-02 refuses. It is marked superseded in place
in the lane record rather than deleted — a record of what was ruled, including what
was ruled wrong.

---

## Standing after this ruling

```
RC-01 .. RC-04              RATIFIED
RC-05 candidate storage     AUTHORIZED (rationale amended by RC-06)
RC-06 one authoritative home  RATIFIED
RC-06a post-apply rule      OPEN — requires an act
RC-06b candidate identity   RATIFIED — append-only revisions,
                            identity = id + revision + digest,
                            pairing enforced by composite FK
RC-07 capability rule       RATIFIED
RC-07a restraint            RATIFIED — no_change is a successful outcome
F / authorial aggregation   DEFERRED — FR-06 question open, not a side effect
RC-08 exact producer turn   RATIFIED — amended into the unapplied migration
                            monotonic severance, not immutability
RC-08a producer at birth    RATIFIED — required at insert, must be a MAIA
                            turn; 17/17 validated, T15/T16 discriminate
R1 proposal migration       UNBLOCKED
constitutional rule         RATIFIED
DESIGN                      RECORDED
R1                          UNBLOCKED — authorized to proceed
IMPLEMENTATION beyond R1    NOT GENERALLY AUTHORIZED
open design acts            4 remain (design §9 items 2..5)
span-level attribution      OPTIONAL in first implementation,
                            NEVER faked if absent
MERGE                       NOT YET
PRODUCTION                  UNTOUCHED
```
