# Where release truth lives today — evidence for the founder decision

**Status:** ⛔ **EVIDENCE ONLY. Nothing wired. No option recommended as a ruling.**
**Referent:** `origin/clean-main-no-secrets` @ `ee91aedf7`.
**Question posed:** *Where does Soullab want truth about release readiness to live — developer
machine, deployment gate, or CI?*

This measures what each location **is today**, so the decision rests on state rather than intent.

---

## 0. ⚠️ Correction to an earlier finding in this lane

Earlier today this lane recorded: *"`scripts/verify-colab-boundaries.ts` does not exist → the Co-Lab
Release Gate as written is a description, not a boundary."*

**The first half is true; the conclusion was wrong.**

The file does not exist **under that name**. The gate itself exists as
**`scripts/verify-constitution-colab.ts`** — same header, *"Co-Lab Boundary Verification Matrix …
verifies that the Co-Lab sovereignty boundaries are structurally enforced — not just assumed."* Its
own usage comment still says `verify-colab-boundaries.ts`, so the file was renamed and neither the
comment nor CLAUDE.md followed.

**And it is wired as a hard gate.** `scripts/pre-deploy-gate.sh::gate_colab()` runs it inside the
production container (where pg is available) and **returns 1 — blocking — if it cannot verify.**

> **The Co-Lab boundary is enforced at deploy. Only its name in CLAUDE.md is stale.**

This correction matters for the decision below: a **DB-capable, hard-blocking enforcement point
already exists and works.** The gap identified in
[PREFLIGHT_CHAIN_UNREACHED](PREFLIGHT_CHAIN_UNREACHED_2026-08-03.md) is narrower than it appeared —
it is the *static* chain that is unreached, not every boundary control.

---

## 1. Developer machine (git hooks)

| Property | Measured |
|---|---|
| Versioned hooks | `.githooks/{pre-commit, pre-push, commit-msg}` |
| **What actually executes** | 🔴 **NOT the versioned file.** `.githooks/pre-commit` carries its own warning: *"⚠️ NOT the hook that runs. `scripts/setup-githooks.sh` writes its own pre-commit body into `$(git rev-parse --git-common-dir)/hooks` — THAT is what executes, and its check list diverges from this file."* |
| Executing hook | a **`bd` (beads) chained hook** that calls `pre-commit.old`, dated Jul 7 |
| Installation | per-clone, manual (`./scripts/setup-githooks.sh`) |
| **Bypassable** | ✅ `--no-verify` — **used twice today, legitimately** |
| Current health | 🔴 **red on pristine trunk** (6 pre-existing `preferred_name` violations) |

⭐ **A bypassable control is not a boundary.** It is a fast local signal. For a *trust*-boundary
assertion this is a material property, not a detail — today's two bypasses were correct, and a
boundary that correct behaviour routinely steps over cannot be the enforcement point.

## 2. Deployment gate (`scripts/pre-deploy-gate.sh`)

| Property | Measured |
|---|---|
| Exists | ✅ 280 lines |
| Runs DB-dependent gates | ✅ `gate_colab()` execs into the running container with `DATABASE_URL` |
| **Hard-blocking** | ✅ `return 1` when it cannot verify; `FIRST_DEPLOY=1` is the only documented escape |
| Bypassable | only by not deploying through the lane — and the deploy lane is itself lock-protected + tripwired |
| Runs the static chain (`preflight`) | ❌ **no** |

⭐ **This is the only location that today both reaches a database and blocks.**

## 3. CI (GitHub Actions)

| Property | Measured |
|---|---|
| Workflow files | 9 |
| Of those, running any check/test | **3** — `deploy.yml` (7), `mobile-deploy.yml` (6), `check-diagrams.yml` (3). The other 6 are issue/PR labelers |
| **Postgres service provisioned** | ❌ **0 workflows** |
| 🔴 **`deploy.yml` triggers** | `push: [main, production]` + `pull_request: [main]` |
| 🔴 **Trunk is `clean-main-no-secrets`** | **so `deploy.yml` never fires for this repo's actual trunk** |
| CLAUDE.md | *"CI deploys are disabled (self-hosted runner not yet configured)"* |

⭐⭐⭐ **CI is effectively inert for trunk.** Not merely unconfigured — its main workflow watches
branch names that this repository does not use. Choosing CI is not "turn it on"; it is building a
release-verification environment that does not currently exist, including a database lifecycle.

---

## 4. What the evidence constrains

Stated as constraints, not as a recommendation — the decision is the founder's.

- **The static chain (`preflight`, incl. the #935 harness) needs no database.** It could run at any
  of the three locations.
- **`verify-coach-field-boundaries.ts` needs a database.** Only location 2 provides one today.
- **Location 1 cannot be the enforcement point for a trust boundary** while `--no-verify` is a
  legitimate and used path — though it remains the right place for a fast developer signal.
- **Location 2 already carries a working DB-dependent hard gate**, so adding to it is extending a
  proven mechanism rather than establishing one.
- **Location 3 is not "wire a command"** — it is a branch-trigger correction, a runner decision, and
  a database lifecycle. It is the largest option by a wide margin.
- ⚠️ **The two gates may not belong in the same place.** Nothing requires one answer for both.

## 4a. ✅ Corrected instrument map (ruled 2026-08-03)

An earlier routing in this lane assigned `verify-coach-field-boundaries.ts` to the static path as
*"does not need the deploy database."* **Measured — the two instruments are the other way round:**

| Purpose | Instrument | Evidence class | Dependency | Belongs |
|---|---|---|---|---|
| Freeze known forbidden expansion paths | **`check-member-owned-boundary.ts`** (#935) | static negative assertion | imports `fs`, `path` only — **no DB** | a static execution path |
| Verify actual coach-field boundary behaviour | **`verify-coach-field-boundaries.ts`** | runtime / schema / access assertion | imports `query, transaction, closePool`; INSERTs member + practitioner fixtures; queries `information_schema` — **DB required** | wherever the runtime database exists (deploy gate or equivalent) |

⭐⭐⭐ **The error to avoid is wiring them together because they share a topic.** They are different
evidence classes. Routing the DB-dependent gate to a DB-less path would make it fail — or worse, skip
and report green, which is the vacuous-pass failure the #935 anti-vacuity check exists to refuse.

## 5. Not decided here

Where release truth lives · whether the static and DB chains share a location · whether CI's branch
triggers are corrected · whether CLAUDE.md's stale gate name is fixed.

⛔ Touching the deploy lane is not authorized. **Recorded, not started.**

*The system does not outrun the evidence.*
