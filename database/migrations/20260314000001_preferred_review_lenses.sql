-- Migration: Add preferred_review_lenses to member_settings
-- Stores the practitioner's default lens selection for session review analysis.
-- Persisted server-side so selection syncs across devices.
-- Values are validated against ReviewLensId at the API layer.

ALTER TABLE member_settings
  ADD COLUMN IF NOT EXISTS preferred_review_lenses TEXT[] DEFAULT ARRAY[]::TEXT[];
