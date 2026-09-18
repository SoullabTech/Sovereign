# JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J4 — Interactive Prototype Witness Record

**Date:** 2026-09-18
**Authorized parent:** f3f078ba384e3ee765e49455be8d314d885d4515
**Standing:** NON-PRODUCTION INTERACTIVE EXPERIENCE PROTOTYPE
**Implementation authority:** NONE

---

## 1 · Prototype artifact

Directory:

prototypes/jarvis-research-studio-j4/

Files:

- index.html
- styles.css
- prototype.js
- README.md
- verify.mjs
- visual-check.mjs

The experience itself is static HTML/CSS/JavaScript wrapped for Founder witness in a standalone native macOS AppKit/WKWebView application.

Native witness bundle:

/private/tmp/JARVIS Research Studio Prototype.app

The native wrapper:
- uses one AppKit NSWindow;
- uses a non-persistent WKWebView data store;
- loads only the prototype resources bundled inside the .app;
- refuses non-file navigation;
- creates no IPC bridge;
- exposes no filesystem chooser or arbitrary local path;
- performs no network request, model/provider call, credential access, or persistence.

It does not modify JARVIS Desktop runtime source.

It does not add an Electron window, IPC channel, local-file permission, provider execution connector, credential path, database, schema, deployment, or production behavior.

---

## 2 · J3 boundaries preserved

The prototype visibly preserves:

- Project is primary.
- Research occupies the center.
- JARVIS is adjacent and collapsible.
- Work Unit/provider machinery recedes.
- provenance remains inspectable.
- custody/refusal preserves orientation.
- permanent global navigation remains unratified.
- Research Canvas is a witness primitive only, not universal Canvas canon.
- System remains reachable as a secondary instrument.
- Research Studio uses JARVIS identity, not MAIA identity.

---

## 3 · Runtime isolation

Executable prototype files were scanned for:

- fetch
- XMLHttpRequest
- WebSocket
- localStorage
- sessionStorage
- IndexedDB
- Node require
- Electron APIs
- ipcRenderer / ipcMain
- child_process
- filesystem APIs
- process.env
- media-device APIs
- Desktop capture
- window.jarvis / window.electron

Result:

**PASS — no privileged/runtime seams found.**

External asset scan:

**PASS — no HTTP/HTTPS assets.**

All prototype state is browser-memory only.

Refresh resets the prototype.

---

## 4 · Required witness-state coverage

The prototype includes 16 direct witness/test states:

1. W0 Native arrival
2. W1 Return to Project
3. W2 Project Home
4. W3 Research Studio
5. W3A JARVIS collapsed
6. W4 Claim focus
7. W5 Source Reader
8. W6 Ask JARVIS / proposal
9. W7 Compare Sources
10. W8 Challenge Claim
11. W9 Custody hold
12. F1 Source unavailable
13. F2 Source changed
14. A1 Synthesis Artifact
15. SYS System escape
16. RET Return-after-absence reprise

The top-right Witness states menu is prototype-only test instrumentation and is not proposed product UI.

---

## 5 · Interaction walk

A real headless Chromium walk using Playwright exercised:

- arrival → Project selection;
- faithful resume;
- Project Home;
- Research Studio;
- Claim focus;
- provenance reveal;
- Source Reader;
- return to Canvas;
- Ask JARVIS;
- proposed Unknown;
- explicit human Accept;
- Source comparison;
- custody hold;
- JARVIS collapse;
- Source unavailable;
- Source changed;
- Synthesis Artifact;
- System escape;
- return-after-absence.

Result:

**J4_INTERACTION_WALK_PASS**

Key verified experience assertions:

- recent Project appears on arrival;
- faithful continuity state appears on return;
- Project Home orients without an activity-feed frame;
- Research Studio shows Local Project custody;
- active inquiry is visible;
- Claim provenance remains adjacent;
- Source authority is preserved;
- JARVIS proposal does not silently persist;
- explicit human acceptance is visible;
- graph/vector competitor remains present in comparison;
- custody hold says "Nothing has been sent";
- custody hold names exact bounded scope;
- collapsing JARVIS preserves the work;
- unavailable Source preserves Project context;
- changed Source preserves temporal standing;
- Research can produce an Artifact-shaped output;
- System remains a secondary instrument;
- return-after-absence restores a meaningful next act.

---

## 6 · Visual structure witness

Viewport:

1440 × 900

Research Studio initial pane widths:

- Context Rail: 238 px
- Main Research Surface: 867 px
- JARVIS: 335 px

After JARVIS collapse:

- Main Research Surface: 1158 px
- JARVIS collapsed strip: 44 px

Mechanical standing:

- main Research surface is > 1.6× JARVIS width;
- JARVIS collapse expands the work surface;
- no horizontal overflow;
- no runtime console/page errors;
- no HTTP/network requests.

Result:

**J4_VISUAL_STRUCTURE_PASS**

These measurements are prototype evidence, not permanent layout canon.

---

## 7 · RGR fixture integrity

The prototype fixture preserves the accepted research boundaries:

- relation is the object of inquiry;
- geometry is a candidate language;
- simpler competitors are required;
- bounded geometric explanatory value does not establish universal geometry;
- graph/vector remain legitimate competitors;
- meaning is not reduced to formal representation;
- RGR common scaffold is not itself required to be geometry;
- geometry enters only through separately justified enrichment.

The active Thread is:

> Does geometry add explanatory value beyond simpler relation-first baselines?

This remains an unresolved research question in the prototype.

---

## 8 · Founder witness instructions

Build:

prototypes/jarvis-research-studio-j4/build-native.command

Open:

/private/tmp/JARVIS Research Studio Prototype.app

The browser-hosted index.html remains a development inspection path only. Founder experience witness is performed in the native app.

Founder posture:

> Open the Project and work with the inquiry.

Do not explain the architecture before first exposure.

Use the J3 witness sequence:

### W0 — Open JARVIS
Question afterward:
> What kind of thing did this feel like?

### W1 — Resume Project
> Did you feel returned to work already in motion?

### W2 — Enter Research Studio
> What feels primary here?

### W3 — Open the pre-geometric Claim
> Do you know what this Claim is, where it came from, and what remains uncertain?

### W4 — Open Source
> Did opening the Source feel like leaving the Project?

Desired answer:
No.

### W5 — Ask JARVIS
Prompt:
> What would falsify this Claim?

Then:
> Did JARVIS contribute without taking authorship of the research?

### W6 — Compare Sources
> Would you know what became part of the Project and what was only a working view?

### W7 — Custody hold
> Do you know exactly what has and has not happened?

### W8 — Collapse JARVIS
> Is this still a complete Research environment without the AI pane open?

### W9 — Return after absence
> Is this enough to resume intelligently?

---

## 9 · Founder decision vocabulary

After witness:

- TAKE
- REFINE
- REBUILD
- PARK
- REJECT

A positive reaction alone does not authorize Desktop implementation.

---

## 10 · Non-events

J4 performed no:

- real Project persistence;
- arbitrary filesystem access;
- file/folder authority widening;
- drag/drop ingestion;
- new privileged IPC;
- live model/provider call;
- canonical provider execution;
- credential access;
- network call;
- database/schema change;
- background activity;
- multiple windows;
- MAIA identity;
- deployment;
- production access.

---

## 11 · Standing before commit

J4 experience prototype is mechanically complete and founder-witnessable.

Stop target:

**JARVIS-DESKTOP-EXPERIENCE-ARCHITECTURE-01 / J4 — PROTOTYPE READY FOR FOUNDER WITNESS**

No real Desktop implementation is authorized.
