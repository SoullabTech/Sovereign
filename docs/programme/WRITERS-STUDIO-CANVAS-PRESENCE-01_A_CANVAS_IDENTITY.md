# A · CANVAS IDENTITY — census + ruling-ready proposal

```text
FLOW      WRITERS-STUDIO-CANVAS-PRESENCE-01
SUBJECT   227e4e63b · app/writers-studio/canvas/**
CLASS     READ-ONLY CENSUS · no source file edited
STATE     RULING-READY · B and C untouched · BUILD NOT AUTHORIZED
```

> **Question.** What are the actual acts available on the Canvas, and where — if
> anywhere — must they become perceptible for WRITE to read as a **place** rather
> than merely the current **mode**?

⛔ **The guardrail, held throughout.** *"I don't see any Canvas options" proves
weak identity, not missing controls.* Nothing is invented below. Every row is an
act that exists in source at this SHA.

---

## 1 · THE CENSUS

```text
ACT                          EXISTS  CURRENT LOCATION                 CLASS
────────────────────────────────────────────────────────────────────────────
write into the draft         yes     Worktable, centre                LEGIBLE
autosave                     yes     Worktable, status line           LEGIBLE
save now (flush)             yes     Worktable status, only while     REMOTE
                                     unsaved / errored
Keep a version               yes     Worktable, top-right of pane     LEGIBLE
                                     + ? hint (FR-D)
navigate to a section        yes     Manuscript panel, row click      LEGIBLE
organise this Work           yes     Manuscript panel chrome,         NEEDS LOCAL
                                     "organise" — sticky header        PRESENCE
open Manuscript panel        yes     rail · Structure → summon        LEGIBLE
open Materials panel         yes     rail · Materials → summon        LEGIBLE
open MAIA column             yes     header MAIA toggle + rail         LEGIBLE
                                     Conversations
declare / identify the Work  yes     rail head "This work" + ?         LEGIBLE
                                     hint (FR-D)
rename the Work              yes     inside This work drawer           REMOTE
say what it is becoming      yes     inside This work drawer           REMOTE
declare a form / undeclare   yes     inside This work drawer           REMOTE
ask MAIA about the Work      yes     MAIA column composer              LEGIBLE
open Keeps list              yes     MAIA column                       LEGIBLE
Open in MAIA →               yes     MAIA column                       LEGIBLE
open a reading of the Work   yes     ReadingsEntry, inside the         REMOTE
                                     Manuscript panel
review a structure proposal  yes     "A reading" — takes the           REMOTE
                                     Manuscript panel's place
ask MAIA about a proposal    yes     AskMaia, ONLY inside              REMOTE
                                     StructureReview
dismiss the lower band       yes     lower band ×                      LEGIBLE
show Outline (lower band)    yes     lower band tab                    LEGIBLE
Export                       yes     rail · Tools                      LEGIBLE
go to Develop                yes     mode bar                          LEGIBLE
────────────────────────────────────────────────────────────────────────────
adopt a structure proposal   NO      "no adoption endpoint to reach    DOES NOT
                                     from here" (page.tsx)             EXIST
Threads · Timeline · Word    NO      lower band, available:false       DOES NOT
Web                                                                    EXIST
set a goal                   NO      "no way to declare one here yet"  DOES NOT
                                                                       EXIST
```

### Counts

```text
LEGIBLE                14
REMOTE                  6
NEEDS LOCAL PRESENCE    1
DOES NOT EXIST          4 (declared as absent, honestly)
```

---

## 2 · IDENTITY FINDING

> **Is the Canvas missing capability · hiding capability · poorly composed ·
> poorly named · or insufficiently declared as a place?**

```text
missing capability                    NO
hiding capability                     PARTLY — 6 REMOTE acts
poorly composed                       PARTLY — see §2.2
poorly named                          NO — for the acts themselves
insufficiently declared as a place    ⭐ YES — the dominant finding
```

### 2.1 · Capability is not missing

Twenty-one acts exist and are reachable. Four do not exist and **say so**, which
is FR-C working as ruled. The founder's report is not evidence of absent
controls, and the census confirms it.

### 2.2 · What "poorly composed" actually means here

The six REMOTE acts share one shape: **they live inside a panel that must first
be opened, and nothing at the top level says they are in there.**

```text
This work drawer   rename · becoming · declare/undeclare a form
Manuscript panel   open a reading  →  review a proposal  →  ask MAIA about it
```

⭐ **The reading path is three panels deep** and the deepest act — asking MAIA
about a proposal — is reachable *only* through `StructureReview`. `AskMaia` has
exactly one call site in the entire Studio.

⚠️ This is a **finding about depth, not a request for a toolbar.** Depth may be
correct: these are not writing acts, and hoisting them would compete with the
writing field. **Do not resolve this here** — the remedy question belongs to §3
and, where it touches visual weight, to **B**.

### 2.3 · ⭐ The dominant finding — the room never names itself

The Canvas identifies itself **nowhere**:

```text
header             SOULLAB · WRITER'S STUDIO   |   <WORK TITLE>
mode bar           WRITE is a highlighted pill among five
panel labels       "This work" · "Manuscript" · "Materials" · "MAIA" ·
                   "A reading"
writing pane       data-panel-role="writing-field" — an attribute, not a label
```

**Every panel is named. The room containing them is not.** `WRITE` is rendered as
a *mode you are in*, not as a *place you are*. The word "Canvas" — the room's own
name in the architecture, in `CANVAS_HREF`, in `canvasIdentity.ts`, in the design
docs — **never reaches the member.**

That is the precise sense in which identity is weak: not that acts are hidden,
but that **the container is anonymous while its contents are all labelled.**

---

## 3 · MINIMUM REMEDY

> **What would make WRITE read as Canvas without adding capability?**

Ordered smallest-first. Each is independently refusable.

```text
R1  NAME THE ROOM
    The room says what it is, once, where the member already looks.
    Adds no act, no control, no capability.
    ⭐ Addresses the dominant finding directly and alone.

R2  LET THE REMOTE ACTS BE KNOWN TO EXIST
    Not hoisted — DECLARED. A member who has never opened "This work" has
    no way to learn that renaming or declaring a form lives inside it.
    FR-D's step-2 inline descriptor is the existing channel; the FR-D
    `note` slot is already the sanctioned carrier and is sparse by intent.

R3  RESOLVE "organise" — the one NEEDS LOCAL PRESENCE row
    It is the instrument for organising a book, and it sits in a panel
    header the member may never open. Whether it needs local presence at
    the Canvas level, or is correctly a Manuscript-panel act, is a
    composition question this census can pose but not settle.
```

### ⛔ What the remedy is NOT

```text
⛔ a Canvas toolbar
⛔ hoisting the six REMOTE acts to the top level
⛔ any new capability
⛔ anything about colour, contrast, weight or figure-ground — that is B and C
```

⚠️ **R1 is the whole minimum.** R2 and R3 are separable and may be refused
without weakening R1. If only one act is authorized, it is R1: it is the only
remedy that addresses the dominant finding, and it adds nothing.

---

## 4 · WHAT THIS DOES NOT ESTABLISH

```text
⛔ Nothing here bears on B. "No new controls needed" is NOT evidence that the
   writing surface has sufficient visual primacy. That is a rendered
   judgement and this census is source-only.

⛔ Nothing here bears on C. Naming a room is not a material question, and
   no finding above may be cited to justify a lighter plane.

⛔ This is source, not sight. The census establishes what exists and where.
   Whether the composition READS as a place is the founder's to see.
```

```text
A   RULING-READY
B   untouched
C   untouched
BUILD  NOT AUTHORIZED
FR-C / FR-D  remain PASS
```
