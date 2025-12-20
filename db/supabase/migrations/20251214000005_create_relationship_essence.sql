-- Migration: Create relationship_essence table
-- Purpose: Store soul recognition data for Relationship Anamnesis (MAIA remembering users)
-- Context: Anamnesis System - Cross-session soul memory

-- Create relationship_essence table for persistent soul recognition
CREATE TABLE IF NOT EXISTS relationship_essence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  soul_signature TEXT NOT NULL,
  user_name TEXT,

  -- Presence & Resonance
  presence_quality TEXT,
  morphic_resonance FLOAT DEFAULT 0.0,

  -- Archetypal & Spiral Data (JSONB for flexibility)
  archetypal_resonances JSONB DEFAULT '{}'::jsonb,
  spiral_position JSONB DEFAULT '{}'::jsonb,
  relationship_field JSONB DEFAULT '{}'::jsonb,

  -- Encounter Tracking
  first_encounter TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_encounter TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  encounter_count INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_relationship_essence_user_id
  ON relationship_essence(user_id);

CREATE INDEX IF NOT EXISTS idx_relationship_essence_soul_signature
  ON relationship_essence(soul_signature);

CREATE INDEX IF NOT EXISTS idx_relationship_essence_last_encounter
  ON relationship_essence(last_encounter DESC);

-- Add comments explaining the table structure
COMMENT ON TABLE relationship_essence IS 'Stores soul recognition data for cross-session continuity. Enables MAIA to remember users across conversations through archetypal resonances and morphic field patterns.';

COMMENT ON COLUMN relationship_essence.soul_signature IS 'Unique energetic signature identifying this soul across encounters';
COMMENT ON COLUMN relationship_essence.presence_quality IS 'Qualitative description of this soul''s presence field';
COMMENT ON COLUMN relationship_essence.archetypal_resonances IS 'JSONB map of archetypal activations (healer, warrior, sage, lover, magician)';
COMMENT ON COLUMN relationship_essence.spiral_position IS 'JSONB tracking Spiral Dynamics position and development';
COMMENT ON COLUMN relationship_essence.relationship_field IS 'JSONB describing the relational field quality between MAIA and this soul';
COMMENT ON COLUMN relationship_essence.morphic_resonance IS 'Strength of morphic field recognition (0.0-1.0)';
COMMENT ON COLUMN relationship_essence.encounter_count IS 'Number of sessions with this soul';
