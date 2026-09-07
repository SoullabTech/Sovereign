# Writer's Studio Home — wireframe v0.1

**Status:** LOW-FIDELITY · design only · NO BUILD · founder review required
**Governed by:** `HOME_REDESIGN_SUBSTRATE_TRUTH_2026-09-07.md` (`3562d8621`)
**Law:** FACT · WRITER · MAIA — none silently becomes another

Every process-bearing line below is annotated. **A line that cannot be labelled
is a line to cut.**

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ SOULLAB · WRITER'S STUDIO          [ find a work… ]         ✦ Ask MAIA    │
└──────────────────────────────────────────────────────────────────────────┘

  CONTINUE
  ┌────────────────────────────────────────────────────────────────────┐
  │  ▚▚▚   Elemental Alchemy                                    WRITER │
  │  ▚▚▚   Manuscript                                           WRITER │
  │  ▚▚▚   "The art of living a phenomenal life"                WRITER │
  │        ──────────────────────────────────────────────────          │
  │        Last written  yesterday                                FACT │
  │        Last open     Chapter 6 — Fire                    FACT ⚠gap │
  │        262 sections · 2 kept versions                         FACT │
  │        Development reading · Sep 6                            FACT │
  │                                                                    │
  │        You left yourself:                              WRITER ⚠gap │
  │        "Re-read Ch 6 — does Fire belong before Water?"             │
  │                                                                    │
  │                                              [ Continue → ]        │
  └────────────────────────────────────────────────────────────────────┘

  YOUR WORKS            [ All ][ Manuscripts ][ Essays ][ … ]  WRITER(form)

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ ▚▚  icon     │  │ ▚▚  icon     │  │ ▚▚  icon     │   ⚠gap: real cover
  │ Title  WRITER│  │ Title        │  │ Title        │
  │ form   WRITER│  │ —            │  │ form         │   — = not declared
  │ purpose WRITER  │ —            │  │ purpose      │
  │ 3 days   FACT│  │ 2 wks        │  │ never opened │
  └──────────────┘  └──────────────┘  └──────────────┘

  FROM YOUR WORK                                    (was "Inspiration")
    ▸ 4 kept versions across 2 works                             FACT
    ▸ passages you marked                                        WRITER
    ▸ questions you left yourself                                WRITER
    ▸ Development observations you kept                          WRITER
                                              [ a writing invitation ]  MAIA
                                              clearly labelled, never
                                              "what your work needs"

  ┌ Begin a new work ┐   ┌ Import writing ┐
```

## FIELD QUALITY (founder, 2026-09-07)

The redesign is not "better Studio UX." It is a change of what the place is.

```text
NOT                          BUT
files → tools → AI → tasks   my work → where I am with it →
                             what has been alive → what is calling →
                             a place to enter → MAIA beside me when I want her
```

**The writer should not arrive and feel managed. They should feel received.**

```text
RECOGNIZED    this is my work, not a database object
ORIENTED      I understand where I have been without being told what to do
INVITED       meaningful possibilities are available to me
UNHURRIED     unfinished and resting work may remain unfinished and resting
SUPPORTED     help appears when meaning is unclear
ACCOMPANIED   MAIA is nearby when wanted, quiet when not
INSPIRED      my own material can call me back into the work
SOVEREIGN     nothing interprets itself into authority over my writing
```

### Unfinishedness must be safe

Most software treats unfinished work as a defect — *incomplete · overdue ·
needs attention · 0%*. A writing field must hold that a Work can be **forming ·
resting · waiting · fragmentary · contradictory · being reconsidered · alive but
untouched for months**, and that none of those is failure. Room for incubation
may be this Studio's most distinctive quality.

### Trust is part of atmosphere

This is why the HOME TRUTH LAW is an *aesthetic* requirement, not only an
ethical one. A beautiful interface that tells a writer they are "in structural
revision" when nothing knows that is not embracing — it is **invasive**. A field
that says *"last time you were here, you were in Chapter Six"* and leaves the
meaning to them is respectful. Same information, opposite relationship.

### Visual direction

```text
TOWARD   library · studio · desk · manuscript · atmosphere · warmth ·
         spaciousness · tactile identity · quiet movement
AWAY     cards · metrics · status badges · productivity counters ·
         dashboard grids
```

The work itself should have gravity. A cover, a title, a purpose, a remembered
note, a fragment of recent language — enough that a Work feels like a **presence**
rather than a row.

> **North star:** a place where a writer feels their work waiting for them,
> rather than software waiting for input.

## ⚠ v0.1 audited against FIELD QUALITY — one failure

**UNHURRIED fails.** The work-card in v0.1 shows elapsed time:

```text
3 days   ·   2 wks   ·   never opened
```

Elapsed time is the single most common way software makes rest look like
neglect, and *"never opened"* reads as a reproach for a Work the writer has not
yet chosen to enter. The card is quietly scoring dormancy.

The fix is not to hide the fact. `lastWrittenAt` is FACT and orienting. It is to
stop rendering it as a **countdown**:

```text
INSTEAD OF   3 days · 2 wks · never opened
TOWARD       last written in March · begun in June · not yet opened
```

Dates and beginnings sit still. Durations accumulate. **A resting Work should
not look more neglected the longer it rests.**

The other seven qualities are satisfied or gap-marked in v0.1. This one was a
real defect, found by the standard rather than by review.

## Legend and the rule it enforces

```text
FACT     mechanically known — the Home may show it plainly
WRITER   the writer declared it — carries meaning, shown as theirs
MAIA     interpretation or invitation — always visibly labelled
⚠gap     the job is real, the substrate does not exist yet
```

**Nothing on this Home tells the writer what to do.** The nearest thing —
*"You left yourself…"* — is the writer quoting themselves.

## The four ⚠gaps, and what each needs

```text
Last open section     needs the Studio to remember the last section opened.
                      FACT once stored; a navigation trace, not an inference.
"You left yourself"   needs a WHEN I RETURN note — a small writer act.
                      Until it exists, the card omits the block entirely.
                      It must never be filled by MAIA.
Cover / visual        needs upload + storage + a member act. Until then a
                      neutral typographic treatment — never auto-generated.
Recent activity       deliberately NOT in v0.1. The only event tables that
                      exist are engineering telemetry, and using them would
                      expose engineering state.
```

## Empty states are the real test

Most Works will have **no** declared form and **no** purpose. The Home must look
composed, not broken:

```text
form absent      the line is omitted — not "Untyped", not "—" as a value
purpose absent   omitted. An invitation may appear ONCE on the card:
                 "Say what this is becoming" → the WorkDrawer act that exists
never opened     "not yet opened" is a FACT and reads fine
no Works at all  the Home is the two doors, and nothing else
```

A Home that renders placeholders where the writer has declared nothing is
asserting absence it has not earned.

## Unresolved — founder decisions

```text
1  Does CONTINUE surface one Work or the last few?
   One is calmer; several respect a writer with parallel projects.
2  Is "form" the writer's word or a chosen vocabulary? Free text drifts;
   a fixed list imposes categories — Invariant 14 territory.
3  Should FROM YOUR WORK appear at all when it would be empty?
4  Does Ask MAIA open in place here, as it must in the Canvas?
5  Test/debris Works — a writer's Home should not be dominated by them.
   Deletion (WS-DELETE-01, merged, not live) may resolve this without design.
```

## What this wireframe does not do

No component, no schema, no route, no build. It proposes one information
architecture and labels every line's provenance so the founder can reject the
shape rather than the pixels.
