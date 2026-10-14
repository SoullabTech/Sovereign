-- ASTRO-R4F / disposable PostgreSQL 16, completely fictional IDs and text.
-- Run ONLY in a fresh networkless container against a private temporary DB.
\set ON_ERROR_STOP on
CREATE TABLE members (
  id uuid PRIMARY KEY,
  astrology_consent text NOT NULL,
  tester boolean DEFAULT false
);
CREATE TABLE conversation_turns (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id text,
  role text,
  content text,
  created_at timestamptz DEFAULT clock_timestamp(),
  seq integer DEFAULT 0
);
INSERT INTO members (id, astrology_consent, tester) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'opted_in', true),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'opted_in', true),
  ('cccccccc-0000-4000-8000-000000000003', 'declined', true);

-- Migration applied separately, after members exists.
