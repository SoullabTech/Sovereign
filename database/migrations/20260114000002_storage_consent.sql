-- Add server-side storage consent to member_settings
-- This makes consent authoritative (server-enforced, not client-trusting)

ALTER TABLE member_settings
ADD COLUMN IF NOT EXISTS storage_consent JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN member_settings.storage_consent IS 'Server-authoritative storage consent flags: { audioServer, audioLocal, conversationsServer, journalsServer, ... }';

-- Note: The shape stored is:
-- {
--   "audioServer": false,
--   "audioLocal": true,
--   "conversationsServer": true,
--   "conversationsLocal": true,
--   "journalsServer": true,
--   "journalsLocal": true,
--   "memoriesServer": true,
--   "memoriesLocal": true,
--   "insightsServer": true,
--   "insightsLocal": true
-- }
