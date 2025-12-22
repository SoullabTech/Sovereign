# Phase 4.4D Day 4 - Performance Profiling Guide

**Date**: 2025-12-21
**Branch**: phase4.6-reflective-agentics
**Status**: 📊 Performance Profiling & Optimization Guide

---

## Overview

This guide provides comprehensive performance profiling and optimization strategies for the MAIA Analytics Dashboard. Use these tools and techniques to measure, analyze, and optimize application performance before demonstrations and production deployment.

---

## Table of Contents

1. [Quick Performance Check](#quick-performance-check)
2. [Lighthouse CI Integration](#lighthouse-ci-integration)
3. [Bundle Size Analysis](#bundle-size-analysis)
4. [API Latency Benchmarking](#api-latency-benchmarking)
5. [Database Query Profiling](#database-query-profiling)
6. [Runtime Performance Monitoring](#runtime-performance-monitoring)
7. [Performance Budgets](#performance-budgets)
8. [Optimization Recommendations](#optimization-recommendations)

---

## Quick Performance Check

Run this quick verification before any demo or deployment:

```bash
# 1. Check build size
npm run build 2>&1 | grep -A 10 "Route (app)"

# 2. Test API latency
for endpoint in system verify export/csv; do
  echo "Testing /api/analytics/$endpoint"
  time curl -s http://localhost:3000/api/analytics/$endpoint > /dev/null
done

# 3. Check database connection pool
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname='maia_consciousness';"

# 4. Lighthouse performance score (requires Chrome)
npx lighthouse http://localhost:3000/analytics --only-categories=performance --quiet
```

**Expected Results**:
- ✅ Build size: < 500 KB for /analytics route
- ✅ API latency: < 50ms for all endpoints
- ✅ Active connections: < 10
- ✅ Lighthouse score: > 90

---

## Lighthouse CI Integration

### Setup

Install Lighthouse CI for automated performance testing:

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# Create configuration
cat > lighthouserc.json << 'EOF'
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run dev",
      "startServerReadyPattern": "Ready in",
      "url": [
        "http://localhost:3000/analytics"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["warn", {"maxNumericValue": 300}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
EOF
```

### Run Lighthouse CI

```bash
# Single run with report
npx lhci autorun

# CI/CD integration
npx lhci autorun --collect.numberOfRuns=5

# View detailed report
npx lhci open
```

### Key Metrics to Monitor

| Metric | Target | Critical |
|--------|--------|----------|
| **Performance Score** | > 90 | > 80 |
| **First Contentful Paint (FCP)** | < 1.8s | < 3.0s |
| **Largest Contentful Paint (LCP)** | < 2.5s | < 4.0s |
| **Time to Interactive (TTI)** | < 3.8s | < 7.3s |
| **Total Blocking Time (TBT)** | < 200ms | < 600ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.25 |

### Automated Checks

Add to `package.json`:

```json
{
  "scripts": {
    "perf:check": "lhci autorun",
    "perf:ci": "lhci autorun --collect.numberOfRuns=5"
  }
}
```

---

## Bundle Size Analysis

### Next.js Built-in Analysis

```bash
# Enable bundle analysis
ANALYZE=true npm run build
```

### @next/bundle-analyzer Setup

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Create wrapper config (next.config.analyzer.js)
cat > next.config.analyzer.js << 'EOF'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = require('./next.config.js')

module.exports = withBundleAnalyzer(nextConfig)
EOF

# Run analysis
ANALYZE=true npm run build
```

### Bundle Size Targets

**Analytics Dashboard** (target sizes):
- Client bundle: < 300 KB (gzipped)
- Shared chunks: < 150 KB (gzipped)
- Total initial load: < 500 KB (gzipped)

**Key Dependencies to Monitor**:
```bash
# Check largest dependencies
npx webpack-bundle-analyzer .next/static/analyze/client.html

# List dependency sizes
npm ls --prod --depth=0 | head -20
```

### Optimization Techniques

1. **Dynamic Imports** for large components:
```typescript
// Instead of:
import { HeavyChart } from '@/components/charts/HeavyChart'

// Use:
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
})
```

2. **Tree Shaking** verification:
```bash
# Check if tree shaking is working
npm run build 2>&1 | grep "Tree shaking"
```

3. **Code Splitting** strategy:
```typescript
// Split by route
export default dynamic(() => import('./analytics/page'))

// Split by feature
const ExportControls = dynamic(() => import('@/components/ExportControls'))
```

---

## API Latency Benchmarking

### Quick Latency Test

```bash
# Test all analytics endpoints
cat > scripts/benchmark-api.sh << 'EOF'
#!/bin/bash

echo "🔬 MAIA Analytics API Latency Benchmark"
echo "========================================"

endpoints=(
  "system"
  "verify"
  "export/csv"
  "export/research"
  "filters"
  "status"
)

for endpoint in "${endpoints[@]}"; do
  echo ""
  echo "📊 Testing: /api/analytics/$endpoint"

  # Run 10 requests and calculate average
  total=0
  for i in {1..10}; do
    start=$(date +%s%N)
    curl -s http://localhost:3000/api/analytics/$endpoint > /dev/null
    end=$(date +%s%N)
    duration=$(( (end - start) / 1000000 ))
    total=$(( total + duration ))
  done

  avg=$(( total / 10 ))
  echo "   Average: ${avg}ms"

  if [ $avg -lt 50 ]; then
    echo "   ✅ PASS (< 50ms target)"
  elif [ $avg -lt 100 ]; then
    echo "   ⚠️  WARN (50-100ms)"
  else
    echo "   ❌ FAIL (> 100ms)"
  fi
done

echo ""
echo "========================================"
EOF

chmod +x scripts/benchmark-api.sh
./scripts/benchmark-api.sh
```

### Load Testing with autocannon

```bash
# Install autocannon
npm install -D autocannon

# Run load test
npx autocannon -c 10 -d 30 http://localhost:3000/api/analytics/system

# Expected output:
# Latency (ms): avg 25, p50 20, p99 80
# Requests/sec: 400+
# Throughput: 150+ KB/sec
```

### Advanced Benchmarking Script

```bash
cat > scripts/benchmark-advanced.sh << 'EOF'
#!/bin/bash

echo "🚀 Advanced API Benchmark"
echo "=========================="

# Test concurrent requests
ab -n 1000 -c 10 http://localhost:3000/api/analytics/system

# Test with payload
ab -n 100 -c 5 -p data.json -T application/json \
  http://localhost:3000/api/analytics/export/csv

# Measure response size
curl -w "\nSize: %{size_download} bytes\nTime: %{time_total}s\n" \
  http://localhost:3000/api/analytics/system

# Test under load
echo "Testing under concurrent load..."
for i in {1..50}; do
  curl -s http://localhost:3000/api/analytics/system > /dev/null &
done
wait

echo "✅ Benchmark complete"
EOF

chmod +x scripts/benchmark-advanced.sh
```

### Performance Targets

| Endpoint | P50 | P95 | P99 | Max Acceptable |
|----------|-----|-----|-----|----------------|
| `/api/analytics/system` | < 20ms | < 40ms | < 80ms | 100ms |
| `/api/analytics/verify` | < 25ms | < 50ms | < 100ms | 150ms |
| `/api/analytics/export/csv` | < 100ms | < 200ms | < 500ms | 1000ms |
| `/api/analytics/export/research` | < 100ms | < 200ms | < 500ms | 1000ms |

---

## Database Query Profiling

### Enable Query Logging

```sql
-- Enable slow query logging (PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 50;
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Analyze Query Plans

```bash
# Create query analysis script
cat > scripts/analyze-queries.sh << 'EOF'
#!/bin/bash

QUERIES=(
  "SELECT COUNT(*) FROM consciousness_traces WHERE created_at > NOW() - INTERVAL '24 hours'"
  "SELECT facet_code, COUNT(*) FROM consciousness_traces GROUP BY facet_code"
  "SELECT * FROM consciousness_rules WHERE priority > 5 ORDER BY priority DESC"
)

for query in "${QUERIES[@]}"; do
  echo "Analyzing: $query"
  psql postgresql://soullab@localhost:5432/maia_consciousness \
    -c "EXPLAIN ANALYZE $query"
  echo "---"
done
EOF

chmod +x scripts/analyze-queries.sh
./scripts/analyze-queries.sh
```

### Index Recommendations

```sql
-- Check missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename IN ('consciousness_traces', 'consciousness_rules')
ORDER BY abs(correlation) DESC;

-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_traces_created_at
  ON consciousness_traces(created_at DESC);

CREATE INDEX CONCURRENTLY idx_traces_facet_code
  ON consciousness_traces(facet_code);

CREATE INDEX CONCURRENTLY idx_rules_priority
  ON consciousness_rules(priority DESC);
```

### Connection Pool Monitoring

```bash
# Monitor active connections
watch -n 5 "psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c \"SELECT state, COUNT(*) FROM pg_stat_activity GROUP BY state;\""

# Check pool configuration
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "SHOW max_connections;"
```

---

## Runtime Performance Monitoring

### React DevTools Profiler

```typescript
// Wrap components for profiling
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`)
}

export function AnalyticsDashboard() {
  return (
    <Profiler id="AnalyticsDashboard" onRender={onRenderCallback}>
      <AnalyticsContent />
    </Profiler>
  )
}
```

### Performance Observer API

```typescript
// Monitor Core Web Vitals
if (typeof window !== 'undefined') {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.renderTime || entry.loadTime)
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true })

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime)
    }
  }).observe({ type: 'first-input', buffered: true })

  // Cumulative Layout Shift
  new PerformanceObserver((list) => {
    let cls = 0
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    }
    console.log('CLS:', cls)
  }).observe({ type: 'layout-shift', buffered: true })
}
```

### Custom Performance Marks

```typescript
// Mark critical rendering paths
performance.mark('analytics-start')

// ... component rendering ...

performance.mark('analytics-end')
performance.measure('analytics-render', 'analytics-start', 'analytics-end')

const measure = performance.getEntriesByName('analytics-render')[0]
console.log(`Analytics render time: ${measure.duration}ms`)
```

---

## Performance Budgets

### Budget Configuration

Create `performance-budget.json`:

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        },
        {
          "resourceType": "image",
          "budget": 200
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "third-party",
          "budget": 5
        }
      ],
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000
        },
        {
          "metric": "interactive",
          "budget": 3800
        }
      ]
    }
  ]
}
```

### Enforce Budgets in CI

```bash
# Add to package.json
{
  "scripts": {
    "perf:budget": "lhci autorun --budgets-file=performance-budget.json"
  }
}
```

---

## Optimization Recommendations

### 1. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/analytics-chart.png"
  width={800}
  height={600}
  alt="Analytics Chart"
  priority // for above-fold images
  loading="lazy" // for below-fold images
/>
```

### 2. Font Optimization

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeFonts: true,
  },
}

// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
```

### 3. Caching Strategy

```typescript
// API route caching
export const revalidate = 60 // Revalidate every 60 seconds

// Component-level caching
import { unstable_cache } from 'next/cache'

const getCachedAnalytics = unstable_cache(
  async () => fetchAnalytics(),
  ['analytics-data'],
  { revalidate: 60 }
)
```

### 4. Database Connection Pooling

```typescript
// lib/db/postgres.ts
import { Pool } from 'pg'

const pool = new Pool({
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

### 5. Reduce JavaScript Execution

```typescript
// Use Server Components by default
export default async function AnalyticsPage() {
  const data = await fetchAnalytics() // Server-side only

  return <AnalyticsDisplay data={data} />
}

// Mark client components explicitly
'use client'
export function InteractiveChart({ data }) {
  // Client-side interactivity
}
```

---

## Continuous Monitoring

### Setup Performance Monitoring Script

```bash
cat > scripts/monitor-performance.sh << 'EOF'
#!/bin/bash

LOG_FILE="logs/performance-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

echo "📊 Starting performance monitoring..."
echo "Log file: $LOG_FILE"

while true; do
  {
    echo "=== $(date) ==="

    # API latency
    echo "API Latency:"
    time curl -s http://localhost:3000/api/analytics/system > /dev/null

    # Memory usage
    echo "Memory:"
    ps aux | grep "node.*next" | awk '{print $6/1024 " MB"}'

    # Database connections
    echo "DB Connections:"
    psql postgresql://soullab@localhost:5432/maia_consciousness \
      -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='maia_consciousness';"

    echo ""
  } >> "$LOG_FILE"

  sleep 60
done
EOF

chmod +x scripts/monitor-performance.sh
```

### Alerting Thresholds

```bash
# Create alert script
cat > scripts/perf-alerts.sh << 'EOF'
#!/bin/bash

# Check API latency
latency=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/api/analytics/system)
if (( $(echo "$latency > 0.1" | bc -l) )); then
  echo "⚠️  ALERT: API latency ${latency}s exceeds 100ms threshold"
fi

# Check memory usage
mem=$(ps aux | grep "node.*next" | awk '{sum+=$6} END {print sum/1024}')
if (( $(echo "$mem > 1000" | bc -l) )); then
  echo "⚠️  ALERT: Memory usage ${mem}MB exceeds 1GB threshold"
fi
EOF

chmod +x scripts/perf-alerts.sh
```

---

## Performance Checklist

### Pre-Demo Checklist

- [ ] Run `npm run build` and verify bundle sizes < 500 KB
- [ ] Run `./scripts/benchmark-api.sh` and verify all < 50ms
- [ ] Run Lighthouse CI and verify score > 90
- [ ] Check database has < 10 active connections
- [ ] Verify no console errors in browser
- [ ] Test on production-like environment
- [ ] Clear browser cache and test cold load
- [ ] Test on slower connection (throttle to 3G)

### Production Deployment Checklist

- [ ] Enable production-level database connection pooling
- [ ] Configure CDN for static assets
- [ ] Enable response compression (gzip/brotli)
- [ ] Set up performance monitoring alerts
- [ ] Configure database query logging
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Implement rate limiting on API endpoints
- [ ] Set up error tracking (Sentry, etc.)

---

## Troubleshooting Performance Issues

### Issue: Slow Initial Load

**Diagnosis**:
```bash
# Check bundle size
npm run build 2>&1 | grep "First Load JS"

# Check network waterfall
npx lighthouse http://localhost:3000/analytics --view
```

**Solutions**:
- Implement code splitting
- Reduce bundle size with tree shaking
- Enable HTTP/2 multiplexing
- Add resource hints (preload, prefetch)

### Issue: High API Latency

**Diagnosis**:
```bash
# Profile API endpoint
time curl -v http://localhost:3000/api/analytics/system

# Check database query time
psql -c "EXPLAIN ANALYZE SELECT ..."
```

**Solutions**:
- Add database indexes
- Implement response caching
- Optimize query joins
- Use connection pooling

### Issue: Memory Leaks

**Diagnosis**:
```bash
# Monitor memory over time
watch -n 10 "ps aux | grep 'node.*next' | awk '{print \$6/1024 \" MB\"}'"

# Take heap snapshot
node --inspect scripts/start-server.js
# Chrome DevTools → Memory → Take snapshot
```

**Solutions**:
- Fix event listener cleanup
- Clear interval/timeout references
- Implement proper cache eviction
- Review React useEffect dependencies

---

## Summary

This performance profiling guide provides comprehensive tools for measuring and optimizing the MAIA Analytics Dashboard. Regular performance monitoring ensures:

- ✅ Sub-50ms API latency
- ✅ Lighthouse score > 90
- ✅ Bundle size < 500 KB
- ✅ Optimal database performance
- ✅ Production-ready deployment

**Next Steps**:
1. Review TSAI_REVIEWER_GUIDE.md for demonstration walkthrough
2. Follow performance checklist before any demo
3. Set up continuous monitoring for production

---

**Generated**: 2025-12-21
**Phase**: 4.4D Day 4
**Status**: ✅ Performance Profiling Guide Complete
