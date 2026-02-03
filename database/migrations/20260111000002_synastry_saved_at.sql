-- Synastry: add saved_at for "Save to Timeline" feature
-- When saved_at IS NOT NULL, the analysis appears in user's saved items

ALTER TABLE synastry_analyses
ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ NULL;

-- Fast "Saved" list for a member
CREATE INDEX IF NOT EXISTS idx_synastry_analyses_saved
ON synastry_analyses (requested_by_member_id, saved_at DESC)
WHERE saved_at IS NOT NULL;

COMMENT ON COLUMN synastry_analyses.saved_at IS 'When user explicitly saved to timeline (NULL = not saved)';
