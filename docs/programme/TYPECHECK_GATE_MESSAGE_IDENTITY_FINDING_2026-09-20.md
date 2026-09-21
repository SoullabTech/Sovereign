# ⚠️ FINDING · THE NO-REGRESSION GATE CAN REPORT ACCEPTED DEBT AS A NEW REGRESSION

**Found 2026-09-20 while discharging the Mac Studio verification owed by
`WS-EDITORIAL-SCOPE-01`. ⛔ Outside that lane. ⛔ No lane opened. ⛔ Nothing
repaired.**

## 1 · What happened

`npm run typecheck` on `claude/intelligent-bell-axjpwf` reported **5 new
diagnostics**. Two were real and are fixed (`2a17a258`). The other three:

```
app/wisdom-keepers/sacred-texts/page.tsx:207   TS2322
components/focus/InboxTriage.tsx:131           TS2322
components/focus/NextStepBuilder.tsx:167       TS2322
```

## 2 · ✅ CONFIRMED — they are not new, by three independent facts

1. **Not in the branch's diff.** `git diff --name-only aa15c4ef^..HEAD` contains
   none of the three.
2. **They predate the branch.** All three last changed in `a6820a05`
   (PR #1346), which `git merge-base --is-ancestor` confirms is an ancestor of
   this branch's base `1faec401`.
3. ⭐⭐ **They are ALREADY IN `typecheck-baseline.json`** — same file, same code,
   same line:

```json
{"file":"app/wisdom-keepers/sacred-texts/page.tsx","code":"TS2322",
 "message":"Type '\"contemplative\"' is not assignable to type
            '\"gentle\" | \"direct\" | \"exploratory\" | \"supportive\" | undefined'.",
 "count":1,"lines":[207]}
```

**They are accepted debt. The gate reported them as regressions.**

## 3 · ⭐ THE MECHANISM — diagnostic identity includes an unstable string

`scripts/check-typehealth-baseline.js:133` keys every diagnostic on

```
file | TS code | normalizeMessage(message)
```

and `normalizeMessage` (`:108`) does only two things: strip the repo root, and
collapse whitespace. ⛔ **It does not normalize union member ordering.**

The header's own reasoning is sound and explains why line numbers were excluded:
*"Line numbers are deliberately excluded from the identity key: they shift on
unrelated edits."* ⚠️ **The message text has the same property and was not given
the same treatment** — a union's members can be printed in a different order by
a different TypeScript version, or after an unrelated change to a declaration,
and the diagnostic is then a different key.

The same mismatch shows up on BOTH sides at once: the entry reports as **new**
in the current run and the baselined entry reports as **fixed**, because neither
key is found in the other map (`:220`, `:231`).

## 3a · ⭐⭐ WITNESSED — founder-run, verbatim, 2026-09-20

The §5 check was run on the Mac Studio. **All three differ from their baselined
entries in UNION MEMBER ORDER AND NOTHING ELSE** — same file, same code, same
line, same members, same everything but the sequence:

```
sacred-texts/page.tsx(207,7)
  now       '"direct" | "gentle" | "supportive" | "exploratory" | undefined'
  baseline  '"gentle" | "direct" | "exploratory" | "supportive" | undefined'

InboxTriage.tsx(131,33)  ·  NextStepBuilder.tsx(167,33)
  now       threshold: "none" | "invitation" | "pause" | "acknowledgment"
  baseline  threshold: "none" | "pause" | "invitation" | "acknowledgment"
```

⭐ The second pair is the stronger evidence: the union is **nested inside an
object type literal** (`{ threshold: …; weeklyWeight: number; … }`), and only
the two middle members swapped. ⛔ Nothing about those components changed.

**The mechanism is no longer inferred. It is observed.**

## 3b · ⭐⭐ SECOND FOUNDER RUN — THE ORDERING IS NOT EVEN STABLE BETWEEN RUNS

Run 2 (after pulling the two real fixes) reports **2** new diagnostics, not 3 —
and the two that remain carry **a THIRD ordering of the same four members**:

```
baseline   "none" | "pause"          | "invitation"   | "acknowledgment"
run 1      "none" | "invitation"     | "pause"        | "acknowledgment"
run 2      "none" | "acknowledgment" | "invitation"   | "pause"
```

⛔ `InboxTriage.tsx` and `NextStepBuilder.tsx` were not touched between run 1 and
run 2. **Nothing about them changed and their diagnostic printed three
different ways.**

⭐⭐ **AND `sacred-texts/page.tsx` SILENTLY STOPPED BEING A REGRESSION.** It was
in run 1's list and is absent from run 2's — again with no edit to that file.
Its ordering happened to match the baseline this time.

**That is the finding in its sharpest form: the identity key is coupled to
GLOBAL PROGRAM STATE, not to the defect.** The only edits between the two runs
were in `app/writers-studio/**` and `lib/writersStudio/**` — and they changed
how a diagnostic in `components/focus/**` and `app/wisdom-keepers/**` is
printed. ⛔ *An unrelated edit anywhere can make a baselined diagnostic
elsewhere look new, or make a phantom quietly disappear.*

⚠️ **THE UNDERLYING DRIVER IS NAMED IN THE SAME OUTPUT**:

```
program files : 4408 (baseline 3965)
📈  449 new file(s) entered the program.
```

The baseline was recorded at `a6820a05`; the program has grown by **449 files**
since. Union member ordering follows the order types are encountered during
checking, which follows program composition — so a baseline this stale will keep
producing reorderings indefinitely. ⛔ The drift is not a one-off.

⭐ The run also shows the predicted **both-sides effect**: `12 error(s) fixed
since the baseline (10 identities gone, 0 reduced)` alongside only 2 new. Some
of that is real (`6 baselined file(s) were deleted from disk`), ⛔ but
disappearing identities and appearing identities are the same phenomenon seen
from either end.

## 4 · ⭐⭐ WHY THIS MATTERS MORE THAN A NOISY GATE

The remediation the false signal invites is **worse than the false signal**:

- `InboxTriage.tsx` / `NextStepBuilder.tsx` — *"change `null` to `undefined`"* is
  a **runtime behaviour change in two unrelated components**, made to turn a
  gate green. Any `=== null` test elsewhere stops matching.
- `sacred-texts/page.tsx` — *"change `"contemplative"` to `"exploratory"`"*
  **changes a semantic value on a wisdom-keepers surface.** If the honest fix is
  to extend the union to admit `contemplative`, that is a design decision about
  what styles exist — ⛔ not a typecheck chore, and silently making a
  contemplative surface exploratory is a content edit.

⭐ *An instrument that misreports pressures people into editing code they never
intended to touch, in files they did not open, to satisfy a signal that was
wrong.* That is the same defect family as the 2026-09-13 branch-policy finding:
**a gate whose verdict does not mean what its name says.**

## 5 · The decisive check (owed, one command each)

```bash
npx tsc -p tsconfig.ship.json --noEmit 2>&1 \
  | grep -E "sacred-texts|InboxTriage|NextStepBuilder"

python3 -c "import json;[print(d['message']) for d in \
  json.load(open('typecheck-baseline.json'))['diagnostics'] \
  if any(k in d['file'] for k in ('InboxTriage','NextStepBuilder','sacred-texts'))]"
```

⭐ If the two differ only in the ORDER of union members, §3 is witnessed.
⭐ A second corroboration is free: the same three should have appeared in that
run's **fixed** list as well as its **new** list.

## 6 · ⛔ Not repaired, and the candidate repair stated rather than taken

`check-typehealth-baseline.js` guards the whole application and its identity key
governs every future comparison. ⛔ Changing it is a governed act.

The minimal candidate: sort the members of any `'a' | 'b' | 'c'` sequence inside
`normalizeMessage`. ⭐ It cannot merge genuinely distinct diagnostics — two that
differ only by union ordering ARE the same diagnostic. ⛔ Recommended, not taken.

⚠️ And **re-baselining is the wrong answer here**: it would bless the reordered
strings until the next reorder, and `npm run typecheck -- --accept-current` on a
run containing two real regressions would have absorbed those too.

## 7 · ⚠️ ONE PROPERTY THE REPAIR MUST HAVE, or it makes things worse

⛔ Normalising only at COLLECTION time would make every one of the 173 baselined
diagnostics look new at once: the stored messages are unsorted, so a sorted
current run would match none of them.

⭐ `keyOf()` (`:207`) reads `d.message` raw for baseline entries. **The
normaliser must be applied on BOTH sides, at comparison time** — and then the
existing `typecheck-baseline.json` keeps working **unchanged**, with no
re-baselining act required. *That property is what makes this repair cheap and
safe; without it the repair is a disguised re-baseline.*

**Standing: FALSE REGRESSIONS ✅ ESTABLISHED · MECHANISM ✅ WITNESSED TWICE
(founder-run, verbatim; three distinct orderings of one unchanged diagnostic) · ⛔ THE THREE FILES NOT EDITED · ⛔ THE GATE NOT
REPAIRED — PARKED FOR OWNER REVIEW BY FOUNDER RULING · ⛔ NOT RE-BASELINED ·
⛔ NO LANE OPENED.**

> ⭐ *The gate was right about two things and wrong about three, and the wrong
> three were the ones that would have had someone change working code.*
