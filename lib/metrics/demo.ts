/**
 * Demo Script for Psychospiritual Metrics Engine
 * Run with: npx tsx lib/metrics/demo.ts
 */

import { soulprintTracker } from '../beta/SoulprintTracking';
import { metricsEngine } from './PsychospiritualMetricsEngine';

console.log('🌟 Psychospiritual Metrics Engine Demo\n');

const demoUserId = 'demo_user_001';

console.log('1️⃣  Creating demo soulprint...\n');
const soulprint = soulprintTracker.createSoulprint(demoUserId, 'Demo User');

console.log('2️⃣  Tracking symbols...\n');
soulprintTracker.trackSymbol(demoUserId, 'White Stag', 'Initial guidance vision', 'air');
soulprintTracker.trackSymbol(demoUserId, 'River', 'Crossing threshold', 'water');
soulprintTracker.trackSymbol(demoUserId, 'Mirror', 'Self-reflection moment', 'aether');
soulprintTracker.trackSymbol(demoUserId, 'White Stag', 'Recurring guidance', 'air');

console.log('3️⃣  Tracking archetypal shifts...\n');
soulprintTracker.trackArchetypeShift(demoUserId, 'Seeker', {
  trigger: 'Beginning of journey',
  integrationLevel: 0.5
});
soulprintTracker.trackArchetypeShift(demoUserId, 'Shadow', {
  fromArchetype: 'Seeker',
  trigger: 'Confronting fears',
  shadowWork: true,
  integrationLevel: 0.6
});
soulprintTracker.trackArchetypeShift(demoUserId, 'Healer', {
  fromArchetype: 'Shadow',
  trigger: 'Integration ritual',
  shadowWork: true,
  integrationLevel: 0.75
});

console.log('4️⃣  Updating elemental balance...\n');
soulprintTracker.updateElementalBalance(demoUserId, 'water', 0.3);
soulprintTracker.updateElementalBalance(demoUserId, 'air', 0.2);
soulprintTracker.updateElementalBalance(demoUserId, 'aether', 0.25);

console.log('5️⃣  Adding milestones...\n');
soulprintTracker.addMilestone(
  demoUserId,
  'threshold',
  'Crossed from innocence to awareness',
  'major',
  { spiralogicPhase: 'entry', element: 'water' }
);
soulprintTracker.addMilestone(
  demoUserId,
  'shadow-encounter',
  'Met the shadow self',
  'pivotal',
  { spiralogicPhase: 'descent', element: 'earth' }
);

console.log('6️⃣  Tracking emotional states...\n');
soulprintTracker.trackEmotionalState(demoUserId, 0.6, ['curiosity', 'anticipation']);
soulprintTracker.trackEmotionalState(demoUserId, 0.3, ['fear', 'confusion']);
soulprintTracker.trackEmotionalState(demoUserId, 0.7, ['clarity', 'peace', 'joy']);

console.log('7️⃣  Generating comprehensive metrics snapshot...\n');
const snapshot = metricsEngine.generateComprehensiveSnapshot(demoUserId);

if (snapshot) {
  console.log('📊 METRICS SNAPSHOT\n');
  console.log('═'.repeat(60));

  console.log('\n🧬 Soulprint Overview');
  console.log(`   Journey Duration: ${snapshot.journeyDuration} days`);
  console.log(`   Current Phase: ${snapshot.spiralogicPhase.currentPhase}`);

  console.log('\n📈 Growth Index');
  console.log(`   Overall Score: ${(snapshot.growthIndex.overallScore * 100).toFixed(1)}%`);
  console.log(`   Trend: ${snapshot.growthIndex.trend}`);
  console.log('\n   Components:');
  Object.entries(snapshot.growthIndex.components).forEach(([key, value]) => {
    console.log(`   - ${key}: ${(value * 100).toFixed(1)}%`);
  });

  console.log('\n🎭 Archetype Coherence');
  console.log(`   Coherence Score: ${(snapshot.archetypeCoherence.score * 100).toFixed(1)}%`);
  console.log(`   Active Archetypes: ${snapshot.archetypeCoherence.activeArchetypes.join(', ')}`);
  if (snapshot.archetypeCoherence.tensions.length > 0) {
    console.log('   Tensions:');
    snapshot.archetypeCoherence.tensions.forEach(t => {
      console.log(`   - ${t.from} ⚡ ${t.to} (${(t.tensionLevel * 100).toFixed(0)}%)`);
    });
  }

  console.log('\n💫 Emotional Landscape');
  console.log(`   Volatility Index: ${(snapshot.emotionalLandscape.volatilityIndex * 100).toFixed(1)}%`);
  console.log(`   Trend: ${snapshot.emotionalLandscape.trendDirection}`);
  console.log(`   Dominant Emotions: ${snapshot.emotionalLandscape.dominantEmotions.map(e => e.emotion).join(', ')}`);
  if (snapshot.emotionalLandscape.repressedEmotions.length > 0) {
    console.log(`   Repressed: ${snapshot.emotionalLandscape.repressedEmotions.join(', ')}`);
  }

  console.log('\n🔮 Symbolic Evolution');
  console.log(`   Active Symbols: ${snapshot.symbolicEvolution.activeSymbolCount}`);
  console.log(`   Symbol Diversity: ${(snapshot.symbolicEvolution.symbolDiversity * 100).toFixed(1)}%`);
  console.log('   Top Symbols:');
  snapshot.symbolicEvolution.topSymbols.forEach(s => {
    console.log(`   - ${s.symbol} (${s.frequency}x) [${s.elementalResonance || 'neutral'}]`);
  });

  console.log('\n🌀 Narrative Progression');
  console.log(`   Active Threads: ${snapshot.narrativeProgression.activeThreads}`);
  console.log(`   Completed: ${snapshot.narrativeProgression.completedThreads}`);
  console.log(`   Coherence: ${(snapshot.narrativeProgression.narrativeCoherence * 100).toFixed(1)}%`);
  console.log(`   Breakthroughs (last 30d): ${snapshot.narrativeProgression.breakthroughFrequency}`);

  console.log('\n🌑 Shadow Integration');
  console.log(`   Integration Score: ${(snapshot.shadowIntegration.integrationScore * 100).toFixed(1)}%`);
  console.log(`   Shadow Work Frequency: ${snapshot.shadowIntegration.shadowWorkFrequency}/month`);
  if (snapshot.shadowIntegration.suppressedArchetypes.length > 0) {
    console.log(`   Suppressed Archetypes: ${snapshot.shadowIntegration.suppressedArchetypes.join(', ')}`);
  }

  console.log('\n🔥 Ritual Integration');
  console.log(`   Completion Rate: ${(snapshot.ritualIntegration.completionRate * 100).toFixed(1)}%`);
  console.log(`   Average Depth: ${(snapshot.ritualIntegration.averageDepth * 100).toFixed(1)}%`);
  console.log(`   Total Rituals: ${snapshot.ritualIntegration.totalRituals}`);

  if (snapshot.alerts.length > 0) {
    console.log('\n⚠️  ALERTS');
    snapshot.alerts.forEach(alert => console.log(`   - ${alert}`));
  }

  if (snapshot.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    snapshot.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }

  console.log('\n' + '═'.repeat(60));
}

console.log('\n8️⃣  Generating aggregated metrics...\n');
const aggregated = metricsEngine.generateAggregatedMetrics();
console.log('📊 AGGREGATED METRICS');
console.log(`   Total Users: ${aggregated.totalUsers}`);
console.log(`   Average Growth Index: ${(aggregated.averageGrowthIndex * 100).toFixed(1)}%`);
console.log(`   Average Shadow Integration: ${(aggregated.averageShadowIntegration * 100).toFixed(1)}%`);
console.log(`   Total Breakthroughs: ${aggregated.totalBreakthroughs}`);
console.log('\n   Phase Distribution:');
Object.entries(aggregated.phaseDistribution).forEach(([phase, count]) => {
  console.log(`   - ${phase}: ${count} user(s)`);
});
console.log('\n   Archetype Frequency:');
Object.entries(aggregated.archetypeFrequency).forEach(([arch, count]) => {
  console.log(`   - ${arch}: ${count} occurrences`);
});

console.log('\n✅ Demo complete!\n');
console.log('💡 Next steps:');
console.log('   1. Integrate with MAIA orchestrator');
console.log('   2. Build dashboard UI (React components)');
console.log('   3. Add real-time metric tracking');
console.log('   4. Create PDF report generator\n');