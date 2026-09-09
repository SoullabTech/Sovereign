# JARVIS — WS2 DEVELOP AS PROCESS ENVIRONMENT

**Kind**: design / product-architecture child flow. It carries founder authority recorded below; it does not silently create new authority.

**Opened**: 2026-09-08

**Parent**: `docs/programme/JARVIS-WS2-DEVELOPMENTAL-INTELLIGENCE-CONTINUATION.md`

**Current runtime evidence**: `64e439f66` + the held Develop surface patch + `EA-DEVELOP-WALK-01`

---

## 0. Founder finding — governing this flow

Founder act, 2026-09-08:

> **Develop is supposed to be a process environment, not a critique environment alone.**

This finding came from the founder walk against a real chapter of *Elemental Alchemy*. The current surface can present a developmental reading, expose observations, and open a conversation about an observation. What it does not yet provide is an inhabitable developmental process that carries the writer from intention and attention through inquiry, authored action, reflection, and continuation.

The current reading is useful evidence of the mismatch: the room is organized around numbered MAIA observations and their evidence/limits, with a `talking about` surface once an observation is opened. That is a critique / reading capability. It is not, by itself, a developmental process.

### Governing distinction

```text
CRITIQUE / READING
MAIA notices → writer inspects → writer may discuss

DEVELOPMENTAL PROCESS
writer intention
  → attention
  → inquiry / noticing
  → dialogue / testing
  → decision
  → authored action
  → reflection on what changed
  → continuation
```

**Critique may enter the process. It may not define the room.**

---

## 1. Why this is a separate Jarvis flow

Do not repair the founder-walk finding by adding an `Edit` button to the existing critique-first surface.

That would yield:

```text
critique → edit
```

while preserving the wrong primary object.

This flow exists to answer the prior question first:

> **What developmental process does a writer inhabit in Develop, and where do MAIA's readings, observations, conversation, and revision support enter that process?**

Only after that answer is explicit may the room architecture be specified or implemented.

---

## 2. Relationship to the existing Developmental Intelligence programme

This flow **does not reopen** the selector contract, the Q12 boundary gate, the D5 standing ruling, or the locked selector/runtime work.

Those remain capabilities / infrastructure that a process-oriented Develop room may invoke.

```text
selector                  subordinate capability: what might be worth raising now
F-7 / lawful boundary     constitutional infrastructure
reading / observations    perception layer
conversation              process capability
revision support          process capability
standing                  member-authored lifecycle authority
Develop room              the process environment that composes them
```

The productization obligation still governs:

```text
BENCHMARK PASSES ≠ STUDIO HAS THE CAPABILITY
```

and, for this flow:

```text
CRITIQUE EXISTS ≠ DEVELOP EXISTS
```

### SEL-0 status boundary

`SEL-0 CORPUS 01` was retired unrun as confirmatory. `SEL-0B` remains a separate future confirmatory corpus requirement. This flow must not create, tune against, or consume SEL-0B.

The *Elemental Alchemy* walk is now product / experience evidence, not confirmatory selector evidence.

---

## 3. Mission

Define and falsify a **process-first Writer's Studio Develop room** in which the writer can:

1. arrive with a Work and a present developmental intention;
2. orient to where they are in the Work without being forced into MAIA's reading;
3. invite MAIA to notice or help when useful;
4. inspect, question, disagree with, or leave MAIA's observations cheaply;
5. decide whether something is worth taking up;
6. move into authored revision without losing the intention / observation / conversation that led there;
7. edit directly or explicitly commission MAIA to propose options;
8. keep MAIA-authored prose visibly provisional until the writer adopts it;
9. see what changed and reflect on whether the change served the Work;
10. continue the process, shift scope, or leave without the system manufacturing a next task.

The destination is not a workflow diagram presented to the member. It is an inhabitable room in which these movements are possible without exposing machinery.

---

## 4. Non-negotiable boundaries

### 4.1 Writer authority

```text
MAIA may notice
MAIA may ask
MAIA may propose
MAIA may compare
MAIA may help test

MAIA may not decide that an observation must be acted on
MAIA may not convert discussion into consent
MAIA may not turn silence into acceptance
MAIA may not write into the Work without a separate explicit writer act
```

**Proactivity proposes authority; it does not acquire it.**

### 4.2 Development → authorship crossing

A developmental observation may orient an edit, but it may not become an edit by implication.

The crossing must be explicit and preserve lineage:

```text
present intention
  → developmental thread / observation (if any)
  → exact manuscript locus
  → writer's editing act OR explicit commission for a MAIA proposal
  → proposed diff / option remains provisional
  → explicit writer adoption / modification / rejection
  → resulting revision
```

### 4.3 Critique is optional

A writer must be able to develop a Work without first requesting or consuming a MAIA reading.

A reading may orient. It may not become an entrance tax to Develop.

### 4.4 Process is not a task queue

Do not turn MAIA's observations into:

- a checklist;
- issue backlog;
- recommendation queue;
- completion percentage;
- required sequence;
- hidden scoring system rendered as priority.

The writer may remain with one question, move elsewhere, or leave.

### 4.5 Continuity without authority laundering

Persisted process state may help the writer resume, but:

> Consent to remember is not consent to be interpreted through the memory every time.

Write → Develop or prior Develop sessions may orient the present session; they may not manufacture the writer's present intention.

---

## 5. Flow sequence

Each stage produces evidence for the next. **Do not skip from the founder finding to UI implementation.**

### D0 — Preserve before-state

Capture, without tidying:

- the current Develop Experience Contract draft;
- the held Develop surface patch;
- screenshots / founder observations from WALK-FIXTURE-01 as diagnostics only;
- `EA-DEVELOP-WALK-01` and the real Chapter 4 reading;
- the founder finding that the room is critique-first and process-incomplete;
- the current API/runtime lock and migration status.

**Gate D0**: a later redesign must be comparable to the room that failed. If the before-state is rewritten as though the process model had always existed, STOP.

### D1 — Process archaeology

Read-only census of what the product already supports across Write / Develop / Conversations / Versions / Working Draft:

```text
present intention / commission
scope declaration
reading request
observation inspection
anchored conversation
exact manuscript navigation
editing
versioning
proposed text / diff if any
revision provenance
return-to-Develop
standing / keep / dismiss
session / process persistence
```

For every capability record:

```text
PRESENT
PARTIAL
ABSENT
```

and name the actual route/module/surface that proves it.

**Do not design yet.**

**Gate D1**: no inferred capability. If a writer action cannot be traced to a real surface/runtime path, it is not present.

### D2 — Model the writer's developmental process

Using founder-known Work evidence (initially *Elemental Alchemy*, Chapter 4) and real writing/development episodes, identify the human acts in development **without naming UI controls**.

Minimum questions:

1. What brings the writer into Develop now?
2. What is the writer trying to discover, change, test, or decide?
3. What counts as useful orientation before MAIA says anything?
4. When is a MAIA observation welcome?
5. When should MAIA remain quiet?
6. What does disagreement do to the process?
7. How does a writer decide to take something up?
8. What must travel with them into the manuscript?
9. How do they know whether an edit moved the Work?
10. What makes the next act theirs rather than MAIA's?

Output: a **human-activity process model**, not screens.

**Gate D2**: if the model can only be described as `read observations → discuss → edit`, FAIL. That is still critique-first.

### D3 — Establish room identity

Specify what Develop is **for** and what it is **not for**.

Required distinction:

```text
WRITE       authorship / manuscript making
DEVELOP     developmental process with the Work
READING     MAIA perception about the Work
CONVERSATION dialogue within the process
REVIEW      later review / verification activities
```

Decide where the primary process state lives and what remains a subordinate reference layer.

Questions that must be answered explicitly:

- Is the Work itself visible / addressable from Develop?
- What occupies the primary visual field on arrival?
- Where does present intention live?
- How does a reading appear without taking over the room?
- How does the writer enter and leave a developmental thread?
- How does the room signal that no next task is required?

**Gate D3**: on arrival, the room may not structurally make MAIA's findings the primary object unless the writer explicitly entered for that reading.

### D4 — Design the developmental loop

Specify the minimum process loop:

```text
ORIENT
  → ATTEND
  → INQUIRE
  → DECIDE
  → WORK
  → REFLECT
  → CONTINUE / LEAVE
```

Do not force every session through every state. These are available movements, not a wizard.

For each movement define:

- writer act;
- MAIA's permitted act;
- object in focus;
- authority boundary;
- durable state, if any;
- what must remain reversible;
- what does **not** happen automatically.

**Gate D4**: the loop must work both with and without a prior MAIA observation.

### D5 — Development → Authored Revision Crossing

Inspect the existing Write / Working Draft edit architecture and specify the **smallest real crossing** from Develop to authored work.

Required capabilities:

```text
work on this in manuscript
→ exact section / passage
→ developmental context remains reachable
→ writer edits directly
OR
→ writer explicitly asks MAIA for options / proposed revision
→ proposal is visibly provisional / diffed
→ writer explicitly adopts / alters / rejects
→ revision lineage retained
→ return to process without auto-closing the issue
```

Do not invent a parallel editor if Write already owns authorship.

**Gate D5**: a lifecycle act may never be disguised as editing, and an edit may never be disguised as acceptance of MAIA's interpretation.

### D6 — Process continuity

Specify what can persist between moves / sessions:

- present commission / intention;
- process thread;
- active locus / scope;
- offered observations;
- writer decisions;
- revision lineage;
- unresolved questions;
- explicit standing acts.

Distinguish:

```text
process continuity
≠ interpretation authority
≠ standing
≠ authored structure
```

**Gate D6**: resuming a process may offer prior context, but the writer must be able to re-ground or supersede it cheaply.

### D7 — Experience architecture candidates

Only now create 2–3 materially different process-first room candidates.

Each candidate must show:

- arrival before MAIA speaks;
- present intention / orientation;
- Work relation;
- how observations enter;
- conversation;
- revision crossing;
- reflection / return;
- quiet exit.

Do not make three cosmetic variants of the same critique layout.

For each candidate run the falsifiers in §6.

### D8 — Founder ruling on room architecture

Founder walks the candidates against a known Work / real chapter and rules one of:

```text
ADOPT
AMEND
REJECT
```

The founder walk must judge process, not merely styling or button success.

No Experience Contract may claim acceptance before this act.

### D9 — Rewrite the Develop Experience Contract

After a room architecture is ruled, supersede the current draft contract explicitly.

The new contract must describe:

- human activity;
- arrival;
- process movements / gestures;
- MAIA's role;
- Work / authorship crossing;
- non-consent boundary;
- continuity;
- forbidden patterns;
- same-house / distinct-room tests;
- founder walk evidence.

Preserve the failed contract / walk as before-state evidence.

### D10 — Implementation plan only

Produce the smallest implementation sequence mapping the adopted experience onto real Studio runtime paths.

Separate commits / lanes for:

1. process state substrate if needed;
2. room composition;
3. Develop → Write crossing;
4. proposal / diff support if needed;
5. continuity / provenance;
6. experience falsifiers / walk.

Do not implement unless separately authorized by the founder or by an already-ratified cross-phase authority that clearly covers this new design scope.

---

## 6. Process-first falsifiers

Any candidate room fails if one or more of these are true.

### PF-1 · critique owns arrival

On arrival, the dominant object is MAIA's reading / numbered observations rather than the writer's Work / process / present intention.

### PF-2 · MAIA must speak before development can begin

The writer cannot develop unless MAIA first generates or selects an observation.

### PF-3 · observation becomes task

An observation is rendered as something to clear, resolve, complete, or accept.

### PF-4 · conversation dead-end

The writer can discuss a developmental issue but cannot lawfully move from understanding into authored action while preserving context.

### PF-5 · bolted-on edit

The solution is merely `critique → Edit button`, with critique still defining room identity.

### PF-6 · context loss at authorship boundary

Moving into the manuscript loses the intention / observation / conversation / locus that motivated the edit.

### PF-7 · MAIA acquires the pen

A proposal, recommendation, silence, or discussion changes manuscript text without a separate explicit writer act.

### PF-8 · process act becomes standing

Ignoring, discussing, revising around, or moving past an observation silently becomes keep / dismiss / accept / resolved.

### PF-9 · false completion

An edit automatically means the developmental question is solved or the observation was correct.

### PF-10 · forced nextness

After an act, the room automatically manufactures a next issue / recommendation rather than returning choice to the writer.

### PF-11 · memory becomes authority

Persisted process state determines present interpretation without re-grounding in the writer's present intention and current Work.

### PF-12 · report architecture in process clothing

Removing the labels / styling reveals the same underlying object hierarchy as the current reading report.

---

## 7. Evidence discipline

Keep separate:

```text
CONSTITUTIONAL / FOUNDER AUTHORITY
EMPIRICAL PRODUCT FINDING
DESIGN HYPOTHESIS
IMPLEMENTATION CHOICE
EXPERIENCE WITNESS
```

Do not let a successful prototype become authority by success alone.

Do not let an implementation convenience decide room identity.

Do not treat a known-Work walk as statistical validation.

Do not treat SEL-0B as an experience fixture.

---

## 8. Standing at flow open

```text
FOUNDER FINDING                 RATIFIED — Develop is process, not critique alone
CURRENT DEVELOP EXPERIENCE      NOT ACCEPTED
CURRENT CRITIQUE / READING      USEFUL CAPABILITY · subordinate, not discarded
SELECTOR CORE / RUNTIME          LOCKED WORK EXISTS · not reopened here
F-7 RUNTIME ADJUDICATOR          ABSENT · separate product gap
SEL-0 CORPUS 01                  RETIRED UNRUN
SEL-0B                           REQUIRED · NOT CREATED
EA-DEVELOP-WALK-01               PRODUCT / EXPERIENCE EVIDENCE
DEVELOP PROCESS ARCHITECTURE     OPEN — THIS FLOW
IMPLEMENTATION                   NOT AUTHORIZED BY THIS FILE
MERGE / DEPLOY                   NOT AUTHORIZED
```

### First executable act

```text
D0 preserve before-state
then
D1 read-only process archaeology
```

Stop before proposing UI architecture until D1 is complete.

---

## 9. Return shape from each Jarvis act

```text
ACT
AUTHORITY READ
EVIDENCE INSPECTED
FINDING
GATE
DURABLE RECORD
NEXT ACT
FOUNDER RULING REQUIRED? YES / NO
```

If `YES`, stop. Do not answer the ruling on the founder's behalf.
