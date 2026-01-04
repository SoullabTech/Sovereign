-- Newsletter Subscribers
-- Email signups for build letters and updates

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'unknown',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Index for active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(subscribed_at)
  WHERE unsubscribed_at IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON newsletter_subscribers TO soullab;
