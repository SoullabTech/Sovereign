-- SoulComms Multi-Team
-- ============================================================================
-- Promote studio_teams to the platform's team spine and scope SoulComms
-- channels to a team. Routing becomes /team/[teamSlug]/[channelSlug].
--
-- Sovereignty boundary (v1):
--   Teams own shared spaces  → channels are team-scoped (team_channels.team_id)
--   People own relationships → DMs stay GLOBAL. team_dm_* tables are left
--                              UNTOUCHED on purpose (no team_id). Boundaried
--                              client/engagement DMs are a separate later feature.
--
-- Self-sufficient + idempotent: studio_teams already exists in this DB, but the
-- canonical studio migration (20260202100001) only partially landed —
-- studio_team_members is absent. Rather than depend on that file applying
-- cleanly (it ALTERs satellite studio_* tables and trips the runner's
-- phantom-record trap), this migration creates the spine table it needs with
-- CREATE TABLE IF NOT EXISTS. Re-running is safe.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Team membership spine (access gate for SoulComms). Mirrors the canonical
--    definition in 20260202100001 so this migration stands alone.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS studio_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES studio_teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by UUID REFERENCES members(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_studio_team_members_team ON studio_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_studio_team_members_member ON studio_team_members(member_id);

-- ----------------------------------------------------------------------------
-- 2. studio_teams.slug — addressable URL segment, unique per platform.
--    Added nullable, backfilled, then constrained.
-- ----------------------------------------------------------------------------
ALTER TABLE studio_teams ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs for any pre-existing teams (collision-safe).
DO $$
DECLARE
    t          RECORD;
    base_slug  TEXT;
    candidate  TEXT;
    n          INT;
BEGIN
    FOR t IN SELECT id, name FROM studio_teams WHERE slug IS NULL LOOP
        base_slug := trim(both '-' from regexp_replace(lower(coalesce(t.name, 'team')), '[^a-z0-9]+', '-', 'g'));
        IF base_slug = '' THEN base_slug := 'team'; END IF;
        candidate := base_slug;
        n := 1;
        WHILE EXISTS (SELECT 1 FROM studio_teams WHERE slug = candidate) LOOP
            n := n + 1;
            candidate := base_slug || '-' || n;
        END LOOP;
        UPDATE studio_teams SET slug = candidate WHERE id = t.id;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Seed the two v1 teams (idempotent on slug).
--    Owner = earliest member (the system/admin seed).
-- ----------------------------------------------------------------------------
INSERT INTO studio_teams (id, name, description, owner_id, slug)
SELECT gen_random_uuid(), 'Soullab', 'Soullab internal team workspace', m.id, 'soullab'
FROM (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM studio_teams WHERE slug = 'soullab');

INSERT INTO studio_teams (id, name, description, owner_id, slug)
SELECT gen_random_uuid(), 'All Practitioners', 'Practitioner-wide community workspace', m.id, 'all-practitioners'
FROM (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM studio_teams WHERE slug = 'all-practitioners');

-- slug is now fully populated → enforce NOT NULL + UNIQUE.
ALTER TABLE studio_teams ALTER COLUMN slug SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'studio_teams_slug_key') THEN
        ALTER TABLE studio_teams ADD CONSTRAINT studio_teams_slug_key UNIQUE (slug);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. team_channels.team_id — added nullable, backfilled to soullab, then NOT NULL.
-- ----------------------------------------------------------------------------
ALTER TABLE team_channels ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES studio_teams(id) ON DELETE CASCADE;

-- Backfill every legacy channel into the Soullab team.
UPDATE team_channels
SET team_id = (SELECT id FROM studio_teams WHERE slug = 'soullab')
WHERE team_id IS NULL;

-- ----------------------------------------------------------------------------
-- 5. Seed memberships.
--    Soullab: owner + existing Co-lab PARTICIPANTS only. Legacy channels were
--    globally visible only because there was no boundary — now that teams are
--    real, soullab must NOT become the default room for every seeker/beta
--    member. A participant is anyone who actually touched a soullab channel:
--    sent a message, holds a read receipt, or reacted. Decision-capturers are
--    covered transitively (capturing requires opening the channel, which writes
--    a read receipt). studio_decisions is deliberately NOT a signal here: it is
--    not team-channel-scoped and would over-include studio users who never
--    touched SoulComms. Participation is scoped to the team's own channels so
--    the rule stays correct if re-run after other teams have channels.
-- ----------------------------------------------------------------------------
INSERT INTO studio_team_members (team_id, member_id, role, joined_at)
SELECT s.id,
       part.member_id,
       CASE WHEN part.member_id = s.owner_id THEN 'owner' ELSE 'member' END,
       NOW()
FROM studio_teams s
JOIN LATERAL (
    SELECT s.owner_id AS member_id
    UNION
    SELECT tm.sender_id
      FROM team_messages tm
      JOIN team_channels c ON c.id = tm.channel_id
     WHERE c.team_id = s.id
    UNION
    SELECT tcr.member_id
      FROM team_channel_reads tcr
      JOIN team_channels c ON c.id = tcr.channel_id
     WHERE c.team_id = s.id
    UNION
    SELECT tr.member_id
      FROM team_reactions tr
      JOIN team_messages tm2 ON tm2.id = tr.message_id
      JOIN team_channels c   ON c.id = tm2.channel_id
     WHERE c.team_id = s.id
) part ON TRUE
WHERE s.slug = 'soullab'
ON CONFLICT (team_id, member_id) DO NOTHING;

-- All Practitioners: active practitioners with a linked member, plus the owner.
INSERT INTO studio_team_members (team_id, member_id, role, joined_at)
SELECT s.id, p.member_id, 'member', NOW()
FROM studio_teams s
JOIN practitioners p ON p.status = 'active' AND p.member_id IS NOT NULL
WHERE s.slug = 'all-practitioners'
ON CONFLICT (team_id, member_id) DO NOTHING;

INSERT INTO studio_team_members (team_id, member_id, role, joined_at)
SELECT s.id, s.owner_id, 'owner', NOW()
FROM studio_teams s
WHERE s.slug = 'all-practitioners'
ON CONFLICT (team_id, member_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Channel uniqueness: drop global UNIQUE(slug), add UNIQUE(team_id, slug).
--    Each team gets its own #general. The legacy constraint from
--    20260321000001 is the inline column unique → team_channels_slug_key.
-- ----------------------------------------------------------------------------
ALTER TABLE team_channels DROP CONSTRAINT IF EXISTS team_channels_slug_key;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_channels_team_slug_key') THEN
        ALTER TABLE team_channels ADD CONSTRAINT team_channels_team_slug_key UNIQUE (team_id, slug);
    END IF;
END $$;

-- Every channel now belongs to a team.
ALTER TABLE team_channels ALTER COLUMN team_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_team_channels_team ON team_channels(team_id);

-- ----------------------------------------------------------------------------
-- 7. Reserve system slugs at the DB level (not just in routing).
--    Prevents a team named "admin" (or a channel named "admin") from silently
--    shadowing static routes. Enforced as CHECK constraints so the guarantee
--    lives in the schema, not in application code that can be bypassed.
--
--    Team slugs collide with static segments directly under /team/:
--      admin, dm, for-you, decisions, invite, new, settings
--    Channel slugs collide with static segments under /team/[teamSlug]/:
--      admin (team admin), settings, members, new
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'studio_teams_slug_not_reserved') THEN
        ALTER TABLE studio_teams ADD CONSTRAINT studio_teams_slug_not_reserved
            CHECK (slug NOT IN ('admin', 'dm', 'for-you', 'decisions', 'invite', 'new', 'settings'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_channels_slug_not_reserved') THEN
        ALTER TABLE team_channels ADD CONSTRAINT team_channels_slug_not_reserved
            CHECK (slug NOT IN ('admin', 'settings', 'members', 'new'));
    END IF;
END $$;

COMMIT;
