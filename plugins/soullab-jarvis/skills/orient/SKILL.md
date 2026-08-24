---
name: orient
description: Bind where you are before doing anything — repo, branch, SHA, worktree, lane, and what is actually running in production. Use at the start of any session that will change code or infrastructure, when returning to work after a gap, when a claim about production state needs checking, or whenever a referent is ambiguous ("which OracleConversation.tsx?", "is this deployed?", "which branch is live?").
---

# Orient

Names are not identity. `components/OracleConversation.tsx` exists at 8+ paths across 21
worktrees with **different content and different sizes**. "Deployed" is not one fact.
Orientation is cheap; a wrong referent is expensive.

## 1. Local referent (already bound)

The `SessionStart` hook printed repo · branch · HEAD · worktree kind · dirty count at the
top of this session. **Do not re-derive it.** If it is missing, the plugin's hook did not run:

```bash
git rev-parse --show-toplevel && git rev-parse --abbrev-ref HEAD && git rev-parse --short HEAD
git rev-parse --git-common-dir   # differs from <root>/.git => linked worktree
```

## 2. Production referent (never assume)

Production is **minisforum** (LAN `192.168.0.104`), Docker + **Caddy**. Not EC2. Not Nginx.
Not Vercel. Not Supabase. The Mac Studio runs a parallel stack with the same container
names that is **not in the public traffic path** — a healthy local stack proves nothing.

```bash
ssh soullab@minisforum 'docker ps --format "table {{.Names}}\t{{.Status}}"'
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'   # what is ACTUALLY live
ssh soullab@minisforum 'hostname -I'                                       # must be 192.168.0.104
```

`GIT_COMMIT=unknown` does **not** mean the provenance wiring is missing — the chain is
complete. It means the deploy route bypassed it. Ask *which lane deployed this*, not
*is the build-arg wired*.

## 3. Answer, then stop

Report the bound referent in ≤6 lines. Orientation is not an investigation — if the
question needs more than this, it is a different job with its own scope (`bounded-job`).

## Deeper

- `references/context-governor.md` — why orientation is T0 and state is not
- `docs/architecture/audits/JARVIS_CONTEXT_ARCHITECTURE_AUDIT_2026-08-16.md` §3.3 (referent hazard)
- `CLAUDE.md` → Infrastructure (Single Source of Truth)
