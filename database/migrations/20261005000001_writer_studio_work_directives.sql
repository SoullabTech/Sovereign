-- JARVIS-WRITERS-STUDIO-EA-COMPLETION-01 / ACT 4
-- Work Decision + Protection Ledger — smallest lawful vertical slice.
--
-- Member-authored only in v1. No MAIA candidate can become a directive.
-- The directive identity is durable; changes are append-only events.
-- Current effect is derived from the newest event, never stored twice.
-- Scope is Work-level only in v1.

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writer_studio_work_directives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('protect', 'decision', 'open_question')),
  initial_text TEXT NOT NULL CHECK (char_length(trim(initial_text)) BETWEEN 1 AND 4000),
  provenance_kind TEXT NOT NULL DEFAULT 'member-declared'
    CHECK (provenance_kind = 'member-declared'),
  scope_kind TEXT NOT NULL DEFAULT 'work'
    CHECK (scope_kind = 'work'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, member_id)
);

CREATE INDEX IF NOT EXISTS writer_studio_work_directives_work_idx
  ON writer_studio_work_directives(member_id, living_work_id, created_at, id);

CREATE TABLE IF NOT EXISTS writer_studio_work_directive_events (
  id BIGSERIAL PRIMARY KEY,
  directive_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('revise', 'retire', 'restore')),
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT writer_studio_work_directive_event_owner_fkey
    FOREIGN KEY (directive_id, member_id)
    REFERENCES writer_studio_work_directives(id, member_id)
    ON DELETE CASCADE,

  CONSTRAINT writer_studio_work_directive_event_text_shape CHECK (
    (event_type = 'revise' AND text IS NOT NULL
      AND char_length(trim(text)) BETWEEN 1 AND 4000)
    OR
    (event_type <> 'revise' AND text IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS writer_studio_work_directive_events_directive_idx
  ON writer_studio_work_directive_events(directive_id, created_at, id);

CREATE OR REPLACE FUNCTION writer_studio_work_directives_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION
      'writer studio work directive history is append-only: append a successor event';
  END IF;

  IF TG_TABLE_NAME = 'writer_studio_work_directive_events'
     AND TG_OP = 'DELETE'
     AND EXISTS (
       SELECT 1 FROM writer_studio_work_directives
        WHERE id = OLD.directive_id AND member_id = OLD.member_id
     )
     AND EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION
      'writer studio work directive event % may leave only by lawful parent custody cascade',
      OLD.id;
  END IF;

  IF TG_TABLE_NAME = 'writer_studio_work_directives'
     AND TG_OP = 'DELETE'
     AND EXISTS (
       SELECT 1 FROM living_works
        WHERE id = OLD.living_work_id AND member_id = OLD.member_id
     )
     AND EXISTS (SELECT 1 FROM members WHERE id = OLD.member_id) THEN
    RAISE EXCEPTION
      'writer studio work directive % may leave only by lawful Work custody cascade',
      OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_work_directives_immutable_check
  ON writer_studio_work_directives;
CREATE TRIGGER writer_studio_work_directives_immutable_check
  BEFORE UPDATE OR DELETE ON writer_studio_work_directives
  FOR EACH ROW EXECUTE FUNCTION writer_studio_work_directives_immutable();

DROP TRIGGER IF EXISTS writer_studio_work_directive_events_immutable_check
  ON writer_studio_work_directive_events;
CREATE TRIGGER writer_studio_work_directive_events_immutable_check
  BEFORE UPDATE OR DELETE ON writer_studio_work_directive_events
  FOR EACH ROW EXECUTE FUNCTION writer_studio_work_directives_immutable();

CREATE OR REPLACE FUNCTION writer_studio_work_directives_refuse_truncate()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'TRUNCATE refused on writer studio Work directive history';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS writer_studio_work_directives_no_truncate
  ON writer_studio_work_directives;
CREATE TRIGGER writer_studio_work_directives_no_truncate
  BEFORE TRUNCATE ON writer_studio_work_directives
  FOR EACH STATEMENT EXECUTE FUNCTION writer_studio_work_directives_refuse_truncate();

DROP TRIGGER IF EXISTS writer_studio_work_directive_events_no_truncate
  ON writer_studio_work_directive_events;
CREATE TRIGGER writer_studio_work_directive_events_no_truncate
  BEFORE TRUNCATE ON writer_studio_work_directive_events
  FOR EACH STATEMENT EXECUTE FUNCTION writer_studio_work_directives_refuse_truncate();

COMMENT ON TABLE writer_studio_work_directives IS
  'EA-COMPLETION-01 Act 4: member-authored Work-level protections, decisions, and open questions. These are editorial context, never manuscript prose or mutation authority.';
COMMENT ON TABLE writer_studio_work_directive_events IS
  'Append-only succession for a Work directive. Current effect is derived from the newest event; historical acts remain intact.';

COMMIT;
