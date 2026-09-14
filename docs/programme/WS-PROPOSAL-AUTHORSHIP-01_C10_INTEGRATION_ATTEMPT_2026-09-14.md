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

## 5 · ⛔ What does NOT inherit from the seal

```text
The RED · MUTANT · CUSTODY · CLOSING claims are claims about 4df4e91d's BYTES.
The integration changed two of the four overlapping files (R1, R2).
⭐ So the integrated behaviour is NOT proven because one parent was proven,
  and the CLOSING WITNESS DOES NOT TRANSFER to the integration head.
```

## 6 · Standing

```text
4df4e91d        ⭐ SEALED · unchanged · ancestor of 15e67b837 · digest verified
15e67b837       ⚠️ LOCAL ONLY · not pushed · PR #1296 head UNCHANGED
TYPECHECK       ✅ no regressions
TESTS           4 pre-existing base failures · ⛔ 1 genuine collision
OWED RULING     navigationPreserved vs FR-W5 — which authored intention governs
PUSH            ⛔ held — it would move PR #1296's head onto an unadjudicated integration
PR MERGE ⛔      F1 ⛔      CI-GATE LANE ⛔ separate, preserved
```
