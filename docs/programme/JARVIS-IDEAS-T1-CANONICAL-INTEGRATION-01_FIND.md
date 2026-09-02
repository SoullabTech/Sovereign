# JARVIS — IDEAS T1 CANONICAL INTEGRATION — 01

## FIND

```text
PHASE          FIND
AUTHORIZATION  FIND ONLY — no transfer, no repair performed
STATUS         COMPLETE · STOPPED FOR ADJUDICATION
HEADLINE       the lane's custody strategy is right in intent
               and blocked in mechanism
DATE           2026-09-02
```

---

## 1. Exact trees

```text
CANONICAL      origin/clean-main-no-secrets @ a4305f4d6ec408e34efc5dae49d9664b981d4323
FROZEN T1 TIP  eb0a7af895   "docs(ideas): the registry derivation is not an authorization"
NAMED T1 BASE  2c7f7e329    "docs(ideas): tighten disk_tree equivalence …"
MERGE-BASE     4b8b34bc     (canonical ⨯ T1)

T1 ahead of canonical    41 commits
T1 behind canonical      46 commits
```

`eb0a7af895` was **not touched**. All work below is read-only inspection.

---

## 2. The ratified T1 delta is exactly as briefed

`2c7f7e329..eb0a7af895` — 4 commits, 10 files, 2946 insertions / 71 deletions:

```text
aaf658d  feat(ideas): T1 fault localization, implemented against the ratified contract
eaa7847  fix(ideas): repair four T1 contract defects found against the ratified spec
814cd66  fix(ideas): gate P18 promotion on implemented mechanisms, not on field values
eb0a7af  docs(ideas): the registry derivation is not an authorization
```

| File | On canonical? |
|---|---|
| `lib/ideas/attemptInstrument.ts` | new |
| `lib/ideas/__tests__/attemptInstrument.test.ts` | new |
| `app/api/ideas/[id]/ask-maia/__tests__/faultLocalization.test.ts` | new |
| `app/api/ideas/[id]/blocks/__tests__/attemptCorrelation.test.ts` | new |
| `docs/programme/IDEAS_CUT02_T1_CLOSURE_2026-09-02.md` | new |
| `tsconfig.t1.json` | new |
| `app/api/ideas/[id]/ask-maia/route.ts` | exists |
| `app/api/ideas/[id]/blocks/route.ts` | exists |
| `app/maia/ideas/[id]/page.tsx` | exists |
| `lib/team/maiaThreadReflection.ts` | exists |

**`lib/team/maiaTitleProposal.ts` is NOT in the T1 delta.** Confirmed, as briefed.

---

## 3. Canonical has not moved under T1

None of the 10 files changed on canonical between merge-base `4b8b34bc` and
`a4305f4`. There is no canonical-evolution conflict to re-adjudicate.

---

## 4. The blocking finding — T1 does not apply to canonical

The four **shared** files differ substantially between the T1 delta's base
(`2c7f7e329`) and canonical, going from T1 base → canonical:

```text
app/api/ideas/[id]/ask-maia/route.ts      +5   -44
app/api/ideas/[id]/blocks/route.ts        +2   -10
app/maia/ideas/[id]/page.tsx             +36  -349
lib/team/maiaThreadReflection.ts          +9  -104
```

Those deletions are content the T1 base **has** and canonical **lacks**. The T1
hunks are written against file states that do not exist on canonical.
Demonstrated directly against a clean canonical worktree:

```text
git apply --check  <2c7f7e3..eb0a7af patch>      EXIT 1
  patch failed: app/api/ideas/[id]/ask-maia/route.ts:13
  patch failed: app/api/ideas/[id]/blocks/route.ts:4
  patch failed: app/maia/ideas/[id]/page.tsx:42
  patch failed: lib/team/maiaThreadReflection.ts:23

git apply --3way --check                          applies WITH CONFLICTS
```

**The lane's mission as written — "transfer T1 only, not its historical base" —
cannot be executed as a bounded patch transfer.** The four T1 commits depend on
prerequisite work canonical does not carry.

---

## 5. What the prerequisite actually is

37 commits sit between merge-base and the T1 base. Only **5** touch `app/` or
`lib/`, and two of those cancel:

```text
2d27c82  feat(ideas): stop silent word loss, break the reflection loop,
                      split Reflect from Ask MAIA
b03f97c  feat(ideas): seed/name separation and per-turn relational stances
3085b46  test(ideas): drop vitest imports so the Ideas suites load under Jest
d927398  diag(ideas): log stance at entry to handleAskMaia — temporary   ┐ net-zero
96565fe  diag(ideas): remove the temporary stance diagnostic             ┘ (verified)
```

The remaining 32 are docs/spec. Net code prerequisite, merge-base → T1 base,
restricted to `app/` + `lib/`: **15 files, 1253 insertions, 69 deletions.**

So the true prerequisite is small and nameable — on the order of two feature
commits plus one test-loader fix — not 37 commits of divergence.

---

## 6. The hazard is in the prerequisite, not in T1 — and it is real

```text
lib/team/maiaTitleProposal.ts   (new in the prerequisite lineage, 105 lines)
  line 20:  import Anthropic from '@anthropic-ai/sdk';
  line 69:  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

not present on any allowlist in canonical scripts/check-no-direct-anthropic.ts
```

Two consequences:

1. **Transferring T1 alone would correctly leave the hazard behind** — but T1
   alone does not apply (§4). Any route that makes T1 applicable by bringing the
   prerequisite forward brings this file with it unless it is separately handled.
2. **This closes the open question from the previous lane.** The earlier FIND
   recorded `check:no-direct-anthropic` as reported-failing but green on
   canonical, with the cause undetermined — T1-base artifact, or a
   mis-attributed `&&`-chain exit. It is the first: the failure is real and it
   lives in the T1 prerequisite lineage, not on canonical and not in the T1
   delta. That question is now answered and can be closed.

---

## 7. Whole-branch merge is ruled out on evidence

28 files differ between canonical and the frozen T1 tip, against 10 in the T1
delta — 18 files of other Ideas work, `maiaTitleProposal.ts` among them. The
lane's instinct not to rebase or merge the whole branch is confirmed by
measurement, not only by preference.

---

## 8. Carried into UNDERSTAND — no route proposed here

1. Is the T1 delta's dependency on `2d27c82` / `b03f97c` **semantic** (T1 needs
   the reflection/stance split to function) or **textual** (the hunks merely sit
   in moved code and could be re-expressed against canonical)?
2. If semantic: does the prerequisite become its own governed integration unit
   ahead of T1, with `maiaTitleProposal.ts` adjudicated inside it — repaired to
   the provider-adapter layer, allowlisted, or excluded?
3. If textual: can T1 be reconstituted directly against canonical and proven
   equivalent to `eb0a7af` by the 103 proofs, without importing the prerequisite?
4. Either way, what is the acceptance evidence that the reconstituted T1 is the
   *ratified* T1 and not a lookalike? (`tsconfig.t1.json` + the three test files
   are the likely spine.)
5. Does `3085b46` (vitest → Jest loader fix) need to travel for the T1 suites to
   run on canonical at all?

**No repair, no transfer, no branch created for integration.** Only this record.

---

## 9. Phase verdict

```text
FIND       COMPLETE
BLOCKER    T1 does not apply to canonical; its four commits depend on
           prerequisite Ideas work canonical lacks
SCOPE      the prerequisite is small and nameable (≈2 feature commits +
           1 test-loader fix), not 37 commits of divergence
HAZARD     lib/team/maiaTitleProposal.ts — real, direct @anthropic-ai/sdk,
           in the prerequisite, not in T1
NEXT       UNDERSTAND — authorization required
```

Held throughout: 500 reproduction · T2 · C3/C5 · Cuts 3–4 — not entered.
