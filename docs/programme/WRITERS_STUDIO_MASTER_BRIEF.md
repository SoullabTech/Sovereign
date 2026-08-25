# Writer's Studio R2 — Master Operating Brief

> **Persistent programme brief.** Authored by the founder, 2026-08-24, **amended 2026-08-24**
> (Amendment 1 — Product Constitution, at the end of this file). Transcribed here so a session can
> be started with *"Read the Writer's Studio master brief; execute the currently authorized unit
> only"* rather than reconstructing the architecture each time.
>
> **Custody note.** Until this commit the brief existed only on the unmerged WS-01 candidate, so a
> session bound to canonical could not read the document it was told to read first. It is placed
> on canonical here, independently of any candidate, for the same reason PR #1044 preserved the
> Writer's Desk rulings: a governing document one force-push from disappearing is not custody.
>
> ## Programme state at Amendment 1
>
> ```text
> PROGRAMME STATE AT AMENDMENT 1        recorded 2026-08-24
>
> CANONICAL BASE     9be736aa2
> WS-01 CANDIDATE    e92f532396705daaf6cd346445276a08a5957904
>                    feature/ws-01-source-custody-v2
>                    PINNED at time of amendment
> SPECIFICATION      FROZEN v1.1
> P0-M               PASS
> P0-D               OWED — only next proof at time of amendment
> A–H / G1 / felt    NOT REACHED
> CANVAS FREEZE      REMAINS
> WS-02              CLOSED
> ```
>
> ⚠️ **This block records the programme state at Amendment 1. It is not a permanently current
> deployment or status record** — canonical advances the moment this amendment merges. Later
> evidence and duly recorded programme decisions supersede the operational state above **without
> requiring reinterpretation of this amendment.** For live state, read the evidence records and
> the frozen specification, not this block.
>
> The roadmap in this brief is **programme context, not permission to begin a unit.** The
> executable boundary is the pinned WS-01 candidate and P0-D only. Deployment, tests and a passing
> walk are **evidence**; Founder Acceptance is a separate act and artifact (frozen spec §8), and a
> repaired candidate restarts the walk at **A** (§9).
>
> **Authority**: founder-directed programme · **Operating mode**: evidence → bounded decision →
> implementation → witness · **Canonical member-facing name**: Writer's Studio.
>
> This brief constrains action. It is not re-litigated at the start of a unit.

---

## 0. The job

Carry the Writer's Studio from its present architectural state to a coherent, production-ready
creative environment. **This is not a greenfield build.** A large amount has already been
researched, designed, implemented, abandoned, superseded, partially merged, or left uncalled.

1. Preserve the rulings already earned.
2. Distinguish canonical architecture from historical residue.
3. Repair the small number of foundational defects blocking convergence.
4. Converge the best existing implementation into one Studio.
5. Build only what is actually missing.
6. Test the Studio as a human creative environment.
7. Retire obsolete competing architectures once their useful capabilities are harvested.

**The destination is not another document editor.** It is one professional creative environment
in which a Work can be gathered, developed, written, structured, revised, remembered,
researched, and eventually published without the writer having to manage the machinery.

## 1. North star

The Writer's Studio is centered on **the Work**. The Canvas contains a writing editor; **the
editor does not define the Canvas.**

A Work may begin as an idea, a blank page, an essay, a book, a dissertation, a collection of
notes, a research project, an old manuscript, a published work being renewed, or something
whose eventual form is not yet known — and may change form over time without becoming a
different product:

```text
idea → essay → book → course
```

The member should learn: *whatever I am creating, this is where my work develops.*

## 2. Product grammar — binding

- **Writer's Studio is the canonical place.** `Author Studio` is legacy nomenclature. Do not
  create a second Author Studio. Do not perform a repo-wide rename merely to tidy terminology;
  retire legacy names deliberately during convergence.
- **A Book is a kind of Work.** Book Mode / manuscript-scale capability belongs inside Writer's
  Studio. Do not build another Book Studio authoring environment.
- **Press is downstream.** Writer's Studio owns create · develop · gather · write · structure ·
  revise · complete. Press owns edition · front matter · trim · pagination · proof · render ·
  PDF/EPUB · publication · distribution. Do not turn Press into another writing environment.
- **One Canvas.** `Navigator | Easel | Context/MAIA` normally; `collapsed rail | Easel`
  immersive; `Structure workspace | Work context` structural. **Stances of the same Work, not
  competing applications.**

## 3. Programme state

```text
Design archaeology                  COMPLETE
Studio grammar / C1–C6              COMPLETE
Phase 3A Work Structure contract    COMPLETE
Source / Interpretation / Structure RULED

Canvas / Phase 1 freeze             BINDING
Founder acceptance specification    FROZEN v1.0 (2026-08-24)
P0 Source Custody                   KNOWN FAIL
Production convergence              NOT AUTHORIZED
```

**Do not act as if the freeze has been lifted.**

## 4. The four things the Studio must distinguish

```text
SOURCE ARTIFACT  →  SOURCE TEXT  →  INTERPRETATION  →  WORK STRUCTURE
```

- **Source Artifact** — the exact file or payload that arrived. Immutable provenance.
- **Source Text** — the extraction produced from it, with its own identity. *Extraction is not
  the artifact.*
- **Interpretation** — machine observations: possible headings, boundaries, running furniture,
  candidate sections. **Regenerable. No authority over Work structure.**
- **Work Structure** — what the Work recognises because the member declared or accepted it.
  Movement · chapter · section · letter · argument · thread · session · part. **There is no
  mandatory universal `chapter` ontology.** Nodes carry member-authored meaning and depth.

## 5. Foundational authorship rule

> **Machines may detect. They may not silently declare.**

Inference may say *"this appears to be a chapter heading."* It may not silently become *"this is
Chapter 7 of your Work."* The member confers structural authority. **Never launder inference
into canonical structure.**

## 6. Known source-custody defect

- The raw imported artifact is not persisted as the canonical original.
- `manuscript_sections` combines interpretation and content.
- `base_source_hash` hashes an interpreted cut, not the arrival.
- Current segmentation can discard arriving lines.
- Therefore existing `manuscript_sections` **must not be called a lossless original source
  merely because they are immutable.**

Legacy imports cannot be retrospectively certified if the original artifact is unavailable.
**Never manufacture provenance.**

## 7. Immediate gate — WS-01

**WS-01 — Source Custody + Freeze Release.** Purpose: make the existing founder acceptance gate
truthful and executable. **Not** to implement Phase 3A.

P0 must become satisfiable: preserve the original artifact or an equivalent lossless arrival
witness · record provenance · preserve extraction independently · detect omission · **do not call
an interpretation "original source."** Identities such as `sourceArtifactHash`,
`sourceTextHash`, `extractorVersion`, `interpretationVersion`, `workRevision` must not be
overloaded into one field.

**WS-01 must not**: merge PR #995 · redesign the Canvas · extend `Worktable` · implement
Structure · modify `/book-studio/canvas` · perform a broad migration · build publication UX ·
undertake naming cleanup. **Minimum repair only.**

## 8–10. The frozen walk

Frozen independently of the failed historical numbering — `W1–W16` is not reused. Static
precondition **P0 — Source custody**, then eight blocking member acts: **A** Arrive · **B**
Begin · **C** Bring in · **D** Work · **E** Leave and return · **F** Save for later · **G** Keep
in my Field · **H** History and restoration. Full criteria live in
`docs/product/WRITERS_STUDIO_PHASE_1_WALK_SPECIFICATION.md` (Frozen v1.0).

**Founder felt gates, which no agent can pass**: **G1 — felt grammar**, and the final
experiential criterion — *did you forget the software and feel like you were writing your book?*
A **No** there is not a PASS even when every technical step succeeds.

**Stop rule.** A failure stops the walk; later steps are `UNREACHED` — never *pending*, *probably
passing*, or *statically satisfied*. **No endpoint response may stand in for a claim of the form
"a member can…"** Static and human evidence have separate jurisdictions.

## 11–13. WS-02 — Canvas convergence (after the freeze lifts)

**Harvest from PR #995**: `CanvasShell` · easel architecture · the paper system (Warm · Ivory ·
White · Midnight) · navigator region · context region · remembered navigator sizing · spatial
grammar · central-surface ownership rule · compatible save behaviour.

**Reject from PR #995**: live draft heading regexes · inferred `Heading` authority · live
structure detection · `onHeadings` as canonical structure source. **Do not wholesale-merge it
because its room is good. Converge it intentionally.**

**Anchors.** Harvest the mechanics from `manuscriptMap.ts`; do not preserve `Worktable.tsx`
merely because useful algorithms live there. For an edit replacing `[start, end)` with inserted
length `L`:

```text
offset <  start   → unchanged
offset >= end     → offset + (L - (end - start))
start <= offset < end → TOUCHED
```

**No structural detection runs while the writer types.** A broken edit chain yields
`UNRESOLVED` — never a silent guess. Content matching is an explicit bounded-recovery fallback,
not normal structural authority.

**Offset contract** before persistent anchors ship: UTF-16 code units, `[start, end)`, against a
named text revision; plus newline normalization, Unicode normalization, revision identity, base
text hash, edit-delta sequence, conflict behaviour.

## 14–20. Later units

- **WS-03 — Work Home + identity + continuity.** Answers *what am I working on · what is this
  becoming · what is feeding it · where was I · where do I continue.* **Filename is provenance,
  not identity** — never present `book-print-kdp-final` when the Work is *Elemental Alchemy*.
- **WS-04 — Structure + navigation + manuscript stance.** One structure model, four
  presentations. Member may accept · reject · suppress furniture · split · merge · rename ·
  promote · demote · reorder · resolve touched anchors · repair unresolved structure. **Reorder
  moves the prose with the node** through the normal save path; structure and text never
  silently disagree.
- **Restore semantics.** Three distinct controls, never combined: *Restore Structure* (prose
  intact) · *Reinterpret Structure* (candidates only) · *Restore Imported Text* (different blast
  radius — snapshot first, show what is replaced). **Confirmation is not permission to erase
  history.**
- **WS-05 — Materials / Desk + MAIA.** The Desk answers *what am I working with?* and must not
  become a file manager. **Placement is a member act.** MAIA may reflect, notice, retrieve,
  compare, research, surface contradictions, suggest interpretations. MAIA may not silently
  rewrite, insert, reorganize, declare structure, promote into Personal Field, attach materials,
  or become the author. Canonical shape: *MAIA notices → writer encounters → writer acts → Work
  changes.* Never *MAIA infers → database changes.*
- **WS-06 — Professional long-form UX.** Fast editing at scale, manuscript-wide find, safe
  find/replace, focused-part editing, reliable autosave and undo, keyboard movement, paste
  fidelity, structural reorder, version recovery, typography/paper, distraction-free writing.
  **No productivity scoring; writing is not metrics.** Test on ~200-part, hundreds-of-KB material.
- **WS-07 — Press handoff + legacy retirement.** Then inspect `/book-studio/canvas` and dispose
  **by capability, not route name**: publication capability → Press; creative capability →
  Writer's Studio; duplicate/obsolete → retire.

## 21. Legacy cleanup — only after replacements are witnessed

Competing Canvas architectures · the obsolete `Worktable` path · the drawer-spine structure
system · duplicate structural models · legacy regex outline authority · obsolete Book Canvas
routes · dead R&D components · superseded Author Studio naming · abandoned navigation.

> **Dead architecture is not harmless. Future agents rediscover it and mistake history for
> intention.**

## 22–23. Beta episodes and success

Test complete creative episodes, not isolated controls: **New creation · Existing manuscript ·
Large book** (a real long manuscript such as *Elemental Alchemy* — import, running heads, false
heading candidates, structure, performance, navigation, editing, re-entry) **· Structural
revision · Research-heavy work · Renewal** (the original preserved; renewal creates a new
expression).

The central test: **can one familiar room support radically different creative processes without
requiring the writer to manage its machinery?**

```text
Success feels like:  I can work here.
Failure feels like:  Where do I type? Which Studio am I in? Which Canvas is real?
                     Why did the system decide this was a chapter? Where did my original go?
```

## 24. Development discipline

**Never trust branch names.** Hundreds of branches, extensive squash history. Classify by
artifact presence · caller count · current canonical behaviour · actual content. Never infer
merged/unmerged from topology.

**Never trust representation over referent.** A document saying something exists is not evidence
it exists. A component being present is not evidence anything calls it. A route existing is not
evidence it is canonical. A screenshot is not evidence of backend custody. A successful endpoint
is not evidence of member reachability. **Always establish the referent.**

## 25–27. Units and conduct

> **Amended 2026-08-24 (Amendment 1).** This section is *replaced*, not appended to. Two
> provisional roadmaps circulated on 2026-08-24 renumbered WS-05, WS-06 and WS-07 to mean
> different things. That is the failure this programme exists to prevent — several generations of
> good design sitting on different mental models, settled by whichever document a session happens
> to read. The ratified identities below stand.

### Unit identities — ratified, not renumbered

```text
WS-01  Source Custody + Freeze Release
WS-02  Canvas Convergence            ← PRESERVED. See below.
WS-03  Work Home + Identity + Continuity
WS-04  Structure + Navigator + Manuscript stance
WS-05  Materials / Desk + MAIA
WS-06  Professional Long-form UX
WS-07  Press Handoff + Legacy Retirement
WS-08+ UNALLOCATED
```

**A unit number is an identity, not a queue position, and not an authorization.** No number above
is authorized merely by appearing here; each still requires its own definition and founder
authorization. WS-08 onward are deliberately unallocated: later capabilities are *derived* from
this reconciled map when their units are defined, never imported from a provisional sequence.

### WS-02 is preserved, and why that matters

`components/canvas/CanvasShell.tsx`, `components/canvas/registry.ts` and
`app/writers-studio/canvas/WritingSurface.tsx` — the shell, the easel, the navigator region, and
the four papers (Warm · Ivory · White · Midnight) — are **merged on canonical with zero callers**.
The one file that would wire them, the rebuilt `canvas/page.tsx`, is still only on PR #995.

**WS-02 is the unit that harvests them.** A roadmap that drops WS-02 and introduces a "Writing
Worktable" unit instead would have the next session build a worktable *beside* the dead one —
which is precisely how it became dead the first time. ⛔ **We do not build another Worktable
beside #995's.**

### Capability sequencing — not unit numbering

The order in which capability arrives is a separate question from what the units are called:

```text
trust / custody  →  Work architecture  →  #995 convergence  →  excellent long-form writing
  →  materials + intake  →  structural perspectives  →  MAIA companion intelligence
  →  provenance / memory  →  field intelligence  →  expression / publishing
```

⛔ **Do not derive unit numbers from this sequence.** It says what comes before what; the identity
table above says what each unit *is*.

Smallest coherent units — neither exploded into bureaucratic micro-lanes nor combined into one
giant branch. **Before each unit** establish: canonical SHA · objective · allowed files/surfaces
· prohibited scope · binding rulings · acceptance evidence · rollback strategy.

**During a unit, a discovery that changes the problem outranks the planned task.** If the premise
is wrong — a presumed Source turns out to be interpretation, a presumed merged component has zero
callers, a presumed Canvas violates structure authority, a presumed route is legacy — **stop and
report.** Do not preserve momentum by implementing against a false assumption.

## 28–29. Tests and deployment

Prefer controls that **could fail**. For each invariant ask *what would the wrong implementation
do?*, then build evidence that distinguishes the two worlds. A test passing before and after a
fix is weak proof; one failing on the known-bad baseline and passing on the repair is a control.
Human claims still require human interaction.

**Do not deploy merely because code is green.** Before: exact canonical SHA · unit scope · gates ·
migration implications · expected live markers. After: prove the running behaviour, not just an
env var containing the SHA; witness member-facing behaviour; record the first unexpected
divergence and **stop** rather than chasing hypotheses in parallel.

## 30. Report format

```text
UNIT · STATUS · WHAT CHANGED · WHAT WAS PROVEN · WHAT REMAINS UNPROVEN
DEVIATIONS / NEW FINDINGS · CURRENT CANONICAL SHA · NEXT AUTHORIZED UNIT · STOP STATE
```

Preserve consequential evidence; discard operational noise. No chronological transcripts.

## 31. Stop conditions

A binding freeze blocks execution · canonical contradicts the unit premise · scope would cross
into another ruled unit · a required human witness is unavailable · provenance cannot be
established · an unauthorized destructive migration would be required · a test failure
invalidates an architectural assumption · the only way forward is to infer a founder ruling that
does not exist.

**Report the blocker. Do not route around it.**

## 32. Must not

Extend `Worktable` · resurrect the drawer architecture · wholesale-merge #995 · create another
Writer/Book/Author Canvas · let regexes determine canonical Work structure · let AI-generated
structure silently become member structure · build Press before Writer creation is coherent ·
call a filename Work identity · call an interpreted cut "original source" · silently fuzzy-
reanchor · combine structural restore with destructive text restore · let MAIA author by
implication · use endpoint evidence for a human reachability claim · clean up legacy routes
before capability harvest · rewrite history to make architecture look tidy.

## 33. Must protect

Authorship · provenance · reversibility · continuity · member-declared structure · the
separation of source and interpretation · one coherent Studio · absence over false affordance ·
member gestures as authority · room-level orientation · low cognitive overhead · large-manuscript
performance · **the writer's ability to forget the software.**

## 34. Destination

```text
                         WRITER'S STUDIO

                              WORK
                     "Elemental Alchemy"

        ┌─────────────────────────────────────┐
        │                                     │
        │                EASEL                │
        │           the writing itself        │
        │                                     │
        └─────────────────────────────────────┘

 NAVIGATOR / STRUCTURE                 MAIA / CONTEXT
 Work                                 Reflection
 Materials                            Connections
 Sources                              Research
 History                              Questions
```

The surrounding system exists to protect, orient, connect and support the Work. **It should not
compete with it.**

---

## Governing sentence

> **What arrived is evidence. What the machine sees is interpretation. What the writer declares
> becomes the Work.**

Preserve that distinction through every layer of Writer's Studio.

---

# Amendment 1 — Product Constitution (founder, 2026-08-24)

> **Binding on every Writer Studio unit.** Not a feature list: the rules every surface and
> capability must satisfy. Where this amendment and the original text differ, this governs.

## A1.1 — The product promise

> **A place to write, gather, remember, shape, and develop serious work with MAIA beside you —
> while keeping the writer unmistakably in authorship.**

Not an AI document generator. Not a text editor with a chatbot attached. Not a publishing
workflow. A living environment in which a human writer develops a Work over time while retaining
custody, continuity, meaning, authorship and final authority.

## A1.2 — The four permanent boundaries

1. **The Work is not the same thing as the materials around the Work.**
2. **MAIA's contribution is not the same thing as the writer's recognition or decision.**
3. **A polished artifact is not automatically a finished or publishable Work.**
4. **The writer, not the system, determines meaning, belonging, and completion.**

A transcript does not become manuscript because it was uploaded. A MAIA suggestion does not become
the writer's idea because it appeared in the conversation. A fragment does not become a chapter
because the system thinks it belongs there.

## A1.3 — PROGRAMME INVARIANT: the authority chain

Elevated out of any single unit. This governs the whole programme.

```text
SOURCE / MATERIAL
        ↓   may
MAIA MAY NOTICE
        ↓   may
WRITER MAY RECOGNIZE
        ↓   may
WRITER MAY DECIDE
        ↓   may
WORK MAY CHANGE
```

⛔ **There is no automatic arrow. Every arrow may stop.**

A transcript can remain a transcript. A connection can remain a MAIA observation. A writer can
recognize something without changing the manuscript. A decision can remain pending. **Nothing
enters the Work merely because MAIA considers it relevant.**

This is the Phase 3A source-custody law generalized from *text* to *meaning*: interpretation may
never silently become structure; observation may never silently become authorship. The same law
arrived at twice, from different directions, which is the strongest evidence available that it is
real.

**It is enforceable at the level of a single control.** The button reads:

```text
See connection            ✅
Insert into Chapter 4     ⛔
```

These epistemic states must stay distinct in the **data model**, never by styling alone:

```text
source fact · writer-authored manuscript · writer note · MAIA observation
  · MAIA suggestion · writer recognition · writer decision · adopted change
```

⛔ Never flatten them into generic "memory." ⛔ Never let MAIA-generated interpretation become
attributed to the writer through repetition.

## A1.4 — Recognition and Living Field: constitutional, not decorative

`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` already defines **Encounter → Reflection →
Recognition → Living Field → Developmental Ecology**, with authority moving upward only. The
Studio's use of those words is a **deliberate unification**, ruled 2026-08-24:

- **Writer Recognition is an instance of constitutional Recognition** — but *only* when the writer
  explicitly recognizes or adopts. It inherits the same authority discipline. ⛔ Recognition is
  never inferred from a phrase like "yes."
- **Living Field is constitutional, and is not the name of a UI panel or whiteboard.** Writer
  Studio may participate in or instantiate the Living Field. A future spatial surface is called
  **Field View** or **Work Field** — never "Canvas."
- **C2 stands**: AIN Canvas = the shared shell · Writer Canvas and Book Canvas = its
  implementations · "Editing Canvas" stays retired. ⛔ The spatial intelligence surface is not a
  fourth Canvas.

**Recognition ≠ Decision.** A recognition concerns *meaning*; a decision concerns *authorized
direction*. They are separate objects and must not be interchangeable.

## A1.5 — Structure ontology: examples are not schema

A tree such as `Manuscript → Part → Chapter → Section → Passage` is **illustrative presentation
only**. ⛔ **There is no universal chapter schema.** Structure remains recursively member-defined,
in the writer's own unit-words — movement, letter, session, argument, chapter, thread — with a
member-set depth. An implementer who reads that tree as an enum has broken
`WORK_STRUCTURE_DESIGN`.

The same applies to the target information architecture (Work · Manuscript · Materials ·
Conversations · Recognitions · Decisions · Versions · Expressions): it expresses the required
**ontology**, not permission for a big-bang rewrite. Before any architecture unit: inspect the
existing model, preserve compatibility where appropriate, identify migration cost, define the
smallest coherent unit, and test the conceptual distinction in code.

## A1.6 — Restore floor vs. professional versioning

Two different things, deliberately split:

| | What it is | Where it lives |
|---|---|---|
| **Restore floor** | Baseline recoverability — a change can be made, a recoverable point created, an earlier state restored, and restoration *creates* history rather than rewriting it | **Already a WS-01 acceptance prerequisite**, because frozen walk act **H** requires it |
| **Professional versioning** | Named snapshots, compare, diff, passage history, branch experiments, revision milestones, MAIA-change provenance, reconnection recovery, conflict handling | A later unit |

⛔ The later unit **adds professional version UX; it does not introduce restore for the first
time.** Any surface that reorders prose depends on the floor already holding.

## A1.7 — Capabilities the finished Studio must carry

Recorded so no future unit treats them as optional, and none as licence to start:

**Work-centered home** — opens on the Work, not on tools. *Continue the Work*, never *Start an AI
task*. Answers: what am I working on · where did I leave it · what is alive · what needs
attention. ⛔ Not an enterprise dashboard.

**Living manuscript** — persistent long-form structure, revision, restructuring, history, and
return continuity across months. ⛔ Continuity is not cursor position: it is *what you were doing
and what you had not decided*.

**Materials & intake** — recordings, transcripts, interviews, notes, research, PDFs, quotations,
images, prior drafts, loose fragments. Provenance preserved. Adoption into the Work is always
explicit.

**MAIA as creative companion** — Reflect · Question · Connect · Notice · Gather · Shape · Develop ·
Critique · Edit (only when explicitly requested, and then as a visible proposal the writer adopts,
modifies or rejects). ⛔ Never a generic chat sidebar. ⛔ Never a silent rewrite.

**Multiple creative distances** — Close (write) · Near (materials) · Middle (structure) · Far
(field) · Outward (expression). **Views and stances, not workflow stages.** Different lenses over
*one* underlying Work — ⛔ never separate copies of the manuscript.

**Readiness states** — drafting · coherent · under revision · reader candidate · editorial
candidate · publication candidate · author accepted. MAIA may observe an unresolved contradiction;
⛔ MAIA may never conclude a Work is ready to publish. **Publication is a human act.**

**Expression** — a Work may become book, essay, lecture, course, audio, workshop. ⛔ Not export
formats: a lecture is not a book with bullets, a course is not chapters chopped into lessons.

## A1.8 — Quality bar

The current Studio is **primitive relative to the researched vision**. For each authorized UX unit,
ask whether the present interaction model deserves refinement, consolidation, replacement, or
removal — ⛔ do not merely add features to it.

Target feel: **calm · spacious · serious · literary · modern · intimate · coherent · responsive ·
powerful without appearing complicated.** The writing surface is the primary object; chrome
recedes. Desktop-first for serious authorship, without assumptions that foreclose tablet use.

**Performance** is a constitutional matter, not a polish item: ~100 chapters, ~200 structural
parts, 100k+ words, several hundred KB of manuscript. ⛔ No algorithm may rescan or reallocate the
whole manuscript on every keystroke.

**Accessibility**: keyboard-reachable interactions, focus visibility, semantic structure,
screen-reader labels, logical tab order, sufficient contrast, no state signalled by colour alone.
⛔ Drag-and-drop may never be the only way to restructure.

## A1.9 — What not to build

Generic AI chat beside an editor · one giant text blob as manuscript architecture · uncontrolled AI
rewriting · hidden promotion of source material into manuscript · hidden promotion of MAIA
interpretation into writer belief · dashboard-heavy homes · rigid step-by-step creative workflows ·
duplicate manuscript copies per view · a Canvas that is an isolated whiteboard · publication
readiness inferred from polish · metrics for their own sake · excessive administrative ceremony ·
speculative architecture disconnected from the repository.

## A1.10 — The founder experience test

Technical completeness is insufficient if these fail:

Can the writer tell **where they are**? What belongs to the Work? What came from somewhere else?
What MAIA contributed? Can they **recover** what they did? Move between close and distant views
without losing continuity? **Refuse** MAIA's interpretation? Change their mind? Return tomorrow and
know where the Work was alive?

> **Does this feel like authorship rather than operating software?**

## A1.11 — Elemental intelligence comes last

Fire · Water · Earth · Air · Aether may later become **optional interpretive lenses**, never
imposed classifications. ⛔ Never let symbolic intelligence outrun basic writing usability: a
conceptually beautiful lens over a primitive product is a worse failure than not having it.

---

# Amendment 2 — Operating mode: build to fruition (founder, 2026-08-24)

> **Effective when WS-01 closes** — P0-D, the frozen walk, Founder Acceptance, merge, freeze
> released. ⛔ Not before. Until then the pinned candidate and P0-D remain the only executable act.

**The risk this amendment exists to remove:** governance becoming the product. What is wanted is a
working Writer's Studio, not a perfect sequence of documents describing one.

## A2.1 — The default inverts

> **Default to building.** Stop only for a genuinely irreversible architectural decision, a
> safety/custody violation, or a founder decision that cannot be inferred.

⛔ Not every ambiguity deserves a memo, a branch, a ruling, or a day of archaeology.

## A2.2 — Three responses, not one

The programme's stop conditions were written for a lane that had lost its footing. They are now
sorted, and only the third stops work:

**1 · Decide and proceed** — ordinary engineering, no report needed: component naming · UI
placement · CSS and layout · straightforward refactors · test implementation · reuse of existing
components · normal performance work · minor responsive behaviour · small bug fixes inside the
authorized unit.

**2 · Report and continue** — say it in the unit report; do **not** open a proceeding: a discovery
changed the problem · canonical moved under the work · an architectural assumption proved false ·
a test caught a real regression · existing functionality was found · the implementation differs
from the research. **These are findings, not permission requests.** Engineering integrity still
requires naming them; it does not require halting for them.

**3 · Stop and ask** — the small constitutional set: changing what counts as the Work · changing
authorship or authority boundaries · destructive migrations · abandoning a ratified architecture ·
redefining Recognition or Living Field · major privacy or consent changes · irreversible product
direction · **and a binding freeze, which is never routed around.**

## A2.3 — Cadence

Each unit ends in a **visible, usable capability** — not another planning artifact.

```text
inspect existing work → choose the smallest coherent build → implement → test
   → use it in the actual Studio → fix what feels wrong → merge → next
```

**Reuse before rebuilding.** #995's `CanvasShell`, easel, navigator and four papers, the prior
Worktable and structure work, and abandoned-but-useful R&D are harvested, not re-invented.
Documentation happens **alongside** the build, never instead of it.

**The Studio is its own acceptance instrument.** Use it rather than theorising about whether it
works.

## A2.4 — Build sequence

Finish WS-01 → harvest what exists (#995 and prior R&D) → make daily writing excellent (work-
centered home · navigation · serious editor · structure rail · focused part editing · find/replace
· autosave · meaningful resume · responsive) → Gather/Materials with provenance and explicit
adoption → the creative distances (Write · Materials · Structure · Outline · Read · Compare ·
Field) → MAIA useful inside the Work → memory and authorship provenance → professional revision →
whole-Work intelligence → Expression and publishing.

Unit identities come from §25 as reconciled; this is the order capability arrives.

## A2.5 — Definition of full fruition

Not substantially built until a person can actually do this, end to end:

> Open Soullab → return to a living book → resume the exact place *and concern* they were working
> on → speak a new idea → keep its original transcript as material → have MAIA notice connections
> with older material → **inspect those connections without them being inserted** → explicitly
> bring chosen material into the manuscript → reorganise chapters visually → write and revise
> fluidly → ask MAIA to reflect on the whole work → compare an alternate version → restore
> something changed yesterday → see themes and unresolved threads across the book → decide what
> they recognise and what they reject → turn the Work toward a lecture or course → export the book.

**If we cannot do that, we are not done.**

> Enough designing the possibility of Writer's Studio. Build Writer's Studio.

---

# Amendment 3 — The programme entry rule and the build graph (founder, 2026-08-24)

## A3.1 — A specification does not admit a feature

> **A feature is not part of Writer's Studio merely because it has a specification.** It enters the
> programme only when it has all five:
>
> 1. an authoritative **programme entry**
> 2. an identified **dependency chain**
> 3. an executable **vertical slice**
> 4. a **real-Work acceptance case**
> 5. a **path to production**

This exists to break one historical pattern, which has now happened often enough to be a law of
this repository rather than an accident:

```text
great idea → great R&D → prototype → another architecture generation → ZERO CALLERS
```

`components/canvas/CanvasShell.tsx`, `components/canvas/registry.ts` and the easel with its four
papers are that pattern's current instance: **merged on canonical, zero importers, invisible to
every member.** The Developmental Editor must not become the next one.

⛔ **A specification living on an unmerged branch is not a programme entry.** Custody on canonical
is the entry.

## A3.2 — Jarvis owns the build graph

`docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md` is the operational cockpit. Every session must be
able to say **which nodes exist, which are partial, which are blocked, which have zero callers, and
which one it is advancing now.**

> **Custody note (2026-08-25, founder-directed).** This amendment was ratified naming
> `WRITERS_STUDIO_BUILD_GRAPH.md`. That file's verified node evidence — including the zero-caller
> Canvas cluster — was folded into `WRITERS_STUDIO_PROGRAMME_BOARD.md` and the file removed, so that
> exactly one artifact holds live programme state. **The substance of A3.2 is unchanged**: Jarvis
> owns the cockpit, node states are evidence, and it is updated in the same commit as the work.
> Only the artifact's name changed. The Programme Board is subordinate to this brief; where they
> conflict, this brief and duly ratified unit/specification artifacts govern.

Node states are **evidence** — set by reading canonical (file presence, importer count, live
route), never by what a document says should be true. The graph is updated in the same commit as
the work that changes it, never as a separate act of bookkeeping.

## A3.3 — Jarvis carries capability to production

Jarvis is responsible for the whole path — **programme → dependency → vertical slice → runtime
proof** — not for the implementation of whichever feature was mentioned that day. A unit that ends
in a merged branch nobody calls has not been delivered.

## A3.4 — Dependency, not bureaucracy

The Developmental Editor's Continuity lens cannot know what the reader has already encountered
without authoritative Work Structure. So:

```text
WORK STRUCTURE → DEVELOPMENTAL CONTEXT → DEVELOPMENTAL EDITOR
               → PROVENANCE / DECISIONS → SAFE EDIT ADOPTION
```

That is sequencing. **The Developmental Editor is required, not optional** — and it is one of the
principal acceptance surfaces for whether MAIA genuinely understands a Work.
