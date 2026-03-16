-- Session Council Synthesis
-- Three-lens post-session analysis: psychological, Spiralogic, symbolic.
-- Practitioner-triggered (manual), editable before saving.
-- Never auto-generated — human judgment governs what gets saved.

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS council_synthesis_psychological TEXT,
  ADD COLUMN IF NOT EXISTS council_synthesis_spiralogic    TEXT,
  ADD COLUMN IF NOT EXISTS council_synthesis_symbolic      TEXT,
  ADD COLUMN IF NOT EXISTS council_synthesis_final         TEXT,
  ADD COLUMN IF NOT EXISTS council_synthesis_generated_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS council_synthesis_saved_at      TIMESTAMPTZ;

COMMENT ON COLUMN sessions.council_synthesis_psychological IS 'AI-generated psychological pass (editable). Defenses, affect, dynamics.';
COMMENT ON COLUMN sessions.council_synthesis_spiralogic    IS 'AI-generated Spiralogic pass (editable). Element, phase, motion signals.';
COMMENT ON COLUMN sessions.council_synthesis_symbolic      IS 'AI-generated symbolic pass (editable). Archetypes, images, mythic resonance.';
COMMENT ON COLUMN sessions.council_synthesis_final         IS 'Practitioner-authored final synthesis after editing all three passes.';
COMMENT ON COLUMN sessions.council_synthesis_generated_at  IS 'When the three AI passes were last generated.';
COMMENT ON COLUMN sessions.council_synthesis_saved_at      IS 'When the practitioner last saved the final synthesis.';
