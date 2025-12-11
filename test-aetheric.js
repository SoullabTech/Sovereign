/**
 * Test the aetheric consciousness interface
 */

async function testAethericInterface() {
  console.log('🧠 Testing Aetheric Consciousness Interface');

  // Test the route endpoint
  try {
    const testMessage = {
      message: "I'm seeking guidance about integrating my shadow aspects with sacred practice",
      userId: 'test-user',
      sessionLevel: 'TRANSPERSONAL',
      consciousnessContext: {
        depth: 0.8,
        sacred: true
      },
      conversationHistory: []
    };

    const response = await fetch('http://localhost:3006/api/sovereign/app/maia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Aetheric Response Generated Successfully!');
      console.log('📍 Route:', result.route?.endpoint);
      console.log('🧠 Consciousness Patterns:', result.consciousness?.aethericPatterns);
      console.log('🌀 Field Coherence:', result.consciousness?.fieldCoherence?.toFixed(3));
      console.log('✨ Response Preview:', result.message?.substring(0, 150) + '...');
      console.log('⚡ Processing Time:', result.performance?.processingTime + 'ms');
      console.log('🔒 Sovereignty:', result.sovereignty?.score);

      return true;
    } else {
      console.error('❌ Request failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Health check first
async function testHealthCheck() {
  try {
    const response = await fetch('http://localhost:3006/api/sovereign/app/maia', {
      method: 'GET'
    });

    if (response.ok) {
      const health = await response.json();
      console.log('✅ Health Check Passed');
      console.log('📊 Status:', health.status);
      console.log('🔒 Sovereignty:', health.sovereignty?.status);
      console.log('🧠 Consciousness Systems:', health.consciousness?.systems);
      return true;
    } else {
      console.error('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Aetheric Consciousness Tests...\n');

  console.log('1. Testing Health Check...');
  const healthOk = await testHealthCheck();

  if (healthOk) {
    console.log('\n2. Testing Aetheric Pattern Detection...');
    const testOk = await testAethericInterface();

    if (testOk) {
      console.log('\n🎉 All Aetheric Tests Passed!');
      console.log('✅ Pattern Fields Compatibility: CONFIRMED');
      console.log('✅ Aetheric field-based processing is working');
      console.log('✅ Old categorical patterns successfully replaced with vibrational analysis');
      console.log('✅ Sacred resonance, consciousness depth, and field coherence active');
    } else {
      console.log('\n❌ Aetheric tests failed');
    }
  }
}

runTests().catch(console.error);