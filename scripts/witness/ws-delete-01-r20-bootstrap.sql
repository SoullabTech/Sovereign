\set ON_ERROR_STOP on
\echo 'WS_DELETE_01_R20_BOOTSTRAP_BEGIN'

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fictional identity root: only columns required by the selected exact
-- migrations and the historical deletion witness.
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey TEXT UNIQUE,
  username TEXT UNIQUE,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

\ir ../../database/migrations/20260721000003_press_manuscript_room.sql
\ir ../../database/migrations/20260727000001_manuscript_working_drafts.sql
\ir ../../database/migrations/20260731000001_draft_concurrency.sql
\ir ../../database/migrations/20260830000001_manuscript_draft_sections.sql
\ir ../../database/migrations/20260824000001_manuscript_source_custody.sql
\ir ../../database/migrations/20260801000001_living_works.sql
\ir ../../database/migrations/20260907000004_living_work_visual.sql

-- Exact R20 content-free governance tables from S5. The full S5 migration also
-- alters unrelated conversation/agent lanes and is intentionally not loaded in
-- this bounded Writer fixture.
CREATE TABLE deletion_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_class TEXT NOT NULL CHECK (reason_class IN (
    'incident_remediation', 'member_deletion', 'sanctuary_purge', 'governance'
  )),
  incident_ref TEXT,
  authorized_by TEXT NOT NULL,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
CREATE TABLE deletion_manifest_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  session_id TEXT,
  member_id TEXT,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  CHECK (session_id IS NOT NULL OR member_id IS NOT NULL OR window_start IS NOT NULL)
);
CREATE INDEX idx_deletion_manifest_scopes_table ON deletion_manifest_scopes(table_name);
CREATE TABLE provenance_tombstones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES deletion_manifests(id) ON DELETE CASCADE,
  object_kind TEXT NOT NULL,
  object_id TEXT NOT NULL,
  tombstoned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(object_kind, object_id)
);

\ir ../../database/migrations/20260907000001_vault_erasure_queue.sql
\ir ../../database/migrations/20260407100001_media_studio_build_a.sql

-- Exact Writer editorial lineage, in migration order.
\ir ../../database/migrations/20260901000001_ask_threads.sql
\ir ../../database/migrations/20260914000001_proposal_succession.sql
\ir ../../database/migrations/20260914000002_manuscript_revision_offers.sql
\ir ../../database/migrations/20260914000003_proposal_chains_member_identity.sql
\ir ../../database/migrations/20260914000004_manuscript_revision_authorizations.sql
\ir ../../database/migrations/20260914000005_editorial_ontology.sql
\ir ../../database/migrations/20260915000001_ask_threads_subject_preparation.sql
\ir ../../database/migrations/20260915000002_editorial_turn_bindings.sql
\ir ../../database/migrations/20260918000006_editorial_application_recovery.sql
\ir ../../database/migrations/20260925000005_writer_editorial_relationship_custody.sql
\ir ../../database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql
\ir ../../database/migrations/20260929000003_ask_threads_living_work_subject.sql
\ir ../../database/migrations/20261020000001_writer_editorial_thread_origins.sql
\ir ../../database/migrations/20261025000001_r20_writer_editorial_constitutional_erasure.sql

\echo 'WS_DELETE_01_R20_BOOTSTRAP_PASS'
