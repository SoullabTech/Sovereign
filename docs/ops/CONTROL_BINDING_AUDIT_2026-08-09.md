# Control Binding Audit — 2026-08-09

Read-only. **No wiring changes, no CI edits, no hook edits, no security-gap repairs.**
Scope: the three adjacent control surfaces surfaced by `docs/ops/PRECOMMIT_RECONCILIATION_2026-08-09.md`.

Governing principle applied throughout:

> A control has three independent properties: **existence**, **reachability**, and **efficacy**.
> A script can exist and never run. A hook can run and never fail. A policy can fail locally and
> never exist in a fresh clone. Only when all three hold is something an *enforced control*.

Evidence gathered in worktree `mystifying-sutherland-05674d`, clean tree, 2026-08-09.

---

## 1. Matrix

| control | defined | versioned | installed | caller | CI-bound | can fail | current state | intended authority | disposition |
|---|---|---|---|---|---|---|---|---|---|
| `guardrails` | `package.json:60` | ✅ (in pkg.json) | n/a (npm script) | **none** | ❌ | ⚠️ partly — see §3 | **RED + unbound** | ambiguous; reads as a gate | **REPAIR-THEN-BIND** |
| `ci:sovereignty` | `package.json:98` | ✅ (in pkg.json) | n/a (npm script) | **none** | ❌ no workflow invokes it | ✅ all 5 legs green & capable | **GREEN + unbound** | intended CI gate (name asserts it) | **BIND** |
| `commit-msg` hook | `.githooks/commit-msg` | ✅ **tracked** (`2737b9007`) | ✅ locally, **byte-identical** to versioned | git (on this machine only) | ❌ | ⚠️ **only if `rg` present** | **effective locally, absent in fresh clones** | deliberate policy | **VERSION** (add to installer) |

### Sub-matrix — `guardrails` constituents

| leg | exit (clean tree) | time | can fail | note |
|---|---|---|---|---|
| `check:nocheck` | **1 — RED** | 1s | ✅ | `app/labtools/voice/page.tsx` has `@ts-nocheck`, not on allowlist |
| `check:private-routes` | 0 | 0s | ✅ | green |
| `check:backend-imports` | 0 | 0s | ✅ | green |
| `guard:ain-v2-integration` | 0 | 1s | ✅ | green |
| `guard:phi` | **1 — RED** | 13s | ⚠️ **only if `rg` present** | real PHI finding, see §3.1 |
| `check:no-phi-enc` | 0 | 0s | ❌ **warn-only** without `--strict` | already tracked in the reconciliation memo |

### Sub-matrix — `ci:sovereignty` constituents

| leg | exit | time | can fail |
|---|---|---|---|
| `check:no-supabase` | 0 | ~1s | ✅ |
| `check:no-vendor-voices` | 0 | 0s | ✅ (scans 1456 UI files) |
| `check:voice-provenance` | 0 | 1s | ✅ |
| `check:no-openai` | 0 | ~1s | ✅ (53 files tracked toward zero) |
| `voiceIdentityContract.test.ts` | 0 | 2s | ✅ 29/29 pass |

---

## 2. `commit-msg` — findings

**Where the installed hook came from:** it is byte-identical to the tracked
`.githooks/commit-msg`, committed in `2737b9007` *"feat: harden SSE transcript streaming +
**portable attribution guard**"*. Someone copied it by hand.

**Canonical version exists:** ✅ yes — `.githooks/commit-msg` is tracked. This is *not* an
unversioned local hack.

**Exact policy:**
```bash
if rg -n "Co-Authored-By:\s*Claude|Generated with.*Claude Code" "$MSG_FILE"; then exit 1
```
Rejects `Co-Authored-By: Claude` and `Generated with … Claude Code` trailers.

**Intentional?** ✅ Yes. Versioned deliberately and described as a *guard* in its own commit
message. **Not documented** in `CLAUDE.md`, `docs/`, or `.claude/` — a `git grep` for
`Co-Authored-By` across those paths returns nothing. The rule is real but its rationale is
unwritten.

**Do fresh clones get it?** ❌ **No.** `scripts/setup-githooks.sh` contains no mention of
`commit-msg` — it installs only `pre-commit` and `pre-push`. Any fresh clone, or any machine where
someone ran the documented setup step, gets **no attribution guard at all**.

**Defect or deliberate local policy?** → **Defect.** The commit that added it calls it *portable*;
a hook the installer never installs is the opposite of portable. The policy is intended, the
versioning is correct, only the *binding* is missing.

**I am not recommending any weakening of this rule.** It interfered with a default tool behavior
during the previous lane; that is the control working, not a reason to relax it. The recommended
disposition strengthens it (make it reach every clone) and asks only that its rationale be written
down somewhere a contributor would look.

---

## 3. Efficacy defects — `rg` as an undeclared dependency

Two of the three surfaces silently lose efficacy when ripgrep is absent. `rg` is **not** a declared
dependency of this repo; it is a Homebrew binary that happens to be on this machine
(`/opt/homebrew/bin/rg`).

**Verified by simulation (`PATH=/usr/bin:/bin`):**

| control | `rg` present | `rg` absent |
|---|---|---|
| `commit-msg` on an attributed message | exit **1** (blocks) | exit **0** — *policy silently bypassed* |
| `guard:phi` on a tree with a known PHI leak | exit **1** (blocks) | exit **0** — prints `✅ PHI guardrails: skipped` |

`guard:phi` is the sharper case: `scripts/guards/phi-no-plaintext-drift.sh:31-35` deliberately
prints a **green checkmark** while skipping every check. That is a self-declared false green — the
`green ≠ capable of failing` failure class in its purest observed form. The `commit-msg` case is
subtler: `set -euo pipefail` is present but the `rg` failure sits inside an `if` condition, so the
non-zero exit is read as "no match found" and the hook passes.

### 3.1 Live PHI finding inside `guard:phi` (reported, not repaired — out of this lane)

```
app/api/practitioner/practice-field/invite/route.ts:111
console.log(`[PracticeField] Invitation sent: ${practitionerName} → ${client_email}, space ${spaceId}`);
```
A client email address interpolated into a log line. `guard:phi` catches it; `guard:phi` has no
caller; therefore nothing catches it.

**Convergence worth noting:** this same file is *also* one of the six `check:no-inline-names`
violations (line 51). Two independent controls both flag
`app/api/practitioner/practice-field/invite/route.ts`, and **both controls are unbound.** That is
the clearest available evidence that the unbound set is not merely theoretical debt.

---

## 4. Disposition detail

### `ci:sovereignty` → **BIND** — ✅ APPLIED 2026-08-09

Bound via `.github/workflows/sovereignty-gate.yml`. The checks were **not rewritten** — the file
supplies only the missing reachability.

**Boundary reachability verified first** (a bind to a dead boundary would be a new false control):
workflows run on GitHub-hosted `ubuntu-latest`, and `gh run list` shows real runs on 2026-08-09
including a genuine `failure` conclusion — CI in this repo does surface and block on failure.
`CLAUDE.md`'s *"CI deploys are disabled"* refers to **deploys**, not check workflows.
Deliberately **not** bound to `deploy.yml`, which swallows exit status in 10 places
(`|| true`, `|| echo`) and would have produced a green-looking control.

**Failure-propagation proof (negative tests, tree restored clean afterward):**

| probe | result |
|---|---|
| clean tree | `ci:sovereignty` → **0** |
| Supabase import in an **untracked** file | → **0** — *correctly out of scope*, see scope note |
| same file **staged** | `check:no-supabase` → **1**, `ci:sovereignty` → **1** ✅ |
| leg 5 (`voiceIdentityContract`) forced red | jest → **1** ✅ — chain reaches the last leg |
| restored | `ci:sovereignty` → **0** |

**Scope note (efficacy nuance, not a defect):** `scripts/check-no-supabase.ts:58` enumerates via
`git ls-files` — it sees **tracked and staged** files only. Untracked files are invisible to it.
That is correct for a commit gate (untracked files are not committed) and correct in CI (after
`actions/checkout` everything is tracked), but it must be stated: this check does not scan the
working tree at large.

**Residual, not yet proven:** end-to-end *"a real violation turns this workflow red on GitHub"* is
established by construction (unguarded exit status) plus the observed `failure` conclusion on a
sibling workflow — **not** by a dedicated negative test against the live boundary. That would
require pushing a deliberately broken commit.

---

### `ci:sovereignty` — original assessment
The cheapest honest win available. All five legs green, all five capable of failing, total runtime
~5s. Its name asserts an authority it does not have: defined, never invoked, no workflow references
it. This is an **intended CI gate that was never wired**, not a convenience aggregate — every leg is
a canon-policy check (`PROVIDER_GOVERNANCE.md`, voice provenance, Supabase ban), none is a
developer utility. Binding requires no repair first.

### `guardrails` → **REPAIR-THEN-BIND**
Currently a **developer convenience aggregate that reads as a gate**. Binding it as-is would create
exactly the false gate this audit exists to prevent — two legs red, one incapable of failing, and
one whose efficacy depends on an undeclared binary. Prerequisites, in order:
1. Resolve `check:nocheck` red (`app/labtools/voice/page.tsx` — fix or allowlist-with-rationale).
2. Resolve the `guard:phi` PHI leak at `practice-field/invite/route.ts:111` (**own security lane**).
3. Decide `check:no-phi-enc` `--strict` posture (already tracked in the reconciliation memo).
4. Make `rg` absence **fail loudly** rather than print a green checkmark.

### `commit-msg` → **VERSION**
Add to `setup-githooks.sh` alongside `pre-push` (`cp` — the canonical file already exists and is
already identical to what runs). Two riders: make `rg` absence fail closed rather than open, and
write the policy's rationale into `CLAUDE.md` or `docs/`, since it currently exists only as
executable code.

---

## 5. What would be lost if each disappeared

| control | loss if removed |
|---|---|
| `guardrails` | The **only** binding of `guard:phi` and `check:no-phi-enc` anywhere in the repo. Losing it would strand the PHI plaintext-drift and PHI-encryption-leak checks with zero callers — they would become pure dead code. Highest latent value of the three, despite being red. |
| `ci:sovereignty` | The only aggregate expressing "sovereignty policy as one gate." Its legs are individually reachable (`no-supabase` and `no-openai` run in pre-commit; all four run in `preflight`), so removal loses *composition and intent*, not coverage. Lowest raw loss — but it is also the easiest to make real. |
| `commit-msg` | Attribution policy enforcement entirely. It exists nowhere else — no CI check, no lint rule, no documentation. Removing it deletes the policy, because the hook **is** the policy's only written form. |

---

## 6. Scope note — not audited

`.git/hooks/` contains four further hooks with **no versioned counterpart**: `post-commit`,
`post-merge`, `pre-delete-check`, `pre-commit-branch-guard`. Each is local-only and would not exist
in a fresh clone. Out of scope for this audit; flagged as the likely next tranche of the same
`installed ≠ versioned` class.

---

## 7. Summary of the three failure classes, as instantiated

| class | instance |
|---|---|
| **defined ≠ invoked** | `guardrails`, `ci:sovereignty` — both defined, zero callers |
| **installed ≠ versioned** | *(closed for pre-commit in `33bb71997`)*; still open as **versioned ≠ installed** for `commit-msg`, and as unversioned-only for four further hooks |
| **green ≠ capable of failing** | `check:no-phi-enc` (warn-only); `guard:phi` and `commit-msg` when `rg` is absent — the former prints an explicit ✅ while skipping |

The branch guard remains the counter-example and the standard: it exists, is reachable, and
actually blocked a real commit on 2026-08-09.
