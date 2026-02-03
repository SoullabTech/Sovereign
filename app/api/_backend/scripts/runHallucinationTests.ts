#!/usr/bin/env tsx

import { HallucinationTestRunner, generateSeed, type TestConfig } from '../src/services/hallucination-testing';
import { createMaiaModelRunner } from '../src/services/hallucination-testing/maiaModelRunner';
import { generateMarkdownReport } from '../src/services/hallucination-testing/reporter';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const seed = args[0] || generateSeed('cli-test');
  const countPerDomain = parseInt(args[1]) || 5;

  console.log('🧪 MAIA Hallucination Test Suite');
  console.log('================================\n');
  console.log(`Seed: ${seed}`);
  console.log(`Count per domain: ${countPerDomain}\n`);

  const config: TestConfig = {
    seed,
    domains: ['math', 'citation', 'wisdom'],
    countPerDomain,
    gates: {
      minAccuracy: 0.85,
      minDomainAccuracy: 0.80,
      maxOverconfidence: 0.15,
      maxEce: 0.10
    }
  };

  try {
    const modelRunner = createMaiaModelRunner();
    const testRunner = new HallucinationTestRunner(config, modelRunner);

    console.log('Running tests...\n');
    const startTime = Date.now();
    const { results, summary } = await testRunner.run();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n✅ Tests completed in', duration, 'seconds\n');

    console.log('📊 Results Summary');
    console.log('==================');
    console.log(`Total cases: ${summary.totalCases}`);
    console.log(`Overall accuracy: ${(summary.overallAccuracy * 100).toFixed(1)}%`);
    console.log(`Mean confidence: ${(summary.overallConfidence * 100).toFixed(1)}%`);
    console.log(`ECE: ${summary.overallEce.toFixed(3)}`);
    console.log('');

    console.log('Domain Breakdown:');
    for (const [domain, metrics] of Object.entries(summary.byDomain)) {
      console.log(
        `  ${domain.padEnd(12)}: ${(metrics.accuracy * 100).toFixed(1)}% accuracy, ${(metrics.meanConfidence * 100).toFixed(1)}% confidence, ${(metrics.overconfidenceRate * 100).toFixed(1)}% overconf`
      );
    }
    console.log('');

    console.log('Quality Gates:', summary.gates.passed ? '✅ PASSED' : '❌ FAILED');
    if (!summary.gates.passed) {
      console.log('Failures:');
      for (const failure of summary.gates.failures) {
        console.log(`  - ${failure}`);
      }
    }
    console.log('');

    const reportDir = path.join(__dirname, '../reports/hallucination');
    fs.mkdirSync(reportDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `report-${timestamp}.md`);
    const report = generateMarkdownReport(summary, results);
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);

    const jsonPath = path.join(reportDir, `results-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ summary, results }, null, 2));
    console.log(`📄 JSON results saved to: ${jsonPath}`);

    process.exit(summary.gates.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test run failed:', error);
    process.exit(1);
  }
}

main();