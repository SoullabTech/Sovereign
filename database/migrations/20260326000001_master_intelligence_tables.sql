-- ═══════════════════════════════════════════════════════════════
-- Master Intelligence Architecture — Phase 1 Foundation
-- ═══════════════════════════════════════════════════════════════
--
-- Five tables for federated multi-master intelligence:
--   1. master_intelligence  — identity registry
--   2. master_documents     — source material
--   3. master_extractions   — intelligence fragments
--   4. master_builds        — compiled versioned artifacts
--   5. master_corrections   — feedback from masters (co-training)
--
-- Architecture: MAIA is the substrate. Masters layer on top.
-- Each master has a distinct voice, stance, method, perceptual framing.
-- ═══════════════════════════════════════════════════════════════

-- 1. MASTERS — the identity registry
CREATE TABLE IF NOT EXISTS master_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  domain VARCHAR(200),           -- e.g. 'somatic therapy', 'EFT'
  modality VARCHAR(200),         -- e.g. 'one-on-one', 'group', 'training'
  active_build_id UUID,          -- FK added after master_builds created
  field_slug VARCHAR(50),        -- links to existing MasterField config for portal
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_intelligence_slug
  ON master_intelligence(slug);
CREATE INDEX IF NOT EXISTS idx_master_intelligence_status
  ON master_intelligence(status) WHERE status = 'active';

-- 2. MASTER DOCUMENTS — source material (books, transcripts, sessions)
CREATE TABLE IF NOT EXISTS master_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES master_intelligence(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  source_type VARCHAR(50) NOT NULL,  -- book, transcript, interview, video, article
  format VARCHAR(20) NOT NULL DEFAULT 'markdown'
    CHECK (format IN ('markdown', 'transcript', 'pdf', 'audio', 'video', 'json')),
  raw_content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL, -- SHA256 for dedup
  source_url TEXT,
  uploaded_by UUID,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'extracted', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_documents_master
  ON master_documents(master_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_documents_hash
  ON master_documents(master_id, content_hash);

-- 3. MASTER EXTRACTIONS — intelligence fragments from documents
CREATE TABLE IF NOT EXISTS master_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES master_intelligence(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES master_documents(id) ON DELETE CASCADE,
  extraction_type VARCHAR(30) NOT NULL
    CHECK (extraction_type IN (
      'voice', 'knowledge', 'perception', 'method',
      'constraint', 'distortion', 'sequence', 'language_pattern'
    )),
  content TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  tags TEXT[] DEFAULT '{}',
  section_ref TEXT,              -- page/timestamp/heading ref back to source
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_extractions_master_type
  ON master_extractions(master_id, extraction_type);
CREATE INDEX IF NOT EXISTS idx_master_extractions_document
  ON master_extractions(document_id);

-- 4. MASTER BUILDS — compiled intelligence artifacts
CREATE TABLE IF NOT EXISTS master_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES master_intelligence(id) ON DELETE CASCADE,
  build_version VARCHAR(20) NOT NULL,
  voice_block TEXT NOT NULL,
  stance_block TEXT NOT NULL,
  knowledge_block TEXT NOT NULL,
  perceptual_block TEXT NOT NULL,
  method_block TEXT,             -- optional — not all masters are method-led
  safety_block TEXT,             -- master-specific safety (layered on canon)
  validation_notes TEXT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'validated', 'active', 'retired')),
  created_by UUID,
  activated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_master_builds_master_status
  ON master_builds(master_id, status);
-- Exactly one active build per master
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_builds_active
  ON master_builds(master_id) WHERE status = 'active';

-- Now add FK from master_intelligence to master_builds
ALTER TABLE master_intelligence
  ADD CONSTRAINT fk_master_active_build
  FOREIGN KEY (active_build_id) REFERENCES master_builds(id);

-- 5. MASTER CORRECTIONS — feedback from masters (co-training loop)
CREATE TABLE IF NOT EXISTS master_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES master_intelligence(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  turn_id UUID,                  -- optional reference to the turn being corrected
  correction_type VARCHAR(20) NOT NULL
    CHECK (correction_type IN ('thumbs', 'felt_like_me', 'rewrite', 'note')),
  original_content TEXT,
  corrected_content TEXT,        -- highest value when correction_type = 'rewrite'
  signal VARCHAR(10) NOT NULL DEFAULT 'neutral'
    CHECK (signal IN ('positive', 'negative', 'neutral')),
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_corrections_master
  ON master_corrections(master_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_master_corrections_member
  ON master_corrections(member_id, created_at DESC);
-- Dedup: one correction per turn+type (prevents spam on rapid clicks)
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_corrections_dedup
  ON master_corrections(turn_id, correction_type) WHERE turn_id IS NOT NULL;
