# soullab-jarvis

A Claude Code plugin that moves JARVIS governance **out of prose and into hooks**, and JARVIS
know-how **out of the always-resident prompt and into skills that load on trigger**.

The premise, stated plainly: JARVIS's complexity belongs in small, selectively loaded skills,
and its safety belongs in hooks. Both make it cheaper *and* more reliable, because a rule the
model must remember every turn is a rule that is sometimes forgotten, while a rule that runs
is a rule that runs.

## What is in here

```
.claude-plugin/plugin.json     manifest
hooks/hooks.json               SessionStart · PreToolUse · Stop
hooks/session-start.sh         binds repo · branch · SHA · worktree · dirty count (~15 lines out)
hooks/pretooluse-guard.py      image isolation + four named-trap denials
hooks/image-tools.txt          explicit enumeration of image-producing tools
hooks/stop-close-out.py        emits changed paths + close-out checklist (non-blocking)
skills/orient/                 bind the referent before acting
skills/bounded-job/            scope · lane · stop condition · evidence
skills/debug/                  reproduce -> isolate -> diagnose -> fix, with the real traps
skills/deploy/                 immutable-SHA lanes, gates, provenance verification
references/                    loaded only when a skill points at them
verify-guards.sh               20-assertion proof harness for the hooks
.mcp.json                      intentionally empty — see references/mcp-wiring.md
```

Outside the plugin, in the repo root:

```
.claude-plugin/marketplace.json    makes this installable
.jarvis/memory/                    hot/deep operating memory scaffold (HOT.md is routing only)
```

## Install

```bash
/plugin marketplace add .              # from the repo root
/plugin install soullab-jarvis@soullab
```

Nothing is auto-enabled by committing this. The plugin does not modify `CLAUDE.md`,
`.claude/settings.json`, or any existing hook.

## The three hooks

**SessionStart** binds the referent — repo, branch, HEAD, worktree kind, dirty count, hot-memory
path — so the session stops re-deriving it. Budget: under ~40 lines. It carries no doctrine.

**PreToolUse** does two jobs:

1. **Image isolation.** Tools that return pixels or bulk media are denied in the main loop and
   directed to a subagent. Basis: image-producing verification is ~70% of per-session tool
   inflow (~121,000 tok/session measured); one simulator call averages 30,374 tokens. `CLAUDE.md`
   already carries this rule — the hook is the seam it never had.
2. **Named traps.** Four things `CLAUDE.md` forbids in prose, made mechanical: deleting
   `.deploy.lock`, bare compose against `docker-compose.production.yml`, installing `@supabase/*`,
   and force-pushing a protected branch. Plus `rm -rf /` or `$HOME`.

**Stop** prints the changed paths and the close-out checklist. **It does not block** — a
governance layer whose failure mode is "the session cannot end" is worse than the prose it
replaces.

## Escape hatches

```bash
JARVIS_IMAGE_ISOLATION=off|warn|deny   # default deny
JARVIS_TRAP_GUARD=off|warn|deny        # default deny
```

Every guard is **fail-open by construction**: a parse error, missing field, or unreadable
transcript exits silently and allows. A broken guard must never wedge a session.

## Proof

```bash
./plugins/soullab-jarvis/verify-guards.sh    # 20 passed · 0 failed
```

It builds its own throwaway fixtures and touches no real repository state. Run it before
trusting any claim that these guards work.

## What this plugin deliberately does not do

- It does not touch `CLAUDE.md`. Splitting the anchor into T0 core + T1 rule files is the
  context audit's move #2/#3 and is governed separately.
- It does not build the symbol index over the 97 files >40 KB (audit move #5).
- It does not install MCP servers.
- It does not claim a token reduction. The figures cited are **measured inputs and
  projections**, not results — see `STATUS.md`.

## Deeper

- `references/context-governor.md` — the tiers, the measurements, the honest limits
- `references/evidence-and-status.md` — built/wired/surfacing/verified and the guard that adjudicates
- `references/mcp-wiring.md` — how to add the repo's own MCP servers, and why they are not preloaded
