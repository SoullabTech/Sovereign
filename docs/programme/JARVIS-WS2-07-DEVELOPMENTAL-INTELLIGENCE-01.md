# JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01

> **Lane opened. Not authorized. Not started.**
>
> This document exists so the lane is defined before it is entered. It authorizes **no code, no
> schema, no route, no prompt**. Entering FIND requires the trigger below to be satisfied on
> canonical — not asserted in a session.

```text
LANE            JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
STATE           OPENED · BLOCKED ON TRIGGER
TRIGGER         Stage 6A AuthorStructureCommand merged to canonical and witnessed
AUTHORIZES      nothing yet — FIND opens when the trigger is satisfied
NORMATIVE       docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
CAPABILITY      docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
LIVE STATE      docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
ROADMAP         docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md
OPENED          2026-09-01
```

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
DevelopmentalObservation {
  id
  lens
  evidenceRefs[]
  observation
  interpretation?
  uncertainty?
  question?
}
```

`interpretation`, `uncertainty` and `question` are **optional by design**. An observation that
carries only evidence and observation is a complete, honest object. An observation that carries an
interpretation with no `evidenceRefs` is not.

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
