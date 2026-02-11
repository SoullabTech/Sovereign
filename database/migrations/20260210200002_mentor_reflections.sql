-- Mentor Reflection Storage
--
-- When the practitioner clicks "Go deeper with MAIA", the AI-generated
-- mentor reflection is stored here so it doesn't need regenerating.
--
-- Shape: { questions: string[], sovereigntyCheck: string, nextExperiment: string, generatedAt: ISO }

ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS mentor_reflection JSONB;

-- Also store the practitioner's follow-up intention (lightweight next checkpoint)
-- Kept short: this is a sovereignty artifact, not AI-generated paperwork.
ALTER TABLE studio_decisions
  ADD COLUMN IF NOT EXISTS follow_up_intention VARCHAR(500);

COMMENT ON COLUMN studio_decisions.mentor_reflection IS
  'AI-generated mentor reflection (cached) — questions, sovereignty check, next experiment';
COMMENT ON COLUMN studio_decisions.follow_up_intention IS
  'Practitioner''s stated next checkpoint or intention after mentor reflection';
