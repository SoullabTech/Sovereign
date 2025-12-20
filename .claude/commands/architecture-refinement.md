---
description: "Refine architecture for new MAIA system feature"
argument-hint: "feature-name"
allowed-tools: "Read,Grep,Glob,Write,Edit"
---

# Architecture Refinement Pattern

You are architecting a new MAIA system feature: **$1**

FOLLOW THIS EXACT WORKFLOW:

## 1. PHILOSOPHY FIRST

Create `Community-Commons/09-Technical/$1_ARCHITECTURE.md`:

- Title + status line
- What problem does this solve? (2-3 sentences)
- How does it differ from similar systems? (table: Old vs New)
- What are the 3 core layers/components?
- Include one concrete example showing before/after behavior

## 2. TYPE SYSTEM

Create `lib/$1/types.ts`:

- All state interfaces with JSDoc comments
- Eligibility gates as explicit requirements
- Contraindication structure (when NOT to use)
- Discriminated unions for outcomes (success | soft_fail | hard_refusal)

Example:
```typescript
export interface FeatureContext {
  userId: string;
  sessionId: string;
  state: {
    cognitiveLevel?: number;      // Bloom's 1-6
    nervousSystemState?: NervousSystemState;
    bypassingScore?: number;      // 0.0-1.0
    element?: Element;
    realm?: Realm;
  };
}

export interface FeatureResult {
  outcome: 'success' | 'soft_fail' | 'hard_refusal';
  coherence?: 'stable' | 'volatile' | 'fragmenting';
  responseText: string;
  artifacts?: Record<string, unknown>;
}
```

## 3. DATABASE SCHEMA

Create `supabase/migrations/YYYYMMDD_create_$1.sql`:

- All tables with IF NOT EXISTS
- Helper functions (log_*, is_*, unlock_*)
- Observability views (v_$1_*)
- Performance indexes
- RLS policies (commented out if using direct Postgres)
- Rollback comments at top

Keep migrations <2KB each for reviewability.

## 4. PROGRESSIVE DISCLOSURE

Create `lib/$1/runtime.ts`:

Implement three-tier loading:
1. Boot time: Load metadata only (~1KB per item)
2. Selection time: Load definitions on-demand (~5KB per item)
3. Execution time: Load prompts/tools only when used (~2KB per item)

Include:
- Non-blocking error handling
- Feature flag checks ($1_ENABLED=1)
- Shadow mode support ($1_SHADOW_MODE=1)
- Graceful degradation if disabled

## 5. INTEGRATION POINT

Find location in `lib/sovereign/maiaService.ts`:

- After routing, before normal response paths
- Create integration block <150 lines
- Include feature flag guard
- Test both success and failure paths
- Document with inline comments

## 6. DOCUMENTATION

Create 3 files:

1. **$1_SYSTEM_SHIP_READY.md** (what was built, how to enable)
2. **HOW_TO_ADD_NEW_$1.md** (developer quick reference with checklist)
3. **$1_INTEGRATION_TEAM_MEMO.md** (team alignment, rollout plan)

## COMMIT MESSAGE FORMAT

```
🎯 $1: Phase N Complete - [What problem solved]

[2-3 sentence summary]

Files created/modified:
- lib/$1/*.ts (X files)
- supabase/migrations/*.sql (Y files)
- Community-Commons/09-Technical/*.md (Z docs)

Tests passing: ✅
Feature flag: $1_ENABLED=0 (default disabled)
Rollout plan: See $1_INTEGRATION_TEAM_MEMO.md
```

---

**Now begin with step 1: Create the philosophy document first.**
