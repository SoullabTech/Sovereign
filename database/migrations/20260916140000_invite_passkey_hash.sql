-- SOURCE-CUSTODY-PII-01 · R12
-- Pending invitation credentials become one-way lookup hashes. Plaintext is
-- returned exactly once by the create request and is never recoverable later.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS passkey_hash TEXT;

DO $$
DECLARE weak_pending INTEGER;
BEGIN
  SELECT count(*) INTO weak_pending
  FROM invites
  WHERE status = 'pending'
    AND passkey IS NOT NULL
    AND passkey !~ '^SOULLAB-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$';

  IF weak_pending > 0 THEN
    RAISE EXCEPTION 'R12 refused: % pending invite credential(s) are not strong-format; adjudicate rather than hash compromised material', weak_pending;
  END IF;
END $$;

UPDATE invites
SET passkey_hash = encode(
  digest('soullab-invite-v1:' || upper(btrim(passkey)), 'sha256'),
  'hex'
)
WHERE status = 'pending'
  AND passkey IS NOT NULL
  AND passkey_hash IS NULL;

ALTER TABLE invites ALTER COLUMN passkey DROP NOT NULL;
UPDATE invites SET passkey = NULL WHERE passkey IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_passkey_hash
  ON invites(passkey_hash) WHERE passkey_hash IS NOT NULL;

ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_passkey_hash_shape;
ALTER TABLE invites ADD CONSTRAINT invites_passkey_hash_shape
  CHECK (passkey_hash IS NULL OR passkey_hash ~ '^[0-9a-f]{64}$');

ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_pending_hash_required;
ALTER TABLE invites ADD CONSTRAINT invites_pending_hash_required
  CHECK (status <> 'pending' OR passkey_hash IS NOT NULL);

-- Plaintext is not merely unused by current code; the database refuses it.
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_plaintext_forbidden;
ALTER TABLE invites ADD CONSTRAINT invites_plaintext_forbidden
  CHECK (passkey IS NULL);

COMMENT ON COLUMN invites.passkey IS 'Legacy plaintext invite credential. R12 clears it and new writes leave it NULL.';
COMMENT ON COLUMN invites.passkey_hash IS 'SHA-256(soullab-invite-v1: + normalized high-entropy credential); deterministic lookup only.';
