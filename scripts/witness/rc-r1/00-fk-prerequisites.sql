CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE member_manuscripts (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE manuscript_working_drafts (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE manuscript_sections (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE manuscript_draft_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES manuscript_working_drafts(id) ON DELETE CASCADE,
  position int NOT NULL, text text NOT NULL DEFAULT '',
  UNIQUE (draft_id, position));
CREATE TABLE ask_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE ask_turns (
  thread_id uuid NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,
  turn_index integer NOT NULL CHECK (turn_index >= 0),
  speaker text NOT NULL CHECK (speaker IN ('author','maia')),
  body text NOT NULL CHECK (length(body) > 0),
  PRIMARY KEY (thread_id, turn_index));
