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

### What Witness 1 has to observe (founder, 2026-08-28)

Not "the harness stopped because it was signed out". The whole chain:

```text
fresh browser
  → WriterCanvas reaches its unauthorized state
  → the intended sign-in invitation renders
  → no React error boundary
```

A generic stop before rendering witnesses nothing.

The harness could not produce that, and its gap ran the wrong way. It asked one
boolean — is the invitation copy present? On a crash that copy is absent, the
boolean read false, and the run walked past the error boundary, verified the
viewport, and photographed `app/error.tsx` under a `[capture:ok]` line. Pass 1
would then have scored ten dimensions against a picture of the crash.

So the harness now classifies what rendered — `crash` · `signed-out` · `field` —
reports the first load as `[witness-1] PASS/FAIL/n/a` before the headful sign-in
pause, and refuses a `crash` outright rather than capturing it. Pinned by
`app/writers-studio/__tests__/captureWitness.test.ts`.

This changes how the field is OBSERVED, never the field. No component, route or
substrate file is touched, so `ac02a22ba` remains the code under test.

### Witness 1 — PASS, 2026-08-28

Observed in the remote container, on tree `de33c3638` (application code
`ac02a22ba`, unchanged since):

```text
[capture] app is up.
[capture] http://localhost:3000/writers-studio/canvas?m=dca75052-… at 1680×1050@2x
[witness-1] PASS  unauthorized -> sign-in invitation rendered, no error boundary
[capture] The Studio is showing its signed-out panel — … Refusing.
EXIT=1
```

Fresh browser, no session, no database, no env file. The room reached its
unauthorized state, rendered the invitation, and did not throw to the error
boundary. No PNG was deposited.

**`ac02a22ba` is RUNTIME RE-WITNESSED.**

Why this leg did not need the founder's machine, when the field capture does:
`/api/sovereign/manuscripts` returns 401 from `getMemberIdFromRequest` before it
queries Postgres, so the unauthorized path is reachable with a browser and
nothing else. The two witnesses have opposite requirements — one needs no
session, the other needs a real one — and the harness header had collapsed them
into a single "cannot run here". Corrected in place.

Two qualifications, so this is not read as more than it is. It ran under
`npm run dev`, not a production build; acceptable for this defect class, because
React counts hooks per render in both modes and a hook below the early return
throws in either. And it witnesses the unauthorized path only. Witness 2 — the
field PNG — is unchanged and still yours.

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
