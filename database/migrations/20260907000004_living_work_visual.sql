-- WS-WORK-VISUAL-01 — a Work may look like itself.
--
-- Founder ruling 2026-09-07:
--
--   owner       Living Work / member
--   chosen by   writer
--   generated   never by MAIA
--   scope       private Studio by default
--   deletion    deleted with the Work
--   sharing     a separate future act
--
-- ── Why this is a Work-owned table and not a Co-Lab file ──────────────────
-- Co-Lab happens to have a file mechanism. That is a storage fact, not a
-- custody authority. A cover placed in Co-Lab custody would inherit Co-Lab's
-- sharing semantics and its release gate, which is exactly backwards: this
-- image is private to the writer's Studio and belongs to the Work. The bytes
-- reuse the shared vault underneath — storage substrate does not determine who
-- owns the thing stored.
--
-- ── One visual per Work, in this release ──────────────────────────────────
-- The primary key is the Work. A gallery is a different design with different
-- questions (ordering, which one is "the" cover, what a set of images means),
-- and none of them are answered by making this column non-unique first. When a
-- gallery is ruled, this becomes a child table; nothing here forecloses it.
--
-- ── ⛔ What may never appear in this table ────────────────────────────────
-- No generated image, no suggested image, no automatically selected image, and
-- no inferred kind. `kind` is the writer's own statement about what this image
-- IS to them — a cover, or something that inspired the work — and there is no
-- code path anywhere that may set it without the writer choosing. There is
-- deliberately no `source` or `generated_by` column, because there is only one
-- possible author and a column implying otherwise would invite one.
--
-- ── ⛔ The blob is not deleted by this cascade ─────────────────────────────
-- ON DELETE CASCADE removes the ROW when the Work goes. It cannot remove bytes
-- from the vault. A cascade alone would leave the image retained while the
-- record that named it is gone — the *unreferenced but retained* state
-- WS-DELETE-01 forbids by name. The storage path is therefore enqueued into
-- vault_erasure_queue inside the same transaction that deletes the Work, and
-- the existing sweep destroys it with proof (destroyVaultBytes).
--
-- ADDITIVE. Reversal:
--   DROP TABLE IF EXISTS living_work_visuals;

BEGIN;

CREATE TABLE IF NOT EXISTS living_work_visuals (
  -- One current visual per Work. The Work IS the key.
  living_work_id UUID PRIMARY KEY REFERENCES living_works(id) ON DELETE CASCADE,

  -- Carried so ownership is checkable without a join, and RESTRICT so a member
  -- row can never be removed while their image is still held.
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- The writer's own statement about what this image is. Never inferred.
  kind TEXT NOT NULL CHECK (kind IN ('cover', 'inspiration')),

  -- Vault-relative path. The bytes live in the shared vault; the custody is here.
  storage_path TEXT NOT NULL CHECK (length(trim(storage_path)) > 0),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/gif', 'image/webp')),
  byte_size BIGINT NOT NULL CHECK (byte_size > 0),

  -- Provenance of the upload, kept as provenance and never shown as a title —
  -- the same distinction the manuscript filename ruling drew.
  original_filename TEXT,

  chosen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_living_work_visuals_member
  ON living_work_visuals(member_id);

COMMENT ON TABLE living_work_visuals IS
  'The image a writer chose for a Work. Work-owned custody: private to the Studio, deleted with the Work (row by cascade, bytes by vault_erasure_queue). Never generated, suggested, or selected by MAIA.';

COMMENT ON COLUMN living_work_visuals.kind IS
  'cover | inspiration — the writer''s own statement about what this image is to them. No code path may set this without the writer choosing it.';

COMMIT;
