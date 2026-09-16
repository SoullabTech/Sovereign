-- HPB-04 — explicit production omission without manuscript deletion.
BEGIN;

ALTER TABLE manuscript_publication_objects
  DROP CONSTRAINT IF EXISTS manuscript_publication_objects_role_check;

ALTER TABLE manuscript_publication_objects
  ADD CONSTRAINT manuscript_publication_objects_role_check CHECK (role IN (
    'half-title','title-page','imprint','copyright','permissions','dedication',
    'disclaimer','contents','preface','acknowledgments','bibliography','resources','afterword',
    'omit'
  ));

COMMENT ON COLUMN manuscript_publication_objects.role IS
  'Author-owned production role. omit excludes exact assigned draft sections from produced artifacts without deleting manuscript text.';

COMMIT;

-- ROLLBACK:
-- DELETE FROM manuscript_publication_objects WHERE role = 'omit';
-- ALTER TABLE manuscript_publication_objects DROP CONSTRAINT IF EXISTS manuscript_publication_objects_role_check;
-- ALTER TABLE manuscript_publication_objects ADD CONSTRAINT manuscript_publication_objects_role_check CHECK (role IN (
--   'half-title','title-page','imprint','copyright','permissions','dedication',
--   'disclaimer','contents','preface','acknowledgments','bibliography','resources','afterword'
-- ));
