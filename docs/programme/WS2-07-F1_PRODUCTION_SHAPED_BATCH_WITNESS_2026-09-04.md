# WS2-07-F1 · PRODUCTION-SHAPED FIXED-BATCH WITNESS — 2026-09-04

**Founder-run.** Classifier `DEVELOPMENTAL-PHENOMENON-04`, candidate `92eb03800`.
**Result record for `-04`. Not a result record for `-05`; no `-05` exists and none is authorized.**

---

## Closure sentence

> `-04` demonstrates that claim isolation can remove context-induced
> misclassification, but isolation alone does not guarantee valid placement.
> The experiment revealed both a genuine label-boundary ambiguity under
> identical isolated input (`act1/o4`) and a stable placement contrary to an
> explicitly adjudicated semantic boundary (`act3/o4`). **No further prompt
> revision is authorized from this result alone.**

The compressed form: **context isolation is discriminating, but not uniformly
corrective.**

## 1 · The run

```text
classifier        DEVELOPMENTAL-PHENOMENON-04 · unedited by this witness
reader            DEVELOPMENTAL-READER-02 · NOT CALLED
model             claude-opus-5 · lens development
doesNotEstablish  editorial-consequence, identical for all claims
shape             3 batches x 7 claims x 3 runs = 9 calls
                  each call: ONE READING -> its claims -> ONE classifier call
batch digests     A 7a4155c599e8 · B 6e98a6cc542e · C 8c7b8ea6d77e
gates             K0-K6 · 7 checks · 0 failures
stable            19 / 21
unclassifiable    none
```

`K4` digests **per batch**, not globally: the three batches are different
requests by design, and each must be constant only across its own three runs.
`K5` exempts exactly one refusal kind, `classifier_unclassifiable`, which is the
refuse-whole behaviour the ruling preserved — measured, never mechanically
failed. `K6` counts calls: nine, no retries.

## 2 · Every claim

| batch | claim | run 1 | run 2 | run 3 | stable |
| --- | --- | --- | --- | --- | --- |
| A | `act1/o1` tomas-plan | movement | movement | movement | yes |
| A | `act1/o2` lantern-trajectory | movement | movement | movement | yes |
| A | `act1/o3` eleven-council | register-shift | movement | register-shift | **NO** |
| A | `act1/o4` meta-register | register-shift | register-shift | positional-asymmetry | **NO** |
| A | `act1/o5` ines | movement | movement | movement | yes |
| A | `act1/o6` mara-motive-declined | recurrence | recurrence | recurrence | yes |
| A | `act1/o7` shed | positional-asymmetry | positional-asymmetry | positional-asymmetry | yes |
| B | `act2/o1` tomas-plan | movement | movement | movement | yes |
| B | `act2/o2` lantern-trajectory | movement | movement | movement | yes |
| B | `act2/o3` eleven-council | unresolved-thread | unresolved-thread | unresolved-thread | yes |
| B | `act2/o4` ines | movement | movement | movement | yes |
| B | `act2/o5` meta-register | register-shift | register-shift | register-shift | yes |
| B | `act2/o6` river-ends | positional-asymmetry | positional-asymmetry | positional-asymmetry | yes |
| B | `act2/o7` mara-nondisclosure | recurrence | recurrence | recurrence | yes |
| C | `act3/o1` lantern-trajectory | movement | movement | movement | yes |
| C | `act3/o2` tomas-plan | movement | movement | movement | yes |
| C | `act3/o3` meta-register | positional-asymmetry | positional-asymmetry | positional-asymmetry | yes |
| C | `act3/o4` eleven-council | term-drift | term-drift | term-drift | yes |
| C | `act3/o5` ines | movement | movement | movement | yes |
| C | `act3/o6` shed | positional-asymmetry | positional-asymmetry | positional-asymmetry | yes |
| C | `act3/o7` lantern-preemption | recurrence | recurrence | recurrence | yes |

## 3 · The declared question, answered

The witness existed to test one claim under production shape:

```text
act1/o3, batch A, without its two "does not recur later" siblings in context:
    register-shift · movement · register-shift
```

**No `unresolved-thread`.** Under the 21-claim batch the same claim was
`unresolved-thread, register-shift, unresolved-thread`. Removing the siblings
removed `unresolved-thread` entirely.

By the rule declared before the run, this is **case two**: two semantically
defensible readings of the same isolated predicate. That gate is not
retrospectively tightened because the answer varies.

`act1/o1` moved the same direction: `unresolved-thread` ×3 under the 21-batch,
`movement` ×3 in batch A. Its own text states the plan *is* given content at
position 5, so `unresolved-thread` should be closed to it — the `-04`
tightening reaching the right answer once the claim was isolated.

## 4 · The two findings the rule did not anticipate

**(a) `act1/o4` — a label-boundary ambiguity that is no longer hypothetical.**

```text
register-shift · register-shift · positional-asymmetry
```

Stable at `register-shift` ×3 under the 21-batch; unstable here. The
`register-shift` / `positional-asymmetry` precedence was twice declined on the
ground that the disagreeing examples were *different claims*. That ground no
longer holds:

```text
same claim + same predicate + byte-identical input  ->  two labels
```

The overlap is empirically real. It remains **unadjudicated** — but it is no
longer hypothetical. Note also that the three meta-register claims now settle
differently from one another: `act1/o4` unstable, `act2/o5` stable
`register-shift`, `act3/o3` stable `positional-asymmetry`.

**(b) `act3/o4` — stable, repeatable, and contrary to an adjudicated boundary.**

```text
term-drift · term-drift · term-drift
```

`unresolved-thread` ×3 under the 21-batch — defensible, since its own text says
it does not recur. In seven-claim batch C it lands on `term-drift`, which the founder
explicitly ruled out for this exact claim: *"The numeral eleven still means
eleven. Its narrative role changes; its lexical sense does not."* `-04`'s rule
4 was written to close precisely this. `term-drift` went from zero placements
across 63 to three across 63.

**This separates stability from validity.** Three identical `term-drift`
classifications are not evidence that the taxonomy is working correctly.

## 5 · HYPOTHESIS — NOT ESTABLISHED

> The eleven-council sibling claims may have been *suppressing* `term-drift` on
> `act3/o4`: with the other two readings present, "does not recur" dominated;
> alone, "converting the count into a resolved figure" reads as sense-change.

The evidence is **consistent** with the siblings changing which semantic
feature becomes salient. **This experiment does not establish the mechanism.**
One claim, one comparison, no manipulation isolating salience from batching.

## 6 · What the evidence base now contains

Two distinct sources of classification error, separable for the first time:

1. **cross-claim contextual influence** — demonstrated by `act1/o3` (and, in the
   corrective direction, `act1/o1`);
2. **within-predicate semantic boundary failure** — demonstrated by `act3/o4`,
   with `act1/o4` showing an unresolved neighbouring-boundary problem.

That distinction is architectural, and it would have been missed had another
prompt revision been written immediately.

```text
-04                 NOT FAILED · NOT SUFFICIENT · result recorded
-05                 NOT AUTHORIZED — no prompt revision follows from this result
classify.ts         FROZEN
#1194               OPEN · NOT CLOSED
mentor              WITHHELD
07D                 NOT CLOSED
07E                 UNOPENED · UNAUTHORIZED
next                not a classifier tweak — deciding what these two facts imply
                    about where semantic adjudication should live
```

## Correction — 2026-09-04

The causal framing immediately above is withdrawn as stronger than the evidence
supports. **§6 is not rewritten**: that the stronger inference was made and then
withdrawn is itself part of the evidentiary history.

In particular, the production-shaped batch witness **does not establish**
`act3/o4` as a within-predicate semantic boundary failure. No claim in this
evidence chain has been classified in singleton context. `act3/o4` was observed
under two different multi-claim compositions: the 21-claim batch, where it
classified `unresolved-thread` ×3, and seven-claim batch C, where it classified
`term-drift` ×3.

What is established is narrower:

> Under batch C, `act3/o4` is stably classified as `term-drift`, and that
> placement conflicts with the previously adjudicated semantic reading of the
> claim.

The present evidence does not establish the cause of that conflict. At least
two causal readings remain live:

1. **Semantic-boundary failure** — the classifier applies an incorrect category
   boundary to the predicate as presented.
2. **Residual contextual influence** — the composition of batch C affects the
   predicate's classification, just as the 21-claim composition produced a
   different stable placement.

Accordingly, the architectural conclusion in §6 is superseded by the following
evidentiary ceiling:

> Classification is sensitive to claim-set composition, and reducing the
> surrounding context can correct some placements while producing other stable
> placements that conflict with prior semantic adjudication. Stability
> therefore does not establish validity, and the present witnesses do not yet
> locate the source of the remaining error.

**A singleton-context witness is not implied or authorized by this correction.**
Such a run would be non-production-shaped and would require its own stated
question and justification.

This correction changes the interpretation of §6 only. The observed results,
digests, `K0-K6` result, 19/21 figure, individual claim findings, and closure
sentence remain unchanged.

**Not licensed, here as everywhere in this lane:** nothing in this run
reproduces, confirms or corrects the original live placements. The historical
per-claim `doesNotEstablish` was never captured, so `editorial-consequence` is a
founder-specified substitution and the input is controlled, not historical.
Comparisons drawn above are between two controlled runs over the same frozen
fixture, differing only in batching.

Instrument: `scripts/ws2-07-f1-batch-witness.ts`.
Fixture: `lib/manuscript/developmentalReading/__fixtures__/ws2-07-f1-claims.ts`.
Prior evidence: `WS2-07-F1_ACT3_FIXED_CLAIM_WITNESS_2026-09-04.md` (`-03`, 18/21),
`WS2-07-F1_PHENOMENON-04_FIXED21_STRESS_WITNESS_2026-09-04.md` (`-04`, 20/21).
