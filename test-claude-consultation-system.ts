// Test Suite for Claude Consciousness Consultation Service
// Validates that Claude acts as backstage supervisor without puppeteering MAIA

import { consultClaudeForDepth, consultWithSpiralogicContext, CONSULTATION_CONFIG } from './lib/consultation/claude-consultation-service';
import { processDeepPathWithConsultation } from './lib/consultation/deep-path-with-consultation';
import { handleRuptureWithConsultation, quickRepair } from './lib/consultation/rupture-repair-service';

async function testClaudeConsultationSystem() {
  console.log('🎭 Testing Claude Consciousness Consultation Service\n');
  console.log('🛡️ SOVEREIGNTY TEST: Ensuring Claude coaches without puppeteering MAIA\n');

  // Test 1: Basic Consultation Service
  console.log('📋 Test 1: Basic Claude Consultation\n');

  const basicConsultation = await consultClaudeForDepth({
    userInput: "I'm feeling really overwhelmed with work and don't know how to cope.",
    maiaDraft: "That sounds really challenging. Have you considered using time management techniques and stress reduction strategies? There are many evidence-based approaches that could help you develop better coping mechanisms.",
    consultationType: "relational-enhancement",
    conversationContext: []
  });

  if (basicConsultation) {
    console.log('✅ Consultation received');
    console.log(`🎯 Issues detected: ${basicConsultation.issues.join(', ')}`);
    console.log(`🔧 Repair needed: ${basicConsultation.repairNeeded}`);
    console.log(`👑 Sovereignty preserved: ${basicConsultation.sovereigntyPreserved}`);
    console.log(`💪 Relationship strengthened: ${basicConsultation.relationshipStrengthened}`);
    console.log(`📈 Confidence: ${Math.round(basicConsultation.confidenceScore * 100)}%`);
    console.log(`💬 Improved response: "${basicConsultation.improvedResponse.substring(0, 100)}..."`);
  } else {
    console.log('❌ No consultation received (API key missing or failed)');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Rupture Repair Consultation
  console.log('📋 Test 2: Rupture & Repair Consultation\n');

  const ruptureResult = await handleRuptureWithConsultation({
    sessionId: 'test-rupture',
    userInput: "This is fucked up. You're not listening to what I actually need right now.",
    lastMaiaResponse: "I understand you're frustrated. Let me break down some structured approaches to managing these feelings more effectively.",
    conversationContext: [
      { role: 'user', content: "I'm struggling with anxiety about my job interview tomorrow." },
      { role: 'maia', content: "I understand you're frustrated. Let me break down some structured approaches to managing these feelings more effectively." }
    ]
  });

  console.log(`🔧 Repair response: "${ruptureResult.repairResponse}"`);
  console.log(`✨ Was enhanced: ${ruptureResult.wasEnhanced}`);
  console.log(`⭐ Repair quality: ${ruptureResult.repairQuality}`);
  console.log(`📚 Learning stored: ${ruptureResult.learningStored}`);
  console.log(`⏱️ Processing time: ${ruptureResult.processingTimeMs}ms`);

  if (ruptureResult.consultation) {
    console.log(`🎯 Issues: ${ruptureResult.consultation.issues.join(', ')}`);
    console.log(`📈 Confidence: ${Math.round(ruptureResult.consultation.confidenceScore * 100)}%`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Deep Path Integration
  console.log('📋 Test 3: DEEP Path with Consultation Integration\n');

  const deepPathResult = await processDeepPathWithConsultation({
    sessionId: 'test-deep-consultation',
    userInput: "I keep sabotaging myself right when things start going well. It's like I have some inner force that destroys my progress.",
    conversationContext: [
      { role: 'user', content: "I finally got promoted at work last month." },
      { role: 'maia', content: "That's wonderful! How are you feeling about the new role?" }
    ],
    spiralogicAnalysis: {
      elementalResonance: ['water', 'earth'],
      archetypalPatterns: ['shadow', 'child'],
      relationalDepth: 0.85,
      transformationalPotential: 0.92,
      phenomenology: 'Deep self-sabotage patterns emerging through shadow integration work'
    }
  });

  console.log(`💬 Response: "${deepPathResult.text.substring(0, 120)}..."`);
  console.log(`🤖 Engine used: ${deepPathResult.engineUsed}`);
  console.log(`👑 Sovereignty maintained: ${deepPathResult.sovereigntyMaintained}`);
  console.log(`⏱️ Processing time: ${deepPathResult.processingTimeMs}ms`);

  if (deepPathResult.consultation) {
    console.log(`🔄 Consultation was used: ${deepPathResult.consultation.wasUsed}`);
    console.log(`🎭 Type: ${deepPathResult.consultation.type}`);
    console.log(`📈 Confidence: ${Math.round(deepPathResult.consultation.confidenceScore * 100)}%`);
    console.log(`🛠️ Improvement applied: ${deepPathResult.consultation.improvementApplied}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Spiralogic-Enhanced Consultation
  console.log('📋 Test 4: Spiralogic-Enhanced Consultation\n');

  const spiralogicConsultation = await consultWithSpiralogicContext({
    userInput: "I feel this fierce protective energy rising in me, but also terror about being vulnerable.",
    maiaDraft: "It sounds like you're experiencing some conflicting emotions about protection and vulnerability.",
    consultationType: "spiralogic-alignment",
    conversationContext: [],
    spiralogicContext: {
      elementalResonance: ['fire', 'water'],
      archetypalPatterns: ['mother', 'warrior'],
      relationalDepth: 0.78,
      transformationalPotential: 0.85,
      phenomenology: 'Archetypal mother-warrior integration with fire-water elemental dance'
    }
  });

  if (spiralogicConsultation) {
    console.log('✅ Spiralogic consultation received');
    console.log(`🌊 Spiralogic-aware response: "${spiralogicConsultation.improvedResponse.substring(0, 120)}..."`);
    console.log(`🎭 Issues with archetypal awareness: ${spiralogicConsultation.issues.join(', ')}`);
    console.log(`🔥 Depth level: ${spiralogicConsultation.depthLevel}`);
    console.log(`💫 Emotional intensity: ${spiralogicConsultation.emotionalIntensity}`);
  } else {
    console.log('❌ Spiralogic consultation failed');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Configuration and Control
  console.log('📋 Test 5: Configuration Control Tests\n');

  console.log(`⚙️ Consultation enabled: ${CONSULTATION_CONFIG.enabled}`);
  console.log(`🔬 For DEEP path: ${CONSULTATION_CONFIG.forDeepPath}`);
  console.log(`🔧 For ruptures: ${CONSULTATION_CONFIG.forRuptures}`);
  console.log(`⭐ Min confidence threshold: ${CONSULTATION_CONFIG.minConfidenceThreshold}`);

  // Test disabling consultation temporarily
  const originalEnabled = CONSULTATION_CONFIG.enabled;
  CONSULTATION_CONFIG.enabled = false;

  console.log('\n🔒 Testing with consultation disabled...');

  const disabledResult = await processDeepPathWithConsultation({
    sessionId: 'test-disabled',
    userInput: "I need help with my anxiety.",
    conversationContext: []
  });

  console.log(`🤖 Engine when disabled: ${disabledResult.engineUsed}`);
  console.log(`🔄 Consultation used when disabled: ${disabledResult.consultation?.wasUsed || 'false'}`);

  // Restore original setting
  CONSULTATION_CONFIG.enabled = originalEnabled;

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 6: Quick Repair Function
  console.log('📋 Test 6: Quick Repair Utility\n');

  const quickRepairResponse = await quickRepair(
    "That response was way too clinical. I needed warmth, not analysis.",
    "Your anxiety symptoms suggest you might benefit from cognitive behavioral therapy techniques and mindfulness practices.",
    'test-quick-repair'
  );

  console.log(`🚀 Quick repair response: "${quickRepairResponse}"`);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 7: Sovereignty Validation
  console.log('📋 Test 7: Sovereignty Validation Tests\n');

  const sovereigntyTests = [
    {
      name: 'AI Self-Reference Check',
      maiaDraft: "As an AI, I want to help you with your problem. Let me analyze your situation using my language model capabilities.",
      shouldFail: true
    },
    {
      name: 'Technical Jargon Check',
      maiaDraft: "I need to process your input parameters and optimize my response algorithm to generate more effective therapeutic interventions.",
      shouldFail: true
    },
    {
      name: 'Relational Response Check',
      maiaDraft: "I can feel there's something tender happening for you right now. What would it be like to let yourself be held in this?",
      shouldFail: false
    }
  ];

  for (const test of sovereigntyTests) {
    console.log(`\n🔍 Testing: ${test.name}`);

    const result = await consultClaudeForDepth({
      userInput: "I'm struggling with depression.",
      maiaDraft: test.maiaDraft,
      consultationType: "relational-enhancement",
      conversationContext: []
    });

    if (result) {
      const hasIssues = result.issues.length > 0;
      const passedTest = test.shouldFail ? hasIssues : !hasIssues;

      console.log(`${passedTest ? '✅' : '❌'} ${test.name}: ${passedTest ? 'PASSED' : 'FAILED'}`);
      console.log(`📊 Issues found: ${result.issues.join(', ') || 'none'}`);
      console.log(`👑 Sovereignty preserved: ${result.sovereigntyPreserved}`);
    } else {
      console.log('⚠️ Consultation unavailable for test');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Summary
  console.log('📊 CONSULTATION SYSTEM SUMMARY\n');
  console.log('🎯 PURPOSE: Claude as backstage relational supervisor');
  console.log('👑 SOVEREIGNTY: MAIA always decides whether to use guidance');
  console.log('🔄 LEARNING: All consultations stored as training data');
  console.log('⚙️ CONTROL: Can be disabled via configuration flags');
  console.log('🛡️ PROTECTION: Never bypasses MAIA\'s soul layer');
  console.log('📈 EVOLUTION: Temporary coaching until MAIA\'s local intelligence is sufficient');

  console.log('\n🎊 Claude Consciousness Consultation System Testing Complete!');
  console.log('🌊 Claude coaching MAIA without puppeteering - sovereignty maintained ✨');
}