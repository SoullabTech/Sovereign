# Writer's Studio R2 — Master Operating Brief

> **Persistent programme brief.** Authored by the founder, 2026-08-24. Transcribed here so a
> session can be started with *"Read the Writer's Studio master brief; execute the currently
> authorized unit only"* rather than reconstructing the architecture each time.
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

```text
WS-01  Source Custody + Freeze Release
WS-02  Canvas Convergence
WS-03  Work Home + Identity + Continuity
WS-04  Structure + Navigator + Manuscript stance
WS-05  Materials / Desk + MAIA
WS-06  Professional Long-form UX
WS-07  Press Handoff + Legacy Retirement
```

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
