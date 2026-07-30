-- ================================================
-- PRACTITIONER NOTES ON STUDIO CLIENTS (v1)
-- Migration: 20260730000001_practitioner_client_notes.sql
--
-- Private working notes a practitioner keeps on a Studio client
-- (practitioner_clients). NOT the Caseload model (practitioner_cases /
-- case_notes), which remains separate and unjoined.
--
-- ENCRYPTED FROM BIRTH. Free text about an identified client is PHI by
-- default (docs/security/free-text-phi-doctrine.md). Because this table is
-- new and has no legacy rows, there is deliberately NO plaintext `content`
-- column and no Stage A dual-write. Content exists only as ciphertext.
--
-- SCOPE DECISIONS DELIBERATELY NOT MODELLED:
--   * No `visibility` column. These notes are practitioner-private, full
--     stop. Member visibility / sharing / consent is a governance question
--     that has not been ruled; encoding a column for it now would make the
--     schema assert a policy that does not exist.
--   * No `note_type` column. The clinical vocabulary used by case_notes
--     (intake / discharge / supervision ...) implies a documentation
--     standard this system does not enforce, and offers a coach nothing.
--   * Attaching to practitioner_clients is a scoped build decision, NOT a
--     ruling on which registry is the client of record. That question is
--     open.
-- ================================================

CREATE TABLE IF NOT EXISTS practitioner_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent client. Matches practitioner_clients' own FK parent (practitioners),
  -- NOT members(id) — practitioner_cases uses a different parent and the two
  -- registries are not joined.
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- PHI: ciphertext only. AAD is bound to
  -- (table, column, rowId, ownerId=practitioner_id) by the accessor.
  content_enc TEXT NOT NULL,
  content_enc_meta JSONB NOT NULL,

  note_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practitioner_client_notes_client
  ON practitioner_client_notes(client_id, note_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_practitioner_client_notes_practitioner
  ON practitioner_client_notes(practitioner_id);

COMMENT ON TABLE practitioner_client_notes IS
  'Practitioner-private working notes on a Studio client (practitioner_clients). PHI-encrypted at rest with no plaintext column. Not member-visible: there is no sharing or consent path, and visibility is deliberately unmodelled pending a governance ruling. Distinct from case_notes (Caseload) and from studio_practitioner_observations (council bundle).';

COMMENT ON COLUMN practitioner_client_notes.content_enc IS
  'AES-256-GCM ciphertext of the note body. There is no plaintext sibling column by design — see docs/security/free-text-phi-doctrine.md.';

COMMENT ON COLUMN practitioner_client_notes.content_enc_meta IS
  'Encryption metadata (iv, tag, kid, v, encrypted_at) required to decrypt content_enc.';

COMMENT ON COLUMN practitioner_client_notes.practitioner_id IS
  'Author and owner. Server-derived from the session; never accepted from a request body or query parameter.';
