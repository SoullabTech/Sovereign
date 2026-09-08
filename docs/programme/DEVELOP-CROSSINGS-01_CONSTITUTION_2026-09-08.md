# DEVELOP — Developmental Working Field

**Lane: `DEVELOP-DWF-01`** *(opened 2026-09-08 as `DEVELOP-CROSSINGS-01`;
reshaped the same day by founder act — the crossings turned out to be
capabilities inside a larger environment, not the environment itself. The
original framing is kept below in §3 rather than deleted, because the crossings
are still the concrete work and their census is still the evidence.)*
```
LANE                 OPEN
DISCOVER / FALSIFY   COMPLETE enough to constitute
CONSTITUTION         LANDED
IMPLEMENTATION       NOT AUTHORIZED
PROD FLAG CHANGE     NOT AUTHORIZED
PR / DEPLOY          NOT AUTHORIZED
```

Opening this lane does not touch `feat/whole-manuscript-view`, frozen at
`d863d4df5`. The Whole Manuscript browser witness remains the next act on THAT
lane; it was never a global prohibition on recording this one.
Opened by founder act 2026-09-08, on the evidence of the first successful
whole-work developmental reading (`6345b8e08`, 262/262 sections, 26 observations).

> **The lane's purpose (founder, 2026-09-08).** After MAIA reveals a developmental
> reading, provide a persistent environment in which writer and MAIA can explore,
> test, relate, disposition and work through those insights, while preserving the
> writer's sole authority over the Work.

> **DEVELOP should not end when the insights appear. That is where DEVELOP
> begins.** The reading is the diagnostic event; what follows is the
> developmental relationship.

### The three objects, and why they must stay three

```
READING       what MAIA observed          IMMUTABLE
FIELD         what writer and MAIA are    LIVING
              discovering about it
WORK          what the author makes       AUTHORITATIVE
```

⭐ **This separation is the lane's load-bearing insight.** MAIA may notice
repetition; through conversation the writer may establish *"the recurrence is
intentional — what is actually wrong is that the second appearance does not
deepen the first."* That is new developmental understanding, and it must **not**
retroactively alter the frozen observation. It belongs to the living field.

**That is how MAIA becomes wiser with the writer without corrupting evidence
provenance.**

### It resolves the ranking problem by dissolving it

The earlier question — should MAIA rank 26 observations? — was the wrong
abstraction. The writer does not need priorities. They need to **enter an insight
and discover its significance**. Some die immediately (*that's intentional —
dismiss*). Some open (*that connects to something in Chapter 9*). Some become
substantial (*this is not a duplicated paragraph; I have not decided what the
Trinity is doing in the architecture*) and become a developmental thread.

> Significance emerges through the writer–MAIA encounter, rather than being
> manufactured beforehand by an algorithmic priority score.

### The capabilities

```
DWF-1  enter an observation
DWF-2  work it through with MAIA
DWF-3  see its evidence and related passages
DWF-4  establish writer standing
DWF-5  follow emerging developmental threads
DWF-6  take me to the relevant place
DWF-7  keep a version before consequential change
DWF-8  keep developmental context present while writing
DWF-9  record that the writer acted on something
```

DWF-6, DWF-7, DWF-4 and DWF-8 are the four crossings censused in §2; the rest are
the field they sit inside.

### Where composition belongs

```
DEVELOP READING                → what has MAIA seen?
reader-facing composition      → made intelligible
DEVELOPMENTAL WORKING FIELD    → what do we make of it together?
WORK                           → what will I do?
```

The presentation / composition problem is immediately UPSTREAM of this lane, not
inside it.

---

## 0b · Two questions this reshaping opens

⛔ Neither is answered here. Both are constitutional, and both would be easy to
answer by accident during implementation.

**Q-A · What is the epistemic status of what the FIELD concludes?**
A frozen observation is evidence-bound and validated. A standing is a member
decision. But *"the recurrence is intentional; the second appearance does not
deepen the first"* is neither — it is jointly authored understanding, arrived at
in conversation, resting on evidence the reader gathered but stating something
the reader was constitutionally barred from stating. It must be named, or it will
be quietly filed as one of the two things it is not. **A field conclusion that
gets stored as an observation corrupts the reading; one stored as a standing
misattributes it to the writer alone.**

**Q-B · Does a persistent MAIA beside the writer change the relational posture?**
Every DEVELOP act so far is *commissioned*: one member gesture, one reading,
frozen. DWF-8 makes MAIA continuously present while the writer works. That may be
exactly right — a gifted developmental editor in the room — but it is a different
posture from a commissioned reader, and the Sovereignty Invariants ask of any
capability increase whether it *reduces the system's psychological centrality over
time*. **The question is not whether MAIA writes. It is whether presence becomes
ambient rather than invited.** An invited presence and an always-on one are
different relationships to a writer's solitude, and the difference should be
designed rather than defaulted.

---

## 0c · The original lane question, retained

> Once the writer decides an observation matters, how do they move from reading to
> authorship without friction — and without MAIA crossing the authorship
> boundary?

> **The lane's centre (founder).** *MAIA may help the writer arrive at the work.
> MAIA may not become the writer.*

Distinct from, and not to be merged with, `DEVELOP PRESENTATION / COMPOSITION`,
whose question is how 26 evidence-bound observations become intelligible as a
developmental reading. They touch; **they have different authorities.** The
presentation lane may eventually organise, synthesise and weigh. This one may
not, and its strictness is the point.

---

## 1 · What made this necessary

The reading works. The counsel works — asked "do you have suggestions?" about the
Trinity thread, MAIA returned three options, each named as *a different bet about
what the Trinity is for*, one costed, one given a concrete falsifying test, one
refused as unanswerable from where she sits, and closed with *"whichever change
you pick, you make it, not me."*

What fails is everything after that sentence. The writer holds a judgment and has
no way to act on it without leaving the room, finding Section 38 by hand, and
carrying the counsel in their head.

`WS-DELETE-01` named this shape: **"The command is not the capability; the
crossing is,"** citing WS2-NAV-01 and NAV-03 before it. This lane is the fourth
instance, and — per the census below — partly a fifth: one crossing is not
missing but *closed*.

---

## 2 · Census against the four design questions

### DX-Q1 · What coordinate is sufficient to cross from an observation to the working place?

**It already exists and is already carried.** Every observation binds to typed
`EvidenceRef`s — `section`, `passage` with a Unicode code-point range,
`section-run`, and the structural kinds — and the rendered reading displays them:
*"Section 38 · 'Philosophical Framework: The Trinity', characters 480–737 as
read."*

⭐ And `locateCurrent` (BUILD-07A) already answers, in **three states**, whether
that passage is still what MAIA read: current · superseded · unknown. So a
crossing can arrive *and say truthfully whether the ground has moved.* Nothing
new is needed to know where; what is missing is the door.

### DX-Q2 · What version-preservation gesture belongs at the threshold?

**Built, and reachable.** `settleDraft()` flushes every dirty section and returns
a settled draft version; `Keep a version` binds a checkpoint to it. So preserving
lineage at the threshold requires no new mechanism — only the offer, at the
moment it becomes valuable, as a **member gesture and never an automatic
checkpoint.**

### DX-Q3 · Does the existing BUILD-07F standing model adequately express the writer's relationship to an observation, should `WS_STANDING_ENABLED` be opened, and what belongs OUTSIDE standing as Work lifecycle state?

*(The question was first written as "what disposition vocabulary gives observations
shape?" — a build question. The census made it the wrong question: the model
exists. Founder reframing, 2026-09-08.)*

⭐⭐ **BUILT, AND SWITCHED OFF.** `BUILD-07F` shipped a member standing per
observation as a **sibling resource of the reading**, with the separation this
lane depends on already written:

> *"A frozen reading is what MAIA noticed, and a standing is what the writer
> decided. Keeping them separate at the API is what keeps them separate in every
> client that consumes them."*

```
READING     what MAIA noticed
STANDING    what the writer decided
```

Append-only events, compare-and-swap against `currentEventId`, no PUT, no DELETE
— *"a standing is changed by taking a later one"* — no `memberId` in the body,
and exactly one module permitted to reach the writer, asserted by a test. Gated
server-side behind `WS_STANDING_ENABLED === '1'` after the Founder Pilot
containment ruling of 2026-09-06, because a UI-only kill switch stops being
containment once a tester can reach the room.

⛔ **The production value of `WS_STANDING_ENABLED` is UNKNOWN and must not be
inferred from a `200` on the GET.**

**So this is a gate decision, not a greenfield build.** What remains open is
ontology, and it is genuinely open:

| built (standing) | proposed in conversation |
|---|---|
| `keep` · `dismiss` · `unresolved` | `worth exploring` · `acted on` · `not yet` · `not for me` |

⛔ **These must not be merged casually.** `keep`, `dismiss` and `unresolved`
describe the writer's **relationship to the observation**. `acted on` describes
something categorically different — a **lifecycle fact about the Work**. They
belong to different objects:

```
standing          keep · dismiss · unresolved
work lifecycle    acted on
```

Whether `keep` eventually wants friendlier presentation copy such as *worth
exploring* is a **product-language question**, and must not cause the underlying
standing ontology to be rewritten in passing. Whether `not yet` is the same thing
as `unresolved` is **to be falsified, not assumed.**

### DX-Q4 · What context must survive the crossing?

**Nothing survives today.** WRITE accepts only `?s=<sectionId>`. So "Take me
there" as currently constructible improves navigation while leaving the writer to
memorise the counsel — which converts the crossing into *"make me remember why."*

⭐ **THIS IS THE HINGE OF THE LANE**, and the census proves why. Three of the four
crossings are latent capability; this one has no capability at all. If only

```
Take me there → /write?s=38
```

is built, the writer arrives at Section 38 having lost the observation, the
evidence that generated it, the conversation with MAIA, the developmental options
under consideration, and their own emerging judgment. That is navigation without
the human capability — *"make me remember why."*

**RATIFIED (founder, 2026-09-08):**

> **A crossing is complete only when the writer can arrive at the relevant place
> in the Work without surrendering either authorship or the developmental context
> that occasioned the move.**

⛔ That is not permission to put MAIA's suggestion into the draft. It means
**preserving context beside authorship** — the observation and its conversation
available as reference, never injected, never turned into instructions, never
applied.

The requirement is stated; the surface is not, and is not designed here.

### Where the four questions actually stand

```
DX-Q1  TAKE ME THERE
       capability primitives   EXIST   observation coordinates + locateCurrent
       crossing surface        MISSING

DX-Q2  KEEP A VERSION FIRST
       capability primitives   EXIST   settleDraft + Keep a version
       threshold crossing      MISSING

DX-Q3  WRITER STANDING
       capability              EXISTS  BUILD-07F, server-gated
       production flag         UNKNOWN
       ontology / presentation decision REMAINS

DX-Q4  CARRY CONTEXT INTO WRITE
       capability              DOES NOT EXIST   WRITE accepts ?s= only
       genuine missing crossing
```

⭐ **This is mostly connection architecture, not new subsystem construction** —
which is a materially different and smaller lane than it appeared before the
census.

---

## 3 · The crossings

**C1 · Navigation is not authorship.** An observation may offer a direct crossing
to its own coordinate. No text change, no draft mutation, no interpretation
carried across as fact — coordinate to place. Smallest capability, all source
data present.

**C2 · Preservation precedes consequential editing.** At the threshold, the
system may offer *Keep a version first*.

```
observation → writer chooses to act → version-preserving GESTURE → writer edits
```

⛔ Never `observation → automatic checkpoint → mutation`. The member gesture
remains the authority-bearing event. This is not MAIA protecting the writer from
themselves; it is the system making lineage cheap exactly when lineage becomes
valuable.

**C3 · Disposition belongs to the writer** — and, per the census, already does.
The model exists (BUILD-07F); what is unresolved is its activation and its
adequacy, not its construction. Not ranking — ranking would imply the
observations have acquired an objective order. Disposition answers a different
question: *what is my relationship to this observation?* That is unquestionably
the author's authority, and it solves the flat-list problem **without smuggling
judgment into the reader**: twenty-six findings stop being an undifferentiated
burden once the writer can establish which concern them, which do not, which are
resolved, which remain alive.

> Significance is not merely an attribute of the object. It emerges in the
> relation between the observation and the writer.

**C4 · Counsel survives the threshold — DESIGN QUESTION, NOT AUTHORIZED.** The
observation and its conversation remain available as reference alongside WRITE.
Not injected into the manuscript, not turned into instructions, not applied.
Just carried across. The human capability is *"I can move into the place where
the work needs attention without losing the understanding that brought me
there"* — the command is navigation; the capability is that.

---

## 4 · The prohibition — absolute for this lane

> **No observation, standing, developmental suggestion, or conversational
> recommendation constitutes authority to alter the Work. Crossing into WRITE
> transfers place and relevant context; authorship remains with the writer.**

It permits:

```
MAIA    → observation
MAIA   ↔  writer → developmental counsel
writer  → standing
writer  → Take me there
system  → preserve context
writer  → edit Work
```

It forbids:

```
MAIA        → Apply
MAIA        → rewrite draft
observation → automatic mutation
standing    → automatic mutation
```

Not `accept suggestion`. Not `apply`. Not `fix this`. Not `rewrite`. Not
`insert MAIA's version`.

⛔ **A MAIA rewrite behind an Apply button is still machine-authored text entering
the manuscript through a thin human confirmation gesture.** That is categorically
different from every crossing above. **The safe crossing terminates at the
writer's hands.**

This is not a claim that another authorship mode could never exist. It is a claim
that creating one would require its own constitution, and that it must not arrive
by accretion inside this lane.

**The precedent that shows the safe shape**, and its limit: WS2-06A already
constitutes MAIA proposing and the member adopting, *for structure* —
`adopted_from_proposal_id` + `adopted_from_review_unit_key`, and the ruling that
matters:

> *"AUTHORSHIP IS UNCHANGED. Adopted rows are still written `origin = 'member'`.
> Provenance is not a claim that MAIA authored anything."*

⛔ That precedent covers **structure**, which is a bounded set of divisions the
member confirms. It does **not** extend itself to prose. Whether it may is a
separate constitutional question, and this lane does not open it.

---

## 5 · The flow this constitutes

```
DEVELOP
  ↓
evidence-bound observation
  ↓
conversation with MAIA
  ↓
writer reaches a judgment
  ├── not for me
  ├── not yet
  ├── worth exploring ──→ take me there ──→ (keep a version first) ──→ WRITE ──→ writer authors
  └── acted on
```

What is absent is the whole design:

```
MAIA → manuscript mutation        ✗
MAIA → understanding → writer judgment → crossing → writer authorship   ✓
```

---

## 6 · Not in this lane

Presentation / composition of the reading · any synthesis or weighing of
observations · MAIA-authored prose in any form · extension of the structure
adoption precedent to text · the `o24` manuscript defects, which belong to
whatever authority owns the Work's content and were surfaced BY this reading
rather than caused by it.
