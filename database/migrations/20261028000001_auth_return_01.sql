BEGIN;

-- AUTH-RETURN-01
-- Durable email-code challenges and one-use registration proofs.
-- Raw six-digit codes and raw registration proofs are never stored.

CREATE TABLE IF NOT EXISTS auth_email_challenges (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    purpose TEXT NOT NULL CHECK (purpose = 'authenticate'),
    code_digest TEXT NOT NULL CHECK (length(code_digest) = 64),
    request_key_digest TEXT NOT NULL CHECK (length(request_key_digest) = 64),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'refused', 'ambiguous', 'superseded', 'claimed', 'expired')),
    provider TEXT,
    provider_message_id TEXT,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    settled_at TIMESTAMPTZ,
    smtp_reserved_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    CHECK (attempts <= max_attempts)
);

-- Durable sender reservations count attempted sends, including refusals and
-- unknown delivery. They are independent of the best-effort delivery ledger.
ALTER TABLE auth_email_challenges ADD COLUMN IF NOT EXISTS smtp_reserved_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS auth_email_challenges_smtp_capacity_idx
    ON auth_email_challenges (smtp_reserved_at)
    WHERE smtp_reserved_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS auth_email_challenges_request_key_uq
    ON auth_email_challenges (email, purpose, request_key_digest);
CREATE INDEX IF NOT EXISTS auth_email_challenges_live_lookup_idx
    ON auth_email_challenges (email, purpose, settled_at DESC, created_at DESC)
    WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS auth_email_challenges_expiry_idx
    ON auth_email_challenges (expires_at)
    WHERE status IN ('pending', 'accepted');

CREATE TABLE IF NOT EXISTS auth_registration_proofs (
    id UUID PRIMARY KEY,
    challenge_id UUID NOT NULL UNIQUE
      REFERENCES auth_email_challenges(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose = 'register-email'),
    proof_digest TEXT NOT NULL UNIQUE CHECK (length(proof_digest) = 64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    consumed_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    CHECK (NOT (consumed_at IS NOT NULL AND revoked_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS auth_registration_proofs_expiry_idx
    ON auth_registration_proofs (expires_at)
    WHERE consumed_at IS NULL AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS auth_registration_proofs_email_idx
    ON auth_registration_proofs (email, created_at DESC);

COMMENT ON TABLE auth_email_challenges IS
  'AUTH-RETURN-01 email authentication challenges; code_digest is HMAC-SHA256, never a raw code';
COMMENT ON TABLE auth_registration_proofs IS
  'AUTH-RETURN-01 purpose-bound, one-use new-member registration authority; raw proof is never stored';

COMMIT;
