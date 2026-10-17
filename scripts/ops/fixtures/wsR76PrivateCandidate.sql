-- R76 FICTIONAL PENDING PRIVATE CANDIDATE ONLY.
-- NEVER put this SQL in database/migrations. No production deployment.
-- A sealed *prepublication* candidate is NOT a proposal_versions row and
-- cannot be displayed as an authored published revision or used for Apply.
BEGIN;
CREATE TABLE ws_r76_fixture_pending_private (
 reserved_version_id uuid PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
 draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
 section_id uuid NOT NULL REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
 base_version bigint NOT NULL CHECK (base_version >= 1),
 consent_sequence bigint NOT NULL CHECK (consent_sequence >= 1),
 policy_sha256 char(64) NOT NULL CHECK(policy_sha256 ~ '^[0-9a-f]{64}$'),
 instruction_contract_sha256 char(64) NOT NULL
   CHECK(instruction_contract_sha256 ~ '^[0-9a-f]{64}$'),
 key_id uuid NOT NULL,
 cipher_envelope jsonb NOT NULL,
 cipher_sha256 char(64) NOT NULL CHECK(cipher_sha256 ~ '^[0-9a-f]{64}$'),
 server_witness jsonb NOT NULL,
 witness_signature text NOT NULL CHECK(length(witness_signature) >= 80),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT r76_sealed_envelope_shape CHECK (
   cipher_envelope->>'protocol'='soullab.ws.work-recovery.v1'
   AND cipher_envelope->>'keyId'=key_id::text
   AND length(cipher_envelope->>'iv') BETWEEN 16 AND 32
   AND length(cipher_envelope->>'tag') BETWEEN 16 AND 32
   AND length(cipher_envelope->>'ciphertext')>0
 )
);
CREATE INDEX ws_r76_pending_owner
 ON ws_r76_fixture_pending_private(member_id,manuscript_id,draft_id);
CREATE OR REPLACE FUNCTION ws_r76_pending_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP<>'INSERT' THEN
   RAISE EXCEPTION 'R76 sealed pending candidates are immutable';
 END IF;
 IF NOT EXISTS (
  SELECT 1 FROM member_manuscripts m
  JOIN manuscript_working_drafts d ON d.manuscript_id=m.id
   AND d.member_id=m.member_id AND d.id=NEW.draft_id
  JOIN manuscript_draft_sections s ON s.draft_id=d.id
   AND s.id=NEW.section_id
  WHERE m.id=NEW.manuscript_id AND m.member_id=NEW.member_id
   AND d.version=NEW.base_version AND d.section_addressable_at IS NOT NULL
 ) THEN
  RAISE EXCEPTION 'R76 pending candidate owner/draft/section/version mismatch';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER ws_r76_private_pending_immutable
 BEFORE INSERT OR UPDATE OR DELETE ON ws_r76_fixture_pending_private
 FOR EACH ROW EXECUTE FUNCTION ws_r76_pending_guard();
REVOKE ALL ON ws_r76_fixture_pending_private FROM PUBLIC;
COMMENT ON TABLE ws_r76_fixture_pending_private IS
 'FICTIONAL prepublication sealed candidate: no plaintext prose, no executable authority, no MAIA turn claimed, no production migration.';
COMMIT;
