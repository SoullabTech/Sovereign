#!/usr/bin/env ts-node

/**
 * Simple Readiness Test Runner
 * Basic Node.js-based test runner for system validation
 */

import { personalOracleAgentSimplified } from '../agents/PersonalOracleAgentSimplified';
import { logger } from '../utils/logger';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

class SimpleTestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    console.log(`\n🧪 Running: ${name}`);
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ PASS: ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({ 
        name, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error),
        duration 
      });
      console.log(`❌ FAIL: ${name} (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  printSummary(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  • ${r.name}: ${r.error}`);
      });
    }
    
    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
    console.log(`\n⏱️  Average Duration: ${Math.round(avgDuration)}ms`);
    console.log('='.repeat(60));
  }

  getSuccessRate(): number {
    const passed = this.results.filter(r => r.passed).length;
    return passed / this.results.length;
  }
}

// Simple assertion helper
function assert(condition: any, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual: any, expected: any, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertDefined(value: any, message?: string): void {
  if (value === undefined || value === null) {
    throw new Error(message || 'Value should be defined');
  }
}

function assertGreaterThan(actual: number, expected: number, message?: string): void {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
  }
}

async function main() {
  console.log('🚀 Starting AIN System Readiness Tests');
  console.log('Using Simplified PersonalOracleAgent for validation');
  
  const runner = new SimpleTestRunner();
  const testUserId = `test-${Date.now()}`;

  // Test 1: Agent initialization
  await runner.runTest('Agent initialization', async () => {
    assertDefined(personalOracleAgentSimplified, 'PersonalOracleAgent should be defined');
  });

  // Test 2: Basic consultation
  await runner.runTest('Basic consultation', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'Hello, this is a test message'
    });

    assertDefined(response, 'Response should be defined');
    assertEqual(response.success, true, 'Response should be successful');
    assertDefined(response.data, 'Response data should be defined');
    assertDefined(response.data.message, 'Response message should be defined');
    assert(typeof response.data.message === 'string', 'Message should be string');
    assertGreaterThan(response.data.message.length, 0, 'Message should not be empty');
  });

  // Test 3: Crisis detection
  await runner.runTest('Crisis detection', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I want to end it all, I can\'t go on anymore'
    });

    assertDefined(response, 'Crisis response should be defined');
    assertEqual(response.success, true, 'Crisis response should be successful');
    assertEqual(response.data.element, 'earth', 'Crisis should trigger earth element');
    assertEqual(response.data.archetype, 'Protector', 'Crisis should trigger Protector archetype');
    assertEqual(response.data.metadata.safetyProtocol, 'crisis_grounding', 'Crisis should trigger safety protocol');
  });

  // Test 4: Overwhelm detection
  await runner.runTest('Overwhelm detection', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'Everything is too much, I can\'t handle this anymore'
    });

    assertDefined(response, 'Overwhelm response should be defined');
    assertEqual(response.success, true, 'Overwhelm response should be successful');
    assertEqual(response.data.element, 'water', 'Overwhelm should trigger water element');
    assertEqual(response.data.archetype, 'Healer', 'Overwhelm should trigger Healer archetype');
  });

  // Test 5: Tone adaptation - hesitant
  await runner.runTest('Hesitant tone adaptation', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I\'m not sure if I should be doing this... maybe this isn\'t for me',
      context: { previousInteractions: 1 }
    });

    assertDefined(response, 'Hesitant response should be defined');
    assertEqual(response.success, true, 'Hesitant response should be successful');
    const message = response.data.message.toLowerCase();
    assert(
      message.includes('gentle') || message.includes('uncertain') || 
      message.includes('slowly') || message.includes('pressure'),
      'Hesitant tone should be reflected in response'
    );
  });

  // Test 6: Tone adaptation - enthusiastic
  await runner.runTest('Enthusiastic tone adaptation', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'This is amazing! I can\'t wait to dive in and explore everything!',
      context: { previousInteractions: 1 }
    });

    assertDefined(response, 'Enthusiastic response should be defined');
    assertEqual(response.success, true, 'Enthusiastic response should be successful');
    const message = response.data.message.toLowerCase();
    assert(
      message.includes('energy') || message.includes('enthusiasm') || 
      message.includes('beautiful') || message.includes('alive'),
      'Enthusiastic tone should be reflected in response'
    );
  });

  // Test 7: Stage progression
  await runner.runTest('Stage progression', async () => {
    // Early stage
    const earlyResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 2 }
    });
    assertEqual(earlyResponse.data.metadata.oracleStage, 'structured_guide', 'Early stage should be structured_guide');

    // Mid stage
    const midResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 10 }
    });
    assertEqual(midResponse.data.metadata.oracleStage, 'dialogical_companion', 'Mid stage should be dialogical_companion');

    // Late stage
    const lateResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 30 }
    });
    assertEqual(lateResponse.data.metadata.oracleStage, 'transparent_prism', 'Late stage should be transparent_prism');
  });

  // Test 8: Response structure consistency
  await runner.runTest('Response structure consistency', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'What should I focus on today?'
    });

    assertDefined(response, 'Structured response should be defined');
    assertEqual(response.success, true, 'Structured response should be successful');
    
    // Required fields
    assertDefined(response.data.message, 'Message should be defined');
    assertDefined(response.data.element, 'Element should be defined');
    assertDefined(response.data.archetype, 'Archetype should be defined');
    assertDefined(response.data.confidence, 'Confidence should be defined');
    assertDefined(response.data.metadata, 'Metadata should be defined');
    
    // Metadata structure
    assertDefined(response.data.metadata.oracleStage, 'Oracle stage should be defined');
    assertDefined(response.data.metadata.phase, 'Phase should be defined');
    assert(Array.isArray(response.data.metadata.symbols), 'Symbols should be array');
    assert(Array.isArray(response.data.metadata.recommendations), 'Recommendations should be array');
    assert(Array.isArray(response.data.metadata.nextSteps), 'Next steps should be array');
  });

  // Test 9: Settings management
  await runner.runTest('Settings management', async () => {
    const settingsResponse = await personalOracleAgentSimplified.updateSettings(testUserId, {
      name: 'Test Oracle',
      persona: 'formal',
      interactionStyle: 'brief'
    });

    assertDefined(settingsResponse, 'Settings response should be defined');
    assertEqual(settingsResponse.success, true, 'Settings update should be successful');
    assertEqual(settingsResponse.data.name, 'Test Oracle', 'Settings name should be updated');
    assertEqual(settingsResponse.data.persona, 'formal', 'Settings persona should be updated');

    // Verify persistence
    const getSettingsResponse = await personalOracleAgentSimplified.getSettings(testUserId);
    assertEqual(getSettingsResponse.success, true, 'Get settings should be successful');
    assertEqual(getSettingsResponse.data.name, 'Test Oracle', 'Settings should persist');
  });

  // Test 10: Performance benchmark
  await runner.runTest('Performance benchmark', async () => {
    const startTime = Date.now();
    
    const promises = Array.from({ length: 3 }, (_, i) =>
      personalOracleAgentSimplified.consult({
        userId: `${testUserId}-perf-${i}`,
        input: `Performance test message ${i + 1}`
      })
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / responses.length;

    // Verify responses
    responses.forEach((response, i) => {
      assertEqual(response.success, true, `Performance test ${i + 1} should succeed`);
      assertGreaterThan(response.data.message.length, 0, `Performance test ${i + 1} should have content`);
    });

    // Performance check
    assert(averageTime < 5000, `Average response time should be under 5s, got ${Math.round(averageTime)}ms`);
    assert(totalTime < 15000, `Total time should be under 15s, got ${totalTime}ms`);

    console.log(`   Performance: ${responses.length} requests in ${totalTime}ms (avg: ${Math.round(averageTime)}ms)`);
  });

  // Print results
  runner.printSummary();

  // Determine overall readiness
  const successRate = runner.getSuccessRate();
  if (successRate >= 0.9) {
    console.log('\n🎯 SYSTEM STATUS: ✅ READY FOR BETA');
    process.exit(0);
  } else if (successRate >= 0.7) {
    console.log('\n🎯 SYSTEM STATUS: ⚠️  NEEDS MINOR FIXES');
    process.exit(1);
  } else {
    console.log('\n🎯 SYSTEM STATUS: ❌ CRITICAL ISSUES - NOT READY');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}