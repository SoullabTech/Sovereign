-- MAIA NOSTR IDENTITY (Phase 4 Foundation)
-- Migration: 20260310000004_maia_nostr_delegation.sql
--
-- MAIA participates in Nostr as a first-class entity using a tiered key model:
--
--   Root keypair  (offline / cold storage — never in this DB or any app env)
--   ├── Oracle service key       (NIP-26 delegated, hot, 90-day rotation)
--   ├── Support service key      (NIP-26 delegated, hot)
--   ├── Retreat service key      (NIP-26 delegated, hot)
--   └── Practitioner bridge key  (NIP-26 delegated, hot)
--
-- Service privkeys are stored in Docker secrets / env vars.
-- Delegation tokens are signed offline by the root key and stored here.
-- The delegation token is a Schnorr signature — NOT a secret.

-- ─── Service key registry ────────────────────────────────────────────────────
-- Stores the pubkey for each service role. Privkey is in the env var.
-- e.g. MAIA_ORACLE_SERVICE_PRIVKEY, MAIA_SUPPORT_SERVICE_PRIVKEY, etc.

CREATE TABLE IF NOT EXISTS maia_nostr_service_keys (
  service_role   VARCHAR(32) PRIMARY KEY,
    -- oracle | support | retreat | practitioner_bridge
  pubkey_hex     VARCHAR(64) NOT NULL,
    -- hex pubkey of the hot service key
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE maia_nostr_service_keys IS
  'Registry of MAIA hot service key pubkeys. Private keys are in env vars, never in DB.';

-- ─── NIP-26 delegation certificates ─────────────────────────────────────────
-- Generated offline (scripts/generate-maia-delegation.ts) by operator.
-- Root key is NEVER needed by the running application — only this token is.

CREATE TABLE IF NOT EXISTS maia_nostr_delegation_certs (
  id              SERIAL PRIMARY KEY,
  service_role    VARCHAR(32)  NOT NULL REFERENCES maia_nostr_service_keys(service_role),
  root_pubkey     VARCHAR(64)  NOT NULL,
    -- MAIA root identity pubkey (hex) — the public face of MAIA on Nostr
  service_pubkey  VARCHAR(64)  NOT NULL,
    -- Hot service key pubkey (must match maia_nostr_service_keys.pubkey_hex)
  conditions      TEXT         NOT NULL,
    -- NIP-26 condition string, e.g. 'kind=1&created_at>1700000000&created_at<1708000000'
  delegation_token VARCHAR(128) NOT NULL,
    -- Schnorr signature of sha256("nostr:delegation:{servicePubkey}:{conditions}")
    -- signed by the root private key — 64 bytes = 128 hex chars
  valid_since     BIGINT       NOT NULL,  -- unix timestamp (from conditions)
  valid_until     BIGINT       NOT NULL,  -- unix timestamp (from conditions)
  active          BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maia_nostr_deleg_role_active
  ON maia_nostr_delegation_certs(service_role, active)
  WHERE active = true;

COMMENT ON TABLE maia_nostr_delegation_certs IS
  'NIP-26 delegation certificates. Generated offline by root key. '
  'Runtime app only needs these tokens — root key stays in cold storage.';

COMMENT ON COLUMN maia_nostr_delegation_certs.delegation_token IS
  'Schnorr signature (128 hex chars) of sha256(''nostr:delegation:{servicePubkey}:{conditions}'') '
  'by the root private key. Not secret. Rotate by inserting new cert and deactivating old.';
