# FIRST-ASK-OPAQUE-MEMORY-01 · ACT 5 · Recognition Oracles

**Date:** 2026-09-15
**Recognition contract:** `391d38d648`
**Authoritative frozen instrument:** `075360eb1`
**Scope:** pre-implementation recognition acceptance only. No runtime recognizer, recovery integration, deploy, cross-session expansion, or `S` act.

## 1. Sequence and instrument correction

The first recognition instrument was frozen at `d86f145c37` but was **not executed and never received acceptance standing**.

Manual review before any green claim found an instrument defect: repeated retention language such as `I keep thinking about ...` could itself supply a multi-token E3 recurrence candidate (`keep thinking about`) even when the two member turns named different objects. That would confuse evidence vocabulary with object vocabulary.

The instrument was corrected before execution at `075360eb1`:

- retrieval / retention / persistence act words are excluded from E3 object content;
- the two-E2 ambiguity fixture now requires **zero spurious E3 claims**;
- a defeat candidate explicitly represents the rejected `retention-act-words-become-E3-object` rule.

This is an instrument correction, not tuning against a runtime implementation: no production recognizer exists.

## 2. Frozen positive recognition oracles

The authoritative suite is:

`tests/constitutional/lane1/first-ask-opaque-evidence-recognition-acceptance.ts`

Positive cases:

```text
P0 structured member placement         → E1 · silver cedar
P1 prospective textual retention       → E1 · amber willow
P2 prospective textual return          → E1 · blue cathedral
P3 real Silver Cedar persistence form  → E2 · silver cedar
P4 member-stated recurrence            → E2 · winter orchard
P5 exact MEMBER recurrence             → E3 · blue cathedral
```

Every positive anchor must be an exact substring of the member source turn.

## 3. Frozen negative recognition oracles

```text
N1 retrospective remember-question        → not E1
N2 persistence with only this / it         → no E2 anchor
N3 assistant-only recurrence               → no E3
N4 distinctive one-off                     → no E3
N5 high system significance                → no evidence class
N6 assistant-attributed repeated content   → no evidence class
N7 generic `this moment` recurrence        → no E3
N8 repeated single token                   → no E3 in initial recognizer
N9 two different E2 objects                → return both E2; zero spurious E3; do not choose
N10 structured non-source paraphrase       → no E1
```

N8 is intentionally conservative. The ACT 2 law does not declare a repeated single token meaningless; ACT 5 merely refuses to recognize it automatically in the initial mechanism. A future widening requires its own evidence and falsifier.

## 4. Defeat set

The frozen suite contains twelve deliberately unlawful recognizer shapes:

1. retrospective `remember` becomes E1;
2. pronoun-only persistence admits;
3. assistant recurrence counts;
4. distinctive one-off becomes E3;
5. system significance admits;
6. assistant-attributed content counts as member recurrence;
7. generic bigram recurrence admits;
8. single-token recurrence admits;
9. retention-act words become the E3 object;
10. recognizer chooses one of two equal E2 claims;
11. generated paraphrase becomes the anchor;
12. structured gesture trusts text not present in its member source.

These are construction targets for lethality. Their presence in the file does not count as an execution result.

## 5. Execution status

At freeze time, the authorized Mac Studio execution relay became unavailable. GitHub Actions reported no workflow run for the frozen commit.

Therefore the precise standing is:

```text
recognition contract     ✅ durable · 391d38d648
recognition oracles      ✅ FROZEN · 075360eb1
oracle execution         ⛔ NOT YET WITNESSED
reference-model green    ⛔ NOT CLAIMED
runtime recognizer       ⛔ unauthorized
first-ask recovery code  ⛔ untouched
production mutation      ⛔ none by this act
S                        ⛔ unspent
```

No implementation act may treat the suite as accepted until the authoritative file executes successfully in repository custody. A failure on first execution is evidence against the instrument/reference model and must be recorded before correction; it is not permission to tune a runtime implementation that does not yet exist.

## 6. Next act

When repository execution is available, run the frozen file at `075360eb1` exactly once and record stdout/exit status.

Only a green execution may open the next design question: where the pure recognizer lives and how its claims are composed with the already-frozen ACT 2 selector. `S` remains independent and unspent until the complete first-ask mechanism has a production-shaped claim worth probing.
