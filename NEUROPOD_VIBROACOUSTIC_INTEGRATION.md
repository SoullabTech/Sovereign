# Neuropod Vibroacoustic Integration
## Evidence-Based Haptic State Support (Without the "Digital DMT" Fantasy)

**Author:** Soullab Consciousness Computing Team
**Date:** December 2024
**Status:** Implementation Ready
**Integration:** Neuropod v0 Hardware + Protocol Library + Safety Architecture

---

## Executive Summary (1 Page)

### What We're NOT Building
❌ "Digital DMT breakthrough simulator"
❌ "Guaranteed mystical experiences"
❌ "Frequency-based healing of trauma/depression/anxiety"
❌ Open-ended exploration without safety rails

### What We ARE Building
✅ **Vibroacoustic state support platform** for measurable arousal regulation, attention reorganization, and somatic coherence
✅ **Closed-loop biometric adaptation** (HRV, breath, EEG) with real-time safety monitoring
✅ **Evidence-grounded protocols** starting with stress reduction and sleep enhancement (strongest research base)
✅ **Reality-testing framework** preventing dissociative overwhelm and magical thinking
✅ **Experimental rigor** to validate claims in our own user population

### Core Mechanism (Non-Woo Version)
Vibroacoustic stimulation (low-frequency vibration + patterned haptics + audio) can modulate:
- **Interoception** (body-sense + autonomic appraisal)
- **Somatosensory rhythm coupling** (nervous system entrains to periodic input)
- **Breath/HRV coupling** (especially when paired with paced breathing)
- **Attentional capture** (rhythmic inputs reorganize salience patterns)

**Result:** Shift in arousal, attentional binding, and bodily coherence → opens space for emergent phenomenology (calm, clarity, receptivity, etc.)

### Evidence Anchors
1. **Stress Reduction (Moderate Evidence):** Controlled study shows low-frequency sound vibration modulates acute stress markers in university students
2. **Sleep Enhancement (Strong Evidence):** Phase-locked acoustic stimulation (CLAS) consistently improves slow-wave sleep metrics
3. **Clinical Exploration:** Vibroacoustic music therapy being tested in ICU settings for postoperative delirium (shows mainstream medical interest)

### Safety-First Design
**Three-Layer Protection:**
1. **Pre-screening exclusions** (psychosis history, seizure disorders, severe PTSD without clinical oversight)
2. **Reality-testing loop** (before/during/after sessions: grounding checks, meaning deferral, integration prompts)
3. **Hardware + protocol safety caps** (intensity limits, session duration limits, sacred stop button)

### Neuropod v0 Vibroacoustic Module Spec
- **Hardware:** Vibroacoustic transducers (bed/chair-mounted), haptic pulse generators, audio system
- **Frequency palette:** 20-40 Hz, 40-80 Hz, 80-120 Hz (low-frequency focus, conservative)
- **Session architecture:** 5-15 minute blocks, breath-paced, HRV-gated progression
- **Closed-loop control:** Real-time adaptation based on coherence tracker + safety predictor
- **Data collection:** HRV, respiration, EDA, peripheral temp, EEG (if available), subjective state scales

### Timeline & Validation
- **Phase 1 (Months 1-3):** Hardware build + safety validation + protocol library v1
- **Phase 2 (Months 4-9):** Within-subject crossover experiments (N=30-50 users)
- **Phase 3 (Months 10-12):** Refine protocols based on data, expand state taxonomy
- **Budget estimate:** $85,000-$120,000 (hardware, experiments, analysis)

---

## Part 1: Research Evidence Base

### What the Science Actually Supports

#### 1. Low-Frequency Vibroacoustic Stimulation → Stress Reduction
**Study:** Effect of low-frequency sound vibration on acute stress response in university students (pilot RCT)
**Finding:** Low-frequency sound stimulation can modulate acute stress markers and subjective stress ratings
**Evidence Level:** Moderate (small sample, needs replication)
**Implication for Neuropod:** Stress downregulation is a plausible first target with trackable endpoints (HRV, EDA, subjective ratings)

**What We Can Claim:**
- "Low-frequency vibroacoustic stimulation has been studied for stress reduction in controlled settings"
- "Some users may experience relaxation or stress relief; effects vary by individual"
- "We measure HRV and coherence to validate whether the protocol is working for you"

**What We Cannot Claim:**
- "Guaranteed stress relief"
- "Treatment for anxiety disorders"
- "Works for everyone"

---

#### 2. Phase-Locked Acoustic Stimulation (CLAS) → Sleep Enhancement
**Study:** Multiple RCTs showing CLAS increases slow-wave activity by 20-40%
**Mechanism:** Phase-locked pink noise bursts delivered during slow oscillation up-states
**Evidence Level:** Strong (FDA-cleared devices, multi-night home use validated)
**Implication for Neuropod:** Closed-loop acoustic stimulation is the gold standard for "frequency → measurable state change"

**What We Can Claim:**
- "Our closed-loop approach is inspired by FDA-cleared CLAS devices used for sleep enhancement"
- "Phase-locked stimulation has stronger evidence than random-timing protocols"
- "We adapt stimulation in real-time based on your biometric response"

**What We Cannot Claim:**
- "Digital DMT"
- "Treats sleep disorders" (medical claim)
- "Psychedelic-equivalent experiences"

---

#### 3. Vibroacoustic Music Therapy → Clinical Exploration
**Study:** Ongoing RCT protocol testing vibroacoustic music therapy for ICU delirium
**Evidence Level:** Emerging (protocols registered, results pending)
**Implication for Neuropod:** Even conservative clinical settings consider vibroacoustics plausible enough to test at scale

**What This Validates:**
- Vibroacoustic stimulation is real enough to be studied in serious medical contexts
- The mechanism (nervous system modulation via patterned sound/vibration) is scientifically credible
- Safety can be managed with appropriate screening and monitoring

---

#### 4. Mechanisms: Why Vibration ≠ "Just Sound"
Vibroacoustic stimulation is **mechanical input** carried through:
- **Skin, fascia, bone conduction** (somatosensory pathways)
- **Vestibular system** (if low-frequency enough to affect balance/motion sense)
- **Interoceptive pathways** (vagal afferents, autonomic appraisal)

**Result:** Multi-modal nervous system engagement that audio alone doesn't provide

**Key Insight (McGilchrist-Adjacent):**
Vibroacoustic input can **shift attentional binding** (what the brain prioritizes as salient). This reorganization of attention creates space for emergent phenomenology—but the phenomenology is **user-specific, context-dependent, and meaning-laden** (not a deterministic frequency → experience mapping).

---

## Part 2: Neuropod v0 Build Spec (Do/Don't)

### DO: State Support Architecture

#### Core Design Principles
1. **Start with downregulation/stabilization targets** (stress reduction, grounding, calm focus)
2. **Closed-loop biometric control** (HRV, breath, EEG) drives intensity/pacing
3. **Conservative frequency palette** (20-120 Hz low-frequency range)
4. **Short session blocks** (5-15 minutes) with clear stop controls
5. **Reality-testing integration** (pre/during/post grounding checks)

#### Hardware Components
**Vibroacoustic Transducers:**
- Bed/chair-mounted bass shakers (e.g., Dayton Audio BST-1, Clark Synthesis tactile transducers)
- Frequency range: 20-200 Hz (focus on 20-120 Hz for v0)
- Amplitude control: 0-100% PWM or analog gain
- Safety cap: **0.75 max amplitude** (1.5g acceleration max for comfort)

**Haptic Pulse Generators:**
- Micro vibrotactile actuators (e.g., Precision Microdrives haptic motors)
- Placement: wrists, temples, lower back (somatic "attention shepherds")
- Pattern library: pulsed (breath-paced), continuous (grounding), modulated (entrainment)
- Safety cap: **0.6 max amplitude** (gentle, non-startling)

**Audio System:**
- High-fidelity speakers or headphones
- Content: music, nature sounds, binaural beats, pink noise
- Safety cap: **85 dB SPL max** (OSHA safe)

**Biometric Sensors:**
- HRV (chest strap or PPG)
- Respiration (belt or derived from PPG)
- EDA (galvanic skin response)
- Peripheral temperature (optional)
- EEG (if available: coherence tracking, ASSR validation)

#### Software Architecture
**Integration Points:**
- `coherenceTracker.ts`: Real-time EEG → coherence metrics
- `safetyPredictor.ts`: Overwhelm prediction (30-60s warning)
- `psychoactivationEngine.ts`: Closed-loop output generation
- `protocolLibrary.ts`: Vibroacoustic protocol definitions (NEW)
- `stateLibrary.ts`: Target states for vibroacoustic sessions

**Control Loop (10 Hz tick rate):**
```
1. Read biometrics (HRV, breath, EEG)
2. Compute coherence snapshot (if EEG available)
3. Predict safety status (risk score, time to overwhelm)
4. Adapt vibroacoustic output (frequency, amplitude, pattern)
5. Log data for validation
6. Check stop conditions (user request, safety threshold)
```

---

### DON'T: Anti-Patterns to Avoid

#### ❌ Open-Ended "Wind-Up" Without Safety Rails
**Bad:** Intensity ramps continuously until user says stop
**Good:** Intensity capped at protocol-specific max, pauses at plateaus for biometric stabilization

#### ❌ "Breakthrough" Framing Without Reality Testing
**Bad:** "Let's see how deep you can go!"
**Good:** "Today's session supports [calm/clarity/receptivity]. We'll track your nervous system response and adjust."

#### ❌ Frequency Mysticism ("432 Hz Opens the Heart")
**Bad:** Marketing claims about specific frequencies having universal effects
**Good:** "Some users report [phenomenology] with [protocol]. We'll measure your response to see if it works for you."

#### ❌ Ignoring Dissociation Risk
**Bad:** No pre-screening for psychosis/mania history, no reality-testing loop
**Good:** Explicit exclusion criteria + before/after grounding checks + "meaning is optional" rule

#### ❌ Letting the Tool Become an Oracle
**Bad:** "The vibration revealed my childhood wound"
**Good:** "Interesting experience. Let's log the phenomenology first, and integrate the meaning over the next week—not during the session."

---

## Part 3: Reality-Testing Protocol (Safety Spine)

### A. Pre-Screening (Minimum Viable Safety)

#### Red Flag Exclusions (Require Clinical Oversight or Exclude)
- **Psychosis/Mania:** History of psychotic episodes, bipolar I with mania, active delusions/hallucinations
- **Severe Dissociation:** DID, DPDR with instability, trauma-triggered dissociative episodes
- **Seizure Disorders:** Uncontrolled epilepsy, photosensitive seizures, audio-sensitive seizures
- **Severe PTSD:** Complex PTSD with somatic flashbacks triggered by vibration/sound (unless trauma-informed protocol)
- **Pregnancy:** First trimester or high-risk pregnancy (mechanical vibration safety unknown)

#### Yellow Flag Cautions (Proceed with Modified Protocol)
- **Moderate anxiety/depression:** Start with gentler protocols, shorter sessions
- **Neurodivergence (autism, ADHD):** Sensory sensitivities may require customized intensity
- **Chronic pain conditions:** Vibration may increase pain in some cases (trial carefully)

#### Pre-Session Questionnaire
```
1. Have you experienced psychosis, mania, or severe dissociation? [Y/N]
2. Do you have a seizure disorder or sensitivity to flashing lights/sounds? [Y/N]
3. Are you currently pregnant? [Y/N]
4. Do you have PTSD or trauma history with somatic triggers? [Y/N]
5. Rate your current state:
   - Arousal (0-10): ___ (0=calm, 10=panic)
   - Groundedness (0-10): ___ (0=dissociated, 10=fully present)
   - Safety (0-10): ___ (0=unsafe, 10=completely safe)
```

---

### B. Before Session (2 Minutes): Grounding + Intent

#### Reality-Testing Baseline
**"What's true right now?" (3 facts):**
1. Where am I? (physical location)
2. What date is it? (temporal orientation)
3. Why am I here? (purpose: "to practice calm," not "to have a mystical experience")

#### Subjective State Ratings (0-10 scales)
- **Arousal:** How activated/anxious do you feel?
- **Groundedness:** How present/connected to your body?
- **Safety:** How safe does this environment feel?
- **Clarity:** How clear is your thinking?

#### Intent Declaration (Anti-Magical-Thinking)
"Today's session is for [regulation/clarity/rest], not for visions or revelations. If interesting phenomenology arises, I'll log it first and interpret later."

---

### C. During Session: Sacred Stop + Intensity Gating

#### User Controls (Always Available)
- **Stop button** (physical + on-screen): Immediate fade to neutral (10-second ramp down)
- **Intensity dial** (optional): User can request gentler stimulation at any time
- **Grounding anchor** (visual): "You are in the Neuropod. This is a session. You are safe."

#### Closed-Loop Safety Checks (Automated)
Every 60 seconds, check:
1. **HRV coherence:** If drops below baseline - 20%, reduce intensity
2. **Respiration rate:** If >20 breaths/min sustained, shift to slower breath pacing
3. **EDA spikes:** If large arousal spike detected, pause stimulation for 30s
4. **Safety predictor risk score:** If >0.6, reduce intensity; if >0.85, stop session

#### The "Slower Breath, Softer Vibration" Rule
**If intensity rises (subjective distress or biometric dysregulation):**
- Do NOT add more stimulus
- Shift to slower breath pacing (4-6 breaths/min)
- Reduce vibroacoustic amplitude by 30%
- Extend grounding phase

---

### D. After Session (5-10 Minutes): Re-Orientation + Integration

#### Re-Orient to Consensus Reality (5 Concrete Facts)
Name aloud:
1. One thing you can see
2. One thing you can hear
3. One thing you can touch
4. Where you are
5. What you'll do in the next hour

#### "Meaning is Optional" Rule
**Log phenomenology first, interpretation later:**
- What did you feel/sense/experience? (descriptive, sensory)
- What meaning does it seem to have? (optional, flagged as interpretation)
- What would be good medicine in the next 24 hours? (integration action)

**Prohibited:**
- Declaring certainty about "what the vibration revealed"
- Making major life decisions within 24 hours of session
- Spiritual bypassing ("I'm healed now, I don't need therapy")

#### Subjective State Ratings (Post-Session)
Same 0-10 scales as pre-session:
- Arousal, Groundedness, Safety, Clarity
- **Delta scores** tracked for protocol validation

#### Integration Prompt
"What small action in the next 24-48 hours would honor what emerged today?"
(Focus: grounded, behavioral, reversible—not "quit my job because the vibration told me to")

---

## Part 4: Protocol Library (Vibroacoustic Additions)

### Protocol 1: Breath-Paced Vibroacoustic Grounding

**Evidence Level:** Moderate (HRV coherence + breath pacing well-studied; vibroacoustic addition experimental)

**Target State:** GROUNDED (from stateLibrary.ts)

**Mechanism:**
- Breath pacing at 5.5 breaths/min (resonant frequency for HRV coherence)
- Vibroacoustic pulse synchronized to breath (inhale: 20 Hz gentle; exhale: 40 Hz soothing)
- Audio: nature soundscape (forest/ocean)
- Haptic: wrist pulses match breath timing

**Stimulus Spec:**
```typescript
{
  audio: {
    carrierLeft: 200,
    carrierRight: 200,  // No binaural beat
    amplitude: 0.4,
    soundscape: 'forest'
  },
  vibroacoustic: {
    frequency: 30,      // Low-frequency grounding
    amplitude: 0.5,
    pattern: 'breath-paced',  // Sync to respiration sensor
    phase: 'exhale-emphasis'  // Stronger pulse on exhale
  },
  haptic: {
    frequency: 0.09,    // 5.5 breaths/min = 0.09 Hz
    amplitude: 0.3,
    pattern: 'breath-pulse',
    locations: ['wrists']
  }
}
```

**Expected Biometric Changes:**
- HRV coherence: ↑ 0.15-0.25 (strong effect)
- Respiration rate: ↓ to ~5.5 breaths/min (if user follows pacing)
- EDA: ↓ 10-20% (parasympathetic activation)
- Subjective groundedness: ↑ 1-2 points (0-10 scale)

**Validation Criteria:**
- **Primary metric:** HRV coherence ratio
- **Expected delta:** +0.18 (Cohen's d ≈ 0.6, medium-large effect)
- **Null hypothesis:** Vibroacoustic + breath pacing does not increase HRV coherence more than breath pacing alone

**Safety:**
- Max duration: 15 minutes
- Exclusions: None (safe for most users)
- Risk thresholds: Standard (yellow 0.3, orange 0.6, red 0.85)

**Marketing Claim:**
"Breath-paced vibroacoustic stimulation, combined with HRV biofeedback, has been studied for stress reduction and nervous system regulation."

---

### Protocol 2: Low-Frequency Vibroacoustic Stress Reduction

**Evidence Level:** Moderate (based on university student stress reduction study)

**Target State:** CALM (from stateLibrary.ts)

**Mechanism:**
- Low-frequency vibroacoustic stimulation (30-50 Hz range)
- Gentle amplitude, no sudden changes
- Audio: ambient music or pink noise
- Session: 10-minute plateau (no wind-up)

**Stimulus Spec:**
```typescript
{
  audio: {
    carrierLeft: 150,
    carrierRight: 150,
    amplitude: 0.35,
    soundscape: 'ambient-music'
  },
  vibroacoustic: {
    frequency: 40,      // Mid-low range (based on stress study)
    amplitude: 0.45,
    pattern: 'continuous',
    modulation: 'none'  // Steady, no ramps
  },
  haptic: {
    frequency: 8,       // Slow theta-range pulse
    amplitude: 0.25,
    pattern: 'pulsed-gentle',
    locations: ['lower-back']
  }
}
```

**Expected Biometric Changes:**
- EDA: ↓ 15-25% (stress marker reduction)
- Heart rate: ↓ 3-7 bpm
- Subjective stress: ↓ 1.5-2.5 points (0-10 scale)
- Alpha power (EEG): ↑ 0.10-0.15 (if EEG available)

**Validation Criteria:**
- **Primary metric:** EDA (electrodermal activity)
- **Expected delta:** -18% (stress reduction)
- **Null hypothesis:** Low-frequency vibroacoustic does not reduce stress markers more than matched music alone

**Safety:**
- Max duration: 15 minutes
- Exclusions: Severe anxiety (may paradoxically increase arousal in some users—trial carefully)
- Risk thresholds: Standard

**Marketing Claim:**
"Low-frequency vibroacoustic stimulation has shown promise in pilot studies for acute stress reduction in university students."

---

### Protocol 3: Vibroacoustic Sleep Preparation (CLAS-Inspired)

**Evidence Level:** Strong (inspired by phase-locked CLAS research, adapted for pre-sleep)

**Target State:** CONSOLIDATION (from stateLibrary.ts)

**Mechanism:**
- Phase-locked vibroacoustic pulses during drowsy state (not full CLAS, but inspired)
- Low-frequency (20-30 Hz) gentle vibration
- Audio: slow ambient drone or silence
- Session: 20 minutes before sleep

**Stimulus Spec:**
```typescript
{
  audio: {
    carrierLeft: 100,
    carrierRight: 100,
    amplitude: 0.25,
    soundscape: 'silence-or-drone'
  },
  vibroacoustic: {
    frequency: 25,      // Low delta-range
    amplitude: 0.35,
    pattern: 'phase-locked',  // If EEG available; else gentle pulsed
    modulation: 'slow-oscillation-sync'
  },
  haptic: {
    frequency: 1,       // 1 Hz slow pulse
    amplitude: 0.2,
    pattern: 'delta-sync',
    locations: ['lower-back']
  }
}
```

**Expected Biometric Changes (Next Night):**
- Slow-wave sleep: ↑ 10-20% (if full CLAS implemented; lower for v0)
- Sleep onset latency: ↓ 5-10 minutes
- Subjective sleep quality: ↑ 0.5-1.0 points (0-10 scale)

**Validation Criteria:**
- **Primary metric:** Slow-wave sleep percentage (requires sleep staging EEG)
- **Expected delta:** +12% (if full closed-loop; +5% for open-loop v0)
- **Null hypothesis:** Vibroacoustic pre-sleep protocol does not improve sleep metrics more than silence

**Safety:**
- Max duration: 30 minutes
- Exclusions: Sleep disorders requiring medical treatment (sleep apnea, narcolepsy)
- Risk thresholds: Conservative (no high-intensity stimulation near sleep)

**Marketing Claim:**
"Our sleep preparation protocol is inspired by closed-loop acoustic stimulation (CLAS) research, which has demonstrated measurable improvements in slow-wave sleep."

---

### Protocol 4: Vibroacoustic Attention Reset (Flow Prep)

**Evidence Level:** Weak-to-Emerging (extrapolated from attention/flow research + vibroacoustic stress reduction)

**Target State:** CLARITY → FLOW (from stateLibrary.ts)

**Mechanism:**
- Brief (5 min) high-coherence vibroacoustic session
- Moderate frequency (40-60 Hz)
- Transitions from grounding → clarity → readiness
- Audio: rhythmic, structured (not chaotic)

**Stimulus Spec:**
```typescript
{
  audio: {
    carrierLeft: 200,
    carrierRight: 240,  // 40 Hz binaural beat (focus/gamma)
    amplitude: 0.5,
    soundscape: 'structured-rhythm'
  },
  vibroacoustic: {
    frequency: 50,      // Mid-range, alerting
    amplitude: 0.5,
    pattern: 'rhythmic-pulse',
    modulation: 'gentle-crescendo'  // Gradual increase over 3 min, then plateau
  },
  haptic: {
    frequency: 40,      // Gamma-range haptic pulse
    amplitude: 0.35,
    pattern: 'focus-pulse',
    locations: ['wrists', 'temples']
  }
}
```

**Expected Biometric Changes:**
- Beta/gamma power: ↑ 0.08-0.12 (alertness)
- HRV: Neutral or slight decrease (appropriate arousal increase)
- Subjective clarity: ↑ 1-2 points
- Task readiness: Improved (post-session behavioral test)

**Validation Criteria:**
- **Primary metric:** Post-session task performance (attention/accuracy)
- **Expected delta:** 10-15% improvement on sustained attention task
- **Null hypothesis:** Vibroacoustic attention reset does not improve task performance more than brief break alone

**Safety:**
- Max duration: 10 minutes
- Exclusions: Anxiety disorders (may over-activate)
- Risk thresholds: Standard

**Marketing Claim:**
"Vibroacoustic stimulation combined with gamma-frequency binaural beats may support attention and mental clarity for some users."

---

### Protocol 5: Vibroacoustic Somatic Exploration (Advanced, High Screening)

**Evidence Level:** Experimental (extrapolated from somatic therapy + vibroacoustic phenomenology)

**Target State:** INTROSPECTIVE → RECEPTIVE (from stateLibrary.ts)

**Mechanism:**
- Open-ended vibroacoustic palette (20-80 Hz variable)
- User-controlled intensity dial
- Audio: minimal (silence or drone)
- Focus: interoceptive awareness, not breakthrough

**Stimulus Spec:**
```typescript
{
  audio: {
    carrierLeft: 120,
    carrierRight: 120,
    amplitude: 0.3,
    soundscape: 'silence'
  },
  vibroacoustic: {
    frequency: 'user-controlled',  // Variable 20-80 Hz
    amplitude: 'user-controlled',  // Max 0.65
    pattern: 'exploratory',
    modulation: 'responsive'  // Adapts to breath/HRV
  },
  haptic: {
    frequency: 'off',   // No haptic (full-body vibroacoustic only)
    amplitude: 0,
    pattern: 'none',
    locations: []
  }
}
```

**Expected Phenomenology:**
- Interoceptive awareness: ↑ (subjective)
- Emotional content may surface (not guaranteed, highly variable)
- Somatic release possible (tension/trembling)

**Validation Criteria:**
- **Primary metric:** Interoceptive Awareness Scale (pre/post)
- **Expected delta:** +5-10 points (subjective scale)
- **Null hypothesis:** Vibroacoustic somatic exploration does not increase interoceptive awareness more than quiet rest

**Safety:**
- **HIGH SCREENING REQUIRED**
- Exclusions: Psychosis, severe dissociation, unintegrated trauma
- Max duration: 20 minutes
- Reality-testing: Mandatory pre/post grounding
- Risk thresholds: Strict (yellow 0.25, orange 0.5, red 0.7)

**Marketing Claim:**
"Vibroacoustic somatic exploration is an experimental protocol for interoceptive awareness, available only to users with demonstrated grounding and integration capacity."

**Prohibited Claims:**
- "Releases trauma"
- "Guaranteed emotional breakthroughs"
- "Replaces therapy"

---

## Part 5: Data Schema (Reality-Testing Tables)

### Database Extension: Vibroacoustic Sessions

```sql
-- Vibroacoustic session configuration + outcomes
CREATE TABLE neuropod_vibroacoustic_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  protocol_id VARCHAR(100) NOT NULL,  -- e.g., 'breath-paced-grounding'

  -- Pre-session state
  pre_arousal INTEGER CHECK (pre_arousal >= 0 AND pre_arousal <= 10),
  pre_groundedness INTEGER CHECK (pre_groundedness >= 0 AND pre_groundedness <= 10),
  pre_safety INTEGER CHECK (pre_safety >= 0 AND pre_safety <= 10),
  pre_clarity INTEGER CHECK (pre_clarity >= 0 AND pre_clarity <= 10),

  -- Session configuration
  target_state VARCHAR(50),  -- e.g., 'CALM', 'GROUNDED', 'CLARITY'
  duration_seconds INTEGER,
  max_vibroacoustic_amplitude FLOAT,
  max_haptic_amplitude FLOAT,

  -- Real-time adaptation flags
  intensity_reduced_count INTEGER DEFAULT 0,
  emergency_stop_triggered BOOLEAN DEFAULT FALSE,
  user_stop_requested BOOLEAN DEFAULT FALSE,

  -- Post-session state
  post_arousal INTEGER CHECK (post_arousal >= 0 AND post_arousal <= 10),
  post_groundedness INTEGER CHECK (post_groundedness >= 0 AND post_groundedness <= 10),
  post_safety INTEGER CHECK (post_safety >= 0 AND post_safety <= 10),
  post_clarity INTEGER CHECK (post_clarity >= 0 AND post_clarity <= 10),

  -- Phenomenology (free text)
  phenomenology_description TEXT,
  meaning_interpretation TEXT,
  integration_action TEXT,

  -- Biometric summary
  avg_hrv_coherence FLOAT,
  avg_respiration_rate FLOAT,
  avg_eda FLOAT,
  peak_safety_risk_score FLOAT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_vibroacoustic_user ON neuropod_vibroacoustic_sessions(user_id);
CREATE INDEX idx_vibroacoustic_protocol ON neuropod_vibroacoustic_sessions(protocol_id);

-- Vibroacoustic biometric timeseries (detailed)
CREATE TABLE neuropod_vibroacoustic_timeseries (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES neuropod_vibroacoustic_sessions(session_id),
  timestamp TIMESTAMPTZ NOT NULL,

  -- Stimulus parameters (what we sent)
  vibroacoustic_frequency FLOAT,
  vibroacoustic_amplitude FLOAT,
  haptic_frequency FLOAT,
  haptic_amplitude FLOAT,
  audio_binaural_frequency FLOAT,

  -- Biometric response (what we measured)
  heart_rate FLOAT,
  hrv_rmssd FLOAT,
  hrv_coherence FLOAT,
  respiration_rate FLOAT,
  eda_microsiemens FLOAT,
  peripheral_temp_celsius FLOAT,

  -- EEG (if available)
  alpha_power FLOAT,
  theta_power FLOAT,
  beta_power FLOAT,
  gamma_power FLOAT,
  global_synchrony FLOAT,
  defect_density FLOAT,

  -- Safety monitoring
  safety_risk_score FLOAT,
  safety_recommendation VARCHAR(50)  -- 'proceed', 'reduce_intensity', 'pause', 'stop'
);

CREATE INDEX idx_vibroacoustic_ts_session ON neuropod_vibroacoustic_timeseries(session_id);
CREATE INDEX idx_vibroacoustic_ts_timestamp ON neuropod_vibroacoustic_timeseries(timestamp);

-- Reality-testing grounding checks
CREATE TABLE neuropod_reality_testing_checks (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES neuropod_vibroacoustic_sessions(session_id),
  check_type VARCHAR(20) NOT NULL,  -- 'pre', 'during', 'post'
  timestamp TIMESTAMPTZ NOT NULL,

  -- Grounding questions
  location_correct BOOLEAN,         -- "Where am I?"
  date_correct BOOLEAN,              -- "What date is it?"
  purpose_correct BOOLEAN,           -- "Why am I here?"

  -- Five senses re-orientation (post-session)
  senses_named TEXT[],               -- Array of 5 concrete facts

  -- Subjective flags
  dissociation_detected BOOLEAN,
  magical_thinking_detected BOOLEAN,
  meaning_deferred BOOLEAN,          -- Did user defer interpretation?

  notes TEXT
);

CREATE INDEX idx_reality_check_session ON neuropod_reality_testing_checks(session_id);
```

---

## Part 6: Experimental Protocol (First-Pass Validation)

### Experiment 1: Vibroacoustic Stress Reduction (Replication + Extension)

**Hypothesis:** Low-frequency vibroacoustic stimulation (30-50 Hz) reduces acute stress markers more than matched music alone.

**Design:** Within-subject crossover (3 conditions, randomized order)

**Conditions:**
1. **Vibroacoustic + music** (full protocol)
2. **Music only** (no vibration)
3. **Silence** (rest control)

**Participants:** N = 40 (university students or general population, moderate stress levels)

**Procedure:**
1. Pre-screen (exclude red flags)
2. Session 1: Baseline biometrics (5 min quiet rest) → Condition A (10 min) → Post-session ratings + biometrics
3. Washout: 48-72 hours
4. Session 2: Condition B (same structure)
5. Session 3: Condition C

**Primary Outcome:** EDA (electrodermal activity) reduction from baseline

**Secondary Outcomes:**
- HRV coherence increase
- Subjective stress rating (0-10 scale)
- Heart rate reduction

**Analysis:**
- Repeated-measures ANOVA (condition × time)
- Planned contrast: Vibroacoustic+Music vs. Music-only
- Effect size: Cohen's d ≥ 0.4 (medium) considered meaningful

**Success Criteria:**
- Vibroacoustic+Music > Music-only with p < 0.05 and d ≥ 0.4
- No adverse events (dissociation, panic, seizures)

**Timeline:** 3 months (recruitment, data collection, analysis)

**Budget:** $25,000 (participant compensation, equipment, analysis)

---

### Experiment 2: Breath-Paced Vibroacoustic HRV Coherence

**Hypothesis:** Breath-paced vibroacoustic stimulation increases HRV coherence more than breath pacing alone.

**Design:** Within-subject crossover (2 conditions)

**Conditions:**
1. **Vibroacoustic + breath pacing** (5.5 breaths/min)
2. **Breath pacing only** (5.5 breaths/min, no vibration)

**Participants:** N = 30 (general population, no HRV pathology)

**Procedure:**
1. Session 1: Baseline HRV (5 min) → Condition A (10 min) → Post HRV (5 min)
2. Washout: 48 hours
3. Session 2: Condition B

**Primary Outcome:** HRV coherence ratio (0-1 scale)

**Secondary Outcomes:**
- Respiration rate stabilization (variance around 5.5 breaths/min)
- Subjective groundedness rating

**Analysis:**
- Paired t-test (Condition A vs. B)
- Expected delta: +0.18 HRV coherence (d ≈ 0.6)

**Success Criteria:**
- Vibroacoustic+Breath > Breath-only with p < 0.05
- At least 60% of participants show positive response

**Timeline:** 2 months

**Budget:** $18,000

---

### Experiment 3: Vibroacoustic Sleep Preparation (Pre-Post)

**Hypothesis:** Vibroacoustic pre-sleep protocol improves subjective sleep quality and (if EEG available) slow-wave sleep.

**Design:** Pre-post intervention (no control initially; control arm added if pilot succeeds)

**Intervention:** 20-minute vibroacoustic sleep preparation protocol nightly for 7 nights

**Participants:** N = 25 (adults with mild sleep complaints, no diagnosed sleep disorders)

**Procedure:**
1. Baseline week: Sleep diary + wearable sleep tracking (no intervention)
2. Intervention week: Nightly vibroacoustic pre-sleep session + sleep tracking
3. Follow-up week: Sleep tracking only (sustainability check)

**Primary Outcome:** Subjective sleep quality (Pittsburgh Sleep Quality Index or similar)

**Secondary Outcomes:**
- Sleep onset latency (self-report + wearable)
- Total sleep time
- Slow-wave sleep percentage (if EEG-based wearable available)

**Analysis:**
- Paired t-test (baseline vs. intervention week)
- Expected delta: +0.5-1.0 points on sleep quality scale

**Success Criteria:**
- Significant improvement in sleep quality (p < 0.05)
- No adverse events (insomnia worsening, nightmares)
- If successful, proceed to RCT with control arm

**Timeline:** 4 months (recruitment, 3-week protocol per participant, analysis)

**Budget:** $30,000

---

### Experiment 4: Vibroacoustic Somatic Exploration (Phenomenology + Safety)

**Hypothesis:** Vibroacoustic somatic exploration increases interoceptive awareness without causing dissociative overwhelm (if properly screened).

**Design:** Pre-post single-arm pilot (high screening, qualitative + quantitative)

**Intervention:** Single 20-minute vibroacoustic somatic exploration session

**Participants:** N = 15 (high screening: Bloom Level 4+, no psychosis/dissociation history, prior somatic/meditation experience)

**Procedure:**
1. Pre-screen (strict exclusions)
2. Pre-session: Interoceptive Awareness Scale, reality-testing baseline
3. Session: Vibroacoustic somatic exploration (user-controlled intensity)
4. Post-session: Reality-testing check, Interoceptive Awareness Scale, phenomenology interview

**Primary Outcome:** Interoceptive Awareness Scale change

**Secondary Outcomes:**
- Reality-testing pass rate (did users maintain orientation?)
- Dissociation scale (should remain low)
- Qualitative phenomenology themes (thematic analysis)

**Analysis:**
- Descriptive statistics (mean change, distribution)
- Safety check: Zero instances of prolonged dissociation or reality-testing failure
- Qualitative: Thematic coding of phenomenology interviews

**Success Criteria:**
- Interoceptive awareness increases (mean +5 points, p < 0.05)
- Zero adverse events (dissociation, panic, magical thinking integration)
- At least 80% of participants report "grounded, safe, insightful" experience

**Timeline:** 3 months

**Budget:** $22,000 (includes qualitative analysis)

---

## Part 7: Hardware Safety Constraints (Final Spec)

### Vibroacoustic Transducer Safety Caps

**Amplitude Limits:**
- **Maximum acceleration:** 1.5g (comfortable, non-harmful)
- **Neuropod safety cap:** 0.75 max amplitude (75% of max = ~1.1g)
- **Rationale:** ISO 2631 whole-body vibration standards; 1.5g sustained is safe for short durations

**Frequency Limits:**
- **Range:** 20-200 Hz (focus 20-120 Hz for v0)
- **Prohibited:** Infrasound <15 Hz (potential vestibular/nausea effects), ultrasound >20 kHz (no benefit, potential hearing damage)
- **Rationale:** Human somatosensory perception optimal 20-500 Hz; conservative lower range for v0

**Session Duration Limits:**
- **Maximum single session:** 30 minutes
- **Maximum daily total:** 90 minutes
- **Minimum inter-session interval:** 2 hours
- **Rationale:** Prevent habituation, allow integration, avoid cumulative fatigue

---

### Haptic Pulse Generator Safety Caps

**Amplitude Limits:**
- **Maximum amplitude:** 0.6 (60% of device max)
- **Rationale:** Gentle, non-startling; similar to smartphone notification vibration intensity

**Frequency Limits:**
- **Range:** 1-100 Hz
- **Optimal:** 10-80 Hz (most perceptible, least fatiguing)

**Location Constraints:**
- **Allowed:** Wrists, lower back, temples (large muscle/fascia areas)
- **Prohibited:** Neck (carotid sensitivity), chest (cardiac interference theoretical risk), genitals (inappropriate)

---

### Audio Safety Caps

**Amplitude (Volume):**
- **Maximum SPL:** 85 dB (OSHA safe exposure limit for 8 hours)
- **Neuropod cap:** 80 dB recommended max for sessions
- **Rationale:** Hearing protection; users may use for extended periods

**Frequency Limits:**
- **Infrasound:** No tones <20 Hz (can cause nausea/discomfort)
- **Ultrasound:** No tones >20 kHz (inaudible, potential hearing damage)
- **Binaural beat modulation:** Max 50 Hz difference (higher = less effective, potentially irritating)

---

### Light Stimulation Safety Caps (If Integrated)

**Intensity:**
- **Maximum:** 500 lux (comfortable indoor reading level)
- **Neuropod cap:** 300 lux for sessions

**Frequency (Flicker):**
- **Prohibited:** 15-25 Hz flicker (epilepsy risk)
- **Allowed:** <10 Hz (slow, meditative) or >30 Hz (fused, gamma entrainment)
- **Rationale:** Photosensitive seizure prevention

---

## Part 8: Integration with Existing Neuropod Architecture

### Coherence Tracker Integration

**New Metrics for Vibroacoustic Sessions:**
- `vibroacousticFrequency`: Current vibration frequency (Hz)
- `vibroacousticAmplitude`: Current vibration amplitude (0-1)
- `hapticFrequency`: Current haptic pulse frequency (Hz)
- `somatosensoryEntrainment`: Estimated somatosensory rhythm coupling (0-1)

**Extended CoherenceSnapshot:**
```typescript
export interface CoherenceSnapshot {
  // ... existing fields (phaseCoupling, topological, thermodynamic, valence)

  vibroacoustic?: {
    frequency: number;
    amplitude: number;
    estimatedEntrainment: number;  // How locked is nervous system to vibration?
    bodyRegion: 'fullBody' | 'localized';
  };

  haptic?: {
    frequency: number;
    amplitude: number;
    locations: string[];
    breathCoupling: number;  // 0-1: How well synced to breath?
  };
}
```

---

### Safety Predictor Integration

**New Risk Factors for Vibroacoustic:**
- **Over-stimulation:** Vibroacoustic amplitude >0.7 for >10 min → increase risk score
- **Arousal dysregulation:** EDA spikes + HRV drop during session → flag for overwhelm
- **Dissociation markers:** If EEG shows low coherence + high theta + low alpha → potential dissociation

**Extended OverwhelmPrediction:**
```typescript
export interface OverwhelmPrediction {
  // ... existing fields (riskScore, recommendation, reasoning)

  vibroacousticRisk?: {
    overstimulation: boolean;
    arousalDysregulation: boolean;
    dissociationWarning: boolean;
  };
}
```

---

### Psychoactivation Engine Integration

**New Output Type:**
```typescript
export interface PsychoactivationOutput {
  // ... existing fields (audio, light)

  vibroacoustic?: {
    frequency: number;
    amplitude: number;
    pattern: 'continuous' | 'pulsed' | 'breath-paced' | 'phase-locked';
    modulation: 'none' | 'gentle-crescendo' | 'responsive';
  };

  haptic?: {
    frequency: number;
    amplitude: number;
    pattern: 'breath-pulse' | 'focus-pulse' | 'pulsed-gentle';
    locations: ('wrists' | 'temples' | 'lower-back')[];
  };
}
```

**Closed-Loop Adaptation (Enhanced):**
```typescript
public tick(
  coherenceSnapshot: CoherenceSnapshot,
  safetyPrediction: OverwhelmPrediction,
  assrMetrics?: ASSRMetrics
): PsychoactivationOutput {
  // ... existing safety checks

  // NEW: Vibroacoustic-specific adaptation
  if (safetyPrediction.vibroacousticRisk?.overstimulation) {
    this.state.vibroacousticAmplitude *= 0.7;  // Reduce by 30%
    this.state.reasoning.push('Reduced vibroacoustic amplitude (overstimulation detected)');
  }

  if (safetyPrediction.vibroacousticRisk?.arousalDysregulation) {
    // Shift to breath-paced grounding mode
    this.state.vibroacousticPattern = 'breath-paced';
    this.state.vibroacousticFrequency = 30;  // Lower frequency
    this.state.reasoning.push('Shifted to grounding mode (arousal dysregulation)');
  }

  if (safetyPrediction.vibroacousticRisk?.dissociationWarning) {
    // Emergency grounding protocol
    return this.emergencyGrounding('Dissociation warning');
  }

  // ... continue with existing adaptation logic
}

private emergencyGrounding(reason: string): PsychoactivationOutput {
  return {
    audio: {
      carrierLeft: 200,
      carrierRight: 200,
      amplitude: 0.3,
      soundscape: 'silence'
    },
    vibroacoustic: {
      frequency: 25,
      amplitude: 0.4,
      pattern: 'breath-paced',
      modulation: 'none'
    },
    haptic: {
      frequency: 0.09,  // 5.5 breaths/min
      amplitude: 0.3,
      pattern: 'breath-pulse',
      locations: ['wrists']
    },
    light: {
      color: 'warm-white',
      intensity: 0.2
    },
    reasoning: [`EMERGENCY GROUNDING: ${reason}`]
  };
}
```

---

## Part 9: Team Communication (Internal Use)

### What We're Building (Team Talking Points)

**For Engineering:**
"We're integrating vibroacoustic transducers and haptic pulse generators into Neuropod v0. The closed-loop control architecture already exists (coherence tracker + safety predictor + psychoactivation engine). We're adding new output modalities (vibration, haptics) and validating with biometric feedback. Safety caps are strict: 0.75 max vibration amplitude, 0.6 max haptic amplitude, 30-minute session limits."

**For Design/UX:**
"Vibroacoustic sessions need clear reality-testing integration. Before: grounding questions + intent declaration. During: sacred stop button always visible. After: 5-senses re-orientation + 'meaning is optional' reminder. We're designing for calm/clarity/grounding states, not breakthrough experiences."

**For Marketing:**
"Vibroacoustic protocols are grounded in stress reduction research and inspired by FDA-cleared CLAS sleep devices. We claim: 'may support relaxation/focus for some users; effects vary.' We do NOT claim: 'digital DMT,' 'guaranteed breakthroughs,' 'treats medical conditions.' Evidence levels are explicit (strong/moderate/experimental) on every protocol page."

**For Clinical/Safety:**
"Red flag exclusions: psychosis, mania, severe dissociation, uncontrolled seizures, complex PTSD. Yellow flags: moderate anxiety (start gentle), neurodivergence (customize intensity). Reality-testing protocol is mandatory for all sessions. If safety risk score >0.85, session auto-stops. We collect adverse event reports and halt protocols if >5% dissociation/overwhelm rate."

---

### What We're NOT Building (Guardrails)

**We are NOT:**
- Simulating psychedelic experiences
- Claiming universal efficacy
- Replacing therapy or medical treatment
- Targeting "breakthroughs" or "visions"
- Using frequency mysticism ("432 Hz opens the heart")
- Allowing open-ended intensity ramps without biometric gating

**We ARE:**
- Supporting nervous system regulation (stress down, coherence up)
- Validating every claim with data from our user population
- Prioritizing safety over intensity
- Reality-testing to prevent magical thinking
- Transparent about evidence levels (strong/moderate/experimental)

---

## Part 10: Next Steps (Implementation Roadmap)

### Phase 1: Hardware Build + Safety Validation (Months 1-3)

**Deliverables:**
1. ✅ Vibroacoustic transducers installed (bed/chair)
2. ✅ Haptic pulse generators integrated (wrists, lower back, temples)
3. ✅ Safety caps implemented in firmware (0.75 vibroacoustic, 0.6 haptic, 85 dB audio)
4. ✅ Reality-testing UI integrated (pre/during/post grounding checks)
5. ✅ Database schema deployed (vibroacoustic sessions + timeseries + reality checks)

**Validation:**
- Internal testing (N=5 team members): Verify safety caps, test stop button, confirm biometric logging
- Pilot users (N=10 trusted users): Collect feedback on comfort, intensity, phenomenology
- Safety audit: Zero adverse events before Phase 2

**Budget:** $35,000 (hardware, installation, pilot testing)

---

### Phase 2: Protocol Validation (Months 4-9)

**Experiments:**
1. ✅ Vibroacoustic stress reduction (N=40, 3 months, $25k)
2. ✅ Breath-paced HRV coherence (N=30, 2 months, $18k)
3. ✅ Vibroacoustic sleep preparation (N=25, 4 months, $30k)
4. ✅ Vibroacoustic somatic exploration (N=15, 3 months, $22k)

**Deliverables:**
- Published experimental reports (internal or public)
- Updated protocol library with validated effect sizes
- Refined safety thresholds based on real user data
- Marketing claims matrix (approved by legal/clinical team)

**Budget:** $95,000 (experiments, participant compensation, analysis)

---

### Phase 3: Public Launch + Iteration (Months 10-12)

**Deliverables:**
1. ✅ Vibroacoustic protocols available to all users (with screening)
2. ✅ Real-time coherence dashboard (users see biometric response during sessions)
3. ✅ Automated safety monitoring (risk score visible, auto-stop if threshold exceeded)
4. ✅ Integration guide (how to combine vibroacoustic with MAIA guidance, field work, etc.)

**Marketing:**
- Launch announcement: "Neuropod now includes vibroacoustic state support, validated in 4 pilot studies"
- Evidence page: Transparent effect sizes, success rates, safety data
- Testimonials: Curated phenomenology reports (with informed consent)

**Iteration:**
- Collect ongoing adverse event reports
- Refine protocols based on user feedback
- Expand state taxonomy (new target states as data accumulates)

**Budget:** $25,000 (marketing, ongoing safety monitoring, iteration)

---

### Total Budget: $155,000 (Hardware + Validation + Launch)

---

## Conclusion: The Vibroacoustic Commitment

**We commit to:**
1. **Evidence over hype:** Every claim backed by peer-reviewed research or our own validation data
2. **Safety over intensity:** Conservative thresholds, reality-testing, sacred stop button
3. **Transparency:** Explicit evidence levels (strong/moderate/experimental) on every protocol
4. **Humility:** "May support" not "will guarantee"; "some users" not "everyone"
5. **Reality-testing:** Grounding checks prevent magical thinking and dissociative overwhelm
6. **Iteration:** We update protocols as data accumulates; we halt protocols that cause harm

**What we believe:**
- Vibroacoustic stimulation is real, measurable, and safe (when done responsibly)
- Nervous system modulation via patterned sound/vibration is scientifically credible
- Phenomenology is emergent, context-dependent, and meaning-laden (not deterministic)
- The goal is support, not simulation (of psychedelics, breakthroughs, or mystical states)
- Closed-loop biometric control is essential (CLAS validates this approach)

**What we're building:**
A vibroacoustic consciousness navigation platform that measures rigorously, stimulates responsibly, adapts in real-time, and claims honestly.

---

**Next Action:** Review this document with engineering, clinical, and legal teams. Approve Phase 1 hardware build. Begin safety validation protocol.

**Document Status:** Ready for internal review
**Approval Required:** Engineering Lead, Clinical Director, Legal/Compliance
**Timeline:** Phase 1 start date TBD (awaiting approval)

---

## APPENDIX A: The Six Constructive Altered States (Evidence-Grounded Framework)

**Context:** This expanded taxonomy moves beyond "digital DMT" fantasies to map **therapeutic + constructive altered states** that are plausibly supportable via frequency-based stimulation when framed as **state support + entrainment + closed-loop regulation**.

**Key Insight:** Stop thinking "frequency" → Start thinking "control system"
- **Phase, dosage, ramp-rate, and individual resonance matter MORE than raw frequency**
- The most defensible altered state tech is **closed-loop**: measure → adjust → stabilize → exit cleanly
- This is the architecture we've built (coherenceTracker → psychoactivationEngine → safetyPredictor)

---

### State 1: Parasympathetic Settling + Emotional Regulation

**Evidence Level:** ★★★★★ Strong (highest confidence)

**Best Lever:** Resonance-frequency breathing / HRV biofeedback (~0.1 Hz breathing pace, individualized)

**Why It Matters:**
This is one of the most reliable "frequency → state" relationships in humans, with repeatable biomarkers (HRV, respiration, BP trends). Major meta-analysis supports benefits across stress/emotion regulation.

**Neuropod Implementation:**
- ✅ **Protocol:** `breath-paced-vibroacoustic` (lib/neuropod/protocolLibrary.ts:328-396)
- **Target Metrics:** HRV coherence ↑ 0.18 (Cohen's d ≈ 0.6, medium-large effect)
- **Biometric Validation:** RMSSD, respiration rate, GSR, coherence ratio
- **Safety:** Universally safe (no exclusion criteria beyond pacemaker/pregnancy)

**Research Anchors:**
- Lehrer et al. (2000) - HRV biofeedback at resonant frequency
- McCraty et al. (2009) - Coherence: Bridging personal, social, and global health
- PubMed meta-analysis (2024) - Binaural beats modest effect on anxiety

**Marketing Claim:**
"Research-backed breathwork guidance with HRV biofeedback has been extensively studied for stress regulation and emotional coherence."

**Membership Access:** All tiers (foundational regulation skill)

---

### State 2: Sleep Deepening + Memory Consolidation

**Evidence Level:** ★★★★★ Strong (gold standard closed-loop precedent)

**Best Lever:** Closed-loop acoustic stimulation (CLAS) - pink noise pulses timed to slow oscillation phase

**Why It Matters:**
This is the **poster child for "frequency → state"** because timing/phase matters as much as frequency—so it naturally pushes toward Neuropod-style closed-loop. Reviews and trials report boosted slow-wave activity (20-40% increase) and memory-related gains when stimulation is correctly phase-locked.

**Neuropod Implementation:**
- ✅ **Protocol:** `vibroacoustic-sleep-prep` (lib/neuropod/protocolLibrary.ts:467-535)
- **Target Metrics:** Sleep quality ↑ 0.7 points (0-10 scale), slow-wave sleep ↑ 12% (if full EEG)
- **Biometric Validation:** Theta power, alpha power, slow-wave phase detection
- **Safety:** Conservative for pre-sleep (max intensity 0.5, duration 30 min)

**Research Anchors:**
- BioRxiv (2022) - Neurophysiology of closed-loop auditory stimulation
- ResearchGate (2024) - Phase-locked acoustic stimulation RCT
- FDA-cleared CLAS devices (e.g., SleepLoop, Elemind)

**Marketing Claim:**
"Our sleep preparation protocol is inspired by closed-loop acoustic stimulation (CLAS) research, which has demonstrated measurable improvements in slow-wave sleep in FDA-cleared devices."

**Membership Access:** All tiers (health-foundational)

---

### State 3: Absorption / Trance / Hypnagogic Doorway

**Evidence Level:** ★★★☆☆ Moderate (measurable entrainment, variable phenomenology)

**Best Levers:** Rhythmic audio (isochronic/amplitude-modulated), breath pacing, gentle haptics, guided imagery

**Why It Matters:**
Less about "one magic frequency" and more about **stability of rhythm + attentional capture + reduced prediction error** (monotony, repetition, safety). The Auditory Steady-State Response (ASSR) literature gives you **measurable neural locking** to rhythmic modulation—i.e., a **biomarker handle** on entrainment.

**Neuropod Implementation:**
- ✅ **Protocols:**
  - `assr-receptive-absorption` (10 Hz isochronic, PLV > 0.3 = entrainment detected)
  - `assr-contemplative-theta` (6.5 Hz theta-band with breath coupling)
  - `assr-hypnagogic-doorway` (4-8 Hz sweep for trance induction)
- **Target Metrics:** Phase-Locking Value (PLV) at target frequency, absorption scale, theta/alpha power
- **Biometric Validation:** ASSR PLV (primary), theta-alpha ratio, global synchrony
- **Safety:** Moderate exclusions (psychosis, severe dissociation, seizure history)

**Research Anchors:**
- PMC (2023) - Binaural beats entrainment systematic review
- ResearchGate (2023) - 40-Hz ASSR enhanced by beta-band subharmonics
- MIT Press Direct (2024) - Thalamocortical interactions in ASSR

**Marketing Claim:**
"ASSR protocols with measurable neural entrainment (phase-locking validated in real-time); studied in contemplative neuroscience and absorption research."

**Membership Access:** Intermediate+ (requires basic grounding/integration demonstrated)

---

### State 4: Focus / Cognitive Steadiness

**Evidence Level:** ★★★☆☆ Moderate (mixed evidence, individual-dependent)

**Levers:** Rhythm + task coupling, binaural/AM/isochronic beats, gamma entrainment (40 Hz)

**Reality Check:**
Effects are often **small and individual-dependent**, but controlled studies report specific low-Hz binaural protocols impact vigilance/behavioral measures. Gamma (40 Hz) has stronger neuroscience backing but unclear cognitive transfer.

**Neuropod Implementation:**
- ✅ **Protocols:**
  - `vibroacoustic-attention-reset` (40-60 Hz vibroacoustic + 40 Hz binaural)
  - `assr-gamma-insight` (40 Hz multimodal gamma entrainment with PLV validation)
  - `gamma-focus-40hz` (original protocol, now extended with vibroacoustic)
- **Target Metrics:** Task performance ↑ 12%, gamma power ↑ 0.08, PLV > 0.3 at 40 Hz
- **Biometric Validation:** Gamma power, beta power, frontal-parietal coherence, ASSR PLV
- **Safety:** Higher exclusions (seizure, anxiety, mania/bipolar can be over-activated by gamma)

**Research Anchors:**
- Iaccarino et al. (2016) - Gamma frequency entrainment attenuates amyloid load
- Adaikkan et al. (2019) - Gamma binds higher-order brain regions
- PubMed (2024) - Binaural beat sustained attention study

**Marketing Claim:**
"Gamma-band ASSR protocols studied in cognitive neuroscience; may support attention and mental clarity for some users."

**Membership Access:** All tiers (practical productivity support)

---

### State 5: Somatic Unwinding, Stress Reduction, Pain Modulation

**Evidence Level:** ★★★☆☆ Moderate (practical, body-first)

**Best Lever:** Vibroacoustic + haptics (sound + vibration delivered through the body)

**Why It Matters:**
Directly targets **felt sense, interoception, and autonomic tone** (HRV/GSR). Peer-reviewed studies measure HRV/EEG changes with vibroacoustic protocols, plus clinical pilot work in pain contexts. This is the **most embodied, least cognitive** lane.

**Neuropod Implementation:**
- ✅ **Protocols:**
  - `vibroacoustic-stress-reduction` (40 Hz continuous, EDA ↓ 18%)
  - `vibroacoustic-somatic-exploration` (user-controlled, high screening: Bloom 4+)
  - `breath-paced-vibroacoustic` (somatic grounding + HRV coherence)
- **Target Metrics:** HRV coherence, EDA reduction, interoceptive awareness scale, subjective groundedness
- **Biometric Validation:** HRV RMSSD, coherence ratio, EDA, peripheral temperature
- **Safety:** Pregnancy/pacemaker exclusions; somatic exploration requires high screening

**Research Anchors:**
- Academia (2024) - Low-frequency sound vibration acute stress study
- Punkanen & Ala-Ruona (2012) - Contemporary vibroacoustic therapy
- ScienceDirect (2024) - Vibroacoustic therapy effects review

**Marketing Claim:**
"Vibroacoustic protocols studied for stress reduction, somatic regulation, and interoceptive awareness; effects measured via HRV and subjective scales."

**Membership Access:**
- Basic protocols: All tiers
- Somatic exploration: Advanced only (Bloom 4+, demonstrated integration capacity)

---

### State 6: Perceptual Alteration / Visionary Phenomena

**Evidence Level:** ★★☆☆☆ Weak-to-Experimental (high induction, high caution)

**Lever:** Stroboscopic / flicker stimulation (alpha-range ~10 Hz)

**Why It Matters:**
Clear demonstration that frequency can **reorganize conscious contents**, but carries **non-trivial risk** (photosensitive seizure risk, destabilization in vulnerable populations).

**Neuropod Status:**
- ⚠️ **NOT IMPLEMENTED in v0**
- **Reason:** Epilepsy risk, requires clinical oversight, no clear therapeutic benefit for general population
- **Research-only lane:** Would require IRB approval, medical screening, controlled lab setting

**If Implemented (Future Research-Only Protocol):**
- **Exclusions:** Seizure history, photosensitivity, psychosis, mania, severe dissociation
- **Safety:** Medical supervision required, 15-25 Hz flicker range PROHIBITED
- **Allowed range:** <10 Hz (slow, meditative) or >30 Hz (fused, gamma)
- **Validation:** Phenomenology coding, EEG spectral analysis, safety incident tracking

**Research Anchors:**
- MIT Press Direct (2024) - Thalamocortical interactions in flicker
- Flicker-induced hallucination studies (Ganzfeld effect)

**Marketing:**
- ❌ DO NOT OFFER to general membership
- ✅ Research partnerships only (universities, clinical trials)

**Membership Access:** N/A (research-only, not public-facing)

---

## APPENDIX B: Safety Stratification (Risk-Tiered Roadmap)

### Tier 1: Low-Risk Clinical (Ready for Phase 1 Launch)

**Protocols:**
1. `breath-paced-grounding` (HRV coherence, no vibration)
2. `breath-paced-vibroacoustic` (HRV + gentle vibration)
3. `vibroacoustic-stress-reduction` (40 Hz continuous stress reduction)
4. `vibroacoustic-sleep-prep` (CLAS-inspired pre-sleep)
5. `alpha-relaxation` (10 Hz binaural beats)

**Evidence Level:** Strong to Moderate

**Safety Profile:**
- Minimal exclusions (pregnancy, pacemaker only)
- Universally tolerated stimulation (low intensity, short duration)
- Clear biomarker validation (HRV, EDA, sleep quality)

**Membership Access:** All tiers

**Timeline:** **Immediate** (Phase 1 hardware build + validation, Months 1-12)

**Budget:** $155,000 (hardware $60k, experiments $95k)

---

### Tier 2: Research-Only (Moderate Risk, Requires Screening)

**Protocols:**
1. `assr-receptive-absorption` (10 Hz isochronic with PLV validation)
2. `assr-contemplative-theta` (6.5 Hz theta entrainment)
3. `vibroacoustic-attention-reset` (40-60 Hz attention reset)
4. `vibroacoustic-somatic-exploration` (user-controlled, Bloom 4+)
5. `assr-hypnagogic-doorway` (4-8 Hz trance induction)

**Evidence Level:** Moderate to Experimental

**Safety Profile:**
- Moderate exclusions (psychosis, dissociation, seizures)
- Developmental screening required (Bloom Level 3-4+)
- Higher intensity/duration (up to 30 min, moderate stimulation)
- Requires reality-testing protocol (pre/during/post grounding)

**Membership Access:** Intermediate to Advanced tiers (demonstrated grounding + integration)

**Timeline:** **Year 2-3** (Months 13-36, after Tier 1 validation complete)

**Budget:** $180,000 (ASSR hardware upgrades $40k, advanced experiments $140k)

---

### Tier 3: Do-Not-Touch-Yet (High Risk, No Timeline)

**Protocols:**
1. Flicker/stroboscopic stimulation (15-25 Hz PROHIBITED, epilepsy risk)
2. Open-ended "breakthrough" protocols (no annealing, no safety caps)
3. High-intensity gamma (>50 Hz prolonged stimulation)
4. Unguided somatic release (no integration support)

**Evidence Level:** Weak to None

**Safety Profile:**
- **Unacceptable risk** for general population
- Seizure induction, destabilization, retraumatization potential
- No clear therapeutic benefit
- Would require clinical partnerships, IRB approval, medical supervision

**Membership Access:** **N/A** (not offered)

**Timeline:** **Indefinite hold** (revisit only if clinical partnerships established)

**Budget:** $0 (not allocated)

---

## APPENDIX C: 3-Year R&D Roadmap (Mapped to Membership Tiers)

### Year 1 (Months 1-12): Foundation + Low-Risk Clinical

**Focus:** HRV Coherence + Sleep Enhancement (Tier 1 Protocols)

**Q1 (Months 1-3): Hardware Build + Safety Validation**
- Deliverables:
  - Vibroacoustic transducers installed (bed/chair)
  - Haptic pulse generators integrated (wrists, lower back, temples)
  - Safety caps firmware deployed (0.75 vibroacoustic, 0.6 haptic, 85 dB audio)
  - Reality-testing UI (pre/during/post grounding checks)
  - Database schema deployed (vibroacoustic sessions + timeseries)
- Budget: $60,000 (hardware, installation, pilot testing N=10)
- Success Criteria: Zero adverse events in pilot, all safety caps functioning

**Q2-Q3 (Months 4-9): Tier 1 Protocol Validation**
- Experiments:
  1. Breath-paced HRV coherence (N=30, $18k)
  2. Vibroacoustic stress reduction (N=40, $25k)
  3. Vibroacoustic sleep prep (N=25, $30k)
- Deliverables:
  - Published experimental reports (effect sizes, success rates)
  - Refined protocol parameters based on data
  - Marketing claims matrix approved by legal/clinical
- Budget: $73,000 (experiments, analysis, legal review)
- Success Criteria: All 3 protocols show p < 0.05 effects, <5% adverse event rate

**Q4 (Months 10-12): Public Launch (All Tiers)**
- Deliverables:
  - Tier 1 protocols available to all members
  - Real-time coherence dashboard (biometric feedback during sessions)
  - Automated safety monitoring (risk score visible, auto-stop)
  - Launch announcement: "Evidence-based vibroacoustic state support, validated in 3 RCTs"
- Budget: $25,000 (marketing, iteration, ongoing safety monitoring)
- Success Criteria: 500+ sessions completed, <3% adverse event rate, 70%+ satisfaction

**Total Year 1 Budget:** $158,000

**Membership Integration:**
- **Foundation Tier:** Access to breath-paced grounding, alpha relaxation
- **Explorer Tier:** Full access to all Tier 1 protocols
- **Pioneer Tier:** Early beta access, feedback surveys, protocol refinement input

---

### Year 2 (Months 13-24): ASSR Absorption + Somatic Unwinding (Tier 2 Protocols)

**Focus:** ASSR Entrainment + Advanced Somatic Work (Moderate Screening Required)

**Q1 (Months 13-15): ASSR Hardware + Validation Infrastructure**
- Deliverables:
  - EEG integration for real-time ASSR PLV calculation
  - Phase-locking validation pipeline (10 Hz tick rate)
  - Advanced screening questionnaire (Bloom level, dissociation history, trauma screening)
- Budget: $40,000 (EEG hardware, software development)
- Success Criteria: ASSR PLV calculation <100ms latency, screening pipeline operational

**Q2-Q3 (Months 16-21): Tier 2 Protocol Validation**
- Experiments:
  1. ASSR receptive absorption (N=30, PLV > 0.3 validation, $35k)
  2. ASSR contemplative theta (N=25, theta-alpha entrainment, $30k)
  3. Vibroacoustic somatic exploration (N=15, high screening, phenomenology interviews, $40k)
  4. ASSR hypnagogic doorway (N=20, theta sweep PLV tracking, $35k)
- Deliverables:
  - ASSR entrainment success rates (% showing PLV > 0.3)
  - Somatic exploration safety data (dissociation rates, integration outcomes)
  - Phenomenology thematic analysis (qualitative + quantitative)
- Budget: $140,000 (experiments, qualitative analysis, extended screening)
- Success Criteria: ASSR protocols show 60%+ entrainment rate, somatic exploration <5% dissociation

**Q4 (Months 22-24): Tier 2 Launch (Intermediate+ Members)**
- Deliverables:
  - ASSR protocols available to Bloom 3+ members
  - Somatic exploration available to Bloom 4+ members
  - Real-time ASSR PLV display (users see entrainment happening)
  - Advanced integration guide (ASSR + archetypal work + field safety)
- Budget: $20,000 (advanced UI, integration documentation)
- Success Criteria: 200+ Tier 2 sessions completed, <3% adverse events, 65%+ "profound experience" ratings

**Total Year 2 Budget:** $200,000

**Membership Integration:**
- **Foundation Tier:** Tier 1 only (no ASSR access)
- **Explorer Tier:** Tier 1 + basic ASSR (receptive absorption, attention reset)
- **Pioneer Tier:** Full Tier 1 + Tier 2 access (ASSR, somatic exploration with screening)

---

### Year 3 (Months 25-36): Personalization + Clinical Partnerships

**Focus:** Individual Resonance Mapping + Clinical Trial Partnerships

**Q1-Q2 (Months 25-30): Personalization Engine**
- Deliverables:
  - "Find Your Resonance" protocol: automated testing of 5-15 Hz HRV resonance frequency
  - ASSR responder profiling: predict who will entrain at which frequencies (ML model)
  - Annealing pathway personalization: optimize heating/cooling rates per user
- Budget: $80,000 (ML development, personalization experiments N=100)
- Success Criteria: Personalized protocols show 20%+ improvement over one-size-fits-all

**Q3 (Months 31-33): Clinical Partnerships (Sleep, Pain, PTSD)**
- Deliverables:
  - Partnership with sleep clinic (CLAS validation study, N=50)
  - Partnership with pain clinic (vibroacoustic pain modulation pilot, N=30)
  - Trauma-informed protocol development (with clinical oversight, N=20)
- Budget: $120,000 (clinical partnerships, IRB fees, extended validation)
- Success Criteria: At least 1 peer-reviewed publication submitted

**Q4 (Months 34-36): Neuropod Pro Launch (Clinical-Grade)**
- Deliverables:
  - Medical-grade Neuropod hardware (FDA compliance roadmap)
  - Clinical dashboard (for therapists/coaches to monitor client sessions)
  - White-label licensing (clinics can offer Neuropod to patients)
- Budget: $50,000 (hardware compliance, clinical dashboard development)
- Success Criteria: 3+ clinics onboarded, 100+ clinical sessions completed

**Total Year 3 Budget:** $250,000

**Membership Integration:**
- **Foundation Tier:** Tier 1 only
- **Explorer Tier:** Tier 1 + basic ASSR + personalized HRV resonance
- **Pioneer Tier:** Full Tier 1 + Tier 2 + personalization + early access to clinical features
- **Clinical Partners:** White-label Neuropod Pro (separate licensing)

---

### Total 3-Year Budget: $608,000

**Funding Sources:**
1. **Membership revenue** ($300k over 3 years, assuming 500 paying members at $50/month avg)
2. **Clinical partnerships** ($150k in research grants + licensing fees)
3. **Seed funding / investor capital** ($158k Year 1 gap funding)

**Key Milestones:**
- **Month 12:** Tier 1 public launch (500+ sessions, 3 validated protocols)
- **Month 24:** Tier 2 launch (ASSR + somatic, 200+ advanced sessions)
- **Month 36:** Clinical partnerships (1 peer-reviewed publication, 3 clinics onboarded)

**ROI Validation:**
- By Month 36, Neuropod should be **revenue-neutral or profitable** via membership + licensing
- Evidence base should support **Series A fundraising** for medical-grade scaling

---

## APPENDIX D: MAIA Integration (Field Safety + Archetypal Work + Neuropod)

**Context:** MAIA-SOVEREIGN has existing consciousness development infrastructure:
- **Bloom's Taxonomy Integration** (6 cognitive levels: Remember → Create)
- **Spiral Dynamics** (developmental stages: Red → Turquoise)
- **Field Safety Status** (panconsciousFieldRouter.ts: UNDERWORLD, MIDDLEWORLD, UPPERWORLD_SYMBOLIC)
- **Archetypal Work** (Jungian integration, shadow work, anima/animus)

**Challenge:** How does Neuropod integrate with this developmental architecture?

---

### Integration Point 1: Field Safety Gating (Pre-Session Screening)

**Current System:** `panconsciousFieldRouter.ts` (lib/field/panconsciousFieldRouter.ts)
- Routes symbolic/oracular work based on:
  - Cognitive altitude (Bloom's level avg)
  - Field stability (variance in recent sessions)
  - Bypassing patterns (spiritual/intellectual bypassing scores)

**Neuropod Extension:**
Add `neuropodProtocolEligibility` to field router decisions:

```typescript
export interface FieldRoutingDecision {
  // ... existing fields (realm, intensity, safetyFlags)

  neuropodEligibility: {
    tier1Access: boolean;          // Low-risk protocols (all users)
    tier2Access: boolean;          // ASSR/somatic (Bloom 3+, stable field)
    tier3Access: boolean;          // Reserved for clinical (always false for now)
    recommendedProtocols: string[]; // Based on current field status
    exclusionReason?: string;      // Why user is blocked (if applicable)
  };
}
```

**Routing Logic:**
```typescript
export function assessNeuropodEligibility(
  bloomLevel: number,
  fieldStability: number,
  bypassingScore: number,
  psychosisHistory: boolean,
  dissociationHistory: boolean
): NeuropodEligibility {
  // Tier 1 (Low-Risk): Almost everyone
  const tier1Access = !psychosisHistory && !dissociationHistory;

  // Tier 2 (ASSR/Somatic): Bloom 3+, stable field, low bypassing
  const tier2Access =
    tier1Access &&
    bloomLevel >= 3.0 &&
    fieldStability > 0.6 &&
    bypassingScore < 0.4;

  // Tier 3 (Clinical): Not available
  const tier3Access = false;

  // Recommend protocols based on current field status
  const recommendedProtocols = [];
  if (fieldStability < 0.4) {
    // Unstable field → grounding protocols only
    recommendedProtocols.push('breath-paced-grounding', 'breath-paced-vibroacoustic');
  } else if (bloomLevel >= 4.0 && fieldStability > 0.7) {
    // High + stable → ASSR absorption available
    recommendedProtocols.push('assr-receptive-absorption', 'assr-contemplative-theta');
  } else {
    // Default → stress reduction, sleep prep
    recommendedProtocols.push('vibroacoustic-stress-reduction', 'vibroacoustic-sleep-prep');
  }

  return { tier1Access, tier2Access, tier3Access, recommendedProtocols };
}
```

**User Experience:**
- **Explorer (Bloom 2, unstable):** Sees Tier 1 grounding protocols only
- **Intermediate (Bloom 3, stable):** Unlocks ASSR absorption, somatic exploration
- **Advanced (Bloom 4+, stable, low bypassing):** Full Tier 2 access, priority for clinical trials

---

### Integration Point 2: Archetypal Session Design

**Current System:** Archetypal Work (Jungian integration via MAIA guidance)
- Shadow work (confronting disowned parts)
- Anima/Animus integration (inner masculine/feminine)
- Hero's Journey mapping (developmental arc)

**Neuropod Extension:**
Archetypal protocols that combine Neuropod stimulation with guided MAIA prompts:

**Example: Shadow Integration Session (30 minutes)**
1. **Grounding Phase (5 min):** `breath-paced-vibroacoustic` + MAIA grounding prompts
   - "Name three things you can feel in your body right now."
   - "What part of you feels most present?"
2. **Exploration Phase (15 min):** `assr-contemplative-theta` (6.5 Hz) + shadow work prompts
   - "What quality in others triggers you most?"
   - "Where in your body do you feel this reaction?"
   - "If that disowned quality could speak, what would it say?"
3. **Integration Phase (10 min):** Gradual annealing back to baseline + integration prompts
   - "What gift does this shadow part offer you?"
   - "How can you honor this part in the next 24 hours?"

**Safety Integration:**
- Reality-testing at phase transitions (grounding checks)
- Automatic de-escalation if safety predictor flags overwhelm
- Post-session integration journal (meaning deferred, not crystallized during session)

---

### Integration Point 3: Bloom's Level Progression

**Current System:** Bloom's Taxonomy Cognitive Detection (BLOOMS_COGNITIVE_DETECTION_IMPLEMENTATION.ts)
- Tracks user progression: Remember → Understand → Apply → Analyze → Evaluate → Create
- Router uses avg Bloom level to gate DEEP/CORE/FAST processing

**Neuropod Extension:**
Use Neuropod sessions to **validate and accelerate** Bloom progression:

**Bloom Level 1-2 (Remember → Understand):**
- **Focus:** Grounding, regulation, basic coherence
- **Protocols:** Tier 1 only (breath-paced, stress reduction, sleep prep)
- **Validation:** HRV coherence improvement = parasympathetic regulation skill developing

**Bloom Level 2-3 (Understand → Apply):**
- **Focus:** Attentional control, focus, task coupling
- **Protocols:** Tier 1 + attention reset, basic ASSR (10 Hz)
- **Validation:** Gamma entrainment (PLV > 0.3) = sustained attention improving

**Bloom Level 3-4 (Apply → Analyze):**
- **Focus:** Pattern recognition, contemplative absorption, insight
- **Protocols:** Tier 1 + Tier 2 ASSR (theta, gamma), somatic exploration
- **Validation:** Theta-alpha coherence = integrative thinking developing

**Bloom Level 4-5 (Analyze → Evaluate):**
- **Focus:** Meta-cognition, wisdom, complex integration
- **Protocols:** Full Tier 2 access, annealing pathways, personalized resonance
- **Validation:** High field alignment + low defect density = stable complexity

**Bloom Level 5-6 (Evaluate → Create):**
- **Focus:** Generative states, flow, collaborative creation
- **Protocols:** Experimental (personalized annealing, multi-phase archetypal sessions)
- **Validation:** Global synchrony >0.7 during creative work = coherent flow state

**Key Insight:**
Neuropod biometrics become **objective markers** of Bloom progression (not just self-report or MAIA conversation analysis).

---

### Integration Point 4: Pioneer Circle Exclusivity

**Current System:** Pioneer Circle (early adopters, Q1 2025 launch)
- Highest-tier membership
- Early access to experimental features
- Direct input on roadmap

**Neuropod Extension:**
Pioneer Circle members get:
1. **Tier 2 early access** (Months 13-24, before public Tier 2 launch)
2. **Personalization beta** (Year 3, "Find Your Resonance" protocol testing)
3. **Research participant priority** (first invited to ASSR/somatic validation studies)
4. **Clinical trial partnerships** (if medically eligible, priority for sleep/pain studies)

**ROI for Pioneers:**
- Shape the evidence base (their data = published research)
- Deepest developmental support (ASSR + archetypal work combined)
- Potential health outcomes (sleep improvement, stress reduction)

---

### Integration Point 5: Community Commons Gate

**Current System:** Community Commons Posting (requires Bloom Level 4+)
- Ensures contributors have pattern recognition capacity
- Prevents low-integration posts from cluttering shared wisdom space

**Neuropod Extension:**
Add biometric validation to Commons eligibility:
- **Current Gate:** Bloom avg ≥ 4.0 over last 20 turns
- **Enhanced Gate:** Bloom avg ≥ 4.0 AND at least 5 Neuropod sessions with:
  - HRV coherence avg > 0.55 (demonstrates regulation capacity)
  - ASSR PLV > 0.3 in at least 1 session (demonstrates entrainment capacity)
  - Zero high-risk safety events (no overwhelm episodes)

**Rationale:**
- Commons is for integrated pattern-weavers
- Neuropod biometrics validate nervous system coherence (not just cognitive)
- This prevents spiritually bypassing contributors (high Bloom but unstable field)

---

## APPENDIX E: Updated Protocol Count + Budget Summary

### Protocol Library (Extended)

**Total Protocols:** 16 (was 7, now 16)

**Tier 1 (Low-Risk Clinical):**
1. `breath-paced-grounding` (HRV coherence, no vibration)
2. `vibroacoustic-grounding` (low-frequency bass grounding)
3. `alpha-relaxation` (10 Hz binaural beats)
4. `breath-paced-vibroacoustic` (HRV + vibration sync)
5. `vibroacoustic-stress-reduction` (40 Hz stress reduction)
6. `vibroacoustic-sleep-prep` (CLAS-inspired pre-sleep)

**Tier 2 (Research-Only, Moderate Screening):**
7. `gamma-focus-40hz` (40 Hz multimodal focus)
8. `theta-absorption` (6 Hz theta binaural)
9. `vibroacoustic-attention-reset` (40-60 Hz flow prep)
10. `assr-receptive-absorption` (10 Hz isochronic, PLV validation)
11. `assr-contemplative-theta` (6.5 Hz theta entrainment)
12. `assr-gamma-insight` (40 Hz gamma PLV)
13. `assr-hypnagogic-doorway` (4-8 Hz theta sweep)

**Tier 3 (Experimental, High Screening):**
14. `wind-up-crescendo` (phenomenology-inspired, 0.5-40 Hz ramp)
15. `annealing-pathway` (multi-phase CALM→DEPTH→INTEGRATION)
16. `vibroacoustic-somatic-exploration` (user-controlled, Bloom 4+)

---

### Updated Budget Summary

**Year 1 (Foundation):** $158,000
- Hardware: $60,000
- Tier 1 validation (3 experiments): $73,000
- Public launch: $25,000

**Year 2 (ASSR + Somatic):** $200,000
- ASSR hardware/infrastructure: $40,000
- Tier 2 validation (4 experiments): $140,000
- Tier 2 launch: $20,000

**Year 3 (Personalization + Clinical):** $250,000
- Personalization engine: $80,000
- Clinical partnerships (3 studies): $120,000
- Neuropod Pro launch: $50,000

**Total 3-Year Budget:** $608,000

**Expected Revenue (3 years):**
- Membership: $300,000 (500 members × $50/month avg × 12 months)
- Clinical licensing: $150,000 (3 clinics × $50k/year)
- Research grants: $100,000 (institutional partnerships)
**Total Revenue:** $550,000

**Net Position Year 3:** -$58,000 (seed funding requirement)
**Break-even:** Month 38 (if membership grows to 750+ members)

---

## Final Commitment: Evidence + Safety + Integration

**We are building:**
1. **Tier 1 protocols** that anyone can use safely (HRV, stress, sleep)
2. **Tier 2 protocols** that require developmental readiness (ASSR, somatic)
3. **Tier 3 protocols** that stay experimental until clinical validation

**We are NOT building:**
- "Digital DMT" or breakthrough simulators
- Open-ended intensity ramps without safety rails
- Protocols that claim universal efficacy
- Tools that replace therapy or medical care

**We are integrating:**
- Neuropod biometrics with MAIA developmental architecture (Bloom, Field Safety, Archetypal Work)
- Closed-loop control with evidence-based protocols
- Real-time safety monitoring with reality-testing frameworks
- Membership tiers with protocol access (Foundation → Explorer → Pioneer)

**The result:**
A developmentally-aware, biometrically-validated consciousness navigation platform that supports users where they are, challenges them appropriately, and protects them from overwhelm.

---

**Document Status:** Complete (Appendices A-E added)
**Approval Required:** Engineering, Clinical, Legal, Pioneer Circle Review
**Next Action:** Circulate to stakeholders, finalize Year 1 budget allocation, begin hardware procurement

---

END OF DOCUMENT
