-- Stub schema for the declaration-vs-erase probe. FICTIONAL, loopback-only.
--
-- ONLY what the real migrations assume already exists. `living_works`,
-- `living_work_expressions` and `living_work_visuals` are deliberately NOT stubbed
-- here: the runner applies their real migrations, because this probe's whole
-- subject is the shape of `living_work_expressions` (no foreign key to the
-- manuscript, a UNIQUE on (work, type, id)). The stub used by
-- scripts/witness/ws-encrypted-source-pg16.sh drops both and would hide it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE members (
  id uuid PRIMARY KEY
);

CREATE TABLE member_manuscripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE deletion_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_class text NOT NULL CHECK (reason_class IN (
    'incident_remediation','member_deletion','sanctuary_purge','governance'
  )),
  incident_ref text,
  authorized_by text NOT NULL,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE TABLE provenance_tombstones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  object_kind text NOT NULL,
  object_id text NOT NULL,
  tombstoned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(object_kind, object_id)
);

-- The real function erases private editorial history outside the manuscript FK
-- cascade. Nothing in this probe writes any, so the stub only keeps the call
-- shape (and refuses a call without exact authority, as the real one does).
CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(
  manifest_id uuid,
  member_id uuid,
  manuscript_id uuid
) RETURNS void AS $$
BEGIN
  IF manifest_id IS NULL OR member_id IS NULL OR manuscript_id IS NULL THEN
    RAISE EXCEPTION 'fictional R20 editorial erasure requires exact authority';
  END IF;
END;
$$ LANGUAGE plpgsql;
