# C10 · INTEGRATION MERGE — attempted, ⛔ STOPPED AT A SUBSTANTIVE COLLISION

```text
Authority   founder, steps 1-3 · merge commit only · ⛔ no rebase/amend/force-push
STATUS      ⛔ STOPPED per the founder's guard — one conflict requires a DESIGN RULING
PUSH        ⛔ NOT PUSHED — local commits only; PR #1296's head is UNCHANGED
```

---

## 1 · The integration object

```text
INTEGRATION HEAD   15e67b837  (local only)
  15e67b837   fix(ws): union-safe range accessor at the Whole locus key   (R2)
  c8b058389   Merge b7072a184 into the repair branch
    parent 1  4df4e91d5da69bbc93126b9574ba40273f8098f6   ⭐ SEALED CANDIDATE
    parent 2  b7072a184d2b38ba86b405cda483e286b82e4e2c   integration base

4df4e91d ANCESTOR OF HEAD          ✅ YES
4df4e91d implementation digest     2e8e3e42…  ✅ UNCHANGED, read from the sealed commit
diff vs base                       11 files · +615 / −25
```

⭐ **The merge/rebase distinction held exactly as predicted.** The sealed object is intact,
reachable and byte-identical; the integration is a **new evidentiary object** owing its own
evidence.

## 2 · Conflict disposition by path

```text
app/writers-studio/canvas/ProposalWorkSurface.tsx        AUTO-MERGED · no conflict
app/writers-studio/canvas/page.tsx                       AUTO-MERGED · no conflict
app/writers-studio/__tests__/proposalWorkMode.test.ts    AUTO-MERGED · no conflict
app/writers-studio/ProposedChange.tsx                    ⚠️ ONE conflict — RESOLVED, MECHANICAL
```

**R1 · `ProposedChange.tsx` props — union of two INDEPENDENT additions.**

```text
base      adds  comparison?: { current; wouldRead } | null
C10       adds  showChangeNotice?: string | null
resolved  BOTH — one destructuring, both type members
```

⭐ Mechanical: neither prop refers to the other, and both render bodies auto-merged intact
(`comparison` at 220-225, `showChangeNotice` at 232-234). ⛔ No design choice.

**R2 · `page.tsx:1720` — union-safe accessor, forced by the typecheck gate.**

```text
BEFORE   locusKey={proposalLocusKey(target.sectionId, target.range)}
         → TS2339: Property 'range' does not exist on type 'ProposalWorkTarget'
           (the base made the target a union: legacy | chain)

AFTER    locusKey={proposalLocusKey(target.sectionId, range)}
         → `range` = markableRange(target), ALREADY computed two lines above,
           ALREADY null-guarded
```

⭐ Mechanical **and strictly more correct**: `markableRange` returns `t.range` for the legacy
variant and `t.location.located ? t.location.range : null` for the chain variant — so it respects
the 01A located/unlocated law a raw field read would bypass.

⭐ Committed **separately** from the merge (`15e67b837`) rather than amended into it, so the
integration reconciliation is legible as its own act.

## 3 · Local gate results

```text
npm run typecheck   4342 files · 229 errors vs baseline 239 · ✅ NO REGRESSIONS
                    (the first run flagged exactly one new diagnostic — R2 — now clear)

jest app/writers-studio/__tests__   42 suites · 766 tests
  ✅ 39 suites · 761 tests PASS
  ⚠️  3 suites ·   5 tests FAIL
```

### ⭐⭐ The decisive diagnostic — FOUR OF FIVE ARE PRE-EXISTING ON THE BASE

The same three suites were run against **`b7072a184` alone**, with no C10 content:

```text
ON THE BASE ALONE
  proposalWorkMode.test.ts     PW-2 · PW-8…PW-13            ❌ FAIL   ⛔ NOT C10's
  consentSurface.test.ts       F1-1/F1-5/F1-6 · F1-2/F1-9   ❌ FAIL   ⛔ NOT C10's
  navigationPreserved.test.ts                                ✅ PASS
```

```text
⭐ FOUR failures are BASE-RED — this integration did not cause them.
⭐ EXACTLY ONE failure is introduced by the integration.
```

⛔ This also clears R2: `PW-8` asserts the source contains `'target.range'` and was **already
failing on the base**, before R2 existed.

## 4 · ⛔⛔ THE STOP — one genuine design collision

```text
app/writers-studio/__tests__/navigationPreserved.test.ts
  suite  "the navigation mechanism the integration must not touch"
  test   "WholeManuscriptSurface reaches the destination with exactly one unscoped call"

    const calls = src.match(/revealWithin\(/g) ?? [];
    expect(calls).toHaveLength(1);                        ← merged source has 2
    expect(src).toContain("revealWithin(node, 'start');");
```

⭐⭐ **The base authored a source-shape guard pinning the SHELL-ONLY reveal — precisely the
behaviour FR-W5 authorized C10 to replace.**

```text
⛔ NOT MECHANICAL. Two authored intentions disagree:

   BASE   "this navigation must not be touched"          one unscoped shell reveal
   C10    "a voluntary return must address the exact     a second, locus-scoped reveal
           locus, or refuse"  — FR-W5, founder-ruled
```

⛔ Per the founder's guard: **a merge commit preserves the sealed object; it does not grant
authority to invent the integrated behaviour.** Returned for ruling, unresolved.

### ⭐ The transferable finding

```text
SOURCE-SCANNING TESTS DO NOT SURVIVE AUTO-MERGE.
The test and the source it scans merge INDEPENDENTLY, and nothing guarantees the merged test's
patterns still describe the merged source. A clean textual merge can produce a combination
NEITHER PARENT EVER VALIDATED.
```

⭐ The same family as this lane's C21 scar, one level up: there a source scan went RED on prose;
here a source scan survives a merge it can no longer describe.

```text
⭐⭐ TEXTUAL MERGEABILITY IS NOT BEHAVIORAL COMPOSABILITY.
   A source-scanning test and the source it scans can each auto-merge cleanly
   while their COMBINATION becomes semantically impossible.
```

## 5 · ⛔ What does NOT inherit from the seal

```text
The RED · MUTANT · CUSTODY · CLOSING claims are claims about 4df4e91d's BYTES.
The integration changed two of the four overlapping files (R1, R2).
⭐ So the integrated behaviour is NOT proven because one parent was proven,
  and the CLOSING WITNESS DOES NOT TRANSFER to the integration head.
```

## 6 · ⭐⭐ RULING APPLIED — `navigationPreserved` SUPERSEDED IN SCOPE, NOT DISCARDED

```text
FOUNDER RULING (2026-09-14)
  LEGITIMATE LAW        ordinary Whole navigation (jumpTo) → one shell reveal
                        → revealWithin(node, 'start') → C10 must not disturb it
  OBSOLETE ASSUMPTION   the entire Whole surface may contain only ONE revealWithin

⭐ Not relaxing the old protection — RECOVERING ITS ACTUAL JURISDICTION.
```

⭐⭐ **The collapse the old assertion made:**

```text
number of `revealWithin` CALL SITES     collapsed into     number of NAVIGATION SEMANTICS
```

⛔ Those are not the same object. `navigationPreserved` said *"the navigation mechanism the
integration must not touch"* — ⭐ **and C10 did not alter that mechanism. It added another
mechanism for another act.**

⛔ **A global `toHaveLength(2)` was refused as almost as weak as the old `1`**: it would count acts
without saying which act is which.

### The amendment — `181fbaa2c`

```text
A · ORDINARY NAVIGATION   revealWithin(node, 'start') · exactly once in that effect
                          from shells.current.get(pendingScroll)
                          ⛔ no proposalLoci · no proposalReturn · no locusKey leaking in

B · VOLUNTARY RETURN      proposalLoci.current.get(proposalReturn.locusKey)
                          revealWithin(locus, 'center', 'smooth') · exactly once
                          ⛔ never touches shells.current
                          ⛔ never calls revealWithin(node, …)
                          ⛔ a missing locus stays `status: 'refused'`, never a fallback

C · ANTI-COLLAPSE         the two effect bodies are DISTINCT CARRIERS, neither containing
                          the other, and the surface still moves the writer only through
                          those two
```

⭐ Comments stripped before scanning — this lane's **C21 scar**: a source scan must never read
prose describing a behaviour as the behaviour.

⭐ Amended **by the lane that owns it**, exactly as the guard's own header requires.

## 7 · Gates after the amendment

```text
navigationPreserved.test.ts   ✅ 12/12 PASS

app/writers-studio/__tests__  42 suites · 768 tests
  ✅ 40 suites · 764 PASS
  ⚠️  2 suites ·   4 FAIL — ⛔ THE INHERITED BASE-RED SET, UNCHANGED
       proposalWorkMode  PW-2 · PW-8…PW-13
       consentSurface    F1-1/F1-5/F1-6 · F1-2/F1-9
  ⭐ ZERO NEW FAILURES introduced by the integration

npm run typecheck          4342 files · 229 vs baseline 239 · ✅ NO REGRESSIONS
npm run check:no-supabase  ✅ clean
```

⛔ **The four inherited failures are NOT repaired here** — recorded as base debt exactly as
observed, per the founder's instruction.

## 8 · The integration head as a NEW evidentiary object

```text
HEAD               181fbaa2c   ⚠️ LOCAL ONLY — not pushed
  181fbaa2c        test(ws): scope the navigation guard to its two mechanisms (FR-W5)
  15e67b837        fix(ws): union-safe range accessor at the Whole locus key
  c8b058389        merge — parent 1  4df4e91d  ⭐ SEALED
                            parent 2  b7072a184  base

4df4e91d ancestor of HEAD          ✅ YES
4df4e91d implementation digest     2e8e3e42…  ✅ UNCHANGED
diff vs base                       12 files · +700 / −30
```

### ⛔ What does NOT inherit

```text
The RED · MUTANT · CUSTODY · CLOSING claims are claims about 4df4e91d's BYTES.
The integration changed three files beyond that commit (R1, R2, the guard).

⭐⭐ THE CLOSING WITNESS DOES NOT TRANSFER AUTOMATICALLY TO THE INTEGRATION HEAD.
```

⭐ **Owed before this head can be treated as witnessed — a SMALL integration witness, not a replay
of the whole evidentiary programme:**

```text
1  Whole / first exact-locus return      the repaired capability
2  Whole passive-scroll sovereignty      its highest-risk preserved invariant
```

⭐ The `4df4e91d` witness **remains sealed exactly where it belongs.**

## 9 · ⭐ INTEGRATION CUSTODY — SEALED TO ITS OWN BRANCH, PR HEAD UNMOVED

```text
BRANCH   fix/c10-whole-exact-return-01-integration   →  181fbaa2c   ✅ PUSHED
```

⭐ **JARVIS-VERIFIED after the push**, read back from the remote:

```text
origin/fix/c10-whole-exact-return-01-integration   181fbaa2c…   ✅ exact
origin/fix/c10-whole-exact-return-01               4df4e91d…    ✅ UNMOVED — PR #1296 intact
4df4e91d ancestor of the pushed integration         ✅ YES
sealed implementation digest                        2e8e3e42…    ✅ unchanged
⛔ no new commit · no rebase · no amend · no force-push
```

### ⭐⭐ Why the two acts are decoupled — evidentiary, not merely cautious

```text
4df4e91d    = SEALED REPAIR — runtime-witnessed
181fbaa2c   = GREEN STATIC INTEGRATION CANDIDATE — ⛔ NOT yet runtime-witnessed
PR #1296    currently points at 4df4e91d
```

⛔ Moving the PR head before the integration witness would make **the public review object advance
to bytes whose runtime evidence is still owed.** ⭐ There is no need to couple those two acts, so
they are not coupled.

## 10 · ⛔ OWED — the bounded integration witness

Against exactly `181fbaa2c`, from the durable integration branch:

```text
1  Whole / first asked return   → expect LOCUS-ADDRESSED
2  Whole passive scroll         → manually move away · ⛔ no SHOW CHANGE · dwell
                                → expect STAYED PUT
```

⭐ **Sufficient here, and deliberately not a replay of the historical programme.** Static
integration testing already established **zero new failures across 764 Writer's Studio tests**;
these two observations cover **the changed capability** and **the highest-risk sovereignty
invariant** — the one the repair newly put at risk by creating a viewport-moving path in Whole.

```text
EITHER FAILS   ⛔ STOP. 4df4e91d remains valid — only the INTEGRATION CANDIDATE fails.
BOTH PASS      ⭐ seal 181fbaa2c as the integration candidate.
```

### Then, and only then

```text
FAST-FORWARD   fix/c10-whole-exact-return-01   4df4e91d → 181fbaa2c
```

⭐ Especially clean because it introduces **no additional bytes beyond the witnessed integration
head**, and `4df4e91d` remains an ancestor and byte-identical forever.

```text
181fbaa2c static gates   ✅
integration custody      ✅ PUSHED to its own branch
integration witness      ⛔ OWED
integration seal         ⛔ after witness
PR head fast-forward     ⛔ after seal
PR merge                 ⛔ still unauthorized
F1                       ⛔ separate        CI-GATE FINDING ⛔ separate lane
```

## 11 · Standing

```text
4df4e91d        🔒 SEALED · unchanged · ancestor · digest verified
181fbaa2c       ✅ PUSHED to fix/c10-whole-exact-return-01-integration
                ⛔ NOT runtime-witnessed · PR #1296 head still 4df4e91d
nav guard       ✅ SUPERSEDED IN SCOPE under FR-W5 — amended, not discarded
base-red tests  ⚠️ 4 inherited · ⛔ NOT repaired here, by instruction
TYPECHECK       ✅ no regressions        SUPABASE GATE ✅ clean
NEW FAILURES    ⭐ ZERO
OWED            bounded integration witness (exact-locus return · passive-scroll sovereignty)
PR HEAD MOVE    ⛔ held until that witness seals 181fbaa2c
PR MERGE ⛔      F1 ⛔      CI-GATE LANE ⛔ separate, preserved
```
