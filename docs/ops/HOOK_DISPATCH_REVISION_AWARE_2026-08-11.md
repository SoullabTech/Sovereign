# Revision-aware hook dispatch — repair record (2026-08-11)

**Status:** REPAIRED ON BRANCH · PROVEN IN ISOLATION · **NOT INSTALLED, NOT MERGED**
**Branch:** `chore/hook-dispatch-revision-aware` (off `origin/clean-main-no-secrets`)
**Follows:** `PRECOMMIT_RECONCILIATION_2026-08-09.md` · `JARVIS_HOOK_CUSTODY_CLOSURE_PROOF_2026-08-10.md` · `GIT_HOOK_CUSTODY_AUDIT_2026-08-10.md`

---

## 1. Root cause

Git hooks are installed once into the **common** git dir and are therefore shared by every linked worktree. Tracked governance policy in `.githooks/` is **per-revision**. `setup-githooks.sh` bridged the two in the wrong direction:

```sh
HOOKS_DIR="$(git rev-parse --git-common-dir)/hooks"      # SHARED across worktrees
cp "$(git rev-parse --show-toplevel)/.githooks/pre-commit" …   # ONE revision's policy
```

Lines 21, 54 and 68 did this for `pre-commit`, `pre-push` and `commit-msg` respectively. **One worktree's contract silently governed all the others.**

This is not a regression from #1013 — it is #1013's fix meeting a case it did not model. #1013 correctly killed hook drift by making installed ≡ committed. That identity is only coherent when there is exactly one checked-out revision. With N worktrees at N revisions, **identity with one revision is non-identity with the other N−1**.

### Both failure directions were live on 2026-08-11

| Direction | Effect |
|---|---|
| Worktree at an **older** revision | `chore/relational-geometry-program` (forked at `7c9dd5192`, predating the Experience Contract gate) could not commit at all: `Missing script: "check:design-canon"`. The gate was unsatisfiable, not unmet |
| Worktrees at **newer** revisions | The installed copy was *stale*: it carried `check:design-canon` but had lost trunk's dependency preflight, `check:no-direct-anthropic` and `check:phi-gate`. **Enforcement was weaker than the repository believed** |

The second is the more serious. A gate that blocks loudly gets fixed; a gate that quietly stops running does not.

---

## 2. The invariant

> For any worktree **W** at revision **R**, `git commit` in W executes the governance policy defined by **R** — never a policy copied from another worktree or branch.

Corollary, and the rule for future editors: **the shared file carries mechanism; the revision carries policy.** A check added to the shared dispatcher is a check in the wrong file.

---

## 3. Repair

**`.githooks/dispatch` (new)** — a shared bootstrap containing *no policy*. It:

1. derives which hook it stands in for from its own installed name (`pre-commit.old` → `pre-commit`, preserving the beads chaining target);
2. resolves the invoking worktree with `git rev-parse --show-toplevel` — asked of Git, not assumed from `$PWD`, so nested directories and GUI clients resolve correctly;
3. **fails closed** with an actionable message if the revision-local policy is missing or unreadable;
4. `exec`s the policy, which preserves stdin, args and exit status exactly.

`.githooks/{pre-commit,pre-push,commit-msg}` are unchanged — they remain the policy, now versioned with the code they govern and nothing more.

**`scripts/setup-githooks.sh`** installs `.githooks/dispatch` under each hook name instead of copying policy. The beads chaining wrapper and its worktree-safe `--git-common-dir` repair are preserved unchanged.

The no-drift property of #1013 survives: the installed file is still `.githooks/dispatch` verbatim. What changed is that it now has no policy to drift from.

---

## 4. Proof

`./scripts/verify-hook-dispatch.sh` — builds a throwaway repo with two revisions carrying different policies, a worktree at each, one shared hooks dir. **17/17 green.**

| # | Proof |
|---|---|
| P1/P2 | Each worktree runs its own revision's policy; A does not acquire B's newer check |
| P3 | **Installing from the OLD worktree cannot weaken the NEW one** — the original defect, now impossible |
| P4 | **Installing from the NEW worktree cannot block the OLD one** — the converse |
| P5 | Nested-directory invocation resolves the correct worktree |
| P6 | Policy exit code (42) propagates; the commit is blocked |
| P7 | Missing policy **fails closed**, and the failure is visible, not silent |
| P8 | `commit-msg` receives its message-file argument; its rejection propagates |
| P9 | `pre-push` args forwarded and the ref list on stdin survives the `exec` |
| P10 | A policy without the exec bit still runs, via its own shebang |

P7 is deliberate: a revision whose policy cannot be found does not get a free pass. This is the same defect class as `commit-msg` failing open on a missing `rg` binary (closure proof §4) — governance must never become permissive because a file is absent.

---

## 5. Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Re-run `setup-githooks.sh` from the blocked worktree | Unblocks one worktree by installing its *older* policy for everyone — silently drops `design-canon`, `no-direct-anthropic`, `phi-gate` and the dependency preflight elsewhere. This is the defect, applied deliberately |
| `--no-verify` for the blocked commit | Converts an observed governance failure into a sanctioned bypass, and leaves the defect live. Declined by founder ruling, 2026-08-11 |
| Backport `check:design-canon` to the older branch | Treats one symptom. Every future check would re-break every older worktree |
| Make the dispatcher skip checks the revision cannot satisfy | Would let any revision opt out of any check by omission — fails open by design |
| `core.hooksPath` per worktree | Git resolves `core.hooksPath` from shared config; per-worktree config requires `extensions.worktreeConfig`, adding repo-wide state for a problem the dispatcher solves without it |

---

## 6. Scope and residual risk

- **Behaviour change is repo-wide** and takes effect only when `setup-githooks.sh` is re-run. Until then nothing changes.
- **Revisions predating `.githooks/pre-commit`** (added `62e6b001c`, 2025-12-20) will fail closed rather than commit. All currently active branches carry it; verify before archaeology on older history.
- **`commit-msg` still fails open without `rg`** — closure proof §4, unrepaired and out of scope here. The dispatcher does not fix it; it dispatches it faithfully, including its defect.
- Hooks not covered: `post-commit`, `post-merge`, `pre-delete-check`, `pre-commit-branch-guard` are untracked local state with no `.githooks/` counterpart, so they have no revision to dispatch to. `post-*` hooks cannot block a commit, so the exposure is lower — but they are equally unversioned and should be audited separately.

---

## 7. Recommended migration

1. Merge this branch to `clean-main-no-secrets`.
2. Every machine and every worktree owner runs `./scripts/setup-githooks.sh` **once** — from any worktree, since the installed file no longer depends on which one.
3. Verify: `./scripts/verify-hook-dispatch.sh` → 17/17.
4. Spot-check a real pair: commit in a worktree at an older revision and one at trunk; confirm each prints its own revision's checks.
5. Only then retry the commit blocked on `chore/relational-geometry-program`, with no bypass.

**Acceptance case:** the staged Spiritual Bliss research brief on `chore/relational-geometry-program` commits normally, without `--no-verify`, and trunk worktrees lose no checks. That is concrete evidence the execution model is fixed — which is why the brief was left staged rather than forced through.
