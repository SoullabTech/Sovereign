# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J3 — Native Shell Experience Contract

**Date:** 2026-09-18
**Accepted parent:** 5df6e96c004712fc4d365ecd4913cded7015e40a
**Standing:** CANDIDATE EXPERIENCE CONTRACT — documentary only
**Implementation authority:** NONE

---

## 0 · Contract purpose

This contract defines the experience law for the first genuinely native JARVIS Desktop shell.

It does not define permanent global navigation.

It does not implement a new Project store.

It does not authorize arbitrary local-file access.

It does not connect provider execution.

It does not merge JARVIS and MAIA identity.

It answers one narrower question:

> **What should it feel like to inhabit a durable Project / Living Context in JARVIS Desktop, with intelligence adjacent to the work and constitutional machinery receding beneath ordinary use?**

The first prototype target is Research Studio because it exercises the native shell without requiring the most sensitive relational identity decisions.

---

## 1 · Accepted J2 decisions carried forward

The following are no longer open inside J3:

1. **Project / Living Context is the primary durable visible object.**
2. **Canonical Work Units remain beneath Projects as authority-bearing consequential acts.**
3. **Studios are modes/lenses within Projects rather than separate data silos.**
4. **Intelligence is adjacent to the main work rather than synonymous with chat.**
5. **Research Studio is the first native prototype candidate.**
6. **Project custody must be designed before arbitrary local-file ingestion.**
7. **JARVIS / MAIA identity boundaries must be explicit before Mentoring or Personal Development implementation.**

The following remain intentionally open:

- permanent top-level navigation;
- one universal Canvas primitive;
- multi-window Projects.

J3 must not accidentally settle those through mockup convention.

---

## 2 · Native Shell north star

> **The person should feel that they have returned to meaningful work already in motion.**

Not:

> "I opened an AI app."

Not:

> "I opened a system console."

Not:

> "I have to reconstruct context before I can think."

A successful native shell creates immediate orientation to:

- what Project this is;
- what the person was trying to do;
- what material belongs here;
- what is unresolved;
- what is active now;
- where JARVIS can help;
- what is local / external / held;
- what the next meaningful act might be.

---

## 3 · Shell experience invariants

### S1 · Project before mechanism

The first visible identity in a working context is the Project, not:

- provider;
- model;
- route;
- Work Unit version;
- Builder status;
- execution machinery.

### S2 · The main work owns the center

The largest visual region belongs to the work itself:

- source;
- evidence;
- document;
- canvas;
- lesson;
- practice;
- artifact.

Conversation is adjacent.

### S3 · Context survives pane changes

Switching between source view, evidence view, writing, teaching or another Studio must not erase:

- the active Project;
- current Thread;
- selected Sources;
- unresolved state;
- continuity cues.

### S4 · Intelligence is present but non-totalizing

JARVIS should be easy to invoke without becoming the container for every artifact and decision.

The person can collapse the intelligence pane and continue working.

### S5 · Provenance stays near consequential claims

Important synthesized claims should expose:

- origin;
- source refs;
- standing;
- uncertainty;
- contradiction where present.

But provenance should not flood ordinary reading.

### S6 · Custody is legible without becoming bureaucracy

The person should be able to see whether current material is:

- local;
- external;
- derived;
- held;
- unavailable.

The shell should not require reading W0/W3/W4 internals to understand this.

### S7 · Governance appears at consequential moments

The shell should foreground governance when:

- authority is requested;
- a crossing is blocked;
- an adjudication is required;
- custody is ambiguous;
- a Work Unit is held;
- execution is separately authorized later.

Ordinary reading and note-taking should not look like a governance console.

### S8 · Resume is a first-class experience

Return after absence should reconstruct the meaningful working state.

The prototype must explicitly show:

> **You were here.**

### S9 · Native affordances require bounded consent

A file chooser, drag/drop, folder watch, notification or background activity is not "just UI."

Each such affordance requires a custody/authority contract before implementation.

### S10 · System truth remains reachable

The old cockpit is not deleted.

Its functions move toward a secondary **System / Advanced** role:

- system health;
- operational provenance;
- Builder state;
- compatibility lane;
- execution detail;
- diagnostic geometry.

The main work environment should not need to carry all of it.

---

## 4 · One-window first principle

J2 holds multi-window Projects.

Therefore the J3 prototype assumes one application window with multiple panes.

This is a **prototype constraint**, not a permanent ban on multi-window work.

Why:

- first prove Project continuity;
- first prove multi-pane orientation;
- first prove intelligence adjacency;
- first prove Studio switching;
- first prove source/evidence spatial meaning.

Only then ask whether multiple windows materially improve the experience.

---

## 5 · Candidate shell zones

The prototype uses five conceptual zones.

~~~text
┌────────────────────────────────────────────────────────────────────────┐
│ A · Project Bar                                                        │
├──────────────────┬───────────────────────────────────┬─────────────────┤
│ B · Context Rail │ C · Main Working Surface          │ D · JARVIS      │
│                  │                                   │ Presence        │
│                  │                                   │                 │
├──────────────────┴───────────────────────────────────┴─────────────────┤
│ E · Continuity / Evidence / Custody Strip                              │
└────────────────────────────────────────────────────────────────────────┘
~~~

These are experience roles, not implementation components.

---

## 6 · Zone A — Project Bar

### Purpose

Keep the person oriented to the durable context without consuming vertical attention.

### Candidate contents

- Project name;
- active Studio;
- current Thread;
- project switch / return control;
- temporary System escape hatch;
- global search / command entry later, if useful.

### Must not show by default

- provider;
- model;
- route digest;
- Work Unit version;
- execution grant state;
- check run state.

### Candidate example

~~~text
Relational Geometry Research      Research Studio      Thread: Grief falsifier      System
~~~

### Interaction law

Changing Studio does not change Project.

Changing Thread does not destroy Studio state.

Leaving Project preserves continuity.

---

## 7 · Zone B — Context Rail

### Purpose

Hold the durable materials and questions that give the work meaning.

### Candidate sections

#### Threads

- open questions;
- current hypotheses;
- parked issues;
- resolved/superseded threads.

#### Sources

- bounded Project Sources;
- local/external standing;
- selected source group.

#### Artifacts

- notes;
- syntheses;
- reports;
- drafts;
- canvases.

#### Unknowns

Optional Research-specific section.

#### Recent decisions

Only meaningful decisions, not every click.

### Interaction law

The Context Rail is not a filesystem tree.

It is a curated Project context.

The person should be able to tell:

> "These are the materials that belong to this inquiry."

### Prototype limit

No arbitrary filesystem ingestion is implemented.

Prototype Sources may be documentary / already-authorized repository references.

---

## 8 · Zone C — Main Working Surface

### Purpose

Give the human work enough visual and cognitive space.

### Research Studio candidate modes

- Evidence Canvas;
- Source Reader;
- Synthesis Document;
- Comparison View.

J3 does not decide whether these become tabs, modes, subviews or one adaptive surface.

### Law

The center should not become a card dashboard.

For deep work, the center should feel closer to:

- a desk;
- document;
- map;
- notebook;
- reading table.

than:

- admin panel;
- feed;
- chat history.

---

## 9 · Zone D — JARVIS Presence

### Purpose

Place intelligence beside the active work.

### Candidate functions

JARVIS may:

- answer a question about the current context;
- explain a concept;
- compare selected Sources;
- challenge a Claim;
- ask a clarifying question;
- summarize a bounded selection;
- suggest a next inquiry;
- draft a synthesis into a new Artifact when authorized;
- point to provenance.

### Modes — candidate interaction vocabulary

- **Ask**
- **Explain**
- **Compare**
- **Challenge**
- **Synthesize**

These are human verbs, not provider/model selections.

### Default posture

JARVIS should know what Project / Studio / Thread is active.

It should not automatically read every Project Source.

### Selection law

The person should be able to invoke JARVIS on:

- current Source;
- selected nodes;
- selected text;
- current Thread;
- explicitly chosen Source set.

### Silence

The pane can be collapsed.

No persistent "AI is typing" presence should make ordinary reading feel monitored.

---

## 10 · Zone E — Continuity / Evidence / Custody Strip

### Purpose

Keep critical state visible without dominating the workspace.

### Candidate contents

Depending on state:

- Local only;
- 4 Sources selected;
- 1 unresolved contradiction;
- background Work Unit held;
- provenance available;
- resumed from prior session;
- source unavailable;
- external crossing requires authority;
- current Artifact unsaved / saved, if a future Artifact contract exists.

### Design law

This is not a status bar full of system trivia.

Every item must answer one of:

- where am I?
- what is unresolved?
- what material is active?
- what custody matters?
- what consequential act is held?
- what happened while I was away?

---

## 11 · First launch — no Project yet

### Experience objective

Orient without asking the person to understand product taxonomy.

### Candidate arrival

~~~text
JARVIS

What are you working on?

[ Start something new ]

Recent
— Relational Geometry Research
— Elemental Alchemy Revision
— MAIA Teaching Intelligence
~~~

### New Project path

The smallest Project creation asks:

1. **What are you working on?**
2. optional human-readable Project name.

It should not initially ask:

- Work Unit class;
- model;
- provider;
- routing posture;
- Studio taxonomy;
- custody class codes.

### Candidate JARVIS inference

JARVIS may later suggest:

> "This looks like research. Open in Research Studio?"

That suggestion is reversible and non-authoritative.

---

## 12 · Returning arrival — Project resume

### North-star state

~~~text
Relational Geometry Research

You were here:

Thread
Can identity be understood as lawful transformation rather than invariant residue?

Working surface
Grief falsifier evidence canvas

Open Sources
4

Unresolved
2 contradictory findings
1 source not yet reviewed

Last decision
Treat geometry as a candidate descriptive language, not a metaphysical premise.

[ Resume ]
~~~

### Why this matters

This is the experiential distinction between:

- transcript continuity;
- Project continuity.

### Must not say

> "You believe..."

unless that is an exact human-authored Artifact/statement with appropriate provenance.

### Continuity language should describe state, not identity.

---

## 13 · Project Home

Project Home is candidate orientation inside a Project.

It is not the global app Home.

### Candidate contents

- Project purpose;
- active Threads;
- active Studio;
- recent Artifacts;
- recent Sources;
- unresolved questions;
- next intended act;
- recent Work Unit standing only if consequential.

### Project Home should answer

> What is alive here?

not:

> What features are available?

---

## 14 · Research Studio first arrival

### Empty Research Studio

~~~text
Relational Geometry Research / Research Studio

What question are we holding?

[ Name or choose a Thread ]

Sources
No Sources in this Project yet.

You can begin with:
— an existing Project Artifact
— an already-authorized repository reference
— a bounded Source added later under a custody contract

JARVIS
I can help you frame the inquiry before we gather material.
~~~

### With an active Thread

~~~text
Thread
What remains invariant when identity changes?

Evidence Canvas
[ empty center ]

Sources
3 attached

JARVIS
Ask about the inquiry
Compare selected Sources
Challenge a Claim
~~~

### Law

The Studio should not require Sources before inquiry exists.

Question can precede evidence.

---

## 15 · Source composition

### Candidate Source card anatomy

~~~text
SOURCE
RGR-00 Research Constitution

Local repository
Observed at 0253a192…
Available
Used by 3 Claims

[ Open ] [ Show provenance ]
~~~

### State distinctions

- AVAILABLE
- UNAVAILABLE
- CHANGED SINCE OBSERVED
- EXTERNAL
- LOCAL ONLY
- RESTRICTED
- NOT YET READ

### Law

Source state is not Claim truth.

A Source being present does not mean JARVIS has read it.

---

## 16 · Evidence composition

Research Studio needs a clear separation among:

- Question;
- Claim;
- Evidence;
- Counterevidence;
- Unknown;
- Source;
- Synthesis;
- Decision.

### Example

~~~text
QUESTION
What survives transformation?

      ↓ ANSWERED_BY?

CLAIM
Identity may be lawful transformation rather than invariant residue.

      ← SUPPORTS
Evidence A

      ← CHALLENGES
Evidence B

UNKNOWN
Does this hold in grief?
~~~

### Standing

This is a prototype semantic model.

J3 does not authorize a universal Canvas schema.

---

## 17 · Evidence Canvas interaction law

### Human authorship

The person may create:

- Question;
- Claim;
- Unknown;
- note-like Evidence interpretation;
- relation.

### JARVIS proposal

JARVIS may propose:

- relation;
- Claim;
- Counterevidence;
- missing Source;
- contradiction.

### Law

A JARVIS-proposed node/edge must remain visibly proposed until accepted if it changes the Project's durable semantic structure.

This mirrors the broader authorship discipline already earned elsewhere in Soullab.

### No silent graphification

JARVIS should not automatically turn every conversation sentence into a node.

---

## 18 · JARVIS adjacent interaction examples

### Ask

> "What does this Source actually establish?"

Response should distinguish:

- Source says;
- JARVIS inference;
- Project Claim;
- unknown.

### Compare

> "Compare these three Sources on whether identity requires invariance."

Output may create a temporary comparison view.

Durable Claims require explicit save/accept.

### Challenge

> "Try to falsify this Claim."

JARVIS should search selected evidence first and may propose a governed Work Unit for broader research if needed.

### Explain

> "Teach me the difference between invariant and covariant."

Research Studio can use teaching behavior locally without becoming Teaching Studio.

### Synthesize

> "Draft the current argument into a research note."

Creates a proposed Artifact, not an invisible overwrite of existing writing.

---

## 19 · Work Unit receding behavior

Ordinary actions should not force Work Unit vocabulary.

### Human-visible phrasing

Instead of:

> Create CODE_GROUNDED W0.v2

say:

> Check this claim against the selected Sources.

Instead of:

> Bind transport

say:

> This needs a governed analysis act. Review scope?

Instead of:

> E3_EXTERNAL_REPO_BUNDLE

say:

> This would send these exact Sources to an external model.

### Inspectability

Advanced details remain accessible:

- Work Unit;
- route;
- provenance;
- transport;
- execution.

But not as the default mental model.

---

## 20 · Holds and refusals

J3 must make refusal states part of the experience, not errors pasted from governance internals.

### H1 · Source not in Project custody

~~~text
This Source is not part of this Project.

JARVIS has not read it.

[ Add Source later under Project custody ]
~~~

No automatic import.

### H2 · External reasoning would cross custody

~~~text
This comparison needs an external model.

The selected material is currently Local Only.

Nothing has been sent.

[ Review crossing ]
~~~

No provider name necessary at first layer.

### H3 · Canonical provider execution unavailable

~~~text
This action requires execution that is not connected in the canonical Desktop yet.

The Project and evidence remain intact.
~~~

No legacy R5B fallback inside canonical Project UX.

### H4 · Source changed

~~~text
This file has changed since JARVIS last observed it.

[ Review new version ]
[ Keep prior observed version ]
~~~

No silent update of evidence.

### H5 · Project cannot resume fully

~~~text
This Project reopened, but one Source is unavailable.

Your Thread, Canvas and prior evidence are intact.

[ Continue without it ]
[ Locate Source later ]
~~~

### H6 · Background activity held

~~~text
Research task held before external disclosure.

Scope and evidence are preserved.

[ Review ]
~~~

### Law

A refusal should preserve orientation and work already done.

---

## 21 · Empty-state law

Empty states should invite human purpose, not feature consumption.

### Good

> What question are you holding?

> Add the first Source when you are ready.

> You can think here before you collect evidence.

### Avoid

> Create your first Canvas!

> Try JARVIS AI Research!

> Add 5 Sources to get started!

The product should not manufacture urgency or completion pressure.

---

## 22 · Provenance interaction

### Near-claim provenance

Every durable Claim can expose:

- human / JARVIS authorship;
- Source refs;
- evidence links;
- last change;
- standing;
- unresolved challenge.

### Progressive disclosure

Default:

~~~text
Claim
Identity may be lawful transformation rather than invariant residue.

2 supporting · 1 challenging · 1 unknown
~~~

Expanded:

~~~text
Human-authored
Created Sep 18
Supported by Source A, C
Challenged by Source B
JARVIS proposed relation to Unknown U4 — not accepted
~~~

### Law

Provenance should increase trust calibration, not create visual noise.

---

## 23 · Custody interaction

J3 cannot implement Project custody yet, but it must define how it should feel.

### Candidate visual vocabulary

- **Local**
- **External**
- **Restricted**
- **Derived**
- **Held**

Avoid exposing E0-E4 codes in ordinary Project UI unless advanced view is requested.

### Crossing moment

The UI should name:

1. what material;
2. where it would go;
3. why;
4. what JARVIS will do;
5. what will not happen.

### Example

~~~text
External comparison

Material
3 selected Sources

Purpose
Challenge the current Claim

This would disclose only those 3 Sources.

No other Project files or notes are included.

[ Cancel ] [ Continue to authority review ]
~~~

J3 does not authorize the "Continue" implementation.

---

## 24 · Continuity Snapshot experience

### Candidate snapshot language

~~~text
Last session · Sep 18

Studio
Research

Thread
Grief as a falsifier

Surface
Evidence Canvas

Selected Sources
4

Unresolved
— evidence B conflicts with Claim 7
— grief case not yet represented

Last human decision
Keep "geometry" as descriptive language only.

Next intended act
Find a primary source on identity discontinuity.
~~~

### What the snapshot must not infer

- emotion;
- belief;
- diagnosis;
- motivation;
- developmental status;

unless those are explicitly human-authored and appropriate to the Project type.

---

## 25 · Return after absence

The first return surface should offer two levels:

### Fast resume

> Resume where I was.

### Orient me

> Show what changed / what remains unresolved.

### Potential native benefit later

If bounded background activities existed, return could include:

> Two governed research tasks completed while the Project was open elsewhere.

But J3 does not authorize background activity.

---

## 26 · Temporary prototype navigation

Because permanent IA is held, the J3 Research prototype should use the minimum navigation required for witness.

Candidate temporary chrome:

~~~text
[ Project switcher ]        [ Research ]        [ System ]
~~~

Within Project, Context Rail exposes:

- Project Home;
- Threads;
- Sources;
- Artifacts.

This does **not** constitute a founder ruling for permanent:

> Projects / Library / System

Library may be absent from the first prototype.

---

## 27 · Existing cockpit transition

The current cockpit is not deleted.

Candidate future destination of its functions:

### System

- system health;
- Builder status;
- provider/readiness detail;
- execution compatibility;
- advanced provenance;
- Living Spiral / operational geometry;
- diagnostic holds.

### Advanced Project inspector

- exact Work Units;
- route details;
- transport bindings;
- immutable attempt history.

### Law

The cockpit becomes an **instrument**, not the application identity.

---

## 28 · Living Spiral standing

Living Spiral currently represents operational evidence relationships.

J3 does not turn it into Research Canvas.

Potential future homes:

- System;
- Advanced Project inspector;
- provenance/evidence diagnostics.

Research Canvas may inherit its refusal to imply unsupported relations, but not its node semantics.

---

## 29 · Identity / presence in Research Studio

For the first prototype:

> **The adjacent intelligence is JARVIS.**

Why this is safe enough for Research:

- project/evidence orientation fits JARVIS identity;
- no assumption of MAIA's relational stance;
- no Personal Development or mentoring role;
- no need to merge voices/avatars.

### Explicit prototype law

Research Studio must not use MAIA relational language or styling by implication.

### Still open

Teaching Studio may consume teaching intelligence while preserving identity.

Mentoring / Personal Studio remains blocked on a separate identity contract.

---

## 30 · Visual character — candidate principles

J3 does not choose final visual design, but the prototype should test a clear departure from cockpit aesthetics.

### Desired

- spacious;
- calm;
- serious;
- warm enough for long work;
- high legibility;
- dense only where the person asks for density;
- artifact-forward;
- subtle provenance;
- strong hierarchy;
- no tiny developer-tool typography as default;
- room for diagrams / documents / sources;
- native macOS feeling without generic productivity-app mimicry.

### Avoid

- endless cards;
- tiny monospace everywhere;
- status-pill soup;
- dark developer console as the only identity;
- chat bubbles consuming center stage;
- provider logos as navigation;
- dashboard metrics where a document/canvas should exist.

---

## 31 · Keyboard / native interaction — prototype requirements

The prototype specification should anticipate:

- Command-K or equivalent later for project actions;
- keyboard focus between Context / Main / JARVIS;
- open/collapse intelligence pane;
- open current Source;
- return to Project Home.

But no new shortcut implementation is authorized.

---

## 32 · Accessibility / readability

Founder witness should include:

- body text readable at ordinary desktop distance;
- no critical state encoded only by color;
- visible focus;
- pane collapse does not lose content;
- headings describe semantic regions;
- evidence relations have textual equivalents;
- no 10–11px typography for primary reading.

This responds directly to prior Desktop/Relationships failures where tiny typography made otherwise-correct structures unusable.

---

## 33 · Project persistence contract — prototype semantics

The prototype should behave *as though* Project state can persist, but implementation is not authorized.

The prototype state model includes:

- Project;
- active Studio;
- active Thread;
- selected Sources;
- current main surface;
- Canvas arrangement;
- JARVIS pane collapsed/open;
- continuity snapshot.

J3 does not choose file/db storage.

---

## 34 · Project creation minimalism

Do not require a complex wizard.

Candidate flow:

~~~text
What are you working on?

[ Relational Geometry research                               ]

JARVIS
I can open this as a Project so your questions, Sources and work stay together.

[ Create Project ]
~~~

After creation:

> "What question are you holding?"

Studio can be suggested contextually.

---

## 35 · Project without Studio

A Project should be able to exist before a Studio is selected.

Why:

- purpose may be ambiguous;
- people often begin with a problem, not a workflow label;
- one Project may later use multiple Studios.

Research Studio is the first prototype because we selected it, not because every Project is Research.

---

## 36 · Project Home prototype semantics

Candidate sections:

### Purpose
One human-authored sentence.

### Active Threads
3–5 meaningful items, not activity feed.

### Continue
Last meaningful working surface.

### Materials
Sources / Artifacts count and key changes.

### Open questions
What remains unresolved.

### Recent decisions
Only decisions with semantic significance.

### JARVIS
One suggested next question or no suggestion.

---

## 37 · Research Studio prototype empty state

### Scenario A — new Project

~~~text
Research Studio

Question
What are you trying to understand?

[ Enter question ]

You do not need Sources yet.
Start by making the inquiry precise.
~~~

### Scenario B — existing Sources, no Thread

~~~text
You have 4 Sources in this Project.

What question should they help you answer?

[ Name the inquiry ]
~~~

### Scenario C — Thread, no evidence

~~~text
Thread
Can grief falsify the invariance thesis?

No evidence has been attached to this Thread yet.

[ Choose from Project Sources ]
~~~

---

## 38 · Research Studio populated state

The prototype should include one realistic populated Project using **Relational Geometry** because its content already has:

- explicit research constitution;
- Claims;
- falsifiers;
- literature;
- contradictions;
- formal vocabulary.

### Prototype dataset — documentary only

Candidate:

- Thread: "Can grief falsify identity-as-invariant-residue?"
- Sources:
  - RGR-00 research constitution;
  - RGR-01 claim ledger / literature landscape;
  - RGR-02 formal vocabulary.
- Claims:
  - relation is the object of inquiry;
  - geometry is a candidate language;
  - meaning is not reduced to mathematical representation.
- Unknown:
  - whether transformation law is more explanatory than invariant residue in grief.
- Artifact:
  - working synthesis note.

The prototype may quote only exact locally available project documents if later implemented.

J3 itself does not ingest them into runtime.

---

## 39 · Founder witness sequence

The first prototype witness should not begin with explanation.

Founder should see the experience and answer from immediate use.

### W1 · Arrival

You open JARVIS.

Questions:

- Does this feel like a place to work, or a dashboard?
- Is it obvious what Project you are in?
- Do you know where to go without understanding JARVIS internals?

### W2 · Resume

Open Relational Geometry Research.

Questions:

- Do you feel returned to meaningful context?
- Does "You were here" tell you enough without overclaiming?
- Is the unresolved state useful?

### W3 · Research Studio

Open the active Thread.

Questions:

- Does the center feel like research rather than chat?
- Can you hold Sources and Claims in mind?
- Is JARVIS present without dominating?

### W4 · Evidence

Open a Claim and its evidence.

Questions:

- Is provenance close enough?
- Does challenge/counterevidence remain visible?
- Does the visual structure imply more certainty than exists?

### W5 · Ask JARVIS

Ask:

> "What would falsify this Claim?"

Questions:

- Does the response feel grounded in the Project?
- Do you know what it used?
- Does the answer remain an adjacent contribution rather than taking over the Project?

### W6 · Hold state

Show an external-reasoning custody block.

Questions:

- Do you understand what is blocked?
- Do you know that nothing was sent?
- Does the refusal preserve your place in the work?

### W7 · Collapse JARVIS

Close the intelligence pane.

Question:

- Does the Project still feel complete?

### W8 · Return

Simulate next-day return.

Questions:

- Would you know where you were?
- Does the continuity snapshot feel faithful?
- What is missing?

---

## 40 · Founder witness falsifiers

The prototype should fail if any of these are true:

1. It feels like the old Work cockpit with nicer styling.
2. Chat remains the main surface.
3. Provider/model machinery dominates ordinary use.
4. Project is just a renamed Work Unit.
5. Sources feel like uploads rather than durable Project material.
6. The person must remember context instead of the Project preserving it.
7. Provenance disappears when the UI becomes calmer.
8. Evidence graph implies unsupported certainty.
9. JARVIS automatically turns conversation into durable Project Claims.
10. Intelligence cannot be collapsed without losing the work.
11. Empty state pushes features rather than inquiry.
12. Hold/refusal states destroy orientation.
13. Local/external custody is unclear.
14. Return state tells the person what they "believe" rather than what they were doing.
15. Research Studio feels like a silo that cannot later feed Writing/Teaching.
16. Tiny typography returns.
17. The old System cockpit is merely moved into a sidebar.
18. The prototype implicitly ratifies permanent navigation.
19. Research Canvas architecture accidentally becomes universal Canvas canon.
20. The prototype requires provider execution to feel useful.

---

## 41 · Prototype acceptance criteria

A Research Studio first-arrival prototype is ready for implementation consideration only if founder witness supports all of:

- **PLACE** — feels like an environment, not a feature page;
- **PURPOSE** — inquiry is more visible than machinery;
- **CONTEXT** — Project materials remain in sight;
- **WORK** — the center belongs to research;
- **PRESENCE** — JARVIS is adjacent and optional;
- **CONTINUITY** — return state is meaningful;
- **TRUST** — provenance/custody remain inspectable;
- **RESTRAINT** — no provider-execution dependency;
- **TRANSFER** — resulting Artifact can plausibly move into Writing/Teaching later;
- **READABILITY** — typography/layout support sustained work.

---

## 42 · What J3 does not authorize

- no Electron/renderer source change;
- no Project persistence implementation;
- no local-file chooser expansion;
- no drag/drop;
- no Source indexing;
- no Canvas implementation;
- no new IPC;
- no keyboard shortcut;
- no new window;
- no background job;
- no provider execution;
- no new credential use;
- no external disclosure;
- no schema/database migration;
- no production;
- no MAIA surface;
- no Mentoring / Personal Studio.

---

## 43 · Prototype implementation boundary — future only

If a later founder act authorizes a visual prototype, the safest first prototype should be:

- non-persistent or synthetic Project state;
- one-window;
- local static/documentary Sources only;
- no new IPC;
- no arbitrary filesystem access;
- no provider execution;
- no new data store;
- no MAIA identity;
- no production.

Its purpose is experience falsification, not feature completeness.

---

## 44 · Standing

**J3 NATIVE SHELL EXPERIENCE CONTRACT: COMPLETE AS A DOCUMENTARY CANDIDATE**

Next artifact required before implementation:

> **Research Studio First-Arrival Prototype Specification**

That specification must make the above contract witnessable screen by screen without turning it into runtime implementation.
