# A4 — CROSS-LANE FINDING TO THE OWNING VOICE LANE

**From:** `UARE-01` (U1 coverage survey) · **Date:** 2026-09-13 · **Authorized by:** founder ruling,
2026-09-13 — *handoff now, do not wait for U1 to finish.*
**Subject:** the regression guard protecting the 2026-09-07 voice-silence repair is not decisive.
**Standing:** ⛔ **FINDING ONLY. NO REPAIR AUTHORIZED BY UARE-01. NO REQUIREMENT AUTHORED.**

---

## 1 · The claim, stated narrowly

> **SUPPORTED.** The existing A4 guard can remain green while the defect class it is intended to
> protect against returns, because its assertion excludes **one lexical form** rather than the
> underlying **behavioral dependency**.

> ⛔ **NOT SUPPORTED — and not claimed anywhere in this document.** That the voice defect has
> recurred · that the runtime currently violates the boundary · that any particular repair is
> required.

This is a **gate defect**, not a product defect. The two propositions must not travel together.

## 2 · The evidence

`__tests__/voice-transcript-commit.test.ts`, the test named
*"⛔ the post-speech commit is NOT gated on showVoiceText"*. Its entire assertion:

```js
expect(code).not.toMatch(/isInVoiceMode\s*&&\s*showVoiceText/);
```

Applying the inversion criterion — *if the claimed gate were removed or inverted, would this
assertion be capable of failing?* — the answer is **only for that one spelling.** Each of these
re-introduces the dependency and **passes**:

```js
showVoiceText && isInVoiceMode          // operands reversed
if (showVoiceText) { /* append */ }     // no conjunction at all
const canShow = isInVoiceMode && showVoiceText;   // via a named boolean
if (shouldRenderTranscript) { ... }     // via any derived value
```

**Execution status:** the test runs and passes on `36374edb` (3 suites · 35 tests · all green). That
is what makes it worth reporting — *the instrument can confidently green the defect class.*

## 3 · Why it matters here specifically

The 2026-09-07 defect was *a render preference deciding what MAIA could remember saying* — the turn
never entered `messages`, so it was missing when the transcript was revealed **and** missing from the
next turn's `conversationHistory`. The canon line is **`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`**:
*voice may have a different capture path; it may not have a different mind — nor a different record of
that mind's words.*

A guard that bans a **string** rather than a **dependency** is the weakest possible protection for a
boundary of that weight: it constrains how a future author *spells* the regression, not whether they
can commit it.

## 4 · What the voice lane owns

⛔ UARE-01 has no standing to choose among these. They are listed so the finding arrives with its
option space visible, not to recommend one.

- Whether a **falsifier** is the right response, and if so at what grain — the A1 pattern in the same
  repository is instructive: its ⛔ cases *perform* the inversion (synthesize a mutated source, assert
  rejection) rather than describing it, so a re-spelling of the defect fails by construction.
- Whether a **source-shape guard can discharge this row at all**, or whether it needs a behavioral
  test that exercises the commit with the render preference off.
- Whether the row's boundary is even stated at the right grain.
- Whether this is urgent or routine.

## 5 · One accompanying observation, same survey

The finding is an instance of something broader that the voice lane may want alongside it:

> **The whole A-block is source-drift detection, not runtime-regression protection.** None of A1–A5
> executes the voice path. A1 asserts through a TypeScript AST walk; A2–A5 through regex and
> substring matching on comment-stripped source. A refactor that preserves the literals while
> changing behaviour passes every one of them.

That is not a criticism of the instrument class — a structural gate is the right tool for *"the mind
may not be substituted"*, and it is why the non-degradation gate can be stated as law. But it bounds
what *"voice is gated"* can mean, and A4 is where the bound bites.

⛔ **UARE-01 does not follow this finding across the boundary.** The owning lane decides repair,
falsifier, acceptance, and urgency. This lane records and hands over.

**Full survey:** `docs/programme/UARE-01_U1_COVERAGE_SURVEY_2026-09-13.md`
