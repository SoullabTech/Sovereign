-- Bring Forward — the member's offering into a working relationship.
--
-- THE OBJECT
-- A member has private material. They may choose to place something into the
-- context of their work with a practitioner. That act does not hand over the
-- source, and it does not duplicate it into a second truth. It creates a THIRD
-- thing: a member-authored relationship artifact with its own lifecycle.
--
--     private field object          (stays the member's, never reachable here)
--             |
--             | member chooses
--             v
--     shared offering               (this table — a relationship object)
--             |
--             v
--     practitioner projection
--
-- WHY THERE IS NO FOREIGN KEY TO THE SOURCE
-- `origin` + `source_id` record lineage, deliberately as an opaque reference.
-- A real FK would make the member's private row reachable by join from a
-- relationship-scoped query — precisely the boundary this object exists to
-- avoid. Same idiom as member_field_note_threads.source_session_ref.
--
-- WHY relationship_id IS CORRECT HERE
-- Invariant 1: a record gets relationship_id when it exists BECAUSE of the
-- professional relationship. An offering does. The private source does not, and
-- must never acquire one — that is the rule this table is built to satisfy, not
-- to bend.
--
-- WHY ENCRYPTED FROM BIRTH
-- The snapshot is a person's words about their own life. Structural privacy is
-- not encryption at rest, so there is no plaintext column to fall back to and
-- nothing to dual-write. Reads decrypt or they fail.
--
-- WHAT THE MEMBER KEEPS
-- The snapshot is a declaration made at a moment, not a live mirror. A live
-- pointer would turn every later edit into a synchronisation and notification
-- problem ("what does Larry see now?"). Instead the member may update what the
-- practitioner sees, or withdraw it. The member stays the actor either way.

CREATE TABLE IF NOT EXISTS coach_client_shared_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- the relationship this was brought into
  relationship_id    UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,

  -- authorship: which person performed the act. NOT ownership of the source.
  offered_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- what kind of thing the member is bringing, in their register
  kind               TEXT NOT NULL DEFAULT 'reflection'
                       CHECK (kind IN ('reflection', 'question', 'commitment', 'moment')),

  -- lineage only. Opaque by design: no FK, nothing to join back through.
  origin             TEXT NOT NULL DEFAULT 'field_note_thread',
  source_id          UUID,

  -- the declared snapshot. Ciphertext only — there is no plaintext sibling.
  snapshot_enc       TEXT  NOT NULL,
  snapshot_enc_meta  JSONB NOT NULL,

  -- bumped when the member chooses to update what the practitioner sees
  snapshot_version   INTEGER NOT NULL DEFAULT 1,

  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'withdrawn')),

  offered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at       TIMESTAMPTZ,

  -- withdrawal is a state, and the state is consistent or the row is refused
  CONSTRAINT coach_shared_item_withdrawn_consistent
    CHECK ((status = 'withdrawn') = (withdrawn_at IS NOT NULL))
);

COMMENT ON TABLE coach_client_shared_items IS
  'A member-authored offering placed into a practitioner relationship. References '
  'the private source by opaque lineage only — never by foreign key — so the source '
  'stays unreachable from any relationship-scoped query. Snapshot is encrypted at rest.';

COMMENT ON COLUMN coach_client_shared_items.offered_by_member_id IS
  'Authorship — which person performed the act. Never ownership of the source material.';

COMMENT ON COLUMN coach_client_shared_items.source_id IS
  'Opaque lineage reference. Deliberately no FK: an FK would make the member''s '
  'private row reachable by join from a practitioner-scoped query.';

CREATE INDEX IF NOT EXISTS idx_coach_shared_items_relationship
  ON coach_client_shared_items (relationship_id, status, offered_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_shared_items_offered_by
  ON coach_client_shared_items (offered_by_member_id, offered_at DESC);

-- Only the member who brought something forward may change or withdraw it.
-- Enforced in the database rather than by service politeness: a practitioner
-- must not be able to edit or silently remove what was offered to them.
CREATE OR REPLACE FUNCTION coach_shared_item_authorship_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.offered_by_member_id IS DISTINCT FROM OLD.offered_by_member_id THEN
    RAISE EXCEPTION 'coach_client_shared_items.offered_by_member_id is write-once: '
                    'an offering cannot be reattributed to another person.';
  END IF;
  IF NEW.relationship_id IS DISTINCT FROM OLD.relationship_id THEN
    RAISE EXCEPTION 'coach_client_shared_items.relationship_id is write-once: '
                    'an offering cannot be moved into a different relationship.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coach_shared_item_authorship ON coach_client_shared_items;
CREATE TRIGGER trg_coach_shared_item_authorship
  BEFORE UPDATE ON coach_client_shared_items
  FOR EACH ROW EXECUTE FUNCTION coach_shared_item_authorship_immutable();
