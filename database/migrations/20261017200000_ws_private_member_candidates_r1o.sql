-- R1O — server-only encrypted, member-authored PRIVATE editorial candidates.
-- REVIEW ONLY: do not apply to production without independent migration,
-- key rotation/backup, encrypted Work and authenticated release approval.
-- NO provider proposals, author Apply/Undo, or public routes are added here.
-- Proposed words and selected original text are inside authenticated AES-GCM
-- ciphertext, never columns, logs, hashes or browser supplied authorizations.
BEGIN;
CREATE TABLE IF NOT EXISTS ws_private_member_candidates_r1o (
 id UUID PRIMARY KEY,
 member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 manuscript_id UUID NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
 living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
 draft_id UUID NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
 section_id UUID NOT NULL REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
 base_version INTEGER NOT NULL CHECK (base_version >= 1),
 consent_seq BIGINT NOT NULL CHECK (consent_seq >= 1),
 policy_sha256 TEXT NOT NULL CHECK (policy_sha256 ~ '^[0-9a-f]{64}$'),
 author_assertion TEXT NOT NULL DEFAULT 'member' CHECK (author_assertion = 'member'),
 key_id UUID NOT NULL,
 cipher_envelope JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT ws_r1o_cipher_has_fields CHECK (
  jsonb_typeof(cipher_envelope) = 'object'
  AND cipher_envelope ?& ARRAY['protocol','keyId','iv','tag','ciphertext']
 )
);
CREATE INDEX IF NOT EXISTS ws_r1o_member_work_idx
 ON ws_private_member_candidates_r1o(member_id,manuscript_id,created_at DESC);

-- Historical candidate content is immutable. Ownership/consent and revision
-- fitness are checked afresh at read; no UPDATE can quietly change its text.
-- Explicit member erasure or deletion may DELETE, with retained backups dealt
-- with independently. A database-admin trigger bypass is not covered here.
CREATE OR REPLACE FUNCTION ws_private_member_candidate_r1o_no_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'private_candidate_is_immutable' USING ERRCODE='23514';
END;
$$;
DROP TRIGGER IF EXISTS ws_r1o_candidate_no_update
 ON ws_private_member_candidates_r1o;
CREATE TRIGGER ws_r1o_candidate_no_update
 BEFORE UPDATE ON ws_private_member_candidates_r1o
 FOR EACH ROW EXECUTE FUNCTION ws_private_member_candidate_r1o_no_update();
COMMIT;
