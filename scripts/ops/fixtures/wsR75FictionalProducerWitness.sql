-- R75 FICTIONAL PG16 ONLY. Do not put this file in database/migrations.
-- One immutable, signed producer record for a proposal_versions.maia row.
-- Signed provider/model identity originates in the trusted model adapter;
-- merely setting author='maia' cannot satisfy its witness.
CREATE TABLE ws_r75_fixture_producer_witness (
 proposal_version_id uuid PRIMARY KEY
  REFERENCES proposal_versions(id) ON DELETE RESTRICT,
 proposal_chain_id uuid NOT NULL REFERENCES proposal_chains(id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 manuscript_id uuid NOT NULL,
 draft_id uuid NOT NULL,
 section_id uuid NOT NULL,
 base_version integer NOT NULL CHECK(base_version>0),
 consent_sequence bigint NOT NULL CHECK(consent_sequence>0),
 policy_sha256 char(64) NOT NULL CHECK(policy_sha256 ~ '^[0-9a-f]{64}$'),
 instruction_contract_sha256 char(64) NOT NULL
  CHECK(instruction_contract_sha256 ~ '^[0-9a-f]{64}$'),
 server_invocation_id uuid NOT NULL UNIQUE,
 served_provider text NOT NULL CHECK(served_provider IN ('ollama','anthropic')),
 served_model text NOT NULL CHECK(length(served_model)>0),
 intended_provider text NOT NULL CHECK(intended_provider IN ('ollama','anthropic')),
 intended_model text NOT NULL CHECK(length(intended_model)>0),
 divergence text NOT NULL CHECK(divergence IN ('none','capability','sovereignty')),
 proposal_commitment char(64) NOT NULL
  CHECK(proposal_commitment ~ '^[0-9a-f]{64}$'),
 signed_at_ms bigint NOT NULL CHECK(signed_at_ms>0),
 signature text NOT NULL CHECK(length(signature)>60),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION ws_r75_only_exact_verified_producer()
RETURNS trigger LANGUAGE plpgsql AS $witness$
BEGIN
 IF TG_OP<>'INSERT' THEN
  RAISE EXCEPTION 'R75 immutable producer witness cannot be changed';
 END IF;
 IF NOT EXISTS(
  SELECT 1 FROM proposal_versions v
  JOIN proposal_chains c ON c.id=v.chain_id
  WHERE v.id=NEW.proposal_version_id AND v.author='maia'
    AND c.id=NEW.proposal_chain_id AND c.member_id=NEW.member_id
    AND c.work_id=NEW.manuscript_id AND c.draft_id=NEW.draft_id
    AND c.target_section_id=NEW.section_id
    AND c.base_version=NEW.base_version
 ) THEN
  RAISE EXCEPTION 'R75 producer/owner/Work/version/author mismatch';
 END IF;
 RETURN NEW;
END $witness$;
CREATE TRIGGER ws_r75_producer_immutable
 BEFORE INSERT OR UPDATE OR DELETE ON ws_r75_fixture_producer_witness
 FOR EACH ROW EXECUTE FUNCTION ws_r75_only_exact_verified_producer();
REVOKE ALL ON ws_r75_fixture_producer_witness FROM PUBLIC;
COMMENT ON TABLE ws_r75_fixture_producer_witness IS
 'Fictional R75 only; a signed *server-observed* producing run, not a provider issued or production identity. No prose, prompts, credentials, approval tokens or raw model response.';
