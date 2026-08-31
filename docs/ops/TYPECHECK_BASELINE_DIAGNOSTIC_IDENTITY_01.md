# TYPECHECK-BASELINE-DIAGNOSTIC-IDENTITY-01

**Class:** tooling / evidence integrity. **Parked.** No repair under the current mandate.

**Found by:** WS2-05B 5c, 2026-08-31, while running the browser witness against a live local
stack. Discovering it there does not authorise redesigning the gate from there.

---

## The finding

`npm run typecheck` fails or passes on the **same source tree** depending on whether a Next.js
dev server has been run since the last clean.

The gate keys a diagnostic on `file | TS code | normalized message`
(`scripts/check-typehealth-baseline.js:108,133,208`). `normalizeMessage` collapses whitespace and
strips the repo root; it does not — and cannot easily — normalise the message's **content**.

TypeScript renders union members in a message in an order that depends on where the union's
constituents were declared in the program. Adding files to the program can change that order. The
message text then changes, the identity key changes, and one baselined error is reported as one
NEW error plus one FIXED error.

**The gate is keying on a presentation artifact rather than on a stable diagnostic.**

## Reproduction (controlled, both directions)

Same working tree, no source edits between the two runs.

```bash
# A — after any `npm run dev`, so .next/types/routes.d.ts exists
npm run typecheck        # ❌ Gate FAILED — 3 NEW, 9 identities gone, 173 files entered

rm -rf .next
# B — the same tree, nothing else changed
npm run typecheck        # ✅ No TypeScript regressions — 6 identities gone, 172 files entered
```

`next-env.d.ts` carries `/// <reference path="./.next/types/routes.d.ts" />`, so the generated
route types enter the program in A and are simply an unresolved reference in B.

## The three diagnostics that move

Same file, same TS code, same three errors — only the union's member order differs.

| | rendering |
|---|---|
| baseline (`typecheck-baseline.json`) | `threshold: "none" \| "pause" \| "invitation" \| "acknowledgment"` |
| run A | `threshold: "pause" \| "none" \| "invitation" \| "acknowledgment"` |

- `components/focus/AvoidanceBreaker.tsx:108` — TS2345
- `components/focus/InboxTriage.tsx:131` — TS2322
- `components/focus/NextStepBuilder.tsx:167` — TS2322

All three are the same underlying defect (`useState<T | undefined>(null)`), all three are already
in the baseline, and none of them is new. Nothing about the code changed between A and B.

## Why this matters more than three red lines

The gate exists so that "typecheck green" means "nothing got worse". Under A/B drift it means
"nothing got worse, and you happened to run it in the same `.next` state as whoever last
baselined". Two failure modes follow, and the second is the dangerous one:

1. **False red.** A contributor is told they broke the build by a diagnostic they did not
   introduce, and learns to distrust the gate — or to re-baseline, which the gate correctly
   refuses to do quietly.
2. **False green.** Symmetric and invisible. A genuinely new error whose message happens to match
   a baselined identity that drifted the other way is absorbed as "already known". Nobody sees a
   red line, because there is nothing to see.

This is the same shape as the two findings 5c produced in the Studio: a check whose *absence of
evidence* was being read as evidence. `test execution ≠ type validation` and
`script execution ≠ inclusion in ship program` now have a third sibling:
**gate identity ≠ diagnostic identity.**

## Scope, if and when this is taken up

1. Reproduce the `.next`-dependent identity drift (the A/B above is the reproduction; confirm it
   on a second machine, since program composition differs by checkout).
2. Design a **stable diagnostic key**. The obvious candidates, none endorsed here:
   - normalise union renderings inside `normalizeMessage` (sort members within `A | B | C` runs);
   - key on `file | code` plus a structural fingerprint rather than prose;
   - pin program composition for the gate so the rendering cannot move.
3. Decide whether `.next/types` belongs in the ship program at all — that is a coverage question,
   and changing coverage is itself a governed act (`typecheck:baseline -- --accept-current`).

**Not in scope:** fixing the three `components/focus/*` errors. They are real, they are baselined
debt, and repairing them here would remove the evidence without addressing the gate.

## Until then

Run `npm run typecheck` from a clean `.next`, or read a failure naming only
`components/focus/*` against this document before believing it.
