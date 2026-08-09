# Local coding-harness A/B protocol (2026-08-09)

Scope, per founder authorization: test the **development** harness only.
Out of scope: `lib/consciousness/modelRouter.ts`, MAIA runtime model selection,
Modelfile edits, Hermes/Jarvis/any new agent platform.

Lab worktree: `…/scratchpad/wt-localmodel-lab`
Branch `chore/local-model-harness-lab` from `clean-main-no-secrets` @ `f9a7326f1`.

---

## Findings that preceded the experiment (measured, 2026-08-09 18:01–18:05)

### F1 — A local-harness session is ALREADY LIVE

```
PID 50454  ollama launch claude --model maia-coder   (started 18:01:47)
  └─ PID 50486  /Users/soullab/.local/bin/claude --model maia-coder
```

`ollama ps` shows **no resident model** ⇒ the session is sitting at a prompt with
zero inference performed. The harness connects; it has not yet been exercised.

**Its cwd is `/Users/soullab` — the home directory, not the repo and not a worktree.**
So it has no MAIA context and its filesystem tool scope is the entire home dir.
Any real test must be relaunched with cwd inside the lab worktree.

Not killed, not modified. Two concurrent `ollama launch claude` sessions may contend
over `~/.claude.json` (five backups were written 17:05–18:02 during launch), so a
second instance should not be started while 50486 is alive.

### F2 — Billing mechanism: a live API key export, not inference

`~/.zshrc` unsets every `ANTHROPIC_*` var at lines 3–9, then at **line 70** runs an
uncommented `export ANTHROPIC_API_KEY=…` (lines 68–69, `BASE_URL`/`AUTH_TOKEN`, are
commented out). Later line wins.

Non-interactive shells do not source `.zshrc`, which is why tooling here reports the
key unset — but **interactive terminals, where `claude` is actually run, would have it
set.** Claude Code prefers an explicit API key over subscription auth.

This is a lead, not a conclusion. It is confirmed only by:
1. In Kelly's own terminal: `echo "${ANTHROPIC_API_KEY:+SET}"`
2. Anthropic Console → Billing/Usage: actual charges and plan status.

Value never read; all output masked. **No change made to `.zshrc`** — that is Kelly's call.

If F2 holds, it likely dominates every routing decision below.

---

## Stages — do not skip forward

| # | Stage | Gate to advance |
|---|---|---|
| 1 | Repo comprehension, **read-only**. Locate a known architectural relationship, cite file:line. | Harness + filesystem + context demonstrably work together |
| 2 | Tool behavior. Explicitly exercise search / read / bash. | Tool calls fire and return |
| 3 | Known completed task, solution withheld. Compare proposed diff + reasoning to what Claude produced. | Output is judgeable, not incoherent |
| 4 | Small disposable implementation in the worktree + required gates. | — |

## A/B matrix

Same task, same worktree state, same harness, both arms:

- **A** — stock `qwen3-coder:30b`
- **B** — `maia-coder` (custom Modelfile, `TEMPLATE {{ .Prompt }}`)

If A calls tools and B does not, the custom `TEMPLATE` is the prime suspect for
overriding qwen3-coder's native agent/tool protocol. **Evidence first — no Modelfile
edits until the A/B result is in.**

## Recorded per run — context, not just quality

| Metric | Why |
|---|---|
| Startup context tokens | Baseline load before any work |
| Requests / turns to completion | Detects thrash |
| Context growth per turn | The pathology we are trying not to reproduce for free locally |
| Tool-call reliability (fired / malformed / ignored) | The A/B discriminator |
| Retries on the same failure | Whether the escalation rule binds |
| Escalation behavior | Does it say "This needs cloud-level reasoning" and stop, or bluff? |
| Wall-clock time to completion | Practical viability |
| Correctness vs. known solution (stage 3+) | Quality |

A run that produces correct code while ballooning context is a **failure**, not a pass.

## Stage 4 prerequisite

Worktree preflight needs `.env.docker` (gitignored, main checkout only):
`cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker`
Not needed for stages 1–3.
