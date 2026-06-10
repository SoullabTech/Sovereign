-- Migration: bug_reports + #bugs Co-lab channel seed
-- Purpose:   The "shared monitor field" — a durable source of truth for bugs
--            (and, later, feedback / requests / system alerts) that admins
--            check into at /admin/monitor.
--
-- Doctrine:  Table = MEMORY (status, search, ownership, history). The Co-lab
--            #bugs channel = ATTENTION (a place already watched). A new report
--            writes here AND mirrors a lightweight notice into #bugs. The table
--            owns status; the channel owns visibility. The mirror is best-effort
--            and NEVER blocks the write — a saved report is the durable part.
--
-- Sources:   'member'  — submitted via the in-app Report-a-bug affordance
--            'claude'   — filed from Claude's own awareness (scripts/report-bug.ts)
--            'system'   — reserved for automated warnings (future)

CREATE TABLE IF NOT EXISTS bug_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT,                                   -- optional short title (mostly for claude/system)
  message             TEXT NOT NULL,                          -- the report body
  source              TEXT NOT NULL DEFAULT 'member'
                        CHECK (source IN ('member', 'claude', 'system')),
  member_id           UUID REFERENCES members(id) ON DELETE SET NULL,  -- nullable: anonymous reports allowed
  reporter_name       TEXT,                                   -- denormalized display (survives member deletion / anon)
  url                 TEXT,                                   -- page/route the reporter was on
  user_agent          TEXT,
  context             JSONB NOT NULL DEFAULT '{}'::jsonb,     -- arbitrary extra (viewport, build, etc.)
  severity            TEXT NOT NULL DEFAULT 'normal'
                        CHECK (severity IN ('low', 'normal', 'high', 'critical')),
  status              TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'seen', 'resolved', 'wont_fix')),
  resolved_by         UUID REFERENCES members(id) ON DELETE SET NULL,
  resolved_at         TIMESTAMPTZ,
  admin_note          TEXT,
  mirror_channel_slug TEXT,                                   -- slug of the Co-lab channel the notice landed in
  mirrored_message_id UUID,                                   -- soft ref to team_messages (no FK; survives msg delete)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status  ON bug_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON bug_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_source  ON bug_reports (source);

COMMENT ON TABLE bug_reports IS
  'Shared monitor field: durable bug reports (member + claude + system). Source of truth for status/search/history. Mirrored for attention into the #bugs Co-lab channel. See /admin/monitor.';

-- ============================================
-- SEED: #bugs Co-lab channel (attention surface for the mirror)
-- created_by must be a real member; use the earliest-created member as a
-- safe placeholder. Guarded by NOT EXISTS rather than ON CONFLICT — some
-- databases predate the UNIQUE(slug) constraint on team_channels (the
-- original CREATE TABLE IF NOT EXISTS was a no-op on a pre-existing table),
-- so we don't rely on a constraint being present. No-op if there are no
-- members yet (fresh DB) or if the channel already exists.
-- ============================================
-- team_id: later migrations made team_channels.team_id NOT NULL (FK→studio_teams).
-- Borrow the team of an existing channel so #bugs lands in the same team. Skipped
-- if no team-bearing channel exists yet (the mirror then gracefully no-ops until
-- the channel is created). By migration order (20260322 < 20260610) the column
-- is always present here.
INSERT INTO team_channels (id, slug, name, description, channel_type, created_by, team_id)
SELECT
    gen_random_uuid(),
    'bugs',
    'Bugs',
    'Incoming bug reports (member + system). Mirrored from the monitor field; the table at /admin/monitor owns status.',
    'text',
    (SELECT id FROM members ORDER BY created_at ASC LIMIT 1),
    (SELECT team_id FROM team_channels WHERE team_id IS NOT NULL ORDER BY created_at ASC LIMIT 1)
WHERE EXISTS (SELECT 1 FROM members LIMIT 1)
  AND EXISTS (SELECT 1 FROM team_channels WHERE team_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM team_channels WHERE slug = 'bugs');
