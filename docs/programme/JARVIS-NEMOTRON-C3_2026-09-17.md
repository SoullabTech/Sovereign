# JARVIS-NEMOTRON-C3

**Opened:** 2026-09-17 · founder direction to integrate Nemotron into OpenCode, JARVIS Desktop, and flow
**Canonical base:** `clean-main-no-secrets @ 11e5d2254335`
**Branch:** `feature/jarvis-nemotron-c3-20260917`

```text
Class: A — external-model disclosure / execution authority boundary
Governing authority: founder direction 2026-09-17 + existing JARVIS C3 non-auto-execution law
Current gate: implementation/proof complete; provider credential connection pending
Evidence subject: this branch + local OpenCode 1.18.31
Stop boundary: no automatic C3 execution, no repository/continuity disclosure, no confidential/member data, no merge/deploy
```

## Purpose

Replace the old “C3 means open Claude Code” gap with a bounded external frontier act
using `opencode/nemotron-3-ultra-free`, while preserving the existing rule that routing
authority is not execution authority.

## Execution law

```text
route(task) -> C3
             |
             +-- NO model call
             |
             +-- explicit founder act
                   + external_ok=true
                   + task text only
                   + temporary HOME + working directory
                   + copied provider credential only
                   + wildcard-deny OpenCode agent
                   + Claude compatibility disabled
                   + default plugins disabled
                   -> Nemotron reasoning result
```

## Disclosure boundary

The Nemotron seam accepts exactly:

- prompt text;
- `external_ok=true`.

It does **not** accept:

- bound repository path or file content;
- JARVIS/Claude continuity;
- member information or transcripts;
- credentials/secrets other than the staged OpenCode provider credential required by the client;
- production/database authority;
- write, merge, deployment, shell, or task authority;
- ambient Claude Code prompts/skills;
- ambient OpenCode plugins or user configuration;
- unrelated environment API keys.

The child process runs with a temporary `HOME`, isolated XDG config/data/cache roots,
`OPENCODE_DISABLE_CLAUDE_CODE=1`, `OPENCODE_DISABLE_DEFAULT_PLUGINS=1`, and a
minimal environment whitelist. The OpenCode auth file is copied into temporary custody
with mode `0600` and deleted with that custody after the call.

The worker constructs a temporary OpenCode agent with a wildcard `"*": deny` plus
explicit `read/edit/glob/grep/list/bash/task/external_directory/webfetch: deny` rules.

## OpenCode agents

- `.opencode/agents/jarvis-local.md` — Qwen3-Coder 30B, local recall allowed.
- `.opencode/agents/jarvis-frontier.md` — Nemotron 3 Ultra free, wildcard-denied from tools/repository.

These agents separate model choice from continuity custody: JARVIS owns recall; models consume
only the evidence class they are permitted to receive.

## Desktop surface

JARVIS Desktop now exposes one additional reviewed IPC act:

`jarvis:run-external-reasoning`

It is separate from `jarvis:submit-task`. The C3 branch in `submit-task` still returns
`routed_not_executed`.

The Work view requires an explicit checkbox confirming the task text is non-confidential.
Only after routing does a separate **Run with Nemotron 3 Ultra** control become eligible,
and only when provider status is AVAILABLE.

System/Home state distinguishes:

- C3 routing capability;
- external frontier provider readiness;
- automatic C3 execution authority (still not authorized).

## Proof

- frontier worker isolation test: PASS
- explicit `external_ok` required: PASS
- missing credential is NEEDS_SETUP, not false AVAILABLE: PASS
- temporary custody + wildcard-deny agent: PASS
- ambient Anthropic/OpenAI/config environment variables do not cross the child boundary: PASS
- staged provider credential mode `0600`: PASS
- C3 routing remains `routed_not_executed`: PASS
- C1 containment suite: 17/17 PASS
- C0 explorer suite: 52/52 PASS
- Alpha-floor suite: 97/97 PASS
- JOP-01 legibility: 39/39 PASS
- JOP-02 projection: 39/39 PASS
- `git diff --check`: PASS before the final environment-hardening delta; the frontier unit was rerun after that delta and passed

## Current blocker

The model is present in the installed OpenCode catalog, but the OpenCode provider credential
is not yet connected. Runtime status currently reports:

```text
state: NEEDS_SETUP
model: opencode/nemotron-3-ultra-free
detail: Nemotron is configured but the OpenCode provider is not connected yet.
```

The local login flow is intentionally a human credential act. No API key belongs in this
repository, programme record, chat transcript, or JARVIS continuity store.

## Closed claims

This lane does **not** claim that:

- Nemotron equals or exceeds Claude Code on MAIA work;
- the free endpoint will remain free or available;
- confidential repository context is eligible for the trial endpoint;
- Nemotron has implementation authority;
- the branch is merged, installed, deployed, or canonical.
