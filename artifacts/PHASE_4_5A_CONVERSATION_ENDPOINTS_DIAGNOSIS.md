# Phase 4.5A: Conversation Endpoints Diagnosis & Repair Plan

**Date**: December 22, 2025
**Status**: In Progress
**Branch**: phase4.6-reflective-agentics

---

## Executive Summary

During Phase 4.4D analytics dashboard verification, we discovered that **conversation endpoints are failing** with 500 errors due to missing imports and potential Turbopack build issues. This document provides comprehensive diagnosis and repair plan.

**Key Finding**: The endpoints exist and have proper structure, but are failing due to:
1. ✅ **QueryClient Missing** - FIXED (commit `6bb674a5a`)
2. ⚠️ **Missing Imports** - DIAGNOSED (fix in progress)
3. ⚠️ **Turbopack Runtime Errors** - DIAGNOSED (may resolve with import fixes)

---

## Issues Identified

### Issue 1: QueryClient Not Available ✅ RESOLVED

**Symptom**:
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Affected Components**:
- `app/analytics/components/SummaryCards.tsx:29`
- `app/analytics/components/AgentPerformanceTable.tsx:104`
- `app/analytics/components/PracticeRecommendationsTable.tsx:52`
- `app/analytics/components/ActivityTimelineChart.tsx:39`
- `app/analytics/components/SafetyEventLog.tsx:42`

**Root Cause**: No `QueryClientProvider` wrapping the component tree

**Resolution** (commit `6bb674a5a`):
1. Created `components/providers/ReactQueryProvider.tsx`
2. Added provider to `app/layout.tsx` (wraps all children)
3. Re-enabled analytics dashboard (`app/analytics/page.tsx`)
4. Installed `@tanstack/react-query-devtools@^5.63.0`

**Status**: ✅ Complete

---

### Issue 2: Missing Imports in Conversation Endpoints ⚠️ IN PROGRESS

#### Endpoint 1: `/api/enhanced-chat` (route.ts:46)

**File**: `app/api/enhanced-chat/route.ts`

**Error**:
```typescript
// Line 46: MasterMemberArchetypeIntelligence is used but NOT imported
const memberProfile = MasterMemberArchetypeIntelligence.recognizeMemberArchetype({...});
```

**Imports Present**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ConversationAwareConsciousnessEngine } from '@/lib/consciousness/conversation-aware-consciousness-engine';
```

**Missing Import**:
```typescript
// NEEDED: import { MasterMemberArchetypeIntelligence } from '@/lib/consciousness/master-member-archetype-intelligence';
```

**Fix Required**: Add missing import or comment out archetype adaptation code (lines 42-65)

---

#### Endpoint 2: `/api/dialogues` (route.ts:14)

**File**: `app/api/dialogues/route.ts`

**Imports**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionExchanges,
  getActiveSessions,
} from '../../../backend/src/services/dialogue/metaDialogueService';
```

**Status**: Imports look correct, but failing with Turbopack runtime error

**Possible Issues**:
- `metaDialogueService` module may not exist at specified path
- Backend service may have compilation errors
- TypeScript types may be incompatible

**Fix Required**: Verify `backend/src/services/dialogue/metaDialogueService` exists and exports these functions

---

####Endpoint 3: `/api/consciousness/spiral-aware` (route.ts:14-15)

**File**: `app/api/consciousness/spiral-aware/route.ts`

**Imports**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { spiralAwareResponseService } from '@/lib/consciousness/spiral-aware-response';
import { getSessionUserId } from '@/lib/auth/session-utils';
```

**Status**: Imports look correct, but failing with Turbopack runtime error

**Possible Issues**:
- `spiral-aware-response` module may not exist
- `session-utils` module may not exist or export `getSessionUserId`
- TypeScript types may be incompatible

**Fix Required**: Verify both imports exist and export expected functions

---

### Issue 3: Turbopack Runtime Module Errors ⚠️ UNDER INVESTIGATION

**Symptom**:
```
Error: Cannot find module '../chunks/ssr/[turbopack]_runtime.js'
Error: Cannot find module '../../../chunks/[turbopack]_runtime.js'
Error: Cannot find module '../../../../chunks/[turbopack]_runtime.js'
```

**Affected Endpoints**:
- `/api/enhanced-chat`
- `/api/dialogues`
- `/api/consciousness/spiral-aware`

**Root Cause Hypothesis**:
Turbopack failing to generate runtime chunks for these routes because:
1. Missing imports causing compilation failures
2. Circular dependencies in consciousness modules
3. Dynamic imports not properly configured
4. Missing manifest files:
   - `.next/dev/server/pages-manifest.json`
   - `.next/dev/routes-manifest.json`
   - `.next/dev/static/development/_buildManifest.js`

**Fix Strategy**:
1. Fix missing imports first (may resolve Turbopack errors)
2. If errors persist, investigate circular dependencies
3. Consider disabling Turbopack temporarily for debugging: `next dev --no-turbo`

---

## Current Endpoint Status

| Endpoint | Method | Status | Primary Issue | Voice Mode |
|----------|--------|--------|---------------|------------|
| `/api/enhanced-chat` | POST | ❌ 500 | Missing import: `MasterMemberArchetypeIntelligence` | N/A |
| `/api/dialogues` | GET | ❌ 500 | Turbopack runtime error | N/A |
| `/api/consciousness/spiral-aware` | POST/GET | ❌ 500 | Turbopack runtime error | N/A |
| `/api/analytics/system` | GET | ✅ 200 | None | N/A |
| `/api/analytics/export/csv` | GET | ✅ 200 | None | N/A |
| `/api/analytics/export/research` | GET | ✅ 200 | None | N/A |

**Missing Endpoints** (from Voice Mode Comparison Guide):
- `/api/conversation/talk` - NOT FOUND (needed for Talk Mode)
- `/api/conversation/care` - NOT FOUND (needed for Care Mode)
- `/api/conversation/note` - NOT FOUND (needed for Note Mode)

---

## Voice Modes Integration Status

From `docs/MAIA_VOICE_MODES_COMPARISON.md`, MAIA should have three distinct voice modes:

| Mode | Function | Status | Endpoint Needed |
|------|----------|--------|-----------------|
| **Talk** (Dialogue) | Peer conversation, 1-2 sentences | ❌ Not Implemented | `/api/conversation/talk` |
| **Care** (Counsel) | Therapeutic guide, 2-4 sentences | ❌ Not Implemented | `/api/conversation/care` |
| **Note** (Scribe) | Witnessing observer, 2-3 sentences | ❌ Not Implemented | `/api/conversation/note` |

**Implementation Files Exist**:
- ✅ `lib/maia/talkModeVoice.ts` (277 lines) - `getTalkModeVoiceInstructions()`
- ✅ `lib/maia/careModeVoice.ts` (146 lines) - `getCareModeVoiceInstructions()`
- ✅ `lib/maia/noteModeVoice.ts` (152 lines) - `getNoteModeVoiceInstructions()`

**What's Missing**: API route handlers that call these voice mode functions

---

## Repair Plan

### Phase 1: Fix Existing Endpoints (30 minutes)

#### Task 1: Fix Enhanced Chat Import
**File**: `app/api/enhanced-chat/route.ts`

**Option A**: Add missing import (if module exists)
```typescript
import { MasterMemberArchetypeIntelligence } from '@/lib/consciousness/master-member-archetype-intelligence';
```

**Option B**: Comment out archetype adaptation (if module doesn't exist)
```typescript
// Lines 42-65: Temporarily disable archetype adaptation
let wisdomResponse = consciousnessResponse.response;
// try { ... } catch { ... }
```

#### Task 2: Verify Dialogues Service
**Files**:
- Check: `backend/src/services/dialogue/metaDialogueService.ts`
- Fix: Export `getSessionExchanges` and `getActiveSessions` if missing

#### Task 3: Verify Spiral-Aware Dependencies
**Files**:
- Check: `lib/consciousness/spiral-aware-response.ts`
- Check: `lib/auth/session-utils.ts`
- Fix: Ensure exports match imports

---

### Phase 2: Create Voice Mode Endpoints (40 minutes)

#### Task 4: Create Talk Mode Endpoint
**File**: `app/api/conversation/talk/route.ts` (new)

**Structure**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTalkModeVoiceInstructions } from '@/lib/maia/talkModeVoice';
import { getLLM } from '@/lib/ai/providerRouter';

export async function POST(request: NextRequest) {
  const { message, userName, fieldContext } = await request.json();

  const systemPrompt = getTalkModeVoiceInstructions(userName, fieldContext);
  const llm = getLLM('chat'); // Uses MAIA sovereignty routing

  const response = await llm.generateText(message, {
    system: systemPrompt,
    maxTokens: 150, // Talk Mode: 1-2 sentences ~= 50-150 tokens
    temperature: 0.7
  });

  return NextResponse.json({
    mode: 'talk',
    response: response.text,
    metadata: { userName, processingTime: response.timing }
  });
}
```

#### Task 5: Create Care Mode Endpoint
**File**: `app/api/conversation/care/route.ts` (new)

**Structure**: Same as Talk Mode, but:
- Use `getCareModeVoiceInstructions(userName, context)`
- Set `maxTokens: 250` (2-4 sentences ~= 150-250 tokens)

#### Task 6: Create Note Mode Endpoint
**File**: `app/api/conversation/note/route.ts` (new)

**Structure**: Same as Talk Mode, but:
- Use `getNoteModeVoiceInstructions(userName, context)`
- Set `maxTokens: 200` (2-3 sentences ~= 100-200 tokens)
- Pass `conversationHistory` to enable pattern observation

---

### Phase 3: Testing & Verification (20 minutes)

#### Task 7: Test Endpoints with curl
```bash
# Talk Mode
curl -X POST http://localhost:3000/api/conversation/talk \
  -H "Content-Type: application/json" \
  -d '{"message":"Hey, I feel stuck.","userName":"Alex"}'

# Care Mode
curl -X POST http://localhost:3000/api/conversation/care \
  -H "Content-Type: application/json" \
  -d '{"message":"I keep sabotaging myself.","userName":"Alex"}'

# Note Mode
curl -X POST http://localhost:3000/api/conversation/note \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel better today.","userName":"Alex"}'
```

**Expected Responses**:
- **Talk**: Short (1-2 sentences), grounded, no service language
- **Care**: Medium (2-4 sentences), therapeutic, pattern-naming
- **Note**: Evidence-based (2-3 sentences), temporal tracking, observation

#### Task 8: Verify in UI
- Navigate to conversation interface (if exists)
- Switch between Talk/Care/Note modes
- Observe response length and tone differences
- Verify mode switching doesn't break

---

## Dependencies to Verify

| Module | Path | Status | Used By |
|--------|------|--------|---------|
| `ConversationAwareConsciousnessEngine` | `@/lib/consciousness/conversation-aware-consciousness-engine` | ❓ Unknown | enhanced-chat |
| `MasterMemberArchetypeIntelligence` | `@/lib/consciousness/master-member-archetype-intelligence` | ❌ Missing import | enhanced-chat |
| `metaDialogueService` | `backend/src/services/dialogue/metaDialogueService` | ❓ Unknown | dialogues |
| `spiralAwareResponseService` | `@/lib/consciousness/spiral-aware-response` | ❓ Unknown | spiral-aware |
| `getSessionUserId` | `@/lib/auth/session-utils` | ❓ Unknown | spiral-aware |
| `getLLM` (providerRouter) | `@/lib/ai/providerRouter` | ✅ Verified | NEW voice mode endpoints |
| `getTalkModeVoiceInstructions` | `@/lib/maia/talkModeVoice` | ✅ Verified | NEW talk endpoint |
| `getCareModeVoiceInstructions` | `@/lib/maia/careModeVoice` | ✅ Verified | NEW care endpoint |
| `getNoteModeVoiceInstructions` | `@/lib/maia/noteModeVoice` | ✅ Verified | NEW note endpoint |

---

## Success Criteria

### Phase 1 Complete
- [ ] `/api/enhanced-chat` returns 200 (or gracefully degraded)
- [ ] `/api/dialogues` returns 200
- [ ] `/api/consciousness/spiral-aware` returns 200
- [ ] No Turbopack runtime errors in logs

### Phase 2 Complete
- [ ] `/api/conversation/talk` endpoint created and returns 200
- [ ] `/api/conversation/care` endpoint created and returns 200
- [ ] `/api/conversation/note` endpoint created and returns 200
- [ ] All three modes use `getLLM('chat')` (sovereignty routing)

### Phase 3 Complete
- [ ] curl tests show correct response patterns
- [ ] Talk Mode: 1-2 sentences, no service language
- [ ] Care Mode: 2-4 sentences, therapeutic tone
- [ ] Note Mode: 2-3 sentences, evidence-based observation
- [ ] UI mode switching works (if UI exists)

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Fix existing endpoints | 30 minutes |
| Phase 2 | Create voice mode endpoints | 40 minutes |
| Phase 3 | Testing & verification | 20 minutes |
| **Total** | | **90 minutes** |

---

## Next Steps (Immediate)

1. ✅ Complete QueryClient integration (DONE - commit `6bb674a5a`)
2. ✅ Document findings (DONE - this document)
3. ⏭️ Search for missing modules (`MasterMemberArchetypeIntelligence`, etc.)
4. ⏭️ Fix imports or comment out failing code
5. ⏭️ Create three voice mode endpoints (`talk`, `care`, `note`)
6. ⏭️ Test with curl
7. ⏭️ Update Voice Mode Comparison Guide with live examples

---

## References

**Documentation**:
- [Voice Mode Comparison Guide](../docs/MAIA_VOICE_MODES_COMPARISON.md) (1,089 lines)
- [Phase 4.4D Executive Summary](./PHASE_4_4D_EXECUTIVE_SUMMARY.md)
- [Phase 4.4D Docker Verification](./PHASE_4_4D_DOCKER_VERIFICATION.md)

**Voice Mode Specifications**:
- `lib/maia/talkModeVoice.ts` (Talk Mode implementation)
- `lib/maia/careModeVoice.ts` (Care Mode implementation)
- `lib/maia/noteModeVoice.ts` (Note Mode implementation)

**Related Endpoints**:
- `app/api/oracle/conversation/route.ts` (existing conversation endpoint)
- `app/api/maia/ipp-conversation/route.ts` (IPP conversation integration)

---

**Document Version**: 1.0
**Last Updated**: December 22, 2025
**Status**: Diagnosis complete, repair in progress
**Next**: Search for missing modules and create voice mode endpoints

---

*"From diagnosis to deployment: making MAIA's voice modes live."*
