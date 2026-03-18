-- Migration: member Nostr identity
-- Adds nostr_pubkey to members table for sovereign messaging layer.
-- Private keys are NEVER stored server-side — only the public key.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS nostr_pubkey VARCHAR(64),
  ADD COLUMN IF NOT EXISTS nostr_registered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_members_nostr_pubkey
  ON members(nostr_pubkey)
  WHERE nostr_pubkey IS NOT NULL;

COMMENT ON COLUMN members.nostr_pubkey IS
  'Nostr public key (hex, 64 chars). Private key never stored server-side — lives in member device only.';

COMMENT ON COLUMN members.nostr_registered_at IS
  'When the member first registered their Nostr public key with the relay.';
