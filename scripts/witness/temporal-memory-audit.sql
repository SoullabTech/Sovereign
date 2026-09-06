-- Temporal Memory Audit — two READ-ONLY witnesses.
--
-- Authority: docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md §"The audit
-- that precedes any change". This script converts two uncertainties into facts.
-- It changes nothing. It opens no lane. It does not wire shouldPromptForConfirmation.
--
-- WHAT THIS WITNESSES
--   §1  Whether production currently contains the conditions under which an
--       expired developmental memory (valid_to <= NOW()) could traverse the
--       vector fallback in lib/memory/MemoryBundle.ts (non-vector path filtered
--       at line ~276; vector fallback unfiltered at lines ~311-325).
--   §2  Whether the 0.40 decay term in the non-vector ranking changes WHICH
--       memories make the per-member top-12 (the set MAIA gets to think with),
--       versus the same candidates with the decay contribution removed.
--
-- WHAT THIS DOES NOT WITNESS
--   Runtime traversal. The fallback also requires generateLocalEmbedding() to
--   return a non-empty vector at request time; §1 establishes the DATA
--   precondition only. A "possible" result is a precondition, not a defect.
--
-- PRIVACY
--   No content_text is selected anywhere. Member ids are emitted as 8-char
--   prefixes. Memory ids are emitted as 8-char prefixes.
--
-- Run (production, from the Mac Studio):
--   ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1' \
--     < scripts/witness/temporal-memory-audit.sql
--
-- Record the output verbatim in the direction note's audit section.

\set QUIET on
\pset footer off
\set QUIET off

\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' §1  valid_to FALLBACK WITNESS'
\echo '════════════════════════════════════════════════════════════════'

\echo
\echo '§1.a  Expired developmental memories exist at all?'
SELECT
  COUNT(*)                                            AS expired_rows,
  COUNT(*) FILTER (WHERE vector_embedding IS NOT NULL) AS expired_rows_with_embedding,
  COUNT(DISTINCT user_id)                             AS members_with_expired_rows
FROM developmental_memories
WHERE valid_to IS NOT NULL AND valid_to <= NOW();

\echo
\echo '§1.b  TRAVERSAL PRECONDITION: members for whom the non-vector query returns'
\echo '      ZERO rows (no open row with content_text) AND who hold at least one'
\echo '      expired row carrying an embedding. Empty result = impossible with'
\echo '      current data. Non-empty = data precondition present (not yet a defect).'
WITH open_rows AS (
  SELECT user_id, COUNT(*) AS n
  FROM developmental_memories
  WHERE content_text IS NOT NULL
    AND (valid_to IS NULL OR valid_to > NOW())
  GROUP BY user_id
),
expired_embedded AS (
  SELECT user_id,
         COUNT(*)                          AS expired_embedded_rows,
         MIN(valid_to)                     AS earliest_expiry,
         MAX(valid_to)                     AS latest_expiry
  FROM developmental_memories
  WHERE valid_to IS NOT NULL AND valid_to <= NOW()
    AND vector_embedding IS NOT NULL
  GROUP BY user_id
)
SELECT
  LEFT(e.user_id::text, 8) AS member_prefix,
  e.expired_embedded_rows,
  e.earliest_expiry::date,
  e.latest_expiry::date,
  COALESCE(o.n, 0)         AS open_content_rows
FROM expired_embedded e
LEFT JOIN open_rows o USING (user_id)
WHERE COALESCE(o.n, 0) = 0
ORDER BY e.expired_embedded_rows DESC;

\echo
\echo '§1.c  Softer form: members with ANY expired embedded row, regardless of'
\echo '      open-row count (would traverse only if open rows were later archived).'
SELECT
  COUNT(DISTINCT user_id) AS members_with_expired_embedded_rows
FROM developmental_memories
WHERE valid_to IS NOT NULL AND valid_to <= NOW()
  AND vector_embedding IS NOT NULL;

\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' §2  DECAY COUNTERFACTUAL — does the 0.40 term change the top-12 set?'
\echo '════════════════════════════════════════════════════════════════'
\echo
\echo '  score_with    = exactly MemoryBundle.ts non-vector score'
\echo '  score_without = same, with the 0.40 decay term replaced by 0.40 * significance'
\echo '                  (i.e. decay factor forced to 1: no time penalty, same weight)'
\echo '  A memory is IN if its rank <= 12 under that scoring.'

CREATE TEMP TABLE _tm_scored AS
SELECT
  user_id,
  id,
  memory_type,
  formed_at,
  last_confirmed_at,
  confirmed_by_user,
  recall_count,
  significance,
  ROUND(EXTRACT(EPOCH FROM (NOW() - COALESCE(last_confirmed_at, formed_at))) / 86400.0) AS age_days_ref,
  (
    0.40 * COALESCE(calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at), significance)
    + 0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0)
    + 0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END
    + 0.10 * LEAST(recall_count / 10.0, 1.0)
  ) AS score_with,
  (
    0.40 * significance
    + 0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at)) / 86400.0 / 30.0)
    + 0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END
    + 0.10 * LEAST(recall_count / 10.0, 1.0)
  ) AS score_without
FROM developmental_memories
WHERE content_text IS NOT NULL
  AND (valid_to IS NULL OR valid_to > NOW());

CREATE TEMP TABLE _tm_ranked AS
SELECT
  *,
  RANK() OVER (PARTITION BY user_id ORDER BY score_with DESC, id)    AS rank_with,
  RANK() OVER (PARTITION BY user_id ORDER BY score_without DESC, id) AS rank_without
FROM _tm_scored;

\echo
\echo '§2.a  Population'
SELECT
  COUNT(DISTINCT user_id)                                        AS members_with_candidates,
  COUNT(*)                                                       AS candidate_rows,
  COUNT(DISTINCT user_id) FILTER (WHERE rank_with > 12)          AS members_where_top12_is_a_cut
FROM _tm_ranked;

\echo
\echo '§2.b  HEADLINE: members whose selected top-12 SET changes when decay is removed'
WITH sets AS (
  SELECT user_id,
         ARRAY_AGG(id ORDER BY id) FILTER (WHERE rank_with    <= 12) AS set_with,
         ARRAY_AGG(id ORDER BY id) FILTER (WHERE rank_without <= 12) AS set_without
  FROM _tm_ranked GROUP BY user_id
)
SELECT
  COUNT(*)                                            AS members_total,
  COUNT(*) FILTER (WHERE set_with IS DISTINCT FROM set_without) AS members_set_changed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE set_with IS DISTINCT FROM set_without) / NULLIF(COUNT(*),0), 1) AS pct_changed
FROM sets;

\echo
\echo '§2.c  Which memories ENTER the top-12 when decay is removed (were excluded by decay)'
SELECT
  LEFT(user_id::text, 8) AS member_prefix,
  LEFT(id::text, 8)      AS memory_prefix,
  memory_type,
  age_days_ref,
  confirmed_by_user,
  rank_with,
  rank_without,
  (rank_with - rank_without) AS displacement
FROM _tm_ranked
WHERE rank_without <= 12 AND rank_with > 12
ORDER BY user_id, rank_without;

\echo
\echo '§2.d  Which memories LEAVE the top-12 when decay is removed (were held in by decay)'
SELECT
  LEFT(user_id::text, 8) AS member_prefix,
  LEFT(id::text, 8)      AS memory_prefix,
  memory_type,
  age_days_ref,
  confirmed_by_user,
  rank_with,
  rank_without,
  (rank_without - rank_with) AS displacement
FROM _tm_ranked
WHERE rank_with <= 12 AND rank_without > 12
ORDER BY user_id, rank_with;

\echo
\echo '§2.e  Displacement by memory_type (all candidates, not only the cut)'
SELECT
  memory_type,
  COUNT(*)                                          AS rows,
  ROUND(AVG(age_days_ref))                          AS avg_age_days,
  ROUND(AVG(ABS(rank_with - rank_without)), 2)      AS avg_abs_rank_shift,
  MAX(ABS(rank_with - rank_without))                AS max_abs_rank_shift,
  COUNT(*) FILTER (WHERE (rank_with <= 12) <> (rank_without <= 12)) AS membership_flips
FROM _tm_ranked
GROUP BY memory_type
ORDER BY membership_flips DESC, avg_abs_rank_shift DESC;

DROP TABLE _tm_ranked;
DROP TABLE _tm_scored;

\echo
\echo 'Done. Read-only; temp tables dropped; nothing written.'
