-- Yvonne Pilot: Orientation Principles Seed
-- Run on minisforum: ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' < docs/clients/yvonne-pilot-seed.sql
--
-- These 5 principles are stored as 'still_alive' atoms — the highest saliency status.
-- MAIA's atoms loader surfaces them in the conversation prompt on every turn.
-- They become the quiet anchors MAIA can offer back when she's in spiral.
--
-- First: find Yvonne's member UUID.
-- If this errors (no rows), Yvonne hasn't signed up yet.

DO $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Look up by username or name — adjust the ILIKE pattern if her account uses a different identifier
  SELECT id INTO v_member_id
  FROM members
  WHERE username ILIKE 'yvonne%'
     OR name ILIKE 'Yvonne%'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Yvonne member record not found. Check members table for her username/name.';
  END IF;

  RAISE NOTICE 'Seeding orientation principles for member: %', v_member_id;

  -- Insert principles. ON CONFLICT DO NOTHING prevents duplicates if run again.
  -- Using a unique title+member_id guard via the spontaneous constraint.

  -- Idempotent: skip any principle that already exists for this member by title
  INSERT INTO member_memory_atoms (member_id, source_type, title, body, status)
  SELECT v_member_id, 'spontaneous', t.title, t.body, 'still_alive'
  FROM (VALUES
    ('Boundaries before rescue.',
     'The first act of generosity is protecting the integrity of what you''re stewarding. Rescue from a depleted field creates more collapse.'),

    ('Protect the family field before outward generosity.',
     'What is given outward must come from surplus, not from the center of the field. The family system is the primary domain of responsibility.'),

    ('Action is my gift — discernment keeps it from becoming self-sacrifice.',
     'The capacity to act is a genuine resource and a genuine offering. Without discernment, it becomes a liability: taking on what isn''t mine, depleting the source.'),

    ('When the ball is already in play, conserve energy.',
     'Not every moving thing requires a new effort. Some things are already in motion. The skilled move is to let them land without adding force.'),

    ('Reduce drama before expanding the dream.',
     'Expansion into a noisy field amplifies the noise. The work before growth is simplification: what can be set down, clarified, or released.')
  ) AS t(title, body)
  WHERE NOT EXISTS (
    SELECT 1 FROM member_memory_atoms
    WHERE member_id = v_member_id AND title = t.title
  );

  RAISE NOTICE 'Orientation principles seeded successfully.';
END $$;
