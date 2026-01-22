-- Practitioner Features and Portal Inquiries
-- Enables feature gating (conversational booking as premium) and inquiry tracking

-- Feature flags per practitioner/portal
CREATE TABLE IF NOT EXISTS practitioner_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  portal_slug TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free | pro | studio
  portal_chat_enabled BOOLEAN NOT NULL DEFAULT true,
  conversational_booking_enabled BOOLEAN NOT NULL DEFAULT false,
  booking_confirmation_emails_enabled BOOLEAN NOT NULL DEFAULT false,
  inquiry_form_enabled BOOLEAN NOT NULL DEFAULT true,
  calendar_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practitioner_id)
);

-- Add columns if table existed without them
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'portal_slug') THEN
    ALTER TABLE practitioner_features ADD COLUMN portal_slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'plan') THEN
    ALTER TABLE practitioner_features ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'portal_chat_enabled') THEN
    ALTER TABLE practitioner_features ADD COLUMN portal_chat_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'conversational_booking_enabled') THEN
    ALTER TABLE practitioner_features ADD COLUMN conversational_booking_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'booking_confirmation_emails_enabled') THEN
    ALTER TABLE practitioner_features ADD COLUMN booking_confirmation_emails_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'inquiry_form_enabled') THEN
    ALTER TABLE practitioner_features ADD COLUMN inquiry_form_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practitioner_features' AND column_name = 'calendar_sync_enabled') THEN
    ALTER TABLE practitioner_features ADD COLUMN calendar_sync_enabled BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Portal inquiries (contact form submissions + chat inquiries)
CREATE TABLE IF NOT EXISTS portal_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_slug TEXT NOT NULL,
  practitioner_id UUID REFERENCES practitioners(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  timezone TEXT,
  topic TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'portal_inquiry_form', -- portal_inquiry_form | portal_chat
  status TEXT NOT NULL DEFAULT 'new', -- new | replied | archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_practitioner_features_slug ON practitioner_features(portal_slug);
CREATE INDEX IF NOT EXISTS idx_practitioner_features_plan ON practitioner_features(plan);
CREATE INDEX IF NOT EXISTS idx_portal_inquiries_slug ON portal_inquiries(portal_slug);
CREATE INDEX IF NOT EXISTS idx_portal_inquiries_status ON portal_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_portal_inquiries_created ON portal_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_inquiries_practitioner ON portal_inquiries(practitioner_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_practitioner_features_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practitioner_features_updated_at ON practitioner_features;
CREATE TRIGGER practitioner_features_updated_at
  BEFORE UPDATE ON practitioner_features
  FOR EACH ROW
  EXECUTE FUNCTION update_practitioner_features_timestamp();

-- Comments for documentation
COMMENT ON TABLE practitioner_features IS 'Feature flags and plan tiers per practitioner portal';
COMMENT ON COLUMN practitioner_features.plan IS 'Subscription tier: free, pro, studio';
COMMENT ON COLUMN practitioner_features.conversational_booking_enabled IS 'Premium feature: book sessions through chat';
COMMENT ON TABLE portal_inquiries IS 'Contact form submissions and chat-originated inquiries';
COMMENT ON COLUMN portal_inquiries.source IS 'Origin: portal_inquiry_form or portal_chat';
