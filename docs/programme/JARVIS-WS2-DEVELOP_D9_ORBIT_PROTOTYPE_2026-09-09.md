# D9 · Field + Orbit prototype — build record

**Built under narrow founder authorization, 2026-09-09.**
**Live at the same URL** — `https://claude.ai/code/artifact/bff88df8-b4ba-46f0-8000-0acede01334e`
⭐ **The pure-Field baseline is preserved in the artifact's version history** (labelled *"Published
Ch4 restored"*), so the control condition for F-ORBIT was not destroyed by extending in place.

> **One job: prove that sophistication can gather around the Work without making the writer inhabit
> the sophistication.**

---

## 1 · What was built

```text
FIELD        the writing field is BYTE-IDENTICAL in corpus and fixtures.
             Verified: SECS == prior SECS · F unchanged · respond() unchanged ·
             M2/M3/M4 handlers all present.

RAIL         3.25rem, left, always present. Three affordances: Structure ·
             MAIA · Workbench. Each says "I am here", none says "use me" —
             no counts, no badges, no indicators anywhere in the room.

LEFT ORBIT   Structure. Section list, click to move. Enters and leaves by
             gesture only.

MAIA ORBIT   Right. Shared-focus conversation log. The bottom composer and
             its quiet inline reply are UNCHANGED, so the panel is optional:
             the original Field experience survives untouched with the orbit
             closed.

WORKBENCH    Bottom drawer, closed. Outline · Versions · Statistics.
             ⭐ Statistics exists ONLY while summoned — the `262` case.

SHARED FOCUS Selecting text holds it as focus: an inline mark on the section,
             a quoted chip in the composer, a "Release" control, and a
             changed placeholder. The ask is sent as passage + question, so
             micro ↔ macro moves through one input with NO MODES.
```

## 2 · ⭐ THE CENTRE OF GRAVITY IS PROVABLY UNCHANGED

**Every orbit is `position:fixed`. None participates in layout.**

> ⭐ **The Work cannot reflow when a capability enters, because nothing an orbit does can touch it.**
> **On a wide viewport the orbits occupy margin the Work was never using — the manuscript does not
> move by a single pixel.**

⚠️ **Honest limit**: below ~1180px an orbit overlays part of the Work rather than sitting beside it.
**It still does not move the Work**, but it does cover it. ⛔ **Recorded as a known narrow-viewport
compromise, not as a solved case.**

## 3 · Constraints held — verified, not asserted

```text
✅ no inferred/adaptive UI   nothing opens, closes, or changes on its own.
                             No timers (0 setTimeout). No state inference.
                             Every transition is a writer gesture.
✅ arrival is quiet          all three panels carry `hidden` in the markup
✅ no persistence            0 localStorage / 0 sessionStorage reads or writes
✅ doctrine untouched        no doctrine file edited by this build
✅ corpus untouched          SECS identical to the published Chapter 4
✅ not integrated            prototype only; production untouched
```

## 4 · Access — quiet without hidden

```text
KEYBOARD       rail buttons in tab order · visible focus rings ·
               ESC closes the topmost panel, then releases shared focus ·
               focus moves into a panel on open and RETURNS to its rail
               button on close
SCREEN READER  aria-expanded on every rail button · aria-controls ·
               labelled regions · role="status" announcing
               "opened" / "closed. Nothing was kept." / focus held+released ·
               MAIA replies in an aria-live region
TOUCH          44px minimum on every control
COGNITIVE      three plain words on the rail · no mode knowledge ·
               nothing depends on remembering where a capability lives
NOT HOVER      the floating "Ask MAIA" is a mouse convenience ONLY —
               the focus chip in the composer carries the same state in
               every channel
```

## 5 · ⛔ WHAT THIS PROTOTYPE CANNOT SHOW

```text
⛔ NOT PROVEN   arrival · immersion · return — all three are FELT and
                require the founder to use it
⛔ NOT PROVEN   F-ORBIT. Structural absence of reflow is not the same as
                absence of residue in the writer's attention.
⛔ NO COGNITION fixture responses only; no live model
⛔ NO SCALE     10 sections, not 400 pages. The workbench is representative,
                not real.
```

⚠️ **The same discipline as before: a build verified only by its author's checks is a claim about
code, not about a room.**

## 6 · The witness, when the founder chooses to run it

```text
ARRIVAL     open it, before writing — does the room make you want to begin?
IMMERSION   write for a while — does the interface surrender attention?
RETURN      summon Structure, then dismiss.  Summon MAIA, then dismiss.
            Summon the Workbench, then dismiss.
            After each: are you immediately back inside the same field?

⭐ RECORD THE FIRST SPONTANEOUS RESIDUE BEFORE ANY VERDICT.
   "where did that go?" · "I should check the statistics" ·
   "there are other things I should be doing" · "how do I get back?"
```

⛔ **STOP AFTER THE PROTOTYPE AND EVIDENCE. Prototype success alone does not promote it into
Writer's Studio.**

---

# 7 · 🔴 DEFECT FOUND BY USE — shared focus died when the composer took keyboard focus

**Founder, 2026-09-09, first run. ⭐ REPAIRED.**

> ⭐⭐ **"The system knows what you're talking about while you can no longer see what the system knows
> you're talking about. That is exactly the kind of hidden state we've been trying to eliminate."**

⛔ **The browser's native selection was being treated AS the focus state.** Clicking the composer
collapses that selection, so the highlight vanished — **while the scope remained set and MAIA
remained scoped to the passage.**

⭐ **The state was never lost. Its VISIBILITY was.** ⚠️ **The worse of the two failures**: a system
that forgets is merely broken; **a system that remembers invisibly is the hidden-state defect this
constitution exists to prevent, at the smallest possible scale.**

⭐ **Found by USE, on the first session — not by review, and not by any check I ran.** *Every
structural verification passed on a room containing it.*

# 8 · ⭐ THE FOCUS FRAME — founder amendment, built

> **Shared focus is an ARBITRARY WRITER-DEFINED RANGE, not a section boundary. The writer may widen
> or narrow it across the Work while MAIA retains the relationship between local focus and
> whole-Work context.**

```text
word / sentence → paragraph → several paragraphs → passage → section →
several sections → chapter → whole Work
```

**Built:**

```text
FRAME          a soft bordered aperture drawn around the held range,
               with DRAG HANDLES on its top and bottom edges
DRAG           pull an edge up or down to include earlier or later
               material — across paragraph and section boundaries
GESTURES       drag-select · click a section heading to frame that section ·
               Wider / Narrower to step the aperture · Release
LABEL          the frame names its own scale — "passage" · "paragraph" ·
               "section 3" · "sections 3–5" · "whole chapter"
⛔ NO MENU      there is no analysis-level control; the frame IS the scale
PAINTING       CSS Custom Highlight API, independent of the browser
               selection, with a span-wrap fallback
RELEASE        only by writer act: another passage · Release · Escape ·
               or editing the framed text (which announces itself)
```

## 8.1 ⭐⭐ VISIBLE FOCUS IS WRITER-OWNED. CONTEXT MAY BE BROADER.

**Founder constraint, and the most important line in this amendment.**

⭐ **MAIA may consult the whole Work underneath — but the visible frame remains the writer's declared
centre of attention.** ⛔ **The frame never auto-expands because MAIA "thinks" more context is
relevant.**

> ⭐ **This resolves what would otherwise be a contradiction between Scale Coherence (hold the whole)
> and the Focus Frame (the writer draws the aperture): context is MAIA's business, aperture is the
> writer's. Only one of them is rendered.**

⭐ **It is the most tangible expression yet of Scale Coherence — *the writer is literally drawing the
aperture through which they want to work.***

## 8.2 · Verified after both changes

```text
✅ corpus byte-identical · fixtures byte-identical · respond() byte-identical
✅ M2 / M3 / M4 handlers intact
✅ 0 localStorage · 0 sessionStorage · 0 timers
✅ nothing opens, moves or resizes without a writer gesture
```

⛔ **NOT verified by use.** ⚠️ **And the defect just repaired was invisible to exactly this kind of
verification — which is the standing reason a felt witness is required and a structural pass is
not evidence about a room.**

## 8.3 ⭐ THE FINDING WORTH KEEPING

> ⭐⭐ **Shared attention must survive the transfer of keyboard focus.**
>
> **Generalized: wherever the system holds a scope on the writer's behalf, that scope must remain
> perceptible for as long as it is in force.**

⛔ **An invisible scope is indistinguishable from no scope at all — and worse than none, because the
system acts on it.**

⚠️ **Recorded as a CANDIDATE falsifier, deliberately NOT registered.** F-REACTIVE and the Law 4
disclosure family may already cover it. ⛔ **Founder ruling owed on whether it needs its own name.**

---

# 9 · ⭐⭐ F-SCOPE — REGISTERED, founder ruling 2026-09-09

> **FAIL when a scope the system holds as the writer's chosen or authorized boundary remains
> operative while that scope is no longer perceptible to the writer.**
>
> ⭐⭐ **Writer-owned scope may never become hidden operative state.**

## 9.1 · Why it needed its own name — the defect passed both neighbours

```text
F-REACTIVE   asks whether MAIA's influence leaves the writer writing toward
             MAIA rather than toward the Work
LAW 4        governs undisclosed or unauthorized STRATEGIC action
F-SCOPE      the system is still acting inside a boundary ATTRIBUTED TO THE
             WRITER, but the writer can no longer PERCEIVE that boundary
```

⭐ **The Focus Frame defect is the clean counterexample, and it is evidence rather than argument:**

```text
LAW 4        clean — MAIA held the passage the writer selected.
             No new strategy, nothing unauthorized.
F-REACTIVE   clean — the writer had not become reactive; no obligation,
             no orientation toward MAIA.
⛔ AND YET    the system continued acting on state that had become invisible.
```

> ⭐ **A real defect walked through the gap between two falsifiers. That is the argument for the
> third.**

## 9.2 ⭐ THE TWO-CONDITION TEST

```text
(1) is the scope ATTRIBUTED TO THE WRITER — chosen or authorized by them?
(2) is it OPERATIVE — does the system act under it?

BOTH YES   → it must remain perceptible for as long as it acts
EITHER NO  → not F-SCOPE
```

⛔ **Both conditions are load-bearing.** ⚠️ **Without them F-SCOPE would demand that all cognition be
exposed — and destroy the quiet room the whole architecture is built to protect.** ⭐ **The founder's
three exclusions are not softeners; they are what makes the falsifier survivable.**

## 9.3 ⭐⭐ F-SCOPE IS ALREADY RATIFIED CANON UNDER ANOTHER NAME

**Sanctuary Mode, invariant 4:** *"Visual clarity — user must see unambiguous indication that
Sanctuary is active."*

```text
(1) attributed to the member?   ✅ Sanctuary is their explicit choice
(2) operative?                  ✅ it governs what the system may retain
→ therefore it must be perceptible while it acts
```

> ⭐ **That invariant IS F-SCOPE, written years earlier for a single case.** ⭐ **F-SCOPE is not new
> law — it is the generalization of a vow the platform already holds**, which is the strongest
> possible provenance for a new falsifier: *the principle was already trusted; only its scope was
> narrow.*

## 9.4 ⚠️ RETROACTIVE REACH — what F-SCOPE now governs that is not yet built

⭐ **The commission is the significant one.** Law 5 makes a lawful commission possible —
*"restructure this chapter for pacing, preserve all personal stories, don't explain as you work."*

```text
(1) attributed to the writer?   ✅ they authored it
(2) operative?                  ✅ MAIA acts under it, possibly for hours
→ ⛔ IT MUST THEREFORE BE VISIBLE WHILE IT IS IN FORCE
```

⚠️ **No such indicator has been designed.** ⛔ **A commission that governs MAIA's editing while
living only in a past message is precisely F-SCOPE** — *the writer authorized a boundary and then
lost sight of it.*

**Also now governed**: a deferred observation that becomes operative again · any "these chapters
only" reading scope · any standing instruction that outlives the turn that created it.

⛔ **Named, not designed. No implementation authorized here.**

---

# 10 · ⭐ THE COMMISSION INDICATOR — required by F-SCOPE, design owed

**Founder, 2026-09-09.**

> ⭐⭐ **If MAIA is acting because the member chose a boundary, the member must be able to see that
> boundary while MAIA acts.**

⭐ **A commission is no longer conversational context. Once MAIA acts under it, it is MEMBER-AUTHORED
OPERATIVE STATE.** ⛔ **A commission living only in an earlier message is constitutionally
insufficient.**

**What the eventual room must be able to answer — ⛔ not another dashboard:**

```text
WHAT IS MAIA CURRENTLY AUTHORIZED TO DO?
  scope        this chapter / these passages / this commission
  permission   restructure substantially
  protected    personal stories · phenomenological method
  posture      no teaching while working
  status       ACTIVE
  writer can   inspect · amend · end
```

**The same rule now cleanly covers**: Focus Frame · reading range · editing commission · standing
instruction · a deferred observation that becomes active again · Sanctuary Mode. ⛔ **And it does NOT
require exposing MAIA's internal orientation, retrieval or cognition merely because those exist —
the two-condition test prevents that overreach.**

## 10.1 ⭐ THE TENSION, AND ITS RESOLUTION

```text
F-SCOPE      demands the boundary be PERCEPTIBLE
F-REACTIVE   forbids the room from SOLICITING
```

⭐ **Legible Form already resolves it: a control is judged by the SENTENCE IT SPEAKS.**

```text
⭐ LAWFUL     "this is what you authorized"    — a mirror of the writer's act
⛔ UNLAWFUL   "MAIA is working"                — reports the system
⛔ UNLAWFUL   "review this" / "3 pending"      — a demand
```

> ⭐⭐ **An F-SCOPE surface reflects the writer's own decision back to them. A reflection of your own
> act does not solicit — it reassures.** ⚠️ **It becomes solicitation only when something is ADDED:
> counts, urgency, progress, or a prompt to act.**

⚠️ **One field in the sketch is the risk.** ⛔ **`status: ACTIVE` is redundant while the indicator is
shown — its presence IS the status** — and a status field invites a second value, which invites
attention. *Remove it and one pressure vector disappears with it.*

## 10.2 🔴 COLLISION — commission lifetime vs. the quiet arrival rule

**Both rules were recorded today and they meet here:**

```text
ARRIVAL RULE   every fresh arrival begins in the quiet room; no inherited
               open panels unless the writer explicitly chose persistence
F-SCOPE        a boundary the writer authorized must be perceptible for as
               long as it is operative
```

⛔ **A commission can outlive a session.** ⚠️ **So the writer returns tomorrow, MAIA is still acting
under an authorization they granted, and the quiet room shows nothing.** ⭐ **That is F-SCOPE
failing by obeying the arrival rule.**

**Candidate resolution — ⛔ not ruled:**

> ⭐ **The arrival rule bars INHERITED TOOL STATE. It does not bar, and F-SCOPE requires, showing
> STANDING AUTHORITY the writer granted and has not ended.**
>
> **A fresh arrival is quiet of instruments. It is not silent about what MAIA may do.**

⭐ **These are different objects: a panel someone left open is the room remembering a convenience; a
live commission is the room remembering a PERMISSION.** ⛔ **Only one of those is the writer's own
act still in force.**

⛔ **REQUIRED BY F-SCOPE · DESIGN OWED · IMPLEMENTATION NOT AUTHORIZED.**

---

# 11 · ⭐⭐ RULING — arrival vs. standing authority · founder, 2026-09-09

> **Arrival resets convenience state, not explicitly standing authority. Any writer-granted
> authority that remains operative across arrival must remain quietly perceptible until the writer
> ends or amends it. Authority may cross sessions only when its persistence was itself authorized.**
>
> ⭐⭐ **Reset the room. Preserve the permission. Show only what is still in force.**

```text
INHERITED TOOL STATE                 STANDING AUTHORITY
"Structure was open yesterday."      "You may restructure this chapter."
"Workbench was expanded."            "Preserve the personal stories."
"MAIA panel was docked."             "Do not teach while editing."
→ RESET on arrival                   → REMAINS PERCEPTIBLE while operative
```

## 11.1 · Presentation — the indicator mirrors the writer's act

```text
⛔ NOT   MAIA IS WORKING · 3 CHANGES PENDING · ACTIVE COMMISSION

⭐ BUT   Your commission
         Restructure this chapter for pacing.
         Preserve the personal stories.
```

⭐ **Its presence says everything necessary. No `ACTIVE`, no count, no urgency, no progress.**
⚠️ **And note the grammar again — *"Your commission."* Second person, possessive.** **The same form
as the six requests: the surface speaks from the writer's side, which is why it reassures instead of
demanding.**

## 11.2 ⭐⭐ THE DURATION BOUNDARY — founder's catch

```text
EXPLICITLY STANDING   "Use this commission until I end it."
                      → may cross sessions · must remain visible
SESSION-BOUNDED       "Work with me on this now."
                      → ends with the encounter
AMBIGUOUS             → ⛔ DO NOT SILENTLY PROMOTE to standing authority
```

> ⭐ **Otherwise MAIA would be silently deciding that yesterday's permission still governs today** —
> **which keeps the system from solving the F-SCOPE problem by creating a Law 4 problem.**

⭐ **The AMBIGUOUS case resolves by the same asymmetry that set the preservation default: DEFAULT TO
THE NARROWER AUTHORITY.** ⛔ Not *ask every time* — that is friction. **A too-narrow authority is
recoverable, because the writer simply re-grants it. A too-broad one is not, because MAIA has
already acted beyond what was meant.**

## 11.3 ⭐⭐ THE GENERAL HAZARD THIS EXPOSES — a repair can MIGRATE a violation

**Twice now in one session, a fix for one constitutional problem has created another:**

```text
1  "surface the divergence" (Parallel Knowing)
   → risked becoming a persistent objection surface      → F-REACTIVE
   resolved by sequencing: surface once, then retained

2  "make standing authority perceptible" (F-SCOPE)
   → risked silently promoting yesterday's permission    → LAW 4
   resolved by requiring duration to be authorized too
```

> ⭐⭐ **A constitution with eight falsifiers has a new failure mode: the repair that moves the defect
> rather than removing it.** ⛔ **Neither instance was caught by the falsifier being repaired — both
> were caught by asking what the repair now permits.**

⚠️ **Recorded as a standing check, not a new falsifier:** ***after any constitutional repair, ask
which other falsifier the repair has just made reachable.***
