# MEDIA PATH-CONTAINMENT — CANONICAL ADMISSION CLOSURE

**Standing**: `CANONICAL ADMISSION VERIFIED · DEPLOYMENT UNAUTHORIZED`
**Date**: 2026-09-23

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Canonical merge

```
canonical merge commit   6d745a4d3d90afe155854891780fcf494d56327a
  parent 1 (base)        675bc8ae3951dc91e18d67815c65d7d88e961625
  parent 2 (admitted)    60126fd159f5bf299610c8a353303191fc2a946c
PR                       #1496 · merged
merge method             MERGE COMMIT (⛔ not squash, ⛔ not rebase)
```

⭐ **`60126fd1` survives as an actual parent** and is an ancestor of canonical. The
exact Founder-adjudicated commit identity is preserved in canonical history rather than
replaced by a synthesised one — which is why squash and rebase were prohibited.

## 2. Post-merge custody — 4/4 VERIFIED

| # | check | result |
|---|---|---|
| 1 | canonical tip **is** the merge commit | `6d745a4d` — YES |
| 2 | parents are the pre-merge tip **and** exact `60126fd1` | exact match · `60126fd1` ancestor = YES |
| 3 | witnessed blobs survived | `storage.ts` = **`0e322fe0e74e247e0aed097d4203d18ef65bb135`** · `pathContainment.ts` = `ebfb7a08be6bc5a2045b65b6d87de5c410af97af` |
| 4 | population entering canonical | **exactly the 5 files** — nothing unexpected |

## 3. Freshness rebind

The base moved `840194ba → 675bc8ae` (4 commits) between adjudication and merge. Verified
independently before merging: the **entire** delta is one documentation file
(`CANONICAL-ADMISSION-ENFORCEMENT-01_E2_CUSTODY_CONTRACT_FALSIFIER_DESIGN_2026-09-23.md`),
touching no repair file, caller, workflow, check configuration, build code or
media-storage implementation; and `lib/media/storage.ts` at the new canonical was still
`fce51bb540881f8234253e1b615272309d5d6b5e` — repair surface **zero drift**.

⭐ So the settled **9/9** check evidence carried across the base change without a
redundant rerun. ⚠️ Provenance kept precise: those checks belong to the PR state whose
recorded base was `840194ba`, and GitHub's synthetic merge object had parents `840194ba`
+ `60126fd1`. They did **not** silently become evidence against `675bc8ae`; the founder
accepted them on the doc-only reasoning above, ⛔ not by treating them as re-run.

## 4. Admission mechanism — itself witnessed

The repair entered through the **normal checked path**, not a bypass:

- 9/9 required checks **ran and passed** on the exact adjudicated head
- ⛔ **no direct canonical push**, so no `Bypassed rule violations`
- ⛔ no new SHA, no squash, no rebase, no head mutation, no lane merge

⭐ `CANONICAL-ADMISSION-ENFORCEMENT-01 / E1` is **DESIGN ONLY** and enforced nothing here.
It did not mandate this path — but its documented concern, that bypass destroys the very
admission evidence worth keeping, is why the PR route was chosen for a security repair.
*The admission mechanism survived the governance standard the repair was entering.*

## 5. ⚠️ What canonical admission does NOT establish

```
deployment                NOT AUTHORIZED · NOT PERFORMED
production mutation       NONE
production reachability   UNWITNESSED
filesystem permissions    UNWITNESSED
HTTP route witness        UNWITNESSED — the sink was exercised by direct invocation only
Finding #1                UNTOUCHED — the decorative NODE_ENV guard stands
filename collision        OPEN · pre-existing, widened by sanitization, not created
re-baseline               NOT PERFORMED
```

⛔ **The repair is in canonical. It is not in production.** Nothing about this closure
implies a deploy.

## 6. Custody released

The local tag `admission/media-containment-60126fd1` was removed after this verification
came back green: the object is now an ancestor of canonical, so canonical history is its
durable ref. The remote admission branch `fix/media-path-containment-admission-20260923`
is retained for the moment and may be cleaned up at will.

## 7. Lineage, whole

```
d1c57a45   finding (recorded BEFORE repair code moved)
   └── 66c0ee66   repair candidate · 18/18 + 4/4
          └── 4f37b612   admission witness · typecheck 0 new identities
                 └── 60126fd1   reconciled onto canonical · ed740784 reconciliation record
                        └── #1496 · 9/9 checks green
                               └── 6d745a4d   CANONICAL
```

`CANONICAL ADMISSION VERIFIED · DEPLOYMENT UNAUTHORIZED`
