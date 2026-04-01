-- Wisdom source submissions — curated contribution layer
-- Members can suggest sources; only Soullab-approved entries
-- enter the canonical Wisdom Keepers library.

CREATE TABLE IF NOT EXISTS wisdom_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,

  source_title TEXT NOT NULL,
  author TEXT,
  tradition_or_domain TEXT,
  url TEXT,
  rationale TEXT NOT NULL,

  category TEXT NOT NULL DEFAULT 'other',
  is_self_submission BOOLEAN NOT NULL DEFAULT false,

  status TEXT NOT NULL DEFAULT 'pending',
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  CONSTRAINT wisdom_submissions_status_check
    CHECK (status IN ('pending', 'approved', 'rejected')),

  CONSTRAINT wisdom_submissions_category_check
    CHECK (category IN (
      'wisdom_tradition',
      'psychology',
      'philosophy',
      'consciousness',
      'ritual_practice',
      'other'
    )),

  CONSTRAINT wisdom_submissions_name_length_check
    CHECK (char_length(trim(submitted_by_name)) >= 2),

  CONSTRAINT wisdom_submissions_title_length_check
    CHECK (char_length(trim(source_title)) >= 2),

  CONSTRAINT wisdom_submissions_rationale_length_check
    CHECK (char_length(trim(rationale)) >= 10)
);

CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_status
  ON wisdom_submissions(status);

CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_member
  ON wisdom_submissions(member_id);

CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_created_at
  ON wisdom_submissions(created_at DESC);
