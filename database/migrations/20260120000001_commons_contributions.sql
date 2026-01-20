-- Commons Contributions
-- Member-contributed content for the shared commons
-- See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for full context
--
-- Philosophy: The commons is a shared offering space, not a content platform.
-- Contributions are gifts to the community, not performances for an audience.

-- Main contributions table
CREATE TABLE IF NOT EXISTS commons_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core content
  type VARCHAR(20) NOT NULL CHECK (type IN ('prompt', 'practice', 'agreement', 'resource', 'story')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'needs_revision', 'published', 'archived', 'flagged')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  -- Metadata
  tags JSONB DEFAULT '[]',  -- [{element: 'fire', facet: 'passion'}, {domain: 'grounding'}]
  attribution TEXT,          -- Source, tradition, inspiration
  safety_notes TEXT,         -- Curator-added warnings/contraindications
  when_helpful TEXT,         -- When to use this
  when_not TEXT,             -- Contraindications, when NOT to use

  -- Authorship
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Review
  reviewed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Metrics (optional, non-social - no likes/comments)
  usage_count INTEGER DEFAULT 0,  -- "Used in X circles"
  save_count INTEGER DEFAULT 0    -- "Saved by X members"
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_commons_contributions_status ON commons_contributions(status);
CREATE INDEX IF NOT EXISTS idx_commons_contributions_type ON commons_contributions(type);
CREATE INDEX IF NOT EXISTS idx_commons_contributions_created_by ON commons_contributions(created_by);
CREATE INDEX IF NOT EXISTS idx_commons_contributions_tags ON commons_contributions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_commons_contributions_published ON commons_contributions(type, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_commons_contributions_review_queue ON commons_contributions(submitted_at ASC) WHERE status = 'submitted';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_commons_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS commons_contributions_updated_at ON commons_contributions;
CREATE TRIGGER commons_contributions_updated_at
  BEFORE UPDATE ON commons_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_commons_contributions_updated_at();

-- Contribution levels for the "earn and steward" ladder
-- Level 0: Submitter (everyone) - can create drafts, submit for review
-- Level 1: Contributor (earned) - lighter review touch, can suggest edits
-- Level 2: Curator (stewards) - can review, approve, flag content
CREATE TABLE IF NOT EXISTS contribution_levels (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level IN (0, 1, 2)),

  -- Level 1 requirements
  orientation_completed BOOLEAN DEFAULT FALSE,
  accepted_count INTEGER DEFAULT 0,

  -- Endorsement (alternative path to Level 1)
  endorsed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  endorsed_at TIMESTAMPTZ,

  -- Level 2 (Curator) promotion
  promoted_to_curator_at TIMESTAMPTZ,
  promoted_by UUID REFERENCES members(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update contribution_levels updated_at
CREATE OR REPLACE FUNCTION update_contribution_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contribution_levels_updated_at ON contribution_levels;
CREATE TRIGGER contribution_levels_updated_at
  BEFORE UPDATE ON contribution_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_contribution_levels_updated_at();

-- Track member saves (for "Saved by X members" metric)
CREATE TABLE IF NOT EXISTS contribution_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES commons_contributions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contribution_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_contribution_saves_contribution ON contribution_saves(contribution_id);
CREATE INDEX IF NOT EXISTS idx_contribution_saves_member ON contribution_saves(member_id);

-- Track usage in circles (for "Used in X circles" metric)
CREATE TABLE IF NOT EXISTS contribution_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES commons_contributions(id) ON DELETE CASCADE,
  circle_id UUID,  -- Reference to holding_circles when that table exists
  used_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  context VARCHAR(100)  -- 'circle', 'personal', 'shared'
);

CREATE INDEX IF NOT EXISTS idx_contribution_usages_contribution ON contribution_usages(contribution_id);

-- Function to increment save_count
CREATE OR REPLACE FUNCTION increment_contribution_save_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE commons_contributions
  SET save_count = save_count + 1
  WHERE id = NEW.contribution_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribution_save_increment
  AFTER INSERT ON contribution_saves
  FOR EACH ROW
  EXECUTE FUNCTION increment_contribution_save_count();

-- Function to decrement save_count
CREATE OR REPLACE FUNCTION decrement_contribution_save_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE commons_contributions
  SET save_count = GREATEST(0, save_count - 1)
  WHERE id = OLD.contribution_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribution_save_decrement
  AFTER DELETE ON contribution_saves
  FOR EACH ROW
  EXECUTE FUNCTION decrement_contribution_save_count();

-- Function to increment usage_count
CREATE OR REPLACE FUNCTION increment_contribution_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE commons_contributions
  SET usage_count = usage_count + 1
  WHERE id = NEW.contribution_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribution_usage_increment
  AFTER INSERT ON contribution_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_contribution_usage_count();

-- Comments
COMMENT ON TABLE commons_contributions IS 'Member-contributed content for the shared commons. Not a content platform - a shared offering space.';
COMMENT ON COLUMN commons_contributions.type IS 'Type of contribution: prompt, practice, agreement, resource, story';
COMMENT ON COLUMN commons_contributions.status IS 'Pipeline status: draft → submitted → (needs_revision) → published | archived | flagged';
COMMENT ON COLUMN commons_contributions.tags IS 'JSONB array of tags: element, facet, domain categorization';
COMMENT ON COLUMN commons_contributions.when_not IS 'Contraindications - when NOT to use this (required for practices)';
COMMENT ON TABLE contribution_levels IS 'Member permission levels for the contribution ladder: 0=Submitter, 1=Contributor, 2=Curator';
COMMENT ON TABLE contribution_saves IS 'Tracks which members have saved contributions (for save_count metric, no social visibility)';
COMMENT ON TABLE contribution_usages IS 'Tracks when contributions are used in circles or practice (for usage_count metric)';
