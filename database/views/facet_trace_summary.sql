-- Phase 4.4-B: Facet Trace Summary View
-- Aggregates consciousness traces by facet code for analytics dashboard

-- Drop existing view if present
DROP VIEW IF EXISTS facet_trace_summary;

-- Create aggregated view
CREATE OR REPLACE VIEW facet_trace_summary AS
SELECT
  t.facet AS facet_code,
  COUNT(*) AS trace_count,
  ROUND(AVG(t.confidence)::numeric, 3) AS avg_confidence,
  ROUND(AVG(t.latency_ms)::numeric, 2) AS avg_latency_ms,
  MAX(t.created_at) AS last_trace_at,
  MIN(t.created_at) AS first_trace_at,

  -- Element grouping (extract first character for Fire/Water/Earth/Air/Aether)
  CASE
    WHEN t.facet LIKE 'F%' THEN 'Fire'
    WHEN t.facet LIKE 'W%' THEN 'Water'
    WHEN t.facet LIKE 'E%' THEN 'Earth'
    WHEN t.facet LIKE 'A%' THEN 'Air'
    WHEN t.facet LIKE 'Æ%' OR t.facet LIKE 'AE%' THEN 'Aether'
    ELSE 'Unknown'
  END AS element,

  -- Phase grouping (extract number: 1=emergence, 2=deepening, 3=mastery)
  CASE
    WHEN t.facet ~ '[1]$' THEN 1
    WHEN t.facet ~ '[2]$' THEN 2
    WHEN t.facet ~ '[3]$' THEN 3
    ELSE NULL
  END AS phase

FROM consciousness_traces t
WHERE t.facet IS NOT NULL
GROUP BY t.facet
ORDER BY trace_count DESC;

-- Create index on facet column for faster aggregation
CREATE INDEX IF NOT EXISTS idx_consciousness_traces_facet
  ON consciousness_traces(facet)
  WHERE facet IS NOT NULL;

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_consciousness_traces_created_at
  ON consciousness_traces(created_at DESC);

-- Verification query
SELECT
  facet_code,
  element,
  phase,
  trace_count,
  avg_confidence,
  avg_latency_ms,
  last_trace_at
FROM facet_trace_summary
ORDER BY element, phase;

-- Sample output comment:
-- facet_code | element | phase | trace_count | avg_confidence | avg_latency_ms | last_trace_at
-- -----------+---------+-------+-------------+----------------+----------------+-------------------
-- F1         | Fire    | 1     | 42          | 0.875          | 1250.50        | 2025-12-21 15:30:00
-- F2         | Fire    | 2     | 38          | 0.820          | 1350.25        | 2025-12-21 15:28:00
-- W1         | Water   | 1     | 65          | 0.910          | 980.75         | 2025-12-21 15:31:00
-- ...
