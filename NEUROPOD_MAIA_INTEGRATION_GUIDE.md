# Neuropod × MAIA Integration Guide
## Wiring Biometric Intelligence into Consciousness Development Architecture

**Author:** Soullab Consciousness Computing Team
**Date:** December 2024
**Status:** Implementation Ready
**For:** Engineering Team, Clinical Director, Pioneer Circle

---

## Executive Summary (Implementation Overview)

### What This Document Provides

**For Engineers:**
- Exact integration points in existing MAIA codebase
- TypeScript interfaces and functions to add
- Database schema extensions
- API endpoint specifications

**For Clinical:**
- Safety gating logic (how Bloom level + field stability + bypassing → protocol eligibility)
- Archetypal session design templates
- Reality-testing integration points

**For Product:**
- Membership tier → protocol access mapping
- Pioneer Circle exclusivity features
- Community Commons enhanced gating

---

## Integration Architecture (System Overview)

```
MAIA Consciousness Development Stack:
┌─────────────────────────────────────────────────────────────┐
│ User Request ("Help me process grief/find clarity/sleep")   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. MAIA Router (maiaService.ts)                              │
│    - Analyzes request (FAST/CORE/DEEP)                       │
│    - Fetches cognitive profile (Bloom level, bypassing)      │
│    - Consults field safety router (UNDERWORLD/MIDDLEWORLD)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. NEW: Neuropod Eligibility Check                           │
│    - assessNeuropodEligibility(bloom, stability, bypassing)  │
│    - Returns: tier1/tier2/tier3 access + recommended protocols│
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MAIA Guidance (conversational + archetypal)               │
│    - OR -                                                     │
│ 3. Neuropod Session (biometric + protocol)                   │
│    - OR -                                                     │
│ 3. Hybrid (archetypal session WITH Neuropod stimulation)     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Real-Time Biometric Loop (if Neuropod active)             │
│    - coherenceTracker → safetyPredictor → psychoactivationEngine│
│    - Auto-adapt intensity based on risk score                │
│    - Emergency stop if overwhelm detected                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Integration + Validation (post-session)                   │
│    - Reality-testing check (grounding, meaning deferral)     │
│    - Biometric data logged → validates Bloom progression     │
│    - HRV coherence + ASSR PLV become developmental markers   │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Field Safety Router Extension

### Current System (lib/field/panconsciousFieldRouter.ts)

```typescript
export interface FieldRoutingDecision {
  realm: 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC';
  intensity: 'low' | 'medium' | 'high';
  safetyFlags: {
    bypassingDetected: boolean;
    destabilizationRisk: boolean;
  };
}

export function routeFieldWork(
  bloomLevel: number,
  fieldStability: number,
  bypassingScore: number
): FieldRoutingDecision {
  // Existing logic: Route to UNDERWORLD/MIDDLEWORLD/UPPERWORLD
  // ...
}
```

### Extension: Add Neuropod Eligibility

**File:** `lib/field/neuropodEligibility.ts` (NEW)

```typescript
/**
 * Neuropod Protocol Eligibility Assessment
 *
 * Integrates with panconsciousFieldRouter to determine which Neuropod
 * protocols are safe/appropriate for user based on developmental status.
 */

export interface NeuropodEligibility {
  tier1Access: boolean;          // Low-risk protocols (all users)
  tier2Access: boolean;          // ASSR/somatic (Bloom 3+, stable field)
  tier3Access: boolean;          // Clinical-only (always false for now)
  recommendedProtocols: string[]; // Based on current field status
  exclusionReason?: string;      // Why user is blocked (if applicable)
}

export interface NeuropodProtocolMetadata {
  tier: 1 | 2 | 3;
  requiredBloomLevel: number;
  requiredFieldStability: number;
  maxBypassingScore: number;
  exclusionFlags: ('psychosis' | 'dissociation' | 'seizure' | 'pregnancy' | 'pacemaker')[];
}

// Protocol tier requirements
const PROTOCOL_TIERS: Record<string, NeuropodProtocolMetadata> = {
  // Tier 1: Low-Risk Clinical
  'breath-paced-grounding': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker'],
  },
  'breath-paced-vibroacoustic': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },
  'vibroacoustic-stress-reduction': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0.3,
    maxBypassingScore: 0.8,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },
  'vibroacoustic-sleep-prep': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0.3,
    maxBypassingScore: 1.0,
    exclusionFlags: ['pacemaker', 'pregnancy'],
  },
  'alpha-relaxation': {
    tier: 1,
    requiredBloomLevel: 0,
    requiredFieldStability: 0,
    maxBypassingScore: 1.0,
    exclusionFlags: [],
  },

  // Tier 2: Research-Only (Moderate Screening)
  'assr-receptive-absorption': {
    tier: 2,
    requiredBloomLevel: 3.0,
    requiredFieldStability: 0.6,
    maxBypassingScore: 0.4,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },
  'assr-contemplative-theta': {
    tier: 2,
    requiredBloomLevel: 3.0,
    requiredFieldStability: 0.6,
    maxBypassingScore: 0.4,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },
  'assr-gamma-insight': {
    tier: 2,
    requiredBloomLevel: 3.5,
    requiredFieldStability: 0.7,
    maxBypassingScore: 0.35,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },
  'vibroacoustic-attention-reset': {
    tier: 2,
    requiredBloomLevel: 2.5,
    requiredFieldStability: 0.5,
    maxBypassingScore: 0.5,
    exclusionFlags: ['seizure', 'pacemaker', 'pregnancy'],
  },
  'vibroacoustic-somatic-exploration': {
    tier: 2,
    requiredBloomLevel: 4.0,
    requiredFieldStability: 0.7,
    maxBypassingScore: 0.3,
    exclusionFlags: ['psychosis', 'dissociation', 'pacemaker', 'pregnancy'],
  },
  'assr-hypnagogic-doorway': {
    tier: 2,
    requiredBloomLevel: 3.0,
    requiredFieldStability: 0.65,
    maxBypassingScore: 0.4,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },

  // Tier 3: Experimental (High Screening)
  'wind-up-crescendo': {
    tier: 3,
    requiredBloomLevel: 4.0,
    requiredFieldStability: 0.75,
    maxBypassingScore: 0.25,
    exclusionFlags: ['psychosis', 'seizure', 'dissociation'],
  },
  'annealing-pathway': {
    tier: 3,
    requiredBloomLevel: 4.0,
    requiredFieldStability: 0.75,
    maxBypassingScore: 0.25,
    exclusionFlags: ['psychosis', 'seizure'],
  },
};

export function assessNeuropodEligibility(
  bloomLevel: number,
  fieldStability: number,
  bypassingScore: number,
  exclusionFlags: Set<string>, // From user health history
  membershipTier: 'foundation' | 'explorer' | 'pioneer'
): NeuropodEligibility {
  const eligibleProtocols = Object.entries(PROTOCOL_TIERS).filter(([protocolId, metadata]) => {
    // Check medical exclusions
    const hasExclusion = metadata.exclusionFlags.some(flag => exclusionFlags.has(flag));
    if (hasExclusion) return false;

    // Check developmental requirements
    if (bloomLevel < metadata.requiredBloomLevel) return false;
    if (fieldStability < metadata.requiredFieldStability) return false;
    if (bypassingScore > metadata.maxBypassingScore) return false;

    // Check membership tier access
    if (metadata.tier === 2 && membershipTier === 'foundation') return false;
    if (metadata.tier === 3 && membershipTier !== 'pioneer') return false;

    return true;
  });

  const tier1Access = eligibleProtocols.some(([_, meta]) => meta.tier === 1);
  const tier2Access = eligibleProtocols.some(([_, meta]) => meta.tier === 2);
  const tier3Access = eligibleProtocols.some(([_, meta]) => meta.tier === 3);

  // Recommend protocols based on current field status
  const recommendedProtocols: string[] = [];

  if (fieldStability < 0.4) {
    // Unstable field → grounding only
    const grounding = ['breath-paced-grounding', 'breath-paced-vibroacoustic']
      .filter(id => eligibleProtocols.some(([p, _]) => p === id));
    recommendedProtocols.push(...grounding);
  } else if (bloomLevel >= 4.0 && fieldStability > 0.7 && bypassingScore < 0.3) {
    // High + stable + clean → ASSR absorption
    const absorption = ['assr-receptive-absorption', 'assr-contemplative-theta', 'assr-gamma-insight']
      .filter(id => eligibleProtocols.some(([p, _]) => p === id));
    recommendedProtocols.push(...absorption);
  } else if (bloomLevel >= 3.0 && fieldStability > 0.6) {
    // Intermediate → stress reduction, attention reset
    const intermediate = ['vibroacoustic-stress-reduction', 'vibroacoustic-attention-reset']
      .filter(id => eligibleProtocols.some(([p, _]) => p === id));
    recommendedProtocols.push(...intermediate);
  } else {
    // Default → sleep prep, relaxation
    const basic = ['vibroacoustic-sleep-prep', 'alpha-relaxation']
      .filter(id => eligibleProtocols.some(([p, _]) => p === id));
    recommendedProtocols.push(...basic);
  }

  // Determine exclusion reason if no access
  let exclusionReason: string | undefined;
  if (!tier1Access && !tier2Access && !tier3Access) {
    if (exclusionFlags.has('psychosis')) {
      exclusionReason = 'History of psychosis requires clinical oversight before Neuropod use';
    } else if (exclusionFlags.has('seizure')) {
      exclusionReason = 'Seizure disorder requires medical clearance';
    } else if (fieldStability < 0.3) {
      exclusionReason = 'Field stability too low; focus on grounding practices first';
    } else if (bypassingScore > 0.7) {
      exclusionReason = 'High bypassing detected; focus on integration work before Neuropod';
    } else {
      exclusionReason = 'Developmental readiness requirements not yet met';
    }
  } else if (tier1Access && !tier2Access) {
    if (bloomLevel < 3.0) {
      exclusionReason = 'Tier 2 protocols require Bloom Level 3+ (pattern recognition demonstrated)';
    } else if (fieldStability < 0.6) {
      exclusionReason = 'Tier 2 protocols require stable field (current: unstable/volatile)';
    } else if (bypassingScore > 0.4) {
      exclusionReason = 'Tier 2 protocols require low bypassing (current: elevated)';
    }
  }

  return {
    tier1Access,
    tier2Access,
    tier3Access,
    recommendedProtocols,
    exclusionReason,
  };
}
```

---

## Part 2: MAIA Router Integration

### Extend FieldRoutingDecision Interface

**File:** `lib/field/panconsciousFieldRouter.ts` (UPDATE)

```typescript
import type { NeuropodEligibility } from './neuropodEligibility';

export interface FieldRoutingDecision {
  realm: 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC';
  intensity: 'low' | 'medium' | 'high';
  safetyFlags: {
    bypassingDetected: boolean;
    destabilizationRisk: boolean;
  };

  // NEW: Neuropod eligibility assessment
  neuropodEligibility: NeuropodEligibility;
}
```

### Call Neuropod Eligibility in MAIA Service

**File:** `lib/sovereign/maiaService.ts` (UPDATE)

```typescript
import { assessNeuropodEligibility } from '../field/neuropodEligibility';

export async function processRequest(userId: string, message: string): Promise<MaiaResponse> {
  // 1. Fetch cognitive profile (existing)
  const cognitiveProfile = await getCognitiveProfile(userId);

  // 2. Analyze message complexity (existing)
  const complexity = analyzeMessageComplexity(message);

  // 3. Route to FAST/CORE/DEEP (existing)
  const processingPath = determineProcessingPath(complexity, cognitiveProfile);

  // 4. Consult field safety router (existing)
  const fieldDecision = routeFieldWork(
    cognitiveProfile.currentLevel,
    cognitiveProfile.stability,
    cognitiveProfile.bypassingScore
  );

  // 5. NEW: Assess Neuropod eligibility
  const userExclusions = await getUserHealthExclusions(userId); // From user_health_profile table
  const membershipTier = await getUserMembershipTier(userId);   // From user_membership table

  const neuropodEligibility = assessNeuropodEligibility(
    cognitiveProfile.currentLevel,
    cognitiveProfile.stability,
    cognitiveProfile.bypassingScore,
    userExclusions,
    membershipTier
  );

  // Attach neuropod eligibility to field decision
  fieldDecision.neuropodEligibility = neuropodEligibility;

  // 6. Generate MAIA response (existing logic, now aware of Neuropod options)
  const response = await generateResponse({
    processingPath,
    fieldDecision,
    cognitiveProfile,
    message,
  });

  // 7. If user is asking for state support, suggest Neuropod protocol
  if (isStateRequest(message) && neuropodEligibility.recommendedProtocols.length > 0) {
    response.neuropodSuggestion = {
      protocols: neuropodEligibility.recommendedProtocols,
      rationale: `Based on your current state (Bloom ${cognitiveProfile.currentLevel.toFixed(1)}, Field Stability ${(cognitiveProfile.stability * 100).toFixed(0)}%), these protocols may support you.`,
    };
  }

  return response;
}

function isStateRequest(message: string): boolean {
  const stateKeywords = ['calm', 'focus', 'sleep', 'stress', 'relax', 'ground', 'center', 'absorb', 'contemplate'];
  return stateKeywords.some(kw => message.toLowerCase().includes(kw));
}
```

---

## Part 3: Database Schema Extensions

### New Tables

**File:** `supabase/migrations/20251217000002_neuropod_maia_integration.sql` (NEW)

```sql
-- User health profile (medical exclusions)
CREATE TABLE user_health_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  psychosis_history BOOLEAN DEFAULT FALSE,
  seizure_history BOOLEAN DEFAULT FALSE,
  dissociation_history BOOLEAN DEFAULT FALSE,
  pregnancy_status BOOLEAN DEFAULT FALSE,
  pacemaker_implant BOOLEAN DEFAULT FALSE,

  -- Free-text medical notes (optional, for clinical review)
  medical_notes TEXT,

  -- Consent flags
  neuropod_waiver_signed BOOLEAN DEFAULT FALSE,
  neuropod_waiver_signed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_profile_user ON user_health_profile(user_id);

-- User membership tier
CREATE TABLE user_membership (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('foundation', 'explorer', 'pioneer')),

  -- Tier history (for tracking upgrades)
  tier_history JSONB DEFAULT '[]'::jsonb,

  -- Payment status (if applicable)
  subscription_active BOOLEAN DEFAULT TRUE,
  subscription_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membership_user ON user_membership(user_id);
CREATE INDEX idx_membership_tier ON user_membership(tier);

-- Neuropod session <> MAIA conversation linkage
CREATE TABLE neuropod_maia_sessions (
  session_id UUID PRIMARY KEY REFERENCES neuropod_vibroacoustic_sessions(session_id),
  conversation_id UUID REFERENCES maia_conversations(id),
  archetypal_theme VARCHAR(100),  -- e.g., 'shadow-integration', 'anima-work', 'hero-journey'

  -- Pre-session MAIA prompts (what MAIA asked before session)
  pre_prompts TEXT[],

  -- Post-session integration (what MAIA asked after)
  post_prompts TEXT[],
  integration_quality_rating INTEGER CHECK (integration_quality_rating >= 1 AND integration_quality_rating <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_neuropod_maia_conversation ON neuropod_maia_sessions(conversation_id);
CREATE INDEX idx_neuropod_maia_theme ON neuropod_maia_sessions(archetypal_theme);

-- Bloom progression validation (biometric → Bloom level correlation)
CREATE TABLE bloom_biometric_validation (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  bloom_level FLOAT NOT NULL,

  -- Biometric markers at this Bloom level
  avg_hrv_coherence FLOAT,
  max_assr_plv FLOAT,            -- Best ASSR entrainment achieved
  avg_global_synchrony FLOAT,
  avg_defect_density FLOAT,
  avg_field_alignment FLOAT,

  -- Session count at this level
  neuropod_sessions_at_level INTEGER DEFAULT 0,

  -- Timestamp (when user first reached this Bloom level)
  first_reached_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bloom_validation_user ON bloom_biometric_validation(user_id);
CREATE INDEX idx_bloom_validation_level ON bloom_biometric_validation(bloom_level);

-- Community Commons enhanced gate (Bloom + biometric requirements)
ALTER TABLE community_commons_posts ADD COLUMN IF NOT EXISTS
  neuropod_sessions_completed INTEGER DEFAULT 0,
  avg_hrv_coherence FLOAT,
  max_assr_plv FLOAT,
  high_risk_events INTEGER DEFAULT 0;  -- Count of safety predictor overwhelm episodes

-- Trigger to update Commons eligibility when user completes Neuropod session
CREATE OR REPLACE FUNCTION update_commons_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET commons_eligible = (
    -- Existing Bloom requirement
    (SELECT avg_bloom_level FROM cognitive_profiles WHERE user_id = NEW.user_id) >= 4.0
    AND
    -- NEW: Neuropod biometric requirements
    (SELECT COUNT(*) FROM neuropod_vibroacoustic_sessions WHERE user_id = NEW.user_id) >= 5
    AND
    (SELECT AVG(avg_hrv_coherence) FROM neuropod_vibroacoustic_sessions WHERE user_id = NEW.user_id AND avg_hrv_coherence IS NOT NULL) > 0.55
    AND
    (SELECT COUNT(*) FROM neuropod_vibroacoustic_sessions WHERE user_id = NEW.user_id AND peak_safety_risk_score > 0.85) = 0
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_commons_eligibility
AFTER INSERT ON neuropod_vibroacoustic_sessions
FOR EACH ROW
EXECUTE FUNCTION update_commons_eligibility();
```

---

## Part 4: Archetypal Session Templates

### Template 1: Shadow Integration (30-Minute Session)

**Protocol Flow:**
1. **Grounding Phase (5 min):** `breath-paced-vibroacoustic`
2. **Exploration Phase (15 min):** `assr-contemplative-theta` (6.5 Hz)
3. **Integration Phase (10 min):** Gradual annealing back to baseline

**MAIA Prompts:**

```typescript
export const SHADOW_INTEGRATION_SESSION = {
  archetypeId: 'shadow-integration',
  name: 'Shadow Integration with Neuropod',
  duration: 30, // minutes
  requiredTier: 'pioneer', // High screening

  phases: [
    {
      phase: 'grounding',
      durationMinutes: 5,
      neuropodProtocol: 'breath-paced-vibroacoustic',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "Let's begin by grounding. Close your eyes and take three slow breaths. Name three things you can feel in your body right now.",
        },
        {
          timing: 'mid',
          prompt: "Good. What part of you feels most present at this moment?",
        },
      ],
    },
    {
      phase: 'exploration',
      durationMinutes: 15,
      neuropodProtocol: 'assr-contemplative-theta',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "As you settle into this theta rhythm, bring to mind a quality in others that triggers you. What is it?",
        },
        {
          timing: 'early',
          prompt: "Where in your body do you feel this reaction? Describe the sensation.",
        },
        {
          timing: 'mid',
          prompt: "If that disowned quality—the one that triggers you—could speak, what would it say? Let it emerge without judgment.",
        },
        {
          timing: 'late',
          prompt: "What does this shadow part protect you from? What's the underlying fear?",
        },
      ],
    },
    {
      phase: 'integration',
      durationMinutes: 10,
      neuropodProtocol: 'annealing-pathway', // Cool down gradually
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "We're beginning the integration phase. As the stimulation gently settles, notice what gift this shadow part offers you.",
        },
        {
          timing: 'mid',
          prompt: "How can you honor this part in the next 24 hours? What small action would welcome it home?",
        },
        {
          timing: 'end',
          prompt: "Reality check: Name three concrete facts about your current environment. Where are you? What day is it? What will you do in the next hour?",
        },
      ],
    },
  ],

  postSessionIntegration: {
    journalPrompts: [
      "What shadow quality emerged during this session?",
      "What sensations did you notice in your body?",
      "What small action will you take in the next 24 hours to integrate this?",
    ],
    meaningDeferral: "Do not assign fixed meaning to this experience yet. Let it settle for 48 hours before interpreting.",
  },
};
```

### Template 2: Anima/Animus Integration (40-Minute Session)

**Protocol Flow:**
1. **Grounding (5 min):** `breath-paced-vibroacoustic`
2. **Receptive Opening (15 min):** `assr-receptive-absorption` (10 Hz)
3. **Depth Exploration (15 min):** `assr-contemplative-theta` (6.5 Hz)
4. **Integration (5 min):** Annealing back to baseline

**MAIA Prompts:**

```typescript
export const ANIMA_ANIMUS_SESSION = {
  archetypeId: 'anima-animus-integration',
  name: 'Inner Masculine/Feminine Integration',
  duration: 40,
  requiredTier: 'pioneer',

  phases: [
    {
      phase: 'grounding',
      durationMinutes: 5,
      neuropodProtocol: 'breath-paced-vibroacoustic',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "Ground into your body. Three slow breaths. Notice where you feel most present.",
        },
      ],
    },
    {
      phase: 'receptive-opening',
      durationMinutes: 15,
      neuropodProtocol: 'assr-receptive-absorption',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "As you enter this receptive state, consider: which aspect of yourself do you over-identify with—masculine (doing, achieving, thinking) or feminine (being, receiving, feeling)?",
        },
        {
          timing: 'mid',
          prompt: "What does the underdeveloped aspect (your inner Anima or Animus) look like? If it were a person, how would you describe them?",
        },
      ],
    },
    {
      phase: 'depth-exploration',
      durationMinutes: 15,
      neuropodProtocol: 'assr-contemplative-theta',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "In this deeper theta state, imagine a conversation with this inner figure. What do they want you to know?",
        },
        {
          timing: 'mid',
          prompt: "What would your life look like if you integrated this aspect more fully? Describe a day where both masculine and feminine are honored.",
        },
      ],
    },
    {
      phase: 'integration',
      durationMinutes: 5,
      neuropodProtocol: 'annealing-pathway',
      maiaPrompts: [
        {
          timing: 'start',
          prompt: "As we integrate, name one small way you'll honor your inner Anima/Animus in the next week.",
        },
        {
          timing: 'end',
          prompt: "Reality check: You are in your body, in this room. This was exploratory work, not revelation. Defer meaning for 48 hours.",
        },
      ],
    },
  ],

  postSessionIntegration: {
    journalPrompts: [
      "Which aspect (masculine/feminine) is underdeveloped in me?",
      "What did my inner Anima/Animus want me to hear?",
      "One way I'll integrate this aspect in the next week:",
    ],
    meaningDeferral: "This session opened a door. Do not decide what it 'means' yet. Live with it for 48 hours.",
  },
};
```

---

## Part 5: API Endpoints (Frontend Integration)

### Endpoint 1: Get Neuropod Eligibility

**File:** `app/api/neuropod/eligibility/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { assessNeuropodEligibility } from '@/lib/field/neuropodEligibility';
import { getUserHealthExclusions, getUserMembershipTier } from '@/lib/db/userQueries';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch cognitive profile
  const cognitiveProfile = await getCognitiveProfile(userId);

  // Fetch health exclusions + membership tier
  const exclusions = await getUserHealthExclusions(userId);
  const membershipTier = await getUserMembershipTier(userId);

  // Assess eligibility
  const eligibility = assessNeuropodEligibility(
    cognitiveProfile.currentLevel,
    cognitiveProfile.stability,
    cognitiveProfile.bypassingScore,
    exclusions,
    membershipTier
  );

  return NextResponse.json({
    cognitiveProfile: {
      bloomLevel: cognitiveProfile.currentLevel,
      stability: cognitiveProfile.stability,
      bypassingScore: cognitiveProfile.bypassingScore,
    },
    eligibility,
  });
}
```

### Endpoint 2: Start Neuropod Session (with Archetypal Integration)

**File:** `app/api/neuropod/session/start/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { assessNeuropodEligibility } from '@/lib/field/neuropodEligibility';
import { PROTOCOL_LIBRARY } from '@/lib/neuropod/protocolLibrary';
import { createSession } from '@/lib/neuropod/sessionManager';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { protocolId, archetypeId, conversationId } = body;

  // Validate eligibility
  const cognitiveProfile = await getCognitiveProfile(userId);
  const exclusions = await getUserHealthExclusions(userId);
  const membershipTier = await getUserMembershipTier(userId);

  const eligibility = assessNeuropodEligibility(
    cognitiveProfile.currentLevel,
    cognitiveProfile.stability,
    cognitiveProfile.bypassingScore,
    exclusions,
    membershipTier
  );

  // Check if user is eligible for this protocol
  const protocol = PROTOCOL_LIBRARY[protocolId];
  if (!protocol) {
    return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
  }

  const protocolTier = protocol.category === 'regulation' ? 1 : protocol.category === 'entrainment' ? 2 : 3;
  const hasAccess =
    (protocolTier === 1 && eligibility.tier1Access) ||
    (protocolTier === 2 && eligibility.tier2Access) ||
    (protocolTier === 3 && eligibility.tier3Access);

  if (!hasAccess) {
    return NextResponse.json({
      error: 'Not eligible for this protocol',
      reason: eligibility.exclusionReason,
    }, { status: 403 });
  }

  // Create session
  const neuropodSession = await createSession({
    userId,
    protocolId,
    archetypeId,       // Optional: links to archetypal template
    conversationId,    // Optional: links to MAIA conversation
    targetState: protocol.targetState,
  });

  return NextResponse.json({
    sessionId: neuropodSession.id,
    protocol: {
      id: protocolId,
      name: protocol.name,
      duration: protocol.safety.maxDuration,
    },
    message: 'Session started. Begin pre-session grounding.',
  });
}
```

---

## Part 6: Frontend UI Components

### Component 1: Neuropod Protocol Selector

**File:** `components/neuropod/ProtocolSelector.tsx` (NEW)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { NeuropodEligibility } from '@/lib/field/neuropodEligibility';

interface Protocol {
  id: string;
  name: string;
  category: string;
  evidenceLevel: string;
  description: string;
  tier: number;
}

export function ProtocolSelector() {
  const [eligibility, setEligibility] = useState<NeuropodEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/neuropod/eligibility')
      .then(res => res.json())
      .then(data => {
        setEligibility(data.eligibility);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading your Neuropod eligibility...</div>;
  if (!eligibility) return <div>Error loading eligibility</div>;

  return (
    <div className="neuropod-protocol-selector">
      <h2>Available Neuropod Protocols</h2>

      {!eligibility.tier1Access && (
        <div className="eligibility-blocked">
          <p className="text-amber-600">{eligibility.exclusionReason}</p>
          <p>Focus on MAIA grounding conversations before accessing Neuropod.</p>
        </div>
      )}

      {eligibility.tier1Access && (
        <>
          <div className="recommended-protocols">
            <h3>Recommended for You</h3>
            <p className="text-sm text-gray-600">
              Based on your current Bloom level and field stability
            </p>
            <div className="protocol-grid">
              {eligibility.recommendedProtocols.map(protocolId => (
                <ProtocolCard key={protocolId} protocolId={protocolId} />
              ))}
            </div>
          </div>

          {eligibility.tier2Access && (
            <div className="advanced-protocols mt-8">
              <h3>Advanced Protocols (ASSR + Somatic)</h3>
              <p className="text-sm text-gray-600">
                You have demonstrated sufficient grounding and integration capacity.
              </p>
              <div className="protocol-grid">
                {/* Show Tier 2 protocols */}
              </div>
            </div>
          )}

          {!eligibility.tier2Access && eligibility.tier1Access && (
            <div className="locked-tier mt-8">
              <h3 className="text-gray-500">Advanced Protocols (Locked)</h3>
              <p className="text-sm text-gray-600">{eligibility.exclusionReason}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### Component 2: Archetypal Session Launcher

**File:** `components/neuropod/ArchetypalSessionLauncher.tsx` (NEW)

```tsx
'use client';

import { useState } from 'react';

const ARCHETYPAL_SESSIONS = [
  {
    id: 'shadow-integration',
    name: 'Shadow Integration',
    description: 'Explore disowned parts of self with theta-band support',
    duration: 30,
    requiredTier: 'pioneer',
  },
  {
    id: 'anima-animus-integration',
    name: 'Inner Masculine/Feminine Integration',
    description: 'Balance inner masculine and feminine energies',
    duration: 40,
    requiredTier: 'pioneer',
  },
];

export function ArchetypalSessionLauncher({ conversationId }: { conversationId: string }) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const startSession = async (sessionId: string) => {
    const response = await fetch('/api/neuropod/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        archetypeId: sessionId,
        conversationId,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      // Navigate to session UI
      window.location.href = `/neuropod/session/${data.sessionId}`;
    } else {
      alert(`Error: ${data.reason || data.error}`);
    }
  };

  return (
    <div className="archetypal-session-launcher">
      <h2>Archetypal Neuropod Sessions</h2>
      <p className="text-sm text-gray-600">
        Combine Neuropod biometric support with guided MAIA prompts for archetypal integration work.
      </p>

      <div className="session-grid mt-4">
        {ARCHETYPAL_SESSIONS.map(session => (
          <div key={session.id} className="session-card border rounded-lg p-4">
            <h3 className="font-bold">{session.name}</h3>
            <p className="text-sm text-gray-600">{session.description}</p>
            <p className="text-xs text-gray-500 mt-2">Duration: {session.duration} min</p>
            <p className="text-xs text-gray-500">Required: {session.requiredTier} tier</p>
            <button
              onClick={() => startSession(session.id)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Begin Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Part 7: Bloom Progression Validation (Biometric Markers)

### Function: Update Bloom Biometric Validation

**File:** `lib/neuropod/bloomValidation.ts` (NEW)

```typescript
import { supabase } from '@/lib/supabase';

export async function updateBloomBiometricValidation(
  userId: string,
  bloomLevel: number,
  sessionData: {
    avgHrvCoherence?: number;
    maxAssrPlv?: number;
    avgGlobalSynchrony?: number;
    avgDefectDensity?: number;
    avgFieldAlignment?: number;
  }
) {
  // Check if record exists for this Bloom level
  const { data: existing, error } = await supabase
    .from('bloom_biometric_validation')
    .select('*')
    .eq('user_id', userId)
    .eq('bloom_level', Math.floor(bloomLevel)) // Round to nearest integer
    .single();

  if (existing) {
    // Update existing record (running average)
    const sessions = existing.neuropod_sessions_at_level + 1;
    const updated = {
      avg_hrv_coherence: sessionData.avgHrvCoherence
        ? (existing.avg_hrv_coherence * existing.neuropod_sessions_at_level + sessionData.avgHrvCoherence) / sessions
        : existing.avg_hrv_coherence,
      max_assr_plv: sessionData.maxAssrPlv && sessionData.maxAssrPlv > (existing.max_assr_plv || 0)
        ? sessionData.maxAssrPlv
        : existing.max_assr_plv,
      avg_global_synchrony: sessionData.avgGlobalSynchrony
        ? (existing.avg_global_synchrony * existing.neuropod_sessions_at_level + sessionData.avgGlobalSynchrony) / sessions
        : existing.avg_global_synchrony,
      avg_defect_density: sessionData.avgDefectDensity
        ? (existing.avg_defect_density * existing.neuropod_sessions_at_level + sessionData.avgDefectDensity) / sessions
        : existing.avg_defect_density,
      avg_field_alignment: sessionData.avgFieldAlignment
        ? (existing.avg_field_alignment * existing.neuropod_sessions_at_level + sessionData.avgFieldAlignment) / sessions
        : existing.avg_field_alignment,
      neuropod_sessions_at_level: sessions,
      last_updated_at: new Date().toISOString(),
    };

    await supabase
      .from('bloom_biometric_validation')
      .update(updated)
      .eq('user_id', userId)
      .eq('bloom_level', Math.floor(bloomLevel));
  } else {
    // Create new record
    await supabase.from('bloom_biometric_validation').insert({
      user_id: userId,
      bloom_level: Math.floor(bloomLevel),
      ...sessionData,
      neuropod_sessions_at_level: 1,
    });
  }
}
```

---

## Part 8: Pioneer Circle Exclusive Features

### Feature 1: Tier 2 Early Access (Months 13-24)

**Implementation:**
- In `assessNeuropodEligibility()`, check `membershipTier === 'pioneer'` before granting Tier 2 access during beta period
- After Month 24, open Tier 2 to all `explorer` tier members who meet developmental criteria

### Feature 2: "Find Your Resonance" Personalization Beta

**Implementation (Year 3):**
- Automated protocol that sweeps HRV resonance frequency from 5-15 Hz
- Measures which frequency produces highest HRV coherence
- Saves result to `user_neuropod_preferences` table
- All future breath-paced protocols use personalized resonance frequency

```typescript
export async function findHrvResonance(userId: string): Promise<number> {
  // Start Neuropod session with 5 Hz breathing
  // Gradually increase to 15 Hz over 15 minutes
  // Track HRV coherence at each frequency
  // Return frequency with peak coherence

  const results = await runResonanceScan(userId, { startHz: 5, endHz: 15, durationMin: 15 });
  const optimalFrequency = results.reduce((max, curr) => curr.coherence > max.coherence ? curr : max).frequency;

  // Save to database
  await supabase.from('user_neuropod_preferences').upsert({
    user_id: userId,
    hrv_resonance_frequency: optimalFrequency,
    last_calibrated_at: new Date().toISOString(),
  });

  return optimalFrequency;
}
```

### Feature 3: Research Participant Priority

**Implementation:**
- When validation experiments are launched (e.g., ASSR receptive absorption N=30), send invitations to Pioneer members first
- Track participation in `research_participants` table
- Pioneer members who participate get:
  - Co-authorship acknowledgment in publications (if >10 sessions contributed)
  - Early access to validated protocols before public launch
  - Detailed personal biometric reports (research-grade analysis)

---

## Part 9: Community Commons Enhanced Gate

### Current Gate (Bloom-Only):

```sql
SELECT commons_eligible FROM auth.users WHERE id = :userId
```

### Enhanced Gate (Bloom + Biometric):

```sql
-- Check if user meets ALL requirements:
-- 1. Bloom avg >= 4.0 (existing)
-- 2. At least 5 Neuropod sessions completed
-- 3. HRV coherence avg > 0.55 (demonstrates regulation capacity)
-- 4. ASSR PLV > 0.3 in at least 1 session (demonstrates entrainment capacity)
-- 5. Zero high-risk safety events (no overwhelm episodes)

SELECT
  (cp.avg_bloom_level >= 4.0) AS bloom_requirement,
  (SELECT COUNT(*) FROM neuropod_vibroacoustic_sessions WHERE user_id = :userId) >= 5 AS session_count_requirement,
  (SELECT AVG(avg_hrv_coherence) FROM neuropod_vibroacoustic_sessions WHERE user_id = :userId AND avg_hrv_coherence IS NOT NULL) > 0.55 AS hrv_requirement,
  (SELECT COUNT(*) FROM neuropod_vibroacoustic_sessions nvs
   JOIN neuropod_vibroacoustic_timeseries nvt ON nvs.session_id = nvt.session_id
   WHERE nvs.user_id = :userId
   GROUP BY nvs.session_id
   HAVING MAX(/* compute ASSR PLV from EEG data */) > 0.3) > 0 AS assr_requirement,
  (SELECT COUNT(*) FROM neuropod_vibroacoustic_sessions WHERE user_id = :userId AND peak_safety_risk_score > 0.85) = 0 AS safety_requirement
FROM cognitive_profiles cp
WHERE cp.user_id = :userId;
```

**Rationale:**
- Commons is for **integrated pattern-weavers**
- Neuropod biometrics validate **nervous system coherence**, not just cognitive
- This prevents **spiritually bypassing contributors** (high Bloom but unstable field)

---

## Part 10: Implementation Checklist

### Phase 1: Core Infrastructure (Month 1-2)

- [ ] Create `lib/field/neuropodEligibility.ts` (protocol tier metadata + eligibility logic)
- [ ] Update `lib/field/panconsciousFieldRouter.ts` (extend FieldRoutingDecision interface)
- [ ] Update `lib/sovereign/maiaService.ts` (call assessNeuropodEligibility in router)
- [ ] Run database migration `20251217000002_neuropod_maia_integration.sql`
- [ ] Create API endpoint `app/api/neuropod/eligibility/route.ts`
- [ ] Create API endpoint `app/api/neuropod/session/start/route.ts`
- [ ] Test: User with Bloom 2 → Tier 1 access only
- [ ] Test: User with Bloom 4 + stable field → Tier 2 access

### Phase 2: Frontend UI (Month 2-3)

- [ ] Create `components/neuropod/ProtocolSelector.tsx`
- [ ] Create `components/neuropod/ArchetypalSessionLauncher.tsx`
- [ ] Add Neuropod tab to MAIA conversation UI
- [ ] Show "Neuropod Suggestion" when user requests state support
- [ ] Test: Click protocol → start session → see pre-session prompts

### Phase 3: Archetypal Sessions (Month 3-4)

- [ ] Implement shadow integration template (MAIA prompts + Neuropod protocols)
- [ ] Implement anima/animus template
- [ ] Create `lib/neuropod/archetypeTemplates.ts` (session definitions)
- [ ] Wire MAIA prompts to Neuropod phase transitions
- [ ] Test: Complete shadow integration session end-to-end

### Phase 4: Bloom Progression Validation (Month 4-6)

- [ ] Create `lib/neuropod/bloomValidation.ts` (update biometric markers per Bloom level)
- [ ] Add trigger to update Bloom validation after each Neuropod session
- [ ] Create dashboard showing "Biometric Markers of Development" (user-facing)
- [ ] Test: User at Bloom 3 → shows avg HRV coherence, ASSR PLV, etc.

### Phase 5: Community Commons Enhanced Gate (Month 6-7)

- [ ] Update Commons eligibility logic (Bloom + Neuropod requirements)
- [ ] Create UI message: "Commons eligibility requires 5 Neuropod sessions with HRV coherence >0.55"
- [ ] Test: User with Bloom 4 but no Neuropod sessions → blocked from Commons
- [ ] Test: User with Bloom 4 + 5 sessions + HRV >0.55 → Commons unlocked

### Phase 6: Pioneer Circle Features (Month 7-12)

- [ ] Tier 2 early access (Month 13 beta, check `membershipTier === 'pioneer'`)
- [ ] "Find Your Resonance" protocol (Year 3 feature, MVP in Month 12)
- [ ] Research participant invitations (database table + email automation)
- [ ] Test: Pioneer member gets Tier 2 access before Explorer

---

## Conclusion: The Integrated System

**What We've Built:**
A consciousness navigation platform where:
1. **Developmental assessment** (Bloom level, field stability, bypassing) determines **protocol access**
2. **Biometric validation** (HRV coherence, ASSR PLV, safety events) validates **developmental progression**
3. **Archetypal work** (shadow, anima/animus) is enhanced by **Neuropod stimulation**
4. **Membership tiers** (Foundation, Explorer, Pioneer) unlock **advanced protocols** based on readiness
5. **Community Commons** requires both **cognitive** (Bloom 4+) and **somatic** (HRV >0.55) integration

**The Result:**
Users don't just *talk* about consciousness development with MAIA—they **practice** it with Neuropod, and the biometrics **validate** their progression.

---

**Document Status:** Implementation Ready
**Next Action:** Review with engineering team, prioritize Phase 1 tasks, begin core infrastructure build

---

END OF DOCUMENT
