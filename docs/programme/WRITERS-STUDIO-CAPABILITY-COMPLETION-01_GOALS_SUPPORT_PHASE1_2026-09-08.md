# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## GOALS SUPPORT · PHASE 1 — BOUNDED ENCOURAGEMENT

**Authority** founder act, 2026-09-08 — *build the first positive behaviour;
the constitution has done enough work.*
**Constrained by** FR-13 · FR-14 · FR-15 · FR-16 · FR-17
**Status** BUILT · wiring witnessed · ⛔ **generated warmth NOT witnessed here**

> ### Can MAIA add warmth without making herself part of the transaction?

---

## 1 · THE DESIGN DECISION — the check is the product

A prompt asking for warmth *"without a question, without suggesting a next goal,
without mentioning the calendar"* is a **wish**. `checkEncouragement()` makes it
a **refusal**: generated text is checked mechanically against the FR-16 form
contract, and anything that fails becomes **silence**.

> **This design is only available because FR-16 ruled silence lawful.** A
> refusal costs nothing, so the checker has no pressure to be lenient and a
> false refusal is invisible rather than damaging. Almost nowhere else in this
> system can a validator afford to be this severe.

The prohibitions, each executable and each with a falsifier:

```text
asks_a_question        any "?" at all — a question recruits another turn
opens_the_next_thing   next · momentum · keep going · another goal · now that
praises_the_person     "you're doing so well" · proud of you · impressive
invokes_the_clock      today · days · deadline · pace · behind · ahead · soon
compares               more than · faster · last time · most people
leverages_progress     ON RELEASE ONLY: any digit, so close, almost, already,
                       progress, come back, "when you're ready", still there
evaluates_the_goal     ON DECLARE ONLY: great goal · ambitious · achievable ·
                       you can do
speaks_for_the_writer  you feel · you wanted · I can tell
too_long / empty
```

**The clearest test in the file** — identical words, opposite verdict:

```text
"2,140 words became 3,000."      on MET       → ACCEPTED
"2,140 words became 3,000."      on RELEASE   → leverages_progress
```

*Truthful information is not neutral merely because it is true; placement can
make it persuasive.*

## 2 · ONE-SHOT BY CONSTRUCTION

Encouragement is produced **in the handling of the act that occasioned it** and
returned with that act's response. There is **no endpoint to redeem an
occasion** and **nothing stores one**, so it cannot be fetched twice and a
re-render cannot reproduce it (FR-15). It exists in one HTTP response or not at
all.

## 3 · WHAT IS NOT SENT

No manuscript, no excerpt, no counts — the model receives **the writer's own
goal statement and nothing else about their work** (FR-15 rule 3). No history,
no previous encouragement, no counter. Asserted by a scan of the module.

## 4 · WITNESS

```text
DECLARE · standing grant = track_only
   occasion      null          ← a quiet grant mints nothing
   encouragement null

PATCH  · change the grant to `encourage`
   occasion      null          ← FR-15: changing a grant is not an occasion
   encouragement null            (or choosing "encourage me" would answer
                                  its own invitation)

MET    · standing grant = encourage
   occasion      { kind: 'met', authority: { kind: 'standing', grant: 'encourage' } }
   encouragement null          ← the seam refused; refusal became SILENCE
```

⛔ **The generated warmth itself is NOT witnessed.** This container has no
`ANTHROPIC_API_KEY`, so `runStructured` refuses and every path ends in silence.
That proves the **refusal-to-silence** half and leaves the **warmth** half
untested against a real model.

> **What has been demonstrated is that the architecture holds. What has not been
> demonstrated is whether MAIA can actually be warm inside it** — which is the
> founder's question, and it needs a key and a writer.

## 5 · INSTRUMENT NOTE — a fifth false reading

The witness script reported `MET · occasion null` and I nearly filed it as a
defect. `waitForResponse` had been registered before clicking "met" and caught
the still-in-flight PATCH from the **previous** click — the grant change, whose
occasion is correctly null — and printed its body under the MET label.

```text
a response matching the URL   ≠   the response to the act you just performed
```

The fix is in the script header: wait for the previous act's effect to be
visible before registering the next waiter, and match on the request body rather
than the URL alone.

## 6 · STANDING

```text
PHASE 1  bounded encouragement    BUILT · wiring witnessed
         generated warmth         NOT WITNESSED (no model key here)
PHASE 2  explicit encouragement ask   not built
PHASE 3  work_with conversation       not built

Gates: 45 suites · 737 tests passed · typecheck no regressions · no-supabase clean
PERCEPTION unchanged · 60k ceiling unchanged · PRODUCTION untouched
```
