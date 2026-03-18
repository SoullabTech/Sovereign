-- NOSTR CHANNELS (NIP-29 Group Foundation)
-- Migration: 20260310000003_nostr_channels.sql
-- Phase 3: predefined community channels.
-- Access control is role/membership based at the application layer.
-- Future: strfry write policy can enforce group membership at the relay level.

CREATE TABLE IF NOT EXISTS nostr_channels (
  id           VARCHAR(64) PRIMARY KEY,     -- slug (e.g. 'cohort', 'practitioners')
  name         VARCHAR(100) NOT NULL,
  about        TEXT,                        -- channel description
  channel_type VARCHAR(20) NOT NULL,        -- cohort | practitioners | retreat | alumni
  is_open      BOOLEAN NOT NULL DEFAULT true,   -- open = any registered member can join
  relay_url    VARCHAR(200) NOT NULL DEFAULT 'wss://nostr.soullab.life',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members actively participating in a channel
CREATE TABLE IF NOT EXISTS nostr_channel_memberships (
  channel_id   VARCHAR(64) NOT NULL REFERENCES nostr_channels(id) ON DELETE CASCADE,
  member_id    UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL DEFAULT 'member', -- member | moderator | admin
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_nostr_ch_memberships_member
  ON nostr_channel_memberships(member_id);

-- ─── Seed predefined Soullab channels ────────────────────────────────────────

INSERT INTO nostr_channels (id, name, about, channel_type, is_open) VALUES
  ('cohort',
   'Cohort',
   'General community space — open to all Soullab members.',
   'cohort',
   true),

  ('practitioners',
   'Practitioners',
   'Private channel for verified practitioners. Confidential practice exchange.',
   'practitioners',
   false),

  ('retreat',
   'Retreat',
   'Active retreat participants. Added by facilitators.',
   'retreat',
   false),

  ('alumni',
   'Alumni',
   'Graduates of Soullab cohorts and retreats.',
   'alumni',
   false)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE nostr_channels IS
  'Predefined NIP-29 community channels. Messages published as kind 9 events with h tag.';
COMMENT ON COLUMN nostr_channels.is_open IS
  'Open channels allow any registered Nostr member to join automatically.';
