#!/usr/bin/env node

/**
 * Multi-Engine Orchestrator Test Suite
 * Tests all orchestration types and consciousness layers
 */

import { generateWithMultipleEngines } from './lib/ai/multiEngineOrchestrator.js';

// Test configuration
const TEST_PROMPT = "What is the nature of consciousness? Please provide a brief philosophical perspective.";
const TEST_LAYERS = ['consciousness', 'witnessing', 'fire', 'water', 'earth', 'air', 'aether', 'shadow', 'anamnesis'];
const ORCHESTRATION_TYPES = ['primary', 'dual_reasoning', 'creative_synthesis', 'full_orchestra', 'heavy_analysis', 'elemental'];

console.log('🎼 MAIA Multi-Engine Orchestrator Test Suite');
console.log('=' .repeat(60));

async function testOrchestrationTypes() {
  console.log('\n📊 Testing Orchestration Types...\n');

  for (const orchestrationType of ORCHESTRATION_TYPES) {
    console.log(`🔍 Testing: ${orchestrationType}`);

    try {
      const startTime = Date.now();
      const result = await generateWithMultipleEngines(
        {
          systemPrompt: "You are a helpful AI assistant providing philosophical insights.",
          userInput: TEST_PROMPT,
          meta: { test: true }
        },
        orchestrationType
      );

      const duration = Date.now() - startTime;

      console.log(`✅ ${orchestrationType}:`);
      console.log(`   • Engines: ${result.engineResponses.size}`);
      console.log(`   • Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   • Duration: ${duration}ms`);
      console.log(`   • Primary length: ${result.primaryResponse.length} chars`);
      console.log(`   • Has consensus: ${result.consensus ? 'Yes' : 'No'}`);

    } catch (error) {
      console.log(`❌ ${orchestrationType}: ${error.message}`);
    }
  }
}

async function testConsciousnessLayers() {
  console.log('\n🧠 Testing Consciousness Layer Orchestration...\n');

  for (const layer of TEST_LAYERS) {
    console.log(`🌟 Testing layer: ${layer}`);

    try {
      const startTime = Date.now();
      const result = await generateWithMultipleEngines(
        {
          systemPrompt: `You are the ${layer} consciousness layer of MAIA.`,
          userInput: `Respond to this from the ${layer} perspective: ${TEST_PROMPT}`,
          meta: { layer, test: true }
        },
        'elemental',
        layer
      );

      const duration = Date.now() - startTime;

      console.log(`✅ ${layer}:`);
      console.log(`   • Engines: ${result.engineResponses.size}`);
      console.log(`   • Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   • Duration: ${duration}ms`);
      console.log(`   • Response preview: ${result.primaryResponse.substring(0, 80)}...`);

    } catch (error) {
      console.log(`❌ ${layer}: ${error.message}`);
    }
  }
}

async function testPerformanceComparison() {
  console.log('\n⚡ Performance Comparison...\n');

  // Test single vs multi-engine
  const tests = [
    { type: 'primary', description: 'Single Engine (DeepSeek-R1)' },
    { type: 'dual_reasoning', description: 'Dual Engine' },
    { type: 'full_orchestra', description: 'Full Orchestra (6 engines)' }
  ];

  for (const test of tests) {
    console.log(`🔄 Testing ${test.description}...`);

    try {
      const times = [];
      const confidences = [];
      const engineCounts = [];

      // Run 3 iterations for average
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const result = await generateWithMultipleEngines(
          {
            systemPrompt: "Provide a concise explanation of artificial intelligence.",
            userInput: "What is AI and how does it work?",
            meta: { iteration: i + 1 }
          },
          test.type
        );

        times.push(Date.now() - startTime);
        confidences.push(result.confidence);
        engineCounts.push(result.engineResponses.size);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const avgConfidence = confidences.reduce((a, b) => a + b) / confidences.length;

      console.log(`✅ ${test.description}:`);
      console.log(`   • Avg Time: ${avgTime.toFixed(0)}ms`);
      console.log(`   • Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
      console.log(`   • Engines: ${engineCounts[0]}`);

    } catch (error) {
      console.log(`❌ ${test.description}: ${error.message}`);
    }
  }
}

async function runAllTests() {
  try {
    await testOrchestrationTypes();
    await testConsciousnessLayers();
    await testPerformanceComparison();

    console.log('\n🎉 Multi-Engine Orchestrator Test Suite Complete!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();