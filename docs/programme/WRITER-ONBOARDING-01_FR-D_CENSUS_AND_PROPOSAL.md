# FR-D · §5 CENSUS + §7 DECISION-READY PROPOSAL

```text
FLOW      WRITERS-STUDIO-FR-D-CONTEXTUAL-HELP-01
SUBJECT   canonical 3d9c2ea6 · production witness e535e6246
CLASS     READ-ONLY CENSUS · no source file edited
STATE     STOPPED AT §7 · awaiting founder ruling · NO BUILD
```

⛔ Per §5: not a generic UX inventory. Per the founder's preservation rule, **an
unanswered threshold question is not automatically a defect** — controls that are
already obvious are recorded as NO CHANGE, because adding help there would
worsen the Studio.

---

## Part 1 · THE TWO RENDER-SITE FINDINGS

Everything else in this census is downstream of these.

### ⭐ F1 · Opacity is the entire state communication

`StudioRail.tsx` renders a destination as **label + count**. It never reads
`note`. An unavailable destination becomes:

```text
tag            <span>          (deliberately not a disabled anchor or dead button)
aria-disabled  true
opacity        0.55
text saying    NOTHING
```

The tag choice is careful and correct — the DOM cannot mislead. But **no words
distinguish *not built* from *broken*, *empty*, or *not yours*.** This is FR-C's
ruled failure, located precisely: the rail has no channel for the sentence FR-C
requires.

### ⭐⭐ F2 · The mode bar already knows the distinction and does not show it

`StudioModeBar.tsx` carries four states, with this doctrine in the file:

> *"`needs-work` is deliberately not folded into `unavailable`: 'not built' and
> 'nothing to bring' are different facts, and a member is owed the difference."*

What renders:

```text
active       INK.primary · opacity 1 · gold underline · background
rest         INK.secondary · opacity 1                          → a link
needs-work   INK.secondary · opacity 1                          → NOT a link
unavailable  INK.quiet · opacity 0.5                            → not a link
```

**`rest` and `needs-work` are visually identical.** One navigates; one silently
does nothing. The difference the doctrine says a member is owed exists in
`data-state` — machine-readable, not member-readable.

⭐ **This is the same failure shape as FR-C, one layer up, and it is worse:**
FR-C's case shows *something* (dimness) that is merely ambiguous. This case shows
**nothing at all** and looks pressable. A writer with no Work on the table who
presses DEVELOP gets silence.

⛔ Not a defect report against the mode bar's design — the design is right, and
the file already argues for exactly what FR-D now requires. The gap is that the
argument never reached the surface.

### F3 · No help primitive exists

```text
app/writers-studio/studio/   MaiaReading · StudioIcon · StudioInsightChip ·
                             StudioModeBar · StudioPanel · StudioRail ·
                             StudioScrollbars · StudioSurface · StudioType ·
                             WriterStudioShell
```

None is a help affordance. `title=` appears only for truncated card names;
`aria-label` only for accessible naming. **Any object-local explanation is new
construction.** There is nothing to harvest at the component layer.

### F4 · What CAN be harvested

```text
StudioDestination.note        a declared descriptor slot, 2/16 filled, unrendered
data-state / data-actionable  state already computed per control, member-invisible
StudioPanel(label, onDismiss) a dismissible labelled container — an existing
                              disclosure shell, not a help component
compact breakpoint            BREAKPOINT.compact; rail goes full-width.
                              No hover dependency exists today — so nothing is
                              broken on touch, and nothing exists to build on.
LENS_MEANING                  7 one-line glosses, RENDERED — the one place the
                              Studio already answers "what is this" well
```

---

## Part 2 · THE CENSUS

Format per §5. `Q1` what is this · `Q2` why would I use it · `Q3` what does it
enable/change · `Q4` what happens if I do.

### C-1 · `This work` — the walk's terminal block

```text
CONTROL              rail head button, Canvas + Develop
CURRENT LABEL        "This work"
STATE COMMUNICATION  bordered rounded rect; active background when open
EXISTING HELP        none on the control.
                     MaiaColumn carries the answer 3 columns away:
                     "Declare one in "This work" and Conversations opens."
UNANSWERED           Q1 Q2 Q3   ⛔ all three
PRIMITIVE            none — the sentence exists but not object-local
SMALLEST FORM        step 3, object-local explanation
NOTE FIELD           n/a (not a map destination)
```

⭐ **The decisive case.** The remote sentence was on screen and failed. This is
the control FR-D's proposal must be able to fail against.

### C-2 · Rail destinations, unavailable — Materials · Structure · Notes · Goals · Discover · Insights · Suggestions · Find/Replace · Statistics · Timeline · Word Web

```text
CURRENT LABEL        the destination name, alone
STATE COMMUNICATION  opacity 0.55 + aria-disabled. No words.        (F1)
EXISTING HELP        none
UNANSWERED           Q1 Q3  — and critically, WHY IT CANNOT BE USED
PRIMITIVE            StudioDestination.note (declared, unrendered)
SMALLEST FORM        step 2 inline state — FR-C requires it SAID, so it may
                     not wait to be requested
NOTE FIELD           USE — this is exactly step-2 inline orientation
```

### C-3 · Rail destinations, available — Home · Manuscript · Versions · Export

```text
CURRENT LABEL        Home · Manuscript · Versions (count) · Export
STATE COMMUNICATION  full opacity, actionable
EXISTING HELP        note exists for Manuscript ("The room where your work
                     develops.") and Export ("Take your writing out.") —
                     UNRENDERED
UNANSWERED           Home: none. Export: none. Manuscript: none.
                     Versions: Q2 Q3 — "Versions 2" read 1 → 0 → 2 across
                     renders during the walk (W-11) and the count is the only
                     thing it says
SMALLEST FORM        Home / Manuscript / Export → NO CHANGE
                     Versions → step 3 on demand
NOTE FIELD           USE where written; do not author new notes for controls
                     that are already obvious
```

⛔ **Home, Manuscript and Export need nothing.** Adding help here would be the
clutter the ruling forbids.

### C-4 · Mode bar — WRITE · DEVELOP · EXPLORE · REVIEW · PUBLISH

```text
CURRENT LABEL        uppercase mode name
STATE COMMUNICATION  four states, two of them visually identical    (F2)
EXISTING HELP        none
UNANSWERED           Q1 Q2 for every mode a writer has not entered
                     ⭐ plus: needs-work vs rest is UNSAID
SMALLEST FORM        step 2 for the needs-work / unavailable STATE (FR-C: said,
                     not requested)
                     step 3 for Q1/Q2 orientation — this is the founder's own
                     example:  "Develop — Work with structure, questions, and
                     possibilities around your draft."
NOTE FIELD           STUDIO_MODES has NO note field. If modes carry orientation,
                     the slot must be added there or the descriptor lives in the
                     component. Census does not decide this.
```

### C-5 · `Keep a version`

```text
CURRENT LABEL        "Keep a version"
STATE COMMUNICATION  plain text control, top-right of the writing pane
EXISTING HELP        none at the control.
                     Develop's refusals point AT it from another room:
                     "Keep a version in the Writer Canvas, then ask again."
UNANSWERED           Q2 Q3 Q4
SMALLEST FORM        step 3 — and this one is load-bearing beyond its size:
                     it is the unblocking act for two Develop refusals (W-04)
                     and nothing here says so
NOTE FIELD           n/a
```

### C-6 · `Keeps`

```text
CURRENT LABEL        "Keeps"
STATE COMMUNICATION  "You have not kept any passages yet. Keeps are made in the
                     Source, where your sections live."
EXISTING HELP        that sentence — which is state + location, not meaning
UNANSWERED           Q1  ⭐ noun/verb collision: the writer read it as an act
                     (W-10). MAIA says "a Keep is how you would hand her one",
                     then the control cannot perform one.
SMALLEST FORM        step 1 — LABEL. This is not a help gap; it is a naming
                     problem, and help would paper over it.
NOTE FIELD           n/a
```

⭐ **The one control where the ruling's answer is "do not add help."** Step 1 of
the disclosure order is *clear label*, and it has not been tried.

### C-7 · Develop — lens list + `Ask MAIA to read this developmentally`

```text
CURRENT LABEL        7 lenses, each with a one-line gloss
STATE COMMUNICATION  "MAIA has not read this work developmentally yet."
EXISTING HELP        LENS_MEANING (rendered) · INVOCATION_SENTENCE (rendered):
                     "…Nothing changes unless you change it."
                     Pane: "…each observation resting on named parts of the
                     work, with what it does not establish said plainly."
UNANSWERED           NONE
SMALLEST FORM        NO CHANGE
NOTE FIELD           n/a
```

⭐ **The Studio's one fully-answered surface, and the model for the rest.** Q1 by
gloss, Q3 by the pane sentence, Q4 by the invocation sentence — all resting,
none requested, none competing with writing. **FR-D should be judged against
whether it makes other surfaces read like this one.**

### C-8 · Studio Home — `Begin a new work` · `Import writing` · `Continue writing` · `Open writing` · `Make this a work`

```text
STATE COMMUNICATION  "Your work is here." / "Your writing is here." + meta line
EXISTING HELP        none
UNANSWERED           "Your works" vs "Your writing" — the distinction is
                     load-bearing (declared vs unclaimed) and unexplained.
                     "Make this a work" is the same act as C-1 under a
                     different name.
SMALLEST FORM        Begin / Import / Continue / Open → NO CHANGE (obvious)
                     the two-shelf distinction → step 2, one line per section
                     heading
NOTE FIELD           n/a
```

⛔ Studio Home renders **no rail and no mode bar**. FR-C/FR-D changes to either
do not reach this surface. Recorded, not solved.

### C-9 · `organise` · outline rows · lower-band tabs · GOALS · STATISTICS

```text
organise             Q1 Q3 unanswered · step 3 · low priority
outline rows         NO CHANGE — navigation is self-evident and was witnessed
                     working (GATE-0 6b)
tabs (OUTLINE /      Q1 unanswered for THREADS · WORD WEB
 THREADS / TIMELINE  step 3, low priority
 / WORD WEB)
GOALS                already says it: "A goal is yours to set. There is no way
                     to declare one here yet, so nothing is measured."
                     ⭐ NO CHANGE — this is FR-C's required sentence, already
                     written, on the surface, for an unbuilt capability
STATISTICS           NO CHANGE
```

⭐ **GOALS is the existing proof that FR-C's form works.** It says the state
plainly, promises nothing, and no one has to hover for it. It should be the
pattern the rail copies, not a new invention.

---

## Part 3 · §7 DECISION-READY PROPOSAL

### A · Governing sentence

> Studio help lives as close as possible to the unfamiliar act, appears when
> meaning is sought, and answers only what the writer needs to know before
> choosing that act.

### B · Help / state distinction

```text
STATE   said, at rest, on the surface. Never requested.
        → unavailability · needs-work · consent · refusal · consequence
HELP    requested, object-local, progressive.
        → what is this · why would I use it
```

Test: *if the writer cannot correctly interpret the control without it, it is
STATE and must be visible.*

### C · Progressive-disclosure hierarchy, as applied here

```text
1  LABEL       C-6 Keeps — fix the word, add no help
2  INLINE      C-2 unavailable destinations (FR-C) · C-4 mode state ·
               C-8 the two-shelf distinction · `note` where already written
3  OBJECT-LOCAL C-1 This work · C-5 Keep a version · C-3 Versions ·
               C-4 mode orientation · C-9 organise, THREADS, WORD WEB
4  AFFORDANCE  none proposed
5  SURFACE     none proposed
```

⭐ **Steps 4 and 5 are empty.** The census found no control needing more than
object-local explanation. R-1 "Help section" is therefore **not required by this
census** — which is a finding, and belongs to the founder to accept or reject.

### D · Cross-input behaviour

```text
pointer    hover, and intentional click for persistence
keyboard   focus reveals the same content; Esc dismisses
touch      tap reveals; tap-away dismisses
```

No hover dependency exists in the Studio today, so nothing regresses — but
nothing exists to extend either. Whatever carries step 3 must be built
input-independent from the first commit, not adapted afterward.

### E · Where help must remain visible rather than requested

```text
every unavailable rail destination        FR-C
mode-bar needs-work and unavailable       F2
the "Your works" / "Your writing" line    C-8
GOALS                                     already correct — do not touch
```

### F · Explicit exclusions

```text
⛔ Home · Manuscript · Export · outline rows · Begin · Import · Continue ·
   Open writing · STATISTICS · the whole Develop lens surface
⛔ no help affordance on any control the census marked NO CHANGE
⛔ no dedicated help surface
⛔ no tour, no first-run overlay
⛔ Keeps gets a LABEL decision, not a tooltip
```

### G · Examples on actual controls

```text
Notes                          ← rail, unavailable
Not available yet                 step 2, at rest, FR-C

DEVELOP                        ← mode bar, needs-work
Open a work first                 step 2, at rest, F2

This work                      ← rail head
Say which Work this manuscript belongs to.       step 3, on request
MAIA can only speak about a declared Work.
```

⛔ **Candidate strings, illustrating form only.** Not approved copy. The ruling
is about architecture; wording is a later act under FR-C's constraints.

### H · Note field disposition — judged where it exists, per the founder

```text
manuscript  "The room where your work develops."   USE — good step-2 orientation
export      "Take your writing out."               USE — good step-2 orientation
14 empty destinations                              INDETERMINATE — do NOT author
                                                   notes to fill the schema
STUDIO_MODES                                       has no note field at all
```

**Verdict: USE, not remove.** The slot is the natural step-2 carrier and the two
written notes are already the right register. ⛔ But filling all sixteen would
produce exactly the clutter the ruling forbids — **the slot stays sparse by
intent**, and emptiness must remain legitimate rather than reading as a gap.

### I · Contradictions and stop conditions

```text
⚠️ S-1  Studio Home carries no rail and no mode bar. FR-C/FR-D changes do not
        reach the surface where a writer arrives. NOT a stop condition; a
        scope limit that must be stated when this is called done.

⚠️ S-2  `note` lives on StudioDestination, not StudioMode. Carrying mode
        orientation needs either a new field or component-level copy. Census
        does not decide it; the ruling should.

⚠️ S-3  FR-C requires saying construction status; studioMap.ts's NO ROADMAP
        LEAKAGE rationale forbids it. Governs unrendered code, so no live
        conflict. ⛔ Not edited during the census, per instruction. Must be
        reconciled in the FR-C implementation act.

⚠️ S-4  C-6 Keeps may need a rename, and a rename is a naming act with reach
        beyond this flow — MAIA's own copy says "a Keep is how you would hand
        her one". If the ruling touches the word, Lane B copy moves with it.

✅ NO STOP CONDITION TRIGGERED. No new behavioral authority is required.
   Nothing proposed changes authorship, memory, provenance, access,
   capability, mode semantics or refusal authority.
```

### How this proposal can fail against the founder walk

Per §7 it must be falsifiable. It fails if, after implementation:

```text
1  a writer at C-1 "This work" still cannot answer why to press it
2  the answer is reachable by hover but not by keyboard or touch
3  an unavailable destination still reads as broken or empty
4  DEVELOP with no Work still looks pressable and does nothing
5  explanation is visible while writing when nothing was asked
6  any control marked NO CHANGE has acquired help
```

⛔ **STOPPED AT §7. No code. Awaiting founder ruling.**
