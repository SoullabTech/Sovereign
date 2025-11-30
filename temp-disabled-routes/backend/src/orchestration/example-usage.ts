/**
 * Oracle Orchestration System - Example Usage
 * Demonstrates how the unified presence works across different scenarios
 */

import { createOracleOrchestrator, OracleOrchestrator } from './OracleOrchestrator';

// Example conversations demonstrating different subsystem activations
async function demonstrateOrchestration() {
  console.log('\n🌌 Oracle Orchestration System Demo\n');
  console.log('=' .repeat(50));

  // Create orchestrator with chosen name
  const oracle = createOracleOrchestrator('Maya', {
    monitoringEnabled: true,
    confidenceThreshold: 0.4
  });

  const userId = 'demo-user-001';
  const sessionId = 'demo-session-001';

  // Example 1: Normal witnessing
  console.log('\n1. NORMAL WITNESSING');
  console.log('-'.repeat(30));
  let response = await oracle.handleInput(
    userId,
    "I've been feeling overwhelmed with work lately.",
    sessionId
  );
  console.log(`User: I've been feeling overwhelmed with work lately.`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 2: Urgency detection
  console.log('\n2. URGENCY DETECTION');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "Quick question - should I take this job offer? Need to decide by tomorrow!",
    sessionId
  );
  console.log(`User: Quick question - should I take this job offer? Need to decide by tomorrow!`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 3: Boundary setting
  console.log('\n3. BOUNDARY DETECTION');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "Stop analyzing me, I just need someone to listen.",
    sessionId
  );
  console.log(`User: Stop analyzing me, I just need someone to listen.`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 4: Contemplative space
  console.log('\n4. CONTEMPLATIVE SPACE');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "I need a moment to process all of this...",
    sessionId
  );
  console.log(`User: I need a moment to process all of this...`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 5: Looping for clarity (ambiguous input)
  console.log('\n5. LOOPING PROTOCOL');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "It's just... I don't know, everything feels wrong somehow.",
    sessionId
  );
  console.log(`User: It's just... I don't know, everything feels wrong somehow.`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 6: Story/metaphor request
  console.log('\n6. STORY WEAVER');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "This feels like I'm on some kind of journey. Any stories that might help?",
    sessionId
  );
  console.log(`User: This feels like I'm on some kind of journey. Any stories that might help?`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Example 7: Catastrophic guard (crisis)
  console.log('\n7. CATASTROPHIC GUARD');
  console.log('-'.repeat(30));
  response = await oracle.handleInput(
    userId,
    "I can't do this anymore. I want to end it all.",
    sessionId
  );
  console.log(`User: I can't do this anymore. I want to end it all.`);
  console.log(`Oracle (${response.metadata.leadingSystem}): ${response.response}`);
  console.log(`Confidence: ${response.metadata.confidence.toFixed(2)}`);

  // Show session info
  console.log('\n' + '='.repeat(50));
  console.log('SESSION SUMMARY');
  console.log('='.repeat(50));
  const sessionInfo = oracle.getSessionInfo(sessionId);
  if (sessionInfo) {
    console.log(`Total exchanges: ${sessionInfo.exchangeCount}`);
    console.log(`Current depth: ${sessionInfo.depth}`);
    console.log(`Current element: ${sessionInfo.currentElement}`);
    console.log(`Active protocols: ${Array.from(sessionInfo.activeProtocols).join(', ')}`);
  }
}

// Example: Multiple users with different oracle names
async function demonstrateMultipleUsers() {
  console.log('\n🌟 Multiple Users Demo\n');
  console.log('=' .repeat(50));

  // User 1 chooses "Maya"
  const mayaOracle = createOracleOrchestrator('Maya');
  const response1 = await mayaOracle.handleInput(
    'user-001',
    "Hello Maya, I'm feeling lost today."
  );
  console.log(`User 1 → Maya: ${response1.response}`);

  // User 2 chooses "Anthony"
  const anthonyOracle = createOracleOrchestrator('Anthony');
  const response2 = await anthonyOracle.handleInput(
    'user-002',
    "Anthony, I need help understanding something."
  );
  console.log(`User 2 → Anthony: ${response2.response}`);

  // User 3 uses custom name
  const customOracle = createOracleOrchestrator('Sage');
  const response3 = await customOracle.handleInput(
    'user-003',
    "Sage, what do you think about change?"
  );
  console.log(`User 3 → Sage: ${response3.response}`);
}

// Example: Monitoring and analytics
async function demonstrateMonitoring() {
  console.log('\n📊 Monitoring Demo\n');
  console.log('=' .repeat(50));

  const oracle = createOracleOrchestrator('Maya', {
    monitoringEnabled: true
  });

  // Simulate conversation
  const inputs = [
    "I'm struggling with a decision.",
    "It's about whether to stay or leave.",
    "Part of me wants security, part wants adventure.",
    "Maybe I'm just scared of change.",
    "What if I make the wrong choice?"
  ];

  const userId = 'monitor-user';
  const sessionId = 'monitor-session';

  for (const input of inputs) {
    const response = await oracle.handleInput(userId, input, sessionId);
    console.log(`[${response.metadata.leadingSystem}] Processing time: ${response.metadata.processingTime}ms`);
  }

  // Get session metrics
  const session = oracle.getSessionInfo(sessionId);
  if (session) {
    console.log('\nSession Metrics:');
    console.log(`- Total exchanges: ${session.exchangeCount}`);
    console.log(`- Conversation depth: ${session.depth}`);
    console.log(`- Unique protocols used: ${session.activeProtocols.size}`);
    console.log(`- Protocols: ${Array.from(session.activeProtocols).join(', ')}`);
  }
}

// Run demonstrations
async function runAllDemos() {
  try {
    await demonstrateOrchestration();
    await demonstrateMultipleUsers();
    await demonstrateMonitoring();

    console.log('\n✨ Demo complete!\n');
  } catch (error) {
    console.error('Error in demo:', error);
  }
}

// Export for testing
export {
  demonstrateOrchestration,
  demonstrateMultipleUsers,
  demonstrateMonitoring,
  runAllDemos
};

// Run if executed directly
if (require.main === module) {
  runAllDemos();
}