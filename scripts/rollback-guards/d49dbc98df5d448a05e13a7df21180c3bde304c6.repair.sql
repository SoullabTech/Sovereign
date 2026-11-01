-- Repair for the rollback data guard of reader d49dbc98df5d448a05e13a7df21180c3bde304c6.
-- One transaction. Rewrites only rows the guard counts, and in each row only the array
-- that fails: unknown ids and duplicates removed, order kept, trimmed to the old limits.
-- A Center that loses every place becomes NULL (the House default). A valid array,
-- including an explicitly empty Center, is left exactly as stored.
-- Run with the target reader stopped, then re-run the guard; it must print 0.
BEGIN;
WITH old AS (SELECT ARRAY['writing','relationships','practices','community','studio','decisions','astrology','journal','dream','reflections','ideas','changes','wisdom','library','divination','living-field','co-lab','anchor']::text[] AS ids)
UPDATE house_member_preferences p SET
  center_ids = CASE
    WHEN p.center_ids IS NOT NULL AND (
           cardinality(p.center_ids) > 5
           OR NOT (p.center_ids <@ old.ids)
           OR cardinality(p.center_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.center_ids) e))
    THEN (SELECT CASE WHEN count(*) = 0 THEN NULL ELSE array_agg(e ORDER BY ord) END
            FROM (SELECT e, min(ord) AS ord FROM unnest(p.center_ids) WITH ORDINALITY u(e, ord)
                  WHERE e = ANY(old.ids) GROUP BY e ORDER BY min(ord) LIMIT 5) s)
    ELSE p.center_ids END,
  shortcut_ids = CASE
    WHEN cardinality(p.shortcut_ids) > 18
         OR NOT (p.shortcut_ids <@ old.ids)
         OR cardinality(p.shortcut_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.shortcut_ids) e)
    THEN (SELECT coalesce(array_agg(e ORDER BY ord), '{}')
            FROM (SELECT e, min(ord) AS ord FROM unnest(p.shortcut_ids) WITH ORDINALITY u(e, ord)
                  WHERE e = ANY(old.ids) GROUP BY e ORDER BY min(ord) LIMIT 18) s)
    ELSE p.shortcut_ids END,
  revision = p.revision + 1,
  updated_at = NOW()
FROM old
WHERE (p.center_ids IS NOT NULL AND (
         cardinality(p.center_ids) > 5
         OR NOT (p.center_ids <@ old.ids)
         OR cardinality(p.center_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.center_ids) e)))
   OR cardinality(p.shortcut_ids) > 18
   OR NOT (p.shortcut_ids <@ old.ids)
   OR cardinality(p.shortcut_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.shortcut_ids) e);
COMMIT;
