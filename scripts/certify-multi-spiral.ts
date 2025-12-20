#!/usr/bin/env tsx
/**
 * Multi-Spiral State Certification Tests (MS1-MS5)
 *
 * These tests certify that the multi-spiral implementation prevents the two critical failure modes:
 * 1. "Spirals collapse into one" - Duplicate ranks, sorting instability
 * 2. "Prompt says top 3 but meta logs something else" - Contract drift
 *
 * Run: npx tsx scripts/certify-multi-spiral.ts
 */

import { SpiralStateService } from "../lib/consciousness/spiral/SpiralStateService";
import {
  SpiralState,
  normalizeActiveRanks,
  validateSpiralStates,
} from "../lib/consciousness/spiral/spiralStateUtils";
import { formatMultiSpiralState } from "../lib/consciousness/spiral/formatMultiSpiralState";

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, message: string) {
  if (condition) {
    console.log(`✅ ${testName}`);
    passCount++;
  } else {
    console.log(`❌ ${testName}: ${message}`);
    failCount++;
  }
}

function createTestSpiral(
  key: string,
  rank: number,
  active: boolean = true
): SpiralState {
  return {
    spiralKey: key,
    element: "Water",
    phase: 1,
    facet: "Water 1",
    arc: "dissolution",
    confidence: 0.8,
    source: "user_checkin",
    updatedAt: new Date().toISOString(),
    activeNow: active,
    priorityRank: rank,
  };
}

// MS1: No duplicate priorityRank among activeNow=true after any update
async function testMS1() {
  console.log("\n=== MS1: No Duplicate Priority Ranks ===");

  // Create test data with potential duplicates
  const spirals: SpiralState[] = [
    createTestSpiral("work", 1, true),
    createTestSpiral("relationship", 1, true), // DUPLICATE RANK
    createTestSpiral("health", 2, true),
  ];

  // Normalize should fix duplicates
  const normalized = normalizeActiveRanks(spirals);

  // Check for unique ranks
  const activeRanks = normalized
    .filter(s => s.activeNow)
    .map(s => s.priorityRank);

  const uniqueRanks = new Set(activeRanks);

  assert(
    activeRanks.length === uniqueRanks.size,
    "MS1: Normalization creates unique ranks",
    `Found duplicate ranks: ${activeRanks.join(", ")}`
  );

  // Check that ranks are contiguous (1, 2, 3, ...)
  const sortedRanks = [...activeRanks].sort((a, b) => a - b);
  const isContiguous = sortedRanks.every((rank, idx) => rank === idx + 1);

  assert(
    isContiguous,
    "MS1: Ranks are contiguous (1, 2, 3...)",
    `Ranks are not contiguous: ${sortedRanks.join(", ")}`
  );

  // Validation should pass
  const validation = validateSpiralStates(normalized);

  assert(
    validation.valid,
    "MS1: Validation passes after normalization",
    validation.errors.join(", ")
  );
}

// MS2: Sorted order stable (rank asc, updatedAt tie-break)
async function testMS2() {
  console.log("\n=== MS2: Stable Sorting Order ===");

  const now = Date.now();
  const spirals: SpiralState[] = [
    { ...createTestSpiral("work", 1, true), updatedAt: new Date(now - 3000).toISOString() },
    { ...createTestSpiral("relationship", 1, true), updatedAt: new Date(now - 1000).toISOString() }, // Same rank, newer
    { ...createTestSpiral("health", 2, true), updatedAt: new Date(now - 2000).toISOString() },
  ];

  const normalized = normalizeActiveRanks(spirals);

  // After normalization, the newer one should get rank 1, older gets rank 2
  const relationship = normalized.find(s => s.spiralKey === "relationship");
  const work = normalized.find(s => s.spiralKey === "work");

  assert(
    relationship!.priorityRank < work!.priorityRank,
    "MS2: Newer spiral wins tie-breaker",
    `relationship rank: ${relationship!.priorityRank}, work rank: ${work!.priorityRank}`
  );

  // Check that sorting is deterministic (run twice, should be identical)
  const normalized2 = normalizeActiveRanks(spirals);
  const keys1 = normalized.map(s => s.spiralKey).join(",");
  const keys2 = normalized2.map(s => s.spiralKey).join(",");

  assert(
    keys1 === keys2,
    "MS2: Sorting is deterministic",
    `First: ${keys1}, Second: ${keys2}`
  );
}

// MS3: spiralMeta.activeSpirals.length <= 3 and all activeNow=true
async function testMS3() {
  console.log("\n=== MS3: Top 3 Limit + Active Only ===");

  // Create 5 active spirals
  const spirals: SpiralState[] = [
    createTestSpiral("work", 1, true),
    createTestSpiral("relationship", 2, true),
    createTestSpiral("health", 3, true),
    createTestSpiral("money", 4, true),
    createTestSpiral("parenting", 5, true),
  ];

  const normalized = normalizeActiveRanks(spirals);
  const result = formatMultiSpiralState(normalized.filter(s => s.activeNow).slice(0, 3));

  assert(
    result.metadata.activeSpirals.length === 3,
    "MS3: Formatter returns exactly 3 spirals",
    `Got ${result.metadata.activeSpirals.length} spirals`
  );

  const allActive = result.metadata.activeSpirals.every(s => s.activeNow);

  assert(
    allActive,
    "MS3: All returned spirals have activeNow=true",
    "Some spirals have activeNow=false"
  );

  // Check that they're the top 3 by rank
  const ranks = result.metadata.activeSpirals.map(s => s.priorityRank);
  const isTop3 = ranks.every(r => r <= 3);

  assert(
    isTop3,
    "MS3: Returned spirals are top 3 by rank",
    `Ranks: ${ranks.join(", ")}`
  );
}

// MS4: Meta vs Injection drift-proof (single source of truth)
async function testMS4() {
  console.log("\n=== MS4: Prompt/Metadata Drift Prevention ===");

  const spirals: SpiralState[] = [
    createTestSpiral("work", 1, true),
    createTestSpiral("relationship", 2, true),
    createTestSpiral("health", 3, true),
  ];

  const normalized = normalizeActiveRanks(spirals);
  const activeSpirals = normalized.filter(s => s.activeNow).slice(0, 3);

  // Format using single source of truth
  const result = formatMultiSpiralState(activeSpirals);

  // Extract spiral keys from prompt text
  const promptLines = result.text.split("\n");
  const spiralLinesInPrompt = promptLines.filter(line => /^\d+\. \w+:/.test(line));

  // Extract spiral keys from metadata
  const metaKeys = result.metadata.activeSpirals.map(s => s.spiralKey).sort();

  // Extract spiral keys from prompt
  const promptKeys = spiralLinesInPrompt
    .map(line => line.match(/^\d+\. (\w+):/)?.[1])
    .filter(Boolean)
    .sort();

  assert(
    JSON.stringify(metaKeys) === JSON.stringify(promptKeys),
    "MS4: Prompt and metadata contain same spirals",
    `Meta: ${metaKeys.join(",")}, Prompt: ${promptKeys.join(",")}`
  );

  assert(
    result.metadata.activeSpirals.length === spiralLinesInPrompt.length,
    "MS4: Metadata count matches prompt count",
    `Meta: ${result.metadata.activeSpirals.length}, Prompt: ${spiralLinesInPrompt.length}`
  );

  // Verify metadata spirals are the exact instances passed to formatter
  assert(
    result.metadata.activeSpirals === activeSpirals ||
    result.metadata.activeSpirals.every((s, i) => s.spiralKey === activeSpirals[i].spiralKey),
    "MS4: Metadata uses same list passed to formatter",
    "Metadata diverged from input list"
  );
}

// MS5: Preserve behavior - update 3 spirals, untouched active spirals remain active
async function testMS5() {
  console.log("\n=== MS5: Preserve Untouched Spirals ===");

  const testUserId = `test_ms5_${Date.now()}`;

  try {
    // Initialize with 5 active spirals
    await SpiralStateService.updateSpiralStates(testUserId, [
      createTestSpiral("work", 1, true),
      createTestSpiral("relationship", 2, true),
      createTestSpiral("health", 3, true),
      createTestSpiral("money", 4, true),
      createTestSpiral("parenting", 5, true),
    ]);

    // Update only 2 spirals using preserve semantics
    await SpiralStateService.setActiveSpiralPrioritiesPreserve(testUserId, [
      { spiralKey: "work", priorityRank: 10 },
      { spiralKey: "health", priorityRank: 20 },
    ]);

    // Fetch result
    const state = await SpiralStateService.getSpiralStates(testUserId);

    // Check that untouched spirals are still active
    const relationship = state.spirals.find(s => s.spiralKey === "relationship");
    const money = state.spirals.find(s => s.spiralKey === "money");
    const parenting = state.spirals.find(s => s.spiralKey === "parenting");

    assert(
      relationship?.activeNow === true,
      "MS5: Untouched 'relationship' spiral remains active",
      `activeNow: ${relationship?.activeNow}`
    );

    assert(
      money?.activeNow === true,
      "MS5: Untouched 'money' spiral remains active",
      `activeNow: ${money?.activeNow}`
    );

    assert(
      parenting?.activeNow === true,
      "MS5: Untouched 'parenting' spiral remains active",
      `activeNow: ${parenting?.activeNow}`
    );

    // Check that all active spirals still have unique ranks
    const activeRanks = state.spirals
      .filter(s => s.activeNow)
      .map(s => s.priorityRank);

    const uniqueRanks = new Set(activeRanks);

    assert(
      activeRanks.length === uniqueRanks.size,
      "MS5: All active spirals have unique ranks after preserve update",
      `Ranks: ${activeRanks.join(", ")}`
    );

  } catch (error: any) {
    console.log(`❌ MS5: Test failed with error: ${error.message}`);
    failCount++;
  }
}

// Main test runner
async function runAllTests() {
  console.log("===========================================");
  console.log("Multi-Spiral State Certification (MS1-MS5)");
  console.log("===========================================");

  await testMS1();
  await testMS2();
  await testMS3();
  await testMS4();
  await testMS5();

  console.log("\n===========================================");
  console.log(`Results: ${passCount} passed, ${failCount} failed`);
  console.log("===========================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error("Fatal error during test execution:", error);
  process.exit(1);
});
