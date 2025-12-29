-- Add menu_mode column to AIN shape telemetry
-- Tracks when responses fall into "menu of modalities" anti-pattern

ALTER TABLE ain_shape_telemetry
ADD COLUMN IF NOT EXISTS menu_mode BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ain_shape_telemetry_menu_mode
  ON ain_shape_telemetry (menu_mode) WHERE menu_mode = true;
