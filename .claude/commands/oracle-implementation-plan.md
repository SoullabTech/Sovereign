---
description: "Turn an approved Oracle feature spec into exact implementation steps"
argument-hint: "feature-name"
allowed-tools: "Read,Grep,Glob"
---

# Oracle Implementation Plan

You are writing an implementation plan for an approved Oracle feature: **$1**

## Prerequisites

Before writing this plan:
1. Read the approved spec (the user should have provided it or it should be in the conversation)
2. Read every file listed in the spec to understand current state
3. Identify exact insertion points — line numbers and surrounding code

## Plan format

For each file in the spec, provide:

### File: `[exact path]`
- **Action**: create / edit
- **Responsibility**: what this file does after the change
- **Insertion point**: after which function/line/block
- **Exact changes**:
  - Imports to add
  - Types to add or modify
  - Functions to add or modify
  - Exports to update
- **Lines of change**: approximate count
- **Dependencies**: what must be done before this file

## Ordering rules

1. **Types first** — shared interfaces, discriminated unions, metadata shapes
2. **Core logic second** — the actual feature implementation (helper modules, services)
3. **Orchestration wiring third** — changes to `app/api/oracle/conversation/route.ts` or `lib/voice/conductor.ts`
4. **Memory integration fourth** — if the feature needs persistence via `lib/consciousness/spiralStatePersistence.ts` or a new table
5. **Tests fifth** — unit tests, edge cases, negative cases

## End with

### Migration (if needed)
- File: `database/migrations/YYYYMMDDHHMMSS_[name].sql`
- Tables, columns, indexes
- Registration command for `schema_migrations`

### Verification steps
1. `npm run typecheck` — zero errors
2. `npm run check:no-supabase` — clean
3. `npm run smoke` — passes
4. Manual verification: [specific steps]
5. Sovereignty check: [specific question]

### Likely regression zones
- What existing behavior might break
- What to watch in production after deploy

### Follow-up improvements
- What this enables but should NOT be built yet
- What to observe before deciding next steps

## Constraints

- Only include files from the approved spec
- Give exact insertion points, not vague descriptions
- If you find the spec missed something, flag it — do not silently add scope
- Do not execute — return the plan only

**Wait for explicit approval before implementing.**
