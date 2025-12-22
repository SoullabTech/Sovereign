# TypeScript Error Triage - December 22, 2025

## Executive Summary

**Total Error Count**: 7000+ lines
**Unique Files with Errors**: 200+
**Critical Blockers**: ~50 files with production-impacting errors

## Top 10 Error-Heavy Files

| File | Errors | Category | Priority |
|------|--------|----------|----------|
| `lib/oracle/dashboard/mobile/MobileFirstDesign.tsx` | 179 | UI Component | Medium |
| `lib/consciousness/next-gen-conversational-intelligence.ts` | 127 | Consciousness Core | HIGH |
| `lib/consciousness/multi-modal-consciousness-detection.ts` | 121 | Consciousness Core | HIGH |
| `lib/consciousness/AccountabilityResponsibilityProtocols.ts` | 95 | Consciousness Core | HIGH |
| `lib/prompts/maya-intelligence-governor.ts` | 78 | Core Prompts | HIGH |
| `components/OracleConversation.tsx` | 61 | UI Component | Medium |
| `app/api/oracle/conversation/route.ts` | 56 | API Route | HIGH |
| `lib/intelligence/AdvancedSynergyEngine.ts` | 55 | Intelligence | Medium |
| `app/api/backend/src/services/participantContextService.ts` | 54 | Legacy Backend | LOW |
| `lib/voice/consciousness/CollectiveIntelligenceProtocols.ts` | 52 | Voice/Consciousness | Medium |

## Error Categories

### 1. Critical Production Blockers (Immediate Fix Required)

#### A. Remaining Supabase References
**Status**: BLOCKING - These will cause runtime crashes

```
lib/agents/PersonalOracleAgent.ts:127,39 - Property 'createClient' not found
lib/agents/PersonalOracleAgent.ts:575,21 - Property 'createClient' not found
lib/ain/awareness-log.ts:31,22 - Property 'createClient' not found
lib/ain/awareness-log.ts:115,22 - Property 'createClient' not found
lib/ain/awareness-log.ts:161,22 - Property 'createClient' not found
app/api/backend/api/oracle-agent/promptLoggingService.ts:25,21 - createClient
app/api/backend/api/oracle-agent/promptUtils.ts:23,21 - createClient
```

**Files to Fix**:
- `lib/agents/PersonalOracleAgent.ts` (2 references)
- `lib/ain/awareness-log.ts` (3 references)
- `app/api/backend/api/oracle-agent/promptLoggingService.ts`
- `app/api/backend/api/oracle-agent/promptUtils.ts`

#### B. Agent Method Signature Mismatches
**Status**: BLOCKING - Core agent functionality broken

```
lib/agents/BioelectricMaiaAgent.ts:71 - Property 'generateResponse' does not exist (expects 'generateVoiceResponse')
lib/agents/elemental/AetherAgent.ts:278 - Expected 1 arguments, but got 4
lib/agents/elemental/AirAgent.ts:244 - Expected 1 arguments, but got 4
lib/agents/elemental/EarthAgent.ts:243 - Expected 1 arguments, but got 4
lib/agents/elemental/WaterAgent.ts:228 - Expected 1 arguments, but got 4
```

**Root Cause**: Agent interface changed but implementations not updated

#### C. Missing Module Exports
**Status**: BLOCKING - Import errors prevent compilation

```
lib/agents/elemental/AetherAgent.ts:9 - Module has no exported member 'getRelevantMemories'
lib/agents/elemental/AetherAgent.ts:10 - Module has no exported member 'storeMemoryItem'
lib/agents/EnhancedMainOracleAgent.ts:13 - Cannot find module '../../apps/api/backend/src/agents/PersonalOracleAgent'
```

**Action**: Export missing members or fix import paths

### 2. High-Priority Type Fixes (Non-Blocking but Risky)

#### A. Timer/Timeout Type Mismatches
**Pattern**: `Type 'number' is not assignable to type 'Timeout'`

```
lib/agents/PerformanceOptimizations.ts:275
lib/agents/utils/RateLimiting.ts:21
app/ain-demo/page.tsx:164
```

**Fix**: Use `ReturnType<typeof setTimeout>` or `NodeJS.Timeout`

#### B. ConversationStylePreference Class vs Interface
**Pattern**: Properties don't exist on ConversationStylePreference

```
lib/ain/awareness-style-suggestions.ts:92 - Property 'style' does not exist
lib/ain/awareness-style-suggestions.ts:197 - Property 'style' does not exist
```

**Fix**: Align interface definition with usage

### 3. Legacy Backend Errors (Low Priority - Can Stub)

**Status**: Not blocking if backend routes unused

```
app/api/backend/ - 54+ files with errors
```

**Recommendation**:
- If `app/api/backend/` is unused: Delete directory or disable in build
- If still needed: Schedule dedicated refactor sprint

### 4. Test File Errors (Ignorable for Deployment)

**Status**: Safe to ignore for production deployment

```
lib/__tests__/PersonalOracleAgent.test.ts:36
scripts/test-biomarker-exports.ts:28
```

**Action**: Create `tsconfig.prod.json` that excludes test files

## Immediate Action Plan

### Phase 1: Critical Blockers (MUST FIX)
1. ✅ Kill remaining `createClient()` references in 7 files
2. ✅ Fix agent method signatures (4 elemental agents + BioelectricMaiaAgent)
3. ✅ Export missing memory service functions
4. ✅ Fix module import paths

### Phase 2: High-Priority Types (SHOULD FIX)
1. ✅ Fix Timer/Timeout type issues (3 files)
2. ✅ Align ConversationStylePreference interface (1 file)

### Phase 3: Triage Backend (DECIDE)
1. ❓ Determine if `app/api/backend/` is actively used
2. ❓ If unused: Delete or exclude from build
3. ❓ If used: Schedule refactor (estimate: 2-3 days)

### Phase 4: Production Config (OPTIMIZE)
1. ✅ Create `tsconfig.prod.json` excluding tests
2. ✅ Add `npm run typecheck:prod` script
3. ✅ Update pre-commit to use prod typecheck

## Estimated Fix Time

- **Phase 1 (Blockers)**: 1-2 hours
- **Phase 2 (High-Priority)**: 30 minutes
- **Phase 3 (Backend Triage)**: 15 minutes decision + 2-3 days if refactor needed
- **Phase 4 (Config)**: 15 minutes

**Total to deployment-ready**: ~2-3 hours (if backend can be deferred)

## Next Command

Run this to see exact lines for Phase 1 blockers:

```bash
cat artifacts/TYPECHECK_FULL.log | grep -E "createClient|generateResponse|getRelevantMemories" | head -50
```
