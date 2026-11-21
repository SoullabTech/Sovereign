-- MAIL-R1 / Soul Portrait: consent-specific, capacity-reserved delivery attempts.
-- Default OFF in application; mail owner + independent Class A and migration review required.
-- No recipient address or portrait text is stored here.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.soul_portrait_delivery_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portrait_id uuid NOT NULL REFERENCES public.soul_portraits(id) ON DELETE CASCADE,
  actor_member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  recipient_fingerprint text NOT NULL CHECK (recipient_fingerprint ~ '^[a-f0-9]{64}$'),
  recipient_key_version integer NOT NULL CHECK (recipient_key_version > 0),
  consent_source text NOT NULL CHECK (consent_source IN ('verbal', 'written')),
  recipient_consent_attested boolean NOT NULL CHECK (recipient_consent_attested = TRUE),
  subject_share_attested boolean NOT NULL CHECK (subject_share_attested = TRUE),
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_soul_portrait_delivery_capacity
  ON public.soul_portrait_delivery_attestations (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_soul_portrait_delivery_owner_capacity
  ON public.soul_portrait_delivery_attestations (actor_member_id, recorded_at DESC);
COMMENT ON TABLE public.soul_portrait_delivery_attestations IS
  'Private portrait recipient-specific consent attestation and conservative SMTP attempt reservation; keyed recipient fingerprints only; cascading deletion.';

COMMIT;
