-- HPB-03 — author-owned publication plan.
-- Publication meaning belongs to the manuscript; placement belongs to the
-- current section-addressable draft. Replacing a draft drops placement but
-- never silently remaps the author's production decision.

BEGIN;

CREATE TABLE IF NOT EXISTS manuscript_publication_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN (
    'half-title','title-page','imprint','copyright','permissions','dedication',
    'disclaimer','contents','preface','acknowledgments','bibliography','resources','afterword'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (manuscript_id, role)
);

CREATE TABLE IF NOT EXISTS manuscript_publication_members (
  object_id uuid NOT NULL REFERENCES manuscript_publication_objects(id) ON DELETE CASCADE,
  draft_section_id uuid NOT NULL UNIQUE REFERENCES manuscript_draft_sections(id) ON DELETE CASCADE,
  position int NOT NULL CHECK (position >= 0),
  PRIMARY KEY (object_id, draft_section_id),
  UNIQUE (object_id, position)
);

COMMENT ON TABLE manuscript_publication_objects IS
  'HPB-03. Durable author-owned publication roles. Holds no manuscript prose.';
COMMENT ON TABLE manuscript_publication_members IS
  'HPB-03. Where a publication role currently lands in the section-addressable draft. Draft replacement drops placement; no remapping is inferred.';

COMMIT;

-- ROLLBACK:
-- DROP TABLE IF EXISTS manuscript_publication_members;
-- DROP TABLE IF EXISTS manuscript_publication_objects;
