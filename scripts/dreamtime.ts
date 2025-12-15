#!/usr/bin/env npx tsx
// scripts/dreamtime.ts
// MAIA Dreamtime Processing Script - Run nightly to process learning candidates

import LearningSystemOrchestrator from '../lib/learning/learningSystemOrchestrator';

async function runDreamtimeProcessing() {
  console.log('🌙 MAIA DREAMTIME PROCESSING STARTING...');
  console.log('===================================================');

  try {
    // Check system health first
    const healthCheck = await LearningSystemOrchestrator.healthCheck();
    console.log(`🏥 System Status: ${healthCheck.status}`);

    if (healthCheck.status === 'critical') {
      console.log('🚨 CRITICAL ISSUES DETECTED:');
      healthCheck.recommendations.forEach(rec => console.log(`   • ${rec}`));
      console.log('⚠️  Continuing with degraded processing...\n');
    }

    // Get current learning analytics
    console.log('📊 PRE-PROCESSING ANALYTICS:');
    const analytics = await LearningSystemOrchestrator.getLearningAnalytics();
    console.log(`   System Health: ${analytics.systemHealth.isHealthy ? '✅ Healthy' : '⚠️  Issues'}`);
    console.log(`   Recent Turns: ${analytics.systemHealth.recentTurns}`);
    console.log(`   Recent Feedback: ${analytics.systemHealth.recentFeedback}`);
    console.log(`   Gold Responses: ${analytics.systemHealth.goldResponsesCount}`);
    console.log(`   Pending Reviews: ${analytics.systemHealth.pendingReviews}`);
    console.log(`   Loop D Ruptures: ${analytics.loopD.rupturesThisWeek} this week`);
    if (analytics.loopD.criticalPatterns.length > 0) {
      console.log(`   Critical Patterns: ${analytics.loopD.criticalPatterns.join(', ')}`);
    }
    console.log('');

    // Run dreamtime processing
    const result = await LearningSystemOrchestrator.runDreamtimeProcessing(24, 100);

    console.log('🌙 DREAMTIME PROCESSING COMPLETE');
    console.log('===================================');
    console.log(`   Operation ID: ${result.operationId}`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Turns Processed: ${result.turnsProcessed}`);
    console.log(`   Gold Responses Created: ${result.goldResponsesCreated}`);
    console.log(`   Comparisons Reviewed: ${result.comparisonsReviewed}`);
    console.log(`   Patterns Identified: ${result.patternsIdentified.length}`);
    console.log('');

    if (result.patternsIdentified.length > 0) {
      console.log('🔍 PATTERNS IDENTIFIED:');
      result.patternsIdentified.forEach(pattern => console.log(`   • ${pattern}`));
      console.log('');
    }

    if (result.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      result.recommendations.forEach(rec => console.log(`   • ${rec}`));
      console.log('');
    }

    if (result.errors.length > 0) {
      console.log('⚠️  ERRORS ENCOUNTERED:');
      result.errors.forEach(error => console.log(`   • ${error}`));
      console.log('');
    }

    // Generate learning recommendations
    const recommendations = await LearningSystemOrchestrator.generateLearningRecommendations();
    if (recommendations.length > 0) {
      console.log('📋 LEARNING RECOMMENDATIONS:');
      recommendations.forEach(rec => {
        const priority = rec.priority === 'critical' ? '🚨' :
                        rec.priority === 'high' ? '🔥' :
                        rec.priority === 'medium' ? '⚡' : '💡';
        console.log(`   ${priority} ${rec.title}`);
        console.log(`      ${rec.description}`);
        console.log(`      Loops affected: ${rec.affectedLoops.join(', ')}`);
        console.log('');
      });
    }

    // Final analytics
    const finalAnalytics = await LearningSystemOrchestrator.getLearningAnalytics();
    console.log('📈 POST-PROCESSING ANALYTICS:');
    console.log(`   Feedback Rate: ${finalAnalytics.loopA.feedbackRate} entries`);
    console.log(`   Average Attunement: ${finalAnalytics.loopA.averageAttunement.toFixed(2)}/5`);
    console.log(`   Repair Rate: ${(finalAnalytics.loopA.repairRate * 100).toFixed(1)}%`);
    console.log(`   Gold Approval Rate: ${finalAnalytics.loopB.approvalRate.toFixed(1)}%`);
    console.log(`   Engine Review Progress: ${finalAnalytics.loopC.reviewProgress.toFixed(1)}%`);
    console.log(`   Best Engine: ${finalAnalytics.loopC.bestPerformingEngine}`);
    console.log('');

    console.log('🌅 DREAMTIME PROCESSING COMPLETE - MAIA\'S LEARNING CONTINUES');

  } catch (error) {
    console.error('❌ DREAMTIME PROCESSING FAILED:', error);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  runDreamtimeProcessing().catch(console.error);
}

export { runDreamtimeProcessing };