-- Voice Sovereignty: Fallback Audit + Cloud Consent
-- Supports: fallback accounting, consent-gated cloud voice, policy transparency
--
-- Philosophy: "Keep me speaking, but tell me the truth when it isn't local."

-- ═══════════════════════════════════════════════════════════════
-- 1. Fallback audit log (append-only, fire-and-forget)
-- ═══════════════════════════════════════════════════════════════
-- Tracks every time the TTS router falls back from local to cloud.
-- Not surveillance — sovereignty accounting.

CREATE TABLE IF NOT EXISTS voice_fallback_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Who
  member_id     UUID REFERENCES members(id),
  anon_id       TEXT,
  session_id    TEXT,
  request_id    TEXT NOT NULL,

  -- What happened
  intended_provider   TEXT NOT NULL,   -- 'kokoro', 'sesame'
  actual_provider     TEXT NOT NULL,   -- 'openai', 'kokoro', etc.
  is_fallback         BOOLEAN NOT NULL DEFAULT true,
  reason              TEXT,            -- 'kokoro_timeout', 'kokoro_unhealthy', 'consent_denied', etc.

  -- Metrics
  latency_ms          INTEGER,
  audio_bytes         INTEGER,
  text_length         INTEGER,

  -- Flexible metadata
  meta                JSONB DEFAULT '{}',

  -- Constraints
  CHECK (member_id IS NOT NULL OR anon_id IS NOT NULL)
);

-- Query paths: "how often is fallback happening?" + "for which members?"
CREATE INDEX IF NOT EXISTS idx_voice_fallback_created
  ON voice_fallback_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_fallback_member
  ON voice_fallback_events (member_id, created_at DESC)
  WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_fallback_providers
  ON voice_fallback_events (intended_provider, actual_provider);

COMMENT ON TABLE voice_fallback_events IS
  'Append-only audit: every TTS provider fallback for sovereignty accounting';


-- ═══════════════════════════════════════════════════════════════
-- 2. Cloud voice consent (per-member preference)
-- ═══════════════════════════════════════════════════════════════
-- Default: true (auto mode — keep speaking, disclose when cloud)
-- When false: fail-closed — no cloud TTS even if local is down

ALTER TABLE member_settings
  ADD COLUMN IF NOT EXISTS allow_cloud_voice BOOLEAN DEFAULT true;

COMMENT ON COLUMN member_settings.allow_cloud_voice IS
  'When false, TTS fails closed rather than falling back to cloud. Default true (sovereignty-pragmatic).';


-- ═══════════════════════════════════════════════════════════════
-- 3. Global voice policy (system-level override)
-- ═══════════════════════════════════════════════════════════════
-- Allows admin to force-disable cloud fallback globally (e.g. during demos)

INSERT INTO system_settings (key, value, description)
VALUES (
  'voice_cloud_fallback_enabled',
  'true'::jsonb,
  'Global toggle: allow cloud TTS fallback when local is unavailable. When false, all members get fail-closed voice.'
)
ON CONFLICT (key) DO NOTHING;
