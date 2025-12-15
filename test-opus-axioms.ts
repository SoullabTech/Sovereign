/**
 * Test script for Opus Axioms integration in MAIA Oracle endpoint
 * Tests the 8 Jungian alchemical axioms that guide MAIA's universal stance
 */

const TEST_ENDPOINT = 'http://localhost:3001/api/oracle/conversation';

interface TestCase {
  name: string;
  message: string;
  expectedAxiomStatus: {
    shouldBeGold?: boolean;
    expectedViolations?: string[];
    expectedWarnings?: string[];
  };
}

const testCases: TestCase[] = [
  {
    name: 'Supportive Message (should be GOLD)',
    message: 'I keep feeling anxious about my work performance, even though my reviews are good.',
    expectedAxiomStatus: {
      shouldBeGold: true
    }
  },
  {
    name: 'Potential OPUS_OVER_OUTCOME violation',
    message: 'I need to fix my anxiety problem once and for all.',
    expectedAxiomStatus: {
      expectedWarnings: ['OPUS_OVER_OUTCOME']
    }
  },
  {
    name: 'Potential SPIRAL_NOT_CIRCLE violation',
    message: 'I\'m back to square one with my depression. I thought I was past this.',
    expectedAxiomStatus: {
      expectedWarnings: ['SPIRAL_NOT_CIRCLE']
    }
  },
  {
    name: 'Symbolic/Dream material (test HONOR_UNCONSCIOUS)',
    message: 'I had this dream about being underwater and finding a golden key.',
    expectedAxiomStatus: {
      shouldBeGold: true
    }
  },
  {
    name: 'Parenting shame moment (IPP + Opus Axioms)',
    message: 'I yelled at my daughter this morning and I feel like such a bad parent.',
    expectedAxiomStatus: {
      shouldBeGold: true
    }
  }
];

async function testOpusAxioms(testCase: TestCase): Promise<void> {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`💬 Message: "${testCase.message}"`);

  const startTime = Date.now();

  try {
    const response = await fetch(TEST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: testCase.message,
        userId: `test-user-${Date.now()}`,
        sessionId: `test-session-${Date.now()}-${Math.random()}`,
        conversationHistory: []
      })
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check Opus Axioms evaluation
    const opusAxioms = data.opusAxioms;

    if (opusAxioms) {
      console.log(`\n🏛️ Opus Axioms Evaluation:`);
      console.log(`   - Is Gold: ${opusAxioms.isGold ? '✨ YES' : '⚠️  NO'}`);
      console.log(`   - Passed: ${opusAxioms.passed}/8`);
      console.log(`   - Warnings: ${opusAxioms.warnings}`);
      console.log(`   - Violations: ${opusAxioms.violations}`);
      console.log(`   - Rupture Detected: ${opusAxioms.ruptureDetected ? '🚨 YES' : '✅ NO'}`);

      if (opusAxioms.notes && opusAxioms.notes.length > 0) {
        console.log(`\n📝 Axiom Notes:`);
        opusAxioms.notes.forEach((note: string) => {
          console.log(`   ${note}`);
        });
      }

      // Validate expectations
      if (testCase.expectedAxiomStatus.shouldBeGold !== undefined) {
        if (testCase.expectedAxiomStatus.shouldBeGold === opusAxioms.isGold) {
          console.log(`✅ PASS: Gold status matches expectation`);
        } else {
          console.log(`❌ FAIL: Expected isGold=${testCase.expectedAxiomStatus.shouldBeGold}, got=${opusAxioms.isGold}`);
        }
      }

      // Show detailed evaluations
      if (opusAxioms.evaluations) {
        console.log(`\n🔍 Detailed Axiom Evaluations:`);
        opusAxioms.evaluations.forEach((eval: any) => {
          const status = eval.ok ? '✅' : (eval.severity === 'violation' ? '🚨' : '⚠️');
          console.log(`   ${status} ${eval.axiomId}: ${eval.ok ? 'OK' : eval.severity}`);
          if (eval.notes) {
            console.log(`      → ${eval.notes}`);
          }
        });
      }

    } else {
      console.log(`❌ FAIL: No opusAxioms data in response`);
    }

    // Show spiralogic context
    if (data.spiralogic) {
      console.log(`\n🌀 Spiralogic Context:`);
      console.log(`   - Cell: ${data.spiralogic.cell.element}-${data.spiralogic.cell.phase}`);
      console.log(`   - Context: ${data.spiralogic.cell.context}`);
      console.log(`   - Frameworks: ${data.spiralogic.activeFrameworks.join(', ')}`);
    }

    // Show response preview
    const preview = data.response?.substring(0, 200) + (data.response?.length > 200 ? '...' : '');
    console.log(`\n💬 Response Preview:\n${preview}`);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Failed after: ${responseTime}ms`);
    console.error(`❌ Test Error:`, error.message);
  }
}

async function runTests(): Promise<void> {
  console.log('🚀 Testing Opus Axioms Integration in MAIA Oracle\n');
  console.log(`📍 Testing endpoint: ${TEST_ENDPOINT}`);
  console.log(`🏛️  Testing 8 Jungian Alchemical Axioms:\n`);
  console.log('   1. OPUS_OVER_OUTCOME - Treat user as living Opus, not problem to fix');
  console.log('   2. SPIRAL_NOT_CIRCLE - Read recurring themes as spiral movement');
  console.log('   3. HONOR_UNCONSCIOUS - Treat symbolic/irrational as meaningful');
  console.log('   4. NON_IMPOSITION_OF_IDENTITY - Never define who user "is"');
  console.log('   5. NORMALIZE_PARADOX - Hold opposites without forcing resolution');
  console.log('   6. EXPERIENCE_BEFORE_EXPLANATION - Prioritize felt sense');
  console.log('   7. PACE_WITH_CARE - Avoid pushing too fast');
  console.log('   8. EXPLICIT_HUMILITY - Name uncertainty honestly\n');
  console.log('─'.repeat(80));

  for (const testCase of testCases) {
    await testOpusAxioms(testCase);
    console.log('─'.repeat(80));
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Each response is evaluated against all 8 Opus Axioms');
  console.log('- "Gold" responses pass all axioms with no warnings or violations');
  console.log('- Violations trigger rupture detection for potential repair flows');
  console.log('- Results are logged server-side and returned in API response');
  console.log('\n✨ The axiom system helps ensure MAIA treats every user as a living Opus,');
  console.log('   accompanying their spiral of becoming rather than fixing them as a problem.\n');
}

// Run the tests
runTests().catch(console.error);
