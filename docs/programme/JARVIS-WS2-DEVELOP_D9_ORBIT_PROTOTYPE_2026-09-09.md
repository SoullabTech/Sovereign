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
