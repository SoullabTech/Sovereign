-- Backfill: append 'notebook' to practitioners who have a saved enabled_modules list
-- but are missing the notebook entry.
--
-- Practitioners with enabled_modules = NULL use portal-type presets (already updated).
-- This only touches rows where enabled_modules was explicitly saved.
--
-- Safe: preserves existing order, only appends.

UPDATE practitioners
SET    enabled_modules = enabled_modules || '"notebook"'::jsonb
WHERE  enabled_modules IS NOT NULL
  AND  NOT enabled_modules @> '"notebook"'::jsonb;
