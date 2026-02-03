-- Compatibility layer: code expects relationship_essence (singular),
-- but schema provides relationship_essences (plural).
-- This view avoids changing application code.

CREATE OR REPLACE VIEW relationship_essence AS
SELECT * FROM relationship_essences;
