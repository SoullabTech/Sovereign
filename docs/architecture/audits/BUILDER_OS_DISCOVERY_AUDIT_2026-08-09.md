# AIN Builder OS — Discovery & Architecture Audit (Step 1)

**Date**: 2026-08-09 · **Mode**: READ-ONLY. Nothing edited, patched, or implemented.
**Scope**: inventory the existing Claude Code environment against the proposed six-layer Builder OS.

---

## Verdict in one line

You already possess **more of "Jarvis" than the proposal assumes** — but the pieces you own are
layers 1, 2 and 5-at-the-wrong-boundary. What is missing is **build intelligence (skills),
in-session governance (hooks), semantic retrieval over your own memory, and model routing.**

---

## Layer-by-layer state

### Layer 1 — Constitutional Memory · **STRONG, but mis-shaped**

| Item | State |
|---|---|
| `docs/canon/` | 40+ ratified documents (Oath, Canon v1.1, Sovereignty Invariants, Constitutional Direction of Authority, Claim Discipline) |
| `PROJECT_ORIENTATION.md` | Exists · 3,860 bytes · declared as the orientation gate |
| `CLAUDE.md` (project) | **51,972 bytes** |
| `CLAUDE.md` (user) | 3,741 bytes — context-mode routing rules |
| `.claude/rules/` | **ABSENT** |

**Finding 1.1** — The project `CLAUDE.md` has become the encyclopedia the proposal warns against.
52 KB loads into *every* session regardless of the lane being worked. It carries deploy commands,
migration traps, LAN IP history, onboarding flow, Bridge D wiring, six-category typology, and
priority-thread narrative. Anthropic's own guidance treats `CLAUDE.md` as orientation.
The `rules/` split (architecture · ontology · identity-authority · data-governance · memory ·
security · migrations · ux-philosophy · deployment) is a real, unbuilt gap.

**Finding 1.2** — `PROJECT_ORIENTATION.md` already *is* the orientation layer the proposal wants
`CLAUDE.md` to become. The gate exists; the encyclopedia was never moved out from behind it.

### Layer 2 — Project Memory · **THE MOST DEVELOPED LAYER YOU HAVE**

| Item | State |
|---|---|
| Memory files | **1,428 `.md` files · 12 MB** |
| Routing index | `MEMORY.md` — routing-only, founder-ruled, 9 subtree indexes + 6 standing indexes |
| Governance | Growth invariant, review test, split provenance, pre-split snapshots, referent-pass protocol |
| `.ain/` generated state | **ABSENT — no `current-state.md`, `unresolved.md`, `active-work.md`, no indexes** |

**Finding 2.1** — This is far beyond a typical Claude Code setup and is the single largest
existing asset. It is also the layer under the most pressure: **1,428 files reached by
hand-maintained routing hooks**. Retrieval is navigational, not semantic.

**Finding 2.2** — Every state file in the proposal's `.ain/` is currently **narrated by hand
inside `CLAUDE.md`'s "Current priority thread"** — which is why that section carries a
2026-05-24 date, a 2026-07-03 entry, and a 2026-08-09 correction stacked on top of each other.
The proposal's instinct is right: this must be **generated**, not lovingly maintained.

**Finding 2.3 (correction to the proposal)** — The proposal reaches for Obsidian MCP as the
semantic layer. The vault (`/Users/soullab/Obsidian Vaults`) exists but has **no builder-side
bridge** — the only Obsidian code in the repo is `app/api/connectors/obsidian/test/route.ts`,
which is *product* surface, not development memory. The corpus that actually needs semantic
retrieval is the 12 MB memory tree, not the vault.

### Layer 3 — Build Intelligence (Skills) · **NEARLY ABSENT — largest true gap**

| Item | State |
|---|---|
| Project skills | **1** — `field-study` |
| User skills | 0 (plugin/system skills only) |
| Proposed skills present | `/orient` ✗ · `/investigate` ✗ · `/architect` ✗ · `/build` ✗ · `/adversarial-review` ✗ · `/verify` ✗ · `/ship` ✗ · `/remember` ✗ · `/continue` ✗ |

**Finding 3.1** — `field-study` proves the pattern works: a real constitutional research method
with evidence classes and an observer constitution, encoded as an executable skill. It is the
existence proof that your method **can** be machine-encoded. It is also the only one.

**Finding 3.2** — Your development discipline (orient → investigate → design → adversarial
review → verify → ship → reconcile memory) is currently transmitted **by re-explanation each
session**, which is exactly the reconstruction tax the proposal names.

### Layer 4 — Specialist Agents · **HALF PRESENT**

Present (6, project-scoped): `ain-architect` · `ain-growth` · `maia-dev` · `maia-ios` ·
`maia-ops` · `security-auditor`. User-level `~/.claude/agents/` does not exist.

| Proposed | State |
|---|---|
| Architect | ✅ `ain-architect` |
| Security Reviewer | ✅ `security-auditor` |
| Deployment Reviewer | ✅ `maia-ops` (partial) |
| UX Steward | ✗ |
| Codebase Historian | ✗ |
| Ontology Guardian | ✗ |
| Database Steward | ✗ |
| Test Engineer | ✗ |
| **Evidence Auditor** | ✗ |
| Cost Controller | ✗ |

**Finding 4.1** — The **Evidence Auditor** is the highest-value missing agent, and this repo has
the receipts to prove it: the 2026-08-09 record correction ("*verified LIVE* overstated what was
proved"; `member_daily_anchors` holds 0 rows) is precisely the failure that agent exists to
prevent. The standing rule it would enforce already exists in canon —
*"LIVE means code + schema deployed and exercised; it does not mean in use by members."*

**Finding 4.2** — `ontology-guardian` has an unusually strong substrate here: the distinctions
are already ratified (identity ≠ authority · observation ≠ declaration · record ≠ telemetry ·
memory ≠ profiling). It would be a thin agent over thick canon.

### Layer 5 — Deterministic Governance · **REAL, BUT AT THE WRONG BOUNDARY**

| Boundary | State |
|---|---|
| Claude Code hooks (`hooks:` key, any settings file) | **ZERO — none configured anywhere** |
| `.claude/hooks/` directory | **ABSENT** |
| Git hooks | ✅ 3 — `pre-commit`, `commit-msg`, `pre-push` (versioned, `setup-githooks.sh`) |
| CI workflows | ✅ 9 — incl. `covenant-gates.yml`, `deploy.yml`, `check-diagrams.yml` |
| Gate scripts | ✅ ~30 `check-*` / `certify-*` (no-supabase, no-secrets, phi-columns, provider-governance, voice-provenance, typecheck baseline) |
| Deploy governance | ✅ `flock` deploy-lane lock · `DEPLOY_LANE_TOKEN` build tripwire · immutable-SHA build context · fail-closed provenance verify |
| Permission deny list | ✅ 6 rules: `rm -rf*`, `rm -r -f*`, `rm -fr*`, `git reset --hard*`, `git clean -fd*`, `git clean -f -d*` |
| Permission allow list | ⚠️ **489 entries** (project) + 81 (user) |

**Finding 5.1 — the sharpest finding in this audit.** Your governance is genuinely
deterministic and, in the deploy lane, better than the proposal describes. But **every gate
fires at commit, push, CI, or deploy time**. There is **no enforcement at the Claude tool-call
boundary**. A whole session can drift — wrong file, forbidden pattern, unauthorized migration
number, destructive SQL — and only be caught at `git commit`. The proposal's hooks layer is not
redundant with your git hooks; it is the **missing earlier boundary**.

**Finding 5.2** — 489 allow-list entries is an ungoverned surface that has grown by accretion.
It is a permissions ledger nobody has read end-to-end.

### Layer 6 — Builder Console (HUD) · **ABSENT — correctly so**

No HUD, no voice, no token meter. The proposal's own sequencing (HUD last) is right and should
be held.

---

## Cross-cutting findings

### C.1 — Model routing / cost control · **ABSENT, but reconnaissance has begun**

No LLM gateway, no `env` block in any settings file, no routing config. Every call runs at
session model. **However**: branch `chore/local-model-harness-lab` (worktree
`…/wt-localmodel-lab`, HEAD `f9a7326f1`) is already doing gate-discipline work on local models —
"what a gate must declare — and the anti-ritual test". Prior art exists; it is not wired.

### C.2 — Context governance · **ALREADY SOLVED, and better than the proposal**

`context-mode@context-mode` v1.0.22 is the only installed plugin and the only MCP server, and it
is doing exactly the cheap-worker job the proposal assigns to local models: sandboxed execution,
FTS5 indexing, batch gather. **This is the routing layer already half-built.** The proposal's
"cheap-model delegation" is a natural extension of it, not a new stratum.

### C.3 — Worktree sprawl · **51 worktrees**

Across `/Users/soullab/`, `~/.worktrees/`, `MAIA-SOVEREIGN/.claude/worktrees/`, and session
scratchpads under `/private/tmp/claude-501/`. Several detached HEADs. No inventory, no staleness
policy, no reaper. This is a live drift surface and a direct input to any real `/orient`.

### C.4 — Working tree is dirty at audit time

~20 modified tracked files, ~15 untracked docs, on `feature/labtools-redesign` (851c2e73a) —
while the main branch is `clean-main-no-secrets`. Exactly the state `/orient` is meant to surface
on arrival.

---

## What you already have vs. what the proposal assumes

| Proposal assumes missing | Actually present |
|---|---|
| Project memory | 1,428 files, governed routing index, split provenance, snapshots |
| Constitutional memory | 40+ canon docs, Oath, Invariants, ratified rulings |
| Deterministic governance | git hooks + 9 CI workflows + ~30 gate scripts + deploy-lane flock + build tripwire |
| Cheap-worker delegation | context-mode plugin (sandbox + FTS5), already mandatory-routed |
| Method encoding | `field-study` skill — one working exemplar |
| Specialist agents | 6 of 10 |

| Proposal assumes present | Actually missing |
|---|---|
| Obsidian as builder memory | No MCP bridge; vault unconnected to development |
| Hooks | **Zero** at the Claude tool-call boundary |
| Generated state | No `.ain/`; state is hand-narrated in `CLAUDE.md` |
| Model routing | None |

---

## The seven real gaps (ranked by leverage, not by proposal order)

1. **`/orient` + generated `.ain/current-state.md`** — the single highest-leverage artifact.
   Inputs already exist (git, worktrees, `docker inspect`, `GIT_COMMIT`, memory indexes).
2. **Claude-tool-boundary hooks** — move the earliest gates from commit-time to call-time.
3. **`CLAUDE.md` → `.claude/rules/` split** — 52 KB of always-on context becomes lane-scoped.
4. **Evidence Auditor agent** — the failure it prevents is documented in this repo.
5. **Semantic retrieval over the 1,428-file memory tree** — the real MCP target, not Obsidian.
6. **Method-as-skills** (`/investigate`, `/verify`, `/ship`, `/remember`, `/continue`).
7. **Model routing** — extend context-mode's delegation posture; `local-model-harness-lab` is prior art.

---

## Explicitly NOT recommended

- Building all six layers in one pass.
- Obsidian MCP before memory-tree retrieval — wrong corpus first.
- The HUD, in any form, before layers 1–5 are dogfooded.
- Adding a `.claude/rules/` tree by *copying* `CLAUDE.md` — the split must be authored, and the
  orientation gate (`PROJECT_ORIENTATION.md`) is the governing precedent for how.

---

## Status of this audit

Read-only discovery. **No architecture is ratified by this document.** Step 2 (map every current
memory mechanism in depth), Step 3 (Obsidian), and Steps 4–7 of the proposed sequence remain
open. Design (Step 8) and ratification (Step 9) must not begin until the inventory is complete.
