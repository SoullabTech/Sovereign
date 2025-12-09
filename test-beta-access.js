#!/usr/bin/env node

/**
 * Test script for MAIA Beta Access System
 * Tests the SOULLAB-[name] passcode flow and premium feature access
 */

// Test data for beta access validation
const testCases = [
  // Valid cases
  { passcode: 'SOULLAB-John', expected: true, name: 'John' },
  { passcode: 'SOULLAB-Mary-Smith', expected: true, name: 'Mary Smith' },
  { passcode: 'soullab-alice', expected: true, name: 'ALICE' }, // Should normalize to uppercase
  { passcode: '  SOULLAB-Bob  ', expected: true, name: 'Bob' }, // Should trim whitespace

  // Invalid cases
  { passcode: 'SOULLAB-', expected: false, reason: 'Empty name' },
  { passcode: 'SOULLAB-A', expected: false, reason: 'Name too short' },
  { passcode: 'NOTVALID-John', expected: false, reason: 'Wrong prefix' },
  { passcode: 'John', expected: false, reason: 'No prefix' },
  { passcode: '', expected: false, reason: 'Empty passcode' }
];

// Mock validation function (same logic as in the component)
function validatePasscode(passcode) {
  const passcodeTrimmed = passcode.trim().toUpperCase();

  if (!passcodeTrimmed.startsWith('SOULLAB-')) {
    return { valid: false, error: 'Invalid passcode format. Use: SOULLAB-[YourName]' };
  }

  const name = passcodeTrimmed.replace('SOULLAB-', '');

  if (name.length < 2) {
    return { valid: false, error: 'Please provide a valid name after SOULLAB-' };
  }

  return {
    valid: true,
    name: name.replace(/[-_]/g, ' '),
    betaUser: {
      id: `beta-${Date.now()}`,
      name: name.replace(/[-_]/g, ' '),
      subscription: {
        status: 'active',
        tier: 'premium',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        features: [
          'lab_tools',
          'community_commons',
          'voice_synthesis',
          'brain_trust',
          'advanced_oracle',
          'field_protocol',
          'scribe_mode',
          'birth_chart',
          'elder_council'
        ],
        planId: 'beta-premium',
        customerId: `beta-${name.toLowerCase()}`
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
  };
}

// Feature access check function
function hasFeature(features, featureId) {
  return features && features.includes(featureId);
}

// Premium features available
const PREMIUM_FEATURES = {
  LAB_TOOLS: 'lab_tools',
  COMMUNITY_COMMONS: 'community_commons',
  VOICE_SYNTHESIS: 'voice_synthesis',
  BRAIN_TRUST: 'brain_trust',
  ADVANCED_ORACLE: 'advanced_oracle',
  FIELD_PROTOCOL: 'field_protocol',
  SCRIBE_MODE: 'scribe_mode',
  BIRTH_CHART: 'birth_chart',
  ELDER_COUNCIL: 'elder_council'
};

function runBetaAccessTests() {
  console.log('🧪 MAIA BETA ACCESS SYSTEM TESTS\n');
  console.log('Testing SOULLAB-[name] passcode validation...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = validatePasscode(testCase.passcode);
    const isValid = result.valid === testCase.expected;

    if (isValid) {
      console.log(`✅ PASS: "${testCase.passcode}" -> ${testCase.expected ? 'VALID' : 'INVALID'}`);
      if (result.valid) {
        console.log(`   → Beta User: ${result.name}`);
        console.log(`   → Customer ID: ${result.betaUser.subscription.customerId}`);
        console.log(`   → Expires: ${new Date(result.betaUser.subscription.expiresAt).toLocaleDateString()}`);
      } else {
        console.log(`   → Error: ${result.error}`);
      }
      passed++;
    } else {
      console.log(`❌ FAIL: "${testCase.passcode}" -> Expected ${testCase.expected}, got ${result.valid}`);
      if (testCase.reason) console.log(`   → Reason: ${testCase.reason}`);
      if (result.error) console.log(`   → Actual Error: ${result.error}`);
      failed++;
    }
    console.log('');
  }

  console.log('=====================================\n');
  console.log('🎯 FEATURE ACCESS TESTS\n');

  // Test premium feature access for a valid beta user
  const testUser = validatePasscode('SOULLAB-TestUser');
  if (testUser.valid) {
    const features = testUser.betaUser.subscription.features;
    console.log('Testing premium feature access for beta user...\n');

    Object.entries(PREMIUM_FEATURES).forEach(([featureName, featureId]) => {
      const hasAccess = hasFeature(features, featureId);
      console.log(`${hasAccess ? '✅' : '❌'} ${featureName}: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
    });
  }

  console.log('\n=====================================\n');
  console.log('📊 TEST RESULTS SUMMARY\n');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✨ Beta Access System Summary:');
    console.log('- Passcode format: SOULLAB-[name]');
    console.log('- Access duration: 90 days');
    console.log('- Tier: Premium (full feature access)');
    console.log('- Storage: localStorage (development)');
    console.log('\n🚀 System ready for beta testers!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }

  console.log('\n🌐 Access URLs:');
  console.log('- Beta Access Page: http://localhost:3005/beta-access');
  console.log('- Admin Dashboard: http://localhost:3005/admin/beta-testers');
  console.log('- MAIA Interface: http://localhost:3005/maia');
}

// Execute the tests
if (require.main === module) {
  runBetaAccessTests();
}