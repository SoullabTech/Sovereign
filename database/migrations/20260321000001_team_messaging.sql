-- Team Messaging Schema (SoulComms)
-- Sovereign, self-hosted, real-time messaging for the Soullab exec team
-- No third-party services. All data stays in PostgreSQL.

-- ============================================
-- CHANNELS
-- ============================================
CREATE TABLE IF NOT EXISTS team_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,                   -- 'general', 'exec', 'ops', 'dev'
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT NOT NULL DEFAULT 'text'
        CHECK (channel_type IN ('text', 'announcement')),
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES members(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_channels_slug ON team_channels(slug);

-- Private channel membership (public channels: all team members can see)
CREATE TABLE IF NOT EXISTS team_channel_members (
    channel_id UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (channel_id, member_id)
);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS team_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES members(id),
    body TEXT NOT NULL,
    parent_id UUID REFERENCES team_messages(id),  -- thread reply
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_messages_channel ON team_messages(channel_id, created_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_messages_parent ON team_messages(parent_id)
    WHERE parent_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================
-- REACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS team_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES team_messages(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, member_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_team_reactions_message ON team_reactions(message_id);

-- ============================================
-- PRESENCE (heartbeat-based)
-- ============================================
CREATE TABLE IF NOT EXISTS team_presence (
    member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'online'
        CHECK (status IN ('online', 'away', 'offline')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- READ RECEIPTS / UNREAD TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS team_channel_reads (
    channel_id UUID NOT NULL REFERENCES team_channels(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (channel_id, member_id)
);

-- ============================================
-- SEED: Default channels
-- Uses a placeholder UUID for created_by — replace with real admin member id
-- in production, or run: UPDATE team_channels SET created_by = (SELECT id FROM members LIMIT 1);
-- ============================================
INSERT INTO team_channels (id, slug, name, description, channel_type, created_by)
SELECT
    gen_random_uuid(),
    c.slug,
    c.name,
    c.description,
    c.channel_type,
    (SELECT id FROM members ORDER BY created_at ASC LIMIT 1)
FROM (VALUES
    ('general',     'General',     'Team-wide updates and announcements', 'announcement'),
    ('exec',        'Exec',        'Executive team discussions',          'text'),
    ('ops',         'Ops',         'Operations, deployments, infra',      'text'),
    ('dev',         'Dev',         'Development and engineering',         'text'),
    ('design',      'Design',      'Design, UX, and brand',               'text'),
    ('random',      'Random',      'Off-topic, ideas, banter',            'text')
) AS c(slug, name, description, channel_type)
WHERE EXISTS (SELECT 1 FROM members LIMIT 1)
ON CONFLICT (slug) DO NOTHING;
