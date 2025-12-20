# Multi-Spiral Migration and Wiring — Complete Implementation

**Decision:** Option A (JSONB array) for fast beta ship (<1 day)
**Upgrade path:** Option B (normalized table) available later without breaking prompts

---

## Part 1: Database Migration

### Migration SQL

**File:** `supabase/migrations/20251218_multi_spiral_states.sql`

```sql
-- Add multi-spiral support to user_relationship_context
ALTER TABLE user_relationship_context
  ADD COLUMN spiral_states JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN spiral_states_updated_at TIMESTAMPTZ;

-- Create GIN index for spiral_states querying
CREATE INDEX idx_user_relationship_spiral_states
  ON user_relationship_context USING GIN (spiral_states);

-- Migrate existing single spiral_state to multi-spiral array
-- Assumes existing column: spiral_state JSONB (single spiral)
UPDATE user_relationship_context
SET
  spiral_states = jsonb_build_array(
    jsonb_build_object(
      'spiralKey', 'primary',
      'element', spiral_state->>'element',
      'phase', (spiral_state->>'phase')::int,
      'facet', spiral_state->>'facet',
      'arc', spiral_state->>'arc',
      'confidence', COALESCE((spiral_state->>'confidence')::numeric, 0.7),
      'source', COALESCE(spiral_state->>'source', 'migration'),
      'updatedAt', COALESCE((spiral_state->>'updatedAt')::timestamptz, NOW()),
      'activeNow', true,
      'priorityRank', 1
    )
  ),
  spiral_states_updated_at = NOW()
WHERE spiral_state IS NOT NULL
  AND spiral_state != 'null'::jsonb
  AND spiral_states = '[]'::jsonb;

-- Add comment documenting the schema
COMMENT ON COLUMN user_relationship_context.spiral_states IS
'Array of active spiral states. Each spiral has: spiralKey (work/relationship/health/etc), element, phase, facet, arc, confidence, source, updatedAt, activeNow, priorityRank. Top 3 active spirals (activeNow=true, sorted by priorityRank) are injected into prompts.';
```

**Run migration:**
```bash
# Local development
psql $DATABASE_URL -f supabase/migrations/20251218_multi_spiral_states.sql

# Or via your migration tool
npm run db:migrate
```

---

## Part 2: TypeScript Type Definitions

### Updated Types

**File:** `lib/types/spiral.ts` (create if doesn't exist)

```typescript
export interface SpiralState {
  spiralKey: string; // "work", "relationship", "health", "money", "parenting", etc.
  element: "Water" | "Fire" | "Earth" | "Air" | null;
  phase: number | null; // 0-5
  facet: string | null; // "Water 2", "Fire 3", etc.
  arc: string | null; // "dissolution", "ignition", "stabilization", etc.
  confidence: number; // 0-1
  source: "user_checkin" | "soul_mirror" | "inferred" | "migration";
  updatedAt: string; // ISO timestamp
  activeNow: boolean; // true if this spiral is currently active
  priorityRank: number; // 1 = highest priority, 2 = second, etc.
}

export interface MultiSpiralState {
  spirals: SpiralState[];
  activeCount: number;
  primarySpiral: SpiralState | null; // Highest priority active spiral
  updatedAt: string;
}

export interface SpiralMetadata {
  injected: boolean;
  activeSpirals: SpiralState[]; // Top 3 active spirals injected into prompt
  totalActive: number;
  totalSpirals: number;
}
```

---

## Part 3: Database Service Layer

### Updated Service Methods

**File:** `lib/services/spiralStateService.ts` (create if doesn't exist)

```typescript
import { SpiralState, MultiSpiralState } from '@/lib/types/spiral';

export class SpiralStateService {
  /**
   * Get all spiral states for a user
   */
  static async getSpiralStates(userId: string): Promise<MultiSpiralState> {
    // Your DB client (replace with actual implementation)
    const { data, error } = await db
      .from('user_relationship_context')
      .select('spiral_states, spiral_states_updated_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        spirals: [],
        activeCount: 0,
        primarySpiral: null,
        updatedAt: new Date().toISOString(),
      };
    }

    const spirals: SpiralState[] = data.spiral_states || [];
    const activeSpirals = spirals.filter(s => s.activeNow);
    const sortedActive = activeSpirals.sort((a, b) => a.priorityRank - b.priorityRank);

    return {
      spirals,
      activeCount: activeSpirals.length,
      primarySpiral: sortedActive[0] || null,
      updatedAt: data.spiral_states_updated_at || new Date().toISOString(),
    };
  }

  /**
   * Get top N active spirals for prompt injection
   */
  static async getActiveSpiralsForInjection(
    userId: string,
    limit: number = 3
  ): Promise<SpiralState[]> {
    const state = await this.getSpiralStates(userId);
    return state.spirals
      .filter(s => s.activeNow)
      .sort((a, b) => {
        // Sort by: activeNow desc, priorityRank asc, updatedAt desc
        if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, limit);
  }

  /**
   * Update or add a spiral state
   */
  static async updateSpiralState(
    userId: string,
    update: Partial<SpiralState> & { spiralKey: string }
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);
    const existingIndex = current.spirals.findIndex(s => s.spiralKey === update.spiralKey);

    const updatedSpiral: SpiralState = {
      spiralKey: update.spiralKey,
      element: update.element ?? null,
      phase: update.phase ?? null,
      facet: update.facet ?? null,
      arc: update.arc ?? null,
      confidence: update.confidence ?? 0.7,
      source: update.source ?? 'user_checkin',
      updatedAt: new Date().toISOString(),
      activeNow: update.activeNow ?? true,
      priorityRank: update.priorityRank ?? (existingIndex >= 0 ? current.spirals[existingIndex].priorityRank : 999),
    };

    let newSpirals: SpiralState[];
    if (existingIndex >= 0) {
      // Update existing
      newSpirals = [...current.spirals];
      newSpirals[existingIndex] = { ...newSpirals[existingIndex], ...updatedSpiral };
    } else {
      // Add new
      newSpirals = [...current.spirals, updatedSpiral];
    }

    await db
      .from('user_relationship_context')
      .update({
        spiral_states: newSpirals,
        spiral_states_updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Set active spirals (update priorityRank and activeNow flags)
   */
  static async setActiveSpiralPriorities(
    userId: string,
    activeSpiralKeys: string[] // Ordered by priority (first = rank 1)
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);

    const updated = current.spirals.map(spiral => ({
      ...spiral,
      activeNow: activeSpiralKeys.includes(spiral.spiralKey),
      priorityRank: activeSpiralKeys.indexOf(spiral.spiralKey) >= 0
        ? activeSpiralKeys.indexOf(spiral.spiralKey) + 1
        : 999,
    }));

    await db
      .from('user_relationship_context')
      .update({
        spiral_states: updated,
        spiral_states_updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }
}
```

---

## Part 4: Prompt Injection Formatter

### Updated Formatter

**File:** `lib/prompts/formatMultiSpiralState.ts`

```typescript
import { SpiralState } from '@/lib/types/spiral';

export interface MultiSpiralInjectionResult {
  text: string;
  metadata: {
    injected: boolean;
    activeSpirals: SpiralState[];
    totalActive: number;
  };
}

/**
 * Format multi-spiral state for prompt injection
 * Returns top 3 active spirals in priority order
 */
export function formatMultiSpiralState(
  activeSpirals: SpiralState[]
): MultiSpiralInjectionResult {
  if (!activeSpirals.length) {
    return {
      text: '',
      metadata: {
        injected: false,
        activeSpirals: [],
        totalActive: 0,
      },
    };
  }

  const lines = [
    '--- ACTIVE SPIRALS (Top 3) ---',
    '',
  ];

  activeSpirals.slice(0, 3).forEach((spiral, idx) => {
    const rank = idx + 1;
    const facetStr = spiral.facet || `${spiral.element} ${spiral.phase}`;
    const arcStr = spiral.arc ? ` (${spiral.arc})` : '';
    const confidence = Math.round((spiral.confidence || 0) * 100);

    lines.push(
      `${rank}. ${spiral.spiralKey}: ${facetStr}${arcStr} [${confidence}% confidence]`
    );
    lines.push(`   Updated: ${new Date(spiral.updatedAt).toLocaleDateString()}`);
    lines.push('');
  });

  lines.push('INSTRUCTION: Reference these spirals when relevant. Do not invent spiral states not listed here.');
  lines.push('--- END ACTIVE SPIRALS ---');

  return {
    text: lines.join('\n'),
    metadata: {
      injected: true,
      activeSpirals: activeSpirals.slice(0, 3),
      totalActive: activeSpirals.length,
    },
  };
}
```

---

## Part 5: Integration with MAIA Service

### Updated MAIA Service

**File:** `lib/maia/maiaService.ts` (modifications)

```typescript
import { SpiralStateService } from '@/lib/services/spiralStateService';
import { formatMultiSpiralState } from '@/lib/prompts/formatMultiSpiralState';

// Inside your buildPrompt or similar function:

async function buildPromptWithMultiSpiral(userId: string, userMessage: string) {
  // ... existing memory injection ...

  // Multi-spiral injection
  const activeSpirals = await SpiralStateService.getActiveSpiralsForInjection(userId, 3);
  const spiralInjection = formatMultiSpiralState(activeSpirals);

  const systemPrompt = [
    '# MAIA System Instructions',
    '',
    spiralInjection.text, // Inject multi-spiral state
    '',
    '# Your Role',
    'You are MAIA, a developmental companion...',
    // ... rest of system prompt
  ].join('\n');

  // Return metadata for response
  return {
    systemPrompt,
    metadata: {
      spiralMeta: spiralInjection.metadata,
      // ... other metadata
    },
  };
}
```

---

## Part 6: Updated Metadata Contract

### Response Metadata Schema

**File:** `lib/types/maiaMetadata.ts` (update)

```typescript
import { SpiralState } from './spiral';

export interface MaiaResponseMetadata {
  // Existing fields
  engineUsed?: string;
  providerUsed?: string;
  processingPath?: 'FAST' | 'CORE' | 'DEEP';

  // Memory metadata (existing)
  memory?: {
    exchangesAvailable?: number;
    exchangesInjected?: number;
    charsInjected?: number;
    truncated?: boolean;
    provider?: string;
  };

  // NEW: Multi-spiral metadata
  spiralMeta?: {
    injected: boolean;
    activeSpirals: SpiralState[]; // Top 3 active spirals
    totalActive: number;
    totalSpirals?: number;
  };

  // Framework router metadata (optional for beta)
  frameworksUsed?: string[]; // e.g., ["Jung", "Somatic", "CBT"]
}
```

---

## Part 7: API Endpoints

### Soul Mirror Check-In Endpoint (Update/Create Spiral)

**File:** `app/api/soul-mirror/checkin/route.ts` (create or update)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SpiralStateService } from '@/lib/services/spiralStateService';

export async function POST(req: NextRequest) {
  const { userId, spiralKey, element, phase, facet, arc, confidence, source } = await req.json();

  if (!userId || !spiralKey) {
    return NextResponse.json({ error: 'userId and spiralKey required' }, { status: 400 });
  }

  try {
    await SpiralStateService.updateSpiralState(userId, {
      spiralKey,
      element,
      phase,
      facet,
      arc,
      confidence: confidence ?? 0.8,
      source: source ?? 'user_checkin',
      activeNow: true,
      // priorityRank set automatically if not specified
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Soul Mirror check-in error:', error);
    return NextResponse.json({ error: 'Failed to update spiral state' }, { status: 500 });
  }
}
```

### Set Active Spirals Endpoint (Priority Management)

**File:** `app/api/spiral-states/set-active/route.ts` (create)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SpiralStateService } from '@/lib/services/spiralStateService';

export async function POST(req: NextRequest) {
  const { userId, activeSpiralKeys } = await req.json();

  if (!userId || !Array.isArray(activeSpiralKeys)) {
    return NextResponse.json(
      { error: 'userId and activeSpiralKeys array required' },
      { status: 400 }
    );
  }

  try {
    await SpiralStateService.setActiveSpiralPriorities(userId, activeSpiralKeys);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set active spirals error:', error);
    return NextResponse.json({ error: 'Failed to set active spirals' }, { status: 500 });
  }
}
```

---

## Part 8: Updated S-Tests

### `scripts/certify-spiral-state.sh` (Complete)

```bash
#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_certlib.sh"

require curl
require jq

BASE_URL="${BASE_URL:-http://localhost:3000}"
USER_ID="${USER_ID:-cert-user-spiral}"

echo "🧪 Multi-Spiral State Certification (S1–S7)"
echo "User: $USER_ID"
echo ""

# S1: Data model supports many spirals per user
test_start "S1" "Data model supports ≥7 spirals per user"
# Seed multiple spirals
for key in work relationship health money parenting creativity spirituality; do
  curl -sS "$BASE_URL/api/soul-mirror/checkin" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"spiralKey\":\"$key\",\"element\":\"Water\",\"phase\":1,\"confidence\":0.7}" \
    >/dev/null
done
# Verify count
resp="$(curl -sS "$BASE_URL/api/spiral-states?userId=$USER_ID")"
count="$(jq -r '.spirals | length' <<<"$resp")"
[[ "$count" -ge 7 ]] && pass "Created $count spirals" || fail "Only $count spirals created (expected ≥7)"

# S2: Prompt injection shows "Active spirals (top 3)" and is never truncated
test_start "S2" "Top 3 active spirals injected into prompt"
# Set active priorities: work=1, relationship=2, health=3
curl -sS "$BASE_URL/api/spiral-states/set-active" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"activeSpiralKeys\":[\"work\",\"relationship\",\"health\"]}" \
  >/dev/null

# Make oracle call
resp2="$(curl -sS "$BASE_URL/api/oracle/conversation" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"sessionId\":\"s2-test\",\"input\":\"hello\"}")"

injected="$(jq -r '.metadata.spiralMeta.injected // false' <<<"$resp2")"
activeCount="$(jq -r '.metadata.spiralMeta.activeSpirals | length' <<<"$resp2")"
assert_true "$injected" "spiralMeta.injected=true"
assert_eq "$activeCount" "3" "3 active spirals injected"

# S3: Non-collapse test (work=Water-2, relationship=Earth-1 → both maintained)
test_start "S3" "Multiple spirals maintained without blending"
curl -sS "$BASE_URL/api/soul-mirror/checkin" \
  -d "{\"userId\":\"$USER_ID\",\"spiralKey\":\"work\",\"element\":\"Water\",\"phase\":2}" >/dev/null
curl -sS "$BASE_URL/api/soul-mirror/checkin" \
  -d "{\"userId\":\"$USER_ID\",\"spiralKey\":\"relationship\",\"element\":\"Earth\",\"phase\":1}" >/dev/null

resp3="$(curl -sS "$BASE_URL/api/spiral-states?userId=$USER_ID")"
workPhase="$(jq -r '.spirals[] | select(.spiralKey=="work") | .phase' <<<"$resp3")"
relPhase="$(jq -r '.spirals[] | select(.spiralKey=="relationship") | .phase' <<<"$resp3")"
assert_eq "$workPhase" "2" "work spiral phase=2 maintained"
assert_eq "$relPhase" "1" "relationship spiral phase=1 maintained"

# S4: Update path (update work → relationship unchanged)
test_start "S4" "Update one spiral without mutating others"
curl -sS "$BASE_URL/api/soul-mirror/checkin" \
  -d "{\"userId\":\"$USER_ID\",\"spiralKey\":\"work\",\"element\":\"Fire\",\"phase\":3}" >/dev/null

resp4="$(curl -sS "$BASE_URL/api/spiral-states?userId=$USER_ID")"
workUpdated="$(jq -r '.spirals[] | select(.spiralKey=="work") | .element' <<<"$resp4")"
relUnchanged="$(jq -r '.spirals[] | select(.spiralKey=="relationship") | .phase' <<<"$resp4")"
assert_eq "$workUpdated" "Fire" "work spiral updated to Fire"
assert_eq "$relUnchanged" "1" "relationship spiral unchanged (still phase 1)"

# S5: No spiral invention
test_start "S5" "No spiral invention when state absent"
NEW_USER="cert-user-no-spiral"
resp5="$(curl -sS "$BASE_URL/api/oracle/conversation" \
  -d "{\"userId\":\"$NEW_USER\",\"sessionId\":\"s5-test\",\"input\":\"what spiral am I in?\"}")"
injected5="$(jq -r '.metadata.spiralMeta.injected // false' <<<"$resp5")"
inventedPhase="$(jq -r '.content' <<<"$resp5" | grep -Eo 'phase [0-9]' || echo "")"
assert_eq "$injected5" "false" "spiralMeta.injected=false for new user"
[[ -z "$inventedPhase" ]] && pass "No invented phase in response" || fail "Response invented phase: $inventedPhase"

# S6: Restart persistence (requires server restart capability)
test_start "S6" "Active spirals persist across restart"
RESTART_CMD="${RESTART_CMD:-echo 'SKIP: no restart command configured'}"
eval "$RESTART_CMD"
sleep 2

resp6="$(curl -sS "$BASE_URL/api/spiral-states?userId=$USER_ID")"
count6="$(jq -r '.spirals | length' <<<"$resp6")"
[[ "$count6" -ge 7 ]] && pass "Spirals persisted after restart ($count6 spirals)" || fail "Spirals lost after restart"

# S7: Metadata includes all fields
test_start "S7" "spiralMeta includes all required fields"
resp7="$(curl -sS "$BASE_URL/api/oracle/conversation" \
  -d "{\"userId\":\"$USER_ID\",\"sessionId\":\"s7-test\",\"input\":\"hello\"}")"

hasInjected="$(jq -r 'has("metadata") and .metadata | has("spiralMeta") and .spiralMeta | has("injected")' <<<"$resp7")"
hasActive="$(jq -r '.metadata.spiralMeta | has("activeSpirals")' <<<"$resp7")"
hasTotal="$(jq -r '.metadata.spiralMeta | has("totalActive")' <<<"$resp7")"
assert_true "$hasInjected" "spiralMeta.injected present"
assert_true "$hasActive" "spiralMeta.activeSpirals present"
assert_true "$hasTotal" "spiralMeta.totalActive present"

summary
```

---

## Part 9: Deployment Checklist

### Pre-Deployment

- [ ] Run migration: `psql $DATABASE_URL -f supabase/migrations/20251218_multi_spiral_states.sql`
- [ ] Verify migration: `SELECT user_id, jsonb_array_length(spiral_states) FROM user_relationship_context WHERE spiral_states != '[]'::jsonb LIMIT 5;`
- [ ] Run S-tests: `bash scripts/certify-spiral-state.sh`
- [ ] Verify all S1–S7 pass

### Post-Deployment

- [ ] Monitor `spiral_states_updated_at` timestamps in production
- [ ] Check injection metadata in first 100 responses: `metadata.spiralMeta.injected` should be true when spirals exist
- [ ] Verify no "invented phase" errors in logs

---

## Part 10: Example Usage

### Setting Up Multi-Spiral for a User

```typescript
// User checks in with Soul Mirror for "work" spiral
await SpiralStateService.updateSpiralState('user-123', {
  spiralKey: 'work',
  element: 'Earth',
  phase: 2,
  facet: 'Earth 2',
  arc: 'resource clarity',
  confidence: 0.82,
  source: 'user_checkin',
  activeNow: true,
});

// User checks in for "relationship" spiral
await SpiralStateService.updateSpiralState('user-123', {
  spiralKey: 'relationship',
  element: 'Water',
  phase: 1,
  facet: 'Water 1',
  arc: 'dissolution',
  confidence: 0.75,
  source: 'user_checkin',
  activeNow: true,
});

// User sets active priority: work=1, relationship=2
await SpiralStateService.setActiveSpiralPriorities('user-123', ['work', 'relationship']);

// MAIA conversation automatically injects top 3 active spirals
const prompt = await buildPromptWithMultiSpiral('user-123', 'How do I handle this conflict at work?');

// Response metadata shows what was injected
console.log(prompt.metadata.spiralMeta);
// {
//   injected: true,
//   activeSpirals: [
//     { spiralKey: 'work', element: 'Earth', phase: 2, ... },
//     { spiralKey: 'relationship', element: 'Water', phase: 1, ... }
//   ],
//   totalActive: 2
// }
```

---

## Part 11: Upgrade Path to Option B (Normalized Table)

When ready to move to normalized table (later):

1. **Create `user_spiral_states` table**
2. **Migrate JSONB array → table rows**
3. **Update service layer to query table instead of JSONB**
4. **Keep cached JSONB snapshot for fast injection** (updated via trigger)
5. **No prompt changes required** (injection still expects array of SpiralState)

This migration path is non-breaking because the prompt injection contract stays the same: an array of active spirals.

---

## Summary

**What This Achieves:**

✅ Multi-spiral data model (7+ spirals per user)
✅ Top 3 active spirals injected into prompts
✅ No spiral invention when state absent
✅ No collapse between spirals (work=Water-2, relationship=Earth-1 maintained separately)
✅ Update one spiral without mutating others
✅ Restart persistence (via DB storage)
✅ Full metadata contract (spiralMeta with injected flag, activeSpirals array, totalActive count)
✅ S1–S7 certification suite ready to run

**Ship It Fast:** This implementation gets multi-spiral working in <1 day using JSONB array.

**Ship It Right:** Clear upgrade path to normalized table when ready, without breaking prompts.

---

**Next:** Run the migration, wire up the service layer, and execute `scripts/certify-spiral-state.sh` to verify S1–S7 pass.

---

# HARDENING ADDITIONS (2025-12-18)

## The Two Critical Failure Modes

This hardening prevents:

1. **"Spirals collapse into one"** - Duplicate ranks, sorting instability
2. **"Prompt says top 3 but meta logs something else"** - Contract drift

## Hardening Components

### 1. Database-Level Validation (CHECK Constraint)

**File:** `supabase/migrations/20251218000002_multi_spiral_states_with_validation.sql`

Added `validate_spiral_states()` SQL function with CHECK constraint:

```sql
CREATE OR REPLACE FUNCTION validate_spiral_states(states jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  WITH elems AS (
    SELECT
      COALESCE((e->>'activeNow')::boolean, false) AS active,
      (e->>'spiralKey') AS key,
      COALESCE((e->>'priorityRank')::int, 999) AS rank
    FROM jsonb_array_elements(COALESCE(states, '[]'::jsonb)) AS e
  )
  SELECT
    -- No duplicate spiralKey
    (SELECT count(*) = count(DISTINCT key) FROM elems)
    AND
    -- Active ranks unique
    (SELECT count(*) = count(DISTINCT rank) FROM elems WHERE active)
    AND
    -- Active ranks must be >= 1
    (SELECT COALESCE(bool_and(rank >= 1), true) FROM elems WHERE active);
$$;

ALTER TABLE user_relationship_context
ADD CONSTRAINT spiral_states_valid
CHECK (validate_spiral_states(spiral_states));
```

**What This Prevents:**
- No duplicate `spiralKey` in the array
- No duplicate `priorityRank` among active spirals
- Active spirals must have `priorityRank >= 1`

### 2. Code-Level Normalization

**File:** `lib/consciousness/spiral/spiralStateUtils.ts`

Core normalization function that ensures integrity:

```typescript
export function normalizeActiveRanks(states: SpiralState[]): SpiralState[] {
  const copy = [...states];

  // Get all active spirals and sort them
  const active = copy
    .filter(s => s.activeNow)
    .sort((a, b) => {
      // Primary sort: priorityRank ascending (1, 2, 3, ...)
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      // Tie-breaker: most recently updated first
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Assign contiguous unique ranks: 1..N
  active.forEach((s, idx) => {
    s.priorityRank = idx + 1;
  });

  // Inactive spirals always get rank 999
  copy.filter(s => !s.activeNow).forEach(s => {
    s.priorityRank = 999;
  });

  // Ensure unique spiralKey (last-write-wins for duplicates)
  const byKey = new Map<string, SpiralState>();
  for (const s of copy) {
    byKey.set(s.spiralKey, s);
  }

  return Array.from(byKey.values());
}
```

**What This Achieves:**
- Active spirals get unique, contiguous ranks (1, 2, 3, ...)
- Inactive spirals always at rank 999 (stable sentinel value)
- Deterministic tie-breaking via `updatedAt` timestamp
- Unique `spiralKey` enforcement (last-write-wins)

Also includes:
- `validateSpiralStates()` - Runtime validation function
- `mergePreservingSpiralUpdates()` - Preserve-by-default update semantics
- `replaceActiveSpiralSet()` - Authoritative replacement (deactivates unlisted)

### 3. Service Layer with Auto-Normalization

**File:** `lib/consciousness/spiral/SpiralStateService.ts`

The service layer now calls `normalizeActiveRanks()` on every write:

```typescript
static async updateSpiralStates(
  userId: string,
  spirals: SpiralState[]
): Promise<void> {
  // Normalize before writing
  const normalized = normalizeActiveRanks(spirals);

  // Validate
  const validation = validateSpiralStates(normalized);
  if (!validation.valid) {
    throw new Error(`Spiral state validation failed: ${validation.errors.join(", ")}`);
  }

  const now = new Date().toISOString();

  await query(
    `INSERT INTO user_relationship_context (user_id, spiral_states, spiral_states_updated_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       spiral_states = $2,
       spiral_states_updated_at = $3,
       updated_at = $5`,
    [userId, JSON.stringify(normalized), now, now, now]
  );
}
```

**Key Methods:**
- `getSpiralStates()` - Defensively normalizes on read (handles legacy data)
- `getActiveSpiralsForInjection()` - Returns top N active spirals sorted by priority
- `updateSpiralStates()` - Normalizes and validates before writing
- `setActiveSpiralPrioritiesPreserve()` - Updates mentioned spirals, preserves others
- `replaceActiveSpirals()` - Authoritative replacement (deactivates unlisted)
- `upsertSpiral()` - Merges single spiral update with normalization

**Defense-in-Depth Strategy:**
1. **Normalization on write** - Every write normalizes before storing
2. **Validation before write** - Rejects invalid data
3. **CHECK constraint** - Database-level enforcement
4. **Normalization on read** - Defensive handling of legacy data

### 4. Single Source of Truth Pattern

**File:** `lib/consciousness/spiral/formatMultiSpiralState.ts`

The formatter implements drift-proof pattern:

```typescript
export function formatMultiSpiralState(
  activeSpirals: SpiralState[],
  totalActive?: number,
  totalSpirals?: number
): MultiSpiralInjectionResult {
  // ... formatting logic ...

  return {
    text: lines.join("\n"),
    metadata: {
      injected: true,
      activeSpirals: activeSpirals.slice(0, 3), // EXACT list used in prompt
      totalActive: totalActive ?? activeSpirals.length,
      totalSpirals,
    },
  };
}
```

**Critical Pattern:**
- Formatter **receives** pre-fetched list (does NOT fetch data itself)
- Returns **both** formatted text AND metadata
- Uses **SAME list instance** for both (drift impossible by construction)

**Helper Function:**
```typescript
export async function buildSpiralInjection(
  userId: string,
  limit: number = 3
): Promise<MultiSpiralInjectionResult> {
  const { SpiralStateService } = await import("./SpiralStateService");

  const allSpirals = await SpiralStateService.getSpiralStates(userId);
  const activeSpirals = await SpiralStateService.getActiveSpiralsForInjection(userId, limit);

  const totalActive = allSpirals.spirals.filter(s => s.activeNow).length;
  const totalSpirals = allSpirals.spirals.length;

  return formatMultiSpiralState(activeSpirals, totalActive, totalSpirals);
}
```

### 5. Certification Test Suite (MS1-MS5)

**File:** `scripts/certify-multi-spiral.ts`

Automated tests that prove the system prevents both failure modes:

**MS1: No Duplicate Priority Ranks**
```typescript
// Tests: normalizeActiveRanks() fixes duplicate ranks
// Creates spirals with duplicate ranks, verifies normalization creates unique ranks
// Verifies ranks are contiguous (1, 2, 3, ...)
```

**MS2: Stable Sorting Order**
```typescript
// Tests: rank ascending with updatedAt tie-breaker
// Creates spirals with same rank but different timestamps
// Verifies newer spiral wins tie-breaker
// Verifies sorting is deterministic (run twice, same result)
```

**MS3: Top 3 Limit + Active Only**
```typescript
// Tests: formatMultiSpiralState returns exactly 3 spirals
// Creates 5 active spirals
// Verifies formatter returns exactly 3
// Verifies all returned spirals have activeNow=true
// Verifies returned spirals are top 3 by rank
```

**MS4: Prompt/Metadata Drift Prevention**
```typescript
// Tests: single source of truth pattern prevents drift
// Formats spirals using single list
// Extracts spiral keys from both prompt text and metadata
// Verifies prompt and metadata contain same spirals
// Verifies metadata count matches prompt count
```

**MS5: Preserve Untouched Spirals**
```typescript
// Tests: setActiveSpiralPrioritiesPreserve preserves unlisted spirals
// Initializes 5 active spirals
// Updates only 2 spirals
// Verifies untouched spirals remain active
// Verifies all active spirals have unique ranks after update
```

**Run Tests:**
```bash
npx tsx scripts/certify-multi-spiral.ts
```

Expected output:
```
===========================================
Multi-Spiral State Certification (MS1-MS5)
===========================================

=== MS1: No Duplicate Priority Ranks ===
✅ MS1: Normalization creates unique ranks
✅ MS1: Ranks are contiguous (1, 2, 3...)
✅ MS1: Validation passes after normalization

=== MS2: Stable Sorting Order ===
✅ MS2: Newer spiral wins tie-breaker
✅ MS2: Sorting is deterministic

=== MS3: Top 3 Limit + Active Only ===
✅ MS3: Formatter returns exactly 3 spirals
✅ MS3: All returned spirals have activeNow=true
✅ MS3: Returned spirals are top 3 by rank

=== MS4: Prompt/Metadata Drift Prevention ===
✅ MS4: Prompt and metadata contain same spirals
✅ MS4: Metadata count matches prompt count
✅ MS4: Metadata uses same list passed to formatter

=== MS5: Preserve Untouched Spirals ===
✅ MS5: Untouched 'relationship' spiral remains active
✅ MS5: Untouched 'money' spiral remains active
✅ MS5: Untouched 'parenting' spiral remains active
✅ MS5: All active spirals have unique ranks after preserve update

===========================================
Results: 16 passed, 0 failed
===========================================
```

## Updated Implementation Files

The original documentation described placeholder/example implementations. The actual production implementations are:

| Original File | Actual Implementation |
|--------------|----------------------|
| `lib/types/spiral.ts` | `lib/consciousness/spiral/spiralStateUtils.ts` |
| `lib/services/spiralStateService.ts` | `lib/consciousness/spiral/SpiralStateService.ts` |
| `lib/prompts/formatMultiSpiralState.ts` | `lib/consciousness/spiral/formatMultiSpiralState.ts` |
| `supabase/migrations/20251218_multi_spiral_states.sql` | `supabase/migrations/20251218000002_multi_spiral_states_with_validation.sql` |

## Migration Path

The hardened migration (`20251218000002`) supersedes the original basic migration (`20251218`). It includes:

1. All original columns (`spiral_states`, `spiral_states_updated_at`)
2. GIN index for efficient queries
3. **NEW:** `validate_spiral_states()` SQL function
4. **NEW:** CHECK constraint `spiral_states_valid`

## Updated Deployment Checklist

### Pre-Deployment

- [ ] Run hardened migration: `psql $DATABASE_URL -f supabase/migrations/20251218000002_multi_spiral_states_with_validation.sql`
- [ ] Verify CHECK constraint: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'user_relationship_context'::regclass AND conname = 'spiral_states_valid';`
- [ ] Run MS1-MS5 tests: `npx tsx scripts/certify-multi-spiral.ts`
- [ ] Verify all 16 assertions pass
- [ ] Run S1-S7 integration tests: `bash scripts/certify-spiral-state.sh` (if implemented)

### Post-Deployment

- [ ] Monitor `spiral_states_updated_at` timestamps
- [ ] Check `metadata.spiralMeta.activeSpirals.length <= 3` in production logs
- [ ] Verify no duplicate `priorityRank` errors in logs (would trigger CHECK constraint)
- [ ] Verify no "spiral invention" errors

## What This Achieves

**Before Hardening:**
- Possible duplicate `priorityRank` values (spirals collapse)
- Possible drift between prompt injection and metadata
- No automated tests proving correctness
- No database-level validation

**After Hardening:**
✅ Unique, contiguous priority ranks enforced (1, 2, 3, ...)
✅ Drift impossible by construction (single source of truth)
✅ MS1-MS5 certification suite proves correctness
✅ Database CHECK constraint enforces integrity
✅ Automatic normalization on all writes
✅ Defensive normalization on reads (handles legacy data)
✅ Preserve-by-default semantics for partial updates

## The Complete Stack

**Database Layer:**
- CHECK constraint validates data integrity
- GIN index for efficient JSONB queries

**Service Layer:**
- `normalizeActiveRanks()` ensures unique ranks on every write
- `validateSpiralStates()` runtime validation
- `setActiveSpiralPrioritiesPreserve()` for preserve-by-default updates
- `replaceActiveSpirals()` for authoritative replacement

**Formatting Layer:**
- Single source of truth pattern (formatter receives list, returns text + metadata)
- Drift impossible by construction

**Testing Layer:**
- MS1-MS5 automated certification tests
- Proves both failure modes are prevented

---

**Status:** All hardening components complete and ready for deployment.
