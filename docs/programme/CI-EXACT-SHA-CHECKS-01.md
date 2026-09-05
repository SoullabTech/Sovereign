# CI-EXACT-SHA-CHECKS-01

```text
LANE     CI-EXACT-SHA-CHECKS-01
BASE     clean-main-no-secrets @ cc257f7ee
BRANCH   claude/ci-exact-sha-checks-01
OPENED   2026-09-05 · founder ruling
CLASS    B — Structural Risk (.github/workflows/)
SCOPE    CI trigger mechanism only. No application code. No Cut 1A change. No deploy.
```

## 1. Why this lane exists

Step 3 of `MAIA-UNIFIED-COGNITION-CONVERGENCE-01` derived a deploy candidate,
`cc257f7ee`, and then could not satisfy the bootstrap-shadow rule's own condition —
*all required CI green on that exact head* — because **no mechanism existed to produce that
evidence**.

The audit, read-only, at `cc257f7ee`:

| Required check | Workflow | Trigger before this lane | Could attest a canonical SHA? |
|---|---|---|---|
| `sovereignty` | `sovereignty-gate.yml` | `pull_request` + `push: [main, clean-main-no-secrets]` | **yes** |
| `build` | `docker-build.yml` | `pull_request:` only | no |
| `check-diagrams` | `check-diagrams.yml` | `pull_request` + `push: [main]` | no — canonical is not `main` |
| `Axis 1 — authoritative adjudication` | `jarvis-epistemic-guard.yml` | `pull_request:` only | no |

No `workflow_dispatch`, `repository_dispatch` or `workflow_call` existed on any
required-check workflow. A commit that is already canonical is, by construction, never the
head of an open pull request — so the rule was **unsatisfiable for any canonical SHA**, not
merely for this one.

> **The governing observation:** a governance requirement that depends on machine-produced
> evidence is incomplete until the repository contains a mechanism capable of producing that
> evidence.
>
> This is the same defect shape as the covenant contradiction repaired in
> `GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01`: written governance describing a process the
> executable governance could not perform. The repair is the same in kind — make the
> mechanism match the rule, not the rule match the mechanism.

**Option rejected:** interpreting "all required CI" as "whatever happens to be runnable."
That would make the rule elastic at exactly the moment it became inconvenient, one hour
after it was ratified.

## 2. Four kinds of evidence, previously conflated

Tonight repeatedly called four different things "CI green." They are not the same claim and
the record now separates them:

```text
REQUIRED CI
  = the required_status_checks configured on the protected canonical branch
  = build · check-diagrams · sovereignty · Axis 1 — authoritative adjudication
  the repository's machine authority for the phrase; nothing else is
  "required CI" merely because it appears on a PR dashboard

PR-ADMISSION EVIDENCE
  = PR-only governance / classification checks (covenant-gates, auto-label,
    and the canonical PR quality jobs when run on a PR)
  attaches to the PR act; retained on the checked PR head / merge lineage

EXACT-CANDIDATE TECHNICAL EVIDENCE
  = canonical-push check-runs whose head_sha EQUALS the deploy candidate SHA
  this is the class that did not exist before this lane

DEPLOY PROVENANCE
  = declared build identity (process.env.GIT_COMMIT)
    + independent runtime artifact attestation
      (build arg → image label → post-swap image/container verification)
  see MAIA-UNIFIED-COGNITION-CONVERGENCE-01 §9.7
```

Separating them is not a lowering of the bar. It stops four different standards being
satisfied by pointing at one green dashboard.

## 3. What changed

| File | Change | Why this one and not others |
|---|---|---|
| `docker-build.yml` | `+ push: [clean-main-no-secrets]`; build tag made event-aware | required check; the job is tree-local |
| `check-diagrams.yml` | push branches `[main]` → `[main, clean-main-no-secrets]` | required check; its push trigger pointed at a branch that has not moved since 2026-04-10 |
| `canonical-pr-quality.yml` | `+ push: [clean-main-no-secrets]` | TypeScript no-regression and Empty-DB reconstruction are tree-local and need no PR metadata |
| `jarvis-epistemic-guard.yml` | `+ push: [clean-main-no-secrets, main]` **and** an event-specific adjudication base | required check — see §3.1 |

**Deliberately unchanged:** `covenant-gates.yml` and `auto-labeler.yml`. These are PR
governance mechanisms — classification, sacred-path discipline, label assignment — and
should stay attached to the PR act. Making them fire on a push would turn a governance
gesture into a post-merge artifact check and would say something they do not mean.

### 3.1 Axis 1 needed more than a trigger

`Axis 1` adjudicates submitted claim records **against a base commit**, and read that base
from `github.event.pull_request.base.sha`. On a push event that expression is empty. Adding
the trigger alone would have left the gate adjudicating against nothing — changing what the
check *means*, not merely where it runs, which is the precise failure this lane exists to
avoid.

The base is now resolved per event, fail-closed:

```text
pull_request → github.event.pull_request.base.sha   (canonical before the PR)
push         → github.event.before                  (canonical before the merge)
             → falls back to HEAD^ when `before` is all-zeros (new branch / force-push),
               because for a merge commit the honest base is its first parent
             → refuses with an error if neither resolves to a real commit
```

### 3.2 A defect found in this lane's own change

`docker-build.yml` tagged its image `maia-sovereign:pr-${{ github.event.pull_request.number }}`.
Under the new push trigger that would have resolved to a bare `pr-`. The tag is now
event-aware: `pr-<number>` on a pull request, `sha-<short>` on a push. Recorded rather than
quietly fixed, because a lane that adds triggers is exactly the lane that should be looking
for PR-context assumptions in the jobs it newly fires.

## 4. What this does not do

```text
no application code            no Cut 1A change          no deploy
no new approval mechanism      no label machinery        no branch-protection change
```

It does **not** grant `cc257f7ee` an exemption. After this lands, the next canonical push
produces required check-runs whose `head_sha` is the canonical commit itself, and the
candidate earns its evidence the ordinary way.

It also does not alter which checks are branch-protection-required. Whether the TypeScript
no-regression gate and Empty-DB reconstruction *should* be added to
`required_status_checks` is a separate decision, deliberately not taken here: this lane
makes them *capable* of attesting a canonical SHA, and says nothing about whether they must.

## 5. Rollback

Revert commit. The four workflows return to their prior triggers; no runtime, schema or data
consequence. The only effect of reverting is that canonical SHAs again cannot earn required
check-runs.

## 6. Consequence for Step 3

```text
candidate cc257f7ee            remains DERIVED
exact-SHA CI                   NOT SATISFIABLE before this lane
                               SATISFIABLE after it, on the next canonical push
deploy                         HOLD
Cut 1A bootstrap-shadow        still requires its own separate sign-off
composite promotion            member-facing lanes still require their own authority
```
