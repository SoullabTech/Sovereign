# Consciousness Traces Monitoring Queries

Quick SQL queries for monitoring the Phase 4.3 Symbolic Router system in production.

## Recent Traces

View the 25 most recent consciousness traces:

```sql
SELECT
  created_at,
  request_id,
  facet,
  mode,
  confidence,
  latency_ms
FROM consciousness_traces
ORDER BY created_at DESC
LIMIT 25;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT created_at, request_id, facet, mode, confidence, latency_ms FROM consciousness_traces ORDER BY created_at DESC LIMIT 25;"
```

---

## Facet Distribution

See which facets are being triggered most often:

```sql
SELECT
  facet,
  COUNT(*) as count
FROM consciousness_traces
GROUP BY facet
ORDER BY count DESC;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT facet, COUNT(*) as count FROM consciousness_traces GROUP BY facet ORDER BY count DESC;"
```

---

## Agent Distribution

See which agents are being routed to:

```sql
SELECT
  agent,
  COUNT(*) as count,
  AVG(latency_ms) as avg_latency_ms
FROM consciousness_traces
GROUP BY agent
ORDER BY count DESC;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT agent, COUNT(*) as count, AVG(latency_ms) as avg_latency_ms FROM consciousness_traces GROUP BY agent ORDER BY count DESC;"
```

---

## Recommended Practices

Extract and count practice recommendations:

```sql
SELECT
  jsonb_array_elements_text(trace->'routing'->'practices') AS practice,
  COUNT(*) as count
FROM consciousness_traces
WHERE trace ? 'routing'
  AND trace->'routing' ? 'practices'
GROUP BY practice
ORDER BY count DESC
LIMIT 50;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT jsonb_array_elements_text(trace->'routing'->'practices') AS practice, COUNT(*) as count FROM consciousness_traces WHERE trace ? 'routing' AND trace->'routing' ? 'practices' GROUP BY practice ORDER BY count DESC LIMIT 50;"
```

---

## Latency Metrics

Performance overview:

```sql
SELECT
  agent,
  COUNT(*) as total_requests,
  MIN(latency_ms) as min_latency_ms,
  AVG(latency_ms) as avg_latency_ms,
  MAX(latency_ms) as max_latency_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency_ms
FROM consciousness_traces
WHERE latency_ms IS NOT NULL
GROUP BY agent
ORDER BY total_requests DESC;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT agent, COUNT(*) as total_requests, MIN(latency_ms) as min_latency_ms, AVG(latency_ms) as avg_latency_ms, MAX(latency_ms) as max_latency_ms FROM consciousness_traces WHERE latency_ms IS NOT NULL GROUP BY agent ORDER BY total_requests DESC;"
```

---

## Safety Level Distribution

Track safety escalations:

```sql
SELECT
  safety_level,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence
FROM consciousness_traces
WHERE safety_level IS NOT NULL
GROUP BY safety_level
ORDER BY
  CASE safety_level
    WHEN 'critical' THEN 1
    WHEN 'elevated' THEN 2
    WHEN 'moderate' THEN 3
    WHEN 'none' THEN 4
    ELSE 5
  END;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT safety_level, COUNT(*) as count, AVG(confidence) as avg_confidence FROM consciousness_traces WHERE safety_level IS NOT NULL GROUP BY safety_level;"
```

---

## Today's Activity

Traces from the last 24 hours:

```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as traces_count,
  AVG(latency_ms) as avg_latency_ms,
  COUNT(DISTINCT user_id) as unique_users
FROM consciousness_traces
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as traces_count, AVG(latency_ms) as avg_latency_ms FROM consciousness_traces WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY hour ORDER BY hour DESC;"
```

---

## Rule Effectiveness

Which rules are firing most often?

```sql
SELECT
  jsonb_array_elements(trace->'rules'->'fired')->>'name' as rule_name,
  (jsonb_array_elements(trace->'rules'->'fired')->>'matched')::boolean as matched,
  COUNT(*) as count
FROM consciousness_traces
WHERE trace ? 'rules'
GROUP BY rule_name, matched
ORDER BY count DESC
LIMIT 20;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT jsonb_array_elements(trace->'rules'->'fired')->>'name' as rule_name, (jsonb_array_elements(trace->'rules'->'fired')->>'matched')::boolean as matched, COUNT(*) as count FROM consciousness_traces WHERE trace ? 'rules' GROUP BY rule_name, matched ORDER BY count DESC LIMIT 20;"
```

---

## Full Trace Inspection

Examine a specific trace in detail:

```sql
SELECT
  id,
  created_at,
  user_id,
  agent,
  facet,
  mode,
  confidence,
  safety_level,
  latency_ms,
  jsonb_pretty(trace) as trace_detail
FROM consciousness_traces
WHERE id = 'YOUR_TRACE_ID_HERE'
  OR request_id = 'YOUR_REQUEST_ID_HERE'
LIMIT 1;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT id, created_at, agent, facet, mode, confidence, latency_ms, jsonb_pretty(trace) as trace_detail FROM consciousness_traces WHERE request_id = 'req_water2_demo' LIMIT 1;"
```

---

## Database Health

Check table size and row counts:

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT COUNT(*) FROM consciousness_traces) as row_count
FROM pg_tables
WHERE tablename = 'consciousness_traces';
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_total_relation_size('consciousness_traces')) AS size, COUNT(*) as row_count FROM consciousness_traces;"
```

---

## Active Rules

View currently enabled rules:

```sql
SELECT
  name,
  priority,
  enabled,
  created_at,
  updated_at
FROM consciousness_rules
WHERE enabled = true
ORDER BY priority DESC, updated_at DESC;
```

**Usage:**
```bash
psql "$DATABASE_URL" -c "SELECT name, priority, enabled, created_at FROM consciousness_rules WHERE enabled = true ORDER BY priority DESC;"
```

---

## Environment Setup

Set your `DATABASE_URL` environment variable:

```bash
# Add to your .env or .zshrc:
export DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness"

# Or use it inline:
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM consciousness_traces;"
```

---

## Quick Monitoring Loop

Watch traces in real-time (updates every 2 seconds):

```bash
watch -n 2 'psql "$DATABASE_URL" -c "SELECT created_at, facet, mode, latency_ms FROM consciousness_traces ORDER BY created_at DESC LIMIT 10;"'
```

Or use a simple bash loop:

```bash
while true; do
  clear
  echo "=== Latest Consciousness Traces ==="
  psql "$DATABASE_URL" -c "SELECT created_at, facet, mode, latency_ms FROM consciousness_traces ORDER BY created_at DESC LIMIT 10;"
  sleep 2
done
```
