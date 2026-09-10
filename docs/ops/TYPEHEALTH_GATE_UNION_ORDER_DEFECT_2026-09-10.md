# Type-health gate — union-order identity instability

**Date:** 2026-09-10 · **Class:** instrument defect · **Disposition:** repaired, falsified, accepted pending founder ruling
**Instrument:** `scripts/check-typehealth-baseline.js` (`npm run typecheck`)

## The defect

Diagnostic identity was `file | code | normalized-message`, where normalization
stripped the repo root and collapsed whitespace and nothing else.

tsc's print order for the members of a union type is not stable. It follows the
order in which the union's constituents were first encountered while checking,
which moves when files enter or leave the program. Branch
`claude/s3-implementation` added ten files; three **pre-existing, already
baselined** errors were re-printed with their union members permuted, and the
gate reported each of them as simultaneously *fixed* and *NEW*.

| | baseline | after +10 files |
|---|---|---|
| `app/wisdom-keepers/sacred-texts/page.tsx:207` | `"gentle" \| "direct" \| "exploratory" \| "supportive"` | `"direct" \| "supportive" \| "gentle" \| "exploratory"` |
| `components/focus/InboxTriage.tsx:131` | `"none" \| "pause" \| "invitation" \| "acknowledgment"` | `"none" \| "invitation" \| "pause" \| "acknowledgment"` |
| `components/focus/NextStepBuilder.tsx:167` | *(as above)* | *(as above)* |

Same file, same TS code, same line, same count, same members — order only.

The arithmetic closed it before any repair was written:

```
origin/clean-main-no-secrets   229 errors ·  8 identities gone · 0 new
claude/s3-implementation       229 errors · 11 identities gone · 3 new
```

Exactly three extra "gone" and three "new" — the same three errors, counted
twice in opposite directions, with the total unchanged.

## Both failure directions were live

1. **False regression.** The gate blocked honest work on errors nobody had touched.
2. **Escape hatch.** On that same failing run the gate printed
   *"Lock it in with: `npm run typecheck:baseline`"*. Under a **real** regression
   that advice is exactly the act `CLAUDE.md` forbids. An instrument that can be
   quieted by the action it recommends is not a gate.

## The repair

`scripts/lib/typehealth-identity.js` — order only, applied to **both** sides of
the comparison immediately before the identity key is built, and nowhere else.

- Union members are **sorted, never deduplicated**.
- No member is added, removed, or rewritten. No count changes.
- `typecheck-baseline.json` is **not rewritten**; `message` stays exactly as tsc
  printed it, for display and for the record. Only the **key** is canonicalized.
- A `|` is a union separator only inside the single-quoted type regions tsc uses
  to print types, at bracket depth zero, outside a `"…"` string-literal type.
  A `|` in prose, in a filename, or inside a string-literal type is untouched.

The failing path no longer names the re-baseline command. Baseline maintenance
remains a separately authorized operation.

## Falsification

`npm run typecheck:identity-witness` — **34 passed · 0 failed**.

T1 permuted union → same identity · T2 member added → different · T3 member
removed → different · T4 member value changed → different · T5 code/file changed
→ different · T6 ordinary text changed → different · T7 unrelated `|` never
reordered. E1–E5 run the gate's **real** `compare()`, not a reimplementation.

The witness was proven able to fail, against three known-bad implementations:

| known-bad | result |
|---|---|
| pre-repair identity (no canonicalization) | **11 failed** — T1a–T1e, T7e, E1–E5 |
| sort **and** deduplicate | **1 failed** — T2c |
| sort every `\|` run, prose and string literals included | **11 failed** — incl. T7a, T7c |

End-to-end against real tsc: a deliberate `'contemplative'` assigned to
`'none' \| 'invitation' \| 'pause'` turned the gate **RED** with a correctly
named new identity, and the re-baseline command was correctly suppressed on that
failing run. Probe removed; source restored byte-identical.

## Out of scope, deliberately

The three TypeScript errors are **not** fixed and are **not** suppressed. They
remain in the baseline as pre-existing debt, in files owned by another lane
(last touched by merge `cc1f1ea10`, 2026-08-27). The blocker was never those
errors; it was the instrument claiming they were new.

## Gate after repair

```
program files : 4287 (baseline 3965)
errors        : 229 (baseline 239)
✅  No TypeScript regressions.
```

The fixed-count now agrees with the base branch (10 fixed · 8 identities gone),
as it must, since neither branch touched those files.
