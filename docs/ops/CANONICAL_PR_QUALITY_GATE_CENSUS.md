# CANONICAL-PR-QUALITY-GATE-01 — census

**Date:** 2026-08-30 · **Evidence class:** SOURCE · **READ-ONLY.** No workflow changed.
**Found via:** PR #1150, which presented 6/6 green while neither typecheck nor any unit test ran.

> **The property to establish:** a PR whose deployment target is `clean-main-no-secrets` must not be
> able to present all-green required checks while neither TypeScript nor relevant unit tests have run.

---

## 1 · The integration target is not the gated branch

```text
origin/clean-main-no-secrets   last commit 2026-08-28   ← production deploys FROM here
origin/main                    last commit 2026-04-10   ← 4½ months stale
divergence                     main-only 3081 · clean-main-only 185
```

`CLAUDE.md`'s own deploy command reads `origin/clean-main-no-secrets`. **`main` is not the
deployment target and has not moved since April.**

## 2 · Where the gates live, and what they gate

| workflow | PR trigger | carries |
|---|---|---|
| `deploy.yml` | `branches: [main]` | ⚠️ the repo's **only non-swallowed** `npm run typecheck` |
| `mobile-deploy.yml` | `branches: [main]` | `npm run typecheck \|\| echo …` — swallowed |
| `docker-build.yml` | *(no branch filter)* | Docker image build only. **This is the green check named `build`.** |
| `covenant-gates.yml` | *(no branch filter)* | classification/governance |
| `jarvis-epistemic-guard.yml` | `branches: [clean-main-no-secrets, main]` | ⭐ **already gates canonical, and does not swallow** |
| `sovereignty-gate.yml` | runs on canonical | sovereignty checks |

So on a PR to `clean-main-no-secrets`:

```text
typecheck    never runs — its workflow is bound to a branch that is not the target
unit tests   never run
green means  Docker built · governance labels · sovereignty · diagrams · epistemic axis 1
```

## 3 · Tracing the test command to its exit status

⛔ **Do not add another gate that cannot fail.** Both existing test invocations are swallowed:

```text
deploy.yml:58   npm run test:ci || true
deploy.yml:99   npm run test:integration || true
```

The command itself is sound — the swallowing is the defect:

```text
test:ci  =  npm run lint && npm run test:coverage
         =  next lint  &&  jest --config jest.config.js --coverage
```

`&&` chains correctly, so `test:ci` **does** exit nonzero on a lint or test failure. Invoked without
`|| true` it would be a real gate.

⚠️ **But its current state on canonical is UNMEASURED.** It runs `next lint` plus jest over **349
test files**. If either is currently red on `clean-main-no-secrets`, making it blocking turns every
canonical PR red on day one. **That must be measured before it is made blocking**, on a machine with
dependencies — the same discipline that produced this census.

`npm run typecheck` is different: `CLAUDE.md` defines it as the enforced **no-regression** gate
against `typecheck-baseline.json`, designed to be green and to fail only on a *new* diagnostic. It is
already safe to make blocking.

## 4 · Proposal — two stages, not one

**Stage 1 — typecheck, now.** A small dedicated workflow on `pull_request: branches:
[clean-main-no-secrets]` running `npm run typecheck`, unswallowed.

⛔ **Not by adding the branch to `deploy.yml`'s trigger.** That workflow also carries browser tests,
Docker, staging and production deploy jobs; widening its trigger would attach deployment machinery to
every canonical PR. The precedent to follow is `jarvis-epistemic-guard.yml`, which already gates
`[clean-main-no-secrets, main]` in its own file, does not swallow, and states in its header exactly
what a green run establishes "and no further."

**Stage 2 — the test gate, after measurement.** Run `npm run test:ci` on canonical once and record
the result. If green, add it unswallowed. If red, the finding is *that*, and the gate waits on it
rather than being pre-emptively neutered with `|| true`.

## 5 · What this unit is not

```text
not "improve CI"
not a change to #1150 — that PR is unaffected and must not absorb this
not a fix for main's staleness — whether main should be retired is a separate question
not the browser/deploy machinery in deploy.yml
```

## 6 · Open question for the founder

`main` is 3081 commits from the deployment target and four months stale, yet three workflows still
gate it. Either it is a live target that should be re-synced, or it is dead and its workflows are
gating nothing. **This census does not decide that** — but Stage 1 should not be written in a way
that assumes the answer.
