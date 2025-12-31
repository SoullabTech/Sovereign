-- Reorganize Technical Territories
-- Separates Soullab/tech content from general wisdom content
-- Created: 2025-12-30

-- ============================================================================
-- REORGANIZATION PHILOSOPHY
-- ============================================================================
-- Members seeking spiritual wisdom shouldn't have to wade through technical
-- discussions about the platform. We create a clear separation:
--
-- WISDOM TERRITORIES (1-7): For seekers, practitioners, wisdom-sharers
-- SOULLAB LAB (8): Technical area for developers, tech discussions, feedback
--
-- The Lab is visible but clearly marked as "technical" so seekers can skip it

-- ============================================================================
-- RENAME "WORKSHOP" TO "SOULLAB LAB" & EXPAND
-- ============================================================================

-- Update root territory
UPDATE community_territories
SET
    name = 'Soullab Lab',
    description = 'Technical discussions, platform development, and behind-the-scenes. For developers and tech-curious members.',
    icon = '⚗️'
WHERE slug = 'workshop';

-- Update existing sub-territories with clearer names
UPDATE community_territories
SET
    name = 'Platform Help',
    description = 'Questions about using MAIA, the app, and community features'
WHERE slug = 'tech-help';

UPDATE community_territories
SET
    name = 'Feature Ideas',
    description = 'Suggest new features and improvements'
WHERE slug = 'feedback';

UPDATE community_territories
SET
    name = 'Community Health',
    description = 'Discussions about moderation, guidelines, and community wellbeing'
WHERE slug = 'stewardship';

-- ============================================================================
-- ADD NEW TECHNICAL SUB-TERRITORIES
-- ============================================================================

-- Developer discussions
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('dev-discussions', 'Developer Corner', 'Technical implementation discussions, architecture, and code', '💻',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- AIN & Consciousness Tech
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('consciousness-tech', 'Consciousness Technology', 'AIN architecture, field systems, and consciousness computing', '🧠',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 5)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Bug Reports
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('bug-reports', 'Bug Reports', 'Report issues and help us fix problems', '🐛',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 6)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- API & Integrations
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('api-integrations', 'API & Integrations', 'Discuss API usage, MCP servers, and third-party integrations', '🔌',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 7)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Roadmap & Vision
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('roadmap', 'Roadmap & Vision', 'What we''re building next and long-term direction', '🗺️',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 8)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Open Source
INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('open-source', 'Open Source', 'Contributing to Soullab open source projects', '🌐',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 9)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ============================================================================
-- ADD "is_technical" FLAG FOR FILTERING
-- ============================================================================

-- Add column if not exists
ALTER TABLE community_territories
ADD COLUMN IF NOT EXISTS is_technical BOOLEAN DEFAULT FALSE;

-- Mark the Lab and all its children as technical
UPDATE community_territories
SET is_technical = TRUE
WHERE slug = 'workshop'
   OR parent_id = (SELECT id FROM community_territories WHERE slug = 'workshop');

-- ============================================================================
-- MOVE "MAIA-MOMENTS" FROM BREAKTHROUGH TO LAB (optional)
-- ============================================================================
-- Keep MAIA Moments in Breakthrough - they're about transformation experiences
-- The consciousness-tech in Lab is about the HOW, not the personal experience

-- ============================================================================
-- REORDER FOR VISUAL SEPARATION
-- ============================================================================

-- Ensure wisdom territories come first (1-7), tech last (8)
UPDATE community_territories SET sort_order = 1 WHERE slug = 'threshold';
UPDATE community_territories SET sort_order = 2 WHERE slug = 'seeking';
UPDATE community_territories SET sort_order = 3 WHERE slug = 'practice';
UPDATE community_territories SET sort_order = 4 WHERE slug = 'breakthrough';
UPDATE community_territories SET sort_order = 5 WHERE slug = 'offering';
UPDATE community_territories SET sort_order = 6 WHERE slug = 'circle';
UPDATE community_territories SET sort_order = 7 WHERE slug = 'foundation';
UPDATE community_territories SET sort_order = 8 WHERE slug = 'workshop';

-- ============================================================================
-- ADD SECTION HEADERS (for UI grouping)
-- ============================================================================

ALTER TABLE community_territories
ADD COLUMN IF NOT EXISTS section VARCHAR(50) DEFAULT 'wisdom';

-- Mark wisdom vs technical sections
UPDATE community_territories SET section = 'wisdom' WHERE sort_order <= 7;
UPDATE community_territories SET section = 'technical' WHERE slug = 'workshop';
UPDATE community_territories SET section = 'technical'
WHERE parent_id = (SELECT id FROM community_territories WHERE slug = 'workshop');
