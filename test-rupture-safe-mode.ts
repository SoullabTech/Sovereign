// Test rupture detection in SAFE MODE to bypass Ollama performance issues
// This tests if the rupture detection middleware itself is working

const TEST_ENDPOINT = 'http://localhost:3001/api/between/chat';

interface TestCase {
  name: string;
  message: string;
  expectRupture: boolean;
  expectedType?: string;
}

const testCases: TestCase[] = [
  {
    name: 'Normal Message (should NOT trigger rupture)',
    message: 'Hi, how are you today?',
    expectRupture: false
  },
  {
    name: 'Explicit Anger Trigger',
    message: 'This is fucked up. You are giving me clinical bullshit.',
    expectRupture: true,
    expectedType: 'explicit-anger'
  },
  {
    name: 'Withdrawal Pattern',
    message: 'Never mind, forget it.',
    expectRupture: true,
    expectedType: 'withdrawal'
  }
];

async function testRuptureDetection(testCase: TestCase): Promise<void> {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`💬 Message: "${testCase.message}"`);

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(TEST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-maia-safe-mode': 'true' // Force safe mode
      },
      body: JSON.stringify({
        message: testCase.message,
        sessionId: `test-safe-${Date.now()}-${Math.random()}`
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if we're in safe mode
    if (data.route?.safeMode) {
      console.log(`✅ Safe mode confirmed: ${data.route.mode}`);
    } else {
      console.log(`⚠️  Safe mode not detected`);
    }

    // Check if rupture detection metadata exists
    const ruptureData = data.metadata?.ruptureDetection;

    if (ruptureData) {
      console.log(`🔍 Rupture Detection Result:`);
      console.log(`   - Detected: ${ruptureData.detected}`);
      console.log(`   - Type: ${ruptureData.type}`);
      console.log(`   - Confidence: ${(ruptureData.confidence * 100).toFixed(1)}%`);
      console.log(`   - Enhanced: ${ruptureData.enhanced ? 'Yes' : 'No'}`);

      // Validate expectations
      if (testCase.expectRupture === ruptureData.detected) {
        console.log(`✅ PASS: Rupture detection matches expectation`);

        if (testCase.expectedType && ruptureData.type === testCase.expectedType) {
          console.log(`✅ PASS: Correct rupture type detected`);
        } else if (testCase.expectedType) {
          console.log(`⚠️  Expected ${testCase.expectedType}, got ${ruptureData.type}`);
        }
      } else {
        console.log(`❌ FAIL: Expected rupture=${testCase.expectRupture}, got=${ruptureData.detected}`);
      }
    } else {
      if (testCase.expectRupture) {
        console.log(`❌ FAIL: Expected rupture detection but no metadata found`);
      } else {
        console.log(`✅ PASS: No rupture detected (as expected)`);
      }
    }

    // Show response preview
    const preview = data.message?.substring(0, 150) + (data.message?.length > 150 ? '...' : '');
    console.log(`💬 Response Preview: "${preview}"`);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Failed after: ${responseTime}ms`);

    if (error.name === 'AbortError') {
      console.error(`⏰ TIMEOUT: Request took longer than 15 seconds`);
    } else {
      console.error(`❌ Test Error:`, error.message);
    }
  }
}

async function runTests(): Promise<void> {
  console.log('🚀 Testing Rupture Detection Integration (Safe Mode)\n');
  console.log(`📍 Testing endpoint: ${TEST_ENDPOINT}`);
  console.log(`🛡️  Using safe mode to bypass Ollama performance issues\n`);

  for (const testCase of testCases) {
    await testRuptureDetection(testCase);
    console.log('─'.repeat(80));
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Check that normal messages do NOT trigger rupture detection');
  console.log('- Check that anger/withdrawal messages DO trigger detection');
  console.log('- Check that metadata includes detection results');
  console.log('- Verify safe mode bypasses Ollama performance issues');
}

// Run the tests
runTests().catch(console.error);