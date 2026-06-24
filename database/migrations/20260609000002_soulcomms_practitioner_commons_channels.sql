-- SoulComms — Practitioner Commons channels
-- Spec: docs/specs/SOULCOMMS_TEAM_IN_URL_2026-06-09.md (§2 product shape)
-- Depends on: 20260609000001_soulcomms_multi_team.sql (creates the `all-practitioners` team
--             + team_channels.team_id + UNIQUE(team_id, slug)).
--
-- Seeds the four eager commons channels for the platform-wide practitioner workspace.
-- (Individual practitioner teams provision #general LAZILY on first open — see M3, not here.)
--
-- Idempotent (ON CONFLICT (team_id, slug) DO NOTHING) and a safe no-op if the
-- all-practitioners team does not exist yet. created_by = the team owner.

BEGIN;

INSERT INTO team_channels (team_id, slug, name, description, channel_type, created_by)
SELECT ap.id, c.slug, c.name, c.description, c.channel_type, ap.owner_id
FROM studio_teams ap
CROSS JOIN (VALUES
  ('announcements', 'Announcements',       'Platform-wide practitioner announcements', 'announcement'),
  ('general',       'General',             'Open practitioner conversation',           'text'),
  ('introductions', 'Introductions',       'Introduce yourself to the commons',        'text'),
  ('support',       'Support / Questions', 'Help, questions, troubleshooting',         'text')
) AS c(slug, name, description, channel_type)
WHERE ap.slug = 'all-practitioners'
ON CONFLICT (team_id, slug) DO NOTHING;

COMMIT;
