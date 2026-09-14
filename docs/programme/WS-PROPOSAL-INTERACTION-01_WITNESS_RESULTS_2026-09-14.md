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
| **Section view** | — | — | — |
| **Whole view** | ⛔ **SECTION-ADDRESSED** | ⛔ **SECTION-ADDRESSED** | — |

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

## Still owed

```
Whole  / passive   scroll normally · leave alone · must stay put
Section / first · second · passive
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
