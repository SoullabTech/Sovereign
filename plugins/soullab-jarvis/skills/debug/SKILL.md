---
name: debug
description: Work a defect through reproduce → isolate → diagnose → fix, with the repo's actual diagnostics, and report root cause rather than symptom. Use when something is broken, failing, flaky, or behaving differently in production than locally — "it forgot me", voice not working, iOS build failing, memory not surfacing, a route returning the wrong thing, a deploy that did not take.
---

# Debug

```
REPRODUCE  ──►  ISOLATE  ──►  DIAGNOSE  ──►  FIX
```

Four steps, in order. Skipping REPRODUCE is how a symptom gets patched and the defect
survives. "Flake" is not a root cause.

## 1. Reproduce

Get the failure to happen on demand, and write down the exact invocation. If it only
happens in production, reproduce it **against production evidence** (logs, rows), not
against a local stack — the Mac Studio stack is not in the public traffic path.

## 2. Isolate

Check the known traps **first** — most reported defects in this repo are one of these:

| Symptom | Trap |
|---|---|
| "It forgot me" / session loss on iOS | `SameSite=Lax` cookies are not sent from the iOS WebView. Use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`). Also check `beta_user` in localStorage after a rebuild. |
| Route missing in the iOS build | Static-export incompatibility. `export const dynamic = 'force-dynamic'` routes must be listed in `EXCLUDED_DYNAMIC_ROUTES` (`scripts/capacitor-patch-routes.sh`). |
| Deployed code not live | Wrong host (rebuilt on Mac Studio, not minisforum), or a lane that bypassed the gate. Check `docker exec maia-sovereign printenv GIT_COMMIT`. |
| `GIT_COMMIT=unknown` | The deploy **route** bypassed the provenance chain. The chain itself is complete — do not "fix" the build-arg wiring. |
| External traffic silently dropped | LAN IP drift after a power event. `ssh soullab@minisforum 'hostname -I'` must show `192.168.0.104`. ⚠️ The hairpin-NAT probe is misleading — hairpin is off by default on consumer routers, so a failing `curl https://soullab.life` *from minisforum* does not imply external breakage. If the PWA loads over cellular, the forward path is intact and IP drift is not the user-facing cause. |
| `.env.docker not found` in preflight | Fresh git worktree. `cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker`. |

## 3. Diagnose

Runtime markers (memory / atoms / conversational Phase 2):

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 \
  | grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"'
```

**Verification that produces images — simulator control, browser or preview screenshots —
runs in a subagent, never the main loop.** A single simulator call averages ~30k tokens
(37% of the entire session startup floor). The `PreToolUse` guard enforces this; if you
hit the denial, spawn an Agent to look and return findings, not pixels.

## 4. Fix, then report

```
Reproduction   the exact invocation that fails
Root cause     the mechanism — not "something was wrong with X"
Fix            the minimal change; do not widen the blast radius while you are in there
Prevention     the guard, test, or gate that makes recurrence structurally harder
```

Validate before claiming: `npm run typecheck` (no-regression gate — green means *nothing
got worse*, not that everything typechecks; use `typecheck:full` for absolute state),
then `npm run preflight`, then `npm run smoke`.

## Deeper

- `CLAUDE.md` → Known recurring traps (authoritative; this table is a routing index to it)
- `references/context-governor.md` — why image verification is quarantined
