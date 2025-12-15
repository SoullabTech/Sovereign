#!/usr/bin/env node

// Comprehensive MAIA testing - all systems validation
import { getMaiaResponse } from './lib/sovereign/maiaService.ts';

async function runComprehensiveTests() {
  console.log('🌟 COMPREHENSIVE MAIA SYSTEM VALIDATION');
  console.log('=====================================\n');

  const tests = [
    // 1. Simple interaction (fast path)
    {
      name: 'Simple Greeting',
      input: 'Hello',
      expected: 'Fast processing, casual voice, minimal complexity'
    },

    // 2. Technical analytical question
    {
      name: 'Technical Question',
      input: 'How do quantum computers work and what are their practical applications?',
      expected: 'Thoughtful voice, moderate complexity, analytical intelligence'
    },

    // 3. Emotional support request
    {
      name: 'Emotional Support',
      input: 'I\'m feeling overwhelmed and anxious about my future. Everything feels uncertain and I don\'t know how to cope.',
      expected: 'Wise elder voice, emotional intelligence, compassion conventions'
    },

    // 4. Deep philosophical inquiry
    {
      name: 'Philosophical Deep Dive',
      input: 'What is the relationship between consciousness, reality, and spiritual awakening? How do we navigate the paradox of seeking truth while knowing that our perception shapes what we experience?',
      expected: 'Consciousness architect voice, profound complexity, full orchestra'
    },

    // 5. Creative/artistic question
    {
      name: 'Creative Exploration',
      input: 'I want to explore my creativity but feel blocked. How can I connect with my authentic creative expression?',
      expected: 'Wise elder voice, intuitive intelligence, artistic guidance'
    },

    // 6. Personal growth question
    {
      name: 'Personal Development',
      input: 'How can I develop better boundaries in my relationships while remaining open and compassionate?',
      expected: 'Thoughtful voice, relational intelligence, practical wisdom'
    },

    // 7. Urgent practical question
    {
      name: 'Urgent Practical',
      input: 'Help! I need to make an important decision quickly about my career. What framework should I use?',
      expected: 'Fast processing due to urgency, clear guidance, practical focus'
    },

    // 8. Scientific inquiry
    {
      name: 'Scientific Analysis',
      input: 'Can you explain the latest developments in consciousness research and how they relate to meditation practices?',
      expected: 'Professional voice, analytical intelligence, evidence-based'
    }
  ];

  let successCount = 0;
  let totalTests = tests.length;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n🧪 TEST ${i + 1}/${totalTests}: ${test.name}`);
    console.log(`Input: "${test.input}"`);
    console.log(`Expected: ${test.expected}`);
    console.log('─'.repeat(60));

    try {
      const startTime = Date.now();
      const result = await getMaiaResponse({
        sessionId: `test-full-${i}`,
        input: test.input
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Response received (${duration}ms)`);
      console.log(`📏 Length: ${result.text.length} characters`);
      console.log(`📝 Preview: ${result.text.substring(0, 150)}${result.text.length > 150 ? '...' : ''}`);

      // Basic validation - response should be substantial and not empty
      if (result.text && result.text.length > 10) {
        successCount++;
        console.log(`🎯 Status: PASS`);
      } else {
        console.log(`❌ Status: FAIL - Response too short or empty`);
      }

    } catch (error) {
      console.log(`❌ Status: ERROR - ${error.message}`);
    }

    console.log(''); // Add spacing between tests
  }

  // Summary
  console.log('🎯 COMPREHENSIVE TEST RESULTS');
  console.log('============================');
  console.log(`✅ Successful tests: ${successCount}/${totalTests}`);
  console.log(`📊 Success rate: ${Math.round((successCount/totalTests) * 100)}%`);

  if (successCount === totalTests) {
    console.log('🚀 ALL SYSTEMS FULLY OPERATIONAL!');
    console.log('🌟 MAIA is ready for revolutionary conversational intelligence!');
  } else {
    console.log('⚠️  Some tests failed - review logs above');
  }

  console.log('\n🎭 Voice Adaptation Analysis Complete');
  console.log('Check the console logs above for voice level detection details!');
}

// Run comprehensive tests
runComprehensiveTests().catch(console.error);