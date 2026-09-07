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

## 3a · Experiment protocol — PRE-REGISTERED, before any result

⚠️ Recorded before the data so the design cannot be reshaped around the
outcome. Three runs, deliberately distinct. **They are not interchangeable and
their labels must not be merged in the record.**

### The validity rule that governs Pass 2

```text
PASS 2 is valid ONLY IF fresh re-entry actually restores a DEEP section.
```

If House → Writer's Studio → same Work returns at row 0, or with no `&s=`, the
run is **not** an NR / H1 / H2 result. Record it as:

```text
PASS 2     CONDITION NOT ESTABLISHED
finding    fresh re-entry did not preserve or restore the deep section
```

⭐ That is real evidence about re-entry state, and it is **not a W-03 result**.
It would also mean the walk's deep `&s=1f80f706…` arrived by a restoration path
not yet identified. **Preserve that; do not solve it inside this packet.**

### Why the condition matters

```text
WALK      entry from Studio Home  →  &s=1f80f706…   row 8    DEEP
PASS 1    entry from the House    →  &s=f9998f60…   row 0    HEAD
```

Under H2a — `scrollIntoView({block:'center'})` on the restored section — a
head-adjacent section scrolls to approximately the top and produces **no visible
displacement**. Pass 1 would read NR whether or not the mechanism is live. Pass 1
is therefore NR *under a head-section condition*, and does not clear W-03.

Second condition changed since the walk, preserved rather than pretended away:
the Work is now **declared**, and the MAIA column renders different copy. Pass 2
holds everything else in the present state, including the declaration, so that
active-section depth is isolated as far as is now possible.

`lib/writersStudio/writeStateClient.ts` carries rows and sections but **no
cursor** — no persisted active section is visible there. Yet entry produced an
`&s=` on both occasions, with different sections. The restore mechanism is
unestablished; this packet does not investigate it.

### The three runs

```text
PASS 1 · HEAD SECTION (run)
  URL HAS &s=…?          yes / no
  FIRST VIEW             top / displaced
  "This work" visible?   yes / no
  SCROLL UP RESULT       appears / does not appear / unnecessary
  AFTER ONE RELOAD       top / displaced

PASS 2 · FRESH RE-ENTRY, DEEP SECTION
  1  in the same Work, select a clearly deep section
     (ideally "Part One — The Ground", ≈ row 8, as the walk had)
  2  record its &s= value
  3  leave Writer's Studio normally, to the House
  4  re-enter from the House and open the same Work normally
     ⛔ no direct URL · no reload · no scrolling
  5  URL HAS &s=…?        yes / no
     WHICH SECTION        row / title      ← the validity field
     FIRST VIEW           top / displaced
     "This work" visible? yes / no
     SCROLL UP RESULT     appears / does not appear / unnecessary
  6  reload once
     AFTER ONE RELOAD     top / displaced

DEEP-URL RELOAD CONTROL · only if Pass 2's condition fails
  ⛔ A CONTROL, NOT A SUBSTITUTE FOR PASS 2. Reload and history behaviour is a
     different condition from a fresh House re-entry, and the two labels stay
     distinct in the record.
  1  select the deep section
  2  DEEP &s= CONFIRMED    yes / no
  3  BEFORE RELOAD VIEW    top / displaced     ← selection itself may move it
  4  reload in place
  5  AFTER RELOAD VIEW     top / displaced

  Without field 3, a displaced post-reload view could be wrongly attributed to
  reload/mount behaviour when the displacement happened at selection.

  It answers only: when the page mounts with a guaranteed deep &s=, does the
  viewport end up displaced?
```

### Comparison that would be informative

```text
PASS 1 head → top   AND   PASS 2 deep → displaced
   → H2 established as SECTION-DEPTH-CONDITIONED on this runtime and state
   → substantially strengthens the restored-section hypothesis
   ⛔ still does NOT declare scrollIntoView the cause

PASS 1 head → top   AND   PASS 2 deep → top
   → NR confirmed under current declared-Work conditions
   → W-03 not reproduced · walk evidence preserved · no repair authorized
```

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

---

# RESULTS — 2026-09-07 · runtime `e535e6246`

Protocol pre-registered at `96f416b5`, before any of this data existed.

```text
PASS 1 · HEAD SECTION
  URL HAS &s=…?          YES   f9998f60…  row 0 "Untitled section"
  FIRST VIEW             TOP
  "This work" visible?   YES
  SCROLL UP RESULT       UNNECESSARY
  AFTER ONE RELOAD       TOP   (&s= unchanged by reload)
  → NR, under a HEAD-SECTION condition. Does not clear W-03.

DEEP-URL RELOAD CONTROL   (taken early; deep &s= was in hand)
  DEEP &s= CONFIRMED     YES   1f80f706-b557-4649-b18…
  BEFORE RELOAD VIEW     TOP
  AFTER RELOAD VIEW      TOP
  → A mount carrying a guaranteed deep &s= did NOT displace the viewport.
     Evidence AGAINST H2a — bounded to this runtime and this state.

PASS 2 · FRESH RE-ENTRY, DEEP SECTION
  1  row 8 "Part One — The Ground" selected → &s=1f80f706-b557-4649-b18…
  2  left to the House, re-entered, opened the same Work
  3  URL HAS &s=…?       YES
     WHICH SECTION       row 0 "Untitled section"  ·  &s=f9998f60…
  → ⛔ PASS 2 · CONDITION NOT ESTABLISHED
     Fresh re-entry did NOT preserve or restore the deep section.
     Per the pre-registered validity rule this is NOT an NR / H1 / H2
     result. It is evidence about RE-ENTRY STATE.
```

## What the experiment establishes

```text
W-03 NOT REPRODUCED under any condition reachable today.
  head section, fresh entry     → top
  head section, reload          → top
  deep section, reload mount    → top
  deep section, fresh re-entry  → could not be created

⛔ W-03 IS NOT CLEARED. It is UNREPRODUCED, which is a different state.
   No repair is authorized. The walk evidence stands as a first observed
   outcome and is not retired by a failure to reproduce it.
```

## ⭐ The finding the experiment did not set out to make

The walk's entry from Studio Home restored **row 8** (`&s=1f80f706…`).
Today's entry restores **row 0** (`&s=f9998f60…`), even immediately after row 8
was selected and the URL carried it.

```text
RESTORATION PATH   UNIDENTIFIED
  lib/writersStudio/writeStateClient.ts carries rows and sections,
  no cursor. Something restores a section on entry; what, and from where,
  is not established.
  Reload PRESERVES &s=. Re-entry DOES NOT.
```

⛔ **Preserved, not solved inside this packet** (founder ruling). It is the most
likely place a future explanation of the walk's displaced first view lives, and
it is not this packet's object.

## Conditions that differ from the walk, recorded rather than pretended away

```text
WALK                          TODAY
Work UNDECLARED               Work DECLARED as a form of "Test"
MAIA column: "No work is      MAIA column: "Open Conversations to speak
declared…"                    with MAIA here, beside your manuscript."
Versions 1                    Versions 2 (Version 2 · Sep 7, 11:21 AM)
entry restored row 8          entry restores row 0
```

Any of these may be load-bearing. None was isolated. **H2a is not eliminated for
the walk's state — only for the states reachable today.**

## Incidental observation

With the outline panel scrolled to its end (rows 251–261), the rail and writing
pane **did not move**. The outline panel is its own scroll container. Consistent
with the control's result — a `scrollIntoView` inside that panel cannot displace
the document — but recorded as an observation, not as a mechanism finding, and
it does not close H2a.
