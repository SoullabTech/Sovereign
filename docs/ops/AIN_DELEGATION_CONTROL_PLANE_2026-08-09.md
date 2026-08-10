# AIN Builder OS — Hybrid Model Delegation Control Plane

**Founder authorization: DESIGN + BOUNDED IMPLEMENTATION, 2026-08-09.** This is now core Builder OS infrastructure. Scope was deliberately capped at a trustworthy delegation *primitive* — not automatic classification, not autonomous routing. See §15 "What was deliberately not built."

## Purpose

Stop using Claude for work that does not require Claude. Claude remains the governing engineering intelligence; delegated models perform bounded work in isolated worktrees, under a packet Claude authored and a result contract Claude reviews without ingesting the delegate's full working context. The objective is Claude Code **quota/rate-limit relief** on a subscription seat — not a dollar-cost story.

```
                    CLAUDE CODE
              architect / governor
                       │
                classify task (manual, for now)
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
 deterministic     LOCAL (maia-code)  KIMI (kimi-cc)
 tools / ctx_*      mechanical labor  substantial coding labor
        └──────────────┬──────────────┘
                       ↓
              RESULT CONTRACT (compact)
                       ↓
                  CLAUDE REVIEW
                       ↓
             accept / reject / escalate
```

## What already existed (do not redesign)

Orientation performed 2026-08-09 before any design work, per this unit's own "do not reopen established work" rule:

- **`kimi-cc`** (`~/.local/bin/kimi-cc`) — existing Kimi lane. `--class`, `--why`, `--kimi-model` (default `kimi-k2.7-code`, escalates in-lane to `kimi-k3`; **K4 does not exist and is not being invented**), everything else forwards to plain `claude`. Credential isolation via `~/.moonshot-env`, `ANTHROPIC_API_KEY` scrubbed from the child env. Writes one JSON line per run to `~/.claude/kimi-lane/episodes.jsonl` including an `escalation_reason` parsed from an `ESCALATE_TO_CLAUDE:` marker in the transcript tail. **No filesystem/worktree isolation of its own** — isolation was credential-level only. Built and proof-tested; ~0.1% selection share, not in production routing use. Documented in `docs/ops/KIMI_DEVELOPMENT_LANE_2026-08-09.md`.
- **`maia-code`** (`~/bin/maia-code`) — existing local lane. `exec claude "$@"` against Ollama `maia-coder:latest` (`qwen3-coder:30b`, Q4_K_M, 262k ctx) at `localhost:11434`, forces `ANTHROPIC_API_KEY=""`. Documented in `docs/ops/LOCAL_MODEL_ROUTING_INVENTORY_2026-08-09.md`. Essentially zero prior Claude Code traffic.
- **`scripts/deploy-lock.sh`** — the lock pattern this unit's worktree guard reuses (flock on fd 9, PID-file fallback for macOS, holder metadata printed on contention, no force-delete).
- **`docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md`** — the existing session-to-session continuation contract. Deliberately **not** reused for work packets: it is for ending a Claude session, this is for a bounded sub-task inside one. Different lifecycle, different contract (see §3/§4 below).
- **Gap confirmed**: no prior work-packet schema, result contract, formal worktree-ownership tool, or L0–L3 execution-lane taxonomy existed anywhere in `docs/`. This unit is filling a genuine gap, not consolidating a duplicate.

## 1. Execution levels

- **L0 — deterministic.** No LLM where computation suffices: git queries, grep/AST search, SQL inspection, test execution, linters, `ctx_execute*`. Prefer this before delegating anything.
- **L1 — local (`maia-code` / Ollama `maia-coder`).** Repo archaeology, broad code search, mechanical analysis, straightforward tests, bounded repetitive edits, typecheck repair, mechanical refactors, summarization of large evidence.
- **L2 — Kimi (`kimi-cc`).** Substantial bounded implementation, multi-file implementation from settled architecture, migrations after semantics are settled, test suites, mechanical refactors, bounded debugging, verification.
- **L3 — Claude.** Architecture, ambiguous cross-system reasoning, constitutional/governance decisions, security-sensitive reasoning, difficult debugging, ontology, adversarial review, integration judgment, and every escalation from L1/L2.

Lane selection is **manual** (Claude or the founder picks `local` vs `kimi` when authoring the packet). Automatic classification is explicitly out of scope for this unit — see §15.

## 2. Authority firewall

A delegate may execute settled decisions. It may **not** silently establish: constitutional architecture, member authority, consent semantics, confidentiality semantics, provenance semantics, epistemic authority, destructive migration policy, security boundaries, founder rulings, ontology, or deprecation of important capability. Hitting one of these is a stop-and-escalate, never a judgment call. This is enforced by convention (every packet's built prompt states it verbatim, unconditionally) rather than by a technical sandbox — the same trust model `kimi-cc` already uses for its own escalation marker.

## 3. Work packet

Schema, storage location, and worked example: `docs/ops/AIN_WORK_PACKET_CONTRACT.md`. Packets are ephemeral state under `~/.claude/ain-delegation/packets/`, never committed to the repo — mirroring where `kimi-cc` already keeps its own ledger. A packet carries conclusions, not archaeology: Claude may spend 100k tokens understanding a problem; the packet should carry the 2–5k a delegate needs to execute it.

## 4. Result contract

Schema and Claude's three-way review contract (accept / reject / escalate): `docs/ops/AIN_RESULT_CONTRACT.md`. Results are computed independently by the wrapper — starting/ending sha, files changed, and verification-command pass/fail are read from git and re-run by the wrapper, **not** taken on the delegate's word. The delegate's full transcript is preserved at `log_path` for forensic drill-down but is never auto-injected into Claude's context.

## 5. Worktree isolation (mandatory)

**One active write lane → one branch → one worktree → one owner.** `scripts/ain-worktree-claim.sh` (`claim` / `status` / `release`) implements this as a PID-file lock scoped per `work_unit_id` at `~/.claude/ain-delegation/locks/<id>.lock`, identical contention/staleness semantics to `scripts/deploy-lock.sh`. Worktrees live at `~/.claude/worktrees/ain-<work_unit_id>`, consistent with the existing `.claude/worktrees/*` convention already in heavy use in this repo (80+ live worktrees observed at orientation time). Never delegate two lanes into the same writable worktree; never force-delete a lock to jump a claim.

## 6. Invocation

```bash
scripts/ain-delegate.sh new      <work_unit_id>            # scaffold a packet, then hand-edit its JSON
scripts/ain-delegate.sh claim    <work_unit_id>             # claim an isolated worktree for it
scripts/ain-delegate.sh local    <work_unit_id>             # delegate to maia-code (L1)
scripts/ain-delegate.sh kimi     <work_unit_id>             # delegate to kimi-cc (L2)
scripts/ain-delegate.sh result   <work_unit_id>             # print the compact result contract
scripts/ain-delegate.sh review   <work_unit_id>             # packet summary + diff stat + result
scripts/ain-delegate.sh escalate <work_unit_id> "<reason>"  # manual escalation record
```

`local`/`kimi` auto-claim a worktree if the packet hasn't been claimed yet. Both lanes build the same bounded prompt from the packet (objective, established facts, allowed/prohibited files, acceptance criteria, verification commands, escalation conditions, the standing authority firewall, expected output) and invoke the **existing** lane binary unmodified with `-p "<prompt>"`. Plain `claude` and MAIA's own runtime model routers are untouched by any of this.

## 7. Observability

One JSON line per delegated run appended to `~/.claude/ain-delegation/episodes.jsonl`: timestamp, work_unit_id, lane, escalation_required, test_results, exit_code, duration_s. Manual escalations get their own line via `escalate`. No dollar-savings claims are recorded — only whether Claude Code quota was avoided (a run happened) and lane quality (test_results, escalation rate) for later comparison. This is additive to, not a replacement for, `kimi-cc`'s own `episodes.jsonl` ledger.

## 8. Proving case

Recorded separately once run: `docs/ops/AIN_DELEGATION_PROVING_CASE_2026-08-09.md`. A known, low-risk, mechanical task with known acceptance criteria — no production contact, no unresolved governance.

## 9. What was deliberately not built

Per explicit founder scoping: automatic task classification, automatic model selection, automatic security/governance delegation, autonomous multi-agent swarms, persistent model-to-model conversation, a database (file/log infrastructure was sufficient), production deployment automation, automatic merging, automatic founder decisions. Lane selection stays a Claude/founder judgment call until this primitive has produced enough evidence to justify automating it — a separate, future authorization.

## 10. Success criteria for this unit

Claude Code can: recognize a bounded implementation task; package only the necessary context into a packet; claim an isolated worktree; delegate explicitly to `local` or `kimi`; receive a standardized compact result; inspect diff/tests/evidence; accept/reject/escalate; continue without ingesting the delegate's full working transcript. Plain `claude` remains unchanged throughout.
