-- Add show_soul_metadata setting for admin debug mode
INSERT INTO system_settings (key, value, description)
VALUES ('show_soul_metadata', 'false'::jsonb, 'Show SOUL_METADATA in responses (admin debug mode). Default OFF.')
ON CONFLICT (key) DO NOTHING;
