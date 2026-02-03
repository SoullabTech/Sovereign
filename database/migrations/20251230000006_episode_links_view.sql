-- Migration: episode_links as VIEW over bardic_links
-- Created: 2025-12-30
-- Purpose: Make bardic_links canonical, episode_links becomes a VIEW

BEGIN;

-- If episode_links exists as a TABLE, migrate it into bardic_links first.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='public' AND table_name='episode_links'
      AND table_type = 'BASE TABLE'
  ) THEN
    INSERT INTO bardic_links (
      user_id, from_kind, from_id, to_kind, to_id, relation, strength, reasoning, meta
    )
    SELECT
      COALESCE(e.user_id, 'unknown'),
      'episode',
      src_episode_id::text,
      'episode',
      dst_episode_id::text,
      relation,
      weight,
      reasoning,
      '{}'::jsonb
    FROM episode_links el
    LEFT JOIN episodes e ON e.id = el.src_episode_id
    ON CONFLICT (user_id, from_kind, from_id, to_kind, to_id, relation) DO NOTHING;

    EXECUTE 'DROP TABLE episode_links';
  END IF;
END $$;

-- Canonical: episode_links is a VIEW over bardic_links
DROP VIEW IF EXISTS episode_links;

CREATE VIEW episode_links AS
SELECT
  id,
  user_id,
  (from_id)::uuid AS src_episode_id,
  (to_id)::uuid   AS dst_episode_id,
  relation,
  strength AS weight,
  reasoning,
  created_at,
  updated_at
FROM bardic_links
WHERE from_kind = 'episode' AND to_kind = 'episode';

-- Compatibility: allow INSERTs into the view
CREATE OR REPLACE FUNCTION episode_links_insert()
RETURNS trigger AS $$
BEGIN
  INSERT INTO bardic_links (
    user_id, from_kind, from_id, to_kind, to_id, relation, strength, reasoning, meta
  )
  VALUES (
    COALESCE(NEW.user_id, 'unknown'),
    'episode',
    NEW.src_episode_id::text,
    'episode',
    NEW.dst_episode_id::text,
    NEW.relation,
    COALESCE(NEW.weight, 0.5),
    NEW.reasoning,
    '{}'::jsonb
  )
  ON CONFLICT (user_id, from_kind, from_id, to_kind, to_id, relation) DO NOTHING;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS episode_links_insert_trigger ON episode_links;
CREATE TRIGGER episode_links_insert_trigger
INSTEAD OF INSERT ON episode_links
FOR EACH ROW EXECUTE FUNCTION episode_links_insert();

COMMIT;
