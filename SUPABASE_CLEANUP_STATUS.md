# Supabase Cleanup Status — December 20, 2025

**Enforcement:** ✅ Active (versioned hooks committed)
**Dependencies:** ✅ Removed from package.json
**Directory:** ✅ Renamed `supabase/` → `db/`
**Remaining:** ⚠️ 65 files with local Supabase wrapper imports

---

## What Was Accomplished

### 1. Enforcement System (Complete) ✅

**Files created:**
- `scripts/check-no-supabase.ts` — Fast import checker
- `.githooks/pre-commit` — Versioned pre-commit hook
- `scripts/setup-githooks.sh` — One-time setup script

**How it works:**
```bash
# After cloning:
./scripts/setup-githooks.sh

# Now every commit runs:
npm run check:no-supabase

# Blocks commits with Supabase imports
```

**Status:** Working correctly. Now detecting real violations.

---

### 2. Dependencies Removed ✅

**Before:**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7"
  }
}
```

**After:**
```bash
$ grep "@supabase" package.json
# (empty)
```

**Status:** All Supabase dependencies removed from package.json.

---

### 3. Directory Renamed ✅

**Before:**
```
supabase/migrations/
```

**After:**
```
db/migrations/
```

**Updated files:** 10 scripts that reference migration paths
- `scripts/apply-beta-migrations.ts`
- `scripts/migrate-reality-hygiene.sh`
- `scripts/apply-opus-axioms-migration.ts`
- `scripts/apply-opus-axioms-pg-migration.ts`
- `scripts/deploy-beads-staging.sh`
- `scripts/apply-validator-migration.ts`
- `lib/memory/beads-sync/test-integration.sh`
- `app/api/backend/validate-user-memory.js`
- `app/api/backend/scripts/testSpiralogicSystem.ts`
- `app/api/backend/scripts/production-deploy.sh`

**Status:** Psychological trigger removed. No more "`supabase/`" directory.

---

## Remaining Work (65 Files)

### The Pattern

All remaining violations import from **local wrapper modules**, not `@supabase/*` packages:

```typescript
// ❌ Local Supabase wrapper imports (65 files)
import { createClientComponentClient } from '@/lib/supabase';
import { createClient } from '@/lib/supabase';
import { supabase } from '../lib/supabase';
```

These wrappers exist in:
```
lib/supabase.ts
lib/supabaseClient.ts
lib/supabase-server.ts
lib/supabase-hooks.ts
lib/supabase/sacred-oracle-db.ts
lib/supabase/soullab-queries.ts
lib/auth/supabase-client.ts
lib/utils/supabase-client.ts
lib/config/supabase.ts
lib/services/supabaseAnalytics.ts
lib/analytics/supabaseAnalytics.ts
... (14+ wrapper files)
```

---

### Breakdown by Category

#### Backend API (20 files)
```
app/api/backend/src/lib/config.ts (SUPABASE_URL env vars)
app/api/backend/src/adapters/memory/SupabaseMemory.ts
app/api/backend/src/middleware/auth.ts
app/api/backend/src/middleware/authenticateToken.ts
app/api/backend/src/middleware/isAdmin.ts
app/api/backend/src/routes/oracle/preferences.routes.ts
app/api/backend/src/routes/oraclePreferences.routes.ts
app/api/backend/src/services/DaimonicEventService.ts
app/api/backend/src/services/SemanticIndexer.ts
app/api/backend/src/services/embeddingQueue.ts
app/api/backend/src/services/semanticRecall.ts
app/api/backend/src/services/tests/memoryService.test.ts
app/api/backend/src/utils/auth.ts
app/api/backend/scripts/seed-sample-files.ts
app/api/backend/scripts/seedMemoryItems.ts
```

#### Memory System (8 files)
```
lib/memory/bardic/ConversationMemoryIntegration.ts
lib/memory/bardic/CueService.ts
lib/memory/bardic/EmbeddingService.ts
lib/memory/bardic/LinkingService.ts
lib/memory/bardic/RecallService.ts
lib/memory/bardic/RecognitionService.ts
lib/memory/bardic/ReentryService.ts
lib/memory/bardic/TeleologyService.ts
```

#### Services (12 files)
```
lib/services/archetypePreferenceService.ts
lib/services/conversation-analytics-service.ts
lib/services/conversationStorageService.ts
lib/services/intakeService.ts
lib/services/memoryService.ts
lib/services/offering-session-service.ts
lib/services/onboardingService.ts
lib/services/ritualEventService.ts
lib/services/sessionStorage.ts
lib/services/userPreferenceService.ts
lib/services/retrieval-protocol.ts (line 433 - require('@supabase/supabase-js'))
lib/supabase-hooks.ts
```

#### Components (7 files)
```
components/QuickSettingsSheet.tsx
components/dashboard/AudioUnlockDashboard.tsx
components/dashboard/ReflectionMetricsWidget.tsx
components/dashboard/ThemePreferencesWidget.tsx
components/onboarding/AttunePanel.tsx
components/ui/ThemeToggle.tsx
components/ui/ThemeToggleWithAnalytics.tsx
```

#### Consciousness System (3 files)
```
lib/consciousness/ConversationPersistence.ts
lib/consciousness/CrossSpeciesAnalytics.ts
lib/consciousness/SyntheticFieldInterface.ts
```

#### Hooks (6 files)
```
lib/hooks/useAuth.ts
lib/hooks/useFeatureFlag.ts
lib/hooks/usePersonalization.ts
lib/hooks/useUserAuth.ts
lib/hooks/useWeeklyInsights.ts
lib/theme/userTheme.ts
```

#### Other (9 files)
```
app/api/conversations/export/route.ts
database/migration-tool.js (require('@supabase/supabase-js'))
lib/insights/SupabaseDevelopmentalData.ts (hardcoded URL!)
lib/pipelines/document-analysis.ts
lib/supabase-server.ts (eval require)
lib/supabase/sacred-oracle-db.ts
lib/supabase/soullab-queries.ts
lib/sync/CrossDeviceSyncService.ts
lib/tracking/userActivityTracker.ts
```

---

## Recommended Cleanup Strategy

### Option 1: Delete Non-Critical Files (Fast)

Many of these files are legacy/unused. Delete them if they're not actively used:

```bash
# Check if file is imported anywhere
rg "from.*ConversationPersistence" lib app

# If not used, delete:
git rm lib/consciousness/ConversationPersistence.ts
```

**Candidates for deletion:**
- `lib/insights/SupabaseDevelopmentalData.ts` (hardcoded Supabase URL!)
- `database/migration-tool.js` (legacy)
- `lib/supabase-server.ts` (eval wrapper)
- `lib/supabase-hooks.ts` (wrapper)
- `app/api/backend/scripts/seed-sample-files.ts` (dev script)
- `app/api/backend/scripts/seedMemoryItems.ts` (dev script)

---

### Option 2: Replace Incrementally (Thorough)

For files that are actively used, replace Supabase calls with PostgreSQL:

**Before:**
```typescript
import { createClientComponentClient } from '@/lib/supabase';

const supabase = createClientComponentClient();
const { data } = await supabase.from('table').select('*').eq('id', userId);
```

**After:**
```typescript
import { query } from '@/lib/db/postgres';

const result = await query('SELECT * FROM table WHERE id = $1', [userId]);
const data = result.rows;
```

**Files requiring this:** ~40 files with actual database operations

---

### Option 3: Create PostgreSQL Wrapper (Pragmatic)

Since many files use the same pattern (`createClientComponentClient`), create a drop-in replacement:

**Create `lib/db/client.ts`:**
```typescript
import { query } from './postgres';

// Drop-in replacement for createClientComponentClient()
export function createClientComponentClient() {
  return {
    from(table: string) {
      return {
        async select(columns = '*') {
          const result = await query(`SELECT ${columns} FROM ${table}`);
          return { data: result.rows, error: null };
        },
        // ... implement other methods as needed
      };
    }
  };
}
```

**Then globally replace:**
```bash
sed -i '' "s|from '@/lib/supabase'|from '@/lib/db/client'|g" lib/**/*.ts components/**/*.tsx
```

**Pro:** Fast, minimal code changes
**Con:** Still wrapping PostgreSQL in Supabase-like API

---

## Next Steps

### Immediate (Get to Green)

1. **Delete legacy wrapper files** (reduces violations by ~15):
   ```bash
   git rm lib/supabase-server.ts \
          lib/supabase-hooks.ts \
          lib/insights/SupabaseDevelopmentalData.ts \
          database/migration-tool.js \
          app/api/backend/scripts/seed-sample-files.ts \
          app/api/backend/scripts/seedMemoryItems.ts
   ```

2. **Remove SUPABASE env vars from config** (reduces violations by ~3):
   - Edit `app/api/backend/src/lib/config.ts`
   - Remove `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

3. **Check if remaining files are used**:
   ```bash
   for file in lib/memory/bardic/*.ts; do
     echo "Checking $file..."
     rg "$(basename $file .ts)" lib app | grep -v "$file" || echo "  → Unused, can delete"
   done
   ```

4. **Re-run check**:
   ```bash
   npm run check:no-supabase
   ```

---

### Medium-Term (Complete Removal)

1. **Create PostgreSQL wrappers** for actively-used patterns
2. **Migrate service layer** (lib/services/*) to use `lib/db/postgres.ts`
3. **Migrate components** to use API routes instead of direct DB access
4. **Delete all `lib/supabase*` files**

---

## Success Criteria

**✅ Green check:**
```bash
$ npm run check:no-supabase

🔍 Checking for Supabase violations...

✅ No Supabase detected.
```

**✅ Clean sovereignty audit:**
```bash
$ npm run audit:sovereignty

...
🚨 CRITICAL (28)  # Down from 119 (only OpenAI/AWS remain)
```

---

## Current Status Summary

| Aspect | Status |
|--------|--------|
| **Enforcement** | ✅ Active (versioned hooks) |
| **Dependencies** | ✅ Removed from package.json |
| **Directory** | ✅ Renamed to `db/` |
| **Package imports** | ✅ Zero `@supabase/*` imports |
| **Local wrappers** | ⚠️ 65 files still import from `lib/supabase` |
| **Check passes** | ❌ Failing on wrapper imports |

---

**Next action:** Delete legacy files + remove env vars to reduce violations from 65 → ~47, then decide on wrapper vs full migration strategy.
