#!/bin/bash

# Setup script for video library database table
# This script should be run after the database is initialized

echo "Setting up member_videos table..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Run the migration using psql
psql "$DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS member_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  heygen_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'member' CHECK (visibility IN ('member','practitioner','admin')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS member_videos_visibility_idx ON member_videos (visibility);
CREATE INDEX IF NOT EXISTS member_videos_featured_idx ON member_videos (is_featured);

-- Add updated_at trigger if it doesn't exist
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'update_updated_at_column' AND n.nspname = 'public'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS \$\$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    \$\$ language 'plpgsql';
  END IF;
END;
\$\$;

-- Add trigger to member_videos table if it doesn't exist
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_member_videos_updated_at'
  ) THEN
    CREATE TRIGGER update_member_videos_updated_at
    BEFORE UPDATE ON member_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
\$\$;

echo "member_videos table setup complete."
"