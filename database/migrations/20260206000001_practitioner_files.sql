-- Practitioner Files (Vault) Schema
-- Secure file storage for practitioners with sharing capabilities

-- ============================================
-- PRACTITIONER FILES (main storage)
-- ============================================
CREATE TABLE IF NOT EXISTS practitioner_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL,  -- References practitioners.id

    -- File identity
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,  -- Original filename before sanitization
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,

    -- Storage location
    storage_path TEXT NOT NULL,  -- Relative path within storage directory
    storage_type TEXT NOT NULL DEFAULT 'local' CHECK (storage_type IN ('local', 's3')),

    -- Organization
    folder_path TEXT[] DEFAULT '{}',  -- Array of folder names for path hierarchy

    -- File type classification
    file_type TEXT NOT NULL DEFAULT 'file' CHECK (file_type IN (
        'document',   -- PDF, DOCX, TXT
        'image',      -- PNG, JPG, GIF
        'video',      -- MP4, MOV
        'audio',      -- MP3, WAV, M4A
        'spreadsheet',-- XLSX, CSV
        'archive',    -- ZIP, RAR
        'file'        -- Other/unknown
    )),

    -- Security
    encrypted BOOLEAN DEFAULT false,
    encryption_key_id TEXT,  -- Reference to key if encrypted

    -- Metadata
    description TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_practitioner_files_practitioner ON practitioner_files(practitioner_id);
CREATE INDEX idx_practitioner_files_folder ON practitioner_files(practitioner_id, folder_path);
CREATE INDEX idx_practitioner_files_type ON practitioner_files(practitioner_id, file_type);
CREATE INDEX idx_practitioner_files_status ON practitioner_files(practitioner_id, status);

-- ============================================
-- FILE FOLDERS (virtual folders)
-- ============================================
CREATE TABLE IF NOT EXISTS practitioner_file_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL,

    name TEXT NOT NULL,
    parent_path TEXT[] DEFAULT '{}',  -- Path to parent folder
    color TEXT DEFAULT '#6366f1',

    -- Security
    encrypted BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(practitioner_id, parent_path, name)
);

CREATE INDEX idx_file_folders_practitioner ON practitioner_file_folders(practitioner_id);
CREATE INDEX idx_file_folders_parent ON practitioner_file_folders(practitioner_id, parent_path);

-- ============================================
-- FILE SHARES (sharing with clients)
-- ============================================
CREATE TABLE IF NOT EXISTS practitioner_file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES practitioner_files(id) ON DELETE CASCADE,

    -- Share target (one of these should be set)
    client_id UUID,  -- References practitioner_clients.id
    colleague_id UUID,  -- References practitioners.id (for peer sharing)

    -- Share settings
    share_type TEXT NOT NULL DEFAULT 'view' CHECK (share_type IN ('view', 'download')),

    -- Access control
    access_token TEXT UNIQUE,  -- For link-based access
    expires_at TIMESTAMPTZ,
    password_hash TEXT,  -- Optional password protection

    -- Tracking
    access_count INT DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_file_shares_file ON practitioner_file_shares(file_id);
CREATE INDEX idx_file_shares_client ON practitioner_file_shares(client_id);
CREATE INDEX idx_file_shares_colleague ON practitioner_file_shares(colleague_id);
CREATE INDEX idx_file_shares_token ON practitioner_file_shares(access_token);

-- ============================================
-- FILE ACCESS LOG (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS practitioner_file_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES practitioner_files(id) ON DELETE CASCADE,

    -- Who accessed
    accessor_type TEXT NOT NULL CHECK (accessor_type IN ('practitioner', 'client', 'colleague', 'link')),
    accessor_id UUID,  -- ID of accessor (if known)

    -- Access details
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'share', 'delete')),
    ip_address TEXT,
    user_agent TEXT,

    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_access_file ON practitioner_file_access_log(file_id);
CREATE INDEX idx_file_access_time ON practitioner_file_access_log(accessed_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_practitioner_files_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practitioner_files_updated_at ON practitioner_files;
CREATE TRIGGER practitioner_files_updated_at
  BEFORE UPDATE ON practitioner_files
  FOR EACH ROW
  EXECUTE FUNCTION update_practitioner_files_timestamp();

DROP TRIGGER IF EXISTS practitioner_file_folders_updated_at ON practitioner_file_folders;
CREATE TRIGGER practitioner_file_folders_updated_at
  BEFORE UPDATE ON practitioner_file_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_practitioner_files_timestamp();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE practitioner_files IS 'Secure file storage for practitioners - the Vault';
COMMENT ON TABLE practitioner_file_folders IS 'Virtual folder structure for organizing files';
COMMENT ON TABLE practitioner_file_shares IS 'File sharing with clients and colleagues';
COMMENT ON TABLE practitioner_file_access_log IS 'Audit trail for file access';

COMMENT ON COLUMN practitioner_files.folder_path IS 'Array representing folder hierarchy, e.g. {Client Agreements, 2024}';
COMMENT ON COLUMN practitioner_files.storage_path IS 'Relative path within storage, e.g. practitioner-uuid/files/file-uuid.pdf';
COMMENT ON COLUMN practitioner_file_shares.access_token IS 'Unique token for shareable link access';
