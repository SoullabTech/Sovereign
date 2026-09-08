# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## PHASE 1 — CHECKER EXERCISE, and why the keyed witness cannot run here

**Status** ⛔ **THE KEYED WARMTH WITNESS WAS NOT RUN.** This container has no
`ANTHROPIC_API_KEY`. `ANTHROPIC_BASE_URL` is set for this session's own routing,
which is my credential and not the product's, and using it would make the
witness a reading of the wrong subject.

**What was done instead:** the one question a model is not needed for.

---

## THE QUESTION THIS ANSWERS

The founder named the two ways Phase 1 can fail:

```text
checker rejects everything      → architecture safe, PRODUCT FAILED
                                  (the writer chose support and gets silence)
technically compliant but
emotionally dead language        → same result. safe is not sufficient
```

Both are decidable **without a model**, by running hand-written candidate
language through `checkEncouragement`. So that was run, and it found something.

## ⚠️ A REAL LEAK, IN THE MOST VULNERABLE PROHIBITION

```text
ACCEPT  declared  "That is a wonderful goal."
```

**The declaration check let approval straight through** — the prohibition the
FORM ruling singled out as *the point most vulnerable to making the writer feel
they are performing an intention for MAIA.*

The cause: the rule **enumerated phrases** — `great goal`, `good goal`,
`excellent`, `perfect` — and *wonderful* was simply not on the list.

> **Enumerating the ways to approve of something is a losing game. There is
> always another adjective.**

**Repaired by forbidding the CLASS**: on a declaration MAIA may not apply an
evaluative adjective at all. Plainness is the whole form there. A regression
test now covers *wonderful · fine · bold · brilliant · nice · inspiring*, and
the exercise is kept as
`scripts/witness/goals-encouragement-checker-exercise.ts`.

**No test found this.** Nineteen assertions passed while the leak was open,
because every one of them tested a phrase I had already thought of. **The
exercise found it by trying language I had not.**

## WHAT SURVIVES THE CHECKER — the answer to "is it too strict?"

Twelve of nineteen candidates pass, and the surviving language is not dead:

```text
DECLARE    "Held."
           "That is written down now, in your words."
           "Noted, exactly as you said it."
           "It has a place here now."

MET        "The chapter you set out to finish is finished."
           "Three thousand words on the Torus chapter, done."
           "That is the whole of what you said you would do."
           "Finished. It stands."

RELEASE    "Let go."
           "Set down, and that is yours to decide."
           "Released. The work is still yours."
           "That one is closed."
```

> **The checker is not the reason Phase 1 might fail.** Warm, plain, human
> language passes it comfortably. Whether a model *produces* language like this
> is the open question, and it is the only one left.

### One refusal worth recording as arguable

```text
refuse  met  speaks_for_the_writer  "What you wanted to write is written."
```

Defensible — *wanted* attributes a desire — but the writer did declare that
goal, so restating it is arguably not narrating their interior. **Left strict**,
because silence is lawful and a false refusal costs nothing, but flagged rather
than hidden: it is the kind of rule that should be revisited once real language
has been heard.

## WHAT THE KEYED WITNESS STILL NEEDS

```text
ANTHROPIC_API_KEY   present in the serving environment
MAIA_INFERENCE_MODE unset or an external-authorized mode
SERVED COMMIT       containing 17fe1d737 (plus this repair)
THREE MOMENTS       declare + encourage · met + encourage · release + encourage
```

Then the judgement the architecture cannot make for itself:

> Did it feel warm? Did it stay out of the way? Did completion remain the
> writer's moment? Did release feel respected rather than resisted? Did anything
> subtly recruit another turn?

## STANDING

```text
occasion seam · standing grant · silence · one-shot · FR-16 checker   PASS
checker admits warm language                                          PASS (12/19)
approval leak on declaration                                          FOUND · REPAIRED
generated warmth                                                      UNWITNESSED
product result                                                        UNKNOWN

Gates: 45 suites · 738 tests passed · typecheck no regressions · no-supabase clean
PRODUCTION untouched
```
