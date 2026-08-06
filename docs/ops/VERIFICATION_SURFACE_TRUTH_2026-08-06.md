# Verification surface — what actually enforces, and what only claims to

**Recorded:** 2026-08-06
**Scope:** correction of a false control surface. **No gate was added, removed, or
broadened.** Where a divergence was found, it is recorded, not resolved.
**Measured against:** live tree at `clean-main-no-secrets` (`f9a7326f1`) and a live
production run on `b1399f693`.

> Governing distinction: **a documented gate, an installed local hook, and a CI/branch
> protection check are three different things.** Only the third can block a merge. Citing
> one as if it were another is how a description becomes mistaken for a control.

---

## 1. The three layers

| layer | what it is | binding? |
|---|---|---|
| **Documented gate** | a rule written in a doc (`CLAUDE.md`, an ops doc, a canon doc) | No. Binds by intent only. |
| **Installed local hook** | pre-commit / pre-push on one machine | Locally, and only after an installer has been run. Bypassable with `--no-verify`. Absent in CI. |
| **CI / branch protection** | a required status check | Would block a merge — **but no sovereignty or constitutional check currently runs in CI.** |

**Finding: nothing in this repository structurally blocks a merge on a sovereignty or
constitutional check today.** `.github/workflows/deploy.yml` has its deploy job disabled
(`if: false`, server unreachable), and no workflow invokes
`scripts/constitutional-verification.sh` or any `verify-constitution-*.ts`.

Local hooks and deploy-time smoke tests are real controls. They are not merge controls.

---

## 2. Defect A — `CLAUDE.md` cited a script that does not exist

`CLAUDE.md` declared, as MANDATORY before tester invites:

> No invite unless `verify-colab-boundaries.ts` passes 31/31 in production.

**`scripts/verify-colab-boundaries.ts` does not exist in the tree**, and no commit in
reachable history adds it under that name. The gate was refactored into five verifiers:

| verifier | blocking? |
|---|---|
| `scripts/verify-constitution-colab.ts` | **yes** |
| `scripts/verify-constitution-memory.ts` | **yes** |
| `scripts/verify-constitution-relationships.ts` | **yes** |
| `scripts/verify-constitution-development.ts` | no |
| `scripts/verify-constitution-maia.ts` | no |

Orchestrated by `scripts/constitutional-verification.sh`; blocking status is the third
field of its `VERIFIERS` array.

**The `31/31` count was also wrong.** Live production run, 2026-08-06 on `b1399f693`:

```
Co-Lab: 33 passed · 0 failed · 0 warned
MAIA:    6 passed · 0 failed · 6 warned
Release gate: PASSED
```

Both the name and the number were stale. A citation this precise — a named script and an
exact count — reads as more verified than a vague one, which is what made it durable.

**Corrected to a pass condition that cannot go stale:** `0 failed`. Totals grow as checks
are added; a fixed count guarantees future drift.

**Second-order finding:** the suite reports **"Release gate: PASSED"** while a non-blocking
verifier carries warnings — MAIA had 6. Green means *no blocking verifier failed*, not
*everything is clean*.

---

## 3. Defect B — two hook installers producing different gates

| installer | mechanism | pre-commit checks produced |
|---|---|---|
| `scripts/setup-githooks.sh` **(correct, documented)** | writes its own body into `$(git rev-parse --git-common-dir)/hooks` | branch guard · `check:no-supabase` · `check:no-openai` |
| `scripts/dev/setup-hooks.sh` **(do not run)** | `git config core.hooksPath .githooks` → activates `.githooks/pre-commit` | branch guard · `check:no-supabase` · `check:no-inline-names` · `check:no-phi-enc` · `check:phi-inventory` · `check:no-direct-anthropic` |

**Neither list is a superset of the other.** `check:no-openai` runs only under the correct
installer; the PHI and inline-name checks only under the other. **Which checks protect a
given machine depends on which script that developer happened to run.**

`check:no-direct-anthropic` is knowingly RED — `setup-githooks.sh` omits it deliberately
(comment at line 14) — so activating the dev installer can block every commit on a
known-failing check.

`.githooks/pre-commit` is therefore **not dormant**. It is one `core.hooksPath` away from
becoming the live gate. Its header now records this; the file was not deleted, because
deleting it would change enforcement behavior for anyone who has run the dev installer.

**Recorded, not resolved.** Unifying the two gates would broaden enforcement, which was
explicitly out of scope. It remains open work.

### Verified installed state (this machine, 2026-08-06)

`core.hooksPath` → `.git/hooks`. A beads wrapper owns `pre-commit` and chains
`pre-commit.old`, which holds the sovereignty body: branch guard, `check:no-supabase`,
`check:no-openai`. Dated Jul 12.

To check any machine:
```bash
git config core.hooksPath; grep -oE "npm run check:[a-z-]+" "$(git rev-parse --git-common-dir)/hooks/pre-commit.old"
```

---

## 4. Consequence for the Writer MAIA containment gate

`docs/canon/WRITER_MAIA_FIELD_CONTAINMENT_2026-08-06.md` §4.3 states that
`check:writer-containment` is wired into the pre-commit gate written by
`setup-githooks.sh`. That is true of the **generator** and false of what currently **runs**:
the installed `pre-commit.old` predates the change and does not include it. It activates
only after `./scripts/setup-githooks.sh` is re-run.

Left for a separate commit on the containment branch — not corrected here, to keep the
containment lane and this correction from entangling.

---

## 5. What was NOT done

- No gate added, removed, or broadened.
- The two hook installers were **not** unified.
- `.githooks/pre-commit` was **not** deleted.
- `check:no-direct-anthropic` was **not** un-redded or re-enabled.
- No CI workflow was enabled, and no branch protection was configured.

The goal was a truthful verification surface, not a more impressive one.
