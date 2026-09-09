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
