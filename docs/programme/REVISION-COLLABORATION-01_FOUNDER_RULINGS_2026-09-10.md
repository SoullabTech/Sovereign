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

### RC-06b — Candidate state needs a trustworthy identity

If MAIA makes P2 against C1 before C1 is applied, **P2 must identify the exact
candidate state it saw.** A candidate cannot be a mutable blob whose prior state
disappears while downstream proposals still claim to derive from it.

⛔ **This blocks part of the R1 migration shape.** Under design §7, R1 must persist
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
RC-06b candidate identity   OPEN — blocks part of the R1 migration shape
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
