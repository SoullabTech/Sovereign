-- ASTRO-R4I / R20: isolated deletion-compatible, non-content origin custody.
-- NOT an approved production migration. Does NOT establish signed, independent
-- R20 deletion history, backup non-resurrection, or legal retention authority.
-- Must apply AFTER R4F, R4G and R4H origin migrations.
--
-- Separate a member-linked one-use bearer/digest grant (deletable personal data)
-- from the minimal, non-member-linked conversation_only session-origin marker.
-- A marker has an opaque session UUID only. It contains NO user/member ID,
-- passage text, token, text HMAC, birth record or derivation content.
-- Session IDs remain pseudonymous: retention/custody needs Class A adjudication.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE astro_maia_protected_origins (
  session_id TEXT PRIMARY KEY
    CHECK (session_id <> '' AND length(session_id) <= 128),
  origin_scope TEXT NOT NULL DEFAULT 'conversation_only'
    CHECK (origin_scope = 'conversation_only'),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Registration on an existing grant must happen BEFORE replacing the FK.
-- Future grant issuance registers in this table ATOMICALLY with grant insert.
INSERT INTO astro_maia_protected_origins (session_id, origin_scope)
  SELECT g.session_id, 'conversation_only'
    FROM astro_maia_transfer_grants AS g
  ON CONFLICT (session_id) DO NOTHING;

CREATE FUNCTION astro_r4i_register_protected_origin()
RETURNS TRIGGER LANGUAGE plpgsql AS $r4i$
BEGIN
  INSERT INTO astro_maia_protected_origins (session_id, origin_scope)
    VALUES (NEW.session_id, 'conversation_only')
    ON CONFLICT (session_id) DO NOTHING;
  RETURN NEW;
END
$r4i$;
CREATE TRIGGER astro_r4i_register_grant_origin
  AFTER INSERT ON astro_maia_transfer_grants
  FOR EACH ROW EXECUTE FUNCTION astro_r4i_register_protected_origin();

-- The origin must not lose its identity or disappear via a regular SQL
-- write/DELETE. The independently authorized R20 cleanup protocol, if any,
-- requires its OWN reviewed migration and signer controls.
CREATE FUNCTION astro_r4i_refuse_origin_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $r4i$
BEGIN
  RAISE EXCEPTION 'protected_origin_immutable' USING ERRCODE = '42501';
END
$r4i$;
CREATE TRIGGER astro_r4i_immutable_origin
  BEFORE UPDATE OR DELETE ON astro_maia_protected_origins
  FOR EACH ROW EXECUTE FUNCTION astro_r4i_refuse_origin_mutation();
CREATE TRIGGER astro_r4i_immutable_origin_truncate
  BEFORE TRUNCATE ON astro_maia_protected_origins
  FOR EACH STATEMENT EXECUTE FUNCTION astro_r4i_refuse_origin_mutation();

CREATE FUNCTION astro_r4i_refuse_grant_session_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $r4i$
BEGIN
  RAISE EXCEPTION 'grant_session_immutable' USING ERRCODE = '42501';
END
$r4i$;
CREATE TRIGGER astro_r4i_immutable_grant_session
  BEFORE UPDATE OF session_id ON astro_maia_transfer_grants
  FOR EACH ROW EXECUTE FUNCTION astro_r4i_refuse_grant_session_change();

-- This FK name/schema is exact for the frozen R4F migration. Fail closed if
-- another schema exists instead of relaxing an unexpected production FK.
DO $r4i$
DECLARE
  prior_fk TEXT;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO prior_fk
    FROM pg_constraint AS c
   WHERE c.conrelid = 'astro_maia_transfer_grants'::regclass
     AND c.conname = 'astro_maia_transfer_grants_member_id_fkey'
     AND c.contype = 'f';
  IF prior_fk IS NULL OR
     prior_fk NOT LIKE '%REFERENCES members(id)%' OR
     prior_fk NOT LIKE '%ON DELETE RESTRICT%' THEN
    RAISE EXCEPTION 'R4I unexpected grant/member FK definition: %', COALESCE(prior_fk,'missing');
  END IF;
END
$r4i$;

ALTER TABLE astro_maia_transfer_grants
  DROP CONSTRAINT astro_maia_transfer_grants_member_id_fkey;
ALTER TABLE astro_maia_transfer_grants
  ADD CONSTRAINT astro_maia_transfer_grants_member_id_fkey
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

COMMENT ON TABLE astro_maia_protected_origins IS
  'Non-content, no-member-FK conversation_only restriction surviving member/grant erasure. NOT an R20 independently signed tombstone or a complete restore proof.';
COMMENT ON COLUMN astro_maia_protected_origins.session_id IS
  'Pseudonymous opaque MAIA session identifier. Its privacy and retention require independent R20 review.';

COMMIT;
