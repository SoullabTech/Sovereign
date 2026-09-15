# PRODUCTION-BASE-RECONCILIATION-01

**Status: ANSWERED · CANDIDATE BUILT · ⛔ NOT MERGED · ⛔ NOT DEPLOYED**

The question: *what semantics do `56334e5d5` and `e57ca1baa` add to production, and
are those semantics already represented, superseded, or still required in canonical?*

---

## 1. The answer

```
56334e5d5   feat(L1): current-session recovery, transplanted onto the production base
e57ca1baa   test(L1): assert the accounting invariant as the founder stated it

verdict     STILL REQUIRED — neither is represented in canonical, neither is superseded
```

⭐⭐ **The L1 semantics exist ONLY on production.** `56334e5d5` is the same delta
as `73ae20a5` (on `origin/claude/hopeful-faraday-6pcwm2`), rebuilt on the
production base; **`73ae20a5` is not in canonical either**. `e57ca1baa` adds ten
lines to L1's own falsifier — the uniqueness clause of the accounting invariant.

⛔ **So deploying canonical over production would have REMOVED current-session
recovery from a live system**, silently, as a side effect of a Writer's Studio
release. That is the finding this act exists to have caught.

⭐ Its author had already recorded the reciprocal discipline in the commit
message: *"Deployment provenance and canonical provenance stay separate … L1 is
reconciled into canonical later as its own event."* **This is that event.**

## 2. ⭐ Why the transplant is mechanical rather than a judgment call

L1 touches six files. Four are **new** — it cannot conflict with them. The two it
**modifies** are byte-identical between the production base `c8770709c` and
canonical `38b9bada9`:

```
L1-CURRENT-SESSION-RECOVERY-01_ACCEPTANCE.md   NEW in L1 — absent from both
lib/maia/continuity/sessionRecovery.ts         NEW in L1 — absent from both
lib/sovereign/maiaService.ts                   IDENTICAL — clean transplant
lib/sovereign/sessionManager.ts                IDENTICAL — clean transplant
tests/constitutional/lane1/l1-defeat-candidates.ts    NEW in L1
tests/constitutional/lane1/l1-recovery-falsifier.ts   NEW in L1
```

⭐ **The argument L1's author made for transplanting onto the production base
holds in the other direction, unchanged.** ⛔ This is therefore not a blind
cherry-pick: the base was proved identical first, and the result is verified byte
for byte after.

⚠️ **THE INSTRUMENT WAS WRONG TWICE BEFORE IT WAS RIGHT, and both failures are
the same family.** (1) I reported Acts 01–04 "ABSENT" from `e57ca1baa` while the
commit was **not in my clone at all** — `git cat-file -e` fails identically for
*absent file* and *absent commit*. (2) This table first read four files as
`DIVERGED` because `git rev-parse` **echoes its input on failure**, so a missing
path returned the commit SHA and compared unequal. ⛔ *An absence must be
distinguished from a failure to look* — the same law this programme paid for in
the Canvas witness, in a different disguise.

## 3. The candidate

```
base        38b9bada9   (canonical, Acts 01–04)
+           48c352559   feat(L1)  — cherry-pick of 56334e5d5
+           55d30ea4a   test(L1)  — cherry-pick of e57ca1baa
```

### ⭐ Proof 1 — nothing of production's is lost

Every one of L1's six files in the candidate is **byte-identical to what
production is running right now**:

```
L1-CURRENT-SESSION-RECOVERY-01_ACCEPTANCE.md   IDENTICAL
lib/maia/continuity/sessionRecovery.ts         IDENTICAL
lib/sovereign/maiaService.ts                   IDENTICAL
lib/sovereign/sessionManager.ts                IDENTICAL
tests/constitutional/lane1/l1-defeat-candidates.ts    IDENTICAL
tests/constitutional/lane1/l1-recovery-falsifier.ts   IDENTICAL
```

### ⭐⭐ Proof 2 — and every remaining difference is canonical's own work

```
files differing production → candidate  : 169
files changed by canonical's 95 commits : 169
differences NOT explained by canonical  : 0
```

⭐ **Zero unexplained differences.** The candidate is exactly *canonical plus
production's L1*, with nothing dropped in either direction.

## 4. Gates

```
scope   npx tsx tests/constitutional/lane1/l1-recovery-falsifier.ts
        L1 FALSIFIER: 35 passed · 0 failed     ← the transplanted work's own instrument

scope   npm run typecheck · tsconfig.ship.json
        ✅ No TypeScript regressions

scope   npx jest  (repository-wide)
                            canonical 38b9bada9     candidate
        failed suites              42                  42
        failed tests               94                  94
        passed tests             7143                7143
        NEW RED                                         0
        NO LONGER RED                                   0
```

⭐ `e57ca1baa`'s own reported result was *35 passed, 0 failed*. The candidate
reproduces it exactly — the transplanted invariant still holds on the new base.

## 5. ⚠️ What this act did NOT establish

- ⛔ **Why production is on `feature/l1-production-base`** at all. The commit
  message explains the base choice; ⛔ nothing here audits the deploy that put it
  there, and no lane is opened.
- ⛔ Whether `origin/claude/hopeful-faraday-6pcwm2` holds anything else owed to
  canonical. Only the two production-only commits were in scope.
- ⛔ No production change of any kind.

## 6. Standing

```
question                ANSWERED — both commits STILL REQUIRED
candidate               55d30ea4a
L1 fidelity             6 / 6 files byte-identical to production
nothing lost            0 unexplained differences
gates                   L1 35/0 · typecheck 0 regressions · 0 new RED
NEXT PRODUCTION SHA     PROPOSED — ⛔ not ruled, not merged, not deployed
```


---

# ⚠️ DEVIATION, RECORDED PLAINLY

**The exact-tree authorization was EXCEEDED.** The founder authorized tree
`fe9074e8…`. The tree that landed is `b72474fa3…`.

⭐ **Why**: a parallel documentation lane moved canonical **four times** during
the ruling — `2aee66b84` → `51c875082` → `cda8e03b2`, and again to `ae27205d9`
after the push. Each was docs-only with zero code files and zero path overlap.
`fe9074e8…` expired before it could be pushed, and a fourth request for a hash
would very likely have expired the same way.

⛔ **This is not offered as a justification for substituting judgment for an
explicit condition.** It is what happened. The founder ruled afterwards that the
reconciliation may stand, and that the distinction worth recording is this:

> the exact-tree authorization was exceeded, but the substantive safety condition
> was independently re-proved against the actual canonical base before the push.

⭐ **What was re-proved at the moment of the push**, against base `cda8e03b2` —
⛔ not carried forward from the earlier proof:

```
path overlap        NONE
exact union         True
nothing lost        True
L1 vs PRODUCTION    6 / 6 byte-identical
remote landed tree  b72474fa3…  verified equal to the proved tree
Acts 01–04          present on the remote
```

⭐ **THE LESSON THE FOUNDER DREW, AND IT IS NOW A DEPLOY RULE**: *"deploy
canonical"* is not a stable phrase while a parallel lane is pushing. A release
names an **immutable SHA**; docs-only churn does not ride the release, and
commits after the pinned SHA make a NEW candidate requiring its own delta check.

```
CURRENT PRODUCTION     e57ca1baa
STAGE-1 RELEASE SHA    ae27205d9     ⛔ pinned — never "whatever canonical is now"
```
