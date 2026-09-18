# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 — Programme Charter

**Opened:** 2026-09-18
**Canonical base:** 9580ad382089e8ce2e454d28ff3d97c2aa8efe11
**Status:** OPEN — architecture/design research only; no experience implementation authorized by this charter
**Precondition satisfied:** I4 Desktop canonical convergence is merged and canonical

---

## 0 · Why this programme exists

JARVIS Desktop now has something it did not have before I4: a canonical constitutional substrate beneath the interface.

The Desktop can create and read W0.v2 Work Units, move lifecycle only through W2.v2, bind J5/W3 cognitive routes, distinguish W3T transport realization from model-family identity, preserve W4 provenance, and keep adjudication human-authored. That means the Desktop no longer needs to organize itself around provider machinery.

The visible product, however, is still fundamentally an operational cockpit:

~~~text
Home · Work · System · Living Spiral
~~~

That cockpit was the correct instrument for proving truthfulness, authority, provenance, local substrate binding and governed execution. It is not the final native experience.

This programme asks:

> **What should a native Soullab/JARVIS environment become when governance no longer has to dominate the visible experience?**

The answer must exploit what a native application can uniquely offer rather than imitate the PWA in a larger window.

---

## 1 · Governing purpose

Design a native JARVIS environment that helps a person **research, learn, teach, mentor, create, reflect, develop, synthesize, remember, organize and act** across long-lived work and life contexts while preserving Soullab's constitutional disciplines underneath.

The Desktop should become an environment for serious human work and development, not merely an AI chat application and not merely an operator console.

### Governing question

> **What can become more possible for a person because JARVIS inhabits their native working environment rather than only a browser conversation?**

### Native test

Every proposed Desktop capability must answer:

> **What does native presence make meaningfully better here?**

If the answer is only "the same thing in Electron," the capability does not justify a native surface.

---

## 2 · Inherited law — this programme does not re-derive it

### From JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01

> **Human experience is the subject. Product behavior is evidence about that experience, not the ultimate objective.**

North star:

> **What becomes more possible for the human being because this encounter occurred?**

The Desktop inherits the Human Experience dimensions where relevant:

- Agency
- Orientation
- Attunement
- Competence
- Relationship
- Trust
- Meaning
- Continuity
- Sovereignty

The Desktop programme does not replace that research lane and does not promote any MAIA-wide principle.

### From JARVIS-DESKTOP-OPERATOR-FLOW-02

> **The founder states the desired outcome. JARVIS handles machinery. The founder is asked only for consequential choices that cannot be inferred safely.**

This becomes a permanent interaction law, generalized beyond founder/operator use.

### From I4 canonical convergence

> **The Work Unit is the Desktop's constitutional nervous system; it is not the whole visible experience.**

Visible environments consume the canonical substrate. They do not duplicate authority, lifecycle, routing, transport identity, provenance, durable-result standing or adjudication.

---

## 3 · Core design thesis

The native Desktop should organize around **durable human purposes and contexts**, not around AI mechanisms.

The primary object is therefore not a provider, model, prompt, Work Unit, chat thread or tool invocation.

The candidate primary object is:

> **PROJECT / LIVING CONTEXT — a durable place in which a person is trying to understand, create, teach, learn, develop, decide or accomplish something over time.**

A Project may contain questions and intentions, local files, source material, conversations, notes, canvases, artifacts, people/relational context where appropriate, timelines, practices, Work Units, evidence, decisions, unfinished threads, teaching/mentoring state, reflections and outputs.

The Work Unit governs consequential acts inside the Project. It does not replace the Project.

---

## 4 · Candidate native object model

~~~text
DESKTOP
  │
  ├── PROJECT / LIVING CONTEXT
  │     │
  │     ├── THREAD
  │     │     a durable question, intention, problem or developmental arc
  │     │
  │     ├── STUDIO
  │     │     a mode of working appropriate to the human purpose
  │     │
  │     ├── ARTIFACT
  │     │     document, note, source, file, result, media, plan, practice
  │     │
  │     ├── CANVAS
  │     │     spatial arrangement of questions, evidence, relationships and artifacts
  │     │
  │     ├── SESSION
  │     │     one bounded encounter / working period
  │     │
  │     ├── CONTINUITY
  │     │     historical state, unresolved threads, decisions, prior evidence
  │     │
  │     └── WORK UNIT
  │           governed consequential act beneath the experience
  │
  └── SHARED NATIVE INSTRUMENTS
        files · sources · search · evidence · timeline · voice · local tools
        provenance · comparison · inspectors · multi-pane context · export
~~~

This is a candidate architecture. It becomes implementation authority only after founder adjudication.

---

## 5 · Candidate experience families

These are **human-purpose families**, not permanent top-level navigation decisions.

### A · Research

For finding, gathering, comparing, questioning and synthesizing knowledge.

Candidate instruments:

- Research Studio
- Source Library
- Evidence Canvas
- question / hypothesis threads
- PDF / document / web-source inspection
- comparison matrices
- citation / provenance view
- contradictions / unknowns
- long-lived research notebooks
- multi-model governed challenge beneath the surface

### B · Learning & Teaching

For understanding something deeply and helping another person understand it.

Candidate instruments:

- Teaching Studio
- Learning Path
- concept map
- explainer / example / contrast views
- quiz / retrieval practice
- mastery / uncertainty ledger
- source-grounded lessons
- teach-back / check-understanding loop
- curriculum / primer assembly

This should consume the emerging MAIA Teaching Intelligence corpus where constitutionally appropriate; it does not silently make MAIA and JARVIS the same identity.

### C · Mentoring / Supervision

For developmental guidance over time.

Candidate instruments:

- Mentor Studio
- longitudinal goals / questions
- session continuity
- case / project context
- observation vs interpretation distinction
- practices / next acts
- reflection on progress
- decision history
- bounded source/framework access
- supervision / coaching lenses where authorized

The programme must explicitly decide the identity and relational boundary between JARVIS, MAIA, coach/mentor roles and professional contexts before member-facing implementation.

### D · Becoming / Personal Development

For self-inquiry, reflection, patterns, practices and development arcs.

Candidate instruments:

- Personal Studio
- Reflection Field
- journal / private notes
- inquiry threads
- practices
- developmental arcs
- contradiction / change-over-time view
- values / intentions
- relationship between insight and real-world action

This family is especially sensitive to privacy, relational stance and identity. Native capability does not itself authorize JARVIS to occupy MAIA's relational role.

### E · Creating / Writing / Making

For producing substantial artifacts.

Candidate instruments:

- Writing Studio
- source + draft multi-pane workspace
- outline / structure / argument map
- artifact history
- editorial passes
- provenance-aware assistance
- local file integration
- export / packaging

### F · Systems / Building

For architecture, software, operations and complex project execution.

Candidate instruments:

- Builder Studio
- governed Work Unit timeline
- repository / file graph
- evidence / tests / diffs
- plans / dependencies
- decision records
- model-family route readout when useful
- execution controls only under separately authorized canonical execution law

---

## 6 · Shared native shell — candidate

The Desktop should not become six disconnected mini-apps.

Candidate common shell:

~~~text
┌─────────────────────────────────────────────────────────────────────┐
│ Project / Living Context                              Presence      │
├──────────────┬───────────────────────────────────┬──────────────────┤
│ Context      │ Main Studio / Canvas              │ Intelligence     │
│              │                                   │                  │
│ files        │ document / canvas / lesson        │ JARVIS dialogue  │
│ sources      │ evidence / writing / practice     │ questions        │
│ threads      │ project-specific working surface  │ suggestions      │
│ timeline     │                                   │ explanation      │
│ people       │                                   │ provenance       │
├──────────────┴───────────────────────────────────┴──────────────────┤
│ Continuity / evidence / next lawful act / background activity      │
└─────────────────────────────────────────────────────────────────────┘
~~~

This is **not** a wireframe authorization. It identifies a possible native composition law:

- durable context remains visible;
- the primary work has room to breathe;
- intelligence is adjacent rather than swallowing the workspace;
- provenance / lawful next acts remain available without dominating the experience.

---

## 7 · Native advantages to deliberately exploit

1. **Persistent multi-window / multi-pane work** — project remains spatially stable; source, artifact, canvas and intelligence can coexist.
2. **Deep local-file integration** — bounded user-chosen files/folders, document/media inspection, local artifact creation, Finder integration, future file watching where explicitly governed.
3. **Long-lived project continuity** — reopen where the person actually was; unresolved threads/evidence/decisions survive sessions.
4. **Local-first / privacy-sensitive work** — use local models and local stores where appropriate; keep custody visible and governed.
5. **Rich drag/drop and clipboard workflows** — native ingestion and arrangement rather than upload-form friction.
6. **Spatial evidence / knowledge canvases** — organize relations among claims, sources, people, concepts and artifacts.
7. **Native media** — audio, voice, image and video work where explicitly authorized.
8. **Background bounded work** — governed research/indexing/analysis jobs that can continue while the person works elsewhere; no hidden authority expansion.
9. **System integration** — file dialogs, Finder reveal, notifications, menus, keyboard commands; future calendar/mail/app integration only through separately governed connectors.
10. **Multiple simultaneous contexts** — native windows can represent projects/studios without forcing one browser-route stack.

---

## 8 · Experience laws — candidate constitution

### E1 · Human purpose first
The first visible question should be about what the person is trying to understand, create, learn, teach, develop or accomplish. Mechanisms are secondary.

### E2 · Context should stay in sight
JARVIS should not repeatedly force the person to reconstruct the project inside chat. Relevant files, sources, threads, artifacts and history should remain inspectable.

### E3 · Intelligence is adjacent to the work
The central object is often the document, canvas, lesson, evidence set, practice or project — not the conversation transcript. Chat may be one instrument among several.

### E4 · The Desktop remembers state, not merely text
Continuity includes where the person was, what was unresolved, which evidence mattered, what decisions were made, what artifact was active, and what practice/learning state was in progress.

### E5 · Provenance is near the claim
When JARVIS teaches, synthesizes, advises or researches, the person should be able to inspect where important claims came from without leaving the experience.

### E6 · Locality should be legible
The person should be able to understand whether a source, model, file or action is local, external, private, disclosed or unavailable.

### E7 · Native power requires explicit custody
A native app can see more of a person's world. Therefore native affordance must produce stronger — not weaker — custody boundaries.

### E8 · Spatial persistence is useful only if it carries meaning
Do not create dashboards merely because Desktop has more pixels. Spatial arrangement should preserve human orientation, relationship and working memory.

### E9 · Modes follow purpose, not departments
Research, learning, mentoring, becoming, creating and building are experiential modes. They may coexist inside one Project and should not automatically become isolated product silos.

### E10 · The substrate should recede when healthy
W0/W2/J5/W3/W3T/W4 should be inspectable, but the person should not need to think in those terms to do ordinary work. Governance becomes foreground only when consequential choice, refusal, custody or adjudication requires it.

### E11 · Native does not mean autonomous
Background work, filesystem access, notifications and system integration may increase convenience; they do not create new authority.

### E12 · The person can always return to the world
The Desktop should increase capacity to think, make, learn, relate and act beyond JARVIS — not make JARVIS the center of the person's life.

---

## 9 · Explicit non-goals

This programme is not:

- a replacement for MAIA;
- authorization to merge JARVIS and MAIA identity;
- a provider execution programme;
- a generalized plugin marketplace;
- an Electron re-skin of the PWA;
- a dashboard proliferation exercise;
- a command center that exposes every internal mechanism;
- permission for broad filesystem surveillance;
- permission for background autonomous action;
- permission for clinical or therapeutic claims;
- permission to redesign the sacred /maia member experience;
- permission to implement every candidate Studio.

---

## 10 · Architectural boundary with MAIA / PWA

The PWA and native Desktop should not compete by duplicating every surface.

### PWA strengths — candidate default

- accessible anywhere;
- member-facing relational continuity;
- lightweight conversation;
- mobile;
- shared / social / service surfaces;
- ordinary account and platform access.

### Native Desktop strengths — candidate default

- deep work;
- local context;
- persistent project state;
- files / sources / artifacts;
- spatial and multi-pane work;
- professional / creator workflows;
- long-running bounded operations;
- richer research / learning / building instruments.

### Open identity question

The programme must explicitly resolve:

> **When is the intelligence in a native Studio JARVIS, when is it MAIA, and when is MAIA a distinct presence inside the Desktop?**

No implementation may answer this implicitly through copy or avatar alone.

---

## 11 · Programme sequence

~~~text
J0  CHARTER
    define native question, inherit law, prevent cockpit/PWA drift
      ↓
J1  READ-ONLY CENSUS
    current affordances, substrate, debt, reusable seams, gaps
      ↓
J2  EXPERIENCE ARCHITECTURE CANDIDATE
    Project / Studio / Thread / Canvas / Artifact / Continuity model
      ↓
J3  NATIVE SHELL EXPERIENCE CONTRACT
    arrival, project opening, spatial model, intelligence adjacency
      ↓
J4  FIRST-STUDIO SELECTION
    founder chooses first native experience
      ↓
J5  PROTOTYPE
    no provider-execution expansion; smallest experiential prototype
      ↓
J6  FOUNDER WITNESS
      ↓
J7  BOUNDED IMPLEMENTATION
      ↓
J8  RELEASE EVIDENCE / LEARN
~~~

Every later Studio repeats its own contract → prototype → witness → implementation sequence.

---

## 12 · Recommended first Studio

Candidate recommendation for later founder adjudication:

> **Research Studio**

Why it is the strongest first proving ground:

- naturally uses local files and source material;
- benefits from multiple panes;
- needs evidence/provenance nearby;
- benefits from canvases and persistent questions;
- exercises continuity;
- exercises governed multi-model challenge without requiring provider-first UI;
- can produce artifacts;
- can later feed Teaching Studio, Writing Studio, Mentoring and Systems work;
- is less relationally ambiguous than Personal Development as the first native prototype.

This charter does **not** authorize its implementation.

---

## 13 · Founder stops

Founder judgment is required before:

- selecting the permanent top-level native information architecture;
- deciding JARVIS vs MAIA identity inside Studios;
- opening a Personal Development or Mentoring member-facing surface;
- broadening filesystem or OS permissions;
- adding background autonomy;
- adding new privileged IPC channels;
- connecting canonical provider execution;
- selecting the first Studio for implementation;
- any member-facing deployment.

---

## 14 · Standing

This charter opens the architecture programme only.

Authorized under this opening:

- repository census;
- documentary architecture;
- comparative design reasoning;
- experience contracts.

Not authorized:

- Desktop source/UI changes;
- provider execution;
- new credentials;
- new external disclosure;
- schema/database changes;
- deployment;
- production;
- MAIA member-facing changes.
