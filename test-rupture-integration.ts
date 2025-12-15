// Test script for rupture detection integration
// This tests the full Claude consultation + rupture repair pipeline

console.log('🔍 Testing Rupture Detection + Claude Consultation Integration...\n');

const TEST_ENDPOINT = 'http://localhost:3001/api/between/chat';

interface TestCase {
  name: string;
  message: string;
  expectRupture: boolean;
  expectedType?: string;
}

const testCases: TestCase[] = [
  {
    name: 'Explicit Anger Trigger',
    message: 'This is fucked up. You\'re giving me clinical bullshit when I needed something real.',
    expectRupture: true,
    expectedType: 'explicit-anger'
  },
  {
    name: 'Misattunement Pattern',
    message: 'You don\'t understand what I\'m saying. That\'s not what I meant at all.',
    expectRupture: true,
    expectedType: 'misattunement'
  },
  {
    name: 'Withdrawal Pattern',
    message: 'Never mind, forget it. This isn\'t working.',
    expectRupture: true,
    expectedType: 'withdrawal'
  },
  {
    name: 'Invalidation Pattern',
    message: 'That\'s not helpful at all. That makes it worse.',
    expectRupture: true,
    expectedType: 'invalidation'
  },
  {
    name: 'Normal Message (No Rupture)',
    message: 'Hello Maia, I\'d like to talk about my day.',
    expectRupture: false
  }
];

async function runTest(testCase: TestCase): Promise<void> {
  console.log(`\n📋 Testing: ${testCase.name}`);
  console.log(`💬 Message: "${testCase.message}"`);

  try {
    const response = await fetch(TEST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testCase.message,
        sessionId: `test-${Date.now()}`
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`\n✅ Response received (${data.message.length} chars)`);

    // Check rupture detection metadata
    const ruptureData = data.metadata?.ruptureDetection;
    if (ruptureData) {
      console.log(`🔍 Rupture Detected:`, {
        type: ruptureData.type,
        confidence: (ruptureData.confidence * 100).toFixed(1) + '%',
        enhanced: ruptureData.enhanced ? 'Yes' : 'No'
      });

      if (testCase.expectRupture) {
        if (testCase.expectedType && ruptureData.type === testCase.expectedType) {
          console.log(`✅ Correct rupture type detected: ${testCase.expectedType}`);
        } else if (testCase.expectedType) {
          console.log(`⚠️  Expected ${testCase.expectedType}, got ${ruptureData.type}`);
        }

        if (ruptureData.enhanced) {
          console.log(`✨ Claude consultation was used for repair enhancement`);
        } else {
          console.log(`⚠️  No consultation enhancement applied`);
        }
      } else {
        console.log(`⚠️  Unexpected rupture detection on normal message`);
      }
    } else {
      if (testCase.expectRupture) {
        console.log(`❌ Expected rupture detection but none found`);
      } else {
        console.log(`✅ No rupture detected (as expected)`);
      }
    }

    // Show first 200 chars of response
    const preview = data.message.substring(0, 200) + (data.message.length > 200 ? '...' : '');
    console.log(`\n💬 MAIA Response Preview:`);
    console.log(`"${preview}"`);

  } catch (error) {
    console.error(`❌ Test failed:`, error);
  }
}

async function runAllTests(): Promise<void> {
  console.log(`🚀 Starting ${testCases.length} rupture detection tests...\n`);

  for (const testCase of testCases) {
    await runTest(testCase);
    console.log('\n' + '─'.repeat(80));
  }

  console.log('\n🎯 All tests completed!');
  console.log('\n📊 Check the console logs above for:');
  console.log('   - Rupture detection accuracy');
  console.log('   - Claude consultation usage');
  console.log('   - Response enhancement quality');
  console.log('   - Training data logging');
}

// Run the tests
runAllTests().catch(console.error);