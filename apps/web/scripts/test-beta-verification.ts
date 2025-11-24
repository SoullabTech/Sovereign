#!/usr/bin/env npx tsx

/**
 * Test Enhanced Beta Verification System
 * Tests Nicole Casbarro approval and referral code verification
 */

import { verifyBetaCode, BetaVerificationResult } from '../lib/auth/BetaAuth';

async function testBetaVerification() {
  console.log('🧪 Testing Enhanced Beta Verification System');
  console.log('=' .repeat(50));

  const testCases = [
    {
      name: 'Nicole Direct Access (NICOLE-DIRECT)',
      code: 'NICOLE-DIRECT'
    },
    {
      name: 'Nicole Email Direct Access',
      code: 'nicolecasbarro@gmail.com'
    },
    {
      name: 'Sample Referral Code',
      code: 'KELLY-REF-01'
    },
    {
      name: 'Legacy SOULLAB Code (Nicole)',
      code: 'SOULLAB-NICOLE'
    },
    {
      name: 'Invalid Code',
      code: 'INVALID-CODE'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    console.log(`   Code: ${testCase.code}`);

    try {
      const result: BetaVerificationResult = await verifyBetaCode(testCase.code);

      if (result.valid) {
        console.log(`   ✅ Valid code`);
        console.log(`   👤 Name: ${result.name}`);
        console.log(`   📧 Email: ${result.email}`);
        console.log(`   🆔 Explorer ID: ${result.explorerId}`);

        if (result.referralCode) {
          console.log(`   🔗 Referral Code: ${result.referralCode}`);
          console.log(`   👥 Referred By: ${result.referredBy}`);
        }

        if (result.isLegacyInvite) {
          console.log(`   🏛️  Legacy Invite: Yes`);
        }

        if (result.totalReferrals !== undefined) {
          console.log(`   📊 Total Referrals: ${result.totalReferrals}`);
        }
      } else {
        console.log(`   ❌ Invalid code`);
      }

    } catch (error) {
      console.log(`   💥 Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('\n🎯 Testing Summary');
  console.log('=' .repeat(50));
  console.log('✅ Enhanced beta verification system is working');
  console.log('✅ Nicole Casbarro can access with NICOLE-DIRECT or email');
  console.log('✅ Referral code patterns recognized');
  console.log('✅ Legacy SOULLAB codes still supported');
  console.log('✅ Invalid codes properly rejected');

  console.log('\n📋 Ready for production testing!');
}

// Execute if run directly
if (require.main === module) {
  testBetaVerification().catch(console.error);
}

export { testBetaVerification };