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

---

# 12 · 🔴 SECOND DEFECT FOUND BY USE — "I can work within the box but not extend it"

**Founder, 2026-09-09. ⭐ REPAIRED, and verified in a real browser this time.**

## 12.1 · Root cause — the caret probe never reached the prose

**Dragging a handle calls `caretRangeFromPoint(x,y)` to turn a pointer position into a text
position. It was returning the wrong thing, twice over:**

```text
1  THE HANDLE WAS UNDER THE POINTER
   the probe resolved to the handle element, not the text beneath it
   → fixed: the frame drops pointer-events for the duration of the drag

2  ⭐ THE PROBE LANDED IN THE COLUMN'S PADDING
   x was clamped to main.left+8, but main carries 24px of padding, so the
   probe sat OUTSIDE the text and returned the <section>, not a text node
   → the guard `if(!bodyOf(...)) return` then silently no-opped
   → fixed: the probe SNAPS INTO THE NEAREST BODY OF PROSE
```

⭐ **Silent no-op is exactly how it presented**: the frame was live, the handle grabbable, the drag
tracked — **and nothing happened.** ⚠️ **A guard that returns quietly on an unexpected value
produces a defect with no symptom except that the thing does not work.**

**Two further repairs from the same screenshot:**

```text
HANDLES SAT ON THE PROSE   → moved into the left margin, clear of the text
                             (verified: handle-right 439 ≤ text-left 442)
A SECOND BOX APPEARED      → the contenteditable's focus ring read as a rival
                             frame; it is now an inset left bar, never a box
"ASK MAIA" COVERED WORDS   → moved into the margin beside the selection
```

## 12.2 ⭐ VERIFIED IN A REAL BROWSER — `20/20`, plus the drag suite

**Playwright + Chromium, scripts committed at `scripts/witness/d9-orbit-verify.mjs` and
`d9-frame-drag-verify.mjs`:**

```text
arrival: Structure / MAIA / Workbench closed · no frame          PASS
selection → frame visible · scale label · highlight painted      PASS
⭐ composer focus: browser selection GONE, frame + highlight SURVIVE  PASS
drag bottom handle:      140 → 695 chars                          PASS
drag top handle:         695 → 1027 chars, scale "SECTIONS 1–2"   PASS
drag across a boundary:  1027 → 1172 chars                        PASS
ask with a frame held → MAIA names the frame she is holding       PASS
orbit open: the Work did NOT move (identical geometry)            PASS
Escape closes · no residue · frame survived the orbit             PASS
release only on explicit act · highlight cleared                  PASS
                                                     0 failed of 20
```

⚠️ **Two of my own test runs were wrong before the product was**: the first suite failed on a
threshold I set badly, and the drag suite failed twice because it never scrolled the frame into
view. ⚠️ **SHARPENED — founder correction, 2026-09-09.** ⛔ *"A red result is a claim about the test"* is
half a rule, and the half that produces the opposite error.

> ⭐⭐ **A failing test is evidence of a MISMATCH. Before attributing the mismatch to the product,
> verify the instrument actually exercised what it claims to have exercised.**

⭐ **Then attribute.** ⛔ **Neither "the product is broken" nor "the test is wrong" may be assumed —
the instrument is checked FIRST because it is the cheaper of the two to check, not because it is the
likelier to be at fault.**

## 12.3 ⭐ ONE PRODUCT CHANGE MADE WHILE FIXING — the scope-blind fallback

**With a frame held, an unrecognized question answered *"Say more?"* — as though nothing were
held.** ⭐ **It now names the frame it is actually holding:** *"I have sections 1–2 held with you.
Say more about what you are after here — or widen the frame and ask again."*

⛔ **No new developmental claim was added.** ⭐ **This is scope acknowledgement, not cognition — and
it is arguably F-SCOPE at the level of speech: MAIA holding a boundary and speaking as if she were
not.**

## 12.4 ⛔ WHAT IS STILL NOT PROVEN

```text
✅ MECHANICS   verified in a browser, 20/20 plus three drag cases
⛔ FELT        arrival · immersion · return · F-ORBIT — all still owed,
               and all still the founder's alone

⚠️ BOTH defects so far were found by USE and missed by every structural check.
   The mechanical suite now covers them — which means it will not find the third.
```

---

# 13 · ⭐ FIRST F-ORBIT WITNESS — two results, one screen

**Founder, 2026-09-09.**

## 13.1 ⭐⭐ ORBIT RAIL — **POSITIVE**

> **"This setup is brilliant, in terms of function, with Structure, MAIA and Workbench on the left
> side so lightly but effectively."** — founder, verbatim

**What the witness reports**: the manuscript still owns almost the entire visual field. **Structure ·
MAIA · Workbench sit at the edge as quiet possibilities** — no icons demanding interpretation, no
counts, no badges, no dashboard chrome. ***You can tell where the power is without feeling asked to
use it.***

⭐ **That is the Legible Form test passing on its own terms**: *"I am here when you need me,"* rather
than *"use me."*

⭐⭐ **AND IT ANSWERS AN OPEN PROBLEM WITH EVIDENCE RATHER THAN PRINCIPLE.** §4.3 flagged that a quiet
room is harder to learn, and §5 resolved it in doctrine. **This is the first evidence that
discoverability was solvable without bringing the cockpit back.**

> ⭐ **RULING: do not change the rail on this witness. It is doing exactly what was wanted.**

## 13.2 ⚠️ FOCUS FRAME — **PARTIAL** — ⛔ and the verdict is DATED

```text
WITNESSED   the frame persists and supports working with MAIA
⛔ FAILED    the promised drag-to-extend aperture did not function in use
```

⚠️ **CUSTODY NOTE — this verdict was formed against the PRE-REPAIR build.** ⭐ **The drag defect was
diagnosed and repaired after that observation and is live now (`56d0ac264`):**

```text
ROOT CAUSE   the caret probe landed in the column's padding and in the
             handle itself, so the drag silently no-opped
VERIFIED     Playwright + Chromium — bottom 140→695 · top 695→1027 ·
             across a section boundary 1027→1172 · label "SECTIONS 1–2"
```

⛔ **The PARTIAL stands as a true reading of the build it was taken on.** ⭐ **It is not evidence
about the current build, and must not be carried forward as one.** ⚠️ **RE-WITNESS OWED on the
current artifact** — *and a mechanical pass is not that witness; only use is.*

⭐ **The founder's separation was exactly right and should be preserved as method: repair the Frame
without touching the successful orbit arrangement.** ⛔ **Two results from one screen must not be
averaged into one verdict.**

## 13.3 ⭐⭐ THE FINDING

> **The Work can remain visually sovereign while substantial capability sits one gesture away.**

⭐ **That is the Field + Orbit argument beginning to prove itself rather than merely being well
specified.** ⛔ **Beginning — one witness, one screen, ten sections, no live cognition. F-ORBIT's
full sequence (arrival · immersion · summon and dismiss each capability · return) is still owed.**

---

# 14 · ⭐ RULING — acknowledgement, not repetition · founder 2026-09-09

> **F-SCOPE requires the writer to be able to PERCEIVE the operative scope. It does not require MAIA
> to keep REMINDING them of it.**

```text
⭐ LAWFUL     "I'm holding the passage you framed."
              → when ambiguity makes acknowledgement useful
⭐ LAWFUL     accessible scope state available in the active channel
              → no repeated conversational interruption required
⛔ UNLAWFUL   "Still working on sections 1–2…" · "Your frame remains active…"
              → repeated reminders become pressure and interface chatter
```

⭐ **The visual frame already discharges F-SCOPE for a sighted writer. A screen-reader or voice-only
channel needs an EQUIVALENT PERCEPTIBLE FORM — not a spoken reminder.**

> ⭐⭐ **Solving F-SCOPE by repetition would drift straight into F-REACTIVE** — *the third instance in
> this session of a repair migrating a violation, and the first one caught before it shipped.*

## 14.1 · Built and verified

```text
ACCESSIBLE STATE   a visually-hidden description names the current scope;
                   the composer carries aria-describedby to it, so a
                   screen-reader writer hears the scope ONCE ON ENTERING
                   the field, never repeatedly at it
                   → "Focus frame holds sections 1–2. MAIA is scoped to it
                      until you release it."
REGION             the focus chip is a labelled region, findable on demand
ACKNOWLEDGE ONCE   under ambiguity MAIA names the frame on the FIRST
                   unrecognized turn only; a second says "Say more?"
RESET              a new frame, or any recognized answer, re-arms it
CLEARED            release empties the accessible description
```

**Verified** (`scripts/witness/d9-scope-perceptibility.mjs`): no frame → empty · frame → scope
present · composer describes it · 1st ambiguous turn acknowledges · **2nd does not repeat** ·
release clears. **6/6, and the 20-check suite still 20/20.**

⚠️ **My test was wrong a THIRD time before the product was**: the probe phrase *"something unclear"*
contains `something`, a real trigger, so it never reached the fallback at all. ⭐ **Caught by the
founder's own sharpened rule, applied to itself** — the instrument was checked before the product
was blamed. ⚠️ **OVERREACH CORRECTED — founder, 2026-09-09.** ⛔ *"The mechanical layer is not where this
prototype is weak"* **was not established.** It generalized from three instrument errors to a claim
about a whole layer — **the same evidence-outrunning-what-was-exercised error the testing rule above
exists to prevent, committed one paragraph after stating it.**

**What IS established, and only this:**

```text
KNOWN MECHANICAL DEFECTS   two real ones, found immediately by use, repaired
CURRENT SUITE              20/20 + 6/6 against the behaviours NOW SPECIFIED
RECENT RED RESULTS         three were instrument defects, not product defects

⭐ THEREFORE   the known mechanics are currently behaving as specified
⛔ NOT THAT    the mechanical layer has been proven generally strong
```

## 14.2 ⛔ THE WITNESS THAT REMAINS

```text
frame a passage → drag the bottom handle well down, across a boundary →
drag the top handle up → click into MAIA → ask a real question about the
larger framed movement

THEN IGNORE THE MECHANICS AND NOTICE:

⭐ "I'm showing MAIA what I mean."   → the Focus Frame has found its form
⛔ "I'm managing a box."             → mechanics perfect, interaction not
```

> ⭐ **Founder: the next defect, if there is one, is most likely to be EXPERIENTIAL rather than
> mechanical.** ⚠️ **Both defects so far appeared immediately under real use and were invisible to
> every structural check — which is why the suite is supporting evidence and never the witness.**

---

# 15 · ⚠️ ACCESSIBILITY — STRUCTURAL PASS IS NOT AN AT WITNESS

**Founder, 2026-09-09.** ⭐ **The `aria-describedby` contract can be structurally correct while real
assistive technology behaves differently.**

```text
✅ ESTABLISHED   the accessible scope description exists, is referenced by
                 the composer, updates on frame change, clears on release
⛔ NOT ESTABLISHED   that a screen-reader writer actually perceives the scope
                     once on entry, and is not interrupted at it

OWED   a witness with a real screen reader
⛔ NOT a blocker for this prototype walk
```

⚠️ **This is F-SCOPE's own hazard turned on the repair for F-SCOPE**: *a boundary that is
structurally announced but not actually perceived is still an invisible operative scope* — **it
merely has a passing test.**

# 16 · ⭐ THE FELT WITNESS — two questions, and the second is the harder one

```text
1  Did it feel like SHOWING MAIA WHAT YOU MEANT,
   or like MANAGING A BOX?

2  ⭐ Did WIDENING THE FRAME CHANGE THE KIND OF CONVERSATION
   you naturally wanted to have with MAIA?
```

⭐⭐ **Question 2 is the stronger test, and it is not one an interface can fake.** ⛔ **Question 1 can
be passed by good interaction design alone.** **Question 2 asks whether the writer's own INTENTION
moved with the aperture** — from *"help me with this sentence"* to *"look at what I'm doing across
all of this"* — **without a thought about modes or levels.**

> ⭐ **If that happens, Scale Coherence has reached the writer rather than merely the architecture:
> the interface is letting attention move from leaf to branch to tree.**

**Protocol**: take a real stretch of Chapter Four · frame something small · widen it across the point
where the thought changes · ask MAIA something genuinely wanted about that whole movement.
⛔ **Then stop exercising buttons and just use it.** ⭐ **First spontaneous description, not a
PASS/FAIL.**

---

# 17 · ⭐⭐ FOCUS FIDELITY — the frame is a shared-attention declaration

**Founder witness and rulings, 2026-09-09.**

```text
FOCUS FRAME — FELT FORM   ⭐ PASS   "This is beyond perfect."
SCALE AS INTERACTION      ⭐ PASS   widened the aperture and asked a larger
                                    question, without a thought about modes
SCOPE VISIBILITY          ⭐ PASS   the frame remained perceptible
FOCUS FIDELITY            ⛔ FAIL   broader context REPLACED the framed
                                    material as the subject of the answer
```

⛔ **The defect was NOT that MAIA consulted outside the frame — that is authorized.** ⭐ **It was
that outside context DISPLACED visible focus as the object of attention.**

> ⭐⭐ **Context may exceed the aperture. Attention may not.**
> ⭐⭐ **MAIA follows attention before she leads attention.**
> ⭐⭐ **MAIA may extend her CONTEXT freely. She may not extend the WRITER'S ATTENTION silently.**

⚠️ **This is F-SCALE, not a ninth falsifier.** Scale Coherence requires both directions at once;
**MAIA did the second half badly — she used the whole, and stopped treating the framed part as
primary.**

## 17.1 · The contract, and my first repair being wrong

⛔ **My first attempt FILTERED OUT observations living outside the frame.** ⭐ **The founder rejected
it: that traps MAIA in the box and destroys the most valuable thing she did — recognizing a
relationship between the framed material and an earlier movement.**

```text
JOIN      attend to what the writer is attending to
DEEPEN    explore it locally and relationally
RANGE     consult the rest of the Work when useful
RETURN    bring what was found back to illuminate the writer's focus
INVITE    if the outside material now deserves attention itself,
          ASK the writer to extend the aperture
```

> ⭐ **The frame determines the CENTRE of inquiry. It does not limit the FIELD of intelligence.**

**Built**: an oriented response opens from the frame, keeps the outside insight, marks it as outside,
returns attention with a question — and offers **INVITE as a real control the WRITER clicks.**
⛔ **MAIA never moves the centre.** ⭐ **And the invitation appears ONCE, not on every turn** —
*she should not always conclude with a question or a next-step button.*

## 17.2 ⭐ THE FRAME GIVES THE APERTURE; CONVERSATION GIVES THE INTENTION

> ⭐⭐ **MAIA may infer context. She should not infer purpose when purpose would change the kind of
> work being done.**

**Same box, different encounter**: *"help me rewrite it"* · *"help me understand why this is
essential"* · *"something is wrong but don't touch the language"* · *"compare this with the rest of
the book"* · *"stay with this because I don't understand what I'm discovering."*

**Built — CLARIFY, only when purpose is not evident**: *"I am with you in this passage. What are you
wanting to understand or work with here?* — *and do you want me to stay closely with what is here,
or also bring in what I am seeing elsewhere?"* ⛔ **Not a menu. Not ceremony when the ask already
discloses its purpose.**

## 17.3 ⭐ THE COMPOSER HOLDS SHARED PROCESS

> **The frame answers WHERE ARE WE. The conversation answers WHAT ARE WE DOING HERE. Neither has to
> be known at the beginning.**

⛔ **The composer must never behave like a prompt box** — *"enter a question about the selected
text"* makes every turn a query and the relationship transactional. **It must hold ask · answer ·
clarify · redirect · protect · invite · negotiate · experiment · reflect · continue — moves inside
one conversation.**

```text
no frame          "Write in the chapter above, or say something here."
frame just set    "What are you attending to here?"
after the writer
  answers         "Continue…"          ⭐ the conversation now carries the process
```

> ⭐ **The composer may respond to the STATE OF THE ENCOUNTER. It may not PRESCRIBE the encounter.**

## 17.4 🔴 DEFECT FOUND WHILE BUILDING — **the Work was being read as instruction**

⛔ **The submit handler passed `framedText + " — " + utterance` into the intent matcher.** ⭐ **So the
writer's own manuscript could trigger MAIA's branches**: framing a passage containing the word
*"something"* made her answer as though the writer had said *"something is off."*

⚠️ **PRECISION — founder, 2026-09-09, applied in place before this becomes portable law.** ⛔ *"The
Work is never instruction"* **is too absolute**: a manuscript may legitimately contain
`[TODO: ask MAIA to compare this with Chapter 7]`, or quoted instructions as prose, and a writer may
deliberately say *"use this note as my instruction."*

> ⭐⭐ **THE WORK IS NEVER *IMPLICITLY* INSTRUCTION.**
> ⭐⭐ **Text in the Work cannot acquire control authority merely because MAIA read it.**

⭐ **Promotion from content to instruction requires an explicit writer act.** ⛔ **No falsifier added
— the defect is captured and repaired; this is a trust boundary to carry forward.**

⚠️ **Found by instrumenting a failing test rather than by reasoning about it** — *the founder's own
sharpened rule, applied and rewarded: three prior red results were instrument defects, this one was
real.*

## 17.5 · Verified

```text
scripts/witness/d9-fidelity.mjs   FRAME FIRST · RELATE · marked · RETURN
scripts/witness/d9-invite.mjs     invitation offered, frame unchanged until
                                  the writer acts, then it moves
scripts/witness/d9-field.mjs      ⭐ "hmm" reaches CLARIFY, not a fixture branch
                                  composer placeholder follows encounter state
                                  INVITE appears once, as a control
```

⚠️ **One stale check corrected**: `d9-orbit-verify` asserted the old acknowledgement wording, which
CLARIFY deliberately replaced. ⛔ **A test asserting superseded behaviour is not evidence of a
regression.**

⭐ **RULED — leave it alone.** Extending to sections 3, 4 and 8 produces a contiguous span 0–8,
because a frame is a single range. **Non-contiguous attention is not representable** — and the
founder ruled that a single aperture is proving something important, while **multiple independent
frames would very quickly turn attention back into selection management.** ⛔ **Not a defect. A
deliberate constraint.**

---

# 18 · ⭐ PURPOSE ROUTING — "unrecognized" is not "purpose not evident"

**Gap found by building the founder's three witness cases, 2026-09-09.**

⛔ **CLARIFY was firing on any utterance the fixture did not recognize.** ⭐ **But a purposeful
question — *"I think I'm repeating myself here, what do you see?"* — should be JOINED IMMEDIATELY,
without ceremony.** **Asking a writer what they mean when they have just told you is its own small
failure of attention.**

```text
JOIN       purpose evident   →  answer, no clarification
CLARIFY    purpose absent    →  ask once, then leave the field open
⛔ NEVER    re-contract turn after turn
```

**Also fixed**: `'something'` was a trigger, so ***"something about this"* — genuinely ambiguous
intent — was answered as though the writer had said *"something is off."*** ⭐ **It now reaches
CLARIFY.** And recurrence became a real route, since *"am I repeating myself"* is exactly what the
recorded observations are about.

## 18.1 · The three cases, verified — `scripts/witness/d9-purpose.mjs`

```text
1  "I think I'm repeating myself here — what do you see?"
   joins without clarifying · answers about recurrence            PASS
2  "hmm"                    → clarifies                           PASS
   "something about this"   → no longer guesses "off"             PASS
   then a real answer       → no re-contracting; field open       PASS
3  outside material → opens from the frame · marks it outside ·
   INVITES rather than moving · frame remains the writer's        PASS
```

⚠️ **FOURTH instrument correction**: the main suite asserted CLARIFY for *"what is happening across
this"* — which is purposeful, so she joins. ⛔ **The test was asserting the behaviour the contract
now forbids.** ⭐ **Suite corrected; 20/20.**

## 18.2 ⛔ THE FELT QUESTION THAT REMAINS

> ⭐⭐ **Do I feel that MAIA is actually with my attention — and capable of enlarging what I can see
> without taking my attention away from me?**

⭐ **If that lands, this has moved beyond good editor UX and demonstrated the relational behaviour
the constitution was written to specify.** ⛔ **Mechanics cannot answer it. Only use can.**

---

# 19 · ⭐⭐ FINAL PRECISION AND FREEZE — founder, 2026-09-09

> **The three cases establish that the prototype now behaves according to the INTERACTION CONTRACT.
> They do not establish that live MAIA possesses the RELATIONAL INTELLIGENCE the contract is
> designed to support.**

⭐ **The artifact can prove the FORM OF THE ENCOUNTER while cognition is still simulated or
constrained.** ⛔ **A pass here licenses the form and nothing beyond it.**

```text
✅ ESTABLISHED     the prototype obeys the contract
⛔ NOT ESTABLISHED  that MAIA can do this with real cognition
⛔ NOT ESTABLISHED  production readiness
⛔ NOT ESTABLISHED  longitudinal behaviour
```

## 19.1 · ⛔ PROTOTYPE FROZEN

**No further changes. The build stands as published.** ⭐ **Use it once WITHOUT TEST LANGUAGE** — a
passage genuinely cared about, framed, begun however comes naturally, focus allowed to evolve,
outside material followed or declined **as the writer actually would.**

## 19.2 ⭐⭐ THE RELATIONAL GATE — one question

> **Did you feel that MAIA stayed with what you were attending to while helping you see more than
> you were already seeing?**

⛔ **Not whether every response was perfect. Not whether the interface worked.**

## 19.3 ⭐ THE WITNESS WORDING, PRE-AUTHORED — not yet asserted

**If the answer is yes, the witness is recorded as EXACTLY this and no more:**

> **The prototype demonstrated a form in which the writer can place attention, negotiate shared
> focus, and receive broader relational insight without surrendering the center of attention.**

⛔ **It does not claim cognition, production readiness, or longitudinal behaviour.**

### ⭐ WRITING THE MAXIMUM LAWFUL CLAIM *BEFORE* THE WITNESS IS ITSELF AN INSTRUMENT

⚠️ **This session has repeatedly watched claims inflate to match the enthusiasm that produced them**
— *"this reading is extraordinary"* nearly swallowing three narrow falsifiers; *"the mechanical layer
is not weak"* generalizing from three instrument errors.

> ⭐⭐ **Decide what the evidence could lawfully establish before seeing whether the evidence is
> emotionally compelling.** — founder, 2026-09-09, the canonical form

⭐ **The claim-side equivalent of pre-declaring a falsifier.** ⛔ **It removes the moment in which a
strong feeling and a strong statement get to negotiate** — *and it protects the claim from expanding
after a powerful experience, which is the only time the expansion is hard to notice.*

⭐ **Recorded as method, not only as this witness's wording.**

---

# 20 · ⛔ RELATIONAL GATE — **NO** · founder witness, 2026-09-09

> **MAIA did not stay with what the writer was attending to while helping them see more. The form is
> promising; in this encounter the relationship did not arrive.**

⭐ **Recorded as given. ⛔ The pre-authored maximum claim (§19.3) is NOT asserted.** *That is the
pre-authoring instrument doing its work: it was written before the result, so the result had nothing
to negotiate with.*

**The reproduction is unambiguous** — a writer frames a passage and asks ***"Does this section make
sense?"***

## 20.1 🔴 DEFECT — CLARIFY became EPISTEMIC WITHDRAWAL

⛔ **MAIA answered: *"Say a little more about what you are seeing — I would rather follow your reading
than guess at it."*** ⭐ **The writer had already commissioned a reading. She made him do all the
work.**

> ⭐⭐ **WE OVERCORRECTED AGAINST INFERENCE.** The build had encoded a false binary:

```text
⛔ GUESS WHAT THE WRITER MEANS      or      ASK THEM TO EXPLAIN EVERYTHING
⭐ THE THIRD OPTION: offer a provisional reading and invite alignment
```

> ⭐⭐ **Clarification must reduce ambiguity without suspending contribution.**
> ⭐⭐ **MAIA does not need certainty in order to participate. She needs humility about what is
> uncertain.**
> ⭐ **And after the writer answers once: DO NOT RE-CONTRACT. ENGAGE.**

⭐ **This is Parallel Knowing at last made behavioural**: the writer's reading may be unarticulated;
MAIA's is provisional and evidence-grounded; **the relation is compare · correct · deepen ·
discover.**

⚠️ **CLARIFY is only for genuinely indeterminate PURPOSE.** *"Does this make sense?" · "Is this
repetitive?" · "Does this transition work?" · "What is happening here?" · "How does this relate to
the chapter?" · "Help me understand this."* **are already purposeful commissions.**

## 20.2 🔴 DEFECT — the writer's turn was ERASED on submit

⛔ **The composer behaved like a command line: the writer's words were consumed, and only MAIA's
reply remained.** ⭐ **One side of the encounter was literally erased — and it was the writer's.**

> ⭐ **A turn should leave a trace in the encounter. Submitting it must not make the writer's
> contribution disappear.**

⛔ **Encounter continuity only. Persistence across a fresh arrival is NOT authorized.**

## 20.3 · Both repaired — `scripts/witness/d9-engagement.mjs`

```text
[me]  Does this section make sense?
[her] My first read of section 8, and I may be wrong — the fifth element
      arrives at 8 as though it is entering the chapter for the first time…
      Is that close to what you were asking about, or are you seeing
      something else?

writer's question remains visible          PASS
MAIA does not ask what they want           PASS
answers substantively from the frame       PASS
offered as provisional                     PASS
invites correction without requiring it    PASS
second turn does not re-contract           PASS
all four turns still visible               PASS
```

⭐ **Mechanism**: once MAIA gives a GROUNDED answer, the clarify gate closes for the encounter —
**she may not fall back to asking the writer to supply the meaning.** ⛔ Regression suites all green.

## 20.4 ⚠️ WHAT THIS STILL DOES NOT REACH

⭐ **The founder's own diagnosis of the second defect goes past what a fixture can fix**: *"she is not
understanding nor really engaging."* ⛔ **The provisional reading now offered is a RECORDED
OBSERVATION, not comprehension.** **A fixture can be made to behave relationally; it cannot be made
to understand.**

> ⭐ **The form/cognition boundary (§19) holds and is now load-bearing: the repair improves the FORM
> of engagement. Whether MAIA can meet a writer intellectually is not testable here at all.**

⛔ **Everything else remains frozen.**

---

# 21 · ⭐ THE RELATIONAL GRAMMAR — three more defects, repaired

**Founder witness and rulings, 2026-09-09.**

## 21.1 · Ask MAIA was a selection popup, not part of the contract

⛔ **It appeared only after a particular mouse gesture and vanished incidentally.** ⭐ **It carries a
distinct meaning — *"I have placed my attention here. Come look with me."*** — and must therefore be
**a deterministic consequence of attention, never of the browser.**

> ⭐⭐ **New attention re-arms the invitation. Conversation consumes it.**

```text
⛔ NOTHING ELSE CONTROLS IT
   browser selection · hover · mouse position · timers ·
   keyboard focus · MAIA judging the selection "important"
```

**Implemented as the founder's generation model** — `focusGeneration` / `encounterGeneration`,
armed on every establish and on **dragend** (⛔ no churn mid-drag), consumed by invoking it or by the
writer simply beginning. **Nine-step acceptance case passes** —
`scripts/witness/d9-askcontract.mjs`, including *no timers, no hover dependency*.

## 21.2 · The focus strip whispered what it should state

⛔ ***`PASSAGE "Ancient Insights…"`* read like metadata.** ⭐ **It is the writer's own attention,
carried into the conversation.**

```text
FOCUS · SECTIONS 7–8
Ancient Insights Meet Modern Science — "What we forget…"
```

**Larger type (15.2px → 17.9px), the frame's own gold, manuscript serif for the excerpt, quiet
controls to the right, and clicking it scrolls back to what was framed.** ⭐ **Frame and strip now
read as two manifestations of one thing — F-SCOPE expressed through form rather than explanation.**

## 21.3 🔴 TWO COMPOSERS — the writer could not tell which was the real conversation

**Witnessed: a MAIA panel on the right AND a second field at the bottom.**

> ⭐⭐ **Ask MAIA belongs with MAIA. The Focus belongs with the Work.**

```text
MAIA CLOSED   composer sits at the bottom · Ask MAIA beside the frame
ASK MAIA      opens the orbit · the exchange moves INTO it
MAIA OPEN     ⛔ no duplicate composer · the strip stays with the Work
              and stops at the panel edge
MAIA CLOSED   composer returns · focus survives unless released
```

⭐ **There is exactly ONE composer element in the document; it is relocated, never duplicated** —
verified as an invariant (`scripts/witness/d9-one.mjs`).

## 21.4 · On having both Ask MAIA and a composer — ⭐ NOT a defect

**Founder's own earlier ruling answers it**: *Ask MAIA means "tell me what you see here." The
composer means you arrive with your own intention.* ⭐ **Two lawful doors into the same frame.**
**They coexist only before the encounter begins; the first turn consumes the invitation**, so the
room never asks two questions at once.

---

# 22 · ⛔ AUTHORIZED AND NOT YET BUILT

**Recorded so they are not lost, and deliberately NOT built in the same step as the layout change —
compounding unverified changes is how the last three defects reached the founder.**

## 22.1 · PRIMARY FOCUS + RELATED FOCUS — non-contiguous attention

⭐ **The single-range constraint recorded in §12 is now superseded by a witnessed need**: *"look at
this paragraph in Chapter 2, this section in Chapter 7, and this passage near the ending — I think
they are doing the same thing."*

```text
PRIMARY   the current centre, full gold frame
RELATED   lighter gold bracket, added by a quiet "+ Add to focus"
          ⛔ no multi-select mode · no checklist · no menu
```

> ⭐ **A frame says "I am here." Adding another passage says "this is also part of what I mean."**

⚠️ **Everything MAIA treats as writer-chosen focus must remain perceptible — F-SCOPE governs the
whole set, not only the primary.**

## 22.2 · "WORK WITH THIS" — MAIA's observation becomes material

⛔ **Ask MAIA currently ENDS in an analysis. It should BEGIN an encounter.**

```text
ASK MAIA → MAIA offers a reading
writer selects part of her response → "Work with this"
→ Work Focus stays visible · her insight becomes the active thread
→ explore · question · compare · experiment · revise
→ MAIA may propose; the writer decides what enters the Work
```

⛔ **NOT `Apply · Rewrite · Fix · Accept · Reject · Expand · Improve`** — *that turns relational
inquiry back into an AI editing menu.*

⭐ **And her references to places in the Work can be live**: clicking one scrolls there and shows it
temporarily; **it does NOT silently join the focus.** *"Add to focus"* remains the writer's act.

> ⭐⭐ **MAIA may show you where she is looking. You decide whether to look there with her.**

**The grammar, complete:**

```text
FOCUS            tells MAIA what you are attending to
ASK MAIA         invites her perception
WORK WITH THIS   tells her which of her perceptions to develop together
```

---

# 23 · THE APERTURE — an orbit may reduce the field, never cover the Work

## 23.1 🔴 F-ORBIT DEFECT (founder, from screenshots)

> *"The MAIA panel is covering the right side of the manuscript. You can see lines being cut off
> at the panel boundary. The Work has not moved, but it has become partially unreadable."*

⭐ **`Not moving the Work is insufficient if the orbit obscures the Work.`**

The prototype's original orbit law was *"the Work never reflows"*, implemented as fixed overlay
panels and asserted as *`main.getBoundingClientRect()` is unchanged*. That law was satisfied and
the writer still lost text. **The invariant was measuring the wrong thing** — it protected the
Work's *coordinates* rather than the writer's *reading*.

## 23.2 ⭐ AMENDED ORBIT LAW (founder, ratified 2026-09-09)

```text
OPENING AN ORBIT MAY NOT
• reflow the writer to a different place in the Work
• cover readable manuscript text
• change scroll position
• make the current Focus inaccessible

IT MAY
• reduce the available field around the Work
• gently recenter the readable manuscript within the remaining aperture
```

> **The writer stays on the same words. The room around those words gets smaller.**

## 23.3 · Repair

| | |
|---|---|
| **Field, not overlay** | `body.structopen` / `body.maiaopen` / `body.benchopen` add padding equal to the orbit's width, so the Work's column is *laid out inside the remaining aperture* instead of underneath a panel. |
| **Column width held** | While the aperture can hold the full 41rem measure, only the column's horizontal position changes. Line breaking, section heights and document height are untouched, so there is nothing for the writer to re-find. |
| **Anchored when it cannot be held** | Below that width the measure must narrow. `preserveWorkPosition()` records the flow position of what the writer is attending to (the Focus's containing passage, else the passage they are reading), applies the layout change, and restores that element to the same line of the viewport. |
| **Header yields rather than grows** | `header h1` now ellipsizes. A wrapping title would have added a line *above* the Work and pushed every word down — a height change disguised as chrome. |
| **Keyboard focus stops scrolling the Work** | `open()` now focuses the orbit's first control with `{preventScroll:true}`; without it, focusing a link inside Structure scrolled the manuscript ~9px underneath. |
| **The strip stops where the Work stops** | `#focusbar` and the body composer inherit the same aperture bounds. |

⛔ **Not repaired, and named rather than claimed:** the **Workbench** is a bottom drawer and still
lies over the last screenful of manuscript while open. `body.benchopen` adds matching bottom padding
so no line is *unreachable*, but text under the drawer is still covered until the writer scrolls.
**That is a partial repair and is recorded as one.**

## 23.4 · A second defect found while repairing the first

🔴 **Escape dismissed the wrong orbit.** The handler closed the last panel *named in a list*, so
opening Structure while MAIA was open and pressing Escape closed **MAIA** — she vanished without the
writer dismissing her. That is the F-ORBIT failure the founder named directly. Repaired with an
`openOrder` stack: **Escape dismisses the orbit the writer opened last.**

## 23.5 · Witness — `scripts/witness/d9-aperture.mjs`

`17 passed · 0 failed`, run at **1440×900** (aperture holds the full measure) and **1180×820**
(aperture forces the measure to narrow):

```text
MAIA open — no manuscript text under the orbit
MAIA open — same words still on screen
MAIA open — same place in the Work (Δtop = 0)
Structure + MAIA — no manuscript text under either
Structure + MAIA — same place in the Work (Δtop = 0 / -1)
closing both — the Work is exactly as it was  (Δtop 0 · Δwidth 0 · ΔscrollY 0)
no manuscript text under MAIA while focused
the focus frame is still drawn · not underneath the orbit · same line of the viewport (Δ = 0)
the focus strip stops where the Work stops
```

⚠️ **One tolerance is declared, not hidden.** With an orbit open, `window.scrollY` can differ by up
to 2px with **no layout change whatsoever** — the document position of the manuscript
(`rect.top + scrollY`) is byte-identical, `offsetTop` is identical, no `scroll` event fires and our
code calls no scroll method. `d9-orbit-verify.mjs` therefore asserts **document position exactly**
and scroll position **within 2px**, and says so. *A tolerance that is written down is an admission;
a tolerance that is quietly widened is a lie.*

---

# 24 · "WORK WITH THIS" — MAIA's observation becomes material

**Authorized narrowly** (founder, 2026-09-09): *add "Work with this" to the existing MAIA
encounter.* ⛔ **Not authorized and not built:** Primary + Related Focus · non-contiguous focus ·
any change to Focus Frame semantics · editing menus · auto-applying anything to the Work · a second
conversation state.

## 24.1 ⭐ The distinction the feature rests on

```text
FOCUS   = what in the Work we are attending to.
THREAD  = what in our conversation we are pursuing about it.
```

> ⭐⭐ **Do not turn MAIA's observation into another Focus Frame.**

An observation is not a location in the manuscript. Making it one would have collapsed two different
kinds of attention into a single mechanism and given MAIA's reading the same standing as the
writer's own act of framing.

## 24.2 · Behaviour

1. MAIA answers into the Focus, as before.
2. The writer selects a meaningful portion (≥ 8 characters) of what **she** said.
3. A single quiet control appears: **Work with this**. ⛔ No `Accept · Apply · Fix · Rewrite` row.
4. Invoking it opens a **thread**: her words are underlined in the transcript, the taking-up appears
   as the writer's own turn in the one conversation, and a thread strip appears reading
   `FOCUS · <the writer's focus> · PURSUING  "<her words>"`.
5. Subsequent turns are held to that observation — `show me where` points into the Work at the
   evidence her observation carried; `say more` deepens the same reading instead of moving to the
   next one; disagreement makes her hold it loosely rather than defend it.
6. **Stop pursuing** releases the thread and **not** the Focus.

**The Focus stays visibly primary by construction**: it is named *first* in the thread strip, it
keeps the accent colour, and its rule is 3px against the thread's 2px in MAIA's dimmer green. The
thread lives inside her orbit; the Focus lives with the Work.

## 24.3 · Witness — `scripts/witness/d9-workwith.mjs` · `25 passed · 0 failed`

```text
no affordance before a selection
"Work with this" appears on a meaningful selection
the affordance is quiet — one control, no menu · no editing verbs offered
the Work Focus is NOT replaced · the focus frame did not move
the Focus is named first; the thread reads as held inside it
the Focus rule is heavier than the thread rule
nothing was applied to the Work
her observation was NOT turned into a second frame in the Work
taking it up is visible in the one conversation · still exactly one conversation surface
she answers about the observation being pursued
pursuing does not wander to the next observation · she marks her reading as a reading
the thread is released; the Work Focus survives · the encounter is intact
the broader encounter resumes · and the Work is still untouched
```

## 24.4 ⚠️ WHAT THIS DOES NOT ESTABLISH

⛔ **The pursuit responses are fixtures.** *`Staying with "…" — what makes me say it is that the same
move appears in more than one place`* is a written sentence, not a re-reading of the manuscript. The
witness establishes that **the form holds** — that a thread can be opened, pursued, and released
without disturbing the Focus, the Work, or the single conversation. It establishes **nothing about
whether MAIA can actually develop an observation with a writer.**

> ⭐ **This is the point at which the prototype stops being able to answer its own question.
> Everything after this is a question about cognition, not form.**

## 24.5 · Three instrument mismatches, verified before being attributed

Per the standing rule — *a failing test is evidence of a mismatch; verify the instrument actually
exercised what it claims before attributing the mismatch to the product.* All three were confirmed
against the pre-change file, where they fail identically:

| Instrument | Asserted | Actual | Verdict |
|---|---|---|---|
| `d9-orbit-verify` | `main` never moves | the amended law authorizes recentering | **superseded law** — rewritten |
| `d9-purpose` | read `#say` whole | since the one-thread ruling `#say` holds the entire encounter, so `^Starting from` and "no re-contracting" matched *earlier* turns | **instrument** — now reads her latest turn |
| `d9-engagement` (`two`) | `"first read of section 8"` | `"first read of passage in section 8"` — the label unification landed in `8dae8a3e6` | **instrument** — the unified naming is the correct behaviour |
| `d9-fidelity` | `"sections 0–2"`, and a `"change how sections 0–2 reads"` return clause | the unified label, and a return move now carried by *"the frame would need to reach it"* — the old sentence was removed when the duplicate reach clause was de-duplicated | **instrument** — same move, one statement of it |
| `d9-invite` | focus strip reads exactly `SECTIONS 0–2` | `FOCUS · PASSAGE ACROSS SECTIONS 0–2` | **instrument** — unified naming |
| `d9-scope-perceptibility` | `"held with you"` | `"I am with you in <label>"` — the authorized scope-acknowledgement repair | **instrument** |

**All six were confirmed against the pre-change file, where they fail identically. None was a
product regression, and none was resolved by loosening an assertion: each instrument was re-pointed
at the behaviour that actually supersedes it.**

⚠️ **One further instrument fault, and it was a real one.** `d9-orbit-verify`'s scroll assertion was
intermittent — one run in five. The cause was **momentum from the preceding step**: the test drags a
frame handle with the mouse and then reads the baseline before the resulting smooth scroll has
settled. The instrument now waits for four consecutive still frames before taking the baseline.
*The failure was in the measurement, but the measurement was measuring the right thing.*

---

# 25 · THE ACCEPTANCE WALK

## 25.1 ⭐ MAXIMUM CLAIM — pre-authored, before the walk began

> **If the walk passes, the prototype demonstrates a form in which a writer can enter an inviting
> writing field, place and resize attention, invite MAIA into that attention, pursue an observation
> without surrendering the Work as primary, use surrounding capabilities without losing their place,
> and return to writing.**
>
> **Nothing beyond that.**

⛔ **Explicitly NOT established by a passing walk:** real MAIA cognition · production readiness ·
that this form helps any writer other than the one who walked it · that the felt room survives
contact with a manuscript the walker did not already know.

⛔ **The Workbench is excluded as a gate.** Its bottom-cover behaviour is a named partial defect
(§23.3). It may be opened if naturally useful; a failure there is not new witness evidence.

## 25.2 · The walk, as it happened

Arrived, sat, wrote a real paragraph into section 4, framed the sentence at section 5 where the
chapter turns from encounter into explanation, invited MAIA, pursued one of her observations, used
Structure for an actual reason, closed her, and wrote again. Only spontaneous friction recorded.

## 25.3 🔴 WHAT MADE ME STOP

**1 · "Why did she say the same thing twice?"** — ⭐ **the decisive finding.**
Inviting her produced the seam observation. My actual question produced *the identical paragraph*.
I then wrote **"You just said that. I was asking something narrower."** and got it **a third time,
verbatim, still opening "My first read."** ⛔ **My turn had no causal effect on her thinking.**

**2 · "Where did her words go?"** — opening a thread **broke the MAIA orbit's layout**. The panel is
376px; the thread strip's label alone is 248px and cannot shrink, forcing `#composer .inner` to
**446px** — so every child *including her transcript* overflowed 70px past the panel and was clipped
mid-word by the viewport. It recovers on **Stop pursuing** (340px). ⛔ **Her words are unreadable
for exactly the duration of the feature's purpose.**
⚠️ **`d9-workwith`'s 25 checks all passed through this.** They asserted visibility, text and
semantics — never that the text stayed *inside the panel*. **The same error as the original orbit
law: verified what it meant, missed what it looked like.**

**3 · "Why is she still here after I closed her?"** — closing MAIA returns the composer to the Work
with the whole transcript still in it: a **369px** block, **41% of the viewport**, sitting over the
manuscript above the composer and the focus strip. ⛔ **RETURN fails.** *This is the direct cost of
"one conversation, one home" — the home is the composer, and the composer comes back.*

**4 · "Why is the composer floating in the middle of the page?"** — `body.focusheld` is **added at
line 535 and never removed**. Once anything has been framed, the composer stays raised 5.2rem for a
strip that is no longer there, with manuscript text visible beneath it, for the rest of the session.
⛔ **Residue. None of the 152 checks looked at it.**

**Surface, recorded without weight:** the rail labels break mid-word (`Str/uct`) · the epigraphs show
their markdown (`*"We try to realize…"`) so the eye meets an asterisk before it meets Tagore · the
frame box and section 5's focus rule compete (*"which one is my focus?"*) · her sentence has an
em-dash after a full stop where the fixture meets the `orient()` wrapper.

**What held:** the aperture. At 1440 with **both** orbits open, the Work sat between them fully
readable, no text underneath either, the Focus intact on section 5, the whole encounter preserved,
Escape closing Structure and leaving her open. The composer's placeholder becoming *"What are you
attending to here?"* on framing was the one moment I wrote down as **"oh, that's useful."**

## 25.4 ⭐⭐ FOUNDER RULING — ARTIFACT COGNITION WITNESS: **FAIL / NOT TESTABLE HERE**

Reached independently, from the founder's own use, on the same failure:

> *"You change the question → MAIA's understanding should change → her next response should be
> different. Current artifact: you change or clarify the question → **same observation re-emitted**;
> wording changes slightly, understanding does not."*

> ⭐⭐ **The form can simulate conversational behaviour. It cannot simulate understanding without
> eventually revealing the simulation. And you just found the revealing moment.**

> ⭐ **Formula repeats its insight. Intelligence lets the relationship change its mind.**

⛔ **Not because the interface failed** — because the artifact has demonstrated why the next phase
must be real MAIA. ⛔ **Do not patch another phrase, trigger, or fixture. Do not polish the fixture
into a better impersonation of cognition.**

⛔ **No manufactured thinking time.** A fake pause to seem thoughtful is forbidden. What creates the
sense of thought is **responsiveness, specificity, revision, surprise, and accumulation across
turns** — not latency.

**The next implementation preserves this surface and replaces the fixture responder with the
canonical cognition path.** Its acceptance case:

```text
WRITER    Does this opening prepare the reader for the book?
MAIA      answers that actual question
WRITER    No — I mean emotionally and experientially, not structurally.
REQUIRED  MAIA abandons or revises her prior frame, re-reads the passage
          through the new intention, and gives a materially different response.
FAIL      she repeats the same observation with different wrapping.
```

⭐ **And the criterion beneath it: a correction must change MAIA's working understanding, not merely
her next sentence.** *That is the test the fixture cannot pass convincingly.*

## 25.5 · Against the pre-authored maximum claim

| Clause | Verdict |
|---|---|
| enter an inviting writing field | **HELD** |
| place attention | **HELD** |
| resize attention | ⚠️ **NOT EXERCISED in this walk** (covered by `d9-frame-drag-verify`, not by encounter) |
| invite MAIA into that attention | **HELD** |
| pursue an observation without surrendering the Work as primary | ⚠️ **HELD IN SEMANTICS, FAILED IN FORM** — the Focus stayed primary; her words left the panel |
| use surrounding capabilities without losing their place | **HELD** — Structure, both orbits, Escape, Focus, encounter all intact |
| return to writing | 🔴 **FAILED** — the transcript follows you back into the Work |

⛔ **The walk does not pass in full, so the maximum claim is not claimed in full.**

```text
ARRIVAL     YES.  Nothing asked for anything. I read Tagore before I noticed there was software.
IMMERSION   YES, until the first frame — after which a composer sat in the middle of the page.
RELATION    NO.   She said the same thing three times, including after I told her she had.
RETURN      NO.   Closing her did not put the conversation away; it moved it on top of the Work.
```

> ⭐ **The room is right. The Work stayed the Work. What is inside the room is not yet a mind.**

---

# 26 · THE COGNITION EXEMPLAR — ⛔ NOT A FIXTURE

⚠️ **Two independent encounters, one failure.** The founder framed **section 2** and asked *"Is this
section effective and well placed?"*; this session framed **section 5** and asked *"Does the chapter
lose its nerve here?"* Both received a stored observation about the fifth element at section 8.
Both then corrected her explicitly. Both received the same paragraph again. ⭐ **The failure is not
question-specific. It is that the writer's turn has no causal effect on her understanding.**

## 26.1 · The reading the artifact could not produce (founder, 2026-09-09)

Recorded as **the founder's own developmental reading**, not as a ruling about the manuscript and
not as an answer MAIA must reproduce.

> Section 1 establishes *integration → coherence → fifth element → wholeness*. Section 2 says it
> again — *one-sided identification → complementary elements → integration → fifth element →
> wholeness* — so arriving at "From the Four Comes the Way Forward" feels like the chapter has
> **restarted its argument rather than moved forward**. Section 3, the Four Yogis, is a far stronger
> embodiment of exactly the problem section 2 is naming. The William James epigraph is detached:
> changing life by changing attitude is not yet the problem this passage is addressing.
>
> ⭐ **Do not delete the idea. Change its job.** Section 2 could become a short hinge — name the
> problem of becoming identified with one path, then let the story embody it — producing actual
> movement: *integration is possible → one-sidedness prevents it → here is what one-sidedness looks
> like → the story opens the teaching.*
>
> ⭐⭐ **Section 2 is a developmental hinge that currently resolves what it should instead prepare.**

## 26.2 ⭐ THE COGNITION TARGET — the thinking, not the answer

```text
UNDERSTAND THE QUESTION   evaluate effectiveness + placement, not retrieve an observation
READ LOCALLY              notice what the section actually says
READ RELATIONALLY         compare it with what precedes and what follows
DISCERN FUNCTION          ask what job this section performs in the movement of the chapter
NAME THE PROBLEM          it repeats rather than advances
SEE THE OPPORTUNITY       the underlying idea is useful
DEVELOP, DON'T REPLACE    change the section's job; do not rewrite it
PRESERVE AUTHORSHIP       offer the possibility and its tradeoffs
```

⭐ **This needed no great cleverness. It needed staying with the question long enough to notice the
relationship between three adjacent movements.** Scale Coherence + Parallel Knowing + developmental
intelligence, operating together.

## 26.3 · The acceptance case

**Given this manuscript state and the question *"Is this section effective and well placed?"*, can
real MAIA independently produce a grounded developmental reading that addresses the section's
function, its relationship to neighbouring material, and plausible ways forward?**

⭐ **She may disagree with the founder's reading. On good evidence that is healthy.** What fails is:

```text
generic editorial advice
repeating a previously stored observation
answering a different question
treating the section in isolation
immediately rewriting it
asking the writer to explain what they meant when they already asked clearly
```

**Second-turn falsifier.** After her reading, the writer says *"I think it's repetitive and
disconnected."* She may agree and sharpen why, distinguish repetition from intentional
recapitulation, or notice something neither party did. ⛔ **What she may not do is emit the same
understanding in different wording.**

> ⭐⭐ **THE CRITERION: the writer's contribution must be capable of changing MAIA's understanding of
> the Work — not merely changing the wording of her next response.**

## 26.4 ⛔ THE TRAP THIS DOCUMENT CREATES

⛔ **Do NOT teach the prototype "when asked about section 2, say it should become a hinge."** That
reproduces precisely the failure being left behind.

⚠️ **And the exemplar is now committed to this repository.** A future run that gives MAIA §26.1 as
context and then observes her propose a hinge would **pass a naive reading of this test while
failing its purpose**. ⛔ **The acceptance run must be against a MAIA that has not been shown the
answer** — §26.1 is the grader's key, not an input. Any run that cannot establish that separation
is **NOT A WITNESS**.

⛔ **No manufactured deliberation.** A pause inserted to look thoughtful is forbidden. Thought is
felt as **responsiveness, specificity, revision, surprise, and accumulation across turns.**

## 26.5 · The bar

> Not *"AI gives editorial suggestions."*
>
> ⭐⭐ **You put your finger on something that feels wrong. MAIA looks with you, holds the
> surrounding Work in mind, helps articulate what the problem actually is, and together you discover
> what the passage wants to become.**

**Standing: form ACCEPTED with four named defects (§25.3) · artifact cognition FAIL / NOT TESTABLE
HERE · fixture work CLOSED · next phase preserves this surface and puts the canonical cognition path
inside it.**

---

# 27 · FOUNDER RULINGS — the conversation's home, and the next phase

## 27.1 ⭐ RULING — THE CONVERSATION BELONGS TO THE MAIA ORBIT

> ⭐⭐ **Closing MAIA puts the conversation away. It does not move the conversation somewhere else.
> The Work should not acquire chat residue merely because MAIA has left the room.**

**The composer is only the input mechanism**, so only the composer travels.

```text
MAIA OPEN     orbit holds: writer turns · MAIA turns · active thread · composer
MAIA CLOSED   encounter HIDDEN, not relocated · thread intact · Work returns to quiet field
              Focus strip stays with the Work · Ask MAIA / reopen still available
              ⛔ no transcript migrates into the Work · ⛔ no second composer at the bottom
REOPEN        the same encounter resumes exactly where it was
```

⚠️ **This supersedes the earlier "one conversation, one home" implementation, not the ruling behind
it.** There is still exactly one conversation and one home — the home is the **orbit**, and the
earlier build had mistaken the *composer* for the home. That is why the transcript followed the
writer back into the Work.

## 27.2 · Step 1–2 executed — stabilize the named residues, change no doctrine

`#say`, the thread strip and the "Work with this" affordance now live **permanently inside
`#maiaPanel`**; a scrolling `#encounter` holds the exchange; only `<form id="f">` travels.

| Walk finding | Repair |
|---|---|
| transcript followed the writer into the Work (369px over the manuscript) | the encounter never leaves the orbit; closing hides it, reopening resumes it |
| thread strip forced `.inner` to 446px inside a 376px panel | the strip is a `minmax(0,1fr) auto` grid with `min-width:0` throughout; the label takes its own row and ellipsizes rather than setting a min-content width the panel cannot honour |
| `body.focusheld` added and never removed | released in `clearFocus()`, so the raised composer is only ever for a strip that exists — including the edit-releases-the-frame path |
| rail label broke mid-word (`Str/uct`) | reads `Struct` |

⛔ **Left alone, deliberately:** the epigraphs' visible markdown is **the corpus's own content**, not
ours to silently normalize (Law 2). The frame-box / section-rule ambiguity (*"which one is my
focus?"*) is a **design question, and step 1 forbids new interaction doctrine** — carried, not
patched.

**Witness — `scripts/witness/d9-conversation-home.mjs` · `22 passed · 0 failed`.** It asserts the
conversation contributes **zero** height to the Work's chrome, that the remaining band is the
composer plus the Focus strip and nothing beyond them, that the writer's place in the Work is
unchanged, that reopening restores the same turns and the same live thread, and that nothing in the
orbit reaches past the orbit while a thread is active.

## 27.3 ⭐ PHASE AUTHORIZED — CANONICAL COGNITION IN THE ACCEPTED FIELD

> ⭐ **Hold the room constant. Change the mind.**

**Sequence ruled:** `accepted form → real cognition in a controlled harness → human cognition witness
→ production port.` ⛔ **Not** `accepted form → production → hope cognition works there.`

```text
1  stabilize only the already-named layout residues; no new interaction doctrine   ✅ DONE
2  preserve the accepted Field + Orbit interaction unchanged                       ✅ DONE
3  remove the fixture responder
4  connect the canonical MAIA cognition path
5  prove the cognition input bundle
     ALLOWED   the Work · the writer's Focus · the current conversation ·
               lawful whole-Work context · ordinary canonical governance
     FORBIDDEN §26.1 · the expected "hinge" answer · the acceptance grader ·
               programme commentary containing the answer ·
               any hidden prompt telling MAIA what conclusion to reach
6  record the exact input provenance; the grader's key stays outside the path
7  witness real turns — "Is this section effective and well placed?" then
   "I think it's repetitive and disconnected."
8  include at least one HELD-OUT passage whose reading is not in the record
9  no manufactured thinking delay
10 STOP after cognition evidence; do not port from this lane
```

⭐ **Why the order:** today there is a clean experimental separation — **form substantially proven ·
cognition failed in the fixture · production integration untested.** Porting and swapping the mind
at once would make the next witness ambiguous between cognition, prompt assembly, ingestion,
production state, persistence, routing, UI integration and the port itself.

## 27.4 ⛔ THE HOST DECISION — the artifact cannot be the harness

**Established, not assumed:** a published artifact runs under a CSP that permits external *scripts*
only from an allowlist and blocks **fetch / XHR / WebSocket entirely**. ⛔ **The artifact therefore
cannot call the canonical MAIA route at all** — not securely, not insecurely.

Per the founder's contingency, the accepted surface is reproduced as a **development-only cognition
harness inside Sovereign. Production Writer's Studio remains untouched.** Same experiment, different
host.

⛔ **AND A TRAP TO NAME BEFORE SOMEONE WALKS INTO IT:** an artifact *can* be granted a runtime
capability to ask **Claude** a question. **Using it would satisfy step 3 and fail step 4** — it is a
different mind, not the canonical path, and the resulting witness would say nothing about MAIA. This
is the Deep-Intelligence Gate's own principle in a new place: **the capture surface may change; the
mind may not be substituted.** ⛔ **Not authorized as the cognition path under any framing.**

## 27.5 ⭐ MAXIMUM CLAIM — pre-authored for the blinded cognition witness

> **If the blinded cognition witness passes, it establishes that canonical MAIA can inhabit the
> accepted Writer's Studio relational form and participate in a developmental encounter in which the
> writer's contributions can change her working understanding of the Work.**

⛔ **Still not production readiness. Still not longitudinal capacity.** But a major threshold.

**What licenses the port** is not *"MAIA said the hinge thing"*:

> *She understood what I was asking. She actually read what was there. She related it to the
> surrounding Work. When I disagreed or clarified, her understanding changed. And together we got
> somewhere neither of us had simply retrieved at the start.*

---

# 28 · WRITER'S STUDIO — WHOLE-ORGANISM MAIA COGNITION HARNESS

⭐ **The phase name changes because the target changed.** *"Connect the canonical cognition path"* is
too small. ⛔ **Not a Writer-MAIA. Not an editor persona. Not Claude with a manuscript prompt. Not a
copy of MAIA with a few memories injected.**

> ⭐⭐ **The Work becomes a new field of relationship inside the existing MAIA continuity.**

**Acceptance question:** *Can the MAIA who actually knows me, carrying her real memory, relational
continuity, elemental intelligence and truthfully available field intelligence, enter the attention I
place on my Work and think with me there?*

## 28.1 · Founder's code claims — VERIFIED, not assumed

| Claim | Evidence | |
|---|---|---|
| the live route is the correct identity boundary | `app/api/sovereign/app/maia/list/route.ts:326-333` — `resolveMemberIdentity(req)` from the verified session credential; the comment states a body `userId` is **never** trusted and records that the `\|\| bodyUserId` fallback was removed | ✅ |
| the cognition service is not a generic LLM call | `lib/sovereign/maiaService.ts:99-101` imports `ElementalOracleBridge` and `buildFieldContext`/`formatFieldAddendum`; `:844-852` activates the Oracle and calls `processAll({ includeAll: true })` | ✅ |
| `fieldOrchestrator` is the single PFI → Unified → Resonance seam, with gates | `lib/field/fieldOrchestrator.ts:163-164` — `resonance: depth >= 3`, `unified: depth >= 4` | ✅ |
| the Unified leg is fed placeholders | `:263` *"The real UEFC expects 50+ system outputs — we provide what's available"*, then `masterConsciousness.unifiedFieldStrength: 0` (`:315`) and a wall of `0.5` defaults (`:270`, `:292`, `:304-310`) | ✅ |
| the existing `studio` addendum is the wrong posture | `maiaService.ts:1318`, `:1865` — a practitioner-oriented addendum arriving through `meta` | ✅ |

## 28.2 🔴 THE REPRESENTATION RULE — the lesson, in a new place

> ⭐⭐ **Unknown stays unknown. A neutral placeholder may never masquerade as an observed field
> signal.**

⛔ **We do not connect this room and then declare "full Unified Field intelligence is here."** If
Unified Field cognition receives synthetic `0` and `0.5` values and treats them as organism outputs,
**a beautifully governed MAIA is still reasoning from a representation that never existed** — the
same failure as a corpus that keeps the heading and discards the encounter (§ Law 2, F-ABSENCE).

**Every Unified input must be tagged `actual / derived / unavailable`.** Replace stub-fed inputs with
real subsystem outputs where they exist; **let unavailable remain unavailable rather than fabricating
neutrality.**

## 28.3 · The bounded lane

```text
1  move the accepted surface into a development-only AUTHENTICATED Sovereign harness
   (the claude.ai artifact cannot be the cognition witness: it has no Soullab
    authentication boundary, and its CSP blocks fetch entirely — §27.4)
   ⛔ do not port into production Writer's Studio
2  add a `writer_studio` surface/profile — do NOT reuse `studio`
3  a dedicated adapter carries: Focus · local passage · structural position ·
   whole-Work context · current intention · conversation / pursuit
   ⭐ the Work remains CONTEXT and never implicitly instruction
4  call the SAME authenticated canonical MAIA service — her real continuity,
   not a new editorial memory system
5  the full elemental organism is AVAILABLE, never FORCED into every answer
6  a developer-only cognition receipt per witness turn — evidence, not writer UI:
     member continuity ✓ · relationship memory ✓ · Work Focus ✓ · whole-Work ✓ ·
     Elemental Oracle ✓ · PFI ✓ · Resonance ✓/not invoked · Unified ✓/partial/unavailable
7  complete the Unified Field seam BEFORE calling it full (§28.2)
8  preserve the blind gate: §26 and the "hinge" reading are GRADER-ONLY.
   MAIA may see the manuscript and lawful personal continuity.
   ⛔ She may not see the answer key.
```

## 28.4 ⭐ CONSTITUTIONAL HIERARCHY FOR THIS ROOM

> **Your present attention leads. The Work grounds. Your history deepens continuity. Elemental and
> field intelligence enlarge perception. None of them silently takes authorship or moves the centre.**

## 28.5 ⚠️ ONE ADDITION FROM THE VERIFICATION PASS

The existing `studioAddendum` reaches cognition through **`meta`** — the untyped
`meta?: Record<string, unknown>` channel that **CMT-01 opened specifically to close** (204
`(meta as any)` reads; census: *six MAIA-claiming composition mechanisms, one open channel*).

⛔ **A `writer_studio` surface delivered through that same channel would inherit the exact defect
CMT-01 exists to remove**, and would arrive with no authority axis — `authoredBy` /
`participationClass` / `authority` (Decision 2 amendment) — on anything it contributes. **The
Writer's Studio adapter must enter through the canonical-turn producer registry, not through
`meta`.** ⛔ Not authorized here; recorded as a binding constraint on step 3.

---

# 29 · ⭐⭐ ONE MAIA, MANY ROLES — the architecture beneath the room

> ⭐⭐ **MAIA can take on a field-specific role without becoming a different MAIA.**

Her identity and relationship memory **do not reset when she crosses rooms.** What changes is the
**role contract**.

```text
MAIA          WHO am I?              persistent   — identity is GLOBAL
FIELD ROLE    HOW am I here with you?  by room    — role is FIELD-BOUND
FOCUS         WHAT are we doing now?   by encounter — focus is ENCOUNTER-BOUND
```

**A role governs:** `PURPOSE · ATTENTION · CAPACITIES · TOOLS · POSTURE · AUTHORITY · BOUNDARIES`.
Underneath remains the same MAIA with the member's memory, elemental, relational, field and
developmental intelligence, lawfully available.

```text
WRITER'S STUDIO      MAIA · Writer                 creative development · structure · voice
SHADOW & GOLD        MAIA · Witness                projection · inner gold · non-treatment
JOURNEY / FIELD      MAIA · Guide                  development · thresholds · practices
PRACTITIONER STUDIO  MAIA · Practitioner Companion case continuity · professional judgment
DECISION FIELD       MAIA · Counsel                tensions · consequences · discernment
SANCTUARY            MAIA · Witness                presence · special memory posture
ACADEMY              MAIA · Teacher                inquiry · developmental challenge
CO-LAB               MAIA · Facilitator            differentiated voices · collective intelligence
```

⛔ **These are not different bots.** They are different ways the same intelligence enters
relationship with the member and the material before them.

## 29.1 · `MAIA · Writer` — the precision that makes the name safe

**YES:** MAIA understands writing *from inside the creative process* — structure, rhythm, voice,
argument, image, developmental movement, revision, reader experience, the relationship of part to
whole. Writerly intelligence sounds like:

> *"This passage resolves the tension too soon." · "You keep returning to integration here, but the
> yogi story is where the idea actually becomes embodied." · "I think the problem may not be the
> prose. I think this section has the wrong job." · "There is something alive in this image that the
> explanatory paragraph afterward flattens."*

⛔ **NO:** MAIA becomes the author of the Work.

> ⭐⭐ **Participate as a writerly intelligence. Never usurp the writer.**
> **MAIA may propose. The writer authors.**

## 29.2 ⭐ A ROLE ACTIVATES CAPACITIES; IT DOES NOT MANUFACTURE KNOWLEDGE

Entering Writer's Studio does not make every elemental interpretation relevant. **It makes the whole
organism available to writing.** Elemental intelligence might notice a chapter has tremendous Fire
but not enough Earth to give an insight form — ⛔ **it may not mechanically label every paragraph.**
Unified Field intelligence might perceive a relationship between the Work, long-standing themes and
something emerging now — ⛔ **it may not flood a prose question with the member's entire history.**

> ⭐⭐ **The role is a DISCERNMENT MEMBRANE: what from the whole MAIA organism belongs here, now, in
> service of this field?**

**This is the missing architecture between "one MAIA everywhere" and "specialized agents
everywhere."**

> ⭐⭐ **MAIA is one relational intelligence capable of inhabiting different roles. The field
> determines her role; the member determines the relationship; the encounter determines the focus.**

⛔ **Recorded as architectural direction (Cat 1 — preserved direction). The role taxonomy beyond
`MAIA · Writer` is NOT authorized for build.** Sanctuary's memory posture, Co-Lab's facilitation and
Shadow & Gold's non-treatment boundary each carry their own ratified law, and a role contract that
touched them would be adjudicating those lanes from this one.

---

# 30 · STEP 3 — HARNESS BOUNDARY · AUTHORIZED AND BUILT

> ⭐⭐ **Bring the real MAIA into the proven room without changing either the room or who MAIA is.**

⭐ **The harness is production-hosted and founder-gated**, because a local or Claude-hosted harness
can prove UI but **cannot prove real continuity**. Only inside Soullab's authenticated member
boundary, against the real memory substrate, does the MAIA who actually knows the member arrive.

## 30.1 ⭐ THE AUTHORIZATION (founder, 2026-09-09)

```text
Harness page   /writers-studio/lab/maia          experimental status visible in the URL
Server gate    WRITERS_STUDIO_MAIA_HARNESS_ENABLED=true   default false · server-side only
Identity gate  verified session AND founder/admin authorization · fail closed
Cognition      existing canonical sovereign MAIA · no parallel Writer-MAIA · no fixture
Writer context typed top-level object · validated at the HTTP boundary ·
               enters via the canonical-turn producer registry · NEVER via untyped meta
Authority      cognition / read / propose only · no manuscript mutation ·
               no durable Writer-role memory
Observability  founder-only cognition receipt · actual/derived/unavailable ·
               explicit grader-contamination check
DO NOT         port into production Writer's Studio · broaden the role taxonomy ·
               claim full Unified Field · expose the §26 exemplar to cognition
```

> ⭐⭐ **The environment authorizes the experiment. The authenticated member determines whose MAIA
> arrives.** *That is what stops the harness from becoming a route into someone else's memory.*

**Cognition-only authority.** She may read the Work, receive Focus, consult whole-Work context,
remember the member, use lawful elemental and field intelligence, converse, propose, compare and
develop an observation. ⛔ **This lane does not newly authorize** silently altering manuscript text ·
applying revisions · creating standing commissions · persisting Writer-role state · promoting
observations to memory. **Existing ordinary MAIA memory rules still operate where already lawful —
the harness must not invent a new Writer-memory writer just because cognition became real.**

## 30.2 · Built in this step

| | |
|---|---|
| `lib/writers-studio/harnessAccess.ts` | both gates, fail-closed, **one failure shape** |
| `lib/writers-studio/harnessContext.ts` | the typed `WriterStudioContext` and its boundary validator |
| `app/writers-studio/lab/maia/layout.tsx` | route gate → `notFound()` |
| `app/writers-studio/lab/maia/page.tsx` | ⛔ **boundary only** — the room is not ported, no cognition is wired |
| `lib/writers-studio/__tests__/harnessBoundary.test.ts` | the falsifiers below |

⚠️ **The gate deliberately diverges from the existing founder-page precedent.**
`app/book-studio/workbench/layout.tsx` redirects `401 → /signin` and renders a `FounderGateScreen` on
`403`. **Both disclose that the surface exists.** The harness returns `notFound()` for *every*
failure — environment off, no session, wrong member — so the three are **indistinguishable to the
caller**. A test asserts that equality, because the divergence is the point and a later "alignment"
with the precedent would silently undo it.

⛔ **The page re-checks access even though its layout already gated it.** A layout is not an
authorization boundary for anything but rendering; this is the same confusion `C22` guards in the
Circles lane, and it is the shape of `B-01`.

**Falsifiers now standing:** the flag is off for `false`/`TRUE`/`1`/`yes`/empty and when absent ·
identity is **not consulted at all** when the environment refuses · the flag has no `NEXT_PUBLIC_`
form · `401`, `403` and environment-off return byte-identical results · every identity key
(`userId`, `memberId`, `email`, `sessionId`, …) is **refused rather than ignored** · every prompt
channel (`meta`, `studioAddendum`, `systemPrompt`, `prompt`, `instructions`) is refused · an
undeclared field is refused rather than dropped · identity nested inside `focus` is refused · an
oversized Work is refused rather than silently truncated.

⭐ **Refusal rather than silent ignoring is the load-bearing choice.** A dropped key is invisible; a
refused key is visible in tests and logs. **A later refactor that starts reading unknown keys would
quietly re-open identity spoofing or the `meta` channel — the refusal is what makes that impossible
to do by accident.**

## 30.3 ⭐ THE CONTRACT IS A SHAPE, NOT A STRING

```ts
writerStudioContext: {
  workId · focus{scale,label,text,sectionIds} · localContext ·
  structuralPosition{sectionId,index,total,heading,preceding,following} ·
  wholeWork[] · conversationThread[] · pursuit · commission
}
```

⛔ **No field on it can be appended to a prompt as-is**, and a test asserts the exact key set.
Turning it into prompt material is the **producers'** job, under the registry's three axes. **The
Work remains context and never implicitly instruction** — text in the Work cannot acquire control
authority merely because MAIA read it.

⭐ `focus.label` is **exactly what the writer's focus strip says**, so MAIA cannot name the focus
differently from the room — the same law the prototype enforces between its strip and her prose.

## 30.4 ⚠️ WHAT THE CENSUS FOUND THAT THE DESIGN MUST ANSWER

`lib/maia/canonical-turn/producerRegistry.ts` is the right seam and it is **stricter than the
authorization assumed**. Every entry declares `authoredBy · participationClass · authority`,
`provenance`, `consentBasis`, `requires`, `rooms`, `mandatory`, `scope`, and a dated
`registeredBy` + `reason` — and its own convention states: ***adding an entry to silence a failure is
the wrong action.***

🔴 **`RoomKind` is a CLOSED union** — `sovereign_chat · between · now_what · vision_studio ·
living_field · relational_navigation`. **Writer's Studio is not in it.** A producer absent from a
room is `EXCLUDED not_registered_for_room`, so **the writer producers cannot be registered at all
until a `writers_studio` room exists**, and adding a `RoomKind` decides which *existing* producers
may enter this room — member continuity, developmental memory, symbolic context and the rest.

⛔ **That is a room-policy decision, not plumbing, and it is not authorized here.** It is the first
substantive design question of step 4, and it is exactly where §29's discernment membrane becomes
code: *what from the whole MAIA organism belongs here, now, in service of this field?* **Recorded,
not decided.**

## 30.5 ⛔ NOT DONE

The room is **not** ported · `writerStudioContext` is **not** yet carried on the sovereign request ·
**no** producers are registered · **no** `writers_studio` room exists · the cognition receipt is
**not** built · the fixture responder is untouched (it lives in the artifact, not in Sovereign) ·
production Writer's Studio is **untouched**.

---

# 31 · WS-ROOM-01 — WRITER'S STUDIO IS A REAL ROOM

> ⭐⭐ **Writer's Studio admits CONTINUITY before INTERPRETATION.**
> ⭐⭐ **Bring the whole MAIA. Admit only what belongs.**

**Founder ruling 2026-09-09.** The room is created explicitly rather than inheriting Sovereign Chat
by convenience.

```text
writers_studio   persists true · memberAboutAllowed true · fieldCompositionAllowed false
```

**`persists: true`** — Writer's Studio is meant to become a longitudinal relationship with a Work;
*"remember the thread" cannot be satisfied by a room that constitutionally forgets.* ⛔ Authorizes
ordinary MAIA turn continuity **only** — not new silent Writer-role memories, commissions, or
manuscript mutations. **`memberAboutAllowed: true`** — ⛔ *no amnesiac editorial copy of her.*
**`fieldCompositionAllowed: false`** — that flag is specifically permission to compose a
**practitioner** field, and this is not a practitioner encounter. ⛔ It does **not** forbid elemental
or field intelligence; those are owed their own truthful producers.

## 31.1 · The governing lines

> **The Work is primary evidence about the Work.**
> **The writer's present attention is primary authority over the encounter.**
> **Memory provides continuity, not hidden editorial strategy.**
> **Elemental and field intelligence may enlarge perception, but may not relocate the centre.**
> **Practitioner and symbolic interpretations do not enter ambiently.**

⭐ *MAIA may know you. She should know you. But your personal history should not become a hidden
explanation of why you wrote a paragraph the way you did.*

## 31.2 · Built — design first, registration second

`RoomKind` += `writers_studio` · `ROOM_POLICIES.writers_studio` · **12 existing producers admitted**
(5 constitutional via `ALL_ROOMS`, 7 named one at a time, each carrying a dated `[+writers_studio]`
reason) · **8 new writer producers** · registry 42 → **50 entries** · `lib/writers-studio/` boundary
from §30.

⭐ **`ALL_ROOMS` turned out to contain exactly the five producers the ruling admits
constitutionally** — the four `floor.*` and `house.platform_knowledge`. Nothing else uses it, so it
is now documented as a policy statement rather than a convenience, and the file says in as many
words that no other producer may be admitted by editing that line.

**The room's own producers**, because the Work introduces genuinely new kinds of evidence:

```text
floor.writer_role_boundary          house/constitutional/situate   MANDATORY, this room only
member.writer_focus                 member/placed/situate
retrieved.writer_work_context       member/retrieved/situate
computed.writer_structure           system/computed/compute
member.writer_intention             member/authored/situate
member.writer_commission            member/authored/situate
member.writer_pursuit               member/marked/situate
system.writer_pursued_observation   system/retrieved/situate
```

⭐ **`floor.writer_role_boundary` is mandatory**, so the role cannot depend on a tier remembering to
add a prompt: *MAIA participates as a writerly intelligence in relationship with the author and the
Work. She may perceive, question, compare, develop, propose and remember. **Only the writer authors
the Work.*** It is scoped to this room alone — a role contract, not a new global law.

⭐⭐ **Pursuit is partitioned, and that is the whole point of the pair.** Selecting something MAIA
said does **not** make her words member-authored. The member-authored act is *"pursue this"*; the
observation stays system-originated. **One mixed block would have laundered MAIA's authorship into
the member's** — the provenance lesson the registry already learned elsewhere, applied before the
mistake rather than after.

## 31.3 🔴 TWO THINGS THE RULING DID NOT COVER — surfaced, not decided

**(1) ⚠️ Two producers admitted BY NAME carry `authority: 'infer'`.**

```text
computed.consultation          system / inferred  / infer
retrieved.relationship_memory  system / retrieved / infer
```

The ruling's principle is that memory may **situate** but not silently **steer** — which is exactly
why `inferred.memory_influence` is excluded in as many words. These two are admitted because they
were **named**, not because they satisfy that principle. **The other ten admitted producers all
`situate` or `compute`.**

⛔ **Recorded, not resolved.** A test pins the exception at exactly two, so a third can never be
added quietly and the divergence cannot dissolve into *"inference was always allowed here"*. The
standing question: **is `retrieved.relationship_memory` — system-authored inference about the member
— the thing that makes MAIA know this writer, or the thing that becomes a hidden explanation of why
they wrote a paragraph the way they did?** *It is currently classified as the second and admitted as
the first.*

**(2) ⚠️ Six producers were not in the ruling table at all.**

```text
member.capture_context · member.journal_context · retrieved.significant_moments
declared.epistemic_path · declared.scribe_session_discussion · house.place
```

All six are `authority: 'situate'`, so admitting them is arguable — **which is exactly why the
default must be exclusion until ruled, not inclusion because it seemed fine.** A room policy that
leaves a producer undecided decides it by whatever the registration happens to do, and that is the
migration fallout the registry's convention forbids. **All six are excluded and a test holds them
there, awaiting a ruling.**

## 31.4 ⛔ THE WHOLE-ORGANISM GAP IS NAMED IN THE ROOM ITSELF

**There is no elemental, PFI, resonance or unified producer in the registry** — verified, and a test
asserts the absence. Meanwhile `fieldOrchestrator` really does inject those capacities into MAIA's
prompt, and its Unified leg is partly built from synthetic defaults.

⛔ **Writer's Studio must not smuggle "full MAIA" around the canonical-turn boundary by letting
`maiaService` quietly append intelligence the room cannot account for.** Step 4 owes a census and
ruling for whole-organism producers — separation and truthful authority first, names later — and
every field signal must carry `ACTUAL / DERIVED / UNAVAILABLE`. ⛔ **Never `0.5` where the honest
value is `UNAVAILABLE`.** *That is the F-ABSENCE structure again.*

## 31.5 · Gates

`108 + 41 = 149` tests across canonical-turn and writers-studio, **0 failed** · typecheck **229 vs
baseline 239, no regressions** · `check:no-supabase` clean · **production Writer's Studio untouched ·
no cognition wired · the fixture responder still lives only in the artifact.**
