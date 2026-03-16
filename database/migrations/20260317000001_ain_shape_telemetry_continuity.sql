-- Migration: Conversation Continuity Layer
-- Adds JSONB continuity_data column to ain_shape_telemetry.
-- Additive only — no existing columns changed.

ALTER TABLE ain_shape_telemetry
  ADD COLUMN IF NOT EXISTS continuity_data JSONB DEFAULT NULL;

COMMENT ON COLUMN ain_shape_telemetry.continuity_data IS
  'Continuity layer signals: hadActiveThread, activeThreadConfidence, hadCorrectionSignal, correctionType, validationPassed, detectedIssues';
