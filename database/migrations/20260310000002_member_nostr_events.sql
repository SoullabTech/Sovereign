-- NOSTR EVENT CACHE
-- Migration: 20260310000002_member_nostr_events.sql
-- Phase 2 foundation: stores encrypted gift-wrap event metadata per member.
-- Content remains encrypted (only the member can decrypt with their private key).
-- Used by Phase 4 (MAIA involvement) and Phase 5 (offline/retreat sync).
-- Phase 2 reads directly from the relay; this table is populated in later phases.

CREATE TABLE IF NOT EXISTS member_nostr_events (
  id            BIGSERIAL PRIMARY KEY,
  member_id     UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_id      VARCHAR(64) NOT NULL,
  event_kind    SMALLINT    NOT NULL,
  peer_pubkey   VARCHAR(64),          -- For DMs: the other party's pubkey
  raw_event     JSONB       NOT NULL, -- Encrypted gift-wrap (content NOT decrypted)
  event_ts      BIGINT      NOT NULL, -- Nostr event timestamp (unix seconds)
  inserted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, event_id)
);

-- Fast thread lookup per member
CREATE INDEX IF NOT EXISTS idx_nostr_events_member_peer
  ON member_nostr_events(member_id, peer_pubkey)
  WHERE peer_pubkey IS NOT NULL;

-- Chronological per-member listing
CREATE INDEX IF NOT EXISTS idx_nostr_events_member_ts
  ON member_nostr_events(member_id, event_ts DESC);

COMMENT ON TABLE member_nostr_events IS
  'Encrypted Nostr event cache. Raw events remain encrypted — decryption happens client-side only.';
COMMENT ON COLUMN member_nostr_events.raw_event IS
  'Full JSON of the gift-wrap event (kind 1059). Content field is NIP-44 ciphertext.';
