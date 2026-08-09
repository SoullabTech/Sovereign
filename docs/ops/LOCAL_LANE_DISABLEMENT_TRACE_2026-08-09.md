# Local Coding Lane — Disablement Trace

**Date:** 2026-08-09 · **Read-only.** No routing changed, nothing re-enabled. `.zshrc` backups preserved.

**Verdict: the lane was never disabled. It was refactored from implicit-default to explicit-opt-in —
correctly — and then never opted into.** The `unset` block is the mechanism that makes the wrapper
authoritative, not a kill switch. This inverts the working hypothesis.

---

## Chronology

| when | state | evidence |
|---|---|---|
| 2025-10-06 · 2025-12-22 | no local routing at all | `.zshrc.backup.20251006T221435`, `.zshrc.bak`: 0 route lines, 0 unsets |
| **2026-02-18 17:00** | **local is the GLOBAL DEFAULT** — every `claude` invocation went to Ollama | `.zshrc.backup.20260218-170026`: **6 active route lines**, **0 unsets**, `maia-code` as an *alias*, `maia-cloud` as the escape hatch |
| **2026-02-18 17:27** | `~/.maia-env` created | mtime |
| **2026-02-18 17:49** | `~/bin/maia-code` created as a **script** | mtime |
| 2026-07-26 | last hand-edit before today (`kimi-test` alias) | mtime |
| 2026-08-09 | current: **10 unsets**, same 5 route lines preserved **commented**, wrapper + `maia-cloud` intact | `.zshrc` |

The 17:00 backup was taken **27 minutes before** `.maia-env` and **49 minutes before** the wrapper
script. It is a pre-refactor snapshot — the backup exists *because* the refactor was about to happen.

## What actually changed, and why it is not a disablement

**Before (2026-02-18):** global `export ANTHROPIC_BASE_URL/AUTH_TOKEN/MODEL/DEFAULT_*` +
`CLAUDE_CODE_SUBAGENT_MODEL` → *every* `claude` process routed local. Cloud required
`maia-cloud`, which blanked the vars.

**After (today):** those same lines are **preserved, commented, in place** (lines 68–76). The
`unset` block at lines 3–12 clears the environment first. `~/bin/maia-code` then sources
`~/.maia-env` and `exec claude`.

**The unsets exist so the wrapper's environment is authoritative.** If stale globals survived, a
`maia-code` session couldn't guarantee its own routing and a plain `claude` session couldn't
guarantee cloud. The refactor made *both* lanes explicit. That is better engineering than the
February arrangement, not a retreat from it.

**The one stated motive in any artifact is a bug fix**, written in the file itself at line 83:

> `# maia-code wrapper is a script at ~/bin/maia-code (do not alias; aliases break args)`

The February form was `alias maia-code='… claude --model maia-coder'`. An alias cannot forward
arguments cleanly — a concrete, verifiable defect that explains the promotion to a script.

## Was there a failure immediately beforehand? — Cannot be established, and here is why

**No evidence exists either way, because both evidence sources postdate the event by three months:**

| source | earliest coverage | event |
|---|---|---|
| Claude Code transcripts (926 files) | **2026-06-10** | 2026-02-18 |
| Ollama `server.log` | **2026-05-29** | 2026-02-18 |

`unset ANTHROPIC_*` appears in transcripts on **exactly one day: 2026-08-09** — today, in this
investigation. **The unsets were never authored, discussed, or edited inside any Claude Code
session.** They were hand-written outside the tool, in a window no artifact covers.

No doc, commit, or session record explains the decision. There is no "we turned it off because…"
because there is no evidence of anyone turning anything off.

## Is the lane viable today? — Yes, and it is better provisioned than expected

`maia-coder:latest` resolves to **qwen3-coder, 30.5B MoE, Q4_K_M, 262k context length**
(`num_ctx` 65536), and critically **declares `tools` capability** — the requirement for Claude Code.

Its Modelfile SYSTEM prompt already encodes the discipline this project has been re-deriving all week:

- plan before editing; list every file and why; wait for confirmation
- verify after editing: `npm run typecheck`, `check:no-supabase`, `smoke`
- **escalation rule**: *"If you have attempted the same fix twice and it is still failing, say 'This needs cloud-level reasoning' and stop. Do not keep guessing."*
- sovereignty constraints (no Supabase/OpenAI/Vercel)
- no overengineering

Ollama is listening on :11434 now. Its log shows **136 `/api/chat` hits but only 2 `/v1/messages`** —
the Anthropic-shaped endpoint Claude Code uses. **The lane has served essentially zero Claude Code
traffic in its entire existence.**

## Known vs. inferred

**Known (artifact-backed):** the Feb-18 before/after configurations; the exact wording and placement of
the unsets and the commented route lines; file creation times; the "aliases break args" comment; the
model's capabilities and system prompt; the absence of `/v1/messages` traffic; the absence of any
transcript mention before today.

**Inferred (stated as such):** that the unsets were added *as part of* the 17:00–17:49 refactor. The
timing and structure fit, but there is no backup between 2026-02-18 and today, so they could have
been added at any later hand-edit — the `.zshrc` mtime before today was 2026-07-26.

**Unknowable from current evidence:** whether `maia-coder` had quality, tool-call, or performance
problems in February. Nothing survives from that period.

## The pattern — third instance this week

| system | built? | worked? | why it stopped |
|---|---|---|---|
| Kimi multi-model mode | designed as a *pasted session header* | tested 7 sessions, Jul 21–23 | required remembered human discipline |
| `Read` → `ctx_execute_file` | documented in CLAUDE.md with a carve-out | — | required remembered human discipline |
| **local lane** | **built, correct, structurally sound** | **never carried traffic** | **required remembered human discipline** |

Each was architecturally fine and behaviorally inert. The failure mode is never the design — it is
that choosing the good path stayed voluntary and effortful while the default path stayed free. This is
the same finding as the routing audit's Bash-vs-Read result, now confirmed three independent ways.

## Smallest safe reactivation experiment

The lane was **not** disabled for architectural reasons, so reactivation needs no repair — only use.

1. **Change nothing.** `maia-code` works today as written; `.zshrc` needs no edit. The unsets are
   correct and should stay.
2. **Run one bounded perceive-class task through it** — a repo survey or log triage with a specified
   output shape. Its built-in escalation rule ("this needs cloud-level reasoning") is the safety
   property; test whether it fires honestly rather than bluffing.
3. **Measure the thing that matters**, per the Week 1 frame: tokens *returned* to the parent, evidence
   completeness, and false-confidence rate — not generation speed or cost.

⚠️ Do this **after** Week 1 closes. Adding a second model tier mid-experiment reintroduces exactly the
confound the Lane B deferral was meant to prevent.

## What was NOT established

- Why the February refactor happened *at that moment* — the bug fix explains the *form*, not the timing.
- Whether the inversion of the default was deliberate policy or a side effect of making the wrapper correct.
- Any February-era quality data on `maia-coder`. Gone.
- Whether the 2 `/v1/messages` hits were real sessions or probes.
