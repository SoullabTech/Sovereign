-- MEMBER-ACCESS-01 · STAGE 7A · P-1 — CONTACT CONTROL PROOFS
--
-- WHAT THIS IS
--   An APPEND-ONLY EVENT LEDGER recording a fact Soullab already proves and has
--   never written down: "this member proved control of this contact, at this time,
--   by this mechanism."
--
-- WHY IT EXISTS
--   The 2026-09-11 production census returned 0 of 92 members carrying any
--   verification evidence, while members demonstrably receive and use email codes
--   every day. That is a measurement failure, not a membership failure. Every
--   successful email-code sign-in proves control of an address and records nothing.
--
-- WHAT THIS IS NOT  (all three are load-bearing)
--   1. NOT a capability flag. There is no `verified` boolean here and there must
--      never be one. `members.has_webauthn = true` with zero credentials is the
--      worked example of why: capability duplicated into a flag drifts from its
--      substrate. Verification is DERIVED by asking this table a question.
--   2. NOT the target contact substrate. Stage 6 rules that contacts eventually
--      become a SET attached to identity. That model is not designed, and this
--      table must not settle it by accident. It is a bounded ledger that can later
--      be migrated to reference a contact id without ever having been an identity
--      authority.
--   3. NOT a deliverability record. Control proven at a time is not reachability
--      now — I-18: deliverability is temporal evidence, never a stored property.
--
-- OBSERVATION ONLY
--   Nothing in the authentication path reads this table. Adding observability must
--   never be able to stop authentication — the same doctrine the delivery ledger
--   states for mail, applied one layer up.

CREATE TABLE IF NOT EXISTS public.contact_control_proofs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- WHEN. The observation time, not a validity window: this row asserts an event,
  -- never a state that persists.
  observed_at       timestamptz NOT NULL DEFAULT NOW(),

  -- WHO. The durable member identity. Cascades because a proof about a deleted
  -- member is not evidence about anybody.
  member_id         uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,

  -- WHICH CONTACT. Keyed HMAC via lib/email/ledger/fingerprint.ts — the same
  -- primitive and the same key the delivery ledger uses, so a verification event
  -- and a delivery event about one address can be correlated later WITHOUT this
  -- table ever storing an address. That shared key is P-2's join point, arrived at
  -- without inventing a contact id.
  --
  -- NULLABLE on purpose: when no fingerprint key is configured the helper returns
  -- null rather than writing a reversible unsalted digest. A proof with no contact
  -- attribution is still a proof about the member, and dropping the row to protect
  -- an attribution we cannot compute would discard the evidence this table exists
  -- to collect.
  contact_kind      text NOT NULL CHECK (contact_kind IN ('email')),
  contact_fingerprint             text,
  contact_fingerprint_key_version integer,

  -- HOW. Recorded because "verified" without a mechanism is the mistake
  -- members.email_verified already made: it means "passed through one particular
  -- route" while reading as a universal fact.
  mechanism         text NOT NULL CHECK (mechanism IN (
                      'email_code',              -- a 6-digit code was entered correctly
                      'magic_link',              -- a magic link was clicked
                      'email_verification_token' -- the token-link flow completed
                    )),
  mechanism_version text NOT NULL,

  -- PROVENANCE. Which surface observed it, so a future reader can tell where an
  -- event came from without guessing.
  observed_by       text
);

CREATE INDEX IF NOT EXISTS idx_ccp_member_observed
  ON public.contact_control_proofs (member_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ccp_fingerprint
  ON public.contact_control_proofs (contact_fingerprint)
  WHERE contact_fingerprint IS NOT NULL;

COMMENT ON TABLE public.contact_control_proofs IS
  'MEMBER-ACCESS-01 P-1. Append-only proof-of-control events. Observation only: no authentication decision may read this table. Not a capability flag, not the contact substrate, not a deliverability record.';
