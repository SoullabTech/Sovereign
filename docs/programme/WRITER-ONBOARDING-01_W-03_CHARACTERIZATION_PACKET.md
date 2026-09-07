# W-03 · FIRST-LOAD RENDER CHARACTERIZATION

```text
LANE      JARVIS-WRITER-ONBOARDING-PRODUCTIZATION-01
OPENED    2026-09-07 · founder ruling FR-B
STATE     PACKET OPEN · execution is the founder's act
EVIDENCE  docs/programme/WRITERS_STUDIO_FOUNDER_WALK_2026-09-07.md §3a, §3b
```

## 0 · Founder rulings that opened this

```text
FR-A  RULED YES — W-08 opens a bounded MAIA cognition / truthfulness unit.
      R-2 ("MAIA should understand Writer's Studio") remains separately
      valid and MUST NOT be cited as closure evidence for W-08.

      The distinction, as ruled: MAIA knew her knowledge of the Studio was
      limited, SAID SO — which complied with the Oath — and then supplied
      nonexistent product facts anyway. The failure occurred AFTER the
      recognition. The general shape is:

          KNOWN UNCERTAINTY → pressure to be helpful → invented specificity

      Teaching her the Studio removes this hallucination's occasion. It does
      not answer the failure mode.

FR-B  RULED YES, as VERIFY → REPAIR IF CONFIRMED → REWALK.
      ⛔ FR-B does not authorize a repair on plausibility. It authorizes a
      CAUSAL TEST. W-03 is first because it is cheap and upstream — not
      because it is established as the cause of W-05.

FR-C … FR-F  DELIBERATELY NOT RULED. Help and hover explanations are not to
      be scoped while it is unknown how much of the terminal confusion
      survives a correct first render.
```

⚠️ **Correction of record.** The run docket's leverage table said W-03 "may
dissolve W-05 outright." That phrasing leaned on a causal claim the walk does
not carry. The walk establishes two facts and no link between them: the first
load omitted from view the control the writer was being told to use, and the
gate was terminal after four unaided moves. **Plausible-first is not
cause-established.**

## 1 · Object

> Determine whether the Writer's Studio first load fails to present the
> `This work` / declaration affordance that a writer needs to proceed.

## 2 · ⭐ Observation first. Mechanism only if earned.

The characterization establishes **what state the screen is in**, and nothing
about why. Three phenotypes, mutually exclusive:

```text
H1  NOT PRESENT        the control is not present on first load
H2  PRESENT · OFF-SCREEN
                       the control exists, but the initial viewport opens
                       below it

    (and the third real outcome, which is not a hypothesis)
NR  NOT REPRODUCED     the control is visible, the viewport opens at top
```

⛔ **H2 is an observation, not a cause. `PRESENT + OFF-SCREEN` does not establish
why the viewport moved.** Only once H2 is established does the mechanism
question open, and it opens with four live candidates and no favourite:

```text
H2a  StructuredOutline scrollIntoView moves the document
H2b  browser / history scroll restoration
H2c  another focus or anchor restoration
H2d  an interaction between the section parameter and layout
```

⚠️ **Second correction of record.** An earlier revision of this packet named
`StructuredOutline.tsx:169` — `el.scrollIntoView({ block: 'center' })`, called
on the section restored from the URL — as the leading mechanism for H2. Source
makes it plausible and it remains H2a. It was not entitled to lead. This
document had already ruled that plausible-first is not cause-established and
then, one section later, converted an observed scroll state into an assumed
scroll mechanism. **Observed state → assumed mechanism is the same inflation as
plausible → causal, one layer down.**

Why the distinction is load-bearing rather than pedantic: under **H1** the repair
is to render the control; under **H2** the repair depends entirely on which of
H2a–H2d holds, and three of the four are not in the outline component at all.
A repair chosen from the observation alone would be a guess with a commit behind it.

## 3 · The founder test — no developer tools required

The first discrimination needs nothing but eyes, in this order:

```text
1  enter Writer's Studio from the House, normally — no direct URL
2  open the Work. DO NOT RELOAD.
3  BEFORE scrolling: record whether the URL contains &s=…
     (not to prove the parameter caused anything — to preserve the
      condition needed to test H2a afterward)
4  look at where the page opens
5  if "This work" is not visible, SCROLL UPWARD MANUALLY — do not reload
6  if it appears, record exactly:
       "The control was already present. The page opened below it."
     → H1 FALSIFIED · H2 CONFIRMED
   if scrolling up does NOT reveal it → H1 remains live
7  now reload ONCE. Does the page return to the top?
```

If first load is displaced and reload is at top, **the phenomenon is reproduced
without any claim about its mechanism.** That is the whole of this packet's
required result.

Also worth recording at step 4, since it costs nothing and sharpens H2:

```text
[ ] does the outline start at item 0, or mid-list?
[ ] does the writing pane start at the work's head, or mid-body?
```

Under the walk's screenshots all three — rail, outline, pane — were displaced
together. Whether that holds on reproduction is evidence about scope, not cause.

Capture first, before any of the above:

```text
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

Custody: the founder walk captured no runtime SHA. This packet must.

## 4 · DO NOT

```text
⛔ change onboarding          ⛔ add Help
⛔ add hover copy             ⛔ alter navigation
⛔ repair before the observation is established
⛔ name a mechanism before H2 is confirmed
⛔ treat "control is present" as clearing W-03 — under C it is present
   and the gate is still shut
```

## 5 · What each outcome licenses

```text
H1  NOT PRESENT
    → W-03 confirmed as a presence defect. Smallest repair, then rewalk.

H2  PRESENT · OFF-SCREEN
    → phenomenon reproduced, mechanism UNKNOWN.
    → open the mechanism question across H2a–H2d. Only then a repair.
    ⛔ Nothing here licenses naming scrollIntoView.

NR  NOT REPRODUCED
    → preserve the walk evidence and investigate conditions
      (viewport, device, cold cache, which Work, whether &s= was present).
    ⛔ Do NOT design around an assumed cause. Do NOT conclude the walk was
      mistaken — it is a first observed outcome and stands as one.
```

## 6 · After any repair

```text
deploy
→ repeat Kelly's UNAIDED declaration threshold, from the House

QUESTION
   Can Kelly now pass the gate without help?

   gate passes   → much of the navigation problem here was defect-induced;
                   R-1 / R-3 scope shrinks, and shrinks honestly
   gate holds    → a genuine guidance and vocabulary problem, now isolated
                   from defect. FR-C … FR-F open with a clean subject
```

## 7 · Custody

```text
walk evidence      binds to production 2026-09-07, no SHA captured
this packet        MUST capture a SHA before reproducing
rewalk             must be unaided, from the House, on the repaired runtime
                   — a rewalk that starts at a URL proves nothing about a gate
```

## 8 · Execution

⛔ **This session cannot execute this packet.** No route to production: no `ssh`
binary in the container, `soullab.life` returns `000` through the proxy. The
walk and the rewalk are the founder's acts. This document is the instrument.

```text
NO OTHER PRODUCTIZATION UNTIL THE QUESTION IN §5 HAS AN ANSWER.
```
