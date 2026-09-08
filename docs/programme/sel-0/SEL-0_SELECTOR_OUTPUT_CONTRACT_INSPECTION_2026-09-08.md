# SEL-0 — static selector-output-contract inspection · 2026-09-08

**Act**: bounded, static, DESIGN-ONLY. Read code only.
**Not done**: no provider call · no selector invocation · no ranking · Manifest B, Manifest C
and the source snapshot not opened.

**Question**: what output form, if any, does the deployed production path produce for
choosing among multiple lawful developmental observations?

---

## Finding — determinate, not ambiguous

```text
total ranking                     ABSENT
scores                            ABSENT
partial ordering                  ABSENT
top-k selection                   ABSENT
pairwise choice                   ABSENT
single item chosen by the system  ABSENT

NO COMPARATIVE-SELECTION OUTPUT EXISTS IN THE DEPLOYED PATH
```

The single observation in play is chosen by **the member**, who supplies
`observationKey` in the request anchor. The system resolves that key; it does not choose.

## Evidence

```text
lib/manuscript/ask/developmentalAnchor.ts:54   selectObservation =
    reading.observations.find(o => o.key === observationKey) ?? null
    doc: "The addressed observation, or null. Never a nearest match —
          there is no such thing."

lib/manuscript/ask/developmentalAnchor.ts:47   checkObservationAnchor =
    existence check by key only (.some)

app/api/sovereign/manuscripts/[id]/ask/route.ts
    parseAnyAnchor REQUIRES readingId + observationKey from the request;
    the member names the observation

lib/writersStudio/developPresentation.ts:286   readingView =
    "Observation order is the reading's own (o1 … oN); nothing is sorted,
     ranked or filtered — a superseded observation stays exactly where it
     was, marked (product rule, 07D opening)."

lib/writersStudio/developPresentation.ts:313   reading.observations.map(...)
    maps ALL observations; no selection, no limit

repo-wide  no sort / slice / filter / rank / score over reading.observations
           anywhere in lib/manuscript/ or lib/writersStudio/ non-test source
```

The absence is **deliberate and documented in code in two places**, not an oversight.

## ⚠️ One precision, so the redesign does not overread this

`"Never a nearest match — there is no such thing"` refuses **fuzzy anchor resolution** —
when a member names an observation, the system must not substitute a similar one. That is
not a ruling that MAIA may never order observations. The gap is a **build gap, not a
constitutional prohibition**. Do not carry this forward as "selection is forbidden."

## Consequence under the Productization obligation

**Product gap.** Writer's Studio does not presently possess the developmental-selection
capability the product direction requires — *MAIA can decide which available observation
is most useful to raise now, not merely retrieve one by key.* Recorded as a gap; not
closed, not worked around.

## Consequence for SEL-0

§4 ruled *MAIA ranks natively*, from *the native information the production selector
ordinarily has*. **There is no production selector.** Manifest C therefore froze a native
surface for a selector that does not exist.

Any MAIA ranking produced now would be a **newly designed evaluator**, not the selector as
deployed. Those are different experiments, and the difference is invisible in the result.
**That requires a founder ruling before any measurement.**

SEL-0 is now blocked by two independent facts:

```text
1  lawful N = 19 < floor 40        top-k instrument discharged
2  no deployed selector             "selector as deployed" has no referent
```

The second is not fixed by redesigning the statistic. A redesigned measure would still
have nothing deployed to measure.

## STOP

Returned before designing the statistical instrument, as required. R1/R2/R3, response-format
symmetry, ties, weighting, null and thresholds remain unsettled and unopened.
