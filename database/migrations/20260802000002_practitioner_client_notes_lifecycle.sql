-- ================================================
-- PRACTITIONER CLIENT NOTE — LIFECYCLE AXIS
-- Migration: 20260802000002_practitioner_client_notes_lifecycle.sql
--
-- Adds the note lifecycle axis ruled 2026-08-02
-- (docs/specs/PRACTITIONER_CLIENT_NOTE_RULING_2026-08-02.md).
--
-- ⛔ LIFECYCLE IS NOT COMMITMENT STATUS. They are independent axes and this
-- migration deliberately does NOT reuse or widen `status`:
--
--     lifecycle         draft | completed          (every note)
--     status            alive | completed | released (commitments only)
--
-- The word "completed" appears in both and means different things. `status`
-- answers "is this commitment still alive?"; `lifecycle` answers "has the
-- practitioner finished writing this note?". Collapsing them would make a
-- completed note and a completed commitment the same fact, which they are not.
--
-- DRAFT PHI IS PHI (ruled). A draft is already a Client Note: it lives here,
-- encrypted, owner-scoped, from its first durable save. There is deliberately
-- no browser-side draft store — localStorage / IndexedDB / sessionStorage /
-- URL state would be a second, weaker persistence system for exactly the
-- material this table was built to protect.
--
-- DELIBERATELY ABSENT:
--   * no `amended` lifecycle value yet — completed-note mutability is unruled.
--     The column is named `lifecycle` (not `is_draft`) precisely so that state
--     can be added later without redefining the axis.
--   * no visibility, retention, or clinical-status column. Those are the other
--     two ruled axes and remain unbuilt policy; a reserved column would assert
--     a policy that does not exist.
-- ================================================

-- ---------- lifecycle ----------
-- DEFAULT 'completed' is the honest backfill: every existing row was written
-- and saved as a finished note under the pre-lifecycle regime. None of them
-- was ever a draft.
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS lifecycle TEXT NOT NULL DEFAULT 'completed';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_lifecycle_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_lifecycle_check
      CHECK (lifecycle IN ('draft', 'completed'));
  END IF;
END $$;

-- Only a session note can be a draft. A commitment, recognition, or detail is
-- created whole by Carry Forward — it is never half-written, so "draft" has no
-- meaning there. Enforced in the database, not only in the API.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_draft_kind_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_draft_kind_check
      CHECK (lifecycle = 'completed' OR kind = 'note');
  END IF;
END $$;

-- ---------- completion_mode ----------
-- WHO COMPLETED THIS, AND UNDER WHAT AUTHORITY. This is the field the lock
-- reads — a first-class, named distinction, not an inference.
--
--   'practitioner_declared'  the practitioner completed it through the governed
--                            UI, having been shown the warning first -> LOCKED
--   'backfilled'             this migration marked it complete on the
--                            practitioner's behalf -> still editable
--   NULL                     the note is still a draft
--
-- ⛔ DO NOT infer the lock from a null timestamp. An earlier draft of this
-- migration used `completed_at IS NULL` as the lock authority, which made a
-- provenance field silently carry policy: two rows both reading
-- lifecycle='completed' behaved differently, and nothing in the schema said
-- why. The rule is now legible on its own terms:
--
--     A note becomes locked only when a practitioner explicitly completed it.
--     Backfilled rows stay editable because they carry no such declaration —
--     not because some timestamp happens to be absent.
--
-- The ruling permits locking a completed note "provided the UI says so before
-- the practitioner completes it". Rows predating this migration were never
-- shown that warning, so the condition was never offered to their authors.
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS completion_mode TEXT;

UPDATE practitioner_client_notes
   SET completion_mode = 'backfilled'
 WHERE lifecycle = 'completed' AND completion_mode IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_completion_mode_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_completion_mode_check
      CHECK (
        (lifecycle = 'draft'     AND completion_mode IS NULL)
        OR
        (lifecycle = 'completed' AND completion_mode IN ('backfilled', 'practitioner_declared'))
      );
  END IF;
END $$;

-- ---------- completed_at ----------
-- WHEN the practitioner declared it complete. Pure provenance — it carries no
-- policy and the lock never reads it.
--
-- Null for backfilled rows because the completion moment is genuinely unknown:
-- this migration knows the note was finished, not when. Stamping NOW() would
-- record the migration's clock as the practitioner's act.
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Keeps the timestamp honest in both directions: present exactly when a
-- practitioner declared completion, absent otherwise.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_completed_at_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_completed_at_check
      CHECK (
        (completion_mode = 'practitioner_declared' AND completed_at IS NOT NULL)
        OR
        (completion_mode IS DISTINCT FROM 'practitioner_declared' AND completed_at IS NULL)
      );
  END IF;
END $$;

-- ---------- version ----------
-- Optimistic concurrency token for the debounced autosave loop. A draft is
-- saved repeatedly from a live editor; two in-flight saves that complete out of
-- order would otherwise let the STALER body win and silently discard writing
-- the practitioner watched land. The client sends the version it read, and a
-- mismatch is refused rather than merged.
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- ---------- session_id ----------
-- OPTIONAL link to the session this note is about.
--
-- Verified before adding: `sessions` (20260118_portal_services_tables.sql)
-- already carries practitioner_id -> practitioners(id) and client_id ->
-- practitioner_clients(id) — the SAME FK parents as this table. So this is a
-- join to an existing identifier, NOT a second session concept.
--
-- Nullable by design: preparation notes, unscheduled contact, and retrospective
-- documentation have no session record. ⛔ A session is never inferred from
-- proximity in time — the practitioner supplies it or it stays null.
--
-- Single-column ON DELETE SET NULL. Deliberately NOT the composite form that
-- caused the undeletable-note defect repaired in 20260801000003: a column list
-- is required there so the cascade cannot null client_id / practitioner_id.
--
-- Three-way ownership agreement (session, client, practitioner) cannot be
-- expressed as an FK here because sessions.client_id is itself nullable, so it
-- is enforced in the route and covered by an explicit test.
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS session_id UUID;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_session_fk'
     )
  THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_session_fk
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------- indexes ----------
-- A client has at most a handful of drafts; this keeps "resume where I was"
-- off a full scan of the client's history.
CREATE INDEX IF NOT EXISTS idx_practitioner_client_notes_draft
  ON practitioner_client_notes(client_id, practitioner_id, updated_at DESC)
  WHERE lifecycle = 'draft';

CREATE INDEX IF NOT EXISTS idx_practitioner_client_notes_session
  ON practitioner_client_notes(session_id)
  WHERE session_id IS NOT NULL;

-- ---------- documentation ----------
COMMENT ON COLUMN practitioner_client_notes.lifecycle IS
  'Note lifecycle: draft | completed. INDEPENDENT of `status` (commitment lifecycle). Only kind=note may be draft. "amended" is deliberately absent until completed-note mutability is ruled.';

COMMENT ON COLUMN practitioner_client_notes.completion_mode IS
  'Completion AUTHORITY, and the only field the edit lock reads: practitioner_declared (completed through the governed UI after the warning — LOCKED) | backfilled (marked complete by 20260802000002 on the practitioner''s behalf — still editable) | NULL (still a draft). Never infer the lock from a null timestamp.';

COMMENT ON COLUMN practitioner_client_notes.completed_at IS
  'WHEN a practitioner declared completion. Pure provenance — carries no policy, and the lock never reads it. NULL for backfilled rows because the completion moment is genuinely unknown.';

COMMENT ON COLUMN practitioner_client_notes.version IS
  'Optimistic concurrency token. Incremented on every update; a PATCH may pass expected_version so a stale autosave is refused rather than allowed to overwrite newer content.';

COMMENT ON COLUMN practitioner_client_notes.session_id IS
  'Optional link to sessions(id) — the same FK parents as this table, so this is a join, not a second session concept. NULL for preparation, unscheduled contact, and retrospective notes. Never inferred from time proximity.';
