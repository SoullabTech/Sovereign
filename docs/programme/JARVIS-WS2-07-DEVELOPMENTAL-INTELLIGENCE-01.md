# JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01

> **Lane active. 07A FIND authorized. Nothing beyond it is.**
>
> This document defined the lane before it was entered, and it still authorizes **no code, no
> schema, no route, no prompt**. Entering FIND required the trigger below to be satisfied on
> canonical rather than asserted in a session — and on 2026-09-02 canonical satisfied it.

```text
LANE               JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
STATE              ACTIVE · 07B UNDERSTAND AUTHORIZED
TRIGGER            Stage 6A AuthorStructureCommand merged to canonical and witnessed
TRIGGER SATISFIED  clean-main-no-secrets @ 4b8b34bcf
AUTHORIZES         07B UNDERSTAND — semantics only. Nothing further.
NORMATIVE          docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
CAPABILITY         docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
LIVE STATE         docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
ROADMAP            docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md
OPENED             2026-09-01
ACTIVATED          2026-09-02
```

## Programme state at this checkpoint

Founder-stated at the `75760ba` planning checkpoint. **Recorded here, not written into the
Programme Board** — the board sets node states from canonical evidence only, and these have not
been censused.

```text
6A       ACTIVE · awaiting authenticated Experience Contract walk
Stage 7  OPENED · BLOCKED ON 6A MERGE
07A      NOT STARTED
6→15     DIRECTIONAL ROADMAP
```

⛔ **`6→15` is direction, not authorization.** A stage appearing on an accepted roadmap is not a
warrant to begin it. Stage 10 in particular — *Deep MAIA Creative Companion* — names memory and
context machinery that must not be started because it is on a roadmap someone approved. Each stage
opens through its own lane and its own trigger.

⛔ **No reason to expand Stage 7 further before FIND.** Finish 6A, close its authorial threshold,
then let the first genuine Stage 7 act be the discovery of what developmental intelligence already
exists — before deciding what to build.

## Activation record

**The section above is historical.** It records what was believed when the lane was opened, and
is not amended. This section records the transition that followed.

```text
2026-09-02
Stage 6A merged and witnessed on canonical @ 4b8b34bcf.
07A FIND authorized as a read-only census.
No repair, schema, route, prompt, or build work authorized by activation.

2026-09-02
07A FIND        CLOSED · canonical @ cc9788e4f
                docs/programme/WS2-07A_DEVELOPMENTAL_INTELLIGENCE_CENSUS_2026-09-02.md
07B UNDERSTAND  AUTHORIZED — resolve the semantics of developmental reading
                from the canonical 07A findings. No build or repair authority.
07C DECIDE      not authorized
07D+            not authorized
```

⛔ **These are steps inside this lane, not lanes of their own.** A step advancing does not open a
new Jarvis flow, and no working branch used to carry a step's output is a lane.

⛔ **Activation authorizes 07A and nothing else.** FIND classifies what exists and repairs none
of it; discovering a defect during the census does not authorize fixing it. 07B–07H remain
unauthorized, and none of them opens because 07A ran.

The 6A evidence this rests on: the AuthorStructureCommand, its provenance migration, the adopt
route and the member gesture are on canonical; Gates 1 and 2 and the non-consent boundary are
pinned by tests that run there; the Experience Contract carries `change_class: experiential`
with desktop and mobile evidence, witnessed at `869e559c9`. Record:
`docs/programme/WS2-06A_RUNTIME_WITNESS_2026-09-02.md`.

## Operating instruction — read before anything else

> **Do not begin Stage 7 by building an editor. Begin by discovering what a trustworthy
> developmental reader can actually know.**

```text
FIND → UNDERSTAND → DECIDE → BUILD → PROVE → DONE
```

- Finding a defect during the census **does not authorize its repair**.
- Preserve the distinction between manuscript evidence, MAIA's observation, MAIA's
  interpretation, and the author's judgment.
- **A developmental reading is not a manuscript mutation.**
- **Restraint is part of the intelligence.**

## Mission

Build the first trustworthy developmental-reading capability for Writer's Studio: MAIA can read a
Work developmentally, make evidence-grounded observations about how it is developing, and return
those observations for the author's judgment **without changing the Work**.

This is the threshold where Writer's Studio begins moving from manuscript infrastructure into
whole-Work intelligence.

## Trigger

```text
Stage 6A AuthorStructureCommand is merged and witnessed.
```

Mechanically: reviewed structure has become **authored** structure through an explicit member-only
act, that act is on canonical, and a witness exists. Until then Stage 7 has no reliable semantic
map to read against, and any developmental reading would be reading a proposal rather than a Work.

⛔ A session narration that 6A "is done" is not the trigger. The merge on canonical is.

**SATISFIED** — `4b8b34bcf` on `clean-main-no-secrets`, 2026-09-02, the merge of PR #1169.
Verified by post-merge witness: every 6A artifact present on canonical, 503 tests passing there,
the typecheck no-regression gate green, and the Ask-runtime guard still naming
`structure/authorStructure` so MAIA cannot reach the canonical write.

## The flow

```text
TRIGGER      Stage 6A AuthorStructureCommand is merged and witnessed.
    ↓
FIND         What developmental intelligence already exists?
    ↓
UNDERSTAND   What can MAIA truthfully perceive from the manuscript today?
    ↓
DECIDE       Define the first bounded developmental-reading object.
    ↓
BUILD        Evidence → interpretation → developmental reading → review surface
    ↓
PROVE        Real Work, real reader, real evidence, zero silent authorship
    ↓
DONE         Member can ask MAIA for a developmental reading and judge what comes back.
```

---

## 1. FIND — census before invention

Jarvis starts **read-only**. Inspect:

```text
Writer's Studio
├─ Write
├─ Develop
├─ Explore
├─ Review
└─ Publish

Existing intelligence
├─ StructureEvidence
├─ StructureReader
├─ StructureInterpretation
├─ StructureProposal
├─ reviewed structure
├─ manuscript sections
├─ authored structure
├─ Ask MAIA
├─ developmental/editorial code
├─ manuscript notes/threads
└─ existing MAIA context assembly
```

### Questions the census must answer before any architecture is proposed

1. What developmental-editor functionality already exists?
2. What is production code versus experiment/fixture?
3. What manuscript context can MAIA currently receive?
4. Can MAIA address a whole authored division?
5. Can she address the whole Work?
6. What evidence types already exist?
7. What is already persisted?
8. What existing Review/Develop surfaces should own the result?
9. Are there duplicate or legacy developmental paths?
10. What would silently make MAIA an **author** rather than a **reader**?

### Census output form

```text
WS2-07 DEVELOPMENTAL INTELLIGENCE CENSUS

EXISTS
PARTIAL
LEGACY
DUPLICATE
MISSING
DO NOT REUSE
```

⛔ **No repairs during the census.** A defect found is recorded in its row and left alone.

### Orientation pointers — NOT a census

Observed while authoring this lane, at `00988ae`. Recorded so FIND starts from real paths rather
than from memory. **This is not the census and does not pre-empt it** — presence of a file is not
a claim about its state, its callers, or its fitness.

```text
lib/manuscript/structure/evidence.ts           StructureEvidence, EvidenceCoverage,
                                               EvidenceObservation, EvidenceNonConclusion
lib/manuscript/structure/interpret.ts          StructureInterpretation, EditorialQuestion,
                                               UncertainRegion, ReaderInput/Output, StructureReader
lib/manuscript/structure/maiaReader.ts         reader contract, READER_VERSION, promptContractHash
lib/manuscript/structure/readScope.ts          ReadScope, ReadScopeReport
lib/manuscript/structure/readerProvenance.ts   ReaderProvenance, ReaderIdentity
lib/manuscript/structure/review.ts             ReviewedStructure, ReviewOperation, ReviewRefusal
lib/manuscript/structure/proposalStore.ts      proposal persistence
app/writers-studio/canvas/StructureReview.tsx  member review surface
app/writers-studio/canvas/AskMaia.tsx          existing member→MAIA gesture
lib/writersStudio/{structureClient,reviewClient,askClient}.ts
docs/design/contracts/writer-canvas-structure.md   05H Experience Contract
```

The `EvidenceCoverage` / `ReaderProvenance` / `EvidenceNonConclusion` triad is the pattern Stage 7
inherits. Do not reinvent it casually.

---

## 2. UNDERSTAND — define what "developmental reading" means

Do not start with a giant editorial prompt. First define the **epistemic layers**.

```text
WORK
 ↓
MECHANICAL EVIDENCE
 ↓
DEVELOPMENTAL OBSERVATION
 ↓
INTERPRETATION
 ↓
QUESTION / POSSIBILITY
 ↓
AUTHOR JUDGMENT
```

⛔ **These may never collapse into one another.**

Worked example — four different claims, and MAIA must know which one she is making:

| Layer | Claim |
|---|---|
| **Evidence** | Chapter 3 introduces X in sections 18–21 and it does not reappear until section 47. |
| **Observation** | The thread disappears for a substantial stretch of the manuscript. |
| **Interpretation** | This may weaken the reader's sense that X remains active. |
| **Possibility** | You might echo it earlier — or decide the disappearance is intentional. |

This is the Constitutional Direction of Authority applied to a manuscript: authority moves upward
through authored experience only. Evidence may support an observation; an observation may support
an interpretation; **an interpretation may never manufacture the evidence it needs.**

---

## 3. DECIDE — the first developmental object

Do not try to solve all editing at once. The first object:

```ts
DevelopmentalReading {
  scope
  coverage
  observations[]
  questions[]
  provenance
}
```

```ts
type NonEmptyArray<T> = readonly [T, ...T[]];

interface DevelopmentalObservation {
  id: string;
  lens: DevelopmentLens;
  evidenceRefs: NonEmptyArray<EvidenceRef>;
  observation: string;
  interpretation?: string;
  uncertainty?: EvidenceNonConclusion;
  question?: string;
}
```

Two properties of this shape are load-bearing, and they are different in kind.

**`evidenceRefs` is non-empty by type.** This is what makes the layering structural rather than
prompt discipline:

> **No developmental observation exists without recoverable evidence.**

⛔ `evidenceRefs: string[]` does **not** establish that invariant — an empty array satisfies it.
The optional interpretation/question fields do not establish it either. Only the non-empty
evidence relation does. An observation that cannot be constructed without evidence cannot be
serialized without evidence, and cannot survive a round-trip that lost it.

**`interpretation`, `uncertainty` and `question` are optional by design.** An observation that
stops at evidence and observation is a complete, honest object. MAIA does not have to manufacture
an interpretation because the schema has a place for one.

**Identity must be durable.** This is the third load-bearing property, and it is the one most
easily lost by accident:

> **A developmental observation must have durable identity sufficient for a later explicit author
> act to refer back to it. The system may record that declared relationship, but must never infer
> it from textual similarity or temporal proximity.**

The author act that refers back may come at any time — before, during, or after the act it refers
to. What must exist beforehand is therefore not the declaration but **the thing being declared
about.** An observation the author can no longer name unambiguously cannot be referred to later,
and no downstream stage can repair that.

`id: string` above is a field, not a guarantee. It satisfies this only if the identity it carries
outlives the response that produced it and the surface that displayed it.

This binds **07C** and **07D**. 07C must not freeze a reading whose observations are addressable
only within the payload that generated them. 07D must not be the place where an observation's
identity originates or ends — a reading the member encounters is not a disposable UI object whose
identity vanishes when the page closes.

What durable identity actually requires — for reading, observation, and evidence alike — is
downstream of the census. Naming the requirement here is not choosing its mechanism.

`EvidenceRef` and `DevelopmentLens` are named here, not defined. Defining `EvidenceRef` — what a
recoverable pointer into the manuscript actually is, and against which version — is **07A work**,
downstream of the census.

### Initial lenses — v1 is bounded

```text
STRUCTURE
MOVEMENT / ARC
CONTINUITY
REPETITION
READER ORIENTATION
COHERENCE
VOICE / REGISTER
UNRESOLVED THREADS
```

### Explicitly not in v1

```text
"make this better"
automatic rewriting
line editing
generated replacement paragraphs
marketability scores
generic writing grades
arbitrary numerical quality scores
```

Each of these distorts the developmental-reading problem. A quality score in particular converts a
reading into a verdict, and a verdict invites compliance rather than judgment.

---

## 4. Scope hierarchy

MAIA should eventually move through:

```text
sentence → passage → section → chapter / authored division → movement / part → whole Work
```

**Stage 7 begins at:**

```text
AUTHORED DIVISION
+
WHOLE-WORK STRUCTURAL CONTEXT
```

*Read this chapter deeply, while knowing where it lives in the whole manuscript.*

Considerably more useful than isolated chunks; considerably safer than pretending we already have
infinite whole-book cognition. Whole-Work reading is **07G**, not 07A.

⛔ **"Whole-Work structural context" is deliberately left undefined here.** It is a **scope
promise, not an implementation claim.** Whether it resolves to authored topology, headings,
summaries, selected neighbouring bodies, complete manuscript evidence, or something else is a
**FIND output** — determined by what already exists, not chosen in advance.

Naming a context-assembly strategy in this lane would smuggle an architecture past the census
under the appearance of scope. If a strategy appears in a Stage 7 design document before the
census has run, that is the defect, regardless of how good the strategy is.

---

## 5. BUILD — architecture

Reuse the successful pattern from StructureReader.

```text
DevelopmentEvidence
        ↓
DevelopmentReader
        ↓
DevelopmentInterpretation
        ↓
DevelopmentalReading
        ↓
member review / conversation
```

| Layer | Obligation |
|---|---|
| **Evidence** | Mechanical and attributable. Derivable without a model. |
| **Reader** | Interprets the evidence and the manuscript bodies she was **actually given** — never material she inferred she must have had. |
| **Persisted reading** | Frozen record of what MAIA saw and said. Immutable once written. |
| **Member** | Author acts on the reading; the reading does not act on the Work. |

The member may:

```text
agree · disagree · question · dismiss · mark useful · leave unresolved · discuss with MAIA
```

⛔ **None of those automatically change the manuscript.**

⛔ **Member disagreement does not overwrite the frozen reading.** It is recorded alongside it. The
record of what MAIA said must survive the author disagreeing with it.

---

## 6. The first member gesture

In **Develop**:

> **Ask MAIA to read this developmentally**
>
> MAIA will look at how this part of the Work is developing and bring back observations and
> questions. Nothing changes unless you change it.

This continues the sovereignty language already established by Structure Review (05H). The
invocation is a member act. There is no ambient developmental reading.

---

## 7. Critical boundary — constitutional for Stage 7

> **Developmental insight does not create permission to revise the Work.**

> **MAIA may notice, question, compare, and suggest possibilities. She may not convert an
> editorial judgment into manuscript prose without a separate explicit author gesture.**

This is what prevents the developmental editor from quietly becoming an autonomous rewrite engine.
It is the programme invariant at manuscript scale:

```text
SOURCE / MATERIAL → MAIA MAY NOTICE → WRITER MAY RECOGNIZE
                  → WRITER MAY DECIDE → WORK MAY CHANGE
```

⛔ No automatic arrow. Every arrow may stop.

---

## 8. Provenance

Every developmental reading must eventually make this answerable:

```text
What did MAIA read?
Which version?
Which sections?
Which authored structure?
Which model / reader?
Which instructions?
When?
What did she conclude?
What did the member later decide?
```

The StructureReader work gives us the pattern (`readerProvenance.ts`, `promptContractHash()`,
`EvidenceCoverage`). Extend it; do not reinvent it.

**Coverage is a first-class field, not a footnote.** A reading of 40% of a chapter that says so is
trustworthy. A reading of 40% of a chapter that presents itself as complete is a fabrication.

---

## 9. PROVE

The first real witness uses an **actual manuscript passage where the author already knows
something about the developmental problem**. Not filler prose. The author's prior knowledge is the
instrument that detects flattery, hedging, and invention.

```text
member asks for developmental reading
        ↓
MAIA reads bounded real material
        ↓
coverage is visible
        ↓
observations cite actual manuscript evidence
        ↓
interpretation is distinguishable from observation
        ↓
uncertainty remains uncertainty
        ↓
member can challenge the reading
        ↓
Work remains unchanged
```

### Falsifiers

```text
MAIA claims to have read material she did not receive       FAIL
observation contains no recoverable evidence                FAIL
machine failure appears as criticism of manuscript          FAIL
uncertain interpretation presented as established fact      FAIL
reading silently modifies manuscript                        FAIL
member disagreement overwrites frozen MAIA reading          FAIL
MAIA-generated paragraph becomes Work without author act    FAIL
```

Any FAIL is a lane stop, not a known issue.

---

## 10. DONE — Stage 7.1 closure

> A writer can ask MAIA to developmentally read a meaningful part of a real Work; MAIA returns
> evidence-grounded observations and questions in the context of the larger manuscript; the author
> can interrogate that reading; and nothing about the reading itself changes the Work.

That is enough. **Do not require the entire developmental-editor vision to close the first unit.**

---

## Stage 7 sequence

```text
07A  DEVELOPMENTAL EVIDENCE      What can MAIA establish mechanically?
07B  DEVELOPMENTAL READER        Can MAIA make a disciplined reading?
07C  DEVELOPMENTAL READING       Freeze reading + coverage + provenance.
07D  DEVELOP SURFACE             Member explicitly invokes the reading.
07E  DEVELOPMENTAL DIALOGUE      Talk with MAIA about observations.
07F  DEVELOPMENTAL DECISIONS     Keep / dismiss / unresolved / investigate.
07G  WHOLE-WORK DEVELOPMENT      Cross-division patterns, manuscript-scale intelligence.
07H  REVISION BRIDGE             Author deliberately takes an insight into revision.
```

**07A–07D closes Stage 7.1.** 07E–07G extend it.

⛔ **07H is another sovereignty threshold and is not designed here.** It is the point at which an
observation is permitted to become prose. Designing it prematurely — while 07A is unbuilt — is how
the reading boundary gets negotiated away before it has ever been tested.

---

## Growth-obligation answers

Per `CLAUDE.md` and `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`, a capability
increase must answer these. Answered, not passed:

**What uncertainty does this introduce, and how is that uncertainty preserved?**
A developmental reading is interpretive by nature — a thread's disappearance may be a flaw or a
deliberate silence, and MAIA cannot know which. Preserved structurally: `uncertainty` and
`question` are fields on the observation, not prose hedges; coverage is reported; the four
epistemic layers are separately typed so an interpretation cannot be serialized as an observation.

**What provenance and ownership boundaries does this require?**
Every observation carries `evidenceRefs` into the manuscript. Every reading carries reader
identity, prompt contract hash, version read, and scope. The reading is MAIA's and is frozen; the
Work is the author's and is untouched; the decision is the author's and is recorded separately
from both.

**What new responsibility does this capability create?**
The responsibility not to let a plausible reading substitute for the author's own perception of
their Work. A developmental editor that is trusted is more dangerous than one that is ignored.
Hence: bounded lenses, no scores, no rewriting, no automatic arrow, and a member gesture required
for every reading.

## Sovereignty invariant check

| Question | Answer |
|---|---|
| Does this increase user agency? | Yes — it gives the author a second reading of their own Work that they may reject in full. |
| Does this push life outward into the world? | Yes — toward a finished Work that leaves the system. |
| Does this reduce the system's psychological centrality over time? | Conditionally — only if the reading stays a reading. 07H is where this could invert, which is why it is deferred. |
| Cultural sovereignty (Invariant 14) | The manuscript is its own reference. Voice is measured against **this Work**, never an external standard of good writing. No genre norms, no market norms, no grades. |
