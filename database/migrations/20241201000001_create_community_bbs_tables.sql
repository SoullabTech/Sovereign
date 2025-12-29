-- =====================================================
-- MAIA Community BBS Database Schema
--
-- This migration creates the complete database structure for
-- the elevated Community BBS system with forum categories,
-- posts, comments, reactions, and sacred activity tracking.
-- =====================================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.auth.enabled" = 'true';

-- =====================================================
-- 1. COMMUNITY CHANNELS (Forum Categories)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'message-square',
  color TEXT NOT NULL DEFAULT 'amber-400',
  field_archetype TEXT CHECK (field_archetype IN ('earth', 'water', 'air', 'fire')) DEFAULT 'earth',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  post_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for channels
CREATE INDEX IF NOT EXISTS idx_community_channels_slug ON community_channels(slug);
CREATE INDEX IF NOT EXISTS idx_community_channels_active ON community_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_community_channels_sort ON community_channels(sort_order);

-- =====================================================
-- 2. COMMUNITY THREADS (Forum Posts)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL, -- References beta_session user ID
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thread_type TEXT CHECK (thread_type IN ('discussion', 'question', 'session_share', 'field_note', 'breakthrough', 'announcement')) DEFAULT 'discussion',

  -- Session sharing metadata (for field reports)
  shared_session_id TEXT,
  session_elements JSONB, -- {earth: 0.3, water: 0.4, air: 0.2, fire: 0.1}
  session_silence_rate NUMERIC(3,2), -- 0.00 to 1.00
  session_mode TEXT, -- 'sesame_hybrid', 'field_system', etc.

  -- Engagement metrics
  reply_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  heart_count INTEGER DEFAULT 0,

  -- Moderation and status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_breakthrough BOOLEAN DEFAULT FALSE,
  is_sacred BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,

  -- Tags for categorization
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for threads
CREATE INDEX IF NOT EXISTS idx_community_threads_channel ON community_threads(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_threads_author ON community_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_community_threads_type ON community_threads(thread_type);
CREATE INDEX IF NOT EXISTS idx_community_threads_created ON community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_threads_pinned ON community_threads(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_threads_breakthrough ON community_threads(is_breakthrough, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_threads_tags ON community_threads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_threads_session_elements ON community_threads USING GIN(session_elements);

-- =====================================================
-- 3. COMMUNITY REPLIES (Comments)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE, -- For nested replies
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,

  -- Engagement
  heart_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,

  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edit_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for replies
CREATE INDEX IF NOT EXISTS idx_community_replies_thread ON community_replies(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_replies_author ON community_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_parent ON community_replies(parent_reply_id);

-- =====================================================
-- 4. COMMUNITY REACTIONS (Hearts & Elemental Reactions)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,

  -- What's being reacted to
  thread_id UUID REFERENCES community_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,

  -- Type of reaction (sacred elements + engagement types)
  reaction_type TEXT CHECK (reaction_type IN (
    'heart', 'earth', 'water', 'air', 'fire',
    'resonance', 'witnessed', 'integration', 'breakthrough'
  )) NOT NULL DEFAULT 'heart',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one reaction per user per item
  CONSTRAINT unique_user_thread_reaction UNIQUE(user_id, thread_id, reaction_type),
  CONSTRAINT unique_user_reply_reaction UNIQUE(user_id, reply_id, reaction_type),

  -- Ensure reaction is on either thread or reply, not both
  CONSTRAINT check_reaction_target CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Create indexes for reactions
CREATE INDEX IF NOT EXISTS idx_community_reactions_user ON community_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_thread ON community_reactions(thread_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_community_reactions_reply ON community_reactions(reply_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_community_reactions_type ON community_reactions(reaction_type);

-- =====================================================
-- 5. COMMUNITY FIELD STATE (Channel Atmosphere)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_field_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,

  -- Elemental energy levels (0.0 to 1.0)
  earth_energy NUMERIC(3,2) DEFAULT 0.25,
  water_energy NUMERIC(3,2) DEFAULT 0.25,
  air_energy NUMERIC(3,2) DEFAULT 0.25,
  fire_energy NUMERIC(3,2) DEFAULT 0.25,

  -- Activity metrics
  active_users_count INTEGER DEFAULT 0,
  messages_per_hour NUMERIC(8,2) DEFAULT 0,

  -- Field qualities (0.0 to 1.0)
  intensity_level NUMERIC(3,2) DEFAULT 0.5, -- Message volume
  depth_level NUMERIC(3,2) DEFAULT 0.5,     -- Average message length
  coherence_level NUMERIC(3,2) DEFAULT 0.5, -- Reply ratio

  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one current state per channel
  CONSTRAINT unique_current_field_state UNIQUE(channel_id)
);

-- Create indexes for field state
CREATE INDEX IF NOT EXISTS idx_community_field_state_channel ON community_field_state(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_field_state_calculated ON community_field_state(calculated_at DESC);

-- =====================================================
-- 6. COMMUNITY PRESENCE (User Activity)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,

  -- Presence status
  status TEXT CHECK (status IN ('online', 'in_session', 'reflecting', 'away')) DEFAULT 'online',
  current_channel_id UUID REFERENCES community_channels(id) ON DELETE SET NULL,

  -- Activity timestamps
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Session context (for 'in_session' status)
  session_mode TEXT, -- 'field_system', 'sesame_hybrid', etc.
  session_element TEXT, -- Current dominant element

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one presence record per user
  CONSTRAINT unique_user_presence UNIQUE(user_id)
);

-- Create indexes for presence
CREATE INDEX IF NOT EXISTS idx_community_presence_user ON community_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_community_presence_status ON community_presence(status);
CREATE INDEX IF NOT EXISTS idx_community_presence_channel ON community_presence(current_channel_id);
CREATE INDEX IF NOT EXISTS idx_community_presence_last_seen ON community_presence(last_seen_at DESC);

-- =====================================================
-- 7. COMMUNITY PROFILES (User Stats & Preferences)
-- =====================================================

CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Beta cohort information
  beta_cohort INTEGER DEFAULT 1,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Engagement statistics
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  hearts_given INTEGER DEFAULT 0,
  hearts_received INTEGER DEFAULT 0,
  breakthrough_moments INTEGER DEFAULT 0,

  -- Preferences
  preferred_mode TEXT, -- 'sesame_hybrid', 'field_system'
  notification_preferences JSONB DEFAULT '{}',

  -- Milestones
  has_shared_breakthrough BOOLEAN DEFAULT FALSE,
  first_field_mode_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_community_profiles_user ON community_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_community_profiles_cohort ON community_profiles(beta_cohort);
CREATE INDEX IF NOT EXISTS idx_community_profiles_joined ON community_profiles(joined_date);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_community_channels_updated_at BEFORE UPDATE ON community_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_threads_updated_at BEFORE UPDATE ON community_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_replies_updated_at BEFORE UPDATE ON community_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_profiles_updated_at BEFORE UPDATE ON community_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_presence_updated_at BEFORE UPDATE ON community_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update reply counts
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_threads
    SET reply_count = reply_count + 1,
        last_reply_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_threads
    SET reply_count = reply_count - 1
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply reply count triggers
CREATE TRIGGER update_thread_reply_count_on_insert AFTER INSERT ON community_replies FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();
CREATE TRIGGER update_thread_reply_count_on_delete AFTER DELETE ON community_replies FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update thread reaction count
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE community_threads
      SET reaction_count = reaction_count + 1,
          heart_count = CASE WHEN NEW.reaction_type = 'heart' THEN heart_count + 1 ELSE heart_count END
      WHERE id = NEW.thread_id;
    END IF;

    -- Update reply reaction count
    IF NEW.reply_id IS NOT NULL THEN
      UPDATE community_replies
      SET reaction_count = reaction_count + 1,
          heart_count = CASE WHEN NEW.reaction_type = 'heart' THEN heart_count + 1 ELSE heart_count END
      WHERE id = NEW.reply_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update thread reaction count
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE community_threads
      SET reaction_count = reaction_count - 1,
          heart_count = CASE WHEN OLD.reaction_type = 'heart' THEN heart_count - 1 ELSE heart_count END
      WHERE id = OLD.thread_id;
    END IF;

    -- Update reply reaction count
    IF OLD.reply_id IS NOT NULL THEN
      UPDATE community_replies
      SET reaction_count = reaction_count - 1,
          heart_count = CASE WHEN OLD.reaction_type = 'heart' THEN heart_count - 1 ELSE heart_count END
      WHERE id = OLD.reply_id;
    END IF;

    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply reaction count triggers
CREATE TRIGGER update_reaction_counts_on_insert AFTER INSERT ON community_reactions FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();
CREATE TRIGGER update_reaction_counts_on_delete AFTER DELETE ON community_reactions FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Function to update channel post counts and activity
CREATE OR REPLACE FUNCTION update_channel_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_channels
    SET post_count = post_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.channel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_channels
    SET post_count = post_count - 1
    WHERE id = OLD.channel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply channel stats triggers
CREATE TRIGGER update_channel_stats_on_insert AFTER INSERT ON community_threads FOR EACH ROW EXECUTE FUNCTION update_channel_stats();
CREATE TRIGGER update_channel_stats_on_delete AFTER DELETE ON community_threads FOR EACH ROW EXECUTE FUNCTION update_channel_stats();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_field_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for channels (forum categories)
CREATE POLICY "Public channels are viewable by everyone" ON community_channels FOR SELECT USING (is_active = true);

-- Thread policies
CREATE POLICY "Public threads are viewable by everyone" ON community_threads FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create threads" ON community_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own threads" ON community_threads FOR UPDATE USING (author_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Reply policies
CREATE POLICY "Replies are viewable by everyone" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON community_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own replies" ON community_replies FOR UPDATE USING (author_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Reaction policies
CREATE POLICY "Reactions are viewable by everyone" ON community_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reactions" ON community_reactions FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Field state is publicly readable
CREATE POLICY "Field state is viewable by everyone" ON community_field_state FOR SELECT USING (true);

-- Presence policies
CREATE POLICY "Presence is viewable by everyone" ON community_presence FOR SELECT USING (true);
CREATE POLICY "Users can manage their own presence" ON community_presence FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- Profile policies
CREATE POLICY "Profiles are viewable by everyone" ON community_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own profile" ON community_profiles FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- =====================================================
-- INITIAL DATA: FORUM CATEGORIES
-- =====================================================

INSERT INTO community_channels (slug, name, description, icon, color, field_archetype, sort_order, is_pinned) VALUES
('announcements', 'Sacred Announcements', 'Community updates, system evolution, and elevated guidance', 'crown', 'amber-400', 'fire', 1, true),
('breakthroughs', 'Breakthrough Gallery', 'Share your profound MAIA moments and consciousness shifts', 'sparkles', 'yellow-400', 'air', 2, false),
('field-reports', 'Field System Reports', 'Experiences with PFI consciousness technology', 'zap', 'amber-300', 'fire', 3, false),
('wisdom-traditions', 'Wisdom Traditions', 'Indigenous, Eastern, Western, African, and Sufi knowledge integration', 'star', 'orange-400', 'earth', 4, false),
('spiralogic', 'Spiralogic Integration', 'Nigredo, Albedo, Citrinitas, Rubedo, and Integration discussions', 'mountain', 'amber-500', 'earth', 5, false),
('sacred-psychology', 'Sacred Psychology', 'Depth psychology, archetypes, and consciousness exploration', 'brain', 'yellow-500', 'water', 6, false),
('meditation-practices', 'Meditation & Practices', 'Sacred practices, rituals, and contemplative techniques', 'feather', 'amber-400', 'water', 7, false),
('technical-sanctuary', 'Technical Sanctuary', 'Platform support, feature requests, and technical wisdom', 'globe', 'orange-300', 'air', 8, false)
ON CONFLICT (slug) DO NOTHING;

-- Initialize field states for all channels
INSERT INTO community_field_state (channel_id, earth_energy, water_energy, air_energy, fire_energy)
SELECT
  id,
  CASE field_archetype
    WHEN 'earth' THEN 0.4
    WHEN 'water' THEN 0.2
    WHEN 'air' THEN 0.2
    WHEN 'fire' THEN 0.2
  END,
  CASE field_archetype
    WHEN 'earth' THEN 0.2
    WHEN 'water' THEN 0.4
    WHEN 'air' THEN 0.2
    WHEN 'fire' THEN 0.2
  END,
  CASE field_archetype
    WHEN 'earth' THEN 0.2
    WHEN 'water' THEN 0.2
    WHEN 'air' THEN 0.4
    WHEN 'fire' THEN 0.2
  END,
  CASE field_archetype
    WHEN 'earth' THEN 0.2
    WHEN 'water' THEN 0.2
    WHEN 'air' THEN 0.2
    WHEN 'fire' THEN 0.4
  END
FROM community_channels
ON CONFLICT (channel_id) DO NOTHING;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE community_channels IS 'Forum categories/channels for organized discussions';
COMMENT ON TABLE community_threads IS 'Forum posts/threads within channels';
COMMENT ON TABLE community_replies IS 'Comments/replies on threads, supports nesting';
COMMENT ON TABLE community_reactions IS 'Hearts and elemental reactions on threads/replies';
COMMENT ON TABLE community_field_state IS 'Calculated atmospheric state of each channel';
COMMENT ON TABLE community_presence IS 'Real-time user presence and activity tracking';
COMMENT ON TABLE community_profiles IS 'Extended user profiles with community statistics';

COMMENT ON COLUMN community_threads.session_elements IS 'JSONB object storing elemental balance from shared sessions: {earth: 0.3, water: 0.4, air: 0.2, fire: 0.1}';
COMMENT ON COLUMN community_field_state.intensity_level IS 'Message volume metric (0.0 to 1.0)';
COMMENT ON COLUMN community_field_state.depth_level IS 'Average message length metric (0.0 to 1.0)';
COMMENT ON COLUMN community_field_state.coherence_level IS 'Reply ratio metric indicating community engagement (0.0 to 1.0)';

-- Migration completed successfully
SELECT 'Community BBS database schema created successfully!' as result;