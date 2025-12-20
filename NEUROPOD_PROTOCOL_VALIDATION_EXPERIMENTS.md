# Neuropod Protocol Validation Experiments

**Version:** 1.0
**Date:** December 17, 2025
**Status:** Experimental Design Document
**Based on:** NEUROPOD_PSYCHOACTIVATION_EVIDENCE_BASE.md

---

## Purpose

Validate the psychoactivation protocols in `protocolLibrary.ts` with rigorous experimental design. Each protocol has specific predictions about coherence changes - we test them empirically.

**Core Question:** Do our evidence-based protocols produce the expected biometric and subjective changes?

---

## General Experimental Framework

### Standard Protocol Structure

**All validation experiments follow this template:**

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Pre-Session (10 min)                               │
│  ├─ Informed consent                                         │
│  ├─ Safety screening                                         │
│  ├─ Baseline biometrics (5 min)                              │
│  └─ Subjective baseline ratings                              │
├─────────────────────────────────────────────────────────────┤
│ Phase 2: Intervention (15-30 min)                           │
│  ├─ Apply protocol stimulus                                  │
│  ├─ Real-time monitoring (coherence tracker + safety)        │
│  └─ Optional: mid-session subjective check                   │
├─────────────────────────────────────────────────────────────┤
│ Phase 3: Post-Session (10 min)                              │
│  ├─ Recovery biometrics (5 min, no stimulus)                 │
│  ├─ Subjective ratings (state quality, valence, integration) │
│  └─ Grounding protocol                                       │
├─────────────────────────────────────────────────────────────┤
│ Phase 4: Follow-Up (24h later)                              │
│  ├─ Email survey: mood, energy, lasting effects              │
│  └─ Integration quality rating                               │
└─────────────────────────────────────────────────────────────┘
```

### Comparison Groups

**All experiments use A/B or A/B/C design:**

- **Intervention:** The protocol being tested
- **Active Control:** Matched stimulus without target feature (e.g., music without binaural beat)
- **Passive Control:** Silence or eyes-closed rest

**Randomization:** Participants assigned randomly to groups (stratified by age, gender, meditation experience if sample size allows)

---

## Experiment 1: Breath-Paced Grounding

### Hypothesis

**H₁:** Breath-paced audio + haptic cues will increase HRV coherence more than unguided rest.

### Protocol

**Intervention Group (N=20):**
- 20 min session: Breath-paced grounding protocol (from `protocolLibrary.ts`)
- Audio chimes at inhale/exhale transitions
- Haptic pulse at exhale peak (0.1 Hz)
- Target: 4-2-6-2 breathing pattern

**Control Group (N=20):**
- 20 min session: Silence, eyes closed, no guidance
- Same duration and context

### Measures

**Primary Outcome:**
- HRV Coherence Score (0-1 scale)
- Measured via Polar H10 or Emotibit
- Pre/post comparison

**Secondary Outcomes:**
- Subjective calm rating (1-5): "How calm do you feel?"
- Respiration rate (should decrease to ~6 breaths/min)
- Defect density (from coherence tracker, should decrease)

### Predictions

**Intervention group:**
- HRV coherence increase: +0.15 (baseline ~0.35 → intervention ~0.50)
- Subjective calm: +1.2 points
- Respiration rate: decrease to 6 ± 1 breaths/min

**Control group:**
- HRV coherence increase: +0.05 (small rest effect)
- Subjective calm: +0.5 points
- Respiration rate: minimal change (~12 breaths/min)

**Statistical Test:**
- Independent samples t-test: Intervention vs. Control on HRV coherence delta
- Expected: t(38) > 2.0, p < 0.05, Cohen's d ~ 0.6

### Success Criteria

✅ **Validated if:**
- Intervention shows significantly higher HRV coherence increase than control (p < 0.05)
- Effect size ≥ 0.5 (moderate)
- At least 65% of intervention group participants are "responders" (HRV coherence > baseline + 0.10)

❌ **Null result if:**
- No significant difference between groups
- Effect size < 0.3
- Less than 50% responders

### Data Collection

```typescript
{
  userId: 'participant-001',
  experimentId: 'breath-paced-validation',
  group: 'intervention',
  baseline: {
    hrvCoherence: 0.34,
    respirationRate: 14.2,
    subjectiveCalmRating: 2,
  },
  intervention: {
    hrvCoherence: 0.52,
    respirationRate: 6.1,
    protocolAdherence: 0.95, // Did they follow the breath cues?
  },
  post: {
    subjectiveCalmRating: 4,
    valenceRating: 4,
    integrationRating: 3,
  },
  followUp24h: {
    moodRating: 4,
    energyRating: 3,
    lastingEffects: 'Felt calmer throughout the day',
  }
}
```

---

## Experiment 2: Alpha Relaxation (10 Hz Binaural Beat)

### Hypothesis

**H₂:** 10 Hz binaural beat will increase alpha power more than matched music without beat.

### Protocol

**Intervention Group (N=20):**
- 20 min session: 10 Hz binaural beat (200 Hz L, 210 Hz R) + nature soundscape
- EEG recording (OpenBCI Ganglion, minimum 4 channels)

**Active Control Group (N=20):**
- 20 min session: Same nature soundscape, both ears receive 205 Hz (no beat)
- Matched for everything except binaural beat

**Passive Control Group (N=20):**
- 20 min session: Silence, eyes closed

### Measures

**Primary Outcome:**
- Alpha power (8-12 Hz band) from EEG
- Computed from frontal + parietal electrodes
- Pre/post comparison

**Secondary Outcomes:**
- Frontal-parietal coherence (PLV in alpha band)
- Subjective relaxation rating (1-5)
- State absorption rating (1-5): "How absorbed were you in the experience?"

### Predictions

**Intervention group:**
- Alpha power increase: +0.12 (from coherence tracker validation)
- Frontal-parietal coherence: +0.08
- Subjective relaxation: +1.5 points

**Active control group:**
- Alpha power increase: +0.04 (small music effect)
- Frontal-parietal coherence: +0.02
- Subjective relaxation: +0.8 points

**Passive control group:**
- Alpha power increase: +0.02 (rest alone)
- Subjective relaxation: +0.5 points

**Statistical Test:**
- One-way ANOVA: Compare alpha power delta across 3 groups
- Post-hoc: Intervention vs. Active Control (key comparison)
- Expected: F(2,57) > 3.2, p < 0.05, partial η² > 0.15

### Success Criteria

✅ **Validated if:**
- Intervention > Active Control on alpha power (p < 0.05)
- Effect size ≥ 0.4 (accounting for variability)
- At least 60% responders in intervention group

⚠️ **Partial validation if:**
- Intervention > Passive Control but not > Active Control
- Suggests music alone has similar effect to binaural beat

❌ **Null result if:**
- No difference between Intervention and Active Control

### Individual Responder Analysis

**Key Question:** Who responds to binaural beats?

**Hypothesis:** Response may correlate with:
- Baseline alpha power (those with lower baseline respond more)
- Meditation experience (experienced meditators respond less, already have high alpha)
- Age (younger participants may respond more)

**Analysis:**
- Regression: `alphaPowerDelta ~ baselineAlpha + meditationExperience + age`
- Build responder profile: "Novice users with low baseline alpha are best responders"

---

## Experiment 3: Gamma Focus (40 Hz Entrainment)

### Hypothesis

**H₃:** 40 Hz multisensory stimulation will increase gamma power and improve attention task performance.

### Protocol

**Intervention Group (N=20):**
- 20 min session: 40 Hz binaural beat + 40 Hz light pulses (subtle amber modulation)
- During session: Attention task (Stroop test or n-back)
- EEG recording (need good gamma resolution, 256+ Hz sampling)

**Control Group (N=20):**
- 20 min session: 10 Hz stimulation (non-gamma control)
- Same attention task

### Measures

**Primary Outcomes:**
- Gamma power (30-50 Hz band) from EEG
- Attention task accuracy (% correct)
- Attention task reaction time (ms)

**Secondary Outcomes:**
- Global synchrony (should increase if gamma entrainment spreads)
- Subjective focus rating (1-5)
- ASSR magnitude at 40 Hz (phase-locking value)

### Predictions

**Intervention group:**
- Gamma power increase: +0.08
- Task accuracy: +5% improvement
- Reaction time: -50 ms (faster)
- ASSR at 40 Hz: PLV > 0.3 (confirms entrainment)

**Control group:**
- Gamma power: minimal change
- Task accuracy: +1% (practice effect)
- Reaction time: -20 ms

**Statistical Test:**
- Independent t-test on gamma power delta
- ANCOVA on task performance (covariate: baseline performance)
- Expected: t(38) > 2.0, p < 0.05, d ~ 0.5

### Safety Monitoring

**Critical for 40 Hz light stimulation:**
- Pre-screen for seizure history (exclude)
- Monitor for headache, visual discomfort during session
- Immediate stop if any discomfort reported
- Track adverse events carefully (should be 0)

### Success Criteria

✅ **Validated if:**
- Gamma power increase confirmed (p < 0.05)
- ASSR at 40 Hz confirmed (PLV > 0.3)
- Task performance improvement (p < 0.10, exploratory)

⚠️ **Partial validation if:**
- Gamma power increases but no behavioral effect
- Suggests entrainment occurs but doesn't impact cognition

---

## Experiment 4: Vibroacoustic Grounding

### Hypothesis

**H₄:** Low-frequency vibroacoustic stimulation (30 Hz) will reduce subjective stress more than silence.

### Protocol

**Intervention Group (N=20):**
- 20 min session: 30 Hz chest vibration + 80 Hz bass tones
- Vibroacoustic chair or haptic vest
- Stress induction pre-session: mental arithmetic task (Trier Social Stress Test - math component)

**Control Group (N=20):**
- 20 min session: Silence, seated rest
- Same stress induction

### Measures

**Primary Outcome:**
- Subjective stress rating (1-5): "How stressed do you feel?"
- Pre-stress, post-stress, post-intervention

**Secondary Outcomes:**
- EDA arousal (should decrease)
- Heart rate (should decrease)
- Cortisol (salivary, if budget allows - expensive but gold standard)
- Defect density (from coherence tracker)

### Predictions

**Intervention group:**
- Stress rating decrease: -1.8 points (from post-stress ~4.2 to post-intervention ~2.4)
- EDA decrease: -30%
- Heart rate decrease: -8 bpm

**Control group:**
- Stress rating decrease: -0.8 points (natural recovery)
- EDA decrease: -15%
- Heart rate decrease: -4 bpm

**Statistical Test:**
- Mixed ANOVA: Group × Time on stress rating
- Expected interaction: F(1,38) > 4.0, p < 0.05

### Success Criteria

✅ **Validated if:**
- Intervention shows greater stress reduction than control (p < 0.05)
- Effect size ≥ 0.4
- At least 60% of intervention participants report stress rating decrease ≥ 1 point

---

## Experiment 5: Wind-Up Crescendo (Phenomenology-Inspired)

### Hypothesis

**H₅:** Gradual frequency rise (0.5 Hz → 40 Hz) will increase spectral entropy more than flat 40 Hz stimulation, without increasing overwhelm.

### Protocol

**Intervention Group (N=20):**
- 20 min session: Wind-up crescendo protocol
  - Minutes 0-10: Gradual rise from 0.5 Hz to 40 Hz binaural beat
  - Minutes 10-15: Hold at 40 Hz
  - Minutes 15-20: Gradual descent back to 0.5 Hz
- Haptic "threshold pulse" at minute 10 (peak)

**Control Group (N=20):**
- 20 min session: Flat 40 Hz stimulation throughout
- No crescendo, constant intensity

### Measures

**Primary Outcomes:**
- Spectral entropy (from EEG, computed by coherence tracker)
- "Consciousness temperature" (thermodynamic metric)
- Safety predictor risk score (should stay < 0.6)

**Secondary Outcomes:**
- Subjective intensity rating (1-5): "How intense was the experience?"
- Integration rating (24h): "Did you gain insights from this session?"
- Overwhelm events (safety interventions triggered)

### Predictions

**Intervention group:**
- Spectral entropy increase: +0.30
- Temperature increase: +0.25
- Overwhelm events: < 10%
- Integration rating (24h): 3.8/5

**Control group:**
- Spectral entropy increase: +0.15
- Temperature increase: +0.10
- Overwhelm events: < 10%
- Integration rating: 3.0/5

**Statistical Test:**
- Independent t-test on spectral entropy delta
- χ² test on overwhelm event frequency (should be no difference - both safe)
- Expected: t(38) > 2.0, p < 0.05, d ~ 0.5

### Safety Focus

**This is an experimental protocol - safety is critical:**
- Continuous safety predictor monitoring (1 Hz)
- If risk score > 0.6 at any point: gentle fade intervention
- If risk score > 0.8: emergency stop
- Track all adverse events
- If overwhelm rate > 15%: protocol needs modification

### Success Criteria

✅ **Validated if:**
- Spectral entropy increase is significantly higher in intervention (p < 0.05)
- Overwhelm events ≤ 10% in both groups (safety validated)
- Integration rating significantly higher in intervention (supports "annealing is better" hypothesis)

❌ **Fails if:**
- Overwhelm events > 15% in intervention group (protocol is unsafe)
- No difference in spectral entropy (crescendo doesn't add value)

---

## Experiment 6: Annealing Pathway (Multi-Phase Session)

### Hypothesis

**H₆:** Multi-phase annealing pathway (CALM → DEPTH → INTEGRATION) will produce better integration outcomes than abrupt DEPTH-only session.

### Protocol

**Intervention Group (Annealing, N=20):**
- 30 min session:
  - 0-5 min: CALM (breath-paced grounding)
  - 5-15 min: Gradual rise to DEPTH (theta + gamma stimulation)
  - 15-25 min: Hold at DEPTH
  - 25-30 min: INTEGRATION (gentle cooling to alpha relaxation)
- Uses `annealingOptimizer.ts` for schedule generation

**Control Group (Abrupt, N=20):**
- 30 min session:
  - 0-25 min: Jump immediately to DEPTH, hold
  - 25-30 min: Brief INTEGRATION

### Measures

**Primary Outcome:**
- Integration rating (24h): "How well have you integrated insights from the session?" (1-5)

**Secondary Outcomes:**
- Overwhelm events during session (safety interventions)
- Subjective state quality rating (post-session, 1-5)
- Defect density trajectory (should increase smoothly in annealing, spike in abrupt)
- Temperature gradient (should stay < 0.15/min in annealing, may exceed in abrupt)

### Predictions

**Intervention group (Annealing):**
- Integration rating: 4.2/5
- Overwhelm events: < 5%
- State quality rating: 4.0/5
- Max temperature gradient: 0.12/min

**Control group (Abrupt):**
- Integration rating: 3.2/5
- Overwhelm events: 15-20%
- State quality rating: 3.4/5
- Max temperature gradient: 0.25/min (thermal shock)

**Statistical Test:**
- Independent t-test on integration rating: Expected t(38) > 2.5, p < 0.01, d ~ 0.8
- χ² test on overwhelm events: Expected χ²(1) > 3.84, p < 0.05

### Success Criteria

✅ **Validated if:**
- Annealing group shows 20%+ better integration than abrupt (validates neural annealing theory)
- Annealing group has significantly fewer overwhelm events (validates safety benefits)
- Temperature gradient stays within safe limits for annealing group

---

## Data Collection Infrastructure

### Required Hardware

**Minimum:**
- OpenBCI Ganglion (4-channel EEG)
- Polar H10 (HRV)
- Smartphone app for subjective ratings

**Ideal:**
- OpenBCI Ultracortex (8-channel EEG)
- Emotibit (HRV + EDA + movement)
- Haptic vest or chair
- Amber LED array

### Database Schema

**Extend `neuropod_biometric_timeseries`:**

```sql
ALTER TABLE neuropod_biometric_timeseries
ADD COLUMN IF NOT EXISTS protocol_id TEXT,
ADD COLUMN IF NOT EXISTS experiment_id TEXT,
ADD COLUMN IF NOT EXISTS participant_group TEXT; -- 'intervention' | 'control' | 'passive-control'
```

**New table for subjective ratings:**

```sql
CREATE TABLE neuropod_experiment_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES neuropod_sessions(id),
  experiment_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  timepoint TEXT NOT NULL, -- 'baseline' | 'post' | '24h'

  -- Subjective ratings
  calm_rating INTEGER CHECK (calm_rating BETWEEN 1 AND 5),
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5),
  absorption_rating INTEGER CHECK (absorption_rating BETWEEN 1 AND 5),
  valence_rating INTEGER CHECK (valence_rating BETWEEN -5 AND 5),
  integration_rating INTEGER CHECK (integration_rating BETWEEN 1 AND 5),
  stress_rating INTEGER CHECK (stress_rating BETWEEN 1 AND 5),

  -- Free-text
  lasting_effects TEXT,
  insights TEXT,
  adverse_events TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automated Analysis Pipeline

```typescript
// After each experimental session
async function processExperimentalSession(sessionId: string, experimentId: string) {
  // 1. Compute coherence summary
  await query('SELECT compute_session_coherence_summary($1)', [sessionId]);

  // 2. Get baseline and intervention snapshots
  const baseline = await getBaselineCoherence(sessionId);
  const intervention = await getInterventionCoherence(sessionId);

  // 3. Compute deltas
  const alphaDelta = intervention.phaseCoupling.alphaPower - baseline.phaseCoupling.alphaPower;
  const hrvDelta = intervention.hrvCoherence - baseline.hrvCoherence;
  const synchronyDelta = intervention.phaseCoupling.globalSynchrony - baseline.phaseCoupling.globalSynchrony;

  // 4. Store for analysis
  await storeExperimentalResults({
    sessionId,
    experimentId,
    alphaDelta,
    hrvDelta,
    synchronyDelta,
    safetyEvents: await getSafetyEvents(sessionId),
  });

  console.log('Experimental data processed:', {
    alphaDelta: alphaDelta.toFixed(3),
    hrvDelta: hrvDelta.toFixed(3),
    synchronyDelta: synchronyDelta.toFixed(3),
  });
}
```

---

## Statistical Analysis Plan

### Pre-Registration

**All experiments will be pre-registered on Open Science Framework (OSF) before data collection:**
- Hypotheses specified
- Sample size justified (power analysis: 80% power to detect d=0.5 at α=0.05 → N~32 per group)
- Analysis plan committed

### Analysis Steps

1. **Data Cleaning:**
   - Remove sessions with > 20% data loss
   - Check for outliers (±3 SD)
   - Verify randomization worked (baseline equivalence tests)

2. **Primary Analysis:**
   - Test main hypothesis (intervention vs. control on primary outcome)
   - Report: means, SDs, effect sizes, p-values, confidence intervals

3. **Secondary Analyses:**
   - Test secondary outcomes
   - Exploratory: moderator analyses (who responds?)

4. **Safety Analysis:**
   - Adverse event frequency
   - Overwhelm event rates
   - Risk score distributions

### Reporting Standards

**We commit to:**
- Report all outcomes (not just significant ones)
- Report effect sizes alongside p-values
- Publish null results if hypotheses are not supported
- Make data publicly available (anonymized)

---

## Timeline & Budget

### Phase 1 Validation (6 months)

**Months 1-2:**
- Experiment 1 (Breath-Paced Grounding): N=40
- Experiment 2 (Alpha Relaxation): N=60

**Months 3-4:**
- Experiment 3 (Gamma Focus): N=40
- Experiment 4 (Vibroacoustic Grounding): N=40

**Months 5-6:**
- Experiment 5 (Wind-Up Crescendo): N=40
- Experiment 6 (Annealing Pathway): N=40
- Data analysis, write-up

### Budget Estimate

**Equipment:** $8,000
- 5x OpenBCI Ganglion kits: $2,500
- 3x Emotibit sensors: $1,500
- 3x Polar H10: $900
- Haptic vests/LED arrays: $3,000
- Misc supplies: $100

**Participant Compensation:** $13,000
- $50/session × 260 total sessions

**Personnel:** $45,000
- Research coordinator (part-time, 6 months): $30,000
- Data analyst (contract): $10,000
- Facilitators (hourly, 260 sessions @ $20/hr × 1.5h): $7,800

**Total Phase 1:** ~$66,000

**Potential Funding:**
- Soullab internal R&D budget
- Crowdfunding (position as citizen science)
- Small grants (e.g., Tiny Blue Dot Foundation, Mind & Life Institute)

---

## Publication Strategy

### Target Journals

**Primary:**
1. *Frontiers in Human Neuroscience* - "Validation of Evidence-Based Psychoactivation Protocols with Closed-Loop Biometric Feedback"
2. *Consciousness and Cognition* - "Coherence-Based State Navigation: Validating Sensory Entrainment Predictions"

**Secondary (if results strong):**
1. *Nature Scientific Reports* - "Real-Time Biometric Validation of Auditory-Haptic Consciousness Modulation"

### Open Science Commitment

- Preregister on OSF
- Publish raw data on GitHub (anonymized)
- Open-source analysis code
- Publish even if results are null

---

## Success Metrics

### Minimum Viable Validation (To Proceed with Public Launch)

**Need at least:**
1. ✅ Experiment 1 (Breath-Paced) validated: HRV coherence improvement confirmed
2. ✅ Experiment 2 (Alpha Relaxation) partial validation: Works vs. passive control (even if not vs. active control)
3. ✅ No serious adverse events across all experiments (safety validated)

**If achieved:** We can claim "Research-backed protocols with measured effects on biometric markers"

### Full Validation (For Research Publication)

**Need:**
1. All 6 experiments with p < 0.05 on primary outcomes
2. Effect sizes match predictions (±0.2)
3. Safety profile excellent (adverse events < 2%)
4. Replication of at least 2 experiments in independent sample

---

## Ethical Safeguards

### Informed Consent Language

> "You are participating in research to validate psychoactivation protocols. These use sound, vibration, and light to modulate brain activity. You may experience altered perceptions, strong emotions, or discomfort. You can stop at any time. This is not medical treatment. If you have a seizure disorder, psychiatric condition, or are pregnant, you should not participate."

### Exclusion Criteria (All Experiments)

- Seizure history or epilepsy
- Active psychosis or mania
- Severe anxiety or PTSD (for DEPTH protocols only)
- Pregnancy (for vibroacoustic protocols)
- Age < 18 or > 75

### Adverse Event Protocol

**Any adverse event (discomfort, panic, headache, etc.):**
1. Immediate session stop
2. Facilitator provides grounding support
3. Document event in detail
4. Follow up within 24h
5. If severe: refer to mental health professional
6. Report to ethics board

**Stopping Rules:**
- If adverse event rate > 5% in any experiment: pause and review protocol
- If any serious adverse event (requires medical attention): immediate full review

---

## Conclusion

These 6 experiments will validate (or refute) our psychoactivation protocols with scientific rigor. We're not claiming "digital DMT" - we're claiming **measurable, modest, personalized effects** grounded in coherence tracking.

**The gamble:** If our protocols work as predicted, we leapfrog the "brainwave entrainment" pseudoscience market by being the first to validate effects rigorously.

**The backup:** Even null results are valuable - they tell us what doesn't work, inform protocol refinement, and establish Neuropod as a **scientific** consciousness platform.

**Let's measure what's real.**

---

**Files in This Integration:**

1. `NEUROPOD_PSYCHOACTIVATION_EVIDENCE_BASE.md` - Claims framework
2. `lib/neuropod/protocolLibrary.ts` - Protocol definitions
3. `NEUROPOD_PROTOCOL_VALIDATION_EXPERIMENTS.md` - This document

**Next:** Implement `psychoactivationEngine.ts` (the output generator)

✅ **EXPERIMENTAL PROTOCOLS DESIGNED**
