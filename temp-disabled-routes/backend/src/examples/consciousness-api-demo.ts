#!/usr/bin/env npx ts-node
/**
 * 🌌 Consciousness API Demo Script
 * 
 * This demonstrates the new DI-based architecture and shows how the
 * ConsciousnessAPI facade unifies all consciousness interactions.
 * 
 * Run: npx ts-node backend/src/examples/consciousness-api-demo.ts
 */

import { initializeServices } from '../core/bootstrap';
import { get, SERVICE_KEYS } from '../core/di/container';
import { ConsciousnessAPI } from '../api/ConsciousnessAPI';
import type { IEventEmitter, IAnalytics } from '../core/interfaces';

async function demonstrateConsciousnessAPI() {
  console.log('🌌 AIN Consciousness API Demo\n');

  // ====================================================================
  // STEP 1: Initialize the platform
  // ====================================================================
  console.log('🚀 Initializing AIN Platform...');
  await initializeServices({
    environment: 'development',
    cache: {
      maxSize: 1000,
      defaultTtlSeconds: 300
    },
    analytics: {
      maxEvents: 5000,
      persistenceEnabled: false
    },
    services: {
      enableDebugLogging: true,
      enableHealthChecks: true
    }
  });
  console.log('✅ Platform initialized!\n');

  // ====================================================================
  // STEP 2: Get services from DI container
  // ====================================================================
  console.log('🔗 Getting services from DI container...');
  const api = get<ConsciousnessAPI>(SERVICE_KEYS.CONSCIOUSNESS_API);
  const eventEmitter = get<IEventEmitter>(SERVICE_KEYS.EVENT_EMITTER);
  const analytics = get<IAnalytics>(SERVICE_KEYS.ANALYTICS);
  console.log('✅ Services retrieved!\n');

  // ====================================================================
  // STEP 3: Set up event listening
  // ====================================================================
  console.log('👂 Setting up event listeners...');
  
  eventEmitter.on('chat.completed', (event) => {
    console.log(`📊 Chat completed: ${event.payload.userId} | Latency: ${event.payload.latencyMs}ms`);
  });

  eventEmitter.on('voice.ready', (event) => {
    console.log(`🎵 Voice synthesis ready: ${event.payload.voiceUrl}`);
  });

  eventEmitter.on('system.health', (event) => {
    console.log(`🏥 System health: Error rate ${event.payload.errorRate}% | Avg latency ${event.payload.averageLatency}ms`);
  });

  console.log('✅ Event listeners configured!\n');

  // ====================================================================
  // STEP 4: Demonstrate consciousness interactions
  // ====================================================================
  console.log('💫 Testing consciousness interactions...\n');

  // Test different elemental queries
  const testQueries = [
    { element: 'fire' as const, text: 'I need motivation to start my creative project' },
    { element: 'water' as const, text: 'I am feeling emotionally overwhelmed lately' },
    { element: 'earth' as const, text: 'Help me create a structured plan for my goals' },
    { element: 'air' as const, text: 'I need clarity on a difficult decision' },
    { element: 'aether' as const, text: 'What is the deeper meaning of my recent dreams?' }
  ];

  for (const query of testQueries) {
    console.log(`🔸 ${query.element.toUpperCase()} Query: "${query.text}"`);
    
    try {
      const response = await api.chat({
        userId: 'demo-user',
        text: query.text,
        element: query.element,
        sessionId: 'demo-session'
      });

      console.log(`   ✨ Response: ${response.text.substring(0, 100)}...`);
      console.log(`   📊 Metadata: ${response.meta.element} | ${response.meta.latencyMs}ms | ${response.tokens.completion} tokens`);
      
      // Test voice generation
      if (query.element === 'fire') {
        console.log(`   🎵 Generating voice for ${query.element} element...`);
        await api.generateVoice({
          text: response.text.substring(0, 100),
          voiceId: 'maya'
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log(); // Empty line for readability
  }

  // ====================================================================
  // STEP 5: Demonstrate analytics and insights
  // ====================================================================
  console.log('📈 Analytics and Insights...\n');

  // Get user insights
  try {
    const userMetrics = await api.getUserInsights('demo-user');
    console.log('👤 User Metrics:');
    console.log(`   Sessions: ${userMetrics.totalSessions}`);
    console.log(`   Queries: ${userMetrics.totalQueries}`);
    console.log(`   Favorite Elements: ${userMetrics.favoriteElements.join(', ')}`);
    console.log(`   Consciousness Growth: ${userMetrics.consciousnessGrowth}`);
  } catch (error) {
    console.log(`   ❌ User metrics error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log();

  // Get system health
  try {
    const systemHealth = await api.getSystemHealth();
    console.log('🏥 System Health:');
    console.log(`   Status: ${systemHealth.status}`);
    console.log(`   Total Users: ${systemHealth.metrics.totalUsers}`);
    console.log(`   Active Users (24h): ${systemHealth.metrics.activeUsers24h}`);
    console.log(`   Average Response Time: ${systemHealth.metrics.averageResponseTime}ms`);
    console.log(`   Error Rate: ${systemHealth.metrics.errorRate}%`);
    console.log(`   Services: ${Object.keys(systemHealth.services).join(', ')}`);
  } catch (error) {
    console.log(`   ❌ System health error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log();

  // ====================================================================
  // STEP 6: Demonstrate conversation history
  // ====================================================================
  console.log('📚 Conversation History...\n');

  try {
    const history = await api.getConversationHistory('demo-user', 'demo-session');
    console.log(`📖 Session: ${history.sessionId}`);
    console.log(`   Turns: ${history.turns.length}`);
    console.log(`   Created: ${history.createdAt.toISOString()}`);
    
    if (history.turns.length > 0) {
      console.log('   Recent turns:');
      history.turns.slice(-3).forEach(turn => {
        console.log(`     ${turn.role}: ${turn.content.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.log(`   ❌ History error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log();

  // ====================================================================
  // STEP 7: Show analytics data
  // ====================================================================
  console.log('📊 Analytics Event History...\n');

  const analyticsImpl = analytics as any; // Cast to access internal methods
  if (analyticsImpl.getEventHistory) {
    const eventHistory = analyticsImpl.getEventHistory('chat.completed');
    console.log(`   Chat Events: ${eventHistory.length}`);
    eventHistory.slice(-3).forEach((event: any) => {
      console.log(`     ${event.timestamp.toISOString()}: ${event.properties.element} query by ${event.userId}`);
    });
  }

  console.log();

  // ====================================================================
  // FINAL: Demo complete
  // ====================================================================
  console.log('🎉 Consciousness API Demo Complete!\n');
  console.log('Key Features Demonstrated:');
  console.log('  ✅ Dependency injection container');
  console.log('  ✅ Unified ConsciousnessAPI facade');
  console.log('  ✅ Event-driven architecture');
  console.log('  ✅ Elemental query processing');
  console.log('  ✅ Analytics and metrics');
  console.log('  ✅ Voice synthesis integration');
  console.log('  ✅ Memory and conversation history');
  console.log('  ✅ System health monitoring');
  console.log();
  console.log('🌌 The AIN platform is ready for scalable consciousness interactions!');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateConsciousnessAPI()
    .then(() => {
      console.log('\n✨ Demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Demo failed:', error);
      process.exit(1);
    });
}