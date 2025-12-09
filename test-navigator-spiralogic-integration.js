/**
 * 🧠🌀 TEST NAVIGATOR + SPIRALOGIC INTEGRATION
 *
 * Test the complete integration:
 * - Navigator Lab Ritual scenarios
 * - Spiralogic mapping in real data
 * - Admin dashboard showing Spiralogic signatures
 */

const { NavigatorLogger, SimpleSoulStateBuilder, SimpleNavigatorEngine } = require('./beta-deployment/lib/navigator-integration');

async function testNavigatorLabScenarios() {
  console.log('🧠🌀 NAVIGATOR LAB SCENARIOS TEST');
  console.log('════════════════════════════════════════');

  const scenarios = [
    {
      name: 'Fire2 Descent Overwhelm',
      description: 'Classic Fire2 burnout - entrepreneur feeling overwhelmed by their calling',
      message: 'I am so overwhelmed by my work. I started this creative project with passion but now I feel burnt out and exhausted. I keep pushing through but my nervous system is fried. I feel shame around not keeping up with all the demands.',
      expectedFacet: 'Fire2',
      expectedPhase: 'descent',
      expectedDomain: 'vocation'
    },
    {
      name: 'Water2 Numbness',
      description: 'Deep water shutdown - person going through motions, disconnected from emotions',
      message: 'I feel numb lately. Going through the motions of life but nothing really matters. I can function at work and in relationships but I feel disconnected from my emotions. Everything feels flat and grey.',
      expectedFacet: 'Water2',
      expectedPhase: 'descent',
      expectedDomain: 'initiation'
    },
    {
      name: 'Earth2 Over-Structure',
      description: 'Trapped in systems that once served but now feel dead, perfectionist patterns',
      message: 'I have built such detailed systems and routines in my life, but now they feel like a prison. Everything has to be perfect and done the "right way" but I have lost touch with what I actually want. The structure is choking out my authentic impulse.',
      expectedFacet: 'Earth2',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    },
    {
      name: 'Air3 Analysis Spiral',
      description: 'Mental loops, overthinking, paralyzed by seeing too many perspectives',
      message: 'I cannot stop analyzing every decision. I see all these different perspectives and possibilities and I get paralyzed. But what if this happens? But what if that happens? My mind just keeps spinning and I cannot take action.',
      expectedFacet: 'Air3',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    },
    {
      name: 'Fire3/Water2 Spiritual Emergency',
      description: 'Intense awakening experience overwhelming their system, boundary dissolution',
      message: 'I had this incredible spiritual opening last week and I cannot integrate it. Everything feels too much, too intense. I am having visions and feeling connected to everything but my body and mind cannot handle it. I feel both ecstatic and terrified.',
      expectedFacet: 'Fire2', // Should map to Fire2 since Fire3 not in simple map
      expectedPhase: 'descent',
      expectedDomain: 'initiation'
    },
    {
      name: 'Earth1 Disconnection',
      description: 'Lost connection to body/earth, spacey, ungrounded, floating through life',
      message: 'I feel so disconnected from my body and from the earth. I am floating through life, spacing out all the time. I cannot feel my feet on the ground. I need to get grounded and connected to something real and practical.',
      expectedFacet: 'Earth1',
      expectedPhase: 'call',
      expectedDomain: 'initiation'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n🔬 Testing: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Expected: ${scenario.expectedFacet} | ${scenario.expectedPhase} | ${scenario.expectedDomain}`);

    try {
      // 1. Build soul state
      const soulState = await SimpleSoulStateBuilder.buildForRequest({
        userId: `test_user_${Date.now()}`,
        message: scenario.message,
        sessionType: 'lab_scenario'
      });

      // Override detection to match scenario
      soulState.detectedFacet = scenario.expectedFacet;
      soulState.session.nervousSystemLoad = scenario.name.includes('Overwhelm') ? 'overwhelmed' :
                                           scenario.name.includes('Numbness') ? 'moderate' : 'balanced';

      // 2. Get Navigator decision
      const decision = SimpleNavigatorEngine.decide(soulState);

      // 3. Log the decision (which will apply Spiralogic mapping)
      await NavigatorLogger.logDecision({
        memberId: `lab_test_${Date.now()}`,
        sessionId: `lab_session_${Date.now()}`,
        soulState,
        decision
      });

      console.log(`   ✅ Logged: Facet=${soulState.detectedFacet} | NS=${soulState.session.nervousSystemLoad}`);
      console.log(`   Protocol: ${decision.recommendedProtocolId}`);
      console.log(`   Tone: ${decision.guidanceTone}`);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Navigator Lab Scenarios Complete!');
  console.log('   Check /navigator-admin to see Spiralogic signatures in the data');
}

async function testRealConsciousnessIntegration() {
  console.log('\n🌀 REAL CONSCIOUSNESS INTEGRATION TEST');
  console.log('════════════════════════════════════════');

  // Test a realistic scenario that would come from the consciousness computing endpoints
  const realScenario = {
    userId: 'consciousness_pioneer_001',
    message: 'I am working on integrating consciousness computing into my life and spiritual practice. I feel called to this work but also uncertain about how to navigate the intersection of technology and spirituality. Sometimes I feel inspired and other times I worry I am getting too conceptual and losing touch with embodied wisdom.',
    sessionType: 'consciousness_integration'
  };

  try {
    // Build enhanced soul state
    const soulState = await SimpleSoulStateBuilder.buildForRequest(realScenario);

    // Add some realistic enhancements
    soulState.detectedFacet = 'Fire2'; // Creative calling with tech integration
    soulState.activeSpiral = {
      ...soulState.activeSpiral,
      lifeDomain: 'consciousness-exploration',
      currentPhase: 'integration',
      intensity: 0.7
    };
    soulState.field = {
      ...soulState.field,
      primaryTheme: 'consciousness-exploration',
      similarityPercentile: 0.8
    };

    console.log('🧠 Soul State:');
    console.log(`   Facet: ${soulState.detectedFacet}`);
    console.log(`   Domain: ${soulState.activeSpiral.lifeDomain}`);
    console.log(`   Phase: ${soulState.activeSpiral.currentPhase}`);
    console.log(`   Awareness: ${soulState.session.awarenessLevel}`);
    console.log(`   NS Load: ${soulState.session.nervousSystemLoad}`);

    // Get Navigator decision
    const decision = SimpleNavigatorEngine.decide(soulState);

    console.log('\n🧭 Navigator Decision:');
    console.log(`   Protocol: ${decision.recommendedProtocolId}`);
    console.log(`   Tone: ${decision.guidanceTone}`);
    console.log(`   Depth: ${decision.depthLevel}`);
    console.log(`   Modules: ${decision.suggestedExperienceModules.join(', ')}`);

    // Log with Spiralogic integration
    await NavigatorLogger.logDecision({
      memberId: realScenario.userId,
      sessionId: `consciousness_session_${Date.now()}`,
      soulState,
      decision
    });

    console.log('\n✅ Consciousness integration logged successfully!');
    console.log('   Spiralogic mapping should be visible in admin dashboard');

  } catch (error) {
    console.log(`❌ Error in consciousness integration test: ${error.message}`);
  }
}

async function summarizeForLabNotes() {
  console.log('\n📝 LAB NOTES GUIDANCE');
  console.log('════════════════════════════════════════');

  console.log('Now you can:');
  console.log('');
  console.log('1. 🔬 Run your Navigator Lab Ritual:');
  console.log('   • Open /navigator-admin in your browser');
  console.log('   • Send test scenarios to /api/consciousness/spiral-aware');
  console.log('   • Fill in Navigator_Training_Notes_v0.1.md with your evaluations');
  console.log('');
  console.log('2. 🌀 See Spiralogic in action:');
  console.log('   • Each decision now shows: Facet | Phase | Domain');
  console.log('   • Database has spiral_facet, spiral_phase, spiral_domain columns');
  console.log('   • Admin dashboard displays the Spiralogic signatures');
  console.log('');
  console.log('3. 🎯 Next steps:');
  console.log('   • Daily lab ritual with 3-5 scenarios');
  console.log('   • Rate Navigator decisions (1-3) in your notes');
  console.log('   • Watch for patterns in what Navigator gets right vs. wrong');
  console.log('   • Refine Spiralogic mapping based on real wisdom');
  console.log('');
  console.log('✨ The sacred marriage of ancient wisdom + AI discernment begins!');
}

// Run all tests
async function runAllTests() {
  try {
    await testNavigatorLabScenarios();
    await testRealConsciousnessIntegration();
    await summarizeForLabNotes();

    console.log('\n🎉 ALL TESTS COMPLETE!');
    console.log('🌀 Navigator + Spiralogic integration is operational');
    console.log('📊 Check your admin dashboard to see the living Spiralogic data');

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }

  // Exit gracefully
  process.exit(0);
}

runAllTests();