-- ============================================
-- PORTAL ARTICLES / EDUCATION CONTENT
-- Blog posts, guides, and educational content for practitioner portals
-- ============================================

CREATE TABLE IF NOT EXISTS portal_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category VARCHAR(100),
  tags TEXT[],
  reading_time_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practitioner_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portal_articles_practitioner ON portal_articles(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_portal_articles_published ON portal_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_articles_category ON portal_articles(category);
CREATE INDEX IF NOT EXISTS idx_portal_articles_slug ON portal_articles(slug);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_portal_articles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portal_articles_updated_at ON portal_articles;
CREATE TRIGGER portal_articles_updated_at
  BEFORE UPDATE ON portal_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_portal_articles_timestamp();

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Portal articles table created successfully';
END $$;
