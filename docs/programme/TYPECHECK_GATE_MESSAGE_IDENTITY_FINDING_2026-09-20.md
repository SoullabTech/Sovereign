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

⚠️ **HYPOTHESIS, NOT YET WITNESSED.** The baseline string and the reported
string differ in union order — but the reported string reached this record
through a human summary, ⛔ not a verbatim paste. **The decisive check is §5.**

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

**Standing: THREE FALSE REGRESSIONS ✅ ESTABLISHED · MECHANISM ⚠️ HYPOTHESISED,
WITNESS OWED · ⛔ THE THREE FILES NOT EDITED · ⛔ THE GATE NOT REPAIRED ·
⛔ NOT RE-BASELINED · ⛔ NO LANE OPENED.**

> ⭐ *The gate was right about two things and wrong about three, and the wrong
> three were the ones that would have had someone change working code.*
