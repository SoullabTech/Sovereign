-- PRO-STUDIO-01 / SEC-01 — candidate only, NEVER APPLY before governed review.
-- Global studio_settings retains platform configuration. Practitioner video-room
-- links must instead belong to the authenticated practitioner.
-- Deliberately NO backfill from global video_room_url: its owner is unknown.
-- Migration requires an independently verified vault backup/restore before use.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE practitioner_settings
  ADD COLUMN IF NOT EXISTS video_room_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'practitioner_settings_video_room_https_chk'
      AND conrelid = 'practitioner_settings'::regclass
  ) THEN
    ALTER TABLE practitioner_settings ADD CONSTRAINT practitioner_settings_video_room_https_chk
      CHECK (
        video_room_url IS NULL OR
        (char_length(video_room_url) <= 2048
          AND video_room_url ~ '^https://[^/@?#[:space:]]+([/?#][^[:space:]]*)?$')
      );
  END IF;
END $$;

COMMENT ON COLUMN practitioner_settings.video_room_url IS
  'Practitioner-owned video-room HTTPS link. Never read or derived from global studio_settings.';

COMMIT;
