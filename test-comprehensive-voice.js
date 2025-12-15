#!/usr/bin/env node

// Test script for comprehensive voice adaptation system
// This directly tests our revolutionary voice adaptation without needing API endpoints

import { getMaiaResponse } from './lib/sovereign/maiaService.ts';

async function testComprehensiveVoice() {
  console.log('🚀 TESTING REVOLUTIONARY COMPREHENSIVE VOICE ADAPTATION SYSTEM');
  console.log('================================================================\n');

  // Test 1: Simple greeting (should trigger casual voice)
  console.log('TEST 1: Simple Greeting');
  console.log('Input: "Hi MAIA!"');
  console.log('Expected: casual voice, low complexity, basic conventions');
  console.log('---');
  try {
    const result1 = await getMaiaResponse({
      sessionId: 'test-voice-simple',
      input: 'Hi MAIA!'
    });
    console.log('Response length:', result1.text.length, 'characters');
    console.log('Response preview:', result1.text.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('Error in Test 1:', error.message, '\n');
  }

  // Test 2: Philosophical question (should trigger consciousness_architect voice)
  console.log('TEST 2: Deep Philosophical Question');
  console.log('Input: "What is the meaning of consciousness and how does it relate to the nature of reality and spiritual awakening?"');
  console.log('Expected: consciousness_architect voice, profound complexity, full conventions');
  console.log('---');
  try {
    const result2 = await getMaiaResponse({
      sessionId: 'test-voice-profound',
      input: 'What is the meaning of consciousness and how does it relate to the nature of reality and spiritual awakening?'
    });
    console.log('Response length:', result2.text.length, 'characters');
    console.log('Response preview:', result2.text.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('Error in Test 2:', error.message, '\n');
  }

  // Test 3: Personal emotional question (should trigger wise_elder voice)
  console.log('TEST 3: Personal Emotional Question');
  console.log('Input: "I feel lost and struggling with anxiety about my life purpose. How can I find my way?"');
  console.log('Expected: wise_elder voice, deep complexity, emotional conventions');
  console.log('---');
  try {
    const result3 = await getMaiaResponse({
      sessionId: 'test-voice-emotional',
      input: 'I feel lost and struggling with anxiety about my life purpose. How can I find my way?'
    });
    console.log('Response length:', result3.text.length, 'characters');
    console.log('Response preview:', result3.text.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('Error in Test 3:', error.message, '\n');
  }

  // Test 4: Moderate analytical question (should trigger thoughtful voice)
  console.log('TEST 4: Moderate Analytical Question');
  console.log('Input: "Can you help me understand the differences between various meditation techniques?"');
  console.log('Expected: thoughtful voice, moderate complexity, balanced conventions');
  console.log('---');
  try {
    const result4 = await getMaiaResponse({
      sessionId: 'test-voice-analytical',
      input: 'Can you help me understand the differences between various meditation techniques?'
    });
    console.log('Response length:', result4.text.length, 'characters');
    console.log('Response preview:', result4.text.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('Error in Test 4:', error.message, '\n');
  }

  console.log('🎯 COMPREHENSIVE VOICE ADAPTATION TEST COMPLETE');
  console.log('Check the console logs above to verify voice level detection is working!');
}

// Run the test
testComprehensiveVoice().catch(console.error);