-- ============================================
-- PRACTITIONERS SCHEMA ALIGNMENT
-- ============================================
-- Aligns Docker schema with local development schema
-- Adds missing profile columns: name, business_name, tagline, bio, etc.
-- Created: 2026-01-22

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Rename practitioner_name to name if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'practitioners' AND column_name = 'practitioner_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'practitioners' AND column_name = 'name') THEN
        ALTER TABLE practitioners RENAME COLUMN practitioner_name TO name;
    END IF;

    -- Rename practice_name to business_name if it exists and business_name doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'practitioners' AND column_name = 'practice_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'practitioners' AND column_name = 'business_name') THEN
        ALTER TABLE practitioners RENAME COLUMN practice_name TO business_name;
    END IF;

    -- Add tagline if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'tagline') THEN
        ALTER TABLE practitioners ADD COLUMN tagline TEXT;
    END IF;

    -- Add bio if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'bio') THEN
        ALTER TABLE practitioners ADD COLUMN bio TEXT;
    END IF;

    -- Add long_bio if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'long_bio') THEN
        ALTER TABLE practitioners ADD COLUMN long_bio TEXT;
    END IF;

    -- Add approach if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'approach') THEN
        ALTER TABLE practitioners ADD COLUMN approach TEXT;
    END IF;

    -- Add photo_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'photo_url') THEN
        ALTER TABLE practitioners ADD COLUMN photo_url TEXT;
    END IF;

    -- Add specialties if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'specialties') THEN
        ALTER TABLE practitioners ADD COLUMN specialties TEXT[];
    END IF;

    -- Add certifications if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'certifications') THEN
        ALTER TABLE practitioners ADD COLUMN certifications TEXT[];
    END IF;

    -- Add years_experience if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'years_experience') THEN
        ALTER TABLE practitioners ADD COLUMN years_experience INTEGER DEFAULT 0;
    END IF;

    -- Add location if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'location') THEN
        ALTER TABLE practitioners ADD COLUMN location TEXT;
    END IF;

    -- Add values if missing (array of text)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'values') THEN
        ALTER TABLE practitioners ADD COLUMN "values" TEXT[];
    END IF;

    -- Add social_links if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'social_links') THEN
        ALTER TABLE practitioners ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add settings if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'settings') THEN
        ALTER TABLE practitioners ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add revenue_share_percent if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'revenue_share_percent') THEN
        ALTER TABLE practitioners ADD COLUMN revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 12;
    END IF;

    -- Add launched_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'launched_at') THEN
        ALTER TABLE practitioners ADD COLUMN launched_at TIMESTAMPTZ;
    END IF;

    -- Add stripe_account_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'stripe_account_id') THEN
        ALTER TABLE practitioners ADD COLUMN stripe_account_id VARCHAR(255);
    END IF;

    -- Add stripe_connect_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'stripe_connect_id') THEN
        ALTER TABLE practitioners ADD COLUMN stripe_connect_id VARCHAR(255);
    END IF;

    -- Add stripe_connect_enabled if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'stripe_connect_enabled') THEN
        ALTER TABLE practitioners ADD COLUMN stripe_connect_enabled BOOLEAN DEFAULT false;
    END IF;

    -- Add stripe_connect_onboarded_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'practitioners' AND column_name = 'stripe_connect_onboarded_at') THEN
        ALTER TABLE practitioners ADD COLUMN stripe_connect_onboarded_at TIMESTAMPTZ;
    END IF;
END $$;

-- Make business_name nullable if it isn't already (some schemas have it as NOT NULL)
-- This is a safe operation - it won't fail if already nullable
DO $$
BEGIN
    ALTER TABLE practitioners ALTER COLUMN business_name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors (column might already be nullable)
END $$;
