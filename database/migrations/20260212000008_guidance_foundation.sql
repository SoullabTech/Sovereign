-- Contextual Guidance System (Phase 1)
-- Content registry + feature mapping + member state + structural signals
--
-- Foundation for in-app contextual guidance.
-- Content at multiple depths (tooltip → micro → deep → article)
-- surfaced inline next to features, not in a separate help center.

BEGIN;

-- -------------------------------------------------------------------
-- guidance_content: registry of content at multiple depths
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guidance_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,              -- e.g. "maia/sanctuary/tooltip-what-is"
  title TEXT NOT NULL,
  summary TEXT NOT NULL,                  -- short 1-2 sentence blurb
  depth TEXT NOT NULL CHECK (depth IN ('tooltip', 'micro', 'deep', 'article')),
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'personal', 'practice', 'admin')),
  feature_key TEXT NOT NULL,              -- e.g. "maia.sanctuary", "studio.field"
  body_md TEXT,                           -- markdown body (Phase 2+)
  video_url TEXT,                         -- self-hosted video path (Phase 2+)
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_rank INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guidance_content_feature_depth
  ON guidance_content(feature_key, depth, sort_rank);

CREATE INDEX IF NOT EXISTS idx_guidance_content_enabled
  ON guidance_content(is_enabled);

-- -------------------------------------------------------------------
-- guidance_feature_map: optional M:N mapping (future-proof)
-- Phase 1 relies on guidance_content.feature_key directly,
-- but the map exists for richer cross-feature mapping later.
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guidance_feature_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL,
  guidance_content_id UUID NOT NULL REFERENCES guidance_content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_key, guidance_content_id)
);

CREATE INDEX IF NOT EXISTS idx_guidance_feature_map_feature
  ON guidance_feature_map(feature_key);

-- -------------------------------------------------------------------
-- guidance_member_state: per-member "seen/dismissed" tracking
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guidance_member_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  guidance_content_id UUID NOT NULL REFERENCES guidance_content(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unseen', 'seen', 'dismissed', 'saved')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, guidance_content_id)
);

CREATE INDEX IF NOT EXISTS idx_guidance_member_state_member
  ON guidance_member_state(member_id);

-- -------------------------------------------------------------------
-- guidance_signals: structural confusion signals (NO content capture)
-- Sanctuary boundary enforced in application logic.
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guidance_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  feature_key TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'tooltip_open', 'learn_more_click', 'search_help', 'error_state'
  )),
  context TEXT,             -- structural context only (e.g. "studio.field", "maia")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guidance_signals_feature_time
  ON guidance_signals(feature_key, created_at DESC);

-- -------------------------------------------------------------------
-- Seed initial tooltip content
-- -------------------------------------------------------------------
INSERT INTO guidance_content (slug, title, summary, depth, feature_key, sort_rank)
VALUES
  (
    'maia/sanctuary/tooltip-what-is',
    'Sanctuary Mode',
    'Sanctuary is present-tense only. Nothing is stored or learned from what you share here.',
    'tooltip',
    'maia.sanctuary',
    10
  ),
  (
    'studio/field/tooltip-what-is',
    'Field Mode',
    'Field is your living orientation map: what''s alive, what moved, and what''s emerging.',
    'tooltip',
    'studio.field',
    10
  ),
  (
    'oracle/iching/tooltip-what-is',
    'Changes',
    'The Changes space uses I Ching wisdom to help you navigate what is shifting in your life.',
    'tooltip',
    'oracle.iching',
    10
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
