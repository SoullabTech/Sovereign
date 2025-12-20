# Skills Integration Guide: Wiring Into getMaiaResponse

**Status:** Ready for Integration
**File:** `lib/sovereign/maiaService.ts`
**Function:** `getMaiaResponse()`
**Line:** ~1372

---

## What We Built

**Complete filesystem + backend runtime:**
- ✅ `/skills` directory with 3 starter skills (elemental-checkin, window-of-tolerance, dialectical-scaffold)
- ✅ Database migrations (`supabase/migrations/20251220_create_skill_system.sql`)
- ✅ Skill loader (`lib/skills/loader.ts`)
- ✅ Skill selector (`lib/skills/selector.ts`)
- ✅ Skill executor (`lib/skills/executor.ts`)
- ✅ Runtime glue (`lib/skills/runtime.ts`)

**What's NOT built yet:**
- Integration into `getMaiaResponse()`
- Refusal message mapping (field safety copy integration)
- Usage logging to database

---

## Where To Insert Skills

### Current Flow in `getMaiaResponse()`

```typescript
export async function getMaiaResponse(req: MaiaRequest): Promise<MaiaResponse> {
  // 1. Get conversation history
  // 2. Normalize userName + mode
  // 3. 🛡️ FIELD SAFETY GATE (cognitive profile + field routing)
  // 4. 🧠 BLOOM DETECTION (cognitive level)
  // 5. 🔀 ROUTING (FAST/CORE/DEEP via maiaConversationRouter)
  // 6. Generate response
  // 7. Post-process + return
}
```

### Proposed Insertion Point

**AFTER:** Field safety + Bloom detection + Routing
**BEFORE:** Response generation

**Why here:**
- Field routing is complete (know realm, safety flags)
- Cognitive profile is available (know level, bypassing, stability)
- Processing tier is determined (FAST/CORE/DEEP)
- Have all state needed for `SkillContext`

**Approximate line:** ~1500-1600 (after routing, before prompt building)

---

## Integration Code (Draft)

```typescript
// After routing completes (around line 1500+)
// You have:
// - routingDecision (from maiaConversationRouter)
// - bloomDetection
// - cognitiveProfile
// - fieldSafety
// - meta (contains element, realm, etc.)

// Build SkillContext
import { runSkillRuntime, logSkillUsage } from '../skills/runtime';
import type { SkillContext, SkillResult } from '../skills/types';
import path from 'node:path';

const skillsRoot = path.join(process.cwd(), 'skills');

const skillContext: SkillContext = {
  userId: userId || sessionId,
  sessionId,
  queryText: input,
  state: {
    tierAllowed: routingDecision.profile, // 'FAST' | 'CORE' | 'DEEP'
    cognitiveLevel: bloomDetection?.level ?? 1,
    bypassingScore: cognitiveProfile?.bypassingScore ?? 0,
    stability: cognitiveProfile?.stability ?? 'unstable',
    nervousSystemState: (meta as any).nervousSystemState ?? 'window',
    element: (meta as any).element,
    realm: fieldSafety?.fieldRouting?.realm,
    safetyFlags: fieldSafety?.fieldRouting?.flags ?? [],
    shadowRiskFlags: [], // TODO: extract from cognitiveProfile
  },
  memory: {}, // TODO: integrate with session memory
};

// Try skill runtime
let skillResult: SkillResult | null = null;
try {
  skillResult = await runSkillRuntime({
    skillsRoot,
    ctx: skillContext,
    renderWithModel: async (system: string, user: string) => {
      // Use existing generateText function
      const result = await generateText({
        systemPrompt: system,
        userPrompt: user,
        model: 'deepseek-r1:14b', // or whatever model routing determined
      });
      return result.text;
    },
    refusalMessage: (keyOrReason: string) => {
      // Map to field safety copy
      // For now, generic
      return "Let's take the safest next step together.";
    },
  });

  // If skill returned result, log it
  if (skillResult) {
    await logSkillUsage(skillResult, skillContext, {
      query: async (sql: string, params: any[]) => {
        // Use your Postgres client
        // TODO: inject proper DB connection
      },
    });

    // If success, use skill result as response
    if (skillResult.outcome === 'success') {
      await addConversationExchange(sessionId, input, skillResult.responseText, {
        ...meta,
        skillUsed: skillResult.skillId,
        skillVersion: skillResult.version,
        processingProfile: routingDecision.profile,
        processingTimeMs: Date.now() - startTime,
      });

      return {
        text: skillResult.responseText,
        processingProfile: routingDecision.profile,
        processingTimeMs: Date.now() - startTime,
        metadata: {
          ...(meta as any),
          skillUsed: skillResult.skillId,
          skillVersion: skillResult.version,
          suggestedNextSkills: skillResult.suggestedNextSkills,
        },
      };
    }

    // If hard_refusal, return refusal
    if (skillResult.outcome === 'hard_refusal') {
      await addConversationExchange(sessionId, input, skillResult.responseText, {
        ...meta,
        skillRefused: skillResult.skillId,
        refusalReason: skillResult.summary,
        processingProfile: 'FAST',
        processingTimeMs: Date.now() - startTime,
      });

      return {
        text: skillResult.responseText,
        processingProfile: 'FAST',
        processingTimeMs: Date.now() - startTime,
        metadata: {
          ...(meta as any),
          skillRefused: skillResult.skillId,
          refusalReason: skillResult.summary,
        },
      };
    }
  }
} catch (error) {
  console.warn('⚠️  Skill runtime error:', error);
  // Fall through to normal processing
}

// If no skill match or soft_fail, continue with normal processing
// (existing prompt building + generateText flow)
```

---

## Refusal Message Integration

Currently uses generic message. Should integrate with `lib/field/fieldSafetyCopy.ts`:

```typescript
import { getFieldSafetyMessage } from '../field/fieldSafetyCopy';

refusalMessage: (keyOrReason: string) => {
  // Map skill refusal keys to field safety messages
  const mapping: Record<string, any> = {
    FAST_DORSAL_REFUSAL: {
      state: 'not_safe',
      bypass: 'none',
      element: 'earth',
    },
    DIALECTIC_REQUIRES_REGULATION: {
      state: 'not_safe',
      bypass: 'none',
      element: 'water',
    },
  };

  const config = mapping[keyOrReason];
  if (config) {
    return getFieldSafetyMessage(config);
  }

  // Fallback
  return "Let's take the safest next step together.";
},
```

---

## Database Connection

Skills need Postgres client for logging. Options:

### Option 1: Use existing Supabase client

```typescript
import { getSupabaseServer } from '../supabase/server';

const supabase = getSupabaseServer();

await logSkillUsage(skillResult, skillContext, {
  query: async (sql: string, params: any[]) => {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql,
      params,
    });
    if (error) throw error;
    return data;
  },
});
```

### Option 2: Direct Postgres connection

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

await logSkillUsage(skillResult, skillContext, {
  query: async (sql: string, params: any[]) => {
    return pool.query(sql, params);
  },
});
```

---

## Testing Strategy

### 1. Unit Test Individual Skills

```bash
cd /Users/soullab/MAIA-SOVEREIGN
npm run test:skills
```

Test file (create `lib/skills/__tests__/runtime.test.ts`):

```typescript
import { runSkillRuntime } from '../runtime';
import type { SkillContext } from '../types';

describe('Skills Runtime', () => {
  it('selects elemental-checkin for "how am I feeling" query', async () => {
    const ctx: SkillContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      queryText: 'how am I feeling right now?',
      state: {
        tierAllowed: 'FAST',
        element: 'water',
      },
    };

    const result = await runSkillRuntime({
      skillsRoot: './skills',
      ctx,
      renderWithModel: async (system, user) => {
        return 'Mock response from model';
      },
      refusalMessage: (key) => 'Mock refusal',
    });

    expect(result).toBeTruthy();
    expect(result?.skillId).toBe('elemental-checkin');
    expect(result?.outcome).toBe('success');
  });

  it('refuses dialectical-scaffold when nervous system is dorsal', async () => {
    const ctx: SkillContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      queryText: 'I feel stuck between two choices',
      state: {
        tierAllowed: 'CORE',
        nervousSystemState: 'dorsal', // BLOCKED
        cognitiveLevel: 3,
      },
    };

    const result = await runSkillRuntime({
      skillsRoot: './skills',
      ctx,
      renderWithModel: async () => '',
      refusalMessage: () => 'Not safe right now',
    });

    expect(result?.outcome).toBe('hard_refusal');
    expect(result?.skillId).toBe('dialectical-scaffold');
  });
});
```

### 2. Integration Test with Real Query

```bash
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "input": "I feel overwhelmed right now",
    "meta": {
      "userId": "test-user",
      "element": "water",
      "nervousSystemState": "sympathetic"
    }
  }'
```

Expected:
- Skill `window-of-tolerance` or `elemental-checkin` selected
- Response offers regulation step
- Database logged in `skill_usage_events`

---

## Rollout Plan

### Phase 1: Silent Mode (Week 1)
- Integrate skills into `getMaiaResponse()`
- Log all skill selections + outcomes
- DO NOT use skill results (let normal flow continue)
- Monitor: Which skills get selected? Success rates? Latency?

### Phase 2: A/B Test (Week 2)
- 10% of users get skill-powered responses
- Compare: User feedback, conversation depth, session length
- Iterate on skill prompts based on real usage

### Phase 3: Gradual Rollout (Week 3-4)
- 50% → 100% if metrics healthy
- Enable for all processing tiers (FAST/CORE/DEEP)

### Phase 4: Skill Evolution (Ongoing)
- Collect feedback
- Refine prompts
- Add new skills based on usage patterns
- Begin archetypal emergence detection

---

## Next Steps

1. **Choose insertion point** in `getMaiaResponse()` (after routing, ~line 1500)
2. **Implement integration code** (draft above)
3. **Wire database logging** (choose Supabase or pg.Pool)
4. **Map refusal keys** to field safety copy
5. **Test with one query** end-to-end
6. **Deploy in silent mode** (log but don't use results)
7. **Monitor for 1 week**, then A/B test

---

## The Minimal Diff

If you want the **absolute minimal change** to test skills:

```typescript
// Around line 1500 in getMaiaResponse(), after routing:

// TRY SKILLS (MVP)
if (process.env.SKILLS_ENABLED === '1') {
  const { runSkillRuntime } = await import('../skills/runtime');
  const skillResult = await runSkillRuntime({
    skillsRoot: path.join(process.cwd(), 'skills'),
    ctx: {
      userId: userId || sessionId,
      sessionId,
      queryText: input,
      state: {
        tierAllowed: routingDecision.profile,
        element: (meta as any).element,
      },
    },
    renderWithModel: async (sys, usr) => {
      const r = await generateText({ systemPrompt: sys, userPrompt: usr });
      return r.text;
    },
    refusalMessage: () => "Let's ground first.",
  });

  if (skillResult?.outcome === 'success') {
    return {
      text: skillResult.responseText,
      processingProfile: routingDecision.profile,
      processingTimeMs: Date.now() - startTime,
      metadata: { skillUsed: skillResult.skillId },
    };
  }
}

// Fall through to normal processing
```

Then test with `SKILLS_ENABLED=1 npm run dev`.

---

## The Architecture Is Complete

You have:
- ✅ Filesystem structure
- ✅ Database schema
- ✅ Loader, selector, executor, runtime
- ✅ 3 working skills

What's missing:
- The 15 lines of glue code in `getMaiaResponse()`
- One end-to-end test
- Monitoring dashboard (Phase 2)

**This is shippable.** The rest is iteration.

