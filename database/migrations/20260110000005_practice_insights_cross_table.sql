-- Allow practice_insights to reference supervision_sessions
-- This enables Practice mode in /supervision to generate world-lensed insights
-- from supervision session transcripts

-- Drop the foreign key constraint that only allowed practice_sessions
ALTER TABLE practice_insights
DROP CONSTRAINT IF EXISTS practice_insights_session_id_fkey;

-- Add a comment explaining the change
COMMENT ON TABLE practice_insights IS 'Practice insights can reference either practice_sessions or supervision_sessions';
