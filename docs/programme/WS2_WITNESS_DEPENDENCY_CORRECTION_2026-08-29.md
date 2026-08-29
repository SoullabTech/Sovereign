# WS2 — witness dependency correction

**Founder ruling, 2026-08-29.** Docs-only. Records a sequencing correction
revealed by reading the actual runtime. Not a new architectural principle, and
not a waiver of visual acceptance.

> ⚠ **This file is on the build-flow candidate branch, not the governing lane.**
> Per **D-020** a Writer's Studio document that exists on another branch and not
> on `claude/writers-studio-organization-wxpb7q` is **not governing**. This is
> therefore a *candidate* amendment: it records the ruling accurately, and it
> becomes governing only when it lands on that lane.

## The circularity

```text
WS2-02          intentionally unrouted — no route consumes the primitives
§0.2 capture    photographs real Writer's Studio routes
                (writing-field → /writers-studio/canvas)
therefore       WS2-02 cannot receive authenticated visual witness
                until a shell projects it into a real route
```

Verified at `adac2079716a09e60a9a1d43ccf3a68e8c988285`: no route consumes
`studioTheme` or the `studio/` primitives. `/writers-studio` renders `HomeView`,
which imports only `CANVAS_HREF`. The accepted composition is reachable only
from `__fixtures__`, by design.

A capture of that tree would be a valid photograph of the running application
and a valid non-regression check. It could not adjudicate the WS2-02 visual
system, because the running application does not render it.

## The ruling

```text
WS2-02      IMPLEMENTATION COMPLETE
            WITNESS DEFERRED — deferred, not waived

WS2-03A     minimal shell projection seam
            exists to make the witness possible
            gates immediately into the WS2-02 visual witness

WS2-03B     HELD until that witness returns
```

**Not accepted from the fixture alone.** The fixture proved that the visual
vocabulary composes coherently, that the measured geometry works, that the
reference hierarchy can be reproduced, and that unbuilt capability can stay
inert. It proved none of: that real data survives the composition, that the
actual Canvas fits inside it, that runtime states behave, or that the
authenticated member experience matches 04. *Artifact-before-assertion is not
artifact-instead-of-witness.*

**No special capture route.** A route built to make a screenshot possible would
visually accept a path no member will ever use, and the same design would still
have to face the real shell afterwards. WS2-03 is the unit whose job is to make
the composition real, so it is the unit that earns the witness.

## Instrument provenance — an open item

`scripts/capture-studio-field.mjs` is on the governing lane and **absent from
the candidate tree**. The instrument reads the HEAD of the checkout it runs from
and names its output after that observed tree, so running the governing-lane
copy against a different candidate would make its provenance name the wrong
tree.

Cherry-picking it into the candidate was examined and is **not clean**: sixteen
commits touch the script, and several carry programme-doc ancestry
(`DECISIONS.md`, `WS2-01-COMPARISON.md`, `reference/README.md`). Per the ruling
— stop rather than hand-copy into a dirty tree to obtain a screenshot — this is
left open rather than forced.

The remaining path that keeps both D-020 and instrument provenance intact is to
bring the WS2-03A candidate onto the governing lane and capture from there, so
instrument and runtime share one HEAD. That is a lane decision, not an
implementation one.
