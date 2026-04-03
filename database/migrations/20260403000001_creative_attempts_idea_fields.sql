-- Idea Field: Add columns to creative_attempts for heuristic idea capture
-- These support the idea detection → user confirmation → storage flow

ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
  -- 'conversation' = detected from oracle conversation
  -- 'manual' = user-initiated capture
ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS capture_mode TEXT DEFAULT 'manual';
  -- 'heuristic_confirmed' = heuristic detected + user confirmed
  -- 'manual' = user explicitly created
ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS confidence REAL;
  -- Heuristic confidence score (0-1) at time of detection
ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS conversation_id TEXT;
  -- Session ID of the conversation where the idea emerged
ALTER TABLE creative_attempts ADD COLUMN IF NOT EXISTS source_excerpt TEXT;
  -- Verbatim excerpt from user message that triggered detection
