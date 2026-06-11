-- Platform feedback image attachments — screenshot metadata carried on each report.
--
-- Mirrors the Co-Lab message attachments model (20260610000001): bytes live in the
-- shared self-hosted file vault (FILE_STORAGE_PATH, namespace 'feedback'); this column
-- holds only metadata: [{ id, kind, filename, mimeType, sizeBytes, storagePath, width?, height? }].
-- storagePath is server-only (relative to FILE_STORAGE_PATH) and is never sent to clients.
--
-- Additive + reversible. Text-only feedback keeps the '[]' default and is unchanged.
-- The screenshot bytes are also attached to the notification email (Email + Vault delivery),
-- so a triager sees the report immediately; the vault copy + this column are the durable record
-- the Feedback Inbox reads later.

ALTER TABLE platform_feedback
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
