-- Migration: Restricted database user for rudeboy-baking
-- Purpose: Contain rudeboy-baking to only its own tables, not maia member data
--
-- RudeBoy-Baking only needs access to three tables:
--   rudeboy_calendar_events, rudeboy_recipes, rudeboy_chef_training
--
-- After applying this migration:
--   1. Set RUDEBOY_DB_PASSWORD in .env.production to a strong random value:
--        openssl rand -hex 32
--   2. Set the password on the new user:
--        docker exec maia-postgres psql -U soullab maia_consciousness \
--          -c "ALTER USER soullab_rudeboy PASSWORD '<your-password>';"
--   3. Update RUDEBOY_DATABASE_URL in .env.production:
--        postgresql://soullab_rudeboy:<password>@maia-postgres:5432/maia_consciousness
--   4. Redeploy rudeboy-baking

-- Create the restricted user (no password set here — set it via ALTER USER after migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'soullab_rudeboy') THEN
    CREATE USER soullab_rudeboy WITH
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      CONNECTION LIMIT 10;
    RAISE NOTICE 'Created user soullab_rudeboy';
  ELSE
    RAISE NOTICE 'User soullab_rudeboy already exists, skipping creation';
  END IF;
END $$;

-- Revoke all public schema defaults first (defence in depth)
REVOKE ALL ON SCHEMA public FROM soullab_rudeboy;

-- Grant schema usage (required to access tables)
GRANT USAGE ON SCHEMA public TO soullab_rudeboy;

-- Grant only the tables rudeboy-baking actually uses
-- These tables are all rudeboy_* prefixed — no access to member data
-- Wrapped in DO blocks so migration is idempotent: tables may not exist yet
-- if rudeboy-baking has not been initialised in this environment.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rudeboy_calendar_events') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rudeboy_calendar_events TO soullab_rudeboy;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rudeboy_recipes') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rudeboy_recipes TO soullab_rudeboy;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rudeboy_chef_training') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE rudeboy_chef_training TO soullab_rudeboy;
  END IF;
END $$;

-- Grant sequence usage for auto-increment / uuid generation on those tables
DO $$
DECLARE
  seq_name TEXT;
BEGIN
  FOR seq_name IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
      AND sequence_name LIKE 'rudeboy_%'
  LOOP
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %I TO soullab_rudeboy', seq_name);
    RAISE NOTICE 'Granted sequence: %', seq_name;
  END LOOP;
END $$;

-- Explicitly deny access to all member/maia tables
-- (Belt-and-suspenders: if REVOKE ALL above is ever bypassed)
-- Wrapped in DO block so migration is idempotent across environments.
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['members','auth_sessions','conversation_turns',
                              'session_memory','relationship_memory','audit_logs']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('REVOKE ALL ON TABLE %I FROM soullab_rudeboy', tbl);
    END IF;
  END LOOP;
END $$;

COMMENT ON ROLE soullab_rudeboy IS 'Restricted user for rudeboy-baking service — rudeboy_* tables only';
