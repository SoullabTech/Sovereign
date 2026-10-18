-- R1Q — review-only wrapped-key registry for member-owned Writer's Studio Works.
-- No real provider, KMS key, credentials, decrypt authority or production GO.
-- The table NEVER stores a plaintext AES/Work key. A separately managed and
-- qualified KMS provider must unwrap the opaque `wrapped_key` outside SQL.
-- R1Q is READ ONLY; no runtime key-generation or rotation code is mounted.
-- All contextual provider inputs must be nonsensitive, keyed opaque digests,
-- NEVER member UUIDs, writing, emails, filenames or Work titles.
-- The original Source, private proposal, and beta consent laws remain in force.
BEGIN;

-- Allows the DB itself to refuse rows with an owned manuscript ID but a
-- different member ID, even if application authorization fails someday.
CREATE UNIQUE INDEX IF NOT EXISTS member_manuscripts_r1q_owner_ref
 ON member_manuscripts(id,member_id);

CREATE TABLE IF NOT EXISTS ws_managed_work_key_wrappings_r1q (
 member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 manuscript_id UUID NOT NULL,
 key_epoch BIGINT NOT NULL CHECK (key_epoch >= 1),
 key_id UUID NOT NULL,
 provider TEXT NOT NULL CHECK (provider='external_managed_kms'),
 provider_key_ref TEXT NOT NULL
   CHECK (length(provider_key_ref) BETWEEN 8 AND 240),
 opaque_work_digest TEXT NOT NULL
   CHECK (opaque_work_digest ~ '^[0-9a-f]{64}$'),
 wrapped_key BYTEA NOT NULL
   CHECK (octet_length(wrapped_key) BETWEEN 48 AND 8192),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY (member_id,manuscript_id,key_epoch),
 UNIQUE (member_id,manuscript_id,key_id),
 CONSTRAINT ws_r1q_canonical_member_work_fk
   FOREIGN KEY(manuscript_id,member_id)
   REFERENCES member_manuscripts(id,member_id)
   ON UPDATE RESTRICT ON DELETE CASCADE
);

-- A wrapped key record cannot be quietly overwritten to point at a different
-- customer, provider, ciphertext or epoch. Future provider-backed rotation
-- will add a new epoch in an independently reviewed owner-locked transaction.
CREATE OR REPLACE FUNCTION ws_r1q_wrapped_key_no_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'managed_work_key_record_immutable' USING ERRCODE='23514';
END;
$$;
DROP TRIGGER IF EXISTS ws_r1q_wrapped_key_no_update
 ON ws_managed_work_key_wrappings_r1q;
CREATE TRIGGER ws_r1q_wrapped_key_no_update
 BEFORE UPDATE ON ws_managed_work_key_wrappings_r1q
 FOR EACH ROW EXECUTE FUNCTION ws_r1q_wrapped_key_no_update();

COMMENT ON TABLE ws_managed_work_key_wrappings_r1q IS
 'R1Q REVIEW ONLY: ciphertext-wrapped Work keys, never plaintext. Not a production provider or live release.';
COMMIT;
