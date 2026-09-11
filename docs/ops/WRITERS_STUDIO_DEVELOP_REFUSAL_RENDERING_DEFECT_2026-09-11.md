# Writer's Studio · Develop — refusal rendering defect

**Observed in production**, `soullab.life/writers-studio/develop`, 2026-09-11.
⛔ **OBSERVED ONLY. Not diagnosed to root cause, not repaired, nothing deployed.**

## What was seen

Three `POST /api/sovereign/manuscripts/<id>/readings` calls returned **409**. The
Develop panel then displayed, together, in one state:

> This work has changed since the last version you kept. Keep a version in the
> Writer Canvas, then ask MAIA to read again. **Nothing has changed.**
>
> The Studio could not determine the cause.

## Classification — founder, 2026-09-11

**TRUTHFULNESS / STATE-RENDERING DEFECT.** ⛔ Not copy polish.

Those three propositions are **mutually incompatible in the same response
state**: the work changed, the work did not change, and the cause is unknown.

> ⭐⭐ **A system should never state, deny, and disclaim knowledge of the same
> condition at once.** *That is the UI equivalent of the epistemic discipline
> developed everywhere else in this programme — and a surface that asserts and
> retracts in one breath teaches the member that none of its statements are
> load-bearing.*

## The architectural fact that matters

**The backend refusal is already typed.** `app/api/sovereign/manuscripts/[id]/readings/route.ts`
returns `{ refusal, stage, detail }` and maps stage + refusal to a status
(`statusFor()`), with `capture` and `recover` both able to yield 409. Its own
header comment states the intent plainly: *"the stage and the typed refusal come
back so the surface can say what did not happen."*

⭐ **So the repair probably does not require inventing better explanatory prose.**
The server already names which condition obtained; the surface is not obeying it.

```text
   WANTED                          OBSERVED
   one typed refusal               409
        ↓                            ↓
   one interpretation           several fallback explanations
        ↓                        render simultaneously
   one coherent message
```

## Where the copy lives

- `lib/writersStudio/developRefusalCopy.ts` — holds `CAUSE_UNKNOWN_LINE`
  (*"The Studio could not determine the cause."*)
- `app/writers-studio/develop/DevelopRoom.tsx` — holds the *"Nothing has
  changed."* line
- `app/writers-studio/__tests__/classifyRefusalCopy.test.ts` — an existing test
  file over this classification, so the seam is already under test and a repair
  has somewhere to be falsified

⛔ **None of these files was read beyond locating the strings, and none was
changed.**

## Standing

```text
defect                OBSERVED IN PRODUCTION
classification        TRUTHFULNESS / STATE RENDERING
root cause            NOT ESTABLISHED
repair                NOT AUTHORIZED · SEPARATE LANE
relation to RC-GEN-01 NONE — recorded here to keep it out of that lane
```
