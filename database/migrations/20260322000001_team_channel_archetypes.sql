-- Add practice infrastructure columns to team_channels
ALTER TABLE team_channels
  ADD COLUMN IF NOT EXISTS archetype TEXT
    CHECK (archetype IN ('checkin','field_note','practice','cohort','venture','general'))
    DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS purpose_block TEXT,
  ADD COLUMN IF NOT EXISTS prompt_scaffold JSONB,
  ADD COLUMN IF NOT EXISTS response_mode TEXT
    CHECK (response_mode IN ('witnessing','reflection','advice','open'))
    DEFAULT 'open';

-- Add sender_type to team_messages for MAIA bot messages
ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS sender_type TEXT
    CHECK (sender_type IN ('member','maia'))
    DEFAULT 'member';

-- Insert MAIA system member (bot) if not exists
INSERT INTO members (id, username, name, passkey, password_hash, onboarded)
VALUES (
  '00000000-0000-0000-0000-00000000a1a5',
  'maia_bot',
  'MAIA',
  'SYSTEM-MAIA-BOT',
  '',
  true
) ON CONFLICT (username) DO NOTHING;

-- Seed existing channels with archetypes + purpose blocks
UPDATE team_channels SET
  archetype = 'general',
  purpose_block = 'Team-wide coordination and announcements. Where we orient as a whole.',
  response_mode = 'open'
WHERE slug = 'general';

UPDATE team_channels SET
  archetype = 'checkin',
  purpose_block = 'Name the one thing you are tending today. Witness others. Build continuity of effort. This is not a status update — it is a self-location practice.',
  prompt_scaffold = '[
    {"label":"What I am tending","placeholder":"The one thing calling my attention today...","required":true},
    {"label":"What I am noticing","placeholder":"A quality, pattern, or feeling present right now...","required":false},
    {"label":"What I need","placeholder":"Support, space, or clarity...","required":false}
  ]'::jsonb,
  response_mode = 'witnessing'
WHERE slug = 'exec';

UPDATE team_channels SET
  archetype = 'practice',
  purpose_block = 'Ops as soul work. A space to track what we are building, testing, and learning. Effort made conscious.',
  response_mode = 'reflection'
WHERE slug = 'ops';

UPDATE team_channels SET
  archetype = 'venture',
  purpose_block = 'Development as form-giving. Ideas, experiments, and the discipline of bringing things into being. Where inner impulse meets outer structure.',
  response_mode = 'reflection'
WHERE slug = 'dev';

UPDATE team_channels SET
  archetype = 'field_note',
  purpose_block = 'Observations, pattern catches, and field intelligence from the creative edge. Less discussion, more witnessing. Subtle material lives here.',
  prompt_scaffold = '[
    {"label":"What I observed","placeholder":"The thing worth naming...","required":true},
    {"label":"What it might mean","placeholder":"Pattern, signal, or question it raises...","required":false}
  ]'::jsonb,
  response_mode = 'witnessing'
WHERE slug = 'design';

UPDATE team_channels SET
  archetype = 'general',
  purpose_block = 'The space between the work. Humor, humanity, and peripheral intelligence welcome here.',
  response_mode = 'open'
WHERE slug = 'random';

UPDATE team_channels SET
  archetype = 'venture',
  purpose_block = 'Strategic thinking, planning, and soul-building ventures. Where calling meets form.',
  response_mode = 'reflection'
WHERE slug = 'strategy';
