# Writer's Studio Home — wireframe v0.2

**Status:** LOW-FIDELITY · design only · NO BUILD
**Supersedes:** v0.1 (`1878b6551`), kept as the record of what was reviewed
**Founder review of v0.1:** *"the truth architecture is excellent; the emotional
architecture is not there yet."*

## Four constitutional qualities

```text
TRUTH         do not invent the writer's state
SOVEREIGNTY   do not prescribe the writer's direction
PRESENCE      let the Work itself occupy the field
ATMOSPHERE    help create conditions for writing without manipulating mood
```

> **Atmosphere may support the writer's state; it must never manipulate it.**

Alongside the two laws already carried forward:

> The system may not launder its inferences into the writer's own material.

> Inspiration can open possibility; it cannot quietly become *what your work
> needs*.

Emotionally embracing is not cheerful copy and rounded cards. It is creating the
conditions in which someone enters and feels: *ah — I'm back in my writing
world.*

```text
WRITER'S STUDIO = Work + Memory + Atmosphere + Companion Presence
```

## ⚠ The hazard inside ATMOSPHERE

Quiet movement — a passage appearing, receding, another arriving elsewhere — is
what makes the room feel inhabited. **It is also mechanically identical to
attention capture**, the standard engagement mechanism. Intent is not checkable;
behaviour is. Three rules make the difference observable:

```text
STILLS WHEN WRITING     movement stops when the writer is working. A field that
                        moves while they write is competing with the work.
NEVER RE-TRIGGERS       movement never restarts to recover a wandering eye.
                        Recapture is the engagement pattern by definition.
OFF IS THE DEFAULT      atmosphere is opted INTO, never out of.
```

That last one inherits a ruling this project has already made twice — Daily
Anchor `surface_preference`, atoms `return_preference`: **eligibility originates
from a member act, not a deploy flag.** A Studio that arrives with movement
already running has decided something about the writer's state on their behalf.

## THE ATMOSPHERE CONTRACT (founder, 2026-09-07)

> **Atmosphere is member-chosen, reversible, accessible, and non-semantic. It
> may shape the conditions of writing, but it may not interpret the writer or
> the Work.**

> **The atmosphere may move around the writing. The writing itself remains
> stable.**

### Three layers, deliberately separate

```text
APPEARANCE    system · light · dark          FUNCTIONAL — legibility and
                                             accessibility, not mood.
                                             Respects OS preference incl.
                                             prefers-reduced-motion and
                                             increased contrast.
ATMOSPHERE    Atelier · Night Study ·        EXPERIENTIAL — 4-6 authored rooms,
              Forest · Cloud · Midnight      not twenty themes, not CSS presets
WORK IDENTITY a Work may carry its own       WRITER-CHOSEN, always. MAIA never
              atmosphere and soundtrack      infers atmosphere from a manuscript
```

Accessibility floor: WCAG AA — 4.5:1 normal text, 3:1 large text and
meaning-bearing controls. **Never colour alone to communicate state.**

### Scope, and the ⚠ hazard in it

```text
WRITER DEFAULT     Atelier
   ↓ overridden by
WORK ATMOSPHERE    Elemental Alchemy → Atelier
   ↓ temporarily overridden by
THIS SESSION       Night Study        → "return to Work atmosphere"
```

**A session override must never silently become the Work's identity.** *"Tonight
I want it dark"* is a passing act; if it persists into the Work it has quietly
rewritten what the Work **is** — the same laundering shape as an inference
becoming the writer's own material. The session choice must expire, and the
return must be one visible act.

### ⚠ Atmosphere choice is not evidence about the writer

A writer choosing Night Study has said something about the room, not about
themselves. That choice may be **remembered as a preference** and must not
become an input to any inference about their state, mood, or creative
condition — including for CREATIVE-STEWARDSHIP research.

```text
WRITER chooses atmosphere     SYSTEM remembers preference
MAIA does not diagnose mood
```

And the question is never *"what mood are you in?"* — which is therapeutic and
inferential — but *"what atmosphere would you like to write in?"*

### Sensory anchors (founder, 2026-09-07)

> **A Work may carry writer-chosen sensory anchors — image, sound, atmosphere —
> that help the writer re-enter its world.**

The cover sits in the field like an object on the desk: **visible enough to evoke
the whole Work, quiet enough never to compete with the manuscript.**

```text
WORK VISUAL   Elemental Alchemy → [ book cover ]
              New manuscript    → [ writer-chosen inspiration image ]

PLACEMENT     Home           recognizable identity among the writer's Works
              Writing field  larger, subdued — a side field or ambient region
              Deep writing   optional · dimmable · hideable

IMAGE PRESENCE  ○ off  ○ subtle  ○ present
SOURCE          ○ work cover  ○ inspiration image  ○ choose another
```

A small collection per Work may rotate gently **when ambient motion is enabled**.

### ⚠ Four constraints the anchors inherit

```text
NEVER SYSTEM-CHOSEN   the Studio does not analyse a manuscript to decide what
                      image represents it — AND MAIA DOES NOT GENERATE ONE.
                      A machine-supplied face for a Work the writer is still
                      making is authorship capture in visual form.
ROTATION IS MOTION    a rotating collection obeys the motion rules already
                      stated: stills while composing, never re-triggers to
                      recover attention, off by default.
CONTRAST HOLDS        "present" may not push text below the WCAG AA floor.
                      An image behind writing is atmosphere only while the
                      writing stays legible.
SOURCE UNRESOLVED     an inspiration image may be someone else's work. Private
                      display is one thing; export or a shared surface is
                      another, and the Studio has no provenance machinery for
                      images. OPEN — not a blocker for a private field.
```

The composite this produces, which is the point:

```text
your cover nearby · music you already had playing · your own sentences
drifting through the field · warm Atelier · MAIA available and quiet
```

Less an editor. **More the room in which this particular Work lives.**

### Semantic colour sits OUTSIDE the theme

```text
error · warning · success · focus · disabled
```

**A red warning may not become brown in Atelier and green in Forest.** Atmosphere
sits underneath meaning-bearing state, never replacing it.

### Curated, token-based — not a colour picker

Raw hex fields sound empowering and produce ugly, inaccessible results quickly.
Each atmosphere supplies one coordinated set:

```text
--studio-background  --studio-surface  --studio-paper  --studio-ink
--studio-muted  --studio-accent  --studio-focus  --studio-border
+ selection · subtle texture · shadow · motion character
```

New atmospheres can then be authored later without redesigning the application.

### Atmosphere is more than palette

Serif/sans emphasis · paper tone · edge softness · spacing · background texture ·
quote treatment · animation tempo · depth · visual quietness. Atelier might carry
a faint paper fibre; Night Study almost no texture and tighter luminance.

**Manuscript text stays highly stable and readable across all of them.**
Atmosphere surrounds writing; it does not interfere with it.

### Motion is its own control

```text
AMBIENT MOTION   still · gentle · alive
```

Honours `prefers-reduced-motion` automatically. **Even at *alive*, nothing moves
while someone is composing.** The field may breathe; the manuscript sits still.

### Which makes the floating passages atmospheric rather than generic

```text
Atelier       ink settling on warm paper
Night Study   emerging faintly from darkness
Cloud         arriving with space around it
```

Same content, same provenance, different atmosphere — emotional richness without
MAIA manufacturing emotional content.

## Atmosphere, as an optional field

```text
SOUND     ○ none  ○ continue what I'm already playing
          ○ my writing playlist  ○ ambient
VISUAL    ○ still  ○ gentle movement
FOCUS     ○ studio  ○ manuscript only  ○ deep writing
```

**The Studio never starts audio on its own.** Respecting music the writer already
has playing is participation; seizing the audio channel is not. *The browser must
never begin playing Mahler because MAIA inferred someone needed inspiration.*

Later, and only if appropriate: a writer might attach a soundtrack to a Work, so
the association itself becomes part of returning to it —

```text
ELEMENTAL ALCHEMY · writing soundtrack — <the writer's own choice>   WRITER
```

## The correction v0.2 exists to make

```text
v0.1 solved   epistemic safety — the Home stopped lying
v0.2 must solve   PRESENCE — a writing field receiving the writer back
```

## Three laws now govern

```text
HOME TRUTH LAW        may we say this?
FOREGROUNDING LAW     does this deserve the writer's attention right now?
PRESENCE LAW          whose voice arrives first?
```

> **The Home foregrounds the Work's presence before the system's accounting of
> it.**

### The emotional hierarchy this produces

```text
1  THE WORK          title · visual identity · the writer's own meaning
2  ITS VOICE         their actual words · marked lines · fragments · questions
3  THEIR CONTINUITY  where they last were · what they left themselves · dates
4  ORIENTATION       facts that genuinely help return
5  MAIA              nearby · clearly herself · optional

NOT:  title → metadata → counts → timestamps → AI
```

The Home should not merely tell a writer *about* the Work. It should let the
Work **be present** — the manuscript quietly remembering itself around them.

> **A fact being true is not a reason to foreground it.** Home foregrounds
> whatever helps the writer recognize the Work, recover their own continuity,
> and feel invited back into relationship with it.

Truth grants a line **permission** to appear. It grants no **importance**.
`262 sections`, version counts and reading dates are all true, and together they
pull the Home back into dashboard consciousness.

### Provenance refined — two dimensions, not one

v0.1 labelled *"Development observations you kept"* as `WRITER`. **That was
wrong, and it was the laundering this law forbids**, committed inside the
document that states it. MAIA authored the observation; the writer only adopted
it, and adoption does not retroactively make her language theirs.

```text
CONTENT ORIGIN    FACT · WRITER · MAIA
WRITER STANDING   kept · dismissed · unresolved · (none)
```

Separate axes. *"MAIA noticed this · you kept it"* is truthful. `WRITER` alone
is not.

## v0.2

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ WRITER'S STUDIO                      find a work…            MAIA nearby │
└──────────────────────────────────────────────────────────────────────────┘

  RETURN                          ← not CONTINUE. "keep going" vs "this is
                                    here when you are ready"
  ┌────────────────────────────────────────────────────────────────────┐
  │  ▚▚▚▚   ELEMENTAL ALCHEMY                                   WRITER │
  │  ▚▚▚▚   Manuscript · <the writer's own meaning>             WRITER │
  │  ▚▚▚▚                                                              │
  │         You left yourself:                                  WRITER │
  │         "Does Fire belong before Water?"                           │
  │                                                                    │
  │         Last here · Chapter 6 — Fire            FACT     [Return]  │
  └────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────┐  ┌──────────────────────┐
     │ another recent Work  │  │ another recent Work  │   2-3, never one
     └──────────────────────┘  └──────────────────────┘

     ─ section counts · version counts · reading dates live in the Work,
       not on the Home. True, and not foreground.


  YOUR WORKS                    find… · your own groupings

     ▚▚▚▚          ▚▚▚▚          ▚▚▚▚
     ELEMENTAL     THE LONG      <untitled>
     ALCHEMY       ESSAY
     Manuscript    Essay                        ← a shelf of recognizable
                                                  things, not metadata rows
                                                  absent lines simply absent


  FROM YOUR WORK

     THE WORK IN ITS OWN WORDS
     "The soul does not move in straight lines…"      verbatim · marked
     "…a question you left yourself."                 WRITER · left

     A SENSE OF THE WHOLE
     <the writer's own synopsis>                      WRITER      ⚠gap
     or, if MAIA composed it: "MAIA's brief —"        MAIA
     never presented as the Work's own self-description

     OPTIONAL SPARK
                                    ✦ an invitation, if you want one    MAIA

     ─ passages may arrive quietly, one yielding to another, so the room
       feels inhabited by the writing rather than static


  ┌ Begin something ┐            ┌ Bring writing in ┐
```

## What changed, and why

```text
CONTINUE → RETURN         recency was masquerading as priority. The writer
                          cycles among projects by inspiration. RETURN is
                          already a stage in the Larger Arc.
one Work → 2-3            a plural process deserves a plural foreground
hero machinery removed    counts and dates recede into the Work itself
counts → actual material  "4 kept versions across 2 works" is administration.
                          The writer reached for inspiration, not inventory.
                          The work's own language speaks before MAIA does.
"never opened" cut        mechanically true, reads as reproach. If it does not
                          help re-entry, omit it.
elapsed → dates           v0.1's "3 days · 2 wks" scored dormancy (UNHURRIED).
                          **Dates remember. Durations judge.** — the language
                          of continuity, not of task software.
card shape                composes around what exists. v0.1's mock rendered
                          "—" for absent fields while its own prose said omit.
                          The prose was right.
form filters removed      premature — the form question is unruled
```

## ⚠ Naming is a third authority

Content origin and writer standing are not enough. **The label itself makes a
claim**, and the same passage under three names asserts three different things:

```text
"Gold Lines"        ONLY for passages the WRITER marked. If an algorithm or
                    MAIA chose them, this name quietly asserts evaluation —
                    "these are your best lines" — which nothing established.
"From your work"    mechanically selected excerpts. Honest about being a rule.
"MAIA noticed"      MAIA selected. Visibly hers.

MAIA selected this passage  ≠  this is one of your best lines
```

Same words, different authority. The name must match the hand that chose.

## Selection must be mechanically honest

`FROM YOUR WORK` needs a rule the writer could predict — *most recently marked*,
*explicitly kept* — never MAIA privately deciding what matters. Otherwise
inspiration becomes covert curation.

## Founder decisions — resolved

```text
1  RETURN holds 2-3 Works, never one
2  form is the writer's own vocabulary, remembered and offered back as
   reusable terms — not a universal taxonomy, not unlimited drift
3  FROM YOUR WORK omits entirely when empty
4  Ask MAIA opens in place — NOT to be confused with a path back to the House
5  deletion helps this account; abundance is not debris. Home needs search
   and writer-controlled grouping regardless.
```

## RULING — `work.purpose` (founder, 2026-09-07) · card UNBLOCKED

> **A storage field does not gain a new meaning merely because the redesign
> needs somewhere to put one.**

HOME TRUTH LAW applied to the schema itself. The founder walk uncovered a NEW
axis; it did not redefine the old one.

```text
TITLE       what do I call this Work?              Elemental Alchemy
FORM        what kind of thing is it taking        book · memoir · essay —
            shape as?                              the writer's own word,
                                                   explicitly never a taxonomy
INTENTION   why does this Work exist? what am      = work.purpose · KEEP
            I holding through it?                  free, writer-authored
CONTEXT     where does this Work live in my        personal · professional ·
            life?                                  social · NOT work.purpose ·
                                                   NOT constituted · working
                                                   term only, not ratified
```

**A vocabulary conflict already exists in the product**, verified in source —
`useLivingWorks.ts:47,49` stores `purpose` and `form`, while
`WorkDrawer.tsx:218` renders `purpose` under the heading **Becoming**, prompting
*"In your words — what is this, and what is it becoming?"* So one field carries
intention, identity and emergence, while `form` separately claims what the Work
is becoming.

**Home must not canonize that overloading by accident.** v0.2 therefore prints
neither *Purpose* nor *Becoming* on the card — the writer's sentence simply sits
beneath title and form as part of the Work's presence. Vocabulary reconciliation
is a separate act, not something Home settles visually.

```text
work.purpose          KEEP — writer-authored intention
work.form             KEEP — the writer's own word
personal/pro/social   DO NOT squeeze into either
new schema            NO
v0.2 card             MAY PROCEED
```

## The Work card — v0.2

```text
┌────────────────────────────────────────┐
│ [ writer-chosen visual ]               │  WRITER · never generated
│                                        │
│ ELEMENTAL ALCHEMY                      │  WRITER · title
│ Book                                   │  WRITER · form
│                                        │
│ <the writer's own sentence>            │  WRITER · purpose, UNLABELLED
│                                        │
│ "actual words from the Work…"          │  WRITER · source text
│                                        │
│ Last here · Chapter 6 — Fire     FACT  │
│                             Return →   │
└────────────────────────────────────────┘
```

**Absent fields vanish.** No *"No purpose"*, no dash, no invitation masquerading
as content. A card composes around what exists.

## The empty Home — CLOSED (founder, 2026-09-07)

```text
                    Welcome, writer. You are home.

              Begin a new work        Import writing
```

No explanation. No lesson. No permission language. **The room receives them.**
MAIA is simply present, without announcing what she does.

This supersedes an earlier draft that explained what a Work could be and named
MAIA as *"nearby when you want company."* That draft made a rule of not
presupposing the writer's need. **This goes further: presence that announces
nothing presupposes nothing at all.** The word was only necessary if she
introduces herself.

*Recorded so it is not later reopened as a defect:* "you are home" reads as
hospitality, not as a factual claim about the writer's history with the room —
the same way a host saying *make yourself at home* asserts nothing about where
you live. It is offered, not described.

## FIELD ≠ LESSONS (founder ruling, 2026-09-07)

> **The room should not explain itself while you are trying to inhabit it.**

```text
FIELD      experience     the Work · atmosphere · the writer's own words ·
                          visual identity · return cues · MAIA nearby
                          NO embedded teaching copy
LESSONS    explanation    a distinct area the writer chooses to enter:
                          what a Work is · Source vs Working Draft · how
                          Development works · keeps, dismiss, unresolved ·
                          how MAIA participates · process and habits ·
                          Studio conventions
```

**The one exception:** contextual explanation at a *specific consequential
action* — the shape `SECTION_BREAKS_COPY` already demonstrates, where an
unfamiliar act explains itself at the moment it is offered and nowhere else.

### Bearing on FR-D

This is a founder ruling on the help-form question. The FR-D evidence
(`8ccb73b60`) found the Studio already answers at the act, and asked what the
minimum help architecture is. The answer is now three-layered and the layers do
not mix:

```text
1  the field explains nothing
2  a consequential act explains itself, there and only there
3  Lessons holds everything a writer might want to learn, entered by choice
```

FR-D's remaining open is only *where Lessons lives and how it is reached* — not
whether help is inline. **It is not.**

## Not done## Not done## Not done## Not done

No component, schema, route, or build.
