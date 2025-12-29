-- Add menu_signals column to AIN shape telemetry
-- Stores detailed breakdown of which menu patterns triggered (colon run, semicolon run, etc.)
-- JSONB for flexibility; nullable since older rows won't have it

ALTER TABLE ain_shape_telemetry
ADD COLUMN IF NOT EXISTS menu_signals JSONB;

COMMENT ON COLUMN ain_shape_telemetry.menu_signals IS 'Detailed menu detection signals: colonRunMenu, semicolonRunMenu, eitherOrMenu, optionABMenu, listItems, ifCount, etc.';
