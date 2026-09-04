# Refusal Registry — detector defect audit (R19, R21)

**Date:** 2026-09-04
**Scope:** the five failing assertions in `tests/constitutional/refusal-registry/`
**Companion:** `docs/architecture/REFUSAL_REGISTRY.md`
**Verdict:** **detector defect on all five. No constitutional regression. No refusal was weakened.**

---

## 1. Reported symptom

Baseline before this work: `101 passed · 5 failed · 23 refusals`.

| # | Check | Reported detail |
|---|-------|-----------------|
| 1 | R19 | `Body is readable before the refusal → refusal@NaN bodyRead@NaN` |
| 2 | R19 | `A content writer precedes the refusal → 1467:      await sessionMemoryService.storeSessionPattern(` |
| 3 | R21 | `TurnsStore guard missing or after INSERT → guard@NaN insert@NaN` |
| 4 | R21 | `corpus callosum writers not both guarded → guards=2 inserts=2` |
| 5 | R21 | `conversation_history lane unguarded → guard@NaN update@NaN` |

## 2. Root cause

`harness.grep()` ran `grep -rInE`, whose output every ordering assertion parsed as
`path:line:text` via a locally-duplicated helper:

```ts
const lineOf = (g: string[]) => (g.length ? parseInt(g[0].split(':')[1], 10) : -1);
```

**GNU grep omits the filename when `-r` is given exactly one non-directory operand.
BSD grep and ugrep include it.** Every failing assertion greps a *single file*. Under
GNU grep the output is therefore `1467:      await …`, field `[1]` is the source text,
and `parseInt('      await …')` → `NaN`. Since every comparison with `NaN` is false,
each ordering assertion failed closed and rendered as an apparent breach.

Whether the registry was red depended on **which `grep` was first on `PATH`** — a
constitutional instrument whose verdict varied by developer machine.

Failure #2 is the decisive evidence: `1467` is a real line number, printed as the
*first* field because the filename was absent. It is the same defect as the others,
not a separate finding.

The discriminator is exact: **every failing assertion used `lineOf`; every R21
assertion that passed used match counts only.**

### Reproduction (this repo, worktree `blissful-booth-af73df`, HEAD `cf6ce3ce`)

```
PATH="/opt/homebrew/opt/grep/libexec/gnubin:$PATH" \
  npx tsx tests/constitutional/refusal-registry/index.ts
→ 101 passed · 5 failed · 0 warned   (all five detail strings byte-identical)

npx tsx tests/constitutional/refusal-registry/index.ts        # ugrep/BSD
→ 106 passed · 0 failed · 0 warned
```

## 3. Guards verified independently of the detector

Read directly with `/usr/bin/grep -n`, not through the broken helper. Every guard is
present and precedes every write it governs:

| File | Guard (`contentWritable(`) | Write | Ordered? |
|---|---|---|---|
| `lib/memory/stores/TurnsStore.ts` | 113 / 206 / 256 | `INSERT INTO conversation_turns` 125 / 215 / 274 / 281 | ✅ |
| `lib/services/corpusCallosumService.ts` | 115 (`logAgentRun`) / 175 (`logIntegrationPass`) | `INSERT INTO agent_runs` 120 · `INSERT INTO integration_passes` 180 | ✅ |
| `lib/sovereign/sessionManager.ts` | 67 | `SET conversation_history` 81 | ✅ |

`app/api/oracle/conversation/route.ts` (R19): `POST` @433 → `status: 410` @452 →
`request.json()` @511 → `storeSessionPattern` @1467 → `storeCMLayerSignal` @2384.
The refusal precedes the body read and both content writers.

**R21 (Sanctuary store boundary) was never breached.** The sanctuary write boundary
held throughout the period the registry reported it red.

## 4. Repair

`tests/constitutional/refusal-registry/harness.ts`

1. `grep()` now passes **`-H`**, making the `path:line:text` contract independent of
   the grep implementation.
2. `grep()` carries a **tripwire**: any result line not matching that contract raises
   `DetectorDefect` naming the pattern, the paths, and the offending line. Format drift
   can no longer silently corrupt downstream line arithmetic.
3. Shared **`lineOf()`** replaces the per-check duplicates. It returns `-1` only for a
   genuinely absent anchor, and **never `NaN`** — an unparseable match raises
   `DetectorDefect` instead of returning a value that renders as a verdict.
4. New **`requireLine(matches, anchor)`** for structural landmarks whose *absence*
   invalidates an assertion rather than proving a violation (a handler signature; the
   `INSERT`/`UPDATE` a guard is ordered against).
5. `runCheck()` renders `DetectorDefect` as a distinct red:
   *"DETECTOR DEFECT — this check could not locate its own anchor and proves NOTHING
   either way (tooling failure, not a demonstrated breach)."*

R19 and R21 now import the shared helpers; their local `lineOf` copies are deleted.
The corpus-callosum failure detail now carries line numbers instead of the misleading
`guards=2 inserts=2` (which showed both guards present while reporting them missing).

**No assertion's threshold, pattern, or logical form was relaxed.**

## 5. Verification

| Test | Result |
|---|---|
| Registry, ugrep/BSD grep | `106 passed · 0 failed · 0 warned` |
| Registry, **GNU grep** first on `PATH` | `106 passed · 0 failed · 0 warned` |
| **M1** — neutralise the `sessionManager` guard (breach simulation) | ❌ `conversation_history lane unguarded → guard@-1 update@81` — real breach, legible, no `NaN` |
| **M2** — rename `SET conversation_history` (anchor loss) | ❌ `DETECTOR DEFECT … anchor not found: SET conversation_history` — loud, and explicitly *not* a breach |
| Unit — `lineOf(['a/b.ts:1467:…'])` | `1467` |
| Unit — `lineOf(['1467:      await …'])` (the old NaN input) | `DetectorDefect` |
| Unit — `lineOf([])` | `-1` (absent anchor is a substantive result) |
| Unit — `requireLine([], anchor)` | `DetectorDefect` |
| `tsc --noEmit --strict` on the three changed files | clean |

Those unit assertions are now permanent, not ad-hoc: `tests/constitutional/refusal-registry/harness.test.ts`
(jest, 10 tests) holds both properties — the `path:line:text` contract for a **single**
file operand, and the guarantee that the locating helpers raise `DetectorDefect`
instead of ever returning `NaN`.

**The test is proven to catch the defect**, not merely to pass: reverting `grep -rHInE`
to `grep -rInE` and running under GNU grep fails exactly the two portability
assertions (`prefixes the filename even for a SINGLE file operand`, `reports the TRUE
source line`), while the pure-helper tests stay green — the same signature as the
original incident.

M1 and M2 together establish the greens are earned: the detectors still go red for a
real breach, and now go *differently* red when they lose their anchor.

Note: a `DetectorDefect` aborts the remainder of that check (M2 ran `98 passed · 1 failed`).
This is intended — a check that cannot read its evidence must not continue issuing verdicts.

## 6. Findings NOT repaired (reported, not absorbed)

1. **First-match-only ordering.** `lineOf` compares the *first* guard against the
   *first* write. `TurnsStore.ts` has 3 guards and 4 `INSERT`s; `113 < 125` does not
   prove the `INSERT` at 281 is guarded. All four are in fact guarded (§3, verified by
   hand), so this is a **gap in what the assertion proves, not a live breach**.
   Closing it would *strengthen* R21 and is a separate authorized unit — it is not
   folded into this repair.
2. **Cosmetic-only sibling.** `refusal-02` and `refusal-17` use
   `writers[0].split(':').slice(0, 2).join(':')` for a display detail. Under GNU grep
   this printed a slightly different string; it never fed a comparison and never
   changed a verdict. Left alone.

## 7. Consequence for dependent arguments

`SELF-ADDRESSED-RETURN-01 §6.6` reportedly inherits from R21 (a row in
`member_memory_atoms` implies non-sanctuary origin, because sanctuary content is
refused at the write boundary). That inheritance no longer rests on a red refusal:
R21 is green under both grep implementations, mutation-tested, and its guards are
verified by hand.

Two limits stand, unchanged by this work:

- **R21 remains a source-level structural claim.** It reads code, never data. It does
  not establish that any store behaved correctly at runtime for any member.
- **`docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md` does not exist in
  this worktree** (HEAD `cf6ce3ce`, branch `claude/festive-jepsen-8d8e61`), and no
  branch matching `*self*addressed*` was found. The §6.6 argument was **not read and
  not assessed here.** This record establishes only that R21 is demonstrated; whether
  §6.6 draws the right conclusion from it is unexamined.

Additionally, R21's own `passingDoesNotAuthorize` still applies: a PASS does not
authorize the claim that every content store platform-wide is governed (S4–S6 remain),
nor that posture resolution is independent of the request flag (S5).
