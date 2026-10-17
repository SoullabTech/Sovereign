-- R65 · Conventional manuscript import once-only confirmations. ADDITIVE,
-- NOT installed in production by source inclusion. Requires a separately
-- approved storage, backup, consent and migration plan before live use.
--
-- The permanent receipt is NON-CONTENT: only the member and random UUID.
-- Active request fingerprints are in a SECOND row that cascades on Work
-- deletion, so a spent/deleted confirmation cannot retain a payload digest.
-- Same-member/same-UUID concurrent retries serialize via the primary key.
BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_import_confirmations (
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 confirmation_id uuid NOT NULL,
 manuscript_id uuid REFERENCES member_manuscripts(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (member_id, confirmation_id)
);

CREATE INDEX IF NOT EXISTS idx_manuscript_import_confirmations_manuscript
 ON manuscript_import_confirmations(manuscript_id)
 WHERE manuscript_id IS NOT NULL;

-- The only content-derived metadata lives as long as the manuscript does.
-- This table is neither a plaintext Source nor member-controlled authority.
CREATE TABLE IF NOT EXISTS manuscript_import_active_payloads (
 member_id uuid NOT NULL,
 confirmation_id uuid NOT NULL,
 manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
 request_sha256 text NOT NULL
  CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (member_id, confirmation_id),
 FOREIGN KEY (member_id, confirmation_id)
  REFERENCES manuscript_import_confirmations(member_id, confirmation_id)
  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_manuscript_import_payloads_manuscript
 ON manuscript_import_active_payloads(manuscript_id);

COMMENT ON TABLE manuscript_import_confirmations IS
 'Non-content tombstone of one writer-confirmed Save. When the manuscript is deleted the receipt survives with a null manuscript_id, preventing an old network retry from recreating the Work.';
COMMENT ON TABLE manuscript_import_active_payloads IS
 'Exact confirmed request digest retained ONLY while the source Work exists. ON DELETE CASCADE removes this content-derived fingerprint, while the separate opaque confirmation receipt remains as a tombstone. Not a cryptographic erasure or backup guarantee.';
COMMIT;
