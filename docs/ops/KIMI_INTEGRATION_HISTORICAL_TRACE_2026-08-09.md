# Kimi Integration — Historical Trace

**Date:** 2026-08-09 · **Scope:** read-only archaeology. No changes.
**Question:** was Kimi development routing never built, built-then-removed, or built elsewhere and never connected?

**Verdict: never built into Claude Code — because it was never designed as a mechanism.** It was
designed as a *manual working convention*, tested for two days through a separate CLI, and then
abandoned. Nothing was removed or broken. There was nothing in the harness to break.

---

## Timeline

| date | artifact | what it was |
|---|---|---|
| **2026-01-30** | `54fa8d9d2` — `lib/ai/kimiClient.ts` | **product feature.** Ask Jeeves / Library synthesis, `kimi-k2.5`. **One commit, ever.** Never modified since. |
| 2026-02-14/18 | `2a117179f`, `ebd90d387` | `MOONSHOT_API_KEY` wired into Living Library + admin platform overview. Still product-side. |
| **2026-02-18 17:00–17:49** | `.zshrc`, `~/.maia-env`, `~/bin/maia-code` | **the local lane** — `ANTHROPIC_BASE_URL=localhost:11434`, `ANTHROPIC_MODEL=maia-coder`. **Ollama, not Kimi.** |
| **2026-07-21 16:36** | `@moonshot-ai/kimi-code` installed | standalone CLI. 168 Kimi mentions in transcripts that day — the design day. |
| 2026-07-21 16:47–16:53 | `~/.kimi-code/config.toml` | providers configured: `kimi-k2.5`, `k2.6`, `k3`, `k2.7-code`, `k2.7-code-highspeed` |
| **2026-07-21 → 07-23** | `~/.kimi-code/sessions/` | **7 sessions, 9.3 MB, 3,594 wire records. Model exercised: `kimi-k3`.** |
| **2026-07-23 11:19:35** | last wire write | **dark ever since — 17 days at time of writing.** |
| 2026-07-26 | `.zshrc` line 109 | `alias kimi-test='kimi'` — *"standalone Kimi Code CLI, visually distinct from claude sessions"* |
| 2026-08-09 | this trace | `.zshrc` lines 3–9 unset all routing; 97,313 Claude Code requests, zero non-Anthropic |

## What was promised (2026-07-21, from transcripts)

A **"MULTI-MODEL SESSION MODE"** — explicitly a header to *paste at the start of a Claude Code session*:

> Claude is responsible for routing. **Claude:** architecture · governance · strategy · debugging ·
> review. **Kimi:** tests · bounded implementation · verification · mechanical refactors.
> Rule: High uncertainty → Claude. High specification → Kimi.

With a cost model: Claude Max 20× at $200/mo + Kimi API at $20–100/mo. And a bounded-audit role for
K3 — *"produces only mechanically verifiable evidence"*, framed as **evidence gathering, never
governance**.

**The design was sound. It was also, by construction, a human discipline — not a routing mechanism.**
Nothing in it could route work automatically; it depended on a person deciding, per task, to open a
different CLI. That is why the audit found zero effect: there was no mechanism to malfunction.

## What was actually implemented and tested

- **Implemented in the harness: nothing.** Zero commits link Kimi to Claude Code, dev cost, or
  routing (checked: `kimi` AND `claude code` / `claude-code` / `dev cost` / `development cost` /
  `cost reduction` / `router` → **0 commits each**). Zero shell config, in any backup, ever
  referenced Kimi as an `ANTHROPIC_*` target — checked `.zshrc.bak`, `.zshrc.backup.20251006`,
  `.zshrc.backup.20260218`, `.maia-env`: **0 kimi/moonshot lines in all four.**
- **Tested: genuinely, but barely.** Of the surviving first turns, two are connectivity probes —
  *"Reply with exactly: Kimi connection works"* and *"Run the shell command `echo probe-ok >
  kimi-probe.txt` and confirm you did it."* One MAIA-SOVEREIGN workspace accumulated 4 sessions and
  3,594 wire records, so real work did occur. Then it stopped on 07-23 and never resumed.
- **Where it stopped:** at the point where a manual convention needed sustained human enforcement to
  survive. It did not survive. Compare the routing audit's finding on the `Read` rule — an
  instruction with an effortless bypass reliably self-suspends.

## Naming: there is no K4

| name | where it exists |
|---|---|
| `kimi-k2.5` | deployed in `lib/ai/kimiClient.ts` (product) |
| `kimi-k3` | **actually exercised** in the CLI, 2026-07-21→23 |
| `k2.6`, `k2.7-code`, `k2.7-code-highspeed` | present in `~/.kimi-code/config.toml`, unused |
| **`kimi-k4`** | **appears nowhere** — no commit, no config, no transcript |

The July plan discussed **K3**. The product runs **K2.5**. "K4" matches nothing in the record.

## The build-then-remove pattern applies — but to the local lane, not Kimi

This is the finding worth carrying forward. On **2026-02-18** `.zshrc` was actively routing Claude
Code to Ollama (`ANTHROPIC_BASE_URL=localhost:11434`, `ANTHROPIC_MODEL=maia-coder`,
`CLAUDE_CODE_SUBAGENT_MODEL=deepseek-r1:8b`). The current `.zshrc` **explicitly unsets all seven of
those variables at lines 3–9** before doing anything else.

So the corrigibility-style pattern — *built, active, later disabled* — is real here, but its subject
is **maia-coder/Ollama, not Kimi**. That lane still exists intact (`~/bin/maia-code`, `~/.maia-env`,
`maia-coder:latest`, `qwen3-coder:30b`) and is one `source` away from working. Ollama's server log
shows only 2 `maia-coder` references — it has served effectively no traffic.

**Kimi was never removed. The local lane was.** Two different stories that had been reading as one.

---

## Answers to the three hypotheses

| hypothesis | verdict |
|---|---|
| **never built** | ✅ **into Claude Code — correct.** Never a mechanism, only a pasted convention. |
| built elsewhere, never connected | ✅ **twice.** `kimiClient.ts` (product, live, unrelated to dev) and `kimi-code` CLI (adjacent to Claude Code, never inside it). |
| built then removed/broken | ❌ **for Kimi.** ✅ **for the local Ollama lane** (active 2026-02-18, explicitly unset now). |

## What was NOT established

- **Why it stopped on 2026-07-23.** The record shows cessation, not a decision. No commit, note, or
  transcript explains it. It may have been cost, quality, friction, or simply attention moving on.
- **Whether the 4 MAIA-SOVEREIGN Kimi sessions produced landed work.** 3,594 wire records exist;
  whether any resulting change reached a commit was not traced.
- **Token/cost totals for those sessions** — the wire format carried no usage counters this parser
  recognized, so the Kimi-side spend is unmeasured.
- **Whether `MOONSHOT_API_KEY` is currently funded.** The Ask Jeeves route has an explicit
  "account requires funding" error path, so it has run dry at least once.

## ⚠️ Incidental security finding — unrelated to Kimi, higher priority

While reading shell backups, **two live-format Anthropic API keys were printed in plaintext**: the
current one at `~/.zshrc:70`, and an older one in `~/.zshrc.backup.20260218-170026:57`. Both appeared
in full in terminal output during this trace (my redaction pattern failed to match the
`sk-ant-api03-` format).

Recommendation, not taken: **rotate both keys**, and move the active key out of `.zshrc` into a
`chmod 600` file sourced at startup (`~/.maia-env` already follows that pattern). `.zshrc` backups are
world-readable (`-rw-r--r--`). This is out of scope for the trace and awaits your decision.
