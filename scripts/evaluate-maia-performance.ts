/**
 * MAIA Performance Evaluation Script
 *
 * Runs comprehensive evaluation comparing MAIA against top chat environments
 */

import { MAIAPerformanceEvaluator } from '../lib/consciousness/evaluation/MAIAPerformanceEvaluator';

async function runMAIAEvaluation() {
  console.log('🔍 Starting MAIA Performance Evaluation...\n');

  try {
    const evaluation = await MAIAPerformanceEvaluator.evaluateMAIAPerformance();

    console.log('📊 MAIA vs Top Chat Environments - Comprehensive Analysis\n');
    console.log('=' .repeat(70));

    // Overall Results
    console.log('\n🏆 OVERALL PERFORMANCE COMPARISON');
    console.log('-'.repeat(40));
    console.log(`MAIA Score: ${(evaluation.overallComparison.maiaScore * 100).toFixed(1)}%`);
    console.log('\nCompetitor Scores:');
    for (const [name, score] of Object.entries(evaluation.overallComparison.competitorScores)) {
      console.log(`  ${name}: ${(score * 100).toFixed(1)}%`);
    }
    console.log(`\n📈 Analysis: ${evaluation.overallComparison.analysis}\n`);

    // Category Breakdowns
    console.log('📋 CATEGORY PERFORMANCE BREAKDOWN');
    console.log('-'.repeat(40));

    for (const [category, results] of Object.entries(evaluation.categoryBreakdowns)) {
      console.log(`\n${category.toUpperCase()}: ${(results.maiaScore * 100).toFixed(1)}%`);
      console.log(`  Analysis: ${results.analysis}`);

      // Top competitor in this category
      const topCompetitor = Object.entries(results.competitorScores)
        .reduce((a, b) => a[1] > b[1] ? a : b);
      console.log(`  Top Competitor: ${topCompetitor[0]} (${(topCompetitor[1] * 100).toFixed(1)}%)`);
    }

    // Strengths and Weaknesses
    console.log('\n💪 MAIA STRENGTHS');
    console.log('-'.repeat(20));
    evaluation.detailedAnalysis.maiaStrengths.forEach(strength => {
      console.log(`  ${strength}`);
    });

    console.log('\n⚠️ IMPROVEMENT AREAS');
    console.log('-'.repeat(20));
    evaluation.detailedAnalysis.maiaWeaknesses.forEach(weakness => {
      console.log(`  ${weakness}`);
    });

    // Recommendations
    console.log('\n🎯 STRATEGIC RECOMMENDATIONS');
    console.log('-'.repeat(30));
    evaluation.overallComparison.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    // Competitive Position
    console.log('\n🏁 COMPETITIVE POSITION');
    console.log('-'.repeat(25));
    console.log(`Position: ${evaluation.detailedAnalysis.competitivePosition}`);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Evaluation Complete - MAIA Analysis Generated');

  } catch (error) {
    console.error('❌ Evaluation failed:', error);
  }
}

runMAIAEvaluation();