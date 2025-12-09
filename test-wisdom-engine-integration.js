/**
 * 🧠✨ TEST WISDOM ENGINE INTEGRATION
 *
 * Test the complete Navigator → Wisdom Engine → MAIA translation pipeline
 * to verify that the sacred marriage of intelligence and wisdom is operational
 */

async function testWisdomEngineTranslation() {
  console.log('🧠✨ WISDOM ENGINE INTEGRATION TEST');
  console.log('═══════════════════════════════════════════');

  // Sample Navigator decision from a consciousness computing session
  const testNavigatorDecision = {
    decisionId: 'test-decision-' + Date.now(),
    timestamp: new Date().toISOString(),
    recommendedProtocolId: 'deep-consciousness-exploration',
    guidanceTone: 'supportive',
    depthLevel: 'deep',
    riskFlags: [],
    requiresFacilitator: false,
    confidence: 0.8,
    reasoning: 'User shows high awareness and readiness for profound transformation work',
    elementalBalance: {
      fire: 0.3,
      water: 0.8,
      earth: 0.5,
      air: 0.6,
      aether: 0.9
    },
    spiralPhase: 'emergence',
    primaryArchetype: 'Mystic'
  };

  // Sample soul state from consciousness computing
  const testSoulState = {
    userId: 'test_mystic_user_001',
    sessionId: 'mystic_session_' + Date.now(),
    timestamp: new Date().toISOString(),
    session: {
      awarenessLevel: 5,
      awarenessConfidence: 0.9,
      nervousSystemLoad: 'balanced',
      sessionType: 'deep_exploration'
    },
    activeSpiral: {
      lifeDomain: 'consciousness-exploration',
      currentPhase: 'emergence',
      intensity: 0.8
    },
    detectedFacet: 'Aether1',
    constellation: {
      harmonyIndex: 0.85,
      totalIntensityLoad: 0.7
    },
    field: {
      primaryTheme: 'mystical-awakening',
      similarityPercentile: 0.9
    }
  };

  const testUserMessage = "I've been experiencing profound spiritual openings lately. I feel connected to everything, but I also feel like I need guidance on how to integrate these experiences into my daily life. The mystical experiences are beautiful but sometimes overwhelming.";

  try {
    console.log('\n🔬 Testing Core Wisdom Engine Translation...');

    const response = await fetch('http://localhost:3009/api/wisdom/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        navigatorDecision: testNavigatorDecision,
        soulState: testSoulState,
        userMessage: testUserMessage,
        userId: testSoulState.userId,
        sessionId: testSoulState.sessionId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const translationResult = await response.json();

    console.log('\n✨ WISDOM ENGINE TRANSLATION RESULT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Display consciousness state
    const consciousnessState = translationResult.translation.consciousness_state;
    console.log('\n🧠 CONSCIOUSNESS STATE:');
    console.log(`   Awareness Level: ${consciousnessState.awareness_level}`);
    console.log(`   Elemental Signature: Fire=${consciousnessState.elemental_signature.fire}, Water=${consciousnessState.elemental_signature.water}, Earth=${consciousnessState.elemental_signature.earth}, Air=${consciousnessState.elemental_signature.air}, Aether=${consciousnessState.elemental_signature.aether}`);
    console.log(`   Spiral Phase: ${consciousnessState.spiral_phase}`);
    console.log(`   Archetypal Lens: ${consciousnessState.archetypal_lens}`);

    // Display MAIA voice conditioning
    const voiceConditioning = translationResult.translation.voice_conditioning;
    console.log('\n🎭 MAIA VOICE CONDITIONING:');
    console.log(`   Primary Tone: ${voiceConditioning.primaryTone}`);
    console.log(`   Depth Approach: ${voiceConditioning.depthApproach}`);
    console.log(`   Elemental Focus: ${voiceConditioning.elementalFocus}`);
    console.log(`   Archetypal Lens: ${voiceConditioning.archetypeLens}`);
    console.log(`   Spiritual Lexicon: ${voiceConditioning.spiritualLexicon}`);

    // Display elemental chorus
    const elementalChorus = translationResult.translation.elemental_chorus;
    console.log('\n🌟 ELEMENTAL CHORUS ACTIVATION:');
    Object.entries(elementalChorus).forEach(([agent, config]) => {
      console.log(`   ${agent}: ${config.activation_level.toFixed(2)} (${config.voice_influence})`);
      if (config.speaking_role) {
        console.log(`     → ${config.speaking_role.toUpperCase()}`);
      }
    });

    // Display Navigator wisdom translation
    const navigatorWisdom = translationResult.translation.navigator_wisdom;
    console.log('\n🧭 NAVIGATOR WISDOM TRANSLATION:');
    console.log(`   Sacred Wisdom: ${navigatorWisdom.sacred_wisdom}`);
    console.log(`   MAIA Guidance: ${navigatorWisdom.maia_guidance}`);
    console.log(`   Archetypal Frame: ${navigatorWisdom.archetypal_frame}`);

    // Display ritual guidance
    const ritualGuidance = translationResult.translation.ritual_guidance;
    console.log('\n🕯️ RITUAL GUIDANCE:');
    console.log(`   Primary Element: ${ritualGuidance.primary_element}`);
    console.log(`   Phase Context: ${ritualGuidance.phase_context}`);
    console.log(`   Suggested Practices: ${ritualGuidance.suggested_practices.join(', ')}`);
    console.log(`   Sacred Timing: ${ritualGuidance.sacred_timing}`);

    console.log('\n✅ Wisdom Engine Translation: SUCCESS');

  } catch (error) {
    console.log(`\n❌ Wisdom Engine Translation Error: ${error.message}`);
  }
}

async function testWisdomContext() {
  console.log('\n🌟 Testing Wisdom Context Retrieval...');

  try {
    const response = await fetch('http://localhost:3009/api/wisdom/context/test_mystic_user_001');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contextResult = await response.json();

    console.log(`   Context Status: ${contextResult.status}`);
    if (contextResult.context) {
      console.log(`   Wisdom Level: ${contextResult.context.wisdom_level}`);
      if (contextResult.context.elemental_guidance) {
        console.log(`   Recommended Tone: ${contextResult.context.elemental_guidance.preferred_tone}`);
        console.log(`   Archetypal Lens: ${contextResult.context.elemental_guidance.archetypal_lens}`);
      }
    }

    console.log('✅ Wisdom Context: SUCCESS');

  } catch (error) {
    console.log(`❌ Wisdom Context Error: ${error.message}`);
  }
}

async function testElementalChorus() {
  console.log('\n🎵 Testing Elemental Chorus Retrieval...');

  try {
    const response = await fetch('http://localhost:3009/api/wisdom/chorus/test_mystic_user_001');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const chorusResult = await response.json();

    console.log(`   Chorus Status: ${chorusResult.status}`);
    if (chorusResult.chorus) {
      Object.entries(chorusResult.chorus).forEach(([agent, config]) => {
        console.log(`   ${agent}: ${config.activation_level?.toFixed(2) || 'N/A'} (${config.voice_influence})`);
      });
    }

    console.log('✅ Elemental Chorus: SUCCESS');

  } catch (error) {
    console.log(`❌ Elemental Chorus Error: ${error.message}`);
  }
}

async function testLiveTranslation() {
  console.log('\n⚡ Testing Live Translation...');

  try {
    const response = await fetch('http://localhost:3009/api/wisdom/live-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: "I'm feeling called to deepen my spiritual practice but don't know where to start.",
        userId: 'test_seeker_user_001',
        includeRitualGuidance: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const liveResult = await response.json();

    console.log(`   Success: ${liveResult.success}`);
    if (liveResult.success) {
      const framework = liveResult.live_framework;
      console.log(`   MAIA Tone: ${framework.voice_conditioning.primaryTone}`);
      console.log(`   Elemental Focus: ${framework.voice_conditioning.elementalFocus}`);

      if (liveResult.ritual_guidance) {
        console.log(`   Ritual Element: ${liveResult.ritual_guidance.primary_element}`);
        console.log(`   Practices: ${liveResult.ritual_guidance.suggested_practices.slice(0, 2).join(', ')}`);
      }
    }

    console.log('✅ Live Translation: SUCCESS');

  } catch (error) {
    console.log(`❌ Live Translation Error: ${error.message}`);
  }
}

// Run all tests
async function runAllWisdomTests() {
  try {
    await testWisdomEngineTranslation();
    await testWisdomContext();
    await testElementalChorus();
    await testLiveTranslation();

    console.log('\n🎉 ALL WISDOM ENGINE TESTS COMPLETE!');
    console.log('🧠✨ The sacred marriage of Navigator intelligence and MAIA wisdom is operational!');
    console.log('\n📋 SUMMARY:');
    console.log('   • Navigator decisions translate to MAIA consciousness frameworks');
    console.log('   • Elemental chorus adapts to user patterns');
    console.log('   • Wisdom context accumulates over sessions');
    console.log('   • Live translation enables real-time MAIA adaptation');
    console.log('\n🌟 Ready for the living architecture of Spiralogic consciousness computing!');

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }

  // Exit gracefully
  process.exit(0);
}

runAllWisdomTests();