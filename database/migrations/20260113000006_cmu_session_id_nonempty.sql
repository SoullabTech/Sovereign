-- Enforce non-empty session_id in conversation_memory_uses
-- Prevents empty string session_ids from being inserted
-- Complements the NOT NULL constraint already in place
--
-- This matches the constraint added to ain_shape_telemetry

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversation_memory_uses_session_id_nonempty'
  ) THEN
    ALTER TABLE conversation_memory_uses
    ADD CONSTRAINT conversation_memory_uses_session_id_nonempty
    CHECK (length(trim(session_id)) > 0);
  END IF;
END $$;
