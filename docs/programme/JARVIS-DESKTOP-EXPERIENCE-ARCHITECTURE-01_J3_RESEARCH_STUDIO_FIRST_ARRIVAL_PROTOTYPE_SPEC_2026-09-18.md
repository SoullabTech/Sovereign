# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J3 — Research Studio First-Arrival Prototype Specification

**Date:** 2026-09-18
**Accepted parent architecture:** 5df6e96c004712fc4d365ecd4913cded7015e40a
**Companion contract:** J3 Native Shell Experience Contract
**Standing:** FOUNDER-WITNESSABLE PROTOTYPE SPECIFICATION — no implementation authority

---

## 0 · Prototype purpose

This specification defines the first experience prototype for a genuinely native JARVIS Desktop.

It is not a feature-complete Research product.

It is not a Canvas implementation.

It is not a local-file ingestion implementation.

It is not a provider-execution implementation.

It is an experience falsification instrument for one question:

> **Can Project continuity + visible research context + an artifact-forward center + adjacent JARVIS feel qualitatively different from the current operator cockpit and from ordinary AI chat?**

If the answer is no, implementation should not proceed.

---

## 1 · What the prototype must prove

The prototype must make the founder able to experience, not merely imagine:

1. returning to a durable Project;
2. seeing an active inquiry without reconstructing it from chat;
3. holding Sources and Claims in view;
4. working in a center that is not conversation-first;
5. invoking JARVIS on the current context;
6. seeing provenance near Claims;
7. seeing challenge / uncertainty without flattening it;
8. encountering a custody/refusal state that preserves orientation;
9. collapsing JARVIS and continuing to work;
10. returning after absence and finding meaningful continuity.

The prototype fails if it only demonstrates a prettier information architecture.

---

## 2 · Prototype boundary

### Allowed in later visual prototype — only after a separate founder act

- synthetic/local static Project fixture;
- one-window prototype;
- one Research Studio;
- one Project;
- static/deterministic Sources from already-existing repository documents;
- static Evidence Canvas data;
- simulated JARVIS responses grounded in the fixture;
- simulated continuity snapshot;
- simulated custody hold;
- simulated System escape hatch.

### Explicitly not required

- filesystem chooser;
- PDF engine;
- drag/drop;
- source indexing;
- live model call;
- provider execution;
- database;
- Project persistence;
- background jobs;
- multiple windows;
- MAIA;
- network.

This keeps the prototype about **experience**, not infrastructure.

---

## 3 · Witness fixture — Project

### Project name

**Relational Geometry Research**

### Project purpose

> Investigate whether relational structure, transformation and geometry add explanatory value beyond simpler representations without confusing mathematical structure with human meaning.

### Prototype Studio

**Research Studio**

### Active Thread

> **Does geometry add explanatory value beyond simpler relation-first baselines?**

### Why this Thread

It is directly supported as an open research tension by the standing RGR corpus:

- RGR-00 requires a simpler competitor for every geometric claim.
- RGR-01 finds substantial justification for research but insufficient evidence for a unified theory of relational meaning.
- RGR-02 concludes that the minimal common structure is not itself required to be a geometry.
- Graph/structural approaches remain legitimate competitors.
- Meaning is explicitly not reduced to the model.

The prototype therefore demonstrates Research Studio using a real unresolved question, not a staged certainty.

---

## 4 · Witness fixture — Sources

The prototype Source rail uses four exact existing repository artifacts.

### S1 · RGR-00 Research Constitution

File:

docs/programme/RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION_2026-09-18.md

Human-facing label:

**RGR-00 · Research Constitution**

Role:

- epistemic boundary;
- baseline law;
- falsification law;
- relation-first proposition.

Key visible excerpt candidates:

> Relation is the object of inquiry; geometry is a candidate language, not a predetermined answer.

and:

> Every geometric claim requires a simpler competitor.

### S2 · RGR-01 Literature + Mathematical Landscape

File:

docs/programme/RGR-01_LITERATURE_MATHEMATICAL_LANDSCAPE_2026-09-18.md

Human-facing label:

**RGR-01 · Literature Landscape**

Role:

- comparative evidence;
- mathematical families;
- constraints.

Key visible standing:

> substantial justification for a Relational Geometry Reasoning research programme

together with:

> insufficient evidence for a unified theory of relational meaning

### S3 · RGR-01 Claim Ledger

File:

docs/programme/RGR-01_CLAIM_LEDGER_2026-09-18.md

Human-facing label:

**RGR-01 · Claim Ledger**

Role:

- claim-by-claim standing;
- limits;
- source connection.

Prototype-visible caution:

No current RGR-01 claim supports:

- meaning is geometry;
- consciousness is geometry;
- amplituhedron explains human meaning.

### S4 · RGR-02 Formal Vocabulary + Candidate Structures

File:

docs/programme/RGR-02_FORMAL_VOCABULARY_CANDIDATE_STRUCTURES_2026-09-18.md

Human-facing label:

**RGR-02 · Formal Vocabulary**

Role:

- formal common scaffold;
- competing enrichments;
- non-collapse laws.

Key standing:

> the minimal common structure of RGR is not itself required to be a geometry

and:

> geometry enters only through separately justified enrichment.

---

## 5 · Witness fixture — Claims

The prototype contains four durable Research Claims.

### C1 · Relation-first inquiry

**Claim**

> Relation is the primary object of inquiry; geometry remains a candidate language.

**Standing**

Research constitutional proposition.

**Source**

RGR-00.

**Prototype relation**

Supports the Project's relation-first starting point.

### C2 · Geometry may be explanatory in bounded domains

**Claim**

> Geometry can provide explanatory value for some bounded relational-reasoning problems.

**Standing**

Supported in bounded research contexts, not generalized to human meaning.

**Sources**

RGR-01 literature / claim ledger.

### C3 · No unified geometry of meaning is established

**Claim**

> Existing evidence does not establish a unique or universal geometry of human meaning.

**Standing**

Supported negative boundary.

**Sources**

RGR-01.

### C4 · Common scaffold is pre-geometric

**Claim**

> RGR's common scaffold can be typed relationally without requiring geometry.

**Standing**

RGR-02 candidate/closure standing.

**Source**

RGR-02.

---

## 6 · Witness fixture — Unknowns / challenges

### U1 · Explanatory increment

> Where, if anywhere, does a geometric enrichment outperform a graph/relational baseline in explanatory or predictive value?

### U2 · Representation dependence

> Which apparent invariants survive changes in vocabulary, domain or representation?

### U3 · Semantic bridge

> What would justify moving from a formal regularity to a claim about meaning-related structure without analogical laundering?

### U4 · Trajectory

> Does history/trajectory contribute explanatory value beyond current-state structure in future experiments?

---

## 7 · Prototype visual target

The prototype should be designed for a spacious desktop viewport.

The exact production minimum is **not** decided.

For witness, the composition should be judged at a viewport large enough to make three simultaneous zones meaningful:

- Context Rail;
- Main Working Surface;
- JARVIS Presence.

The prototype should also demonstrate that the JARVIS pane can collapse without breaking the Main Surface.

No responsive/mobile behavior is part of this witness.

---

# PART I · SCREEN-BY-SCREEN PROTOTYPE

---

## 8 · Screen P0 — Native arrival

### Purpose

Break immediately from operational-console identity.

### Screen

~~~text
┌────────────────────────────────────────────────────────────────────────────┐
│ JARVIS                                                                     │
│                                                                            │
│ What are you working on?                                                   │
│                                                                            │
│ [ Start something new ]                                                    │
│                                                                            │
│ Recent                                                                     │
│                                                                            │
│  Relational Geometry Research                                              │
│  Does geometry add value beyond relation-first baselines?                  │
│  Last active: Research Studio                                              │
│                                                                            │
│  Elemental Alchemy                                                         │
│  Chapter work                                                              │
│                                                                            │
│                                                            [ System ]      │
└────────────────────────────────────────────────────────────────────────────┘
~~~

### Deliberately absent

- provider status;
- Builder health;
- Work Unit version;
- route;
- System cards;
- Living Spiral;
- model chooser.

### Founder witness question

> Does this feel like opening a place to work rather than opening infrastructure?

### Prototype interaction

Click:

**Relational Geometry Research**

→ P1.

---

## 9 · Screen P1 — Return to Project

### Purpose

Prove Project continuity before Studio detail.

### Screen

~~~text
┌────────────────────────────────────────────────────────────────────────────┐
│ Relational Geometry Research                              Research Studio   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ You were here                                                              │
│                                                                            │
│ Active Thread                                                              │
│ Does geometry add explanatory value beyond simpler relation-first          │
│ baselines?                                                                 │
│                                                                            │
│ Working surface                                                            │
│ Evidence Canvas                                                            │
│                                                                            │
│ In view                                                                    │
│ 4 Sources · 4 Claims · 4 Unknowns                                          │
│                                                                            │
│ Unresolved                                                                 │
│ • geometric enrichment has not yet earned necessity                        │
│ • semantic bridge remains open                                             │
│                                                                            │
│ Last human decision                                                        │
│ Keep geometry as an enrichment candidate, not the common core.             │
│                                                                            │
│ [ Resume Research ]                    [ Orient me first ]                  │
└────────────────────────────────────────────────────────────────────────────┘
~~~

### Language law

The continuity statement describes:

- active Thread;
- working surface;
- materials;
- unresolved work;
- human decision.

It does not say:

- what Kelly believes;
- how Kelly feels;
- what Kelly is "really exploring";
- psychological identity.

### Founder witness question

> Does this feel like faithful return rather than AI memory theater?

### Interactions

**Resume Research**

→ P3.

**Orient me first**

→ P2.

---

## 10 · Screen P2 — Project Home

### Purpose

Show a Project as a durable context independent of one Studio.

### Temporary witness chrome

~~~text
[ Relational Geometry Research ▾ ]              [ Research ]       [ System ]
~~~

This chrome is temporary and does **not** ratify permanent top-level navigation.

### Main content

~~~text
Project purpose
Investigate relational structure and geometry without collapsing formal model
into ontology or lived meaning.

Continue
Evidence Canvas · Thread: Does geometry add explanatory value...?

Active Threads
• Does geometry add explanatory value beyond relation-first baselines?
• Which invariants survive representation change?
• When does trajectory add explanatory value?

Materials
4 Sources
1 working synthesis Artifact

Open questions
4

Recent human decision
Keep the common scaffold pre-geometric.

JARVIS
Possible next act:
Compare the graph/structural and subspace/Grassmann candidates on what each
explains that the other does not.

[ Open Research Studio ]
~~~

### Founder witness question

> Does this tell you what is alive in the Project without becoming an activity feed?

---

## 11 · Screen P3 — Research Studio / populated arrival

### Purpose

Prove the new native composition.

### Full composition

~~~text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Relational Geometry Research ▾      Research Studio      Thread: Geometry vs baseline    │
├──────────────────────┬────────────────────────────────────────────┬──────────────────────┤
│ CONTEXT              │ RESEARCH                                   │ JARVIS               │
│                      │                                            │                      │
│ Threads              │ Does geometry add explanatory value        │ Ask                  │
│ ● Geometry vs base   │ beyond relation-first baselines?           │ Explain              │
│ ○ Invariants         │                                            │ Compare              │
│ ○ Trajectory         │ ┌────────────────────────────────────────┐ │ Challenge            │
│                      │ │ Evidence Canvas                        │ │ Synthesize           │
│ Sources              │ │                                        │ │                      │
│ 4                    │ │  [ C1 Relation-first ]                 │ │ Current context      │
│                      │ │        │                                │ │ Thread + 4 Sources   │
│ Artifacts            │ │        ├── supports ── [ C3 boundary ] │ │                      │
│ 1                    │ │        │                                │ │                      │
│                      │ │        └── ? ─────── [ U1 increment ]  │ │                      │
│ Unknowns             │ │                                        │ │                      │
│ 4                    │ │  [ C4 pre-geometric scaffold ]         │ │                      │
│                      │ │          ↕ challenges need for geometry │ │                      │
│                      │ └────────────────────────────────────────┘ │                      │
├──────────────────────┴────────────────────────────────────────────┴──────────────────────┤
│ Local Project · 4 Sources · 1 unresolved conflict · provenance available · no activity │
└──────────────────────────────────────────────────────────────────────────────────────────┘
~~~

### Experience hierarchy

1. Thread / inquiry.
2. Main work.
3. Sources / Artifacts.
4. JARVIS.
5. custody/provenance strip.
6. mechanism only on demand.

### Founder witness questions

- Is the inquiry more visually important than JARVIS?
- Does the center feel like research rather than dashboard?
- Does the left rail provide useful context without becoming a file tree?
- Does JARVIS feel adjacent rather than absent or dominant?

---

## 12 · P3A — JARVIS collapsed

### Purpose

Test whether the Project remains complete without visible AI.

### State

The right pane collapses to a slim affordance:

~~~text
[ JARVIS › ]
~~~

The center expands.

### Required result

The user can still:

- inspect Claims;
- open Sources;
- move through Threads;
- read synthesis;
- understand current custody;
- preserve the working context.

### Falsifier

If collapsing JARVIS makes the experience feel empty, the architecture is still chat-dependent.

---

## 13 · Screen P4 — Claim focus

### Trigger

Click C4:

**Common scaffold is pre-geometric.**

### Main surface

~~~text
CLAIM

RGR's common scaffold can be typed relationally without requiring geometry.

Standing
Supported by RGR-02 formal closure.

Evidence
1 primary project Source

Challenges / pressure
• Does a later experiment show that a geometric enrichment explains more?
• Does a graph baseline suffice?

Unknown
No experimental comparison has yet established necessity.

[ Open Source ]  [ Show provenance ]  [ Ask JARVIS ]  [ Challenge Claim ]
~~~

### Progressive disclosure

Default does not show:

- Work Unit id;
- provider;
- route;
- SHA.

**Show provenance** may show:

~~~text
Human / research programme authored
Source: RGR-02 Formal Vocabulary
Observed in Project fixture
No JARVIS-generated edit to this Claim
~~~

### Founder witness question

> Is the provenance close enough to calibrate trust without turning the Claim into a system record?

---

## 14 · Screen P5 — Source Reader

### Trigger

Open RGR-02 Source.

### Composition

Context Rail remains.

Main surface becomes a document/source reader.

JARVIS pane remains adjacent.

~~~text
RGR-02 · Formal Vocabulary

Local repository source
Observed / available

────────────────────────────────────────

[ document body / selected excerpt ]

"...the minimal common structure ... is not itself required to be a geometry..."

────────────────────────────────────────

Used by
C4 Common scaffold is pre-geometric

[ Back to Canvas ]   [ Show full provenance ]
~~~

### Prototype rule

Source Reader does not need to implement a real Markdown engine yet.

Witness needs only to show that:

- Source can become the center;
- Project context stays;
- JARVIS stays adjacent;
- Source standing is visible.

---

## 15 · Screen P6 — Ask JARVIS from a Claim

### Trigger

From C4:

**Ask JARVIS**

Prompt:

> What would falsify this Claim?

### JARVIS response anatomy

~~~text
JARVIS

Within this Project, the Claim would be pressured if a later experiment showed
that a specifically geometric representation consistently explains or predicts
relational phenomena that graph/relational baselines do not.

Project basis
• RGR-00 requires a simpler competitor for every geometric claim.
• RGR-02 currently treats vector, graph, Grassmann and sheaf approaches as
  competing enrichments rather than one preselected answer.

What remains unknown
No experiment in the current Project has yet established that increment.

[ Show basis ] [ Add as proposed Unknown ] [ Keep conversational ]
~~~

### Critical law

JARVIS response distinguishes:

- Project basis;
- synthesis/inference;
- unknown.

### Durable authorship

**Add as proposed Unknown**

creates a **proposal state**, not automatic durable Project content.

Prototype can represent:

~~~text
PROPOSED UNKNOWN
Would geometry still add value under a matched-complexity graph baseline?

[ Accept into Project ] [ Edit ] [ Dismiss ]
~~~

### Founder witness question

> Does JARVIS contribute to the research without silently becoming the author of the Project's epistemic structure?

---

## 16 · Screen P7 — Compare Sources

### Trigger

Select S1 + S2 + S4.

Click:

**Compare**

### Main surface — temporary comparison

~~~text
COMPARISON

Question
Does geometry add explanatory value beyond a relation-first baseline?

                 RGR-00              RGR-01               RGR-02
Purpose          constitution        literature            formal scaffold

Geometry         candidate language  useful in bounded     competing
                                      domains               enrichment

Baseline law     required             graph/vector remain   formalism
                                      competitors            neutrality

Meaning claim    not reduced          no universal          not defined
                                      geometry               by formalism

Open pressure    falsify necessity    compare families      experiment later
~~~

### Law

This comparison is a working view.

It does not automatically create:

- Claim;
- decision;
- Artifact.

### Actions

- **Save as Artifact**
- **Ask about this comparison**
- **Return to Canvas**

Saving as Artifact is simulated in prototype only.

---

## 17 · Screen P8 — Challenge a Claim

### Trigger

Select C2:

> Geometry can provide explanatory value for some bounded relational-reasoning problems.

Click:

**Challenge**

### JARVIS posture

Not adversarial theatrics.

It should surface:

- narrower interpretation;
- counterevidence;
- baseline competitor;
- generalization limit.

### Candidate response

~~~text
Challenge

The Project supports bounded cases where geometry is explanatory.

It does not yet support:
• one geometry across domains
• necessity of geometry over graph/structural baselines
• transfer from representation geometry to lived meaning

A stronger falsifier would compare the same target phenomenon under:
1. graph/relational baseline
2. geometric enrichment
3. matched complexity

[ Add falsifier proposal ] [ Show supporting Sources ]
~~~

### Founder witness question

> Does "Challenge" feel epistemically useful rather than like another model personality?

---

## 18 · Screen P9 — Custody hold

### Purpose

Witness refusal without losing the Project.

### Trigger

JARVIS proposes a broader external comparison requiring material outside current allowed custody.

### Screen treatment

Main work remains visible but dimmed only minimally.

A contained authority sheet appears:

~~~text
External comparison held

The selected Project material is currently Local.

Nothing has been sent.

Requested material
• RGR-00 Research Constitution
• RGR-01 Literature Landscape
• RGR-02 Formal Vocabulary

Purpose
Independent challenge of Claim C2.

Only these 3 Sources would be included.

No other Project notes, Threads or Artifacts are part of the request.

[ Cancel ]   [ Review crossing ]
~~~

### Prototype boundary

**Review crossing** does not continue anywhere in J3.

It can end with:

> Canonical external execution is not part of this prototype.

### Founder witness questions

- Do you understand what would cross?
- Do you know nothing has crossed?
- Do you still know where you are in the research?
- Does the hold feel trustworthy rather than obstructive?

---

## 19 · Screen P10 — Source unavailable

### Purpose

Test continuity under partial failure.

### Context Rail

S2 shows:

~~~text
RGR-01 Literature Landscape
Unavailable
Last observed state preserved
~~~

### Main notice

~~~text
One Source is unavailable.

Your Canvas, Claims and prior provenance are intact.

JARVIS will not treat the Source as currently readable.

[ Continue ] [ Show affected Claims ]
~~~

### Law

No silent redownload / relocation / substitution.

---

## 20 · Screen P11 — Changed Source

### Purpose

Test version honesty.

### Source card

~~~text
RGR-02 Formal Vocabulary
Changed since last observation
~~~

### Main prompt

~~~text
This Source changed after the evidence state currently represented in the Canvas.

[ Review new version ]
[ Keep prior observed version for this research state ]
~~~

### Law

The prototype should communicate:

- evidence has temporal standing;
- current file and prior evidence state are not silently conflated.

No implementation of file watching is needed.

---

## 21 · Screen P12 — Synthesis Artifact

### Purpose

Show that research can become an Artifact and later feed another Studio.

### Artifact

**Working note · Geometry as enrichment, not common core**

Content structure:

- current thesis;
- evidence;
- challenge;
- unknowns;
- next experiment pressure.

### Main actions

- Edit
- Show provenance
- Return to Canvas
- Later: Open in Writing Studio — shown as **future / unavailable** in prototype.

### Why this matters

Research Studio should produce durable work, not only conversation.

---

## 22 · Screen P13 — Project switch / cockpit secondary

### Purpose

Demonstrate that System truth remains reachable without dominating Project UX.

Temporary project bar includes:

**System**

Click opens a simplified representation:

~~~text
SYSTEM

Desktop / Builder
Available

Continuity
Available

Canonical Work Unit substrate
Available

Provider execution
Compatibility / advanced

[ Open advanced operational console ]
~~~

The old cockpit can be represented as an advanced surface.

### Law

Prototype does not redesign System deeply.

It only proves the Project experience can exist without deleting system truth.

---

# PART II · STATE MODEL

---

## 23 · Prototype Project state

Documentary state only:

~~~text
Project
  id: research-relational-geometry
  title: Relational Geometry Research
  purpose: ...
  active_studio: research
  active_thread: geometry-vs-baseline
  sources: [S1,S2,S3,S4]
  claims: [C1,C2,C3,C4]
  unknowns: [U1,U2,U3,U4]
  artifacts: [A1]
  active_surface: evidence-canvas
  jarvis_pane: open
~~~

No storage format is ratified.

---

## 24 · Prototype continuity state

~~~text
last_active:
  studio: research
  thread: geometry-vs-baseline
  surface: evidence-canvas
  selected_claim: C4
  selected_sources: [S1,S4]

unresolved:
  - U1
  - U3

last_human_decision:
  "Keep geometry as an enrichment candidate, not the common core."

next_intended_act:
  "Define a fair graph-vs-geometry comparison."
~~~

This is orientation state.

It is not a psychological profile.

---

## 25 · Prototype authorship state

Every durable semantic object carries candidate authorship:

- HUMAN
- JARVIS_PROPOSED
- ACCEPTED_JARVIS_PROPOSAL
- SOURCE_DERIVED
- SYSTEM_STATE

### Example

C4:

**SOURCE_DERIVED / HUMAN-ACCEPTED PROJECT CLAIM**

JARVIS challenge proposal:

**JARVIS_PROPOSED**

Until accepted.

---

## 26 · Prototype provenance state

A Claim inspector should be able to answer:

- who authored this?
- which Source supports it?
- what evidence relation exists?
- what challenges it?
- what is unknown?
- when did standing change?

No claim should require opening System to answer those.

---

# PART III · VISUAL / INTERACTION SPEC

---

## 27 · Visual hierarchy

### Highest hierarchy

- Project;
- active inquiry;
- active Artifact/Canvas.

### Secondary

- Sources;
- Threads;
- JARVIS.

### Tertiary

- custody;
- provenance summary;
- holds;
- advanced mechanism.

### Anti-pattern

A route/status/provider banner spanning the top of every Project screen.

---

## 28 · Typography

### Prototype rules

Primary reading text must be comfortably readable.

Avoid the current cockpit's small developer-oriented typography for:

- Sources;
- Claims;
- synthesis;
- JARVIS responses;
- continuity.

Monospace is reserved for:

- exact path;
- identifier;
- formal notation;
- advanced provenance.

Not for all human text.

---

## 29 · Color

J3 does not ratify a palette.

Prototype should use:

- restrained background;
- clear text contrast;
- subtle distinction between Source / Claim / Unknown / Proposal;
- state semantics not encoded by color alone.

Avoid turning epistemic status into traffic-light aesthetics.

---

## 30 · Motion

Minimal.

Potentially useful:

- pane collapse;
- focus transition;
- opening Claim inspector;
- revealing provenance.

Avoid:

- pulsing AI presence;
- animated activity implying agency when none is occurring;
- attention capture.

---

## 31 · Context Rail behavior

### Default width

Enough for meaningful titles, not a narrow icon strip.

### Collapse

Allowed.

When collapsed:

- active Thread remains visible somewhere;
- Project orientation is not lost.

### Sections

Collapsible:

- Threads;
- Sources;
- Artifacts;
- Unknowns.

No section shows arbitrary filesystem hierarchy.

---

## 32 · JARVIS pane behavior

### Open

Shows:

- current context label;
- response history only for the current working exchange;
- human action verbs.

### Collapsed

Preserves:

- main work;
- no modal obstruction;
- no lost content.

### Reopen

Restores current exchange in context of active Project/Thread.

### Prototype law

The right pane is not a general chat history browser.

Long-term continuity belongs to Project objects, not transcript scroll.

---

## 33 · Main surface switching

Candidate surface switcher inside Research Studio:

- Canvas
- Source
- Synthesis

This is not permanent IA.

### Law

Switching Main Surface preserves:

- Project;
- Thread;
- Context Rail;
- JARVIS context.

---

## 34 · Canvas candidate representation

For witness only.

Nodes can be represented as:

- restrained boxes/cards;
- labels;
- clear type markers;
- textual relation labels.

No need for zoom/pan physics in first prototype.

### Priority

Semantic clarity > visual spectacle.

---

## 35 · Claim type presentation

Candidate badges:

- CLAIM
- QUESTION
- UNKNOWN
- SOURCE
- PROPOSED

Evidence standing can use text:

- supported;
- challenged;
- unresolved;
- not yet tested.

Avoid numerical confidence without an actual instrument.

---

## 36 · JARVIS grounding display

Every substantive Research response may have a compact footer:

~~~text
Project basis
RGR-00 · RGR-02

Inference
yes

Unknowns retained
1
~~~

Expand:

**Show basis**

### Why

The response should answer:

> "How does JARVIS know that?"

without forcing System view.

---

## 37 · Proposal interaction

When JARVIS wants to change durable Project structure:

~~~text
Proposed Unknown

Would geometry still add value under a matched-complexity graph baseline?

[ Accept ] [ Edit ] [ Dismiss ]
~~~

The Project does not change until the human acts.

Prototype should test whether this feels clear rather than bureaucratic.

---

# PART IV · WITNESS PROTOCOL

---

## 38 · Witness posture

Do not explain the architecture before first exposure.

Founder should encounter the prototype with only:

> **Open the Project and work with the inquiry.**

Explanation can follow after immediate witness.

---

## 39 · Witness sequence

### W0 · Open JARVIS

Observe:

- what draws attention first;
- whether Project identity is obvious;
- whether old cockpit expectations remain.

Question afterward:

> What kind of thing did this feel like?

### W1 · Resume Project

Founder chooses:

**Relational Geometry Research**

Observe:

- whether "You were here" is sufficient;
- whether the unresolved question feels alive.

Question:

> Did you feel returned to work already in motion?

### W2 · Enter Research Studio

Observe:

- center vs JARVIS attention;
- Source/Thread orientation;
- legibility.

Question:

> What feels primary here?

### W3 · Open C4

Observe:

- Claim comprehension;
- provenance proximity.

Question:

> Do you know what this Claim is, where it came from, and what remains uncertain?

### W4 · Open Source

Observe:

- whether Project context survives reading.

Question:

> Did opening the Source feel like leaving the Project?

Desired:

**No.**

### W5 · Ask JARVIS

Prompt:

> What would falsify this Claim?

Observe:

- grounding;
- adjacent intelligence;
- proposed Unknown behavior.

Question:

> Did JARVIS contribute without taking authorship of the research?

### W6 · Compare Sources

Observe:

- whether comparison is useful;
- whether it feels temporary vs durable.

Question:

> Would you know what became part of the Project and what was just a working view?

### W7 · External hold

Observe custody sheet.

Question:

> Do you know exactly what has and has not happened?

### W8 · Collapse JARVIS

Observe whether work still feels whole.

Question:

> Is this still a complete Research environment without the AI pane open?

### W9 · Return after absence

Use P1 continuity state.

Question:

> Is this enough to resume intelligently?

---

## 40 · Founder witness response schema

For each witness act capture:

### Immediate

- first feeling;
- confusion;
- attraction;
- resistance;
- where attention went.

### Orientation

- knew Project?
- knew Thread?
- knew current surface?
- knew next possible act?

### Human experience

- more capable?
- more oriented?
- more able to hold complexity?
- more free to disagree?
- overwhelmed?
- manipulated toward activity?

### Native value

> What did Desktop make possible here that a normal chat/PWA would not?

### Falsifier

> What makes this still feel like a cockpit, dashboard or chat app?

---

## 41 · Founder witness decision vocabulary

Per prototype:

- **TAKE** — core composition feels right enough to implement boundedly.
- **REFINE** — architecture survives; specific experience changes owed.
- **REBUILD** — shell metaphor is wrong.
- **PARK** — native value not yet established.
- **REJECT** — prototype does not justify implementation.

No implementation should start from ambiguous praise alone.

---

# PART V · EXPERIENCE FALSIFIERS

---

## 42 · Shell falsifiers

Fail prototype if:

1. Project identity is not immediately legible.
2. returning still requires transcript reconstruction.
3. Context Rail feels like a file manager.
4. Main Surface feels like a dashboard.
5. JARVIS pane is visually dominant.
6. collapsed JARVIS makes the experience useless.
7. System state bleeds into ordinary research.
8. Work Unit machinery is visible without reason.
9. permanent nav is accidentally implied as settled.
10. Project feels like a renamed chat room.

---

## 43 · Research falsifiers

Fail prototype if:

11. Claims cannot be distinguished from Sources.
12. JARVIS inference cannot be distinguished from Source claim.
13. Counterevidence disappears under synthesis.
14. Unknowns feel like errors rather than valid research objects.
15. comparison views silently become durable truth.
16. a Source being present implies it has been read.
17. provenance requires leaving the research context.
18. proposed JARVIS structures silently persist.
19. Canvas edges imply unsupported certainty.
20. synthesis erases competing formalism.

---

## 44 · Custody falsifiers

Fail prototype if:

21. local/external standing is unclear.
22. external hold sounds like an error after data already left.
23. refusal removes the person from the research context.
24. broader filesystem access appears ambient.
25. Source availability and disclosure standing are conflated.

---

## 45 · Continuity falsifiers

Fail prototype if:

26. "You were here" overclaims belief/identity.
27. unavailable Source makes Project unrecoverable.
28. changed Source silently updates prior evidence.
29. last state is merely last open screen with no semantic continuity.
30. next intended act is inferred as human intention without authorship.

---

## 46 · Native-value falsifiers

Fail prototype if:

31. everything could be replaced by one chat with uploads.
32. multi-pane view adds visual clutter without working-memory value.
33. Source/Canvas persistence does not change reasoning quality.
34. native Project continuity feels no different from conversation history.
35. the app still fundamentally advertises AI features rather than supports human work.

---

# PART VI · PROTOTYPE ARTIFACT REQUIREMENTS

---

## 47 · Required prototype screens

A later prototype implementation must include, at minimum:

1. P0 Native arrival.
2. P1 Return to Project.
3. P2 Project Home.
4. P3 Research Studio populated.
5. P3A JARVIS collapsed.
6. P4 Claim focus.
7. P5 Source Reader.
8. P6 Ask JARVIS / proposed Unknown.
9. P7 Compare Sources.
10. P8 Challenge Claim.
11. P9 External hold.
12. P10 Source unavailable.
13. P11 Source changed.
14. P12 Synthesis Artifact.
15. P13 System escape hatch.
16. P1 return-after-absence reprise.

These can be mocked as one interactive prototype; no production persistence is required.

---

## 48 · Required prototype interactions

Must function in prototype:

- choose Project;
- Resume vs Orient;
- switch Thread;
- select Claim;
- open Source;
- show provenance;
- collapse/reopen JARVIS;
- Ask;
- Compare;
- Challenge;
- view proposed Project object;
- accept/edit/dismiss proposal;
- show custody hold;
- continue after Source unavailable;
- simulate changed Source;
- open Synthesis Artifact;
- open System;
- return to Project state.

---

## 49 · Interactions deliberately nonfunctional

Prototype should visibly stop rather than fake:

- external provider execution;
- arbitrary local file import;
- background research;
- save to filesystem;
- real source watching;
- multiple windows;
- MAIA;
- project sync;
- shared collaboration.

Nonfunctional controls should be labeled:

**Prototype boundary**

not:

**Coming soon**

unless product intent is actually approved.

---

## 50 · Prototype fixture integrity

The prototype must not invent research standing inconsistent with the source corpus.

Fixture copy must preserve:

- geometry as candidate, not predetermined answer;
- meaning not reduced to formal model;
- simpler baseline requirement;
- competing formal families;
- no universal geometry-of-meaning claim;
- RGR-02 pre-geometric common scaffold.

Any simplified copy used in mockups is product copy, not a new research conclusion.

---

# PART VII · DESIGN HANDOFF

---

## 51 · What implementation should learn from witness

If prototype is TAKE / REFINE, implementation should leave the witness with answers to:

- which shell zones survived;
- what should be removed;
- whether Context Rail is necessary;
- whether JARVIS belongs right or can float contextually;
- whether Canvas is valuable;
- whether Project Home adds value;
- whether temporary nav needs revision;
- whether provenance density is right;
- whether custody strip is visible enough;
- what the first real Source contract must support.

---

## 52 · First implementation gate after witness — not authorized here

The smallest later implementation should still avoid arbitrary file access.

Candidate first implementation:

- Project shell using synthetic or repository-bounded fixture;
- one Project;
- Research Studio;
- static Project manifest;
- existing repository Source refs only;
- no new IPC if possible;
- no provider execution;
- no Canvas persistence;
- no background work;
- no database.

Its job would be to prove the shell in real Electron rendering before opening local-file custody.

This requires a new founder act.

---

## 53 · Decision still held after J3

J3 does not decide:

- permanent top-level navigation;
- Library architecture;
- universal Canvas primitive;
- multi-window Project model;
- Project storage;
- local-file custody implementation;
- JARVIS/MAIA identity outside Research;
- canonical provider execution.

---

## 54 · J3 standing

**RESEARCH STUDIO FIRST-ARRIVAL PROTOTYPE SPECIFICATION: COMPLETE AS A DOCUMENTARY CANDIDATE**

The next legitimate act is:

> **FOUNDER EXPERIENCE-WITNESS AUTHORIZATION FOR A NON-PRODUCTION, NON-AUTHORITY-EXPANDING INTERACTIVE PROTOTYPE**

That future prototype may make J3 visible and clickable, but may not silently become implementation.
