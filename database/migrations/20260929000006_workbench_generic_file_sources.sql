-- WRITERS-STUDIO-SMALL-BETA — generic source-file custody.
-- Beta members may bring any file type into Sources. Unknown formats are
-- preserved inertly and require member-authored manual transcription.

ALTER TABLE workbench_uploads
  DROP CONSTRAINT IF EXISTS workbench_uploads_source_kind_check;

ALTER TABLE workbench_uploads
  ADD CONSTRAINT workbench_uploads_source_kind_check
  CHECK (source_kind IN (
    'typed_text',
    'typed_doc',
    'handwritten_image',
    'scanned_pdf',
    'generic_file'
  ));

COMMENT ON COLUMN workbench_uploads.source_kind IS
  'Source intake class. generic_file means exact bytes are preserved but no automatic parser is trusted for the format.';
