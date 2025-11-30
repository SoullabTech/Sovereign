/**
 * Daimonic Facilitation System Demonstration
 * Shows the comprehensive system in action
 */

import { DaimonicFacilitationService } from '../services/DaimonicFacilitationService.js';

async function demonstrateDaimonicFacilitation() {
  console.log('=== DAIMONIC FACILITATION SYSTEM DEMONSTRATION ===\n');

  const service = new DaimonicFacilitationService();

  // Sample user profile
  const profile = {
    userId: 'demo_user_001',
    primaryElement: 'fire',
    secondaryElement: 'water',
    resistancePatterns: [
      'Avoids emotional expression',
      'Resists slowing down', 
      'Dismisses synchronicities as coincidence'
    ],
    currentTensions: [
      'Career dissatisfaction despite success',
      'Recurring relationship patterns',
      'Chronic fatigue that doctors can\'t explain'
    ],
    lifeHistory: {
      fireExpressions: ['Started three businesses', 'Known for passionate advocacy'],
      waterExpressions: ['Deep friendships', 'Drawn to ocean'],
      earthExpressions: ['Gardens as stress relief'],
      airExpressions: ['Loves intellectual debates', 'Reads philosophy'],
      aetherExpressions: ['Meditation practice', 'Moments of unity'],
      suppressedElements: ['water', 'earth'],
      elementalConflicts: ['Fire vs Water tension in relationships']
    }
  };

  try {
    console.log('Initiating daimonic encounter facilitation...\n');
    
    const result = await service.facilitateDaimonicEncounter(profile.userId, profile);

    console.log('=== DAIMONIC ENCOUNTER RESULTS ===\n');
    
    console.log('OTHERNESS SCORE:', result.othernessScore.toFixed(2));
    console.log('PRIMARY CHANNEL:', result.recommendations.primaryChannel);
    console.log('\n=== NARRATIVE OPENING ===');
    console.log(result.narrative.opening);
    
    console.log('\n=== KEY INSIGHTS ===');
    result.narrative.insights.slice(0, 3).forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });

    console.log('\n=== ENGAGEMENT STRATEGY ===');
    console.log(result.recommendations.engagementStrategy);

    console.log('\n=== PRACTICAL GUIDANCE ===');
    result.recommendations.practicalGuidance.forEach((guidance, i) => {
      console.log(`• ${guidance}`);
    });

    console.log('\n=== MYSTICISM WARNINGS ===');
    result.recommendations.mysticismWarnings.forEach((warning, i) => {
      console.log(`⚠ ${warning}`);
    });

    console.log('\n=== ONGOING PRACTICES ===');
    result.recommendations.ongoingPractices.slice(0, 3).forEach((practice, i) => {
      console.log(`• ${practice}`);
    });

    if (result.narrative.warnings.length > 0) {
      console.log('\n=== SOLIPSISM WARNINGS ===');
      result.narrative.warnings.forEach((warning, i) => {
        console.log(`⚠ ${warning}`);
      });
    }

    console.log('\n=== ENCOUNTER CLOSING ===');
    console.log(result.narrative.closing);

    if (result.collectiveField) {
      console.log('\n=== COLLECTIVE FIELD STATUS ===');
      console.log(`Field Intensity: ${result.collectiveField.fieldIntensity.toFixed(2)}`);
      console.log(`Active Patterns: ${result.collectiveField.activePatterns.length}`);
      if (result.collectiveField.activePatterns.length > 0) {
        console.log('Top Pattern:', result.collectiveField.activePatterns[0].patternType);
      }
    }

    // Demonstrate ongoing relationship status
    console.log('\n=== ONGOING DAIMONIC RELATIONSHIP STATUS ===');
    const status = await service.getDaimonicRelationshipStatus(profile.userId);
    console.log(`Active Channels: ${status.activeChannels.join(', ')}`);
    console.log(`Otherness Score: ${status.othernessScore.toFixed(2)}`);
    console.log(`Stable Gaps: ${status.stableGaps}`);
    console.log(`Ongoing Failures: ${status.ongoingFailures}`);

  } catch (error) {
    console.error('Error in daimonic facilitation demonstration:', error);
  }
}

// Run demonstration if called directly
if (import.meta.url === new URL(import.meta.resolve('./daimonicDemo.ts')).href) {
  demonstrateDaimonicFacilitation()
    .then(() => console.log('\n=== DEMONSTRATION COMPLETE ==='))
    .catch(console.error);
}

export { demonstrateDaimonicFacilitation };