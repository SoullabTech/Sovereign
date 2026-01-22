-- ============================================
-- Add review_note to safety_concern_logs
-- Allows practitioners to add private de-identified notes
-- when acknowledging a safety concern
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'safety_concern_logs') THEN
    ALTER TABLE safety_concern_logs
    ADD COLUMN IF NOT EXISTS review_note TEXT;

    COMMENT ON COLUMN safety_concern_logs.review_note IS 'Private practitioner note (de-identified) when acknowledging the safety concern';
  END IF;
END $$;
