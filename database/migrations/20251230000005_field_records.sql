-- Migration: Field Records tables (Sacred Laboratory)
-- Created: 2025-12-30
-- Purpose: Store Field Records and community engagement for Field Protocol

BEGIN;

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Field Records table: stores the 5-stage wisdom documentation
CREATE TABLE IF NOT EXISTS field_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Core stages (stored as JSONB for flexibility)
  observation      JSONB NOT NULL,                    -- ObservationRecord
  interpretation   JSONB,                             -- InterpretationRecord
  integration      JSONB,                             -- IntegrationRecord
  reflection       JSONB,                             -- ReflectionRecord
  transmission     JSONB,                             -- TransmissionRecord

  -- Metadata
  completion_stage INTEGER NOT NULL DEFAULT 1 CHECK (completion_stage BETWEEN 1 AND 5),
  privacy_level    TEXT NOT NULL DEFAULT 'private',   -- 'private' | 'commons' | 'public'
  tags             JSONB DEFAULT '[]'::jsonb,

  -- Community engagement
  community_engagement JSONB DEFAULT '{"views": 0, "resonanceMarkers": 0, "reflections": [], "questions": []}'::jsonb,

  -- Brain Trust integration
  ai_processing    JSONB DEFAULT '{"maiaReferences": [], "patternConnections": [], "wisdomScore": 0}'::jsonb
);

-- Resonance Events table: tracks when users resonate with records
CREATE TABLE IF NOT EXISTS resonance_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id        UUID NOT NULL REFERENCES field_records(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for field_records
CREATE INDEX IF NOT EXISTS idx_field_records_user_id
  ON field_records (user_id);

CREATE INDEX IF NOT EXISTS idx_field_records_user_created
  ON field_records (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_field_records_privacy
  ON field_records (privacy_level)
  WHERE privacy_level IN ('commons', 'public');

CREATE INDEX IF NOT EXISTS idx_field_records_completion
  ON field_records (completion_stage);

-- GIN index for searching within JSONB columns
CREATE INDEX IF NOT EXISTS idx_field_records_tags
  ON field_records USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_field_records_interpretation
  ON field_records USING GIN (interpretation);

-- Indexes for resonance_events
CREATE INDEX IF NOT EXISTS idx_resonance_events_record
  ON resonance_events (record_id);

CREATE INDEX IF NOT EXISTS idx_resonance_events_user
  ON resonance_events (user_id);

COMMIT;
