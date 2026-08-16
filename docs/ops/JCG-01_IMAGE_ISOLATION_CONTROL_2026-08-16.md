# JCG-01 #1 — Image Isolation: hook discrimination control

**Date:** 2026-08-16 · **Claude Code:** `2.1.232` · **Result:** ✅ **PROOF SATISFIED — not blocked**
**Supersedes:** this lane's earlier claim that image isolation was "not implementable as specified."
That claim was **wrong**. See §4.

---

## 1. Control as specified by the founder, executed

| Step | Act | Result |
|---|---|---|
| 1 | Record installed version | `2.1.232 (Claude Code)` |
| 2 | Install temporary observational `PreToolUse` probe (allow-only, `exit 0`) | installed on `Bash` matcher |
| 3 | Main agent invokes one harmless tool | `echo main-thread-control` |
| 4 | Spawn a real named subagent | `general-purpose`, one-step task |
| 5 | Subagent invokes one harmless tool | `echo subagent-control` |
| 6 | Remove probe, byte-verify restore | sha256 `bf471b1cde022c0d` → **identical** |

## 2. Witnessed payloads

```
[MAIN]     agent_id=<ABSENT>            agent_type=<ABSENT>
           keys: cwd, effort, hook_event_name, permission_mode, prompt_id,
                 session_id, tool_input, tool_name, tool_use_id, transcript_path   (10)

[SUBAGENT] agent_id=a627c4c68cb7bbb5b   agent_type=general-purpose
           keys: agent_id, agent_type, + the same 10                               (12)
```

**Corroboration:** the `agent_id` seen by the hook equals the `agentId` the Agent tool returned to
the parent (`a627c4c68cb7bbb5b`). Two independent surfaces agree on the identifier.

**Therefore the discriminator exists and is exactly the documented one.** A `PreToolUse` hook can
deny image-producing tools when `agent_id` is absent and allow them when `agent_type` is the
designated vision agent. No worktree scoping, no session-registry handshake. The original design
stands.

## 3. ⚠️ Cost finding the control produced incidentally — this changes JCG-01's economics

The one-step subagent (a single `echo`) consumed **66,133 subagent tokens** for **1 tool use**.

The parent received the literal word `done`. **That is the isolation working** — 66k stayed out of
the main loop. But it establishes a per-witness floor:

| | |
|---|---|
| Measured saving from image isolation | **~121,000 tok/session** (audit 2026-08-16) |
| Per-subagent startup floor | **~66,000 tok** |

⭐ **Consequence: the win comes from batching.** One vision subagent asked to verify six screens is
strongly net-positive; six subagents each verifying one screen is roughly break-even and may be
worse. The design must therefore specify a **witness session** that performs several visual checks
and returns one capsule — not a subagent per screenshot.

⛔ This does **not** weaken the case for isolation; a single 30,374-token simulator call already
approaches half a subagent's entire startup. It constrains *how* the isolation is invoked, and it
must be stated in the acceptance test rather than discovered later in a bill.

## 4. Method record — a fourth instance of one failure family

| # | Instrument | Local observation | Wrongly promoted to |
|---|---|---|---|
| 1 | lexical grep over 1,266 lines | no `refuse\|reject\|deny` token | "budget refusal is unwitnessed" |
| 2 | `shasum` on `git show` of a missing path | `e3b0c442…` (empty-string hash) | "file differs from trunk" |
| 3 | `declare -A` under `sh` | loop printed nothing | "no containment relation between four heads" |
| 4 | `PreToolUse` probe on the main thread | no `agent_id` in the payload | "the hook contract cannot discriminate subagents" |

Every one is the same shape: **a correct local observation promoted one rung beyond its witness
scope.** In each case the instrument was silent, and silence was read as a fact about the world.

**Principle to carry into JARVIS (founder, 2026-08-16):**

> **An observation of absence must declare the population it actually observed.**

Mechanically detectable in at least these forms, and worth building:

- a search that returns zero must record *what corpus it searched* alongside the zero;
- a shell instrument must prove it **ran** (non-empty output, or an explicit `no-match` sentinel)
  before its silence is admissible — #3 would have been caught by `set -o pipefail` plus an
  execution witness;
- a probe of one population may not generate a claim quantified over a larger one — #4 observed
  `{main thread}` and generalized to `{main thread, subagents}`.

This maps directly onto the mechanism already on trunk: `verifyEvidence()` refuses citations that
fall outside materialized context, and `EVIDENCE_INSUFFICIENT` fires when a worker returns no citable
evidence at all. **The missing sibling is a check that an absence claim names its own scope** — the
same discipline, applied to negative findings rather than positive ones.

## 5. Not done here

- The hook itself is **not written**. This unit proved the seam; implementation is the next act.
- No image tool was denied, and no image tool's behavior was changed.
- A dedicated `vision-witness` agent type does not exist; the control used `general-purpose`.
  The proof is of the **mechanism**, not of a named agent that has yet to be defined.
