#!/usr/bin/env tsx
/**
 * PERFORMANCE BENCHMARK SUITE
 * Phase 4.5: Mycelial Memory — Performance Profiling
 *
 * Purpose:
 * - Measure cycle generation performance
 * - Benchmark embedding generation (Ollama)
 * - Test vector similarity search speed
 * - Profile dashboard rendering (API latency)
 * - Establish baseline metrics for regression testing
 *
 * Usage:
 *   npx tsx scripts/benchmarks/run-benchmarks.ts
 */

import { getClient } from '../../lib/db/postgres';

// ============================================================================
// ANSI COLOR CODES
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ============================================================================
// BENCHMARK UTILITIES
// ============================================================================

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  stdDevMs: number;
}

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 10
): Promise<BenchmarkResult> {
  const times: number[] = [];

  console.log(`${colors.cyan}⏱️  Running: ${name} (${iterations} iterations)${colors.reset}`);

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);

    // Progress indicator
    if ((i + 1) % Math.max(1, Math.floor(iterations / 10)) === 0) {
      process.stdout.write(`${colors.gray}.${colors.reset}`);
    }
  }

  process.stdout.write('\n');

  const totalMs = times.reduce((sum, t) => sum + t, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  const variance = times.reduce((sum, t) => sum + Math.pow(t - avgMs, 2), 0) / iterations;
  const stdDevMs = Math.sqrt(variance);

  return {
    name,
    iterations,
    totalMs,
    avgMs,
    minMs,
    maxMs,
    stdDevMs,
  };
}

function printResult(result: BenchmarkResult): void {
  console.log(`${colors.blue}━━━ ${result.name} ━━━${colors.reset}`);
  console.log(`  Iterations:  ${result.iterations}`);
  console.log(`  Average:     ${colors.green}${formatMs(result.avgMs)}${colors.reset}`);
  console.log(`  Min:         ${formatMs(result.minMs)}`);
  console.log(`  Max:         ${formatMs(result.maxMs)}`);
  console.log(`  Std Dev:     ${formatMs(result.stdDevMs)}`);
  console.log(`  Total:       ${formatMs(result.totalMs)}\n`);
}

// ============================================================================
// BENCHMARK: DATABASE QUERY (TRACE AGGREGATION)
// ============================================================================

async function benchmarkTraceAggregation(): Promise<void> {
  const client = await getClient();
  try {
    const endTs = new Date();
    const startTs = new Date(endTs.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    await client.query(
      `SELECT
         facet,
         COUNT(*) AS count,
         AVG(confidence) AS avg_confidence
       FROM consciousness_traces
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY facet
       ORDER BY count DESC`,
      [startTs, endTs]
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// BENCHMARK: DATABASE QUERY (BIOMARKER AGGREGATION)
// ============================================================================

async function benchmarkBiomarkerAggregation(): Promise<void> {
  const client = await getClient();
  try {
    const endTs = new Date();
    const startTs = new Date(endTs.getTime() - 24 * 60 * 60 * 1000);

    await client.query(
      `SELECT
         signal_type,
         AVG(value) AS avg_value,
         STDDEV(value) AS stddev_value,
         COUNT(*) AS sample_count
       FROM consciousness_biomarkers
       WHERE sample_ts >= $1 AND sample_ts <= $2
       GROUP BY signal_type`,
      [startTs, endTs]
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// BENCHMARK: EMBEDDING GENERATION (MOCK)
// ============================================================================

async function benchmarkEmbeddingGeneration(): Promise<void> {
  // Mock Ollama API call (actual call would require Ollama running)
  const prompt = `Consciousness facets: W1: Spring of safety, F2: Flame of challenge.
  Distribution: W1:45%, F2:30%, A1:15%.
  Biosignals: arousal: moderate (0.65), HRV: low (35ms).
  Coherence: high (0.78).`;

  // Simulate network latency + processing time
  await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 100));

  // Mock embedding generation (256-dim random vector)
  const embedding = Array.from({ length: 256 }, () => Math.random());

  // L2 normalization
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  const normalized = embedding.map((val) => val / magnitude);
}

// ============================================================================
// BENCHMARK: VECTOR SIMILARITY SEARCH
// ============================================================================

async function benchmarkVectorSimilaritySearch(): Promise<void> {
  const client = await getClient();
  try {
    // Generate random query embedding
    const queryEmbedding = Array.from({ length: 256 }, () => Math.random());
    const magnitude = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
    const normalized = queryEmbedding.map((val) => val / magnitude);

    const embeddingStr = `[${normalized.join(',')}]`;

    await client.query(
      `SELECT
         cycle_id,
         coherence_score,
         (embedding <=> $1::vector) AS distance
       FROM consciousness_mycelium
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT 5`,
      [embeddingStr]
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// BENCHMARK: ANALYTICS VIEW QUERY
// ============================================================================

async function benchmarkAnalyticsViewQuery(): Promise<void> {
  const client = await getClient();
  try {
    await client.query(
      `SELECT
         facet_code,
         trace_count,
         avg_confidence,
         element
       FROM facet_trace_summary
       ORDER BY trace_count DESC
       LIMIT 15`
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// BENCHMARK: MYCELIAL GROWTH TIMELINE
// ============================================================================

async function benchmarkMycelialGrowthTimeline(): Promise<void> {
  const client = await getClient();
  try {
    await client.query(
      `SELECT
         day,
         cycle_count,
         mean_coherence,
         total_traces
       FROM mycelial_growth_timeline
       ORDER BY day DESC
       LIMIT 30`
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// BENCHMARK: COMPLEX JOIN (TRACES + BIOMARKERS)
// ============================================================================

async function benchmarkComplexJoin(): Promise<void> {
  const client = await getClient();
  try {
    await client.query(
      `SELECT
         t.facet,
         t.confidence,
         b.signal_type,
         AVG(b.value) AS avg_signal_value
       FROM consciousness_traces t
       LEFT JOIN consciousness_biomarkers b ON t.id = b.trace_id
       WHERE t.created_at >= NOW() - INTERVAL '24 hours'
       GROUP BY t.facet, t.confidence, b.signal_type
       LIMIT 100`
    );
  } finally {
    client.release();
  }
}

// ============================================================================
// MAIN BENCHMARK SUITE
// ============================================================================

async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║  MAIA-SOVEREIGN PERFORMANCE BENCHMARK SUITE                    ║
║  Phase 4.5: Mycelial Memory + Biosignal Integration            ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const results: BenchmarkResult[] = [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`\n${colors.magenta}DATABASE QUERIES${colors.reset}\n`);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const r1 = await benchmark('Trace Aggregation (24h window)', benchmarkTraceAggregation, 20);
  printResult(r1);
  results.push(r1);

  const r2 = await benchmark(
    'Biomarker Aggregation (24h window)',
    benchmarkBiomarkerAggregation,
    20
  );
  printResult(r2);
  results.push(r2);

  const r3 = await benchmark('Analytics View Query (facet_trace_summary)', benchmarkAnalyticsViewQuery, 20);
  printResult(r3);
  results.push(r3);

  const r4 = await benchmark(
    'Mycelial Growth Timeline Query',
    benchmarkMycelialGrowthTimeline,
    20
  );
  printResult(r4);
  results.push(r4);

  const r5 = await benchmark('Complex Join (Traces + Biomarkers)', benchmarkComplexJoin, 10);
  printResult(r5);
  results.push(r5);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`\n${colors.magenta}VECTOR OPERATIONS${colors.reset}\n`);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const r6 = await benchmark(
    'Vector Similarity Search (cosine distance)',
    benchmarkVectorSimilaritySearch,
    20
  );
  printResult(r6);
  results.push(r6);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`\n${colors.magenta}EMBEDDING GENERATION (MOCK)${colors.reset}\n`);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const r7 = await benchmark(
    'Ollama Embedding Generation (mock)',
    benchmarkEmbeddingGeneration,
    10
  );
  printResult(r7);
  results.push(r7);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`\n${colors.blue}━━━ SUMMARY ━━━${colors.reset}\n`);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log(`${'Benchmark'.padEnd(50)} ${'Avg Time'.padStart(12)}`);
  console.log('─'.repeat(64));

  for (const result of results) {
    const avgColor = result.avgMs < 50 ? colors.green : result.avgMs < 200 ? colors.yellow : colors.red;
    console.log(
      `${result.name.padEnd(50)} ${avgColor}${formatMs(result.avgMs).padStart(12)}${colors.reset}`
    );
  }

  console.log('\n');

  // Performance assessment
  const slowQueries = results.filter((r) => r.avgMs > 200);
  if (slowQueries.length === 0) {
    console.log(`${colors.green}✅ All benchmarks performed well (<200ms avg)${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  ${slowQueries.length} benchmark(s) >200ms avg:${colors.reset}`);
    for (const sq of slowQueries) {
      console.log(`   - ${sq.name}: ${formatMs(sq.avgMs)}`);
    }
  }

  console.log(`\n${colors.gray}Benchmark suite complete.${colors.reset}\n`);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch((err) => {
  console.error(`${colors.red}❌ Fatal error: ${err instanceof Error ? err.message : String(err)}${colors.reset}`);
  process.exit(1);
});
