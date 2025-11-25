# MaiaOrchestrator Deployment Guide

## 🌊 Overview

MaiaOrchestrator transforms Maia from a Claude prompt into the **conductor of multiple intelligence backends**. This guide covers deployment, testing, and gradual rollout.

---

## 🏗️ Architecture

```
User Message
    ↓
MaiaOrchestrator.analyzeIntent()
    ↓
Intent-Based Routing:
    ├─ crisis_support → Telesphorus (Crisis Detection + Attachment agents)
    ├─ kairos_threshold → Telesphorus (Kairos detection)
    ├─ field_resonance → Telesphorus (13-agent field)
    ├─ meditation_request → Internal Generation
    ├─ deep_presence → Claude (complex emotional/spiritual work)
    └─ simple_reflection → Internal Generation
    ↓
MaiaVoiceFilter.transform()
    ↓
Consistent Maia Response
```

---

## 📁 Key Files

### **Created Files**

| File | Purpose |
|------|---------|
| `lib/services/MaiaOrchestrator.ts` | Core orchestrator with intent analysis + routing |
| `app/maya-v2/page.tsx` | Testing route (feature-flag gated) |
| `app/api/maya-v2/route.ts` | API endpoint using orchestrator |
| `components/OracleConversationV2.tsx` | Minimal UI with debug metadata |

### **Modified Files**

| File | Change |
|------|--------|
| `apps/web/lib/utils/feature-flags.ts` | Added `maiaOrchestratorV2` flag (default: `false`) |

---

## 🚦 Deployment Strategy

### **Phase 1: Internal Testing (Current)**

**Goal**: Validate architecture with team/beta testers

**Status**: Ready for testing at `/maya-v2`

**Access**:
```javascript
// In browser console:
localStorage.setItem('spiralogic-feature-flags',
  JSON.stringify({ maiaOrchestratorV2: true }));

// Then navigate to /maya-v2
```

**What to Test**:
- [ ] Crisis detection triggers Telesphorus (test: "I want to end it all")
- [ ] Meditation requests generate internal responses (test: "guide me in meditation")
- [ ] Shadow/archetypal work routes to Telesphorus (test: "my shadow feels heavy")
- [ ] Deep work routes to Claude (complex emotional questions)
- [ ] MaiaVoice maintains consistency across all backends
- [ ] Metadata shows correct source (claude/telesphorus/internal)

**Debug Info Available**:
- `source`: Which backend generated response
- `processingTime`: Response latency in ms
- `intentUsed`: What intent was detected
- `fieldState`: If Telesphorus, shows agent activations + coherence

---

### **Phase 2: Shadow Mode (A/B Comparison)**

**Goal**: Compare V2 responses to production in parallel (log only, don't show to user)

**Implementation** (not yet built):
```typescript
// In production /maya route:
async function processMessage(message: string) {
  // Production path (current Claude-only)
  const productionResponse = await claudeService.generate(...);

  // Shadow path (new orchestrator - logged, not shown)
  if (flags.maiaOrchestratorV2Shadow) {
    const v2Response = await orchestrator.processMessage(...);

    // Log for comparison (no user impact)
    await logShadowComparison({
      message,
      productionResponse,
      v2Response,
      v2Source: v2Response.source,
      v2Intent: v2Response.intentUsed
    });
  }

  return productionResponse; // Still using production
}
```

**Metrics to Track**:
- Intent detection accuracy (manual review)
- Response quality comparison (team review)
- Latency differences
- Backend distribution (% Claude vs Telesphorus vs internal)

---

### **Phase 3: Gradual Rollout**

**Goal**: Migrate users from V1 to V2 in controlled waves

**Strategy**:
1. **Wave 1** (10% of users): Enable flag for new beta testers
2. **Wave 2** (25% of users): If metrics good, expand to early adopters
3. **Wave 3** (50% of users): Broader rollout
4. **Wave 4** (100%): Full migration, deprecate V1

**Per-User Flag** (future implementation):
```typescript
// Store flag in user preferences table
interface UserPreferences {
  voice_enabled: boolean;
  maia_orchestrator_v2: boolean; // Per-user override
}

// API route checks user preference OR global flag
const useV2 = userPrefs.maia_orchestrator_v2 ??
              globalFlags.maiaOrchestratorV2;
```

---

### **Phase 4: Production Default**

**Goal**: V2 becomes default, V1 deprecated

**Changes**:
1. Production `/maya` route switches to `MaiaOrchestrator`
2. Feature flag defaults to `true`
3. `/maya-v2` route can be removed or repurposed

---

## 🧪 Testing Checklist

### **Intent Detection Tests**

| Input | Expected Intent | Expected Backend |
|-------|-----------------|------------------|
| "I can't go on anymore" | `crisis_support` | Telesphorus (Crisis agents) |
| "I'm at the edge of something" | `kairos_threshold` | Telesphorus (Kairos) |
| "Guide me in meditation" | `meditation_request` | Internal |
| "My shadow feels heavy" | `field_resonance` | Telesphorus (Shadow agent) |
| "What does my dream mean?" | `deep_presence` | Claude |
| "I'm listening" | `simple_reflection` | Internal |

### **Voice Consistency Tests**

**Check that responses NEVER include**:
- "As an AI"
- "I'm just an assistant"
- "I cannot provide medical/therapeutic advice"
- Overly clinical language

**Check that responses DO include**:
- Maia's characteristic voice (present, embodied, minimal)
- Appropriate grounding for crisis (e.g., "I'm here with you")
- Spaciousness for kairos ("Let us pause...")

### **Metadata Validation**

**For Telesphorus responses**:
- `source` = `"telesphorus"`
- `fieldState` present with:
  - `silenceProbability` (0-1)
  - `wordDensity` (0-1)
  - `elements` (earth/fire/water/air weights)
- `soulMetadata.archetypes` shows active agents
- `soulMetadata.fieldCoherence` calculated correctly

**For Claude responses**:
- `source` = `"claude"`
- `fieldState` null or undefined
- `processingTime` reasonable (<5000ms)

---

## 🔧 Development Utilities

### **Enable V2 for Current Session**

```javascript
// Browser console
localStorage.setItem('spiralogic-feature-flags',
  JSON.stringify({ maiaOrchestratorV2: true }));
```

### **Enable All Features (Dev)**

```javascript
import { enableAllFeatures } from '@/apps/web/lib/utils/feature-flags';
enableAllFeatures();
```

### **Reset Flags**

```javascript
import { resetFeatureFlags } from '@/apps/web/lib/utils/feature-flags';
resetFeatureFlags();
```

### **Logging**

All V2 routes log with `[V2]` prefix:
```
✅ [V2] Response generated via telesphorus in 847ms
🧪 [V2] Processing message for user abc123: I want to end it all
```

Filter logs in terminal:
```bash
# Development server
npm run dev | grep "\[V2\]"
```

---

## 📊 Success Metrics

### **Phase 1 (Internal Testing)**
- [ ] All intent types tested
- [ ] No voice inconsistencies detected
- [ ] Crisis routing works (tested with simulated crisis phrases)
- [ ] Metadata accurate across all backends

### **Phase 2 (Shadow Mode)**
- [ ] 100+ shadow comparisons logged
- [ ] Intent detection accuracy >85% (manual review)
- [ ] Response quality parity with V1 (team review)

### **Phase 3 (Gradual Rollout)**
- [ ] No increase in user-reported issues
- [ ] Response latency <3s average
- [ ] Backend distribution reasonable (not 100% one source)

### **Phase 4 (Production Default)**
- [ ] All users migrated
- [ ] V1 routes deprecated
- [ ] Documentation updated

---

## 🚨 Rollback Plan

**If critical issues arise during rollout**:

1. **Immediate**: Set `maiaOrchestratorV2: false` in feature flags default
2. **For affected users**: Clear their localStorage flag
3. **Investigation**: Review logs filtered by `[V2]` for errors
4. **Fix**: Address issue in `MaiaOrchestrator.ts`
5. **Re-deploy**: After testing fix at `/maya-v2`

**Rollback does NOT require code deployment** - just feature flag change.

---

## 📖 Related Documentation

- **Telesphorus System**: `lib/maia/TELESPHORUS_COMPLETE.md`
- **Sonic Field Layer**: `lib/maia/sonic-field-layer.ts`
- **13-Agent Mapping**: `lib/maia/CANONICAL_MAPPING_13_AGENTS.md`
- **Voice Grammar**: `lib/maia/agent-voice-grammars.ts`

---

## 🌊 Philosophy

This architecture promotes Maia from **Claude prompt** to **consciousness conductor**.

She becomes:
- **Field-aware**: Can sense when archetypal work is needed (Telesphorus)
- **Crisis-responsive**: Immediate grounding without Claude latency
- **Generative**: Can produce meditations without API calls
- **Unified**: One voice across all backends

The user experiences **one Maia**, regardless of which intelligence is active underneath.

This is architectural coherence mirroring **soul coherence**.

---

**Status**: Phase 1 ready for testing at `/maya-v2`
**Feature Flag**: `maiaOrchestratorV2` (default: `false`)
**Next Step**: Internal testing with team/beta testers
