# AIN Instrument Registry — v1

**Date**: 2026-08-09 · **Status**: inventory. Directly addresses **Dormant Instrument Failure**
(`docs/governance/MEMORY_RESOLUTION_CONTRACT_RULING_2026-08-09.md` §3).
**Scope**: instrument-class npm scripts, git hooks, CI workflows, and deploy gates.
⛔ **Nothing repaired, installed, or re-bound by this document.**

**Registry schema (founder-specified)**:
`instrument → governed condition → invocation boundary → expected output → owner/consumer → what happens on failure`

**The registry's own governing question**:
> *What ensures this instrument is actually invoked when the condition it protects can change?*

---

## Headline

**Of 38 instrument-class npm scripts, 23 (61%) have no discoverable invocation boundary.** They
exist, they run when invoked by hand, and nothing invokes them. `memory:audit` — the instrument
whose dormancy produced this whole investigation — is one of the 23.

**A second failure was found while building the registry**: `.githooks/pre-commit` documents five
checks; the authoritative installer defines two. Details in §3 — this is a *false control surface*,
not a dropped gate.

---

## 1. Instruments WITH an invocation boundary (15)

| instrument | governed condition | invocation boundary | output | on failure |
|---|---|---|---|---|
| `check:no-supabase` | sovereignty: no Supabase | **pre-commit (live, verified)** + preflight + `ci:sovereignty` | pass/fail | blocks commit |
| `check:no-openai` (`check-provider-governance`) | provider governance | **pre-commit (live, verified)** + preflight | pass/fail | blocks commit |
| `check-branch-allowed.sh` | branch allowlist | pre-commit + pre-push (live) | pass/fail | blocks commit/push |
| `check-no-secrets.sh` | no secrets committed | pre-push (versioned, copied by installer) | pass/fail | blocks push |
| `check-no-large-staged-files.sh` | repo hygiene | pre-push | pass/fail | blocks push |
| `check:no-direct-anthropic` | provider routing | preflight | pass/fail | blocks preflight |
| `check:no-vendor-voices` | voice sovereignty | preflight + `ci:sovereignty` | pass/fail | blocks preflight |
| `check:voice-provenance` | voice provenance | preflight + `ci:sovereignty` | pass/fail | blocks preflight |
| `check:diagrams` | diagram currency | **CI** (`check-diagrams.yml`) | pass/fail | blocks PR |
| `typecheck` | no new type regressions | **CI** + `audit:typehealth` | baseline compare | blocks |
| `typecheck:full` | absolute type inventory | via `audit:typehealth` | 239-error inventory | informational |
| `typecheck:prompts` | prompt types | via `check:ain` | pass/fail | blocks `check:ain` |
| `check:ain-prompts` | AIN prompt integrity | via `check:ain` | pass/fail | blocks `check:ain` |
| `preflight` | composite sovereignty gate | **deploy** (`deploy-production.sh`) | composite | blocks deploy |
| `verify:aetheric` | consciousness surface | via `consciousness:dev` | pass/fail | blocks that script |

**Plus deploy-lane structural instruments** (not npm-invoked, boundary is mechanical):
`deploy-lock.sh` (flock, refuses concurrent deploys) · `DEPLOY_LANE_TOKEN` Dockerfile tripwire
(build fails outside the lane) · post-swap `GIT_COMMIT` provenance verify (fail-closed, aborts
before migrations) · `verify-colab-boundaries.ts` (31/31, deploy smoke + mandatory before tester
waves). **These are the healthiest instruments in the system** — their boundary is structural, not
procedural.

## 2. Instruments with NO discoverable invocation boundary (23) — the dormant set

| instrument | governed condition | why it matters |
|---|---|---|
| **`memory:audit`** | memory corpus integrity | **the originating case** — named the dominant defect in its own taxonomy, first run 2026-08-09 |
| `check:sovereignty` | sovereignty composite | name implies a top-level gate |
| `check:refusals` | refusal behavior | governs MAIA's stated refusals |
| `check:private-routes` | route privacy | security-adjacent |
| `check:no-sha256-passwords` | credential hygiene | security-adjacent |
| `check:phi-inventory` | PHI column inventory | **PHI** — see §3 |
| `check:no-phi-enc` | no PHI encryption in responses | **PHI** — see §3 |
| `check:no-inline-names` | name-drift discipline | see §3 |
| `check:nocheck` | `@ts-nocheck` allowlist | type-debt containment |
| `check:backend-imports` · `check:imports` | import boundaries | architecture |
| `check:dark-text-opacity` | accessibility | *(runs inside preflight via direct `bash`, not npm — partially bound)* |
| `audit:sovereignty` | sovereignty audit | |
| `audit:artifacts` (+`:check`/`:update`) | artifact integrity | |
| `audit:typehealth` | type-health report | |
| `typecheck:baseline` | baseline recording | **correctly manual** — governed act by design |
| `typecheck:core/wide/scripts/entrypoint` | scoped type checks | diagnostic variants |
| `verify:claude` | Claude project config | |
| `biomarkers:verify` · `library:smoke` | domain checks | |
| `check:ain` | AIN composite | composite whose parts are bound but whose whole is not |

**⛔ Not all 23 should be bound.** `typecheck:baseline` is deliberately manual (re-baselining is a
governed act). Diagnostic variants are meant to be run on demand. **The registry's purpose is to
make the distinction explicit** — *deliberately manual* vs *accidentally dormant* — which no
artifact previously recorded.

**Candidates for a boundary, by protected condition**: `memory:audit` (condition changes on every
memory write — the highest-frequency unguarded condition in the system) · `check:no-phi-enc` ·
`check:phi-inventory` · `check:private-routes` · `check:no-sha256-passwords` · `check:refusals`.

## 3. False control surface — `.githooks/pre-commit`

Chain verified live: `.git/hooks/pre-commit` (beads wrapper) → `pre-commit.old` → branch guard +
`check:no-supabase` + `check:no-openai`. `scripts/setup-githooks.sh:18` writes that body itself
(`cat > "$1" << 'HOOK'`) — so **the live install is correct with respect to its authoritative
installer.**

But the **versioned** `.githooks/pre-commit` claims five checks:
`check:no-supabase` · `check:no-inline-names` · `check:no-phi-enc` · `check:phi-inventory` ·
`check:no-direct-anthropic`. Four of those five are **not installed by the installer** and do not
run at commit time.

The file's own header admits this: *"⚠️ NOT the hook that runs… its check list diverges from this
file. Do not trust this file as the live gate."* A prior session found the divergence and
documented it **inside the misleading artifact** rather than reconciling it.

| | |
|---|---|
| **Not a finding** | PHI gates were silently dropped from a running hook |
| **The finding** | four checks are dormant at commit-time while a versioned file reads as though they run |
| **Note** | `.githooks/pre-push` **is** copied verbatim by the installer (`setup-githooks.sh:71`) — pre-push is genuinely versioned; only pre-commit diverges |
| **Verified true** | `CLAUDE.md:206` — *"`check:no-supabase` blocks violations (runs in pre-commit hook)"* ✅ |

This is the memory corpus's own `feedback_location_confers_false_authority` and
`feedback_documentation_as_false_control_surface`, instantiated in the repo's gate layer.
**⛔ Not repaired — it is security-adjacent and belongs to its own lane, not to Builder OS.**

## 4. What the registry establishes

1. **Existence ≠ discoverability ≠ invocation ≠ consequence.** Every instrument must state all
   four. 61% of this inventory stops at "existence."
2. **Structural boundaries outperform procedural ones** — the deploy lane's flock/tripwire/
   fail-closed-verify triad has no dormant members; the npm-script layer is 61% dormant. Same 12×
   enforcement-over-instruction law from the context audit, in a different medium.
3. **A registry entry without an invocation boundary is a hypothesis about protection, not
   protection** — the Dormant Instrument Failure definition, made checkable.

**Next (⛔ not authorized here)**: decide per candidate instrument whether its protected condition
warrants a boundary, and of what kind. That decision is the entry point to the Capability
Continuity Guard, whose design remains unauthorized.
