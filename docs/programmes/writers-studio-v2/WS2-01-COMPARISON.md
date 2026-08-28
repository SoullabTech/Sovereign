# WS2-01 — Reference ↔ Implementation

`04-writing-field-wide.png` against the running WRITE field, at the capture
contract's 1680×1050 @2x. Filled in per pass, oldest at the bottom.

The question is **"does the running product clearly belong to the same designed
system as 04?"** — not "does it contain similar features."

---

## The ten dimensions

Scored every pass. Earliest divergence costs the most; work down, not around.

```text
 1  overall shell proportions
 2  manuscript dominance
 3  left-rail density
 4  MAIA placement and width
 5  Materials relationship to the work
 6  lower-field hierarchy
 7  typography scale
 8  gold restraint
 9  panel rhythm
10  whitespace / density
```

## The rule that outranks the score — D-016

A repair that moves the capture closer to 04 while weakening **manuscript
continuity · Materials ≠ Work · Versions · MAIA companionship · authorship
boundaries** is a FAIL. The divergence stays open until a repair exists that
costs none of them, or it is recorded as **accepted** with its reason.

A version of this field that looks like 04 and has lost one of those five is
further from the designed product, not closer.

## What a pass produces

```text
capture      docs/design/writer-studio/implementations/writing-field-<sha>.png
scores       the ten dimensions
divergences  the FIVE largest, named and ordered
repairs      what was changed, and what was refused under D-016
recapture    same contract, same command
```

Passes repeat until the pair reads as one product. Functional green is
necessary and never sufficient.

---

## The two runtime witnesses

The capture run produces two separate observations. They are recorded apart
because they prove different things and can fail independently.

```text
WITNESS 1   fresh browser, no session
            expected  the deliberate sign-in invitation
            not       "Something Went Wrong"
            PASS  →   ac02a22ba runtime re-witnessed

WITNESS 2   signed in, manuscript named
            expected  the WRITE field renders and captures
            PASS  →   field-capture acceptance proceeds
```

Witness 1 is not incidental to getting a screenshot. The hook-order crash was
STRUCTURALLY FIXED at `ac02a22ba` and 221 tests agree, but a test proves the
hook sits above the return — only React proves React is satisfied. A member
whose session expires mid-session takes that exact path.

**STRUCTURALLY FIXED ≠ RUNTIME RE-WITNESSED.**

## What SHA the evidence belongs to

A capture is named for HEAD, because HEAD is the tree that rendered it. That is
not the same as the change under test, and the record says both:

```text
application fix under test   ac02a22ba
capture harness              8a81c9e7a
tree that rendered           HEAD at capture time
```

The harness commits change how the field is observed, never the field. Claiming
a capture at `8a81c9e7a` proves something new about the Studio would be reading
an instrument change as a product change — the stamp-versus-code confusion of
D-015, one level down.

---

## Pass 1

```text
STATUS    awaiting the authenticated canonical capture
CAPTURE   not yet committed
UNDER TEST  ac02a22ba (shell + WRITE field, signed-out crash repair)
HARNESS     8a81c9e7a
```

Nothing is scored here until an image exists. A dimension judged from reading
the source rather than from the capture would be exactly the self-accepted
visual acceptance this unit's boundary forbids.
