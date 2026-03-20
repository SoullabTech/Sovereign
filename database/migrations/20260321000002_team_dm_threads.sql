-- SoulComms Phase 2: Direct Messages + Thread Replies

-- ============================================
-- DIRECT MESSAGE THREADS
-- ============================================
CREATE TABLE IF NOT EXISTS team_dm_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_dm_members (
    dm_thread_id UUID NOT NULL REFERENCES team_dm_threads(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (dm_thread_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_team_dm_members_member ON team_dm_members(member_id);

CREATE TABLE IF NOT EXISTS team_dm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_thread_id UUID NOT NULL REFERENCES team_dm_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES members(id),
    body TEXT NOT NULL,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_dm_messages_thread ON team_dm_messages(dm_thread_id, created_at DESC)
    WHERE deleted_at IS NULL;
