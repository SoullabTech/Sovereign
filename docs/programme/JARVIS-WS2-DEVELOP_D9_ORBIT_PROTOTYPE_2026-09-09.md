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

> ⭐⭐ **THE WORK IS CONTEXT. IT IS NEVER INSTRUCTION.** ⛔ **A framed passage is what we are looking
> at together — it must never be read as what the writer asked for.**

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

⚠️ **One honest limit**: extending to sections 3, 4 and 8 produces a contiguous span 0–8, because a
frame is a single range. **Non-contiguous attention is not representable.** ⛔ Recorded, not solved.
