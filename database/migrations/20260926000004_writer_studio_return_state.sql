-- WRITERS-STUDIO-NEXT-01 / A2-7
-- Durable member return state. Relationship identity and manuscript place are
-- deliberately separate records with separate lifecycles.
--
-- Neither table stores prose, child content, cognition, scroll pixels, caret,
-- passage, Review finding, Editorial thread, or authorization.
BEGIN;

-- RC2 (F2): bound lock ACQUISITION. A DDL lock queued behind a long reader
-- transaction would stall every later query on the table; time out instead.
-- A timeout aborts this file pre-swap with the old reader intact.
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS writer_studio_relationship_returns (
  member_id       UUID NOT NULL,
  living_work_id  UUID NOT NULL,
  manuscript_id   UUID NOT NULL,
  relationship_id UUID NOT NULL
    REFERENCES writer_editorial_relationships(id) ON DELETE CASCADE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (member_id, living_work_id, manuscript_id),

  CONSTRAINT wsrr_work_member_fk
    FOREIGN KEY (living_work_id, member_id)
    REFERENCES living_works(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  CONSTRAINT wsrr_manuscript_member_fk
    FOREIGN KEY (manuscript_id, member_id)
    REFERENCES member_manuscripts(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS writer_studio_place_returns (
  member_id        UUID NOT NULL,
  living_work_id   UUID NOT NULL,
  manuscript_id    UUID NOT NULL,
  draft_section_id UUID NOT NULL
    REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (member_id, living_work_id, manuscript_id),

  CONSTRAINT wspr_work_member_fk
    FOREIGN KEY (living_work_id, member_id)
    REFERENCES living_works(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  CONSTRAINT wspr_manuscript_member_fk
    FOREIGN KEY (manuscript_id, member_id)
    REFERENCES member_manuscripts(id, member_id)
    ON UPDATE RESTRICT ON DELETE CASCADE
);

-- RC2 (F5): index the cascade FK columns so a parent delete does not scan.
CREATE INDEX IF NOT EXISTS wsrr_relationship_idx
  ON writer_studio_relationship_returns (relationship_id);

CREATE INDEX IF NOT EXISTS wspr_draft_section_idx
  ON writer_studio_place_returns (draft_section_id);

COMMENT ON TABLE writer_studio_relationship_returns IS
  'A2-7 member-owned exact return selection for one explicitly chosen A2 relationship. No place, child or cognition fields.';

COMMENT ON TABLE writer_studio_place_returns IS
  'A2-7 member-owned exact manuscript return place. V1 stores draft-section identity only. No relationship, child, passage, caret or pixel fields.';

COMMENT ON COLUMN writer_studio_relationship_returns.relationship_id IS
  'Exact A2 relationship explicitly chosen by the member. Never latest/first/current inferred.';

COMMENT ON COLUMN writer_studio_place_returns.draft_section_id IS
  'Exact current draft-section identity last durably occupied by a deliberate member navigation gesture.';

COMMIT;

-- Ordinary rollback may drop these return-state tables without deleting the
-- underlying A2 relationships, episodes, Works, manuscripts or draft sections.
--   DROP TABLE writer_studio_place_returns;
--   DROP TABLE writer_studio_relationship_returns;
