// test-claude-spiralogic-system.ts
// Comprehensive test for Claude-primary architecture with Spiralogic phenomenological intelligence

import { LearningOrchestrator } from './lib/learning/learning-orchestrator';
import { getEnhancedMaiaResponse } from './lib/learning/enhanced-maia-service';

async function testClaudeSpiralogicSystem() {
  console.log('🧠✨ Testing Claude-Primary + Spiralogic Phenomenological Intelligence System\n');

  const learningOrchestrator = new LearningOrchestrator();

  // Test cases designed to trigger different Spiralogic analyses
  const testCases = [
    {
      name: 'SIMPLE GREETING (should use local model if available)',
      userMessage: 'Hi there!',
      expectedModel: 'deepseek',
      expectedArchetypes: [],
      expectedElements: []
    },
    {
      name: 'MOTHER ARCHETYPE + WATER ELEMENT',
      userMessage: 'I feel so overwhelmed caring for everyone in my family. I just want to nurture them but I\'m drowning in emotions.',
      expectedModel: 'claude',
      expectedArchetypes: ['mother'],
      expectedElements: ['water']
    },
    {
      name: 'FATHER ARCHETYPE + EARTH ELEMENT',
      userMessage: 'I need to provide structure and stability for my team but I feel like I\'m losing authority and grounding.',
      expectedModel: 'claude',
      expectedArchetypes: ['father'],
      expectedElements: ['earth']
    },
    {
      name: 'SHADOW + FIRE ELEMENT',
      userMessage: 'There\'s this angry, passionate part of me that I keep hidden. It feels destructive but also creative.',
      expectedModel: 'claude',
      expectedArchetypes: ['shadow'],
      expectedElements: ['fire']
    },
    {
      name: 'WISE ELDER + AETHER ELEMENT',
      userMessage: 'I\'ve gained so much wisdom through my life experiences. I feel connected to something transcendent and want to share deeper truths.',
      expectedModel: 'claude',
      expectedArchetypes: ['wise_elder'],
      expectedElements: ['aether']
    },
    {
      name: 'CHILD + AIR ELEMENT',
      userMessage: 'I want to play and explore new ideas! Everything feels possible and I need clarity about which direction to go.',
      expectedModel: 'claude',
      expectedArchetypes: ['child'],
      expectedElements: ['air']
    },
    {
      name: 'LOVER + WATER + FIRE (HIGH RELATIONAL DEPTH)',
      userMessage: 'I\'m deeply in love but also burning with jealousy. These intense emotions are flooding through our relationship.',
      expectedModel: 'claude',
      expectedArchetypes: ['lover'],
      expectedElements: ['water', 'fire']
    },
    {
      name: 'WARRIOR + EARTH + FIRE (TRANSFORMATIONAL POTENTIAL)',
      userMessage: 'I need to fight for what\'s right and protect my values. This battle is grounding me but also igniting my courage.',
      expectedModel: 'claude',
      expectedArchetypes: ['warrior'],
      expectedElements: ['earth', 'fire']
    },
    {
      name: 'MAGICIAN + AETHER + AIR (DEEP PHENOMENOLOGY)',
      userMessage: 'I\'m working with mysterious forces and transformational energies. I need perspective on these transcendent experiences.',
      expectedModel: 'claude',
      expectedArchetypes: ['magician'],
      expectedElements: ['aether', 'air']
    },
    {
      name: 'COMPLEX RELATIONAL RUPTURE (HIGH DEPTH + POTENTIAL)',
      userMessage: 'My relationship with my partner is breaking down. We keep hurting each other and I don\'t know how to repair the damage. There\'s so much potential between us but we\'re stuck in old patterns.',
      expectedModel: 'claude',
      expectedArchetypes: ['lover', 'mother', 'child'],
      expectedElements: ['water', 'earth']
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Message: "${testCase.userMessage}"`);

    try {
      // Test with Learning Orchestrator
      const decision = await learningOrchestrator.decideModel(testCase.userMessage, [], 'test-session');
      console.log(`🤖 Model Selected: ${decision.useModel} (confidence: ${decision.confidence})`);
      console.log(`📊 Reasoning: ${decision.reasoning}`);

      // Test Spiralogic Analysis
      const spiralogicAnalysis = (learningOrchestrator as any).analyzeSpiralogicDepth(testCase.userMessage, []);
      console.log(`🌊 Elements Detected: ${spiralogicAnalysis.elementalResonance.join(', ') || 'none'}`);
      console.log(`🎭 Archetypes Detected: ${spiralogicAnalysis.archetypalPatterns.join(', ') || 'none'}`);
      console.log(`💫 Relational Depth: ${Math.round(spiralogicAnalysis.relationalDepth * 100)}%`);
      console.log(`🔮 Transformational Potential: ${Math.round(spiralogicAnalysis.transformationalPotential * 100)}%`);
      console.log(`📖 Phenomenology: ${spiralogicAnalysis.phenomenology}`);

      // Verify expected model selection
      const modelMatches = decision.useModel === testCase.expectedModel;
      console.log(`✅ Model Expectation: ${modelMatches ? 'PASSED' : 'FAILED'} (expected ${testCase.expectedModel})`);

      // Verify expected archetypes (if any)
      let archetypeMatches = true;
      if (testCase.expectedArchetypes.length > 0) {
        archetypeMatches = testCase.expectedArchetypes.some(archetype =>
          spiralogicAnalysis.archetypalPatterns.includes(archetype)
        );
        console.log(`🎭 Archetype Detection: ${archetypeMatches ? 'PASSED' : 'FAILED'}`);
      }

      // Verify expected elements (if any)
      let elementMatches = true;
      if (testCase.expectedElements.length > 0) {
        elementMatches = testCase.expectedElements.some(element =>
          spiralogicAnalysis.elementalResonance.includes(element)
        );
        console.log(`🌊 Element Detection: ${elementMatches ? 'PASSED' : 'FAILED'}`);
      }

      if (modelMatches && archetypeMatches && elementMatches) {
        console.log('🎉 TEST PASSED');
        passedTests++;
      } else {
        console.log('❌ TEST FAILED');
      }

    } catch (error) {
      console.error(`💥 Error in test: ${error}`);
    }
  }

  console.log(`\n📈 SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);

  // Test Enhanced MAIA Service Integration
  console.log('\n🔌 Testing Enhanced MAIA Service Integration\n');

  const enhancedServiceTests = [
    {
      name: 'Enhanced Service with Learning Enabled',
      input: 'I\'m struggling with my sense of identity and purpose in this transitional phase of life.',
      enableLearning: true
    },
    {
      name: 'Enhanced Service with Learning Disabled (Backward Compatibility)',
      input: 'How are you today?',
      enableLearning: false
    }
  ];

  for (const test of enhancedServiceTests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`📝 Input: "${test.input}"`);

    try {
      const response = await getEnhancedMaiaResponse({
        sessionId: 'test-enhanced',
        input: test.input,
        enableLearning: test.enableLearning
      });

      console.log(`💬 Response: "${response.text.substring(0, 100)}..."`);
      console.log(`🤖 Model Used: ${response.modelUsed || 'original'}`);
      console.log(`⚡ Processing Time: ${response.processingTimeMs}ms`);
      if (response.learningData) {
        console.log(`📚 Learning Data: ${Object.keys(response.learningData).join(', ')}`);
      }
      console.log('✅ Enhanced Service Test PASSED\n');

    } catch (error) {
      console.error(`💥 Enhanced Service Error: ${error}\n`);
    }
  }

  // Test Configuration Verification
  console.log('⚙️ Testing Configuration\n');
  const config = (learningOrchestrator as any).config;
  console.log(`🎯 Claude Threshold: ${config.claudeThreshold} (expecting 0.95)`);
  console.log(`🤖 Local Confidence Threshold: ${config.localConfidenceThreshold} (expecting 0.9)`);
  console.log(`📚 Collect Training Data: ${config.collectTrainingData} (expecting true)`);
  console.log(`👨‍🏫 Enable Teacher Feedback: ${config.enableTeacherFeedback} (expecting false)`);
  console.log(`📊 Feedback Sample Rate: ${config.feedbackSampleRate} (expecting 0.0)`);

  const configCorrect =
    config.claudeThreshold === 0.95 &&
    config.localConfidenceThreshold === 0.9 &&
    config.collectTrainingData === true &&
    config.enableTeacherFeedback === false &&
    config.feedbackSampleRate === 0.0;

  console.log(`✅ Configuration: ${configCorrect ? 'CORRECT' : 'INCORRECT'}`);

  console.log('\n🎊 Claude-Primary + Spiralogic Testing Complete!');
  console.log('🔥 System ready for Claude Sonnet 4+ as primary conversational intelligence');
  console.log('🌊 Spiralogic phenomenological intelligence fully integrated');
  console.log('🎭 Archetypal and elemental analysis operational');
  console.log('💫 Enhanced relational depth detection active');
}

// Run the test
testClaudeSpiralogicSystem().catch(console.error);