-- Audio Usage Rollup (14-day window)
-- Run this ad-hoc to understand audio consumption patterns.
-- Answers: how much audio is flowing through each route, and how much is rejected?

SELECT
  date_trunc('day', created_at) AS day,
  route,
  status,
  count(*)                      AS events,
  coalesce(sum(file_size_bytes), 0) AS total_bytes,
  coalesce(sum(duration_ms), 0)     AS total_ms,
  count(DISTINCT member_id)         AS unique_members
FROM audio_usage_events
WHERE created_at > now() - interval '14 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;
