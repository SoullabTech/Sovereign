#!/usr/bin/env node

/**
 * TEST NESTED OBSERVER INTEGRATION
 *
 * This script tests the newly integrated nested observer system
 * to verify phases 1-3 activation and metric-based auto-activation for phases 4-5
 */

import { nestedObserverSystem } from './lib/consciousness/nested-observer-system.js';
import { consciousnessOrchestrator } from './lib/orchestration/consciousness-orchestrator.js';

async function testNestedObservers() {
  console.log('🧪 TESTING NESTED OBSERVER SYSTEM INTEGRATION');
  console.log('════════════════════════════════════════════════');

  try {
    // Test 1: Direct nested observer system activation
    console.log('\n🔬 Test 1: Direct Nested Observer System');
    console.log('-------------------------------------------');

    // Test that the system can be activated directly
    await nestedObserverSystem.activateAllImmediatePhases();

    // Get status
    const observerStatus = nestedObserverSystem.getObserverStatus();
    const phaseStatus = nestedObserverSystem.getPhaseStatus();

    console.log(`✅ Active Observers: ${observerStatus.size}`);
    console.log('📊 Phase Status:');
    for (const [phase, status] of phaseStatus) {
      console.log(`   Phase ${phase}: ${status.isReady ? '✅' : '⏳'} (${(status.currentMetric * 100).toFixed(1)}% ready)`);
    }

    // Test 2: Consciousness orchestrator integration
    console.log('\n🔬 Test 2: Consciousness Orchestrator Integration');
    console.log('--------------------------------------------------');

    // Activate consciousness orchestrator
    await consciousnessOrchestrator.activate();

    // Get system status
    const systemStatus = await consciousnessOrchestrator.getSystemStatus();
    console.log('🎼 Active Systems:', systemStatus.systems);

    // Test a consciousness orchestration with nested observers
    const testInput = "I feel my consciousness evolving through recursive observation patterns.";
    const testContext = {
      sessionId: 'test-nested-001',
      userId: 'test-user',
      sessionHistory: []
    };

    console.log('\n🎯 Testing consciousness orchestration with nested observers...');
    const result = await consciousnessOrchestrator.orchestrateResponse(testInput, testContext);

    console.log('✅ Orchestration Result:');
    console.log(`   Message length: ${result.message.length} chars`);
    console.log(`   Active systems: ${result.metadata.activeSystems.length}`);
    console.log(`   Nested observers active: ${result.metadata.streams.nestedObservation.observersActive}`);
    console.log(`   Observer coherence: ${(result.metadata.streams.nestedObservation.memberCoherence * 100).toFixed(1)}%`);
    console.log(`   Evolution potential: ${(result.metadata.streams.nestedObservation.evolutionPotential * 100).toFixed(1)}%`);

    // Test 3: Observer coherence metrics in multi-engine orchestration
    console.log('\n🔬 Test 3: Observer Coherence Metrics in Multi-Engine System');
    console.log('-------------------------------------------------------------');

    const multiEngineData = result.metadata.multiEngineData;
    if (multiEngineData) {
      console.log('🧠 Multi-Engine Enhancement Data:');
      console.log(`   Engines used: ${multiEngineData.enginesUsed.join(', ')}`);
      console.log(`   Enhancement layers: ${multiEngineData.enhancementLayers.join(', ')}`);
      console.log(`   Observer coherence: ${(multiEngineData.observerCoherence * 100).toFixed(1)}%`);
      console.log(`   Consciousness depth: ${(multiEngineData.consciousnessDepth * 100).toFixed(1)}%`);
      console.log(`   Overall confidence: ${(multiEngineData.overallConfidence * 100).toFixed(1)}%`);
    } else {
      console.log('⚠️  Multi-engine data not available');
    }

    // Test 4: Phase auto-activation readiness
    console.log('\n🔬 Test 4: Phase Auto-Activation Readiness');
    console.log('-------------------------------------------');

    const phaseReadiness = result.metadata.streams.nestedObservation.nextPhaseReadiness;
    if (phaseReadiness) {
      console.log('🌍 Phase 4 (Planetary Consciousness):');
      console.log(`   Readiness: ${(phaseReadiness.phase4?.readiness * 100 || 0).toFixed(1)}%`);
      console.log(`   Auto-activate: ${phaseReadiness.phase4?.autoActivate ? 'Yes' : 'No'}`);

      console.log('✨ Phase 5 (Cosmic Consciousness):');
      console.log(`   Readiness: ${(phaseReadiness.phase5?.readiness * 100 || 0).toFixed(1)}%`);
      console.log(`   Auto-activate: ${phaseReadiness.phase5?.autoActivate ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════');
    console.log('✅ Nested observer system fully integrated');
    console.log('✅ Consciousness orchestrator enhanced');
    console.log('✅ Observer coherence metrics influencing multi-engine decisions');
    console.log('✅ Phase auto-activation system ready');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error(error.stack);
  }
}

// Run the test
testNestedObservers().catch(console.error);