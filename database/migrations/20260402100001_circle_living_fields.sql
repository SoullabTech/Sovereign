-- LIVING CIRCLES — Inquiry + Field Memory
-- Design law: "Feel → Contribute → Browse"
-- Nothing in a circle is implied. Everything is invited.

CREATE TABLE IF NOT EXISTS circle_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  opened_by UUID NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'integrating')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  field_synthesis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circle_inquiries_circle ON circle_inquiries(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_inquiries_status ON circle_inquiries(circle_id, status);

COMMENT ON TABLE circle_inquiries IS 'Structured questions opened into a circle field. One active inquiry at a time per circle.';

CREATE TABLE IF NOT EXISTS circle_inquiry_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES circle_inquiries(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  response_text TEXT NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'reflection'
    CHECK (response_type IN ('reflection', 'witness', 'offering')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inquiry_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry ON circle_inquiry_responses(inquiry_id);

COMMENT ON TABLE circle_inquiry_responses IS 'One response per member per inquiry. Prevents thread collapse.';

-- Reuse existing updated_at trigger function from circles_commons migration
DROP TRIGGER IF EXISTS circle_inquiries_updated_at ON circle_inquiries;
CREATE TRIGGER circle_inquiries_updated_at
  BEFORE UPDATE ON circle_inquiries
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();

DROP TRIGGER IF EXISTS circle_inquiry_responses_updated_at ON circle_inquiry_responses;
CREATE TRIGGER circle_inquiry_responses_updated_at
  BEFORE UPDATE ON circle_inquiry_responses
  FOR EACH ROW EXECUTE FUNCTION circles_set_updated_at();

INSERT INTO schema_migrations (filename, applied_at)
VALUES ('20260402100001_circle_living_fields.sql', NOW())
ON CONFLICT (filename) DO NOTHING;
