# Neuropod Demo & MVP Scope
## What We Need to Build for Pioneer Circle Launch

**Target Date:** March 1, 2026 (Hardware Shipping to First 100 Pioneers)
**Current Date:** December 2025
**Timeline:** 10 weeks to MVP

---

## MVP Definition

**Minimum Viable Product = What 100 Pioneers need to run their first Neuropod session successfully**

**Success Criteria:**
1. Pioneer can assemble hardware from instructions in <4 hours
2. Pioneer can complete Breath-Paced Grounding protocol (15 min) without technical issues
3. Pioneer can see HRV coherence score post-session
4. Pioneer can access Bloom Biometric Dashboard showing their progression
5. Safety monitoring logs high-risk events correctly
6. System does not cause adverse events >2% rate

**Not in MVP:**
- Perfect UI polish (functional > beautiful for beta)
- All 16 protocols (start with 6 Tier 1 protocols)
- Real-time PLV calculation (ASSR validation can be post-processed initially)
- Mobile app (web-based interface sufficient for MVP)
- Clinical licensing features (Pioneer Circle only)

---

## Hardware MVP (Physical Components)

### Bill of Materials (Per Kit)

**Vibroacoustic System:**
- 2× Dayton Audio TT25-8 Tactile Transducers (bass shakers) — $30 each = $60
  - Frequency range: 20-80 Hz
  - Power handling: 25W RMS
  - Mounting: Bolted under meditation cushion, yoga mat, or chair
- 1× Fosi Audio BT10A Amplifier (2-channel, Bluetooth) — $40
  - 50W × 2 channels (sufficient for transducers)
  - Bluetooth input (connects to Raspberry Pi)
  - Volume knob (manual override for safety)

**Compute & Control:**
- 1× Raspberry Pi 4 Model B (4GB RAM) — $55
  - Runs Neuropod software (Python backend, web server)
  - Bluetooth audio output to amplifier
  - GPIO for haptic control
- 1× 64GB microSD card (pre-configured with Neuropod OS image) — $12
  - Raspberry Pi OS Lite
  - Neuropod software pre-installed
  - Auto-start on boot

**Biometric Sensors:**
- 1× Polar H10 Heart Rate Monitor (chest strap, Bluetooth) — $90
  - HRV-grade accuracy (±1ms R-R interval)
  - Bluetooth Low Energy (connects to Raspberry Pi)
  - Rechargeable battery (20 hours)

**Accessories:**
- 2× Speaker wire (10 ft, 16 AWG) — $5
- 1× USB-C power supply (15W, Raspberry Pi official) — $8
- 1× Ethernet cable (optional, for initial setup) — $3
- 1× Assembly instructions (printed booklet) — $5

**Total Hardware Cost:** $278
**Buffer for scale discounts, shipping materials:** -$98
**Final Cost at 100-unit scale:** ~$180/kit

**Retail Value (Included in Pioneer Tier):** $500

### Hardware Assembly Process (User-Facing)

**Estimated Time:** 3-4 hours (first-time assembly)

**Steps:**
1. **Unbox & Inventory** (15 min)
   - Check all components against packing list
   - Charge Polar H10 chest strap

2. **Raspberry Pi Setup** (30 min)
   - Insert pre-configured microSD card
   - Connect Raspberry Pi to power, Ethernet (optional), monitor/keyboard (initial setup only)
   - Boot Raspberry Pi, configure WiFi (web-based setup wizard)
   - Test: Access Neuropod web interface from laptop (http://neuropod.local)

3. **Transducer Mounting** (60 min)
   - Decide mounting location (under meditation cushion, yoga mat, chair, massage table)
   - Bolt transducers to mounting surface (wood board recommended)
   - Run speaker wire from transducers to amplifier
   - Test: Play test tone, verify vibration

4. **Amplifier Wiring** (30 min)
   - Connect speaker wires to amplifier outputs (Channel 1, Channel 2)
   - Connect amplifier to Raspberry Pi via Bluetooth pairing
   - Set volume to 50% (safety starting point)
   - Test: Play vibroacoustic test tone (30 Hz, 10 seconds)

5. **Polar H10 Pairing** (15 min)
   - Moisten chest strap electrodes
   - Wear chest strap, power on
   - Pair with Raspberry Pi via Neuropod web interface
   - Test: Real-time heart rate displayed on screen

6. **First Session** (20 min)
   - Run "Breath-Paced Grounding" protocol (15 min)
   - Follow on-screen prompts
   - Verify HRV coherence score displayed post-session

7. **Troubleshooting** (30 min buffer)
   - Common issues: Bluetooth pairing failures, transducer no vibration, Polar H10 no signal
   - Troubleshooting guide (printed + online wiki)

**Video Tutorial:** 15-minute walkthrough (YouTube, unlisted)
**Support:** Pioneer Circle Slack channel, weekly office hours calls

---

## Software MVP (Neuropod Platform)

### Architecture Overview

**Stack:**
- **Backend:** Python 3.11 (FastAPI)
- **Frontend:** Next.js 14 (React, TypeScript)
- **Database:** PostgreSQL (existing MAIA database)
- **Biometric Pipeline:** Python (real-time HRV calculation, safety monitoring)
- **Hardware Control:** Python (GPIO for haptics, Bluetooth audio streaming)

**Deployment:**
- **Raspberry Pi:** Python backend runs locally (no internet required for sessions)
- **MAIA Cloud:** User data sync, Bloom Biometric Dashboard, Community Commons integration
- **Communication:** WebSocket (real-time biometric streaming), REST API (session data sync)

### Core Components (Must-Have for MVP)

#### 1. Protocol Execution Engine

**File:** `lib/neuropod/protocolExecutor.py`

**Responsibilities:**
- Load protocol definition from `protocolLibrary.ts`
- Generate vibroacoustic waveform (sine wave, frequency modulation)
- Stream audio to Bluetooth amplifier (ALSA, PulseAudio)
- Trigger haptic pulses (GPIO control)
- Emit timing events ("start", "mid", "end") for MAIA prompts

**MVP Protocols (6 Tier 1):**
1. Breath-Paced Grounding (15 min)
2. Breath-Paced Vibroacoustic (15 min)
3. Vibroacoustic Stress Reduction (15 min)
4. Vibroacoustic Sleep Prep (20 min)
5. Alpha Relaxation (20 min)
6. Vibroacoustic Grounding (15 min)

**Example Protocol Execution:**
```python
protocol = load_protocol("breath-paced-grounding")
session = Session(user_id, protocol)

# Start HRV monitoring
hrv_monitor.start(polar_h10_device)

# Execute protocol phases
for phase in protocol.phases:
    if phase.audio_file:
        play_audio(phase.audio_file)
    if phase.vibroacoustic:
        generate_vibroacoustic(phase.frequency, phase.amplitude, phase.duration)
    if phase.haptic_pulses:
        trigger_haptic(phase.pulse_timing)

    # Safety monitoring
    if safety_monitor.risk_score > 0.85:
        stop_session()
        offer_grounding_protocol()

# Post-session
hrv_coherence = calculate_hrv_coherence(session.hrv_data)
session.save_results(hrv_coherence)
```

#### 2. Biometric Pipeline

**File:** `lib/neuropod/biometricPipeline.py`

**Responsibilities:**
- Stream HRV data from Polar H10 (Bluetooth Low Energy)
- Calculate R-R intervals (ms between heartbeats)
- Calculate HRV coherence (HeartMath algorithm or SDNN)
- Calculate safety risk score (HRV volatility, GSR if available)
- Log biometric timeseries (for post-session analysis)

**HRV Coherence Calculation (Simplified for MVP):**
```python
def calculate_hrv_coherence(rr_intervals):
    """
    Simplified coherence: ratio of low-frequency power (0.1 Hz, resonant breathing)
    to total power. Higher ratio = more coherence.
    """
    # FFT of R-R interval timeseries
    frequencies, power_spectrum = fft(rr_intervals)

    # Low-frequency band (0.04-0.15 Hz, includes resonant breathing ~0.1 Hz)
    lf_power = integrate(power_spectrum, 0.04, 0.15)

    # Total power
    total_power = integrate(power_spectrum, 0.04, 0.4)

    coherence = lf_power / total_power
    return coherence
```

**Safety Risk Score (MVP Version):**
```python
def calculate_safety_risk_score(hrv_data, user_distress_flag):
    """
    Risk score 0-1 scale.
    Yellow (0.3): log warning
    Orange (0.6): pause stimulation, prompt grounding
    Red (0.85): auto-stop session
    """
    # HRV volatility: large swings in heart rate
    hrv_volatility = std_deviation(hrv_data[-30:])  # Last 30 seconds

    # Normalize to 0-1 scale (assume max volatility = 50 ms SDNN)
    risk_score = min(hrv_volatility / 50, 1.0)

    # User distress flag (manual "I need to stop" button)
    if user_distress_flag:
        risk_score = 1.0

    return risk_score
```

#### 3. Session Orchestrator

**File:** `lib/neuropod/sessionOrchestrator.py`

**Responsibilities:**
- Check user eligibility (Bloom level, field stability, medical exclusions)
- Pre-session grounding prompts ("Name three things you can feel")
- Execute protocol (delegates to Protocol Execution Engine)
- Post-session integration prompts ("Rate your experience: Grounded, Calm, Clear...")
- Save session results to database (biometrics, user ratings, safety events)

**Session Flow:**
```python
# 1. Eligibility check
eligibility = check_neuropod_eligibility(user_id, protocol_id)
if not eligibility.eligible:
    return error(eligibility.reason)

# 2. Pre-session reality-testing
prompt("Name three facts about your environment.")
prompt("What is your intention for this session?")

# 3. Execute protocol
session = execute_protocol(user_id, protocol_id)

# 4. Post-session reality-testing
prompt("Name three facts about your environment.")
rating = prompt("Rate your experience: Grounded, Calm, Clear, Overwhelmed, Spacey.")

# 5. Save results
save_session(session, rating)

# 6. Sync to MAIA cloud (if online)
sync_to_cloud(session)
```

#### 4. MAIA Cloud Integration

**File:** `app/api/neuropod/session-sync/route.ts` (Next.js API)

**Responsibilities:**
- Receive session data from Raspberry Pi (WebSocket or REST)
- Save to `neuropod_vibroacoustic_sessions` table
- Update `bloom_biometric_validation` table (aggregate stats per Bloom level)
- Check Community Commons enhanced gate eligibility
- Return updated Bloom Biometric Dashboard data

**API Endpoint:**
```typescript
// POST /api/neuropod/session-sync
export async function POST(request: NextRequest) {
  const { userId, protocolId, sessionResults } = await request.json();

  // Save session
  await db.neuropod_vibroacoustic_sessions.insert({
    user_id: userId,
    protocol_id: protocolId,
    avg_hrv_coherence: sessionResults.hrvCoherence,
    safety_risk_max: sessionResults.safetyRiskMax,
    user_rating: sessionResults.userRating,
    // ... other biometrics
  });

  // Update Bloom biometric validation
  await db.update_bloom_biometric_validation(userId, currentBloomLevel, sessionResults);

  // Check Commons eligibility
  const commonsEligibility = await db.check_commons_enhanced_gate_eligibility(userId);

  return NextResponse.json({
    success: true,
    commonsEligibility,
    bloomBiometricData: await fetchBloomBiometricData(userId),
  });
}
```

#### 5. Bloom Biometric Dashboard (Frontend)

**File:** `components/neuropod/BloomBiometricDashboard.tsx` (ALREADY CREATED)

**Responsibilities:**
- Display biometric progression across Bloom levels
- Show current HRV coherence, ASSR PLV, global synchrony, defect density
- Display Community Commons enhanced gate eligibility
- Show session history

**MVP Features:**
- Current Bloom level summary (4 metric cards)
- Bloom progression chart (biometric data per level)
- Commons gate eligibility checker (5 requirements)
- "What These Metrics Mean" explainer section

**Already implemented.** No additional work needed for MVP.

#### 6. Safety Monitoring Dashboard (Real-Time)

**File:** `components/neuropod/SafetyMonitoringDashboard.tsx` (NEW)

**Responsibilities:**
- Real-time safety risk score display (0-1 scale, color-coded)
- HRV coherence live graph (updates every 5 seconds)
- Manual "I need to stop" button (sets risk score to 1.0)
- Auto-stop notification (if risk score >0.85)

**MVP Version (Simple UI):**
```typescript
export default function SafetyMonitoringDashboard({ sessionId }: { sessionId: string }) {
  const [riskScore, setRiskScore] = useState(0);
  const [hrvCoherence, setHrvCoherence] = useState(0);

  // WebSocket connection to Raspberry Pi
  useEffect(() => {
    const ws = new WebSocket('ws://neuropod.local:8080/session-monitor');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRiskScore(data.safetyRiskScore);
      setHrvCoherence(data.hrvCoherence);
    };
    return () => ws.close();
  }, []);

  const riskColor = riskScore < 0.3 ? 'green' : riskScore < 0.6 ? 'yellow' : riskScore < 0.85 ? 'orange' : 'red';

  return (
    <div>
      <h2>Safety Monitoring</h2>

      {/* Risk Score */}
      <div className={`risk-score bg-${riskColor}-900/30 border-${riskColor}-500/30`}>
        <span>Safety Risk Score: {riskScore.toFixed(2)}</span>
      </div>

      {/* HRV Coherence */}
      <div>HRV Coherence: {(hrvCoherence * 100).toFixed(0)}%</div>

      {/* Manual Stop Button */}
      <button onClick={() => fetch('/api/neuropod/stop-session', { method: 'POST', body: JSON.stringify({ sessionId }) })}>
        I Need to Stop
      </button>
    </div>
  );
}
```

---

## Database MVP (Schema Already Created)

**Tables (from Option 1 migration):**
1. `user_health_profile` — Medical exclusions ✅
2. `user_membership` — Tier system ✅
3. `bloom_biometric_validation` — Biometric progression ✅
4. `neuropod_protocol_definitions` — 16 protocol definitions ✅
5. `neuropod_vibroacoustic_sessions` — Session tracking ✅
6. `neuropod_archetypal_sessions` — Archetypal templates ✅

**No additional database work needed for MVP.**

**Seed Data Required:**
- Insert 6 Tier 1 protocol definitions into `neuropod_protocol_definitions`
- Insert 100 Pioneer user records into `user_membership` (tier='pioneer')

---

## Pioneer Circle Onboarding Flow (User Journey)

### Week 1: Application & Selection

1. **Application Form** (Google Form / Typeform)
   - Bloom level self-assessment
   - Health screening (psychosis, seizure, pregnancy, pacemaker, etc.)
   - Technical comfort (hardware assembly, beta software)
   - Research participation consent
   - Intention for joining Pioneer Circle

2. **Selection Process** (Manual review)
   - Criteria: Bloom 3+, stable field, evidence-oriented, technical comfort, clear intention
   - Notifications: February 15, 2026 (100 selected, 900+ rejected with waitlist offer)

3. **Payment & Onboarding** (Stripe integration)
   - Charge first 3 months ($237 upfront)
   - Send welcome email (hardware shipping ETA, Slack invite, setup guide)

### Week 2-4: Hardware Assembly

4. **Hardware Kit Shipping** (March 1-31, 2026)
   - FedEx/UPS tracked shipping (3-5 days)
   - Packing: Custom-branded box, assembly instructions booklet, component bags

5. **Assembly Process** (User self-guided, 3-4 hours)
   - Follow printed instructions booklet
   - Watch video tutorial (YouTube, 15 min)
   - Join Pioneer Circle Slack for troubleshooting

6. **Setup Verification** (Automated test)
   - Run "System Test" protocol (5 min)
   - Verifies: Raspberry Pi online, Bluetooth connected, transducers vibrating, Polar H10 paired
   - Green checkmark = ready for first session

### Week 5: First Session

7. **Health Screening** (Web form)
   - Complete medical exclusion questionnaire
   - Sign informed consent waiver
   - Tier eligibility determined (should be Tier 1 + Tier 2 for Pioneers)

8. **First Protocol: Breath-Paced Grounding** (15 min)
   - Pre-session: "Name three things you can feel right now."
   - Session: Breath-synced haptics + HRV biofeedback
   - Post-session: HRV coherence score displayed
   - Rating: "Grounded, Calm, Clear, Overwhelmed, Spacey."

9. **Bloom Biometric Dashboard** (Web app)
   - View first session results
   - See HRV coherence score
   - Track toward Community Commons enhanced gate requirements

### Week 6+: Ongoing Practice

10. **Weekly Practice** (3-5 sessions/week)
    - Try different Tier 1 protocols
    - Unlock Tier 2 protocols (if Bloom 3+ and stable field confirmed)
    - Participate in validation experiments (VAL-001, VAL-002, VAL-003)

11. **Monthly Pioneer Circle Calls** (First Wednesday, 1 hour)
    - Product updates, feedback sessions, Q&A
    - Direct input to development roadmap

12. **Biometric Progression Tracking**
    - Watch HRV coherence improve over 30 days
    - Reach Community Commons enhanced gate eligibility (Bloom 4+, 5+ sessions, HRV >0.55, PLV >0.3)

---

## MVP Success Metrics

### Technical Metrics (Must-Hit for Launch)

**Hardware:**
- Assembly success rate: >90% (Pioneers complete assembly without support ticket)
- Hardware failure rate: <5% (transducers, Raspberry Pi, Polar H10)
- Bluetooth pairing success: >95% (amplifier, Polar H10)

**Software:**
- Session completion rate: >85% (Pioneers complete 15-min protocol without crash)
- HRV coherence calculation accuracy: ±5% vs. clinical-grade (validation against Kubios or HeartMath)
- Safety auto-stop false positive rate: <2% (shouldn't stop sessions unless real risk)

**User Experience:**
- Average assembly time: <4 hours (self-reported survey)
- First session completion: >80% within Week 5
- Net Promoter Score (NPS): >40 (after 30 days)

### Validation Metrics (Phase 1 Experiments)

**VAL-001: Breath-Paced HRV Coherence (Months 4-6)**
- Recruitment: 30 Pioneers volunteer
- Completion rate: >80% (24/30 complete both conditions)
- Hypothesis supported: p < 0.05, Cohen's d ≥ 0.6

**VAL-002: Vibroacoustic Stress Reduction (Months 7-9)**
- Recruitment: 40 Pioneers volunteer
- Completion rate: >75% (30/40 complete both conditions)
- Hypothesis supported: p < 0.05, effect size ≥ 15% GSR reduction

**VAL-003: Vibroacoustic Sleep Prep (Months 10-12)**
- Recruitment: 25 Pioneers volunteer
- Completion rate: >80% (20/25 complete ABAB crossover)
- Hypothesis supported: p < 0.05, sleep quality ↑ ≥ 0.7 points

### Business Metrics (Revenue & Retention)

**Revenue:**
- 100 Pioneers × $79/mo × 12 months = $94,800/year (Year 1)
- Churn rate: <10%/year (Pioneers stay for lifetime price lock)

**Retention:**
- 30-day retention: >85% (Pioneers still active after Month 1)
- 6-month retention: >70% (Pioneers still active after Month 6)

**Referrals:**
- Average referrals per Pioneer: 2-3 (over 12 months)
- Referral conversion rate: 30% (of referrals become Explorer members)

---

## MVP Build Timeline (10 Weeks)

### Week 1-2: Hardware Procurement & Testing

**Tasks:**
- Order 110 kits (100 Pioneers + 10 dev/test units)
- Assemble 10 test units (internal QA)
- Write assembly instructions booklet (v1)
- Record video tutorial (v1)

**Deliverable:** 10 functional test units, assembly documentation complete

### Week 3-4: Software Core Development

**Tasks:**
- Build Protocol Execution Engine (Python, 6 Tier 1 protocols)
- Build Biometric Pipeline (HRV calculation, safety monitoring)
- Build Session Orchestrator (pre/during/post session flow)
- Build Safety Monitoring Dashboard (React, real-time WebSocket)

**Deliverable:** End-to-end session execution working on test unit

### Week 5-6: MAIA Cloud Integration

**Tasks:**
- Build session sync API (`/api/neuropod/session-sync`)
- Wire Bloom Biometric Dashboard to real data
- Implement Community Commons enhanced gate eligibility check
- Test offline mode (sessions work without internet, sync when online)

**Deliverable:** Full integration between Raspberry Pi and MAIA cloud

### Week 7-8: Pioneer Circle Onboarding Infrastructure

**Tasks:**
- Build application form (Google Form / Typeform)
- Build selection process (manual review, 100 slots)
- Build Stripe payment integration (3-month upfront)
- Build welcome email sequence (Mailchimp / SendGrid)
- Create Pioneer Circle Slack workspace

**Deliverable:** Onboarding flow ready for February 15 selections

### Week 9: Internal Beta Testing

**Tasks:**
- 5 internal testers assemble hardware from instructions
- 5 internal testers complete first session (Breath-Paced Grounding)
- Collect feedback, iterate on instructions, fix bugs

**Deliverable:** MVP validated with internal testers

### Week 10: Hardware Assembly & Shipping Prep

**Tasks:**
- Assemble 100 Pioneer kits (outsource to assembly house or DIY)
- Flash 100 microSD cards with Neuropod OS image
- Pack kits, print labels, schedule FedEx pickup

**Deliverable:** 100 kits ready to ship March 1

---

## Post-MVP Roadmap (Months 4-12)

### Month 4: VAL-001 Launch

- 30 Pioneers recruited for HRV coherence validation
- Within-subjects design (breath pacing vs. breath pacing + vibroacoustic)
- Data collection: 30 Pioneers × 2 sessions = 60 sessions
- Analysis: t-test, Cohen's d calculation

### Month 7: VAL-002 Launch

- 40 Pioneers recruited for stress reduction validation
- Between-subjects design (vibroacoustic vs. nature sounds control)
- Data collection: 40 Pioneers × 1 session = 40 sessions
- Analysis: independent samples t-test

### Month 10: VAL-003 Launch

- 25 Pioneers recruited for sleep prep validation
- ABAB crossover design (4 nights per Pioneer)
- Data collection: 25 Pioneers × 4 nights = 100 nights
- Analysis: repeated measures ANOVA

### Month 12: Validation Results Published

- 3 experiments complete
- Statistical analysis complete
- Community Commons post-mortem (what worked, what didn't)
- Peer-reviewed publication submission (target: Q1 2026)

### Month 13+: Public Launch

- Open Explorer tier ($29/mo)
- Open Foundation tier (free, Tier 1 only)
- Publish validation results (positive or negative)
- Broader marketing (podcasts, conferences)

---

## Risk Mitigation

### Risk 1: Hardware Assembly Too Complex

**Mitigation:**
- Detailed video tutorial (15 min, step-by-step)
- Pioneer Circle Slack for real-time troubleshooting
- Weekly office hours calls (live support)
- Offer optional "pre-assembled" upgrade ($100 fee)

### Risk 2: Bluetooth Pairing Failures

**Mitigation:**
- Pre-pair amplifier and Polar H10 during kit assembly (factory config)
- Automated pairing script (one-click setup)
- Fallback: Wired audio connection (3.5mm aux cable included)

### Risk 3: HRV Calculation Inaccuracy

**Mitigation:**
- Validate against clinical-grade tools (Kubios, HeartMath)
- Use open-source libraries (HRV-analysis Python package)
- Publish calculation methodology (transparency)

### Risk 4: Safety Auto-Stop False Positives

**Mitigation:**
- Conservative thresholds (0.85 = red, not 0.6)
- Manual override ("Continue session" button after auto-stop)
- Log all auto-stop events for analysis

### Risk 5: Validation Experiments Fail (p > 0.05)

**Mitigation:**
- Pre-registered hypotheses (can't p-hack after data collection)
- Publish negative results (transparency > hype)
- Revise protocols based on data, re-validate if necessary
- Worst case: Refund Pioneers (12 months subscription) if Neuropod discontinued

---

## Budget for MVP (Months 1-3)

**Hardware (100 kits @ $180 cost):** $18,000
- Components: $180/kit × 100 = $18,000
- Shipping: Included in Stripe processing fees

**Software Development:**
- Protocol Execution Engine: $8k (80 hours @ $100/hr, contract developer)
- Biometric Pipeline: $6k (60 hours, contract developer)
- MAIA Cloud Integration: $4k (40 hours, internal dev)
- **Total software:** $18,000

**Onboarding Infrastructure:**
- Stripe integration: $2k
- Email sequences (Mailchimp): $500
- Slack workspace (free tier): $0
- **Total onboarding:** $2,500

**Documentation & Support:**
- Assembly instructions booklet (design + print): $1,500
- Video tutorial (filming + editing): $2,000
- Pioneer Circle office hours (4 hours/week × 12 weeks @ $100/hr): $4,800
- **Total documentation:** $8,300

**Contingency (10%):** $4,680

**Total MVP Budget:** $51,480

**Funding Source:** Seed round ($250k), allocated to Months 1-3 MVP development.

---

## Definition of Done

**MVP is complete when:**

1. ✅ 100 Pioneer kits assembled and shipped (March 1-31, 2026)
2. ✅ 80+ Pioneers complete first session successfully (within 5 weeks of kit receipt)
3. ✅ Bloom Biometric Dashboard displaying real session data
4. ✅ Community Commons enhanced gate eligibility checking working
5. ✅ Safety monitoring auto-stop tested and functional (no false positives >2%)
6. ✅ Validation experiment recruitment launched (VAL-001 scheduled for Month 4)
7. ✅ NPS >40 (30-day survey after first session)
8. ✅ Churn rate <10% (Pioneers still subscribed after Month 3)

**At this point, we proceed to Phase 2: Controlled Launch (Explorer tier, validation experiments).**

---

## Appendix: MVP Checklist

### Hardware Checklist

- [ ] 110 kits ordered (100 Pioneers + 10 dev/test)
- [ ] 10 test units assembled internally
- [ ] Assembly instructions booklet written (v1)
- [ ] Video tutorial recorded (15 min, step-by-step)
- [ ] 100 microSD cards flashed with Neuropod OS image
- [ ] 100 kits packed, labeled, ready to ship

### Software Checklist

- [ ] Protocol Execution Engine (6 Tier 1 protocols working)
- [ ] Biometric Pipeline (HRV calculation, safety monitoring)
- [ ] Session Orchestrator (pre/during/post session flow)
- [ ] Safety Monitoring Dashboard (real-time WebSocket)
- [ ] MAIA Cloud session sync API (`/api/neuropod/session-sync`)
- [ ] Bloom Biometric Dashboard wired to real data
- [ ] Community Commons enhanced gate eligibility checker

### Onboarding Checklist

- [ ] Application form (Google Form / Typeform)
- [ ] Selection process (manual review, 100 slots)
- [ ] Stripe payment integration (3-month upfront)
- [ ] Welcome email sequence (Mailchimp / SendGrid)
- [ ] Pioneer Circle Slack workspace created
- [ ] Health screening web form (medical exclusions, informed consent)

### Testing Checklist

- [ ] 10 internal testers assemble hardware (success rate >90%)
- [ ] 10 internal testers complete first session (completion rate >80%)
- [ ] HRV calculation validated against clinical-grade tool (±5% accuracy)
- [ ] Safety auto-stop tested (false positive rate <2%)
- [ ] Offline mode tested (sessions work without internet)

### Documentation Checklist

- [ ] Assembly instructions booklet (printed, 10 pages)
- [ ] Video tutorial (YouTube, 15 min)
- [ ] Troubleshooting guide (online wiki)
- [ ] Health screening questionnaire (web form)
- [ ] Informed consent waiver (legal review complete)

**MVP is GO when all checklist items are complete.**

---

**Neuropod Demo & MVP Scope Document**
**Version 1.0 | December 2025**
