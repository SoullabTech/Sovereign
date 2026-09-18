# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J1 — Native Desktop Read-Only Census

**Date:** 2026-09-18
**Canonical subject:** 9580ad382089e8ce2e454d28ff3d97c2aa8efe11
**Programme:** JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01
**Standing:** READ-ONLY CENSUS — no runtime/UI implementation authorized

---

## 0 · Census question

> **What native substrate, intelligence, continuity and interaction capability already exists beneath JARVIS Desktop, what is still cockpit-specific, and what must actually be designed for a genuinely native environment?**

Evidence states used here:

- **OBSERVED** — exact implementation exists in current canonical.
- **PARTIAL** — a usable primitive exists, but not the full experience capability.
- **ABSENT** — no implementation found in the declared Desktop surface.
- **OPEN** — design/authority question not settled by current implementation.

This census distinguishes **mechanism availability** from **experience architecture**. The existence of filesystem or model machinery does not mean the corresponding human experience exists.

---

## 1 · Current visible product

### J1-F1 — current information architecture is still an operational cockpit

**State:** OBSERVED

Top-level navigation in current canonical:

~~~text
Home
Work
System
Living Spiral
~~~

The Work view contains:

- Run through JARVIS;
- canonical Work Unit substrate;
- route / transport / provenance / adjudication presentation;
- continuity recall;
- manual bounded task path;
- legacy/compatibility provider strategy.

System and Living Spiral expose system truth, Builder state, evidence links and operational geometry.

### Interpretation

The visible architecture answers:

> **What is JARVIS doing, what does it know, what is held, and what machinery may act?**

It does not yet answer:

> **Where am I working, what am I trying to understand or create, what materials belong here, what has changed over time, and what kind of Studio am I in?**

### Consequence

I4 solved constitutional truth. It did not solve native human-purpose architecture.

---

## 2 · Native shell and windowing

| Capability | State | Exact observed seam | Census finding |
|---|---|---|---|
| Electron native app | OBSERVED | jarvis-desktop/package.json; src/main.js | macOS Electron app exists and is packaged/signed |
| Main BrowserWindow | OBSERVED | main.js createWindow() | one primary 880×640 window |
| Preferences window | OBSERVED | main.js openPreferences() | second bounded native window exists |
| Single-instance identity | OBSERVED | app.requestSingleInstanceLock() | app intentionally prevents duplicate artifact identity |
| Multiple project/studio windows | ABSENT | no project-window manager found | native multi-window work is not yet designed |
| Window-state persistence by project | ABSENT | no project window model found | reopen/spatial continuity does not exist |
| BrowserView / WebContentsView composition | ABSENT | no use found | no embedded rich multi-view architecture today |
| Native notifications | ABSENT | no Notification use found | no governed background completion surface |
| Global shortcuts | ABSENT | no globalShortcut use found | keyboard-native workflow not yet designed |

### Finding

The app is native in packaging and authority boundaries, but still behaves largely like a single web page inside one Electron window.

---

## 3 · Local files and OS integration

| Capability | State | Evidence | Finding |
|---|---|---|---|
| Native directory chooser | OBSERVED | dialog.showOpenDialog in main.js | founder can bind one Sovereign repository |
| Bound-repo validation | OBSERVED | bindRepoRoot / canonical markers | arbitrary folder cannot silently become execution substrate |
| Finder reveal | OBSERVED | shell.showItemInFolder | bound workspace/config can be revealed natively |
| Arbitrary project file chooser | ABSENT | no openFile chooser found | cannot yet assemble project materials from local files |
| Save/export dialog | ABSENT | no showSaveDialog found | artifact export not native |
| Drag/drop ingestion | ABSENT | no drop/dragstart handling found | no direct source/file spatial workflow |
| File watching | ABSENT | no fs.watch/chokidar found | external edits do not update project context automatically |
| Clipboard-native ingestion | ABSENT | no Electron clipboard use found | clipboard remains ordinary browser paste |
| Local document/media inspection | ABSENT | no canonical viewer layer found | PDFs/images/audio/video are not first-class native artifacts |
| Filesystem custody model beyond repo | OPEN | I4 only authorizes bounded repo scope | broader local-file access requires a new custody contract |

### Finding

JARVIS already knows how to **bind a trusted repository**. It does not yet know how to form a **human-owned Project from bounded local materials**.

This is a major native opportunity and a major privacy boundary.

---

## 4 · Persistence and continuity

### J1-F2 — canonical Work Units persist locally

**State:** OBSERVED

Current canonical Work Unit v2 storage:

~~~text
<AIN_DELEGATION_HOME>/work-units-v2/<id>.json
<AIN_DELEGATION_HOME>/work-units-v2/<id>.desktop.json
~~~

The canonical envelope and presentation-side metadata survive Desktop sessions.

### J1-F3 — local continuity search exists

**State:** OBSERVED / PARTIAL

Continuity module:

- reads a local SQLite projection;
- defaults to ~/.jarvis/continuity/continuity.sqlite3;
- searches branch records and historical records through jarvis-recall.py;
- is read-only;
- marks historical authority explicitly;
- sends no retrieved material to a model by itself;
- describes imported material as LOCAL_ONLY by default.

### Missing continuity

**State:** ABSENT

No Project-level continuity object was found that remembers:

- active artifact;
- spatial arrangement;
- open sources;
- unresolved questions;
- learning state;
- developmental arc;
- current Studio;
- current people/case context;
- prior decisions as project state;
- exact place to resume.

### Finding

JARVIS can retrieve history and persist governed acts. It cannot yet reopen a **lived working context**.

---

## 5 · Canonical intelligence/governance substrate

| Substrate | State | Standing after I4 |
|---|---|---|
| W0.v2 Work Unit | OBSERVED | canonical governed act |
| W2.v2 lifecycle | OBSERVED | sole lifecycle authority |
| J5/W3 family-first route | OBSERVED | cognitive route truth |
| W3T transport binding | OBSERVED | provider/model realization |
| W4.v2 provenance | OBSERVED | append-only attempt/verifier history |
| DR1 durable result standing | OBSERVED | provider durable outcome mapping |
| W5.v2 composition | OBSERVED | synthetic end-to-end lifecycle |
| human adjudication | OBSERVED | explicit Desktop gesture |
| legacy R5B execution | OBSERVED | compatibility lane only |
| canonical provider execution | ABSENT / DELIBERATELY CLOSED | later security/governance lane |

### Finding

The intelligence substrate is **ahead of the experience architecture**.

This is the inverse of the usual AI product problem: JARVIS does not need more provider UI before it can become more useful. It needs a richer human environment over the law already earned.

---

## 6 · Current intelligence presentation

### OBSERVED

The Desktop already has reusable presentation concepts:

- operational legibility vocabulary;
- truthful state mapping;
- provenance projection;
- "Needs you" / hold explanations;
- Living Spiral evidenced relation graph;
- Work Unit read model;
- route family vs transport distinction;
- immutable attempt timeline;
- verification vs adjudication separation;
- continuity recall;
- bounded task entry.

### PARTIAL

These are optimized for **operator legibility**, not for:

- scholarly research;
- teaching;
- mentoring;
- personal reflection;
- writing;
- project creation;
- learning;
- long-lived creative work.

### Design consequence

The programme should **reuse the epistemic grammar** without reusing the cockpit as the default visual metaphor.

---

## 7 · Spatial / canvas capability

| Capability | State | Finding |
|---|---|---|
| Living Spiral operational graph | OBSERVED | system/provenance projection exists |
| user-authored canvas | ABSENT | no spatial working surface |
| source/evidence canvas | ABSENT | no claim/source arrangement |
| concept map | ABSENT | no learning/teaching spatial model |
| relationship/case map | ABSENT | no mentoring/supervision spatial model |
| drag/rearrange persistent nodes | ABSENT | no user-authored spatial persistence |

### Finding

The Living Spiral proves JARVIS can render evidence-aware geometry, but it is an **operational read projection**, not a general-purpose Canvas primitive.

A future Canvas should not be built by repurposing Living Spiral semantics unless their authority contracts actually match.

---

## 8 · Research capability

### Existing reusable primitives

**State:** PARTIAL

- local repository evidence;
- continuity search;
- exact evidence references;
- model-family route / independent review;
- append-only provenance;
- external bounded evidence membrane;
- source/governance discipline;
- local and external model transports beneath Work Units.

### Missing experience layer

**State:** ABSENT

No native Research Studio currently provides:

- source collection;
- PDF/web/local document viewer;
- research question ledger;
- claim/evidence cards;
- contradiction view;
- evidence canvas;
- source comparison;
- citation inspection in-context;
- persistent research notebook;
- literature map;
- reusable research project state.

### Finding

Research Studio can reuse the most substrate with the least relational ambiguity.

This strongly supports it as the first native Studio candidate.

---

## 9 · Teaching / learning capability

### Repository capability

**State:** PARTIAL / EXTERNAL TO DESKTOP

MAIA Teaching Intelligence T1–T3 is now present in current canonical as a separate programme.

### Desktop experience

**State:** ABSENT

No native Desktop Teaching/Learning Studio currently exposes:

- lesson structure;
- concept maps;
- teach-back;
- retrieval practice;
- mastery state;
- misunderstanding repair history;
- curriculum/project continuity;
- source-grounded teaching artifacts.

### Boundary

**State:** OPEN

The Desktop programme must decide:

- whether JARVIS teaches directly;
- whether MAIA is the teaching presence;
- whether teaching intelligence is a shared substrate consumed by distinct identities;
- how member/founder/professional teaching contexts differ.

No UI should settle that identity question accidentally.

---

## 10 · Mentoring / personal-development capability

### Mechanisms available beneath

**State:** PARTIAL

- continuity search;
- long-lived local Work Units;
- provenance;
- explicit human adjudication;
- bounded framework/source use;
- possible local/private custody.

### Experience / relational authority

**State:** OPEN / ABSENT

No native Mentor or Personal Studio currently defines:

- relational identity;
- consent/custody posture;
- longitudinal developmental state;
- practices;
- reflections;
- goals;
- contradiction/change-over-time representation;
- supervision/case boundaries;
- clinical/non-clinical distinction;
- human mentor vs JARVIS vs MAIA role.

### Finding

These may become powerful native environments, but they should **not be the first implementation**. Their relational ambiguity is higher than Research Studio.

---

## 11 · Writing / artifact creation

### State

**ABSENT as a native Studio**

The Desktop can display text and create governance/evidence artifacts through Builder mechanisms, but no native authoring environment was found with:

- editable local documents as first-class artifacts;
- source/draft side-by-side;
- outline / structure map;
- revision history;
- provenance-aware editorial passes;
- export/save workflows;
- artifact collections.

### Reuse opportunity

Writer's Studio and MAIA teaching/editorial work elsewhere in Soullab may offer product concepts, but this programme must not assume their browser architecture should be copied into Desktop.

---

## 12 · Voice / media

| Capability | State |
|---|---|
| JARVIS Desktop microphone / voice conversation | ABSENT |
| local audio inspection | ABSENT |
| image/media workspace | ABSENT |
| camera/screen capture | ABSENT |
| desktopCapturer | ABSENT |
| voice/media custody contract | OPEN |

### Finding

Native media could be valuable later, but there is no evidence it belongs in J0–J3 architecture implementation.

Voice should not be added merely because native apps can access microphones.

---

## 13 · Background work / autonomy

### Existing mechanism

**PARTIAL**

Desktop can launch bounded governed child processes and legacy/provider operations under existing authority law.

### Native experience

**ABSENT**

No general Project background-job model currently provides:

- visible queued work;
- bounded start/stop;
- background progress;
- notification on completion;
- project attachment;
- custody/authority summary;
- resume/retry semantics.

### Law

Native background work must inherit:

> **Native does not mean autonomous.**

A background task is a governed Work Unit or other explicitly authorized act, not ambient agent permission.

---

## 14 · Multi-project / multi-context architecture

**State:** ABSENT

Current app:

- uses a single-instance lock;
- has one main window;
- binds one active Sovereign repository;
- has no Project registry;
- has no recent-project switcher;
- has no separate Studio/project window semantics;
- has no project-scoped file/source collection.

### Design implication

A future Project model must decide whether:

1. one app instance hosts many Projects in tabs/spaces;
2. Projects may open dedicated native windows while one process remains authoritative;
3. both are allowed.

This is a J2/J3 design question, not an implementation assumption.

---

## 15 · Security / custody strengths already worth preserving

### OBSERVED

- contextIsolation enabled;
- nodeIntegration disabled in renderer;
- narrow preload bridge;
- native repo chooser validated in MAIN;
- renderer cannot name arbitrary repo path;
- Finder reveal takes no renderer-supplied path;
- single Work Unit action channel with explicit allowlist;
- Work Unit read model presentation-only;
- canonical provider execution disconnected;
- local continuity projection is non-authoritative/read-only.

### Finding

The current Desktop's narrow privilege surface is a strategic asset.

Native experience architecture should **not** respond to richer design by opening a broad arbitrary filesystem/shell IPC bridge.

Every new native affordance should earn a minimal dedicated authority contract.

---

## 16 · Architecture debt inherited from cockpit era

| Debt | State | Consequence |
|---|---|---|
| package describes product as "operational console" | OBSERVED | product identity is outdated for future ambition |
| macOS category = developer-tools | OBSERVED | appropriate today; may become too narrow |
| main window fixed 880×640 | OBSERVED | not suited to deep multi-pane work |
| Home/Work/System/Spiral top-level IA | OBSERVED | mechanism-oriented |
| Work view is extremely large renderer composition | OBSERVED | experience modes are not modular |
| legacy R5B UI remains in same renderer | OBSERVED | compatibility must not shape future shell |
| no Project object | ABSENT | no durable human-purpose container |
| no Artifact abstraction | ABSENT | files/results are mechanism-specific |
| no Canvas primitive | ABSENT | spatial knowledge/evidence work impossible |
| no Studio contract | ABSENT | research/teaching/mentoring risk becoming ad-hoc pages |
| no project state restore | ABSENT | continuity remains recall, not lived state |

---

## 17 · Reuse / preserve / do-not-reuse map

### Preserve as constitutional substrate

- W0/W2/J5/W3/W3T/W4/DR1/W5;
- R4/R5A and current execution disconnect;
- R5B compatibility boundary until separately retired;
- narrow preload / MAIN validation;
- repo binding truthfulness;
- provenance and epistemic vocabulary;
- continuity authority labels;
- Builder/session governance;
- explicit human adjudication.

### Reuse as design primitives

- operational legibility vocabulary;
- Living Spiral evidence/provenance ideas;
- continuity search;
- local Work Unit persistence;
- native folder chooser pattern;
- Finder reveal pattern;
- canonical read-model pattern;
- explicit hold / next-lawful-act presentation.

### Do not promote to future experience architecture

- provider checkboxes as primary work model;
- provider_strategy as human-facing organizing principle;
- Home/Work/System/Spiral as assumed permanent IA;
- one giant renderer as Studio architecture;
- Work Unit as Project;
- transcript as primary artifact;
- operational graph as universal Canvas;
- legacy packet storage as new Project persistence.

---

## 18 · Candidate missing primitives required for the native vision

Before the Desktop can fully support research, teaching, mentoring, personal development and other Studios, the architecture needs candidate contracts for:

1. **Project / Living Context**
2. **Artifact**
3. **Thread**
4. **Studio**
5. **Canvas**
6. **Project Continuity Snapshot**
7. **Bounded Local Source / File Reference**
8. **Studio Read Model**
9. **Native Window / Pane State**
10. **Background Governed Activity**
11. **Identity / Presence Contract**
12. **Project-level Custody Contract**

These should be documentary contracts before implementation.

---

## 19 · Major open questions for J2

### Q1 · Project authority

Is a Project itself authority-bearing, or does it merely contain authority-bearing Work Units?

**Candidate:** Project is context/custody, not execution authority. Work Units remain consequential-act authority.

### Q2 · Project vs Field

Should "Project" remain the technical term, while some human-facing contexts are called Field, Journey, Studio, Case, Inquiry or Practice?

### Q3 · JARVIS vs MAIA identity

Which Studios are properly JARVIS-native?

Which require MAIA as a distinct relational presence?

Can one Project host both without identity blur?

### Q4 · Local files

What is the smallest consent/custody model that allows a person to deliberately attach local files/folders without granting ambient filesystem surveillance?

### Q5 · Multi-window

Should a Project be able to open a dedicated window, or should the first architecture remain one-window / multi-pane?

### Q6 · Canvas

Is Canvas one general spatial primitive with typed nodes, or should Research / Teaching / Mentoring each have distinct spatial models?

### Q7 · Shared library

Is Source Library global, project-scoped, or both?

### Q8 · Persistence

Which state is reconstructible cache versus canonical personal/project state?

### Q9 · Background work

Which activities can run while the human moves elsewhere in Desktop, and how does authority remain visible?

### Q10 · First Studio

Does Research Studio remain the best proving ground after the founder sees the full candidate architecture?

---

## 20 · J1 verdict

### What already exists

JARVIS has a strong native **constitutional substrate**:

- local application shell;
- narrow OS privilege boundary;
- trusted repository binding;
- governed local execution;
- local continuity search;
- local canonical Work Unit persistence;
- provenance;
- model-family routing;
- human adjudication;
- evidence-aware operational projection.

### What does not yet exist

JARVIS does not yet have a native **human-purpose environment**:

- no Projects;
- no Studios;
- no bounded local source collections;
- no persistent spatial work;
- no artifact model;
- no project-state continuity;
- no document/media workbench;
- no background project activity model;
- no teaching/mentoring/personal-development experience contracts.

### Architectural conclusion

> **Do not redesign the cockpit into a prettier cockpit.**

The next design layer should introduce a durable **Project / Living Context architecture** and place Studios inside it, with the Work Unit substrate receding beneath ordinary use.

### First-studio standing

Research Studio remains the strongest **candidate**, not yet a founder ruling.

---

## 21 · J1 standing

**J1 READ-ONLY CENSUS: COMPLETE AS A DOCUMENTARY CANDIDATE**

No Desktop source/UI/runtime file changed.

No new IPC channel, filesystem authority, provider execution, credential, schema, database, deployment, production or MAIA member-facing change is authorized or performed by this census.

Next legitimate gate:

> **J2 — EXPERIENCE ARCHITECTURE CANDIDATE**

J2 should define the Project / Studio / Artifact / Thread / Canvas / Continuity model and the human-facing shell relationship before any new Desktop UI is implemented.
