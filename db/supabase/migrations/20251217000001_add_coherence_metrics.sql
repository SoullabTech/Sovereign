-- Neuropod Coherence Metrics Extension
-- Adds coupled oscillator, topological, and thermodynamic metrics to biometric timeseries
-- Based on Andres Gomez Emilsson's DMT mathematics research (Qualia Research Institute)

-- ============================================================================
-- Extend Biometric Timeseries with Advanced Consciousness Metrics
-- ============================================================================

-- Phase Coupling Metrics (coupled oscillator model)
ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  frontal_parietal_coherence FLOAT,  -- Phase sync between frontal and parietal (attention/integration)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  left_right_hemisphere_sync FLOAT,  -- Interhemispheric coherence (integration)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  cortical_subcortical_coupling FLOAT,  -- Cortex-thalamus coupling (depth)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  alpha_theta_phase_lock FLOAT,  -- Cross-frequency coupling

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  global_synchrony FLOAT;  -- Overall phase coherence (0-1)

-- Topological Metrics (defect detection)
ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  phase_vortex_count INTEGER,  -- Number of topological defects (pinwheels)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  defect_density FLOAT,  -- Defects per unit "area" of consciousness

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  defect_annihilation_rate FLOAT,  -- Rate defects are resolving (Hz)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  field_alignment_score FLOAT,  -- How parallel are field lines (0-1, 1=bliss)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  field_shear_stress FLOAT;  -- Perpendicular forces (0-1, high=suffering)

-- Thermodynamic Metrics (psychedelic thermodynamics)
ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  eeg_spectral_entropy FLOAT,  -- Disorder in frequency spectrum

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  free_energy_estimate FLOAT,  -- Variational free energy (Karl Friston)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  consciousness_temperature FLOAT,  -- Metaphorical "heat" (flexibility)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  attractor_strength FLOAT;  -- How strongly pulled to target state

-- Temporal Phenomenology Metrics (pseudo-time arrow)
ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  tracer_length_estimate FLOAT,  -- Working memory depth (seconds)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  time_dilation_factor FLOAT,  -- Phenomenal/physical time ratio

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  time_loop_detected BOOLEAN DEFAULT FALSE;  -- Repetitive state cycling

-- Valence Prediction Metrics (geometry of pleasure/pain)
ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  predicted_valence FLOAT,  -- Predicted pleasure (-1) to pain (+1)

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  coherent_bliss FLOAT,  -- Synchrony component of positive valence

ALTER TABLE neuropod_biometric_timeseries ADD COLUMN IF NOT EXISTS
  dissonant_stress FLOAT;  -- Anti-phase component of negative valence


-- ============================================================================
-- Aggregate Session-Level Coherence Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS neuropod_session_coherence_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES neuropod_sessions(id) ON DELETE CASCADE,

  -- Coherence averages
  avg_global_synchrony FLOAT,
  max_global_synchrony FLOAT,
  coherence_stability FLOAT,  -- Inverse of variance

  -- Topological summary
  total_defects_created INTEGER,
  total_defects_annihilated INTEGER,
  peak_defect_density FLOAT,
  time_to_zero_defects_seconds FLOAT,  -- Time to perfect symmetry (if achieved)

  -- Thermodynamic summary
  avg_consciousness_temperature FLOAT,
  temperature_trajectory JSONB,  -- [{time: 0, temp: 0.3}, {time: 60, temp: 0.7}, ...]
  annealing_quality_score FLOAT,  -- How well did heating/cooling cycle work (0-1)

  -- Valence summary
  avg_predicted_valence FLOAT,
  valence_stability FLOAT,
  peak_bliss_timestamp FLOAT,  -- When did peak positive valence occur
  peak_stress_timestamp FLOAT,  -- When did peak negative valence occur

  -- State quality
  state_coherence_achieved BOOLEAN,  -- Did target state reach high coherence?
  breakthrough_detected BOOLEAN,  -- Perfect global synchrony achieved?
  overwhelm_predicted BOOLEAN,  -- Topological overwhelm detected?

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_neuropod_coherence_session ON neuropod_session_coherence_summary(session_id);


-- ============================================================================
-- Update Session Table with Summary Flags
-- ============================================================================

ALTER TABLE neuropod_sessions ADD COLUMN IF NOT EXISTS
  coherence_computed BOOLEAN DEFAULT FALSE;

ALTER TABLE neuropod_sessions ADD COLUMN IF NOT EXISTS
  breakthrough_achieved BOOLEAN DEFAULT FALSE;  -- Perfect global synchrony

ALTER TABLE neuropod_sessions ADD COLUMN IF NOT EXISTS
  topological_overwhelm BOOLEAN DEFAULT FALSE;  -- Defect density exceeded safe threshold


-- ============================================================================
-- Functions for Coherence Analysis
-- ============================================================================

-- Compute session coherence summary
CREATE OR REPLACE FUNCTION compute_session_coherence_summary(p_session_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_summary_id UUID;
  v_avg_sync FLOAT;
  v_max_sync FLOAT;
  v_defects_created INTEGER;
  v_defects_annihilated INTEGER;
  v_breakthrough BOOLEAN;
BEGIN
  -- Calculate aggregates
  SELECT
    AVG(global_synchrony),
    MAX(global_synchrony),
    SUM(phase_vortex_count) FILTER (WHERE phase_vortex_count > COALESCE(LAG(phase_vortex_count) OVER (ORDER BY elapsed_seconds), 0)),
    SUM(GREATEST(0, COALESCE(LAG(phase_vortex_count) OVER (ORDER BY elapsed_seconds), 0) - phase_vortex_count))
  INTO v_avg_sync, v_max_sync, v_defects_created, v_defects_annihilated
  FROM neuropod_biometric_timeseries
  WHERE session_id = p_session_id;

  -- Detect breakthrough (global synchrony > 0.95)
  v_breakthrough := v_max_sync > 0.95;

  -- Insert summary
  INSERT INTO neuropod_session_coherence_summary (
    session_id,
    avg_global_synchrony,
    max_global_synchrony,
    total_defects_created,
    total_defects_annihilated,
    breakthrough_detected
  ) VALUES (
    p_session_id,
    v_avg_sync,
    v_max_sync,
    COALESCE(v_defects_created, 0),
    COALESCE(v_defects_annihilated, 0),
    v_breakthrough
  ) RETURNING id INTO v_summary_id;

  -- Update session flags
  UPDATE neuropod_sessions
  SET
    coherence_computed = TRUE,
    breakthrough_achieved = v_breakthrough
  WHERE id = p_session_id;

  RETURN v_summary_id;
END;
$$;


-- Get latest coherence metrics for session
CREATE OR REPLACE FUNCTION get_latest_coherence_metrics(p_session_id UUID)
RETURNS TABLE (
  global_synchrony FLOAT,
  phase_vortex_count INTEGER,
  field_alignment_score FLOAT,
  predicted_valence FLOAT,
  consciousness_temperature FLOAT,
  elapsed_seconds FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nbt.global_synchrony,
    nbt.phase_vortex_count,
    nbt.field_alignment_score,
    nbt.predicted_valence,
    nbt.consciousness_temperature,
    nbt.elapsed_seconds
  FROM neuropod_biometric_timeseries nbt
  WHERE nbt.session_id = p_session_id
  ORDER BY nbt.elapsed_seconds DESC
  LIMIT 1;
END;
$$;


-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE neuropod_session_coherence_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coherence summaries"
  ON neuropod_session_coherence_summary FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM neuropod_sessions WHERE user_id = auth.uid()
    )
  );


-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN neuropod_biometric_timeseries.global_synchrony IS
  'Overall phase coherence (0-1). Based on coupled oscillator model from QRI DMT research.';

COMMENT ON COLUMN neuropod_biometric_timeseries.phase_vortex_count IS
  'Number of topological defects (phase singularities). Andres: defects annihilate during 5-MeO-DMT unity states.';

COMMENT ON COLUMN neuropod_biometric_timeseries.field_alignment_score IS
  'Symmetry Theory of Valence: aligned field lines = bliss (1.0), sheared = suffering (0.0)';

COMMENT ON COLUMN neuropod_biometric_timeseries.consciousness_temperature IS
  'Psychedelic thermodynamics: metaphorical heat representing flexibility/energy of consciousness';

COMMENT ON TABLE neuropod_session_coherence_summary IS
  'Aggregate coherence metrics per session. Used for breakthrough detection and annealing quality assessment.';
