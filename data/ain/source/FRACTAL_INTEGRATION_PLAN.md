# FRACTAL_INTEGRATION_PLAN.md

Step-by-Step Backend + Frontend Integration for Adaptive PersonalOracleAgent

⸻

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├───────────────────────────────────────────────────────────────┤
│  WeeklySpiralView │ SeasonalCycles │ TrustBreathingIndicator│
└───────────────────────────┬──────────────────────────────────┘
                            │ API
┌───────────────────────────┴──────────────────────────────────┐
│                    PersonalOracleAgent                        │
├───────────────────────────────────────────────────────────────┤
│  PromptSelector → FractalMemorySystem → AdaptiveProfile      │
└───────────────────────────┬──────────────────────────────────┘
                            │ Database
┌───────────────────────────┴──────────────────────────────────┐
│                         Supabase                              │
├───────────────────────────────────────────────────────────────┤
│ user_state_snapshots │ user_archetypal_profiles │ summaries  │
└───────────────────────────────────────────────────────────────┘
```

⸻

## 📁 File Structure

```
SpiralogicOracleSystem/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── PersonalOracleAgent.ts
│   │   ├── services/
│   │   │   ├── FractalMemorySystem.ts
│   │   │   ├── AdaptiveProfileService.ts
│   │   │   └── TrustBreathingService.ts
│   │   ├── utils/
│   │   │   └── PromptSelector.ts
│   │   ├── config/
│   │   │   └── fractalPrompts.ts
│   │   └── types/
│   │       └── fractal.ts
│   └── supabase/
│       └── migrations/
│           ├── 001_user_state_snapshots.sql
│           ├── 002_user_archetypal_profiles.sql
│           └── 003_seasonal_meta_patterns.sql
├── app/
│   ├── api/
│   │   ├── oracle/
│   │   │   └── personal/
│   │   │       └── route.ts
│   │   └── user/
│   │       ├── weekly-summaries/
│   │       │   └── route.ts
│   │       └── seasonal-patterns/
│   │           └── route.ts
│   └── components/
│       ├── WeeklySpiralSummary.tsx
│       ├── SeasonalCycleView.tsx
│       └── TrustBreathingIndicator.tsx
└── lib/
    └── supabaseClient.ts
```

⸻

## 🔧 Step 1: Database Setup

### Create Supabase Tables

```sql
-- migrations/001_user_state_snapshots.sql
create table if not exists user_state_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id text not null,
  timestamp timestamptz not null default now(),
  currents text[] not null,
  regression boolean default false,
  breakthrough boolean default false,
  trust_level numeric(3,2) default 0.50,
  user_language text not null,
  reflection text,
  arc_echo text,
  parallel_processing text[],
  contradictions text[],
  system_notes text,
  source_agent text not null default 'PersonalOracleAgent'
);

-- migrations/002_user_archetypal_profiles.sql
create table if not exists user_archetypal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  fire_expressions jsonb default '{}',
  water_expressions jsonb default '{}',
  earth_expressions jsonb default '{}',
  air_expressions jsonb default '{}',
  aether_expressions jsonb default '{}',
  witness_ratio numeric(3,2) default 0.80,
  pattern_receptivity numeric(3,2) default 0.50,
  primary_arc text,
  spiral_rhythm interval,
  breakthrough_triggers text[],
  regression_patterns text[],
  profile_maturity int default 0,
  last_major_shift timestamptz,
  confidence_score numeric(3,2) default 0.30,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- migrations/003_seasonal_meta_patterns.sql
create table if not exists seasonal_meta_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  season_start date not null,
  season_end date not null,
  season_name text,
  primary_element text,
  secondary_element text,
  element_transitions jsonb,
  overarching_theme text,
  mythic_archetype text,
  sacred_story text,
  spiral_frequency numeric(4,2),
  breakthrough_density numeric(4,2),
  trust_trajectory text,
  arc_progression text[],
  recurring_themes text[],
  evolutionary_edges text[],
  maya_observations text[],
  user_discoveries text[],
  symbolic_imagery text[],
  created_at timestamptz default now(),
  confidence_score numeric(3,2) default 0.50
);
```

⸻

## 🔧 Step 2: Backend Services

### FractalMemorySystem.ts

```typescript
// backend/src/services/FractalMemorySystem.ts
import { supabase } from "@/lib/supabaseClient";
import { PromptSelector } from "@/utils/PromptSelector";
import { AdaptiveProfileService } from "./AdaptiveProfileService";
import { TrustBreathingService } from "./TrustBreathingService";

export class FractalMemorySystem {
  private profile: AdaptiveProfileService;
  private breathing: TrustBreathingService;

  constructor(private userId: string) {
    this.profile = new AdaptiveProfileService(userId);
    this.breathing = new TrustBreathingService(userId);
  }

  async processConversation(userInput: string): Promise<{
    response: string;
    context: FractalContext;
  }> {
    // 1. Build context from memory
    const context = await this.buildContext(userInput);

    // 2. Select appropriate prompt
    const systemPrompt = PromptSelector.select(context);

    // 3. Generate response via Claude
    const response = await this.claudeService.generate({
      system: systemPrompt,
      user: userInput,
      context
    });

    // 4. Log state snapshot
    await this.logStateSnapshot(context, userInput, response);

    // 5. Update adaptive profile
    await this.profile.updateFromSnapshot(context);

    return { response, context };
  }

  private async buildContext(userInput: string): Promise<FractalContext> {
    // Fetch recent snapshots
    const snapshots = await this.fetchRecentSnapshots();

    // Detect active currents
    const currents = this.detectCurrents(userInput, snapshots);

    // Check for spirals
    const spiral = await this.detectSpiral(userInput, snapshots);

    // Get trust breathing mode
    const breathing = await this.breathing.getCurrentMode(snapshots);

    // Fetch profile
    const profile = await this.profile.getProfile();

    return {
      userId: this.userId,
      session: { isFirstTime: snapshots.length === 0 },
      activeCurrents: currents,
      spiral,
      trustLevel: breathing.trustLevel,
      breathingMode: breathing.mode,
      arcEchoes: profile.arcEchoes,
      userExpression: userInput
    };
  }

  private async logStateSnapshot(
    context: FractalContext,
    userInput: string,
    response: string
  ) {
    await supabase.from("user_state_snapshots").insert([{
      session_id: context.session.id,
      user_id: this.userId,
      currents: context.activeCurrents.map(c => c.element),
      regression: context.spiral?.isRegression,
      breakthrough: context.breakthrough?.isActive,
      trust_level: context.trustLevel,
      user_language: userInput,
      reflection: response,
      arc_echo: context.arcEchoes?.[0]?.arcName,
      parallel_processing: context.activeCurrents.length > 1
        ? context.activeCurrents.map(c => c.element)
        : null
    }]);
  }
}
```

### AdaptiveProfileService.ts

```typescript
// backend/src/services/AdaptiveProfileService.ts
export class AdaptiveProfileService {
  constructor(private userId: string) {}

  async getProfile(): Promise<UserArchetypalProfile> {
    const { data } = await supabase
      .from("user_archetypal_profiles")
      .select("*")
      .eq("user_id", this.userId)
      .single();

    if (!data) {
      return this.createInitialProfile();
    }

    return this.parseProfile(data);
  }

  async updateFromSnapshot(context: FractalContext) {
    const profile = await this.getProfile();

    // Learn elemental expressions
    for (const current of context.activeCurrents) {
      const contextName = this.extractContext(context.userExpression);
      await this.strengthenElementalAssociation(
        current.element,
        contextName,
        current.intensity
      );
    }

    // Adjust witnessing ratio based on trust
    if (context.trustLevel > profile.lastTrustLevel) {
      // User responding well, can deepen slightly
      profile.witness_ratio *= 0.98; // Slow shift toward more reflection
    }

    // Update profile maturity
    profile.profile_maturity++;
    profile.confidence_score = Math.min(0.9, profile.confidence_score + 0.005);

    await this.saveProfile(profile);
  }

  private async strengthenElementalAssociation(
    element: string,
    context: string,
    intensity: number
  ) {
    const profile = await this.getProfile();
    const expressions = profile[`${element}_expressions`] || {};

    expressions[context] = expressions[context]
      ? (expressions[context] * 0.9 + intensity * 0.1) // Weighted average
      : intensity;

    await supabase
      .from("user_archetypal_profiles")
      .update({ [`${element}_expressions`]: expressions })
      .eq("user_id", this.userId);
  }
}
```

### TrustBreathingService.ts

```typescript
// backend/src/services/TrustBreathingService.ts
export class TrustBreathingService {
  constructor(private userId: string) {}

  async getCurrentMode(snapshots: UserStateSnapshot[]): Promise<{
    mode: BreathingMode;
    trustLevel: number;
  }> {
    if (snapshots.length === 0) {
      return { mode: "stabilization", trustLevel: 0.5 };
    }

    const currentTrust = snapshots[0].trust_level;
    const previousTrust = snapshots[1]?.trust_level || 0.5;
    const velocity = currentTrust - previousTrust;

    // Rapid contraction overrides level
    if (velocity < -0.10) {
      return { mode: "contraction", trustLevel: currentTrust };
    }

    // Standard level-based selection
    if (currentTrust < 0.40) return { mode: "contraction", trustLevel: currentTrust };
    if (currentTrust < 0.60) return { mode: "stabilization", trustLevel: currentTrust };
    if (currentTrust < 0.80) return { mode: "expansion", trustLevel: currentTrust };

    return { mode: "integration", trustLevel: currentTrust };
  }

  async adjustWitnessingRatio(mode: BreathingMode): Promise<number> {
    const ratios = {
      contraction: 0.95,   // 95% user, 5% system
      stabilization: 0.85, // 85% user, 15% system
      expansion: 0.70,     // 70% user, 30% system
      integration: 0.60    // 60% user, 40% system
    };

    return ratios[mode];
  }
}
```

⸻

## 🔧 Step 3: API Routes

### PersonalOracleAgent Route

```typescript
// app/api/oracle/personal/route.ts
import { NextResponse } from "next/server";
import { FractalMemorySystem } from "@/backend/services/FractalMemorySystem";

export async function POST(request: Request) {
  const { userId, message } = await request.json();

  const fractalSystem = new FractalMemorySystem(userId);
  const { response, context } = await fractalSystem.processConversation(message);

  return NextResponse.json({
    response,
    context: {
      breathingMode: context.breathingMode,
      trustLevel: context.trustLevel,
      activeElements: context.activeCurrents.map(c => c.element)
    }
  });
}
```

⸻

## 🔧 Step 4: Frontend Components

### TrustBreathingIndicator.tsx

```typescript
// app/components/TrustBreathingIndicator.tsx
import { useEffect, useState } from "react";

interface TrustBreathingProps {
  trustLevel: number;
  mode: "contraction" | "stabilization" | "expansion" | "integration";
}

export default function TrustBreathingIndicator({ trustLevel, mode }: TrustBreathingProps) {
  const modeColors = {
    contraction: "bg-gray-500",
    stabilization: "bg-blue-400",
    expansion: "bg-green-500",
    integration: "bg-purple-500"
  };

  const modeLabels = {
    contraction: "🌑 Witnessing",
    stabilization: "🌓 Grounding",
    expansion: "🌕 Opening",
    integration: "✨ Integrating"
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900">
      <div className="text-sm text-slate-400">Trust Breathing:</div>

      <div className={`px-3 py-1 rounded-full ${modeColors[mode]} text-white text-xs`}>
        {modeLabels[mode]}
      </div>

      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${modeColors[mode]}`}
          style={{ width: `${trustLevel * 100}%` }}
        />
      </div>

      <div className="text-xs text-slate-400">
        {(trustLevel * 100).toFixed(0)}%
      </div>
    </div>
  );
}
```

### SeasonalCycleView.tsx

```typescript
// app/components/SeasonalCycleView.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SeasonalCycleView({ pattern }: { pattern: SeasonalMetaPattern }) {
  const seasonEmojis = {
    Spring: "🌱",
    Summer: "☀️",
    Fall: "🍂",
    Winter: "❄️"
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
      <CardContent className="p-6">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {seasonEmojis[pattern.season_name]}
            {pattern.season_name || "Current Season"}
          </h2>
          <Badge>{pattern.mythic_archetype}</Badge>
        </header>

        <p className="text-lg italic text-sky-300 mb-4">
          "{pattern.overarching_theme}"
        </p>

        <div className="prose prose-invert">
          <p>{pattern.sacred_story}</p>
        </div>

        <div className="mt-4 flex gap-4 text-sm text-slate-400">
          <span>🌀 {pattern.spiral_frequency} spirals/month</span>
          <span>✨ {pattern.breakthrough_density} breakthroughs/month</span>
          <span>📈 Trust: {pattern.trust_trajectory}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

⸻

## 🔧 Step 5: Cron Jobs

### Weekly Summary Generator

```typescript
// backend/src/cron/weeklySummary.ts
import { supabase } from "@/lib/supabaseClient";
import { generateWeeklySummary } from "@/services/SummaryService";

export async function weeklyRollup() {
  // Get all active users
  const { data: users } = await supabase
    .from("user_archetypal_profiles")
    .select("user_id");

  for (const user of users) {
    await generateWeeklySummary(user.user_id);
  }
}

// Schedule: Every Sunday at midnight
// 0 0 * * 0 weeklyRollup
```

### Seasonal Pattern Generator

```typescript
// backend/src/cron/seasonalPattern.ts
export async function seasonalRollup() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Generate seasonal patterns for all users
  const { data: users } = await supabase
    .from("user_archetypal_profiles")
    .select("user_id");

  for (const user of users) {
    await generateSeasonalPattern(
      user.user_id,
      threeMonthsAgo,
      new Date()
    );
  }
}

// Schedule: First day of each season
// 0 0 1 3,6,9,12 * seasonalRollup
```

⸻

## 🚀 Deployment Steps

1. **Database Migration**
   ```bash
   supabase migration up
   ```

2. **Environment Variables**
   ```env
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   CLAUDE_API_KEY=your_key
   ```

3. **Deploy Backend**
   ```bash
   cd backend && npm run build && npm run deploy
   ```

4. **Deploy Frontend**
   ```bash
   vercel --prod
   ```

5. **Setup Cron Jobs**
   - Add to Vercel cron or separate cron service
   - Weekly summaries: Sundays at midnight
   - Seasonal patterns: Quarterly

⸻

## ✨ Result

Users experience:
- Real-time trust breathing visualization
- Weekly spiral summaries in mythic language
- Seasonal pattern reviews every 3 months
- Adaptive witnessing that evolves with them
- Their journey reflected as sacred mythology

The system learns each user's unique:
- Elemental expression patterns
- Trust expansion/contraction rhythms
- Spiral themes and breakthrough contexts
- Preferred witnessing balance
- Long-term archetypal movements