-- R4H verified-ordinary-only retrospective memory fixture.
-- Run AFTER R4G synthetic setup/migration and R4G source-loss simulation.
\set ON_ERROR_STOP on
DO $r4h$
DECLARE
 verified_dev int;
 verified_break int;
 verified_vector int;
 unknown_dev int;
 total_dev int;
BEGIN
 SELECT count(*) INTO verified_dev
 FROM developmental_memories d
 WHERE d.origin_scope = 'ordinary' AND d.source_session_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=d.source_session_id);

 SELECT count(*) INTO verified_break
 FROM breakthrough_moments b
 WHERE b.origin_scope = 'ordinary' AND b.source_session_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=b.source_session_id);

 SELECT count(*) INTO verified_vector
 FROM semantic_memory_vectors v
 WHERE v.origin_scope = 'ordinary' AND v.source_session_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM astro_maia_transfer_grants g WHERE g.session_id=v.source_session_id);

 SELECT count(*) INTO unknown_dev FROM developmental_memories
 WHERE origin_scope = 'unknown' OR source_session_id IS NULL;
 SELECT count(*) INTO total_dev FROM developmental_memories;

 IF verified_dev <> 1 OR verified_break <> 1 OR verified_vector <> 1
    OR unknown_dev <> 1 OR total_dev <> 3 THEN
    RAISE EXCEPTION 'R4H held historical memory synthetic counts incorrect';
 END IF;

 RAISE NOTICE 'R4H_HISTORICAL_UNKNOWN_FICTIONAL_PASS dev_allowed=1 break_allowed=1 vector_allowed=1 unknown_retained_and_held=1';
END
$r4h$;
