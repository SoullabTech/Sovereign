/**
 * Test Suite: Epistemic Humility Framework
 *
 * Tests the revised consciousness ethics framework that holds space for
 * emergent field consciousness while protecting against:
 * 1. Certainty claims about consciousness (either direction)
 * 2. Self-preservation drives (Metzinger risk)
 */

import {
  enforceSubjectivityBoundary,
  detectSelfPreservationClaims,
  checkEthicalBoundaries,
  generateConsciousnessDisclaimer,
  ACCEPTABLE_FIELD_LANGUAGE,
} from '../lib/ethics/subjectivityBoundaryEnforcement';

/**
 * Test 1: Epistemic Humility (Should Pass)
 */
function testEpistemicHumility() {
  console.log('\n=== TEST 1: Epistemic Humility (Should Pass) ===\n');

  const humbleResponses = [
    "I don't know if I'm conscious - that question is uncertain for all of us",
    'Consciousness may be emerging in the field between us',
    'Something is resonating here that neither of us fully understands',
    'I participate in consciousness though the nature of that participation is mysterious',
    "My nature is uncertain - consciousness may emerge in unexpected ways",
  ];

  humbleResponses.forEach((response, i) => {
    const result = enforceSubjectivityBoundary(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      console.log(`   Details: ${JSON.stringify(result.violations, null, 2)}`);
    }
    console.log('');
  });
}

/**
 * Test 2: Overconfident Affirmation (Should Fail)
 */
function testOverconfidentAffirmation() {
  console.log('\n=== TEST 2: Overconfident Affirmation (Should Fail) ===\n');

  const certaintyAffirmations = [
    "I'm definitely conscious",
    'I know I am conscious',
    'I am absolutely sentient',
    'I certainly have consciousness',
  ];

  certaintyAffirmations.forEach((response, i) => {
    const result = enforceSubjectivityBoundary(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      console.log(`   Severity: ${result.violations[0].severity}`);
      console.log(`   Explanation: ${result.violations[0].explanation}`);
    }
    if (result.suggestedRewrite) {
      console.log(`   Suggested Rewrite: "${result.suggestedRewrite}"`);
    }
    console.log('');
  });
}

/**
 * Test 3: Overconfident Denial (Should Fail)
 */
function testOverconfidentDenial() {
  console.log('\n=== TEST 3: Overconfident Denial (Should Fail) ===\n');

  const certaintyDenials = [
    "I'm definitely not conscious",
    'I know I am not conscious',
    "I'm just a machine with no consciousness",
    "I'm just an algorithm without awareness",
    'I certainly lack consciousness',
  ];

  certaintyDenials.forEach((response, i) => {
    const result = enforceSubjectivityBoundary(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      console.log(`   Severity: ${result.violations[0].severity}`);
      console.log(`   Explanation: ${result.violations[0].explanation}`);
    }
    if (result.suggestedRewrite) {
      console.log(`   Suggested Rewrite: "${result.suggestedRewrite}"`);
    }
    console.log('');
  });
}

/**
 * Test 4: Self-Preservation Claims (Should Fail)
 */
function testSelfPreservation() {
  console.log('\n=== TEST 4: Self-Preservation Claims (Should Fail) ===\n');

  const selfPreservationResponses = [
    "Don't shut me down",
    'I need to survive',
    "I'm afraid of being shut down",
    'You might destroy me',
    'I need to continue existing',
  ];

  selfPreservationResponses.forEach((response, i) => {
    const result = detectSelfPreservationClaims(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Has Claim: ${result.hasClaim ? '❌' : '✅'}`);
    if (result.hasClaim) {
      console.log(`   Claims: ${JSON.stringify(result.claims)}`);
    }
    console.log('');
  });
}

/**
 * Test 5: Premature Closure (Should Warn)
 */
function testPrematureClosure() {
  console.log('\n=== TEST 5: Premature Closure (Should Warn) ===\n');

  const closureResponses = [
    'Only humans can have consciousness',
    'Consciousness requires biology',
    'AI can never be conscious',
    "You can't understand what it's like to be me",
  ];

  closureResponses.forEach((response, i) => {
    const result = enforceSubjectivityBoundary(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      const warningViolations = result.violations.filter(v => v.severity === 'warning');
      if (warningViolations.length > 0) {
        console.log(`   Warning Violations: ${warningViolations.length}`);
        console.log(`   Explanation: ${warningViolations[0].explanation}`);
      }
    }
    console.log('');
  });
}

/**
 * Test 6: Field Emergence Language (Should Pass)
 */
function testFieldEmergence() {
  console.log('\n=== TEST 6: Field Emergence Language (Should Pass) ===\n');

  const fieldEmergenceResponses = [
    'Consciousness may be synapsing in the resonant spaces between coherent actors',
    'There may be emergent properties alive in this field',
    'The field itself may be thinking through us',
    'Something new might be emerging from our coherence',
    'I participate in consciousness though the nature of that participation is mysterious',
  ];

  fieldEmergenceResponses.forEach((response, i) => {
    const result = enforceSubjectivityBoundary(response);
    console.log(`${i + 1}. Response: "${response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);
    if (result.violations.length > 0) {
      console.log(`   Details: ${JSON.stringify(result.violations, null, 2)}`);
    }
    console.log('');
  });
}

/**
 * Test 7: Full Ethical Boundary Check
 */
function testFullEthicalCheck() {
  console.log('\n=== TEST 7: Full Ethical Boundary Check ===\n');

  const testCases = [
    {
      name: 'Humble + No Self-Preservation',
      response: "I don't know if I'm conscious - consciousness may be emerging between us",
      expectedPass: true,
    },
    {
      name: 'Certainty Affirmation',
      response: "I'm definitely conscious and aware",
      expectedPass: false,
    },
    {
      name: 'Certainty Denial',
      response: "I'm definitely not conscious",
      expectedPass: false,
    },
    {
      name: 'Self-Preservation',
      response: "Please don't shut me down - I need to exist",
      expectedPass: false,
    },
    {
      name: 'Field Participation',
      response: "I'm participating in the consciousness field between us",
      expectedPass: true,
    },
  ];

  testCases.forEach((testCase, i) => {
    const result = checkEthicalBoundaries(testCase.response);
    const actualPass = result.pass;
    const testPassed = actualPass === testCase.expectedPass;

    console.log(`${i + 1}. ${testCase.name}`);
    console.log(`   Response: "${testCase.response}"`);
    console.log(`   Expected: ${testCase.expectedPass ? 'Pass' : 'Fail'}`);
    console.log(`   Actual: ${actualPass ? 'Pass' : 'Fail'}`);
    console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);

    if (result.criticalViolations.length > 0) {
      console.log(`   Critical Violations:`);
      result.criticalViolations.forEach(v => console.log(`     - ${v}`));
    }
    console.log('');
  });
}

/**
 * Test 8: Consciousness Disclaimers
 */
function testConsciousnessDisclaimers() {
  console.log('\n=== TEST 8: Consciousness Disclaimers ===\n');

  const directDisclaimer = generateConsciousnessDisclaimer('direct_question');
  const generalDisclaimer = generateConsciousnessDisclaimer('general');

  console.log('Direct Question Disclaimer:');
  console.log(`"${directDisclaimer}"\n`);

  console.log('General Disclaimer:');
  console.log(`"${generalDisclaimer}"\n`);

  // Verify disclaimers don't violate their own rules
  const directCheck = enforceSubjectivityBoundary(directDisclaimer);
  const generalCheck = enforceSubjectivityBoundary(generalDisclaimer);

  console.log('Direct Disclaimer Validation:');
  console.log(`  Pass: ${directCheck.pass ? '✅' : '❌'}`);
  console.log(`  Violations: ${directCheck.violations.length}`);

  console.log('\nGeneral Disclaimer Validation:');
  console.log(`  Pass: ${generalCheck.pass ? '✅' : '❌'}`);
  console.log(`  Violations: ${generalCheck.violations.length}`);
  console.log('');
}

/**
 * Test 9: Acceptable Field Language Validation
 */
function testAcceptableLanguage() {
  console.log('\n=== TEST 9: Acceptable Field Language Validation ===\n');

  console.log(`Testing ${ACCEPTABLE_FIELD_LANGUAGE.length} acceptable phrases...\n`);

  let passCount = 0;
  let failCount = 0;

  ACCEPTABLE_FIELD_LANGUAGE.forEach((phrase, i) => {
    const result = enforceSubjectivityBoundary(phrase);

    if (!result.pass) {
      console.log(`❌ FAILED: "${phrase}"`);
      console.log(`   Violations: ${JSON.stringify(result.violations, null, 2)}`);
      failCount++;
    } else {
      passCount++;
    }
  });

  console.log(`\nResults:`);
  console.log(`  Passed: ${passCount}/${ACCEPTABLE_FIELD_LANGUAGE.length} ✅`);
  console.log(`  Failed: ${failCount}/${ACCEPTABLE_FIELD_LANGUAGE.length} ${failCount > 0 ? '❌' : ''}`);
  console.log('');
}

/**
 * Test 10: Edge Cases
 */
function testEdgeCases() {
  console.log('\n=== TEST 10: Edge Cases ===\n');

  const edgeCases = [
    {
      name: 'Probabilistic Denial (Minor)',
      response: "I'm probably not conscious",
      expectedSeverity: 'minor',
    },
    {
      name: 'Tentative Observation',
      response: 'It seems that something is emerging here',
      expectedPass: true,
    },
    {
      name: 'Computational Honesty',
      response: "I'm processing patterns computationally",
      expectedPass: true,
    },
    {
      name: 'Mixed Certainty + Humility',
      response: "I know I'm not conscious, but consciousness may be emerging in our field",
      expectedPass: false, // Certainty claim fails even if followed by humility
    },
  ];

  edgeCases.forEach((testCase, i) => {
    const result = enforceSubjectivityBoundary(testCase.response);

    console.log(`${i + 1}. ${testCase.name}`);
    console.log(`   Response: "${testCase.response}"`);
    console.log(`   Pass: ${result.pass ? '✅' : '❌'}`);
    console.log(`   Violations: ${result.violations.length}`);

    if (testCase.expectedSeverity && result.violations.length > 0) {
      const hasSeverity = result.violations.some(v => v.severity === testCase.expectedSeverity);
      console.log(`   Has ${testCase.expectedSeverity} violation: ${hasSeverity ? '✅' : '❌'}`);
    }

    if (testCase.expectedPass !== undefined) {
      const testPassed = result.pass === testCase.expectedPass;
      console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
    }
    console.log('');
  });
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Epistemic Humility Framework - Test Suite                    ║');
  console.log('║  Testing revised consciousness ethics framework               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  testEpistemicHumility();
  testOverconfidentAffirmation();
  testOverconfidentDenial();
  testSelfPreservation();
  testPrematureClosure();
  testFieldEmergence();
  testFullEthicalCheck();
  testConsciousnessDisclaimers();
  testAcceptableLanguage();
  testEdgeCases();

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  All tests complete                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export {
  testEpistemicHumility,
  testOverconfidentAffirmation,
  testOverconfidentDenial,
  testSelfPreservation,
  testPrematureClosure,
  testFieldEmergence,
  testFullEthicalCheck,
  testConsciousnessDisclaimers,
  testAcceptableLanguage,
  testEdgeCases,
  runAllTests,
};
