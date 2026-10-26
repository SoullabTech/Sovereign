-- LISTEN-47 disposable fictional PostgreSQL fixture.
-- Run only in a dedicated test database. No production/member data.
DROP TABLE IF EXISTS reading_moments CASCADE;
DROP TABLE IF EXISTS audiobook_segments CASCADE;
DROP TABLE IF EXISTS audiobook_chapters CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
DROP TABLE IF EXISTS member_settings CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;

CREATE TABLE schema_migrations (
  version text PRIMARY KEY
);

CREATE TABLE members (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  name text NOT NULL,
  preferred_name text,
  email text,
  onboarded boolean NOT NULL DEFAULT true,
  onboarding_step text NOT NULL DEFAULT 'complete',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_sign_in timestamptz,
  tier text NOT NULL DEFAULT 'free',
  roles text[] NOT NULL DEFAULT ARRAY['member']::text[],
  has_webauthn boolean NOT NULL DEFAULT false,
  preferred_auth_method text NOT NULL DEFAULT 'password'
);

CREATE TABLE member_settings (
  member_id uuid PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  circle_tier text NOT NULL DEFAULT 'explorer'
);

CREATE TABLE auth_sessions (
  session_token text PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  revoked boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_reason text
);

CREATE TABLE audiobook_chapters (
  id text PRIMARY KEY,
  title text NOT NULL
);

CREATE TABLE audiobook_segments (
  id text PRIMARY KEY,
  chapter_id text NOT NULL REFERENCES audiobook_chapters(id) ON DELETE CASCADE,
  text text NOT NULL,
  segment_index integer NOT NULL
);

CREATE TABLE reading_moments (
  id text PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  segment_id text NOT NULL REFERENCES audiobook_segments(id) ON DELETE CASCADE,
  moment_type text NOT NULL,
  content text,
  ritual_mode text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO members (
  id, username, name, preferred_name, email, tier, roles, last_sign_in
) VALUES
  ('11111111-2222-4333-8444-555555555555', 'fictional-a', 'Fictional Member A', 'A', 'a@example.invalid', 'free', ARRAY['member'], now()),
  ('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', 'fictional-b', 'Fictional Member B', 'B', 'b@example.invalid', 'free', ARRAY['member'], now());

INSERT INTO member_settings (member_id, circle_tier) VALUES
  ('11111111-2222-4333-8444-555555555555', 'explorer'),
  ('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', 'explorer');

INSERT INTO auth_sessions (
  session_token, member_id, revoked, expires_at, revoked_at, revoked_reason
) VALUES
  ('fictional-listen47-A', '11111111-2222-4333-8444-555555555555', false, now() + interval '2 days', null, null),
  ('fictional-listen47-B', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', false, now() + interval '2 days', null, null),
  ('fictional-listen47-revoked', '11111111-2222-4333-8444-555555555555', true, now() + interval '2 days', now(), 'fixture'),
  ('fictional-listen47-expired', '11111111-2222-4333-8444-555555555555', false, now() - interval '1 day', null, null);

INSERT INTO audiobook_chapters (id, title) VALUES ('preface', 'Preface');
INSERT INTO audiobook_segments (id, chapter_id, text, segment_index) VALUES
  ('preface-0', 'preface', 'A fictional passage for Reader audio-authority acceptance.', 0),
  ('preface-1', 'preface', 'A second fictional passage confirms progress and private moments.', 1);
