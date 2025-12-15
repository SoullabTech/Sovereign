// Unit tests for rupture detection middleware
// Tests the core logic without requiring server connectivity

import { ruptureDetectionService } from './lib/consultation/rupture-detection-middleware';

console.log('🧪 Unit Testing Rupture Detection Logic...\n');

interface TestCase {
  name: string;
  message: string;
  expectRupture: boolean;
  expectedType?: string;
  expectedConfidence?: number;
}

const testCases: TestCase[] = [
  {
    name: 'Explicit Anger - "this is fucked up"',
    message: 'This is fucked up. You\'re giving me clinical bullshit when I needed something real.',
    expectRupture: true,
    expectedType: 'explicit-anger',
    expectedConfidence: 0.95
  },
  {
    name: 'Explicit Anger - "this is bullshit"',
    message: 'This is bullshit and not helping at all.',
    expectRupture: true,
    expectedType: 'explicit-anger',
    expectedConfidence: 0.95
  },
  {
    name: 'Misattunement - "you don\'t understand"',
    message: 'You don\'t understand what I\'m saying. That\'s not what I meant at all.',
    expectRupture: true,
    expectedType: 'misattunement',
    expectedConfidence: 0.85
  },
  {
    name: 'Withdrawal - "never mind"',
    message: 'Never mind, forget it. This isn\'t working.',
    expectRupture: true,
    expectedType: 'withdrawal',
    expectedConfidence: 0.90
  },
  {
    name: 'Invalidation - "that\'s not helpful"',
    message: 'That\'s not helpful at all. That makes it worse.',
    expectRupture: true,
    expectedType: 'invalidation',
    expectedConfidence: 0.80
  },
  {
    name: 'Subtle Withdrawal - "whatever"',
    message: 'Whatever you think is best I guess.',
    expectRupture: true,
    expectedType: 'withdrawal',
    expectedConfidence: 0.60
  },
  {
    name: 'Normal Message (No Rupture)',
    message: 'Hello Maia, I\'d like to talk about my day.',
    expectRupture: false
  },
  {
    name: 'Positive Message (No Rupture)',
    message: 'Thank you, that really helps me understand.',
    expectRupture: false
  }
];

function runTest(testCase: TestCase): boolean {
  console.log(`📋 Testing: ${testCase.name}`);
  console.log(`💬 Message: "${testCase.message}"`);

  const result = ruptureDetectionService.detectRupture(testCase.message);

  console.log(`🔍 Detection Result:`, {
    detected: result.ruptureDetected,
    type: result.ruptureType,
    confidence: (result.confidence * 100).toFixed(1) + '%',
    patterns: result.patterns
  });

  // Validate expectations
  let passed = true;

  if (result.ruptureDetected !== testCase.expectRupture) {
    console.log(`❌ FAIL: Expected rupture=${testCase.expectRupture}, got=${result.ruptureDetected}`);
    passed = false;
  }

  if (testCase.expectRupture && testCase.expectedType && result.ruptureType !== testCase.expectedType) {
    console.log(`❌ FAIL: Expected type=${testCase.expectedType}, got=${result.ruptureType}`);
    passed = false;
  }

  if (testCase.expectRupture && testCase.expectedConfidence && result.confidence !== testCase.expectedConfidence) {
    console.log(`❌ FAIL: Expected confidence=${testCase.expectedConfidence}, got=${result.confidence}`);
    passed = false;
  }

  if (testCase.expectRupture && result.patterns.length === 0) {
    console.log(`❌ FAIL: Expected patterns to be detected, got none`);
    passed = false;
  }

  if (passed) {
    console.log(`✅ PASS: Detection logic working correctly`);
  }

  return passed;
}

async function runAllTests(): Promise<void> {
  console.log(`🚀 Starting ${testCases.length} rupture detection unit tests...\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log('─'.repeat(80) + '\n');
  }

  console.log('🎯 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All rupture detection unit tests passed!');
    console.log('✅ Rupture detection logic is working correctly');
    console.log('✅ Pattern matching is functioning as expected');
    console.log('✅ Confidence scoring is accurate');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed - review detection logic`);
  }
}

// Run the tests
runAllTests().catch(console.error);