-- HOUSE-LIVING-ORIENTATION-01 · durable facet crossing relations.
--
-- A crossing records THAT the member deliberately carried one existing object
-- into relation with another. It does not copy either object's content and it
-- does not authorize semantic interpretation.
--
-- Source and target remain governed by their own tables/lifecycles. This table
-- is the durable relational fact between them.

BEGIN;

CREATE TABLE IF NOT EXISTS member_facet_crossings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  crossing_id     text NOT NULL CHECK (length(btrim(crossing_id)) > 0),
  source_facet    text NOT NULL CHECK (length(btrim(source_facet)) > 0),
  source_ref_id   text NOT NULL CHECK (length(btrim(source_ref_id)) > 0),
  target_facet    text NOT NULL CHECK (length(btrim(target_facet)) > 0),
  target_ref_id   text NOT NULL CHECK (length(btrim(target_ref_id)) > 0),
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT member_facet_crossings_distinct_objects
    CHECK (source_facet <> target_facet OR source_ref_id <> target_ref_id),

  CONSTRAINT member_facet_crossings_unique_relation
    UNIQUE (
      member_id,
      crossing_id,
      source_facet,
      source_ref_id,
      target_facet,
      target_ref_id
    )
);

CREATE INDEX IF NOT EXISTS idx_member_facet_crossings_source
  ON member_facet_crossings(member_id, source_facet, source_ref_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_facet_crossings_target
  ON member_facet_crossings(member_id, target_facet, target_ref_id, created_at DESC);

COMMENT ON TABLE member_facet_crossings IS
  'Member-authorized relational custody between distinct Soullab facet objects. Stores identities and the crossing gesture only; never copies source prose or invents semantic meaning.';

COMMENT ON COLUMN member_facet_crossings.crossing_id IS
  'Canonical crossing gesture id from the Living Orientation registry; names the member act that authorized this relation.';

COMMENT ON COLUMN member_facet_crossings.source_ref_id IS
  'Opaque identity of the source object in its own facet. No polymorphic FK: source identity remains governed by that facet.';

COMMENT ON COLUMN member_facet_crossings.target_ref_id IS
  'Opaque identity of the receiving object in its own facet. No polymorphic FK: target identity remains governed by that facet.';

COMMIT;
