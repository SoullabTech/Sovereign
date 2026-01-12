-- ============================================================
-- AIN / MAIA Intelligence Dashboard SQL (Postgres)
-- Delivers exactly:
-- 1) join view (telemetry → turn)
-- 2) memory intelligence views
-- 3) non-empty "consciousness expansion" metric
--
-- ASSUMPTIONS (match your schemas):
--   ain_shape_telemetry: (id bigint, session_id text/uuid, formed_at ts,
--     pass bool, score numeric, mirror bool, bridge bool, permission bool, next_step bool, route text, model text, ...)
--   maia_turns: (id bigint, session_id, turn_index int, created_at ts, user_text text, maia_text text, ...)
--   maia_decisions: (id?, turn_id bigint -> maia_turns.id, session_id, final_label text, decided_by text, deliberation_triggered bool, ...)
--   conversation_memory_uses: (id uuid, user_id, session_id, message_id text/uuid,
--     memory_table text, memory_id, used_as text, retrieval_score, semantic_score, recency_score, confidence_score, created_at ts, ...)
--
-- Run as a single file. Safe to re-run (CREATE OR REPLACE VIEW).
-- ============================================================

-- ------------------------------------------------------------
-- Optional indexes (recommended)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ast_session_formed
  ON ain_shape_telemetry (session_id, formed_at);

CREATE INDEX IF NOT EXISTS idx_turns_session_created
  ON maia_turns (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_decisions_turn
  ON maia_decisions (turn_id);

CREATE INDEX IF NOT EXISTS idx_cmu_session_created
  ON conversation_memory_uses (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_cmu_session_message
  ON conversation_memory_uses (session_id, message_id);

-- ============================================================
-- 1) JOIN VIEW: telemetry → turn (nearest by timestamp per session)
-- ============================================================
CREATE OR REPLACE VIEW ain_shape_telemetry_turn_join AS
WITH ranked AS (
  SELECT
    ast.id                         AS telemetry_id,
    ast.session_id                 AS session_id,
    ast.formed_at                  AS formed_at,
    ast.route                      AS route,
    ast.model                      AS model,
    ast.pass                       AS pass,
    ast.score                      AS score,
    ast.mirror                     AS mirror,
    ast.bridge                     AS bridge,
    ast.permission                 AS permission,
    ast.next_step                  AS next_step,

    mt.id                          AS turn_id,
    mt.turn_index                  AS turn_index,
    mt.created_at                  AS turn_created_at,

    ABS(EXTRACT(EPOCH FROM (mt.created_at - ast.formed_at))) AS time_diff_seconds,

    ROW_NUMBER() OVER (
      PARTITION BY ast.id
      ORDER BY ABS(EXTRACT(EPOCH FROM (mt.created_at - ast.formed_at))) ASC
    ) AS rn
  FROM ain_shape_telemetry ast
  JOIN maia_turns mt
    ON mt.session_id = ast.session_id
   AND mt.created_at BETWEEN (ast.formed_at - INTERVAL '10 minutes')
                        AND (ast.formed_at + INTERVAL '10 minutes')
)
SELECT
  telemetry_id,
  session_id,
  formed_at,
  route,
  model,
  pass,
  score,
  mirror,
  bridge,
  permission,
  next_step,
  turn_id,
  turn_index,
  turn_created_at,
  time_diff_seconds
FROM ranked
WHERE rn = 1;

-- (Optional) join to decisions (handy for dashboards)
CREATE OR REPLACE VIEW ain_shape_telemetry_turn_decision_join AS
SELECT
  j.*,
  d.id                     AS decision_id,
  d.final_label            AS final_label,
  d.decided_by             AS decided_by,
  d.deliberation_triggered AS deliberation_triggered
FROM ain_shape_telemetry_turn_join j
LEFT JOIN maia_decisions d
  ON d.turn_id = j.turn_id;

-- ============================================================
-- 2) MEMORY INTELLIGENCE VIEWS
-- ============================================================

-- 2A) Memory uses per session/day
CREATE OR REPLACE VIEW ain_memory_uses_daily AS
SELECT
  DATE_TRUNC('day', created_at)::date AS day,
  COUNT(*) AS memory_uses,
  COUNT(DISTINCT user_id) AS memory_users,
  COUNT(DISTINCT session_id) AS sessions_with_memory,
  AVG(COALESCE(confidence_score, 0)) AS avg_confidence_score,
  AVG(COALESCE(retrieval_score, 0))  AS avg_retrieval_score,
  AVG(COALESCE(semantic_score, 0))   AS avg_semantic_score,
  AVG(COALESCE(recency_score, 0))    AS avg_recency_score
FROM conversation_memory_uses
GROUP BY 1
ORDER BY 1 DESC;

-- 2B) Memory uses by session (quality + diversity)
CREATE OR REPLACE VIEW ain_memory_by_session AS
SELECT
  session_id,
  COUNT(*) AS memory_uses,
  COUNT(DISTINCT user_id) AS users_in_memory_stream,
  COUNT(DISTINCT memory_table || ':' || memory_id::text) AS unique_memories_used,
  AVG(COALESCE(confidence_score, 0)) AS avg_confidence_score,
  AVG(COALESCE(retrieval_score, 0))  AS avg_retrieval_score,
  AVG(COALESCE(semantic_score, 0))   AS avg_semantic_score,
  AVG(COALESCE(recency_score, 0))    AS avg_recency_score,
  MIN(created_at) AS first_memory_use_at,
  MAX(created_at) AS last_memory_use_at
FROM conversation_memory_uses
GROUP BY session_id;

-- 2C) Memory coverage per user
CREATE OR REPLACE VIEW ain_memory_by_user AS
SELECT
  user_id,
  COUNT(*) AS memory_uses,
  COUNT(DISTINCT session_id) AS sessions_with_memory,
  COUNT(DISTINCT memory_table || ':' || memory_id::text) AS unique_memories_used,
  AVG(COALESCE(confidence_score, 0)) AS avg_confidence_score,
  AVG(COALESCE(retrieval_score, 0))  AS avg_retrieval_score,
  AVG(COALESCE(semantic_score, 0))   AS avg_semantic_score,
  AVG(COALESCE(recency_score, 0))    AS avg_recency_score,
  MIN(created_at) AS first_memory_use_at,
  MAX(created_at) AS last_memory_use_at
FROM conversation_memory_uses
GROUP BY user_id;

-- 2D) Memory uses per turn (timestamp-nearest join within ±30 seconds)
--     Note: message_id in conversation_memory_uses is traceId, not turn_id
--     So we use temporal proximity to link memory uses to the correct turn
DROP VIEW IF EXISTS ain_memory_by_turn CASCADE;
CREATE OR REPLACE VIEW ain_memory_by_turn AS
WITH ranked AS (
  SELECT
    cmu.id                       AS memory_use_id,
    cmu.session_id,
    cmu.user_id,
    cmu.created_at               AS memory_created_at,
    cmu.memory_table,
    cmu.memory_id,
    cmu.used_as,
    cmu.retrieval_score,
    cmu.semantic_score,
    cmu.recency_score,
    cmu.confidence_score,

    mt.id                        AS turn_id,
    mt.turn_index,
    mt.created_at                AS turn_created_at,

    ABS(EXTRACT(EPOCH FROM (mt.created_at - cmu.created_at))) AS time_diff_seconds,

    ROW_NUMBER() OVER (
      PARTITION BY cmu.id
      ORDER BY ABS(EXTRACT(EPOCH FROM (mt.created_at - cmu.created_at))) ASC
    ) AS rn
  FROM conversation_memory_uses cmu
  JOIN maia_turns mt
    ON mt.session_id = cmu.session_id
   AND mt.created_at BETWEEN (cmu.created_at - INTERVAL '30 seconds')
                        AND (cmu.created_at + INTERVAL '30 seconds')
)
SELECT
  session_id,
  turn_id,
  turn_index,
  MIN(turn_created_at) AS turn_created_at,
  COUNT(*) AS memory_uses,
  COUNT(DISTINCT memory_table || ':' || memory_id::text) AS unique_memories_used,
  AVG(COALESCE(confidence_score, 0)) AS avg_confidence_score,
  AVG(COALESCE(retrieval_score, 0))  AS avg_retrieval_score,
  AVG(COALESCE(semantic_score, 0))   AS avg_semantic_score,
  AVG(COALESCE(recency_score, 0))    AS avg_recency_score,
  AVG(time_diff_seconds) AS avg_time_diff_seconds,
  MAX(time_diff_seconds) AS max_time_diff_seconds
FROM ranked
WHERE rn = 1
GROUP BY session_id, turn_id, turn_index
ORDER BY turn_created_at DESC;

-- ============================================================
-- 3) NON-EMPTY "CONSCIOUSNESS EXPANSION" METRIC
--    This is computed from:
--      - shape signals (score + flags)
--      - deliberation-triggered decisions (complexity/edge)
--      - memory usage (if present; otherwise contributes 0)
--    => It is NOT empty even if insights tables are empty.
-- ============================================================

-- 3A) Per turn expansion score (joined telemetry→turn→decision + memory)
CREATE OR REPLACE VIEW ain_expansion_score AS
WITH base AS (
  SELECT
    jd.telemetry_id,
    jd.session_id,
    jd.turn_id,
    jd.turn_index,
    COALESCE(jd.turn_created_at, jd.formed_at) AS ts,
    COALESCE(jd.score, 0)::float AS shape_score,
    COALESCE(jd.mirror, false) AS mirror,
    COALESCE(jd.bridge, false) AS bridge,
    COALESCE(jd.permission, false) AS permission,
    COALESCE(jd.next_step, false) AS next_step,
    COALESCE(jd.deliberation_triggered, false) AS deliberation_triggered
  FROM ain_shape_telemetry_turn_decision_join jd
),
mem AS (
  SELECT
    session_id,
    message_id::text AS message_id,
    COUNT(*) AS memory_uses,
    AVG(COALESCE(confidence_score, 0))::float AS memory_confidence
  FROM conversation_memory_uses
  GROUP BY 1,2
),
joined AS (
  SELECT
    b.*,
    COALESCE(m.memory_uses, 0)::float AS memory_uses,
    COALESCE(m.memory_confidence, 0)::float AS memory_confidence
  FROM base b
  LEFT JOIN mem m
    ON m.session_id = b.session_id
   AND m.message_id = b.turn_id::text
),
components AS (
  SELECT
    *,
    -- Shape component (0..1)
    LEAST(1.0, GREATEST(0.0,
      (shape_score / 4.0)
      + (CASE WHEN mirror THEN 0.10 ELSE 0 END)
      + (CASE WHEN bridge THEN 0.10 ELSE 0 END)
      + (CASE WHEN permission THEN 0.10 ELSE 0 END)
      + (CASE WHEN next_step THEN 0.10 ELSE 0 END)
    )) AS shape_component,

    -- Memory component (0..1)
    LEAST(1.0, GREATEST(0.0,
      (LEAST(5.0, memory_uses) / 5.0) * memory_confidence
    )) AS memory_component,

    -- Deliberation component (0..1)
    (CASE WHEN deliberation_triggered THEN 1.0 ELSE 0.0 END) AS deliberation_component
  FROM joined
)
SELECT
  telemetry_id,
  session_id,
  turn_id,
  turn_index,
  ts,
  shape_score,
  mirror, bridge, permission, next_step,
  deliberation_triggered,
  memory_uses,
  memory_confidence,
  shape_component,
  memory_component,
  deliberation_component,

  -- Final expansion score (0..1)
  LEAST(1.0, GREATEST(0.0,
    0.70 * shape_component
    + 0.25 * memory_component
    + 0.05 * deliberation_component
  )) AS expansion_score
FROM components;

-- 3B) Daily expansion rollup (this is what you show in NocoDB)
CREATE OR REPLACE VIEW ain_expansion_daily AS
SELECT
  DATE_TRUNC('day', ts)::date AS day,
  COUNT(*) AS n,
  AVG(expansion_score) AS avg_expansion_score,
  AVG(shape_component) AS avg_shape_component,
  AVG(memory_component) AS avg_memory_component,
  AVG(deliberation_component) AS avg_deliberation_component,
  AVG(CASE WHEN permission THEN 1 ELSE 0 END) AS permission_rate,
  AVG(CASE WHEN bridge THEN 1 ELSE 0 END) AS bridge_rate,
  AVG(CASE WHEN next_step THEN 1 ELSE 0 END) AS next_step_rate,
  AVG(CASE WHEN mirror THEN 1 ELSE 0 END) AS mirror_rate,
  AVG(CASE WHEN memory_uses > 0 THEN 1 ELSE 0 END) AS memory_use_rate,
  AVG(memory_confidence) AS avg_memory_confidence
FROM ain_expansion_score
GROUP BY 1
ORDER BY 1 DESC;

-- ============================================================
-- QUICK CHECKS
-- ============================================================
-- 1) sanity: join coverage
-- SELECT COUNT(*) AS telemetry_rows FROM ain_shape_telemetry;
-- SELECT COUNT(*) AS joined_rows FROM ain_shape_telemetry_turn_join;

-- 2) confirm expansion is non-empty
-- SELECT * FROM ain_expansion_daily ORDER BY day DESC LIMIT 14;

-- 3) memory views
-- SELECT * FROM ain_memory_uses_daily ORDER BY day DESC LIMIT 14;
-- SELECT * FROM ain_memory_by_session ORDER BY memory_uses DESC LIMIT 20;
-- SELECT * FROM ain_memory_by_user ORDER BY memory_uses DESC LIMIT 20;
