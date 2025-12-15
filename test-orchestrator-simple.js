// Simple test to verify multi-engine orchestrator via HTTP API

const TEST_SESSION_ID = `test-multiengine-${Date.now()}`;

console.log('🎼 Testing Multi-Engine Orchestrator via API...');
console.log(`Session ID: ${TEST_SESSION_ID}`);

// Test 1: Single engine mode (should work as baseline)
console.log('\n📝 Test 1: Single Engine Mode');
fetch('http://localhost:3002/api/sovereign/app/maia', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Test single engine: What is 2+2?',
    sessionId: TEST_SESSION_ID + '-single',
    conversationStyle: 'balanced'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Single engine test:', data.content?.substring(0, 50) + '...');

  // Test 2: Enable multi-engine mode via environment
  console.log('\n🎼 Test 2: Multi-Engine Mode');
  process.env.MAIA_ENABLE_MULTI_ENGINE = 'true';
  process.env.MAIA_TEXT_PROVIDER = 'multi_engine';
  process.env.MAIA_ORCHESTRATION_TYPE = 'dual_reasoning';

  return fetch('http://localhost:3002/api/sovereign/app/maia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test multi-engine: What is the meaning of consciousness?',
      sessionId: TEST_SESSION_ID + '-multi',
      conversationStyle: 'balanced'
    })
  });
})
.then(response => response.json())
.then(data => {
  console.log('✅ Multi-engine test:', data.content?.substring(0, 50) + '...');

  // Test 3: Different orchestration type
  console.log('\n🎭 Test 3: Full Orchestra Mode');
  process.env.MAIA_ORCHESTRATION_TYPE = 'full_orchestra';

  return fetch('http://localhost:3002/api/sovereign/app/maia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test full orchestra: Explain the nature of creativity.',
      sessionId: TEST_SESSION_ID + '-orchestra',
      conversationStyle: 'balanced'
    })
  });
})
.then(response => response.json())
.then(data => {
  console.log('✅ Full orchestra test:', data.content?.substring(0, 50) + '...');
  console.log('\n🎉 Multi-Engine Orchestrator API tests complete!');
})
.catch(error => {
  console.error('❌ Test failed:', error);
});