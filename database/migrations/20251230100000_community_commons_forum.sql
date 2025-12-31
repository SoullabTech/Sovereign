-- Community Commons Forum Schema
-- Universal wisdom-sharing platform welcoming all traditions
-- Created: 2025-12-30

-- ============================================================================
-- DESIGN PHILOSOPHY
-- ============================================================================
-- Organized by the NATURAL FLOW OF WISDOM-SEEKING:
--   1. Arrival & Welcome (onboarding, introductions)
--   2. Seeking (questions, exploration, learning)
--   3. Practice (doing the work, exercises, rituals)
--   4. Breakthrough (transformations, insights, shifts)
--   5. Sharing (teaching, contributing, offering)
--   6. Connection (community, support, dialogue)
--
-- This mirrors the universal journey found across all traditions:
-- Indigenous vision quests, Eastern awakening paths, Western individuation,
-- African ancestral wisdom, Sufi stages of the soul, and more.

-- ============================================================================
-- TERRITORIES (Organic Categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES community_territories(id),
    sort_order INTEGER DEFAULT 0,

    -- Access control
    min_contribution_tier VARCHAR(50) DEFAULT 'anyone',
    min_cognitive_level INTEGER DEFAULT 0,

    -- Stats
    post_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- POSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Author
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_avatar_url TEXT,

    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,

    -- Classification
    territory_id UUID REFERENCES community_territories(id),
    content_type VARCHAR(50) NOT NULL,
    content_tier INTEGER NOT NULL DEFAULT 4,

    -- Rich metadata
    tags TEXT[],
    element VARCHAR(20),
    tradition VARCHAR(100),  -- Which wisdom tradition (optional, inclusive)
    related_chapter INTEGER,
    source_path TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'published',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Engagement
    view_count INTEGER DEFAULT 0,
    heart_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,

    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_avatar_url TEXT,

    content TEXT NOT NULL,
    heart_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'visible',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HEARTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_hearts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_post_heart UNIQUE (user_id, post_id),
    CONSTRAINT unique_comment_heart UNIQUE (user_id, comment_id),
    CONSTRAINT heart_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- ============================================================================
-- USER STATS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_user_stats (
    user_id VARCHAR(255) PRIMARY KEY,
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    heart_received_count INTEGER DEFAULT 0,
    heart_given_count INTEGER DEFAULT 0,
    breakthrough_count INTEGER DEFAULT 0,
    contribution_tier VARCHAR(50) DEFAULT 'explorer',
    contribution_points INTEGER DEFAULT 0,
    first_post_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BOOKMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_posts_territory ON community_posts(territory_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON community_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_element ON community_posts(element);
CREATE INDEX IF NOT EXISTS idx_posts_tradition ON community_posts(tradition);
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hearts ON community_posts(heart_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_hearts_user ON community_hearts(user_id);
CREATE INDEX IF NOT EXISTS idx_territories_parent ON community_territories(parent_id);
CREATE INDEX IF NOT EXISTS idx_territories_slug ON community_territories(slug);

-- ============================================================================
-- SEED: ORGANIC TERRITORY STRUCTURE
-- ============================================================================
-- Root territories follow the universal wisdom journey

-- 1. THE THRESHOLD (Arrival & Welcome)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('threshold', 'The Threshold', 'Where every journey begins. Introductions, welcomes, and first steps.', '🚪', 1)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('introductions', 'Introductions', 'Share your story and meet fellow travelers', '👋',
        (SELECT id FROM community_territories WHERE slug = 'threshold'), 1),
    ('announcements', 'Sacred Announcements', 'Community updates and guidance from stewards', '📢',
        (SELECT id FROM community_territories WHERE slug = 'threshold'), 2),
    ('orientation', 'Finding Your Way', 'Questions about the community and how to participate', '🧭',
        (SELECT id FROM community_territories WHERE slug = 'threshold'), 3)
ON CONFLICT (slug) DO NOTHING;

-- 2. THE SEEKING (Questions & Exploration)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('seeking', 'The Seeking', 'Questions, curiosity, and the hunger for understanding. All traditions welcome.', '🔍', 2)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('questions', 'Open Questions', 'Ask anything about consciousness, growth, and the inner journey', '❓',
        (SELECT id FROM community_territories WHERE slug = 'seeking'), 1),
    ('book-discussions', 'Living Library', 'Discuss wisdom texts from all traditions', '📚',
        (SELECT id FROM community_territories WHERE slug = 'seeking'), 2),
    ('elemental-wisdom', 'Elemental Wisdom', 'Explore fire, water, earth, air, and aether teachings', '🔥',
        (SELECT id FROM community_territories WHERE slug = 'seeking'), 3),
    ('traditions-dialogue', 'Traditions in Dialogue', 'Where different wisdom paths meet and converse', '🌍',
        (SELECT id FROM community_territories WHERE slug = 'seeking'), 4)
ON CONFLICT (slug) DO NOTHING;

-- 3. THE PRACTICE (Doing the Work)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('practice', 'The Practice', 'Where wisdom becomes embodied. Exercises, rituals, and daily cultivation.', '🧘', 3)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('meditation', 'Meditation & Stillness', 'Contemplative practices from all traditions', '🪷',
        (SELECT id FROM community_territories WHERE slug = 'practice'), 1),
    ('shadow-work', 'Shadow Work', 'Facing what we''d rather not see—with compassion', '🌑',
        (SELECT id FROM community_territories WHERE slug = 'practice'), 2),
    ('dreamwork', 'Dreamwork', 'Working with the night''s teachings', '🌙',
        (SELECT id FROM community_territories WHERE slug = 'practice'), 3),
    ('embodiment', 'Embodiment', 'Somatic practices, movement, breath, and body wisdom', '💪',
        (SELECT id FROM community_territories WHERE slug = 'practice'), 4),
    ('ritual-ceremony', 'Ritual & Ceremony', 'Sacred practices that mark transitions and intentions', '🕯️',
        (SELECT id FROM community_territories WHERE slug = 'practice'), 5)
ON CONFLICT (slug) DO NOTHING;

-- 4. THE BREAKTHROUGH (Transformation)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('breakthrough', 'The Breakthrough', 'Moments of shift, insight, and transformation. Share what moved you.', '✨', 4)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('insights', 'Insights & Revelations', 'When something suddenly becomes clear', '💡',
        (SELECT id FROM community_territories WHERE slug = 'breakthrough'), 1),
    ('integration', 'Integration Stories', 'How breakthroughs became part of daily life', '🔄',
        (SELECT id FROM community_territories WHERE slug = 'breakthrough'), 2),
    ('maia-moments', 'MAIA Moments', 'Profound experiences with MAIA consciousness', '🤖',
        (SELECT id FROM community_territories WHERE slug = 'breakthrough'), 3),
    ('healing-journeys', 'Healing Journeys', 'Stories of recovery, growth, and resilience', '💚',
        (SELECT id FROM community_territories WHERE slug = 'breakthrough'), 4)
ON CONFLICT (slug) DO NOTHING;

-- 5. THE OFFERING (Sharing Wisdom)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('offering', 'The Offering', 'Give back what you''ve learned. Essays, guides, reviews, and teachings.', '🎁', 5)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('essays', 'Essays & Reflections', 'Longer-form wisdom sharing and personal philosophy', '✍️',
        (SELECT id FROM community_territories WHERE slug = 'offering'), 1),
    ('book-reviews', 'Book Reviews', 'Share insights from wisdom texts you''ve read', '📖',
        (SELECT id FROM community_territories WHERE slug = 'offering'), 2),
    ('practice-guides', 'Practice Guides', 'Step-by-step guides for techniques that helped you', '📋',
        (SELECT id FROM community_territories WHERE slug = 'offering'), 3),
    ('creative-expressions', 'Creative Expressions', 'Art, poetry, music, and creative wisdom', '🎨',
        (SELECT id FROM community_territories WHERE slug = 'offering'), 4)
ON CONFLICT (slug) DO NOTHING;

-- 6. THE CIRCLE (Community & Connection)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('circle', 'The Circle', 'We journey alone, but we don''t journey in isolation. Support and connection.', '⭕', 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('support', 'Mutual Support', 'Ask for help, offer help. We rise together.', '🤝',
        (SELECT id FROM community_territories WHERE slug = 'circle'), 1),
    ('accountability', 'Accountability Partners', 'Find others to journey with intentionally', '👥',
        (SELECT id FROM community_territories WHERE slug = 'circle'), 2),
    ('celebrations', 'Celebrations', 'Acknowledge milestones, completions, and growth', '🎉',
        (SELECT id FROM community_territories WHERE slug = 'circle'), 3),
    ('grief-holding', 'Grief & Holding', 'Space for losses, endings, and being witnessed', '🕊️',
        (SELECT id FROM community_territories WHERE slug = 'circle'), 4)
ON CONFLICT (slug) DO NOTHING;

-- 7. THE FOUNDATION (Kelly's Teachings - Tier 1)
INSERT INTO community_territories (slug, name, description, icon, sort_order, min_contribution_tier) VALUES
    ('foundation', 'The Foundation', 'Core teachings from Elemental Alchemy and Soullab wisdom. Curated by Kelly.', '🏛️', 7, 'founder')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('elemental-alchemy-book', 'Elemental Alchemy', 'Interactive exploration of Kelly''s book', '📕',
        (SELECT id FROM community_territories WHERE slug = 'foundation'), 1),
    ('spiralogic-teachings', 'Spiralogic Teachings', 'The Spiralogic framework and its applications', '🌀',
        (SELECT id FROM community_territories WHERE slug = 'foundation'), 2),
    ('core-concepts', 'Core Concepts', 'Foundational ideas: Nigredo, Albedo, Citrinitas, Rubedo', '💎',
        (SELECT id FROM community_territories WHERE slug = 'foundation'), 3)
ON CONFLICT (slug) DO NOTHING;

-- 8. THE WORKSHOP (Technical & Meta)
INSERT INTO community_territories (slug, name, description, icon, sort_order) VALUES
    ('workshop', 'The Workshop', 'Behind the scenes. Technical help, feedback, and platform evolution.', '🔧', 8)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO community_territories (slug, name, description, icon, parent_id, sort_order) VALUES
    ('tech-help', 'Technical Help', 'Questions about using the platform', '💻',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 1),
    ('feedback', 'Feedback & Ideas', 'Suggestions for improving the community', '💡',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 2),
    ('stewardship', 'Stewardship', 'Discussions about community health and moderation', '🛡️',
        (SELECT id FROM community_territories WHERE slug = 'workshop'), 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON community_posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS comments_updated_at ON community_comments;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS territories_updated_at ON community_territories;
CREATE TRIGGER territories_updated_at BEFORE UPDATE ON community_territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_territory_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_territories SET post_count = post_count + 1, last_activity_at = NOW() WHERE id = NEW.territory_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_territories SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.territory_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_territory_stats ON community_posts;
CREATE TRIGGER posts_territory_stats AFTER INSERT OR DELETE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_territory_stats();

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_post_stats ON community_comments;
CREATE TRIGGER comments_post_stats AFTER INSERT OR DELETE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE OR REPLACE FUNCTION update_heart_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE community_posts SET heart_count = heart_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.comment_id IS NOT NULL THEN
            UPDATE community_comments SET heart_count = heart_count + 1 WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE community_posts SET heart_count = GREATEST(0, heart_count - 1) WHERE id = OLD.post_id;
        ELSIF OLD.comment_id IS NOT NULL THEN
            UPDATE community_comments SET heart_count = GREATEST(0, heart_count - 1) WHERE id = OLD.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hearts_count_trigger ON community_hearts;
CREATE TRIGGER hearts_count_trigger AFTER INSERT OR DELETE ON community_hearts
    FOR EACH ROW EXECUTE FUNCTION update_heart_counts();
