-- ASTRO-R4H fictional-only theme provenance fixture setup.
-- Run after R4F seed and migration in a disposable networkless PostgreSQL 16.
\set ON_ERROR_STOP on
CREATE TABLE member_theme_signals (
 id bigserial PRIMARY KEY,
 member_id uuid NOT NULL,
 session_id text,
 journal_entry_id uuid,
 theme text NOT NULL,
 signal_type text NOT NULL DEFAULT 'active',
 resonance_strength double precision,
 element text,
 context jsonb NOT NULL DEFAULT '{}'::jsonb,
 detected_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
