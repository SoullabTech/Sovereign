# C · CANVAS MATERIAL — architecture (founder, 2026-09-07)

```text
WRITER'S STUDIO
    │
    ├── Studio atmosphere
    │     → changes the room
    │     → charcoal / espresso / etc.
    │
    └── Canvas material
          → changes the page only
          → Paper / Parchment / Dark
```

> **Choose the room. Choose the page.**

Stronger than "themes", and it resolves B without repainting the frozen Studio.
The dark ground system **remains the room**; the Canvas **gains its own material
identity**. That is the separation the whole question was reaching for.

```text
Espresso Studio  +  Paper Canvas
Charcoal Studio  +  Parchment Canvas
Charcoal Studio  +  Dark Canvas
```

The shell stays visually coherent while the writing surface becomes personally
comfortable.

## ⛔ BINDING — Canvas material is a DISPLAY PREFERENCE

```text
CONTENT             Elemental Alchemy manuscript
WRITER PREFERENCE   I prefer to look at manuscripts on Paper
STUDIO PREFERENCE   I prefer Charcoal around me
```

It must **not** attach to the Work as though the book itself were "Parchment",
and must **not** enter versions, provenance, manuscript saves, or export
semantics.

⚠️ **Why this boundary is load-bearing:** without it, opening another Work would
unexpectedly change the entire room, and someone else's shared Work would dictate
how your editor looks.

## ⭐ INTERACTION PRINCIPLE — carried beyond this feature

> **A capability is not really available if the member cannot reach its control
> from the state they actually inhabit.**

So the Appearance control lives **in the editor**, where a writer at work can
reach it. Home may also expose these preferences; **Home may not be the only
door.**

```text
Appearance

STUDIO
○ Espresso
● Charcoal

CANVAS
● Paper
○ Parchment
○ Dark
```

⚠️ Founder direction, verbatim: *"theme options should be in edit rooms not on
first opening page, at least not alone."*

## Post-fix observation — the viewport repair

Founder, after `382d3f31`:

> *"this is feeling more alive and responsive"*

⭐ The fix **added nothing**. It only stopped the page moving when the writer had
not asked it to. Same shape as FR-C: the improvement came from removing an
unasked-for behaviour, not from new capability.

```text
B DYNAMIC WITNESS   was DEFERRED · BLOCKED by the viewport defect
                    defect fixed — witness now POSSIBLE
                    still NOT REQUIRED — B is already ruled
```

---

# BINDING IMPLEMENTATION RULES (founder, 2026-09-07)

⚠️ **Recorded before implementation so the code can be judged against this,
rather than the code becoming the source of truth.**

```text
WRITER'S STUDIO APPEARANCE ARCHITECTURE

STUDIO ATMOSPHERE
changes the room
→ existing atmosphere system
→ shell / rails / panels / dock / surrounding Studio

CANVAS MATERIAL
changes the writing plane only
→ Paper
→ Parchment
→ Dark

These axes are independent and composable.

Examples:
Charcoal Studio + Paper Canvas
Espresso Studio + Parchment Canvas
Charcoal Studio + Dark Canvas

GOVERNING MODEL
Choose the room. Choose the page.
```

## C1 · DISPLAY PREFERENCE

```text
Canvas material belongs to the writer's viewing preference.

It does NOT belong to:
- the Work
- manuscript content
- versions
- provenance
- saves
- export
- collaborators/shared Works

Changing Canvas material changes presentation only.
```

## C2 · REACHABILITY

```text
Both appearance axes must be reachable while the writer is inside
the Canvas/editor.

Home may expose the same preferences, but may not be their only door.

Interaction principle:
A capability is not meaningfully available when its control is unreachable
from the state in which the member needs it.
```

## ⛔ ANTI-DRIFT — the material's reach

```text
CANVAS MATERIAL MAY CHANGE
- writing-plane background
- manuscript foreground/text treatment required for readability
- subtle page/material treatment

CANVAS MATERIAL MAY NOT CHANGE
- Studio rails
- outline
- MAIA panel
- bottom dock
- shell/header
- capability/state semantics
```

## Implementation direction

```text
ONE editor-side Appearance control, not two unrelated widgets:

  Appearance
  STUDIO   [existing atmosphere options]
  CANVAS   Paper · Parchment · Dark

REUSE the existing Studio-atmosphere state/provider.
ADD Canvas material as an independent writer preference.
⛔ NO duplicate theme engine.
⛔ Paper/Parchment must NOT become global themes — the whole point is that the
   dark Studio survives around a materially different page.
```

## Sequence

```text
1  record architecture + reachability principle      ← done
2  build editor Appearance control
3  add Paper / Parchment / Dark Canvas materials
4  prove Canvas changes without repainting Studio
5  look at one materially changed Canvas
```

⚠️ For the viewport fix at `382d3f31`: smoke-test a few outline selections to
confirm the page stays stationary. ⛔ **Do not reopen B around it.** That was a
separate behavioral defect and has received its own repair.

---

# SOURCE DISCOVERY — the premise changed (2026-09-07)

## ⭐ THE CORRECTION WORTH PRESERVING

> **Paper and Parchment were not missing capabilities. They were capabilities
> trapped behind the wrong rendering path and stored at the wrong ownership
> level.**

That is exactly the sort of thing to find **before** building replacements.

```text
app/writers-studio/canvas/WritingSurface.tsx:89

warm      "Warm Canvas"   #221B17   ← default
ivory     "Ivory Paper"   #f3eddd   ← parchment
white     "White Paper"   #FAFAF7   ← paper
midnight  "Midnight"      #0E1114

persisted as  localStorage  writing_surface:<manuscriptId>
```

Two defects, both already present:

```text
C1 VIOLATION   keyed per MANUSCRIPT — the material belongs to the Work.
               That is literally "the book itself is Parchment."

C2 FAILURE     the control lives in the continuous WritingSurface and is
               unreachable from SectionWritingSurface, which is what a
               174-section book renders through. A capability unreachable
               from the state the member inhabits — the principle, already
               instantiated in the codebase.
```

## RULING 1 · STUDIO ATMOSPHERE — NOT THIS PASS

The source check changed the premise: there is nothing to reuse.

```text
existing selector/system    NO
warm ground                 FROZEN DESIGN RULE
assertGroundIsWarm()        actively enforces it
```

Adding charcoal/espresso would **not** expose an existing preference. It would
create a new appearance system **and** amend a sampled, frozen design
constraint. That belongs to its own design-contract ruling.

```text
THIS BUILD
Canvas material       YES

NOT THIS BUILD
Studio atmosphere     HOLD
ground-token changes  HOLD
assertGroundIsWarm    UNTOUCHED
```

> Page inside the existing room — **not** redesign the room while fixing the page.

## RULING 2 · REKEY THE EXISTING PREFERENCE — YES, CONSERVATIVELY

C1 requires it. Leaving `writing_surface:<manuscriptId>` would knowingly preserve
the wrong ownership model. But migrate rather than drop.

```text
KEY   writers_studio:canvas_material

IF new Canvas preference already exists
    use it
ELSE IF current manuscript has legacy writing_surface:<manuscriptId>
    seed the new Canvas preference from that value once
ELSE
    use the existing default

READ     new Canvas-level preference
WRITE    new Canvas-level preference only
LEGACY   old per-manuscript keys become INERT
         ⛔ do not delete them in this pass
```

Three properties this buys: **continuity** (the writer does not suddenly lose the
appearance they were looking at), **C1 compliance** (material no longer belongs to
the Work), and **reversibility** (legacy values are not destroyed while ownership
semantics change).

⛔ If two manuscripts historically carried different materials, **no attempt is
made to infer a "true preference"** from localStorage. The currently opened
Work's legacy value seeds the writer preference once. From then on the writer has
one Canvas choice.

## SCOPE PRECISION

⛔ This remains a **browser-local** writer preference, because that is what the
existing persistence mechanism supports. **Do not introduce account or backend
persistence** merely to make "per-writer" mean cross-device sync — that would
enlarge the build again. Cross-device sync is a later decision if wanted.

## AUTHORIZED BUILD SHAPE

```text
CANVAS MATERIAL — BUILD AUTHORIZED

LIFT      material ownership out of WritingSurface
REKEY     per-manuscript → Canvas/writer presentation preference
REACH     same material system from
            - continuous WritingSurface
            - sectioned SectionWritingSurface
CONTROL   one editor-side Canvas Appearance control
MATERIALS harvest existing implementation
          ⛔ do not invent a second material engine
STUDIO ATMOSPHERE   HOLD · separate design-contract question
```
