-- Rollback data guard for reader d49dbc98df5d448a05e13a7df21180c3bde304c6.
-- Read-only. Prints the number of house_member_preferences rows that reader's parseIds
-- (lib/house/preferences.ts) would refuse: an array longer than its limit (center 5,
-- shortcuts 18), an id outside its 18-id catalog, or a duplicate id.
-- Used by scripts/deploy-production.sh rollback; repair: the matching .repair.sql.
WITH old AS (SELECT ARRAY['writing','relationships','practices','community','studio','decisions','astrology','journal','dream','reflections','ideas','changes','wisdom','library','divination','living-field','co-lab','anchor']::text[] AS ids)
SELECT count(*) AS failing_rows
FROM house_member_preferences p, old
WHERE (p.center_ids IS NOT NULL AND (
         cardinality(p.center_ids) > 5
         OR NOT (p.center_ids <@ old.ids)
         OR cardinality(p.center_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.center_ids) e)))
   OR cardinality(p.shortcut_ids) > 18
   OR NOT (p.shortcut_ids <@ old.ids)
   OR cardinality(p.shortcut_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.shortcut_ids) e);
