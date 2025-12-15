// test-learning-pipeline.ts

/**
 * TEST LEARNING PIPELINE
 *
 * Demonstrates the Claude-as-teacher learning system where:
 * 1. Claude generates gold-standard MAIA responses with reasoning traces
 * 2. Local models (DeepSeek) learn from these examples
 * 3. Claude evaluates local model responses and provides feedback
 * 4. System gradually hands off from Claude to local models
 */

import { getEnhancedMaiaResponse } from './lib/learning/enhanced-maia-service';
import { learningOrchestrator } from './lib/learning/learning-orchestrator';
import { generateTeacherExample, getTeacherFeedback, loadTrainingExamples } from './lib/learning/claude-teacher-service';

async function testLearningPipeline() {
  console.log('🎓 Testing Claude-as-Teacher Learning Pipeline\n');

  // Test scenarios that represent different complexity levels
  const testScenarios = [
    {
      name: 'Simple Greeting',
      message: 'Hi MAIA, how are you today?',
      sessionId: 'test-greeting',
      expectedModel: 'deepseek', // Should use local model for simple greetings
    },
    {
      name: 'Emotional Complexity',
      message: 'I\'m feeling overwhelmed and lost. Everything in my life feels like it\'s falling apart.',
      sessionId: 'test-emotional',
      expectedModel: 'claude', // Should use Claude for emotional complexity
    },
    {
      name: 'Potential Rupture',
      message: 'This conversation isn\'t helping at all. You\'re not listening to what I\'m saying.',
      sessionId: 'test-rupture',
      expectedModel: 'claude', // Should always use Claude for ruptures
    },
    {
      name: 'Depth Work',
      message: 'I keep finding myself in the same relationship patterns. I feel like I\'m unconsciously choosing partners who aren\'t emotionally available.',
      sessionId: 'test-depth',
      expectedModel: 'claude', // Should use Claude for depth work
    }
  ];

  console.log('📊 Phase 1: Testing Learning Decision System\n');

  for (const scenario of testScenarios) {
    console.log(`Testing: ${scenario.name}`);
    console.log(`Message: "${scenario.message}"`);

    // Test the learning orchestrator's decision making
    const decision = await learningOrchestrator.decideModel(
      scenario.message,
      [], // Empty conversation history
      scenario.sessionId
    );

    console.log(`🤖 Decision: Use ${decision.useModel} model (confidence: ${decision.confidence})`);
    console.log(`💭 Reasoning: ${decision.reasoning}`);
    console.log(`📚 Collect training: ${decision.collectAsTraining}\n`);
  }

  console.log('🎯 Phase 2: Generating Claude Teacher Examples\n');

  // Generate gold-standard responses with reasoning traces
  for (const scenario of testScenarios.slice(1, 3)) { // Test emotional and rupture scenarios
    console.log(`Generating teacher example for: ${scenario.name}`);

    const teacherExample = await generateTeacherExample(
      scenario.message,
      [], // Empty history
      scenario.sessionId
    );

    console.log(`👨‍🏫 Claude's Response: "${teacherExample.claudeResponse}"`);
    console.log(`🧠 Reasoning Trace: ${teacherExample.reasoningTrace.substring(0, 200)}...`);
    console.log(`📝 Situation Type: ${teacherExample.situationType}`);
    console.log(`✅ Confidence: ${teacherExample.confidence}\n`);
  }

  console.log('📈 Phase 3: Testing Local Model vs Teacher Feedback\n');

  // Simulate local model response and get Claude's feedback
  const testMessage = 'I feel like I\'m not living up to my potential and it\'s really bothering me.';
  const simulatedLocalResponse = 'I understand you\'re feeling this way. Have you considered setting some goals to help you reach your potential? Sometimes breaking things down into smaller steps can help.';

  console.log(`User: "${testMessage}"`);
  console.log(`Local Model: "${simulatedLocalResponse}"`);

  const feedback = await getTeacherFeedback(
    testMessage,
    simulatedLocalResponse,
    []
  );

  console.log(`\n👨‍🏫 Claude's Evaluation:`);
  console.log(`⭐ Score: ${feedback.score}/10`);
  console.log(`✅ What worked: ${feedback.claudeEvaluation.match(/WHAT_WORKED:\s*(.+?)(?=\n|IMPROVEMENTS)/s)?.[1]?.trim() || 'Not specified'}`);
  console.log(`🔧 Should use Claude instead: ${feedback.shouldUseClaudeInstead}`);
  console.log(`💡 Improvements needed: ${feedback.improvements.slice(0, 2).join(', ')}\n`);

  console.log('🚀 Phase 4: Testing Enhanced MAIA Service\n');

  // Test the enhanced service with learning enabled
  for (const scenario of testScenarios.slice(0, 2)) {
    console.log(`Testing enhanced service: ${scenario.name}`);

    const result = await getEnhancedMaiaResponse({
      sessionId: scenario.sessionId,
      input: scenario.message,
      enableLearning: true,
      meta: { testMode: true }
    });

    console.log(`🤖 Model used: ${result.modelUsed}`);
    console.log(`⚡ Processing time: ${result.processingTimeMs}ms`);
    console.log(`💬 Response: "${result.text}"`);

    if (result.learningData) {
      console.log(`📊 Learning data:`);
      if (result.learningData.teacherMode) {
        console.log(`   👨‍🏫 Teacher mode: ${result.learningData.teacherMode}`);
        console.log(`   📝 Situation: ${result.learningData.situationType}`);
      }
      if (result.learningData.localModel) {
        console.log(`   🎓 Local model feedback score: ${result.learningData.teacherFeedback?.score}/10`);
      }
    }
    console.log('');
  }

  console.log('📚 Phase 5: Check Training Data Collection\n');

  // Check what training examples have been collected
  const allExamples = await loadTrainingExamples();
  console.log(`Total training examples collected: ${allExamples.length}`);

  const situationCounts = allExamples.reduce((acc, example) => {
    acc[example.situationType] = (acc[example.situationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Examples by situation type:');
  Object.entries(situationCounts).forEach(([situation, count]) => {
    console.log(`  ${situation}: ${count} examples`);
  });

  console.log('\n🎓 Learning Pipeline Test Complete!');
  console.log('\nKey Insights:');
  console.log('1. Claude acts as external teacher, providing gold-standard responses');
  console.log('2. Local models learn from Claude\'s examples and reasoning traces');
  console.log('3. Claude evaluates local model performance and provides feedback');
  console.log('4. System gradually hands off simple interactions to local models');
  console.log('5. Claude remains available for complex situations and rupture repair');
}

// Helper function to demonstrate the learning progression over time
async function simulateLearningProgression() {
  console.log('\n🔄 Simulating Learning Progression Over Time\n');

  const progression = [
    { week: 1, claudeThreshold: 0.9, description: 'Mostly Claude, collecting training data' },
    { week: 4, claudeThreshold: 0.7, description: 'Claude for complex situations, local for simple' },
    { week: 8, claudeThreshold: 0.5, description: 'Balanced mix based on complexity' },
    { week: 12, claudeThreshold: 0.3, description: 'Mostly local, Claude for edge cases' }
  ];

  for (const phase of progression) {
    console.log(`Week ${phase.week}: Claude threshold ${phase.claudeThreshold}`);
    console.log(`Strategy: ${phase.description}`);

    // Simulate decision for a moderately complex message
    const testMessage = 'I\'ve been thinking about my career and whether I\'m on the right path.';

    // Mock the decision logic based on the threshold
    const complexity = 0.6; // Moderate complexity
    const usesClaude = complexity > phase.claudeThreshold;

    console.log(`  Message complexity: ${complexity}`);
    console.log(`  Would use: ${usesClaude ? 'Claude (teacher)' : 'Local model (student)'}`);
    console.log('');
  }

  console.log('🎯 End state: Local models handle 70% of conversations');
  console.log('Claude remains as teacher and handles complex/sensitive situations');
}

// Run the tests
async function runTests() {
  try {
    await testLearningPipeline();
    await simulateLearningProgression();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}