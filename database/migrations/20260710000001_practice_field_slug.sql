-- Migration: practice_field_slug
--
-- Stable public identifier for composing a practice field into room surfaces.
-- The What Now? room already carries an opaque `fieldContext` URL param (return
-- detection + facilitator grouping); this column lets that same identifier
-- resolve to the practitioner's field so the room can compose the field's
-- content — downstream of MAIA's constitutional floor, never above it
-- (composition order enforced in app/api/now-what/interview/route.ts).
--
-- Nullable: a practice field without a slug is simply not addressable from any
-- room URL. Unique where present: one field per slug, swapping the holder of a
-- slug (e.g. demo steward → the practitioner's own authoring act) is a one-row
-- update, not a re-wire.
--
-- Idempotent per migration-ledger discipline.

ALTER TABLE practice_fields ADD COLUMN IF NOT EXISTS field_slug VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_fields_field_slug
  ON practice_fields(field_slug)
  WHERE field_slug IS NOT NULL;

COMMENT ON COLUMN practice_fields.field_slug IS
  'Stable public identifier (e.g. now-what-demo) resolving a room fieldContext to this field. Nullable; unique where present.';
