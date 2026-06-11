-- Co-Lab image attachments — attachment metadata carried on each message row.
--
-- Bytes live in the studio file-vault filesystem (FILE_STORAGE_PATH); this column
-- holds only metadata: [{ id, kind, filename, mimeType, sizeBytes, storagePath, width?, height? }].
-- storagePath is server-only (relative to FILE_STORAGE_PATH) and is never sent to clients —
-- clients receive opaque, conversation-scoped serve URLs instead.
--
-- Additive + reversible. Text-only messages keep the '[]' default and are unchanged.

ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE team_dm_messages
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
