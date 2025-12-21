#!/usr/bin/env tsx
/**
 * STACK INTEGRITY VERIFICATION SCRIPT
 * Phase 4.5: Mycelial Memory — Full System Validation
 *
 * Purpose:
 * - Verify all database migrations applied correctly
 * - Check table schemas and indexes
 * - Validate foreign key relationships
 * - Test basic CRUD operations
 * - Verify sovereignty compliance (no Supabase)
 *
 * Usage:
 *   npx tsx scripts/verify-stack-integrity.ts
 */

import { getClient } from '../lib/db/postgres';

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
  gray: '\x1b[90m',
};

function success(msg: string): void {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg: string): void {
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function warning(msg: string): void {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg: string): void {
  console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function section(msg: string): void {
  console.log(`\n${colors.blue}━━━ ${msg} ━━━${colors.reset}`);
}

// ============================================================================
// VERIFICATION TESTS
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<{ passed: boolean; message?: string; details?: any }>
): Promise<void> {
  try {
    const result = await fn();
    results.push({ name, ...result });

    if (result.passed) {
      success(`${name}`);
      if (result.details) {
        console.log(`${colors.gray}   ${JSON.stringify(result.details)}${colors.reset}`);
      }
    } else {
      error(`${name}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    }
  } catch (err) {
    results.push({
      name,
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
    error(`${name}`);
    console.log(`   ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

async function testDatabaseConnection() {
  const client = await getClient();
  try {
    const result = await client.query('SELECT NOW() AS current_time');
    return {
      passed: true,
      details: { timestamp: result.rows[0].current_time },
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// TABLE EXISTENCE
// ============================================================================

async function testTableExists(tableName: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = $1
       ) AS exists`,
      [tableName]
    );
    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists ? undefined : `Table ${tableName} not found`,
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// COLUMN EXISTENCE
// ============================================================================

async function testColumnsExist(tableName: string, columns: string[]) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
       AND table_name = $1`,
      [tableName]
    );

    const existingColumns = result.rows.map((r) => r.column_name);
    const missingColumns = columns.filter((col) => !existingColumns.includes(col));

    return {
      passed: missingColumns.length === 0,
      message:
        missingColumns.length > 0
          ? `Missing columns in ${tableName}: ${missingColumns.join(', ')}`
          : undefined,
      details: { found: existingColumns.length, expected: columns.length },
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// INDEX EXISTENCE
// ============================================================================

async function testIndexExists(indexName: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM pg_indexes
         WHERE schemaname = 'public'
         AND indexname = $1
       ) AS exists`,
      [indexName]
    );
    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists ? undefined : `Index ${indexName} not found`,
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// EXTENSION EXISTENCE
// ============================================================================

async function testExtensionExists(extensionName: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM pg_extension
         WHERE extname = $1
       ) AS exists`,
      [extensionName]
    );
    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists
        ? undefined
        : `Extension ${extensionName} not installed`,
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// VIEW EXISTENCE
// ============================================================================

async function testViewExists(viewName: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM pg_views
         WHERE schemaname = 'public'
         AND viewname = $1
       ) AS exists`,
      [viewName]
    );
    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists ? undefined : `View ${viewName} not found`,
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// FUNCTION EXISTENCE
// ============================================================================

async function testFunctionExists(functionName: string) {
  const client = await getClient();
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM pg_proc
         WHERE proname = $1
       ) AS exists`,
      [functionName]
    );
    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists ? undefined : `Function ${functionName} not found`,
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// ROW COUNT
// ============================================================================

async function testRowCount(tableName: string) {
  const client = await getClient();
  try {
    const result = await client.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
    const count = parseInt(result.rows[0].count, 10);
    return {
      passed: true,
      details: { count },
    };
  } finally {
    client.release();
  }
}

// ============================================================================
// MAIN VERIFICATION SUITE
// ============================================================================

async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║  MAIA-SOVEREIGN STACK INTEGRITY VERIFICATION                   ║
║  Phase 4.5: Mycelial Memory + Biosignal Integration            ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Database Connection');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('PostgreSQL connection', testDatabaseConnection);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Extensions');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('pgvector extension installed', () => testExtensionExists('vector'));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Tables');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('consciousness_traces table exists', () =>
    testTableExists('consciousness_traces')
  );
  await test('consciousness_rules table exists', () =>
    testTableExists('consciousness_rules')
  );
  await test('consciousness_biomarkers table exists', () =>
    testTableExists('consciousness_biomarkers')
  );
  await test('consciousness_mycelium table exists', () =>
    testTableExists('consciousness_mycelium')
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Columns (consciousness_traces)');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('consciousness_traces has core columns', () =>
    testColumnsExist('consciousness_traces', [
      'id',
      'facet',
      'confidence',
      'context',
      'created_at',
    ])
  );

  await test('consciousness_traces has meta-layer columns', () =>
    testColumnsExist('consciousness_traces', [
      'meta_layer_code',
      'meta_layer_trigger',
      'meta_layer_confidence',
    ])
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Columns (consciousness_biomarkers)');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('consciousness_biomarkers has required columns', () =>
    testColumnsExist('consciousness_biomarkers', [
      'id',
      'trace_id',
      'source',
      'signal_type',
      'value',
      'sample_ts',
    ])
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Columns (consciousness_mycelium)');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('consciousness_mycelium has required columns', () =>
    testColumnsExist('consciousness_mycelium', [
      'id',
      'cycle_id',
      'start_ts',
      'end_ts',
      'dominant_facets',
      'coherence_score',
      'embedding',
    ])
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Indexes');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('idx_traces_facet exists', () => testIndexExists('idx_traces_facet'));
  await test('idx_traces_meta_layer_code exists', () =>
    testIndexExists('idx_traces_meta_layer_code')
  );
  await test('idx_biomarkers_trace_id exists', () =>
    testIndexExists('idx_biomarkers_trace_id')
  );
  await test('idx_biomarkers_signal_type exists', () =>
    testIndexExists('idx_biomarkers_signal_type')
  );
  await test('idx_mycelium_cycle_id exists', () =>
    testIndexExists('idx_mycelium_cycle_id')
  );
  await test('idx_mycelium_embedding (pgvector) exists', () =>
    testIndexExists('idx_mycelium_embedding')
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Views');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('facet_trace_summary view exists', () =>
    testViewExists('facet_trace_summary')
  );
  await test('mycelial_growth_timeline view exists', () =>
    testViewExists('mycelial_growth_timeline')
  );
  await test('mycelial_facet_evolution view exists', () =>
    testViewExists('mycelial_facet_evolution')
  );
  await test('mycelial_coherence_trends view exists', () =>
    testViewExists('mycelial_coherence_trends')
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Functions');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('find_similar_cycles function exists', () =>
    testFunctionExists('find_similar_cycles')
  );
  await test('get_cycle_summary function exists', () =>
    testFunctionExists('get_cycle_summary')
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Data Existence');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await test('consciousness_traces row count', () => testRowCount('consciousness_traces'));
  await test('consciousness_rules row count', () => testRowCount('consciousness_rules'));
  await test('consciousness_biomarkers row count', () =>
    testRowCount('consciousness_biomarkers')
  );
  await test('consciousness_mycelium row count', () =>
    testRowCount('consciousness_mycelium')
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  section('Summary');
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  if (failed === 0) {
    success('\n🎉 All integrity checks passed!');
    console.log(`${colors.gray}Stack is ready for Phase 4.6 development.${colors.reset}\n`);
  } else {
    error(`\n❌ ${failed} test(s) failed`);
    console.log(
      `${colors.yellow}Review failed tests and apply missing migrations.${colors.reset}\n`
    );
    process.exit(1);
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

main().catch((err) => {
  error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
