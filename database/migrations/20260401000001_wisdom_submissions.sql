-- Wisdom Keepers: Community source submissions
-- Members can suggest wisdom sources for curation review.

CREATE TABLE IF NOT EXISTS wisdom_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID REFERENCES members(id),
  submitted_by_name  TEXT NOT NULL,
  submitted_by_email TEXT,

  source_title        TEXT NOT NULL,
  author              TEXT,
  tradition_or_domain TEXT NOT NULL,
  url                 TEXT,
  rationale           TEXT NOT NULL CHECK (char_length(rationale) <= 5000),
  category            TEXT NOT NULL DEFAULT 'other'
                      CHECK (category IN (
                        'wisdom_tradition','psychology','philosophy',
                        'consciousness','ritual_practice','other'
                      )),
  is_self_submission  BOOLEAN NOT NULL DEFAULT false,

  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','reviewing','accepted','declined')),
  reviewer_notes TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_status ON wisdom_submissions(status);
CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_member ON wisdom_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_submissions_created ON wisdom_submissions(created_at DESC);
