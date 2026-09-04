# WS2-07-F1 · ACT 3 FIXED-CLAIM WITNESS — 2026-09-04

**Founder-run.** Classifier `DEVELOPMENTAL-PHENOMENON-03`, candidate `a4cd05e67`.
**STATE: NOT CLOSED · MENTOR VERIFICATION WITHHELD · PHENOMENON-03 NOT ACCEPTED.**

---

## 1 · What this witness was for

The 2026-09-04 live semantic witness could not attribute placement variance:
each of its three acts was a fresh reading, so the claims differed in wording
before the classifier ever saw them. The founder's Act 3 ruling fixed that by
removing the reader from the loop:

> Reuse the 21 exact claim texts already captured and classify that fixed set
> repeatedly under `-03`. That isolates the classifier — the thing we are
> changing — from reader stochasticity.

```text
lens                 development
doesNotEstablish     editorial-consequence      (the same for all 21)
model                claude-opus-5
reader               NOT CALLED
classifier           -03 only
design               3 independent acts · one classifier call each · no retry
database             none
```

**Declared limit.** The original capture recorded each claim's `text`, `refs`
and `signature` — not `doesNotEstablish`, which the reader authors per claim.
The single founder-specified value above is a substitution, not a
reconstruction. The input is therefore **controlled and synthetic, not
historical**, and no check in this witness compares a label to what
`PHENOMENON-02` produced. Nothing here may be read as reproducing, confirming
or correcting the original live placements.

## 2 · Gates — 7 checks · 0 failures

```text
J0  PASS  21 claims · 21 distinct texts · acts of origin 1,2,3
J1  PASS  CLASSIFIER_VERSION=DEVELOPMENTAL-PHENOMENON-03
J2  PASS  four rules rendered: predicate-not-subject · unresolved-thread/movement
          · movement/term-drift · recurrence-specificity
J3  PASS  family unchanged — exactly the ratified eight
J4  PASS  READER_VERSION=DEVELOPMENTAL-READER-02 (Act 3 is classifier-only)
J5  PASS  one request digest across 3 acts: 76f32da906a9024a
J6  PASS  3/3 acts classified all 21 · no refusal · no unclassifiable
```

`promptHash 672966f7bdfe21e2` · `requestDigest 76f32da906a9024a8821e5605a390d562dc5388080a81616538ae408ff645ba5`

**J5 is what makes the rest evidence.** The complete request — system prompt,
tool contract and rendered user turn — was byte-identical across all three
acts. Every difference below is the classifier alone.

## 3 · Result — 18 of 21 stable

Three claims varied:

| claim | act 1 | act 2 | act 3 |
| --- | --- | --- | --- |
| `act1/o3` eleven-council | movement | unresolved-thread | unresolved-thread |
| `act2/o4` ines | movement | recurrence | recurrence |
| `act3/o5` ines | movement | recurrence | recurrence |

Distribution by majority label across the 21: `recurrence` 6 · `movement` 5 ·
`unresolved-thread` 4 · `positional-asymmetry` 4 · `register-shift` 2 ·
`term-drift` 0 · `prospective-reference` 0 · `re-explanation-first-mention` 0.
Across all 63 placements: movement 19, recurrence 15, positional-asymmetry 12,
unresolved-thread 11, register-shift 6.

The three claims that took `recurrence` stably are precisely the three the
founder ruled potentially legitimate under the gesture clause: Mara declining
her motive twice, Mara's non-disclosure twice, the narration pre-empting the
lantern's significance twice.

### Observed pattern

All three unstable claims diverged **in act 1**, and all three diverged
**toward `movement`**.

### NOT established

**That the cause is a call-level response-set effect.** Three correlated
deviations do not distinguish that from ordinary model stochasticity. The
pattern is recorded; the cause is not claimed. An earlier framing in session
called the call "the unit of variance" — that was stronger than the evidence
and does not stand.

## 4 · Blocking findings

**(a) `act1/o3` was classified `unresolved-thread` in two of three acts,
despite the claim's own text stating the material IS taken up again.** The
fixed text says the "eleven" material is picked up at position 3, converted
into a summary phrase, and that the council material is developed "by naming
its transformation rather than by staging it." So `unresolved-thread` is not
defensible for it: its own predicate says the material was taken up.
`movement` is arguable; `register-shift` is the strongest, because the
predicate contrasts summary-phrase and naming against staging — a
manner-of-telling distinction. Two of three outputs contradict the ratified
`unresolved-thread` boundary. This is the contradiction the semantic repair
exists to catch, not to normalise.

**(b) `recurrence` / `movement` remains an unadjudicated overlap.** Both Ines
claims describe one trait and then its negation at a later appearance. The
general recurrence-specificity rule does not decide whether that is repetition
in altered form (`recurrence`) or a tracked trait changing state
(`movement`). None of the four `-03` rules adjudicates this pairing directly.

**Founder revision, recorded.** The earlier adjudication called the Ines
`recurrence` placements simply "correct." Act 3 showed that was too coarse once
the specificity rule was added; the pair needs an explicit discriminant.

## 5 · Consequence

```text
READER-02                  ACCEPTED BY THIS REPAIR
original G0–G4 regression  PASS
PHENOMENON-03 witness      VALID · 18/21 stable
PHENOMENON-03              NOT ACCEPTED
next                       bounded -04 refinement, inside Act 3 / #1194
#1194                      OPEN · NOT CLOSED
mentor line                WITHHELD
07D                        NOT CLOSED
07E                        UNOPENED · UNAUTHORIZED
```

Two further rules are authorized — a `recurrence` / `movement` discriminant and
a tightening of `unresolved-thread` — with `CLASSIFIER_VERSION` bumped to
`DEVELOPMENTAL-PHENOMENON-04` so provenance tells the truth about a materially
changed prompt. No Act 4 lane. No reader change. No family change. Nothing
about `register-shift` / `positional-asymmetry`. The rerun uses this same fixed
21, the same synthetic `editorial-consequence`, and the same three-call design.

Instrument: `scripts/ws2-07-f1-act3-fixed-claim-witness.ts`.
Fixture: `lib/manuscript/developmentalReading/__fixtures__/ws2-07-f1-claims.ts`.
