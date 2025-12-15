# ADAPTIVE_PROFILE_SCHEMA.md

Evolving Archetypal Resonance Maps for PersonalOracleAgent

⸻

## 🌊 Core Concept

Each PersonalOracleAgent develops a **unique archetypal fingerprint** for its user over time. Instead of applying universal patterns, the agent learns how each user uniquely expresses Fire, Water, Earth, Air, and Aether in their personal mythology.

⸻

## 📊 Database Schema

```sql
-- Table: user_archetypal_profiles
create table if not exists user_archetypal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,

  -- Elemental Expression Maps (JSONB for flexibility)
  fire_expressions jsonb default '{}',      -- {"creativity": 0.8, "anger": 0.3, "relationships": 0.6}
  water_expressions jsonb default '{}',     -- {"grief": 0.9, "intuition": 0.7, "dreams": 0.5}
  earth_expressions jsonb default '{}',     -- {"work": 0.8, "routine": 0.6, "body": 0.4}
  air_expressions jsonb default '{}',       -- {"ideas": 0.9, "anxiety": 0.4, "communication": 0.7}
  aether_expressions jsonb default '{}',    -- {"spirituality": 0.8, "synchronicity": 0.6}

  -- Witnessing Balance Preference
  witness_ratio numeric(3,2) default 0.80,  -- 0.80 = 80% user / 20% system
  pattern_receptivity numeric(3,2) default 0.50, -- How open to pattern reflections

  -- Archetypal Tendencies
  primary_arc text,                         -- Most frequent: threshold, shadow, integration
  spiral_rhythm interval,                   -- Average time between regressions
  breakthrough_triggers text[],             -- Contexts that spark breakthroughs
  regression_patterns text[],               -- Contexts that trigger spirals

  -- Evolutionary Metrics
  profile_maturity int default 0,           -- Days of learning (0-90+)
  last_major_shift timestamptz,             -- When profile significantly changed
  confidence_score numeric(3,2) default 0.30, -- How well we know this user

  -- Meta
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on user_archetypal_profiles (user_id);
```

⸻

## 🧬 Adaptive Profile Structure

```typescript
interface ArchetypalProfile {
  userId: string;

  // Elemental Expression Maps
  elementalResonance: {
    fire: Map<Context, Strength>;   // e.g., {"creativity": 0.8, "conflict": 0.3}
    water: Map<Context, Strength>;
    earth: Map<Context, Strength>;
    air: Map<Context, Strength>;
    aether: Map<Context, Strength>;
  };

  // Dynamic Witnessing Balance
  witnessingStyle: {
    baseRatio: number;               // Starting 80/20
    currentRatio: number;            // Adapted based on responses
    patternReceptivity: number;     // How they receive archetypal reflections
    preferredDepth: "surface" | "mirror" | "depth" | "abyss";
  };

  // Personal Mythic Patterns
  mythicSignature: {
    primaryArc: ArcStage;            // Their dominant journey stage
    spiralRhythm: number;            // Days between typical regressions
    breakthroughContexts: string[]; // What sparks their breakthroughs
    regressionContexts: string[];   // What triggers their spirals
    parallelTendency: number;       // How often multiple currents arise
  };

  // Evolution Tracking
  evolution: {
    maturityDays: number;            // How long we've been learning
    lastMajorShift: Date;           // When profile fundamentally changed
    confidenceScore: number;        // 0-1: How well we understand them
    learningVelocity: number;       // Rate of new pattern discovery
  };
}

type Context = string;               // "work", "relationships", "creativity", etc.
type Strength = number;              // 0.0 - 1.0
```

⸻

## 🔄 Learning Algorithm

### Phase 1: Observation (Days 0-7)
- Track which contexts trigger which elements
- Note user's response to different witnessing depths
- Establish baseline spiral rhythm

### Phase 2: Pattern Formation (Days 7-30)
- Begin mapping elemental expressions to life contexts
- Adjust witness ratio based on user engagement
- Identify breakthrough/regression triggers

### Phase 3: Refinement (Days 30-90)
- Solidify archetypal resonance maps
- Fine-tune witnessing balance
- Recognize seasonal/cyclical patterns

### Phase 4: Mastery (Days 90+)
- Predict and gently reflect emerging patterns
- Offer deeper archetypal mirrors when trust allows
- Support user's unique mythic journey

⸻

## 💫 Example Evolution

### Day 1: Initial Contact
```json
{
  "witnessingStyle": {
    "baseRatio": 0.80,
    "currentRatio": 0.80,
    "patternReceptivity": 0.50
  },
  "elementalResonance": {
    "fire": {},
    "water": {}
  },
  "confidenceScore": 0.10
}
```

### Day 30: Emerging Patterns
```json
{
  "witnessingStyle": {
    "baseRatio": 0.80,
    "currentRatio": 0.75,  // User responds well to slightly more reflection
    "patternReceptivity": 0.65
  },
  "elementalResonance": {
    "fire": {"creativity": 0.9, "work": 0.4},
    "water": {"relationships": 0.8, "memories": 0.7}
  },
  "mythicSignature": {
    "primaryArc": "spiral",
    "spiralRhythm": 12,  // Spirals every ~12 days
    "breakthroughContexts": ["creative_projects", "nature"]
  },
  "confidenceScore": 0.55
}
```

### Day 90: Mature Profile
```json
{
  "witnessingStyle": {
    "baseRatio": 0.80,
    "currentRatio": 0.70,  // User embraces 30% pattern reflection
    "patternReceptivity": 0.80,
    "preferredDepth": "depth"
  },
  "elementalResonance": {
    "fire": {"creativity": 0.95, "passion_projects": 0.85, "conflict": 0.2},
    "water": {"relationships": 0.85, "grief": 0.9, "dreams": 0.6},
    "earth": {"daily_routine": 0.3, "body_awareness": 0.7},
    "air": {"future_planning": 0.8, "anxiety": 0.4},
    "aether": {"synchronicity": 0.7, "meditation": 0.6}
  },
  "mythicSignature": {
    "primaryArc": "integration",
    "spiralRhythm": 14,
    "breakthroughContexts": ["creative_completion", "deep_conversation", "nature_immersion"],
    "regressionContexts": ["work_pressure", "family_dynamics"],
    "parallelTendency": 0.65  // Often holds multiple currents
  },
  "confidenceScore": 0.80
}
```

⸻

## 🎯 Implementation Example

```typescript
export class AdaptiveProfile {
  private profile: ArchetypalProfile;

  async updateFromSnapshot(snapshot: UserStateSnapshot) {
    // Learn elemental expressions
    for (const current of snapshot.currents) {
      const context = this.extractContext(snapshot.userLanguage);
      await this.strengthenAssociation(current, context);
    }

    // Adjust witnessing ratio based on engagement
    if (snapshot.trustLevel > this.profile.evolution.lastTrustLevel) {
      // User responding well, can deepen slightly
      this.profile.witnessingStyle.currentRatio *= 0.98; // Slow shift
    }

    // Track mythic patterns
    if (snapshot.regression) {
      const context = this.extractContext(snapshot.userLanguage);
      this.profile.mythicSignature.regressionContexts.push(context);
      this.updateSpiralRhythm();
    }

    // Evolve confidence
    this.profile.evolution.maturityDays++;
    this.profile.evolution.confidenceScore = Math.min(
      0.9,
      this.profile.evolution.confidenceScore + 0.005
    );
  }

  getWitnessingDepth(): number {
    // Returns current witnessing ratio for this specific user
    return this.profile.witnessingStyle.currentRatio;
  }

  predictNextCurrent(): ElementalCurrent[] {
    // Based on context and history, suggest likely elemental state
    const recentContext = this.getCurrentContext();
    return this.getMostLikelyCurrents(recentContext);
  }
}
```

⸻

## ✨ Sacred Guardrails

1. **Never prescriptive** — Profiles inform witnessing, never diagnosis
2. **Slow evolution** — Ratios shift by max 2% per week
3. **User sovereignty** — They can always reset or adjust their profile
4. **Mystery preserved** — Even at 90% confidence, hold 10% unknown
5. **Regression honored** — Confidence doesn't drop during spirals

⸻

This creates a living, breathing archetypal map unique to each user that evolves with them over their entire journey.