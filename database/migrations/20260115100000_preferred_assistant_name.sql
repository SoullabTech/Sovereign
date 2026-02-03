-- Migration: Add preferred_assistant_name to member_settings
-- Purpose: Allow members to choose what name MAIA uses to refer to herself
-- Internally she remains MAIA for logs, safety, and governance

ALTER TABLE member_settings
ADD COLUMN IF NOT EXISTS preferred_assistant_name VARCHAR(100) DEFAULT 'MAIA';

COMMENT ON COLUMN member_settings.preferred_assistant_name
IS 'Member-chosen name for MAIA (e.g., Maya, Aria, Sage). Internally remains MAIA for system integrity.';
