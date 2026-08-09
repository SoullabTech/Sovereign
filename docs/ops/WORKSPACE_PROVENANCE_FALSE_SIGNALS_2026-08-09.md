# Workspace provenance produced two false signals in one lane

**Date:** 2026-08-09 · **Class:** evidence for Builder OS `/orient`. **Not a repair lane — nothing here was fixed.**

Both incidents occurred while landing PR #996 (a two-file security repair). Neither was a code defect. In both, **a reading was an artifact of workspace provenance rather than of the thing being read.**

---

## Incident 1 — a branch name that named a different history

`git branch --show-current` reported `clean-main-no-secrets`. That was true and useless.

```
local  clean-main-no-secrets : f9a7326f1
origin/clean-main-no-secrets : ced4ab513
ahead/behind                 : 18 / 402
```

A security branch cut from the local ref inherited 18 unpushed doc commits and was 402 commits stale. The PR opened at **56 files / +9,655 / CONFLICTING** instead of 2 files / +171. Caught only because the review boundary was stated in advance as an explicit number.

**The useful orientation fact is not the branch name.** It is:

```
branch identity = name + worktree + HEAD SHA + upstream + ahead/behind + dirty state + detached?
                + whether the intended branch point is local or remote canonical trunk
```

A session that checked "am I on `clean-main-no-secrets`?" would have been *reassured into* the error. Eighteen ahead / four hundred and two behind is a different historical world wearing the same name.

## Incident 2 — a green gate that reported red, from a stale cache

`npm run typecheck` reported **`❌ NEW diagnostics (4)`** in `app/wisdom-keepers/sacred-texts/page.tsx` and `components/focus/{AvoidanceBreaker,InboxTriage,NextStepBuilder}.tsx`. This was reported upward as *"trunk is red"* and treated as a merge blocker requiring a prerequisite repair.

**It was false.** The same commit, checked out in a pristine worktree, passes:

| Worktree | Provenance | Result |
|---|---|---|
| `p0fix` | created from stale local trunk, later `reset --hard` onto origin | ❌ 4 NEW diagnostics |
| `verify996` | created directly from `origin/fix/...` | ✅ no regressions |
| `trunkfix` | created directly from `origin/clean-main-no-secrets` | ✅ no regressions |

Root cause: **`tsconfig.ship.tsbuildinfo`** — a gitignored incremental-compilation cache. It survives `git reset --hard` and `git checkout`, because git does not manage ignored files. When `p0fix` was re-pointed from a 402-commits-behind base onto `origin`, the cache retained outputs computed against the old inputs, and `tsc --incremental` reused them. Deleting the single file made the identical checkout go green:

```bash
cd <worktree> && rm -f tsconfig.ship.tsbuildinfo && npm run typecheck   # ✅ No TypeScript regressions
```

⚠️ **The gate is not hermetic.** It can report a failure that exists in no source file, and — the more dangerous direction — nothing here proves it cannot report a pass over stale inputs. `npm run typecheck` green is documented in CLAUDE.md as meaning *"nothing got worse."* This adds: **only if the cache matches the checkout.**

**Consequence for the record:** there was never a trunk defect. `origin/clean-main-no-secrets` @ `ced4ab513` is green. No prerequisite repair existed; the branch opened to make one (`fix/typecheck-trunk-four-diagnostics`) was discarded without a commit.

---

## The pattern this lane has now produced three times

| # | The apparent fact | What was actually true |
|---|---|---|
| 1 | `delete-my-memory` appeared safe | Its tables did not exist. Failure by accident. |
| 2 | `premium-storage/export` DELETE appeared safe | `ExportArchive` had no table. Failure by accident. |
| 3 | Trunk appeared red | A stale build cache. Failure by artifact. |
| — | A branch appeared to be trunk | It was 402 commits behind. Identity by name only. |

The security form was already stated: **missing infrastructure is not authorization; failure by accident is not a control.** These two add the epistemic form:

> ⭐ **A tool's output is only as trustworthy as the provenance of the workspace that produced it.**
> Establish provenance before believing a reading — especially a reassuring one.

Both failure classes are **set-membership drift** again: a governed population (routes; source files) with members that can enter or leave outside the mechanism that is supposed to know about them.

## Preserved, not built

Per founder instruction, no orientation mechanism is proposed or implemented here. Two facts are preserved for Builder OS `/orient`:

1. Branch identity must be a **tuple**, not a name.
2. Gate output must be attributable to a **known-clean workspace**, or the gate must be made hermetic (e.g. cache keyed to HEAD, or removed before the run in CI).

Neither is authorized work. This document is evidence.
