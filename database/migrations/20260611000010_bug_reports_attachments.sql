-- Bug-report screenshot attachments — evidence carried on each report.
--
-- Governing line (Monitor convergence): screenshots are EVIDENCE attached to a
-- bug report, not a second inbox. bug_reports stays the single intake field; the
-- bytes live in the shared file vault (FILE_STORAGE_PATH, namespace 'bugs') and
-- this column holds only metadata:
--   [{ id, kind, filename, mimeType, sizeBytes, storagePath, width?, height? }]
-- storagePath is server-only (relative to FILE_STORAGE_PATH) and is never sent to
-- clients; the Monitor field serves the bytes through an admin-gated route
-- (/api/admin/monitor/bugs/[id]/attachments/[attachmentId]).
--
-- Additive + reversible + idempotent. Text-only reports keep the '[]' default and
-- are unchanged.

ALTER TABLE bug_reports
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260611000010: bug_reports.attachments (screenshot evidence metadata) applied';
END $$;
