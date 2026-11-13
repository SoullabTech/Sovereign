-- STUDIO-A-LA-CARTE-01 Phase 3 — invitations for each Studio's own front door. Built dark.
--
-- Founder rulings: R1/R2 2026-11-12 (docs/programme/STUDIO-A-LA-CARTE-01_FOUNDER_RULING_R1_2026-11-12.md);
-- sign-up is invitation-gated, no open registration (founder choice 2026-11-13).
--
-- An invitation lets a person create a normal Soullab member account at a Studio's door
-- (writer./sound./guide./astrology.soullab.life) without the AIN beta passkey — the same shape as the
-- Now What? door, where the invitation is the gate. It does NOT admit anyone into a Studio: each Studio's
-- own gate (beta roster, allowlist, grant log, entitlement) still decides entry, unchanged.
--
-- Only SHA-256 hashes of each code and of the invited email are stored; the code itself is shown once to the issuer.
-- Nothing reads or writes these tables unless STUDIO_DOORWAYS_ENABLED = 'true'.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS studio_doorway_invitations (
  id          BIGSERIAL PRIMARY KEY,
  studio      TEXT        NOT NULL CHECK (studio IN ('writer', 'sound', 'guide', 'astrology')),
  code_hash   TEXT        NOT NULL UNIQUE CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  -- The invitation is bound to the address it was sent to (SHA-256 of the lower-cased email; never the address).
  -- Registration must use that address, so an invitation cannot be used to claim someone else's email.
  email_sha256 TEXT       NOT NULL CHECK (email_sha256 ~ '^[0-9a-f]{64}$'),
  max_uses    INTEGER     NOT NULL DEFAULT 1 CHECK (max_uses BETWEEN 1 AND 500),
  uses        INTEGER     NOT NULL DEFAULT 0 CHECK (uses >= 0 AND uses <= max_uses),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  issued_by   TEXT        NOT NULL CHECK (char_length(issued_by) BETWEEN 1 AND 200),
  note        TEXT        CHECK (note IS NULL OR char_length(note) <= 300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which door a member came through. Provenance only; it grants nothing.
-- Erasing a member removes their redemption with them (R20).
CREATE TABLE IF NOT EXISTS studio_doorway_redemptions (
  id             BIGSERIAL PRIMARY KEY,
  invitation_id  BIGINT      NOT NULL REFERENCES studio_doorway_invitations(id),
  member_id      UUID        NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  studio         TEXT        NOT NULL CHECK (studio IN ('writer', 'sound', 'guide', 'astrology')),
  redeemed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_studio_doorway_redemptions_invitation
  ON studio_doorway_redemptions (invitation_id);

COMMENT ON TABLE studio_doorway_invitations IS
  'STUDIO-A-LA-CARTE-01: invitation codes (hash only) for a Studio doorway sign-up. Admits no one into a Studio.';
COMMENT ON TABLE studio_doorway_redemptions IS
  'STUDIO-A-LA-CARTE-01: which Studio door a member joined through. Provenance only.';

COMMIT;
