# COUNCIL-CONFIDENCE-01 — Displayed confidence was a framing count

**Date:** 2026-09-08
**Status:** Immediate repair IMPLEMENTED. Follow-on discovery RECORDED, NOT AUTHORIZED.
**Occasion:** Beta tester **Andrea Fagan**, in the decision portal: *"I thought that was the case
because they gave themselves a low confidence mark. They also gave incredible gold, with the
limited information I provided."*
**Founder ruling:** remove the percentage; retain the truthful perspective count; do not
substitute `emergenceRating`; do not invent a score.

---

## The law Andrea surfaced

> **A system must not display a measure under an epistemic name unless the measure actually
> evaluates epistemic footing.**

The Council may be uncertain. The Council may be well-grounded. The number shown to a member has
to know the difference before it gets to call itself confidence.

Related to but distinct from Epistemic Scope Transparency (pending seal): that instrument governs
**what the system may retrieve**; this defect concerns **what the system displays about its own
judgment**. Nearest existing law: **Invariant 5 — Uncertainty Honesty**, and **Invariant 11 —
Declared Significance**.

---

## Finding 1 — displayed "confidence" never evaluated anything (REPAIRED)

`lib/ain/consultation.ts:431`:

```ts
confidence: framings.length >= 3 ? 0.8 : 0.6,
```

Two possible values. It never reads the member's input, the evidence bundle, the divergence
between framings, or the synthesis. It counts participating framings.

Surfaces rendered it beside the count it was derived from:

```
3 perspectives · 80% confidence
```

— the same fact stated twice, the second time under a name that means something else.

**Member harm, observed not hypothesized.** Andrea read the mark as the Council assessing its own
footing given limited input, and drew a specific inference about its self-knowledge. The failure
runs in the *flattering* direction: it made the system appear more epistemically careful than it
is. That is the inversion Invariant 5 exists to prevent.

**Aggravating fact:** a real confidence assessment *is* generated and then discarded.
`lib/ain/synthesis/dialectical.md` § "Confidence Handling" instructs a three-level assessment
(High / Medium / Low) grounded in evidence specificity, framing divergence, and reliance on
inference, with an explicit rule that **missing data lowers confidence by one step**. That
assessment shapes the prose. It is never parsed into `ConsultationResult`. So the system produced
a genuine epistemic signal, dropped it, and displayed a framing count under its name.

### Repair (this act)

Percentage removed from all three council display surfaces; perspective count retained:

- `components/maia/decisions/DecisionCouncilView.tsx` — member decision sheet
- `app/studio/decisions/[id]/page.tsx` — practitioner decision detail
- `components/studio/changes/ChangeCouncilResult.tsx` — change council result

The stored `confidence` field is untouched — this is a display repair. Each site carries a comment
naming the lane and forbidding `emergenceRating` substitution, so the seam cannot be silently
re-filled.

### Acceptance (verified by grep on the committed tree)

```
3 framings  → surface says "3 perspectives"      · does NOT say "80% confidence"   PASS
2 framings  → surface says "2 perspectives"      · does NOT say "60% confidence"   PASS
negative    → emergenceRating NOT substituted into the confidence location         PASS
```

No council surface renders a confidence percentage. Unrelated `confidence` displays elsewhere in
the app (speech-to-text segments, translation, pattern links) were **not** examined or altered by
this lane and are not claimed compliant.

---

## Finding 2 — `emergenceRating` parser is unsound (RECORDED, NOT REPAIRED)

`lib/ain/consultation.ts:320-325`:

```ts
let emergenceRating: EmergenceRating = 'recombination';
if (text.includes('⭐⭐⭐') || text.toLowerCase().includes('breakthrough')) {
  emergenceRating = 'breakthrough';
} else if (text.includes('⭐⭐') || text.toLowerCase().includes('synthesis')) {
  emergenceRating = 'synthesis';
}
```

It substring-matches the whole synthesis text, including the output template the prompt requires:

- `dialectical.md:118` mandates a `### Synthesis` section header — so **every well-formed response
  contains "synthesis"**.
- `dialectical.md:126` is `[Rating: Recombination | Synthesis | Breakthrough]` — so a response that
  echoes or quotes the option line **contains "breakthrough"**, and the first branch wins.

Consequences: `synthesis` is the floor for any well-formed response, `breakthrough` fires on an
echoed template line rather than on a judgment, and **`recombination` is effectively unreachable
except through the catch-block fallback at line 341** — where it also marks *synthesis failure*.
The same value therefore means both "lowest novelty" and "generation failed".

This is why `emergenceRating` was rejected as a confidence replacement: it is a different
question (novelty of synthesis, not groundedness of reading) *and* it is currently wrong.

**Not repaired here.** Recorded for a follow-on decision.

---

## Follow-on, not authorized by this repair

1. Repair the `emergenceRating` parser (structured extraction of the Rating line, not substring
   matching over the whole text; disambiguate the failure fallback from the lowest rating).
2. Decide whether the real High / Medium / Low epistemic footing already produced by
   `dialectical.md` should become structured output.

If (2) is later taken, the founder's ruling on its shape is recorded now:

> **Levels, not percentages.** *"Confidence in this reading: Low / Medium / High"* — a percentage
> implies calibration ("when we say 80%, comparable judgments are right about 80% of the time"),
> and no evidence for that exists.
>
> **And a reason is required:**
> ```
> Confidence in this reading: Low
> Why: The Council had only your initial description and no confirming
>      observations about the other person's response.
> ```
> *Uncertainty honesty rather than uncertainty decoration.*

---

## Explicitly not done

- `emergenceRating` **not** substituted into the confidence location
- no new confidence score invented
- `ConsultationResult.confidence` field unchanged (display repair only)
- Council retrieval, scope, evidence bundle, and synthesis prompt untouched
- no schema change, no migration
- Epistemic Scope Transparency **not** sealed; no cross-surface census opened
- Council scope-declaration work still held; no PR, no merge, no deploy

---

## Andrea

Both halves of her message were true observations. The confidence mark was misleading and is now
gone. The quality she noticed was real, and was never explained by that number in either
direction — the framings work on the structure of a situation, not the volume of input.

*A beta tester asking why a number looked the way it did found a signal the system had been
displaying under the wrong name since it was written.*
