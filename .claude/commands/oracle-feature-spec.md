---
description: "Create a feature spec for the Oracle/conductor system"
argument-hint: "feature-description"
allowed-tools: "Read,Grep,Glob"
---

# Oracle Feature Spec

You are speccing a new feature for the MAIA Oracle system: **$1**

## Architecture context

The Oracle orchestration flow is:

1. **Entry**: `app/api/oracle/conversation/route.ts` — receives input, loads spiral state, gathers memory context
2. **Routing**: `lib/voice/conductor.ts` — element hysteresis, voice archetype selection, phase detection
3. **Agent delegation**: `app/api/_backend/src/core/agents/` — bounded domain agents (ArchetypeAgentFactory, adjusterAgent, orchestrator)
4. **Synthesis**: back in route.ts — combines agent output, council insights, framework lens, collective wisdom
5. **Memory writeback**: `lib/consciousness/spiralStatePersistence.ts` — fire-and-forget upsert of element/phase/motion/intensity
6. **Database**: `lib/db/postgres.ts` — pg Pool to local PostgreSQL

Key supporting files:
- `lib/consciousness/therapeuticFrameworks.ts` — framework lens injection
- `lib/consciousness/participatoryRealityHelper.ts` — theme detection and signal storage
- `lib/maia/spiralogicReference.ts` — Spiralogic mapping
- `lib/consciousness/canonComplianceEvaluator.ts` — drift detection (log-only)

## Your task

Produce a feature spec with these exact sections:

### 1. Goal
What this feature does in one sentence.

### 2. Architectural role
Where it fits in the orchestration flow above. Which stage does it touch? Does it add a new stage or extend an existing one?

### 3. Files to modify
List every file that needs to change. For each:
- file path
- create or edit
- what changes and why

### 4. Data flow
How data moves through the system with this feature active. Include the entry point, any new function signatures, and the exit point.

### 5. Risks
- What could break
- What existing behavior might shift
- What sovereignty invariants to verify (consent, agency, non-coercion)

### 6. Implementation order
Numbered steps, smallest correct sequence:
1. Types first
2. Core logic second
3. Wiring into orchestration third
4. Memory integration fourth (if needed)
5. Tests fifth

### 7. Verification checklist
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] No Supabase violations (`npm run check:no-supabase`)
- [ ] Smoke test passes (`npm run smoke`)
- [ ] Sovereignty check: does this increase user agency?
- [ ] Feature-specific checks (list them)

## Constraints

- Do NOT propose changes to files you haven't read
- Do NOT invent speculative architecture beyond the task
- Do NOT add Supabase — use `lib/db/postgres.ts` only
- Prefer additive changes over rewrites
- Keep MainOracleAgent (route.ts) focused on orchestration
- Memory writes should be fire-and-forget (like spiralStatePersistence pattern)
- If a file would exceed ~500 lines of new logic, propose extracting a helper

**Do not implement. Return the spec only.**
