# Neuropod DMT Mathematics Validation Experiments

**Version:** 1.0
**Date:** December 17, 2025
**Status:** Experimental Protocol Design
**Based on:** Andres Gomez Emilsson (QRI) DMT mathematics research

---

## Overview

These experiments validate the coupled oscillator / topological defect framework for consciousness state navigation. We test whether mathematical predictions from psychedelic phenomenology research apply to sober biometric-driven state modulation.

---

## Experiment 1: Coherence Predicts State Quality

### Hypothesis

**H₁:** Global synchrony (phase coherence) predicts subjective state quality better than traditional band power metrics.

### Rationale

Andres's research shows 5-MeO-DMT unity states correlate with perfect global synchrony (all oscillators phase-locked). If consciousness operates as coupled oscillator field, coherence should be primary metric.

### Method

**Participants:** N = 30 (Neuropod users with EEG)

**Protocol:**
1. 20-minute CALM session (target: alpha coherence)
2. Record every second:
   - Traditional: alpha/theta/beta/gamma power
   - Novel: global synchrony, frontal-parietal coherence
3. Post-session rating (1-5): "How calm did you feel?"

**Analysis:**
- Correlation: `calmRating ~ globalSynchrony`
- Correlation: `calmRating ~ alphaPower`
- Compare R² values

### Prediction

`globalSynchrony` will have R² > 0.6
`alphaPower` will have R² < 0.4

**If confirmed:** Coherence is superior metric for state quality

---

## Experiment 2: Topological Defects Predict Overwhelm

### Hypothesis

**H₂:** Spike in phase vortex count precedes subjective overwhelm by 30-60 seconds.

### Rationale

Andres: DMT overwhelm = defects proliferating faster than they annihilate. If true, defect density spike should predict overwhelm before user feels it.

### Method

**Participants:** N = 50 (Neuropod users with EEG)

**Protocol:**
1. BREAKTHROUGH session (high intensity, expect some overwhelm)
2. User has "STOP" button if overwhelmed
3. Record every second:
   - Phase vortex count
   - Defect density
   - Defect annihilation rate
4. Mark timestamp of any "STOP" presses

**Analysis:**
- Time-series analysis: Does defect density spike 30-60s before STOP?
- Sensitivity/specificity of defect-based overwhelm detection
- ROC curve for different thresholds

### Prediction

Defect density > 0.3 will predict 80% of overwhelm events with 30-60s warning.

**If confirmed:** Topological metrics enable preemptive safety intervention

---

## Experiment 3: Annealing Pathways Optimize Outcomes

### Hypothesis

**H₃:** Gradual intensity ramps (annealing schedule) produce better integration than abrupt transitions.

### Rationale

Neural annealing theory: gradual heating/cooling allows consciousness to explore and crystallize in optimal configurations. Thermal shock causes overwhelm.

### Method

**Participants:** N = 40 (Neuropod users)

**Design:** A/B randomized

**Group A (Annealing):**
- Session: CALM (5min) → FOCUS (8min) → DEPTH (12min) → INTEGRATION (10min)
- Smooth intensity gradients (max 0.1/min)

**Group B (Abrupt):**
- Session: CALM (5min) → DEPTH (20min, jump to high intensity) → INTEGRATION (10min)
- Abrupt jump from 0.2 → 0.7 intensity

**Measures:**
1. During: Overwhelm events (safety interventions)
2. Post-session: Integration rating (1-5)
3. 24h later: Insight retention (open-ended + keyword analysis)

**Analysis:**
- t-test: `integrationRating(A) vs. integrationRating(B)`
- χ² test: Overwhelm frequency
- Qualitative coding of 24h insights

### Prediction

Group A (annealing):
- Higher integration rating (M > 4.0)
- Fewer overwhelm events (< 10%)
- More retained insights at 24h

**If confirmed:** Annealing schedules are optimal for consciousness navigation

---

## Experiment 4: Field Alignment Predicts Valence

### Hypothesis

**H₄:** Field alignment score correlates with post-session positive valence ratings.

### Rationale

Symmetry Theory of Valence: aligned field lines = bliss, sheared = suffering. If geometry determines phenomenology, alignment should predict how good it felt.

### Method

**Participants:** N = 60 (Neuropod users with EEG)

**Protocol:**
1. Random state session (CALM, FOCUS, or DEPTH)
2. Record every second:
   - Field alignment score
   - Field shear stress
   - Predicted valence (from geometry)
3. Post-session: Valence rating (-5 to +5, negative = unpleasant, positive = pleasant)

**Analysis:**
- Regression: `valenceRating ~ avgFieldAlignment + avgShearStress`
- Test whether predicted_valence tracks actual valence

### Prediction

`fieldAlignment` will positively predict valence (β > 0.5, p < 0.01)
`shearStress` will negatively predict valence (β < -0.4, p < 0.01)

**If confirmed:** Field geometry causally determines phenomenal valence

---

## Experiment 5: Breakthrough = Global Synchrony > 0.95

### Hypothesis

**H₅:** Subjective "breakthrough" experiences correlate with global synchrony > 0.95.

### Rationale

Andres: 5-MeO-DMT unity state = all oscillators perfectly synchronized. If Neuropod can induce > 0.95 synchrony, users should report breakthrough phenomenology.

### Method

**Participants:** N = 20 (advanced Neuropod users, experienced meditators)

**Protocol:**
1. BREAKTHROUGH session (optimized for synchrony)
2. Record every second: global synchrony
3. Post-session interview:
   - "Did you experience unity/oneness?" (yes/no)
   - "Describe the peak moment."
4. Independent raters code phenomenology for:
   - Ego dissolution
   - Timelessness
   - Oceanic boundlessness
   - Unity with universe

**Analysis:**
- Correlation: `unityRating ~ maxGlobalSynchrony`
- Threshold analysis: What synchrony level reliably produces breakthrough?

### Prediction

Sessions with `maxGlobalSynchrony > 0.95` will have:
- 80%+ report unity experience
- High phenomenology ratings (M > 4.0)

Sessions with `maxGlobalSynchrony < 0.8` will have:
- < 20% report unity
- Low phenomenology ratings (M < 2.5)

**If confirmed:** Global synchrony is mechanism of breakthrough states

---

## Experiment 6: Time Loop Detection in Repetitive Stimulation

### Hypothesis

**H₆:** Repetitive binaural beat patterns induce time loop phenomenology detectable via phase cycling.

### Rationale

Andres: psychedelics + repetitive music → time loop (pseudo-time arrow wraps around). If consciousness has temporal structure based on phase differences, repetition should create loops.

### Method

**Participants:** N = 30 (Neuropod users)

**Protocol:**
1. Session with highly repetitive stimulation (same binaural beat, 30min)
2. Record:
   - Phase history (detect cycling patterns)
   - Time loop detection algorithm output
3. Every 5 minutes, ask: "Does time feel normal or looped?"

**Analysis:**
- Correlation: `timeLoopDetection (algorithm) ~ userReport (looped)`
- Temporal dynamics: Does phase pattern repeat every N seconds?

### Prediction

When algorithm detects time loop (repeating phase pattern):
- 70%+ users report "time feels looped"

When no loop detected:
- < 15% users report looped feeling

**If confirmed:** Phenomenal time is generated by phase pattern structure

---

## Data Collection Infrastructure

### Required Instrumentation

**EEG:** OpenBCI Ganglion (4-channel minimum) or Ultracortex (8-channel ideal)

**Channels:**
- Fp1, Fp2 (frontal)
- C3, C4 (central/motor)
- O1, O2 (occipital)
- Reference: earlobes or mastoid

**Sampling Rate:** ≥ 256 Hz (for gamma detection)

**Additional Sensors:**
- HRV: Polar H10 or Emotibit
- EDA: Emotibit
- Movement: Built-in accelerometer

### Database Schema Extensions

Already implemented in `20251217000001_add_coherence_metrics.sql`:
- `neuropod_biometric_timeseries`: Coherence metrics
- `neuropod_session_coherence_summary`: Aggregate stats
- Functions: `compute_session_coherence_summary()`, `get_latest_coherence_metrics()`

### Automated Analysis Pipeline

```typescript
// Post-session processing
async function analyzeSession(sessionId: string) {
  // 1. Compute coherence summary
  await query('SELECT compute_session_coherence_summary($1)', [sessionId]);

  // 2. Generate safety analytics
  const safetyAnalytics = safetyPredictor.getSafetyAnalytics();

  // 3. Correlate with user ratings
  const userRating = await getUserSessionRating(sessionId);

  // 4. Store for research
  await storeExperimentalData({
    sessionId,
    coherenceSummary,
    safetyAnalytics,
    userRating
  });
}
```

---

## Analysis Plan

### Statistical Methods

**Correlation Analysis:**
- Pearson r for continuous variables
- Spearman ρ for ordinal ratings
- Partial correlation controlling for session duration

**Regression:**
- Multiple regression for valence prediction
- Hierarchical regression (compare models)

**Time Series:**
- Cross-correlation for lag detection (defects → overwhelm)
- Granger causality tests

**Classification:**
- ROC curves for overwhelm prediction
- Sensitivity/specificity at different thresholds

### Data Visualization

**Primary Plots:**
1. Scatter: `globalSynchrony vs. stateQualityRating`
2. Time series: `defectDensity over time` (with overwhelm markers)
3. Trajectory: `temperature over session` (annealing curves)
4. Heatmap: `fieldAlignment matrix` (spatial coherence)

**Interactive Dashboards:**
- Real-time coherence monitor during sessions
- Post-session playback with annotations
- Aggregate analytics across all users

---

## Success Criteria

### Minimum Viable Validation

**To proceed with public deployment, need:**

1. **Experiment 1:** R² > 0.5 for coherence predicting state quality ✅
2. **Experiment 2:** 60%+ overwhelm prediction accuracy with 30s warning ✅
3. **Experiment 3:** Annealing shows 20%+ improvement over abrupt ✅

### Full Validation

**For research publication:**

1. All 6 experiments with p < 0.01
2. Replication in independent lab
3. Cross-cultural validation (Western vs. non-Western participants)
4. Comparison to traditional psychedelics (if legal)

---

## Ethical Considerations

### Informed Consent

Participants must understand:
- This is experimental validation of novel theory
- Biometric data will be analyzed for research
- Sessions may include intensities that cause mild discomfort
- Right to stop at any time

### Safety Protocols

**Pre-screening:**
- No seizure history
- No severe mental health conditions
- No psychosis risk factors

**During Session:**
- Trained facilitator present
- Emergency stop button
- Safety predictor actively monitoring
- Maximum session: 45 minutes

**Post-session:**
- Integration support available
- 24h follow-up contact
- Crisis hotline provided

### Data Privacy

- All biometric data anonymized
- Participant IDs encrypted
- No identifying information in publications
- Data retention: 2 years, then delete

---

## Timeline

### Phase 1: Pilot (3 months)
- N = 10 participants per experiment
- Validate data collection pipeline
- Refine algorithms based on real data

### Phase 2: Full Study (6 months)
- N = 30-60 per experiment
- Collect sufficient power for p < 0.01
- Interim analysis at 50% completion

### Phase 3: Replication (3 months)
- Independent lab attempts replication
- Cross-validate findings

### Phase 4: Publication (3 months)
- Write papers for peer review
- Submit to:
  - *Consciousness and Cognition*
  - *Frontiers in Human Neuroscience*
  - *Journal of Psychopharmacology*

**Total Time:** 15-18 months from start to publication

---

## Budget Estimate

**Equipment:** $5,000
- 10x OpenBCI Ganglion kits
- 5x Emotibit sensors
- 3x Polar H10 HRV monitors

**Participant Compensation:** $15,000
- $50/session × 300 total sessions

**Personnel:** $80,000
- Research coordinator (part-time, 18 months)
- Data analyst (contract)
- Facilitators (hourly)

**Analysis & Publication:** $10,000
- Statistical software licenses
- Publication fees (open access)

**Total:** ~$110,000

**Potential Funding Sources:**
- MAPS (Multidisciplinary Association for Psychedelic Studies)
- Heffter Research Institute
- Tiny Blue Dot Foundation
- Science of Consciousness grants

---

## Expected Outcomes

### If Hypotheses Confirmed

**Scientific Impact:**
- First validation of coupled oscillator consciousness model
- Novel framework for biometric state navigation
- Predictive safety system for consciousness work

**Practical Impact:**
- Optimized Neuropod session planning
- Preemptive overwhelm prevention
- Personalized intensity calibration

**Philosophical Impact:**
- Evidence consciousness has field-like properties
- Topological structure of qualia
- Phenomenology-first approach to neuroscience

### If Hypotheses Rejected

**Still Valuable:**
- Null results teach us what doesn't work
- May discover alternative mechanisms
- Rigorous data for future meta-analysis

---

## Contact & Collaboration

**Research Lead:** [Your Name]
**Institution:** Soullab / MAIA-SOVEREIGN Project
**Ethics Board:** [To be determined]

**Interested in Collaborating?**
- Email: [research@soullab.org]
- Provide: Background, proposed contribution, IRB status

**Open Science Commitment:**
- All data will be publicly released (anonymized)
- Analysis code open-sourced on GitHub
- Preregistration on OSF before data collection

---

## References

**Andres Gomez Emilsson (Qualia Research Institute):**
- [Pseudo-Time Arrow](https://qualiacomputing.com/2016/11/19/the-pseudo-time-arrow/)
- [Neural Annealing](https://opentheory.net/2019/11/neural-annealing/)
- [Symmetry Theory of Valence](https://opentheory.net/2017/04/folding-fields/)
- [Psychedelic Replication Tool](https://replicationindex.com/)

**Consciousness Field Theory:**
- Tononi & Koch (2015). *Consciousness: here, there and everywhere?* Phil. Trans. R. Soc. B.
- Friston (2010). *The free-energy principle: a unified brain theory?* Nature Reviews Neuroscience.

**Psychedelic Neuroscience:**
- Carhart-Harris et al. (2014). *The entropic brain*. Frontiers in Human Neuroscience.
- Ly et al. (2018). *Psychedelics promote structural and functional neural plasticity*. Cell Reports.

---

**Let's validate whether consciousness is truly a coupled oscillator field.**

*The capacity to navigate consciousness scientifically is now within reach.*
