# B · WRITING HIERARCHY — founder witness + source reconciliation

```text
FLOW      WRITERS-STUDIO-CANVAS-PRESENCE-01
SUBJECT   227e4e63b · UNMODIFIED · R1 deliberately not built
METHOD    perception first · source reconciliation last
STATE     RULING-READY · A ruled · C untouched · BUILD HOLD
```

> **Governing question.** Does the manuscript become the **figure** while Studio
> becomes the **ground**?
>
> **ANSWER — NO · not sufficiently.**

---

## 1 · FOUNDER WITNESS (perception, recorded first)

> *"The manuscript is the biggest thing on the screen, but it still feels like
> one component among components rather than the work for which everything else
> exists."*

```text
MANUSCRIPT DOMINATES        NO · insufficiently
SIDE RAILS COMPETE          YES
BOTTOM DOCK COMPETES        YES · strongly
ENCLOSURE                   PRESENT BUT WEAK
TYPOGRAPHY / MEASURE        ADEQUATE · not the dominant problem
STUDIO RECEDES              STATICALLY, NO
                            dynamic typing witness STILL OPEN
```

**1 · Manuscript primacy — insufficient.** The eye does not land on the manuscript
and stay. *"The work is central geometrically, but not perceptually."* Manuscript,
structure panel, left rail, MAIA panel and bottom dock read as **siblings in the
same system**.

**2 · Side rails compete.** Especially the Manuscript/Structure column beside the
writing surface — dense text, numbering, strong headings, selected rows, vertical
activity. The left rail carries significant hierarchy and contrast. MAIA is
quieter but still reads as another fully present workspace. *"The surrounding
Studio is still asking to be looked at."*

**3 · Bottom dock competes strongly.** Versions · Outline · Threads · Timeline ·
Word Web · Goals · Statistics, spanning full width. *"Almost like a second
dashboard underneath the manuscript."* Breadth and segmentation create **another
centre of gravity**.

**4 · Enclosure present but weak.** A rectangle exists but does not feel like the
place where the writing lives. ⭐ *"There is a lot of dark empty area around the
text, but that emptiness doesn't currently create contemplative space around the
work. It mostly feels unused."*

**5 · Typography and measure — adequate.** Workable reading measure, legible text,
line lengths not excessive. ⛔ **Not where the problem is; B is not to be used to
start redesigning typography.**

**6 · Dynamic recession — not witnessable statically.** Prediction only: nothing
visibly changes the status of the rails or dock when attention moves into the
manuscript. **That witness remains open.**

---

## 2 · SOURCE RECONCILIATION (measured after the perception, never before)

Every figure below is from `app/writers-studio/studioTheme.ts` at `227e4e63`,
where the values are labelled **SAMPLED** and **measured**, not inferred.

### ⭐ 2.1 · The writing field is a minority of the width

```text
COLUMN_FRACTION      rail            0.135
                     outlinePanel    0.150
                     writingField    0.352   ← the work
                     maiaPanel       0.166
                     materialsPanel  0.173
                     ────────────────────────
                     everything else 0.624
```

The manuscript is the **largest single column and a minority of the composition**.
That is the measured form of *"largest region, but one component among
components."* The founder's perception and the layout agree exactly.

### ⭐⭐ 2.2 · Writing field and chrome are tonally almost identical

```text
GROUND        hex       rgb            luma /255
deepest       #15120D   (21, 18, 13)     18.3
base          #1A1513   (26, 21, 19)     21.9
field         #1D1812   (29, 24, 18)     24.6   ← the writing plane
raised        #221B12   (34, 27, 18)     27.8   ← rails and bands
active        #342715   (52, 39, 21)     40.5   ← a SELECTED OUTLINE ROW

field → raised   Δrgb (5, 3, 0)   Δluma 3.2 of 255  ≈ 1.3%
```

⭐ **The writing plane is separated from the chrome that surrounds it by about
1.3% of luminance.** The founder reported *"the manuscript and surrounding Studio
occupy nearly the same tonal/material world."* Measured, they nearly are.

### ⭐⭐⭐ 2.3 · The brightest ground surface in the Studio is in a rail

The whole ground ramp lives between luma **18.3 and 27.8** — except `active`
(**40.5**), which is the **selected row in the outline panel**.

```text
The single highest-contrast ground surface in the Canvas is not the
manuscript. It is a selected row in the panel beside it.
```

That is a precise mechanism for finding 2. The side rails do not merely *happen*
to compete — the tonal system's widest excursion is spent on them, and the
manuscript's own plane sits 3 points above the shell it rests on.

### 2.4 · What reconciliation does NOT touch

Finding 5 stands unchallenged: `TYPE.prose` is 1.1875rem / 1.75 line-height,
deliberately above UI text. **The typography is not the problem, and the
measurements give no reason to reopen it.**

---

## 3 · THE CROSS-QUESTION FINDING — recorded, not solved

> *"The manuscript and surrounding Studio occupy nearly the same tonal/material
> world. That contributes to weak figure-ground separation."*

```text
UNDER THE LOCK
B may RECORD this finding.
B may NOT solve it by changing colour or material.
It is handed to C as evidence, not as a remedy.
```

⛔ **No parchment remedy belongs in the B ruling.** §2.2 and §2.3 quantify the
contributor and are handed to C in the same condition — as measurement, not as
justification. C still rules on its own question.

⛔ The absence of the word *Canvas* is **not** used as a B remedy. A owns that.

⭐ This is the lock's own discipline working: **a finding may span questions; a
remedy may not.**

---

## 4 · B CONCLUSION

```text
B · WRITING HIERARCHY        RULING-READY

GOVERNING QUESTION
Does the manuscript become the figure while Studio becomes the ground?

ANSWER
NO · not sufficiently

CONTRIBUTORS, in the order the evidence supports
  1  bottom dock — a second centre of gravity, full width
  2  side rails — densest activity and the brightest ground surface
  3  tonal separation ~1.3% between work and chrome   → handed to C
  4  writing field is 35.2% of the composition
  5  enclosure present but immaterial; surrounding dark reads unused
  ·  typography ADEQUATE — explicitly not a contributor
  ·  dynamic recession UNWITNESSED — open

NO CONTROLS         · NO NAMING        · NO MATERIAL RULING
A not reopened      · C not prejudged  · BUILD HOLD
```

⛔ **Owed before B can be closed:** the dynamic witness — does Studio recede while
the writer is actually typing? Finding 6 is a prediction, not an observation.

---

## 5 · OUT-OF-B FINDING — logged, untouched (2026-09-07)

⛔ **Category change named rather than solved inside B**, per the flow's
escalation rule.

```text
OUT-OF-B FINDING
possible viewport displacement on outline selection

founder report
"the screen jumps up when I select a field from Manuscript"

candidate relation
W-03 residual / StructuredOutline scrollIntoView path

status
HYPOTHESIS · not characterized
no repair authorized
```

### Category boundaries, held

```text
B OWNS                          B DOES NOT OWN
figure / ground                 viewport jumping
manuscript primacy              scrollIntoView behaviour
attentional recession           component remounting
  while writing                 outline selection mechanics
```

### ⚠️ Correction of record — the witness was wrong once already here

During B's reconciliation the witness stated that a `scrollIntoView` inside the
outline panel *"cannot displace the document"* because the panel is its own
scroll container. **That is false.** `scrollIntoView` scrolls **every** scrollable
ancestor, not only the nearest, so it can move the page even where the panel
scrolls too.

Source, `app/writers-studio/canvas/StructuredOutline.tsx:163-170`:

```text
const revealed = useRef(false);
useEffect(() => {
  if (revealed.current || !activeId) return;
  ...
  revealed.current = true;
  el.scrollIntoView({ block: 'center' });
}, [activeId, ordered]);
```

The `revealed` guard means this should fire **once**. If it fires on every
selection, the component is remounting and resetting that ref — which would make
the remount the defect, not the scroll call.

### ⛔ Guard against premature diagnosis

**Do not let the remount explanation harden into diagnosis merely because it fits
W-03.** The source gives a plausible mechanism; that is all. W-03 was closed
UNREPRODUCED precisely because a plausible mechanism is not an established one,
and the same discipline applies here. This finding needs its own
characterization, on the same terms.

## 6 · B DYNAMIC WITNESS — quiet-condition protocol

```text
1. Select the section once.
2. Let any viewport movement finish.
3. Do NOT touch the outline again.
4. Click into the manuscript.
5. Write continuously for 30–60 seconds.
6. Report only what happens to attention while writing.
```

```text
DISCRIMINATOR
no further jump while writing        → B dynamic witness USABLE
viewport moves again untouched       → STOP · witness CONTAMINATED, still owed
accidental navigation or selection   → DISCARD the attempt, do not interpret it
```
