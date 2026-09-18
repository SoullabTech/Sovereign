# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J2 — Candidate Native Experience Architecture

**Date:** 2026-09-18
**Canonical base:** 9580ad382089e8ce2e454d28ff3d97c2aa8efe11
**Inputs:** J0 Charter · J1 Census · I4 canonical Work Unit v2 · Human Experience Architecture · Desktop Operator Flow
**Standing:** CANDIDATE — documentary architecture only; no implementation authority

---

## 0 · Candidate thesis

The native JARVIS Desktop should be organized around:

> **durable human contexts in which meaningful work, learning, development and creation unfold over time.**

The primary visible object is therefore:

> **PROJECT / LIVING CONTEXT**

The primary hidden constitutional object remains:

> **WORK UNIT**

The relationship is:

~~~text
PROJECT / LIVING CONTEXT
        │
        ├── human purpose
        ├── files / sources / artifacts
        ├── threads / questions
        ├── Studio state
        ├── continuity
        ├── canvases
        └── Work Units
              governed consequential acts
~~~

This prevents two opposite failures:

1. **Cockpit collapse** — making the human think in Work Units, routes, providers and lifecycle machinery.
2. **Governance disappearance** — creating beautiful Studios that quietly invent their own authority, memory and execution rules.

---

## 1 · Core architectural distinction

### Project is context, not execution authority

A Project may define:

- purpose;
- local materials deliberately attached;
- shared/source references;
- Studio state;
- threads;
- artifacts;
- project-level custody preferences;
- continuity metadata.

A Project does **not** by itself authorize:

- provider execution;
- repository writes;
- external disclosure;
- model spend;
- deployment;
- production access;
- background autonomous action.

Those remain governed by Work Units and other explicit authority instruments.

### Work Unit is consequential act, not workspace

A Work Unit governs a bounded act such as:

- research synthesis;
- code change;
- source comparison;
- artifact generation;
- model review;
- verification;
- external reasoning;
- later canonical provider execution.

It does not become the person's Project, notebook, journal, course or developmental history.

---

## 2 · Candidate object model

~~~text
DESKTOP
│
├── PROJECT
│   │
│   ├── PROJECT MANIFEST
│   │   purpose · title · created state · custody · local roots · participants
│   │
│   ├── THREADS
│   │   questions · intentions · problems · developmental arcs
│   │
│   ├── SOURCES
│   │   bounded local refs · web refs · library refs · conversation refs
│   │
│   ├── ARTIFACTS
│   │   docs · notes · outputs · plans · lessons · practices · media
│   │
│   ├── STUDIOS
│   │   research · teaching · mentoring · becoming · writing · building
│   │
│   ├── CANVASES
│   │   spatial working arrangements
│   │
│   ├── CONTINUITY SNAPSHOTS
│   │   resumable human/project state
│   │
│   ├── SESSIONS
│   │   bounded encounters / working periods
│   │
│   └── WORK UNITS
│       governed acts and evidence
│
├── LIBRARY
│   reusable sources / artifacts / primers / references
│
└── SYSTEM
    substrate health · custody · provenance · compatibility · diagnostics
~~~

The exact storage representation is not decided here.

---

## 3 · Project Manifest — candidate contract

A Project Manifest should eventually be able to answer:

### Identity

- project id;
- human-facing name;
- project kind, if useful;
- created at;
- archived/active state.

### Purpose

- what is this context for?
- what is the person trying to understand, create, learn, teach, develop or accomplish?
- what would meaningful progress look like?

### Custody

- default locality;
- deliberately attached local roots;
- external-source policy;
- sensitivity;
- member/client/professional standing if applicable;
- whether background work is permitted at all.

### Context

- active Threads;
- active Studio;
- selected artifacts;
- sources;
- participants/people where appropriate;
- linked Work Units.

### Continuity

- last meaningful state;
- unresolved questions;
- last active artifact;
- last Studio;
- next intended act;
- last adjudicated decision.

### Important law

The Manifest describes the context.

It does not contain ambient model/provider execution permission.

---

## 4 · Thread — candidate contract

A Thread is a durable line of human attention.

Examples:

- "What is relational geometry actually claiming?"
- "Build the argument for Chapter 10."
- "Understand grief through these frameworks."
- "Prepare this student to understand Jung's transcendent function."
- "What keeps happening in this relationship?"
- "Design the provider-execution connector safely."

Candidate fields:

- id;
- title/question/intention;
- status: OPEN | PARKED | RESOLVED | SUPERSEDED;
- origin;
- related artifacts;
- related sources;
- related Work Units;
- decisions;
- contradictions/unknowns;
- last touched;
- next intended act.

Threads should survive conversations and Studio changes.

---

## 5 · Artifact — candidate contract

Artifact is the broad human-facing work object.

Candidate types:

- note;
- document;
- source;
- dataset;
- image;
- audio;
- video;
- lesson;
- practice;
- plan;
- report;
- presentation;
- code/file reference;
- canvas;
- generated result.

Every Artifact should distinguish:

- content;
- origin;
- custody;
- provenance;
- editable vs source/reference;
- local vs external;
- canonical vs derived;
- version/history if relevant.

A local source file and an editable JARVIS-created document are not the same thing.

---

## 6 · Source Reference — candidate contract

The native Desktop needs a bounded way to bring the person's materials into a Project.

Candidate source classes:

~~~text
LOCAL_FILE_REF
LOCAL_FOLDER_REF
REPOSITORY_REF
WEB_REF
LIBRARY_REF
CONVERSATION_REF
ARTIFACT_REF
WORK_UNIT_EVIDENCE_REF
~~~

A Source Reference should preserve:

- source class;
- human-visible label;
- exact locator;
- custody;
- whether content has been read/indexed;
- whether content may leave the device;
- provenance/digest where appropriate;
- access standing;
- last observed state.

### Law

Attaching a file is not permission to scan the containing filesystem.

Attaching a folder is not permission to disclose it externally.

External use remains an explicit crossing.

---

## 7 · Studio — candidate contract

A Studio is a **mode of working inside a Project**, not an independent authority domain.

Every Studio contract should define:

### Human purpose
What kind of human activity is this Studio supporting?

### Primary work object
Document? Canvas? Lesson? Practice? Source set? System?

### Instruments
Which tools/views are appropriate?

### Intelligence posture
How is JARVIS present — dialogue, inline help, critique, teaching, comparison, suggestion, silence?

### Continuity state
What must be resumable next time?

### Provenance posture
What evidence/citations/history must remain inspectable?

### Custody
What material is likely to be sensitive?

### Side effects
What can change only through a Work Unit or explicit gesture?

### Identity
Is the intelligence JARVIS, MAIA, another role, or explicitly unresolved?

### Exit
What does "leave this Studio" mean? Does work persist without requiring closure?

---

## 8 · Studio families — candidate

Studios are **composable lenses over the same Project**.

A Project might move:

~~~text
Research Studio
      ↓
Writing Studio
      ↓
Teaching Studio
~~~

without copying the underlying sources and Threads into three databases.

### Research Studio

Primary objects:

- question;
- source;
- claim;
- evidence;
- unknown;
- synthesis.

### Teaching / Learning Studio

Primary objects:

- concept;
- lesson;
- example;
- misunderstanding;
- practice;
- mastery evidence.

### Mentor / Supervision Studio

Primary objects:

- person/case/project context;
- goal;
- observation;
- interpretation;
- question;
- practice;
- next act;
- longitudinal change.

### Becoming / Personal Studio

Primary objects:

- inquiry;
- reflection;
- practice;
- pattern;
- contradiction;
- value/intention;
- developmental arc.

### Writing / Making Studio

Primary objects:

- draft;
- source;
- structure;
- revision;
- editorial decision;
- artifact.

### Systems / Builder Studio

Primary objects:

- system;
- architecture;
- task;
- evidence;
- diff;
- test;
- decision;
- governed execution.

---

## 9 · Shared native shell — candidate architecture

The common shell should preserve Project continuity while allowing the center to change by Studio.

Candidate structural zones:

### A · Project Context Rail

Persistent, collapsible.

Possible contents:

- Project identity;
- Threads;
- Sources;
- Artifacts;
- Timeline;
- People/context where appropriate;
- Studio switch;
- recent/active Work Units only when relevant.

### B · Main Working Surface

Changes by Studio.

Examples:

- Research Canvas;
- source/document viewer;
- Writing document;
- lesson map;
- practice space;
- architecture/system canvas.

This should receive the majority of screen space.

### C · Intelligence / Presence Pane

JARVIS is adjacent to the work.

Possible behaviors:

- dialogue;
- ask about current object;
- explain;
- critique;
- contrast;
- synthesize;
- suggest next questions;
- remain quiet.

The intelligence pane should be collapsible and should not erase the work when opened.

### D · Continuity / Evidence Strip

Low-attention but available.

Possible contents:

- current custody;
- provenance;
- background governed activity;
- unresolved hold;
- next lawful act;
- last decision;
- save/sync standing.

Governance should surface here when needed rather than filling the main canvas permanently.

---

## 10 · Candidate arrival architecture

Current Desktop opens into Home.

Candidate future native arrival:

### Returning person

~~~text
JARVIS
  ↓
Last active Project
  ↓
"You were here"
  - active Thread
  - active Artifact / Canvas
  - unresolved question
  - last meaningful decision
  - background activity standing
  ↓
Resume
~~~

Not:

~~~text
status dashboard
provider health
route machinery
~~~

unless the person chooses System or a problem requires intervention.

### New work

First question:

> **What are you working on?**

Then JARVIS may propose:

- open an existing Project;
- create a Project;
- work briefly without creating one;
- choose a Studio only if the purpose makes the distinction useful.

Do not require the person to classify their life into product taxonomy before beginning.

---

## 11 · Information architecture — candidate direction

Permanent top-level navigation is **not yet ratified**.

A candidate simplification is:

~~~text
Projects    Library    System
~~~

Inside a Project:

~~~text
Project Home
Research / Teach / Mentor / Reflect / Write / Build  ← contextual Studio choices
~~~

### Why this direction

- Projects are durable human contexts.
- Library is cross-project reusable knowledge/material.
- System remains substrate/diagnostics/governance.
- Living Spiral may become an instrument inside System or Project rather than a permanent global top-level destination.
- Work ceases to be a top-level bucket because meaningful work happens inside Projects.

This remains a candidate for J3/founder witness.

---

## 12 · Research Studio — candidate first native proof

### Governing question

> **Can JARVIS help a person hold a complex inquiry, its sources, evidence, contradictions and emerging synthesis in one native place without collapsing the work into chat?**

### Candidate composition

~~~text
┌───────────────────────────────────────────────────────────────────────┐
│ Project: Relational Geometry Research                    Research     │
├────────────────┬──────────────────────────────────┬───────────────────┤
│ Inquiry        │ Evidence Canvas / Source View    │ JARVIS            │
│                │                                  │                   │
│ Questions      │ claims                           │ Ask               │
│ Threads        │ evidence                         │ Compare           │
│ Sources        │ source excerpts                  │ Challenge         │
│ Unknowns       │ contradictions                   │ Explain           │
│ Artifacts      │ synthesis                        │ Synthesize        │
│                │                                  │                   │
├────────────────┴──────────────────────────────────┴───────────────────┤
│ Provenance · custody · unresolved evidence · governed background work │
└───────────────────────────────────────────────────────────────────────┘
~~~

### Native advantages exercised

Research Studio can test:

- persistent Project state;
- local bounded sources;
- multi-pane context;
- Canvas;
- source viewer;
- continuity;
- provenance;
- local-first custody;
- governed challenge;
- artifact creation.

It does not require first solving:

- therapeutic relational identity;
- personal-development memory;
- mentor role;
- provider execution.

That makes it a strong first prototype.

---

## 13 · Evidence Canvas — candidate primitive

Canvas should not begin as an unrestricted whiteboard.

Candidate typed node classes:

- Question
- Claim
- Source
- Evidence
- Counterevidence
- Unknown
- Concept
- Artifact
- Decision

Candidate typed relations:

- SUPPORTS
- CHALLENGES
- DERIVED_FROM
- ANSWERS
- CONTRADICTS
- RELATED_TO
- SUPERSEDES
- UNKNOWN_RELATION

### Law

No visual edge should imply more epistemic standing than the evidence supports.

This inherits the Living Spiral discipline:

> **Do not draw a relation the system cannot justify.**

But Canvas nodes are human/project artifacts, not system-health nodes.

---

## 14 · Continuity Snapshot — candidate primitive

A Project should be able to answer:

> **Where was I?**

Candidate snapshot:

- Project id;
- active Studio;
- active Thread;
- active Artifact/Canvas;
- selected Sources;
- viewport/pane arrangement where meaningful;
- unresolved questions;
- background Work Unit standing;
- last human decision;
- next intended act;
- timestamp.

### Authority

A continuity snapshot is orientation state, not semantic truth.

It may say:

> "You were viewing these three sources and had this question open."

It should not silently say:

> "You believe X."

---

## 15 · Project-level custody — candidate

The native app will eventually touch materials more intimate than a repository.

Candidate custody layers:

### C0 · Project metadata
Names, layout, Thread titles.

### C1 · Local referenced material
Files/folders deliberately attached.

### C2 · Sensitive private material
Journals, personal-development notes, mentoring/case content.

### C3 · Externalizable bounded material
Exact source bundle explicitly approved for external reasoning.

### C4 · Restricted / never-external material
Sanctuary-like or professionally restricted content.

This is **not** a new canonical evidence-class replacement.

J2 identifies the need for a Project custody contract; a later gate must reconcile it with E0-E4 and existing sovereignty law rather than invent competing semantics.

---

## 16 · Background governed activity — candidate

A native Project may eventually show:

~~~text
Researching 12 attached sources
Indexing local folder
Comparing two papers
Building evidence matrix
Generating lesson draft
Running verification
~~~

But every background action must have:

- visible scope;
- visible custody;
- start authority;
- stop/cancel;
- Work Unit or other canonical act;
- evidence/provenance;
- no invisible authority widening.

Native convenience must not become ambient agency.

---

## 17 · Identity / presence — explicit unresolved contract

The Desktop cannot simply call every intelligent presence "JARVIS" because the programme includes personal-development, mentoring and teaching contexts that may overlap MAIA's relational identity.

Candidate distinctions to adjudicate:

### JARVIS
Potential standing:

- research collaborator;
- systems/build partner;
- project intelligence;
- evidence organizer;
- teaching instrument;
- technical/professional assistant.

### MAIA
Potential standing:

- relational/consciousness-oriented presence;
- member-facing continuity;
- reflective / transformational encounter;
- existing Soullab relational identity.

### Native Project shell
Could host both while preserving identity.

Example:

~~~text
Research Studio
  JARVIS active

Reflection / MAIA session
  MAIA active as a distinct presence

Project continuity
  shared only according to explicit custody / authority
~~~

### Law

No copy, avatar, voice or default routing may merge these identities by accident.

---

## 18 · PWA / native allocation — candidate

### Prefer PWA when

- mobile matters;
- access-anywhere matters;
- interaction is primarily conversation;
- the member should not manage local files;
- shared/account/service surfaces dominate;
- installation would add friction without meaningful capability.

### Prefer native Desktop when

- work is source-heavy;
- local files matter;
- spatial arrangement matters;
- multiple artifacts need simultaneous visibility;
- continuity is project-shaped;
- long sessions/deep work are likely;
- local models/tools materially help;
- governed background activity matters;
- professional/creator workflows need OS integration.

### Allow both when

the same Project may benefit from:

- light mobile reflection in PWA;
- deep native work later.

Cross-surface continuity must be explicitly designed; it is not assumed.

---

## 19 · What should recede from the future default UI

Healthy ordinary use should not foreground:

- model/provider names;
- route digests;
- Work Unit versions;
- Builder session mechanics;
- transport binding ids;
- check-run vocabulary;
- compatibility lane;
- R4/R5A/R5B terminology.

These remain inspectable under:

- provenance;
- System;
- advanced / authority view;
- consequential-choice moments.

This is the UX payoff of the constitutional substrate.

---

## 20 · What should become more visible

The future Desktop should foreground:

- purpose;
- Project;
- question;
- source;
- artifact;
- relationship among evidence;
- learning;
- practice;
- decision;
- unresolved thread;
- change over time;
- next meaningful act.

---

## 21 · Candidate first prototype boundary

If Research Studio is later selected, the smallest meaningful prototype should **not** begin by broadening native permissions.

Prototype may use existing authorized material only:

- bound repository files;
- existing local continuity;
- existing Work Unit read model;
- documentary/mock Source refs;
- synthetic Canvas/project persistence if separately authorized.

First prototype question:

> **Does Project + Context Rail + Main Research Surface + adjacent JARVIS feel like a qualitatively different native working environment from the current Work cockpit?**

It does not need live canonical provider execution to answer that.

---

## 22 · J2 decisions proposed for founder adjudication

### D1 · Project / Living Context is the primary durable visible object
**Candidate: TAKE**

### D2 · Work Units remain beneath Projects as authority-bearing acts
**Candidate: TAKE**

### D3 · Studios are modes/lenses within Projects, not separate data silos
**Candidate: TAKE**

### D4 · Intelligence is adjacent to the main work rather than synonymous with chat
**Candidate: TAKE**

### D5 · Research Studio should be the first native prototype
**Candidate: TAKE**

### D6 · Project custody must be designed before arbitrary local-file ingestion
**Candidate: TAKE**

### D7 · JARVIS/MAIA identity boundary must be resolved before Mentoring/Personal Studio implementation
**Candidate: TAKE**

### D8 · Future IA should probably move from Home/Work/System/Spiral toward Projects/Library/System
**Candidate: HOLD FOR EXPERIENCE WITNESS**

### D9 · One general Canvas primitive with typed domain nodes
**Candidate: HOLD — prototype evidence required**

### D10 · Multi-window Projects
**Candidate: HOLD — first prove one-window multi-pane architecture**

---

## 23 · Smallest next architecture gate

If J2 is accepted, the next gate should be:

> **J3 — NATIVE SHELL EXPERIENCE CONTRACT + RESEARCH STUDIO FIRST-ARRIVAL PROTOTYPE SPEC**

J3 should define, without runtime implementation:

1. first launch;
2. Project library / resume;
3. create Project;
4. enter Research Studio;
5. context rail;
6. source/evidence main surface;
7. adjacent JARVIS pane;
8. continuity snapshot;
9. provenance/custody strip;
10. empty states;
11. refusal/hold states;
12. return after absence;
13. Project vs System navigation;
14. how the cockpit becomes secondary rather than deleted.

Then a founder witness can adjudicate the experience before source code changes.

---

## 24 · Standing

**J2 CANDIDATE EXPERIENCE ARCHITECTURE: COMPLETE AS A DOCUMENTARY CANDIDATE**

No JARVIS Desktop source/UI/runtime file is changed by J2.

No new IPC, filesystem access, provider execution, credential access, schema/database migration, deployment, production or MAIA member-facing change is authorized.

The next authority question is founder adjudication of D1–D10 and whether Research Studio should become the first native experience prototype.
