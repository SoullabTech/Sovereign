-- F4 / privacy: delivery agreement is address-specific, unlike subject consent
-- for a portrait as a whole. This additive audit has no plaintext addresses.
-- Append-only: no UPDATE/DELETE path in application code.
CREATE TABLE IF NOT EXISTS public.soul_portrait_delivery_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portrait_id uuid NOT NULL REFERENCES public.soul_portraits(id) ON DELETE CASCADE,
  actor_member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  recipient_fingerprint text NOT NULL CHECK (recipient_fingerprint ~ '^[a-f0-9]{64}$'),
  recipient_key_version integer NOT NULL CHECK (recipient_key_version > 0),
  consent_source text NOT NULL CHECK (consent_source IN ('verbal','written')),
  subject_share_attested boolean NOT NULL CHECK (subject_share_attested = TRUE),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_portrait_delivery_attestation_portrait
  ON public.soul_portrait_delivery_attestations(portrait_id, recorded_at DESC);
COMMENT ON TABLE public.soul_portrait_delivery_attestations IS
  'Practitioner-attested recipient-specific delivery authority; not subject consent. Keyed pseudonyms; no raw recipient email stored.';
