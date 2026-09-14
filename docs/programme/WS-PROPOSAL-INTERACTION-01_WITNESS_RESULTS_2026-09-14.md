# WS-PROPOSAL-INTERACTION-01 — RUNTIME WITNESS, RESULTS

Runtime custody **bounded to `0bd2b6578`**. Observations are the **founder's**, made at the
browser; this session recorded them and did not observe them.

## ⭐ CRITERION SHARPENED — before the remaining cells

The predeclared vocabulary (`locus` / `section-top`) is **insufficient**, and the first
observation is why: the locus was *barely visible at the bottom of the viewport* — neither
cleanly.

⛔ **Visibility is accidental. The question is what the navigation TARGETED.**

```
LOCUS-ADDRESSED     the navigation aimed at the change
SECTION-ADDRESSED   the navigation aimed at the section, and whatever
                    else is on screen is a property of the window
```

⭐ **Acceptance criterion, restated:** *`SHOW CHANGE` must navigate to the locus
**independently of viewport dimensions**.* ⛔ **NOT** "the change is somewhere visible on a
sufficiently large screen."

⚠️ **Section view is held to the identical standard.** It must not be awarded
`LOCUS-ADDRESSED` because the change happened to look well-placed at this window size. A
cell is awarded on what was aimed at, never on what was seen.

## Results

| | first asked return | second asked return | passive scroll |
|---|---|---|---|
| **Section view** | ✅ **LOCUS-ADDRESSED** | ✅ **LOCUS-ADDRESSED** | ✅ **STAYS PUT** |
| **Whole view** | ⛔ **SECTION-ADDRESSED** | ⛔ **SECTION-ADDRESSED** | ✅ **STAYS PUT** |

### Whole / first — ⛔ FAIL against the predeclared criterion

```
SHOW CHANGE returned to the opening of §23.
[, fixated] was only barely visible at the bottom of the viewport.
Its visibility varies with viewport dimensions.
The locus was not centred or revealed as the requested target.
```

⭐ **Prediction substantively CONFIRMED, one detail differed and is recorded as differing.**
Predicted: the change fully off-screen. Observed: this viewport lets its bottom edge peek
in. ⛔ **The difference does not soften the result** — the distinction was always
*requested-locus navigation* versus *section-start navigation*, and this is the second.

⚠️ **And the detail is the useful part.** It is what proved the predeclared criterion was
too weak: had the window been a little taller, the same defect would have presented as a
pass. *An acceptance criterion that a wider monitor can satisfy is not an acceptance
criterion.*

### Whole / second — ⛔ FAIL

```
SHOW CHANGE returned to the §23 region / section start.
[, fixated] sat near the BOTTOM of the manuscript pane, not centred.
Visible only because the viewport is tall enough.
```

⭐ **THE DEFECT IS REPEATABLE, NOT A ONE-TIME ARRIVAL EFFECT.** One fail is an event; two
fails on the same gesture make it a property of the path.

⚠️ **But two cells do NOT yet discriminate the CAUSE, and must not be read as though they
did.** Both candidate explanations predict exactly this pair:

```
(a) Whole view has no locus reveal wired at all
(b) a locus reveal exists but is spent by the one-shot arrival guard
```

⛔ Nothing observed so far separates them. The census reading — `revealToken` threaded to
`renderProposalWork` and not to `renderProposalEvidence`, favouring (a) — remains **the
explanation to verify after the walk, never the evidence.**

### Whole / passive — ✅ PASS

Scrolled away, pressed nothing, read normally. **Stayed put.** ⭐ The guard against
involuntary return holds. The law is broken in one direction only: the writer cannot get
back on request, but is never dragged back uninvited.

⭐ A further Whole repeat was also SECTION-ADDRESSED. Corroborating, not counted — the
frozen matrix has enough there.

### ⚠️ Section / first — NOT RECORDED. Possible measurement artefact.

Observed: `[, fixated]` brought into view but **substantially below centre**, with §23's
start **above** the viewport — neither predeclared label, and materially unlike Whole.

⭐⭐ **The code at `0bd2b6578` explains BOTH the difference and the off-centre result, and
the second explanation is a defect in the MEASUREMENT, not in the product:**

```
Section  ProposalWorkSurface:193,213   revealWithin(ref.current, 'center', 'smooth')
Whole    WholeManuscriptSurface:302    revealWithin(node, 'start')        ← default 'auto'
```

⛔ **Section's reveal is SMOOTH — an animation.** `scroller.scrollTo({behavior:'smooth'})`
takes hundreds of milliseconds, and it approaches a target below by scrolling down, so the
locus **enters from the bottom and rises toward centre**. A screenshot taken immediately
after the press catches it **mid-flight**, and mid-flight looks exactly like *"in view,
below centre."*

⭐ **Whole is instant** (`'auto'`), so its cells are NOT subject to this and stand.
⚠️ **That asymmetry is itself the tell**: only the animated path produced the ambiguous
signature.

⛔ **So Section / first is UNMEASURED, not FAILED.** Re-observe with the scroll settled —
wait ~1s after the press, then judge. Recording a FAIL here would blame the product for the
observer's shutter speed.

## ⭐ Partial causal discrimination — from behaviour, now corroborated by source

Whole/first+second could not separate *(a) no locus reveal wired in Whole* from *(b) a
reveal spent by the arrival guard*. **Section behaving differently settles it toward (a)**:
a spend-guard would suppress both views alike, and these are two different call sites with
two different targets and two different geometries.

⛔ Still not the evidence — the walk is. But the competing explanation (b) is now
behaviourally disfavoured rather than merely unlikely on a reading.

## Still owed

```
Section / first    RE-OBSERVE with the smooth scroll SETTLED (~1s after the press)
Section / second   scroll away · press again · settle · judge
Section / passive  scroll normally · leave alone · must stay put
```

⭐ **`Whole / passive` is the negative control and matters more now, not less.** Two fails
on the asked-for return say the writer cannot get back. If the passive cell also fails, the
system both refuses to return on request AND returns uninvited — the two halves of the law
broken in opposite directions.

⛔ **No repair.** The causal candidate — `revealToken` not threaded to
`renderProposalEvidence` — remains **the explanation to verify afterward, not the
evidence.** Five cells outstanding.

---

## ⭐ HOW A CELL IS READ — the viewport-independent discriminator

⛔ Without a procedure, `LOCUS-ADDRESSED` / `SECTION-ADDRESSED` is a distinction a later
reader cannot reproduce. This is the test.

**Watch where §23's opening line lands, not where the brackets land.**

```
SECTION-ADDRESSED   §23's opening line PINNED AT THE TOP of the scroller
                    → revealWithin(shell, 'start') · the section's top edge
                      is the target; everything below is what the window fits

LOCUS-ADDRESSED     [, fixated] CENTRED, §23's opening above the fold or
                    off-screen entirely
                    → 'center' on the locus node
```

⭐ **The two are distinguishable at any window size**, because one pins the *section's start
edge* and the other pins the *change's midpoint*. Resizing moves what is visible; it does
not move which edge is being held.

⛔ **"Is the change visible?" is retired as a test.** It decided the first cell wrongly and
would have passed the same defect on a taller monitor.

---

## ⭐ HOW A SECTION CELL IS READ — judge the RESTING POSITION

⛔ The edge-pinning discriminator above reads a target of `'start'`. Section's target is
`'center'`, and it is **animated**, so the test is different in kind: **not which edge is
pinned, but where the motion comes to rest.**

Procedure — all three Section cells:

```
1. press SHOW CHANGE
2. hands OFF the mouse / trackpad
3. wait until all motion has visibly stopped  (~1s is enough)
4. only then judge
```

```
LOCUS-ADDRESSED — PASS    [, fixated] settles around the CENTRE of the manuscript pane
NOT LOCUS-ADDRESSED — FAIL  the animation settles anywhere else
```

⛔ **No frame before the motion stops is evidence of anything.** An animated reveal passes
through every intermediate position on its way to the target; judging one of them measures
the observer's timing, not the product's behaviour.

⚠️ Applies to Section only. Whole is instant, has no intermediate frames, and its three
recorded cells are unaffected.


---

# WALK COMPLETE — 6/6 cells

```
Whole   / first     SECTION-ADDRESSED   FAIL
Whole   / second    SECTION-ADDRESSED   FAIL
Whole   / passive   STAYS PUT           PASS

Section / first     LOCUS-ADDRESSED     PASS   (settled)
Section / second    LOCUS-ADDRESSED     PASS   (settled)
Section / passive   STAYS PUT           PASS
```

⭐ The ambiguous Section frame was a **smooth-scroll measurement artefact**, not a product
defect. Holding it as unmeasured rather than recording a FAIL was the difference between a
true matrix and a false one.

# CAUSAL VERIFICATION — run after the walk, as ruled

Every `revealWithin` call reachable from the canvas at `0bd2b6578`:

```
ProposalWorkSurface.tsx:193    revealWithin(ref.current, 'center', 'smooth')   automatic
ProposalWorkSurface.tsx:213    revealWithin(ref.current, 'center', 'smooth')   voluntary
WholeManuscriptSurface.tsx:302 revealWithin(node, 'start')                     SECTION SHELL
StructureReview / StructuredOutline / StudioConversation                       unrelated
```

```
page.tsx:1572   renderProposalWork      → revealToken  ✅
page.tsx:1553   renderProposalEvidence  → (nothing)    ⛔

ProposalEvidenceInWork({ body, range, replacementText, onWorkWithChange })
                                        no token · no ref · no reveal
```

⭐⭐ **CONFIRMED, and stronger than the hypothesis: Whole view has NO locus reveal at all.**
The only movement available to a proposal jump there is the section-shell `'start'` scroll.

That single fact explains all six cells:

| cell | why |
|---|---|
| Whole first/second | the shell scroll is the **only** path — so section-addressed, always |
| Whole passive | nothing re-fires; the jump runs only when `jumpTo` changes |
| Section first/second | two call sites, the voluntary one keyed to `revealToken` |
| Section passive | the automatic reveal is keyed and spent |

⛔ **Hypothesis (b) is RETIRED, not merely disfavoured.** There is no spent guard in Whole
because there is no guard in Whole — there is no reveal to spend.

## ⚠️ A constraint the obvious repair would violate

`__tests__/navigationPreserved.test.ts:71` **asserts** `revealWithin(node, 'start')` on the
whole-manuscript shell. That `'start'` is a **deliberate, pinned obligation** — outline and
rail navigation ("take me to §23") legitimately wants the section's start.

⛔ **So the repair must ADD a locus reveal for the proposal case. It must NOT retarget the
existing shell reveal to `'center'`** — that would satisfy this lane by breaking outline
navigation, and `navigationPreserved` would go red for exactly the right reason.

⛔ **Not authorized here. Not implemented.** The repair belongs to the lane, in the lane's
own shape (`revealToken`, required, reaching the Whole-view renderer), with a behavioural
obligation of its own.
