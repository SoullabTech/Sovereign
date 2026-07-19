-- Migration: practice_field_revisions
-- Constitutional function: STRUCTURAL — append-only version history of the practitioner's field
-- Spec: docs/specs/PRACTITIONER_FIELD_ADMIN_SPEC_2026-07-10.md §3.1 (Larry's Studio — versioning spine)
-- Depends on: practice_fields (20260701000001), maia_guidance column (20260708000001)
--
-- Every save of a practice field writes a revision in the same transaction
-- (lib/practiceField/practiceFieldService.ts — schema and reader ship together).
-- The version history IS the record of the practitioner's development: the
-- steward baseline is backfilled as revision 1, so the practitioner's first
-- authenticated edit becomes revision 2 and the handoff is recorded forever.
--
-- Append-only is structural, not policy: UPDATE and DELETE raise.
-- Rollback is a future revision that restores earlier layers (pointer-move),
-- never mutation of history.

CREATE TABLE IF NOT EXISTS practice_field_revisions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_field_id    UUID NOT NULL REFERENCES practice_fields(id) ON DELETE RESTRICT,
  revision_number      INT  NOT NULL,

  -- Full Layers 1–4 + status at save. field_slug is excluded: it is room
  -- addressing, not authored field content.
  layers               JSONB NOT NULL,

  -- Provenance: 'steward' for the backfilled baseline; the saving member's id
  -- for every runtime save (route auth via x-member-id).
  saved_by             TEXT NOT NULL,

  -- What changed, in the practitioner's words. Nullable until the Studio
  -- editor surfaces a note field (§3.1 read surface — future cut).
  note                 TEXT,

  -- Imagineer promote gesture (§3.3 draft → rehearse → promote — future cut).
  promoted_from_draft  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (practice_field_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_pf_revisions_field
  ON practice_field_revisions(practice_field_id, revision_number DESC);

-- Append-only enforced in the schema itself (structural incapacity > policy).
CREATE OR REPLACE FUNCTION practice_field_revisions_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'practice_field_revisions is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pf_revisions_append_only ON practice_field_revisions;
CREATE TRIGGER pf_revisions_append_only
  BEFORE UPDATE OR DELETE ON practice_field_revisions
  FOR EACH ROW EXECUTE FUNCTION practice_field_revisions_immutable();

-- Backfill: the current state of every existing field becomes immutable
-- revision 1 — the steward baseline, recorded before any practitioner edit
-- can overwrite it. Idempotent: only fields with no revisions yet.
INSERT INTO practice_field_revisions (practice_field_id, revision_number, layers, saved_by, note)
SELECT
  pf.id,
  1,
  jsonb_build_object(
    'welcome_message',       pf.welcome_message,
    'welcome_video_url',     pf.welcome_video_url,
    'about_practice',        pf.about_practice,
    'how_we_work_together',  pf.how_we_work_together,
    'how_maia_supports',     pf.how_maia_supports,
    'professional_practice', pf.professional_practice,
    'orientation_style',     pf.orientation_style,
    'resources',             pf.resources,
    'active_field_content',  pf.active_field_content,
    'maia_guidance',         pf.maia_guidance,
    'status',                pf.status
  ),
  'steward',
  'Steward baseline — recorded by versioning migration 20260710000002; field state at cut time, pre-dating the practitioner''s own authoring act'
FROM practice_fields pf
WHERE NOT EXISTS (
  SELECT 1 FROM practice_field_revisions r WHERE r.practice_field_id = pf.id
);

COMMENT ON TABLE practice_field_revisions IS
  'Append-only version history of practitioner practice fields. Written in the same '
  'transaction as every save; no-op saves are skipped. The version history is the '
  'record of the practitioner''s development. Rollback is a new revision, never data loss. '
  'Spec: docs/specs/PRACTITIONER_FIELD_ADMIN_SPEC_2026-07-10.md §3.1';
