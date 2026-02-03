-- OAuth Providers
-- Links external OAuth accounts (Google, Apple) to members
-- Supports multiple providers per member for flexibility

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'apple')),
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each provider account can only be linked once
    UNIQUE(provider, provider_user_id)
);

-- Index for looking up by member
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_member ON oauth_accounts(member_id);

-- Index for provider lookups during auth
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user ON oauth_accounts(provider, provider_user_id);

-- Index for email lookups (to find existing members by OAuth email)
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_email ON oauth_accounts(email);

COMMENT ON TABLE oauth_accounts IS 'Links external OAuth providers (Google, Apple) to member accounts';
COMMENT ON COLUMN oauth_accounts.provider_user_id IS 'The unique ID from the OAuth provider (sub claim)';

-- OAuth state tokens for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(64) NOT NULL UNIQUE,
    provider VARCHAR(20) NOT NULL,
    redirect_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

COMMENT ON TABLE oauth_states IS 'Temporary state tokens for OAuth CSRF protection, auto-expire after 10 minutes';
