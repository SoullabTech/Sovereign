-- Handwriting image storage: add image columns to quick_journal_entries
-- Stores the original handwritten page photo alongside extracted text

ALTER TABLE quick_journal_entries
  ADD COLUMN IF NOT EXISTS image_path TEXT,
  ADD COLUMN IF NOT EXISTS image_mime TEXT;

-- Index for finding entries with images
CREATE INDEX IF NOT EXISTS idx_quick_journal_has_image
  ON quick_journal_entries(user_id)
  WHERE image_path IS NOT NULL;
