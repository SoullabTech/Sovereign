# EA-READING-GROUP-01 — Configuration Decision Record

```text
DATE        2026-09-04
LANE        EA-READING-GROUP-01  ·  INSTANCE OPEN (founder act 2026-09-04)
KIND        decision only
AUTHORIZES  nothing to be created
LANE DOC    docs/programme/EA-READING-GROUP-01_LANE.md
CENSUS      docs/programme/EA-READING-GROUP-01_SUBSTRATE_CENSUS_2026-09-04.md
NAMING      docs/programme/READING-ROOM-01_NAMING_RULING_2026-09-04.md
```

> ⛔ **No database writes. No circle. No memberships. No invitations. No UI changes. No
> migrations. No routes.** This record fixes five decisions so that when the instance is created,
> it is created from a decision rather than from a session's improvisation.

---

## Substrate ruling — as adjudicated (founder, 2026-09-04)

Use `lib/circles`. Exclude `client_groups`. The decisive reason is stronger than feature fit:

> `client_groups` does not merely lack the consent/sharing semantics needed; its existing
> `cohort | ongoing | program | category` taxonomy would answer a question the first instance is
> supposed to investigate. Importing it would quietly turn **inherited implementation into product
> ontology.**

Circles supplies relational primitives without prescribing temporal or social form — membership ·
facilitator role · consent · revocable sharing · bounded shared artifacts · hosted inquiry ·
member response · differentiated response modes.

On `circle_inquiries`: *facilitator opens a question → members respond independently → responses
remain typed → the architecture explicitly prevents thread collapse.* Closer to the container
Andrea needs than a conventional discussion thread. **Use it without improving it yet.**

---

## A. Instance identity

```text
NAME        Elemental Alchemy Reading Group
WORK        Elemental Alchemy: The Ancient Art of Living a Phenomenal Life
AUTHOR      Kelly Nezat
HOST        Andrea Fagan
SUBSTRATE   existing Circles capability (lib/circles)
```

The Work's title is recorded from canonical
(`app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json` → `title`), which carries
*Ancient*. The shorter form in conversation is not treated as a retitling.

⛔ **The circle is not called "Reading Room."** `Reading Room` remains the name of the future
platform capability (`READING-ROOM-01`). Naming this instance after the capability would be the
same error as calling it a prototype of one.

⛔ The circle's own `name` field carries the instance name above and nothing architectural.

## B. Human roles

Three authorities are distinct and are not merged because one person holds more than one:

```text
AUTHOR            wrote the Work
PLATFORM STEWARD  owns and governs the substrate the group runs on
GATHERING HOST    holds the container in which readers meet
```

| Person | Role | Circle role | Status |
|---|---|---|---|
| Andrea Fagan | Gathering host | `facilitator` | **DECIDED** |
| Kelly Nezat | author + platform steward; gathering role **not** assumed | — | **OWED — see below** |

### C6 determination — OWED

Constraint C6 requires the author's role to be **recorded explicitly**, precisely so that
authorship plus platform ownership do not silently accumulate into co-facilitation. The concrete
question, unanswered at this record:

> Is Kelly's role in this instance **author / steward** (present as the Work's author, not holding
> the container), **participant** (a reader among readers), **co-facilitator** (`facilitator`), or
> **absent** from the circle?

**Recommendation: author / steward, not `facilitator`.** Reasons, in order of weight:

1. C6 exists because the founder authoring the Work *and* owning the platform *and* holding the
   container is a concentration of relational power. Two of the three are already unavoidable; the
   third is a choice, and declining it is the cheapest structural protection available.
2. The `facilitator` role is what gates opening a gathering's inquiry (census §4). Two facilitators
   makes it ambiguous whose container it is — and the answer readers will assume is *the author's*.
3. Andrea's hosting is the thing being observed. An author co-facilitating changes what the
   instance can teach about what a human host actually needs (discovery question 1).

A decision to be present as a reader is legitimate and is **not** the same as `facilitator`; it
would be recorded as `member`, with the author's presence disclosed to the group rather than
implicit.

⛔ **Not decided by this record.** No circle role is created for Kelly until he states it.

## C. Reading sequence

The Work carries, on canonical: preface · introduction · **10 chapters** · appendix.

```text
 1  The Journey Begins
 2  The Torus of Change
 3  Understanding the Trinity and the Toroidal Flow
 4  The Elements of Wholeness
 5  Fire
 6  Water — The Depths of Emotional Intelligence and Transformation
 7  Earth
 8  Air
 9  Aether — The Infinite Self at Play
10  Living the Spiralogic Process
```

**Binding statement, carried into the instance verbatim:**

> The chapter sequence supplies orientation for gatherings. It does not establish completion,
> attendance, adherence, or member progress.

⛔ Ten chapters are **not** ten progress states. Nothing counts chapters read, marks a member's
position, or renders "where the group is." This is what protects the club/cohort discovery (§7a of
the lane) and satisfies C5 (no progress obligation) at the same time. A member who joins at
chapter 7 having read the book twice, and a member who never finishes, are both fully members.

Whether gatherings track the sequence at all is an **observation**, not a configuration.

## D. Gathering-question shape

Start from the primitive that exists, unmodified:

> At a given gathering interval, Andrea may open one inquiry associated with the current reading
> invitation. Members may respond as **reflection**, **witness**, or **offering**.

Mapping to substrate (census §3–4): `circle_inquiries.question`, opened by `role='facilitator'`;
`circle_inquiry_responses.response_type ∈ reflection | witness | offering`; one response per member
per inquiry.

**Critical distinction, recorded so it cannot silently invert:**

> **"One inquiry open at a time" is a substrate constraint, not yet a Reading Group design
> principle.**

It originates in `circle_inquiries` ("one active inquiry at a time per circle"), which was built
for something else. It may turn out to be exactly right for a reading group — one question, held
open, without thread collapse — and if the running instance shows that, it becomes a principle
*on that evidence*. Until then it is an inherited implementation detail the instance is living
with, and the record says so. The same discipline that excluded `client_groups` applies to any
constraint Circles happens to impose: **an accidental uniqueness constraint does not become
product philosophy by being tolerated.**

Passage reference in a gathering question uses **ordinary human reference** — chapter, section,
passage title, quoted opening words where appropriate. No machine-addressable passage identifier
is introduced (gap G2, held).

## E. MAIA boundary

Carried directly into the configuration record, and intended to survive any future sophistication
of Reading Room architecture:

> **MAIA may support an individual member in relation to that member's own experience and
> authorized materials. MAIA does not host the group, represent the group, infer a group mind,
> summarize members to one another, or synthesize across member contributions.**
>
> **Andrea remains the host.**

Consistent with C1 (the group is Developmental Ecology, not a rung — authority moves upward only,
through the member's own authored experience) and C2 (no cross-member synthesis). Census §4 notes
this is currently satisfied **by absence**: no aggregation mechanism exists in Circles to disable.
That is a fact about today's substrate, not a guarantee — the boundary is stated here so that the
first mechanism capable of violating it meets a written rule rather than a vacuum.

Existing per-member MAIA surfaces on the Work (`BookChat`, `AskMaiaSheet`, the elemental journal)
are member-scoped and remain so. Nothing in this instance connects them to the circle.

---

## The four gaps remain gaps

| # | Gap | Disposition (founder, 2026-09-04) |
|---|---|---|
| G1 | Circle → Work binding | Association lives in **this record and human understanding**. No foreign key added merely because the relationship is obvious |
| G2 | Passage addressing | **Ordinary human reference.** Let actual use establish whether machine-addressable passages are necessary |
| G3 | Shape semantics | **Do not encode** `club`, `cohort`, `ongoing`. Record observed temporal behavior instead |
| G4 | Surface crossing `commons/circles ↔ maia/community/elemental-alchemy` | **Now evidence, not a defect.** Do not solve navigation from a census. Watch what readers actually experience |

> On G4, recorded because it may be the most valuable finding in the experiment:
> **where does a Work end and its community begin, in the member's lived experience?**
> Architecture should follow that answer, not precede it.

## Two hard gates before any real reader is invited

Neither blocks this record; both block instantiation.

1. **Andrea understanding recorded** — role, attribution, ownership and generalization of her
   facilitation material, and what Soullab may learn from the instance. Plain language, written,
   not retroactive.
2. **Co-Lab boundary gate at `31 passed · 0 failed · 0 warned`** in production
   (`docs/ops/COLAB_RELEASE_GATE.md`).

## Programme placement

`EA-READING-GROUP-01` is **not** on `WRITERS_STUDIO_PROGRAMME_BOARD.md`, by founder ruling.
Recording it there would visually imply the Studio is its owner or its dependency; neither is
true. The board continues to say what it says: **BUILD-07B owns the Studio build slot.**

Later, when Stage 15 becomes relevant, the Studio may legitimately carry a reference —
*"Reading Room capability — future authoring integration; informed by EA-READING-GROUP-01
evidence"* — because Stage 15 will then have something to do.

## The sequence

```text
naming ruling → lane opened → substrate census → configuration decision
  → Andrea agreement + boundary gate → instantiate existing Circle → first readers
  → observation → evidence → generic Reading Group Template / Reading Room
```

⛔ **No software build is authorized anywhere in this sequence before the instance begins.**

> use first · observe second · generalize third · build last

## Live state

```text
CONFIGURATION DECIDED   A · C · D · E
OWED                    B — Kelly's C6 role determination
CREATED                 nothing
ANDREA AGREEMENT        not established
CO-LAB GATE             not run for this lane
DISCOVERY LEDGER        empty
```
