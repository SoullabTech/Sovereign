-- Service Connectors
-- Unified connector registry for all external service integrations.
-- Capability-based: MAIA resolves by capability, not by provider name.
--
-- Three connector classes:
--   oauth      — delegated cloud connectors (Google, Apple)
--   credential — configured secure transport (Proton Bridge, CalDAV)
--   local      — sovereign data connectors (Obsidian vault, filesystem)
--   webhook    — user-controlled endpoints

CREATE TABLE IF NOT EXISTS service_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    connector_class VARCHAR(20) NOT NULL
        CHECK (connector_class IN ('oauth', 'credential', 'local', 'webhook')),
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected'
        CHECK (status IN ('connected', 'disconnected', 'configuring', 'error')),
    display_name VARCHAR(255),
    capabilities JSONB DEFAULT '[]'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    config_encrypted JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_connected_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    last_error TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(member_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_service_connectors_member
    ON service_connectors(member_id);

CREATE INDEX IF NOT EXISTS idx_service_connectors_provider
    ON service_connectors(provider);

CREATE INDEX IF NOT EXISTS idx_service_connectors_capabilities
    ON service_connectors USING gin(capabilities);

COMMENT ON TABLE service_connectors IS
    'Unified connector registry — status, config, and capabilities for all service integrations per member';
COMMENT ON COLUMN service_connectors.config IS
    'Non-secret provider-specific configuration (vault path, export prefs, etc.)';
COMMENT ON COLUMN service_connectors.config_encrypted IS
    'Sensitive fields (passwords, tokens). Stored as-is for v1 (self-hosted DB). Encryption-at-rest ready.';
COMMENT ON COLUMN service_connectors.metadata IS
    'Runtime metadata — provider email, last sync info, file counts, etc.';
COMMENT ON COLUMN service_connectors.capabilities IS
    'JSON array of capability strings: send_email, export_markdown, create_calendar_event, etc.';
