-- ============================================================================
-- MAIA Memory Health Dashboard
-- ============================================================================
-- Run this to get an instant read on whether the memory pipeline is healthy.
--
-- Usage:
--   docker exec maia-postgres psql -U soullab maia_consciousness -f /dev/stdin < scripts/memory-health.sql
--
-- Or inline:
--   docker exec maia-postgres psql -U soullab maia_consciousness \
--     -c "$(cat scripts/memory-health.sql)"
-- ============================================================================

\echo ''
\echo '══════════════════════════════════════════════════════════════'
\echo '  MAIA MEMORY HEALTH'
\echo '══════════════════════════════════════════════════════════════'

\echo ''
\echo '── Session Summary Pipeline ────────────────────────────────'

SELECT
  COUNT(*) FILTER (WHERE status = 'active' AND member_id IS NOT NULL)  AS active_member_sessions,
  COUNT(*) FILTER (WHERE status = 'active' AND member_id IS NULL)       AS active_anon_sessions,
  COUNT(*) FILTER (WHERE status = 'completed' AND summary IS NOT NULL)  AS completed_with_summary,
  COUNT(*) FILTER (WHERE status = 'completed' AND summary IS NULL
                     AND mode != 'sanctuary')                            AS completed_missing_summary
FROM maia_sessions;

\echo ''
\echo '── Last 24h Activity ───────────────────────────────────────'

SELECT
  COUNT(*) FILTER (WHERE started_at > NOW() - INTERVAL '24 hours') AS sessions_started_24h,
  COUNT(*) FILTER (WHERE completed_at > NOW() - INTERVAL '24 hours') AS sessions_ended_24h,
  COUNT(*) FILTER (WHERE completed_at > NOW() - INTERVAL '24 hours'
                     AND summary IS NOT NULL)                          AS summaries_generated_24h
FROM maia_sessions;

\echo ''
\echo '── Queue Health ────────────────────────────────────────────'

SELECT
  status,
  COUNT(*) AS count,
  AVG(attempts)::numeric(4,1) AS avg_attempts,
  MAX(attempts) AS max_attempts
FROM session_summary_queue
GROUP BY status
ORDER BY status;

\echo ''
\echo '── Recent Queue Failures ───────────────────────────────────'

SELECT session_id, attempts, LEFT(COALESCE(last_error, 'none'), 120) AS last_error, finished_at
FROM session_summary_queue
WHERE status = 'failed'
ORDER BY finished_at DESC NULLS LAST
LIMIT 5;

\echo '  (No rows = no failures)'

\echo ''
\echo '── Stale Active Member Sessions ────────────────────────────'
\echo '  (Active > 2h with member_id — should be swept by sweeper)'

SELECT id, member_id, last_activity_at,
  ROUND(EXTRACT(EPOCH FROM (NOW() - last_activity_at)) / 3600, 1) AS hours_stale,
  (SELECT COUNT(*) FROM conversation_turns ct WHERE ct.session_id = ms.id) AS turn_count
FROM maia_sessions ms
WHERE status = 'active'
  AND member_id IS NOT NULL
  AND mode != 'sanctuary'
  AND last_activity_at < NOW() - INTERVAL '2 hours'
ORDER BY last_activity_at ASC;

\echo '  (No rows = all member sessions healthy)'

\echo ''
\echo '── Per-Member Memory Depth ─────────────────────────────────'

SELECT
  member_id,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions,
  COUNT(*) FILTER (WHERE summary IS NOT NULL) AS sessions_with_summary,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE summary IS NOT NULL)
    / NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0)
  ) || '%' AS coverage
FROM maia_sessions
WHERE member_id IS NOT NULL
GROUP BY member_id
ORDER BY completed_sessions DESC;

\echo ''
\echo '── Turn Pipeline Health ────────────────────────────────────'

SELECT
  COUNT(*) AS total_turns,
  COUNT(DISTINCT session_id) AS sessions_with_turns,
  COUNT(DISTINCT user_id) AS members_with_turns,
  MAX(created_at)::text AS most_recent_turn
FROM conversation_turns;

\echo ''
\echo '══════════════════════════════════════════════════════════════'
