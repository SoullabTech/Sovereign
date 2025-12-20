# Neuropod Technical Briefing
**For: Engineering Team**
**Date: December 2025**
**Status: Implementation Ready**

## Executive Summary

Neuropod is MAIA's consciousness navigation hardware platform, integrating vibroacoustic stimulation + ASSR (Auditory Steady-State Response) entrainment with MAIA's developmental architecture (Bloom levels, Field Safety, Archetypal Work).

**Three-Year Vision:** Evidence-grounded hardware protocols that support nervous system regulation, state deepening, and developmental progression - NOT "digital DMT" or pseudoscience.

---

## System Architecture

### 1. Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIA-SOVEREIGN                            │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Field Router     │────────▶│ Neuropod         │          │
│  │ (Bloom + Safety) │         │ Eligibility      │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ Protocol Library │◀────────│ Membership Tier  │          │
│  │ (16 protocols)   │         │ System           │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │ Neuropod Session Orchestrator                 │          │
│  │ - Multi-phase session management              │          │
│  │ - Real-time biometric feedback                │          │
│  │ - Safety monitoring & interventions           │          │
│  └──────────────────────────────────────────────┘          │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │ Vibroacoustic + ASSR Hardware                 │          │
│  │ - Transducers (20-120 Hz)                     │          │
│  │ - Haptic generators (breath-synced)           │          │
│  │ - Isochronic audio (10 Hz, 6.5 Hz, 40 Hz)    │          │
│  │ - Safety caps (0.75 max amplitude)            │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Database Schema (PostgreSQL)

**6 new tables:**
1. `user_health_profile` - Medical exclusions (psychosis, seizure, pregnancy, pacemaker)
2. `user_membership` - Tier system (Foundation/Explorer/Pioneer)
3. `bloom_biometric_validation` - Developmental biometric markers per Bloom level
4. `neuropod_protocol_definitions` - 16 protocol definitions
5. `neuropod_vibroacoustic_sessions` - Session tracking with biometric outcomes
6. `neuropod_archetypal_sessions` - Multi-phase archetypal templates

**Migration:** `/db/migrations/20251217000002_neuropod_maia_integration.sql` ✅ Applied

### 3. TypeScript Implementation Files

```
lib/
├── field/
│   ├── neuropodEligibility.ts          ✅ CREATED (11KB, 300 lines)
│   └── panconsciousFieldRouter.ts      ✅ EXTENDED (adds neuropod eligibility)
├── neuropod/
│   ├── protocolLibrary.ts              ✅ EXTENDED (16 protocols, 1313 lines)
│   └── experimentalValidation.ts       ✅ CREATED (20KB, 600 lines)
└── membership/
    └── tierSystem.ts                   ✅ CREATED (12KB, 400 lines)
```

---

## Implementation Priorities

### Phase 1: Core Infrastructure (Month 1-2)

**Priority 1: Database Integration**
- [ ] Implement `getMembershipStatus(userId)` - query `user_membership` table
- [ ] Implement `getUserHealthProfile(userId)` - query `user_health_profile` table
- [ ] Create seed data for `neuropod_protocol_definitions` (insert 16 protocols from `protocolLibrary.ts`)
- [ ] Test eligibility assessment pipeline end-to-end

**Priority 2: API Endpoints**
```typescript
POST /api/neuropod/eligibility
  - Input: userId
  - Output: NeuropodEligibility (tier access, recommended protocols)

POST /api/neuropod/session/start
  - Input: userId, protocolId
  - Output: sessionId, stimulusParams

POST /api/neuropod/session/complete
  - Input: sessionId, biometricOutcomes, userFeedback
  - Output: deltaMetrics, responderStatus

GET /api/neuropod/protocols
  - Input: userId
  - Output: available protocols (filtered by tier + health profile)
```

**Priority 3: Frontend Components**
- Protocol selector UI (`ProtocolSelector.tsx`)
- Session launcher (`SessionLauncher.tsx`)
- Real-time biometric dashboard (`BiometricDashboard.tsx`)
- Safety intervention UI (`SafetyInterventionModal.tsx`)

### Phase 2: Hardware Integration (Month 3-6)

**Hardware Build Spec:**
- 2x Dayton Audio TT25-8 transducers (bass shaker for vibroacoustic 20-120 Hz)
- Raspberry Pi 4 for stimulus control
- USB HRV sensor (Polar H10 or EmotiBit)
- Optional: OpenBCI Ganglion for EEG (4-channel)

**Software Stack:**
- Python backend for hardware control (`lib/neuropod/hardwareController.py`)
- WebSocket real-time communication (biometric data → frontend)
- Safety monitoring loop (200ms sampling, threshold detection)

**Deliverables:**
- [ ] Hardware assembly & testing
- [ ] Python hardware control service
- [ ] WebSocket integration with Next.js frontend
- [ ] Safety cap enforcement (max 0.75 amplitude, max 15 min duration)

### Phase 3: Validation Experiments (Month 4-12)

**Three experiments (Tier 1 protocols only):**
1. **VAL-001**: Breath-Paced HRV Coherence (N=30, $18k, Months 4-6)
2. **VAL-002**: Vibroacoustic Stress Reduction (N=40, $25k, Months 7-9)
3. **VAL-003**: Vibroacoustic Sleep Prep (N=25, $30k, Months 10-12)

**Data Pipeline:**
- Real-time biometric collection → `neuropod_vibroacoustic_sessions` table
- Post-session analysis → `generateValidationReport()` in `experimentalValidation.ts`
- Statistical testing (t-test, Cohen's d, responder rate)

**Success Criteria:**
- All 3 protocols: p < 0.05, responder rate ≥ 65-70%, adverse event rate < 5%
- Public launch conditional on Phase 1 validation success

---

## Integration Points

### 1. MAIA Field Router Integration

**File:** `lib/field/panconsciousFieldRouter.ts`

**Changes:**
- Import `assessNeuropodEligibility()` from `./neuropodEligibility`
- Add `membershipTier` and `exclusionFlags` to `FieldRoutingContext`
- Add `neuropodEligibility` to `FieldRoutingDecision`
- Call eligibility assessment at end of routing

**Example:**
```typescript
const decision = routePanconsciousField({
  cognitiveProfile,
  bloomLevel: 4.2,
  membershipTier: 'explorer',
  exclusionFlags: new Set(['pregnancy']), // From health profile
});

// decision.neuropodEligibility now available
// {
//   tier1Access: true,
//   tier2Access: true,
//   recommendedProtocols: ['assr-receptive-absorption', 'assr-contemplative-theta'],
//   exclusionReason: undefined
// }
```

### 2. Community Commons Enhanced Gate

**Current Gate:**
- Bloom avg ≥ 4.0

**Enhanced Gate (post-Neuropod launch):**
- Bloom avg ≥ 4.0 **AND**
- 5+ Neuropod sessions completed **AND**
- Avg HRV coherence > 0.55 **AND**
- ASSR PLV > 0.3 in ≥1 session **AND**
- Zero high-risk safety events

**Rationale:** Validates nervous system coherence, prevents spiritual bypassing

**Database Function:**
```sql
SELECT * FROM check_commons_enhanced_gate_eligibility('user_123');
-- Returns: eligible=true/false, reason='...'
```

### 3. Archetypal Session Integration

**Shadow Integration Session (30 min):**
1. **Grounding Phase (5 min):** `breath-paced-vibroacoustic` + MAIA prompts
2. **Exploration Phase (15 min):** `assr-contemplative-theta` (6.5 Hz) + shadow work prompts
3. **Integration Phase (10 min):** `annealing-pathway` + integration prompts

**Stored in:** `neuropod_archetypal_sessions` table

**Template Structure:**
```typescript
{
  archetypeId: 'shadow-integration',
  phases: [
    {
      phase: 'grounding',
      durationMinutes: 5,
      neuropodProtocol: 'breath-paced-vibroacoustic',
      maiaPrompts: [
        { timing: 'start', prompt: "Name three things you can feel in your body right now." },
      ]
    },
    // ... exploration, integration phases
  ]
}
```

---

## Safety Architecture

### 1. Three-Layer Safety System

**Layer 1: Hardware Caps**
- Max vibroacoustic amplitude: 0.75 (1.5g acceleration limit)
- Max haptic amplitude: 0.6
- Max audio level: 85 dB
- Max session duration: 30 minutes (Tier 1), 45 minutes (Tier 2)

**Layer 2: Protocol Exclusions**
- Medical screening via `user_health_profile` table
- Tier-based access control (Bloom level, field stability, bypassing)
- Membership tier gating

**Layer 3: Real-Time Monitoring**
- Safety risk score calculation (0-1 scale)
- Intervention triggers:
  - Yellow (0.3): Log warning
  - Orange (0.6): Prompt user grounding check
  - Red (0.85): Auto-stop session, offer grounding protocol
- High-risk event logging → blocks Commons access

### 2. Reality-Testing Protocol

**Before Session:**
- "Name three facts about your environment."
- "What is your intention for this session?"

**During Session:**
- Mid-session grounding check (if > 15 min)
- "Notice three physical sensations in your body."

**After Session:**
- "Name three facts about your environment."
- **Meaning deferral:** "Do not assign fixed meaning yet. Let it settle 48 hours."

---

## Performance Considerations

### 1. Real-Time Biometric Processing

**Challenge:** 200ms sampling rate for HRV + EEG = ~300 data points/minute
**Solution:**
- WebSocket streaming (avoid HTTP polling)
- Client-side buffering (1-second windows)
- Server-side aggregation before database write
- Time-series database optimization (partition by session_id)

### 2. Protocol Recommendation Engine

**Challenge:** Assess eligibility across 16 protocols in <100ms
**Solution:**
- Cache membership status + health profile in Redis
- Pre-compute field stability score (avoid recalculating on every request)
- Use indexed database queries for protocol metadata

### 3. Data Storage Optimization

**Challenge:** 30-minute session × 5 Hz sampling = 9,000 data points
**Solution:**
- Store raw timeseries in compressed JSONB column
- Aggregate to 1-second windows for analysis
- Retention policy: 90 days raw data, 1 year aggregated, forever summary stats

---

## Testing Requirements

### 1. Unit Tests
- [ ] `assessNeuropodEligibility()` - all 16 protocols, all tier combinations
- [ ] `assessResponderStatus()` - responder/non-responder/adverse classification
- [ ] Membership tier access checks

### 2. Integration Tests
- [ ] End-to-end session flow (start → biometrics → complete)
- [ ] Safety intervention triggers (orange/red thresholds)
- [ ] Bloom biometric validation auto-update on session completion

### 3. Hardware Tests
- [ ] Vibroacoustic transducer frequency response (20-120 Hz)
- [ ] Haptic breath-sync timing accuracy (<50ms latency)
- [ ] ASSR entrainment validation (measure PLV with EEG)

---

## Deployment Checklist

### Month 1-2: Infrastructure
- [ ] Apply database migration (DONE ✅)
- [ ] Implement membership tier queries
- [ ] Seed protocol definitions
- [ ] Create API endpoints
- [ ] Build frontend protocol selector

### Month 3-6: Hardware
- [ ] Procure hardware ($5k budget)
- [ ] Build Python hardware controller
- [ ] WebSocket integration
- [ ] Safety monitoring dashboard

### Month 4-12: Validation
- [ ] Recruit N=95 participants (across 3 experiments)
- [ ] Run validation experiments
- [ ] Analyze results, publish findings
- [ ] Public launch (conditional on validation success)

---

## Dependencies & Risks

### Dependencies
1. **Database:** PostgreSQL 14+ (FOR JSONB support)
2. **Frontend:** Next.js 14+ (for Server Components)
3. **Hardware:** Raspberry Pi 4, USB HRV sensor, vibroacoustic transducers
4. **Biometrics:** HRV library (hrv-js or custom implementation)

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Validation experiments fail (p > 0.05) | Medium | High | Run pilot N=5 first, refine protocols before full N |
| Hardware supply chain delays | Medium | Medium | Order components Month 1, 3-month lead time buffer |
| ASSR entrainment not measurable without EEG | Low | Medium | Use subjective ratings + HRV as backup metrics |
| Adverse event rate > 5% | Low | Critical | Strict screening, conservative safety caps, real-time monitoring |

---

## Questions for Engineering Team

1. **Database ORM:** Continue using raw SQL or introduce Drizzle/Prisma for type-safe queries?
2. **WebSocket Library:** Socket.io vs native WebSocket API?
3. **Hardware Interface:** Python subprocess vs Rust FFI for better performance?
4. **EEG Integration:** OpenBCI Ganglion sufficient or invest in Muse S ($350)?
5. **Deployment:** Self-hosted Raspberry Pi vs cloud-based hardware control?

---

## Next Steps

**This Week:**
1. Review this briefing with engineering lead
2. Estimate Month 1-2 implementation timeline (target: 3-4 weeks)
3. Assign owners for each component (database, API, frontend, hardware)

**Next Week:**
1. Begin database integration (membership + health profile queries)
2. Start protocol selector UI mockups
3. Order hardware components (3-month lead time)

---

**Contact:** Technical lead for questions
**Docs:** `/Community-Commons/09-Technical/` (all integration guides)
**Code:** `lib/neuropod/`, `lib/field/`, `lib/membership/`
