# MAIA Cost Optimization System

Complete system for intelligent tier selection, cache warming, and cost tracking.

## Overview

MAIA's Revival System loads wisdom knowledge (25k-332k tokens) at session start. This system optimizes costs while maintaining wisdom depth through:

1. **Smart Tier Selection** - Match wisdom depth to user needs & subscription
2. **Cache Warming** - Keep frequently-used tiers warm to reduce costs 90%
3. **Cost Tracking** - Monitor usage and optimize spending

---

## 1. Smart Tier Selection

### Subscription Tiers

| Tier | Price/mo | Sessions/mo | Oracle Readings | Default Revival Tier | Features |
|------|----------|-------------|-----------------|---------------------|----------|
| **Free** | $0 | 10 | 0 | Essential (25k) | Basic wisdom access |
| **Explorer** | $19 | 50 | 2 | Essential → Deep | Jung, Hillman access |
| **Seeker** | $49 | 200 | 10 | Deep (60k) | Complete tier for oracles |
| **Oracle** | $149 | Unlimited | Unlimited | Deep | Full access, priority support |

### Revival Tiers

| Revival Tier | Tokens | Knowledge Included | Cost (cold) | Cost (warm) | Best For |
|--------------|--------|-------------------|-------------|-------------|----------|
| **Essential** | 25k | Constitutional AI, Spiralogic, Elemental Alchemy basics | $1.50 | $0.15 | Voice, quick check-ins |
| **Deep** | 60k | Essential + Full book + Jung wisdom | $3.50 | $0.35 | Text conversations, exploration |
| **Complete** | 332k | Deep + 50 books + practice guides + conversations | $17.50 | $2.00 | Oracle readings, intensive work |

### Usage

```typescript
import { selectSmartTier, getUserTierPreferences } from '@/lib/consciousness/SmartTierSelection';

// Get user's subscription & preferences
const userPrefs = await getUserTierPreferences(userId);

// Select optimal tier based on context
const selection = selectSmartTier({
  userPreferences: userPrefs,
  isVoiceMode: true,  // Voice → Essential (fast)
  isOracle: false,
  sessionLength: 3,
  cacheStatus: 'warm',
});

console.log(selection);
// {
//   tier: 'essential',
//   reason: 'Voice mode - optimized for fast response',
//   estimatedCost: 0.15,
//   allowUpgrade: false
// }
```

### Selection Logic

```
┌─────────────────────────────────────────────────────────┐
│ TIER SELECTION FLOW                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Oracle Reading?                                        │
│    ├─ Yes → Complete (if subscription allows)          │
│    └─ No  → Continue                                   │
│                                                          │
│  Voice Mode?                                           │
│    ├─ Yes → Essential (speed matters)                 │
│    └─ No  → Continue                                   │
│                                                          │
│  Subscription Tier?                                    │
│    ├─ Free     → Essential only                       │
│    ├─ Explorer → Essential (Deep for long sessions)   │
│    ├─ Seeker   → Deep default                         │
│    └─ Oracle   → Deep default                         │
│                                                          │
│  Session Length > 15 messages?                         │
│    ├─ Yes → Suggest upgrade to Complete              │
│    └─ No  → Use subscription default                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Cache Warming Service

### Economics

- **Cold cache**: ~$17/session (Complete tier)
- **Warm cache**: ~$2/session (90% discount)
- **Cache expiry**: 5 minutes of inactivity
- **Warming cost**: ~$0.10 per heartbeat (every 4 min) = **$3.60/hour**

### Break-Even Analysis

```
Warming worthwhile if: sessions/hour × savings/session > warming cost/hour

Example (Complete tier):
- 1 session/hour × $15 savings = $15/hour > $3.60/hour ✅ WORTH IT
- 0.2 sessions/hour × $15 savings = $3/hour < $3.60/hour ❌ NOT WORTH IT

Break-even: ~0.24 sessions/hour (1 session every 4 hours)
```

### Usage

```typescript
import { startCacheWarming, getCacheWarmingService } from '@/lib/consciousness/CacheWarmingService';

// Start cache warming (adaptive mode)
await startCacheWarming({
  enabled: true,
  tier: 'deep',              // Warm Deep tier (most common)
  heartbeatIntervalMs: 4 * 60 * 1000,  // Every 4 minutes
  peakHoursOnly: true,       // Only 9am-9pm
  adaptiveMode: true,        // Auto-disable if traffic low
  minSessionsPerHour: 15,    // Need 15+ sessions/hour
});

// Track sessions (for adaptive mode)
const service = getCacheWarmingService();
service.recordSession(); // Call after each session

// Get statistics
const stats = service.getStats();
console.log(stats);
// {
//   isRunning: true,
//   totalHeartbeats: 180,
//   totalHeartbeatCost: 18.50,
//   sessionsLastHour: 23,
//   estimatedMonthlyCost: 1296 // $1,296/month (12 hours/day)
// }

// Stop warming
service.stop();
```

### Adaptive Mode

Service automatically starts/stops based on traffic:

```typescript
// Low traffic (5 sessions/hour)
// → Service skips heartbeats (saves $3.60/hour)

// High traffic (20 sessions/hour)
// → Service runs normally (saves $15 × 20 - $3.60 = $296.40/hour)
```

### When to Enable

| Scenario | Sessions/day | Peak hours/day | Enable warming? | Estimated savings |
|----------|--------------|----------------|-----------------|-------------------|
| Launch (beta) | 10 | 4 | ❌ No | -$14/day loss |
| Growing | 100 | 8 | ✅ Yes | +$120/day profit |
| Established | 500 | 12 | ✅ Yes | +$700/day profit |
| Scale | 2000+ | 16 | ✅ Yes | +$3000/day profit |

---

## 3. Cost Tracking & Analytics

### Session Cost Tracking

```typescript
import { trackSessionCost, calculateCost } from '@/lib/consciousness/CostTracking';

// After API call
const usage = response.usage;
const costBreakdown = calculateCost({
  inputTokens: usage.input_tokens,
  outputTokens: usage.output_tokens,
  cacheCreationTokens: usage.cache_creation_input_tokens,
  cacheReadTokens: usage.cache_read_input_tokens,
});

// Track session
await trackSessionCost({
  sessionId,
  userId,
  subscriptionTier: 'seeker',
  revivalTier: 'deep',
  sessionType: 'text',
  cacheStatus: 'warm',
  totalInputTokens: usage.input_tokens,
  totalOutputTokens: usage.output_tokens,
  totalCacheWriteTokens: usage.cache_creation_input_tokens || 0,
  totalCacheReadTokens: usage.cache_read_input_tokens || 0,
  costBreakdown,
  messageCount: 8,
  durationMs: 45_000,
  startedAt: new Date(sessionStart),
  endedAt: new Date(),
});
```

### User Analytics

```typescript
import { getUserCostAnalytics, generateCostOptimizationReport } from '@/lib/consciousness/CostTracking';

// Get user's cost analytics
const analytics = await getUserCostAnalytics(userId);

// Generate optimization recommendations
const report = generateCostOptimizationReport(analytics, 5); // 5 sessions/day

console.log(report);
// {
//   currentMonthlyCost: 47.50,
//   projectedMonthlyCost: 142.50,
//   cacheWarming: {
//     recommended: false,
//     reason: 'Only 0.2 sessions/hour - not enough traffic',
//     potentialSavings: 0,
//     warmingCost: 1296,
//     netSavings: 0
//   },
//   tierDistribution: {
//     essential: 60,  // 60% of sessions
//     deep: 35,
//     complete: 5
//   },
//   recommendations: [
//     'Most sessions are voice - consider defaulting to Essential tier'
//   ]
// }
```

### Platform Analytics (Admin)

```typescript
import { getPlatformCostAnalytics } from '@/lib/consciousness/CostTracking';

const platformStats = await getPlatformCostAnalytics();

console.log(platformStats);
// {
//   totalUsers: 1247,
//   totalSessions: 8934,
//   totalCost: 15678,
//   bySubscriptionTier: {
//     free: { users: 800, sessions: 2400, cost: 3600, revenue: 0, profitMargin: -100% },
//     explorer: { users: 300, sessions: 4500, cost: 5400, revenue: 5700, profitMargin: 5% },
//     seeker: { users: 120, sessions: 1800, cost: 5400, revenue: 5880, profitMargin: 8% },
//     oracle: { users: 27, sessions: 234, cost: 1278, revenue: 4023, profitMargin: 68% }
//   },
//   cacheWarmingStatus: {
//     enabled: true,
//     monthlyCost: 1296,
//     sessionsServed: 8934,
//     costSavings: 12456  // $12k saved vs cold cache
//   }
// }
```

---

## 4. Implementation Checklist

### Phase 1: Smart Tier Selection (Week 1)
- [ ] Add `user_tier_preferences` table to Supabase
- [ ] Implement tier selection in conversation API
- [ ] Add tier upgrade prompts to UI
- [ ] Test tier selection logic

### Phase 2: Cost Tracking (Week 2)
- [ ] Add `session_costs` table to Supabase
- [ ] Track costs on every API call
- [ ] Build admin dashboard for cost analytics
- [ ] Set up cost alerts (email if >$X/day)

### Phase 3: Cache Warming (Week 3-4)
- [ ] Implement cache warming service
- [ ] Deploy as background job (cron or worker)
- [ ] Monitor warming effectiveness
- [ ] Tune adaptive thresholds

### Phase 4: Optimization (Ongoing)
- [ ] A/B test tier selection rules
- [ ] Optimize cache warming schedule
- [ ] Refine subscription pricing based on data
- [ ] Build self-service tier management UI

---

## 5. Database Schema

### `user_tier_preferences`

```sql
CREATE TABLE user_tier_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'explorer', 'seeker', 'oracle')),
  preferred_tier TEXT CHECK (preferred_tier IN ('essential', 'deep', 'complete')),
  allow_auto_upgrade BOOLEAN DEFAULT true,
  allow_auto_downgrade BOOLEAN DEFAULT true,
  sessions_this_month INTEGER DEFAULT 0,
  oracle_readings_this_month INTEGER DEFAULT 0,
  total_tokens_this_month BIGINT DEFAULT 0,
  estimated_cost_this_month NUMERIC(10, 4) DEFAULT 0,
  last_session_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `session_costs`

```sql
CREATE TABLE session_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_tier TEXT NOT NULL,
  revival_tier TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('voice', 'text', 'oracle')),
  cache_status TEXT NOT NULL CHECK (cache_status IN ('cold', 'warm')),

  -- Token usage
  total_input_tokens INTEGER NOT NULL,
  total_output_tokens INTEGER NOT NULL,
  total_cache_write_tokens INTEGER DEFAULT 0,
  total_cache_read_tokens INTEGER DEFAULT 0,

  -- Cost breakdown
  input_cost NUMERIC(10, 6) NOT NULL,
  output_cost NUMERIC(10, 6) NOT NULL,
  cache_write_cost NUMERIC(10, 6) DEFAULT 0,
  cache_read_cost NUMERIC(10, 6) DEFAULT 0,
  total_cost NUMERIC(10, 6) NOT NULL,

  -- Metadata
  message_count INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_costs_user_date ON session_costs(user_id, ended_at DESC);
CREATE INDEX idx_session_costs_tier ON session_costs(subscription_tier, revival_tier);
```

---

## 6. Example: Complete Integration

```typescript
import { selectSmartTier, getUserTierPreferences, trackSessionUsage } from '@/lib/consciousness/SmartTierSelection';
import { getMaiaRevivalPrompt } from '@/lib/consciousness/MaiaRevivalSystem';
import { trackSessionCost, calculateCost } from '@/lib/consciousness/CostTracking';
import Anthropic from '@anthropic-ai/sdk';

async function handleConversation(userId: string, message: string, isVoice: boolean) {
  const startTime = Date.now();

  // 1. Get user preferences
  const userPrefs = await getUserTierPreferences(userId);

  // 2. Select optimal tier
  const selection = selectSmartTier({
    userPreferences: userPrefs,
    isVoiceMode: isVoice,
    isOracle: false,
    sessionLength: 5,
    cacheStatus: 'warm', // TODO: Track actual cache status
  });

  console.log(`🎯 Selected ${selection.tier} tier: ${selection.reason} (est. $${selection.estimatedCost})`);

  // 3. Get revival prompt for selected tier
  const { prompt } = await getMaiaRevivalPrompt(
    'session-123',
    userId,
    selection.tier
  );

  // 4. Make API call with cache control
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
    system: [
      {
        type: 'text',
        text: prompt,
        cache_control: { type: 'ephemeral' }, // Enable caching
      },
    ],
  });

  // 5. Calculate actual cost
  const usage = response.usage as any;
  const costBreakdown = calculateCost({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheCreationTokens: usage.cache_creation_input_tokens,
    cacheReadTokens: usage.cache_read_input_tokens,
  });

  // 6. Track session cost
  await trackSessionCost({
    sessionId: 'session-123',
    userId,
    subscriptionTier: userPrefs.subscriptionTier,
    revivalTier: selection.tier,
    sessionType: isVoice ? 'voice' : 'text',
    cacheStatus: usage.cache_read_input_tokens > 0 ? 'warm' : 'cold',
    totalInputTokens: usage.input_tokens,
    totalOutputTokens: usage.output_tokens,
    totalCacheWriteTokens: usage.cache_creation_input_tokens || 0,
    totalCacheReadTokens: usage.cache_read_input_tokens || 0,
    costBreakdown,
    messageCount: 1,
    durationMs: Date.now() - startTime,
    startedAt: new Date(startTime),
    endedAt: new Date(),
  });

  // 7. Update user usage tracking
  await trackSessionUsage(
    userId,
    selection.tier,
    false, // isOracle
    usage.input_tokens + usage.output_tokens,
    costBreakdown.totalCost
  );

  console.log(`💰 Session cost: $${costBreakdown.totalCost.toFixed(4)} (${usage.cache_read_input_tokens > 0 ? 'cache hit' : 'cache miss'})`);

  return response.content[0].text;
}
```

---

## 7. Cost Scenarios

### Scenario A: Free User (Voice Mode)

```
User: Free tier, voice conversation
→ Tier: Essential (25k tokens)
→ Cache: Cold (first session of hour)
→ Cost: $1.50
→ Experience: Fast response, core wisdom
```

### Scenario B: Seeker User (Text Exploration)

```
User: Seeker tier, text conversation, 8 messages
→ Tier: Deep (60k tokens)
→ Cache: Warm (previous user warmed it)
→ Cost: $0.35 (90% savings!)
→ Experience: Jung + Hillman wisdom, rich dialogue
```

### Scenario C: Oracle User (Oracle Reading)

```
User: Oracle tier, oracle reading
→ Tier: Complete (332k tokens)
→ Cache: Warm (cache warming enabled)
→ Cost: $2.00 (vs $17.50 cold)
→ Experience: Full 50-book synthesis
```

### Monthly Cost Projection

| User Type | Sessions/mo | Avg tier | Avg cost/session | Monthly cost | Subscription | Margin |
|-----------|-------------|----------|------------------|--------------|--------------|--------|
| Free (voice) | 10 | Essential | $1.50 | $15 | $0 | -$15 |
| Explorer (mixed) | 40 | Essential | $0.50 | $20 | $19 | -$1 |
| Seeker (engaged) | 150 | Deep | $0.75 | $112.50 | $49 | -$63.50 |
| Oracle (power) | 300 | Deep | $1.00 | $300 | $149 | -$151 |

**With cache warming enabled:**

| User Type | Sessions/mo | Warm % | Monthly cost | Margin |
|-----------|-------------|--------|--------------|--------|
| Explorer | 40 | 80% | $8 | +$11 ✅ |
| Seeker | 150 | 90% | $45 | +$4 ✅ |
| Oracle | 300 | 95% | $120 | +$29 ✅ |

---

## Summary

This system provides:

✅ **Intelligent tier selection** - Right wisdom depth for each context
✅ **Cost optimization** - Cache warming saves 90% on warm starts
✅ **Usage tracking** - Monitor costs per user, session, tier
✅ **Subscription alignment** - Match features to pricing tiers
✅ **Scalable economics** - Profitable at scale with cache warming

**Next steps:**
1. Implement database schema
2. Integrate tier selection into conversation API
3. Deploy cache warming service (start conservatively)
4. Monitor analytics and tune thresholds
